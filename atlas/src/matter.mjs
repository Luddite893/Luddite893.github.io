// 前付・後付
//
// 仕様書 8 の構成に従う。原案の「加入可能ギルド」はメタ的表現なので
// 「門戸」に改めた（記録.mjs の TAGS を参照）。
//
// 前付の役目は、本編を引けるようにすることに尽きる。
// 序は「なぜこの本を編んだか」、凡例は「どう引くか」、
// 全体相関図と分布図と年表は「どこから引くか」を与える。
// 装飾のための頁は一枚も置かない。学術図鑑だからである。

import { G, span } from './grid.mjs';
import { categories, factions, byCat } from './factions.mjs';
import { records, TAGS } from './records.mjs';
import { emblem } from './heraldry.mjs';
import { catDiagram } from './diagram.mjs';
import { card as relCard, categorySheets, themeSheet } from './relmap.mjs';
import { THEMES } from './relmap-data.mjs';
import { edges, edgesOf, KINDS, hostileDegree } from './relations.mjs';
import { tamrielMap, skyrimMap, distributionMap, PROVINCES, FOREIGN, HOLDS, SEATS } from './map.mjs';
import { eras, events, historyRefs, refsOf } from './chronicle.mjs';
import { records2 } from './records2.mjs';
import { plateOf } from './plates.mjs';
import cal from './calibration.json' with { type: 'json' };

const NUM = (f) => factions.findIndex((x) => x.id === f.id) + 1;
const catOf = (f) => categories.find((c) => c.id === f.cat);
const emb = (f, o = {}) => emblem(f.emblem, { scale: cal[f.id] ?? 1, extinct: f.extinct, ...o });

// 本文中から項へ飛ぶ印。PDF ではここが内部リンクになる。
export const link = (f, label, folio) =>
  `<a class="xl" data-to="${f.id}">${label}<span class="xf">${folio ?? ''}</span></a>`;

// ── 頁の器 ────────────────────────────────────
// 前付・後付も本編と同じ骨格に載せる。骨格が変わると別の本に見える。
export const sheet = (side, body, { tab = null, head = null, folio = null, id = null } = {}) => `
<section class="sheet ${side}"${id ? ` id="${id}"` : ''}>
  <div class="trim">
    ${tab ?? ''}
    <div class="frame">
      ${head ?? ''}
      ${body}
      ${folio ? `<div class="mfolio ${side === 'recto' ? 'mf-r' : 'mf-l'}">${folio}</div>` : ''}
    </div>
  </div>
</section>`;

const mhead = (t, side) =>
  `<div class="mrh ${side === 'recto' ? 'rh-r' : 'rh-l'}"><span class="mrh-t">${t}</span></div>`;

// ── 1　表紙 ───────────────────────────────────
// 分類色の七本の帯を表紙にも並べる。小口に現れるものと同じ順・同じ位置。
// 本を閉じたときの縞が、表紙の縞の続きに見える。
export const cover = () => sheet('recto', `
  <div class="cv">
    <div class="cv-bands">${categories.map((c) =>
      `<span style="--c:${c.color}"><i>${c.n}</i>${c.ja}</span>`).join('')}</div>
    <div class="cv-mid">
      <div class="cv-rule"></div>
      <h1 class="cv-title">タムリエル勢力誌</h1>
      <div class="cv-en">A SURVEY OF THE POWERS OF TAMRIEL</div>
      <div class="cv-sub">スカイリム州所在の四十九組織　図版四百四十一点</div>
      <div class="cv-rule"></div>
    </div>
    <div class="cv-foot">
      <div>王立記録院　編</div>
      <div class="cv-imp">第四紀 二一〇年　刊</div>
    </div>
  </div>`);

// ── 2　白 ────────────────────────────────────
export const blankPage = (side, note = '') => sheet(side,
  note ? `<div class="blank-note">${note}</div>` : '');

// ── 3　扉 ────────────────────────────────────
export const titlePage = () => sheet('recto', `
  <div class="tp">
    <div class="tp-mark">${emblem('ring(46,3) | ring(38,1.2) | star(7,26,11)', { color: '#8a6f2e' })}</div>
    <h1>タムリエル勢力誌</h1>
    <div class="tp-en">A SURVEY OF THE POWERS OF TAMRIEL<br>
      <span>BEING AN ACCOUNT OF FORTY-NINE BODIES SUBSISTING IN THE PROVINCE OF SKYRIM</span></div>
    <div class="tp-line"></div>
    <div class="tp-pub">王立記録院</div>
  </div>`);

// ── 4-5　目次 ─────────────────────────────────
// 目次は本編の四十九項だけを並べていた。前付と後付が載っていない。
// 相関図は二十八頁ある。目次に無い二十八頁は、無いのと変わらない。
const tocSections = (title, list) => list.length ? `
  <div class="toc-sec"><div class="toc-sh">${title}</div>
    <ul>${list.map((x) => `<li><a class="xl" data-to="p:${x.page}">${x.ja}
      <span class="dots"></span><span class="tp2">${x.page}</span></a></li>`).join('')}</ul>
  </div>` : '';

export const toc = (side, cats, folioOf, folio, sections = {}) => sheet(side, `
  ${side === 'verso' ? '<h2 class="mh">目次</h2>' : ''}
  ${tocSections('前付', sections.front ?? [])}
  <div class="toc">${cats.map((c) => `
    <div class="toc-cat" style="--c:${c.color}">
      <div class="toc-ch"><span class="toc-n">${c.n}</span><span class="toc-j">${c.ja}</span>
        <span class="toc-c">${byCat(c.id).length} 項</span></div>
      <ul>${byCat(c.id).map((f) =>
        `<li><a class="xl" data-to="${f.id}"><span class="tn">${NUM(f)}</span>${f.ja}
          <span class="dots"></span><span class="tp2">${folioOf(f.id)}</span></a></li>`).join('')}</ul>
    </div>`).join('')}</div>
  ${tocSections('後付', sections.back ?? [])}`,
  { head: mhead('目次', side), folio });

// ── 6-7　序 ──────────────────────────────────
// 段落は一続きの文として持つ。行ごとに分けて持つと、組んだとき詩に見える。
const PREFACE_L = [
  '本書は、第四紀二〇一年前後のスカイリム州に存在した組織を、現存・滅亡を問わず四十九項にわたって記述したものである。'
  + '記述の現在は同年に置き、以後の変動は本書の対象としない。'
  + '対象を一州に限ったのは、州を越える組織を扱わないためではなく、'
  + '州の内側で起きたことだけを一次記録で確かめ得たためである。',

  '編纂の発端は、州の内戦に関する三十七点の文書を整理する過程にあった。'
  + '同一の組織が文書ごとに異なる名で呼ばれ、異なる組織が同一の名で呼ばれている例が、繰り返し現れたのである。'
  + '名の混乱は、記録の混乱ではない。記録者が、その組織を「何であるか」ではなく'
  + '「自分にとって何であったか」で呼んだ結果である。'
  + '同じ集団が、ある文書では「反徒」、別の文書では「王の軍」と記される。'
  + 'どちらの記録者も嘘は書いていない。本書が最初に行ったのは、この呼称を組織の側から呼び直すことであった。',

  '四十九という数は、州内に存在した組織の総数ではない。'
  + '一次記録が二点以上得られ、かつ目的と成員の双方について記述が可能であったものを採った結果である。'
  + 'この条件を満たさなかった集団は、名の判明しているものだけで百を超える。'
  + 'それらを落としたことは本書の欠落であって、対象が存在しなかったことを意味しない。'
  + '欠落を欠落として明示することは、記述の一部である。',

  '図版について一言する。'
  + '本書の図版はすべて銅版画調の線画とし、分類色を一色だけ重ねた二色刷りとした。'
  + '彩色を用いなかったのは費えのためではない。'
  + '色は、記録にない情報を読者に与えてしまうからである。'
  + 'ある組織の旗が何色であったかを我々は知らない。'
  + '知らないことを描かないために、色を捨てた。'
  + '分類色だけが残っているが、これは編者が付けた索引であって、対象の属性ではない。',

  'なお、本書は組織の是非を論じない。'
  + '州の内戦において、いずれの側に理があったかを本書は書かない。'
  + 'それは記録院の仕事ではなく、また、記録院が答え得る問いでもない。'
  + '本書を武器として用いる者があれば、それは本書の用い方を誤っている。',
];

// 底本。学術書の序は、たいてい典拠の一覧で終わる。
const SOURCES = [
  ['州法廷記録　第四紀一八八年　マルカルス分冊', '記録院蔵', '完'],
  ['白金協定　写　第四紀一七五年', '記録院蔵', '完'],
  ['帝国軍　州内駐屯配置表　第四紀一九九年', '記録院蔵', '欠あり'],
  ['ソリチュード港　入出港簿　第四紀一九四〜二〇一年', '東帝都社', '完'],
  ['リフテン市参事会　議事録　第四紀一九六〜二〇一年', '市庁', '欠あり'],
  ['ウィンターホールド学院　入学者名簿　第四紀一五〇年以降', '学院', '抄'],
  ['ステンダールの守人　巡回報告　第四紀一七六〜二〇〇年', '祠堂', '焼損'],
  ['ハイフロスガー来訪者記録', '当該', '書写を許されず。聞書による'],
  ['シドナ鉱山　収監者台帳　第四紀一八〇年以降', 'シルバー・ブラッド家', '閲覧を拒まる'],
  ['スカール村　口伝　第四紀二〇一年　聞書', '本院採録', '一次'],
  ['竜文字碑文　拓本　二十三点', '記録院蔵', '未解読を含む'],
  ['書簡集　差出人不明　十四通', '記録院蔵', '真偽未詳'],
];
const PREFACE_R = [
  '記述にあたっては三つの規則を置いた。',

  '第一に、組織を主語とする。'
  + '人物を主語にすると、その人物の生涯が組織の記述を侵食する。'
  + 'ある組織の項が、実質としてはその長の伝記になっている例を、我々は先行の書に幾つも見た。'
  + '本書に人物の項はない。人物は、組織の欄の内側にのみ現れる。',

  '第二に、感情を記さない。'
  + 'ある組織を「残虐」と書くことは、それを残虐と感じた者が居たという事実の記述にすぎず、組織の記述ではない。'
  + '本書は行為を記し、評価を読者に残す。'
  + 'この規則のために、本書の文体は乾いたものになった。それは意図した結果である。',

  '第三に、関係を文章で書かない。'
  + '「敵対しているが、利害の一致する場面もある」という一文は、読み手の数だけ異なる図を頭の中に描かせる。'
  + '本書は関係をすべて図式に移した。'
  + '各項の「関係」欄が本書の実用上の中心であり、前付の相関図二十四枚はその総和である。'
  + '図式に移せなかった関係——たとえば「かつて協力したが、いまは互いに触れない」といった時間を含む関係——は、'
  + '概要の本文に書き、図には引かなかった。図に引けば、現在そうであるかのように読まれるからである。',

  '本書は完結した記述ではない。'
  + '巻末に四頁の余白を置いたのは、そのためである。'
  + '書き込まれた版が、次の版の元となる。',
];

