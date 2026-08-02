// 材質と損傷の生成
//
// 既製の「羊皮紙テクスチャ」は使わない（仕様書 7）。
// 地色・繊維・毛穴・黄変・虫損・水損・焼損はすべて、
// 葉ごとに異なる種から手続き的に生成する。同じ葉は二つとない。

import { makeRng } from './typeset.mjs';

// ── 不定形の閉曲線 ──────────────────────────────────────
// 円をもとに半径を乱し、Catmull-Rom で滑らかに閉じる。
// 虫損・水損・焼損の輪郭はすべてこれで作る。
// irr は大きなうねり（形の骨格）、fine は縁の毛羽立ち。
// 両方を同じ乱数で作ると、点数を増やしたときに歯車になる。
// うねりは少数の正弦波で、毛羽立ちは点ごとの乱数で作る。
export function blob(cx, cy, r, rng, { n = 16, irr = 0.34, ry = null, fine = 0 } = {}) {
  const RY = ry ?? r;
  const harm = [1, 2, 3, 5].map((k) => ({ k, amp: rng() * 2 - 1, ph: rng() * Math.PI * 2 }));
  const norm = harm.reduce((t, h) => t + Math.abs(h.amp), 0) || 1;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const low = harm.reduce((t, h) => t + h.amp * Math.sin(h.k * a + h.ph), 0) / norm;
    const k = 1 + low * irr + (rng() - 0.5) * 2 * fine;
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * RY * k]);
  }
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d + ' Z';
}

// ── 羊皮紙の地 ────────────────────────────────────────
// age: 0（新しい）〜1（古い）。全面を均一に汚さない。
// 濃くなるのは触られた場所——小口と、下端の外角だけ。
export function ground(pageIndex, age, isRecto, tone) {
  const s = pageIndex * 977 + 13;
  const rng = makeRng('ground' + pageIndex);
  const outer = isRecto ? 'right' : 'left';       // 小口の側
  const y = 100 - age * 6;

  // 大きな斑（漉きむら）を数点。位置は葉ごとに違う。
  let blotches = '';
  const nb = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < nb; i++) {
    const cx = rng() * 148, cy = rng() * 210;
    const r = 14 + rng() * 40;
    blotches += `<path d="${blob(cx, cy, r, rng, { n: 12, irr: 0.42 })}" fill="url(#blotch${pageIndex})" opacity="${(0.05 + rng() * 0.07).toFixed(3)}"/>`;
  }

  // 毛穴。仔羊の皮の粒。
  let pores = '';
  const np = 90 + Math.floor(rng() * 60);
  for (let i = 0; i < np; i++) {
    const cx = (rng() * 148).toFixed(1), cy = (rng() * 210).toFixed(1);
    const r = (0.18 + rng() * 0.34).toFixed(2);
    pores += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#6b5535" opacity="${(0.05 + rng() * 0.10).toFixed(3)}"/>`;
  }

  const base = tone === 'dark' ? '#e3dac4' : '#e9e1cd';

  return `
<svg class="ground" viewBox="0 0 148 210" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <filter id="fib${pageIndex}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.62 0.09" numOctaves="4" seed="${s}" result="t"/>
      <feColorMatrix in="t" type="matrix"
        values="0 0 0 0 0.42  0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0.34 0"/>
    </filter>
    <filter id="cloud${pageIndex}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="4" seed="${s + 7}" result="t"/>
      <feColorMatrix in="t" type="matrix"
        values="0 0 0 0 0.47  0 0 0 0 0.39  0 0 0 0 0.24  0 0 0 0.5 -0.16"/>
    </filter>
    <radialGradient id="blotch${pageIndex}">
      <stop offset="0%" stop-color="#8a7448"/><stop offset="100%" stop-color="#8a7448" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="edge${pageIndex}" x1="${outer === 'right' ? 1 : 0}" y1="0" x2="${outer === 'right' ? 0 : 1}" y2="0">
      <stop offset="0%"  stop-color="#7d6537" stop-opacity="${(0.20 + age * 0.20).toFixed(2)}"/>
      <stop offset="6%"  stop-color="#7d6537" stop-opacity="${(0.07 + age * 0.09).toFixed(2)}"/>
      <stop offset="22%" stop-color="#7d6537" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="thumb${pageIndex}" cx="${outer === 'right' ? 1 : 0}" cy="1" r="0.42">
      <stop offset="0%"  stop-color="#6f5930" stop-opacity="${(0.16 + age * 0.26).toFixed(2)}"/>
      <stop offset="55%" stop-color="#6f5930" stop-opacity="${(0.05 + age * 0.08).toFixed(2)}"/>
      <stop offset="100%" stop-color="#6f5930" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="148" height="210" fill="${base}"/>
  <rect width="148" height="210" filter="url(#cloud${pageIndex})" opacity="${(0.30 + age * 0.26).toFixed(2)}"/>
  ${blotches}
  <rect width="148" height="210" filter="url(#fib${pageIndex})" opacity="0.30" style="mix-blend-mode:multiply"/>
  <g opacity="${(0.55 + age * 0.4).toFixed(2)}">${pores}</g>
  <rect width="148" height="210" fill="url(#edge${pageIndex})"/>
  <rect width="148" height="210" fill="url(#thumb${pageIndex})"/>
</svg>`;
}

