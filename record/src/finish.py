#!/usr/bin/env python3
"""制作記録 PDF の仕上げ

しおり・書誌・PDF 1.7 の宣言を与え、検品する。

ToUnicode の正規化は勢力誌の仕上げ工程と同じ処理を使う。
同じ組版系から出た PDF なので、同じ癖が出る。
二度書くと片方だけ直す事故が起きるので、輸入して使う。

    python3 src/finish.py
"""

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "out"
ATLAS = HERE.parent.parent / "atlas" / "src"
sys.path.insert(0, str(ATLAS))

import json                                    # noqa: E402
from pypdf import PdfReader, PdfWriter         # noqa: E402
from pypdf.generic import NameObject           # noqa: E402
from finish import normalize_tounicode         # noqa: E402  勢力誌の仕上げから輸入


def inspect(path: Path, expect_pages: int) -> bool:
    reader = PdfReader(str(path))
    fonts, not_embedded, type3 = {}, set(), set()
    for page in reader.pages:
        res = page.get("/Resources")
        fdict = res.get("/Font") if res else None
        if not fdict:
            continue
        for f in fdict.values():
            f = f.get_object()
            base = str(f.get("/BaseFont", "?"))
            if f.get("/Subtype") == "/Type3":
                type3.add(base)
            desc = f.get("/FontDescriptor")
            if desc is None and f.get("/DescendantFonts"):
                desc = f["/DescendantFonts"][0].get_object().get("/FontDescriptor")
            has = bool(desc) and any(
                k in desc.get_object() for k in ("/FontFile", "/FontFile2", "/FontFile3"))
            fonts[base] = has
            if not has:
                not_embedded.add(base)

    text = "".join((p.extract_text() or "") for p in reader.pages)
    box = reader.pages[0].mediabox
    mm = lambda v: round(float(v) * 25.4 / 72, 1)

    print(f"\n── 検品　{path.name} ──")
    print(f"  版　　　 {reader.pdf_header}")
    print(f"  丁数　　 {len(reader.pages)}　（想定 {expect_pages}）")
    print(f"  判型　　 {mm(box.width)} × {mm(box.height)} mm")
    print(f"  容量　　 {path.stat().st_size / 1024 / 1024:.2f} MB")
    print(f"  書体　　 {len(fonts)} 種／埋め込み済 {len(fonts) - len(not_embedded)}")
    for f in sorted(fonts):
        print(f"           {'✓' if fonts[f] else '✗ 未埋込'} {f}")
    if type3:
        print(f"  Type3　　 {len(type3)} 種（要確認）")
    print(f"  文字層　 {len(text):,} 字を抽出")

    probes = [
        ("やりとりの原文", "スマホアプリで見当たりません写真のみ共有できます"),
        ("追加の指定", "指示には主人公は男という表記があるが実際は未定"),
        ("中核の判断", "損傷を装飾として置くのではなく"),
        ("変更指示", "加入可能ギルド"),
        ("対照表", "紙を触った瞬間に別の本だと分かる"),
        ("申し送り", "項番のみが残り"),
    ]
    flat = text.replace("\n", "").replace(" ", "").replace("　", "")
    print("  検索性")
    ok = True
    for label, probe in probes:
        hit = probe.replace(" ", "").replace("　", "") in flat
        ok &= hit
        print(f"           {'✓' if hit else '✗'} {label}")
    if not_embedded or type3 or len(reader.pages) != expect_pages:
        ok = False
    return ok


def main():
    raw = OUT / "record-raw.pdf"
    if not raw.exists():
        sys.exit(f"{raw} が無い。先に render を回すこと。")
    man = json.loads((OUT / "outline.json").read_text(encoding="utf-8"))

    writer = PdfWriter()
    writer.append(PdfReader(str(raw)))
    for it in man["outline"]:
        writer.add_outline_item(it["title"], it["page"] - 1)
    n = normalize_tounicode(writer)

    writer._root_object.update({
        NameObject("/PageLayout"): NameObject("/SinglePage"),
        NameObject("/PageMode"): NameObject("/UseOutlines"),
    })
    writer.add_metadata({
        "/Title": "制作記録　『暁の砕き手』および『タムリエル勢力誌』",
        "/Author": "受注者",
        "/Subject": "二件の依頼について、発注から納品までのやりとりと工程の記録。",
        "/Keywords": "制作記録, 写本, 図鑑, 組版, 銅版画",
        "/Creator": "制作記録 組版一式",
    })
    writer.pdf_header = "%PDF-1.7"

    dest = OUT / "制作記録.pdf"
    with open(dest, "wb") as fh:
        writer.write(fh)

    print(f"\n  ToUnicode 正規化　{n} 本")
    ok = inspect(dest, man["pages"])
    print(f"\n  → out/{dest.name}")
    print("  検品：" + ("合格" if ok else "要確認"))


if __name__ == "__main__":
    main()
