// 相関図の校正刷り
//   node src/proof-relmap.mjs && node src/render-relmap.mjs
import { writeFileSync } from 'node:fs';
import { css } from './grid.mjs';
import { themeSheet, categorySheets, relmapCss, THEMES } from './relmap.mjs';
import { categories } from './factions.mjs';

const all = [...THEMES, ...categories.flatMap((c) => categorySheets(c))];
const pick = process.argv.slice(2);
const list = pick.length ? all.filter((t) => pick.includes(t.key)) : all;

const pages = list.map((t) => `<section class="sheet recto">
  <div class="trim"><div class="frame">${themeSheet(t)}</div></div>
</section>`).join('\n');

writeFileSync(new URL('../out/relmap.html', import.meta.url),
`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>相関図 校正</title>
<style>${css({})}${relmapCss()}
body{background:#d8d5cc}
.frame{padding-top:6mm}
</style></head><body>${pages}</body></html>`);
console.log(`相関図 ${list.length} 枚 → out/relmap.html`);
