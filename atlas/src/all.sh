#!/bin/sh
# 一括。組版 → 関係図の追い込み → 本文 → PDF（閲覧用・印刷用）
set -e
cd "$(dirname "$0")/.."
node src/build-spread.mjs
node src/fit.mjs "$(cat src/relfit.json)"
node src/book.mjs
node src/render.mjs screen
python3 src/finish.py screen
BLEED=3 MARKS=8 OUT=book-print.html node src/book.mjs
node src/render.mjs print
python3 src/finish.py print
