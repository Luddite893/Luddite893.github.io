// 基準原図　人物図版　ウルフリック（ストームクローク／ウィンドヘルム）
//
// ── この図が busts.mjs と違うところ ──────────────────
// busts.mjs は「組む」系である。頭蓋 × 被り物 × 髪 × 衣の表から引き、
// 百七十四点を同じ手続きで通す。だから百七十四点とも同じ顔になる——
// というより、**顔が無い**。18mm で目鼻を線にすると潰れるからで、
// 初版はそれで正しかった。
//
// 第二版は顔を描く。顔を描くなら、組んではいけない。
// 眉の骨の張りも、目の据わりも、頬の落ちも、この一人のためだけに座標を書く。
// この図は表を一切参照していない。
//
// ── 加えた道具　肉の付いた線 ───────────────────────
// engrave.mjs の彫りは、一本の線の中では太さが一定である（両端で尖るだけ）。
// 面は出るが、**面が回り込まない**。球が球に見えない。
//
// 本図は線を細かく刻み、**節ごとの太さを陰影の場から引く**。
// 一本の線が、明るいところで消え、暗いところで太る。
// 銅版画の肖像が肖像に見えるのは、ほとんどこれ一つによる。
//
// ── 陰影の場 ──────────────────────────────────
// 手で塗らない。頭部を楕円体と見なした拡散光（光源は左上手前）に、
// 解剖に沿った窪みと張りを重ねた場を作り、線はその場を読む。
// 光源が一つの式で決まっているので、髪も毛皮も首も同じ光を受ける。
//
// ── 彫りの目 ──────────────────────────────────
// 一番手は緯線。頭という球に巻きつく線で、これが形を回す。
// 二番手は経線、三番手は斜め。閾値を超えた濃さにだけ入れる。
// すべて刷り上がりのミリで指定する。座標系で指定すると版の大小で目が変わる。

import { burin } from './engrave.mjs';

const W = 200, H = 300;
const MM = 62 / W;                       // 刷り上がり 62mm ／ 座標 200 単位
const INK = '#1b1b1a';
const f2 = (v) => v.toFixed(2);
const mm = (v) => v / MM;                // ミリ → 座標単位

