// 図版を生成に出したときの費用を見積もる
//
//   node src/cost-artwork.mjs
//
// ── なぜ script にするか ──────────────────────────
// 見積りを文章で書けば、点数が変われば嘘になる。
// 点数・寸法・入力トークンの実測から毎回引き直す。
// 単価だけが外から来る数なので、出典と日付を添えて一箇所に置く。
//
// ── 解像度は「決める」ものではなく「出る」もの ─────────
// 本書の版面は 350dpi 以上と決めてある（入稿要領_図版.md）。
// 生成の側は縦横比ごとに画素数が決まっている。
// **版面の実寸から必要画素を出し、それを満たす最小の段を選ぶ。**
// 段が上がれば単価が上がるので、ここが費用を決める。

import { SIZE } from './artwork.mjs';

const DPI = 350;                      // 入稿要領で定めた下限
const 為替 = 155;                      // 円換算の目安。実際の請求はドル建て

// ── 生成側の画素数（縦横比 × 段）────────────────────
// 出典 https://ai.google.dev/gemini-api/docs/image-generation
const PIXELS = {
  '5:4': { '1K': [1152, 928], '2K': [2304, 1856], '4K': [4608, 3712] },
  '2:3': { '1K': [848, 1264], '2K': [1696, 2528], '4K': [3392, 5056] },
};

// ── 単価 ────────────────────────────────────────
// 2026-08 時点。Batch API は 24 時間の窓と引き換えに半額。
const MODELS = {
  'gemini-3-pro-image': {
    入力: 2.00 / 1e6,
    画像: { '1K': 0.134, '2K': 0.134, '4K': 0.240 },   // 1120 / 1120 / 2000 トークン
    note: '最も精緻。線の彫りが安定する',
  },
  'gemini-3.1-flash-image': {
    入力: 0.50 / 1e6,
    画像: { '1K': 0.067, '2K': 0.101, '4K': 0.151 },   // 1120 / 1680 / 2520 トークン
    note: '速い。量を通すならこちら',
  },
};

// ── 点数と入力トークン（countTokens による実測）──────
// node src/prompt-artwork.mjs で書き出した 232 点をそのまま数えた値。
const JOBS = {
  主図版: { 点数: 58, 比: '5:4', トークン: 14772 },
  人物図版: { 点数: 174, 比: '2:3', トークン: 54269 },
};

// ── 必要画素を満たす最小の段 ──────────────────────
const mmToPx = (mm) => Math.ceil((mm / 25.4) * DPI);

function 段を選ぶ(比, 必要) {
  for (const 段 of ['1K', '2K', '4K']) {
    const [w, h] = PIXELS[比][段];
    if (w >= 必要[0] && h >= 必要[1]) return 段;
  }
  return null;
}

const 円 = (d) => `¥${Math.round(d * 為替).toLocaleString('ja-JP')}`;
const 弗 = (d) => `$${d.toFixed(2)}`;

console.log(`── 版面が要求する画素（${DPI}dpi）`);
const 選択 = {};
for (const [種別, j] of Object.entries(JOBS)) {
  const s = SIZE[種別];
  const 必要 = [mmToPx(s.w), mmToPx(s.h)];
  const 段 = 段を選ぶ(j.比, 必要);
  const [w, h] = PIXELS[j.比][段];
  const 実効 = Math.floor(w / (s.w / 25.4));
  選択[種別] = 段;
  console.log(`  ${種別.padEnd(5, '　')} ${s.w}×${s.h}mm  比 ${j.比}`
    + `  要 ${必要[0]}×${必要[1]}px  → ${段} ${w}×${h}px（実効 ${実効}dpi）`);
  // 一段下だとどうなるかも出す。ここが判断の分かれ目になる
  const 下 = ['1K', '2K', '4K'][['1K', '2K', '4K'].indexOf(段) - 1];
  if (下) {
    const [dw] = PIXELS[j.比][下];
    console.log(`  ${''.padEnd(5, '　')} 　一段下（${下}）だと ${Math.floor(dw / (s.w / 25.4))}dpi。`
      + `入稿要領の下限 ${DPI}dpi に届かない`);
  }
}

console.log(`\n── 一巡（${Object.values(JOBS).reduce((a, j) => a + j.点数, 0)} 点）の費用`);
const 一巡 = {};
for (const [model, m] of Object.entries(MODELS)) {
  let 画像費 = 0; let 入力費 = 0;
  const 内訳 = [];
  for (const [種別, j] of Object.entries(JOBS)) {
    const 単 = m.画像[選択[種別]];
    画像費 += j.点数 * 単;
    入力費 += j.トークン * m.入力;
    内訳.push(`${種別} ${j.点数}点×${弗(単)}(${選択[種別]})=${弗(j.点数 * 単)}`);
  }
  一巡[model] = 画像費 + 入力費;
  console.log(`\n  ${model}　${m.note}`);
  console.log(`    ${内訳.join('　')}`);
  console.log(`    入力 ${Object.values(JOBS).reduce((a, j) => a + j.トークン, 0).toLocaleString()} トークン = ${弗(入力費)}`);
  console.log(`    計 ${弗(一巡[model])}（${円(一巡[model])}）　Batch API なら ${弗(一巡[model] / 2)}（${円(一巡[model] / 2)}）`);
}

// ── 刷り直しの見込み ──────────────────────────────
// 銅版画の条件（べた黒を作らない・文字を入れない・54度の交差線）は
// 一度で全点が通る類の指示ではない。artwork.py inspect の関門で落ちた分は投げ直す。
// 一巡で済む前提の見積りは、必ず外れる。倍率で幅を持たせる。
console.log('\n── 刷り直しを見込んだ幅');
console.log('  倍率 │' + Object.keys(MODELS).map((m) => m.padStart(23) + ' │').join('') + '  （Batch は半額）');
for (const [倍, 説] of [[1.0, '全点が一度で通る（まず無い）'], [1.5, '三点に一点を投げ直す'],
  [2.0, '半分を投げ直す（見込みの中心）'], [3.0, '手直しが込み入った場合']]) {
  const cells = Object.keys(MODELS)
    .map((m) => `${弗(一巡[m] * 倍)} / ${円(一巡[m] * 倍)}`.padStart(23) + ' │');
  console.log(`  ${倍.toFixed(1)}倍│${cells.join('')}  ${説}`);
}

console.log(`\n  為替は 1ドル ${為替}円として換算。請求はドル建て。`);
console.log('  Batch API（24時間の窓）は半額。二百三十二点は対話を要さないので、これが効く。');
