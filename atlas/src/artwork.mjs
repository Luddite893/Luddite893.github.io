// 入稿画像の取り込み
//
// 発注者様から支給される図版を、本書の版面に埋め込むための工程。
//
// ── 置き場所と名前 ──────────────────────────────
//   assets/artwork/主図版/<項の id>.png            例 companions.png
//   assets/artwork/人物図版/<項の id>-<番号>.png   例 companions-1.png（1 は掲載順）
//
// 拡張子は png / jpg / jpeg / webp / tif を受ける。
// 名前が一致した項だけが差し替わり、無い項は従来の描画のまま組まれる。
// **一点ずつ差し替えられる**ので、49 点が揃うのを待たずに進行できる。
//
// ── 二色刷りの扱い ────────────────────────────
// 支給図版は**墨版**として扱う。分類色は下に敷き、線には乗せない。
// 初版の規約（納品書 14-3）をラスタでも守るため、乗算合成を使う。
//   下　分類色の面
//   上　支給図版（白は乗算で透ける ＝ 紙が出る）
// これで「線に色が乗った着色イラスト」にはならない。
//
// ── 解像度 ──────────────────────────────────
// 版面での実寸から実効 dpi を算出し、350 を下回るものを名指しする。
// 閲覧用と印刷用で要求が違うので、判定は二段で出す。

import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('../assets/artwork/', import.meta.url));
const EXT = ['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff'];

// 版面での実寸（ミリ）。ここが dpi 判定の分母になる。
export const SIZE = {
  主図版: { w: 174, h: 139.2 },      // 本文欄幅いっぱい。5:4
  人物図版: { w: 62, h: 93 },        // 甲。改訂指示書 6-4 の拡大枠
  人物図版乙: { w: 34, h: 51 },      // 乙。第二版見本の枠
};

const listDir = (sub) => {
  const d = ROOT + sub + '/';
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((f) => EXT.includes(f.slice(f.lastIndexOf('.')).toLowerCase()))
    .map((f) => ({ file: f, path: d + f, key: f.slice(0, f.lastIndexOf('.')) }));
};

// 画素数を読む。png / jpeg はヘッダから直接取れる。他は Chromium に頼らず諦めて null。
export function pixels(path) {
  const b = readFileSync(path);
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) {                 // PNG
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {                                   // JPEG
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF'
    && b.toString('ascii', 8, 12) === 'WEBP') {                           // WebP (VP8X/VP8L/VP8)
    const c = b.toString('ascii', 12, 16);
    if (c === 'VP8X') return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
  }
  return null;
}

// 目録。項の id → 図版の情報。
export function index() {
  const out = { 主図版: {}, 人物図版: {} };
  for (const e of listDir('主図版')) {
    out.主図版[e.key] = { ...e, px: pixels(e.path), bytes: statSync(e.path).size };
  }
  for (const e of listDir('人物図版')) {
    const m = e.key.match(/^(.+?)-(\d+)$/);
    if (!m) continue;
    (out.人物図版[m[1]] ??= [])[+m[2] - 1] = { ...e, px: pixels(e.path), bytes: statSync(e.path).size };
  }
  return out;
}

// 実効 dpi。版面の実寸に対して画素が足りているか。
export const dpiOf = (px, mm) => (px && mm ? px / (mm / 25.4) : 0);

// ── 版面への埋め込み ────────────────────────────
// 支給図版を墨版として置き、分類色を下に敷く。
// 白を透かすのは乗算合成。ラスタでも「線に色を乗せない」を守る。
export function artImg(path, { w, h, color = null, alt = '' } = {}) {
  const src = 'file://' + path;
  const plate = color
    ? `<div class="art-color" style="background:${color}"></div>` : '';
  return `<div class="art" style="width:${w}mm;height:${h}mm">`
    + plate
    + `<img class="art-ink" src="${src}" alt="${alt}" width="${w}mm" height="${h}mm">`
    + `</div>`;
}

export const artworkCss = () => `
/* 支給図版。墨版として扱い、分類色は下に敷く。 */
.art { position:relative; overflow:hidden; }
.art-color { position:absolute; inset:0; opacity:.16; }
.art-ink { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
           mix-blend-mode:multiply; }
/* 乗算に対応しない環境でも、白地の図版なら見た目は変わらない。 */
@media print { .art-ink { mix-blend-mode:multiply; } }
`;

// ── 一括検分 ───────────────────────────────────
// 49 点を並べて一度に見るための数値。目視では拾えないものだけを出す。
export function inspect(factions) {
  const ix = index();
  const rows = [];
  for (const f of factions) {
    const a = ix.主図版[f.id];
    if (!a) { rows.push({ id: f.id, ja: f.ja, 状態: '未入稿' }); continue; }
    const S = SIZE.主図版;
    const dpi = a.px ? Math.round(dpiOf(a.px.w, S.w)) : 0;
    const aspect = a.px ? a.px.w / a.px.h : 0;
    rows.push({
      id: f.id, ja: f.ja, 状態: '入稿済',
      px: a.px ? `${a.px.w}×${a.px.h}` : '不明',
      dpi, 比: aspect ? aspect.toFixed(3) : '—',
      規定比: (S.w / S.h).toFixed(3),
      MB: +(a.bytes / 1048576).toFixed(2),
      判定: !a.px ? '寸法不明'
        : dpi < 300 ? '解像度不足'
        : dpi < 350 ? '印刷用に不足（閲覧用は可）'
        : Math.abs(aspect - S.w / S.h) > 0.02 ? '縦横比が規定と違う'
        : '可',
    });
  }
  return rows;
}
