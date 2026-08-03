// Chromium による組版 → PDF、および内部リンクの座標採取
//   node src/render.mjs screen
//   node src/render.mjs print
//
// 内部リンク（仕様書 6-4）は、PDF 生成器まかせにしない。
// 組織名の位置を版面上で実測し、頁と矩形として書き出す。
// これを finish.py が /Link 注釈に変換する。
// アンカーの実装に依存しないので、生成器が変わっても壊れない。

import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

const mode = process.argv[2] ?? 'screen';
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const out = fileURLToPath(new URL('../out/', import.meta.url));

const bleed = mode === 'print' ? 3 : 0;
const marks = mode === 'print' ? 8 : 0;
const mediaW = 210 + (bleed + marks) * 2;
const mediaH = 297 + (bleed + marks) * 2;

const browser = await chromium.launch({ executablePath: EXE, args: ['--font-render-hinting=none'] });
const page = await browser.newPage();
await page.goto('file://' + out + (mode === 'print' ? 'book-print.html' : 'book.html'),
  { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

// ── 内部リンクの採取 ────────────────────────────
const links = await page.evaluate(() => {
  const MM = 96 / 25.4;
  const sheets = [...document.querySelectorAll('.sheet')];
  const boxes = sheets.map((s) => s.getBoundingClientRect());
  const out = [];
  for (const a of document.querySelectorAll('[data-to]')) {
    const r = a.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const i = boxes.findIndex((b) => r.top >= b.top - 1 && r.top < b.bottom);
    if (i < 0) continue;
    const b = boxes[i];
    out.push({
      page: i + 1, to: a.dataset.to,
      x: (r.left - b.left) / MM, y: (r.top - b.top) / MM,
      w: r.width / MM, h: r.height / MM,
    });
  }
  return out;
});
writeFileSync(out + `links-${mode}.json`, JSON.stringify(links));
console.log(`内部リンク ${links.length} 箇所 → out/links-${mode}.json`);

await page.pdf({
  path: out + `${mode}-raw.pdf`,
  width: `${mediaW}mm`, height: `${mediaH}mm`,
  printBackground: true, preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});
console.log(`PDF → out/${mode}-raw.pdf  (${mediaW}×${mediaH}mm)`);
await browser.close();
