// 第二版の一項　——　見開き二組（四頁）
//
// 改訂提案「影響範囲」より、一項あたり四頁。
// 頁ごとの役割を固定する。ここが動くと、初版で作った
// 「どの項でも同じ場所に同じ欄がある」という性質が壊れる。
//
//   一頁目（左）　図版面　　　　初版のまま。触らない
//   二頁目（右）　名称と概要　　標識・概要・拠点・目的・主要人物
//   三頁目（左）　沿革と内情　　外側の欄に年号を立てる
//   四頁目（右）　評判と関係　　評判・記録の欠落・関係図と註・象徴的な一文
//
// 二頁目までで初版と同じことが引ける。三・四頁目が第二版の増分である。
// 急いで引きたい読者は二頁目で足り、読みたい読者は先へ進む。

import { G } from './grid.mjs';
import { categories } from './factions.mjs';
import { recordOf, TAGS } from './records.mjs';
import { records2 } from './records2.mjs';
import { egoDiagram } from './diagram.mjs';
import { edgesOf, KINDS } from './relations.mjs';
import { figure } from './figures.mjs';
import { miniMap } from './map.mjs';
import { figurePage, runningHead, edgeTab } from './spread.mjs';
import { index as artIndex, artImg, SIZE, dpiOf, artworkCss } from './artwork.mjs';
import { emblem } from './heraldry.mjs';
import { cut } from './scene.mjs';
import cal from './calibration.json' with { type: 'json' };
import { factions } from './factions.mjs';

const catOf = (f) => categories.find((c) => c.id === f.cat);
const byId = Object.fromEntries(factions.map((f) => [f.id, f]));

const page = (side, f, c, folio, body) => `<section class="sheet ${side}">
  <div class="trim">
    ${edgeTab(c, side === 'recto')}
    <div class="frame">
      ${runningHead(f, c, side === 'recto', folio)}
      ${body}
    </div>
  </div>
</section>`;

// ── 一頁目　図版面 ────────────────────────────────
// 支給図版があればそれを置き、無ければ従来の描画に落とす。
// 一点ずつ差し替えられるので、四十九点が揃うのを待たずに進行できる。
function figurePage2(f, c, folio, spec) {
  const ix = artIndex();
  const a = ix.主図版[f.id];
  if (!a) return figurePage(f, c, folio, spec);       // 未入稿。従来の描画のまま
  const S = SIZE.主図版;
  const dpi = a.px ? Math.round(dpiOf(a.px.w, S.w)) : 0;
  const cuts = (spec.cuts ?? []).slice(0, 3);
  return `<section class="sheet verso">
  <div class="trim">
    ${edgeTab(c, false)}
    <div class="frame">
      ${runningHead(f, c, false, folio)}
      <div class="g plate-head">
        <div class="c4 plate-label">
          <span class="pl-num" style="--c:${c.color}">${spec.num}</span>
          <span class="pl-en">${f.en}</span>
        </div>
        <div class="c2 plate-emblem" style="--c:${c.color}">${
          emblem(f.emblem, { scale: cal[f.id] ?? 1, extinct: f.extinct, color: c.color })}</div>
      </div>
      ${artImg(a.path, { w: S.w, h: S.h, color: c.color, alt: f.ja })}
      <div class="plate-cap">${spec.caption}</div>
      <div class="g plate-cuts">
        ${cuts.map((k, i) => `<div class="c2 cutcell">${cut(k, { seed: f.id + i })}
          <span class="cut-cap">${(spec.cutCaps ?? [])[i] ?? ''}</span></div>`).join('')}
      </div>
      <div class="art-stamp">入稿図版　${a.file}　${a.px ? a.px.w + '×' + a.px.h + 'px' : '寸法不明'}　${dpi}dpi</div>
    </div>
  </div>
</section>`;
}