const rng = (seed) => {
  let a = 0;
  for (let i = 0; i < seed.length; i++) a = (Math.imul(a ^ seed.charCodeAt(i), 2654435761) >>> 0);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

// ══════════════════════════════════════════════
// 一　陰影の場
// ══════════════════════════════════════════════

// 頭部を楕円体と見なす。顎から額までを一つの塊として光を回す。
const HEAD = { cx: 100, cy: 118, rx: 48, ry: 72 };

// 光源。左上、やや手前。全図版で固定。
const LIGHT = (() => {
  const v = [-0.50, -0.62, 0.60];
  const n = Math.hypot(...v);
  return v.map((c) => c / n);
})();

function lambert(x, y) {
  const dx = (x - HEAD.cx) / HEAD.rx, dy = (y - HEAD.cy) / HEAD.ry;
  const r2 = dx * dx + dy * dy;
  if (r2 >= 1) {
    // 楕円体の外（首・肩・髪）は縁の法線を延長して受ける
    const k = 1 / Math.sqrt(r2);
    return Math.max(0, dx * k * LIGHT[0] + dy * k * LIGHT[1]) * 0.72;
  }
  const nz = Math.sqrt(1 - r2);
  return Math.max(0, dx * LIGHT[0] + dy * LIGHT[1] + nz * LIGHT[2]);
}

// 解剖の窪みと張り。[x, y, rx, ry, 量, 回転度]　量が正で暗く、負で明るい。
// 一つずつ意味を書く。書けない窪みは置かない。
const BLOBS = [
  [ 79, 110, 13,  8,  0.34,   6],   // 左眼窩　眉骨の下の影
  [123, 110, 13,  8,  0.42,  -6],   // 右眼窩　陰の側なので深い
  [ 78,  99, 15,  5,  0.22,   8],   // 左眉の下
  [124,  99, 15,  5,  0.28,  -8],   // 右眉の下
  [ 60,  96,  9, 14,  0.26,   0],   // 左こめかみの窪み
  [140,  96,  9, 14,  0.34,   0],   // 右こめかみの窪み
  [ 91, 126,  5, 20,  0.14,   4],   // 鼻梁の左の落ち
  [111, 126,  5, 22,  0.30,  -4],   // 鼻梁の右の落ち（陰の側）
  [ 89, 145,  4,  4,  0.40,   0],   // 左小鼻の影
  [112, 145,  4,  4,  0.46,   0],   // 右小鼻の影
  [100, 151, 10,  5,  0.40,   0],   // 鼻の下　鼻先はここで示す。輪郭は引かない
  [103, 139,  7,  6,  0.20,   0],   // 鼻先の右の落ち
  [ 70, 132, 11, 13,  0.20,  10],   // 左頬の落ち（四十代の頬）
  [131, 132, 11, 14,  0.32, -10],   // 右頬の落ち
  [100, 168, 12,  5,  0.26,   0],   // 下唇の下
  [100, 186, 16,  7,  0.22,   0],   // 顎の下の返し
  [100, 200, 40, 11,  0.40,   0],   // 顎が首に落とす影
  [ 62, 176, 12, 20,  0.30,   0],   // 左顎角の陰（髪が落とす）
  [138, 176, 12, 20,  0.42,   0],   // 右顎角の陰
  [ 83,  86, 16,  8, -0.20,   0],   // 左の額の張り　抜く
  [ 76, 122, 11,  9, -0.16,   0],   // 左頬骨の張り　抜く
  [100, 124,  4, 18, -0.14,   0],   // 鼻梁の稜　抜く
  [100, 180,  8,  6, -0.12,   0],   // 顎の張り　抜く
  [145, 132,  5, 26, -0.20,   0],   // 陰の側の縁の回り込み　抜く
  [147,  98,  5, 16, -0.14,   0],   // 同上　こめかみ
];

function blobs(x, y) {
  let s = 0;
  for (const [bx, by, rx, ry, amp, rot] of BLOBS) {
    const r = (rot * Math.PI) / 180;
    const px = (x - bx) * Math.cos(r) + (y - by) * Math.sin(r);
    const py = -(x - bx) * Math.sin(r) + (y - by) * Math.cos(r);
    const u = px / rx, v = py / ry;
    s += amp * Math.exp(-(u * u + v * v) * 1.5);
  }
  return s;
}

// 場そのもの。0 が紙の白、1 が最も深い彫り。
function shade(x, y) {
  return clamp(0.03 + 1.00 * Math.pow(1 - lambert(x, y), 1.00) + blobs(x, y));
}

// ══════════════════════════════════════════════
// 二　肉の付いた線
// ══════════════════════════════════════════════
// 折れ線を受け取り、節ごとに陰影の場を読んで太さを決める。
// 場が薄いところでは線を切る。白は塗り残しではなく、紙の白である。
function vein(pts, seed, o = {}) {
  const { min = 0.020, max = 0.078, cut = 0.11, gain = 1, bias = 0, fixed = null, w8 = null } = o;
  const R = rng(seed);
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    // 重み。**形の縁で彫りを細らせる**ためにある。
    // clipPath で切ると切り口が直線になり、そこが輪郭に見えてしまう。
    let s = fixed !== null ? fixed : clamp(shade(mx, my) * gain + bias);
    if (w8) s *= w8(mx, my);
    if (s < cut) continue;
    const w = mm(min + (max - min) * ((s - cut) / (1 - cut)));
    d += burin(x0, y0, x1, y1, w * (0.80 + R() * 0.40), 0.34 + R() * 0.32);
  }
  return d;
}

// ── 緯線　球に巻きつく ──────────────────────────
// 上ほど縁が下がり、下ほど縁が上がる。球面の緯度円の投影。
function latitudes(y0, y1, x0, x1, gapMM, bow, seed, step = 3.4) {
  const R = rng(seed);
  const gap = mm(gapMM);
  const out = [];
  for (let y = y0; y <= y1; y += gap * (1 + (R() - 0.5) * 0.34)) {
    const u = (y - y0) / (y1 - y0);
    const k = bow * (1 - 2 * u);
    const wob = (R() - 0.5) * 0.5;
    const pts = [];
    for (let x = x0; x <= x1; x += step) {
      const dx = (x - HEAD.cx) / HEAD.rx;
      pts.push([x, y + k * dx * dx + wob]);
    }
    out.push(pts);
  }
  return out;
}

// ── 経線　球を縦に割る ──────────────────────────
function longitudes(x0, x1, y0, y1, gapMM, bow, seed, step = 3.4) {
  const R = rng(seed);
  const gap = mm(gapMM);
  const out = [];
  for (let x = x0; x <= x1; x += gap * (1 + (R() - 0.5) * 0.34)) {
    const u = (x - x0) / (x1 - x0);
    const k = bow * (1 - 2 * u);
    const pts = [];
    for (let y = y0; y <= y1; y += step) {
      const dy = (y - HEAD.cy) / HEAD.ry;
      pts.push([x + k * dy * dy, y]);
    }
    out.push(pts);
  }
  return out;
}