// ── 罫線 ─────────────────────────────────────────────
// 薄く残す。本文の墨は、ところどころこれをはみ出す。
export function ruling(pageIndex, frame, lead) {
  const rng = makeRng('rule' + pageIndex);
  const { x, y, w, h } = frame;
  let lines = '';
  for (let yy = y; yy <= y + h + 0.01; yy += lead) {
    const jx = (rng() - 0.5) * 0.5;
    const jy = (rng() - 0.5) * 0.18;
    const w2 = w + (rng() - 0.5) * 1.6;
    lines += `<line x1="${(x + jx).toFixed(2)}" y1="${(yy + jy).toFixed(2)}" x2="${(x + jx + w2).toFixed(2)}" y2="${(yy + jy + (rng() - 0.5) * 0.3).toFixed(2)}"/>`;
  }
  // 版面を囲む縦罫（bounding lines）。写本では本文より先に引かれる。
  const vx1 = x - 2.6, vx2 = x + w + 2.6;
  const vtop = y - 5, vbot = y + h + 5;
  return `
<svg class="ruling" viewBox="0 0 148 210" preserveAspectRatio="none" aria-hidden="true">
  <g stroke="#9a7f52" stroke-width="0.09" opacity="0.34">${lines}</g>
  <g stroke="#9a7f52" stroke-width="0.11" opacity="0.42">
    <line x1="${vx1}" y1="${vtop}" x2="${vx1}" y2="${vbot}"/>
    <line x1="${vx2}" y1="${vtop}" x2="${vx2}" y2="${vbot}"/>
  </g>
</svg>`;
}

// ── 虫損 ─────────────────────────────────────────────
// 一葉だけに空くことはない。虫は綴じを貫いて食い進む。
export function worms(pageIndex, track, frame) {
  if (!track.pages.includes(pageIndex)) return '';
  const step = track.pages.indexOf(pageIndex);
  const rng = makeRng('worm' + pageIndex);
  let out = '';
  for (const h of track.holes) {
    const cx = (h.x + h.drift[0] * step) * 148;
    const cy = (h.y + h.drift[1] * step) * 210;
    const r = h.r * (0.95 + 0.5 * Math.sin(step * 0.9 + 1));
    // 縁は繊維が毛羽立って明るく、内側は次の葉が透けて暗い
    out += `<path d="${blob(cx, cy, r * 1.22, rng, { n: 24, irr: 0.22, fine: 0.05 })}" fill="#c4b189" opacity="0.55"/>`;
    out += `<path d="${blob(cx, cy, r, rng, { n: 26, irr: 0.24, fine: 0.06 })}" fill="#40351f" opacity="0.92"/>`;
    out += `<path d="${blob(cx, cy, r * 0.66, rng, { n: 20, irr: 0.28, fine: 0.05 })}" fill="#1e1810" opacity="0.95"/>`;
  }
  return `<svg class="worms" viewBox="0 0 148 210" preserveAspectRatio="none" aria-hidden="true">${out}</svg>`;
}

