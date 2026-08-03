// 人物図版（胸像）の生成
//
// 仕様書 9：人物図版 約 150 点、小サイズ、胸像。
// 仕様書 14-2「図版 150 点超の人物図版を統一画風で揃える手法」への回答。
//
// ── 150 点を揃える唯一の方法 ────────────────────────
// 一点ずつ描けば揃わない。150 点も描けば、描き手は必ず上達し、
// 前半と後半で別人が描いたようになる。これは技量の問題ではなく、
// 人間が同じ手つきを 150 回反復できないという事実の問題である。
//
// したがって胸像は「描く」のではなく「組む」。
//   頭蓋（種族）× 被り物 × 髪 × 肩（衣）× 向き
// の組み合わせとして記述し、陰影はエングレービング・エンジンが与える。
// 光源は全 150 点で左上に固定する。ここが動くと、並べたとき別の本に見える。
//
// ── 顔を描かない ───────────────────────────────
// 実寸 18mm では、目鼻を線で描いても潰れて泥になる。
// 代わりに眼窩・鼻梁・頬の**陰**だけを置く。
// これは節約ではなく、19 世紀の博物誌図譜の肖像がまさにそうしている。
// 遠目には顔があり、近寄ると陰しかない。

import { engrave, stipple, contour } from './engrave.mjs';

const INK = '#1b1b1a';
const BOX = [0, 0, 100, 120];

// ── 頭蓋。種族ごとの輪郭。比率は共有し、幅と顎と耳だけが違う。 ──
export const SKULLS = {
  human:   { w: 17.5, jaw: 1.00, ear: 'round',  brow: 0.00 },
  nord:    { w: 19.0, jaw: 1.12, ear: 'round',  brow: 0.06 },
  elf:     { w: 15.8, jaw: 0.82, ear: 'point',  brow: 0.02 },
  orc:     { w: 20.2, jaw: 1.30, ear: 'round',  brow: 0.12, tusk: 1 },
  khajiit: { w: 18.0, jaw: 0.95, ear: 'feline', brow: 0.04, muzzle: 1 },
  argonian:{ w: 16.6, jaw: 1.05, ear: 'none',   brow: 0.02, crest: 1 },
};

const head = (s) => {
  const { w, jaw } = s;
  const cy = 40, top = cy - 23;
  const chin = cy + 26 * jaw;
  let d = `M 50 ${top} `
    + `C ${50 + w * 0.86} ${top + 1}, ${50 + w} ${cy - 10}, ${50 + w} ${cy + 1} `
    + `C ${50 + w} ${cy + 11}, ${50 + w * 0.72} ${cy + 17 * jaw}, 50 ${chin} `
    + `C ${50 - w * 0.72} ${cy + 17 * jaw}, ${50 - w} ${cy + 11}, ${50 - w} ${cy + 1} `
    + `C ${50 - w} ${cy - 10}, ${50 - w * 0.86} ${top + 1}, 50 ${top} Z`;
  if (s.muzzle) {
    d += ` M ${50 - w * 0.52} ${cy + 6} C ${50 - w * 0.5} ${cy + 20}, ${50 + w * 0.5} ${cy + 20}, `
       + `${50 + w * 0.52} ${cy + 6} C ${50 + w * 0.3} ${cy + 16}, ${50 - w * 0.3} ${cy + 16}, ${50 - w * 0.52} ${cy + 6} Z`;
  }
  return d;
};

const ears = (s) => {
  const w = s.w;
  if (s.ear === 'none') return '';
  if (s.ear === 'point') {
    return `M ${50 + w - 1} 34 L ${50 + w + 9} 20 L ${50 + w + 2} 42 Z`
         + ` M ${50 - w + 1} 34 L ${50 - w - 9} 20 L ${50 - w - 2} 42 Z`;
  }
  if (s.ear === 'feline') {
    return `M ${50 + w * 0.55} 20 L ${50 + w * 0.95} 4 L ${50 + w * 1.15} 24 Z`
         + ` M ${50 - w * 0.55} 20 L ${50 - w * 0.95} 4 L ${50 - w * 1.15} 24 Z`;
  }
  return `M ${50 + w - 1} 34 C ${50 + w + 6} 32, ${50 + w + 6} 46, ${50 + w - 2} 45 Z`
       + ` M ${50 - w + 1} 34 C ${50 - w - 6} 32, ${50 - w - 6} 46, ${50 - w + 2} 45 Z`;
};

