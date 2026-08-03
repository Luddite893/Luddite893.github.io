// 人物図版（上半身像）の生成　——　第二版
//
// 改訂提案 三「人物図版の個体化」への実装。
//
// ── 初版で何が起きていたか ──────────────────────────
// 初版の胸像は四層（頭蓋・被り物・髪・衣）の組み合わせだった。
// 層が四つでは、149 人を配ると必ず衝突する。
// 「ノルドの男が兜をかぶって鎖を着ている」人物は、内円にも軍団にも山賊にもいる。
// そこまでしか記述していないのだから、同じ絵が出るのは当然である。
// 画風が揃いすぎたのではない。**記述の解像度が足りなかった**。
//
// ── 第二版の方針 ──────────────────────────────
// 統一する層と、割る層を分ける。
//   統一する　……　線の引き方・調子の表・光源（左上）・骨格の比率・枠の寸法
//   割る　　　……　顔・体格・姿勢・持物・傷・装いの細部
//
// 層は十。うち八層は生成系が組み合わせで作り、
// 残り二層（持物・身体的特徴）は**生成系の外から個別に与える**。
// 「その人にしかないもの」を組み合わせ表の中に置くと、
// 表の中で必ず再利用され、固有でなくなるからである。
//
// ── 顔について ────────────────────────────────
// 初版は顔を描かなかった。これは姉妹編『暁の砕き手』の規定を
// 横断的に適用したものだった。本書にその制約は無い。第二版で解禁する。
// ただし顔は**線で描き、調子では描かない**。
// 34mm の図版で目鼻を陰影で作ると泥になる。輪郭線なら残る。

import { engrave, stipple, contour } from './engrave.mjs';
import { SKULLS, HEADGEAR, HAIR } from './busts.mjs';
import { CUTS } from './scene.mjs';

const INK = '#1b1b1a';
const W = 100, H = 150;

// ── 層 7　体格。肩幅と首の太さを決める。 ──────────────────
export const BUILDS = {
  slight: { sh: 0.86, neck: 0.88 },
  normal: { sh: 1.00, neck: 1.00 },
  broad:  { sh: 1.16, neck: 1.14 },
};

// ── 層 8　姿勢。上体の傾きと肩の高さ差。 ────────────────
// 正面像ばかり並べると名簿になる。ここが効く。
export const POSES = {
  frontal: { tilt: 0,    dx: 0,   drop: 0 },
  quarter: { tilt: -4,   dx: -3,  drop: 3 },
  turned:  { tilt: 7,    dx: 4,   drop: -4 },
  bowed:   { tilt: 2,    dx: 0,   drop: 6, head: 5 },
};

// ── 層 4　髭 ─────────────────────────────────
export const BEARDS = {
  none: () => '',
  stubble: (s, cy, chin) => null,          // 陰で示す。輪郭は持たない
  full: (s, cy, chin) => `M ${50 - s.w * 0.78} ${cy + 6} `
    + `C ${50 - s.w * 0.9} ${chin + 4}, ${50 - s.w * 0.4} ${chin + 13}, 50 ${chin + 14} `
    + `C ${50 + s.w * 0.4} ${chin + 13}, ${50 + s.w * 0.9} ${chin + 4}, ${50 + s.w * 0.78} ${cy + 6} `
    + `C ${50 + s.w * 0.6} ${cy + 13}, ${50 - s.w * 0.6} ${cy + 13}, ${50 - s.w * 0.78} ${cy + 6} Z`,
  braided: (s, cy, chin) => BEARDS.full(s, cy, chin)
    + ` M ${50 - 5} ${chin + 12} L ${50 + 5} ${chin + 12} L ${50 + 3.4} ${chin + 26} `
    + `L ${50 - 3.4} ${chin + 26} Z`,
  moustache: (s, cy, chin) => `M ${50 - s.w * 0.62} ${cy + 12} `
    + `C ${50 - s.w * 0.4} ${cy + 9}, ${50 + s.w * 0.4} ${cy + 9}, ${50 + s.w * 0.62} ${cy + 12} `
    + `C ${50 + s.w * 0.4} ${cy + 16}, ${50 - s.w * 0.4} ${cy + 16}, ${50 - s.w * 0.62} ${cy + 12} Z`,
};

