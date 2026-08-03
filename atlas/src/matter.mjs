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
import { masterDiagram, catDiagram } from './diagram.mjs';
import { edges, edgesOf, KINDS, hostileDegree } from './relations.mjs';
import { tamrielMap, skyrimMap, distributionMap, PROVINCES } from './map.mjs';
import { eras, events, refNums } from './chronicle.mjs';
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
      <div class="cv-sub">スカイリム州所在の四十九組織　図版四百点</div>
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
export const toc = (side, cats, folioOf, folio) => sheet(side, `
  <h2 class="mh">目次</h2>
  <div class="toc">${cats.map((c) => `
    <div class="toc-cat" style="--c:${c.color}">
      <div class="toc-ch"><span class="toc-n">${c.n}</span><span class="toc-j">${c.ja}</span>
        <span class="toc-c">${byCat(c.id).length} 項</span></div>
      <ul>${byCat(c.id).map((f) =>
        `<li><a class="xl" data-to="${f.id}"><span class="tn">${NUM(f)}</span>${f.ja}
          <span class="dots"></span><span class="tp2">${folioOf(f.id)}</span></a></li>`).join('')}</ul>
    </div>`).join('')}</div>`,
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
  + '各項の「関係」欄が本書の実用上の中心であり、巻頭の全体相関図はその総和である。'
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

// ── 10-11　全体相関図 ────────────────────────────
// 円環図を見開きに跨がせる案は捨てた。
// 弦の交わる中心がノドに落ちる。綴じで一〇ミリ持っていかれる位置に、
// この図のいちばん読ませたい部分が来てしまう。
// そこで図は右頁に一枚で置き、左頁を「読むための装置」に充てた。
// 分類間の関係数を表にすると、円環図では数えないと判らない偏りが一目で出る。
const CATMX = () => {
  const m = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (const [ea, eb] of edges) {
    const a = factions.find((f) => f.id === ea), b = factions.find((f) => f.id === eb);
    if (!a || !b) continue;
    m[a.cat][b.cat]++; if (a.cat !== b.cat) m[b.cat][a.cat]++;
  }
  return m;
};

export const masterL = (folio) => {
  const m = CATMX();
  const top = [...factions].map((f) => [f, hostileDegree(f.id)])
    .sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = Math.max(...categories.flatMap((r) => categories.map((c) => m[r.id][c.id])));
  return sheet('verso', `
  <h2 class="mh">全体相関図</h2>
  <div class="md-lead">四十九項のすべてと、その間に確認された${edges.length}件の関係を右頁に一枚で収めた。
    外周は分類ごとに区切ってある。敵対のみを弦として内側に引き、それ以外の関係は外周の弧で示した。
    弦の集まる位置が、この州における対立の焦点である。</div>

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
    公認された教団は、他の組織と関係を持たないのではない。関係が記録に残らないのである。
    教団の記録は教団自身が管理しており、外部の文書に現れる機会が少ない。</p>

  <h3>敵対の集まる組織</h3>
  <ol class="md-top">${top.map(([f, n]) =>
    `<li><a class="xl" data-to="${f.id}"><span class="mdn" style="--c:${catOf(f).color}">${NUM(f)}</span>${f.ja}</a><b>${n}</b></li>`).join('')}</ol>
  <p class="lg-note">数字は敵対関係の本数である。上位十項のうち六項が、分類 II「国家・軍事」
    または分類 III「敵対組織」に属する。州内の対立が、信仰や商いではなく
    統治の帰属をめぐって生じていることを示す。</p>`,
  { head: mhead('全体相関図', 'verso'), folio });
};

export const masterR = (folio) => sheet('recto', `
  <div class="md-fig">${masterDiagram({ size: 1240 })}</div>
  <p class="md-cap">図四　全体相関図。外周の帯は分類、節点は組織、内側の線は敵対、
    外周の弧はそれ以外の関係を示す。節点の外の刻みは、その組織の関係の総数である。</p>
  <div class="md-key">${categories.map((c) => `
    <div class="mdk" style="--c:${c.color}"><span class="mdk-b"></span>
      <span class="mdk-n">${c.n}</span><span class="mdk-j">${c.ja}</span>
      <span class="mdk-r">${(() => { const l = byCat(c.id); return `${NUM(l[0])}–${NUM(l[l.length - 1])}`; })()}</span></div>`).join('')}</div>
  <p class="lg-note">節点は本編の並び順に、分類 I の先頭から時計回りに置いた。
    円環上の位置は本編の頁順に対応するので、この図から本編を引くことができる。</p>`,
  { head: mhead('全体相関図', 'recto'), folio });

// ── 12-13　地図（全図・九領図） ──────────────────
export const mapTamriel = (folio) => sheet('verso', `
  <h2 class="mh">図一　タムリエル全図</h2>
  <div class="mp">${tamrielMap({ size: 1180 })}</div>
  <p class="lg-note">本書が扱うのは州一つだが、州外に本拠を置く組織が十三項ある。
    それらの「遠さ」は、州内の地図では表せない。州境は模式であり、測量に基づかない。</p>`,
  { head: mhead('地図', 'verso'), folio });

export const mapSkyrim = (folio) => sheet('recto', `
  <h2 class="mh">図二　スカイリム九領図</h2>
  <div class="mp">${skyrimMap({ size: 1180 })}</div>
  <p class="lg-note">領境と街道、および本書の各項が拠点として挙げる地を打った。
    街道は破線で示す。冬季に通行が絶える区間の別は、本図では示していない。</p>`,
  { head: mhead('地図', 'recto'), folio });

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
const chronRows = (list, folioOf) => list.map((e) => `
  <tr><td class="cy">${e.year}</td>
    <td class="ct">${e.text}</td>
    <td class="cr">${refNums(e.refs, factions).map((n, i) => {
      const f = factions[n - 1];
      return `<a class="xl xn" data-to="${f.id}" title="${f.ja}">${n}</a>`;
    }).join('')}</td></tr>`).join('');

export const chronL = (folioOf, folio) => {
  const list = events.filter((e) => e.era !== 'e4');
  return sheet('verso', `
  <h2 class="mh">年表</h2>
  <div class="lg-lead">本書の各項に効いた出来事だけを採った。
    右端の数字は関係する項の番号である。</div>
  ${eras.filter((x) => x.id !== 'e4').map((era) => `
    <div class="ch-era"><h3>${era.ja}${era.note ? `<span>${era.note}</span>` : ''}</h3>
      <table class="ch">${chronRows(list.filter((e) => e.era === era.id), folioOf)}</table></div>`).join('')}`,
  { head: mhead('年表', 'verso'), folio });
};

export const chronR = (folioOf, folio) => sheet('recto', `
  ${eras.filter((x) => x.id === 'e4').map((era) => `
    <div class="ch-era"><h3>${era.ja}<span>${era.note}</span></h3>
      <table class="ch">${chronRows(events.filter((e) => e.era === 'e4'), folioOf)}</table></div>`).join('')}
  <p class="lg-note">年の記されない項が六つある。ナミラ信者・グレンモリルの魔女・
    ペライトの信者・理想の支配者・各デイドラ王の信徒団・ウィスパーズの六項で、
    いずれも成立と消長を年で押さえられる記録が存在しない。
    年表に載らないことは、それ自体がこれらの組織の性格を示している。</p>`,
  { head: mhead('年表', 'recto'), folio });

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
export const peopleIndex = (side, folioOf, folio) => {
  const all = [];
  for (const f of factions) for (const p of records[f.id].people ?? []) all.push([p, f]);
  all.sort((a, b) => a[0].ja.localeCompare(b[0].ja, 'ja'));
  const half = side === 'verso' ? all.slice(0, Math.ceil(all.length / 2)) : all.slice(Math.ceil(all.length / 2));
  return sheet(side, `
  ${side === 'verso' ? `<h2 class="mh">人物索引</h2>
    <div class="lg-lead">本書に図版とともに現れる人物を五十音順に並べた。
      同名の別人は所属で分けてある。名を伝えない者は所属の項に括った。</div>` : ''}
  <div class="pi">${half.map(([p, f]) =>
    `<div class="pi-r"><span class="pi-n">${p.ja}</span>
      <span class="pi-o"><a class="xl" data-to="${f.id}">${f.ja}</a></span>
      <span class="dots"></span><span class="tp2">${folioOf(f.id)}</span></div>`).join('')}</div>`,
    { head: mhead('人物索引', side), folio });
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
      <tr><th>収録</th><td>${factions.length} 項　関係 ${edges.length} 件</td></tr>
      <tr><th>図版</th><td>主図版 ${stats.scenes}　紋章 ${factions.length}　人物 ${stats.busts}
        　小カット ${stats.cutPlacements}（${stats.cutKinds} 種）　地図 3　図式 ${factions.length + 1}</td></tr>
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
.pi-n { font-weight:600; }
.pi-o { margin-left:2mm; color:var(--ink-mid); font-size:2.5mm; }
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
