// 組版のビルド
//   node src/build.mjs           → out/screen.html
//   node src/build.mjs print     → out/print.html（塗り足し3mm・トンボ付き）

import { writeFileSync, mkdirSync } from 'node:fs';
import { pages, meta, wormTrack } from './content.mjs';
import { makeRng, inline, penned, laterHand } from './typeset.mjs';
import { ground, ruling, worms, waterStain, burn, stains, tailpiece, marginalia, tally } from './materials.mjs';
import { miniatures } from './miniatures.mjs';
import { M, css } from './style.mjs';

const arg = process.argv[2];
const mode = arg === 'print' ? 'print' : (arg === 'grounds' ? 'grounds' : 'screen');

// ── 筆跡の乱れ。物語が進むにつれて手が乱れる。 ──────────────
// 葉ごとの指定があればそれを、なければ経年から緩く導く。
const handOf = (p, i) => p.hand ?? Math.max(0, (i - 12) / 30) * 0.55;

// ── 塊の組版 ────────────────────────────────────────
function block(b, ctx) {
  const { rng, hand, page } = ctx;
  switch (b.t) {
    case 'space':  return `<div style="height:calc(var(--lead) * ${b.h})"></div>`;
    case 'gap':    return `<div class="gap"></div>`;

    case 'p': {
      const cls = ['', b.em ? 'ink-heavy' : '', b.overrun ? 'overrun' : ''].filter(Boolean).join(' ');
      return `<p class="${cls}">${inline(b.text, rng, hand)}</p>`;
    }

    case 'dc': {
      const dcp = page.dropcap;
      const capCls = dcp.color === 'blue' ? 'dc-cap blue' : 'dc-cap';
      return `<div class="dc-wrap">`
        + `<span class="${capCls}">${dropcapPen(dcp, rng)}${dcp.char}</span>`
        + `<p class="dc">${inline(b.text, rng, hand)}</p></div>`;
    }

    case 'speech': {
      const cls = ['speech', b.gilded ? 'gilded' : '', b.tone === 'dark' ? 'tone-dark' : ''].filter(Boolean).join(' ');
      const who = b.who ? `<span class="who">${inline(b.who, rng, hand)}</span>` : '';
      return `<p class="${cls}">${who}「${inline(b.text, rng, hand)}」</p>`;
    }

    case 'cast':
      return `<p class="cast"><span class="nm">${inline(b.name, rng, hand)}</span>${inline(b.body, rng, hand)}</p>`;

    case 'h1':
      return `<h1 class="${b.tone === 'dark' ? 'tone-dark' : ''}">${inline(b.text, rng, hand * 0.4)}</h1>`;
    case 'h2':
      return `<h2>${inline(b.text, rng, hand * 0.4)}</h2>`;
    case 'actLabel':
      return `<div class="act-label">${inline(b.text, rng, 0)}</div>`;

    case 'note':   return `<p class="note">${inline(b.text, rng, hand)}</p>`;
    case 'sign':   return `<p class="sign">${inline(b.text, rng, hand)}</p>`;
    case 'colophon':
      return `<p class="colophon">${b.text.split('\n').map(l => inline(l, rng, hand)).join('<br>')}</p>`;
    case 'hand':
      return `<p class="hand">${b.text.split('\n').map(l => inline(l, rng, 0)).join('<br>')}</p>`;

    case 'ruleOrnament':
      return tailpiece(page.id, page.tone);

    // ── 表紙・扉 ──
    case 'coverTitle': return `<p class="cover-title">${penned(b.text, rng, 0.10)}</p>`;
    case 'coverLatin': return `<p class="cover-latin">${b.text}</p>`;
    case 'coverRule':  return `<div class="cover-rule"></div>`;
    case 'coverSub':   return `<p class="cover-sub">${penned(b.text, rng, 0.12)}</p>`;
    case 'titleMain':  return `<p class="title-main">${penned(b.text, rng, 0.10)}</p>`;
    case 'titleRule':  return `<div class="title-rule"></div>`;
    case 'titleSub':   return `<p class="title-sub">${penned(b.text, rng, 0.14)}</p>`;
    case 'titleBy':    return `<p class="title-by">${penned(b.text, rng, 0.14)}</p>`;

    // ── 補遺（近代の刷り物） ──
    case 'opJournal':  return `<div class="op-journal">${b.text}</div>`;
    case 'opTitle':    return `<div class="op-title">${b.text}</div>`;
    case 'opSub':      return `<div class="op-sub">${b.text}</div>`;
    case 'opRule':     return `<div class="op-rule"></div>`;
    case 'opAbstract': return `<div class="op-abstract">${b.text}</div>`;
    case 'opNote':     return `<div class="op-note">${b.text}</div>`;
    case 'opH':        return `<div class="op-h">${b.text}</div>`;
    case 'opP':        return `<p>${b.text}</p>`;
    case 'opSign':     return `<div class="op-sign">${b.text}</div>`;
    case 'opTable':
      return `<table class="op-table"><thead><tr>${b.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>`
           + `<tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

    default: return '';
  }
}

// 装飾頭文字を囲む簡素な蔓。頭文字より格を落とす。
function dropcapPen(dcp, rng) {
  const col = dcp.color === 'blue' ? '#2f4478' : '#8d3a24';
  const j = () => (rng() - 0.5) * 2;
  return `<svg class="dc-pen" viewBox="0 0 40 56" aria-hidden="true">
    <g fill="none" stroke="${col}" stroke-width="0.55" opacity="0.42" stroke-linecap="round">
      <path d="M3 4 C ${8 + j()} 2, ${30 + j()} 2, 37 4"/>
      <path d="M3 52 C ${9 + j()} 54, ${31 + j()} 54, 37 52"/>
      <path d="M2.4 6 C 0.6 16, 0.6 40, 2.4 50"/>
      <path d="M37.6 6 C 39.4 16, 39.4 40, 37.6 50"/>
      <path d="M3 4 C 6 8, 5 12, 2.6 13"/>
      <path d="M37 52 C 34 48, 35 44, 37.4 43"/>
    </g>
  </svg>`;
}

// 地紋は焼き込み済みのものを貼る（grounds モードで先に焼く）。
function groundLayer(n, age, isRecto, tone) {
  const f = String(n).padStart(2, '0');
  return `<img class="ground" src="assets/ground-${f}.jpg" alt="">`;
}

// ── 一葉 ──────────────────────────────────────────
function sheet(p, i) {
  const n = i + 1;
  const isRecto = n % 2 === 1;                 // 奇数丁を右（表）とする
  const rng = makeRng(p.id + '|seed');
  const hand = handOf(p, i);
  const age = p.age ?? 0.4;
  const ctx = { rng, hand, page: p };

  // 補遺は写本ではない。別の紙・別の版で組む。
  if (p.kind === 'offprint') {
    const body = p.blocks.map(b => block(b, ctx)).join('\n');
    return `<section class="sheet ${isRecto ? 'recto' : 'verso'}">
  <div class="bleedbox">${groundLayer(n, 0.5, isRecto, null)}</div>
  <div class="trimbox">
    <div class="offprint-leaf"></div>
    <div class="offprint">${body}<div class="op-folio">— ${n - 28} —</div></div>
  </div>
  ${mode === 'print' ? trimMarks() : ''}
</section>`;
  }

  let body = p.blocks.map(b => block(b, ctx)).join('\n');

  if (p.kind === 'plate' && p.miniature) {
    const mini = miniatures[p.miniature]();
    body = `<div class="plate-mini">${mini}</div><div class="plate-head">${body}</div>`;
  }

  // 余白の書き込み
  const margs = (p.marginalia || []).map(m => {
    const cls = m.side === 'bottom' ? 'marg side-bottom' : 'marg side-outer';
    const pos = m.side === 'bottom'
      ? `left:${(m.left * 100).toFixed(1)}%`
      : `top:${(m.top * 100).toFixed(1)}%`;
    return `<div class="${cls}" style="${pos}">${marginalia(m.kind, p.id)}</div>`;
  }).join('');

  const margNote = p.margNote
    ? `<div class="marg-note" style="top:${(p.margNote.top * 100).toFixed(1)}%">${penned(p.margNote.text, rng, 0.5)}</div>`
    : '';

  // 後年の別筆
  const laters = (p.later || []).map(l => {
    const cls = l.side === 'bottom' ? 'later side-bottom' : 'later';
    const by = l.by ? `<span class="by">${l.by}</span>` : '';
    return `<div class="${cls}" style="top:${(l.top * 100).toFixed(1)}%">${by}${laterHand(l.text, rng)}</div>`;
  }).join('');

  const tallyEl = p.tally
    ? `<div class="tallymark-wrap" style="position:absolute;z-index:4;top:${(p.tally.top * 100).toFixed(1)}%;${isRecto ? 'right:3mm' : 'left:3mm'}">${tally(p.tally.count, p.tally.lost, p.id)}</div>`
    : '';

  // ノンブル。表紙と見返しには振らない。
  const folio = (p.kind === 'cover' || i < 2) ? '' : `<div class="folio">${n}</div>`;

  const showRuling = p.kind === 'text' || p.kind === 'plate';

  return `<section class="sheet ${isRecto ? 'recto' : 'verso'}">
  <div class="bleedbox">
    ${groundLayer(n, age, isRecto, p.tone)}
    ${burn(n, p.burn, isRecto)}
  </div>
  <div class="trimbox">
    ${showRuling ? ruling(n, { x: isRecto ? M.inner : M.outer, y: M.top + M.ruleOffset, w: M.frameW, h: (M.lines - 1) * M.lead }, M.lead) : ''}
    <div class="content">
      <div class="frame">${body}</div>
      ${margs}${margNote}${laters}${tallyEl}${folio}
    </div>
    ${waterStain(n, p.water)}
    ${worms(n, wormTrack, null)}
    ${stains(n, age)}
  </div>
  ${mode === 'print' ? trimMarks() : ''}
</section>`;
}

// ── トンボ ────────────────────────────────────────
// 塗り足し3mm、マーク長5mm、仕上がり線から3mm外に置く。
function trimMarks() {
  const mk = 8, bl = 3, W = M.trimW, H = M.trimH;
  const totalW = W + (mk + bl) * 2, totalH = H + (mk + bl) * 2;
  const x0 = mk + bl, y0 = mk + bl, x1 = x0 + W, y1 = y0 + H;
  const L = 5, off = 3;   // 仕上がりから 3mm 離してマークを置く
  const line = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  let g = '';
  // 角トンボ（二重）
  for (const [X, sx] of [[x0, -1], [x1, 1]]) {
    for (const [Y, sy] of [[y0, -1], [y1, 1]]) {
      g += line(X, Y + sy * off, X, Y + sy * (off + L));
      g += line(X + sx * off, Y, X + sx * (off + L), Y);
      g += line(X + sx * bl, Y + sy * (off + 1), X + sx * bl, Y + sy * (off + L));
      g += line(X + sx * (off + 1), Y + sy * bl, X + sx * (off + L), Y + sy * bl);
    }
  }
  // センタートンボ
  const cx = x0 + W / 2, cy = y0 + H / 2;
  g += line(cx, y0 - off, cx, y0 - off - L) + line(cx, y1 + off, cx, y1 + off + L);
  g += line(x0 - off, cy, x0 - off - L, cy) + line(x1 + off, cy, x1 + off + L, cy);
  g += `<circle cx="${cx}" cy="${y0 - off - L / 2}" r="1.1" fill="none"/>`;
  g += `<circle cx="${cx}" cy="${y1 + off + L / 2}" r="1.1" fill="none"/>`;
  return `<svg class="marks" viewBox="0 0 ${totalW} ${totalH}">
    <g stroke="#000" stroke-width="0.12" fill="none">${g}</g></svg>`;
}

// ── 出力 ──────────────────────────────────────────
if (mode === 'grounds') {
  const tiles = pages.map((p, i) => {
    const n = i + 1;
    return `<div class="tile">${ground(n, p.age ?? 0.4, n % 2 === 1, p.tone)}</div>`;
  }).join('\n');
  const g = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0}
    .tile{position:relative;width:148mm;height:210mm;overflow:hidden}
    .tile svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
  </style></head><body>${tiles}</body></html>`;
  mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../out/grounds.html', import.meta.url), g);
  console.log(`地紋 ${pages.length} 葉 → out/grounds.html`);
  process.exit(0);
}

const html = `<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8">
<title>${meta.title}　${meta.subtitle}</title>
<style>${css(mode)}</style>
</head>
<body>
${pages.map(sheet).join('\n')}
</body></html>`;

mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
const outPath = new URL(`../out/${mode}.html`, import.meta.url);
writeFileSync(outPath, html);
console.log(`${mode}: ${pages.length} 丁  →  out/${mode}.html  (${(html.length / 1024).toFixed(0)} KB)`);
