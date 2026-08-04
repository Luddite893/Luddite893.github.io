// 版面からの溢れの検査
//
//   node src/check-fit.mjs [id ...]
//
// 本文を伸ばすと、字数が仕様に収まっていても版面からは溢れる。
// 字数の検査（check-records2.mjs）と溢れの検査は別のものなので、両方を通す。
// 実際に組んだうえで、枠より中身が高い箇所を機械に言わせる。

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { css } from './grid.mjs';
import { spreadCss } from './spread.mjs';
import { spread2, spread2Css } from './spread2.mjs';
import { factions } from './factions.mjs';
import { plateOf } from './plates.mjs';
import { records2 } from './records2.mjs';

const out = fileURLToPath(new URL('../out/', import.meta.url));
const ids = process.argv.slice(2).length ? process.argv.slice(2)
  : Object.keys(records2);

const body = ids.map((id) => {
  const f = factions.find((x) => x.id === id);
  return spread2(f, plateOf(f), 20)
    .map((p) => p.replace('<section class="sheet', `<section data-id="${id}" class="sheet`))
    .join('\n');
}).join('\n');

writeFileSync(out + 'fit.html',
  `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>溢れの検査</title>
<style>${css({})}${spreadCss()}${spread2Css()}
body{background:#d8d5cc}
</style></head><body>${body}</body></html>`);

const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--font-render-hinting=none'],
});
const p = await b.newPage();
await p.goto('file://' + out + 'fit.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(900);

const bad = await p.evaluate(() => {
  const res = [];
  // 版面そのもの（frame）と、高さの決まっている箱だけを見る。
  const sel = '.frame, .in-cell, .rep-cell, .rec-summary, .rel-notes, .cb-t, .relbox';
  document.querySelectorAll('.sheet').forEach((sheet, n) => {
    const id = sheet.dataset.id;
    // 入稿の控えは版面の外へ意図して出しているので、
    // それを含む版面の高さ比較は意味を持たない。下端の走査のほうで見る。
    const stamped = !!sheet.querySelector('.art-stamp');
    sheet.querySelectorAll(sel).forEach((el) => {
      if (stamped && el.classList.contains('frame')) return;
      const over = el.scrollHeight - el.clientHeight;
      if (over > 1) {
        res.push({ id, page: n % 4 + 1, cls: el.className.split(' ')[0],
          over: Math.round(over), text: (el.textContent || '').trim().slice(0, 24) });
      }
    });
    // 版面の下端を越えた要素を拾う。frame の overflow が visible でも見える。
    const fr = sheet.querySelector('.frame');
    if (!fr) return;
    const fb = fr.getBoundingClientRect().bottom;
    sheet.querySelectorAll('.frame > *, .rep-cell, .in-cell, .rec-quote').forEach((el) => {
      // 入稿の控えは版面外の余白に意図して置いている。校正刷りにしか出ず、
      // 納品版では消えるので、溢れとしては数えない。
      if (el.classList.contains('art-stamp')) return;
      const r = el.getBoundingClientRect();
      if (r.bottom - fb > 1) {
        res.push({ id, page: n % 4 + 1, cls: el.className.split(' ')[0],
          over: Math.round(r.bottom - fb), text: (el.textContent || '').trim().slice(0, 24) });
      }
    });
  });
  return res;
});
await b.close();

if (!bad.length) {
  console.log(`溢れなし。${ids.length} 項 ${ids.length * 4} 頁を検査した。`);
} else {
  console.log(`溢れ ${bad.length} 件。`);
  for (const r of bad) {
    console.log(`  ${r.id}　p${r.page}　${r.cls}　+${r.over}px　「${r.text}」`);
  }
}
process.exit(bad.length ? 1 : 0);
