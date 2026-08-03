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

// 全体図（勢力分布図・見開き 2P）で使う版。領名と、活動域の網掛けを持つ。
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
