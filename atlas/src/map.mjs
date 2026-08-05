// 地図
//
// 仕様書 9：地図 3 点（全体図＋部分図）。仕様書 5：拠点欄に地名＋小地図。
//
// 各項の小地図は 26mm 角に入る。ここに川も道も描けない。
// 描くのは州の輪郭と九つの領の境、そして拠点の位置だけ。
// 小地図の役目は「どのあたりか」を示すことであって、案内することではない。
// 案内は巻頭の勢力分布図（見開き 2P）が引き受ける。

import { engrave, contour } from './engrave.mjs';

// ── 札の置き場を決める ───────────────────────────
// 地図の文字が重なるのは、札を「点の右へ一定量」で置いていたからである。
// 点が寄れば札も寄る。図の縁に近い点では、札が図の外へ出る。
//
// そこで置き場を決める仕事を一つの関数にまとめた。
// 点のまわり八方位を順に試し、すでに置いた札・点・図の縁、
// そして（州の名なら）州の輪郭の外へ出ないかを見て、最初に通った位置を採る。
// どれも通らなければ、はみ出しの量がいちばん小さい位置を採る。
// 「必ずどこかに置く」ことと「重なりを機械が数えられる」ことの両方が要る。
// 数えるほうは check-maps.mjs が行う。

// 和文は全角、欧字と数字は半角として幅を見積もる。
// SVG の letter-spacing は字の後ろに入るので、字数ぶん足す。
const WIDE = /[　-〿぀-ヿ㐀-鿿＀-￯]/;
export const textWidth = (s, size, ls = 0) => {
  let w = 0;
  for (const ch of s) w += (WIDE.test(ch) ? size : size * 0.52) + ls;
  return w;
};

// 'M x y L x y … Z' だけで書かれた多角形を点列に直す。
export const polyOf = (d) => {
  const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const pts = [];
  for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
  return pts;
};

export const inPoly = ([x, y], poly) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

// 輪郭の内側かどうかを見る点。四隅そのものは使わない。
// 「ウィンターホールド」のような長い名は、丸みのある領のどこに置いても隅が外へ出る。
// 隅を少し内へ寄せた六点で見る。描くほうと検めるほうで、同じ点を使う。
export const probes = (r) => {
  const ix = (r.x1 - r.x0) * 0.04, iy = (r.y1 - r.y0) * 0.14;
  const [x0, x1, y0, y1] = [r.x0 + ix, r.x1 - ix, r.y0 + iy, r.y1 - iy];
  return [[x0, y0], [x1, y0], [x0, y1], [x1, y1],
          [(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1]];
};

const overlap = (a, b) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0))
  * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

// 十六方位。右を先に試すのは、初版の見た目を保つためである。
// 八方位だけだと、玉の込み合う地点で逃げ場が尽きる。斜め四方の半端も試す。
const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0.5], [-1, 0.5], [1, -0.5], [-1, -0.5],
  [0.5, 1], [-0.5, 1], [0.5, -1], [-0.5, -1],
].map(([dx, dy]) => [dx, dy, dx > 0.5 ? 'start' : dx < -0.5 ? 'end' : 'middle']);

// labels: { x, y, lines[], size, ls, gap, centre?, poly?, weight? }
// 返り値に tx・ty・anchor と、収まったかどうかの ok を足す。
// 一度で収まらない札は字を一段ずつ詰めて置き直す（shrink）。
// 込み合った土地では、置き場を探すより字を落とすほうが早く済む。
export function placeLabels(labels, { bounds, obstacles = [], shrink = 0, min = 1.55 } = {}) {
  const work = labels.map((L) => ({ ...L }));
  let placed = placeOnce(work, bounds, obstacles);
  for (let s = 0; s < shrink && placed.some((L) => !L.ok); s++) {
    let moved = false;
    placed.forEach((L, i) => {
      if (L.ok || work[i].size <= min) return;
      work[i].size = Math.max(min, work[i].size - 0.2);
      work[i].ls = Math.max(0.04, (work[i].ls ?? 0) - 0.06);
      moved = true;
    });
    if (!moved) break;
    placed = placeOnce(work, bounds, obstacles);
  }
  return placed;
}

