// 基準原図　主図版　一　ジョラーヴァスクル（同胞団）
//
// 改訂指示書（図版）第 4 節「生成系を離れる」への実装。
//
// ── この図が生成系と違うところ ────────────────────────
// 初版の主図版は、二十九種の構築物表から一つを選び、
// 空・遠景・中景・近景の四層を同じ関数で塗るものだった。
// 四十九点が同じ手続きを通るので、四十九点とも同じ絵になる。
//
// この図は、その表を一切参照していない。
// 屋根の反り、柱の位置、石段の一段ごとの高さ、竜頭の向き——
// すべてこの図のためだけに座標を書いた。他の四十八点と共有しない。
//
// ── 残した道具 ────────────────────────────────
// 線を引く道具は残した。ビュランの一線は engrave が持っている。
// これは「図を生成する系」ではなく「線を引く手」であり、
// 銅版画の彫師が同じ刃を使い続けるのと同じ意味で共有してよい。
// 共有しないのは**形**である。
//
// ── 素材の描き分け（改訂指示書 5-2） ─────────────────
//   一　空　　　一方向の長い流れ線。上ほど密、地平へ向けて消す
//   二　山　　　斜面に沿う短い線。稜の左は白く残す
//   三　針葉樹　不規則な短い打ち。枝の段ごとに角度を変える
//   四　木材　　木目に沿う長い線。節を丸く囲む
//   五　屋根板　鱗状の重なり。一段ずつ下の段に食い込ませる
//   六　石　　　一段ずつ稜線を持たせる。目地は描かず、影で示す
//   七　布　　　垂れの襞。上端で密、裾で開く
//   八　炎　　　上へ細る線。左上光源に対する二次光源として働く
//
// ── 光 ──────────────────────────────────────
// 光源は左上。庇の下・柱の右・段の踏面に一貫した陰が落ちる。
// 篝火は二次光源で、近くの石の左側を白く抜く。

import { burin } from './engrave.mjs';

const W = 160, H = 128;
const MM = 174 / W;                     // 刷り上がり 174mm ／ 座標 160 単位
const INK = '#1b1b1a';

// 決定論的乱数。線の揺れを毎回同じにする。
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

