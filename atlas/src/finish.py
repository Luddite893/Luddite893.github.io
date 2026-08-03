#!/usr/bin/env python3
"""PDF の仕上げ

Chromium が吐いた素の PDF に、以下を与える。
  ・二層のしおり（分類 → 組織名）
  ・組織名から該当項へ飛ぶ PDF 内部リンク（仕様書 6-4）
  ・見開き表示（表紙のみ単ページ）
  ・書誌と PDF 1.7 の宣言

そのうえで検品する。フォントの埋め込み、テキスト層の検索性、
そして内部リンクが本当に注釈として入っているか。

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
from pypdf.generic import (
    ArrayObject, DictionaryObject, FloatObject, NameObject, NumberObject,
)

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "out"
MM = 72 / 25.4          # ミリ → ポイント


# ── ToUnicode の正規化 ───────────────────────────
# Chromium は、字形を共有する符号位置が複数あると、逆引きでどれを書くか
# 選べない。結果として ToUnicode に部首や異体字の符号位置が入り、
# 見た目は正しいのに「戸」で検索して「戶」は引っかからない、という状態になる。
# テキスト層が検索可能であることは仕様の要件なので、ここで本文の字へ寄せ直す。
#
# 直し方は二段構え。
#   一　部首の範囲（U+2E80〜U+2FDF）は NFKC で通常の漢字へ寄せる。
#   二　NFKC では届かない組は、実際に出た分だけ表で持つ。
#       この表は「PDF から抽出した字のうち、組版の元原稿に無いもの」を
#       機械で洗い出して作った。推測では作っていない。
# NFKC が効くのは康熙部首（U+2F00〜U+2FDF）までで、
# CJK 部首補助（U+2E80〜U+2EFF）は分解を持たない。そこは表で受ける。
# また NFKC は ⼾ を「戶」までしか戻さない。旧字形から常用字形への一歩は
# 正規化の仕事ではないので、これも表で受ける。
FIX = {
    0x2015: 0x2014,   # ―  → —   水平線 → ダッシュ
    0x2215: 0xFF0F,   # ∕  → ／  除算記号 → 全角スラッシュ
    0x2EA0: 0x6C11,   # ⺠ → 民   部首補助。NFKC は何もしない
    0x2ED1: 0x9577,   # ⻑ → 長   同上
    0x2EEF: 0x7ADC,   # ⻯ → 竜   同上。龍ではなく竜が本文の字
    0x6236: 0x6238,   # 戶 → 戸   旧字形
}


def _canon_char(c: str) -> str:
    """正規化してから表を当てる。表を先に当てると ⼾ が拾えない。"""
    if 0x2E80 <= ord(c) <= 0x2FDF:
        c = unicodedata.normalize("NFKC", c)
    return chr(FIX.get(ord(c), ord(c)))


def _parse_cmap(data: bytes):
    """bfchar と bfrange をまとめて 符号 → 文字列 の辞書にする。"""
    m = {}
    for blk in re.findall(rb"beginbfchar(.*?)endbfchar", data, re.S):
        for src, dst in re.findall(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>", blk):
            m[int(src, 16)] = bytes.fromhex(dst.decode()).decode("utf-16-be", "ignore")
    for blk in re.findall(rb"beginbfrange(.*?)endbfrange", data, re.S):
        # <lo> <hi> <dst>
        for lo, hi, dst in re.findall(
                rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>", blk):
            lo, hi = int(lo, 16), int(hi, 16)
            base = bytes.fromhex(dst.decode()).decode("utf-16-be", "ignore")
            if not base:
                continue
            for i in range(hi - lo + 1):
                m[lo + i] = base[:-1] + chr(ord(base[-1]) + i)
        # <lo> <hi> [<d0> <d1> ...]
        for lo, hi, arr in re.findall(
                rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[(.*?)\]", blk, re.S):
            lo = int(lo, 16)
            for i, dst in enumerate(re.findall(rb"<([0-9A-Fa-f]*)>", arr)):
                m[lo + i] = bytes.fromhex(dst.decode()).decode("utf-16-be", "ignore")
    return m


def _build_cmap(m: dict, width: int) -> bytes:
    fmt = "%%0%dX" % width
    items = sorted(m.items())
    out = [
        b"/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n",
        b"/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n",
        b"/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n",
        b"1 begincodespacerange\n<" + (b"0" * width) + b"> <" + (b"F" * width) + b">\nendcodespacerange\n",
    ]
    for i in range(0, len(items), 100):
        chunk = items[i:i + 100]
        out.append(b"%d beginbfchar\n" % len(chunk))
        for code, s in chunk:
            out.append(("<" + fmt % code + "> <"
                        + s.encode("utf-16-be").hex().upper() + ">\n").encode())
        out.append(b"endbfchar\n")
    out.append(b"endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend\n")
    return b"".join(out)


def normalize_tounicode(writer) -> int:
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
                        m = _parse_cmap(data)
                        fixed_m = {k: "".join(_canon_char(c) for c in v) for k, v in m.items()}
                        if fixed_m != m and fixed_m:
                            width = 4 if max(fixed_m) > 0xFF else 2
                            new = _build_cmap(fixed_m, width)
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


# ── しおり ─────────────────────────────────────
def add_items(writer, items, parent=None):
    for it in items:
        node = writer.add_outline_item(it["title"], it["page"] - 1, parent=parent)
        if it.get("children"):
            add_items(writer, it["children"], node)


# ── 内部リンク ──────────────────────────────────
def add_links(writer, links, folio_of, offset_mm, page_h_mm):
    """採取した矩形を /Link 注釈に変える。

    座標は版面の左上原点（ミリ）で採ってあるので、
    PDF の左下原点（ポイント）へ移す。塗り足しとトンボの分だけずらす。
    """
    added, skipped = 0, 0
    for lk in links:
        target = folio_of.get(lk["to"])
        if not target:
            skipped += 1
            continue
        src = lk["page"] - 1
        dst = target - 1
        if src == dst or src == dst - 1:
            skipped += 1               # 自分の見開きの中では飛ばす意味がない
            continue
        x0 = (lk["x"] + offset_mm) * MM
        x1 = (lk["x"] + lk["w"] + offset_mm) * MM
        y1 = (page_h_mm - (lk["y"] + offset_mm)) * MM
        y0 = (page_h_mm - (lk["y"] + lk["h"] + offset_mm)) * MM
        page = writer.pages[src]
        dest = writer.pages[dst].indirect_reference
        annot = DictionaryObject({
            NameObject("/Type"): NameObject("/Annot"),
            NameObject("/Subtype"): NameObject("/Link"),
            NameObject("/Rect"): ArrayObject(
                [FloatObject(round(v, 2)) for v in (x0, y0, x1, y1)]),
            NameObject("/Border"): ArrayObject(
                [NumberObject(0), NumberObject(0), NumberObject(0)]),
            NameObject("/Dest"): ArrayObject(
                [dest, NameObject("/XYZ"), NumberObject(0),
                 FloatObject(page_h_mm * MM), NumberObject(0)]),
        })
        ref = writer._add_object(annot)
        if "/Annots" in page:
            page[NameObject("/Annots")].append(ref)
        else:
            page[NameObject("/Annots")] = ArrayObject([ref])
        added += 1
    return added, skipped


# ── 検品 ──────────────────────────────────────
def inspect(path: Path, expect_pages: int):
    reader = PdfReader(str(path))
    fonts, embedded, not_embedded, type3 = {}, set(), set(), set()

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
            if f.get("/Subtype") == "/Type3":
                type3.add(base)
            desc = f.get("/FontDescriptor")
            if desc is None and f.get("/DescendantFonts"):
                desc = f["/DescendantFonts"][0].get_object().get("/FontDescriptor")
            has = bool(desc) and any(
                k in desc.get_object() for k in ("/FontFile", "/FontFile2", "/FontFile3")
            )
            fonts[base] = has
            (embedded if has else not_embedded).add(base)

    text = "".join((p.extract_text() or "") for p in reader.pages)
    annots = sum(
        len([a for a in p.get("/Annots", [])
             if a.get_object().get("/Subtype") == "/Link"])
        for p in reader.pages
    )
    size_mb = path.stat().st_size / 1024 / 1024
    box = reader.pages[0].mediabox
    mm = lambda v: round(float(v) * 25.4 / 72, 1)

    print(f"\n── 検品　{path.name} ──")
    print(f"  版　　　 {reader.pdf_header}")
    print(f"  丁数　　 {len(reader.pages)}　（想定 {expect_pages}）")
    print(f"  判型　　 {mm(box.width)} × {mm(box.height)} mm")
    print(f"  容量　　 {size_mb:.1f} MB　（上限 100MB）")
    print(f"  書体　　 {len(fonts)} 種／埋め込み済 {len(embedded)}")
    for f in sorted(fonts):
        print(f"           {'✓' if fonts[f] else '✗ 未埋込'} {f}")
    if type3:
        print(f"  Type3　　 {len(type3)} 種（要確認）")
    print(f"  文字層　 {len(text):,} 字を抽出")
    print(f"  内部リンク {annots} 箇所")

    probes = [
        ("序", "本書は、第四紀二〇一年前後のスカイリム州に存在した組織を"),
        ("凡例", "線は関係の種類を、線の中央の記号はその向きを示す"),
        ("本編・概要", "白きヴァルガルの丘に館を構える傭兵団"),
        ("本編・引用", "解散は命じられた"),
        ("図版説明", "峡谷の壁に掘られた祠"),
        ("年表", "白金協定。タロス信仰の禁圧"),
        ("一覧表", "門戸・排他関係一覧"),
        ("索引", "ジョラーヴァスクル"),
        ("奥付", "六列グリッド"),
    ]
    flat = text.replace("\n", "").replace(" ", "").replace("　", "")
    print("  検索性")
    ok = True
    for label, probe in probes:
        hit = probe.replace(" ", "").replace("　", "") in flat
        ok &= hit
        print(f"           {'✓' if hit else '✗'} {label}")
    if not_embedded or type3 or len(reader.pages) != expect_pages or size_mb > 100:
        ok = False
    if annots == 0:
        ok = False
    return ok


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "screen"
    raw = OUT / f"{mode}-raw.pdf"
    if not raw.exists():
        sys.exit(f"{raw} が無い。先に render を回すこと。")

    man = json.loads((OUT / "manifest.json").read_text(encoding="utf-8"))
    links = json.loads((OUT / f"links-{mode}.json").read_text(encoding="utf-8"))

    offset = 11 if mode == "print" else 0          # 塗り足し 3 + トンボ 8
    page_h = 297 + offset * 2

    reader = PdfReader(str(raw))
    writer = PdfWriter()
    writer.append(reader)

    add_items(writer, man["outline"])
    n = normalize_tounicode(writer)
    added, skipped = add_links(writer, links, man["folioOf"], offset, page_h)

    writer._root_object.update({
        NameObject("/PageLayout"): NameObject("/TwoPageRight"),
        NameObject("/PageMode"): NameObject("/UseOutlines"),
    })
    writer.add_metadata({
        "/Title": "タムリエル勢力誌",
        "/Author": "王立記録院　記録部　編纂室",
        "/Subject": "スカイリム州所在の四十九組織に関する学術図鑑。第四紀二一〇年刊。",
        "/Keywords": "図鑑, 勢力, タムリエル, スカイリム, 銅版画, 二色刷り",
        "/Creator": "タムリエル勢力誌 組版一式",
    })
    writer.pdf_header = "%PDF-1.7"

    name = {
        "screen": "タムリエル勢力誌_閲覧用.pdf",
        "print": "タムリエル勢力誌_印刷用_塗足3mm_トンボ付.pdf",
    }[mode]
    dest = OUT / name
    with open(dest, "wb") as fh:
        writer.write(fh)

    print(f"\n  ToUnicode 正規化　{n} 本")
    print(f"  内部リンク　付与 {added} 箇所／同一見開き等で省略 {skipped} 箇所")
    ok = inspect(dest, man["stats"]["pages"])
    print(f"\n  → out/{name}")
    print("  検品：" + ("合格" if ok else "要確認"))


if __name__ == "__main__":
    main()
