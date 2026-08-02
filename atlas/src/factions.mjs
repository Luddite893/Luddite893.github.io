// 収録組織 49
//
// 仕様書 6 は「発注者側で確定済み」。ただし支給画像は IV の途中で切れており、
// IV の 4 組織以降（計 20 組織）の名称を読み取れなかった。
// 該当分は provisional: true を立ててある。差し替えは名称の書き換えだけで通る。
//
// 分類 I の名称について。原仕様の「加入可能ギルド」は、読者ではなく
// 操作者から見た区分であり、他の 6 分類（血統・国籍・信仰・地縁）だけが
// 世界の内側の基準になっていた。一項目だけ視座が違う。
// 学者が編んだ本の目次に、この行はあってはならない。
// 他の 6 分類が「生まれつき決まる」のに対し、この群だけが
// 「入門と修練によって成員となる」——その一点で括り直した。

import {
  ring, arc, star, rays, moon, beastHead, hand, eye, blade, mountain, chevrons,
  wing, antlers, tentacles, gear, book, tower, ship, lyre, crossbow, hammer,
  bone, spider, paw, flame, urn, rose, mask, tusk, crown, spiral, keyhole,
  pincer, standingStone, knot, chitin, scales, rotate, J, SEP,
} from './heraldry.mjs';

export const categories = [
  { n: 'I',   id: 1, ja: '職能結社',     en: 'SODALITATES ARTIUM',      color: '#8a6f2e', tone: '鈍い金',
    note: '血統でも国籍でもなく、入門と修練によって成員となる組織。' },
  { n: 'II',  id: 2, ja: '国家・軍事',   en: 'RES PUBLICAE ET ARMA',    color: '#7c2b28', tone: '深い赤',
    note: '領域と武力を有し、統治を行うか、それを争う組織。' },
  { n: 'III', id: 3, ja: '敵対組織',     en: 'ADVERSARII',              color: '#8d5a2b', tone: '錆色',
    note: '外部からの接触を拒むか、接触が敵対としてのみ成立する組織。' },
  { n: 'IV',  id: 4, ja: '商業・名家',   en: 'MERCATURA ET GENTES',     color: '#2f5540', tone: '濃緑',
    note: '富と血統によって影響力を行使する家系および商会。' },
  { n: 'V',   id: 5, ja: '宗教・信仰',   en: 'RELIGIONES',              color: '#2c4470', tone: '藍',
    note: '公に容認された神格への信仰と、その祭祀を担う組織。' },
  { n: 'VI',  id: 6, ja: '秘教・カルト', en: 'MYSTERIA',                color: '#43304c', tone: '紫黒',
    note: '容認されざる神格に仕えるか、儀礼を秘匿する組織。' },
  { n: 'VII', id: 7, ja: '部族・辺境',   en: 'GENTES EXTERAE',          color: '#6b563a', tone: '土色',
    note: '国家に属さず、血縁と土地によって成り立つ集団。' },
];

// 副次記号。図象の周囲、固定の位置にのみ置く。
const dot = (a, r = 42, s = 2.6) => {
  const t = ((a - 90) * Math.PI) / 180;
  const x = 60 + r * Math.cos(t), y = 60 + r * Math.sin(t);
  return `M ${x.toFixed(2)} ${y.toFixed(2)} m -${s} 0 a ${s} ${s} 0 1 0 ${s * 2} 0 a ${s} ${s} 0 1 0 -${s * 2} 0`;
};
const dots = (...as) => J(...as.map((a) => dot(a)));
const baseBar = (w = 26, y = 96, t = 4) => `M ${60 - w} ${y} L ${60 + w} ${y} L ${60 + w} ${y + t} L ${60 - w} ${y + t} Z`;