// ── 層 2　顔。線だけで引く。 ───────────────────────
// 表情は四種。目尻と口角の角度だけで作る。眉と瞼は共有する。
export const FACES = {
  calm:  { brow: 0,    eye: 0,    mouth: 0 },
  stern: { brow: -2.2, eye: -0.8, mouth: -1.4 },
  weary: { brow: 1.6,  eye: 1.2,  mouth: 1.0 },
  wry:   { brow: -1.0, eye: -0.3, mouth: -2.2, skew: 1 },
};

function face(s, f, cy, opts = {}) {
  const w = s.w, ex = w * 0.42, ey = cy - 3;
  const L = [];
  const eye = (sx) => {
    const cxe = 50 + sx * ex, t = f.eye * sx * 0 + f.eye;
    // 上瞼は強く、下瞼は弱く。銅版画の肖像はどれもそうしている。
    L.push(`M ${cxe - 4.6} ${ey + 0.4} C ${cxe - 2.4} ${ey - 3.2 - t}, ${cxe + 2.4} ${ey - 3.2 - t}, ${cxe + 4.6} ${ey + 0.4}`);
    L.push(`M ${cxe - 4.2} ${ey + 0.8} C ${cxe - 2} ${ey + 3.0}, ${cxe + 2} ${ey + 3.0}, ${cxe + 4.2} ${ey + 0.8}`);
    if (!opts.blind) L.push(`M ${cxe - 1.5} ${ey + 0.2} a 1.5 1.6 0 1 0 3 0 a 1.5 1.6 0 1 0 -3 0`);
  };
  const brow = (sx) => {
    const cxe = 50 + sx * ex;
    L.push(`M ${cxe - 5.4} ${ey - 5.6 + f.brow * sx * 0} C ${cxe - 2} ${ey - 7.8 - f.brow}, `
      + `${cxe + 2.6} ${ey - 7.4 - f.brow}, ${cxe + 5.4} ${ey - 5.0}`);
  };
  brow(-1); brow(1); eye(-1); eye(1);
  // 鼻。稜と小鼻だけ。鼻孔は描かない（34mm で潰れる）
  L.push(`M ${50 - 1.2} ${ey + 1} C ${50 - 2.2} ${ey + 8}, ${50 - 3.4} ${ey + 11}, ${50 - 0.6} ${ey + 12.4}`);
  L.push(`M ${50 - 3.6} ${ey + 12.6} C ${50 - 1} ${ey + 14.4}, ${50 + 1} ${ey + 14.4}, ${50 + 3.6} ${ey + 12.6}`);
  // 口
  const my = ey + 18.6, sk = (f.skew ? 1.6 : 0);
  L.push(`M ${50 - w * 0.28} ${my + f.mouth * 0.4} C ${50 - w * 0.10} ${my + f.mouth + sk}, `
    + `${50 + w * 0.10} ${my + f.mouth - sk}, ${50 + w * 0.28} ${my - f.mouth * 0.4}`);
  return L;
}

// ── 層 10　身体的特徴。生成系の外から与える。 ─────────────
export const MARKS = {
  none: () => [],
  scar: (s, cy) => [`M ${50 + s.w * 0.30} ${cy - 13} L ${50 + s.w * 0.62} ${cy + 5}`],
  eyepatch: (s, cy) => [
    `M ${50 + s.w * 0.18} ${cy - 8} L ${50 + s.w * 0.86} ${cy - 9.5} `
    + `L ${50 + s.w * 0.88} ${cy + 2} L ${50 + s.w * 0.2} ${cy + 1.5} Z`,
    `M ${50 - s.w * 0.95} ${cy - 11} L ${50 + s.w * 0.95} ${cy - 13}`,
  ],
  aged: (s, cy) => [
    `M ${50 - s.w * 0.72} ${cy + 4} C ${50 - s.w * 0.5} ${cy + 9}, ${50 - s.w * 0.42} ${cy + 14}, ${50 - s.w * 0.46} ${cy + 18}`,
    `M ${50 + s.w * 0.72} ${cy + 4} C ${50 + s.w * 0.5} ${cy + 9}, ${50 + s.w * 0.42} ${cy + 14}, ${50 + s.w * 0.46} ${cy + 18}`,
    `M ${50 - s.w * 0.5} ${cy - 12.5} L ${50 - s.w * 0.16} ${cy - 13.2}`,
  ],
  earless: (s, cy) => [],   // 耳を落とすのは輪郭側で処理する
};