// ── 水損 ─────────────────────────────────────────────
// 縁に沈着線（tide line）が残る。中央は薄く、輪郭が濃い。
export function waterStain(pageIndex, spec) {
  if (!spec) return '';
  const rng = makeRng('water' + pageIndex);
  const cx = spec.x * 148, cy = spec.y * 210;
  const rx = spec.rx * 148 * 0.5, ry = spec.ry * 210 * 0.5;
  const outerP = blob(cx, cy, rx, rng, { n: 30, irr: 0.28, ry, fine: 0.020 });
  const innerP = blob(cx, cy, rx * 0.72, rng, { n: 28, irr: 0.32, ry: ry * 0.72, fine: 0.025 });
  const coreP  = blob(cx, cy, rx * 0.4, rng, { n: 20, irr: 0.36, ry: ry * 0.4, fine: 0.03 });
  return `
<svg class="water" viewBox="0 0 148 210" preserveAspectRatio="none" aria-hidden="true">
  <path d="${outerP}" fill="#9d8148" opacity="0.10"/>
  <path d="${outerP}" fill="none" stroke="#8a6d36" stroke-width="0.7" opacity="0.30"/>
  <path d="${innerP}" fill="#9d8148" opacity="0.09"/>
  <path d="${innerP}" fill="none" stroke="#8a6d36" stroke-width="0.45" opacity="0.22"/>
  <path d="${coreP}"  fill="#8f7440" opacity="0.07"/>
</svg>`;
}

// ── 焼損 ─────────────────────────────────────────────
// 一箇所のみ。書物を焼いた場面の丁。火の粉は外からではなく、
// 書写している手元から飛んだ。
export function burn(pageIndex, spec, isRecto) {
  if (!spec) return '';
  const rng = makeRng('burn' + pageIndex);
  const outerX = isRecto ? 148 : 0;
  const top = spec.edge.includes('top');
  const cy = top ? 210 * 0.16 : 210 * 0.80;
  const R = 210 * spec.spread * 0.5;

  // 点を多く取り、振れ幅を抑える。少ない点を大きく振ると、雲になる。
  const lost   = blob(outerX, cy, R * 0.60, rng, { n: 56, irr: 0.30, fine: 0.055 }); // 焼け落ちて無い
  const char   = blob(outerX, cy, R * 0.72, rng, { n: 52, irr: 0.28, fine: 0.045 }); // 炭化。縁は細い帯。
  const scorch = blob(outerX, cy, R * 0.88, rng, { n: 40, irr: 0.26, fine: 0.030 }); // 焦げ
  const heat   = blob(outerX, cy, R * 1.06, rng, { n: 30, irr: 0.22, fine: 0.015 }); // 熱で黄ばんだ縁

  // 火の粉が飛んで空いた小穴をいくつか
  let sparks = '';
  for (let i = 0; i < 5; i++) {
    const a = rng() * Math.PI * 2;
    const d = R * (1.1 + rng() * 0.9);
    const sx = outerX + Math.cos(a) * d * (isRecto ? -1 : 1) * (rng() > 0.5 ? 1 : 0.6);
    const sy = cy + Math.sin(a) * d;
    if (sx < 4 || sx > 144 || sy < 4 || sy > 206) continue;
    const r = 0.35 + rng() * 0.85;
    sparks += `<path d="${blob(sx, sy, r * 1.7, rng, { n: 10, irr: 0.4 })}" fill="#6b4519" opacity="0.30"/>`;
    sparks += `<path d="${blob(sx, sy, r, rng, { n: 10, irr: 0.45 })}" fill="#2a1a0b" opacity="0.72"/>`;
  }

  return `
<svg class="burn" viewBox="0 0 148 210" preserveAspectRatio="none" aria-hidden="true">
  <path d="${heat}"   fill="#c5a469" opacity="0.20"/>
  <path d="${scorch}" fill="#93672a" opacity="0.40"/>
  <path d="${char}"   fill="#3d2510" opacity="0.88"/>
  <path d="${lost}"   fill="#120c07" opacity="0.97"/>
  <path d="${lost}"   fill="none" stroke="#000" stroke-width="0.5" opacity="0.55"/>
  ${sparks}
</svg>`;
}