function placeOnce(labels, bounds, obstacles) {
  const taken = obstacles.slice();
  // 幅の広い札から先に置く。狭い札はあとから隙間に入る。
  const order = [...labels.keys()].sort((a, b) => {
    const w = (i) => Math.max(...labels[i].lines.map((l) =>
      textWidth(l, labels[i].size, labels[i].ls ?? 0)));
    return w(b) - w(a);
  });
  const out = new Array(labels.length);

  for (const i of order) {
    const L = labels[i];
    const ls = L.ls ?? 0, gap = L.gap ?? 1.6;
    const w = Math.max(...L.lines.map((l) => textWidth(l, L.size, ls)));
    const h = L.lines.length * L.size * 1.22;
    const cands = [];
    // 面の名（州名・領名）は、まず点そのものに置く。動かすのは通らなかったときだけ。
    // 外側の環は掛け算ではなく足し算で広げる。掛け算だと、玉の環の大きい地点で
    // 二段目がいきなり倍の距離になり、札が点から離れて別の地点のものに見える。
    const rings = L.centre ? [0, gap, gap + 2, gap + 4, gap + 6.5]
                           : [gap, gap + 1.7, gap + 3.4, gap + 5.4];
    for (const g of rings) {
      if (g === 0) { cands.push([0, 0, 'middle', 0]); continue; }
      for (const [dx, dy, an] of DIRS) cands.push([dx, dy, an, g]);
    }

    let best = null;
    for (const [dx, dy, an, g] of cands) {
      // 札の箱の中心を、方位のぶんだけ点からずらす。
      const x0 = L.x + dx * (g + w / 2) - w / 2;
      const y0 = L.y + dy * (g + h / 2) - h / 2;
      const r = { x0, y0, x1: x0 + w, y1: y0 + h };
      // 「破れ」と「好み」を分けて数える。
      // 破れは重なり・枠外・輪郭外の三つで、これが残る札だけが直しの対象である。
      // 点から離れていることは破れではない。混ぜると、ただ譲っただけの札まで
      // 字を詰められて、領の名と地名の格が並んでしまう。
      let hard = 0;
      for (const o of taken) hard += overlap(r, o) * 12;
      if (bounds) {
        hard += Math.max(0, bounds.x0 - r.x0) * h + Math.max(0, r.x1 - bounds.x1) * h;
        hard += Math.max(0, bounds.y0 - r.y0) * w + Math.max(0, r.y1 - bounds.y1) * w;
      }
      if (L.poly) hard += probes(r).filter((c) => !inPoly(c, L.poly)).length * w * h * 0.5;
      // 州の外にある地点の札は、州の中へ入れない。太い輪郭の上に字が乗る。
      if (L.outside) hard += probes(r).filter((c) => inPoly(c, L.outside)).length * w * h * 0.5;
      // 近いほうを好む。離れた札は、隣の地点のものと読み違えられる。
      const soft = (g - (L.gap ?? 1.6)) * (L.centre ? 1.2 : 2.4) + g * 0.02;
      const cost = hard + soft;
      if (!best || cost < best.cost) best = { cost, hard, r, an };
      if (cost === 0) break;
    }

    const { r, an } = best;
    taken.push(r);
    out[i] = {
      ...L, w, h, rect: r, anchor: an, ok: best.hard < 0.02,
      tx: an === 'start' ? r.x0 : an === 'end' ? r.x1 : (r.x0 + r.x1) / 2,
      ty: r.y0 + L.size * 0.82,
    };
  }
  return out;
}

// 置いた札を SVG にする。
export const drawLabels = (placed, o = {}) => placed.map((L) => {
  const fill = L.fill ?? o.fill ?? '#1b1b1a';
  const rows = L.lines.map((t, k) =>
    `<tspan x="${L.tx.toFixed(2)}" y="${(L.ty + k * L.size * 1.22).toFixed(2)}"`
    + `${L.rowFill?.[k] ? ` fill="${L.rowFill[k]}"` : ''}`
    + `${L.rowSize?.[k] ? ` font-size="${L.rowSize[k]}"` : ''}>${t}</tspan>`).join('');
  return `<text text-anchor="${L.anchor}" font-size="${L.size}" fill="${fill}"`
    + ` letter-spacing="${L.ls ?? 0}"${L.weight ? ` font-weight="${L.weight}"` : ''}>${rows}</text>`;
}).join('');

