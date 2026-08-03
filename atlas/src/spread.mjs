// 本編の見開き
//
// 仕様書 5：主要組織は見開き 2 ページ。左＝図版面、右＝情報面。
// 仕様書 4-2：分類色を小口・ヘッダー・アイコン枠に一貫適用し、
//             閉じた状態で小口を見ると分類が分かる構造にする。
//
// ── 小口の帯 ──────────────────────────────────
// 検収基準 2「小口を見て分類が判別できるか」に対する実装。
// 各頁の外側の縁に、分類色の帯を刷る。帯の天地の位置は分類ごとに固定し、
// I は天寄り、VII は地寄りへ、七段に振り分ける。
// 本を閉じると、この帯が小口に七本の縞として現れる。
// 色だけで分けると、閉じたときに隣り合う分類が混ざって見えるので、
// **位置でも分ける**。これが要点である。

import { G, span, snap } from './grid.mjs';
import { emblem } from './heraldry.mjs';
import { categories, byCat } from './factions.mjs';
import { recordOf, TAGS } from './records.mjs';
import { egoDiagram } from './diagram.mjs';
import { edgesOf } from './relations.mjs';
import { bust } from './busts.mjs';
import { scene, cut } from './scene.mjs';
import { miniMap } from './map.mjs';
import cal from './calibration.json' with { type: 'json' };
import fit from './relfit.json' with { type: 'json' };

const catOf = (f) => categories.find((c) => c.id === f.cat);

// 関係欄の丈は関係の数で決める。二件の組織に六件ぶんの箱を与えると、
// 空白が「何かが抜けている」という誤った合図になる。
const relBase = (id) => {
  const n = edgesOf(id).length;
  return n <= 2 ? 30 : n <= 4 ? 38 : n <= 8 ? 46 : 54;
};

// 版面の余りは組織ごとに違う。概要の長さ・人物の数・目的の数で変わるからだ。
// 余った分をそのまま下に空けると、頁の三割が白くなる項が出る。
// そこで一度組んで実測し、余白を関係図の丈に足し戻す。
// 節点が増えるのではなく、節点が大きくなるだけなので、
// 「空欄が何かの欠落を示す」という誤読は生じない。
const relHeight = (id) => Math.min(relBase(id) + (fit[id] ?? 0), 86);

// 小口の帯。分類ごとに天地の位置を変える。
export function edgeTab(cat, isRecto) {
  const i = cat.id - 1;                      // 0..6
  const h = 26;                              // 帯の丈
  const top = G.top + ((G.frameH - h) / 6) * i;
  return `<div class="edge-tab" style="--c:${cat.color};top:${top.toFixed(1)}mm;height:${h}mm;`
    + `${isRecto ? 'right' : 'left'}:0"></div>`;
}

// 柱。分類色の細い罫と、分類名・組織名。
const runningHead = (f, c, isRecto, folio) => `
  <div class="rh ${isRecto ? 'rh-r' : 'rh-l'}" style="--c:${c.color}">
    <span class="rh-cat">${c.n}　${c.ja}</span>
    <span class="rh-name">${f.ja}</span>
    <span class="rh-folio">${folio}</span>
  </div>`;

// ── 左頁（図版面） ───────────────────────────────
function figurePage(f, c, folio, spec) {
  const S = { scale: cal[f.id] ?? 1, extinct: f.extinct };
  const cuts = (spec.cuts ?? ['sword', 'shield', 'banner']).slice(0, 3);
  return `<section class="sheet verso" data-id="${f.id}">
  <div class="trim">
    ${edgeTab(c, false)}
    <div class="frame">
      ${runningHead(f, c, false, folio)}
      <div class="g plate-head">
        <div class="c4 plate-label">
          <span class="pl-num" style="--c:${c.color}">${spec.num}</span>
          <span class="pl-en">${f.en}</span>
        </div>
        <div class="c2 plate-emblem" style="--c:${c.color}">${emblem(f.emblem, { ...S, color: c.color })}</div>
      </div>
      <div class="plate-main">${scene(spec.scene)}</div>
      <div class="plate-cap">${spec.caption}</div>
      <div class="g plate-cuts">
        ${cuts.map((k, i) => `<div class="c2 cutcell">${cut(k, { seed: f.id + i })}
          <span class="cut-cap">${(spec.cutCaps ?? [])[i] ?? ''}</span></div>`).join('')}
      </div>
    </div>
  </div>
</section>`;
}

