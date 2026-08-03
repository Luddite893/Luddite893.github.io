import { writeFileSync } from 'node:fs';
import { masterDiagram, egoDiagram } from './diagram.mjs';
import { stats, KINDS, edgesOf } from './relations.mjs';
import { factions } from './factions.mjs';

const s = stats();
const samples = ['legion', 'thalmor', 'companions', 'daedriccults', 'alduin', 'whispers'];
const legend = Object.entries(KINDS).map(([k, v]) => {
  const svg = `<svg viewBox="0 0 40 12"><path d="M 2 6 L 38 6" stroke="#1b1b1a" stroke-width="${v.w}" fill="none"${v.dash ? ` stroke-dasharray="${v.dash}"` : ''}/>`
    + (k === 'hostile' ? '<path d="M 17.8 3.8 L 22.2 8.2 M 17.8 8.2 L 22.2 3.8" stroke="#1b1b1a" stroke-width="0.8"/>'
     : k === 'ally' ? '<path d="M 17.8 4.9 L 22.2 4.9 M 17.8 7.1 L 22.2 7.1" stroke="#1b1b1a" stroke-width="0.7"/>'
     : k === 'vassal' ? '<path d="M 18.7 4 L 22.4 6 L 18.7 8 Z" fill="#1b1b1a"/>'
     : k === 'origin' ? '<circle cx="20" cy="6" r="1.8" fill="#eceae4" stroke="#1b1b1a" stroke-width="0.7"/>'
     : '<path d="M 18.9 8.2 L 21.1 3.8" stroke="#1b1b1a" stroke-width="0.8"/>') + '</svg>';
  return `<div class="lg">${svg}<b>${v.ja}</b><span>${k === 'vassal' ? '矢は上位を指す' : k === 'origin' ? '○の側が母体' : k === 'rival' ? '争うが交戦しない' : k === 'hostile' ? '交戦している' : '結ばれている'}</span></div>`;
}).join('');

writeFileSync(new URL('../out/proof-relations.html', import.meta.url), `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#eceae4;font-family:'Noto Serif JP',serif;padding:10mm;color:#1b1b1a}
h1{font-size:5.4mm;letter-spacing:.2em;font-weight:600;margin-bottom:2mm}
p.l{font-size:2.9mm;line-height:4.8mm;color:#5c5a54;max-width:200mm;margin-bottom:5mm}
h2{font-size:3.6mm;letter-spacing:.12em;margin:6mm 0 3mm;border-bottom:.3mm solid #c9c6bd;padding-bottom:1mm}
.legend{display:flex;gap:6mm;flex-wrap:wrap;margin-bottom:4mm}
.lg{display:flex;align-items:center;gap:1.5mm;font-size:2.6mm}
.lg svg{width:16mm;height:4.8mm}
.lg b{font-weight:600}
.lg span{color:#8a877e;font-size:2.3mm}
.master svg{width:250mm;display:block;margin:0 auto}
.egos{display:grid;grid-template-columns:repeat(2,1fr);gap:5mm 8mm;margin-top:3mm}
.ego-cell{border:.25mm solid #d4d0c6;padding:2mm 3mm;background:#f4f2ec}
.ego-cell h3{font-size:3mm;font-weight:600;margin-bottom:1mm}
.ego-cell svg{width:100%;height:auto;display:block}
.k{font-size:2.5mm;color:#8a877e;margin-top:1mm}
</style></head><body>
<h1>関係の記法　検版</h1>
<p class="l">関係は五種のみ。増やすと凡例が本文より長くなり、読者は凡例を覚えない。
「敵対」と「反目」を分けたのは、交戦している関係と席を争っている関係が別物だからである。
一本の線で書くと、同盟国と競合相手の区別がつかなくなる。<br>
辺の総数 ${s.total}（${Object.entries(s.byKind).map(([k, v]) => KINDS[k].ja + ' ' + v).join('／')}）。文章は一語も使っていない。</p>

<h2>一　凡例</h2>
<div class="legend">${legend}</div>

<h2>二　全体相関図（見開き 2P・49 ノード）</h2>
<p class="l">ノードは円周に固定し、分類ごとの扇に束ねる。位置そのものが分類を意味するので、
二度目に開いたとき同じ場所に同じ組織がある。<br>
弦として描くのは<b>敵対だけ</b>。敵対だけが遠距離の構造を持つ。
同盟・従属・派生・反目は近傍に閉じるので外周の短い弧で描く。全種を弦にすると中央が潰れる。<br>
弦は墨一色。分類色は扇の帯にのみ乗せる。線に色を付けると、色が分類と関係の二つを意味してしまう。<br>
各ノードの外に、敵対の数だけ刻みを打ってある。線を数えずに誰が四面楚歌かが分かる。</p>
<div class="master">${masterDiagram({ size: 900 })}</div>

<h2>三　各項の「関係」欄に入る自我図</h2>
<div class="egos">${samples.map((id) => {
  const f = factions.find((x) => x.id === id);
  return `<div class="ego-cell"><h3>${f.ja}</h3>${egoDiagram(id)}<div class="k">関係 ${edgesOf(id).length} 件</div></div>`;
}).join('')}</div>
</body></html>`);
console.log('→ out/proof-relations.html', JSON.stringify(s));
