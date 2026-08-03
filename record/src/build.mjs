// 制作記録の組版
//
// 二冊の成果物とは別の体裁にする。これは本ではなく書類だからだ。
// 一段組・行間広め・罫は細く。読み物ではなく、引くための記録として組む。

import { writeFileSync } from 'node:fs';
import * as C from './content.mjs';

const G = { pageW: 210, pageH: 297, top: 22, bottom: 24, inner: 24, outer: 20, lead: 5.4, size: 3.3 };
G.frameW = G.pageW - G.inner - G.outer;
G.frameH = G.pageH - G.top - G.bottom;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// 強調は ** で括る。記法を一つに絞っておくと、後から機械で拾える。
const em = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

// 頁は「積む」だけにして、番号は最後に振る。
// 目次の頁数を手で書くと、節を一つ足した瞬間に全部ずれる。
const pages = [];
const marks = {};
const sheet = (body, { head = '', showFolio = true, mark = null } = {}) => {
  if (mark && !(mark in marks)) marks[mark] = pages.length + 1;
  pages.push({ body, head, showFolio });
};
const render = () => pages.map((pg, i) => {
  const n = i + 1;
  return `<section class="sheet ${n % 2 ? 'recto' : 'verso'}"><div class="frame">
    ${pg.head ? `<div class="rh">${pg.head}</div>` : ''}
    ${pg.body}
    ${pg.showFolio ? `<div class="folio">${n}</div>` : ''}
  </div></section>`;
}).join('\n');

