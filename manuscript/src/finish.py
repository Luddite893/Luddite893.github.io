#!/usr/bin/env python3
"""PDF の仕上げ

Chromium が吐いた素の PDF に、以下を与える。
  ・幕ごとに階層化したしおり
  ・見開き表示（表紙のみ単ページ）
  ・書誌
  ・PDF 1.7 の宣言

そのうえで検品する。フォントがすべて埋め込まれているか、
装飾の下のテキスト層が検索可能なまま残っているか。

    python3 src/finish.py screen
    python3 src/finish.py print
"""

import json
import re
import sys
import unicodedata
import zlib
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, NumberObject


def _canon(hexstr: str) -> str:
    """UTF-16BE の十六進表記を、康熙部首から通常の漢字へ寄せる。

    Chromium は字形が共有されていると、逆引きで康熙部首（U+2F00〜）や
    CJK 部首補助（U+2E80〜）の符号位置を ToUnicode に書くことがある。
    見た目は同じでも「人」で検索して「⼈」は引っかからない。
    テキスト層が検索可能であることは仕様の要件なので、ここで正規化する。
    """
    try:
        s = bytes.fromhex(hexstr).decode("utf-16-be")
    except Exception:
        return hexstr
    out = "".join(
        unicodedata.normalize("NFKC", c) if 0x2E80 <= ord(c) <= 0x2FDF else c
        for c in s
    )
    return out.encode("utf-16-be").hex().upper()


def normalize_tounicode(writer) -> int:
    """全フォントの ToUnicode CMap を正規化する。戻り値は直した本数。"""
    pat_pair = re.compile(rb"(<[0-9A-Fa-f]+>)\s*<([0-9A-Fa-f]+)>")
    fixed, seen = 0, set()

    def walk(obj):
        nonlocal fixed
        obj = obj.get_object()
        if isinstance(obj, dict):
            tu = obj.get("/ToUnicode")
            if tu is not None:
                st = tu.get_object()
                key = id(st)
                if key not in seen:
                    seen.add(key)
                    try:
                        data = st.get_data()
                    except Exception:
                        data = None
                    if data:
                        def sub(m):
                            return m.group(1) + b" <" + _canon(m.group(2).decode()).encode() + b">"
                        new = re.sub(
                            rb"beginbfchar(.*?)endbfchar",
                            lambda m: b"beginbfchar" + pat_pair.sub(sub, m.group(1)) + b"endbfchar",
                            data, flags=re.S,
                        )
                        if new != data:
                            st._data = zlib.compress(new)
                            st[NameObject("/Length")] = NumberObject(len(st._data))
                            fixed += 1
            for v in obj.values():
                if isinstance(v, (dict, list)):
                    walk(v)
                elif hasattr(v, "get_object") and isinstance(v.get_object(), (dict, list)):
                    walk(v)
        elif isinstance(obj, list):
            for v in obj:
                walk(v)

    for page in writer.pages:
        res = page.get("/Resources")
        if res:
            walk(res)
    return fixed

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "out"


def load_outline():
    """content.mjs の outline をそのまま使う。定義を二重に持たない。"""
    src = (HERE / "content.mjs").read_text(encoding="utf-8")
    block = src[src.index("export const outline"):]
    block = block[block.index("["): block.rindex("];") + 1]
    block = re.sub(r"(\w+):", r'"\1":', block)          # キーを引用符で括る
    block = block.replace("'", '"').replace(",\n]", "\n]")
    block = re.sub(r",(\s*[\]}])", r"\1", block)         # 末尾のカンマを落とす
    return json.loads(block)


def add_items(writer, items, parent=None):
    for it in items:
        node = writer.add_outline_item(it["title"], it["page"] - 1, parent=parent)
        if it.get("children"):
            add_items(writer, it["children"], node)