// 線。太さは刷り上がりのミリで指定する（初版の調子表と同じ単位系）。
const S = (d, mm = 0.12, o = 1) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${(mm / MM).toFixed(3)}" `
  + `stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const F = (d, fill = '#fff') => `<path d="${d}" fill="${fill}"/>`;
// 太らせた一線。ビュランの抜きを使う箇所だけに用いる。
const B = (x0, y0, x1, y1, mm) => burin(x0, y0, x1, y1, mm / MM / 2, 0.42);

const f2 = (v) => v.toFixed(2);
const line = (x0, y0, x1, y1) => `M ${f2(x0)} ${f2(y0)} L ${f2(x1)} ${f2(y1)}`;

// ── 素材 一　空 ───────────────────────────────
// 一方向の長い流れ。地平へ向けて消える。
function sky(seed) {
  const R = rng(seed);
  let d = '';
  for (let y = -6; y < 64; y += 1.15 + R() * 0.9) {
    const fade = Math.max(0, 1 - y / 66);
    if (R() > 0.28 + fade * 0.55) continue;
    const x0 = -4 + R() * 30, len = 40 + R() * 110;
    const dy = 5 + R() * 5;
    d += `M ${f2(x0)} ${f2(y)} C ${f2(x0 + len * 0.4)} ${f2(y + dy * 0.35)}, `
      + `${f2(x0 + len * 0.7)} ${f2(y + dy * 0.8)}, ${f2(x0 + len)} ${f2(y + dy)} `;
  }
  return S(d, 0.085, 0.86);
}

// ── 素材 二　山 ───────────────────────────────
// 稜線の左は白く残し、右斜面にだけ線を入れる。
function mountains(seed) {
  const R = rng(seed);
  const peaks = 'M 78 66 L 92 44 L 99 50 L 112 26 L 121 36 L 128 30 L 141 48 L 152 40 L 160 66 Z';
  let sh = '';
  const faces = [[112, 26, 128, 62], [141, 48, 150, 64], [92, 44, 101, 62]];
  for (const [px, py, bx, by] of faces) {
    for (let t = 0.08; t < 1; t += 0.055) {
      const x = px + (bx - px) * t, y = py + (by - py) * t;
      const len = 4 + t * 13 + R() * 3;
      sh += line(x, y, x + len, y + len * 0.62);
    }
  }
  // 雪の残る筋。稜の直下だけ白く抜くので、線を切る。
  let snow = '';
  for (const [px, py] of [[112, 26], [128, 30], [141, 48]]) {
    for (let i = 0; i < 5; i++) {
      const y = py + 4 + i * 3.4;
      snow += line(px - 3 - i * 1.6, y, px - 1 + R() * 2, y + 1.6);
    }
  }
  return F(peaks, '#fff') + S(peaks, 0.16) + S(sh, 0.075, 0.8) + S(snow, 0.07, 0.55);
}

// ── 素材 三　針葉樹 ────────────────────────────
function conifer(x, base, h, seed) {
  const R = rng(seed);
  const w = h * 0.34;
  let d = line(x, base, x, base - h * 0.94);
  const tiers = Math.round(6 + h / 7);
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const y = base - h * 0.1 - (h * 0.84) * t;
    const half = w * (1 - t) * (0.55 + R() * 0.5);
    for (let k = 0; k < 4 + Math.round(half); k++) {
      const s = (k % 2 ? 1 : -1);
      const off = (k / 8) * half;
      d += line(x + s * off * 0.35, y, x + s * (off + 1.6 + R() * 1.4), y + 1.4 + R() * 1.6);
    }
  }
  return S(d, 0.075, 0.82);
}

// ── 素材 四　木材 ────────────────────────────
// 四隅を与え、長辺に沿って木目を引く。節は丸く囲む。
function timber(p, n, seed, opt = {}) {
  const R = rng(seed);
  const [a, b, c, e] = p;                       // a-b が長辺、e-c が対辺
  let d = '';
  for (let i = 1; i < n; i++) {
    const t = i / n + (R() - 0.5) * 0.02;
    const x0 = a[0] + (e[0] - a[0]) * t, y0 = a[1] + (e[1] - a[1]) * t;
    const x1 = b[0] + (c[0] - b[0]) * t, y1 = b[1] + (c[1] - b[1]) * t;
    const mx = (x0 + x1) / 2 + (R() - 0.5) * 0.9, my = (y0 + y1) / 2 + (R() - 0.5) * 0.9;
    // 木目は真っ直ぐでない。中央を僅かに逃がす。
    d += `M ${f2(x0)} ${f2(y0)} Q ${f2(mx)} ${f2(my)} ${f2(x1)} ${f2(y1)} `;
    if (R() > 0.86) {                            // 節
      const kt = 0.25 + R() * 0.5;
      const kx = x0 + (x1 - x0) * kt, ky = y0 + (y1 - y0) * kt;
      d += `M ${f2(kx - 0.9)} ${f2(ky)} a 0.9 0.65 0 1 0 1.8 0 a 0.9 0.65 0 1 0 -1.8 0 `;
    }
  }
  const quad = `M ${p.map((q) => q.join(' ')).join(' L ')} Z`;
  return (opt.fill === false ? '' : F(quad, '#fff')) + S(d, 0.09, 0.9) + S(quad, opt.edge ?? 0.19);
}

// ── 素材 五　屋根板 ────────────────────────────
// 鱗状。段ごとに下へ食い込ませ、継ぎ目を互い違いにする。
function shingles(corners, rows, cols, seed) {
  const R = rng(seed);
  const [A, B, C, D] = corners;                 // A-B 上辺、D-C 下辺
  const P = (u, v) => {
    const x0 = A[0] + (B[0] - A[0]) * u, y0 = A[1] + (B[1] - A[1]) * u;
    const x1 = D[0] + (C[0] - D[0]) * u, y1 = D[1] + (C[1] - D[1]) * u;
    return [x0 + (x1 - x0) * v, y0 + (y1 - y0) * v];
  };
  let d = '';
  for (let r = 1; r <= rows; r++) {
    const v = r / rows;
    // 段の線。まっすぐ引かず、板の重なりで僅かに波打たせる。
    let seg = '';
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const [x, y] = P(u, v + (R() - 0.5) * 0.006);
      seg += (i ? 'L' : 'M') + ` ${f2(x)} ${f2(y)} `;
    }
    d += seg;
    // 縦の継ぎ目。一段ごとに半枚ずらす。
    const off = r % 2 ? 0.5 : 0;
    for (let i = 0; i < cols; i++) {
      const u = (i + off) / cols;
      if (u > 1) continue;
      const [x0, y0] = P(u, v);
      const [x1, y1] = P(u, v - 1 / rows * 0.82);
      d += line(x0, y0, x1, y1);
    }
  }
  const quad = `M ${corners.map((q) => q.join(' ')).join(' L ')} Z`;
  return F(quad, '#fff') + S(d, 0.085, 0.92) + S(quad, 0.2);
}

// ── 素材 六　石 ─────────────────────────────
// 一段ずつ稜線を持つ。目地は描かず、影で示す。
function stones(x0, y0, x1, y1, rows, seed, skew = 0) {
  const R = rng(seed);
  let d = '', sh = '';
  const hh = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) {
    const yy = y0 + r * hh;
    d += line(x0 + skew * r, yy, x1 + skew * r, yy);
    let x = x0 + R() * 3 + skew * r;
    while (x < x1 + skew * r) {
      const w = 4 + R() * 6;
      d += line(x, yy, x + (R() - 0.5) * 1.2, yy + hh);
      // 石の下辺と右辺に影。左上光源。
      sh += line(x + 0.5, yy + hh - 0.5, x + w - 0.5, yy + hh - 0.5);
      x += w;
    }
  }
  const quad = `M ${f2(x0)} ${f2(y0)} L ${f2(x1)} ${f2(y0)} L ${f2(x1 + skew * rows)} ${f2(y1)} `
    + `L ${f2(x0 + skew * rows)} ${f2(y1)} Z`;
  return F(quad, '#fff') + S(d, 0.11, 0.95) + S(sh, 0.16, 0.55) + S(quad, 0.19);
}

// ── 素材 七　布 ─────────────────────────────
function cloth(x, yTop, w, h, seed) {
  const R = rng(seed);
  const d0 = `M ${f2(x)} ${f2(yTop)} L ${f2(x + w)} ${f2(yTop)} L ${f2(x + w)} ${f2(yTop + h * 0.86)} `
    + `L ${f2(x + w / 2)} ${f2(yTop + h)} L ${f2(x)} ${f2(yTop + h * 0.86)} Z`;
  let d = '';
  for (let i = 1; i < 9; i++) {
    const u = i / 9;
    const xx = x + w * u;
    const bow = (u - 0.5) * 2.2;
    d += `M ${f2(xx)} ${f2(yTop + 0.6)} C ${f2(xx + bow)} ${f2(yTop + h * 0.35)}, `
      + `${f2(xx - bow * 0.6)} ${f2(yTop + h * 0.65)}, ${f2(xx + bow * 0.4)} `
      + `${f2(yTop + h * (0.86 + 0.14 * (1 - Math.abs(u - 0.5) * 2)))} `;
  }
  // 右半分は影。垂れの奥側。
  let sh = '';
  for (let i = 0; i < 14; i++) {
    const u = 0.56 + i * 0.032;
    if (u > 1) break;
    sh += line(x + w * u, yTop + 1, x + w * u, yTop + h * (0.84 + 0.14 * (1 - Math.abs(u - 0.5) * 2)));
  }
  return F(d0, '#fff') + S(d, 0.1, 0.9) + S(sh, 0.08, 0.5) + S(d0, 0.2);
}

// ── 素材 八　炎 ─────────────────────────────
function flame(x, y, h, seed) {
  const R = rng(seed);
  let d = '', core = '';
  for (let i = 0; i < 13; i++) {
    const s = (i % 2 ? 1 : -1), off = (i / 13) * 3.0 * s;
    const top = y - h * (0.45 + R() * 0.6);
    d += `M ${f2(x + off)} ${f2(y)} C ${f2(x + off * 1.7 - s * 1.4)} ${f2(y - h * 0.4)}, `
      + `${f2(x + off * 0.4 + s * 0.9)} ${f2(y - h * 0.72)}, ${f2(x + off * 0.25)} ${f2(top)} `;
  }
  // 根元は濃く。ここが二次光源の中心になる。
  for (let i = 0; i < 9; i++) {
    const off = (R() - 0.5) * 3.6;
    core += line(x + off, y, x + off * 0.5, y - h * (0.18 + R() * 0.2));
  }
  return S(d, 0.14, 1) + S(core, 0.22, 1);
}

// ── 明暗 ─────────────────────────────────────
// 素材の描き分けだけでは平面図になる。値の段をここで作る。
// 密度で作り、線の太さは変えない。銅版画の階調はそうやって作られる。
//   0.15 …… ほぼ白（受光面）
//   0.35 …… 中間（側面）
//   0.60 …… 陰（庇の下・柱の右）
//   0.85 …… 最暗（入口の闇）
let hid = 0;
function shade(d, t, angle, box, seed) {
  if (t <= 0.03) return '';
  const R = rng(seed);
  const id = `sh${++hid}`;
  const [x0, y0, x1, y1] = box;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const span = Math.hypot(x1 - x0, y1 - y0) * 0.62;
  const pass = (a, strength) => {
    const gap = (2.6 - 2.05 * strength);
    const rad = (a * Math.PI) / 180;
    const ux = Math.cos(rad), uy = Math.sin(rad);
    let out = '';
    for (let k = -span; k <= span; k += gap * (0.82 + R() * 0.36)) {
      const px = cx - uy * k, py = cy + ux * k;
      const e0 = -span * (0.8 + R() * 0.2), e1 = span * (0.8 + R() * 0.2);
      out += line(px + ux * e0, py + uy * e0, px + ux * e1, py + uy * e1);
    }
    return out;
  };
  let body = pass(angle, Math.min(t / 0.5, 1));
  if (t > 0.42) body += pass(angle + 58, (t - 0.42) / 0.58);
  if (t > 0.68) body += pass(angle + 116, (t - 0.68) / 0.32);
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>`
    + `<g clip-path="url(#${id})">${S(body, 0.095, 0.95)}</g>`;
}

