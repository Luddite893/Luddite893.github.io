// 版面データの書き出し（InDesign 相当のレイアウトデータ）
//
// 仕様書 12「InDesign 相当のレイアウトデータ」への納品物。
// 本件の組版は InDesign ではなく HTML/CSS で行っているので、
// .indd は存在しない。代わりに、InDesign の「ドキュメント設定＋マスターページ＋
// 段落スタイル＋オブジェクトスタイル」に対応する数値をすべて JSON で出す。
// これを見れば、InDesign 上に同じ版面を起こせる。

import { writeFileSync } from 'node:fs';
import { G, span, at, ruleOffset } from './grid.mjs';
import { categories } from './factions.mjs';
import { TONE } from './engrave.mjs';

const data = {
  ドキュメント設定: {
    判型: 'A4 縦', 仕上がり: [G.pageW, G.pageH], 単位: 'mm',
    塗り足し: 3, トンボ: 8, 綴じ: '左綴じ・見開き', 総頁: 140,
    刷り: '二色（墨＋分類色）', 図版解像度: 'ベクター（350dpi 相当以上）',
  },
  マージン: { 天: G.top, 地: G.bottom, ノド: G.inner, 小口: G.outer },
  版面: { 幅: G.frameW, 高: +G.frameH.toFixed(1) },
  グリッド: {
    段数: G.cols, 段間: G.gutter, 一段の幅: +G.col.toFixed(3),
    n段の幅: Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [n, +span(n).toFixed(3)])),
    n段目の左端: Object.fromEntries([0, 1, 2, 3, 4, 5].map((n) => [n, +at(n).toFixed(3)])),
    ベースライン: { 行送り: G.lead, 行数: G.lines, 第一行の位置: +ruleOffset.toFixed(3) },
  },
  段落スタイル: {
    本文: { 級数: G.size, 行送り: G.lead, 書体: 'Noto Serif JP Regular', 揃え: '両端' },
    概要: { 級数: G.size, 行送り: G.lead, 字数: '200〜300 字' },
    項名: { 級数: 7.4, 行送り: +(G.lead * 1.75).toFixed(2), ウェイト: 'SemiBold', 字間: '.04em' },
    欧字併記: { 級数: 3.1, 書体: 'EB Garamond Regular', 字間: '.3em' },
    大見出し: { 級数: 6.4, 行送り: +(G.lead * 2).toFixed(2), ウェイト: 'SemiBold' },
    小見出し: { 級数: 3.6, ウェイト: 'SemiBold' },
    目的: { 級数: 3.1, 行送り: G.lead, 行頭: '— ', 字下げ: 5 },
    図版説明: { 級数: 2.6, 行送り: +(G.lead * 0.8).toFixed(2), 色: '#5c5a54' },
    註記: { 級数: 2.8, 行送り: +(G.lead * 0.86).toFixed(2), 色: '#5c5a54' },
    柱: { 級数: 2.5, 字間: '.1em', 罫: '0.5mm 分類色' },
    ノンブル: { 級数: 3, 書体: 'EB Garamond Regular', 位置: '版面の外 14mm 下' },
    引用: { 級数: 3.4, 行送り: +(G.lead * 1.2).toFixed(2), 前後: '「」', 上罫: '0.4mm 分類色' },
  },
  色: {
    墨: '#1b1b1a', 中間: '#5c5a54', 淡: '#8a877e', 罫: '#c9c6bd', 紙: '#f4f2ec',
    分類色: Object.fromEntries(categories.map((c) => [`${c.n} ${c.ja}`, c.color])),
  },
  小口の帯: {
    幅: 6, 丈: 26, 不透明度: 0.72,
    天からの位置: Object.fromEntries(categories.map((c, i) =>
      [`${c.n}`, +(G.top + ((G.frameH - 26) / 6) * i).toFixed(1)])),
    註: '色だけでなく天地の位置も分類ごとに変える。閉じたとき七本の縞になる。',
  },
  図版寸法: {
    主図版: { 幅: G.frameW, 比: '3:2' },
    紋章_項扉: 22, 紋章_一覧: 9, 小カット: +(G.col * 2 + G.gutter).toFixed(2), 人物図版: [17, 20.4],
    小地図: 34, 関係図: { 幅: G.frameW, 丈: '30〜86（関係の数と余白による）' },
  },
  彫りの調子: {
    註: '値の単位は刷り上がりのミリ。図版の座標系ではない。全図版がこの一つの表に従う。',
    ...TONE,
  },
  見開きの構造: {
    左_図版面: ['項番号と欧字名', '紋章', '主図版', '図版説明', '小カット三点'],
    右_情報面: ['名称・別称', '分類標識四項と分類', '概要', '拠点と小地図',
      '目的', '主要人物', '関係（図式）', '象徴的な一文'],
    註: '全 49 項で同一。頁をめくっても欄の位置が動かない。',
  },
};

writeFileSync(new URL('../out/版面データ.json', import.meta.url),
  JSON.stringify(data, null, 1));
console.log('版面データ → out/版面データ.json');