export const preface = (side, folio) => sheet(side, `
  ${side === 'verso' ? '<h2 class="mh">序</h2>' : ''}
  <div class="prf">${(side === 'verso' ? PREFACE_L : PREFACE_R)
    .map((l) => `<p>${l}</p>`).join('')}</div>
  ${side === 'recto' ? `<div class="prf-sign">王立記録院　記録部　編纂室</div>
    <div class="src"><h3>本書が主に用いた記録</h3>
      <table class="src-t">${SOURCES.map(([t, w, n]) =>
        `<tr><td class="src-a">${t}</td><td class="src-b">${w}</td><td class="src-c">${n}</td></tr>`).join('')}</table>
      <p class="lg-note">閲覧を拒まれた記録を一覧に残したのは、拒まれた事実もまた記録であるためである。</p>
    </div>` : ''}`,
  { head: mhead('序', side), folio });

// ── 8-9　読み方・凡例 ───────────────────────────
const legendTags = () => Object.entries(TAGS).map(([k, t]) => `
  <div class="lg-tag"><div class="lg-k">${t.ja}</div>
    <div class="lg-v">${Object.values(t.values).join('／')}</div></div>`).join('');

export const legendL = (folio) => sheet('verso', `
  <h2 class="mh">読み方</h2>
  <div class="lg-lead">本書は一組織を見開き二頁で扱う。左頁を図版面、右頁を情報面とし、
    この配置はすべての項で変わらない。目的の欄を探すときは、常に右頁の中ほどを見ればよい。</div>

  <div class="lg-sec"><h3>見開きの構造</h3>
    <div class="g lg-map">
      <div class="c3 lgm-page"><span class="lgm-t">左・図版面</span>
        <ol><li>項番号と欧字名</li><li>紋章</li><li>主図版（情景）</li>
          <li>図版説明</li><li>小カット三点</li></ol></div>
      <div class="c3 lgm-page"><span class="lgm-t">右・情報面</span>
        <ol><li>名称・別称</li><li>分類標識（四項）と分類</li><li>概要</li>
          <li>拠点と小地図</li><li>目的</li><li>主要人物</li><li>関係（図式）</li><li>象徴的な一文</li></ol></div>
    </div></div>

  <div class="lg-sec"><h3>分類標識</h3>
    <div class="lg-tags">${legendTags()}</div>
    <p class="lg-note">「門戸」は、外部の者がその組織に加わり得るかを示す。
      「開く」は志願を受け付けるもの、「試練による」は志願のうえで試練を課すもの、
      「閉ざす」は志願を受け付けないもの、「血統による」は加入という手続き自体を持たないものである。
      最後の一つは、可否ではなく問いの成立の別であることに注意されたい。</p></div>

  <div class="lg-sec"><h3>紀年</h3>
    <p class="lg-note">紀年はすべて帝国暦による。第四紀は 4E と略さず「第四紀」と記す。
      メレシック紀の年は特定できないため、年を記さず順序のみを示す。</p></div>`,
  { head: mhead('読み方・凡例', 'verso'), folio });

export const legendR = (folio) => sheet('recto', `
  <h2 class="mh">凡例</h2>
  <div class="lg-sec"><h3>関係の記号</h3>
    <div class="lg-rel">${Object.entries(KINDS).map(([k, v]) => `
      <div class="lgr"><svg viewBox="0 0 40 12" class="lgr-s">
        <path d="M 2 6 L 38 6" stroke="#1b1b1a" stroke-width="${v.w}" fill="none"${v.dash ? ` stroke-dasharray="${v.dash}"` : ''}/>
        ${relSample(k)}</svg>
        <div class="lgr-t"><b>${v.ja}</b><span>${REL_NOTE[k]}</span></div></div>`).join('')}</div>
    <p class="lg-note">線は関係の種類を、線の中央の記号はその向きを示す。
      従属の矢は下位から上位へ向く。母体を示す○は、母体の側に打つ。
      関係を文章で書かないのは、同じ一文が読み手ごとに違う図を結ぶためである。</p></div>

  <div class="lg-sec"><h3>分類と小口</h3>
    <div class="lg-fore">
      <div class="lg-cats">${categories.map((c) => `
        <div class="lgc" style="--c:${c.color}">
          <span class="lgc-b"></span>
          <span class="lgc-n">${c.n}</span><span class="lgc-j">${c.ja}</span>
          <span class="lgc-c">${byCat(c.id).length} 項</span></div>`).join('')}</div>
      <div class="lg-edge"><span class="lge-t">小口（実寸）</span>
        <div class="lge-b">${categories.map((c, i) =>
          `<i style="--c:${c.color};top:${(i * (100 - 10.3) / 6).toFixed(2)}%"></i>`).join('')}</div></div>
    </div>
    <p class="lg-note">分類ごとに色を定め、小口・柱・紋章の枠に一貫して用いた。
      帯の天地の位置も分類ごとに変えてあるので、本を閉じた状態で小口を見れば、
      七本の縞として分類の別が判る。色の見分けがつかない条件でも、位置で引ける。</p></div>

  <div class="lg-sec"><h3>図版</h3>
    <p class="lg-note">図版はすべて銅版画調の線画とし、分類色を一色だけ重ねた二色刷りとする。
      主図版は情景、小カットは装備・拠点・象徴物、人物図版は胸像である。
      人物図版は肖像ではない。記録に残る特徴——種族・被り物・装いのみを図取りしたもので、
      顔貌は本書の関知するところではない。</p></div>

  <div class="lg-sec"><h3>典拠と限界</h3>
    <p class="lg-note">断定を避けた箇所には「とされる」を付した。
      これは伝聞であることの表示であって、疑わしいという評価ではない。
      一次記録を欠く項は、その旨を概要の末尾に記した。</p></div>`,
  { head: mhead('読み方・凡例', 'recto'), folio });

const REL_NOTE = {
  hostile: '交戦している。あるいは相手の排除を目的に掲げる。',
  ally: '協力の関係にある。共同の行動が記録に残る。',
  vassal: '一方が他方の指揮下にある。矢は上位を指す。',
  origin: '一方が他方から分かれた。○の側が母体である。',
  rival: '同じ席を争うが、交戦には至っていない。',
};
function relSample(k) {
  const s = 2.2, x = 20, y = 6;
  const g = (b) => `<g transform="translate(${x} ${y})">${b}</g>`;
  switch (k) {
    case 'hostile': return g(`<path d="M ${-s} ${-s} L ${s} ${s} M ${-s} ${s} L ${s} ${-s}" stroke="#1b1b1a" stroke-width="0.8" fill="none"/>`);
    case 'ally': return g(`<path d="M ${-s} -1.1 L ${s} -1.1 M ${-s} 1.1 L ${s} 1.1" stroke="#1b1b1a" stroke-width="0.7" fill="none"/>`);
    case 'vassal': return g(`<path d="M ${-s * 0.6} ${-s * 0.9} L ${s * 1.1} 0 L ${-s * 0.6} ${s * 0.9} Z" fill="#1b1b1a"/>`);
    case 'origin': return g(`<circle r="${s * 0.8}" fill="none" stroke="#1b1b1a" stroke-width="0.7"/>`);
    case 'rival': return g(`<path d="M ${-s * 0.5} ${s} L ${s * 0.5} ${-s}" stroke="#1b1b1a" stroke-width="0.8" fill="none"/>`);
    default: return '';
  }
}

// ── 分類のあいだの関係数 ─────────────────────────
// 初版はここに円環の全体相関図を置いていた。第二版で廃した。
// 四十九点を一枚に収めることはできたが、弦が中央で束になり、
// どの線がどこへ行くのか追えなかった。図として成立していなかったのである。
// 表のほうは残す。円環では数えないと判らない偏りが、一目で出るからである。
const CATMX = () => {
  const m = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (const [ea, eb] of edges) {
    const a = factions.find((f) => f.id === ea), b = factions.find((f) => f.id === eb);
    if (!a || !b) continue;
    m[a.cat][b.cat]++; if (a.cat !== b.cat) m[b.cat][a.cat]++;
  }
  return m;
};