// ── 竜頭。この図にしかない要素。棟木の先に据える。 ─────────
// 横顔で描く。正面向きにすると、この寸法では鳥か魚になる。
function dragonHead(x, y, s, flip, seed) {
  const m = flip ? -1 : 1;
  const P = (dx, dy) => `${f2(x + dx * s * m)} ${f2(y + dy * s)}`;
  // 上顎。楔形。口を開けて前へ噛み出す。
  const upper = `M ${P(-1.2, 0.4)} L ${P(0.6, -2.4)} L ${P(3.0, -2.8)} `
    + `L ${P(7.4, -1.6)} L ${P(9.8, 0.4)} L ${P(6.8, 0.0)} `
    + `L ${P(3.2, -0.2)} L ${P(0.8, 0.6)} Z`;
  // 下顎。上顎より短く、内へ引く。
  const lower = `M ${P(0.6, 1.2)} L ${P(3.2, 1.0)} L ${P(6.4, 1.4)} `
    + `L ${P(8.6, 2.8)} L ${P(5.0, 2.4)} L ${P(1.4, 2.4)} Z`;
  // 牙。上下に二本ずつ。
  const teeth = `M ${P(3.4, 0.0)} L ${P(4.0, 1.4)} L ${P(4.6, 0.1)} Z`
    + ` M ${P(6.6, 0.1)} L ${P(7.0, 1.2)} L ${P(7.6, 0.3)} Z`
    + ` M ${P(4.4, 1.2)} L ${P(4.9, 0.2)} L ${P(5.4, 1.2)} Z`;
  // 鬣。後頭から三枚、後ろへ流す。
  const mane = `M ${P(-0.6, -1.6)} L ${P(-3.6, -4.0)} L ${P(-1.8, -1.0)} Z`
    + ` M ${P(-1.2, -0.4)} L ${P(-4.8, -1.4)} L ${P(-1.8, 0.4)} Z`
    + ` M ${P(-1.2, 0.8)} L ${P(-4.4, 1.6)} L ${P(-1.4, 1.8)} Z`;
  const R = rng(seed);
  let tex = '';
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    tex += line(x + (1.0 + t * 7.4) * s * m, y + (-2.2 + t * 1.4) * s,
      x + (1.4 + t * 7.4) * s * m, y + (-1.0 + t * 1.0) * s);
  }
  const eye = `M ${P(1.4, -1.4)} a ${f2(0.42 * s)} ${f2(0.36 * s)} 0 1 0 ${f2(0.84 * s * m)} 0 `
    + `a ${f2(0.42 * s)} ${f2(0.36 * s)} 0 1 0 ${f2(-0.84 * s * m)} 0`;
  return F(upper, '#fff') + F(lower, '#fff') + F(mane, '#fff') + F(teeth, '#fff')
    + S(tex, 0.085, 0.75)
    + S(upper, 0.2) + S(lower, 0.18) + S(mane, 0.17) + S(teeth, 0.14)
    + `<path d="${eye}" fill="${INK}"/>`;
}

