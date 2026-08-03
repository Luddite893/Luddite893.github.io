// エングレービング・エンジンの検版
import { writeFileSync, mkdirSync } from 'node:fs';
import { engrave, stipple, contour, twoPlate, TONE } from './engrave.mjs';
import { categories } from './factions.mjs';

const sq = (t) => {
  const d = 'M 2 2 H 38 V 38 H 2 Z';
  return `<svg viewBox="0 0 40 40"><rect x="2" y="2" width="36" height="36" fill="#fff"/>`
    + engrave(d, { t, angle: 38, box: [2, 2, 38, 38], seed: 't' + t })
    + `<rect x="2" y="2" width="36" height="36" fill="none" stroke="#1b1b1a" stroke-width="0.3"/></svg>`;
};

// 球。調子が形に沿うことを見る。銅版画では線が面の走向に従う。
const sphere = () => {
  const bands = [];
  const R = 34;
  for (let i = 0; i < 9; i++) {
    const t0 = i / 9, t1 = (i + 1) / 9;
    // 光は左上から。右下ほど濃い。
    const x0 = 40 - R + t0 * R * 2;
    const d = `M ${x0} 6 A ${R} ${R} 0 0 1 ${x0} 74 L ${40 - R + t1 * R * 2} 74 A ${R} ${R} 0 0 0 ${40 - R + t1 * R * 2} 6 Z`;
    const clip = `M 40 6 A ${R} ${R} 0 1 1 40 74 A ${R} ${R} 0 1 1 40 6 Z`;
    bands.push({ t: Math.pow(t0, 1.5) * 0.96, x0, x1: 40 - R + t1 * R * 2 });
  }
  let out = `<circle cx="40" cy="40" r="${R}" fill="#fff"/>`;
  for (const b of bands) {
    const d = `M ${b.x0} 2 L ${b.x1} 2 L ${b.x1} 78 L ${b.x0} 78 Z`;
    const inter = `M 40 6 A ${R} ${R} 0 1 1 40 74 A ${R} ${R} 0 1 1 40 6 Z`;
    out += `<g clip-path="url(#sph)">${engrave(d, { t: b.t, angle: 66, box: [b.x0, 2, b.x1, 78], seed: 'sp' + b.x0 })}</g>`;
  }
  return `<svg viewBox="0 0 80 80"><defs><clipPath id="sph"><circle cx="40" cy="40" r="${R}"/></clipPath></defs>`
    + out + `<circle cx="40" cy="40" r="${R}" fill="none" stroke="#1b1b1a" stroke-width="0.55"/></svg>`;
};

const stip = (t) => `<svg viewBox="0 0 40 40"><rect x="2" y="2" width="36" height="36" fill="#fff"/>`
  + stipple('M 2 2 H 38 V 38 H 2 Z', { t, box: [2, 2, 38, 38], seed: 's' + t })
  + `<rect x="2" y="2" width="36" height="36" fill="none" stroke="#1b1b1a" stroke-width="0.3"/></svg>`;

// 二色刷り。色版は線版の下に敷き、線には色を付けない。
const two = (c) => {
  const d = 'M 6 34 L 20 8 L 34 34 Z';
  return `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#fff"/>`
    + twoPlate({
        colorPlate: `<path d="M 8 33 L 21 9 L 33 33 Z"/>`,
        inkPlate: engrave(d, { t: 0.55, angle: 40, box: [6, 8, 34, 34], seed: 'tp' + c }) + contour(d, { w: 0.5 }),
        color: c, opacity: 0.34,
      })
    + `</svg>`;
};

const ramp = Array.from({ length: 11 }, (_, i) => i / 10);
const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#eceae4;font-family:'Noto Serif JP',serif;padding:12mm;color:#1b1b1a}
h1{font-size:5.4mm;letter-spacing:.2em;font-weight:600;margin-bottom:2mm}
p.l{font-size:3mm;line-height:5mm;color:#5c5a54;max-width:180mm;margin-bottom:7mm}
h2{font-size:3.6mm;letter-spacing:.12em;margin:7mm 0 3mm;border-bottom:.3mm solid #c9c6bd;padding-bottom:1mm}
.row{display:flex;gap:3mm;align-items:flex-start;flex-wrap:wrap}
.cell{text-align:center;font-size:2.4mm;color:#8a877e}
.cell svg{width:22mm;height:22mm;display:block;margin-bottom:1mm}
.big svg{width:52mm;height:52mm}
.k{font-size:2.6mm;color:#5c5a54;margin-top:1mm}
</style></head><body>
<h1>銅版画調エングレービング　検版</h1>
<p class="l">調子は線の関数として定義してある。図版は「形」と「各部の濃さ 0〜1」だけを持ち、線はエンジンが生成する。
濃さから線への写像が一つしかないので、全図版が同じ彫師の手になる。<br>
線は棒ではなく木の葉形——ビュランは押し込むほど溝が広がり、抜くときに細くなるので、
一本の線が中央で太り両端で消える。等幅の線を並べても銅版画には見えない。</p>

<h2>一　調子の階調（0.0 → 1.0）</h2>
<div class="row">${ramp.map((t) => `<div class="cell">${sq(t)}${t.toFixed(1)}</div>`).join('')}</div>
<p class="k">閾値：${TONE.cross2} で二番手を斜交、${TONE.cross3} で三番手、${TONE.flood} で地を敷く。全図版で共有する。</p>

<h2>二　調子が形に沿うか（球）</h2>
<div class="row"><div class="cell big">${sphere()}</div></div>

<h2>三　点刻</h2>
<div class="row">${[0.15, 0.3, 0.5, 0.7].map((t) => `<div class="cell">${stip(t)}${t}</div>`).join('')}</div>

<h2>四　二色刷り（色版は線版の下。線に色は付けない）</h2>
<div class="row">${categories.map((c) => `<div class="cell">${two(c.color)}${c.ja}</div>`).join('')}</div>
</body></html>`;

mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
writeFileSync(new URL('../out/proof-engrave.html', import.meta.url), html);
console.log('→ out/proof-engrave.html');