// ── 右頁（情報面） ───────────────────────────────
function infoPage(f, c, folio) {
  const r = recordOf(f);
  const tag = (k) => TAGS[k].values[r[k]] ?? '—';
  const people = (r.people ?? []).slice(0, 5);
  return `<section class="sheet recto" data-id="${f.id}">
  <div class="trim">
    ${edgeTab(c, true)}
    <div class="frame">
      ${runningHead(f, c, true, folio)}
      <div class="rec-name">
        <h1>${f.ja}${r.placeholder ? '<i class="draft">稿</i>' : ''}</h1>
        <div class="rec-en">${f.en}</div>
        ${f.alt ? `<div class="rec-alt">別称　${f.alt}</div>` : ''}
      </div>

      <div class="g rec-tags" style="--c:${c.color}">
        ${['door', 'scale', 'reach', 'state'].map((k) =>
          `<div class="c1 tag"><span class="tk">${TAGS[k].ja}</span><span class="tv">${tag(k)}</span></div>`).join('')}
        <div class="c2 tag tag-cat"><span class="tk">分類</span><span class="tv">${c.n}　${c.ja}</span></div>
      </div>

      <div class="g rec-body">
        <div class="c4 rec-summary">${r.summary}</div>
        <div class="c2 rec-seat">
          <div class="lbl">拠点</div>
          <div class="map">${miniMap(r.seat, { color: c.color })}</div>
          <div class="seat-name">${r.seat}</div>
          <div class="seat-note">${r.seatNote ?? ''}</div>
        </div>
      </div>

      <div class="rec-aims">
        <div class="lbl">目的</div>
        <ul>${(r.aims ?? []).map((a) => `<li>${a}</li>`).join('')}</ul>
      </div>

      <div class="rec-people">
        <div class="lbl">主要人物</div>
        <div class="people-row">${people.length
          ? people.map((p, i) => `<figure class="pf">
              <div class="pb">${bust({ ...p, id: f.id + 'p' + i })}</div>
              <figcaption><b>${p.ja}</b><span>${p.note}</span></figcaption></figure>`).join('')
          : '<div class="none">記録に残る成員がいない。</div>'}</div>
      </div>

      <div class="rec-rel">
        <div class="lbl">関係</div>
        <div class="relbox">${egoDiagram(f.id, { w: 174, h: relHeight(f.id) })}</div>
      </div>

      <div class="rec-quote" style="--c:${c.color}">${r.quote}</div>
    </div>
  </div>
</section>`;
}

export function spread(f, spec, folioL, folioR) {
  const c = catOf(f);
  return figurePage(f, c, folioL, spec) + '\n' + infoPage(f, c, folioR);
}

