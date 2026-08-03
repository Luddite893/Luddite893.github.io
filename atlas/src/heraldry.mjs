// 紋章の設計言語
//
// 検収基準 3「49 の紋章が同一の設計思想で描かれているか」への回答は、
// 49 点を一点ずつ描かないこと、である。
// 一点ずつ描けば、必ず 49 通りの思想が混ざる。手の癖は途中で変わり、
// 後半に描いたものほど巧くなる。それが「ぶれ」の正体だ。
//
// 代わりに共有の語彙を定め、各組織をその組み合わせとして記述する。
// 狼と熊と鷲は同じ「獣頭」の比率から出す。闇の一党とシルバーハンドと
// ステンダールの守人の手は、同じ「手」から出す。
// 眼は四組織、刃は五組織で共有する。
//
// ── 規約 ────────────────────────────────────────
//   外形      円。全 49 点で共通。二重罫 外 r=56 / 内 r=50.5。不変。
//   座標      120 × 120。中心 (60,60)。図象領域 r ≦ 41。
//   構成      塗りのみ。線を引かない。単色シルエットで成立させるため。
//   最小寸法  8mm で判別できること。120 単位系で 2.6 未満の細部を作らない。
//   面積率    18〜34%。外れると並べたとき一点だけ浮く。
//
// ── 実装上の要点 ───────────────────────────────
//   図形は「片」の集まりとして持ち、片ごとに独立した <path> として描く。
//   一本のパスに繋げてしまうと、重なった部分が evenodd で相殺され、
//   掌と指が互いを食い合う。片を分ければ、重なりは自然に融合し、
//   穴（環・眼・歯車）は片の内側で正しく抜ける。
//   片の区切りは ' | ' とする。

export const SEP = ' | ';
const J = (...parts) => parts.filter(Boolean).join(SEP);

// ── 極座標。真上を 0° とする。 ───────────────────────
const P = (a, r, cx = 60, cy = 60) => {
  const t = ((a - 90) * Math.PI) / 180;
  return [+(cx + r * Math.cos(t)).toFixed(2), +(cy + r * Math.sin(t)).toFixed(2)];
};
const poly = (pts) => 'M' + pts.map((p) => p.map((v) => (+v).toFixed(2)).join(' ')).join(' L ') + ' Z';

// 円。二つの半円弧で閉じる。一つの弧で閉じると先端に楔が残る。
const circle = (cx, cy, r, cw = 1) =>
  `M ${cx} ${(cy - r).toFixed(2)} A ${r} ${r} 0 1 ${cw} ${cx} ${(cy + r).toFixed(2)} `
  + `A ${r} ${r} 0 1 ${cw} ${cx} ${(cy - r).toFixed(2)} Z`;

// 左右対称。座標の正規表現置換ではなく、変換行列で返す。
// 置換だと円弧の半径や回転フラグまで反転してしまう。
const mirrored = (d) => `${d}${SEP}@mirror:${d}`;
// 回転させて置く片。骨を交差させる、光条を傾ける、といった用途。
const rotate = (deg, d) => d.split(SEP).map((x) => `@rot${deg}:${x}`).join(SEP);

// 太さのある棒。両端は丸い。指・枝・光条の基本形。
const bar = (x0, y0, x1, y1, w, cap = 1) => {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L, px = (-uy * w) / 2, py = (ux * w) / 2;
  const f = (v) => v.toFixed(2);
  const head = cap
    ? `A ${w / 2} ${w / 2} 0 0 1 ${f(x1 - px)} ${f(y1 - py)}`
    : `L ${f(x1 - px)} ${f(y1 - py)}`;
  return `M ${f(x0 + px)} ${f(y0 + py)} L ${f(x1 + px)} ${f(y1 + py)} ${head} L ${f(x0 - px)} ${f(y0 - py)} Z`;
};

// ── 共有プリミティブ ───────────────────────────────

