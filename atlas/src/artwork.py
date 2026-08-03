#!/usr/bin/env python3
"""入稿図版の検分と書き出し

    python3 src/artwork.py inspect      一括検分（49 点を並べて数で見る）
    python3 src/artwork.py build        閲覧用・印刷用の二系統を書き出す

── 一括検分について ────────────────────────────────
改訂指示書 7 節「全 49 点を並べて一度に検分する工程」への実装。
目視で拾えるのは構図の破綻だけで、以下は目では拾えない。

  ・寸法と縦横比が版面の規定と合っているか
  ・実効解像度が版面の実寸に対して足りているか
  ・**明るさと調子の分布**が 49 点で揃っているか

三つ目が要点である。一点ずつ承認すると必ずずれるのは、
人間が「前の一枚」としか比べられないからで、
四十九点の平均から何σ離れているかは目では分からない。
"""

import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageStat

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ART = ROOT / "assets" / "artwork"
OUT = ROOT / "out"

# 版面での実寸（ミリ）。artwork.mjs の SIZE と同じ値。
SIZE = {"主図版": (174.0, 139.2), "人物図版": (62.0, 93.0)}
EXT = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}

# 書き出しの規定
PRINT_DPI = 350
SCREEN_BUDGET_MB = 42.0        # 閲覧用 PDF の図版に許す総量。本文組版に 15MB 見ておく


def scan():
    items = []
    for kind, (mw, mh) in SIZE.items():
        d = ART / kind
        if not d.exists():
            continue
        for p in sorted(d.iterdir()):
            if p.suffix.lower() not in EXT:
                continue
            try:
                im = Image.open(p)
            except Exception as e:
                items.append({"kind": kind, "path": p, "error": str(e)})
                continue
            g = im.convert("L")
            st = ImageStat.Stat(g)
            hist = g.histogram()
            n = sum(hist)
            dark = sum(hist[:64]) / n          # 最暗部の割合
            light = sum(hist[192:]) / n        # 受光面の割合
            items.append({
                "kind": kind, "path": p, "name": p.name, "stem": p.stem,
                "w": im.size[0], "h": im.size[1],
                "mm": (mw, mh),
                "dpi": round(im.size[0] / (mw / 25.4)),
                "aspect": im.size[0] / im.size[1],
                "spec_aspect": mw / mh,
                "mean": st.mean[0], "stddev": st.stddev[0],
                "dark": dark, "light": light,
                "bytes": p.stat().st_size,
                "mode": im.mode,
            })
    return items


def inspect():
    items = [i for i in scan() if "error" not in i]
    if not items:
        print("入稿図版がありません。assets/artwork/ に置いてください。")
        return
    print(f"── 一括検分　{len(items)} 点 ──\n")
    for kind in SIZE:
        group = [i for i in items if i["kind"] == kind]
        if not group:
            continue
        mm = sum(i["mean"] for i in group) / len(group)
        sd = sum(i["stddev"] for i in group) / len(group)
        print(f"【{kind}】{len(group)} 点　版面 {SIZE[kind][0]} × {SIZE[kind][1]}mm")
        print(f"  {'名前':<26}{'画素':>12}{'dpi':>6}{'縦横比':>9}{'平均値':>8}{'最暗%':>7}{'MB':>7}  判定")
        for i in sorted(group, key=lambda x: x["stem"]):
            flags = []
            if i["dpi"] < 300:
                flags.append("解像度不足")
            elif i["dpi"] < PRINT_DPI:
                flags.append("印刷用に不足")
            if abs(i["aspect"] - i["spec_aspect"]) > 0.02:
                flags.append("縦横比")
            # 明るさの外れ値。四十九点の平均から離れているものを名指しする。
            if abs(i["mean"] - mm) > 26:
                flags.append("明るさ" + ("過多" if i["mean"] > mm else "不足"))
            if abs(i["stddev"] - sd) > 22:
                flags.append("調子の幅")
            if i["mode"] not in ("L", "RGB", "RGBA", "1"):
                flags.append("色空間 " + i["mode"])
            print(f"  {i['name']:<26}{i['w']}×{i['h']:<6}{i['dpi']:>6}"
                  f"{i['aspect']:>9.3f}{i['mean']:>8.1f}{i['dark'] * 100:>6.1f}%"
                  f"{i['bytes'] / 1048576:>7.2f}  {'／'.join(flags) or '可'}")
        print(f"  ── 群の平均　明るさ {mm:.1f}　調子の幅 {sd:.1f}"
              f"　（各点はこの値からの隔たりで判定している）\n")

    total = sum(i["bytes"] for i in items) / 1048576
    print(f"入稿総量 {total:.1f}MB　"
          f"（49 点揃った場合の推計 {total / max(len(items), 1) * 49:.0f}MB）")


