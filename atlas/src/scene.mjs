// 主図版（情景画）と小カット
//
// 仕様書 5：左ページ。主図版＝その組織を象徴する情景、1 点、大きく。
//            小カット＝装備・拠点・象徴物など 2〜3 点。
// 仕様書 9：主図版 約 30 点、小カット 約 80 点。
//
// 情景も胸像と同じ原理で組む。層は五つに固定する。
//   空 → 遠景（山稜）→ 中景（構築物）→ 近景（地面）→ 前景（点景）
// 層の順と光源（左上）を全 30 点で共有するので、並べたとき奥行きが揃う。
// 一点ずつ構図を起こすと、視点の高さが図版ごとに変わり、
// 同じ本の中で地面の高さが上下する。それが「画風が変わる」の正体である。

import { engrave, stipple, contour } from './engrave.mjs';

const W = 100, H = 66;                    // 情景の座標系。3:2。
const box = [0, 0, W, H];

// ── 山稜。折れ線の峰。遠いほど淡く、稜線が低い。 ────────────
const ridge = (seed, { base = 40, amp = 14, n = 7, x0 = -4, x1 = 104 }) => {
  let a = 0;
  for (let i = 0; i < seed.length; i++) a = (Math.imul(a ^ seed.charCodeAt(i), 2654435761) >>> 0);
  const r = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let d = `M ${x0} ${H} L ${x0} ${base}`;
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const px = x0 + step * (i + 0.5), py = base - amp * (0.35 + r() * 0.65);
    d += ` L ${px.toFixed(1)} ${py.toFixed(1)} L ${(x0 + step * (i + 1)).toFixed(1)} ${(base - amp * 0.12 * r()).toFixed(1)}`;
  }
  return d + ` L ${x1} ${H} Z`;
};

// ── 構築物。中景に一つだけ置く。 ────────────────────────
export const STRUCTURES = {
  // 城砦。四角い塔と胸壁。
  fort: 'M 30 52 L 30 30 L 38 30 L 38 26 L 44 26 L 44 30 L 52 30 L 52 52 Z'
      + ' M 52 52 L 52 38 L 74 38 L 74 34 L 78 34 L 78 52 Z'
      + ' M 26 52 L 26 44 L 30 44 L 30 52 Z',
  // 神殿。柱廊と切妻。
  temple: 'M 32 52 L 32 34 L 68 34 L 68 52 Z M 28 34 L 50 22 L 72 34 Z'
        + ' M 36 52 L 36 36 L 39 36 L 39 52 Z M 44 52 L 44 36 L 47 36 L 47 52 Z'
        + ' M 53 52 L 53 36 L 56 36 L 56 52 Z M 61 52 L 61 36 L 64 36 L 64 52 Z',
  // 単塔。学院・監視塔。
  tower: 'M 42 54 L 44 22 L 56 22 L 58 54 Z M 40 22 L 60 22 L 60 18 L 56 18 L 56 14 '
       + 'L 52 14 L 52 18 L 48 18 L 48 14 L 44 14 L 44 18 L 40 18 Z',
  // 市街。屋根の連なり。
  city: 'M 18 52 L 18 42 L 24 36 L 30 42 L 30 52 Z M 30 52 L 30 38 L 38 31 L 46 38 L 46 52 Z'
      + ' M 46 52 L 46 44 L 52 39 L 58 44 L 58 52 Z M 58 52 L 58 34 L 68 26 L 78 34 L 78 52 Z'
      + ' M 78 52 L 78 43 L 84 38 L 90 43 L 90 52 Z',
  // 廃墟。崩れた壁と倒れた柱。
  ruin: 'M 26 52 L 28 32 L 34 32 L 33 52 Z M 44 52 L 45 26 L 51 26 L 50 40 L 54 40 L 53 52 Z'
      + ' M 62 52 L 63 36 L 69 36 L 68 52 Z M 72 50 L 90 48 L 90 52 L 72 52 Z',
  // 天幕。野営。
  camp: 'M 28 52 L 40 32 L 52 52 Z M 54 52 L 64 38 L 74 52 Z M 38 52 L 38 44 L 42 44 L 42 52 Z',
  // 洞口。地下への入り。
  cave: 'M 30 52 C 32 30, 68 30, 70 52 Z M 38 52 C 39 38, 61 38, 62 52 Z',
  // 帆船。
  ship: 'M 24 50 L 76 50 L 68 58 L 32 58 Z M 48 50 L 48 18 L 51 18 L 51 50 Z'
      + ' M 51 22 L 70 32 L 51 40 Z M 48 26 L 33 34 L 48 42 Z',
  // 樹叢。
  forest: 'M 20 52 L 26 30 L 32 52 Z M 34 52 L 41 24 L 48 52 Z M 50 52 L 56 34 L 62 52 Z'
        + ' M 64 52 L 71 26 L 78 52 Z M 80 52 L 85 36 L 90 52 Z',
  // 石環。立石の輪。
  stones: 'M 24 52 L 26 34 L 33 33 L 32 52 Z M 42 52 L 43 28 L 51 27 L 50 52 Z'
        + ' M 60 52 L 61 30 L 69 29 L 68 52 Z M 78 52 L 79 36 L 86 35 L 85 52 Z',
};