// ── 蝋・脂・雫 ────────────────────────────────────────
// 数箇所のみ。やりすぎない。
export function stains(pageIndex, age) {
  if (age < 0.3) return '';
  const rng = makeRng('stain' + pageIndex);
  if (rng() > 0.42) return '';
  const cx = 18 + rng() * 112, cy = 24 + rng() * 162;
  const r = 1.4 + rng() * 3.2;
  const wax = rng() > 0.5;
  const col = wax ? '#cbb98d' : '#8d7443';
  let drips = '';
  if (wax) {
    for (let i = 0; i < 2 + Math.floor(rng() * 2); i++) {
      const dx = cx + (rng() - 0.5) * 9, dy = cy + r + rng() * 7;
      drips += `<path d="${blob(dx, dy, 0.6 + rng() * 1.1, rng, { n: 9, irr: 0.4 })}" fill="${col}" opacity="0.30"/>`;
    }
  }
  return `
<svg class="stain" viewBox="0 0 148 210" preserveAspectRatio="none" aria-hidden="true">
  <path d="${blob(cx, cy, r, rng, { n: 14, irr: 0.36 })}" fill="${col}" opacity="${wax ? 0.26 : 0.13}"/>
  <path d="${blob(cx, cy, r, rng, { n: 14, irr: 0.36 })}" fill="none" stroke="${col}" stroke-width="0.4" opacity="0.28"/>
  ${drips}
</svg>`;
}

// ── 章末の線飾り ───────────────────────────────────────
// 簡素なもののみ（仕様書 4-4）。
export function tailpiece(seed, tone) {
  const rng = makeRng('tail' + seed);
  const col = tone === 'dark' ? '#2f4478' : '#8d3a24';
  let dots = '';
  for (let i = 0; i < 3; i++) {
    dots += `<circle cx="${34 + i * 6}" cy="4" r="${(0.5 + rng() * 0.25).toFixed(2)}" fill="${col}" opacity="0.75"/>`;
  }
  return `
<svg class="tail" viewBox="0 0 80 8" aria-hidden="true">
  <line x1="2" y1="4" x2="28" y2="4" stroke="${col}" stroke-width="0.35" opacity="0.6"/>
  ${dots}
  <line x1="52" y1="4" x2="78" y2="4" stroke="${col}" stroke-width="0.35" opacity="0.6"/>
</svg>`;
}