const h2 = (n, t) => `<h2><span class="hn">${n}</span>${em(t)}</h2>`;
const h3 = (t) => `<h3>${em(t)}</h3>`;
const p = (t) => `<p>${em(t)}</p>`;
const table = (cls, rows, head) =>
  `<table class="${cls}">${head ? `<thead><tr>${head.map((h) => `<th>${em(h)}</th>`).join('')}</tr></thead>` : ''}`
  + `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${em(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

// ── 表紙 ─────────────────────────────────────
sheet(`
  <div class="cover">
    <div class="cv-rule"></div>
    <h1>${C.meta.title}</h1>
    <div class="cv-sub">${C.meta.sub}</div>
    <div class="cv-rule"></div>
    <div class="cv-foot">
      <div>やりとりと工程の記録</div>
      <div class="cv-note">${em(C.meta.note)}</div>
    </div>
  </div>`, { showFolio: false });

// ── 目次 ─────────────────────────────────────
// 中身は最後に差し替える。ここでは位置を確保するだけ。
const TOC_AT = pages.length;
sheet(`${h2('', '目次')}<div id="toc-slot"></div>
  <div class="lead">
    ${p('本書は、二件の依頼について、発注から納品までの経緯を記録したものである。')}
    ${p('第一節にやりとりの時系列を、第二・第三節に各依頼の内容と工程を、'
      + '第四節に二冊の対照を、第五節以降に数値・道具・申し送りを収めた。')}
    ${p('数値はすべて成果物から機械で採ったもの、'
      + 'やりとりの日時と文言は会話の記録から採ったものである。'
      + '時刻は記録上のもの（協定世界時）で、日付は相対的に第一日・第二日と記す。')}
  </div>`, { head: '目次' });

// ── 一　時系列 ────────────────────────────────
{
  const rows = C.timeline.map((e) => [
    e.d || '', e.t || '', e.who, e.s, e.big ? 'big' : '',
  ]);
  const half = 14;
  const tl = (list) => `<table class="tl"><tbody>${list.map(([d, t, who, s, big]) =>
    `<tr class="${who === '発注' ? 'from' : 'to'} ${big ? 'big' : ''}">
      <td class="tl-d">${d}</td><td class="tl-t">${t}</td>
      <td class="tl-w">${who}</td><td class="tl-s">${em(s)}</td></tr>`).join('')}</tbody></table>`;

  sheet(`${h2('一', 'やりとりの時系列')}
    ${p('発注者からの言葉は原文のまま、受注者側の動きは要旨で記す。')}
    ${tl(rows.slice(0, half))}`, { head: '一　やりとりの時系列', mark: '一' });
  sheet(`${tl(rows.slice(half))}
    ${h3('この経緯について一点')}
    ${p('第一の依頼は、当初 PDF の受け渡しから始まった。'
      + '端末の都合で PDF が共有できず、仕様書は写真で受け取っている。'
      + '四枚＋五枚＋三枚、計十二枚の写真がすべての起点である。')}
    ${p('第二日の 08:14 に「私への確認は本当に判断が必要な場合だけに」との指示を受け、'
      + '以降は確認を求めずに完成まで進めた。'
      + '判断を要した箇所は、その都度この記録と納品書に残してある。')}`,
    { head: '一　やりとりの時系列' });
}

// ── 二　第一の依頼 ──────────────────────────────
{
  const W = C.work1;
  sheet(`${h2('二', `第一の依頼　${W.title}`)}
    <blockquote>${em(W.line)}</blockquote>
    <div class="qnote">${em(W.lineNote)}</div>
    ${h3('前提となる設定')}
    ${table('kv', W.setting)}
    ${h3('守るべき制約')}
    ${table('kv', W.constraints)}`, { head: '二　第一の依頼', mark: '二' });

  sheet(`${h3(W.core.h)}
    ${W.core.p.map(p).join('')}
    ${h3(W.extra.h)}
    <blockquote class="small">${em(W.extra.q)}</blockquote>
    ${p(W.extra.p)}
    ${h3('工程')}
    ${table('steps', W.steps)}`, { head: '二　第一の依頼' });

  sheet(`${h3('つまずきと解決')}
    ${p('目視では見つからないものが多い。以下はいずれも機械検査で拾ったか、'
      + '刷り見本を並べて初めて見えたものである。')}
    ${table('tr3', W.troubles, ['現象', '原因', '処置'])}
    ${h3('納品')}
    ${table('kv', W.result)}
    ${p('第一の依頼は、この時点で発注者より'
      + '「本当に素晴らしい出来栄えで大変満足しております」との評価を受け、'
      + '続けて第二の依頼が提示された。')}`, { head: '二　第一の依頼' });
}

// ── 三　第二の依頼 ──────────────────────────────
{
  const W = C.work2;
  sheet(`${h2('三', `第二の依頼　${W.title}`)}
    <blockquote>${em(W.line)}</blockquote>
    <div class="qnote">${em(W.lineNote)}</div>
    ${h3('発注者からの二点の変更指示')}
    ${table('tr2', W.changes, ['指示', '対応'])}`, { head: '三　第二の依頼', mark: '三' });

  sheet(`${h3(W.core.h)}
    ${W.core.p.map(p).join('')}
    ${h3('工程')}
    ${table('steps', W.steps)}`, { head: '三　第二の依頼' });

  sheet(`${h3('つまずきと解決')}
    ${table('tr3', W.troubles, ['現象', '原因', '処置'])}
    ${h3('納品')}
    ${table('kv', W.result)}
    ${p('あわせて、紋章四十九点の個別ベクター（分類色版・墨版の二種）、'
      + '図版データ四百四十一点、版面データ、使用書体一覧、納品書を納めた。')}`, { head: '三　第二の依頼' });
}

// ── 四　対照 ─────────────────────────────────
sheet(`${h2('四', '二冊の対照')}
  ${p('第二の依頼には「二冊並べたとき、明確に別の時代・別の目的の本に見えること」'
    + 'という要件があった。対比を一つの層だけで作ると、'
    + '「同じ本の別の版」にしか見えない。判型から時制まで、十一の層すべてで隔てた。')}
  ${table('tr3', C.contrast, ['層', '『暁の砕き手』', '『タムリエル勢力誌』'])}
  ${p('同じ世界を扱いながら、**紙を触った瞬間に別の本だと分かる**状態を目標とした。')}`,
  { head: '四　二冊の対照', mark: '四' });

// ── 五・六 ────────────────────────────────────
sheet(`${h2('五', '数字')}
  ${table('kv', C.numbers)}
  ${h2('六', '道具と再現手順')}
  ${table('kv', C.tools)}
  ${h3('再現')}
  ${table('kv', C.repro)}
  ${p('図版はすべて決定論的乱数で生成しているため、再ビルドしても同じ図が出る。')}`,
  { head: '五　数字／六　道具', mark: '五' });

// ── 七　申し送り ───────────────────────────────
sheet(`${h2('七', '申し送り')}
  ${C.notes.map((n) => h3(n.h) + p(n.p)).join('')}
  <div class="end">以上</div>`, { head: '七　申し送り', mark: '七' });

// ── 体裁 ─────────────────────────────────────
const css = `
@page { size: ${G.pageW}mm ${G.pageH}mm; margin: 0; }
* { margin:0; padding:0; box-sizing:border-box; }
:root {
  --ink:#1f1e1b; --mid:#5b584f; --weak:#8b877c; --rule:#cdc9be; --paper:#f6f4ee;
  --accent:#6b563a;
}
html, body { background:#dcd9d0; }
body { font-family:'Noto Serif JP', serif; font-size:${G.size}mm; line-height:${G.lead}mm;
       color:var(--ink); text-align:justify; word-break:normal; line-break:strict;
       -webkit-font-smoothing:antialiased; }
.sheet { position:relative; width:${G.pageW}mm; height:${G.pageH}mm; background:var(--paper);
         overflow:hidden; page-break-after:always; }
.sheet:last-child { page-break-after:auto; }
.frame { position:absolute; top:${G.top}mm; width:${G.frameW}mm; height:${G.frameH}mm; }
.recto .frame { left:${G.inner}mm; } .verso .frame { left:${G.outer}mm; }

.rh { position:absolute; top:-10mm; width:100%; font-size:2.5mm; letter-spacing:.18em;
      color:var(--weak); border-bottom:.25mm solid var(--rule); padding-bottom:1.6mm; }
.verso .rh { text-align:right; }
.folio { position:absolute; bottom:-13mm; font-family:'EB Garamond','Noto Serif JP',serif;
         font-size:3mm; color:var(--mid); }
.recto .folio { right:0; } .verso .folio { left:0; }

h1 { font-size:14mm; line-height:1.4; font-weight:600; letter-spacing:.16em; }
h2 { font-size:5.6mm; line-height:${G.lead * 2}mm; font-weight:600; letter-spacing:.08em;
     margin:0 0 ${G.lead * 0.8}mm; display:flex; align-items:baseline; gap:5mm; }
h2 + h2, table + h2, p + h2 { margin-top:${G.lead * 2}mm; }
.hn { font-family:'EB Garamond','Noto Serif JP',serif; font-size:4mm; color:var(--accent);
      letter-spacing:.1em; }
h3 { font-size:3.7mm; font-weight:600; letter-spacing:.05em;
     margin:${G.lead * 1.4}mm 0 ${G.lead * 0.5}mm; padding-left:3mm;
     border-left:.7mm solid var(--accent); }
h3:first-child { margin-top:0; }
p { font-size:${G.size}mm; line-height:${G.lead * 1.16}mm; text-indent:1em;
    margin-bottom:${G.lead * 0.5}mm; }
b { font-weight:600; }

blockquote { font-size:4mm; line-height:${G.lead * 1.5}mm; font-weight:500;
             border-left:.8mm solid var(--accent); padding:1.5mm 0 1.5mm 5mm;
             margin:${G.lead * 0.6}mm 0; text-indent:0; }
blockquote.small { font-size:3.4mm; font-weight:400; color:var(--mid); }
.qnote { font-size:2.9mm; line-height:${G.lead * 0.88}mm; color:var(--mid);
         margin-bottom:${G.lead}mm; }

table { width:100%; border-collapse:collapse; margin:${G.lead * 0.4}mm 0 ${G.lead * 0.9}mm; }
th { font-size:2.5mm; font-weight:400; letter-spacing:.12em; color:var(--weak); text-align:left;
     border-bottom:.5mm solid var(--ink); padding-bottom:1.2mm; }
td { font-size:2.95mm; line-height:${G.lead * 0.84}mm; padding:1.5mm 2mm 1.5mm 0;
     border-bottom:.15mm solid var(--rule); vertical-align:top; }
td:last-child { padding-right:0; }
table.kv td:first-child { width:34mm; color:var(--mid); }
table.steps td:first-child { width:8mm; font-family:'EB Garamond','Noto Serif JP',serif;
                             color:var(--accent); }
table.steps td:nth-child(2) { width:64mm; font-weight:500; }
table.tr2 td:first-child { width:62mm; font-weight:500; }
table.tr3 td { width:33%; }
table.tr3 td:first-child { font-weight:500; }

table.tl td { padding:1.8mm 2mm 1.8mm 0; }
.tl-d { width:12mm; font-size:2.5mm; color:var(--accent); letter-spacing:.1em; }
.tl-t { width:12mm; font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.7mm; color:var(--mid); }
.tl-w { width:12mm; font-size:2.4mm; letter-spacing:.1em; color:var(--weak); }
tr.from .tl-w { color:var(--accent); }
tr.from .tl-s { font-weight:500; }
tr.to .tl-s { color:var(--mid); }
tr.big td { background:#efe9da; }
tr.big .tl-d, tr.big .tl-t, tr.big .tl-w { background:#efe9da; }

.toc { list-style:none; margin-bottom:${G.lead * 2}mm; }
.toc li { display:flex; align-items:baseline; font-size:3.2mm; line-height:${G.lead * 1.3}mm; }
.tn { width:8mm; font-family:'EB Garamond','Noto Serif JP',serif; color:var(--accent); }
.dots { flex:1; border-bottom:.15mm dotted var(--rule); margin:0 2mm; transform:translateY(-1mm); }
.tp { font-family:'EB Garamond','Noto Serif JP',serif; color:var(--mid); }
.lead p { color:var(--mid); font-size:3.05mm; }

.cover { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; }
.cv-rule { width:100%; height:.5mm; background:var(--ink); }
.cover h1 { margin:10mm 0 4mm; }
.cv-sub { font-size:4.2mm; letter-spacing:.14em; color:var(--mid); margin-bottom:10mm; }
.cv-foot { position:absolute; bottom:0; font-size:3.2mm; letter-spacing:.16em; }
.cv-note { font-size:2.8mm; color:var(--weak); letter-spacing:.06em; margin-top:2mm; }
.end { margin-top:${G.lead * 2}mm; text-align:right; font-size:3mm; letter-spacing:.3em; color:var(--mid); }
`;

const toc = [
  ['一', 'やりとりの時系列', marks['一']],
  ['二', `第一の依頼　${C.work1.title}`, marks['二']],
  ['三', `第二の依頼　${C.work2.title}`, marks['三']],
  ['四', '二冊の対照', marks['四']],
  ['五', '数字／六　道具と再現手順', marks['五']],
  ['七', '申し送り', marks['七']],
];
pages[TOC_AT].body = pages[TOC_AT].body.replace('<div id="toc-slot"></div>',
  `<ul class="toc">${toc.map(([n, t, pg]) =>
    `<li><span class="tn">${n}</span><span class="tt">${em(t)}</span>`
    + `<span class="dots"></span><span class="tp">${pg}</span></li>`).join('')}</ul>`);

writeFileSync(new URL('../out/record.html', import.meta.url),
  `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>制作記録</title>
<style>${css}</style></head><body>${render()}</body></html>`);

// しおり。目次と同じ数字から作る。二度数えない。
const outline = [{ title: '目次', page: TOC_AT + 1 }].concat(
  toc.map(([n, t, pg]) => ({ title: `${n}　${t}`, page: pg })));
writeFileSync(new URL('../out/outline.json', import.meta.url),
  JSON.stringify({ outline, pages: pages.length }, null, 1));

console.log(`${pages.length} 頁 → out/record.html`);
