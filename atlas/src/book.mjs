// 一冊に組む
//
// 第二版は 264 頁。丁合いの都合で四の倍数に揃えてある。
//   前付 17 ／ 本編 49 項 × 4 頁 ＋ 分類扉 14 ／ 相関図 26 ／ 後付 11
//
// ノンブルの偶奇が命である。見開きは必ず「偶数＝左」「奇数＝右」で始まる。
// 一頁ずれると、四十九の見開きがすべて割れる。
// だから頁は配列として組み立て、位置は index から決める。手で数えない。

import { writeFileSync } from 'node:fs';
import { G, css } from './grid.mjs';
import { categories, factions, byCat } from './factions.mjs';
import { records } from './records.mjs';
import { plateOf } from './plates.mjs';
import { spreadCss, edgeTab } from './spread.mjs';
import { spread2, spread2Css } from './spread2.mjs';
import { categorySheets, relmapCss } from './relmap.mjs';
import { THEMES } from './relmap-data.mjs';
import { distributionMap, SEATS, HOLDS, PROVINCES } from './map.mjs';
import { plateStats } from './plates.mjs';
import * as M from './matter.mjs';

const catOf = (f) => categories.find((c) => c.id === f.cat);

// ── 一　頁割り ──────────────────────────────────
// まず「何頁目に何が来るか」だけを決める。中身はまだ作らない。
const slots = [];
const put = (kind, o = {}) => { slots.push({ kind, ...o }); return slots.length; };

put('cover');
put('blank');
put('title');
put('toc', { side: 'verso', part: 0 });
put('toc', { side: 'recto', part: 1 });
put('preface', { side: 'verso' });
put('preface', { side: 'recto' });
put('legend', { side: 'verso' });
put('legend', { side: 'recto' });
put('master', { side: 'verso' });
put('master', { side: 'recto' });
put('mapT', { side: 'verso' });
put('mapS', { side: 'recto' });
put('dist', { side: 'verso' });
put('dist', { side: 'recto' });
put('chron', { side: 'verso' });
put('chron', { side: 'recto' });

for (const c of categories) {
  put('catTitle', { side: 'verso', cat: c.id });
  put('catOver', { side: 'recto', cat: c.id });
  for (const f of byCat(c.id)) {
    // 第二版は一項四頁。図版面／名称と概要／沿革と内情／評判と関係。
    put('e1', { side: 'verso', id: f.id });
    put('e2', { side: 'recto', id: f.id });
    put('e3', { side: 'verso', id: f.id });
    put('e4', { side: 'recto', id: f.id });
  }
}

// 相関図。主題別八枚と分類別十六枚を巻末にまとめる。
const REL = [...THEMES, ...categories.flatMap((c) => categorySheets(c))];
put('relTitle', { side: 'verso' });
put('relTitle2', { side: 'recto' });
REL.forEach((t, i) => put('relSheet', { side: i % 2 ? 'recto' : 'verso', t: i }));

put('doorTable', { side: 'verso' });
put('doorTable', { side: 'recto' });
put('peopleIndex', { side: 'verso' });
put('peopleIndex', { side: 'recto' });
put('generalIndex', { side: 'verso' });
put('generalIndex', { side: 'recto' });
for (let i = 1; i <= 4; i++) put('notes', { side: i % 2 ? 'verso' : 'recto', n: i });
put('colophon', { side: 'verso' });

// 偶奇の検査。ここが通らないまま先へ進んではいけない。
const parity = slots.map((s, i) => {
  const folio = i + 1;
  if (!s.side) return null;
  const want = folio % 2 === 0 ? 'verso' : 'recto';
  return s.side === want ? null : `頁${folio} ${s.kind} は ${s.side} だが ${want} の位置`;
}).filter(Boolean);
if (parity.length) { console.error(parity.join('\n')); process.exit(1); }
if (slots.length % 4) { console.error(`総頁 ${slots.length} は四の倍数でない`); process.exit(1); }

// 項 → その項の右頁のノンブル
const folioOf = {};
slots.forEach((s, i) => { if (s.kind === 'e2') folioOf[s.id] = i + 1; });
const FO = (id) => folioOf[id] ?? '—';