// 関係の統計。相関図の扉の右頁に置く。
const relStats = () => {
  const m = CATMX();
  const top = [...factions].map((f) => [f, hostileDegree(f.id)])
    .sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = Math.max(...categories.flatMap((r) => categories.map((c) => m[r.id][c.id])));
  return `
  <h3>分類のあいだの関係数</h3>
  <table class="mx"><thead><tr><th></th>${categories.map((c) =>
    `<th style="--c:${c.color}">${c.n}</th>`).join('')}<th class="mx-s">計</th></tr></thead>
    <tbody>${categories.map((r) => `<tr>
      <th style="--c:${r.color}">${r.n}　${r.ja}</th>
      ${categories.map((c) => {
        const v = m[r.id][c.id];
        return `<td class="${r.id === c.id ? 'mx-d' : ''}" ${v ? `style="background:rgba(27,27,26,${(0.06 + 0.5 * v / max).toFixed(3)})"` : ''}>${v || ''}</td>`;
      }).join('')}
      <td class="mx-s">${categories.reduce((n, c) => n + m[r.id][c.id], 0)}</td></tr>`).join('')}</tbody></table>
  <p class="lg-note">対角は分類の内側の関係である。分類 V「宗教・信仰」の行がほとんど空であることに注意されたい。
    公認された教団が他の組織と関係を持たないのではない。関係が記録に残らないのである。
    教団の記録は教団自身が管理しており、外部の文書に現れる機会が少ない。</p>

  <h3>敵対の集まる組織</h3>
  <ol class="md-top">${top.map(([f, n]) =>
    `<li><a class="xl" data-to="${f.id}"><span class="mdn" style="--c:${catOf(f).color}">${NUM(f)}</span>${f.ja}</a><b>${n}</b></li>`).join('')}</ol>
  <p class="lg-note">数字は敵対関係の本数である。上位のほとんどが分類 II「国家・軍事」
    または分類 III「敵対組織」に属する。州内の対立が、信仰や商いではなく
    統治の帰属をめぐって生じていることを示す。</p>`;
};

// ── 相関図の扉（二頁） ───────────────────────────
export const relIntroL = (folio) => sheet('verso', `
  <h2 class="mh">相関図</h2>
  <p class="lg-lead">四十九の組織のあいだに、${edges.length}件の関係が確認されている。
    これを二十四枚に分けて図にした。本編に入る前にここを通っていただきたい。
    <b>本編各項の四頁目にも同じ関係が行として載る。同じことを二度、別の形で読める。</b></p>

  <h3>札の読み方</h3>
  <div class="rk-card"><svg viewBox="0 0 47 30" xmlns="http://www.w3.org/2000/svg"
    font-family="Noto Serif JP, serif">${relCard('legion', 1, 0.5, {
    rows: [{ kind: 'hostile', other: 'stormcloaks', side: 1 },
           { kind: 'vassal', other: 'thalmor', side: 1 },
           { kind: 'ally', other: 'eastempire', side: -1 }] })}</svg></div>
  <ol class="rk-list">
    <li><b>札の頭</b>　紋章・組織名・肩書・所在。これだけで、その組織が何者かが分かる。</li>
    <li><b>関係の行</b>　語と相手の名。<b>線を辿らずとも関係が読める。</b></li>
    <li><b>線</b>　行の縁から出て、相手の行の縁へ入る。直交でのみ引く。
      <b>線の上には文字を一つも置かない。</b></li>
    <li><b>矢</b>　従属は上位を、派生は母体を指す。向きを持つのはこの二つだけである。</li>
  </ol>
  <p class="lg-note">語を線の中ほどに置く方式は採らなかった。
    一枚の札から線が n 本出れば語も n 個要るが、札の縁は十三ミリしかない。
    語は四ミリ強あるので、三本を超えたところで必ず重なる。
    束になった線の脇に語が並ぶと、どの語がどの線のものか分からなくなる。</p>`,
  { head: mhead('相関図', 'verso'), folio });

export const relIntroR = (folio) => sheet('recto', `
  <h3>二十四枚の並び</h3>
  <div class="g rk-idx">
    <div class="c3"><h4>主題別　八枚</h4><ul>${THEMES.map((t) =>
      `<li><span class="rk-n">${t.n}</span>${t.ja}</li>`).join('')}</ul></div>
    <div class="c3"><h4>分類別　十六枚</h4><ul>${categories.map((c) => {
      const n = categorySheets(c).length;
      return `<li><span class="rk-n" style="--c:${c.color}">${c.n}</span>${c.ja}`
        + (n > 1 ? `<b>${'一二三四五'[n - 1]}枚</b>` : '') + `</li>`;
    }).join('')}</ul></div>
  </div>
  <p class="lg-note">分類は「その組織が何であるか」の区分であって、
    「何が起きているか」の区分ではない。内戦を追う読者は分類 II の頁だけでは足りない。
    名家も教団も隊商も内戦の中にいる。主題別の八枚は、そのために立てた。
    分類別のほうを相手ではなく成員で割ったのは、
    どの組織にも「自分の関係が全部見える一枚」を持たせるためである。</p>
${relStats()}`,
  { head: mhead('相関図', 'recto'), folio });

// ── 相関図の頁 ───────────────────────────────────
// 二十四枚を前付にまとめる。各項の四頁目から、この節へ案内している。
export const relSheet = (theme, side, folio) => sheet(side, `
  <div class="rs">${themeSheet(theme)}</div>`,
  { head: mhead('相関図', side), folio });

// ── 相関図の索引 ─────────────────────────────────
// 二十四枚に割った代償である。「この組織はどの図に出るのか」を、
// 図のほうから引けるようにしておかないと、読者は二十四枚を繰ることになる。
// ●は、その組織の関係が一枚に全部載っている図——すなわちその組織が中央に立つ図——を指す。
export const relIndex = (side, sheets, sheetFolio, folio) => {
  const rows = factions.map((f) => {
    const on = [];
    sheets.forEach((t, i) => {
      const node = t.nodes.find((n) => n.id === f.id);
      if (!node) return;
      on.push({ i, main: node.col === 1 && (!t.focus || t.focus.has(f.id)),
                label: `${t.kind ?? '主題'}${t.n}`, page: sheetFolio(i) });
    });
    on.sort((a, b) => (b.main ? 1 : 0) - (a.main ? 1 : 0) || a.page - b.page);
    return { f, n: edgesOf(f.id).length, on };
  });
  const half = side === 'verso' ? rows.slice(0, 25) : rows.slice(25);
  return sheet(side, `
  ${side === 'verso' ? `<h2 class="mh">相関図索引</h2>
    <div class="lg-lead">四十九項が、二十四枚のどこに出るかを示す。
      <b>●</b>を付した一枚には、その組織の関係が漏れなく載っている。
      印のない図には、その図の主題に関わる分だけが出る。</div>` : ''}
  <div class="ri">${half.map(({ f, n, on }) => `
    <div class="ri-r">
      <span class="mdn" style="--c:${catOf(f).color}">${NUM(f)}</span>
      <a class="xl ri-f" data-to="${f.id}">${f.ja}</a>
      <span class="ri-c">関係 ${n}</span>
      <span class="ri-s">${on.map((o) =>
        `<i${o.main ? ' class="ri-m"' : ''}>${o.main ? '●' : ''}${o.label}<b>${o.page}</b></i>`).join('')}</span>
    </div>`).join('')}</div>`,
    { head: mhead('相関図索引', side), folio });
};

// ── 地図（全図・九領図） ────────────────────────
// 図は版面の幅いっぱいでも高さの六割しか使わない。横に長い図を縦長の頁に置けば、
// 下に必ず余りが出る。そこを白いままにせず、図から引くべき表を入れた。
export const mapTamriel = (folio, folioOf) => sheet('verso', `
  <h2 class="mh">図一　タムリエル全図</h2>
  <div class="mp">${tamrielMap({ size: 1180 })}</div>
  <p class="lg-note">本書が扱うのは州一つだが、州外に本拠を置く組織が十三項ある。
    それらの「遠さ」は、州内の地図では表せない。州境は模式であり、測量に基づかない。</p>

  <h3>州外に本拠を置く十三項</h3>
  <div class="g mfo">${Object.entries(FOREIGN).map(([pid, names]) => {
    const p = PROVINCES.find((x) => x.id === pid);
    return `<div class="c2 mfo-c"><h4>${p.ja}</h4><ul>${names.map((n) => {
      const f = factions.find((x) => x.ja === n);
      return `<li><a class="xl" data-to="${f.id}"><span class="tn" style="--c:${catOf(f).color}">${NUM(f)}</span>${n}
        <span class="dots"></span><span class="tp2">${folioOf(f.id)}</span></a></li>`;
    }).join('')}</ul></div>`;
  }).join('')}</div>
  <p class="lg-note">これらの項の「拠点」欄には州外の地名が入る。
    各項の小地図はスカイリムの輪郭で描いているので、印が図の縁に寄るか、図に出ない。
    州外にある拠点は、この頁の図で引かれたい。</p>`,
  { head: mhead('地図', 'verso'), folio });

export const mapSkyrim = (folio, folioOf) => {
  // 領ごとに、その領の中に拠点を持つ項を集める。
  const at = new Map(HOLDS.map((h) => [h.id, []]));
  const hold = (seat) => {
    const p = SEATS[seat];
    if (!p) return null;
    // いちばん近い領の名を採る。領境は模式なので、これで足りる。
    return HOLDS.reduce((best, h) =>
      Math.hypot(h.x - p[0], h.y - p[1]) < Math.hypot(best.x - p[0], best.y - p[1]) ? h : best).id;
  };
  for (const f of factions) {
    const h = hold(records[f.id].seat);
    if (h && SEATS[records[f.id].seat]) at.get(h).push(f);
  }
  return sheet('recto', `
  <h2 class="mh">図二　スカイリム九領図</h2>
  <div class="mp mp-s">${skyrimMap({ size: 1180 })}</div>
  <p class="lg-note">領境と街道、および本書の各項が拠点として挙げる地を打った。
    街道は破線で示す。冬季に通行が絶える区間の別は、本図では示していない。
    札が地点から離れた箇所は、細い線で結んである。</p>

  <h3>九つの領と領都</h3>
  <table class="hd"><thead><tr><th>領</th><th>領都</th><th>本書所収の項</th></tr></thead>
    <tbody>${HOLDS.map((h) => `<tr>
      <td class="hd-h">${h.ja}</td><td class="hd-s">${h.seat}</td>
      <td class="hd-f">${at.get(h.id).length
        ? at.get(h.id).map((f) =>
          `<a class="xl" data-to="${f.id}"><span class="tn" style="--c:${catOf(f).color}">${NUM(f)}</span>${f.ja}</a>`).join('')
        : '—'}</td></tr>`).join('')}</tbody></table>
  <p class="lg-note">領は模式の境で割ってあるので、拠点の帰属はいちばん近い領で採った。
    州外に拠点を持つ十三項は、この表に現れない。前頁の図一で引かれたい。</p>`,
  { head: mhead('地図', 'recto'), folio });
};