// ── 二頁目　名称と概要 ────────────────────────────
function pageB(f, c, folio) {
  const r = recordOf(f), r2 = records2[f.id];
  const tag = (k) => TAGS[k].values[r[k]] ?? '—';
  return page('recto', f, c, folio, `
    <div class="rec-name">
      <h1>${f.ja}</h1>
      <div class="rec-en">${f.en}</div>
      ${f.alt ? `<div class="rec-alt">別称　${f.alt}</div>` : ''}
    </div>

    <div class="g rec-tags" style="--c:${c.color}">
      ${['door', 'scale', 'reach', 'state'].map((k) =>
        `<div class="c1 tag"><span class="tk">${TAGS[k].ja}</span><span class="tv">${tag(k)}</span></div>`).join('')}
      <div class="c2 tag tag-cat"><span class="tk">分類</span><span class="tv">${c.n}　${c.ja}</span></div>
    </div>

    <div class="g rec-body">
      <div class="c4"><div class="sec-h">概要</div>
        <div class="rec-summary">${r2.summary}</div></div>
      <div class="c2 rec-seat">
        <div class="lbl">拠点</div>
        <div class="map">${miniMap(r.seat, { color: c.color })}</div>
        <div class="seat-name">${r.seat}</div>
        <div class="seat-note">${r.seatNote ?? ''}</div>
      </div>
    </div>

    <div class="rec-aims">
      <div class="sec-h">目的</div>
      <ul>${(r.aims ?? []).map((a) => `<li>${a}</li>`).join('')}</ul>
    </div>

    <div class="rec-people2">
      <div class="sec-h">主要人物</div>
      <div class="people-row2">${r2.people.map((p, i) => {
        const sup = (artIndex().人物図版[f.id] ?? [])[i];
        const body = sup
          ? artImg(sup.path, { w: 34, h: 51, alt: p.ja })
          : `<div class="pb2">${figure({ ...p, id: f.id + 'q' + i })}</div>`;
        return `<figure class="pf2">${body}
          <figcaption><b>${p.ja}</b><span>${p.note}</span></figcaption>
        </figure>`;
      }).join('')}</div>
      ${r2.peopleNote ? `<p class="ppl-note">${r2.peopleNote}</p>` : ''}
    </div>`);
}

// ── 三頁目　沿革と内情 ───────────────────────────
// 年号は本文の外、小口側の二列に立てる。年表と同じ数字である。
function pageC(f, c, folio) {
  const r2 = records2[f.id];
  return page('verso', f, c, folio, `
    <div class="sec-h big">沿革</div>
    <div class="chron-body">${r2.history.map((h) => `
      <div class="g cb-row">
        <div class="c1 cb-y">${h.year}</div>
        <div class="c5 cb-t">${h.text}</div>
      </div>`).join('')}</div>

    <div class="sec-h big">内情</div>
    <div class="g inner-body">${r2.inner.map((x) => `
      <div class="c3 in-cell"><div class="in-h">${x.h}</div><p>${x.text}</p></div>`).join('')}</div>`);
}

// ── 四頁目　評判・記録の欠落・関係 ──────────────────
function pageD(f, c, folio) {
  const r = recordOf(f), r2 = records2[f.id];
  const rels = edgesOf(f.id);
  return page('recto', f, c, folio, `
    <div class="sec-h big">評判</div>
    <p class="rep-lead">記録どうしが食い違う箇所は、食い違ったまま並べる。
      いずれが正しいかを本書は判定しない。</p>
    <div class="g rep-body">${r2.repute.map((x) => `
      <div class="c3 rep-cell"><div class="rep-src">${x.src}</div><p>${x.text}</p></div>`).join('')}</div>

    <div class="sec-h big">記録の欠落</div>
    <p class="gaps">${r2.gaps}</p>

    <div class="rec-rel2">
      <div class="sec-h">関係</div>
      <div class="relbox">${egoDiagram(f.id, { w: 174, h: 44 })}</div>
      <ul class="rel-notes">${rels.map((e) => {
        const o = byId[e.other], k = KINDS[e.kind];
        return `<li><span class="rn-k" style="--c:${catOf(o).color}">${k.ja}</span>
          <a class="xl rn-n" data-to="${o.id}">${o.ja}</a>
          <span class="rn-t">${r2.relNotes[e.other] ?? ''}</span></li>`;
      }).join('')}</ul>
    </div>

    <div class="rec-quote" style="--c:${c.color}">${r.quote}</div>`);
}

export function spread2(f, spec, folio) {
  const c = catOf(f);
  return [
    figurePage2(f, c, folio, spec),
    pageB(f, c, folio + 1),
    pageC(f, c, folio + 2),
    pageD(f, c, folio + 3),
  ];
}