// ── 情景一点 ────────────────────────────────────
export function scene(spec) {
  // 主図版は版面いっぱい 174mm。座標系は 100 単位。
  const MPU = (spec.mm ?? 174) / 100;
  const seed = spec.id ?? 's';
  const S = STRUCTURES[spec.structure ?? 'fort'];
  const night = spec.night ? 1 : 0;
  const sky = `M 0 0 H ${W} V 44 H 0 Z`;
  const far = ridge(seed + 'a', { base: 42, amp: 17, n: 6 });
  const mid = ridge(seed + 'b', { base: 48, amp: 10, n: 8 });
  const ground = `M 0 50 C 24 48, 40 52, 60 50 C 78 48, 90 51, ${W} 50 V ${H} H 0 Z`;

  const P = [];
  // 空。水平の線で作る。銅版画の空はほぼ例外なく横線である。
  // 点刻でやると、この面積では粒が万を超えて版が持たない。
  // 天へゆくほど濃く、地平へ向かって薄くする（三段に分けて彫る）。
  const band = (y0, y1) => `M 0 ${y0} H ${W} V ${y1} H 0 Z`;
  const skyT = night ? [0.44, 0.34, 0.22] : [0.17, 0.11, 0.06];
  [[0, 15], [15, 30], [30, 45]].forEach(([a, b], i) => {
    P.push(engrave(band(a, b), { t: skyT[i], angle: 2, box: [0, a, W, b], seed: seed + 'sk' + i, mmPerUnit: MPU }));
  });
  // 遠景
  P.push(engrave(far, { t: 0.16, angle: 62, box: [0, 20, W, 52], seed: seed + 'far', mmPerUnit: MPU }));
  P.push(contour(far, { w: 0.175, mmPerUnit: MPU }));
  // 中景の稜
  P.push(engrave(mid, { t: 0.30, angle: 58, box: [0, 34, W, 56], seed: seed + 'mid', mmPerUnit: MPU }));
  P.push(contour(mid, { w: 0.2, mmPerUnit: MPU }));
  // 構築物。まず紙を残してから彫る。稜線の彫りと地続きになると形が消える。
  P.push(`<path d="${S}" fill="#fff"/>`);
  P.push(engrave(S, { t: 0.46, angle: 26, box: [14, 12, 92, 58], seed: seed + 'st', mmPerUnit: MPU }));
  P.push(contour(S, { w: 0.275, mmPerUnit: MPU }));
  // 近景。奥を濃く、手前を薄く。手前を濃くすると版が前に倒れる。
  P.push(engrave(`M 0 50 C 24 48, 40 52, 60 50 C 78 48, 90 51, ${W} 50 V 57 H 0 Z`,
    { t: 0.26, angle: 10, box: [0, 48, W, 57], seed: seed + 'gr1', mmPerUnit: MPU }));
  P.push(engrave(`M 0 57 H ${W} V ${H} H 0 Z`,
    { t: 0.13, angle: 14, box: [0, 57, W, H], seed: seed + 'gr2', mmPerUnit: MPU }));
  P.push(contour(ground, { w: 0.225, mmPerUnit: MPU }));
  // 前景の点景。人影を小さく置くと、構築物の大きさが決まる。
  if (spec.figures !== 0) {
    const fig = 'M 14 62 C 13 58, 14 55, 16 54 C 18 55, 19 58, 18 62 Z'
      + ' M 16 54 m -1.7 0 a 1.7 2 0 1 0 3.4 0 a 1.7 2 0 1 0 -3.4 0'
      + ' M 22 62 C 21 59, 22 56, 24 55 C 26 56, 27 59, 26 62 Z'
      + ' M 24 55 m -1.5 0 a 1.5 1.8 0 1 0 3 0 a 1.5 1.8 0 1 0 -3 0';
    P.push(`<path d="${fig}" fill="#1b1b1a"/>`);
  }

  return `<svg class="scene" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`
    + `<rect width="${W}" height="${H}" fill="#fff"/>`
    + P.filter(Boolean).join('')
    + `<rect x="0.3" y="0.3" width="${W - 0.6}" height="${H - 0.6}" fill="none" stroke="#1b1b1a" stroke-width="${(0.4 / MPU).toFixed(3)}"/>`
    + `</svg>`;
}

