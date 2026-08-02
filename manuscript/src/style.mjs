// 版面定義と体裁
//
// 判型 A5（148×210mm）。一段組。
// ノドを広く、小口を狭く（発注仕様 4-2 の指定に従う）。
// 　※ 中世写本の作図法（Van de Graaf 等）では通例これが逆になる。
// 　　 本件は指定を優先したが、検収時の論点として申し送る。

export const M = {
  trimW: 148, trimH: 210,
  inner: 23,          // ノド
  outer: 15,          // 小口
  top: 20,
  lines: 23,
  lead: 6.2,          // 行送り
  size: 3.3,          // 字面
};
// しっぽり明朝の実測値（ascent 1.122em / descent 0.321em）から導いた
// 第一行のベースライン位置。罫線はここに引く。字は罫の上に乗る。
M.ruleOffset = (M.lead - M.size * 1.443) / 2 + M.size * 1.122;
// 字面 F、行送り箱 k 行のとき、ベースラインは k*lead/2 + F*0.4005 に来る。
// 罫は ruleOffset + (k-1)*lead にある。その差を寄せれば、字は罫に乗る。
M.grid = (F, k = 1) =>
  ((M.ruleOffset + (k - 1) * M.lead) - (k * M.lead / 2 + F * 0.4005)).toFixed(3) + 'mm';
M.frameW = M.trimW - M.inner - M.outer;      // 110
M.frameH = M.lines * M.lead;                  // 167.4
M.bottom = M.trimH - M.top - M.frameH;        // 25.6

