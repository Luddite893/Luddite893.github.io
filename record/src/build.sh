#!/bin/sh
# 一括。組版 → PDF → 仕上げ
set -e
cd "$(dirname "$0")/.."
node src/build.mjs
node src/render.mjs
python3 src/finish.py
