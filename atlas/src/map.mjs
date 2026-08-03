// 地図
//
// 仕様書 9：地図 3 点（全体図＋部分図）。仕様書 5：拠点欄に地名＋小地図。
//
// 各項の小地図は 26mm 角に入る。ここに川も道も描けない。
// 描くのは州の輪郭と九つの領の境、そして拠点の位置だけ。
// 小地図の役目は「どのあたりか」を示すことであって、案内することではない。
// 案内は巻頭の勢力分布図（見開き 2P）が引き受ける。

import { engrave, contour } from './engrave.mjs';

// スカイリム州の略形。座標系 0..100 × 0..80。
// 実測に基づく厳密な図ではなく、九つの領の相対配置を保った模式図である。
// 学術書の小地図は、たいていこの水準で描かれる。
export const PROVINCE =
  'M 8 44 L 12 30 L 20 22 L 30 18 L 38 10 L 52 8 L 62 12 L 74 10 L 84 16 '
  + 'L 92 26 L 95 38 L 90 50 L 92 62 L 84 70 L 70 74 L 56 72 L 44 76 '
  + 'L 30 72 L 18 64 L 10 54 Z';

// 九つの領。輪郭の内側を分ける線だけを持つ。面は塗らない。
export const HOLDS = [
  { id: 'haafingar',  ja: 'ハーフィンガル',   x: 30, y: 22 },
  { id: 'hjaalmarch', ja: 'ヒャルマーク',     x: 44, y: 30 },
  { id: 'winterhold', ja: 'ウィンターホールド', x: 74, y: 22 },
  { id: 'eastmarch',  ja: 'イーストマーチ',   x: 74, y: 44 },
  { id: 'therift',    ja: 'リフト',           x: 76, y: 64 },
  { id: 'whiterun',   ja: 'ホワイトラン',     x: 50, y: 46 },
  { id: 'falkreath',  ja: 'ファルクリース',   x: 40, y: 66 },
  { id: 'reach',      ja: 'リーチ',           x: 20, y: 46 },
  { id: 'pale',       ja: 'ペイル',           x: 58, y: 24 },
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
  'ハイフロスガー':      [52, 44],
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
  for (const p of PROVINCES) {
    out += `<text x="${p.cx}" y="${p.cy}" text-anchor="middle" font-size="2.5" `
      + `fill="${p.id === mark ? '#1b1b1a' : '#6a675e'}" letter-spacing="0.3" `
      + `${p.id === mark ? 'font-weight="600"' : ''}>${p.ja}</text>`;
    if (FOREIGN[p.id]) {
      out += `<text x="${p.cx}" y="${p.cy + 3.4}" text-anchor="middle" font-size="1.9" `
        + `fill="#8a6f2e" letter-spacing="0.2">本書所収 ${FOREIGN[p.id].length} 項</text>`;
    }
  }
  return `<svg viewBox="0 0 100 84" width="${size}" height="${size * 0.84}" `
    + `xmlns="http://www.w3.org/2000/svg" font-family="Noto Serif JP, serif">${out}</svg>`;
}

// ── 図二　スカイリム九領図 ────────────────────────
// 部分図。領境・領都・街道・本書に現れる拠点を打つ。
// 小地図が「どのあたりか」だけを示すのに対し、ここは案内する図である。
const ROADS =
  'M 30 20 L 44 30 L 50 44 L 58 20 M 50 44 L 76 38 M 50 44 L 40 66 M 50 44 L 16 48 '
  + 'M 76 38 L 78 66 M 40 66 L 78 66 M 58 20 L 76 20 M 30 20 L 16 48';

export function skyrimMap({ size = 900, seats = null } = {}) {
  const S = size / 100;
  const list = seats ?? Object.entries(SEATS).filter(([, v]) => v);
  let out = `<path d="${PROVINCE}" fill="#eeebe2"/>`;
  out += `<path d="${ROADS}" fill="none" stroke="#b7b2a4" stroke-width="0.45" `
    + `stroke-dasharray="1.6 1.1" stroke-linecap="round"/>`;
  out += `<path d="${DIVIDES}" fill="none" stroke="#a9a599" stroke-width="0.5" stroke-linejoin="round"/>`;
  out += contour(PROVINCE, { w: 0.9 });
  for (const h of HOLDS) {
    out += `<text x="${h.x}" y="${h.y}" text-anchor="middle" font-size="2.6" `
      + `fill="#55534d" letter-spacing="0.3">${h.ja}</text>`;
  }
  for (const [name, p] of list) {
    out += `<circle cx="${p[0]}" cy="${p[1]}" r="0.95" fill="#1b1b1a"/>`
      + `<text x="${p[0] + 1.8}" y="${p[1] + 0.9}" font-size="2.1" fill="#1b1b1a" `
      + `letter-spacing="0.16">${name}</text>`;
  }
  return `<svg viewBox="0 0 100 80" width="${size}" height="${size * 0.8}" `
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
  for (const h of HOLDS) {
    out += `<text x="${h.x}" y="${h.y}" text-anchor="middle" font-size="2.4" `
      + `fill="#5c5a54" letter-spacing="0.28">${h.ja}</text>`;
  }
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

  let out = `<path d="${PROVINCE}" fill="#eeebe2"/>`;
  out += `<path d="${ROADS}" fill="none" stroke="#c0bbad" stroke-width="0.4" stroke-dasharray="1.6 1.1"/>`;
  out += `<path d="${DIVIDES}" fill="none" stroke="#a9a599" stroke-width="0.45" stroke-linejoin="round"/>`;
  out += contour(PROVINCE, { w: 0.8 });
  for (const h of HOLDS) {
    out += `<text x="${h.x}" y="${h.y}" text-anchor="middle" font-size="2.3" `
      + `fill="#6a675e" letter-spacing="0.3">${h.ja}</text>`;
  }
  for (const [seat, g] of groups) {
    const [x, y] = g.p, list = g.list;
    out += `<circle cx="${x}" cy="${y}" r="0.7" fill="#1b1b1a"/>`;
    const R = list.length === 1 ? 0 : 2.6 + list.length * 0.32;
    list.forEach(([n, f], k) => {
      const a = (-Math.PI / 2) + (k / list.length) * Math.PI * 2;
      const px = x + Math.cos(a) * R, py = y + Math.sin(a) * R;
      const c = catOf(f).color;
      if (R) out += `<line x1="${x}" y1="${y}" x2="${px.toFixed(2)}" y2="${py.toFixed(2)}" `
        + `stroke="#8d8a80" stroke-width="0.18"/>`;
      out += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="1.55" fill="${c}"/>`
        + `<text x="${px.toFixed(2)}" y="${(py + 0.62).toFixed(2)}" text-anchor="middle" `
        + `font-size="1.75" fill="#fbfaf6" font-family="EB Garamond, serif">${n}</text>`;
    });
    out += `<text x="${x}" y="${y - R - 2}" text-anchor="middle" font-size="1.9" `
      + `fill="#3a3830" letter-spacing="0.2">${seat}</text>`;
  }
  return { svg: `<svg viewBox="0 0 100 80" width="${size}" height="${size * 0.8}" `
    + `xmlns="http://www.w3.org/2000/svg" font-family="Noto Serif JP, serif">${out}</svg>`, offmap };
}