// ── 二　総索引の項目 ────────────────────────────
// 組織名・別称・拠点の地名・領名・州名を一括して並べる。
function buildTerms() {
  const t = [];
  for (const f of factions) {
    t.push({ term: f.ja, folio: FO(f.id), key: f.ja });
    if (f.alt) t.push({ term: f.alt, see: f.ja, folio: FO(f.id), key: f.alt });
    t.push({ term: f.en, folio: FO(f.id), key: f.en });
  }
  const seats = new Map();
  for (const f of factions) {
    const s = records[f.id].seat;
    if (!s || s === '不定') continue;
    if (!seats.has(s)) seats.set(s, []);
    seats.get(s).push(FO(f.id));
  }
  for (const [s, fs] of seats) t.push({ term: s, folio: fs.join('・'), key: s });
  for (const h of HOLDS) t.push({ term: h.ja + '（領）', folio: '—', key: h.ja });
  for (const p of PROVINCES) if (p.id !== 'skyrim') t.push({ term: p.ja + '（州）', folio: '—', key: p.ja });
  const ja = t.filter((x) => !/^[A-Z ,'’-]+$/.test(x.term));
  const en = t.filter((x) => /^[A-Z ,'’-]+$/.test(x.term));
  ja.sort((a, b) => a.key.localeCompare(b.key, 'ja'));
  en.sort((a, b) => a.key.localeCompare(b.key, 'en'));
  return ja.concat(en);
}
const terms = buildTerms();

// ── 三　中身を作る ─────────────────────────────
const dm = distributionMap({ factions, records, categories, size: 1500 });
const ps = plateStats();
const busts = factions.reduce((n, f) => n + (records[f.id].people ?? []).length, 0);
const stats = { pages: slots.length, busts, ...ps };

const render = (s, i) => {
  const folio = i + 1;
  const showFolio = folio > 3 ? folio : null;
  switch (s.kind) {
    case 'cover':   return M.cover();
    case 'blank':   return M.blankPage('verso');
    case 'title':   return M.titlePage();
    case 'toc':     return M.toc(s.side, s.part === 0 ? categories.slice(0, 4) : categories.slice(4), FO, showFolio);
    case 'preface': return M.preface(s.side, showFolio);
    case 'legend':  return s.side === 'verso' ? M.legendL(showFolio) : M.legendR(showFolio);
    case 'master':  return s.side === 'verso' ? M.masterL(showFolio) : M.masterR(showFolio);
    case 'mapT':    return M.mapTamriel(showFolio);
    case 'mapS':    return M.mapSkyrim(showFolio);
    case 'dist':    return s.side === 'verso' ? M.distL(dm, showFolio) : M.distR(dm, FO, showFolio);
    case 'chron':   return s.side === 'verso' ? M.chronL(FO, showFolio) : M.chronR(FO, showFolio);
    case 'catTitle': {
      const c = categories.find((x) => x.id === s.cat);
      return M.catTitle(c, edgeTab(c, false), showFolio);
    }
    case 'catOver': {
      const c = categories.find((x) => x.id === s.cat);
      return M.catOverview(c, edgeTab(c, true), FO, showFolio);
    }
    case 'e1': case 'e2': case 'e3': case 'e4': {
      // 四頁は spread2() が一度に返す。頁ごとに呼び直すと図版が四度作られる。
      const f = factions.find((x) => x.id === s.id);
      const k = +s.kind[1] - 1;
      const first = folio - k;
      const pages = spread2(f, plateOf(f), first);
      // 二頁目に錨を打つ。組織名の内部リンクはここへ飛ぶ。
      return k === 1
        ? pages[1].replace('class="sheet recto"', `class="sheet recto" id="f-${f.id}"`)
        : pages[k];
    }
    case 'relTitle':  return M.relIntroL(showFolio);
    case 'relTitle2': return M.relIntroR(showFolio);
    case 'relSheet':  return M.relSheet(REL[s.t], s.side, showFolio);
    case 'doorTable':    return M.doorTable(s.side, FO, showFolio);
    case 'peopleIndex':  return M.peopleIndex(s.side, FO, showFolio);
    case 'generalIndex': return M.generalIndex(s.side, showFolio, showFolio, terms);
    case 'notes':        return M.notesPage(s.side, s.n, showFolio);
    case 'colophon':     return M.colophon(s.side, stats, showFolio);
    default: return M.blankPage(s.side ?? 'verso');
  }
};

// 本編の見開きは spread() が二頁ぶんを一度に返す。左右で二度呼ぶと
// 図版の乱数種は同じなので、同じ図が出る。無駄だが正しい。
const body = slots.map(render).join('\n');

// ── 四　書き出し ──────────────────────────────
export function build({ bleed = 0, marks = 0, file = 'book.html' } = {}) {
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<title>タムリエル勢力誌</title>
<style>${css({ bleed, marks })}${spreadCss()}${spread2Css()}${relmapCss()}${M.matterCss()}
body { background:#d8d5cc; }
${marks ? marksCss() : ''}
</style></head><body>${body}</body></html>`;
  writeFileSync(new URL(`../out/${file}`, import.meta.url), html);
  return { pages: slots.length, file };
}

// トンボ。仕上がり線の外へ、塗り足しの分だけ離して引く。
function marksCss() {
  return `
.trim::before, .trim::after { content:''; position:absolute; pointer-events:none; }
.trim::before { left:calc(-1*var(--bleed) - var(--marks)); top:calc(-1*var(--bleed) - var(--marks));
  width:calc(var(--page-w) + (var(--bleed) + var(--marks))*2);
  height:calc(var(--page-h) + (var(--bleed) + var(--marks))*2);
  background:
    linear-gradient(#1b1b1a,#1b1b1a) left var(--marks) top calc(var(--marks) + var(--bleed)) / calc(var(--marks) - 1mm) .1mm no-repeat,
    linear-gradient(#1b1b1a,#1b1b1a) right var(--marks) top calc(var(--marks) + var(--bleed)) / calc(var(--marks) - 1mm) .1mm no-repeat,
    linear-gradient(#1b1b1a,#1b1b1a) left var(--marks) bottom calc(var(--marks) + var(--bleed)) / calc(var(--marks) - 1mm) .1mm no-repeat,
    linear-gradient(#1b1b1a,#1b1b1a) right var(--marks) bottom calc(var(--marks) + var(--bleed)) / calc(var(--marks) - 1mm) .1mm no-repeat,
    linear-gradient(#1b1b1a,#1b1b1a) left calc(var(--marks) + var(--bleed)) top var(--marks) / .1mm calc(var(--marks) - 1mm) no-repeat,
    linear-gradient(#1b1b1a,#1b1b1a) left calc(var(--marks) + var(--bleed)) bottom var(--marks) / .1mm calc(var(--marks) - 1mm) no-repeat,
    linear-gradient(#1b1b1a,#1b1b1a) right calc(var(--marks) + var(--bleed)) top var(--marks) / .1mm calc(var(--marks) - 1mm) no-repeat,
    linear-gradient(#1b1b1a,#1b1b1a) right calc(var(--marks) + var(--bleed)) bottom var(--marks) / .1mm calc(var(--marks) - 1mm) no-repeat;
}`;
}

// ── 五　しおりと内部リンクのための目録 ─────────────
export function manifest() {
  return {
    pages: slots.map((s, i) => ({ n: i + 1, kind: s.kind, id: s.id ?? null, cat: s.cat ?? null })),
    folioOf,
    outline: [
      { title: '扉', page: 3 },
      { title: '目次', page: 4 },
      { title: '序', page: 6 },
      { title: '読み方・凡例', page: 8 },
      { title: '相関図について', page: 10 },
      { title: '地図', page: 12 },
      { title: '勢力分布図', page: 14 },
      { title: '年表', page: 16 },
      ...categories.map((c) => ({
        title: `${c.n}　${c.ja}`,
        page: slots.findIndex((s) => s.kind === 'catTitle' && s.cat === c.id) + 1,
        children: byCat(c.id).map((f) => ({ title: f.ja, page: folioOf[f.id] - 1 })),
      })),
      { title: '相関図', page: slots.findIndex((s) => s.kind === 'relTitle') + 1,
        children: REL.map((t, i) => ({
          title: `${t.kind ?? '主題'} ${t.n}　${t.ja}`,
          page: slots.findIndex((s) => s.kind === 'relSheet' && s.t === i) + 1,
        })) },
      { title: '門戸・排他関係一覧', page: slots.findIndex((s) => s.kind === 'doorTable') + 1 },
      { title: '人物索引', page: slots.findIndex((s) => s.kind === 'peopleIndex') + 1 },
      { title: '総索引', page: slots.findIndex((s) => s.kind === 'generalIndex') + 1 },
      { title: '追記欄', page: slots.findIndex((s) => s.kind === 'notes') + 1 },
      { title: '奥付', page: slots.findIndex((s) => s.kind === 'colophon') + 1 },
    ],
    stats,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bleed = +(process.env.BLEED ?? 0), marks = +(process.env.MARKS ?? 0);
  const file = process.env.OUT ?? 'book.html';
  const r = build({ bleed, marks, file });
  writeFileSync(new URL('../out/manifest.json', import.meta.url), JSON.stringify(manifest(), null, 1));
  console.log(`${r.pages} 頁 → out/${r.file}　（塗り足し ${bleed}mm／トンボ ${marks}mm）`);
}
