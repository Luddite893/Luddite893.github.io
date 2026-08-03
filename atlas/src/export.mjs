// 納品用の図版データ書き出し
//
// 仕様書 12：紋章 49 点の個別ベクター（必須。今後の流用のため）。
//            図版のソースデータ。
//
// 紋章は二種を出す。分類色を乗せた版と、墨一色の版。
// 流用先が本書の分類体系を持つとは限らないので、色の付かない版が要る。
// 座標系・外形・面積率は本書と同一なので、混ぜて使っても揃う。

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { categories, factions, byCat } from './factions.mjs';
import { records } from './records.mjs';
import { emblem } from './heraldry.mjs';
import { plates, plateOf } from './plates.mjs';
import { scene, cut, CUTS, STRUCTURES } from './scene.mjs';
import { bust } from './busts.mjs';
import { egoDiagram, masterDiagram, catDiagram } from './diagram.mjs';
import { tamrielMap, skyrimMap, distributionMap, miniMap } from './map.mjs';
import { edges } from './relations.mjs';
import cal from './calibration.json' with { type: 'json' };

const OUT = fileURLToPath(new URL('../out/図版データ/', import.meta.url));
rmSync(OUT, { recursive: true, force: true });

const dir = (p) => { mkdirSync(OUT + p, { recursive: true }); return OUT + p; };
const pad = (n) => String(n).padStart(2, '0');
const safe = (s) => s.replace(/[\/\\:*?"<>|]/g, '＿');

// SVG の頭。単体のファイルとして開けるようにする。
const wrap = (body, note) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${note} -->\n`
  + body.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');

let n = 0;
const put = (path, svg, note) => { writeFileSync(path, wrap(svg, note)); n++; };

// ── 一　紋章 49 点 ────────────────────────────
{
  const d1 = dir('紋章_分類色/'), d2 = dir('紋章_墨/');
  factions.forEach((f, i) => {
    const c = categories.find((x) => x.id === f.cat);
    const S = { scale: cal[f.id] ?? 1, extinct: f.extinct };
    const name = `${pad(i + 1)}_${safe(f.ja)}.svg`;
    put(d1 + name, emblem(f.emblem, { ...S, color: c.color }),
      `${f.ja} / ${f.en} — 分類 ${c.n} ${c.ja} ${c.color}　120×120　外形 r=56/50.5`);
    put(d2 + name, emblem(f.emblem, { ...S }),
      `${f.ja} / ${f.en} — 墨一色　120×120　外形 r=56/50.5`);
  });
}

// ── 二　主図版 49 点 ───────────────────────────
{
  const d = dir('主図版/');
  factions.forEach((f, i) => {
    const p = plateOf(f);
    put(d + `${pad(i + 1)}_${safe(f.ja)}.svg`, scene(p.scene),
      `${f.ja}　${p.caption}　刷り上がり 174mm`);
  });
}

// ── 三　小カット 84 種 ──────────────────────────
{
  const d = dir('小カット/');
  Object.keys(CUTS).forEach((k, i) => {
    put(d + `${pad(i + 1)}_${k}.svg`, cut(k, { seed: 'x' }), `小カット ${k}　刷り上がり 25mm`);
  });
}

// ── 四　人物図版 ─────────────────────────────
{
  const d = dir('人物図版/');
  let i = 0;
  for (const f of factions) {
    for (const [j, p] of (records[f.id].people ?? []).entries()) {
      i++;
      put(d + `${String(i).padStart(3, '0')}_${safe(f.ja)}_${safe(p.ja)}.svg`,
        bust({ ...p, id: f.id + 'p' + j }),
        `${f.ja}　${p.ja}（${p.note}）　刷り上がり 18mm　※肖像ではない`);
    }
  }
}

// ── 五　図式 ────────────────────────────────
{
  const d = dir('図式/');
  put(d + '00_全体相関図.svg', masterDiagram({ size: 1240 }), `全 49 項・関係 ${edges.length} 件`);
  categories.forEach((c) => {
    put(d + `分類${c.n}_関係の行き先.svg`, catDiagram(c.id, { w: 174, h: 118 }),
      `分類 ${c.n} ${c.ja}　二部グラフ`);
  });
  factions.forEach((f, i) => {
    put(d + `${pad(i + 1)}_${safe(f.ja)}_関係.svg`, egoDiagram(f.id, { w: 174, h: 60 }),
      `${f.ja}　自我図`);
  });
}

// ── 六　地図 ────────────────────────────────
{
  const d = dir('地図/');
  put(d + '図一_タムリエル全図.svg', tamrielMap({ size: 1180 }), '全図（州境は模式）');
  put(d + '図二_スカイリム九領図.svg', skyrimMap({ size: 1180 }), '部分図（領境・街道・拠点）');
  const dm = distributionMap({ factions, records, categories, size: 1500 });
  put(d + '図三_勢力分布図.svg', dm.svg, `分布図（図中 ${49 - dm.offmap.length} 項）`);
  put(d + '小地図_見本.svg', miniMap('ホワイトラン'), '各項の拠点欄に入る 26mm 角の小地図');
}

// ── 七　図版目録 ─────────────────────────────
{
  const rows = [];
  factions.forEach((f, i) => {
    const p = plateOf(f);
    const c = categories.find((x) => x.id === f.cat);
    rows.push([i + 1, f.ja, f.en, `${c.n} ${c.ja}`, c.color,
      p.scene.structure, p.cuts.join('・'), (records[f.id].people ?? []).length].join('\t'));
  });
  writeFileSync(OUT + '図版目録.tsv',
    '項番\t名称\t欧字名\t分類\t分類色\t主図版の構築物\t小カット\t人物図版数\n' + rows.join('\n') + '\n');
  n++;
}

console.log(`図版データ ${n} 点 → out/図版データ/`);
console.log(`  紋章 ${factions.length}×2　主図版 ${factions.length}　小カット ${Object.keys(CUTS).length}`
  + `　人物 ${factions.reduce((a, f) => a + (records[f.id].people ?? []).length, 0)}`
  + `　図式 ${factions.length + 1 + categories.length}　地図 4`);