// スカイリム州の略形。座標系 0..100 × 0..80。
// 実測に基づく厳密な図ではなく、九つの領の相対配置を保った模式図である。
// 学術書の小地図は、たいていこの水準で描かれる。
export const PROVINCE =
  'M 8 44 L 12 30 L 20 22 L 30 18 L 38 10 L 52 8 L 62 12 L 74 10 L 84 16 '
  + 'L 92 26 L 95 38 L 90 50 L 92 62 L 84 70 L 70 74 L 56 72 L 44 76 '
  + 'L 30 72 L 18 64 L 10 54 Z';

// 九つの領。輪郭の内側を分ける線だけを持つ。面は塗らない。
export const HOLDS = [
  { id: 'haafingar',  ja: 'ハーフィンガル',   x: 30, y: 22, seat: 'ソリチュード' },
  { id: 'hjaalmarch', ja: 'ヒャルマーク',     x: 44, y: 30, seat: 'モーサル' },
  { id: 'winterhold', ja: 'ウィンターホールド', x: 74, y: 22, seat: 'ウィンターホールド' },
  { id: 'eastmarch',  ja: 'イーストマーチ',   x: 74, y: 44, seat: 'ウィンドヘルム' },
  { id: 'therift',    ja: 'リフト',           x: 76, y: 64, seat: 'リフテン' },
  { id: 'whiterun',   ja: 'ホワイトラン',     x: 50, y: 46, seat: 'ホワイトラン' },
  { id: 'falkreath',  ja: 'ファルクリース',   x: 40, y: 66, seat: 'ファルクリース' },
  { id: 'reach',      ja: 'リーチ',           x: 20, y: 46, seat: 'マルカルス' },
  { id: 'pale',       ja: 'ペイル',           x: 58, y: 24, seat: 'ドーンスター' },
];

const DIVIDES =
  'M 34 14 L 36 34 L 30 46 L 18 54 M 36 34 L 52 38 L 50 56 L 44 74 '
  + 'M 52 38 L 66 34 L 68 52 L 62 68 M 66 34 L 64 16 M 68 52 L 84 56 '
  + 'M 66 34 L 84 30 M 84 30 L 92 26 M 30 46 L 50 56 M 50 56 L 62 68';

// 拠点の位置。地名ごとに座標を持つ。項の「拠点」欄はここを引く。
export const SEATS = {
  'ホワイトラン':        [50, 44],
  'ジョラーヴァスクル':   [51, 43],
  'リフテン':            [78, 66],
  'ソリチュード':        [30, 18],
  'ウィンドヘルム':      [76, 38],
  'マルカルス':          [16, 48],
  'ウィンターホールド':   [76, 20],
  // ハイフロスガーは世界の喉の中腹にある。初版はホワイトランと同じ点に打っていたが、
  // 同じ点に二つの名を置くと、どちらの札も読めなくなる。位置のほうを正した。
  'ハイフロスガー':      [57, 51],
  'モーサル':            [44, 28],
  'ドーンスター':        [58, 18],
  'ファルクリース':      [40, 68],
  'ヴォルキハル城':      [62, 14],
  'フォート・ドーンガード': [86, 60],
  '不定':               null,
  'ソルスセイム':        [96, 22],
  'モロウウィンド':      [98, 46],
};

// 小地図。26mm 角。拠点を一点だけ打つ。
export function miniMap(seatName, { color = '#1b1b1a', mm = 26 } = {}) {
  const MPU = mm / 100;
  const p = SEATS[seatName];
  const dot = p
    ? `<circle cx="${p[0]}" cy="${p[1]}" r="3.2" fill="${color}"/>`
      + `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="none" stroke="${color}" stroke-width="0.8"/>`
    : `<path d="M 42 38 L 58 38 M 50 30 L 50 46" stroke="${color}" stroke-width="1.2"/>`;  // 不定
  return `<svg class="minimap" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">`
    + `<path d="${PROVINCE}" fill="#e8e5dc"/>`
    + `<path d="${DIVIDES}" fill="none" stroke="#b3afa3" stroke-width="${(0.13 / MPU).toFixed(2)}" stroke-linejoin="round"/>`
    + contour(PROVINCE, { w: 0.22, mmPerUnit: MPU })
    + dot
    + `</svg>`;
}