// ── 紋章。旗に刷られた印。同胞団の紋章を線画に起こす。 ────────
function sigil(cx, cy, s) {
  const P = (dx, dy) => `${f2(cx + dx * s)} ${f2(cy + dy * s)}`;
  const shield = `M ${P(0, -3.2)} L ${P(2.1, -1.6)} L ${P(2.1, 1.4)} L ${P(0, 3.4)} `
    + `L ${P(-2.1, 1.4)} L ${P(-2.1, -1.6)} Z`;
  // 獣頭。紋章と同じ図象を、旗の上では線で描く。
  const beast = `M ${P(-0.9, -1.0)} C ${P(-0.2, -1.9)} ${P(0.9, -1.7)} ${P(1.2, -0.8)} `
    + `C ${P(1.5, 0.0)} ${P(0.9, 0.7)} ${P(0.1, 0.8)} `
    + `C ${P(-0.7, 0.9)} ${P(-1.2, 0.2)} ${P(-0.9, -1.0)} Z`;
  const ear = `M ${P(-0.9, -1.1)} L ${P(-1.5, -2.1)} L ${P(-0.3, -1.6)} Z`
    + ` M ${P(1.0, -1.0)} L ${P(1.5, -2.0)} L ${P(1.7, -0.7)} Z`;
  const bar = `M ${P(-1.5, 1.3)} L ${P(1.5, 1.3)} L ${P(1.5, 1.8)} L ${P(-1.5, 1.8)} Z`;
  return S(shield, 0.22) + `<path d="${beast + ear + bar}" fill="${INK}"/>`;
}