export const css = (mode) => {
  const bleed = mode === 'print' ? 3 : 0;
  const marks = mode === 'print' ? 8 : 0;
  const mediaW = M.trimW + (bleed + marks) * 2;
  const mediaH = M.trimH + (bleed + marks) * 2;

  return `
@page { size: ${mediaW}mm ${mediaH}mm; margin: 0; }

:root {
  --trim-w:${M.trimW}mm; --trim-h:${M.trimH}mm;
  --bleed:${bleed}mm; --marks:${marks}mm;
  --inner:${M.inner}mm; --outer:${M.outer}mm;
  --top:${M.top}mm; --bottom:${M.bottom}mm;
  --frame-w:${M.frameW}mm; --frame-h:${M.frameH}mm;
  --lead:${M.lead}mm; --size:${M.size}mm;

  /* 色は厳格に制限する（仕様 4-5） */
  --ink:        58,44,28;      /* 鉄没食子 */
  --ink-red:    141,58,36;     /* 朱 */
  --ink-gold:   174,133,38;    /* 金：女神メリディアに関する記述のみ */
  --ink-blue:   47,68,120;     /* 群青：闇・夜・コールドハーバーのみ */
  --ink-later:  90,84,96;      /* 後年の別筆。本文より新しく、色が違う */
  --pencil:     108,104,96;    /* 後年の鉛筆 */
}

* { margin:0; padding:0; box-sizing:border-box; }
html, body { background:#3b3630; }

.sheet {
  position:relative; width:${mediaW}mm; height:${mediaH}mm;
  overflow:hidden; page-break-after:always; background:#efeade;
}
.sheet:last-child { page-break-after:auto; }

/* 断ち落とし込みの版。地はここまで伸ばす。 */
.bleedbox {
  position:absolute; left:var(--marks); top:var(--marks);
  width:calc(var(--trim-w) + var(--bleed)*2);
  height:calc(var(--trim-h) + var(--bleed)*2);
  overflow:hidden;
}
/* 仕上がり。本文・装飾はここに収める。 */
.trimbox {
  position:absolute;
  left:calc(var(--marks) + var(--bleed)); top:calc(var(--marks) + var(--bleed));
  width:var(--trim-w); height:var(--trim-h);
}

.ground, .ruling, .worms, .water, .burn, .stain {
  position:absolute; left:0; top:0; width:100%; height:100%; display:block;
}
.ground { z-index:0; }
.ruling { z-index:1; }
.content { position:absolute; z-index:3;
  left:0; top:0; width:100%; height:100%; }
.worms  { z-index:6; }
.water  { z-index:5; }
.stain  { z-index:6; }
.burn   { z-index:7; }

/* 版面 */
.frame {
  position:absolute; top:var(--top);
  width:var(--frame-w); height:var(--frame-h);
}
.recto .frame { left:var(--inner); }
.verso .frame { left:var(--outer); }

/* ── 本文 ────────────────────────────────────── */
body {
  font-family:'Shippori Mincho', serif;
  font-weight:400;
  font-size:var(--size);
  line-height:var(--lead);
  color:rgb(var(--ink));
  text-align:justify;
  word-break:normal;
  line-break:strict;
  -webkit-font-smoothing:antialiased;
}

/* 一字ごとの揺らぎ。振幅は小さく保つ。
   inline-block は新たな整形文脈を作るので、
   text-indent と font-style の継承を切っておかないと字送りが狂う。 */
.pk {
  display:inline-block;
  text-indent:0;
  font-style:normal;
  transform:translate(var(--x), var(--y)) rotate(var(--r));
  /* 親の色を受け継ぎ、濃淡だけを一字ごとに与える。
     見出しの朱や金が、字の単位で失われないようにするため。 */
  color:color-mix(in srgb, currentColor calc(var(--a) * 100%), transparent);
}
.pk-w { font-weight:600; }              /* 墨溜まり */
.pk-d { font-weight:400; }              /* 掠れ */

.ink-red   { color:rgb(var(--ink-red)); }
.ink-gold  { color:rgb(var(--ink-gold)); }
.ink-blue  { color:rgb(var(--ink-blue)); }
.ink-heavy .pk { font-weight:700; --a:1; }

/* 金は箔。字そのものが金であって、下に色を敷くのではない。
   袋文字にすると字が二度描かれ、テキスト層に同じ字が二重に残る。
   検索性を損なうので輪郭は回さず、字面の重さと色だけで箔に見せる。 */
.ink-gold .pk { font-weight:500; --a:1; }

p { margin:0; text-indent:1em; }
p.flush { text-indent:0; }
.gap { height:var(--lead); }

/* 罫線をはみ出す行。写本では珍しくない。 */
.overrun { margin-right:-3.5mm; }

/* ── 見出し ───────────────────────────────────── */
.act-label {
  font-family:'Shippori Mincho', serif; font-weight:500;
  font-size:3.0mm; letter-spacing:0.5em; text-indent:0;
  color:rgb(var(--ink-red)); text-align:center;
  line-height:var(--lead); margin-bottom:var(--lead);
  position:relative; top:${M.grid(3.0)};
}
h1 {
  font-family:'Shippori Mincho B1', 'Shippori Mincho', serif; font-weight:700;
  font-size:7.4mm; line-height:calc(var(--lead)*2); text-align:center;
  color:rgb(var(--ink-red)); font-feature-settings:'palt' 0;
  letter-spacing:0.12em; text-indent:0;
  position:relative; top:${M.grid(7.4, 2)};
}
h1.tone-dark { color:rgb(var(--ink-blue)); }
h2 {
  font-family:'Shippori Mincho B1', 'Shippori Mincho', serif; font-weight:600;
  font-size:4.4mm; line-height:calc(var(--lead)*2);
  color:rgb(var(--ink-red)); letter-spacing:0.16em; text-indent:0;
  margin-bottom:var(--lead);
  position:relative; top:${M.grid(4.4, 2)};
}

/* ── 装飾頭文字。各幕の冒頭のみ、三行取り。 ────────────── */
.dc-wrap { position:relative; }
.dc-cap {
  float:left; position:relative;
  font-family:'Shippori Mincho B1', serif; font-weight:800;
  font-size:16.4mm; line-height:calc(var(--lead)*3);
  height:calc(var(--lead)*3);
  margin:0 2.2mm 0 0; padding:0 1.4mm;
  color:rgb(var(--ink-red));
}
.dc-cap.blue { color:rgb(var(--ink-blue)); }
.dc-pen { position:absolute; left:0; top:0; width:100%; height:100%; z-index:-1; }
p.dc { text-indent:0; }

/* ── 会話 ────────────────────────────────────── */
.speech {
  margin:var(--lead) 0; text-indent:0;
  padding-left:5mm; border-left:0.28mm solid rgba(var(--ink-red),0.35);
}
.speech .who {
  font-size:2.9mm; color:rgba(var(--ink),0.62); margin-right:0.8em;
}
.speech.gilded { border-left-color:rgba(var(--ink-gold),0.55); }
.speech.tone-dark { border-left-color:rgba(var(--ink-blue),0.4); }

/* ── 登場人物 ─────────────────────────────────── */
.cast { margin:0 0 var(--lead) 0; text-indent:0; }
.cast .nm {
  font-family:'Shippori Mincho B1', serif; font-weight:700;
  margin-right:1em;
}
.cast .nm::after { content:'—'; margin-left:0.7em; color:rgba(var(--ink),0.45); font-weight:400; }

/* ── 小書き・署名・奥付 ───────────────────────────── */
.note { font-size:2.9mm; color:rgba(var(--ink),0.62); text-indent:0;
        margin-bottom:var(--lead); position:relative; top:${M.grid(2.9)}; }
.sign { text-align:right; text-indent:0; margin-top:var(--lead); }
.colophon { text-align:center; text-indent:0; line-height:calc(var(--lead)*1.5);
            font-size:3.1mm; color:rgba(var(--ink),0.82); }

/* ── 損傷 ────────────────────────────────────── */
/* 掻き取り：書いた本人が消した。下に元の字が薄く残る。 */
.dmg-scrape, .dmg-lost { position:relative; }
.dmg-scrape .dmg-under { opacity:0.46; }
.dmg-lost   .dmg-under { opacity:0.19; }
.dmg-veil {
  position:absolute; left:-0.5em; right:-0.5em; top:-0.34em; bottom:-0.26em;
  pointer-events:none;
  /* 削り跡は矩形にはならない。刃の当たった幅も深さも一定ではないので、
     長短・高低の違う楕円を重ねて、上下の縁を波打たせる。 */
  background:
    radial-gradient(ellipse 22% 88%  at 5%  44%, rgba(233,226,204,.88), rgba(233,226,204,0) 76%),
    radial-gradient(ellipse 19% 142% at 17% 58%, rgba(236,229,208,.87), rgba(236,229,208,0) 72%),
    radial-gradient(ellipse 24% 104% at 30% 41%, rgba(230,223,200,.89), rgba(230,223,200,0) 74%),
    radial-gradient(ellipse 17% 150% at 42% 60%, rgba(237,230,209,.93), rgba(237,230,209,0) 70%),
    radial-gradient(ellipse 21% 96%  at 54% 43%, rgba(231,224,201,.89), rgba(231,224,201,0) 75%),
    radial-gradient(ellipse 18% 138% at 66% 57%, rgba(236,229,207,.87), rgba(236,229,207,0) 71%),
    radial-gradient(ellipse 23% 108% at 79% 46%, rgba(232,225,203,.90), rgba(232,225,203,0) 73%),
    radial-gradient(ellipse 16% 92%  at 92% 55%, rgba(234,227,205,.87), rgba(234,227,205,0) 77%),
    radial-gradient(ellipse 12% 72%  at 99% 47%, rgba(233,226,204,.78), rgba(233,226,204,0) 80%);
}
.dmg-lost .dmg-veil { filter:brightness(1.015); }
/* 削られた面は毛羽立って、僅かに明るい */
.dmg-scrape::after, .dmg-lost::after {
  content:''; position:absolute; left:-0.34em; right:-0.34em; top:-0.24em; bottom:-0.18em;
  background:
    radial-gradient(ellipse 44% 84% at 28% 46%, rgba(250,245,231,.34), rgba(250,245,231,0) 74%),
    radial-gradient(ellipse 38% 96% at 72% 54%, rgba(248,243,228,.30), rgba(248,243,228,0) 76%);
  pointer-events:none;
}

/* 水損：インクが滲む。実テキストは透明のまま残し、検索可能性を保つ。 */
.dmg-water { position:relative; }
.dw-vis { filter:blur(0.30mm); opacity:0.86; }
.dw-vis { color:rgb(96,76,48); }
/* 検索用の実テキスト。完全な透明は PDF に書き出されないので、
   知覚できない濃度を与えて層として残す。 */
.dw-txt { position:absolute; left:0; top:0; color:rgba(58,44,28,0.012);
          white-space:pre; pointer-events:none; }

/* 焼け */
.dmg-burn { color:rgb(74,47,19); }
.dmg-burn .pk { --a:0.72; }

/* ── 余白の書き込み。本文より格を落とす。 ────────────── */
.marg { position:absolute; width:11mm; height:16.5mm; z-index:2; }
.recto .marg.side-outer { right:2.6mm; }
.verso .marg.side-outer { left:2.6mm; }
.marg.side-bottom { bottom:6mm; width:13mm; height:19mm; }

.marg-note {
  position:absolute; z-index:4;
  font-family:'Shippori Mincho', serif; font-size:2.5mm;
  line-height:3.4mm; width:12mm;
  color:rgba(var(--ink),0.55);
}
.recto .marg-note { right:1.6mm; }
.verso .marg-note { left:1.6mm; }

/* 後年の別筆。本文より新しい。インクの色が違う。 */
.later {
  position:absolute; z-index:4;
  font-family:'Klee One', 'Shippori Mincho', serif; font-weight:400;
  font-size:2.75mm; line-height:4.1mm;
  color:rgb(var(--ink-later));
}

.later .by { font-size:2.4mm; opacity:0.7; margin-right:0.5em; }
.later.side-bottom { left:var(--inner); width:calc(var(--frame-w) * 0.86); }
.verso .later.side-bottom { left:var(--outer); }

/* ── ノンブル。後年の手による鉛筆書きの体裁。 ───────────── */
.folio {
  position:absolute; bottom:9mm; z-index:8;
  font-family:'Klee One', serif; font-size:2.9mm;
  color:rgba(var(--pencil),0.72);
}
.recto .folio { right:var(--outer); }
.verso .folio { left:var(--outer); }

/* ── 章末の線飾り ──────────────────────────────── */
.tail { display:block; width:26mm; height:var(--lead); margin:var(--lead) auto 0; }
.tallymark { position:absolute; z-index:4; height:5mm; }
.recto .tallymark { right:3mm; }
.verso .tallymark { left:3mm; }

/* ── 扉・表紙 ─────────────────────────────────── */
.cover-title {
  font-family:'Shippori Mincho B1', serif; font-weight:800;
  font-size:14mm; letter-spacing:0.16em; text-align:center;
  color:rgb(var(--ink)); text-indent:0; line-height:1.3;
}
.cover-latin {
  font-family:'EB Garamond', serif; font-size:3.6mm; letter-spacing:0.42em;
  text-align:center; color:rgba(var(--ink),0.68); text-indent:0; margin-top:3mm;
}
.cover-sub {
  font-family:'Shippori Mincho', serif; font-size:3.4mm; letter-spacing:0.3em;
  text-align:center; color:rgba(var(--ink),0.7); text-indent:0;
}
.cover-rule { width:38mm; height:0.3mm; background:rgba(var(--ink-red),0.55);
              margin:6mm auto; }

.title-main {
  font-family:'Shippori Mincho B1', serif; font-weight:700;
  font-size:9.5mm; letter-spacing:0.18em; text-align:center;
  color:rgb(var(--ink)); text-indent:0;
}
.title-rule { width:52mm; height:0.22mm; background:rgba(var(--ink),0.4); margin:5mm auto; }
.title-sub  { text-align:center; text-indent:0; font-size:3.1mm; color:rgba(var(--ink),0.72); }
.title-by   { text-align:center; text-indent:0; font-size:3.3mm; }

.plate-mini { display:block; width:78mm; margin:0 auto calc(var(--lead)*2); }
.plate-head { margin-top:calc(var(--lead)*0.5); }

.hand {
  font-family:'Klee One', serif; font-size:3mm; line-height:calc(var(--lead)*1.5);
  color:rgb(var(--ink-later)); text-indent:0; white-space:pre-line;
}

/* ── 補遺：後年の刷り物 ────────────────────────────
   写本本体とは別の紙・別の版。近代の印刷物が挟み込まれている体裁。
   意図的に、ここだけデザインの手つきが見えるようにしてある。      */
.offprint-leaf {
  position:absolute; left:0; top:0; width:100%; height:100%;
  background:#f4f2ec; z-index:4;
  transform:rotate(-0.45deg) translate(1.1mm, 0.7mm);
  border:0.12mm solid rgba(70,66,58,0.22);
}
.offprint {
  position:absolute; z-index:5; left:16mm; top:20mm; width:116mm; height:170mm;
  font-family:'Noto Sans JP', sans-serif; font-weight:400;
  font-size:2.85mm; line-height:4.9mm; color:#3a3833;
  text-align:justify; text-indent:0;
}
.offprint p { text-indent:0; margin-bottom:3.4mm; }
.op-journal { font-size:2.5mm; letter-spacing:0.3em; color:#8a8478;
              border-bottom:0.2mm solid #c8c2b4; padding-bottom:1.6mm; margin-bottom:6mm; }
.op-title { font-family:'Noto Sans JP', sans-serif; font-weight:700;
            font-size:4.6mm; line-height:6.6mm; margin-bottom:2mm; letter-spacing:0.02em; }
.op-sub   { font-size:3.1mm; color:#6d6a62; margin-bottom:5mm; }
.op-rule  { height:0.15mm; background:#c8c2b4; margin:5mm 0; }
.op-abstract { font-size:2.7mm; line-height:4.6mm; color:#4a473f;
               background:#eceae2; padding:4mm; margin-bottom:5mm; }
.op-note  { font-size:2.45mm; line-height:4mm; color:#7d7869; margin-top:2.6mm; }
.op-h     { font-family:'Noto Sans JP', sans-serif; font-weight:700; font-size:3.3mm;
            margin:6mm 0 3mm; letter-spacing:0.06em; }
.op-sign  { text-align:right; font-size:2.6mm; color:#7d7869; margin-top:6mm; }
.op-table { width:100%; border-collapse:collapse; font-size:2.6mm; margin-top:2mm; }
.op-table th, .op-table td {
  border-bottom:0.15mm solid #d2ccbe; padding:2.2mm 1.6mm; text-align:left; vertical-align:top;
}
.op-table th { font-weight:700; border-bottom:0.3mm solid #9c968a; color:#4a473f; }
.op-table td:nth-child(2) { font-family:'EB Garamond', 'Noto Sans JP', sans-serif; font-size:3.1mm; }
.op-folio { position:absolute; bottom:12mm; left:0; width:100%; text-align:center;
            font-family:'Noto Sans JP', sans-serif; font-size:2.5mm; color:#8a8478; }

/* ── トンボ（印刷用のみ） ──────────────────────────── */
.marks { position:absolute; left:0; top:0; width:100%; height:100%; z-index:20; }
`;
};