def inspect(path: Path):
    """検品。目視では確かめられないところを機械で見る。"""
    reader = PdfReader(str(path))
    fonts, embedded, not_embedded = {}, set(), set()

    for page in reader.pages:
        res = page.get("/Resources")
        if not res:
            continue
        fdict = res.get("/Font")
        if not fdict:
            continue
        for f in fdict.values():
            f = f.get_object()
            base = str(f.get("/BaseFont", "?"))
            desc = f.get("/FontDescriptor")
            if desc is None and f.get("/DescendantFonts"):
                desc = f["/DescendantFonts"][0].get_object().get("/FontDescriptor")
            has = bool(desc) and any(
                k in desc.get_object() for k in ("/FontFile", "/FontFile2", "/FontFile3")
            )
            fonts[base] = has
            (embedded if has else not_embedded).add(base)

    text = "".join((p.extract_text() or "") for p in reader.pages)
    size_mb = path.stat().st_size / 1024 / 1024
    box = reader.pages[0].mediabox
    mm = lambda v: round(float(v) * 25.4 / 72, 1)

    print(f"\n── 検品　{path.name} ──")
    print(f"  版　　　 {reader.pdf_header}")
    print(f"  丁数　　 {len(reader.pages)}")
    print(f"  判型　　 {mm(box.width)} × {mm(box.height)} mm")
    print(f"  容量　　 {size_mb:.1f} MB")
    print(f"  書体　　 {len(fonts)} 種／埋め込み済 {len(embedded)}")
    for f in sorted(fonts):
        print(f"           {'✓' if fonts[f] else '✗ 未埋込'} {f}")
    print(f"  文字層　 {len(text):,} 字を抽出")

    # 装飾の下のテキストが生きているかを、実際の語で確かめる
    probes = [
        ("本文", "その人は歩いて出てきた"),
        ("金・女神の言葉", "わが光を、わが手に取り戻せ"),
        ("掻き取りの下", "そのあとに欠けたものは"),
        ("水損の下", "帰り道で、その人はわたしの名を一度まちがえた"),
        ("焼けの下", "境界はとっくに曖昧だった"),
        ("後年の別筆", "あの日に一度死んだのだと思う"),
        ("補遺", "削去は記録者自身の手によるもの"),
    ]
    flat = text.replace("\n", "").replace(" ", "")
    print("  検索性")
    ok = True
    for label, probe in probes:
        hit = probe.replace(" ", "") in flat
        ok &= hit
        print(f"           {'✓' if hit else '✗'} {label}")
    if not_embedded:
        ok = False
    return ok


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "screen"
    raw = OUT / f"{mode}-raw.pdf"
    if not raw.exists():
        sys.exit(f"{raw} が無い。先に render を回すこと。")

    reader = PdfReader(str(raw))
    writer = PdfWriter()
    writer.append(reader)

    add_items(writer, load_outline())
    n = normalize_tounicode(writer)

    # 見開き表示。表紙のみ単ページで立つ。
    writer._root_object.update({
        NameObject("/PageLayout"): NameObject("/TwoPageRight"),
        NameObject("/PageMode"): NameObject("/UseOutlines"),
    })
    writer.add_metadata({
        "/Title": "暁の砕き手　ブラの手記",
        "/Author": "ブラ（記録者）",
        "/Subject": "私家版写本。ある一党に同行した者による記録。",
        "/Keywords": "写本, 私家版, 手記, 暁の砕き手, DAWNBREAKER",
        "/Creator": "私家版写本 組版一式",
    })
    writer.pdf_header = "%PDF-1.7"

    name = {"screen": "暁の砕き手_閲覧用.pdf", "print": "暁の砕き手_印刷用_塗足3mm_トンボ付.pdf"}[mode]
    dest = OUT / name
    with open(dest, "wb") as fh:
        writer.write(fh)

    print(f"\n  ToUnicode 正規化　{n} 本")
    ok = inspect(dest)
    print(f"\n  → out/{name}")
    print("  検品：" + ("合格" if ok else "要確認"))


if __name__ == "__main__":
    main()