// ── 斜線　三番手 ────────────────────────────────
function diagonals(box, gapMM, deg, seed, step = 3.6) {
  const R = rng(seed);
  const [x0, y0, x1, y1] = box;
  const gap = mm(gapMM);
  const rad = (deg * Math.PI) / 180;
  const ux = Math.cos(rad), uy = Math.sin(rad);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const span = Math.hypot(x1 - x0, y1 - y0) * 0.62;
  const out = [];
  for (let s = -span; s <= span; s += gap * (1 + (R() - 0.5) * 0.3)) {
    const px = cx - uy * s, py = cy + ux * s;
    const pts = [];
    for (let t = -span; t <= span; t += step) pts.push([px + ux * t, py + uy * t]);
    out.push(pts);
  }
  return out;
}

const strokes = (fams, seed, o) =>
  fams.map((p, i) => vein(p, seed + i, o)).join('');

// ── 輪郭 ────────────────────────────────────────
// 銅版画の輪郭は全周に回さない。陰の側と下側にだけ入れる。
// 明るい側の輪郭は、彫りが終わるところが輪郭になる。
const S = (d, w = 0.10, op = 1) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${mm(w).toFixed(3)}" `
  + `stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const Bd = (d) => `<path d="${d}" fill="${INK}"/>`;

// ══════════════════════════════════════════════
// 三　形
// ══════════════════════════════════════════════
// 以下の座標は、この一人のためだけに書いた。他の点と共有しない。

// 頭蓋と顎。ノルドなので頬骨が張り、顎が角ばる。
const FACE = 'M 100 48 '
  + 'C 123 48, 141 62, 146 88 '
  + 'C 149 102, 149 114, 147 128 '
  + 'C 145 144, 140 158, 130 169 '
  + 'C 121 179, 110 184, 100 184 '
  + 'C 90 184, 79 179, 70 169 '
  + 'C 60 158, 55 144, 53 128 '
  + 'C 51 114, 51 102, 54 88 '
  + 'C 59 62, 77 48, 100 48 Z';

// 首。顎の下に落ち、僧帽筋へ広がる。
const NECK = 'M 74 150 L 74 192 C 74 202, 69 210, 60 217 '
  + 'L 140 217 C 131 210, 126 202, 126 192 L 126 150 Z';

// 肩。円弧で結ぶと鐘になる。肩先を張らせ、そこから腕を落とす。
const SHOULDER = 'M 100 206 C 76 207, 55 213, 39 226 '
  + 'C 23 239, 12 262, 6 300 L 194 300 C 188 262, 177 239, 161 226 '
  + 'C 145 213, 124 207, 100 206 Z';

// 毛皮の襟。肩の上に載る塊で、輪郭を毛の束で刻む。
const MANTLE = (() => {
  const R = rng('mantle-edge');
  // 内側の縁（首を囲む）と外側の縁（肩を覆う）
  let inner = '';
  const pts = [];
  for (let a = -Math.PI * 0.94; a <= Math.PI * -0.06; a += 0.10) {
    const x = 100 + Math.cos(a) * 46, y = 214 + Math.sin(a) * 26;
    pts.push([x, y + (R() - 0.5) * 2.4]);
  }
  inner = 'M ' + pts.map(([x, y]) => `${f2(x)} ${f2(y)}`).join(' L ');
  return 'M 100 208 C 74 209, 52 217, 36 232 C 20 247, 10 268, 5 300 '
    + 'L 195 300 C 190 268, 180 247, 164 232 C 148 217, 126 209, 100 208 Z'
    + ' ' + inner + ' Z';
})();

// 髪。長く、肩を越えて落ちる。内側の縁が頬の外を通る。
const HAIR = 'M 100 41 '
  + 'C 78 41, 62 55, 55 82 '
  + 'C 51 106, 48 134, 48 164 '
  + 'C 48 194, 50 222, 54 246 '
  + 'C 61 252, 71 251, 76 245 '
  + 'C 73 220, 71 194, 72 170 '
  + 'C 73 146, 70 122, 66 106 '
  + 'C 62 92, 66 82, 76 77 '
  + 'C 83 74, 91 73, 100 73 '
  + 'C 109 73, 117 74, 124 77 '
  + 'C 134 82, 138 92, 134 106 '
  + 'C 130 122, 127 146, 128 170 '
  + 'C 129 194, 127 220, 124 245 '
  + 'C 129 251, 139 252, 146 246 '
  + 'C 150 222, 152 194, 152 164 '
  + 'C 152 134, 149 106, 145 82 '
  + 'C 138 55, 122 41, 100 41 Z';

// 髪の乗る面。顔の楕円体より僅かに大きい。
const SCALP = { cx: 96, cy: 116, rx: 47, ry: 70 };

// 髭。頬骨の下から顎を包む。口の下で切れる。
const BEARD = 'M 68 140 C 66 162, 73 181, 86 190 '
  + 'C 92 195, 108 195, 114 190 C 127 181, 134 162, 132 140 '
  + 'C 128 158, 120 168, 100 170 C 80 168, 72 158, 68 140 Z';
const MOUSTACHE = 'M 83 149 C 89 144, 95 147, 100 147 C 105 147, 111 144, 117 149 '
  + 'C 113 157, 107 155, 100 155 C 93 155, 87 157, 83 149 Z';

// 環冠。細い金属の輪。額を横切り、両端は髪に隠れる。
const CIRCLET = 'M 67 91 C 77 81, 88 78, 100 78 C 112 78, 123 81, 133 91 '
  + 'L 133 94.6 C 123 85, 112 82, 100 82 C 88 82, 77 85, 67 94.6 Z';

// 目。瞼の合わせが目の性格を決める。ここだけは節を細かく置く。
const EYE = (sx) => {
  // sx = -1 左（見る側の左）／ +1 右
  const cx = 100 + sx * 22, cy = 113;
  return {
    cx, cy,
    // 上瞼　外側三分の一で最も厚い
    lidUp: `M ${cx - sx * 10.5} ${cy + 1} C ${cx - sx * 7} ${cy - 5}, ${cx + sx * 3} ${cy - 5.6}, ${cx + sx * 9.5} ${cy - 1}`,
    // 下瞼　薄く、外へ向けて下がる
    lidLo: `M ${cx - sx * 10.5} ${cy + 1} C ${cx - sx * 5} ${cy + 5.4}, ${cx + sx * 3.5} ${cy + 5.4}, ${cx + sx * 9.5} ${cy - 1}`,
    // 眼球の開口部（虹彩を切り抜く枠）
    open: `M ${cx - sx * 10.5} ${cy + 1} C ${cx - sx * 7} ${cy - 5}, ${cx + sx * 3} ${cy - 5.6}, ${cx + sx * 9.5} ${cy - 1} `
      + `C ${cx + sx * 3.5} ${cy + 5.4}, ${cx - sx * 5} ${cy + 5.4}, ${cx - sx * 10.5} ${cy + 1} Z`,
    // 上瞼の窪み（四十代なので深い）
    crease: `M ${cx - sx * 12} ${cy - 3} C ${cx - sx * 7} ${cy - 11}, ${cx + sx * 5} ${cy - 12}, ${cx + sx * 12} ${cy - 5}`,
    // 下の膨らみ
    bag: `M ${cx - sx * 10} ${cy + 5} C ${cx - sx * 4} ${cy + 10}, ${cx + sx * 4} ${cy + 10}, ${cx + sx * 10} ${cy + 3}`,
    iris: [cx + sx * 0.5, cy - 1.6, 4.9],
  };
};

// 眉。ノルドの眉骨は張る。毛は内から外へ流れ、外側で下がる。
const BROW = (sx) => {
  const x = 100 + sx * 22;
  return `M ${x - sx * 15} ${100} C ${x - sx * 8} ${94}, ${x + sx * 5} ${93}, ${x + sx * 14} ${99} `
    + `C ${x + sx * 6} ${97}, ${x - sx * 7} ${99}, ${x - sx * 15} ${104} Z`;
};

// 鼻。ノルドの高い鼻梁。小鼻は張る。
const NOSE_BRIDGE = 'M 96 104 C 94 118, 93 132, 91 141';
const NOSE_ALA_L = 'M 89 141 C 85 141, 83 145, 85 148 C 88 151, 93 150, 95 146';
const NOSE_ALA_R = 'M 111 141 C 115 141, 117 145, 115 148 C 112 151, 107 150, 105 146';
const NOSE_BASE = 'M 92 147 C 96 149, 104 149, 108 147';
const NOSTRIL_L = 'M 88 146 C 90 144, 93 145, 94 147';
const NOSTRIL_R = 'M 112 146 C 110 144, 107 145, 106 147';
const NOSE_TIP = 'M 94 138 C 97 135, 103 135, 106 138 C 104 143, 96 143, 94 138';

// 口。閉じている。真一文字にすると人形になるので、口角を落とし、
// 上唇の弓を左右で僅かに違えておく。
const MOUTH = 'M 82 158 C 88 155, 94 157, 100 156 C 106 157, 113 155, 119 158';
const MOUTH_UNDER = 'M 84 159 C 90 163, 110 163, 117 159';
const LIP_LO = 'M 88 160 C 93 166, 107 166, 113 160';

// 頬の傷（ウィンドヘルムの記録にある）
const SCAR = 'M 70 124 C 74 133, 77 141, 79 148';

// ══════════════════════════════════════════════
// 四　彫る
// ══════════════════════════════════════════════

let cid = 0;
const clip = (d, body, rule = 'nonzero') => {
  const id = `u${++cid}`;
  return `<clipPath id="${id}" clip-rule="${rule}"><path d="${d}" clip-rule="${rule}"/></clipPath>`
    + `<g clip-path="url(#${id})">${body}</g>`;
};

// 「この形以外」。clipPath は交わりしか書けないので、抜くときは mask を使う。
// **髪の下の肌を彫ってはいけない。** 彫ったうえに髪を疎に置くと、
// 髪が透けて禿頭に見える。第一稿がそれで失敗した。
const maskOut = (dList, body) => {
  const id = `m${++cid}`;
  return `<mask id="${id}"><rect width="${W}" height="${H}" fill="#fff"/>`
    + dList.map((d) => `<path d="${d}" fill="#000"/>`).join('') + `</mask>`
    + `<g mask="url(#${id})">${body}</g>`;
};


// ══════════════════════════════════════════════
// 四　彫る
// ══════════════════════════════════════════════

// 楕円の内で 1、縁で 0 へ落ちる重み。
// **形の縁を clipPath で切ると、切り口がそのまま輪郭に見える。**
// 髭の縁・首の縁は輪郭を持たない部位なので、重みで消す。
const fall = (x, y, cx, cy, rx, ry, soft = 0.35) => {
  const u = (x - cx) / rx, v = (y - cy) / ry;
  return clamp((1 - Math.sqrt(u * u + v * v)) / soft);
};

// 頭の内側で 1、輪郭の手前で 0。髭と首の裾を殺すのに使う。
const inHead = (x, y) => fall(x, y, 100, 118, 47.5, 69, 0.16);

// 髭の生えている量。短く刈った髭で、顎と頬の下だけ。
// 下唇は出す。ここを埋めると口が消える。
function beardAt(x, y) {
  const outer = fall(x, y, 100, 163, 41, 35, 0.40);
  const above = fall(x, y, 100, 133, 32, 27, 0.55);     // 頬骨より上は生えない
  const lip = fall(x, y, 100, 162, 12, 7.5, 0.75);      // 下唇を空ける
  return clamp(outer - above * 1.15 - lip * 0.9) * inHead(x, y);
}

export function ulfric(opts = {}) {
  const { circlet = true, scar = false } = opts;
  const P = [];
  const push = (s) => P.push(s);
  const eL = EYE(-1), eR = EYE(1);
  const FACE_HATCH = `${FACE} ${eL.open} ${eR.open}`;

  // ── 毛皮の襟 ────────────────────────────────
  // 毛は線ではなく短い打ちの束である。長い線を引くと布になる。
  // 下辺へ向けて淡くする。四辺すべてが同じ濃さだと、図が額縁の中で窒息する。
  {
    const R = rng('fur');
    let d = '';
    for (let i = 0; i < 4600; i++) {
      const x = 2 + R() * 196, y = 206 + R() * 96;
      const depth = clamp(1 - (y - 250) / 70);            // 裾を抜く
      const s = clamp((shade(x, y) * 0.52 + 0.14) * (0.55 + 0.45 * depth));
      if (R() > 0.14 + s * 0.80) continue;
      const a = Math.atan2(y - 206, x - 100) + (R() - 0.5) * 1.6;
      const len = 2.2 + R() * 5.0;
      d += burin(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len,
        mm(0.016 + 0.044 * s) * (0.7 + R() * 0.6), 0.30 + R() * 0.3);
    }
    push(clip(MANTLE, `<path fill="${INK}" d="${d}"/>`, 'evenodd'));
    // 襟の縁。毛先で刻む。連続した輪郭は引かない。
    let e = '';
    for (let a = -Math.PI * 0.97; a <= -0.03; a += 0.026) {
      const x = 100 + Math.cos(a) * 46, y = 214 + Math.sin(a) * 26;
      const n = 2.0 + R() * 4.2;
      e += burin(x, y, x + Math.cos(a) * n * 0.5, y + Math.sin(a) * n,
        mm(0.028) * (0.7 + R() * 0.7), 0.4);
    }
    push(`<path fill="${INK}" d="${e}"/>`);
  }

  // ── 首 ────────────────────────────────────
  // 両脇を重みで抜く。矩形に彫ると首が筒になる。
  {
    const fam = longitudes(70, 130, 150, 218, 0.44, 5, 'nk');
    const w8 = (x, y) => clamp((1 - Math.abs(x - 100) / 30) / 0.35)
      * clamp((216 - y) / 14) * clamp((y - 150) / 10);
    push(clip(NECK, `<path fill="${INK}" d="${strokes(fam, 'nk', { gain: 1.02, bias: 0.05, cut: 0.13, w8 })}"/>`));
    push(S('M 83 170 C 87 187, 92 200, 98 212', 0.080, 0.42));
    push(S('M 119 172 C 116 189, 111 202, 106 213', 0.080, 0.32));
  }

  // ── 髪 ────────────────────────────────────
  // 房は分け目から**経線として扇に開く**。同じ楕円の上をなぞらせると
  // 三百本が一本に重なり、頭頂が禿げる。第二稿がそれで失敗した。
  {
    const SC = { cx: 97, cy: 116, rx: 48, ry: 72 };
    const LOCKS = 300;
    let d = '';
    for (let i = 0; i < LOCKS; i++) {
      const R = rng('lock' + i);
      // 方位ではなく**その余弦**を等間隔に採る。方位を等間隔にすると
      // 真横向きの房が画面中央に積もる。
      const cw = -1 + 2 * ((i + R()) / LOCKS);
      const sd = cw >= 0 ? 1 : -1;
      const th0 = 0.30 + R() * 0.14;
      const thRel = 1.40 + R() * 0.22;
      const bulge = 1 + R() * 0.055;
      const pts = [];
      const nA = 15;
      for (let k = 0; k <= nA; k++) {
        const th = th0 + (thRel - th0) * (k / nA);
        pts.push([SC.cx + SC.rx * bulge * Math.sin(th) * cw + (R() - 0.5) * 0.8,
          SC.cy - SC.ry * bulge * Math.cos(th)]);
      }
      let [x, y] = pts[pts.length - 1];
      let vx = sd * (0.25 + R() * 0.55) * Math.abs(cw), vy = 1;
      for (let k = 0; k < 18; k++) {
        vy += 0.24;
        vx += sd * 0.045 * Math.abs(cw) + (R() - 0.5) * 0.12;
        const L = Math.hypot(vx, vy);
        x += (vx / L) * 6.8; y += (vy / L) * 6.8;
        if (y > 236) break;
        pts.push([x, y]);
      }
      d += vein(pts, 'h' + i, { gain: 0.80, bias: 0.22, cut: 0.18, min: 0.018, max: 0.088 });
    }
    push(clip(HAIR, `<path fill="${INK}" d="${d}"/>`));
  }

  // ── 顔　三手 ────────────────────────────────
  // 一番手は緯線。これが形を回す。二番手・三番手は閾値から幅ゼロで立ち上げる。
  // 最小幅から立ち上げると、閾値の等高線がそのまま顔に刷られる。
  {
    const f1 = latitudes(44, 192, 46, 154, 0.44, 13, 'f1');
    const f2 = diagonals([48, 44, 152, 192], 0.50, 54, 'f2');
    const f3 = diagonals([48, 44, 152, 192], 0.60, 108, 'f3');
    const skin = { w8: (x, y) => 1 - beardAt(x, y) * 0.92 };
    push(maskOut([HAIR], clip(FACE_HATCH,
      `<path fill="${INK}" d="${strokes(f1, 'f1', { cut: 0.165, min: 0.004, max: 0.090, ...skin })}"/>`, 'evenodd')));
    push(maskOut([HAIR], clip(FACE_HATCH,
      `<path fill="${INK}" d="${strokes(f2, 'f2', { cut: 0.42, min: 0.002, max: 0.064, ...skin })}"/>`, 'evenodd')));
    push(maskOut([HAIR], clip(FACE_HATCH,
      `<path fill="${INK}" d="${strokes(f3, 'f3', { cut: 0.68, min: 0.002, max: 0.052, ...skin })}"/>`, 'evenodd')));
  }

  // ── 顔の輪郭　陰の側と下だけ ──────────────────
  push(S('M 147 124 C 145 144, 140 158, 130 169 C 121 179, 110 184, 100 184 '
    + 'C 92 184, 84 180, 77 173', 0.105, 0.90));
  push(S('M 53 126 C 52 134, 53 141, 55 148', 0.065, 0.38));

  // ── 額の皺　四十代 ──────────────────────────
  // 三本。深すぎると六十代になる。両端は切る。
  push(S('M 76 88 C 86 85, 114 85, 124 88', 0.072, 0.42));
  push(S('M 79 94 C 88 91, 112 91, 121 94', 0.066, 0.32));
  push(S('M 94 101 C 96 97, 98 96, 99 101', 0.070, 0.44));   // 眉間
  push(S('M 106 101 C 105 97, 103 96, 102 101', 0.070, 0.36));

  // ── 鼻 ────────────────────────────────────
  push(S(NOSE_BRIDGE, 0.072, 0.55));
  push(S(NOSE_ALA_L, 0.088, 0.82));
  push(S(NOSE_ALA_R, 0.100, 1));
  push(S(NOSE_BASE, 0.076, 0.55));
  push(S(NOSTRIL_L, 0.115, 0.90));
  push(S(NOSTRIL_R, 0.125, 1));

  // ── 鼻唇溝　頬が落ちはじめている ────────────────
  push(S('M 87 143 C 83 151, 81 158, 82 164', 0.082, 0.52));
  push(S('M 113 143 C 117 151, 119 158, 118 164', 0.088, 0.64));

  // ── 目 ────────────────────────────────────
  for (const e of [eL, eR]) {
    const [ix, iy, ir] = e.iris;
    push(`<path d="${e.open}" fill="#fff"/>`);
    push(clip(e.open, `<path fill="${INK}" d="${strokes(
      latitudes(iy - 8, iy + 8, ix - 14, ix + 14, 0.42, 3, 'ey' + ix), 'ey' + ix,
      { fixed: 0.20, min: 0.013, max: 0.028 })}"/>`));
    {
      const R = rng('iris' + ix);
      let d = '';
      for (let k = 0; k < 80; k++) {
        const a = (k / 80) * Math.PI * 2 + R() * 0.06;
        const r0 = 1.9 + R() * 0.5, r1 = ir * (0.86 + R() * 0.2);
        d += burin(ix + Math.cos(a) * r0, iy + Math.sin(a) * r0,
          ix + Math.cos(a) * r1, iy + Math.sin(a) * r1, mm(0.030 + R() * 0.026), 0.3);
      }
      push(clip(e.open, `<path fill="${INK}" d="${d}"/>`));
      let pu = '';
      for (let k = 0; k < 44; k++) {
        const a = (k / 44) * Math.PI * 2;
        pu += burin(ix - Math.cos(a) * 1.85, iy - Math.sin(a) * 1.85,
          ix + Math.cos(a) * 1.85, iy + Math.sin(a) * 1.85, mm(0.036), 0.5);
      }
      push(clip(e.open, `<path fill="${INK}" d="${pu}"/>`));
      push(clip(e.open, S(`M ${ix - ir} ${iy} a ${ir} ${ir} 0 1 0 ${ir * 2} 0 `
        + `a ${ir} ${ir} 0 1 0 ${-ir * 2} 0`, 0.072, 0.9)));
      // 光は左上に一点だけ。二点入れると硝子玉になる。
      push(`<circle cx="${f2(ix - 1.7)}" cy="${f2(iy - 1.7)}" r="0.9" fill="#fff"/>`);
    }
    push(S(e.lidUp, 0.150, 1));
    push(S(e.lidLo, 0.066, 0.70));
    push(S(e.crease, 0.072, 0.62));
    push(S(e.bag, 0.058, 0.40));
  }

  // ── 眉 ────────────────────────────────────
  for (const sx of [-1, 1]) {
    const d = BROW(sx);
    const R = rng('brow' + sx);
    let h = '';
    for (let k = 0; k < 210; k++) {
      const t = R();
      const x = 100 + sx * 22 - sx * 15 + sx * 29 * t;
      const y = 92 + 10 * t * t + R() * 8;
      const a = -0.55 * sx + (R() - 0.5) * 0.5;
      const len = 2.2 + R() * 2.6;
      h += burin(x, y, x + Math.cos(a) * len * sx, y + Math.sin(a) * len,
        mm(0.026 + R() * 0.030), 0.35);
    }
    push(clip(d, `<path fill="${INK}" d="${h}"/>`));
    push(S(d.replace(' Z', ''), 0.066, 0.46));
  }

  // ── 髭 ────────────────────────────────────
  // 短く刈ってある。長くすると顎の形が消える。
  // 型で切らず、生えている量そのもので密度を決める。だから縁が出ない。
  {
    const R = rng('beard');
    let d = '';
    for (let i = 0; i < 9000; i++) {
      const x = 52 + R() * 96, y = 122 + R() * 84;
      const b = beardAt(x, y);
      if (b < 0.02) continue;
      const s = clamp((shade(x, y) * 0.60 + 0.16) * (0.45 + 0.55 * b));
      if (R() > b * (0.05 + s * 0.52)) continue;
      const a = Math.PI / 2 + (x - 100) / 105 + (R() - 0.5) * 0.7;
      const len = 1.8 + R() * 3.6;
      d += burin(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len,
        mm(0.016 + 0.042 * s) * (0.7 + R() * 0.6), 0.32 + R() * 0.3);
    }
    push(`<path fill="${INK}" d="${d}"/>`);
  }

  // ── 口　髭の上に置く。下に置くと埋まる ──────────
  push(S(MOUTH, 0.145, 1));
  push(S(LIP_LO, 0.070, 0.38));

  // ── 傷 ────────────────────────────────────
  if (scar) {
    push(S(SCAR, 0.105, 0.9));
    push(S('M 71 127 L 68 129 M 74 134 L 71 136 M 77 142 L 74 144', 0.058, 0.5));
  }

  // ── 前髪　額に落ちる数房 ────────────────────
  {
    const R = rng('front');
    let d = '';
    for (let i = 0; i < 30; i++) {
      const side = i % 2 ? 1 : -1;
      const x0 = 100 + side * (9 + R() * 33);
      const pts = [[x0, 70 + R() * 4]];
      let x = x0, y = 72;
      for (let k = 0; k < 7; k++) {
        x += side * (1.4 + R() * 2.4); y += 2.6 + R() * 2.2;
        pts.push([x, y]);
      }
      d += vein(pts, 'fr' + i, { gain: 0.7, bias: 0.42, cut: 0.2, min: 0.024, max: 0.082 });
    }
    push(`<path fill="${INK}" d="${d}"/>`);
  }

  // ── 環冠 ────────────────────────────────────
  // 金属は肌と同じ彫りでは金属にならない。目を細かくし、
  // 左上に一条だけ白を通す。銅版画の金属はこの一条で決まる。
  if (circlet) {
    push(`<path d="${CIRCLET}" fill="#fff"/>`);
    const fam = latitudes(74, 100, 60, 140, 0.26, 4, 'cc', 2.0);
    push(clip(CIRCLET, `<path fill="${INK}" d="${strokes(fam, 'cc',
      { gain: 0.95, bias: 0.10, cut: 0.16, min: 0.014, max: 0.056 })}"/>`));
    push(S(CIRCLET.replace(/ Z$/, ''), 0.078, 1));
    push(`<path d="M 72 89 C 81 80.5, 92 78.6, 100 78.6 L 100 81 C 92 81, 82 83, 74 91 Z" `
      + `fill="#fff" opacity="0.9"/>`);
    // 環冠が額に落とす影
    push(S('M 68 95 C 78 86, 89 83, 100 83 C 111 83, 122 86, 132 95', 0.070, 0.30));
  }

  return `<svg class="plate-bust" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`
    + `<rect width="${W}" height="${H}" fill="#fff"/>`
    + P.filter(Boolean).join('')
    + `</svg>`;
}

// 図版指定書に残す一行
export const why = 'この男を一目で示すのは、顔そのものである。'
  + '蜂起は制度ではなく一人の宣言として始まっており、'
  + '「首長が皇帝を討った」という一事が、以後の全ての記述の起点になっている。'
  + 'したがってこの項だけは、館でも紋でもなく、人を図とする。';

// 顔は記録に無い。凡例のとおり、これは画工の構成であって記録の主張ではない。
// 髭も記録に無い。ノルドの四十代として画工が置いた。
export const 断り = '髭・顔貌は記録に無い。画工の構成である。'
  + '記録が伝えるのは種族（ノルド）・髪（長い）・被り物（細い環冠）・衣（毛皮の肩掛け）'
  + '・年頃（四十代）・頬の傷（ウィンドヘルムの記録のみ）の六点である。';
