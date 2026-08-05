// 一冊まるごとの溢れの検査
//
//   node src/book.mjs && node src/check-book.mjs
//
// check-fit.mjs は本文四十九項だけを見る。前付・後付は見ていなかった。
// 相関図を前付へ移し、頁の中身を組み替えたので、全二百六十四頁を機械に通す。
// 見るのは版面（frame）の下端をどれだけ越えたかである。
// ノンブルと柱は版面の外に出しているので、除く。

import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { manifest } from './book.mjs';

const out = fileURLToPath(new URL('../out/', import.meta.url));
const pages = manifest().pages;

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--font-render-hinting=none'],
});
const p = await b.newPage();
await p.goto('file://' + out + 'book.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1500);

const bad = await p.evaluate(() => {
  const res = [];
  // 版面の外へ意図して置いているもの。ノンブル・柱・小口の帯・表紙の地。
  const OUT = ['art-stamp', 'mfolio', 'folio', 'run-head', 'mhead', 'edge',
               'fore', 'bleed', 'cv', 'tab'];
  document.querySelectorAll('.sheet').forEach((sheet, n) => {
    const fr = sheet.querySelector('.frame');
    if (!fr) return;
    const fb = fr.getBoundingClientRect().bottom;
    const worst = new Map();
    for (const el of fr.children) {
      if (OUT.some((c) => el.classList.contains(c))) continue;
      const over = el.getBoundingClientRect().bottom - fb;
      if (over > 1) {
        const k = el.className.split(' ')[0] || el.tagName.toLowerCase();
        if (!worst.has(k) || worst.get(k) < over) worst.set(k, over);
      }
    }
    // 高さの決まっている箱は、中身が箱を越えていないかも見る。
    sheet.querySelectorAll('.in-cell, .rep-cell, .rec-summary, .cb-t, .relbox')
      .forEach((el) => {
        const over = el.scrollHeight - el.clientHeight;
        if (over > 1) {
          const k = el.className.split(' ')[0];
          if (!worst.has(k) || worst.get(k) < over) worst.set(k, over);
        }
      });
    for (const [cls, over] of worst) res.push({ page: n + 1, cls, over: Math.round(over) });
  });
  return res;
});
await b.close();

const kindOf = Object.fromEntries(pages.map((x) => [x.n, x.kind + (x.id ? `／${x.id}` : '')]));
if (!bad.length) {
  console.log(`溢れなし。${pages.length} 頁を検査した。`);
} else {
  console.log(`溢れ ${bad.length} 件。`);
  for (const r of bad) console.log(`  頁${r.page}　${kindOf[r.page]}　${r.cls}　+${r.over}px`);
}
process.exit(bad.length ? 1 : 0);