// ── 図一　タムリエル全図 ──────────────────────────
// 本書が扱うのは州一つだが、州の外に本拠を持つ組織が九つある。
// 全図を掲げないと、その九つの「遠さ」が読者に伝わらない。
// 州境は模式であり、測量に基づくものではない。学術書の全図はこれで足りる。
export const PROVINCES = [
  { id: 'highrock',   ja: 'ハイロック',     cx: 20, cy: 20,
    d: 'M 8 26 L 10 14 L 20 8 L 30 12 L 32 22 L 26 30 L 14 32 Z' },
  { id: 'skyrim',     ja: 'スカイリム',     cx: 47, cy: 18,
    d: 'M 32 22 L 30 12 L 42 6 L 58 8 L 66 14 L 62 26 L 48 30 L 36 28 Z' },
  { id: 'morrowind',  ja: 'モロウウィンド',  cx: 76, cy: 25,
    d: 'M 66 14 L 74 8 L 86 12 L 90 26 L 86 40 L 76 42 L 68 34 L 62 26 Z' },
  { id: 'hammerfell', ja: 'ハンマーフェル',  cx: 20, cy: 36,
    d: 'M 8 26 L 14 32 L 26 30 L 32 22 L 36 28 L 34 40 L 22 46 L 10 42 L 4 34 Z' },
  { id: 'cyrodiil',   ja: 'シロディール',    cx: 50, cy: 40,
    d: 'M 34 40 L 36 28 L 48 30 L 62 26 L 68 34 L 66 48 L 54 54 L 40 50 Z' },
  { id: 'blackmarsh', ja: 'ブラックマーシュ', cx: 77, cy: 52,
    d: 'M 68 34 L 76 42 L 86 40 L 90 52 L 84 64 L 72 66 L 64 56 L 66 48 Z' },
  { id: 'elsweyr',    ja: 'エルスウェア',    cx: 54, cy: 61,
    d: 'M 40 50 L 54 54 L 66 48 L 64 56 L 72 66 L 60 72 L 46 68 L 38 60 Z' },
  { id: 'valenwood',  ja: 'ヴァレンウッド',  cx: 30, cy: 58,
    d: 'M 22 46 L 34 40 L 40 50 L 38 60 L 46 68 L 34 74 L 22 68 L 18 56 Z' },
  { id: 'summerset',  ja: 'サマーセット',    cx: 12, cy: 69,
    d: 'M 6 62 L 16 58 L 22 66 L 18 78 L 8 78 L 2 70 Z' },
];

// 州外に本拠を持つ組織。全図では、その州に印を打つ。
export const FOREIGN = {
  cyrodiil:  ['帝国軍', 'ペントゥス・オクラトゥス', '東帝都社', 'サイノッド', '神話の夜明け残党'],
  morrowind: ['モラグ・トング', 'トリビュナル寺院', 'ハウス・レドラン', 'ハウス・テルヴァンニ'],
  summerset: ['サルモール', 'サマーセットの影', 'サイジック会'],
  hammerfell: ['アリキール'],
};

export function tamrielMap({ size = 760, mark = 'skyrim' } = {}) {
  const S = size / 100;
  let out = '';
  for (const p of PROVINCES) {
    const here = p.id === mark;
    out += `<path d="${p.d}" fill="${here ? '#dcd6c4' : '#eeebe2'}"/>`;
    if (here) out += engrave(p.d, { t: 0.18, angle: 40, box: [0, 0, 100, 100], seed: p.id, mmPerUnit: size * 0.264 / 100 });
    out += contour(p.d, { w: here ? 0.9 : 0.4 });
  }
  out += drawLabels(tamrielLabels({ mark }).placed);
  return `<svg viewBox="0 0 100 84" width="${size}" height="${size * 0.84}" `
    + `xmlns="http://www.w3.org/2000/svg" font-family="Noto Serif JP, serif">${out}</svg>`;
}

// 州名は、その州の輪郭の内側に収める。
// 「ヴァレンウッド」は七字あり、字面が州の幅に近い。中央に置くと隣の州へはみ出す。
// 収まらない州では字を一段小さくしてから、置き場を探し直す。
// 描くほうと検めるほう（check-maps.mjs）で同じ計算を使う。別々に持つと必ずずれる。
export function tamrielLabels({ mark = 'skyrim' } = {}) {
  const labels = PROVINCES.map((p) => {
    const here = p.id === mark;
    const lines = [p.ja];
    if (FOREIGN[p.id]) lines.push(`本書所収 ${FOREIGN[p.id].length} 項`);
    return { name: p.ja, x: p.cx, y: p.cy, lines, size: 2.5, ls: 0.3, gap: 1.2,
      centre: true, poly: polyOf(p.d),
      fill: here ? '#1b1b1a' : '#6a675e', weight: here ? 600 : null,
      rowFill: FOREIGN[p.id] ? [null, '#8a6f2e'] : null,
      rowSize: FOREIGN[p.id] ? [null, 1.9] : null };
  });
  const bounds = { x0: 0.5, y0: 2, x1: 99.5, y1: 82 };
  return { placed: placeLabels(labels, { bounds, shrink: 4, min: 1.7 }), bounds };
}

