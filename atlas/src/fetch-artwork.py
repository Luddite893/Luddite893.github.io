#!/usr/bin/env python3
"""入稿図版を URL から取り込む

    python3 src/fetch-artwork.py 主図版   stormcloaks   <URL>
    python3 src/fetch-artwork.py 人物図版 stormcloaks-1 <URL>
    python3 src/fetch-artwork.py --list 一覧.txt

一覧の形式は「種別␣配置名␣URL」を一行に一件。# で始まる行は註とみなす。

── なぜ取り込みに関門を置くか ──────────────────────
URL を叩いて中身をそのまま置くと、**画像でないものが入る**。
実際に起きた例では、GitHub 上のファイルが二バイト（改行のみ）で、
拡張子だけが .png だった。取り込んだ側でこれを弾かないと、
版面に「読めない画像」が入ったまま組版が通ってしまう。

そこで、置く前に三つ検める。
  一　実体が画像であること（先頭の署名を見る。拡張子は信じない）
  二　寸法が読めること
  三　縦横比が版面の規定から二分を超えて外れていないこと

三つ目は落とさない。切り抜きで直せるので、警告として出すにとどめる。
一つ目と二つ目で落ちたものは置かない。置かないことを名指しで言う。
"""

import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ART = HERE.parent / "assets" / "artwork"

# 版面での実寸（ミリ）。artwork.mjs の SIZE と同じ値。
SIZE = {"主図版": (174.0, 139.2), "人物図版": (62.0, 93.0)}

SIGN = {
    b"\x89PNG\r\n\x1a\n": "png",
    b"\xff\xd8\xff": "jpeg",
    b"RIFF": "webp",
    b"II*\x00": "tiff",
    b"MM\x00*": "tiff",
}


def kind_of(b: bytes) -> str | None:
    for sig, name in SIGN.items():
        if b.startswith(sig):
            return "webp" if name == "webp" and b[8:12] == b"WEBP" else (
                None if name == "webp" else name)
    return None


def size_of(path: Path):
    try:
        from PIL import Image
        with Image.open(path) as im:
            return im.size
    except Exception:
        return None


def fetch(kind: str, name: str, url: str) -> bool:
    if kind not in SIZE:
        print(f"  ✗ {name}　種別 '{kind}' は 主図版 か 人物図版 のいずれか")
        return False
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "atlas-artwork/1"})
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read()
    except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
        print(f"  ✗ {name}　取得できない　{e}")
        return False

    fmt = kind_of(body)
    if fmt is None:
        head = body[:16]
        print(f"  ✗ {name}　画像ではない　{len(body)} バイト　先頭 {head!r}")
        if len(body) < 64:
            print(f"      中身が小さすぎる。空のファイルが置かれている可能性が高い。")
        return False

    ext = ".jpg" if fmt == "jpeg" else "." + fmt
    dest = ART / kind / (name + ext)
    dest.parent.mkdir(parents=True, exist_ok=True)
    # 同じ名前で別の拡張子が既にあれば外す。二重に置くと、どちらが出るか判らない。
    for other in dest.parent.glob(name + ".*"):
        if other != dest:
            other.unlink()
    dest.write_bytes(body)

    px = size_of(dest)
    if px is None:
        print(f"  ✗ {name}　{fmt} と名乗るが寸法が読めない。置かない")
        dest.unlink()
        return False

    w_mm, h_mm = SIZE[kind]
    dpi = round(px[0] / (w_mm / 25.4))
    want = w_mm / h_mm
    got = px[0] / px[1]
    off = abs(got - want) / want
    flags = []
    if dpi < 300:
        flags.append(f"解像度不足 {dpi}dpi")
    elif dpi < 350:
        flags.append(f"印刷用に不足 {dpi}dpi")
    if off > 0.02:
        flags.append(f"縦横比 {got:.3f}（規定 {want:.3f}）切り抜きで合わせる")
    mark = "△" if flags else "✓"
    note = "　" + "／".join(flags) if flags else ""
    print(f"  {mark} {dest.relative_to(ART.parent.parent)}　"
          f"{px[0]}×{px[1]}px　{dpi}dpi　比 {got:.3f}　"
          f"{len(body) / 1e6:.2f}MB{note}")
    return True


def main() -> int:
    args = sys.argv[1:]
    jobs = []
    if args[:1] == ["--list"]:
        for line in Path(args[1]).read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split()
            if len(parts) != 3:
                print(f"  ✗ 読めない行: {line}")
                continue
            jobs.append(tuple(parts))
    elif len(args) == 3:
        jobs.append(tuple(args))
    else:
        print(__doc__)
        return 1

    print(f"── 取り込み　{len(jobs)} 件 ──")
    ok = sum(fetch(*j) for j in jobs)
    print(f"\n置いた {ok} 件／落とした {len(jobs) - ok} 件")
    if ok:
        print("次に　python3 src/artwork.py inspect　で群として検分する。")
    return 0 if ok == len(jobs) else 1


if __name__ == "__main__":
    raise SystemExit(main())