// ── 被り物 ─────────────────────────────────────
export const HEADGEAR = {
  none: () => '',
  hood: (s) => `M 50 ${17 - s.brow * 10} C ${50 + s.w + 8} 15, ${50 + s.w + 11} 48, ${50 + s.w + 6} 66 `
    + `L ${50 + s.w - 1} 60 C ${50 + s.w + 2} 40, ${50 + s.w * 0.6} 22, 50 22 `
    + `C ${50 - s.w * 0.6} 22, ${50 - s.w - 2} 40, ${50 - s.w + 1} 60 `
    + `L ${50 - s.w - 6} 66 C ${50 - s.w - 11} 48, ${50 - s.w - 8} 15, 50 ${17 - s.brow * 10} Z`,
  helm: (s) => `M ${50 - s.w - 2} 38 C ${50 - s.w - 2} 16, ${50 + s.w + 2} 16, ${50 + s.w + 2} 38 `
    + `L ${50 + s.w + 2} 44 L ${50 + s.w - 3} 44 L ${50 + s.w - 3} 34 `
    + `C ${50 + s.w - 3} 22, ${50 - s.w + 3} 22, ${50 - s.w + 3} 34 L ${50 - s.w + 3} 44 `
    + `L ${50 - s.w - 2} 44 Z`
    + ` M 47.5 24 L 52.5 24 L 52.5 50 L 47.5 50 Z`,
  horned: (s) => HEADGEAR.helm(s)
    + ` M ${50 + s.w + 1} 30 C ${50 + s.w + 14} 26, ${50 + s.w + 19} 12, ${50 + s.w + 14} 4 `
    + `C ${50 + s.w + 20} 10, ${50 + s.w + 22} 28, ${50 + s.w + 5} 37 Z`
    + ` M ${50 - s.w - 1} 30 C ${50 - s.w - 14} 26, ${50 - s.w - 19} 12, ${50 - s.w - 14} 4 `
    + `C ${50 - s.w - 20} 10, ${50 - s.w - 22} 28, ${50 - s.w - 5} 37 Z`,
  circlet: (s) => `M ${50 - s.w - 1} 28 C ${50 - s.w * 0.5} 22, ${50 + s.w * 0.5} 22, ${50 + s.w + 1} 28 `
    + `L ${50 + s.w + 1} 32 C ${50 + s.w * 0.5} 26, ${50 - s.w * 0.5} 26, ${50 - s.w - 1} 32 Z`
    + ` M 50 21 L 54 27 L 50 32 L 46 27 Z`,
  cowl: (s) => `M 50 20 C ${50 + s.w + 6} 20, ${50 + s.w + 8} 44, ${50 + s.w + 4} 62 `
    + `L ${50 - s.w - 4} 62 C ${50 - s.w - 8} 44, ${50 - s.w - 6} 20, 50 20 Z`,
};