// ── 層 9　持物。小カットの語彙をそのまま使う。 ───────────
// 語彙を共有すると、持物と巻末の図版が同じ手で彫られたものになる。
// 位置は胸の前に固定。人ごとに変えると、並べたとき視線が散る。
function prop(kind, MPU, seed) {
  const d = CUTS[kind];
  if (!d) return '';
  const S = 0.30, X = 60, Y = 96;      // 100 単位系 → 30 単位に縮めて胸前へ。枠に収める
  const g = (body) => `<g transform="translate(${X} ${Y}) scale(${S})">${body}</g>`;
  return g(`<path d="${d}" fill="#fff"/>`
    + engrave(d, { t: 0.34, angle: 40, box: [0, 0, 100, 100], seed: seed + 'p', mmPerUnit: MPU * S })
    + contour(d, { w: 0.085 / S, mmPerUnit: MPU }));
}

// ── 一点を組む ──────────────────────────────────
export function figure(spec) {
  // 刷り上がり 34mm ／ 座標系 100 単位。
  const MPU = (spec.mm ?? 34) / 100;
  const s = { ...SKULLS[spec.race ?? 'human'] };
  const b = BUILDS[spec.build ?? 'normal'];
  const po = POSES[spec.pose ?? 'frontal'];
  const f = FACES[spec.face ?? 'calm'];
  const seed = spec.id ?? 'f';
  const G = {
    mail:    { t: 0.52, stip: 0.34, angle: 34 },
    plate:   { t: 0.30, stip: 0,    angle: 22 },
    robe:    { t: 0.38, stip: 0,    angle: 46 },
    fur:     { t: 0.58, stip: 0.18, angle: 62 },
    leather: { t: 0.44, stip: 0,    angle: 30 },
    bare:    { t: 0.26, stip: 0,    angle: 40 },
    apron:   { t: 0.46, stip: 0,    angle: 52 },
    cloak:   { t: 0.50, stip: 0,    angle: 58 },
  }[spec.garment ?? 'robe'];

  const cy = 44 + (po.head ?? 0);
  const chin = cy + 26 * s.jaw;
  const w = s.w;

  // 頭・首・胴。胴は肩から腕の付根まで落とす。上半身像なので胸まで見せる。
  const head = `M 50 ${cy - 23} `
    + `C ${50 + w * 0.86} ${cy - 22}, ${50 + w} ${cy - 10}, ${50 + w} ${cy + 1} `
    + `C ${50 + w} ${cy + 11}, ${50 + w * 0.72} ${cy + 17 * s.jaw}, 50 ${chin} `
    + `C ${50 - w * 0.72} ${cy + 17 * s.jaw}, ${50 - w} ${cy + 11}, ${50 - w} ${cy + 1} `
    + `C ${50 - w} ${cy - 10}, ${50 - w * 0.86} ${cy - 22}, 50 ${cy - 23} Z`;
  const nk = `M ${50 - 9 * b.neck} ${chin - 5} L ${50 + 9 * b.neck} ${chin - 5} `
    + `L ${50 + 9 * b.neck} ${chin + 8} C ${50 + 5} ${chin + 12}, ${50 - 5} ${chin + 12}, ${50 - 9 * b.neck} ${chin + 8} Z`;
  const SW = 40 * b.sh;                                  // 肩の張り
  const torso = `M 50 ${chin + 8} `
    + `C ${50 + SW * 0.42} ${chin + 10}, ${50 + SW * 0.86} ${chin + 17 + po.drop}, ${50 + SW} ${chin + 27 + po.drop} `
    + `C ${50 + SW * 1.06} ${chin + 42}, ${50 + SW * 1.02} ${H - 2}, ${50 + SW * 1.02} ${H} `
    + `L ${50 - SW * 1.02} ${H} `
    + `C ${50 - SW * 1.02} ${H - 2}, ${50 - SW * 1.06} ${chin + 42}, ${50 - SW} ${chin + 27 - po.drop} `
    + `C ${50 - SW * 0.86} ${chin + 17 - po.drop}, ${50 - SW * 0.42} ${chin + 10}, 50 ${chin + 8} Z`;
  // 襟。衣の種類で開き方が変わる。輪郭は共有する。
  // 襟。衣の開き。地より濃くすると黒い前掛けに見える。必ず薄く。
  const collar = `M 50 ${chin + 9} C ${50 + 11} ${chin + 12}, ${50 + 14} ${chin + 19}, ${50 + 12.5} ${chin + 30} `
    + `L 50 ${chin + 22} L ${50 - 12.5} ${chin + 30} `
    + `C ${50 - 14} ${chin + 19}, ${50 - 11} ${chin + 12}, 50 ${chin + 9} Z`;

  const ears = s.ear === 'none' || spec.mark === 'earless' ? ''
    : s.ear === 'point'
      ? `M ${50 + w - 1} ${cy - 6} L ${50 + w + 9} ${cy - 20} L ${50 + w + 2} ${cy + 2} Z`
        + ` M ${50 - w + 1} ${cy - 6} L ${50 - w - 9} ${cy - 20} L ${50 - w - 2} ${cy + 2} Z`
      : s.ear === 'feline'
        ? `M ${50 + w * 0.55} ${cy - 20} L ${50 + w * 0.95} ${cy - 36} L ${50 + w * 1.15} ${cy - 16} Z`
          + ` M ${50 - w * 0.55} ${cy - 20} L ${50 - w * 0.95} ${cy - 36} L ${50 - w * 1.15} ${cy - 16} Z`
        : `M ${50 + w - 1} ${cy - 6} C ${50 + w + 6} ${cy - 8}, ${50 + w + 6} ${cy + 6}, ${50 + w - 2} ${cy + 5} Z`
          + ` M ${50 - w + 1} ${cy - 6} C ${50 - w - 6} ${cy - 8}, ${50 - w - 6} ${cy + 6}, ${50 - w + 2} ${cy + 5} Z`;

  // 髪と被り物は busts の語彙を流用する。座標系の原点が違うので下げる。
  const shift = (d, dy) => d ? `<g transform="translate(0 ${dy})">${d}</g>` : '';
  const hairD = (HAIR[spec.hair ?? 'none'] || (() => ''))(s);
  const gearD = (HEADGEAR[spec.headgear ?? 'none'] || (() => ''))(s);
  const beardD = (BEARDS[spec.beard ?? 'none'] || (() => ''))(s, cy, chin);

  const P = [];
  const push = (x) => x && P.push(x);

  // 胴 → 襟 → 首 → 耳 → 顔 → 髪・髭・被り物 → 顔の線 → 持物
  push(engrave(torso, { t: G.t, angle: G.angle, box: [0, chin, W, H], seed: seed + 'g', mmPerUnit: MPU }));
  if (G.stip) push(stipple(torso, { t: G.stip, box: [0, chin, W, H], seed: seed + 'gs', mmPerUnit: MPU }));
  push(`<path d="${collar}" fill="#fff"/>`);
  push(engrave(collar, { t: Math.max(G.t - 0.20, 0.10), angle: G.angle + 40, box: [30, chin, 70, chin + 40], seed: seed + 'c', mmPerUnit: MPU }));
  push(contour(torso, { w: 0.075, mmPerUnit: MPU }));
  push(contour(collar, { w: 0.062, mmPerUnit: MPU }));

  push(engrave(nk, { t: 0.30, angle: 72, box: [36, chin - 6, 64, chin + 16], seed: seed + 'n', mmPerUnit: MPU }));
  push(contour(nk, { w: 0.058, mmPerUnit: MPU }));

  if (ears) { push(engrave(ears, { t: 0.34, angle: 50, box: [10, cy - 40, 90, cy + 10], seed: seed + 'e', mmPerUnit: MPU })); push(contour(ears, { w: 0.058, mmPerUnit: MPU })); }

  // 顔の地。ごく薄く。ここを濃くすると線が沈む。
  push(`<path d="${head}" fill="#fff"/>`);
  push(engrave(head, { t: 0.055, angle: 74, box: [20, cy - 26, 80, chin + 2], seed: seed + 'f', mmPerUnit: MPU }));
  // 側面の陰。光源は左上に固定。
  const shadeSide = `M ${50 + w * 0.42} ${cy - 21} L ${50 + w + 2} ${cy - 18} L ${50 + w + 2} ${chin - 2} L ${50 + w * 0.42} ${chin} Z`;
  push(`<g clip-path="url(#hc${seed})">`
    + engrave(shadeSide, { t: 0.22, angle: 74, box: [55, cy - 26, 82, chin + 2], seed: seed + 'fs', mmPerUnit: MPU })
    + (spec.beard === 'stubble'
      ? stipple(`M ${50 - w * 0.82} ${cy + 4} L ${50 + w * 0.82} ${cy + 4} L ${50 + w * 0.6} ${chin + 3} L ${50 - w * 0.6} ${chin + 3} Z`,
        { t: 0.5, box: [24, cy, 76, chin + 4], seed: seed + 'sb', mmPerUnit: MPU })
      : '')
    + `</g>`);
  push(contour(head, { w: 0.075, mmPerUnit: MPU }));

  // 牙。下唇の外へ出す。顎の下に置くと髭に埋もれて見えない。
  if (s.tusk) {
    const ty = cy + 17;
    push(`<path fill="#fff" stroke="${INK}" stroke-width="${(0.09 / MPU).toFixed(3)}" stroke-linejoin="round" `
      + `d="M ${50 - w * 0.46} ${ty} l 2.6 -12 l 3.4 12 Z M ${50 + w * 0.46} ${ty} l -2.6 -12 l -3.4 12 Z"/>`);
  }

  // 顔の線。調子ではなく線で引く。ここが第二版の要点。
  const lines = face(s, f, cy, { blind: spec.mark === 'eyepatch' ? 0 : 0 })
    .concat((MARKS[spec.mark ?? 'none'] || (() => []))(s, cy));
  const lw = (0.085 / MPU).toFixed(3);
  push(`<g fill="none" stroke="${INK}" stroke-width="${lw}" stroke-linecap="round">`
    + lines.map((d) => `<path d="${d}"/>`).join('') + `</g>`);
  if (spec.mark === 'eyepatch') {
    const patch = MARKS.eyepatch(s, cy)[0];
    push(`<path d="${patch}" fill="#fff"/>`
      + engrave(patch, { t: 0.62, angle: 30, box: [50, cy - 12, 80, cy + 4], seed: seed + 'ep', mmPerUnit: MPU })
      + contour(patch, { w: 0.075, mmPerUnit: MPU }));
  }

  if (beardD) {
    push(`<path d="${beardD}" fill="#fff"/>`);
    push(engrave(beardD, { t: 0.55, angle: 86, box: [20, cy, 80, chin + 30], seed: seed + 'bd', mmPerUnit: MPU }));
    push(contour(beardD, { w: 0.09, mmPerUnit: MPU }));
  }
  if (hairD) {
    const g = shift('', 0);
    push(`<g transform="translate(0 ${cy - 40})">`
      + `<path d="${hairD}" fill="#fff"/>`
      + engrave(hairD, { t: 0.46, angle: 84, box: [10, 4, 90, 80], seed: seed + 'h', mmPerUnit: MPU })
      + contour(hairD, { w: 0.062, mmPerUnit: MPU }) + `</g>`);
  }
  if (gearD) {
    push(`<g transform="translate(0 ${cy - 40})">`
      + `<path d="${gearD}" fill="#fff"/>`
      + engrave(gearD, { t: 0.48, angle: 28, box: [4, 0, 96, 70], seed: seed + 'k', mmPerUnit: MPU })
      + contour(gearD, { w: 0.075, mmPerUnit: MPU }) + `</g>`);
  }

  if (spec.prop) push(prop(spec.prop, MPU, seed));

  const body = `<g transform="translate(${po.dx} 0) rotate(${po.tilt} 50 ${H})">`
    + P.filter(Boolean).join('') + `</g>`;

  return `<svg class="figure" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`
    + `<defs><clipPath id="hc${seed}"><path d="${head}"/></clipPath></defs>`
    + `<rect width="${W}" height="${H}" fill="#fff"/>${body}</svg>`;
}

// 層の数。納品書に書く数字はここから採る。
export const LAYERS = [
  ['1　種族', Object.keys(SKULLS).length],
  ['2　顔（表情）', Object.keys(FACES).length],
  ['3　髪', Object.keys(HAIR).length],
  ['4　髭', Object.keys(BEARDS).length],
  ['5　被り物', Object.keys(HEADGEAR).length],
  ['6　装い', 8],
  ['7　体格', Object.keys(BUILDS).length],
  ['8　姿勢', Object.keys(POSES).length],
  ['9　持物（個別付与）', Object.keys(CUTS).length],
  ['10　身体的特徴（個別付与）', Object.keys(MARKS).length],
];
export const combinations = () => LAYERS.reduce((a, [, n]) => a * n, 1);