// ── 14-15　勢力分布図（見開き） ──────────────────
export const distL = (dm, folio) => sheet('verso', `
  <h2 class="mh">図三　勢力分布図</h2>
  <div class="lg-lead">各項の拠点、および拠点が「不定」でも活動の中心が判明している組織を、
    番号入りの点として打った。分類色は右頁の凡例による。</div>
  <div class="dm">${dm.svg}</div>
  <p class="lg-note">点の位置は拠点であって勢力の及ぶ範囲ではない。
    範囲を面で示す図は本書では作らなかった。四十九項の活動域はほとんどが重なり合っており、
    七枚の網を重ねれば版面が潰れて何も読めなくなる。分布図の役目は「どこに何があるか」であり、
    面の広がりを示すことではない。</p>`,
  { head: mhead('勢力分布図', 'verso'), folio });

export const distR = (dm, folioOf, folio) => {
  const by = {};
  for (const [n, f, why] of dm.offmap) (by[why] ??= []).push([n, f]);
  return sheet('recto', `
  <div class="dm-legend">
    <h3>凡例</h3>
    <div class="dl-cats">${categories.map((c) =>
      `<span class="dlc"><i style="background:${c.color}"></i>${c.n}　${c.ja}</span>`).join('')}</div>
    <p class="lg-note">図中の番号は本編の項番号である。拠点の重なる組織は、
      その地点のまわりに環状に並べた。並びの順に意味はない。</p>

    <h3>図に打てない組織</h3>
    ${Object.entries(by).map(([why, list]) => `
      <div class="dl-off"><div class="dl-why">${why}</div>
        <ul>${list.map(([n, f]) =>
          `<li><a class="xl" data-to="${f.id}"><span class="dln" style="--c:${catOf(f).color}">${n}</span>${f.ja}
            <span class="dots"></span><span class="tp2">${folioOf(f.id)}</span></a></li>`).join('')}</ul></div>`).join('')}
    <p class="lg-note">拠点欄に「不定」とある組織のうち、活動の中心が判明しているものは
      図に打った。ここに残したのは、拠点が州外にあるか、州内各地に分散しているか、
      あるいは所在そのものが記録から得られない組織である。
      分散を一点で示すことはできない。示せば、それは事実に反する図になる。</p>
  </div>`, { head: mhead('勢力分布図', 'recto'), folio });
};

// ── 16-17　年表（見開き） ────────────────────────
// 年表は「年ごとの塊」で組む。行ごとに項番号を並べると、
// 同じ年に出来事が七つある第四紀二〇一年で、同じ番号が七度刷られる。
// 年を一度だけ立て、その年の出来事を並べ、番号は年に一度だけ添える。
const HIST = historyRefs(records2);
const chronYears = (era) => {
  const list = events.filter((e) => e.era === era);
  const keys = [...new Set(list.map((e) => e.year))];
  return keys.map((y) => {
    const rows = list.filter((e) => e.year === y);
    const ids = [...new Set(rows.flatMap((e) => refsOf(e, HIST.at, factions)))]
      .sort((a, b) => factions.findIndex((f) => f.id === a) - factions.findIndex((f) => f.id === b));
    return { year: y, rows, ids };
  });
};

// 番号の並び。ただし、ほとんどの項が並ぶ年では裏返す。
// 第四紀二〇一年は本書の記述の現在なので、四十九項のほとんどが何かを持つ。
// 一から四十九まで刷っても索引にならない。持たない側を出したほうが情報になる。
const chronRefs = (ids) => {
  const num = (id) => {
    const f = factions.find((x) => x.id === id);
    return `<a class="xl xn" data-to="${id}" title="${f.ja}">${NUM(f)}</a>`;
  };
  if (ids.length > factions.length * 0.6) {
    const rest = factions.filter((f) => !ids.includes(f.id));
    return `<div class="chy-r"><span class="chy-k">${factions.length - rest.length} 項に記述あり。
      この年の記述を持たないのは</span>${rest.map((f) => num(f.id)).join('')}
      <span class="chy-k">の ${rest.length} 項のみ</span></div>`;
  }
  return `<div class="chy-r">${ids.map(num).join('')}</div>`;
};

const chronOne = (b) => `
  <div class="chy">
    <div class="chy-y">${b.year}</div>
    <div class="chy-b">
      ${b.rows.map((e) => `<p class="chy-t">${e.text}</p>`).join('')}
      ${chronRefs(b.ids)}
    </div>
  </div>`;

// 年を特定できない記述を持つ項。紀ごとにまとめる。
// これを落とすと、年表は「年の判る組織だけの本」の索引になってしまう。
const chronVague = (era) => {
  const s = HIST.vague.get(era);
  if (!s?.size) return '';
  const ids = [...s].sort((a, b) =>
    factions.findIndex((f) => f.id === a) - factions.findIndex((f) => f.id === b));
  return `<div class="chv"><span class="chv-k">年を特定できない記述</span>
    ${ids.map((id) => {
      const f = factions.find((x) => x.id === id);
      return `<a class="xl xn" data-to="${id}" title="${f.ja}">${NUM(f)}</a>`;
    }).join('')}</div>`;
};

// 紀の一部だけを刷る。第四紀は二十年ぶんあり、一頁には入らない。
const chronEra = (eraId, from = 0, to = Infinity) => {
  const era = eras.find((x) => x.id === eraId);
  const all = chronYears(eraId);
  const part = all.slice(from, to);
  const first = from === 0, last = to >= all.length;
  return `
  <div class="ch-era"><h3>${era.ja}${first ? '' : '（続き）'}${era.note && first ? `<span>${era.note}</span>` : ''}</h3>
    <div class="ch">${part.map(chronOne).join('')}</div>
    ${last ? chronVague(eraId) : ''}</div>`;
};

// 年表は四頁に割る。どの紀をどこで切るかは、ここ一箇所で決める。
const CHRON_PAGES = [
  { lead: true, parts: [['me'], ['e1']] },
  { parts: [['e2'], ['e3']] },
  { parts: [['e4', 0, 10]] },
  { parts: [['e4', 10]], note: true },
];

export const chron = (side, part, folio) => {
  const p = CHRON_PAGES[part];
  return sheet(side, `
  ${p.lead ? `<h2 class="mh">年表</h2>
    <div class="lg-lead">本書の各項に効いた出来事だけを採った。
      年ごとに、その年に関わる項の番号を添えてある。
      <b>番号は各項の「沿革」から機械で拾ったものである。</b>
      沿革にその年の段落があれば、その項は必ずその年の欄に出る。
      手で書き写していないので、本文を直せば年表も直る。</div>` : ''}
  ${p.parts.map((a) => chronEra(...a)).join('')}
  ${p.note ? `<p class="lg-note">「年を特定できない記述」は、その紀に属することは判るが
    年を押さえられない段落を持つ項である。一段落でも持てばここに出る。
    年の記述をまったく持たない項も六つある——ナミラ信者・グレンモリルの魔女・
    ペライトの信者・理想の支配者・各デイドラ王の信徒団・ウィスパーズの六項で、
    いずれも成立と消長を年で押さえられる記録が存在しない。
    年表に載らないことは、それ自体がこれらの組織の性格を示している。</p>` : ''}`,
  { head: mhead('年表', side), folio });
};

// ── 分類扉（見開き） ───────────────────────────
export const catTitle = (c, tab, folio) => sheet('verso', `
  <div class="ct-page" style="--c:${c.color}">
    <div class="ct-n">${c.n}</div>
    <h1 class="ct-j">${c.ja}</h1>
    <div class="ct-en">${(c.en ?? '').toUpperCase()}</div>
    <div class="ct-rule"></div>
    <div class="ct-count">${byCat(c.id).length} 項</div>
    <p class="ct-note">${CAT_NOTE[c.id]}</p>
    <div class="ct-tally">${['door', 'scale', 'reach', 'state'].map((k) => {
      const t = TAGS[k], n = {};
      for (const f of byCat(c.id)) { const v = records[f.id][k]; n[v] = (n[v] ?? 0) + 1; }
      const rows = Object.entries(t.values).filter(([v]) => n[v]);
      return `<div class="ctt"><div class="ctt-k">${t.ja}</div>
        ${rows.map(([v, ja]) => `<div class="ctt-r"><span>${ja}</span>
          <span class="ctt-bar"><i style="width:${(n[v] / byCat(c.id).length * 100).toFixed(0)}%"></i></span>
          <b>${n[v]}</b></div>`).join('')}</div>`;
    }).join('')}</div>
  </div>`, { tab, head: mhead(`${c.n}　${c.ja}`, 'verso'), folio });