// ── 髪 ────────────────────────────────────────
export const HAIR = {
  none: () => '',
  long: (s) => `M 50 16 C ${50 + s.w + 3} 16, ${50 + s.w + 5} 40, ${50 + s.w + 3} 64 `
    + `L ${50 + s.w - 2} 60 C ${50 + s.w} 40, ${50 + s.w * 0.5} 24, 50 24 `
    + `C ${50 - s.w * 0.5} 24, ${50 - s.w} 40, ${50 - s.w + 2} 60 `
    + `L ${50 - s.w - 3} 64 C ${50 - s.w - 5} 40, ${50 - s.w - 3} 16, 50 16 Z`,
  short: (s) => `M 50 16 C ${50 + s.w + 2} 16, ${50 + s.w + 3} 30, ${50 + s.w + 1} 40 `
    + `L ${50 + s.w - 2} 34 C ${50 + s.w - 1} 26, ${50 + s.w * 0.5} 23, 50 23 `
    + `C ${50 - s.w * 0.5} 23, ${50 - s.w + 1} 26, ${50 - s.w + 2} 34 `
    + `L ${50 - s.w - 1} 40 C ${50 - s.w - 3} 30, ${50 - s.w - 2} 16, 50 16 Z`,
  topknot: (s) => HAIR.short(s) + ` M 50 8 C 56 8, 58 14, 54 18 L 46 18 C 42 14, 44 8, 50 8 Z`,
  braid: (s) => HAIR.short(s)
    + ` M ${50 + s.w} 40 C ${50 + s.w + 6} 52, ${50 + s.w + 3} 66, ${50 + s.w + 6} 78 `
    + `L ${50 + s.w} 78 C ${50 + s.w - 3} 64, ${50 + s.w - 1} 52, ${50 + s.w - 4} 42 Z`,
};

// ── 肩・衣 ─────────────────────────────────────
// 材質は輪郭ではなく、調子と技法で分ける。
//   鎖・鱗   点刻を混ぜる
//   板金     調子を浅く、稜だけ濃く
//   布       調子を中庸に、襞の線を長く
//   毛皮     調子を深く、線を短く散らす
export const GARMENTS = {
  mail:    { t: 0.52, stip: 0.34, angle: 34 },
  plate:   { t: 0.30, stip: 0,    angle: 22 },
  robe:    { t: 0.38, stip: 0,    angle: 46 },
  fur:     { t: 0.58, stip: 0.18, angle: 62 },
  leather: { t: 0.44, stip: 0,    angle: 30 },
  bare:    { t: 0.26, stip: 0,    angle: 40 },
};

// 肩。円弧で結ぶと鐘になる。肩先を張らせ、そこから腕を落とす。
const shoulders = () =>
  `M 50 67 C 42 68, 34 71, 28 76 C 22 80, 17 84, 14 90 `
  + `C 10 98, 8 108, 7 120 L 93 120 C 92 108, 90 98, 86 90 `
  + `C 83 84, 78 80, 72 76 C 66 71, 58 68, 50 67 Z`;

const neck = () => 'M 41 58 L 59 58 L 59 74 C 55 78, 45 78, 41 74 Z';

