// 情報面の余白を実測し、関係図の丈に足し戻す。
// 紋章の面積校正と同じ手順である：一度刷って、測って、直す。
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../out/', import.meta.url));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
await p.goto('file://' + out + 'spreads.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(400);

const gaps = await p.evaluate(() => {
  const mm = 96 / 25.4;
  const o = {};
  for (const s of document.querySelectorAll('.sheet.recto')) {
    const rel = s.querySelector('.rec-rel'), q = s.querySelector('.rec-quote');
    if (!rel || !q) continue;
    o[s.dataset.id] = (q.getBoundingClientRect().top - rel.getBoundingClientRect().bottom) / mm;
  }
  return o;
});
await b.close();

// 余白を丸ごと足すと引用が関係図に接し、版面からも溢れる。五ミリ残す。
const prev = JSON.parse(process.argv[2] ?? '{}');
const next = {};
for (const [id, g] of Object.entries(gaps)) {
  const add = Math.round((g - 5) * 10) / 10;
  next[id] = Math.max(0, Math.round(((prev[id] ?? 0) + add) * 10) / 10);
}
writeFileSync(new URL('./relfit.json', import.meta.url), JSON.stringify(next, null, 0) + '\n');
const v = Object.values(next);
console.log(`関係図の補正 ${v.length} 項　平均 +${(v.reduce((a, c) => a + c, 0) / v.length).toFixed(1)}mm`
  + `／最大 +${Math.max(...v).toFixed(1)}mm`);