// 環。外円と、逆回りの内円。
export const ring = (r, w) => circle(60, 60, r, 1) + ' ' + circle(60, 60, r - w, 0);

export const arc = (r, w, a0, a1) => {
  const [x0, y0] = P(a0, r), [x1, y1] = P(a1, r);
  const [x2, y2] = P(a1, r - w), [x3, y3] = P(a0, r - w);
  const big = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${big} 1 ${x1} ${y1} L ${x2} ${y2} A ${r - w} ${r - w} 0 ${big} 0 ${x3} ${y3} Z`;
};

export const star = (n, ro, ri, cx = 60, cy = 60, rot = 0) => {
  const pts = [];
  for (let i = 0; i < n * 2; i++) pts.push(P(rot + (180 / n) * i, i % 2 ? ri : ro, cx, cy));
  return poly(pts);
};

// 光条。楔形。細くしすぎると 8mm で消えるので下限を持つ。
export const rays = (n, r0, r1, w, rot = 0) =>
  J(...Array.from({ length: n }, (_, i) => {
    const a = rot + (360 / n) * i;
    const hw = Math.max(w, 2.8) / 2;
    return poly([P(a - hw * 0.34, r1), P(a + hw * 0.34, r1), P(a + hw, r0), P(a - hw, r0)]);
  }));

// 三日月。外円から、ずらした同径の円を逆回りで抜く。
export const moon = (r, off, cy = 60) => circle(60, cy, r, 1) + ' ' + circle(60 + off, cy, r, 0);

// ── 獣頭 ────────────────────────────────────────
// 狼・熊・鷲。輪郭の総量と重心を揃えてあるので、並べると同じ手に見える。
const HEADS = {
  // 同胞団。立ち耳、長い吻。
  // 横向き。耳・額・鼻梁・下顎の四つの角で輪郭が決まる。
  wolf: 'M 22 74 L 34 66 C 33 55, 36 44, 44 37 L 40 20 L 56 30 '
      + 'C 64 27, 72 28, 78 33 L 92 30 L 88 42 C 96 50, 99 60, 96 70 '
      + 'L 104 76 L 92 80 C 86 86, 74 90, 62 88 L 46 92 L 50 82 '
      + 'C 40 82, 30 79, 22 74 Z',
  // ストームクローク。丸耳、短く広い吻。
  bear: 'M 60 99 C 53 95, 48 88, 47 79 C 38 75, 33 66, 33 55 '
      + 'C 25 54, 23 41, 31 37 C 37 34, 43 39, 44 45 C 50 41, 70 41, 76 45 '
      + 'C 77 39, 83 34, 89 37 C 97 41, 95 54, 87 55 '
      + 'C 87 66, 82 75, 73 79 C 72 88, 67 95, 60 99 Z',
  // サルモール。耳を持たず、冠羽と嘴。
  eagle: 'M 60 101 C 55 92, 53 80, 53 70 C 42 68, 33 58, 32 44 '
       + 'C 31 33, 38 24, 48 21 L 60 8 L 72 21 C 82 24, 89 33, 88 44 '
       + 'C 87 58, 78 68, 67 70 C 67 80, 65 92, 60 101 Z',
};
export const beastHead = (kind) => HEADS[kind];

// ── 手 ──────────────────────────────────────────
// 掌と指を別の片として持ち、重ねて融合させる。
// 一本のパスに繋ぐと、指が掌を食い抜く。
// 指は掌の上へ抜ける部分にだけ現れる。そこに隙間が要る。
// 隙間が 2.6 単位（8mm 時に約 0.17mm）を割ると、縮小した瞬間に一枚の板になる。
export const hand = ({ spread = 1, wrist = 1 } = {}) => {
  const palm = 'M 43 54 C 43 50, 77 50, 77 54 L 77 74 C 77 86, 70 92, 60 92 C 50 92, 43 86, 43 74 Z';
  const W = 5.8, GAP = 8.9;                       // 隙間 3.1 単位
  const tops = [34, 26, 26.5, 35];                // 人差し指から小指へ
  const F = tops.map((ty, i) => {
    const x = 60 + (i - 1.5) * GAP * spread;
    return bar(x, 60, x, ty, W);
  });
  const thumb = bar(45, 72, 30 - (spread - 1) * 8, 56, 6.6);
  const cuff = wrist ? 'M 47 88 L 73 88 L 70 100 L 50 100 Z' : '';
  return J(palm, ...F, thumb, cuff);
};

// ── 眼 ──────────────────────────────────────────
// 見る組織で共有する。瞼・虹彩・瞳を三つの片で持つ。
// 単色の塗りだけで眼を成立させるには、瞼を輪郭にするしかない。
// 瞼を面で描くと、虹彩も瞳も同じ黒に溶けて、ただの杏になる。
export const eye = ({ w = 30, h = 17, r = 11, t = 6.4 } = {}) => {
  const lens = (ww, hh) => `M ${60 - ww} 60 Q 60 ${60 - hh} ${60 + ww} 60 Q 60 ${60 + hh} ${60 - ww} 60 Z`;
  const rim = lens(w, h) + ' ' + lens(w - t * 1.8, h - t).replace(/M/, 'M').split('').reverse().join('')
    .replace(/Z/, '') ;
  return J(
    lens(w, h) + ' ' + lens(Math.max(w - t * 1.7, 4), Math.max(h - t, 2)),   // 瞼の輪郭
    circle(60, 60, r * 0.74, 1),                                             // 瞳
  );
};

// ── 刃 ──────────────────────────────────────────
export const blade = ({ curve = 0, len = 38, guard = 'bar', hilt = 12 } = {}) => {
  const tip = 60 - len, b = curve, gy = 60 + hilt * 0.4;
  const body = `M 60 ${tip} C ${63 + b} ${tip + 9}, ${65 + b * 1.4} ${60 - len * 0.28}, ${64 + b} ${gy} `
    + `L ${56 - b * 0.2} ${gy} C ${55 - b} ${60 - len * 0.28}, ${57 - b} ${tip + 9}, 60 ${tip} Z`;
  const g = { bar: `M 43 ${gy} L 77 ${gy} L 77 ${gy + 5.4} L 43 ${gy + 5.4} Z`,
              cup: `M 45 ${gy} A 15 10 0 0 0 75 ${gy} L 75 ${gy + 4.4} L 45 ${gy + 4.4} Z`,
              none: '' }[guard];
  return J(body, g, bar(60, gy + 4, 60, gy + hilt + 2, 7.4, 0), circle(60, gy + hilt + 3, 5.2, 1));
};

// ── 山・山形 ─────────────────────────────────────
export const mountain = (peaks = 3, base = 86, h = 42) => {
  const w = 78, pts = [[60 - w / 2, base]];
  for (let i = 0; i < peaks; i++) {
    const x0 = 60 - w / 2 + (w / peaks) * i;
    const ph = h * (i === Math.floor(peaks / 2) ? 1 : 0.64);
    pts.push([x0 + w / peaks / 2, base - ph], [x0 + w / peaks, base - h * 0.16]);
  }
  pts.push([60 + w / 2, base]);
  return poly(pts);
};

export const chevrons = (n = 3, y0 = 44, gap = 11, w = 30, t = 5.4) =>
  J(...Array.from({ length: n }, (_, i) => {
    const y = y0 + gap * i;
    return poly([[60 - w, y + t], [60, y - t * 0.7], [60 + w, y + t],
                 [60 + w, y + t * 2.2], [60, y + t * 0.5], [60 - w, y + t * 2.2]]);
  }));

// ── 翼 ──────────────────────────────────────────
// 三段の風切羽。片側を描いて鏡像で返す。
// 三枚の風切羽を、根元から斜め上に立ち上げる。
// 水平に伸ばすと中央の図象と地続きになり、翼として読めなくなる。
export const wing = (span = 34, y = 52) => {
  const f = (n, dx, dy, w) =>
    `M 63 ${y + n * 5} C ${63 + dx * 0.4} ${y + n * 5 - dy * 0.5}, ${63 + dx * 0.75} ${y + n * 5 - dy * 0.9}, ${63 + dx} ${y + n * 5 - dy} `
    + `L ${63 + dx - w * 0.5} ${y + n * 5 - dy + w * 1.5} `
    + `C ${63 + dx * 0.7} ${y + n * 5 - dy * 0.75 + w}, ${63 + dx * 0.35} ${y + n * 5 - dy * 0.35 + w}, 63 ${y + n * 5 + w} Z`;
  return mirrored(J(f(0, span, 20, 6.4), f(1, span - 5, 11, 6.0), f(2, span - 11, 3, 5.6)));
};

// ── 角 ──────────────────────────────────────────
export const antlers = (tines = 3) => {
  const one = (s) => {
    const parts = [bar(60 + s * 5, 84, 60 + s * 16, 26, 7.6)];
    for (let i = 0; i < tines; i++) {
      const t = i / Math.max(tines - 1, 1);
      const y = 72 - t * 34;
      const x = 60 + s * (7 + t * 8);
      parts.push(bar(x, y, x + s * (14 + t * 4), y - (14 + t * 6), 5.8));
    }
    return J(...parts);
  };
  return J(one(1), one(-1));
};

// ── 触手 ────────────────────────────────────────
export const tentacles = (n = 5, r0 = 14, r1 = 42) =>
  J(...Array.from({ length: n }, (_, i) => {
    const a = -108 + (216 / (n - 1)) * i;
    const [x0, y0] = P(a, r0), [x1, y1] = P(a * 1.15, r1);
    return bar(x0, y0, x1, y1, 6.4);
  }));

// ── 歯車 ────────────────────────────────────────
export const gear = (teeth = 12, ro = 36, ri = 28, hole = 12) => {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (90 / teeth) * i;
    const k = i % 4 === 0 || i % 4 === 1 ? ro : ri;
    pts.push(P(a + (i % 4 === 0 ? -6 : i % 4 === 1 ? 6 : 0), k));
  }
  return poly(pts) + ' ' + circle(60, 60, hole, 0);
};

// ── 書物・塔・船 ─────────────────────────────────
export const book = () => J(
  'M 24 44 L 58 53 L 58 86 L 24 77 Z',
  'M 96 44 L 62 53 L 62 86 L 96 77 Z',
  'M 56 51 L 60 47 L 64 51 L 64 88 L 56 88 Z');

export const tower = () => J(
  'M 45 92 L 48 46 L 72 46 L 75 92 Z',
  'M 41 46 L 79 46 L 79 38 L 71 38 L 71 30 L 65 30 L 65 38 L 55 38 L 55 30 L 49 30 L 49 38 L 41 38 Z',
  'M 38 92 L 82 92 L 82 99 L 38 99 Z');

export const ship = () => J(
  'M 24 72 L 96 72 L 84 92 L 36 92 Z',
  bar(60, 70, 60, 22, 7, 0),
  'M 64 26 L 90 44 L 64 58 Z',
  'M 56 34 L 34 50 L 56 62 Z');

// ── 竪琴 ────────────────────────────────────────
export const lyre = () => {
  const arm = 'M 70 84 C 76 64, 80 46, 74 28 L 82 25 C 89 46, 84 66, 79 84 Z';
  const yoke = 'M 38 30 L 82 22 L 83 29 L 39 37 Z';
  const strings = J(...[0, 1, 2].map((i) => bar(54 + i * 6, 34 + i * 1.2, 54 + i * 6, 80, 3.2, 0)));
  return J(mirrored(arm), yoke, strings, 'M 44 78 L 76 78 L 72 92 L 48 92 Z');
};

// ── 弩 ──────────────────────────────────────────
export const crossbow = () => J(
  bar(60, 22, 60, 92, 8, 0),
  'M 20 42 C 34 30, 86 30, 100 42 L 96 51 C 84 41, 36 41, 24 51 Z',
  bar(24, 49, 96, 49, 3.4, 0),
  'M 46 66 L 74 66 L 74 76 L 46 76 Z');

// ── 鎚・骨 ──────────────────────────────────────
export const hammer = () => J(
  'M 32 26 L 88 26 L 88 50 L 78 50 L 78 38 L 42 38 L 42 50 L 32 50 Z',
  bar(60, 40, 60, 96, 10, 0));

export const bone = () => J(
  bar(60, 30, 60, 90, 10, 0),
  circle(54.5, 32, 6.4, 1), circle(65.5, 32, 6.4, 1),
  circle(54.5, 88, 6.4, 1), circle(65.5, 88, 6.4, 1));

// ── 蜘蛛・足跡 ───────────────────────────────────
export const spider = () => {
  const legs = (s) => J(...[0, 1, 2, 3].map((i) => {
    const y = 50 + i * 7.5;
    const kx = 60 + s * 12, ky = y - 6 + i * 2;
    return J(bar(60 + s * 8, y, kx + s * 14, ky, 4.2), bar(kx + s * 14, ky, kx + s * 26, ky + 16, 3.8));
  }));
  return J('M 60 40 m -9 -11 a 9 11 0 1 0 0 22 a 9 11 0 1 0 0 -22 Z'.replace('m -9 -11', ''),
    circle(60, 40, 10, 1), circle(60, 68, 15, 1), legs(1), legs(-1));
};

export const paw = () => J(
  'M 60 80 m -16 0 a 16 13 0 1 0 32 0 a 16 13 0 1 0 -32 0 Z',
  circle(40, 51, 7, 1), circle(53, 43, 7.2, 1), circle(67, 43, 7.2, 1), circle(80, 51, 7, 1));

// ── 炎・壺・薔薇 ─────────────────────────────────
export const flame = (h = 46, cy = 66) =>
  `M 60 ${cy - h} C 49 ${cy - h + 14}, 68 ${cy - h + 24}, 57 ${cy - h + 40} `
  + `C 51 ${cy - h + 50}, 62 ${cy - 2}, 60 ${cy + h * 0.42} `
  + `C 58 ${cy - 2}, 71 ${cy - h + 46}, 64 ${cy - h + 36} `
  + `C 72 ${cy - h + 22}, 62 ${cy - h + 12}, 60 ${cy - h} Z`;

export const urn = () => J(
  'M 42 30 L 78 30 L 78 38 L 42 38 Z',
  'M 47 38 C 32 54, 32 78, 49 88 L 71 88 C 88 78, 88 54, 73 38 Z',
  'M 44 88 L 76 88 L 81 96 L 39 96 Z');

export const rose = () => J(
  ...Array.from({ length: 6 }, (_, i) => {
    const a = (360 / 6) * i;
    const [cx, cy] = P(a, 22);
    return `M ${cx} ${cy} m -13 0 a 13 13 0 1 0 26 0 a 13 13 0 1 0 -26 0 Z`;
  }),
  circle(60, 60, 12, 1));

// ── 仮面 ────────────────────────────────────────
export const mask = ({ horns = 0, slits = 2 } = {}) => J(
  'M 60 24 C 79 24, 89 39, 89 58 C 89 81, 74 98, 60 98 C 46 98, 31 81, 31 58 C 31 39, 41 24, 60 24 Z'
  + (slits === 2
    ? ' M 39 52 L 55 48 L 55 61 L 39 61 Z M 81 52 L 65 48 L 65 61 L 81 61 Z'
    : ' M 38 52 L 82 52 L 82 61 L 38 61 Z')
  + ' M 47 76 L 73 76 L 68 86 L 52 86 Z',
  horns ? 'M 34 32 L 18 10 L 41 23 Z' : '',
  horns ? 'M 86 32 L 102 10 L 79 23 Z' : '');

// ── 牙・冠 ──────────────────────────────────────
export const tusk = (s = 1) =>
  `M ${60 + s * 7} 32 C ${60 + s * 28} 44, ${60 + s * 32} 72, ${60 + s * 18} 90 `
  + `L ${60 + s * 8} 85 C ${60 + s * 21} 69, ${60 + s * 19} 49, ${60 + s * 2} 39 Z`;

export const crown = () => J(
  'M 28 76 L 33 36 L 46 56 L 60 28 L 74 56 L 87 36 L 92 76 Z',
  'M 28 80 L 92 80 L 92 90 L 28 90 Z');

// ── 渦・鍵穴 ─────────────────────────────────────
export const spiral = (turns = 2.2, r = 38, w = 7) => {
  const steps = 96;
  let outer = '', inner = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = t * 360 * turns, rr = r * (1 - t * 0.8);
    outer += (i ? ' L ' : 'M ') + P(a, rr).join(' ');
    inner.push(P(a, Math.max(rr - w, 1.2)));
  }
  return outer + ' L ' + inner.reverse().map((p) => p.join(' ')).join(' L ') + ' Z';
};

export const keyhole = () => J(circle(60, 36, 15, 1), 'M 50 46 L 70 46 L 79 92 L 41 92 Z');

// ── 鋏（モラグ・トング） ─────────────────────────
export const pincer = () => {
  const one = (s) => J(
    bar(60 + s * 5, 88, 60 + s * 24, 40, 8),
    poly([[60 + s * 24, 42], [60 + s * 39, 24], [60 + s * 41, 40], [60 + s * 29, 48]]));
  return J(one(1), one(-1), 'M 52 82 L 68 82 L 68 100 L 52 100 Z');
};

// ── 立石・結び目・甲殻・天秤 ──────────────────────
export const standingStone = (n = 3) =>
  J(...Array.from({ length: n }, (_, i) => {
    const x = 60 + (i - (n - 1) / 2) * (n === 1 ? 0 : 25);
    const h = n === 1 ? 62 : i === Math.floor(n / 2) ? 54 : 40;
    return poly([[x - 9, 92], [x - 7, 92 - h], [x + 7, 92 - h - 5], [x + 9, 92]]);
  }));

export const knot = (n = 3, r = 23, w = 7) =>
  J(...Array.from({ length: n }, (_, i) => {
    const [cx, cy] = P((360 / n) * i, 14);
    return circle(cx, cy, r, 1) + ' ' + circle(cx, cy, r - w, 0);
  }));

export const chitin = () => J(
  'M 60 22 C 78 29, 86 48, 84 67 C 82 86, 71 97, 60 97 C 49 97, 38 86, 36 67 C 34 48, 42 29, 60 22 Z'
  + ' M 45 42 L 75 42 L 73 49 L 47 49 Z'
  + ' M 42 57 L 78 57 L 76 64 L 44 64 Z'
  + ' M 45 72 L 75 72 L 73 79 L 47 79 Z');

export const scales = () => J(
  bar(60, 26, 60, 90, 6.4, 0), 'M 33 90 L 87 90 L 87 97 L 33 97 Z',
  bar(24, 40, 96, 40, 5, 0),
  'M 14 44 L 44 44 L 36 64 L 22 64 Z', 'M 76 44 L 106 44 L 98 64 L 84 64 Z');


// ── 追加の語彙（V・VI・VII 用） ─────────────────────
// 既存の語彙で足りない図象だけを足す。足すたびに設計思想が薄まるので、
// 一つ足すごとに「既存の組み合わせで代替できないか」を先に確かめている。

// 日輪。アーリエルの聖堂。光条は既存の rays を使い、中心に盤を置く。
export const sunDisc = (r = 20) => circle(60, 60, r, 1);

// 茸楼。ハウス・テルヴァンニ。塔の語彙の変種として持つ。
export const mushroom = () => J(
  'M 22 52 C 24 32, 40 20, 60 20 C 80 20, 96 32, 98 52 C 84 46, 70 44, 60 44 C 50 44, 36 46, 22 52 Z',
  'M 52 44 C 50 62, 48 78, 44 96 L 76 96 C 72 78, 70 62, 68 44 Z');

// 宝珠。理想の支配者。稜を持つ結晶。
export const gem = (r = 34) => J(
  poly([P(0, r), P(52, r * 0.62), P(128, r * 0.72), P(180, r * 0.92), P(232, r * 0.72), P(308, r * 0.62)]),
  circle(60, 60, r * 0.3, 1));

// 斧。山賊諸派。刃と柄。
export const axe = () => J(
  bar(60, 26, 60, 96, 7.4, 0),
  'M 62 30 C 78 32, 90 44, 90 58 C 90 66, 84 72, 76 70 L 62 66 Z');

// 蛇竜。アルドゥインの竜群。環を成す胴と、それを噛む頭。
// 世界を一周して自らに戻る形。竜の帰還を、輪として置いた。
export const serpent = () => J(
  arc(34, 8.5, 40, 320),
  poly([P(28, 44), P(6, 30), P(352, 44), P(2, 30), P(14, 38)]),
  'M 60 20 L 76 12 L 74 26 Z');

// 双月。キャジートのキャラバン。二つの月が同時に出る夜に生まれる民。
export const twinMoons = () => J(moon(24, 15, 46), moon(15, 10, 82));

// ── 外郭。全 49 点で不変。 ────────────────────────
const FRAME = ring(56, 2.6) + SEP + ring(50.5, 1.1);

// ── 組み立て ───────────────────────────────────
// 片ごとに独立した <path> として描く。片の重なりは融合し、
// 片の内側の逆回りの輪郭だけが穴として抜ける。
const render = (src, color) => src.split(SEP).filter((s) => s.trim()).map((d) => {
  if (d.startsWith('@mirror:')) {
    return `<g transform="translate(120,0) scale(-1,1)"><path fill="${color}" fill-rule="evenodd" d="${d.slice(8)}"/></g>`;
  }
  const r = d.match(/^@rot(-?[\d.]+):([\s\S]*)$/);
  if (r) {
    return `<g transform="rotate(${r[1]} 60 60)"><path fill="${color}" fill-rule="evenodd" d="${r[2]}"/></g>`;
  }
  return `<path fill="${color}" fill-rule="evenodd" d="${d}"/>`;
}).join('');

// 滅亡した組織の打ち消し。外郭を貫いて図象の上に乗せる。
// 図象そのものは削らない。滅んだのは組織であって、徽章の意匠ではない。
// 地色で一度太く抜いてから細い線を引くので、下の図象と溶けない。
const STRIKE = 'M 10 78 L 110 42 L 110 53 L 10 89 Z';

// scale は較正係数。図象の面積率を機械的に揃えるために使う。
// 手で「もう少し小さく」と調整すると、49 点ぶんの判断がばらつく。
// 測って、目標との比から一意に決める。
export function emblem(recipe, { color = '#1b1b1a', extinct = false, paper = '#eceae4', scale = 1 } = {}) {
  const body = [recipe.field, recipe.charge, recipe.marks].filter(Boolean).join(SEP);
  const mark = extinct
    ? `<path fill="${paper}" d="M 8 74.6 L 112 37.2 L 112 57.6 L 8 95 Z"/>`
      + `<path fill="${color}" d="${STRIKE}"/>`
    : '';
  const g = scale === 1 ? render(body, color)
    : `<g transform="translate(60,60) scale(${scale.toFixed(4)}) translate(-60,-60)">${render(body, color)}</g>`;
  return `<svg class="emb" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">`
    + render(FRAME, color) + g + mark + `</svg>`;
}

export { P, poly, bar, circle, mirrored, rotate, J, FRAME };
export const strike = () => 'M 14 76 L 106 44 L 106 54 L 14 86 Z';