// ── 一点を組む ──────────────────────────────────
// 光源は左上に固定。全 150 点で動かさない。
export function bust(spec) {
  // 刷り上がり 18mm ／ 座標系 100 単位。彫りの目は実寸で決まる。
  const MPU = (spec.mm ?? 18) / 100;
  const s = { ...SKULLS[spec.race ?? 'human'] };
  const g = GARMENTS[spec.garment ?? 'robe'];
  const seed = spec.id ?? 'b';
  const H = head(s), E = ears(s), N = neck(), S = shoulders();
  const gear = (HEADGEAR[spec.headgear ?? 'none'] || (() => ''))(s);
  const hair = (HAIR[spec.hair ?? 'none'] || (() => ''))(s);

  // 陰の領域。顔は描かず、陰だけを置く。
  const w = s.w;
  const shadeSide = `M 50 17 L ${50 + w + 2} 20 L ${50 + w + 2} ${40 + 26 * s.jaw} L 50 ${40 + 26 * s.jaw} Z`;
  // 眼窩。左右に分ける。横一本の帯にすると、全員が目隠しをしているように見える。
  const socket = (sx) =>
    `M ${50 + sx * w * 0.26} 35 C ${50 + sx * w * 0.5} 33, ${50 + sx * w * 0.82} 34, ${50 + sx * w * 0.86} 37 `
    + `C ${50 + sx * w * 0.8} 41, ${50 + sx * w * 0.45} 42, ${50 + sx * w * 0.26} 40 Z`;
  const browShade = socket(1) + ' ' + socket(-1);
  const noseShade = `M 50 38 L ${50 + 4.4} 52 L 50 55 L ${50 - 1.6} 52 Z`;
  const neckShade = `M 41 59 C 45 66, 55 66, 59 59 L 59 76 C 55 79, 45 79, 41 76 Z`;

  const P = [];
  // 衣
  P.push(engrave(S, { t: g.t, angle: g.angle, box: [6, 64, 94, 120], seed: seed + 'g', mmPerUnit: MPU }));
  if (g.stip) P.push(stipple(S, { t: g.stip, box: [6, 64, 94, 120], seed: seed + 'gs', mmPerUnit: MPU }));
  P.push(contour(S, { w: 0.068, mmPerUnit: MPU }));
  // 首
  P.push(engrave(N, { t: 0.30, angle: 72, box: [40, 56, 60, 78], seed: seed + 'n', mmPerUnit: MPU }));
  P.push(engrave(neckShade, { t: 0.56, angle: 72, box: [40, 58, 60, 78], seed: seed + 'ns', mmPerUnit: MPU }));
  P.push(contour(N, { w: 0.055, mmPerUnit: MPU }));
  // 耳
  if (E) { P.push(engrave(E, { t: 0.34, angle: 50, box: [10, 2, 90, 50], seed: seed + 'e', mmPerUnit: MPU })); P.push(contour(E, { w: 0.055, mmPerUnit: MPU })); }
  // 顔
  P.push(engrave(H, { t: 0.13, angle: 74, box: [20, 14, 80, 72], seed: seed + 'f', mmPerUnit: MPU }));
  P.push(`<g clip-path="url(#hc${seed})">`
    + engrave(shadeSide, { t: 0.40, angle: 74, box: [48, 14, 82, 72], seed: seed + 'fs', mmPerUnit: MPU })
    + engrave(browShade, { t: 0.44, angle: 16, box: [24, 31, 76, 44], seed: seed + 'fb', mmPerUnit: MPU })
    + engrave(noseShade, { t: 0.44, angle: 84, box: [46, 36, 58, 58], seed: seed + 'fn', mmPerUnit: MPU })
    + `</g>`);
  P.push(contour(H, { w: 0.068, mmPerUnit: MPU }));
  if (s.crest) {
    const cr = `M 50 ${17} C ${50 + 3} 12, ${50 + 4} 6, ${50 + 2} 2 `
      + `C ${50 + 9} 6, ${50 + 12} 16, ${50 + 8} 26 `
      + `C ${50 + 6} 22, ${50 + 3} 19, 50 17 Z`
      + ` M 50 22 C ${50 + 4} 20, ${50 + 8} 22, ${50 + 11} 30 `
      + `C ${50 + 6} 29, ${50 + 3} 28, 50 28 Z`;
    P.push(engrave(cr, { t: 0.5, angle: 60, box: [46, 0, 64, 32], seed: seed + 'c', mmPerUnit: MPU }));
    P.push(contour(cr, { w: 0.055, mmPerUnit: MPU }));
  }
  if (s.tusk) P.push(`<path fill="#fff" stroke="${INK}" stroke-width="${(0.075 / MPU).toFixed(3)}" `
    + `d="M ${50 - w * 0.5} ${40 + 23 * s.jaw} l 3.4 -9.5 l 3.2 9.5 Z `
    + `M ${50 + w * 0.5} ${40 + 23 * s.jaw} l -3.4 -9.5 l -3.2 9.5 Z"/>`);
  // 髪・被り物は顔の上
  if (hair) { P.push(engrave(hair, { t: 0.62, angle: 84, box: [10, 4, 90, 80], seed: seed + 'h', mmPerUnit: MPU })); P.push(contour(hair, { w: 0.061, mmPerUnit: MPU })); }
  if (gear) {
    P.push(engrave(gear, { t: spec.headgear === 'plate' ? 0.3 : 0.48, angle: 28, box: [4, 0, 96, 70], seed: seed + 'k', mmPerUnit: MPU }));
    P.push(contour(gear, { w: 0.068, mmPerUnit: MPU }));
  }

  return `<svg class="bust" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">`
    + `<defs><clipPath id="hc${seed}"><path d="${H}"/></clipPath></defs>`
    + `<rect width="100" height="120" fill="#fff"/>`
    + P.filter(Boolean).join('')
    + `</svg>`;
}
