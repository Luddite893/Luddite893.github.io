// 細密画　全六点
//
// 各幕の扉に一点。人物の顔は描かない（仕様書 4-4／7）。
// 顔の要る場面は、頭巾・背影・逆光で処理する。読み手の想像を塞がないため。
// 金は女神メリディアに関わる一点にのみ用いる。群青は闇の章にのみ。
//
// 描き方の方針：
//   ・面はすべて墨の輪郭で囲う。輪郭のない面は、写本の絵には無い。
//   ・陰影は階調ではなく斜線（hatching）で出す。滑らかな階調は近代の道具の痕。
//   ・囲み罫だけは定規で引く。中身の線は揺らす。
//   ・顔料は紙の目に負ける。均一には乗らない。

import { makeRng } from './typeset.mjs';

const INK = '#3a2c1c';
const RED = '#8d3a24';
const GOLD = '#a67c2b';
const GOLD_HI = '#d8b45f';
const BLUE = '#2f4478';
const BLUE_LT = '#5a6d9e';

let uid = 0;

// 斜線による陰影。領域を切り抜いて、その中に平行線を引く。
//
// ただし等間隔・等長・等圧の平行線は、定規とペンプロッタの線であって
// 手の線ではない。一本ごとに、間隔・長さ・角度・濃さを散らす。
// 手は同じ線を二度引けない。
function hatched(u, key, d, { a = 45, gap = 2.2, col = INK, op = 0.3, sw = 0.2, box }) {
  const id = `${u}h${key}`;
  const rng = makeRng(u + key + a);
  const [x0, y0, x1, y1] = box;
  const span = Math.hypot(x1 - x0, y1 - y0);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let lines = '';
  for (let t = -span; t <= span; t += gap * (0.72 + rng() * 0.62)) {
    // 角度は一本ごとに僅かにぶれる
    const rad = ((a + (rng() - 0.5) * 3.2) * Math.PI) / 180;
    const dx = Math.cos(rad), dy = Math.sin(rad);
    const px = cx - dy * t, py = cy + dx * t;
    // 引き始めと引き終わりは、領域より内側で止まることがある
    const s0 = -span * (0.62 + rng() * 0.38);
    const s1 = span * (0.62 + rng() * 0.38);
    const o = (0.55 + rng() * 0.75).toFixed(2);
    const w = (sw * (0.7 + rng() * 0.7)).toFixed(3);
    lines += `<line x1="${(px + dx * s0).toFixed(2)}" y1="${(py + dy * s0).toFixed(2)}"`
           + ` x2="${(px + dx * s1).toFixed(2)}" y2="${(py + dy * s1).toFixed(2)}"`
           + ` stroke-width="${w}" opacity="${o}"/>`;
  }
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>`
       + `<g clip-path="url(#${id})" stroke="${col}" stroke-linecap="round"`
       + ` stroke-width="${sw}" opacity="${op}">${lines}</g>`;
}

// 写本の絵は、必ず罫で囲われる。囲みは絵より格が上。
function frame(build, { fillet = RED, ground = '#ded3b6', seed = null } = {}) {
  const u = 'm' + ++uid;
  const sd = seed ?? uid * 37 + 5;
  const inner = typeof build === 'function' ? build(u) : build;
  return `
<svg class="mini" viewBox="0 0 100 78" aria-hidden="true">
  <defs>
    <clipPath id="${u}c"><rect x="3.2" y="3.2" width="93.6" height="71.6"/></clipPath>
    <!-- 筆の揺れ。中身にだけかける。 -->
    <filter id="${u}r" x="-4%" y="-4%" width="108%" height="108%">
      <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="2" seed="${sd}" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="0.42"
                         xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- 顔料のむら -->
    <filter id="${u}g" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8 0.3" numOctaves="3" seed="${sd + 3}" result="t"/>
      <feColorMatrix in="t" type="matrix"
        values="0 0 0 0 0.31  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.24 0"/>
    </filter>
  </defs>
  <rect x="3.2" y="3.2" width="93.6" height="71.6" fill="${ground}"/>
  <g clip-path="url(#${u}c)" filter="url(#${u}r)">${inner}</g>
  <rect x="3.2" y="3.2" width="93.6" height="71.6" filter="url(#${u}g)"
        opacity="0.55" style="mix-blend-mode:multiply"/>
  <!-- 囲み罫は定規で引かれる。ここは揺らさない。 -->
  <rect x="3.2" y="3.2" width="93.6" height="71.6" fill="none" stroke="${INK}" stroke-width="0.5" opacity="0.85"/>
  <rect x="1.7" y="1.7" width="96.6" height="74.6" fill="none" stroke="${fillet}" stroke-width="0.35" opacity="0.7"/>
</svg>`;
}

export const miniatures = {

  // ── プロローグ　処刑台 ────────────────────────────────
  // 刃は上がりきったまま。落ちてこない。空が裂けている。
  scaffold: () => frame((u) => `
    <rect x="3" y="3" width="94" height="46" fill="#cec2a1"/>
    ${hatched(u, 'sky', 'M3 3 H97 V26 H3 Z', { a: 74, gap: 2.4, col: INK, op: 0.14, box: [3, 3, 97, 26] })}

    <!-- 裂け目 -->
    <path d="M63 2 L 67 11 L 61 15 L 69 23 L 62 27 L 71 35"
          fill="none" stroke="${RED}" stroke-width="1.2" stroke-linejoin="round" opacity="0.9"/>
    <path d="M63 2 L 58 10 L 64 14 L 56 21 L 63 26 L 55 33"
          fill="none" stroke="${RED}" stroke-width="0.75" stroke-linejoin="round" opacity="0.6"/>
    <!-- 降る火 -->
    <g fill="${RED}" stroke="${INK}" stroke-width="0.16" opacity="0.8">
      <path d="M75 30 l1.5 3.8 -1.5 1.3 -1.4 -1.3Z"/>
      <path d="M50 26 l1.2 3 -1.2 1.1 -1.2 -1.1Z"/>
      <path d="M84 40 l1.1 2.6 -1.1 1 -1.1 -1Z"/>
      <path d="M44 38 l1 2.4 -1 .9 -1 -.9Z"/>
    </g>

    <!-- 地 -->
    <path d="M3 47 C 24 45.6, 52 48.4, 74 46.8 C 86 46, 93 47.4, 97 46.8 L 97 76 L 3 76 Z"
          fill="#c6b993" stroke="${INK}" stroke-width="0.35"/>
    ${hatched(u, 'gr', 'M3 62 C 30 61, 60 63, 97 61.5 L 97 76 L 3 76 Z',
      { a: 12, gap: 2.6, op: 0.16, box: [3, 60, 97, 76] })}

    <!-- 台 -->
    <path d="M8.5 61.6 L 91.5 62.2 L 91.8 66.4 L 8.2 65.8 Z"
          fill="#b9a97f" stroke="${INK}" stroke-width="0.45"/>
    ${hatched(u, 'pl', 'M8.5 61.6 L 91.5 62.2 L 91.8 66.4 L 8.2 65.8 Z',
      { a: 0, gap: 1.5, op: 0.22, box: [8, 61, 92, 67] })}
    <g stroke="${INK}" stroke-width="0.42" opacity="0.85">
      <path d="M12.4 66 L 12 76"/><path d="M24.2 66 L 24.6 76"/>
      <path d="M75.8 66.2 L 75.4 76"/><path d="M87.6 66.2 L 88.2 76"/>
    </g>

    <!-- 断頭台の枠と、上がったままの刃 -->
    <path d="M34.2 62 L 33.6 20.4 M 58 62 L 58.6 20.4"
          fill="none" stroke="${INK}" stroke-width="0.95" opacity="0.92"/>
    <path d="M30.6 20.6 L 61.6 20.2 L 61.8 23 L 30.8 23.4 Z" fill="#7d705c" stroke="${INK}" stroke-width="0.4"/>
    <path d="M36 24.6 L 56.4 24.2 L 56.8 30.4 L 46.6 35 L 36.2 30.8 Z"
          fill="#a49b89" stroke="${INK}" stroke-width="0.5"/>
    <path d="M36.2 30.8 L 46.6 35 L 56.8 30.4" fill="none" stroke="#f3eeda" stroke-width="0.7" opacity="0.85"/>
    ${hatched(u, 'bl', 'M36 24.6 L 56.4 24.2 L 56.8 30.4 L 46.6 35 L 36.2 30.8 Z',
      { a: 62, gap: 1.3, op: 0.24, box: [36, 24, 57, 35] })}

    <!-- 首台。人は伏せていて、顔は見えない。 -->
    <path d="M39.6 58.4 C 43 53.8, 51.4 53.6, 54.4 58.2 L 54.6 62 L 39.4 61.8 Z"
          fill="#a8926a" stroke="${INK}" stroke-width="0.45"/>
    <path d="M38.4 58.6 C 36 55.4, 37.2 51.6, 40.4 51.8 C 42.6 52, 43.4 54.2, 43 56.4 Z"
          fill="${INK}" opacity="0.88"/>

    <!-- 立ち会う者たち。頭巾のみ。 -->
    <g fill="#4b3d28" stroke="${INK}" stroke-width="0.25" opacity="0.62">
      <path d="M13.6 62 C 13.4 56.6, 18.2 54.6, 20.2 58 L 20.4 62 Z"/>
      <path d="M21.4 62 C 21.2 57.8, 25.4 55.8, 27.2 59 L 27.4 62 Z"/>
      <path d="M69.8 62 C 69.6 56.8, 74.2 54.8, 76.2 58.2 L 76.4 62 Z"/>
      <path d="M78 62 C 77.8 58, 82 56, 83.8 59.2 L 84 62 Z"/>
    </g>
  `),

  // ── 第一幕　荒れ果てた神殿と、降りてくる光 ─────────────────
  // 金を用いるのはこの一点のみ。光源が一つしかないことを、色数で示す。
  temple: () => frame((u) => `
    <rect x="3" y="3" width="94" height="56" fill="#d6cbaa"/>
    ${hatched(u, 'sky', 'M3 3 H97 V40 H3 Z', { a: 78, gap: 2.8, op: 0.10, box: [3, 3, 97, 40] })}

    <!-- 光条。階調ではなく、線で降ろす。 -->
    <g stroke="${GOLD}" stroke-width="0.55" opacity="0.6" stroke-linecap="round">
      <path d="M50 24 L 33.4 60.4"/><path d="M50 24 L 39.2 60.8"/>
      <path d="M50 24 L 45 61"/>    <path d="M50 24 L 50.4 61"/>
      <path d="M50 24 L 55.6 60.9"/><path d="M50 24 L 61.4 60.6"/>
      <path d="M50 24 L 67 60.2"/>
    </g>
    <g stroke="${GOLD_HI}" stroke-width="0.9" opacity="0.45" stroke-linecap="round">
      <path d="M50 24 L 42.6 60.8"/><path d="M50 24 L 57.8 60.7"/>
    </g>

    <!-- 光球 -->
    <circle cx="50" cy="22" r="4.6" fill="${GOLD_HI}" stroke="${GOLD}" stroke-width="0.5"/>
    <circle cx="50" cy="22" r="2.3" fill="#f6e9c2" stroke="none"/>
    <g stroke="${GOLD}" stroke-width="0.5" opacity="0.75" stroke-linecap="round">
      <path d="M50 15.4 L 50 11.6"/><path d="M50 28.6 L 50 32"/>
      <path d="M43.4 22 L 39.6 22"/><path d="M56.6 22 L 60.4 22"/>
      <path d="M45.4 17.4 L 42.6 14.4"/><path d="M54.6 17.4 L 57.4 14.4"/>
      <path d="M45.4 26.6 L 42.6 29.6"/><path d="M54.6 26.6 L 57.4 29.6"/>
    </g>

    <!-- 残った柱 -->
    <path d="M13.8 60.4 L 14.4 26.6 L 21.2 26.4 L 21 60.6 Z" fill="#c0b48f" stroke="${INK}" stroke-width="0.5"/>
    ${hatched(u, 'c1', 'M13.8 60.4 L 14.4 26.6 L 21.2 26.4 L 21 60.6 Z',
      { a: 90, gap: 1.1, op: 0.20, box: [13, 26, 22, 61] })}
    <path d="M12.4 26.6 L 22.6 26.2 L 22.8 23.6 L 12.2 24 Z" fill="#b3a680" stroke="${INK}" stroke-width="0.45"/>

    <path d="M79 60.6 L 79.4 30.4 L 86.2 30.2 L 86 60.4 Z" fill="#c0b48f" stroke="${INK}" stroke-width="0.5"/>
    ${hatched(u, 'c2', 'M79 60.6 L 79.4 30.4 L 86.2 30.2 L 86 60.4 Z',
      { a: 90, gap: 1.1, op: 0.20, box: [78, 30, 87, 61] })}
    <path d="M77.6 30.4 L 87.8 30 L 88 27.4 L 77.4 27.8 Z" fill="#b3a680" stroke="${INK}" stroke-width="0.45"/>

    <!-- 崩れて横たわる柱 -->
    <path d="M26 57.4 L 44.2 55.2 L 44.8 59.6 L 26.6 61.8 Z" fill="#b8ac86" stroke="${INK}" stroke-width="0.45"/>
    <path d="M60 59.2 L 74.4 58.2 L 74.6 61.6 L 60.2 62.6 Z" fill="#b8ac86" stroke="${INK}" stroke-width="0.45"/>

    <!-- 床 -->
    <path d="M3 58.6 C 26 57.8, 60 59.4, 97 58.4 L 97 76 L 3 76 Z" fill="#cabd97" stroke="${INK}" stroke-width="0.35"/>
    <g stroke="${INK}" stroke-width="0.22" opacity="0.42" fill="none">
      <path d="M3 64.4 C 28 63.6, 62 65, 97 64.2"/>
      <path d="M3 70.2 C 30 69.4, 64 70.8, 97 70"/>
      <path d="M20.4 59 L 14 76"/><path d="M50 59.2 L 49.6 76"/><path d="M80 59 L 86.4 76"/>
    </g>

    <!-- 苔 -->
    <g fill="#6e7a49" stroke="${INK}" stroke-width="0.12" opacity="0.42">
      <path d="M28.6 60.6 C 31 59.4, 33.4 60.6, 32.6 62 C 31 62.8, 28.8 62.2, 28.6 60.6Z"/>
      <path d="M64.8 61.6 C 67 60.6, 68.8 61.8, 68 63 C 66.4 63.6, 64.8 63, 64.8 61.6Z"/>
      <path d="M16 56.4 C 18 55.6, 19.6 56.6, 18.8 57.8 C 17.4 58.2, 16 57.6, 16 56.4Z"/>
    </g>

    <!-- 剣。まだ床にある。誰も握っていない。 -->
    <path d="M45.8 74 L 46.2 63.4 L 47.2 61.4 L 48.2 63.2 L 48 74 Z"
          fill="${GOLD_HI}" stroke="${INK}" stroke-width="0.35"/>
    <path d="M41.8 74 L 52.2 74.2 L 52 75.6 L 41.6 75.4 Z" fill="#6b5636" stroke="${INK}" stroke-width="0.3"/>
  `, { fillet: GOLD }),

  // ── 第二幕　コールドハーバー ───────────────────────────
  // 群青はここから。火が熱を持たない場所。
  coldharbour: () => frame((u) => `
    <rect x="3" y="3" width="94" height="72" fill="#39456e"/>
    <path d="M3 3 H97 V34 H3 Z" fill="${BLUE}"/>
    ${hatched(u, 'sky', 'M3 3 H97 V34 H3 Z', { a: 8, gap: 1.9, col: '#101632', op: 0.30, box: [3, 3, 97, 34] })}
    <g stroke="${BLUE_LT}" stroke-width="0.4" opacity="0.4" fill="none">
      <path d="M3 12.6 C 24 9.8, 42 15.4, 62 11.4 C 78 8.2, 90 13.2, 97 11.2"/>
      <path d="M3 20.4 C 20 17.4, 44 23.2, 64 19.2 C 80 16.2, 92 20.4, 97 18.4"/>
    </g>

    <!-- 副塔 -->
    <path d="M21.6 66.4 L 24.2 34.2 L 30.2 34 L 31.4 66.2 Z" fill="#1b2340" stroke="${BLUE_LT}" stroke-width="0.4"/>
    <path d="M24.2 34.2 L 27.2 24.8 L 30.2 34 Z" fill="#1b2340" stroke="${BLUE_LT}" stroke-width="0.4"/>
    <path d="M70.2 66.2 L 71.4 40.2 L 77.2 40 L 78.2 66.4 Z" fill="#1b2340" stroke="${BLUE_LT}" stroke-width="0.4"/>
    <path d="M71.4 40.2 L 74.4 31.8 L 77.2 40 Z" fill="#1b2340" stroke="${BLUE_LT}" stroke-width="0.4"/>

    <!-- 主塔 -->
    <path d="M43.8 66.6 L 46.2 18.2 L 54 18 L 56.2 66.4 Z" fill="#131a30" stroke="${BLUE_LT}" stroke-width="0.45"/>
    <path d="M46.2 18.2 L 50.2 5.6 L 54 18 Z" fill="#131a30" stroke="${BLUE_LT}" stroke-width="0.45"/>
    ${hatched(u, 'tw', 'M43.8 66.6 L 46.2 18.2 L 54 18 L 56.2 66.4 Z',
      { a: 90, gap: 1.5, col: '#000', op: 0.22, box: [43, 18, 57, 67] })}
    <g fill="${BLUE_LT}" stroke="#0b0f1e" stroke-width="0.16" opacity="0.65">
      <path d="M48.6 26 h2.4 v4.2 h-2.4 Z"/>
      <path d="M48.4 36 h2.8 v4.2 h-2.8 Z"/>
      <path d="M48.2 46 h3 v4.2 h-3 Z"/>
    </g>

    <!-- 黒い海。動かない。 -->
    <path d="M3 60.4 C 26 59.6, 60 61.2, 97 60.2 L 97 76 L 3 76 Z" fill="#0d1222" stroke="#0a0e1c" stroke-width="0.3"/>
    <g stroke="${BLUE_LT}" stroke-width="0.32" opacity="0.28" fill="none">
      <path d="M6 64.4 C 16 62.8, 26 65.8, 36 64.2"/>
      <path d="M46 66.4 C 56 64.8, 66 67.8, 76 66.2"/>
      <path d="M10 70.2 C 22 68.6, 34 71.6, 46 70"/>
      <path d="M56 72.4 C 68 70.8, 80 73.8, 92 72.2"/>
    </g>
    <!-- 熱を持たない火 -->
    <g stroke="${BLUE_LT}" stroke-width="0.4" fill="#243258" opacity="0.7">
      <path d="M13.4 60.2 C 11.6 56.2, 15 54, 14.4 50 C 17.2 53, 17.8 57, 15.6 60.2 Z"/>
      <path d="M86.2 60.2 C 84.4 57.2, 86.8 55, 86.2 51.8 C 88.4 54.4, 89 57.6, 87.4 60.2 Z"/>
    </g>
  `, { fillet: BLUE, ground: '#39456e' }),

  // ── 幕間　燃える書 ────────────────────────────────────
  // この丁の焼損は、外から来たものではない。
  burningbook: () => frame((u) => `
    <rect x="3" y="3" width="94" height="72" fill="#ddd0ae"/>
    ${hatched(u, 'bg', 'M3 3 H97 V40 H3 Z', { a: 80, gap: 3, op: 0.10, box: [3, 3, 97, 40] })}

    <!-- 炎。輪郭で描く。 -->
    <path d="M50 7.4 C 43.6 19.6, 56.4 24, 49.8 36 C 45.6 44, 54 46.4, 51.8 52.4 L 43.6 52 C 39.6 44, 41.8 33.8, 45.8 25.6 C 48 20, 47 13.6, 50 7.4 Z"
          fill="#c98c46" stroke="${RED}" stroke-width="0.5" opacity="0.5"/>
    <path d="M50 16.4 C 45.8 24.4, 54.2 28.2, 49 38.2 C 45.8 44, 52 46.4, 50 50.2 L 45.8 50 C 42.8 44, 45 34, 47 28.2 C 48.2 23.2, 48 19.4, 50 16.4 Z"
          fill="${RED}" stroke="${RED}" stroke-width="0.4" opacity="0.62"/>
    <path d="M50 27 C 48 32.6, 52 36.4, 49 42.4 C 47.4 45.4, 50 47.4, 49 49.4 L 47 49.2 C 46 45.4, 47 38.4, 48 34 Z"
          fill="#e6b061" stroke="none" opacity="0.75"/>

    <!-- 舞う灰 -->
    <g fill="${INK}" opacity="0.45">
      <path d="M31.6 22 l1.7 .7 -.8 1.6 -1.6 -.7Z"/>
      <path d="M66.4 15.6 l1.5 .6 -.7 1.4 -1.4 -.6Z"/>
      <path d="M27.8 40.4 l1.3 .5 -.6 1.2 -1.2 -.5Z"/>
      <path d="M70.2 34 l1.6 .6 -.7 1.5 -1.5 -.6Z"/>
      <path d="M61.8 46.4 l1.1 .4 -.5 1 -1 -.4Z"/>
      <path d="M35.6 52.2 l1.3 .5 -.6 1.2 -1.2 -.5Z"/>
    </g>

    <!-- 開かれた書 -->
    <path d="M21.6 60.2 L 48.8 53.8 L 49 66.2 L 22 71.4 Z" fill="#cdbf9a" stroke="${INK}" stroke-width="0.5"/>
    <path d="M78.4 60.2 L 51.2 53.8 L 51 66.2 L 78 71.4 Z" fill="#cdbf9a" stroke="${INK}" stroke-width="0.5"/>
    ${hatched(u, 'pgl', 'M21.6 60.2 L 48.8 53.8 L 49 66.2 L 22 71.4 Z',
      { a: 168, gap: 1.6, op: 0.14, box: [21, 53, 49, 72] })}
    ${hatched(u, 'pgr', 'M78.4 60.2 L 51.2 53.8 L 51 66.2 L 78 71.4 Z',
      { a: 12, gap: 1.6, op: 0.14, box: [51, 53, 79, 72] })}
    <path d="M48.8 53.8 L 50 52.6 L 51.2 53.8 L 51 66.2 L 49 66.2 Z" fill="#8a7a56" stroke="${INK}" stroke-width="0.4"/>

    <!-- 焦げた小口 -->
    <path d="M21.6 60.2 C 28 58, 34 61.2, 40.4 58 C 44.4 56, 47 57, 48.8 54.4"
          fill="none" stroke="#3d2510" stroke-width="1.1" opacity="0.8"/>
    <path d="M78.4 60.2 C 72 58, 66 61.2, 59.6 58 C 55.6 56, 53 57, 51.2 54.4"
          fill="none" stroke="#3d2510" stroke-width="1.1" opacity="0.8"/>

    <!-- 文字だったもの -->
    <g stroke="${INK}" stroke-width="0.3" opacity="0.42" fill="none">
      <path d="M26.6 64.2 L 43.8 60.6"/><path d="M26.8 66.8 L 41 63.6"/>
      <path d="M56.2 60.6 L 73.4 64.2"/><path d="M59 63.6 L 73.2 66.8"/>
    </g>
  `),

  // ── 第三幕　門 ───────────────────────────────────────
  // 光がない。門の前に、最後の一体が立っている。顔はない。
  gate: () => frame((u) => `
    <rect x="3" y="3" width="94" height="72" fill="#2a3149"/>
    ${hatched(u, 'bg', 'M3 3 H97 V76 H3 Z', { a: 88, gap: 2.2, col: '#0d1020', op: 0.28, box: [3, 3, 97, 76] })}

    <!-- 木立 -->
    <g stroke="#12172a" stroke-width="2.6" opacity="0.92" fill="none" stroke-linecap="round">
      <path d="M10.4 76 C 10 52, 11.4 34, 11 21.6"/>
      <path d="M20 76 C 19.4 56, 18.2 40, 18.4 29.6"/>
      <path d="M88 76 C 87.4 54, 86.6 36, 87 25.6"/>
      <path d="M78 76 C 78.6 56, 79.6 42, 79.8 31.6"/>
    </g>
    <g stroke="#12172a" stroke-width="1.2" opacity="0.8" fill="none" stroke-linecap="round">
      <path d="M28 76 C 27.6 58, 27 44, 27.2 37.6"/>
      <path d="M70.4 76 C 70.6 58, 71 44, 71.2 39.6"/>
      <path d="M11 29.6 L 5.2 21.4"/><path d="M11.2 38 L 18 30.8"/>
      <path d="M87 33.6 L 93 26.6"/><path d="M87 42 L 80 35.6"/>
    </g>

    <!-- 門 -->
    <path d="M35.8 72 L 36.2 34 C 36 24, 64 24, 63.8 34 L 64.2 72 L 58 72 L 57.8 34 C 58 29, 42 29, 42.2 34 L 42 72 Z"
          fill="#414b6c" stroke="${BLUE_LT}" stroke-width="0.5"/>
    ${hatched(u, 'gt', 'M35.8 72 L 36.2 34 C 36 24, 64 24, 63.8 34 L 64.2 72 L 58 72 L 57.8 34 C 58 29, 42 29, 42.2 34 L 42 72 Z',
      { a: 40, gap: 1.6, col: '#0d1020', op: 0.3, box: [35, 24, 65, 72] })}
    <!-- 門の向こう。何も見えない。 -->
    <path d="M42.2 72 L 42 34 C 42 29, 58 29, 57.8 34 L 58 72 Z" fill="#080b14"/>
    <g stroke="${BLUE_LT}" stroke-width="0.24" opacity="0.35" fill="none">
      <path d="M36 44.2 L 42 44.2"/><path d="M36 52.2 L 42 52.2"/><path d="M36 60.2 L 42 60.2"/>
      <path d="M58 44.2 L 64 44.2"/><path d="M58 52.2 L 64 52.2"/><path d="M58 60.2 L 64 60.2"/>
    </g>

    <!-- 立っている一体。輪郭のみ。 -->
    <path d="M46 72 C 44.8 62, 45.8 53.6, 50 49.6 C 54.2 53.6, 55.2 62, 54 72 Z" fill="#05070d"/>
    <path d="M50 49.6 C 47.4 49.8, 46.4 46.8, 47.4 44.2 C 48.4 42.2, 51.6 42.2, 52.6 44.2 C 53.6 46.8, 52.6 49.8, 50 49.6 Z"
          fill="#05070d"/>
    <circle cx="48.4" cy="45.8" r="0.55" fill="${RED}" opacity="0.8"/>
    <circle cx="51.6" cy="45.8" r="0.55" fill="${RED}" opacity="0.8"/>

    <!-- 地 -->
    <path d="M3 70 C 30 69.2, 62 70.8, 97 69.8 L 97 76 L 3 76 Z" fill="#161b2c"/>
  `, { fillet: BLUE, ground: '#2a3149' }),

  // ── 終幕　人形 ───────────────────────────────────────
  // 最初からそこにあった。顔は、はじめから描かれていない。
  doll: () => frame((u) => `
    <rect x="3" y="3" width="94" height="72" fill="#dcd6c4"/>
    ${hatched(u, 'sk', 'M3 3 H97 V44 H3 Z', { a: 84, gap: 3.4, op: 0.09, box: [3, 3, 97, 44] })}
    <!-- 山 -->
    <path d="M3 46.4 L 22 26.2 L 34 38.4 L 48 20.2 L 64 40.2 L 78 30.2 L 97 48 L 97 76 L 3 76 Z"
          fill="#c0bdaf" stroke="${INK}" stroke-width="0.3" opacity="0.85"/>
    ${hatched(u, 'mt', 'M3 46.4 L 22 26.2 L 34 38.4 L 48 20.2 L 64 40.2 L 78 30.2 L 97 48 L 97 76 L 3 76 Z',
      { a: 62, gap: 2.4, op: 0.14, box: [3, 20, 97, 76] })}
    <path d="M3 54.4 L 26 40.2 L 44 52.4 L 62 42.2 L 80 54.2 L 97 46.4 L 97 76 L 3 76 Z"
          fill="#cec9bb" stroke="${INK}" stroke-width="0.3"/>

    <!-- 中庭の石畳 -->
    <path d="M3 60.2 C 28 59.4, 62 61, 97 60 L 97 76 L 3 76 Z" fill="#b8b4a4" stroke="${INK}" stroke-width="0.3"/>
    <g stroke="${INK}" stroke-width="0.2" opacity="0.3" fill="none">
      <path d="M3 66.2 C 30 65.4, 64 66.8, 97 66"/>
      <path d="M3 71.4 C 30 70.6, 64 72, 97 71.2"/>
      <path d="M22 60.4 L 20 76"/><path d="M50 60.6 L 50.2 76"/><path d="M76 60.4 L 78 76"/>
    </g>

    <!-- 台 -->
    <path d="M39.8 60.2 L 60.2 60.4 L 58.2 66.2 L 41.8 66 Z" fill="#a9a494" stroke="${INK}" stroke-width="0.4"/>
    ${hatched(u, 'pd', 'M39.8 60.2 L 60.2 60.4 L 58.2 66.2 L 41.8 66 Z',
      { a: 100, gap: 1.4, op: 0.2, box: [39, 60, 61, 67] })}

    <!-- 人形。顔は白いまま。 -->
    <path d="M45.8 60.2 C 44.8 54, 46 48.2, 50 46 C 54 48.2, 55.2 54, 54.2 60.2 Z"
          fill="#cdb98e" stroke="${INK}" stroke-width="0.45"/>
    ${hatched(u, 'dl', 'M45.8 60.2 C 44.8 54, 46 48.2, 50 46 C 54 48.2, 55.2 54, 54.2 60.2 Z',
      { a: 74, gap: 1.5, op: 0.2, box: [45, 46, 55, 61] })}
    <path d="M50 46 C 47.5 46.2, 46.5 43.2, 47.6 40.8 C 48.6 38.9, 51.5 38.9, 52.4 40.8 C 53.5 43.2, 52.5 46.2, 50 46 Z"
          fill="#eee6d0" stroke="${INK}" stroke-width="0.45"/>
    <path d="M46.6 52.2 L 42 55.2" stroke="${INK}" stroke-width="0.5" fill="none"/>
    <path d="M53.4 52.2 L 58 55.2" stroke="${INK}" stroke-width="0.5" fill="none"/>
    <path d="M47.2 60.2 L 46.6 66 M 52.9 60.2 L 53.5 66" stroke="${INK}" stroke-width="0.4"/>

    <!-- 雪 -->
    <g fill="#fbfaf6" stroke="#b9b5a6" stroke-width="0.1">
      <circle cx="14" cy="14" r="0.85"/><circle cx="30" cy="9" r="0.6"/><circle cx="42" cy="18" r="0.72"/>
      <circle cx="58" cy="11" r="0.6"/><circle cx="70" cy="20" r="0.82"/><circle cx="84" cy="13" r="0.6"/>
      <circle cx="22" cy="28" r="0.7"/><circle cx="38" cy="33" r="0.5"/><circle cx="66" cy="30" r="0.62"/>
      <circle cx="90" cy="34" r="0.7"/><circle cx="10" cy="40" r="0.6"/><circle cx="76" cy="44" r="0.5"/>
      <circle cx="28" cy="48" r="0.6"/><circle cx="62" cy="52" r="0.5"/><circle cx="88" cy="56" r="0.62"/>
    </g>
  `),
};
