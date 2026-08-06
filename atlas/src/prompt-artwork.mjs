// 図版の指示文を、本書のデータから書き出す
//
//   node src/prompt-artwork.mjs            → out/図版プロンプト.tsv / .json
//   node src/prompt-artwork.mjs --faces    → 人物図版に顔貌を描かせる（既定は描かせない）
//
// ── なぜ機械で書くか ────────────────────────────
// 二百三十二点の指示文を手で書けば、必ず前半と後半で語彙が変わる。
// 変われば絵柄が変わる。四十九点の紋章を一点ずつ描かなかったのと同じ理由で、
// 指示文も一点ずつ書かない。**共通の前置きと、項ごとの差分**に分ける。
//
// 前置きは全点で一字も違わない。差分だけが項ごとに違う。
// これで「同じ彫師の手」を、生成の側にも要求できる。
//
// ── 顔貌について ──────────────────────────────
// 本書の凡例には「人物図版は肖像ではない。記録に残る特徴——種族・被り物・装いのみを
// 図取りしたもので、顔貌は本書の関知するところではない」と刷ってある。
// 生成した顔を入れると、この一文が嘘になる。
// 既定では顔を描かせない。描かせる場合は --faces を付け、凡例のほうを直す。

import { writeFileSync } from 'node:fs';
import { factions, categories } from './factions.mjs';
import { records2 } from './records2.mjs';
import { plates } from './plates.mjs';
import { SIZE } from './artwork.mjs';
import { CAPTION_EN } from './prompt-captions.mjs';

const FACES_ON = process.argv.includes('--faces');

// ── 全点で共通の前置き ──────────────────────────
// 刷りの条件をそのまま書く。「銅版画風」だけでは、彫りの目が点ごとに変わる。
const HOUSE = [
  'Copperplate engraving, line art only.',
  'Pure black ink on a plain white ground — no grey wash, no colour, no gradients.',
  'Tone is built solely from engraved hatching: parallel burin lines, cross-hatching at 54 degrees for the darker passages, a third pass at 108 degrees only for the darkest.',
  'Every line swells at its middle and tapers at both ends, as a burin cuts.',
  'No solid black areas — a copperplate has none.',
  'Light falls from the upper left in every plate.',
  'The density of the hatching is identical regardless of subject size.',
  'No lettering, no caption, no signature, no border, no frame, no vignette.',
  'Flat on the page, no paper texture, no ageing, no stains, no torn edges.',
].join(' ');

const SCENE = [
  'A single architectural or landscape scene, viewed from a fixed middle distance.',
  'Horizon low. The structure occupies the middle third of the height.',
  'Human figures, where present, are small and unindividuated — they establish scale, nothing more.',
].join(' ');

const BUST = FACES_ON
  ? 'A bust portrait, head and shoulders, cut off at the chest. Plain white ground behind.'
  : [
    'A bust, head and shoulders, cut off at the chest. Plain white ground behind.',
    'THE FACE IS NOT DRAWN: no eyes, no nose, no mouth, no expression.',
    'The head is rendered as an unmarked shape under its hair and headgear.',
    'This is not a portrait; it records race, headgear and dress only.',
  ].join(' ');

// ── 語彙 ────────────────────────────────────────
// records の記号を、指示文の語に一度だけ訳す。訳を一箇所に置くのは、
// 「fur」が点によって pelt になったり hide になったりするのを防ぐためである。
const RACE = {
  human: 'a human of the Imperial provinces', nord: 'a Nord of the northern province',
  elf: 'a tall elf with long pointed ears', orc: 'an orc with a heavy jaw and lower tusks',
  khajiit: 'a feline-headed khajiit with upright ears',
  argonian: 'a reptilian argonian with a crested head',
};
const HEADGEAR = {
  none: 'bare-headed', hood: 'a deep cloth hood', helm: 'a plain iron helm',
  horned: 'a horned iron helm', circlet: 'a thin metal circlet', cowl: 'a close cowl',
};
const HAIR = {
  none: 'no visible hair', long: 'long hair falling past the shoulders',
  short: 'short cropped hair', topknot: 'hair gathered into a topknot',
  braid: 'a single heavy braid',
};
const GARMENT = {
  mail: 'a mail shirt', plate: 'plate armour over a gambeson', robe: 'a heavy wool robe',
  fur: 'a fur mantle over the shoulders', leather: 'a studded leather jerkin',
  bare: 'a bare chest', apron: "a smith's leather apron", cloak: 'a long travelling cloak',
};
const BUILD = { slight: 'slight build', normal: 'ordinary build', broad: 'broad, heavy build' };
const POSE = {
  frontal: 'facing the viewer squarely', quarter: 'turned a quarter to the left',
  turned: 'turned in profile to the left', bowed: 'head slightly bowed',
};
const MARK = {
  none: '', scar: 'a scar across one cheek', eyepatch: 'a leather patch over one eye',
  aged: 'deeply aged, lined skin', earless: 'one ear missing',
};
const PROP = {
  sword: 'a straight sword held upright before the chest', axe: 'a war axe', bow: 'a bow',
  shield: 'a round shield', spear: 'a spear', mace: 'a mace', warhammer: 'a war hammer',
  ledger: 'a bound ledger', quill: 'a quill pen', seal: 'a wax seal on a cord',
  tablet: 'a stone tablet', scroll: 'a rolled scroll', book: 'a closed book',
  chalice: 'a chalice', phial: 'a small glass phial', herb: 'a sprig of dried herb',
  lantern: 'a hooded lantern', candle: 'a lit candle', crown: 'a plain circlet crown',
  tongs: 'a pair of smith’s tongs', oar: 'a short oar', staff: 'a wooden staff',
  dagger: 'a dagger', key: 'a large iron key', hornCall: 'a drinking horn',
};
const STRUCTURE = {
  city: 'a walled town seen from outside the gate', keep: 'a stone keep',
  fort: 'a square fortress on open ground', tower: 'a single tall tower',
  longhouse: 'a great timber longhouse', hut: 'a low timber dwelling',
  temple: 'a stone temple front', monastery: 'a monastery cut into a mountainside',
  crypt: 'the entrance to an underground crypt', barrow: 'an ancient burial mound',
  ruin: 'a ruined stone hall, roofless', cave: 'a cave mouth in a rock face',
  mine: 'the head of a mine shaft', dock: 'a working quayside with moored vessels',
  camp: 'a temporary encampment of hide tents', palisade: 'a timber palisade',
  gatehouse: 'a fortified gatehouse', arch: 'a free-standing stone arch',
  stones: 'a ring of standing stones', altar: 'a stone altar in the open',
  forest: 'a stand of tall conifers', college: 'a college on an isolated crag',
  wagon: 'a covered merchant wagon', mushroom: 'a vast fungal tower',
};

