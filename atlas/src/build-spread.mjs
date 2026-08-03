import { writeFileSync } from 'node:fs';
import { G, css } from './grid.mjs';
import { spread, spreadCss } from './spread.mjs';
import { factions } from './factions.mjs';
import { plateOf } from './plates.mjs';
import { records } from './records.mjs';

const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(records);
let folio = 10;
const body = ids.map((id) => {
  const f = factions.find((x) => x.id === id);
  const s = spread(f, plateOf(f), folio, folio + 1);
  folio += 2;
  return s;
}).join('\n');

writeFileSync(new URL('../out/spreads.html', import.meta.url),
`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>本編 見開き</title>
<style>${css({})}${spreadCss()}
body{display:flex;flex-wrap:wrap;gap:0;justify-content:center;padding:6mm;background:#d8d5cc}
.sheet{box-shadow:none;outline:.2mm solid #bfbbb0}
</style></head><body>${body}</body></html>`);
console.log(`見開き ${ids.length} 組 → out/spreads.html`);
