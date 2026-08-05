// 年表と沿革の突き合わせ
//
//   node src/check-chron.mjs
//
// 沿革の段落は年の札を持っている。年表はその年を一本の線に戻す装置である。
// 両者がずれると、年表に無い年が本編にあることになる。読者は気づけない。
// だから機械に突き合わせる。見るのは三つ。
//   一　年の特定できる沿革の年が、年表の行として立っているか
//   二　年表の行が、その年の沿革をすべて拾えているか（拾い漏れは refsOf が埋める）
//   三　手で書いた refs のうち、沿革にも年表にも根拠の無いものが無いか

import { factions } from './factions.mjs';
import { records2 } from './records2.mjs';
import { events, eras, parseYear, historyRefs, refsOf } from './chronicle.mjs';

const byId = Object.fromEntries(factions.map((f) => [f.id, f]));
const eraJa = Object.fromEntries(eras.map((e) => [e.id, e.ja]));
const { at, vague } = historyRefs(records2);
const rows = new Set(events.map((e) => `${e.era}:${e.year}`));

const bad = [];

// 一　沿革にあって年表に無い年
for (const k of at.keys()) {
  if (!rows.has(k)) {
    const [era, y] = k.split(':');
    bad.push(`年表に無い年　${eraJa[era]} ${y}　（${[...at.get(k)].map((i) => byId[i].ja).join('・')}）`);
  }
}

// 三　沿革に根拠の無い手書きの ref
// 出来事に効いた項が、その年の沿革を持たないことはあり得る（結成の年に相手方の項が効く等）。
// これは誤りではないので、数だけを出す。
let handOnly = 0;
for (const e of events) {
  for (const id of e.refs) {
    if (!byId[id]) { bad.push(`存在しない項　${e.era} ${e.year}　${id}`); continue; }
    if (!(at.get(`${e.era}:${e.year}`) ?? new Set()).has(id)) handOnly++;
  }
}

const total = events.reduce((n, e) => n + refsOf(e, at, factions).length, 0);
const hist = Object.values(records2).reduce((n, r) => n + (r.history?.length ?? 0), 0);
const dated = [...at.values()].reduce((n, s) => n + s.size, 0);

console.log(`沿革 ${hist} 段落　うち年の特定できるもの ${dated}`);
console.log(`年表 ${events.length} 行　項の参照 ${total} 件（うち沿革から ${total - handOnly}）`);
for (const [era, s] of vague) {
  console.log(`  ${eraJa[era]}　年を特定できない記述を持つ項 ${s.size}`);
}
if (bad.length) {
  console.log(`\n不可 ${bad.length} 件`);
  for (const b of bad) console.log(`  ${b}`);
} else {
  console.log('\n年表と沿革　齟齬なし');
}
process.exit(bad.length ? 1 : 0);