// ── 余白の書き込み（マージナリア） ────────────────────────
// 本文と無関係。本文より格を落とす——線は細く、墨は薄い。
export function marginalia(kind, seed) {
  const rng = makeRng('marg' + kind + seed);
  const j = () => (rng() - 0.5) * 1.6;
  const S = (b) => `<svg class="marg marg-${kind}" viewBox="0 0 40 60" aria-hidden="true">${b}</svg>`;

  switch (kind) {
    case 'vine':
      return S(`<g fill="none" stroke="#5c4a2e" stroke-width="0.5" opacity="0.5" stroke-linecap="round">
        <path d="M20 2 C ${14 + j()} 12, ${26 + j()} 20, ${19 + j()} 32 C ${13 + j()} 42, ${24 + j()} 48, ${20 + j()} 58"/>
        <path d="M20 12 C 13 10, 10 13, 12 17 C 15 19, 19 16, 20 12Z"/>
        <path d="M20 26 C 27 24, 30 27, 28 31 C 25 33, 21 30, 20 26Z"/>
        <path d="M19 42 C 12 40, 9 43, 11 47 C 14 49, 18 46, 19 42Z"/>
      </g>`);
    case 'vine-small':
      return S(`<g fill="none" stroke="#5c4a2e" stroke-width="0.45" opacity="0.45" stroke-linecap="round">
        <path d="M20 16 C ${15 + j()} 24, ${25 + j()} 30, ${20 + j()} 42"/>
        <path d="M20 24 C 14 22, 12 25, 14 28 C 17 29, 19 27, 20 24Z"/>
      </g>`);
    case 'bird':
      return S(`<g fill="none" stroke="#5c4a2e" stroke-width="0.5" opacity="0.52" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 34 C 10 26, 16 20, 23 21 C 30 22, 32 28, 29 33 C 26 38, 17 40, 12 34Z"/>
        <path d="M23 21 C 24 17, 27 15, 29 16"/>
        <path d="M29 33 C 33 35, 36 39, 35 43"/>
        <path d="M17 33 C 20 30, 25 30, 27 32"/>
        <circle cx="25" cy="24" r="0.6" fill="#5c4a2e" stroke="none"/>
      </g>`);
    case 'paw':
      return S(`<g fill="#5c4a2e" opacity="0.34">
        <ellipse cx="20" cy="34" rx="4.2" ry="3.4"/>
        <ellipse cx="14.5" cy="28" rx="1.7" ry="2.2"/>
        <ellipse cx="18.5" cy="26" rx="1.7" ry="2.2"/>
        <ellipse cx="22.5" cy="26" rx="1.7" ry="2.2"/>
        <ellipse cx="26" cy="28.5" rx="1.7" ry="2.2"/>
      </g>`);
    case 'thorn':
      return S(`<g fill="none" stroke="#3c4568" stroke-width="0.5" opacity="0.45" stroke-linecap="round">
        <path d="M20 4 C ${23 + j()} 16, ${16 + j()} 26, ${21 + j()} 40 C ${24 + j()} 48, ${18 + j()} 52, ${20 + j()} 57"/>
        <path d="M20 14 L 26 10"/><path d="M19 22 L 13 19"/>
        <path d="M21 32 L 27 29"/><path d="M20 44 L 14 42"/>
      </g>`);
    case 'ember':
      return S(`<g opacity="0.5">
        <path d="M20 30 C 17 24, 22 20, 21 14 C 26 19, 27 26, 23 32 Z" fill="none" stroke="#8d3a24" stroke-width="0.5"/>
        <circle cx="18" cy="38" r="0.7" fill="#8d3a24"/>
        <circle cx="24" cy="42" r="0.5" fill="#8d3a24"/>
        <circle cx="20" cy="46" r="0.4" fill="#8d3a24"/>
      </g>`);
    default:
      return '';
  }
}

// ── 数取り（幕間で使う） ──────────────────────────────────
// 一本が一度。後半は削られていて、数が合わない。
export function tally(count, lost, seed) {
  const rng = makeRng('tally' + seed);
  let out = '';
  const perGroup = 5;
  let x = 2;
  for (let i = 0; i < count; i++) {
    const g = Math.floor(i / perGroup);
    const k = i % perGroup;
    const gx = x + g * 11;
    const faded = i >= count - lost;
    const op = faded ? 0.14 + rng() * 0.10 : 0.62 + rng() * 0.22;
    if (k === 4) {
      out += `<line x1="${(gx - 0.5).toFixed(1)}" y1="${(9 + rng()).toFixed(1)}" x2="${(gx + 7.5).toFixed(1)}" y2="${(2 + rng()).toFixed(1)}" stroke="#4a3a24" stroke-width="0.45" opacity="${op.toFixed(2)}"/>`;
    } else {
      const jx = (rng() - 0.5) * 0.7;
      out += `<line x1="${(gx + k * 1.8 + jx).toFixed(1)}" y1="${(1.5 + rng() * 0.8).toFixed(1)}" x2="${(gx + k * 1.8 + jx + (rng() - 0.5) * 0.8).toFixed(1)}" y2="${(9.6 - rng() * 0.8).toFixed(1)}" stroke="#4a3a24" stroke-width="0.45" opacity="${op.toFixed(2)}"/>`;
    }
  }
  const w = Math.ceil(count / perGroup) * 11 + 6;
  return `<svg class="tallymark" viewBox="0 0 ${w} 12" aria-hidden="true">${out}</svg>`;
}