// ── 見開きの体裁 ───────────────────────────────
export const spreadCss = () => `
/* 小口の帯。分類ごとに天地を変える。閉じたとき七本の縞になる。 */
.edge-tab { position:absolute; width:6mm; background:var(--c); opacity:0.72; }

/* 柱 */
.rh { position:absolute; top:-9mm; width:var(--frame-w); display:flex; align-items:baseline;
      font-size:2.5mm; letter-spacing:.1em; color:var(--ink-weak);
      border-bottom:.5mm solid var(--c); padding-bottom:1.4mm; }
.rh-cat { color:var(--c); font-weight:600; }
.rh-name { margin-left:4mm; }
.rh-folio { margin-left:auto; font-family:'EB Garamond',serif; font-size:3mm; color:var(--ink-mid); }
.rh-l .rh-folio { order:-1; margin-left:0; margin-right:4mm; }
.rh-l .rh-cat { margin-left:0; }

/* ── 左頁 ── */
.plate-head { align-items:flex-end; margin-bottom:calc(var(--lead)*1); }
.plate-label { display:flex; flex-direction:column; gap:1mm; }
.pl-num { font-family:'EB Garamond',serif; font-size:9mm; line-height:9mm; color:var(--c); letter-spacing:.04em; }
.pl-en { font-family:'EB Garamond',serif; font-size:2.9mm; letter-spacing:.28em; color:var(--ink-weak); }
.plate-emblem svg { width:22mm; height:22mm; display:block; margin-left:auto; }
.plate-main { width:var(--frame-w); }
.plate-main svg { width:100%; height:auto; display:block; }
.plate-cap { font-size:2.6mm; line-height:calc(var(--lead)*0.8); color:var(--ink-mid);
             margin-top:2mm; margin-bottom:calc(var(--lead)*1.4); text-indent:0; }
.plate-cuts { margin-top:auto; }
.cutcell svg { width:100%; height:auto; display:block; }
.cut-cap { display:block; font-size:2.4mm; color:var(--ink-weak); text-align:center; margin-top:1mm; }

/* ── 右頁 ──
   引用は絶対配置にしない。関係図の丈が組織ごとに違うので、
   絶対配置だと関係の多い組織で引用と衝突する。
   縦の流れに置き、余った分を引用の上に寄せる。 */
.recto .frame { display:flex; flex-direction:column; }

.rec-name h1 { font-size:7.4mm; line-height:calc(var(--lead)*1.75); font-weight:600; letter-spacing:.04em; }
.draft { font-style:normal; font-size:2.6mm; color:#a8442e; border:.25mm solid #a8442e;
         padding:0 .8mm; margin-left:2mm; vertical-align:2.4mm; }
.rec-en { font-family:'EB Garamond',serif; font-size:3.1mm; letter-spacing:.3em; color:var(--ink-weak); }
.rec-alt { font-size:2.7mm; color:var(--ink-mid); margin-top:1mm; }

.rec-tags { margin:calc(var(--lead)*1) 0 calc(var(--lead)*0.75);
            border-top:.4mm solid var(--c); border-bottom:.2mm solid var(--rule); padding:2mm 0; }
.tag { display:flex; flex-direction:column; gap:.6mm; }
.tk { font-size:2.3mm; color:var(--ink-weak); letter-spacing:.12em; }
.tv { font-size:3mm; font-weight:500; }
.tag-cat .tv { color:var(--c); }

.rec-body { margin-bottom:calc(var(--lead)*0.75); }
.rec-summary { font-size:var(--size); line-height:var(--lead); text-align:justify; }
.rec-seat { border-left:.2mm solid var(--rule); padding-left:3mm; }
.rec-seat .map svg { width:34mm; height:auto; display:block; margin:1.2mm 0; }
.seat-name { font-size:3mm; font-weight:500; }
.seat-note { font-size:2.4mm; color:var(--ink-weak); line-height:3.4mm; }

.lbl { font-size:2.4mm; letter-spacing:.18em; color:var(--ink-weak); margin-bottom:1.4mm; }
.rec-aims { margin-bottom:calc(var(--lead)*0.75); }
.rec-aims ul { list-style:none; }
.rec-aims li { font-size:3.1mm; line-height:var(--lead); padding-left:5mm; position:relative; }
.rec-aims li::before { content:'—'; position:absolute; left:0; color:var(--ink-weak); }

.rec-people { margin-bottom:calc(var(--lead)*0.75); }
.people-row { display:flex; gap:3.4mm; }
.pf { width:17.6mm; }
.pb svg { width:17mm; height:20.4mm; display:block; }
.pf figcaption { font-size:2.3mm; line-height:3.2mm; margin-top:1mm; text-align:center; }
.pf figcaption b { font-weight:600; display:block; }
.pf figcaption span { color:var(--ink-weak); font-size:2mm; line-height:2.9mm; display:block;
                      overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.none { font-size:2.8mm; color:var(--ink-weak); }

.rec-rel { margin-bottom:calc(var(--lead)*0.5); }
.rec-name, .rec-tags, .rec-body, .rec-aims, .rec-people, .rec-rel { flex:none; }
.relbox { border:.2mm solid var(--rule); background:#faf9f5; padding:1mm; }
.relbox svg { width:100%; height:auto; display:block; }

.rec-quote { margin-top:auto; width:var(--frame-w);
             border-top:.4mm solid var(--c); padding-top:2mm;
             font-size:3.4mm; line-height:calc(var(--lead)*1.2); text-indent:0; }
.rec-quote::before { content:'「'; } .rec-quote::after { content:'」'; }
`;
