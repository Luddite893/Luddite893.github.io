// 第二版　一項分の見本（四頁）
//   node src/sample.mjs        → out/sample.html
//   BLEED=3 MARKS=8 ...        → 印刷用
import { writeFileSync } from 'node:fs';
import { css } from './grid.mjs';
import { spreadCss } from './spread.mjs';
import { spread2, spread2Css } from './spread2.mjs';
import { factions } from './factions.mjs';
import { plateOf } from './plates.mjs';

const id = process.argv[2] ?? 'companions';
const f = factions.find((x) => x.id === id);
const pages = spread2(f, plateOf(f), 20);

writeFileSync(new URL('../out/sample.html', import.meta.url),
`<!doctype html><html lang="ja"><head><meta charset="utf-8">
<title>第二版 見本　${f.ja}</title>
<style>${css({})}${spreadCss()}${spread2Css()}
body{background:#d8d5cc}
</style></head><body>${pages.join('\n')}</body></html>`);
console.log(`${f.ja}　${pages.length} 頁 → out/sample.html`);
