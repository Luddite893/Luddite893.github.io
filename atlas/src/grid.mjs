// 基準グリッド
//
// 仕様書 4-1「グリッドは厳格に。全ページで同じ骨格」。
// 判型 A4 縦（210×297mm）。
//
// ── 骨格 ────────────────────────────────────────
// 六列。分割の自由度がいちばん高い数だからである。
// 六は 1／2／3／6 に割れるので、全幅・半幅・三分割・六分割が
// すべて同じ溝で成立する。四列だと三分割が作れず、
// 八列だと三分割が半端になる。図版と表の両方を載せる本には六が要る。
//
// 縦は 45 行のベースライングリッド。行送り 5.6mm。
// 図版の高さも本文の行送りの整数倍に丸める。
// 図版だけが грид を無視すると、隣の頁と天地が合わなくなる。

export const G = {
  pageW: 210, pageH: 297,
  top: 19, bottom: 26, inner: 19, outer: 17,
  cols: 6, gutter: 4,
  lead: 5.6,          // ベースライン
  lines: 45,
  size: 3.35,         // 本文の字面
};
G.frameW = G.pageW - G.inner - G.outer;                 // 174
G.frameH = G.lines * G.lead;                            // 252
G.col = (G.frameW - G.gutter * (G.cols - 1)) / G.cols;  // 25.67

// n 列ぶんの幅。溝を含めて数える。
export const span = (n) => G.col * n + G.gutter * (n - 1);
// 左から i 列目の位置。
export const at = (i) => (G.col + G.gutter) * i;
// 行送りの整数倍に丸める。図版の高さはここを通す。
export const snap = (mm) => Math.round(mm / G.lead) * G.lead;

// しっぽり明朝ではなく Noto Serif JP を使うので、実測値が異なる。
// 第一行のベースライン位置。
export const ruleOffset = (G.lead - G.size * 1.36) / 2 + G.size * 1.06;

export const css = ({ bleed = 0, marks = 0 } = {}) => {
  const mediaW = G.pageW + (bleed + marks) * 2;
  const mediaH = G.pageH + (bleed + marks) * 2;
  return `
@page { size: ${mediaW}mm ${mediaH}mm; margin: 0; }
:root {
  --page-w:${G.pageW}mm; --page-h:${G.pageH}mm;
  --bleed:${bleed}mm; --marks:${marks}mm;
  --top:${G.top}mm; --bottom:${G.bottom}mm;
  --inner:${G.inner}mm; --outer:${G.outer}mm;
  --frame-w:${G.frameW}mm; --frame-h:${G.frameH}mm;
  --col:${G.col.toFixed(3)}mm; --gutter:${G.gutter}mm;
  --lead:${G.lead}mm; --size:${G.size}mm;
  --ink:#1b1b1a; --ink-mid:#5c5a54; --ink-weak:#8a877e;
  --rule:#c9c6bd; --paper:#f4f2ec;
}
* { margin:0; padding:0; box-sizing:border-box; }
html, body { background:#d8d5cc; }

.sheet {
  position:relative; width:${mediaW}mm; height:${mediaH}mm;
  background:var(--paper); overflow:hidden; page-break-after:always;
}
.sheet:last-child { page-break-after:auto; }
.trim {
  position:absolute; left:calc(var(--marks) + var(--bleed)); top:calc(var(--marks) + var(--bleed));
  width:var(--page-w); height:var(--page-h);
}
.frame {
  position:absolute; top:var(--top); width:var(--frame-w); height:var(--frame-h);
}
.recto .frame { left:var(--inner); }
.verso .frame { left:var(--outer); }

body {
  font-family:'Noto Serif JP', serif; font-weight:400;
  font-size:var(--size); line-height:var(--lead);
  color:var(--ink); text-align:justify;
  word-break:normal; line-break:strict;
  -webkit-font-smoothing:antialiased;
}

/* 六列。全ページで同じ骨格。 */
.g { display:grid; grid-template-columns:repeat(6, var(--col)); gap:0 var(--gutter); }
.c1{grid-column:span 1} .c2{grid-column:span 2} .c3{grid-column:span 3}
.c4{grid-column:span 4} .c5{grid-column:span 5} .c6{grid-column:span 6}
`;
};
