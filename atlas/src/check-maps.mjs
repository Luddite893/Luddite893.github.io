// 地図の札の重なりの検査
//
//   node src/check-maps.mjs
//
// 図の文字が重なっているかどうかを、目ではなく数で言わせる。
// 見るのは三つ。
//   一　札どうしが重なっていないか
//   二　札が図の縁から出ていないか
//   三　州の内側に置くべき札が、輪郭の外へ出ていないか
// 三つ目は図一と図二にしか無い。分布図の地名は、玉の外へ逃がすことがあるためである。

import { factions, categories } from './factions.mjs';
import { records } from './records.mjs';
import {
  tamrielLabels, skyrimLabels, distributionMap, inPoly, probes,
} from './map.mjs';

const area = (a, b) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0))
  * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

// 図の単位は百分の一。〇・二五平方単位より小さい重なりは、
// 刷り上がりで〇・五ミリ角に満たないので数えない。
const MIN = 0.25;

function examine(title, placed, bounds) {
  const bad = [];
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = area(placed[i].rect, placed[j].rect);
      if (a > MIN) bad.push(`札の重なり　「${placed[i].name}」×「${placed[j].name}」　${a.toFixed(1)}`);
    }
    const r = placed[i].rect;
    const out = Math.max(bounds.x0 - r.x0, r.x1 - bounds.x1, bounds.y0 - r.y0, r.y1 - bounds.y1);
    if (out > 0.2) bad.push(`図の外へ出る　「${placed[i].name}」　${out.toFixed(1)}`);
    if (placed[i].poly) {
      const n = probes(r).filter((p) => !inPoly(p, placed[i].poly)).length;
      if (n) bad.push(`輪郭の外へ出る　「${placed[i].name}」　六点のうち ${n}`);
    }
    if (placed[i].outside) {
      const n = probes(r).filter((p) => inPoly(p, placed[i].outside)).length;
      if (n) bad.push(`輪郭の中へ入る　「${placed[i].name}」　六点のうち ${n}`);
    }
  }
  console.log(`${title}　札 ${placed.length} 枚　${bad.length ? `不可 ${bad.length} 件` : '可'}`);
  for (const b of bad) console.log(`  ${b}`);
  return bad.length;
}

let n = 0;
{
  const { placed, bounds } = tamrielLabels({});
  n += examine('図一　タムリエル全図', placed, bounds);
}
{
  const { placed, bounds } = skyrimLabels({});
  n += examine('図二　スカイリム九領図', placed, bounds);
}
{
  const { placed, bounds } = distributionMap({ size: 1500, factions, records, categories });
  n += examine('図三　勢力分布図', placed, bounds);
}

console.log(n ? `\n地図 3 点　不可 ${n} 件` : '\n地図 3 点　すべて可');
process.exit(n ? 1 : 0);