// ── 第二版で足した体裁 ───────────────────────────
export const spread2Css = () => artworkCss() + `
/* 入稿の控え。校正刷りにだけ出す。納品版では消す。 */
.art-stamp { position:absolute; bottom:-11mm; left:0; font-size:2.2mm; letter-spacing:.1em;
             color:#a8a49a; }
.art { margin-bottom:0; }
.pf2 .art { width:34mm; height:51mm; }

/* 節見出し。初版の .lbl と同じ位置に立つが、格を一段上げる。 */
.sec-h { font-size:2.8mm; letter-spacing:.2em; color:var(--ink-weak); margin-bottom:1.6mm;
         border-bottom:.2mm solid var(--rule); padding-bottom:1mm; }
.sec-h.big { font-size:4.4mm; letter-spacing:.12em; color:var(--ink); font-weight:600;
             border-bottom:.4mm solid var(--ink); padding-bottom:1.4mm;
             margin:calc(var(--lead)*1.2) 0 calc(var(--lead)*0.7); }
.sec-h.big:first-child { margin-top:0; }

/* 二頁目 */
.recto .frame { display:block; }
.rec-people2 { margin-top:calc(var(--lead)*0.8); }
.people-row2 { display:flex; gap:6mm; }
.pf2 { width:34mm; }
.pb2 svg { width:34mm; height:51mm; display:block; }
.pf2 figcaption { font-size:2.5mm; line-height:3.6mm; margin-top:1.4mm; }
.pf2 figcaption b { font-weight:600; display:block; }
.pf2 figcaption span { color:var(--ink-weak); font-size:2.3mm; line-height:3.3mm; display:block; }
.ppl-note { font-size:2.6mm; line-height:calc(var(--lead)*0.82); color:var(--ink-mid);
            margin-top:2.4mm; text-indent:0; }

/* 三頁目　沿革 */
.cb-row { margin-bottom:calc(var(--lead)*0.55); }
.cb-y { font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.9mm; color:var(--c, #6b563a);
        letter-spacing:.04em; padding-top:.6mm; }
.cb-t { font-size:var(--size); line-height:var(--lead); text-align:justify; text-indent:0; }
.inner-body { gap:calc(var(--lead)*0.7) var(--gutter); }
.in-cell { break-inside:avoid; }
.in-h { font-size:3mm; font-weight:600; letter-spacing:.06em; margin-bottom:.8mm;
        padding-left:2.4mm; border-left:.6mm solid var(--c, #6b563a); }
.in-cell p { font-size:2.95mm; line-height:calc(var(--lead)*0.9); text-indent:0; }

/* 四頁目　評判 */
.rep-lead { font-size:2.7mm; line-height:calc(var(--lead)*0.82); color:var(--ink-mid);
            text-indent:0; margin-bottom:calc(var(--lead)*0.6); }
.rep-body { gap:calc(var(--lead)*0.7) var(--gutter); }
.rep-cell { break-inside:avoid; }
.rep-src { font-size:2.4mm; letter-spacing:.08em; color:var(--ink-weak);
           border-bottom:.15mm solid var(--rule); padding-bottom:.8mm; margin-bottom:1mm; }
.rep-cell p { font-size:2.95mm; line-height:calc(var(--lead)*0.9); text-indent:0; }
.gaps { font-size:2.95mm; line-height:calc(var(--lead)*0.94); text-indent:0;
        background:#f0eee7; padding:2.6mm 3mm; border-left:.6mm solid var(--ink-weak); }

/* 関係の註。図式は残し、経緯だけを一行で添える。 */
.rec-rel2 { margin-top:calc(var(--lead)*1.2); }
.rel-notes { list-style:none; margin-top:1.6mm; }
.rel-notes li { display:flex; align-items:baseline; gap:2.4mm; font-size:2.7mm;
                line-height:calc(var(--lead)*0.86); padding:1mm 0;
                border-bottom:.15mm solid var(--rule); }
.rn-k { width:8mm; flex:none; color:var(--c); font-size:2.4mm; letter-spacing:.1em; }
.rn-n { width:34mm; flex:none; font-weight:500; }
.rn-t { color:var(--ink-mid); }
`;