// ── 図二　スカイリム九領図 ────────────────────────
// 部分図。領境・領都・街道・本書に現れる拠点を打つ。
// 小地図が「どのあたりか」だけを示すのに対し、ここは案内する図である。
const ROADS =
  'M 30 20 L 44 30 L 50 44 L 58 20 M 50 44 L 76 38 M 50 44 L 40 66 M 50 44 L 16 48 '
  + 'M 76 38 L 78 66 M 40 66 L 78 66 M 58 20 L 76 20 M 30 20 L 16 48';

// 図二の中身。札の置き場と、打つ点の一覧を返す。
// 州の外に本拠を持つ地（ソルスセイム・モロウウィンド）も、遠さを示すために縁へ打つ。
// この二つだけは州の輪郭の内側に札を置けないので、輪郭の判定から外す。
export function skyrimLabels({ seats = null } = {}) {
  const poly = polyOf(PROVINCE);
  const list = seats ?? Object.entries(SEATS).filter(([, v]) => v);

  // 同じ地点に二つの名が来ることがある。ジョラーヴァスクルはホワイトランの中にある。
  // 点を二つ打てば札も二つ要り、必ず重なる。二・五単位以内は一点にまとめ、名を積む。
  const pts = [];
  for (const [name, p] of list) {
    const near = pts.find((q) => Math.hypot(q.x - p[0], q.y - p[1]) <= 2.5);
    if (near) near.names.push(name);
    else pts.push({ x: p[0], y: p[1], names: [name], out: !inPoly(p, poly) });
  }

  const labels = [
    ...HOLDS.map((h) => ({ kind: 'hold', name: h.ja, x: h.x, y: h.y, lines: [h.ja],
      size: 2.6, ls: 0.3, gap: 1.4, centre: true, poly, fill: '#55534d' })),
    ...pts.map((q) => ({ kind: 'seat', name: q.names.join('・'), x: q.x, y: q.y,
      lines: q.names, size: 2.1, ls: 0.16, gap: 1.9,
      poly: q.out ? null : poly, outside: q.out ? poly : null, fill: '#1b1b1a' })),
  ];
  // 打った点そのものも避ける。札が点に掛かると、どの札がどの点のものか分からない。
  const obstacles = pts.map((q) => ({ x0: q.x - 1.3, y0: q.y - 1.3, x1: q.x + 1.3, y1: q.y + 1.3 }));
  // 州外の二点（ソルスセイム・モロウウィンド）は右の縁の外にある。
  // 枠を右へ広げておかないと、札が州の輪郭の太い線の上に乗る。
  const bounds = { x0: 0.5, y0: 2.5, x1: 111, y1: 78 };
  return { pts, placed: placeLabels(labels, { bounds, obstacles, shrink: 4, min: 1.7 }), bounds };
}

export function skyrimMap({ size = 900, seats = null } = {}) {
  const { pts, placed } = skyrimLabels({ seats });
  let out = `<path d="${PROVINCE}" fill="#eeebe2"/>`;
  out += `<path d="${ROADS}" fill="none" stroke="#b7b2a4" stroke-width="0.45" `
    + `stroke-dasharray="1.6 1.1" stroke-linecap="round"/>`;
  out += `<path d="${DIVIDES}" fill="none" stroke="#a9a599" stroke-width="0.5" stroke-linejoin="round"/>`;
  out += contour(PROVINCE, { w: 0.9 });
  for (const q of pts) {
    out += q.out
      ? `<circle cx="${q.x}" cy="${q.y}" r="0.95" fill="#eeebe2" stroke="#1b1b1a" stroke-width="0.4"/>`
      : `<circle cx="${q.x}" cy="${q.y}" r="0.95" fill="#1b1b1a"/>`;
  }
  // 札が点から離れたときは、細い引出線で結ぶ。離れた札は、どの点のものか分からない。
  for (const L of placed) {
    if (L.kind !== 'seat') continue;
    const cx = Math.max(L.rect.x0, Math.min(L.x, L.rect.x1));
    const cy = Math.max(L.rect.y0, Math.min(L.y, L.rect.y1));
    const d = Math.hypot(cx - L.x, cy - L.y);
    if (d > 2.6) out += `<line x1="${L.x}" y1="${L.y}" x2="${cx.toFixed(2)}" y2="${cy.toFixed(2)}" `
      + `stroke="#8d8a80" stroke-width="0.22"/>`;
  }
  out += drawLabels(placed);
  return `<svg viewBox="0 0 112 80" width="${size}" height="${(size * 80 / 112).toFixed(1)}" `
    + `xmlns="http://www.w3.org/2000/svg" font-family="Noto Serif JP, serif">${out}</svg>`;
}

