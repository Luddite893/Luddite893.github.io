# 閲覧用 PDF を二つに割る
#
#   python3 src/split.py [切れ目の頁]
#
# 一冊が 33MB を超え、送り先によっては添付の上限に掛かる。
# 割ったものは納品物ではなく、受け渡しの都合で作る控えである。
# だから out/ には残すが、版には入れない（.gitignore）。
#
# 切れ目は必ず偶数頁で入れる。奇数で割ると見開きが割れ、
# 割った側の一冊目が右頁で終わり、二冊目が左頁で始まる。

import os
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter

OUT = Path(__file__).resolve().parent.parent / 'out'
SRC = OUT / 'タムリエル勢力誌_閲覧用.pdf'


def main() -> int:
    if not SRC.exists():
        print(f'{SRC.name} が無い。先に python3 src/finish.py screen を走らせる。')
        return 1

    reader = PdfReader(SRC)
    n = len(reader.pages)
    cut = int(sys.argv[1]) if len(sys.argv) > 1 else (n // 2 + n // 2 % 2)
    if cut % 2:
        print(f'切れ目 {cut} は奇数。見開きが割れる。')
        return 1
    if not 0 < cut < n:
        print(f'切れ目 {cut} が範囲の外（全 {n} 頁）。')
        return 1

    for k, (a, b) in enumerate([(0, cut), (cut, n)]):
        path = OUT / f'タムリエル勢力誌_閲覧用_分割{k + 1}_p{a + 1}-{b}.pdf'
        writer = PdfWriter()
        for i in range(a, b):
            writer.add_page(reader.pages[i])
        writer.add_metadata({'/Title': f'タムリエル勢力誌 第二版（分割 {k + 1}／2）'})
        writer.write(path)
        print(f'  {path.name}　{os.path.getsize(path) / 1e6:.1f}MB　{b - a} 頁')

    print(f'全 {n} 頁を {cut} 頁で割った。')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
