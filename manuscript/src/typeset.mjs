// 組版エンジン
//
// 方針（仕様書 4-3 への回答）：
//   (a) 明朝体のまま、印圧・かすれ・墨の濃淡を後処理で加える  ← 基本線
//   (b) 要所に別の手を混ぜる                                ← 後年の書き込みに限定
//   (c) 手書き風フォント                                    ← 本文には使わない
//
// 具体的には、本文を一字ずつ包み、字ごとに
//   ・ごく僅かな回転（筆の角度の揺れ）
//   ・ごく僅かな上下動（罫線に乗り切らない）
//   ・墨の濃度差（継いだ直後は濃く、掠れる直前は薄い）
//   ・稀に太る字（墨溜まり）
// を与える。振幅は小さく保つ。大きくすると「手書き風フォント」と同じ失敗をする。
//
// 生成される字は実テキストのまま（画像化しない）ので、
// PDF のテキスト層は検索可能なまま維持される。損傷はすべて上に重ねる。

// ── 決定論的乱数（再ビルドで版面が変わらないように） ─────────────
export function makeRng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── 禁則 ────────────────────────────────────────────────
// 行頭に来てはいけない字
const NO_LINE_START = '、。，．・：；？！ゝゞーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ）」』】〉》〕｝”’,.!?:;)]}';
// 行末に来てはいけない字
const NO_LINE_END = '（「『【〈《〔｛“‘([{';

const isAscii = (ch) => /[A-Za-z0-9@#$%&*+\-=/\\_~^]/.test(ch);

// 文字列を「分割してよい単位」に束ねる。
// ・行頭禁止字は直前の字にくっつける
// ・行末禁止字は直後の字にくっつける
// ・ラテン文字の連なりは一語で保つ
function cluster(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    let ch = text[i];

    if (isAscii(ch)) {
      let w = '';
      while (i < text.length && (isAscii(text[i]) || text[i] === "'" || text[i] === '.')) { w += text[i]; i++; }
      out.push({ s: w, latin: true });
      continue;
    }

    // 行末禁止字は後続を引き連れる
    let s = ch; i++;
    while (i < text.length && NO_LINE_END.includes(s[s.length - 1])) { s += text[i]; i++; }
    // 行頭禁止字を吸収
    while (i < text.length && NO_LINE_START.includes(text[i])) { s += text[i]; i++; }
    out.push({ s, latin: false });
  }
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── 一字ごとの揺らぎ付き組版 ───────────────────────────────
// hand: 筆跡の乱れ 0（整っている）〜1（乱れている）
export function penned(text, rng, hand = 0, opts = {}) {
  if (!text) return '';
  const scale = opts.scale ?? 1;
  const units = cluster(text);
  let out = '';
  // 墨継ぎ：一定字数ごとに濃く始まり、次第に掠れる
  let inkLeft = 0;

  for (const u of units) {
    if (u.s === '　' || u.s === ' ') { out += u.s; continue; }

    if (inkLeft <= 0) inkLeft = 14 + Math.floor(rng() * 22);
    const dip = inkLeft / 30;                       // 1 に近いほど墨を継いだ直後
    inkLeft--;

    // 筆の角度の揺れ
    const rot = (rng() - 0.5) * (0.55 + hand * 2.6) * scale;
    // 罫線からの浮き沈み
    const dy = (rng() - 0.5) * (0.34 + hand * 1.5) * scale;
    const dx = (rng() - 0.5) * (0.20 + hand * 0.7) * scale;
    // 墨の濃淡：継いだ直後は濃い。掠れ際は薄い。
    const wet = rng();
    let alpha = 0.80 + dip * 0.16 + wet * 0.06;
    if (wet > 0.965) alpha = 1;                      // 墨溜まり
    if (wet < 0.045) alpha = 0.60 - hand * 0.16;     // 掠れ
    alpha = Math.min(1, Math.max(0.42, alpha));
    // 印圧（僅かな太り）
    const heavy = wet > 0.965 ? ' pk-w' : (wet < 0.045 ? ' pk-d' : '');

    const st = `--a:${alpha.toFixed(3)};--r:${rot.toFixed(2)}deg;--x:${dx.toFixed(2)}px;--y:${dy.toFixed(2)}px`;
    out += `<i class="pk${heavy}" style="${st}">${esc(u.s)}</i>`;
  }
  return out;
}

// ── 行内記法の解釈 ───────────────────────────────────────
// [[k|text]] を取り出し、種別ごとの組版に振り分ける
const SPAN_RE = /\[\[([a-z]{1,2})\|([\s\S]*?)\]\]/g;

export function inline(raw, rng, hand = 0) {
  if (!raw) return '';
  let out = '';
  let last = 0;
  let m;
  SPAN_RE.lastIndex = 0;
  while ((m = SPAN_RE.exec(raw)) !== null) {
    out += penned(raw.slice(last, m.index), rng, hand);
    out += mark(m[1], m[2], rng, hand);
    last = m.index + m[0].length;
  }
  out += penned(raw.slice(last), rng, hand);
  return out;
}

function mark(kind, text, rng, hand) {
  switch (kind) {
    // ── 色 ──────────────────────────────
    case 'r':  // 朱
      return `<span class="ink-red">${penned(text, rng, hand)}</span>`;
    case 'g':  // 金（女神メリディアに関する記述のみ）
      return `<span class="ink-gold">${penned(text, rng, hand)}</span>`;
    case 'u':  // 群青（闇・夜・コールドハーバーの章のみ）
      return `<span class="ink-blue">${penned(text, rng, hand)}</span>`;
    case 'em': // 墨を継いだ箇所
      return `<span class="ink-heavy">${penned(text, rng, hand)}</span>`;

    // ── 損傷 ────────────────────────────
    // 掻き取り：書いた本人が消した。下に元の字が薄く残る。
    // 実テキストは残したまま、羊皮紙色の不定形を上に重ねる。
    case 's': {
      const seed = Math.floor(rng() * 100000);
      return `<span class="dmg-scrape" style="--sd:${seed}">`
           + `<span class="dmg-under">${penned(text, rng, hand)}</span>`
           + `<span class="dmg-veil" aria-hidden="true"></span></span>`;
    }
    // 水損：インクが滲む。
    // 見せる字はぼかすが、その下に透明の実テキストを敷いて検索可能性を保つ
    // （仕様 3「装飾の下に検索可能な透明テキスト層」）。
    case 'w':
      return `<span class="dmg-water">`
           + `<span class="dw-vis" aria-hidden="true">${penned(text, rng, hand)}</span>`
           + `<span class="dw-txt">${esc(text)}</span></span>`;
    // 焼け：焦げに侵された箇所
    case 'b':
      return `<span class="dmg-burn">${penned(text, rng, hand)}</span>`;
    // 滅失：判読不能
    case 'x':
      return `<span class="dmg-lost">`
           + `<span class="dmg-under">${penned(text, rng, hand)}</span>`
           + `<span class="dmg-veil" aria-hidden="true"></span></span>`;

    default:
      return penned(text, rng, hand);
  }
}

// ── 後年の別筆（インクの色も筆致も違う。本文より新しい） ──────────
export function laterHand(text, rng) {
  const units = cluster(text);
  let out = '';
  for (const u of units) {
    const rot = (rng() - 0.5) * 2.2;
    const dy = (rng() - 0.5) * 1.1;
    out += `<i class="pk" style="--a:${(0.72 + rng() * 0.2).toFixed(2)};--r:${rot.toFixed(2)}deg;--x:0px;--y:${dy.toFixed(2)}px">${esc(u.s)}</i>`;
  }
  return out;
}