// ── 小カット。装備・拠点・象徴物。24mm 角。 ──────────────
export const CUTS = {
  sword:   'M 50 12 L 55 22 L 54 62 L 46 62 L 45 22 Z M 34 62 L 66 62 L 66 68 L 34 68 Z M 47 68 L 53 68 L 53 86 L 47 86 Z M 50 86 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
  axe:     'M 47 14 L 53 14 L 53 88 L 47 88 Z M 53 20 C 74 24, 84 40, 82 56 C 74 52, 62 50, 53 52 Z',
  bow:     'M 30 14 C 56 26, 56 74, 30 86 L 34 82 C 52 70, 52 30, 34 18 Z M 32 16 L 32 84',
  shield:  'M 24 18 L 76 18 L 76 52 C 76 74, 60 86, 50 90 C 40 86, 24 74, 24 52 Z',
  helm:    'M 24 56 C 24 26, 76 26, 76 56 L 76 68 L 66 68 L 66 50 C 66 36, 34 36, 34 50 L 34 68 L 24 68 Z M 46 40 L 54 40 L 54 76 L 46 76 Z',
  scroll:  'M 20 26 C 20 20, 30 20, 30 26 L 30 74 C 30 80, 20 80, 20 74 Z M 30 24 L 78 24 L 78 76 L 30 76 Z M 80 26 C 80 20, 90 20, 90 26 L 90 74 C 90 80, 80 80, 80 74 Z',
  potion:  'M 42 16 L 58 16 L 58 30 C 74 40, 78 66, 66 82 L 34 82 C 22 66, 26 40, 42 30 Z M 38 20 L 62 20 L 62 14 L 38 14 Z',
  key:     'M 34 30 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0 M 34 30 m -5 0 a 5 5 0 1 1 10 0 a 5 5 0 1 1 -10 0 M 44 26 L 88 26 L 88 34 L 80 34 L 80 44 L 72 44 L 72 34 L 62 34 L 62 46 L 54 46 L 54 34 L 44 34 Z',
  coin:    'M 50 50 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0 M 50 50 m -20 0 a 20 20 0 1 1 40 0 a 20 20 0 1 1 -40 0',
  banner:  'M 26 12 L 32 12 L 32 92 L 26 92 Z M 32 16 L 82 16 L 82 58 L 68 50 L 54 60 L 40 50 L 32 58 Z',
  chalice: 'M 28 20 L 72 20 C 72 44, 60 56, 54 58 L 54 76 L 68 78 L 68 86 L 32 86 L 32 78 L 46 76 L 46 58 C 40 56, 28 44, 28 20 Z',
  book:    'M 18 24 L 48 32 L 48 82 L 18 74 Z M 82 24 L 52 32 L 52 82 L 82 74 Z M 48 32 L 50 28 L 52 32 L 52 84 L 48 84 Z',
  gate:    'M 22 90 L 22 40 C 22 20, 78 20, 78 40 L 78 90 L 66 90 L 66 42 C 66 30, 34 30, 34 42 L 34 90 Z',
  anvil:   'M 22 34 L 78 34 L 72 46 L 56 46 L 56 62 L 66 62 L 70 82 L 30 82 L 34 62 L 44 62 L 44 46 L 28 46 Z',
  mask:    'M 50 16 C 72 16, 82 34, 82 52 C 82 76, 66 92, 50 92 C 34 92, 18 76, 18 46 C 18 32, 28 16, 50 16 Z M 28 46 L 46 42 L 46 54 L 28 54 Z M 72 46 L 54 42 L 54 54 L 72 54 Z',
  torch:   'M 44 44 L 56 44 L 54 92 L 46 92 Z M 50 8 C 40 22, 58 30, 46 44 L 54 44 C 66 30, 56 20, 50 8 Z',
  crown:   'M 20 74 L 26 30 L 38 52 L 50 22 L 62 52 L 74 30 L 80 74 Z M 20 78 L 80 78 L 80 88 L 20 88 Z',
  ledger:  'M 24 18 L 76 18 L 76 88 L 24 88 Z M 32 30 L 68 30 M 32 42 L 68 42 M 32 54 L 68 54 M 32 66 L 56 66',
};

export function cut(kind, { t = 0.42, angle = 34, seed = '', mm = 25 } = {}) {
  const d = CUTS[kind] ?? CUTS.sword;
  const MPU = mm / 100;                     // 刷り上がり 25mm ／ 座標 100 単位
  return `<svg class="cut" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`
    + `<rect width="100" height="100" fill="#fff"/>`
    + engrave(d, { t, angle, box: [8, 8, 92, 92], seed: seed + kind, mmPerUnit: MPU })
    + contour(d, { w: 0.16, mmPerUnit: MPU })
    + `</svg>`;
}