const catOf = (f) => categories.find((c) => c.id === f.cat);
const num = (f) => factions.findIndex((x) => x.id === f.id) + 1;

// ── 主図版 ──────────────────────────────────────
function scenePrompt(f) {
  const p = plates[f.id];
  // 図版説明は本書に刷ってある一文。これを指示の中心に据える。
  // 和文のまま渡すと、拾う度合いが点によって変わる。訳を添える（prompt-captions.mjs）。
  // 訳があるときは構築物の語を重ねない。plates の structure は版面の作図のための
  // 大まかな型であって、図版説明のほうが具体である。両方を渡すと食い違う
  // （たとえばストームクロークは structure が longhouse、説明は石造の王宮である）。
  const subject = CAPTION_EN[f.id]
    ? `Subject: ${CAPTION_EN[f.id]}`
    : `Subject: ${STRUCTURE[p.structure] ?? p.structure}. ${p.caption}`;
  const bits = [
    HOUSE, SCENE, subject,
    p.night ? 'Night. The sky is worked up with dense hatching; the ground stays light.' : '',
    p.figures === 0 ? 'No human figures at all. The absence is deliberate.' : '',
    'Setting: a cold northern province — conifer forest, snow, stone and timber.',
    'Aspect ratio 5:4 (landscape).',
  ];
  return bits.filter(Boolean).join(' ');
}

// ── 人物図版 ────────────────────────────────────
function bustPrompt(f, p) {
  const bits = [
    HOUSE, BUST,
    `Subject: ${RACE[p.race] ?? RACE.human}, ${BUILD[p.build ?? 'normal']}, ${POSE[p.pose ?? 'frontal']}.`,
    `${HEADGEAR[p.headgear ?? 'none']}, ${HAIR[p.hair ?? 'none']}, wearing ${GARMENT[p.garment ?? 'robe']}.`,
    MARK[p.mark] ? `${MARK[p.mark]}.` : '',
    p.prop && PROP[p.prop] ? `Holding ${PROP[p.prop]}, small, at the lower edge.` : '',
    `Aspect ratio 2:3 (portrait).`,
  ];
  return bits.filter(Boolean).join(' ');
}

// ── 書き出し ────────────────────────────────────
const jobs = [];
for (const f of factions) {
  jobs.push({
    種別: '主図版', 配置名: f.id, 項: num(f), 名称: f.ja,
    分類: `${catOf(f).n} ${catOf(f).ja}`,
    寸法: `${SIZE.主図版.w}×${SIZE.主図版.h}mm`, 比: '5:4',
    prompt: scenePrompt(f),
  });
  (records2[f.id].people ?? []).forEach((p, i) => {
    jobs.push({
      種別: '人物図版', 配置名: `${f.id}-${i + 1}`, 項: num(f), 名称: `${f.ja}／${p.ja}`,
      分類: `${catOf(f).n} ${catOf(f).ja}`,
      寸法: `${SIZE.人物図版.w}×${SIZE.人物図版.h}mm`, 比: '2:3',
      prompt: bustPrompt(f, p),
    });
  });
}

const out = new URL('../out/', import.meta.url);
writeFileSync(new URL('図版プロンプト.json', out), JSON.stringify(jobs, null, 1));
const cols = ['種別', '配置名', '項', '名称', '分類', '寸法', '比', 'prompt'];
writeFileSync(new URL('図版プロンプト.tsv', out),
  cols.join('\t') + '\n'
  + jobs.map((j) => cols.map((c) => String(j[c]).replace(/\t|\n/g, ' ')).join('\t')).join('\n') + '\n');

const scenes = jobs.filter((j) => j.種別 === '主図版').length;
console.log(`指示文 ${jobs.length} 件（主図版 ${scenes}／人物図版 ${jobs.length - scenes}）`);
console.log(`  顔貌　${FACES_ON ? '描かせる（--faces）。凡例の書き換えが要る' : '描かせない（既定。凡例のとおり）'}`);
console.log(`  → out/図版プロンプト.tsv ／ .json`);