// ── 一枚を組む ──────────────────────────────────
export function jorrvaskr() {
  const P = [];
  const push = (x) => x && P.push(x);

  // ── 空・遠景 ──
  push(sky('jsky'));
  push(mountains('jmt'));
  for (const [x, b, h, s] of [[8, 74, 30, 'c1'], [17, 78, 22, 'c2'], [150, 72, 26, 'c3'],
    [141, 76, 18, 'c4'], [156, 80, 20, 'c5'], [2, 80, 18, 'c6']]) push(conifer(x, b, h, s));

  // ── 中景　館 ──
  // 屋根。伏せた船。棟から両側へ反り返る。
  const roofL = [[74, 15], [78, 15], [30, 63], [20, 60]];
  const roofR = [[78, 15], [82, 16], [124, 58], [116, 62]];
  // 左の下屋（奥へ続く棟）
  const wingRoof = [[38, 52], [56, 40], [30, 68], [10, 70]];
  push(shingles([[38, 52], [56, 40], [32, 66], [12, 70]], 7, 9, 'wing'));
  push(shingles([[74, 15], [78, 15], [30, 66], [20, 62]], 11, 7, 'rl'));
  push(shingles([[78, 15], [82, 16], [124, 60], [116, 64]], 11, 8, 'rr'));

  // 破風の板。屋根の縁を厚板で覆う。
  push(timber([[74, 14], [78, 14], [22, 62], [18, 60]], 4, 'fl', { edge: 0.24 }));
  push(timber([[78, 14], [82, 15], [124, 62], [119, 63]], 4, 'fr', { edge: 0.24 }));

  // 妻壁。屋根の下の三角形。
  const gable = [[78, 24], [78, 24], [108, 56], [48, 56]];
  push(timber([[76, 22], [80, 22], [110, 56], [46, 56]], 11, 'gb', { edge: 0.22 }));
  // 妻壁の桁。横に走る梁を三本。
  for (const y of [36, 44, 52]) {
    const half = (y - 22) * 0.94;
    push(timber([[78 - half, y], [78 + half, y], [78 + half, y + 2.2], [78 - half, y + 2.2]], 2, 'bm' + y, { edge: 0.16 }));
  }

  // 庇の下。いちばん暗い面。柱より奥。
  const porch = `M 50 56 L 106 56 L 104 92 L 52 92 Z`;
  push(F(porch, '#fff'));
  push(shade(porch, 0.60, 74, [48, 54, 108, 94], 'porch'));
  // 入口。柱の間の闇。この図でいちばん暗い面。
  const door = `M 68 58 L 90 58 L 89 92 L 69 92 Z`;
  push(F(door, '#fff'));
  push(shade(door, 0.88, 78, [66, 56, 92, 94], 'door'));

  // 柱。五本。左上光源なので右側に影。
  for (const [cx, w] of [[52, 3.4], [63, 3.2], [78, 3.6], [93, 3.2], [104, 3.4]]) {
    push(timber([[cx - w, 54], [cx + w, 54], [cx + w * 0.92, 92], [cx - w * 0.92, 92]], 5, 'col' + cx, { edge: 0.2 }));
    // 右の影
    let sh = '';
    for (let y = 55; y < 92; y += 0.8) sh += line(cx + w * 0.32, y, cx + w * 0.9, y);
    push(S(sh, 0.09, 0.55));
    // 柱頭
    push(timber([[cx - w - 1.4, 51.4], [cx + w + 1.4, 51.4], [cx + w + 1.2, 54.4], [cx - w - 1.2, 54.4]], 2, 'cap' + cx, { edge: 0.18 }));
  }

  // 値の段。左上光源。右へ回る面ほど暗い。
  // 屋根の右斜面は光を外すので中間、左斜面は受光面なので白のまま。
  push(shade('M 78 15 L 82 16 L 124 60 L 116 64 Z', 0.34, 34, [76, 14, 126, 66], 'vrr'));
  // 妻壁は庇の内側なので、全体に薄く落とす。
  push(shade('M 76 22 L 80 22 L 110 56 L 46 56 Z', 0.22, 62, [44, 20, 112, 58], 'vgb'));
  // 下屋の屋根は奥にあるので一段落とす。
  push(shade('M 38 52 L 56 40 L 32 66 L 12 70 Z', 0.30, 40, [10, 38, 58, 72], 'vwing'));
  // 右の石垣は日陰側。
  push(shade('M 106 82 L 140 82 L 137.5 104 L 103.5 104 Z', 0.30, 28, [102, 80, 142, 106], 'vwr'));
  // 段の下、地面に落ちる影。
  push(shade('M 36 104 L 120 104 L 128 112 L 28 112 Z', 0.42, 12, [26, 102, 130, 114], 'vgs'));

  // 竜頭。棟の先と、左の下屋の棟先。
  push(dragonHead(76, 6, 1.35, false, 'dh1'));
  push(dragonHead(52, 34, 1.05, true, 'dh2'));
  push(dragonHead(34, 50, 0.8, true, 'dh3'));

  // 妻に垂れる旗
  push(cloth(70, 28, 16, 22, 'flag1'));
  push(sigil(78, 38, 2.4));

  // ── 近景　石段と石垣 ──
  push(stones(16, 84, 48, 104, 5, 'wallL', 0.5));
  push(stones(106, 82, 140, 104, 5, 'wallR', -0.5));
  // 段。五段。踏面は明るく、蹴上げに影。
  for (let i = 0; i < 5; i++) {
    const y = 92 + i * 2.9, x0 = 50 - i * 2.4, x1 = 106 + i * 2.4;
    push(F(`M ${f2(x0)} ${f2(y)} L ${f2(x1)} ${f2(y)} L ${f2(x1 + 2.4)} ${f2(y + 2.9)} L ${f2(x0 - 2.4)} ${f2(y + 2.9)} Z`, '#fff'));
    let d = '', sh = '';
    d += line(x0, y, x1, y);
    // 一段ごとに石の割りを変える
    const R = rng('st' + i);
    let x = x0 + 2 + R() * 4;
    while (x < x1) { d += line(x, y, x - 0.6, y + 2.9); x += 6 + R() * 7; }
    for (let k = 0; k < 26; k++) sh += line(x0 + (x1 - x0) * (k / 26), y + 2.0, x0 + (x1 - x0) * (k / 26) - 0.5, y + 2.85);
    push(S(d, 0.11, 0.95) + S(sh, 0.1, 0.6));
  }

  // 篝火。二基。左上光源に対する二次光源。
  for (const [bx, by, s, sd] of [[30, 96, 1.0, 'bz1'], [98, 92, 0.92, 'bz2']]) {
    const bowl = `M ${f2(bx - 5 * s)} ${f2(by)} L ${f2(bx + 5 * s)} ${f2(by)} `
      + `L ${f2(bx + 3.4 * s)} ${f2(by + 4 * s)} L ${f2(bx - 3.4 * s)} ${f2(by + 4 * s)} Z`;
    push(F(bowl, '#fff'));
    let d = '';
    for (let i = 0; i <= 9; i++) d += line(bx - 5 * s + i * (10 * s / 9), by, bx - 3.4 * s + i * (6.8 * s / 9), by + 4 * s);
    push(S(d, 0.1, 0.9) + S(bowl, 0.2));
    // 三脚
    push(S(line(bx - 4 * s, by + 4 * s, bx - 5.4 * s, by + 13 * s)
      + line(bx + 4 * s, by + 4 * s, bx + 5.4 * s, by + 13 * s)
      + line(bx, by + 4 * s, bx, by + 13 * s)
      + line(bx - 4.6 * s, by + 9 * s, bx + 4.6 * s, by + 9 * s), 0.19));
    push(flame(bx, by - 0.5, 11 * s, sd));
  }

  // ── 右手前　旗竿の門 ──
  push(timber([[128, 46], [133, 46], [133, 108], [128, 108]], 4, 'post1', { edge: 0.22 }));
  push(timber([[151, 44], [156, 44], [156, 104], [151, 104]], 4, 'post2', { edge: 0.22 }));
  push(timber([[126, 44], [158, 42], [158, 46.5], [126, 48.5]], 3, 'beam', { edge: 0.22 }));
  // 縄の巻き
  {
    let d = '';
    for (let i = 0; i < 5; i++) d += line(127.5, 47 + i * 1.1, 133.5, 46.4 + i * 1.1);
    for (let i = 0; i < 5; i++) d += line(150.5, 45 + i * 1.1, 156.5, 44.4 + i * 1.1);
    d += line(128, 46.5, 133, 51) + line(133, 46.5, 128, 51);
    d += line(151, 44.5, 156, 49) + line(156, 44.5, 151, 49);
    push(S(d, 0.11, 0.9));
  }
  push(cloth(134, 52, 16, 30, 'flag2'));
  push(sigil(142, 66, 3.2));
  // 吊り灯
  push(S(line(157, 46, 157, 54), 0.12));
  {
    const lb = 'M 154.2 54 L 159.8 54 L 159.2 62 L 154.8 62 Z';
    push(F(lb, '#fff') + S('M 155 54.5 L 155 61.5 M 157 54.5 L 157 61.5 M 159 54.5 L 159 61.5', 0.09, 0.8) + S(lb, 0.18));
    push(S('M 153.8 53.4 L 160.2 53.4 M 154.6 62.4 L 159.4 62.4', 0.16));
  }

  // ── 地面 ──
  {
    const R = rng('gr');
    let d = '';
    for (let y = 106; y < 128; y += 2.4) {
      let x = -2 + R() * 5;
      const wob = (y - 106) * 0.06;
      d += `M -2 ${f2(y + wob)} L 162 ${f2(y + wob - 1)} `;
      while (x < 162) {
        d += line(x, y + wob, x + (R() - 0.5) * 2, y + wob + 2.4);
        x += 5 + R() * 8;
      }
    }
    push(S(d, 0.095, 0.75));
    // 草。輪郭のない短い打ち。
    let g = '';
    for (let i = 0; i < 90; i++) {
      const x = R() * 160, y = 104 + R() * 24;
      for (let k = 0; k < 3; k++) {
        const a = -1.4 + R() * 2.8;
        g += line(x, y, x + a, y - 1.4 - R() * 2.6);
      }
    }
    push(S(g, 0.085, 0.7));
  }

  // 図の枠。初版と同じ細罫。
  const frame = `<rect x="0.35" y="0.35" width="${W - 0.7}" height="${H - 0.7}" fill="none" `
    + `stroke="${INK}" stroke-width="${(0.4 / MM).toFixed(3)}"/>`;

  return `<svg class="plate" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`
    + `<rect width="${W}" height="${H}" fill="#fff"/>`
    + P.filter(Boolean).join('') + frame + `</svg>`;
}

// 図版指定書に残す一行（改訂指示書 5-1）
export const why = 'この団を一目で示すのは館である。ジョラーヴァスクルは屋根が伏せた船の形をしており、'
  + '渡海に用いた船体をそのまま架けたと伝えられる。'
  + '「千年以上いかなる領主にも属さなかった」という沿革を、建物の形が単独で語る。';