export const catOverview = (c, tab, folioOf, folio) => {
  const list = byCat(c.id);
  const inner = edges.filter(([ea, eb]) => {
    const a = factions.find((f) => f.id === ea), b = factions.find((f) => f.id === eb);
    return a && b && a.cat === c.id && b.cat === c.id;
  });
  return sheet('recto', `
  <div class="co" style="--c:${c.color}">
    <h3>この分類に属する組織</h3>
    <div class="co-grid">${list.map((f) => `
      <a class="co-item xl" data-to="${f.id}">
        <span class="co-emb">${emb(f, { color: c.color })}</span>
        <span class="co-t"><b>${NUM(f)}　${f.ja}</b><i>${f.en}</i></span>
        <span class="co-p">${folioOf(f.id)}</span></a>`).join('')}</div>
    <h3>分類の内側の関係</h3>
    ${inner.length ? `<ul class="co-rel">${inner.map(([ea, eb, kind]) => {
      const a = factions.find((f) => f.id === ea), b = factions.find((f) => f.id === eb);
      return `<li><span class="cor-k">${KINDS[kind].ja}</span>
        <a class="xl" data-to="${a.id}">${a.ja}</a><em>—</em><a class="xl" data-to="${b.id}">${b.ja}</a></li>`;
    }).join('')}</ul>`
      : '<p class="lg-note">この分類の内側には、記録に残る関係が存在しない。'
        + '各項の関係はすべて分類の外へ向かう。</p>'}
    <h3>関係の行き先</h3>
    <div class="co-dia">${catDiagram(c.id, { w: 174, h: 118 })}</div>
    <p class="lg-note">上段がこの分類の組織、下段が相手である。
      上段どうしを結ぶ弧は分類の内側の関係、下へ降りる線は外へ向かう関係を示す。
      線の種類は巻頭の凡例による。</p>
  </div>`, { tab, head: mhead(`${c.n}　${c.ja}`, 'recto'), folio });
};

const CAT_NOTE = {
  1: '技能または職掌によって結ばれ、加入と離脱の手続きを持つ集団を収める。'
   + '血統によって定まる集団は、手続きを持たないため本分類に入らない。',
  2: '統治の権限を主張し、あるいはその権限を執行する機構を収める。'
   + '州の内戦は、この分類の内側の対立として現れている。',
  3: '本書の他の項に対して、排除を目的に掲げる集団を収める。'
   + '「敵対」は本書の視点ではなく、当該組織自身の掲げる目的による分類である。',
  4: '血統と財によって成立し、加入の手続きを持たない集団を収める。'
   + '州の政治は、しばしばこの分類の四項の間で決まる。',
  5: '公認された祭祀の枠内にある教団を収める。'
   + '公認の枠が白金協定によって動いたため、この分類の境界も第四紀に一度動いている。',
  6: '公認の外にある信仰と、その実践者の集団を収める。'
   + '分類 V との別は教義の内容によらない。認可の有無のみによる。',
  7: '以上のいずれにも属さない集団を収める。'
   + '本分類は残余であって、性格の共通によるものではない。この点は明示しておく。',
};

// ── 後付　門戸・排他関係一覧表 ────────────────────
export const doorTable = (side, folioOf, folio) => {
  const half = side === 'verso' ? factions.slice(0, 25) : factions.slice(25);
  return sheet(side, `
  ${side === 'verso' ? `<h2 class="mh">門戸・排他関係一覧</h2>
    <div class="lg-lead">各項の「門戸」と、排他——すなわち同時に属し得ない組織——を一覧にした。
      排他は敵対関係から導いたものであり、当該組織が明文で禁じているとは限らない。</div>` : ''}
  <table class="dt">
    <thead><tr><th>番</th><th>組織</th><th>門戸</th><th>規模</th><th>排他（項番号）</th></tr></thead>
    <tbody>${half.map((f) => {
      const r = records[f.id];
      // 同じ相手と二本の敵対が記録されている組では番号が重複する。集合で潰す。
      const ex = [...new Set(edgesOf(f.id).filter((e) => e.kind === 'hostile')
        .map((e) => factions.findIndex((x) => x.id === e.other) + 1))].sort((a, b) => a - b);
      return `<tr><td class="dt-n" style="--c:${catOf(f).color}">${NUM(f)}</td>
        <td class="dt-f"><a class="xl" data-to="${f.id}">${f.ja}</a></td>
        <td>${TAGS.door.values[r.door]}</td>
        <td>${TAGS.scale.values[r.scale]}</td>
        <td class="dt-x">${ex.length ? ex.join('・') : '—'}</td></tr>`;
    }).join('')}</tbody></table>`,
    { head: mhead('門戸・排他関係一覧', side), folio });
};

// ── 後付　人物索引 ─────────────────────────────
// 五十音の行。索引は行の見出しが無いと引けない。
// 名の頭が漢字のものがある（「第一の書記」のように、名を伝えない者を役で立てた項）。
// これらは五十音に置きようがないので、末尾に「名を伝えない者」としてまとめる。
const KANA_ROWS = [
  ['ア', 'アァイィウゥエェオォヴ'], ['カ', 'カガキギクグケゲコゴ'],
  ['サ', 'サザシジスズセゼソゾ'],   ['タ', 'タダチヂッツヅテデトド'],
  ['ナ', 'ナニヌネノ'],             ['ハ', 'ハバパヒビピフブプヘベペホボポ'],
  ['マ', 'マミムメモ'],             ['ヤ', 'ヤャユュヨョ'],
  ['ラ', 'ラリルレロ'],             ['ワ', 'ワヲンー'],
];
const rowOf = (s) => KANA_ROWS.find(([, cs]) => cs.includes(s[0]))?.[0] ?? null;

export const peopleIndex = (side, folioOf, folio) => {
  const all = [];
  for (const f of factions) for (const p of records[f.id].people ?? []) all.push([p, f]);
  all.sort((a, b) => a[0].ja.localeCompare(b[0].ja, 'ja'));
  const named = all.filter(([p]) => rowOf(p.ja));
  // 名を伝えない者は役で立ててある。漢字の並びに五十音は無いので、
  // 所属の項番号で並べる。同じ組織の者が隣り合うほうが引ける。
  const unnamed = all.filter(([p]) => !rowOf(p.ja))
    .sort((a, b) => factions.indexOf(a[1]) - factions.indexOf(b[1])
      || a[0].ja.localeCompare(b[0].ja, 'ja'));
  // 行ごとに束ねてから、頁の分量で割る。行の途中で頁が変わっても、見出しを刷り直す。
  const blocks = [];
  for (const [row] of KANA_ROWS) {
    const list = named.filter(([p]) => rowOf(p.ja) === row);
    if (list.length) blocks.push({ row, list });
  }
  if (unnamed.length) blocks.push({ row: '名を伝えない者', list: unnamed, note: true });

  const w = (b) => 1 + b.list.length;
  const total = blocks.reduce((n, b) => n + w(b), 0);
  let acc = 0, cut = 0;
  for (; cut < blocks.length && acc < (total - 6) / 2; cut++) acc += w(blocks[cut]);
  const half = side === 'verso' ? blocks.slice(0, cut) : blocks.slice(cut);

  return sheet(side, `
  ${side === 'verso' ? `<h2 class="mh">人物索引</h2>
    <div class="lg-lead">本書に図版とともに現れる ${all.length} 名を五十音順に並べた。
      名の下は、その人物について記録が伝えていることである。
      同名の別人は所属で分けてある。名を伝えない者は末尾に括った。</div>` : ''}
  <div class="pi">${half.map((b) => `
    <div class="pi-g"><div class="pi-h">${b.row}</div>
      ${b.list.map(([p, f]) => `<div class="pi-r">
        <span class="pi-n">${p.ja}</span>
        <span class="pi-w">${p.note}</span>
        <span class="pi-o"><a class="xl" data-to="${f.id}">${f.ja}</a></span>
        <span class="dots"></span><span class="tp2">${folioOf(f.id)}</span></div>`).join('')}
    </div>`).join('')}</div>
  ${side === 'recto' ? `<p class="lg-note">人物に項は無い。本書は組織を主語とするので、
    人物は組織の欄の内側にのみ現れる。頁数は、その人物が載る項の頁である。</p>
  <p class="lg-note">同じ名が二度以上出る箇所が三つある。
    「エリシフ」はハーフィンガルの首長であり、同時に九大神聖堂の後援者でもある。
    一人の人物が二つの項に現れる唯一の例である。
    「隊士」と「姉妹の一人」は、名を伝えない者を役で立てたものであって、同一人ではない。
    どちらも所属の欄で区別されたい。</p>` : ''}`,
    { head: mhead('人物索引', side), folio });
};

// ── 後付　出典索引 ─────────────────────────────
//
// 各項の「評判」は、必ず出典を伴う引用で組んである。百九十六件ある。
// これまで、その一覧はどこにも無かった。序に挙げた底本は編纂の骨組であって、
// 引用の一件ごとの出どころではない。
//
// 一覧にすると、序では見えなかったことが二つ出る。
// 一つは、本書がどの記録に寄りかかっているか。ホワイトラン領と帝国軍で十八件ずつある。
// もう一つは、同じ一通が二つ以上の項に引かれている件数である。
// これは、二つの組織が同じ一人の目から記述されていることを意味する。
const sourceList = () => {
  const byDoc = new Map();      // 出典の文字列 → 引いた項
  for (const f of factions) {
    for (const c of records2[f.id].repute ?? []) {
      if (!byDoc.has(c.src)) byDoc.set(c.src, []);
      byDoc.get(c.src).push(f);
    }
  }
  // 出どころ。括弧の中は年なので、先に落としてから頭の語を採る。
  // 「ノクターナルの祭祀に関する註（年代不明）」のように、発した側が書かれていない
  // 出典がある。頭の語を採ると註の題そのものが出どころになってしまうので、別に括る。
  const ANON = '発した側の記されないもの';
  const split = (s) => {
    const bare = s.replace(/（[^）]*）/g, '').trim();
    const i = bare.search(/[ 　]/);
    return i < 0 ? [ANON, s] : [bare.slice(0, i), s.slice(i).trim()];
  };
  const groups = new Map();
  for (const [src, fs] of byDoc) {
    const [b, title] = split(src);
    if (!groups.has(b)) groups.set(b, []);
    groups.get(b).push({ src, title, fs });
  }
  for (const g of groups.values()) g.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
  const list = [...groups.entries()].sort((a, b) =>
    (a[0] === ANON) - (b[0] === ANON)
    || b[1].length - a[1].length || a[0].localeCompare(b[0], 'ja'));
  const cites = [...byDoc.values()].reduce((n, v) => n + v.length, 0);
  const shared = [...byDoc.values()].filter((v) => v.length > 1).length;
  return { list, docs: byDoc.size, cites, shared };
};

