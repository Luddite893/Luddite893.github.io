// 第二版本文の検査
//
//   node src/check-records2.mjs
//
// 見るのは三つ。
//   一　各節の字数が仕様の枠に収まっているか
//   二　関係の註が、相関図の辺と過不足なく対応しているか
//   三　人物の図版仕様が、生成系の語彙に存在する値か
// 三つとも目では拾えない。組んだ後に版面が破綻してから気づくのを避ける。

import { records2, lengths, SPEC, total } from './records2.mjs';
import { factions, categories, byCat } from './factions.mjs';
import { edgesOf } from './relations.mjs';
import { SKULLS, HEADGEAR, HAIR } from './busts.mjs';
import { FACES, BEARDS, BUILDS, POSES, MARKS } from './figures.mjs';
import { CUTS } from './scene.mjs';

const GARMENTS = ['mail', 'plate', 'robe', 'fur', 'leather', 'bare', 'apron', 'cloak'];
const VOCAB = {
  race: Object.keys(SKULLS), face: Object.keys(FACES), hair: Object.keys(HAIR),
  beard: Object.keys(BEARDS), headgear: Object.keys(HEADGEAR), garment: GARMENTS,
  build: Object.keys(BUILDS), pose: Object.keys(POSES), prop: Object.keys(CUTS),
  mark: Object.keys(MARKS),
};

const jaOf = (id) => factions.find((f) => f.id === id)?.ja ?? id;
// 端末の桁合わせ。和字は二桁ぶんの幅を占める。
const wide = (s) => [...s].reduce((a, c) => a + (c.codePointAt(0) > 0x2e7f ? 2 : 1), 0);
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - wide(s)));
let bad = 0;

console.log('── 字数 ──────────────────────────────────────────');
console.log(`  ${pad('項', 24)}` + ['概要', '沿革', '内情', '評判', '欠落', '註']
  .map((h) => pad(h, 7)).join(''));
for (const id of Object.keys(records2)) {
  const L = lengths(id);
  const line = Object.entries(L).map(([k, v]) => {
    const [lo, hi] = SPEC[k];
    const ok = v >= lo && v <= hi;
    if (!ok) bad++;
    return pad(`${v}${ok ? '' : '!'}`, 7);
  }).join('');
  console.log(`  ${pad(jaOf(id), 24)}${line}`);
}

console.log('\n── 関係の註 ──────────────────────────────────────');
for (const id of Object.keys(records2)) {
  const want = edgesOf(id).map((e) => e.other).sort();
  const have = Object.keys(records2[id].relNotes).sort();
  const miss = want.filter((x) => !have.includes(x));
  const extra = have.filter((x) => !want.includes(x));
  if (miss.length || extra.length) {
    bad++;
    console.log(`  ${jaOf(id)}　欠 ${miss.map(jaOf).join('・') || 'なし'}`
      + `／余 ${extra.map(jaOf).join('・') || 'なし'}`);
  }
}
if (!bad) console.log('  すべての辺に註がある。余分な註も無い。');

console.log('\n── 人物の図版仕様 ────────────────────────────────');
let people = 0;
for (const id of Object.keys(records2)) {
  for (const p of records2[id].people) {
    people++;
    for (const [k, list] of Object.entries(VOCAB)) {
      if (p[k] === undefined) { bad++; console.log(`  ${jaOf(id)}／${p.ja}　${k} が未指定`); }
      else if (!list.includes(p[k])) { bad++; console.log(`  ${jaOf(id)}／${p.ja}　${k}=${p[k]} は語彙に無い`); }
    }
  }
}
console.log(`  人物 ${people} 名を検査した。`);

console.log('\n── 進捗 ──────────────────────────────────────────');
const done = Object.keys(records2);
for (const c of categories) {
  const g = byCat(c.id);
  const d = g.filter((f) => records2[f.id]).length;
  console.log(`  ${pad(c.n, 6)}${pad(c.ja, 22)}${d} / ${g.length}`);
}
console.log(`  合計 ${done.length} / ${factions.length} 項　本文 ${total().toLocaleString()} 字`);
console.log(bad ? `\n枠外 ${bad} 件。` : '\n枠外なし。');
process.exit(bad ? 1 : 0);