// ── 図三　勢力分布図（見開き 2P）で使う版。領名と、活動域の網掛けを持つ。
export function provinceMap({ size = 900, marks = [] } = {}) {
  const S = size / 100;
  let out = `<path d="${PROVINCE}" fill="#e8e5dc"/>`;
  // 活動域は分類色の網。エングレービングと同じ流儀で、面ではなく線で示す。
  for (const m of marks) {
    out += `<g opacity="0.55">${engrave(m.d, { t: m.t ?? 0.3, angle: m.angle ?? 40,
      box: m.box ?? [0, 0, 100, 80], seed: m.id, ink: m.color })}</g>`;
  }
  out += `<path d="${DIVIDES}" fill="none" stroke="#a9a599" stroke-width="0.5" stroke-linejoin="round"/>`;
  out += contour(PROVINCE, { w: 0.9 });
  out += drawLabels(placeLabels(
    HOLDS.map((h) => ({ name: h.ja, x: h.x, y: h.y, lines: [h.ja], size: 2.4, ls: 0.28,
      gap: 1.4, centre: true, poly: polyOf(PROVINCE), fill: '#5c5a54' })),
    { bounds: { x0: 0.5, y0: 2.5, x1: 99.5, y1: 78 } }));
  return `<svg viewBox="0 0 100 80" width="${size}" height="${size * 0.8}" `
    + `xmlns="http://www.w3.org/2000/svg" font-family="Noto Serif JP, serif">${out}</svg>`;
}


// 拠点が「不定」の組織にも、活動の中心が判っているものがある。
// 拠点欄を書き換えるわけにはいかない——不定は不定だからだ——ので、
// 分布図のためだけの座標を別に持つ。値が文字列のものは図に打てない組織で、
// 図の外の欄に、その理由ごとにまとめる。
export const MAPAT = {
  nightingale: [80, 70],  blades: [22, 60],   forsworn: [16, 56],
  glenmoril: [12, 44],    synod: [72, 26],    alikr: [46, 50],
  auriel: [10, 36],       peryite: [18, 40],  vigilants: [34, 24],
  psijic: '州外',          shadows: '州外',     moth: '州外',
  idealmasters: '領域外',
  silverhand: '州内各地',  dragoncult: '州内各地', daedriccults: '州内各地',
  orcstrongholds: '州内各地', bandits: '州内各地', alduin: '州内各地',
  khajiitcaravans: '巡回',
  moot: '定めなし',        whispers: '不明',     mythicdawn: '不明',
};