export const sourceIndex = (side, folioOf, folio) => {
  const { list, docs, cites, shared } = sourceList();
  // 出どころは件数の多い順に並ぶので、頭から半分で割ると左頁だけが溢れる。
  // 行数（見出し一行＋文書の行）で量って割る。左頁には見出しと前書きがある分を引く。
  const w = (g) => 1 + g[1].length;
  const total = list.reduce((n, g) => n + w(g), 0);
  const budget = (total - 7) / 2;
  let acc = 0, cut = 0;
  for (; cut < list.length && acc < budget; cut++) acc += w(list[cut]);
  const half = side === 'verso' ? list.slice(0, cut) : list.slice(cut);
  return sheet(side, `
  ${side === 'verso' ? `<h2 class="mh">出典索引</h2>
    <div class="lg-lead">各項の「評判」に引いた ${cites} 件の出典を、
      発した側ごとにまとめた。異なり ${docs} 点である。
      数字は、その記録を引いた項の番号を示す。</div>` : ''}
  <div class="si">${half.map(([body, docsOf]) => `
    <div class="si-g"><h4>${body}<b>${docsOf.length}</b></h4>
      ${docsOf.map(({ title, fs }) => `<div class="si-d">
        <span class="si-t">${title}</span>
        <span class="si-r">${fs.map((f) =>
          `<a class="xl xn" data-to="${f.id}" title="${f.ja}">${NUM(f)}</a>`).join('')}</span>
      </div>`).join('')}</div>`).join('')}</div>
  ${side === 'recto' ? `<p class="lg-note">同じ一点が二つ以上の項に引かれている例が ${shared} 点ある。
    これは、二つの組織が同じ一人の目から記述されているということである。
    立場の違いが記述の違いとして現れているのか、
    記録者ひとりの見方が二つの項に及んでいるのかは、この一覧では区別できない。
    区別が必要な読者は、当該の項を並べて読まれたい。</p>
  <p class="lg-note">閲覧を拒まれた記録は、この一覧に現れない。
    引用できなかったからである。その一覧は序の末尾に置いた。</p>` : ''}`,
    { head: mhead('出典索引', side), folio });
};

// ── 後付　総索引 ──────────────────────────────
export const generalIndex = (side, folioOf, folio, terms) => {
  const half = side === 'verso' ? terms.slice(0, Math.ceil(terms.length / 2)) : terms.slice(Math.ceil(terms.length / 2));
  return sheet(side, `
  ${side === 'verso' ? `<h2 class="mh">総索引</h2>
    <div class="lg-lead">組織名・別称・地名・事項を一括して五十音順に並べた。
      別称からは正称の項へ導く。</div>` : ''}
  <div class="gi">${half.map((t) =>
    `<div class="gi-r"><span class="gi-t">${t.term}</span>
      ${t.see ? `<span class="gi-see">→　${t.see}</span>` : ''}
      <span class="dots"></span><span class="tp2">${t.folio}</span></div>`).join('')}</div>`,
    { head: mhead('総索引', side), folio });
};

// ── 後付　追記欄 ──────────────────────────────
export const notesPage = (side, n, folio) => sheet(side, `
  ${n === 1 ? `<h2 class="mh">追記欄</h2>
    <div class="lg-lead">本書は完結した記述ではない。
      新たに得られた記録、誤りの指摘、増補すべき組織について、この四頁に書き加えられたい。
      書き込まれた版が、次の版の元となる。</div>` : ''}
  <div class="np">${Array.from({ length: n === 1 ? 32 : 42 }, () => '<div class="np-l"></div>').join('')}</div>`,
  { head: mhead('追記欄', side), folio });

// ── 後付　奥付 ───────────────────────────────
export const colophon = (side, stats, folio) => sheet(side, `
  <div class="cl">
    <h2>奥付</h2>
    <table class="cl-t">
      <tr><th>書名</th><td>タムリエル勢力誌</td></tr>
      <tr><th>欧字書名</th><td>A Survey of the Powers of Tamriel</td></tr>
      <tr><th>編</th><td>王立記録院　記録部　編纂室</td></tr>
      <tr><th>刊</th><td>第四紀 二一〇年</td></tr>
      <tr><th>判型</th><td>A4 判（210 × 297 ミリ）　縦　${stats.pages} 頁</td></tr>
      <tr><th>組</th><td>六列グリッド　行送り 5.6 ミリ　45 行</td></tr>
      <tr><th>刷</th><td>二色（墨・分類色）</td></tr>
      <tr><th>収録</th><td>${factions.length} 項　関係 ${edges.length} 件　本文 ${stats.chars.toLocaleString('en')} 字</td></tr>
      <tr><th>図版</th><td>主図版 ${stats.scenes}　紋章 ${factions.length}　人物 ${stats.busts}
        　小カット ${stats.cutPlacements}（${stats.cutKinds} 種）　地図 3　相関図 ${stats.relSheets} 枚</td></tr>
      <tr><th>索引</th><td>人物 ${stats.people} 名　出典 ${stats.cites} 件（異なり ${stats.sources} 点）
        　総索引 ${stats.terms} 項目　年表 ${stats.events} 行</td></tr>
    </table>
    <p class="cl-n">本書の図版はすべて銅版画調の線画による。調子は一つの規約に従って作られており、
      図版の大小にかかわらず彫りの目は等しい。</p>
    <p class="cl-n">記述の現在は第四紀二〇一年。以後の変動は本書の対象としない。</p>
  </div>`, { head: mhead('奥付', side), folio });

