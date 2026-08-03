// 紋章の校正刷り
//
// 段階 4（紋章 49 点の一括制作・承認）のための検版。
// 三つの寸法で同時に見る。
//   38mm  設計を見る寸法
//   12mm  本文中の実寸
//    8mm  柱・小口に入る最小寸法。ここで潰れたら不合格。
// 面積率も測る。18〜34% を外れた点は、並べたとき必ず浮く。

import { writeFileSync, mkdirSync } from 'node:fs';
import { emblem } from './heraldry.mjs';
import { factions, categories, byCat } from './factions.mjs';
import cal from './calibration.json' with { type: 'json' };

const S = (f) => ({ extinct: f.extinct, scale: cal[f.id] ?? 1 });

const sheet = categories.map((c) => {
  const items = byCat(c.id).map((f) => `
    <figure class="cell" data-id="${f.id}">
      <div class="big">${emblem(f.emblem, S(f))}</div>
      <div class="row">
        <span class="mid">${emblem(f.emblem, S(f))}</span>
        <span class="min">${emblem(f.emblem, S(f))}</span>
        <span class="tint">${emblem(f.emblem, { ...S(f), color: c.color })}</span>
      </div>
      <figcaption>
        <b>${f.ja}${f.extinct ? '<i class="pv">滅</i>' : ''}</b>
        <span class="en">${f.en}</span>
        <span class="area" data-area="${f.id}"${f.extinct ? ' data-extinct="1"' : ''}>—</span>
      </figcaption>
    </figure>`).join('');
  return `<section class="cat">
    <h2><span class="num" style="--c:${c.color}">${c.n}</span>${c.ja}
      <span class="cen">${c.en}</span><span class="tone">${c.tone}</span></h2>
    <p class="note">${c.note}</p>
    <div class="grid">${items}</div>
  </section>`;
}).join('');

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<title>紋章 49 点　校正刷り</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#eceae4;color:#1b1b1a;font-family:'Noto Serif JP',serif;padding:14mm 12mm 20mm;}
  h1{font-size:6mm;letter-spacing:.24em;font-weight:600;margin-bottom:2mm}
  .lead{font-size:3mm;line-height:5mm;color:#5c5a54;margin-bottom:9mm;max-width:170mm}
  .cat{margin-bottom:11mm;break-inside:avoid}
  h2{font-size:4.4mm;font-weight:600;letter-spacing:.1em;display:flex;align-items:baseline;gap:3mm;
     border-bottom:.4mm solid #c9c6bd;padding-bottom:1.6mm;margin-bottom:1.4mm}
  .num{font-family:'EB Garamond',serif;font-size:5.4mm;color:var(--c);letter-spacing:.06em;min-width:11mm}
  .cen{font-family:'EB Garamond',serif;font-size:3mm;letter-spacing:.22em;color:#8a877e}
  .tone{margin-left:auto;font-size:2.8mm;color:#8a877e}
  .note{font-size:2.9mm;color:#6d6a63;margin-bottom:5mm}
  .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7mm 5mm}
  .cell{display:flex;flex-direction:column;align-items:center;gap:1.6mm}
  .big svg{width:38mm;height:38mm;display:block}
  .row{display:flex;align-items:flex-end;gap:3mm;height:13mm}
  .mid svg{width:12mm;height:12mm;display:block}
  .min svg{width:8mm;height:8mm;display:block}
  .tint svg{width:12mm;height:12mm;display:block}
  figcaption{text-align:center;font-size:2.7mm;line-height:3.8mm}
  figcaption b{font-weight:600;display:block}
  .pv{font-style:normal;font-size:2.2mm;color:#a8442e;border:.25mm solid #a8442e;
      padding:0 .6mm;margin-left:1mm;vertical-align:2px}
  .en{font-family:'EB Garamond',serif;font-size:2.4mm;letter-spacing:.12em;color:#8a877e;display:block}
  .area{font-size:2.3mm;color:#8a877e;font-family:'EB Garamond',serif}
  .area.bad{color:#a8442e;font-weight:700}
</style></head><body>
<h1>紋章　四十九点　校正刷り</h1>
<p class="lead">
上段 38mm＝設計寸法。下段は左から 12mm（本文中の実寸）、8mm（柱・小口に入る最小寸法）、
そして分類色を乗せたもの。％は図象の面積率で、18〜34% を外れたものは赤で示す。
「滅」は滅亡した組織で、紋章に統一した打ち消しの線が入る。
外れた点は、並べたときに必ず一点だけ浮く。<br>
外形・二重罫・図象領域の半径は全 49 点で同一。図象はすべて塗りのみで構成し、線を使っていない。
</p>
${sheet}
<script>
// 面積率の実測。各紋章を実際に描いて、外郭内の塗り画素を数える。
(async () => {
  for (const cell of document.querySelectorAll('.cell')) {
    const svg = cell.querySelector('.big svg').outerHTML;
    const img = new Image();
    const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    await new Promise((r) => { img.onload = r; img.src = url; });
    const S = 240, cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    g.drawImage(img, 0, 0, S, S);
    const d = g.getImageData(0, 0, S, S).data;
    let ink = 0, total = 0;
    const R = S * (50.5 / 120);          // 内罫の内側だけを母数にする
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = x - S / 2, dy = y - S / 2;
      if (dx * dx + dy * dy > R * R) continue;
      total++;
      if (d[(y * S + x) * 4 + 3] > 128) ink++;
    }
    const pct = (ink / total) * 100;
    const el = cell.querySelector('.area');
    el.textContent = pct.toFixed(1) + '%';
    // 滅亡組織は打ち消しの線のぶん面積が増える。判定からは外す。
    if (!el.dataset.extinct && (pct < 18 || pct > 34)) el.classList.add('bad');
    el.dataset.pct = pct.toFixed(1);
  }
  document.body.dataset.measured = '1';
})();
</script>
</body></html>`;

mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
writeFileSync(new URL('../out/proof-emblems.html', import.meta.url), html);
console.log(`紋章 ${factions.length} 点 → out/proof-emblems.html`);