// ── 図三　勢力分布図（見開き 2P） ──────────────────
// 分類色の網を七枚重ねると、版面が濁って何も読めなくなる。
// 分布図に必要なのは「どこに何があるか」であって、面の広がりではない。
// そこで四十九項を番号入りの点として打ち、拠点の重なる組織は
// その点のまわりに環状に並べる。凡例は番号で引く。
// 拠点が州外の組織と「不定」の組織は、図の外の欄にまとめる。
export function distributionMap({ size = 1500, factions, records, categories }) {
  const catOf = (f) => categories.find((c) => c.id === f.cat);
  const groups = new Map();       // 地名 → 組織の配列
  const offmap = [];              // 州外・不定
  factions.forEach((f, i) => {
    const seat = records[f.id]?.seat;
    const at = MAPAT[f.id];
    const p = SEATS[seat] ?? (Array.isArray(at) ? at : null);
    if (!p) { offmap.push([i + 1, f, typeof at === 'string' ? at : '不明']); return; }
    const key = SEATS[seat] ? seat : f.ja;
    if (!groups.has(key)) groups.set(key, { p, list: [] });
    groups.get(key).list.push([i + 1, f]);
  });

  const seatLabels = [];
  let out = `<path d="${PROVINCE}" fill="#eeebe2"/>`;
  out += `<path d="${ROADS}" fill="none" stroke="#c0bbad" stroke-width="0.4" stroke-dasharray="1.6 1.1"/>`;
  out += `<path d="${DIVIDES}" fill="none" stroke="#a9a599" stroke-width="0.45" stroke-linejoin="round"/>`;
  out += contour(PROVINCE, { w: 0.8 });

  // 番号の玉を先に置く。玉は地点に紐づくので動かせない。
  // 地名の札と領名は、そのあとで玉を避けて置く。
  const beads = [];
  for (const [seat, g] of groups) {
    const [x, y] = g.p, list = g.list;
    const R = list.length === 1 ? 0 : 2.6 + list.length * 0.32;
    out += `<circle cx="${x}" cy="${y}" r="0.7" fill="#1b1b1a"/>`;
    list.forEach(([n, f], k) => {
      const a = (-Math.PI / 2) + (k / list.length) * Math.PI * 2;
      const px = x + Math.cos(a) * R, py = y + Math.sin(a) * R;
      if (R) out += `<line x1="${x}" y1="${y}" x2="${px.toFixed(2)}" y2="${py.toFixed(2)}" `
        + `stroke="#8d8a80" stroke-width="0.18"/>`;
      out += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="1.55" fill="${catOf(f).color}"/>`
        + `<text x="${px.toFixed(2)}" y="${(py + 0.62).toFixed(2)}" text-anchor="middle" `
        + `font-size="1.75" fill="#fbfaf6" font-family="EB Garamond, serif">${n}</text>`;
      beads.push({ x0: px - 1.7, y0: py - 1.7, x1: px + 1.7, y1: py + 1.7 });
    });
    beads.push({ x0: x - 0.9, y0: y - 0.9, x1: x + 0.9, y1: y + 0.9 });
    seatLabels.push({ seat, x, y, R });
  }

  const poly = polyOf(PROVINCE);
  const labels = [
    ...HOLDS.map((h) => ({ kind: 'hold', name: h.ja, x: h.x, y: h.y, lines: [h.ja],
      size: 2.3, ls: 0.3, gap: 1.4, centre: true, poly, fill: '#6a675e' })),
    ...seatLabels.map((s) => ({ kind: 'seat', name: s.seat, x: s.x, y: s.y, lines: [s.seat],
      size: 1.9, ls: 0.2, gap: s.R + 1.6, fill: '#3a3830',
      // 州の内側の地名は輪郭の内側に置く。輪郭に掛かると、太い線に食われて読めない。
      poly: inPoly([s.x, s.y], poly) ? poly : null })),
  ];
  // 州外の点（ソルスセイム・モロウウィンド）は縁の外にある。玉の環も札もそこへ出るので、
  // 図の枠を左右に広げてある。狭いままだと、切り落とされる。
  const bounds = { x0: -2.5, y0: 0.5, x1: 106.5, y1: 82 };
  const placed = placeLabels(labels, { bounds, obstacles: beads, shrink: 4, min: 1.5 });
  // 玉の環の外へ出た地名は、引出線で地点に戻す。
  for (const L of placed) {
    if (L.kind !== 'seat') continue;
    const cx = Math.max(L.rect.x0, Math.min(L.x, L.rect.x1));
    const cy = Math.max(L.rect.y0, Math.min(L.y, L.rect.y1));
    const R = seatLabels.find((s) => s.seat === L.name).R;
    if (Math.hypot(cx - L.x, cy - L.y) > R + 2.4) {
      out += `<line x1="${L.x}" y1="${L.y}" x2="${cx.toFixed(2)}" y2="${cy.toFixed(2)}" `
        + `stroke="#a8a49a" stroke-width="0.2"/>`;
    }
  }
  out += drawLabels(placed);

  const VB = [-3, -1, 111, 85];
  return { svg: `<svg viewBox="${VB.join(' ')}" width="${size}" height="${(size * VB[3] / VB[2]).toFixed(1)}" `
    + `xmlns="http://www.w3.org/2000/svg" font-family="Noto Serif JP, serif">${out}</svg>`,
    offmap, placed, bounds };
}
