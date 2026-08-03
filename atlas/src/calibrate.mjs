// 紋章の面積率較正
//
// 49 点の図象は、語彙が同じでも面積が揃わない。獣頭は面で、光条は線だからだ。
// 並べたとき一点だけ黒く見える／薄く見えるのは、意匠の差ではなく面積の差でしかない。
//
// そこで、全点を実際に描いて面積率を測り、目標との比から縮尺を一意に決める。
// 面積は縮尺の二乗で効くので、係数は sqrt(目標/実測)。
// 手で「もう少し小さく」と 49 回判断すると、その 49 回ぶん揺れる。

import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { emblem } from './heraldry.mjs';
import { factions } from './factions.mjs';

const TARGET = 26;           // 目標面積率（18〜34% の中央）
const MIN = 0.74, MAX = 1.42;  // 縮尺の上下限。外形との余白を守る。
const ROUNDS = 3;

const measure = async (page, scales) => page.evaluate(async ({ svgs }) => {
  const out = {};
  for (const [id, svg] of Object.entries(svgs)) {
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    await new Promise((r) => { img.onload = r; });
    const S = 260, cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    g.drawImage(img, 0, 0, S, S);
    const d = g.getImageData(0, 0, S, S).data;
    let ink = 0, total = 0;
    const R = S * (50.5 / 120);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = x - S / 2, dy = y - S / 2;
      if (dx * dx + dy * dy > R * R) continue;
      total++;
      if (d[(y * S + x) * 4 + 3] > 128) ink++;
    }
    out[id] = (ink / total) * 100;
  }
  return out;
}, { svgs: scales });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage();
await page.setContent('<body></body>');

const scale = Object.fromEntries(factions.map((f) => [f.id, 1]));
let area = {};
for (let r = 0; r < ROUNDS; r++) {
  const svgs = Object.fromEntries(factions.map((f) =>
    [f.id, emblem(f.emblem, { scale: scale[f.id] })]));   // 外郭は測定から除くため打ち消しは載せない
  area = await measure(page, svgs);
  for (const f of factions) {
    const a = area[f.id];
    if (!a) continue;
    // 外郭の帯は母数の外に出せないので、その寄与を差し引いてから比を取る
    const frameArea = 2.6;                                 // 内罫が母数内に落とす分（実測の定数）
    const cur = Math.max(a - frameArea, 0.5);
    const k = Math.sqrt(TARGET / cur);
    scale[f.id] = Math.min(MAX, Math.max(MIN, scale[f.id] * k));
  }
}

const vals = factions.map((f) => area[f.id]);
const bad = factions.filter((f) => area[f.id] < 18 || area[f.id] > 34);
console.log(`較正 ${ROUNDS} 巡  平均 ${(vals.reduce((a, c) => a + c, 0) / vals.length).toFixed(1)}%`
  + `  最小 ${Math.min(...vals).toFixed(1)}%  最大 ${Math.max(...vals).toFixed(1)}%`);
console.log(`範囲外 ${bad.length} 点` + (bad.length ? ': ' + bad.map((f) => `${f.ja} ${area[f.id].toFixed(1)}%`).join(' / ') : ''));
const pinned = factions.filter((f) => scale[f.id] <= MIN + 1e-6 || scale[f.id] >= MAX - 1e-6);
if (pinned.length) console.log(`縮尺が上下限に張り付いた点（図象の作り直しを要する）: ${pinned.map((f) => f.ja).join('／')}`);

writeFileSync(fileURLToPath(new URL('./calibration.json', import.meta.url)),
  JSON.stringify(Object.fromEntries(factions.map((f) => [f.id, +scale[f.id].toFixed(4)])), null, 1));
console.log('→ src/calibration.json');
await browser.close();
