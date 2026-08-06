#!/usr/bin/env python3
"""図版を生成の API へ一括で投げる

    node src/prompt-artwork.mjs          # 先に指示文を書き出す
    python3 src/gen-artwork.py --dry     # 何を何件投げるかだけ出す（API を叩かない）
    python3 src/gen-artwork.py           # 実行
    python3 src/gen-artwork.py --only 主図版 --limit 3    # 種別と件数で絞る

── 前提 ─────────────────────────────────────────
**この工程は、鍵と費用を要する外部の役務を呼ぶ。**
鍵は環境変数から読む。ここには何も書き込まない。

    ART_API_URL      投げ先（POST）
    ART_API_KEY      鍵
    ART_API_HEADER   鍵を載せる見出し。既定 "Authorization: Bearer {key}"
    ART_API_BODY     本文の雛形（JSON）。{prompt} {ratio} を差し替える
    ART_API_PATH     応答から画像を取り出す道筋。例 "data.0.b64_json"

業者ごとに形が違うので、こちらで一社に決め打ちしていない。
上の五つを与えれば、どの業者にも同じ手順で投げられる。

── 途中から続けられる ────────────────────────────
すでに置かれている図版は飛ばす。二百三十二点を一度に通す必要はなく、
落ちた点だけを投げ直せる。--force で上書き。

── 落ちたものは置かない ──────────────────────────
応答が画像でなければ置かない。fetch-artwork.py と同じ関門を通す。
拡張子は信じない。先頭の署名を見る。
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ART = ROOT / "assets" / "artwork"
JOBS = ROOT / "out" / "図版プロンプト.json"

RATIO = {"主図版": "5:4", "人物図版": "2:3"}
SIGN = {b"\x89PNG\r\n\x1a\n": ".png", b"\xff\xd8\xff": ".jpg", b"RIFF": ".webp"}

DEFAULT_HEADER = "Authorization: Bearer {key}"
DEFAULT_PATH = "data.0.b64_json"


def image_ext(b: bytes):
    for sig, ext in SIGN.items():
        if b.startswith(sig):
            if ext == ".webp" and b[8:12] != b"WEBP":
                return None
            return ext
    return None


def dig(obj, path: str):
    """'data.0.b64_json' のような道筋で応答から値を取り出す。"""
    cur = obj
    for key in path.split("."):
        if isinstance(cur, list):
            cur = cur[int(key)]
        elif isinstance(cur, dict):
            cur = cur.get(key)
        else:
            return None
        if cur is None:
            return None
    return cur


def call(url, headers, body, timeout=180):
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(), method="POST",
        headers={"Content-Type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def extract(payload, path):
    """応答から画像のバイト列を取り出す。b64 でも URL でも受ける。"""
    val = dig(payload, path)
    if val is None:
        return None, "応答に画像が無い"
    if isinstance(val, str) and val.startswith("http"):
        try:
            with urllib.request.urlopen(val, timeout=180) as r:
                return r.read(), None
        except (urllib.error.URLError, OSError) as e:
            return None, f"画像の取得に失敗 {e}"
    if isinstance(val, str):
        try:
            return base64.b64decode(val), None
        except Exception:
            return None, "b64 として読めない"
    return None, f"取り出せない型 {type(val).__name__}"


def main() -> int:
    args = sys.argv[1:]
    dry = "--dry" in args
    force = "--force" in args
    only = args[args.index("--only") + 1] if "--only" in args else None
    limit = int(args[args.index("--limit") + 1]) if "--limit" in args else None

    if not JOBS.exists():
        print("out/図版プロンプト.json が無い。先に node src/prompt-artwork.mjs を走らせる。")
        return 1
    jobs = json.loads(JOBS.read_text())
    if only:
        jobs = [j for j in jobs if j["種別"] == only]

    # すでに置かれているものを飛ばす
    todo = []
    for j in jobs:
        exists = list((ART / j["種別"]).glob(j["配置名"] + ".*")) if (ART / j["種別"]).exists() else []
        if exists and not force:
            continue
        todo.append(j)
    # 「済み」は絞り込みの前に数える。--limit を引いた残りと混ぜると数が合わない。
    done = len(jobs) - len(todo)
    if limit:
        todo = todo[:limit]

    print(f"── 生成　全 {len(jobs)} 件／済み {done} 件／今回投げる {len(todo)} 件")
    if dry:
        for j in todo[:12]:
            print(f"  {j['種別']}　{j['配置名']}　{j['名称']}　{j['比']}")
        if len(todo) > 12:
            print(f"  … 他 {len(todo) - 12} 件")
        print("\n--dry のため API は叩いていない。")
        return 0

    url = os.environ.get("ART_API_URL")
    key = os.environ.get("ART_API_KEY")
    if not url or not key:
        print("\nART_API_URL と ART_API_KEY が要る。環境変数で渡す。")
        print("  例）export ART_API_URL=... ; export ART_API_KEY=...")
        print("この工程は費用の生じる外部の役務を呼ぶ。鍵は本書のどこにも書き込まない。")
        return 1

    hdr_tpl = os.environ.get("ART_API_HEADER", DEFAULT_HEADER)
    name, _, val = hdr_tpl.partition(":")
    headers = {name.strip(): val.strip().format(key=key)}
    body_tpl = os.environ.get("ART_API_BODY", '{"prompt": "{prompt}"}')
    path = os.environ.get("ART_API_PATH", DEFAULT_PATH)

    ok = fail = 0
    for n, j in enumerate(todo, 1):
        body = json.loads(body_tpl
                          .replace("{prompt}", json.dumps(j["prompt"])[1:-1])
                          .replace("{ratio}", RATIO[j["種別"]]))
        tag = f"[{n}/{len(todo)}] {j['種別']} {j['配置名']}　{j['名称']}"
        for attempt in range(3):
            try:
                payload = call(url, headers, body)
                raw, err = extract(payload, path)
                if raw is None:
                    print(f"  ✗ {tag}　{err}")
                    fail += 1
                    break
                ext = image_ext(raw)
                if ext is None:
                    print(f"  ✗ {tag}　画像でない応答（{len(raw)} バイト）")
                    fail += 1
                    break
                dest = ART / j["種別"] / (j["配置名"] + ext)
                dest.parent.mkdir(parents=True, exist_ok=True)
                for other in dest.parent.glob(j["配置名"] + ".*"):
                    if other != dest:
                        other.unlink()
                dest.write_bytes(raw)
                print(f"  ✓ {tag}　{len(raw) / 1e6:.2f}MB")
                ok += 1
                break
            except urllib.error.HTTPError as e:
                wait = 2 ** attempt * 5
                if e.code in (429, 500, 502, 503, 529) and attempt < 2:
                    print(f"  … {tag}　{e.code}。{wait} 秒待って再試行")
                    time.sleep(wait)
                    continue
                print(f"  ✗ {tag}　HTTP {e.code} {e.read()[:200]!r}")
                fail += 1
                break
            except (urllib.error.URLError, OSError, ValueError) as e:
                print(f"  ✗ {tag}　{e}")
                fail += 1
                break

    print(f"\n置いた {ok} 件／落とした {fail} 件")
    if ok:
        print("次に　python3 src/artwork.py inspect　で群として検分する。")
        print("　　　python3 src/artwork.py build　で二系統を書き出す。")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