export const factions = [
  // ══ I. 職能結社 ══════════════════════════════════ 鈍い金
  { id: 'companions', cat: 1, ja: '同胞団', en: 'THE COMPANIONS', alt: 'イスグラモルの末裔',
    emblem: { charge: beastHead('wolf'), marks: baseBar(24) } },
  { id: 'thieves', cat: 1, ja: '盗賊ギルド', en: 'THE THIEVES GUILD', alt: '影に住まう者',
    emblem: { charge: keyhole(), marks: dots(255, 285) } },
  { id: 'nightingale', cat: 1, ja: 'ナイチンゲール', en: 'THE NIGHTINGALES', alt: '夜の三者',
    emblem: { field: moon(20, 13, 36), charge: wing(29, 70), marks: dots(180) } },
  { id: 'brotherhood', cat: 1, ja: '闇の一党', en: 'THE DARK BROTHERHOOD', alt: '黒き手',
    emblem: { charge: hand({ spread: 0.95 }) } },
  { id: 'winterhold', cat: 1, ja: 'ウィンターホールド大学', en: 'THE COLLEGE OF WINTERHOLD', alt: '魔道の学舎',
    emblem: { field: rays(8, 30, 46, 5.4), charge: eye({ r: 12, w: 26, h: 15 }) } },
  { id: 'bards', cat: 1, ja: '吟遊詩人の大学', en: 'THE BARDS COLLEGE', alt: '',
    emblem: { charge: lyre(), marks: dots(0) } },
  { id: 'blades', cat: 1, ja: 'ブレイズ', en: 'THE BLADES', alt: '皇帝の刃',
    emblem: { charge: blade({ curve: 0, len: 40, guard: 'bar', hilt: 13 }), marks: wing(24, 72) } },
  { id: 'dawnguard', cat: 1, ja: 'ドーンガード', en: 'THE DAWNGUARD', alt: '暁の護衛団',
    emblem: { field: rays(12, 36, 47, 3.4), charge: crossbow() } },
  { id: 'volkihar', cat: 1, ja: 'ヴォルキハル一族', en: 'THE VOLKIHAR CLAN', alt: '氷湖の血族',
    emblem: { charge: wing(31, 46), marks: moon(15, 11, 86) } },
  { id: 'greybeards', cat: 1, ja: 'グレイビアード', en: 'THE GREYBEARDS', alt: '世界の喉に住む者',
    emblem: { charge: mountain(3, 86, 42), marks: chevrons(3, 26, 9, 22, 4) } },

  // ══ II. 国家・軍事 ═══════════════════════════════ 深い赤
  { id: 'legion', cat: 2, ja: '帝国軍', en: 'THE IMPERIAL LEGION', alt: '第四帝国軍',
    emblem: { charge: blade({ len: 40, guard: 'bar', hilt: 12 }), marks: J(wing(23, 74), baseBar(19, 100, 3.2)) } },
  { id: 'stormcloaks', cat: 2, ja: 'ストームクローク', en: 'THE STORMCLOAKS', alt: '真のノルド',
    emblem: { charge: beastHead('bear'), marks: baseBar(24) } },
  { id: 'thalmor', cat: 2, ja: 'サルモール', en: 'THE THALMOR', alt: 'アルドメリ自治領',
    emblem: { field: rays(16, 34, 47, 3), charge: beastHead('eagle') } },
  { id: 'penitus', cat: 2, ja: 'ペントゥス・オクラトゥス', en: 'PENITUS OCULATUS', alt: '皇帝の目',
    emblem: { charge: eye({ r: 12, w: 30, h: 17 }), marks: dots(0, 180) } },
  { id: 'moot', cat: 2, ja: 'ムート', en: 'THE MOOT', alt: '首長会議',
    emblem: { charge: crown(), marks: arc(44, 3, 200, 340) } },
  { id: 'eastempire', cat: 2, ja: '東帝都社', en: 'THE EAST EMPIRE COMPANY', alt: '',
    emblem: { charge: ship() } },

  // ══ III. 敵対組織 ════════════════════════════════ 錆色
  { id: 'silverhand', cat: 3, ja: 'シルバーハンド', en: 'THE SILVER HAND', alt: '',
    emblem: { charge: hand({ spread: 0.75 }), marks: blade({ len: 26, guard: 'none', hilt: 8 }) } },
  { id: 'vigilants', cat: 3, ja: 'ステンダールの守人', en: 'THE VIGIL OF STENDARR', alt: '慈悲の守人',
    emblem: { field: rays(12, 34, 47, 3.4), charge: hand({ spread: 1.05, wrist: 0 }) } },
  { id: 'forsworn', cat: 3, ja: 'フォースウォーン', en: 'THE FORSWORN', alt: 'リーチの誓いを捨てし者',
    emblem: { charge: antlers(3), marks: dots(180) } },
  { id: 'psijic', cat: 3, ja: 'サイジック会', en: 'THE PSIJIC ORDER', alt: '孤島の賢者',
    emblem: { field: J(ring(38, 2.4), ring(31, 1.6)), charge: eye({ r: 8, w: 18, h: 11 }) } },
  { id: 'synod', cat: 3, ja: 'サイノッド', en: 'THE SYNOD', alt: '',
    emblem: { charge: tower(), marks: eye({ r: 6, w: 13, h: 8 }) } },
  { id: 'whispers', cat: 3, ja: 'ウィスパーズ', en: 'THE WHISPERS', alt: '囁く者たち',
    emblem: { charge: J(arc(41, 5, 205, 335), arc(31, 4.4, 216, 324), arc(21, 3.6, 228, 312)), marks: dots(0, 90, 270) } },
  { id: 'moragtong', cat: 3, ja: 'モラグ・トング', en: 'THE MORAG TONG', alt: '合法の暗殺者',
    emblem: { charge: pincer() } },
  { id: 'alikr', cat: 3, ja: 'アリキール', en: "THE ALIK'R", alt: '砂漠の傭兵',
    emblem: { field: rays(9, 34, 47, 3.6, 180), charge: blade({ curve: 7, len: 34, guard: 'cup', hilt: 12 }) } },
  { id: 'shadows', cat: 3, ja: 'サマーセットの影', en: 'THE SHADOWS OF SUMMERSET', alt: '',
    emblem: { field: moon(40, 26), charge: eye({ r: 10, w: 21, h: 13 }) } },

  // ══ IV. 商業・名家 ═══════════════════════════════ 濃緑
  { id: 'blackbriar', cat: 4, ja: 'ブラック＝ブライア家', en: 'THE BLACK-BRIAR', alt: '', provisional: true,
    emblem: { field: J(ring(41, 3.2), rays(14, 41, 48, 3)), charge: urn() } },
  { id: 'silverblood', cat: 4, ja: 'シルバーブラッド家', en: 'THE SILVER-BLOOD', alt: '', provisional: true,
    emblem: { charge: mountain(2, 88, 34), marks: 'M 34 24 L 86 24 L 86 42 L 78 42 L 78 34 L 42 34 L 42 42 L 34 42 Z M 55 42 L 65 42 L 65 66 L 55 66 Z' } },
  { id: 'graymane', cat: 4, ja: 'グレイマーン家', en: 'THE GRAY-MANE', alt: '', provisional: true,
    emblem: { charge: hammer(), marks: flame(30) } },
  { id: 'battleborn', cat: 4, ja: 'バトル＝ボーン家', en: 'THE BATTLE-BORN', alt: '', provisional: true,
    emblem: { charge: J(rotate(38, bone()), rotate(-38, bone())), marks: baseBar(20, 96, 3.4) } },

  // ══ V. 宗教・信仰 ════════════════════════════════ 藍
  { id: 'divines', cat: 5, ja: '帝国教団', en: 'THE CULT OF THE DIVINES', alt: '九大神の教団', provisional: true,
    emblem: { charge: star(9, 42, 17) } },
  { id: 'talos', cat: 5, ja: 'タロス信仰', en: 'THE WORSHIP OF TALOS', alt: '第九の神', provisional: true,
    emblem: { charge: blade({ len: 32, guard: 'bar', hilt: 12 }), marks: 'M 38 34 L 42 20 L 50 30 L 60 12 L 70 30 L 78 20 L 82 34 Z' } },
  { id: 'dibella', cat: 5, ja: 'ディベラ教団', en: 'THE ORDER OF DIBELLA', alt: '', provisional: true,
    emblem: { charge: rose() } },
  { id: 'mara', cat: 5, ja: 'マーラ教団', en: 'THE ORDER OF MARA', alt: '', provisional: true,
    emblem: { charge: knot(3, 22, 6.5) } },
  { id: 'arkay', cat: 5, ja: 'アーケイ教団', en: 'THE ORDER OF ARKAY', alt: '', provisional: true,
    emblem: { charge: urn(), marks: arc(45, 2.6, 200, 340) } },
  { id: 'kynareth', cat: 5, ja: 'キナレス教団', en: 'THE ORDER OF KYNARETH', alt: '', provisional: true,
    emblem: { charge: spiral(2.2, 36, 6.5) } },
  { id: 'julianos', cat: 5, ja: 'ジュリアノス教団', en: 'THE ORDER OF JULIANOS', alt: '', provisional: true,
    emblem: { charge: book(1), marks: star(5, 18, 7, 60, 34) } },
  { id: 'oldgods', cat: 5, ja: 'ノルドの古き神々', en: 'THE OLD GODS OF THE NORDS', alt: '', provisional: true,
    emblem: { charge: standingStone(3), marks: dots(0) } },

  // ══ VI. 秘教・カルト ═════════════════════════════ 紫黒
  { id: 'dragoncult', cat: 6, ja: '竜教団', en: 'THE DRAGON CULT', alt: '', provisional: true,
    emblem: { charge: mask({ horns: 1, slits: 2 }) } },
  { id: 'hermaeus', cat: 6, ja: 'ハルメアス・モラの信徒', en: 'THE SEEKERS OF HERMAEUS MORA', alt: '', provisional: true,
    emblem: { field: tentacles(7, 14, 42), charge: eye({ r: 9, w: 19, h: 12 }) } },
  { id: 'namira', cat: 6, ja: 'ナミラの一団', en: 'THE CULT OF NAMIRA', alt: '', provisional: true,
    emblem: { charge: spider() } },
  { id: 'boethiah', cat: 6, ja: 'ボエシアの信徒', en: 'THE CULT OF BOETHIAH', alt: '', provisional: true,
    emblem: { field: ring(36, 3.4), charge: blade({ len: 40, guard: 'none', hilt: 14 }) } },
  { id: 'molagbal', cat: 6, ja: 'モラグ・バルの信徒', en: 'THE CULT OF MOLAG BAL', alt: '', provisional: true,
    emblem: { field: rays(10, 34, 47, 4), charge: hammer() } },
  { id: 'hircine', cat: 6, ja: 'ハーシーンの子ら', en: 'THE CHILDREN OF HIRCINE', alt: '', provisional: true,
    emblem: { field: moon(28, 12, 54), charge: paw() } },
  { id: 'miraak', cat: 6, ja: 'ミラークの徒', en: 'THE FOLLOWERS OF MIRAAK', alt: '', provisional: true,
    emblem: { field: tentacles(5, 16, 44), charge: mask({ horns: 0, slits: 1 }) } },

  // ══ VII. 部族・辺境 ══════════════════════════════ 土色
  { id: 'orcstrongholds', cat: 7, ja: 'オーク要塞群', en: 'THE ORC STRONGHOLDS', alt: '', provisional: true,
    emblem: { charge: J(tusk(1), tusk(-1)), marks: baseBar(22, 94, 4) } },
  { id: 'skaal', cat: 7, ja: 'スカール', en: 'THE SKAAL', alt: '全ての創造主に仕える民', provisional: true,
    emblem: { field: ring(40, 2.6), charge: antlers(2) } },
  { id: 'falmer', cat: 7, ja: 'ファルメル', en: 'THE FALMER', alt: '雪の民の成れの果て', provisional: true,
    emblem: { charge: chitin() } },
  { id: 'dwemer', cat: 7, ja: 'ドウェマー', en: 'THE DWEMER', alt: '深き者・滅亡', provisional: true,
    emblem: { charge: gear(12, 36, 27, 11) } },
  { id: 'reachmen', cat: 7, ja: 'リーチメン', en: 'THE REACHMEN', alt: '', provisional: true,
    emblem: { field: rays(16, 38, 47, 3), charge: standingStone(1) } },
];

export const catOf = (f) => categories.find((c) => c.id === f.cat);
export const byCat = (id) => factions.filter((f) => f.cat === id);
