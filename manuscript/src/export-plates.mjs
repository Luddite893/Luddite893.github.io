// 細密画の元データ書き出し
//
// 発注仕様 8-5 は PSD/AI（レイヤー保持）を求めているが、本件の細密画は
// ラスタでもベジエ手描きでもなく、座標を記述したコードから生成している。
// PSD/AI に変換すると、その記述性が失われ、修正のたびに手で描き直すことになる。
//
// 代わりに、レイヤー構造を保持した SVG で納品する。
// Illustrator / Inkscape / Affinity のいずれでもレイヤーとして開き、編集できる。
// 元の記述（src/miniatures.mjs）も併せて納めるので、
// 座標での修正と、GUI での修正の、どちらでも作業できる。

import { writeFileSync, mkdirSync } from 'node:fs';
import { miniatures } from './miniatures.mjs';

const NAMES = {
  scaffold:    ['01', 'プロローグ_処刑台'],
  temple:      ['02', '第一幕_荒れ果てた神殿と降りてくる光'],
  coldharbour: ['03', '第二幕_コールドハーバー'],
  burningbook: ['04', '幕間_燃える書'],
  gate:        ['05', '第三幕_門'],
  doll:        ['06', '終幕_人形'],
};

const NS = 'xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
         + 'xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.0.dtd"';

// 描画中の `<!-- 見出し -->` を層の切れ目として扱い、名前付きの層に畳む。
function layerize(inner) {
  const parts = inner.split(/<!--\s*([^>]*?)\s*-->/);
  let out = '', lead = parts[0].trim();
  if (lead) out += layer('地', lead);
  for (let i = 1; i < parts.length; i += 2) {
    const label = parts[i].replace(/[※\s]+$/, '').trim() || `層${(i + 1) / 2}`;
    const body = (parts[i + 1] || '').trim();
    if (body) out += layer(label, body);
  }
  return out;
}
const layer = (label, body) =>
  `\n  <g inkscape:groupmode="layer" inkscape:label="${label}">\n    ${body}\n  </g>`;

mkdirSync(new URL('../out/plates/', import.meta.url), { recursive: true });

for (const [key, fn] of Object.entries(miniatures)) {
  const [num, name] = NAMES[key];
  const svg = fn();
  // frame() が返す <svg> から、定義部と描画部を取り出して組み直す
  const defs = svg.match(/<defs>[\s\S]*?<\/defs>/)[0];
  const inner = svg.match(/<g clip-path="url\(#\w+c\)"[^>]*>([\s\S]*?)<\/g>\s*<rect x="3\.2"[^>]*filter/)[1];
  const uidM = svg.match(/id="(m\d+)c"/)[1];
  const fillet = (svg.match(/stroke="([^"]+)" stroke-width="0\.35"/) || [, '#8d3a24'])[1];
  const ground = (svg.match(/<rect x="3\.2" y="3\.2"[^>]*fill="([^"]+)"/) || [, '#ded3b6'])[1];

  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  『暁の砕き手』私家版写本　細密画 ${num}　${name.replace(/_/g, '　')}

  ・単位は viewBox 座標（100 × 78）。実寸は版面上で幅 78mm。
  ・層は編集の単位で切ってある。囲み罫は「囲み」層。
  ・${uidM}r は筆の揺れ、${uidM}g は顔料のむら。いずれも手続き的な生成で、
    既製のテクスチャは使っていない。不要なら filter 属性を外せば素の線画になる。
  ・人物の顔は描かない方針。輪郭・頭巾・逆光で処理している。
  ・生成元： src/miniatures.mjs（座標はすべてそこに記述）
-->
<svg xmlns="http://www.w3.org/2000/svg" ${NS}
     viewBox="0 0 100 78" width="78mm" height="60.84mm">
  ${defs}
  <g inkscape:groupmode="layer" inkscape:label="地色">
    <rect x="3.2" y="3.2" width="93.6" height="71.6" fill="${ground}"/>
  </g>
  <g inkscape:groupmode="layer" inkscape:label="描画" clip-path="url(#${uidM}c)" filter="url(#${uidM}r)">${layerize(inner)}
  </g>
  <g inkscape:groupmode="layer" inkscape:label="顔料のむら">
    <rect x="3.2" y="3.2" width="93.6" height="71.6" filter="url(#${uidM}g)"
          opacity="0.55" style="mix-blend-mode:multiply"/>
  </g>
  <g inkscape:groupmode="layer" inkscape:label="囲み罫">
    <rect x="3.2" y="3.2" width="93.6" height="71.6" fill="none" stroke="#3a2c1c" stroke-width="0.5" opacity="0.85"/>
    <rect x="1.7" y="1.7" width="96.6" height="74.6" fill="none" stroke="${fillet}" stroke-width="0.35" opacity="0.7"/>
  </g>
</svg>
`;
  const file = new URL(`../out/plates/${num}_${name}.svg`, import.meta.url);
  writeFileSync(file, doc);
  console.log(`細密画 ${num}  ${name}`);
}