// ── 前付・後付の体裁 ───────────────────────────
export const matterCss = () => `
.mrh { position:absolute; top:-9mm; width:var(--frame-w); font-size:2.5mm;
       letter-spacing:.18em; color:var(--ink-weak); border-bottom:.3mm solid var(--rule);
       padding-bottom:1.4mm; }
.mrh.rh-r { text-align:right; }
.mfolio { position:absolute; bottom:-14mm; font-family:'EB Garamond','Noto Serif JP',serif; font-size:3mm; color:var(--ink-mid); }
.mf-r { right:0; } .mf-l { left:0; }
.mh { font-size:6.4mm; line-height:calc(var(--lead)*2); font-weight:600; letter-spacing:.08em;
      margin-bottom:calc(var(--lead)*0.5); }
h3 { font-size:3.6mm; font-weight:600; letter-spacing:.06em; margin:calc(var(--lead)*1) 0 calc(var(--lead)*0.4); }
.lg-lead, .md-lead { font-size:3mm; line-height:var(--lead); color:var(--ink-mid);
                     margin-bottom:calc(var(--lead)*0.8); }

/* 相関図について（前付）。札の見本と十九枚の内訳。 */
.rs { margin-top:-2mm; }
.rs svg { width:174mm; display:block; }
.rk-card { margin:2mm 0 4mm; width:94mm; }
.rk-card svg, .rk-card > g { overflow:visible; }
.rk-list { list-style:none; margin:0 0 3mm; }
.rk-list li { font-size:3mm; line-height:1.62; margin-bottom:1.4mm; text-indent:-4.6mm;
              padding-left:4.6mm; }
.rk-list b { font-weight:600; }
.rk-idx h4 { font-size:2.7mm; letter-spacing:.16em; color:var(--ink-weak);
             border-bottom:.2mm solid var(--rule); padding-bottom:.8mm; margin-bottom:1.6mm; }
.rk-idx ul { list-style:none; }
.rk-idx li { font-size:2.8mm; line-height:1.72; display:flex; align-items:baseline; gap:2mm; }
.rk-idx b { margin-left:auto; font-size:2.3mm; color:var(--ink-weak); font-weight:400; }
.rk-n { display:inline-block; width:5mm; color:var(--c,#8b8880); font-size:2.4mm;
        letter-spacing:.06em; }

/* 相関図索引。組織 → 図。行は一頁二十五本に収める。 */
.ri-r { display:flex; align-items:baseline; gap:1.8mm; font-size:2.9mm;
        line-height:calc(var(--lead)*0.86); border-bottom:.15mm solid var(--rule);
        padding:1.5mm 0; }
/* 名と関係数は縮めない。図の一覧のほうを折り返す。
   帝国軍は十三本持つので、一行では収まらない。 */
.ri-f { font-weight:600; flex:none; white-space:nowrap; }
.ri-c { font-size:2.2mm; color:var(--ink-weak); letter-spacing:.04em;
        flex:none; white-space:nowrap; }
.ri-s { margin-left:auto; display:flex; flex-wrap:wrap; justify-content:flex-end;
        gap:.3mm 1.8mm; text-align:right; }
.ri-s i { font-style:normal; font-size:2.2mm; color:var(--ink-mid); white-space:nowrap; }
.ri-s i.ri-m { color:var(--ink); }
.ri-s b { font-family:'EB Garamond','Noto Serif JP',serif; font-weight:400;
          font-size:2.4mm; margin-left:.7mm; }
.lg-note { font-size:2.8mm; line-height:calc(var(--lead)*0.86); color:var(--ink-mid); margin-top:2mm; }
.dots { flex:1; border-bottom:.15mm dotted var(--rule); margin:0 1.5mm; transform:translateY(-1mm); }
.tp2, .co-p { font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.9mm; color:var(--ink-mid); }
a.xl { color:inherit; text-decoration:none; }

/* 表紙 */
.cv { position:absolute; inset:-19mm -17mm -26mm -17mm; display:flex; flex-direction:column;
      background:#efece3; }
.cv-bands { display:flex; height:26mm; }
.cv-bands span { flex:1; background:var(--c); color:#f6f4ee; display:flex; flex-direction:column;
                 justify-content:flex-end; align-items:center; padding-bottom:2.6mm;
                 font-size:2.4mm; letter-spacing:.14em; }
.cv-bands i { font-style:normal; font-family:'EB Garamond','Noto Serif JP',serif; font-size:4.4mm; margin-bottom:1mm; }
.cv-mid { flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center;
          padding:0 24mm; }
.cv-rule { width:100%; height:.5mm; background:#1b1b1a; }
.cv-title { font-size:17mm; line-height:1.25; font-weight:600; letter-spacing:.14em; margin:9mm 0 4mm; }
.cv-en { font-family:'EB Garamond','Noto Serif JP',serif; font-size:4mm; letter-spacing:.36em; color:#5c5a54; margin-bottom:3mm; }
.cv-sub { font-size:3.4mm; letter-spacing:.2em; color:#5c5a54; margin-bottom:9mm; }
.cv-foot { text-align:center; padding-bottom:18mm; font-size:3.4mm; letter-spacing:.2em; }
.cv-imp { font-size:2.9mm; color:#5c5a54; margin-top:2mm; }

/* 扉 */
.tp { display:flex; flex-direction:column; align-items:center; padding-top:52mm; text-align:center; }
.tp-mark svg { width:34mm; height:34mm; }
.tp h1 { font-size:11mm; line-height:1.4; font-weight:600; letter-spacing:.16em; margin:12mm 0 5mm; }
.tp-en { font-family:'EB Garamond','Noto Serif JP',serif; font-size:3.4mm; letter-spacing:.3em; color:var(--ink-mid); line-height:2; }
.tp-en span { font-size:2.6mm; letter-spacing:.22em; }
.tp-line { width:46mm; height:.4mm; background:var(--ink); margin:14mm 0 6mm; }
.tp-pub { font-size:3.6mm; letter-spacing:.3em; }

.blank-note { position:absolute; bottom:0; width:100%; text-align:center;
              font-size:2.4mm; color:var(--ink-weak); letter-spacing:.2em; }

/* 目次 */
.toc-sec { margin-bottom:calc(var(--lead)*0.9); }
.toc + .toc-sec { margin-top:calc(var(--lead)*1.6); margin-bottom:0; }
.toc-sh { font-size:2.5mm; letter-spacing:.2em; color:var(--ink-weak);
          border-bottom:.35mm solid var(--ink); padding-bottom:.9mm; margin-bottom:1.2mm; }
.toc-sec ul { list-style:none; columns:2; column-gap:var(--gutter); }
.toc-sec li { font-size:2.85mm; line-height:calc(var(--lead)*0.86); break-inside:avoid; }
.toc-sec a { display:flex; align-items:baseline; }
.toc { columns:2; column-gap:var(--gutter); }
.toc-cat { break-inside:avoid; margin-bottom:calc(var(--lead)*0.9); }
.toc-ch { display:flex; align-items:baseline; gap:2mm; border-bottom:.4mm solid var(--c);
          padding-bottom:1mm; margin-bottom:1.4mm; }
.toc-n { font-family:'EB Garamond','Noto Serif JP',serif; font-size:4mm; color:var(--c); }
.toc-j { font-size:3.3mm; font-weight:600; letter-spacing:.06em; }
.toc-c { margin-left:auto; font-size:2.4mm; color:var(--ink-weak); }
.toc ul { list-style:none; }
.toc li a { display:flex; align-items:baseline; font-size:2.9mm; line-height:calc(var(--lead)*0.86); }
.tn { font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.6mm; color:var(--ink-weak); width:6mm; }

/* 序 */
.prf { width:calc(var(--col)*5 + var(--gutter)*4); }
.prf p { font-size:3.35mm; line-height:calc(var(--lead)*1.14); text-indent:1em;
         margin-bottom:calc(var(--lead)*0.5); }
.prf-sign { margin-top:calc(var(--lead)*1.4); text-align:right; font-size:3mm; letter-spacing:.12em;
             width:calc(var(--col)*5 + var(--gutter)*4); }
.src { margin-top:calc(var(--lead)*2.2); border-top:.4mm solid var(--ink); padding-top:2.4mm; }
.src h3 { margin-top:0; font-size:3.2mm; }
table.src-t { width:100%; border-collapse:collapse; }
table.src-t td { font-size:2.75mm; line-height:calc(var(--lead)*0.8); padding:.7mm 0;
                 border-bottom:.15mm solid var(--rule); vertical-align:top; }
.src-b { width:34mm; color:var(--ink-mid); }
.src-c { width:34mm; color:var(--ink-weak); font-size:2.5mm; }

/* 凡例 */
.lg-sec { margin-bottom:calc(var(--lead)*0.6); }
.lg-map { gap:0 var(--gutter); }
.lgm-page { border:.2mm solid var(--rule); padding:2.4mm; }
.lgm-t { display:block; font-size:2.6mm; letter-spacing:.16em; color:var(--ink-weak); margin-bottom:1.4mm; }
.lgm-page ol { margin-left:5mm; font-size:2.8mm; line-height:calc(var(--lead)*0.82); }
.lg-tags { display:grid; grid-template-columns:repeat(2,1fr); gap:1.6mm var(--gutter); }
.lg-tag { border-left:.4mm solid var(--rule); padding-left:2.4mm; }
.lg-k { font-size:2.7mm; font-weight:600; }
.lg-v { font-size:2.6mm; color:var(--ink-mid); }
.lg-rel { display:grid; grid-template-columns:1fr 1fr; gap:1.8mm var(--gutter); }
.lgr { display:flex; align-items:center; gap:2mm; }
.lgr-s { width:16mm; height:5mm; flex:none; }
.lgr-t b { font-size:2.8mm; font-weight:600; display:block; }
.lgr-t span { font-size:2.4mm; color:var(--ink-mid); line-height:3.2mm; display:block; }
.lg-fore { display:flex; gap:var(--gutter); align-items:stretch; }
.lg-cats { flex:1; }
.lg-edge { width:20mm; flex:none; }
.lge-t { display:block; font-size:2.2mm; color:var(--ink-weak); letter-spacing:.1em; margin-bottom:1mm; }
.lge-b { position:relative; height:41.6mm; width:8mm; border:.2mm solid var(--rule); background:#faf9f5; }
.lge-b i { position:absolute; right:0; width:5mm; height:4.3mm; background:var(--c); opacity:.75; }
.lgc { display:flex; align-items:baseline; gap:2.4mm; font-size:2.9mm;
       line-height:calc(var(--lead)*0.9); position:relative; padding-left:9mm; }
.lgc-b { position:absolute; left:0; top:1.2mm; width:6mm; height:3mm; background:var(--c); opacity:.75; }
.lgc-n { font-family:'EB Garamond','Noto Serif JP',serif; color:var(--c); width:8mm; }
.lgc-c { margin-left:auto; font-size:2.4mm; color:var(--ink-weak); }

/* 全体相関図 */
.md-fig svg { width:var(--frame-w); height:auto; display:block; }
.md-cap { font-size:2.7mm; line-height:calc(var(--lead)*0.86); color:var(--ink-mid); margin-top:3mm; }
.md-key { display:grid; grid-template-columns:repeat(2,1fr); gap:.6mm var(--gutter);
          margin-top:calc(var(--lead)*1); border-top:.4mm solid var(--ink); padding-top:2.4mm; }
.mdk { display:flex; align-items:baseline; gap:2mm; font-size:2.8mm; line-height:calc(var(--lead)*0.9); }
.mdk-b { width:5mm; height:2.6mm; background:var(--c); opacity:.75; flex:none; }
.mdk-n { font-family:'EB Garamond','Noto Serif JP',serif; color:var(--c); width:7mm; }
.mdk-r { margin-left:auto; font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.5mm; color:var(--ink-weak); }
table.mx { border-collapse:collapse; width:100%; }
table.mx th { font-size:2.5mm; font-weight:400; text-align:left; color:var(--ink-mid); padding:.8mm 1.2mm; }
table.mx thead th { text-align:center; font-family:'EB Garamond','Noto Serif JP',serif; font-size:3mm; color:var(--c); }
table.mx tbody th { color:var(--c); width:34mm; }
table.mx td { text-align:center; font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.9mm;
              padding:.8mm 0; border:.15mm solid var(--rule); }
table.mx td.mx-d { outline:.35mm solid var(--ink); outline-offset:-.35mm; }
.mx-s { color:var(--ink-weak); }
.md-top { list-style:none; columns:2; column-gap:var(--gutter); font-size:2.9mm; }
.md-top li { display:flex; align-items:baseline; gap:1.6mm; line-height:calc(var(--lead)*0.86); }
.md-top li b { margin-left:auto; font-family:'EB Garamond','Noto Serif JP',serif; font-weight:400; }
.mdn, .dln { font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.4mm; color:#fbfaf6; background:var(--c);
             width:4.4mm; height:4.4mm; border-radius:50%; display:inline-flex;
             align-items:center; justify-content:center; flex:none; }

/* 地図 */
.mp svg { width:var(--frame-w); height:auto; display:block; }
/* 図二は下に領の表を敷くので、図のほうを一割ほど詰める。 */
.mp-s svg { width:90%; margin:0 auto; }

/* 図の下の表。図一は州外十三項、図二は九つの領。 */
.mfo { margin-top:1mm; }
.mfo-c h4 { font-size:2.5mm; letter-spacing:.16em; color:var(--ink-weak);
            border-bottom:.2mm solid var(--rule); padding-bottom:.7mm; margin-bottom:1.2mm; }
.mfo-c ul { list-style:none; }
.mfo-c li { font-size:2.7mm; line-height:1.62; }
.mfo-c a { display:flex; align-items:baseline; }
table.hd { border-collapse:collapse; width:100%; margin-top:1mm; }
table.hd th { font-size:2.3mm; font-weight:400; letter-spacing:.14em; color:var(--ink-weak);
              text-align:left; border-bottom:.2mm solid var(--rule); padding-bottom:.8mm; }
table.hd td { font-size:2.7mm; padding:.85mm 0; border-bottom:.15mm solid var(--rule);
              vertical-align:baseline; }
.hd-h { width:26mm; font-weight:600; }
.hd-s { width:26mm; color:var(--ink-mid); }
.hd-f a { display:inline-flex; align-items:baseline; margin-right:3.2mm; }
.dm { width:var(--frame-w); overflow:hidden; }
.dm svg { width:100%; height:auto; display:block; }
.dm-legend h3:first-child { margin-top:0; }
.dl-cats { display:grid; grid-template-columns:repeat(2,1fr); gap:1mm var(--gutter); font-size:2.8mm; }
.dlc i { display:inline-block; width:3mm; height:3mm; margin-right:1.6mm; }
.dl-off { margin-bottom:2.4mm; }
.dl-why { font-size:2.6mm; letter-spacing:.14em; color:var(--ink-weak); border-bottom:.2mm solid var(--rule); }
.dl-off ul { list-style:none; }
.dl-off li a { display:flex; align-items:center; gap:1.6mm; font-size:2.8mm; line-height:calc(var(--lead)*0.86); }

/* 年表 */
.ch-era h3 { display:flex; align-items:baseline; gap:3mm; border-bottom:.4mm solid var(--ink); padding-bottom:1mm; }
.ch-era h3 span { font-size:2.4mm; font-weight:400; color:var(--ink-weak); letter-spacing:.06em; }
/* 年表。年を一度だけ立て、その年の出来事をぶら下げる。 */
.ch { margin-top:1.4mm; }
.chy { display:flex; gap:3mm; border-bottom:.15mm solid var(--rule); padding:1.1mm 0; }
.chy-y { width:11mm; flex:none; font-family:'EB Garamond','Noto Serif JP',serif;
         font-size:3mm; color:var(--ink-mid); }
.chy-b { flex:1; min-width:0; }
.chy-t { font-size:2.85mm; line-height:calc(var(--lead)*0.9); text-align:justify; }
.chy-r { margin-top:.4mm; }
.chy-k { font-size:2.35mm; color:var(--ink-weak); }
.chv { margin-top:1.6mm; font-size:2.5mm; color:var(--ink-weak); }
.chv-k { letter-spacing:.14em; margin-right:1.4mm; }

/* 出典索引。二段組で流す。出どころの見出しは段をまたがせない。 */
.si { columns:3; column-gap:calc(var(--gutter)*0.9); margin-top:1mm; }
.si-g { break-inside:avoid; margin-bottom:1.5mm; }
.si-g h4 { display:flex; align-items:baseline; font-size:2.45mm; font-weight:600;
           border-bottom:.2mm solid var(--rule); padding-bottom:.4mm; margin-bottom:.5mm; }
.si-g h4 b { margin-left:auto; font-weight:400; font-size:2.1mm; color:var(--ink-weak);
             font-family:'EB Garamond','Noto Serif JP',serif; }
.si-d { display:flex; align-items:baseline; gap:1.2mm; font-size:2.3mm;
        line-height:calc(var(--lead)*0.74); }
.si-t { color:var(--ink-mid); }
.si-r { margin-left:auto; white-space:nowrap; }
table.ch { width:100%; border-collapse:collapse; }
table.ch td { vertical-align:top; padding:.9mm 0; border-bottom:.15mm solid var(--rule); font-size:2.85mm;
              line-height:calc(var(--lead)*0.8); }
td.cy { width:12mm; font-family:'EB Garamond','Noto Serif JP',serif; color:var(--ink-mid); }
td.cr { width:20mm; text-align:right; }
a.xn { font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.5mm; color:var(--ink-weak); margin-left:1.2mm; }

/* 分類扉 */
.ct-page { padding-top:56mm; }
.ct-n { font-family:'EB Garamond','Noto Serif JP',serif; font-size:26mm; line-height:1; color:var(--c); letter-spacing:.06em; }
.ct-j { font-size:12mm; line-height:1.4; font-weight:600; letter-spacing:.12em; margin-top:4mm; }
.ct-en { font-family:'EB Garamond','Noto Serif JP',serif; font-size:3.2mm; letter-spacing:.3em; color:var(--ink-weak); }
.ct-rule { width:var(--frame-w); height:.6mm; background:var(--c); margin:8mm 0 4mm; }
.ct-count { font-size:3.2mm; letter-spacing:.2em; color:var(--ink-mid); }
.ct-note { font-size:3mm; line-height:var(--lead); margin-top:calc(var(--lead)*1.2); width:calc(var(--col)*4 + var(--gutter)*3); }
.ct-tally { display:grid; grid-template-columns:repeat(2,1fr); gap:calc(var(--lead)*0.8) var(--gutter);
            margin-top:calc(var(--lead)*2); width:calc(var(--col)*4 + var(--gutter)*3); }
.ctt-k { font-size:2.4mm; letter-spacing:.16em; color:var(--ink-weak); border-bottom:.2mm solid var(--rule);
         padding-bottom:.8mm; margin-bottom:1mm; }
.ctt-r { display:flex; align-items:center; gap:1.6mm; font-size:2.7mm; line-height:calc(var(--lead)*0.8); }
.ctt-r > span:first-child { width:17mm; flex:none; }
.ctt-bar { flex:1; height:2mm; background:#e6e3da; }
.ctt-bar i { display:block; height:100%; background:var(--c); opacity:.8; }
.ctt-r b { font-family:'EB Garamond','Noto Serif JP',serif; font-weight:400; width:5mm; text-align:right; }
.co-dia svg { width:100%; height:auto; display:block; }

/* 分類の見開き右頁 */
.co h3:first-child { margin-top:0; }
.co-grid { display:grid; grid-template-columns:1fr 1fr; gap:2mm var(--gutter); }
.co-item { display:flex; align-items:center; gap:2.4mm; border-bottom:.15mm solid var(--rule); padding:1.2mm 0; }
.co-emb svg { width:9mm; height:9mm; display:block; }
.co-t b { font-size:2.9mm; font-weight:600; display:block; }
.co-t i { font-family:'EB Garamond','Noto Serif JP',serif; font-style:normal; font-size:2.2mm;
          letter-spacing:.18em; color:var(--ink-weak); display:block; }
.co-p { margin-left:auto; }
.co-rel { list-style:none; columns:2; column-gap:var(--gutter); font-size:2.8mm; }
.co-rel li { line-height:calc(var(--lead)*0.86); break-inside:avoid; }
.cor-k { display:inline-block; width:12mm; color:var(--c); font-size:2.4mm; }
.co-rel em { font-style:normal; color:var(--ink-weak); margin:0 1mm; }

/* 一覧表 */
table.dt { width:100%; border-collapse:collapse; }
table.dt th { font-size:2.5mm; letter-spacing:.12em; color:var(--ink-weak); text-align:left;
              border-bottom:.4mm solid var(--ink); padding-bottom:1mm; font-weight:400; }
table.dt td { font-size:2.85mm; padding:1.05mm 0; border-bottom:.15mm solid var(--rule); }
.dt-n { width:8mm; font-family:'EB Garamond','Noto Serif JP',serif; color:var(--c); }
.dt-f { width:44mm; }
.dt-x { font-family:'EB Garamond','Noto Serif JP',serif; font-size:2.6mm; color:var(--ink-mid); }

/* 索引 */
.pi, .gi { columns:2; column-gap:var(--gutter); }
.pi-r, .gi-r { display:flex; align-items:baseline; font-size:2.8mm;
               line-height:calc(var(--lead)*0.82); break-inside:avoid; }
.pi-g { break-inside:avoid; }
.pi-h { font-size:2.4mm; letter-spacing:.2em; color:var(--ink-weak);
        border-bottom:.2mm solid var(--rule); padding-bottom:.5mm;
        margin:1.6mm 0 .8mm; }
.pi-g:first-child .pi-h { margin-top:0; }
.pi-n { font-weight:600; flex:none; }
.pi-w { margin-left:1.8mm; font-size:2.4mm; color:var(--ink-mid);
        min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pi-o { margin-left:2mm; color:var(--ink-mid); font-size:2.5mm;
        flex:none; white-space:nowrap; }
.gi-see { color:var(--ink-mid); font-size:2.5mm; margin-left:1.4mm; }

/* 追記欄 */
.np { margin-top:calc(var(--lead)*0.5); }
.np-l { height:var(--lead); border-bottom:.15mm solid #ddd9cf; }

/* 奥付 */
.cl { padding-top:20mm; }
.cl h2 { font-size:5mm; font-weight:600; letter-spacing:.2em; margin-bottom:calc(var(--lead)*1); }
table.cl-t { width:calc(var(--col)*5 + var(--gutter)*4); border-collapse:collapse; }
table.cl-t th { width:24mm; text-align:left; font-weight:400; font-size:2.6mm; color:var(--ink-weak);
                letter-spacing:.12em; vertical-align:top; padding:1.4mm 0; }
table.cl-t td { font-size:3mm; padding:1.4mm 0; border-bottom:.15mm solid var(--rule); }
.cl-n { font-size:2.7mm; line-height:calc(var(--lead)*0.86); color:var(--ink-mid); margin-top:calc(var(--lead)*0.8); }
`;