def build():
    """閲覧用と印刷用の二系統を書き出す。

    印刷用は 350dpi を維持し、閲覧用は総量が予算に収まる dpi へ自動で落とす。
    落とす先は一点ずつ決めるのではなく、全点に同じ倍率をかける。
    点ごとに解像度が違うと、並べたときに一点だけ甘く見える。
    """
    items = [i for i in scan() if "error" not in i]
    if not items:
        sys.exit("入稿図版がありません。")

    dprint = OUT / "artwork-print"
    dscr = OUT / "artwork-screen"
    for d in (dprint, dscr):
        d.mkdir(parents=True, exist_ok=True)

    # 印刷用。350dpi ちょうどに揃える（過剰な画素は容量を食うだけ）。
    tot_print = 0
    for i in items:
        im = Image.open(i["path"]).convert("L")
        w = round(i["mm"][0] / 25.4 * PRINT_DPI)
        h = round(w * im.size[1] / im.size[0])
        if im.size != (w, h):
            im = im.resize((w, h), Image.LANCZOS)
        p = dprint / (i["stem"] + ".png")
        im.save(p, "PNG", optimize=True)
        tot_print += p.stat().st_size
        i["_im"] = im

    # 閲覧用。予算に収まる最大の dpi を探す。
    chosen = PRINT_DPI
    for dpi in (350, 320, 300, 275, 250, 220, 200, 180, 160):
        tot = 0
        for i in items:
            w = round(i["mm"][0] / 25.4 * dpi)
            h = round(w * i["_im"].size[1] / i["_im"].size[0])
            b = io.BytesIO()
            i["_im"].resize((w, h), Image.LANCZOS).save(b, "JPEG", quality=86, optimize=True)
            tot += b.tell()
        # 49 点／64 点に外挿して判定する
        per = tot / len(items)
        est = per * (49 if items[0]["kind"] == "主図版" else len(items))
        if est / 1048576 <= SCREEN_BUDGET_MB:
            chosen = dpi
            break

    tot_scr = 0
    for i in items:
        w = round(i["mm"][0] / 25.4 * chosen)
        h = round(w * i["_im"].size[1] / i["_im"].size[0])
        p = dscr / (i["stem"] + ".jpg")
        i["_im"].resize((w, h), Image.LANCZOS).save(p, "JPEG", quality=86, optimize=True)
        tot_scr += p.stat().st_size

    print(f"印刷用　{len(items)} 点　{PRINT_DPI}dpi　{tot_print / 1048576:.2f}MB → out/artwork-print/")
    print(f"閲覧用　{len(items)} 点　{chosen}dpi　{tot_scr / 1048576:.2f}MB → out/artwork-screen/")
    if chosen < PRINT_DPI:
        print(f"　（閲覧用は容量上限 60MB に収めるため {chosen}dpi へ落としています。"
              f"印刷用は {PRINT_DPI}dpi のままです）")
    json.dump({"print_dpi": PRINT_DPI, "screen_dpi": chosen,
               "count": len(items)},
              open(OUT / "artwork-build.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "inspect"
    {"inspect": inspect, "build": build}.get(cmd, inspect)()
