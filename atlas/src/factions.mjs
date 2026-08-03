// 収録組織 49
//
// 仕様書 6 のとおり、発注者側で確定済みの 49 組織。全名称を確定版で保持する。
//
// extinct: true の組織には、紋章に打ち消しの横線を与える
// （仕様書 8「滅亡した組織には、紋章に打ち消しの線など統一した記号を」を採用）。
// 線は紋章の外郭を貫き、図象の上に乗る。図象側を削らないのは、
// 滅んだのは組織であって、その徽章の意匠ではないからだ。
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
  sunDisc, mushroom, gem, axe, serpent, twinMoons, circle, poly, bar,
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
  { n: 'VII', id: 7, ja: '部族・辺境・その他', en: 'GENTES EXTERAE',          color: '#6b563a', tone: '土色',
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
    emblem: { field: J(rays(12, 26, 47, 7.4), ring(21, 3.2)), charge: eye({ r: 14, w: 31, h: 18 }) } },
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
    emblem: { field: ring(43, 3.6), charge: eye({ r: 14, w: 34, h: 19 }), marks: dots(0, 180) } },
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
    emblem: { field: J(ring(40, 4.4), ring(31, 3.2)), charge: eye({ r: 10, w: 22, h: 13 }) } },
  { id: 'synod', cat: 3, ja: 'サイノッド', en: 'THE SYNOD', alt: '',
    emblem: { charge: tower(), marks: eye({ r: 6, w: 13, h: 8 }) } },
  { id: 'whispers', cat: 3, ja: 'ウィスパーズ', en: 'THE WHISPERS', alt: '囁く者たち',
    emblem: { charge: J(arc(41, 8.5, 200, 340), arc(29, 7.5, 212, 328), arc(17.5, 6.5, 226, 314)), marks: dots(0, 90, 270) } },
  { id: 'moragtong', cat: 3, ja: 'モラグ・トング', en: 'THE MORAG TONG', alt: '合法の暗殺者',
    emblem: { charge: pincer() } },
  { id: 'alikr', cat: 3, ja: 'アリキール', en: "THE ALIK'R", alt: '砂漠の傭兵',
    emblem: { field: rays(9, 28, 47, 6.2, 180), charge: blade({ curve: 7, len: 38, guard: 'cup', hilt: 13 }) } },
  { id: 'shadows', cat: 3, ja: 'サマーセットの影', en: 'THE SHADOWS OF SUMMERSET', alt: '',
    emblem: { field: moon(38, 17), charge: eye({ r: 10, w: 21, h: 13 }) } },

  // ══ IV. 商業・名家 ═══════════════════════════════ 濃緑
  { id: 'blackbriar', cat: 4, ja: 'ブラック・ブライア家', en: 'THE BLACK-BRIAR', alt: 'リフテンの実権',
    emblem: { field: J(ring(41, 3.2), rays(14, 41, 48, 3)), charge: urn() } },
  { id: 'silverblood', cat: 4, ja: 'シルバー・ブラッド家', en: 'THE SILVER-BLOOD', alt: 'マルカルスの主',
    emblem: { charge: mountain(2, 88, 34),
      marks: 'M 34 24 L 86 24 L 86 42 L 78 42 L 78 34 L 42 34 L 42 42 L 34 42 Z M 55 42 L 65 42 L 65 66 L 55 66 Z' } },
  { id: 'battleborn', cat: 4, ja: 'バトル・ボーン家', en: 'THE BATTLE-BORN', alt: '帝国派の名家',
    emblem: { charge: J(rotate(38, bone()), rotate(-38, bone())), marks: baseBar(20, 96, 3.4) } },
  { id: 'graymane', cat: 4, ja: 'グレイ・メーン家', en: 'THE GRAY-MANE', alt: 'タロス派の名家',
    emblem: { charge: hammer(), marks: flame(30) } },

  // ══ V. 宗教・信仰 ════════════════════════════════ 藍
  { id: 'ninedivines', cat: 5, ja: '九大神聖堂', en: 'THE TEMPLE OF THE NINE DIVINES', alt: '八大神聖堂',
    emblem: { charge: star(9, 42, 17) } },
  { id: 'auriel', cat: 5, ja: 'アーリエルの聖堂', en: 'THE CHANTRY OF AURI-EL', alt: 'スノーエルフの信仰', extinct: true,
    emblem: { field: rays(12, 26, 47, 4), charge: sunDisc(18) } },
  { id: 'moth', cat: 5, ja: 'モスプリースト', en: 'THE ORDER OF THE MOTH', alt: '星霜の書の読み手',
    emblem: { charge: book(), marks: wing(20, 34) } },
  { id: 'tribunal', cat: 5, ja: 'トリビュナル寺院', en: 'THE TRIBUNAL TEMPLE', alt: 'モロウウィンドの三神', extinct: true,
    emblem: { field: ring(40, 2.6), charge: J(star(3, 30, 12), dots(0, 120, 240)) } },

  // ══ VI. 秘教・カルト ═════════════════════════════ 紫黒
  { id: 'namira', cat: 6, ja: 'ナミラ信者', en: 'THE CULT OF NAMIRA', alt: '腐肉の宴',
    emblem: { charge: spider() } },
  { id: 'miraak', cat: 6, ja: 'ミラークのカルト', en: 'THE CULT OF MIRAAK', alt: '最初のドヴァキン',
    emblem: { field: tentacles(5, 16, 44), charge: mask({ horns: 0, slits: 1 }) } },
  { id: 'dragoncult', cat: 6, ja: 'ドラゴン教団', en: 'THE DRAGON CULT', alt: 'ドラゴンプリースト', extinct: true,
    emblem: { charge: mask({ horns: 1, slits: 2 }) } },
  { id: 'glenmoril', cat: 6, ja: 'グレンモリルの魔女', en: 'THE GLENMORIL WITCHES', alt: 'ヘイグレイヴン',
    emblem: { field: moon(21, 12, 40), charge: urn() } },
  { id: 'mythicdawn', cat: 6, ja: '神話の夜明け残党', en: 'THE REMNANTS OF THE MYTHIC DAWN', alt: 'メエルーンズ・デイゴンの徒',
    emblem: { field: rays(4, 20, 47, 7, 45), charge: star(4, 34, 9) } },
  { id: 'peryite', cat: 6, ja: 'ペライトの信者', en: 'THE CULT OF PERYITE', alt: '疫病の守護者',
    emblem: { charge: spiral(2.2, 36, 6.5) } },
  { id: 'idealmasters', cat: 6, ja: '理想の支配者', en: 'THE IDEAL MASTERS', alt: 'ソウル・ケルンの主',
    emblem: { charge: gem(34) } },
  { id: 'daedriccults', cat: 6, ja: '各デイドラ王の信徒団', en: 'THE CULTS OF THE DAEDRIC PRINCES', alt: '十六の王',
    emblem: { field: rays(16, 28, 47, 4.2), charge: J(ring(26, 6), circle(60, 60, 11, 1)) } },

  // ══ VII. 部族・辺境・その他 ═══════════════════════ 土色
  { id: 'skaal', cat: 7, ja: 'スカール族', en: 'THE SKAAL', alt: '全ての創造主に仕える民',
    emblem: { field: ring(40, 2.6), charge: antlers(2) } },
  { id: 'redoran', cat: 7, ja: 'ハウス・レドラン', en: 'HOUSE REDORAN', alt: '名誉の家',
    emblem: { charge: chitin() } },
  { id: 'telvanni', cat: 7, ja: 'ハウス・テルヴァンニ', en: 'HOUSE TELVANNI', alt: '魔術師の家',
    emblem: { charge: mushroom() } },
  { id: 'orcstrongholds', cat: 7, ja: 'オークの砦', en: 'THE ORC STRONGHOLDS', alt: 'マラキャスの民',
    emblem: { charge: J(tusk(1), tusk(-1)), marks: baseBar(22, 94, 4) } },
  { id: 'khajiitcaravans', cat: 7, ja: 'キャジートのキャラバン', en: 'THE KHAJIIT CARAVANS', alt: '月に生まれる民',
    emblem: { charge: twinMoons() } },
  { id: 'riekling', cat: 7, ja: 'リークリング族', en: 'THE RIEKLINGS', alt: '氷の小人',
    emblem: { charge: J(rotate(22, bar(60, 98, 60, 24, 9, 0)), rotate(-22, bar(60, 98, 60, 24, 9, 0))),
      marks: J(rotate(22, poly([[60, 14], [69, 34], [51, 34]])), rotate(-22, poly([[60, 14], [69, 34], [51, 34]]))) } },
  { id: 'bandits', cat: 7, ja: '山賊諸派', en: 'THE BANDIT CLANS', alt: '街道の徒',
    emblem: { charge: J(rotate(28, axe()), rotate(-28, axe())) } },
  { id: 'alduin', cat: 7, ja: 'アルドゥインの竜群', en: 'THE DRAGONS OF ALDUIN', alt: '世界を喰らう者の眷属',
    emblem: { charge: serpent() } },
];

export const catOf = (f) => categories.find((c) => c.id === f.cat);
export const byCat = (id) => factions.filter((f) => f.cat === id);

// ── 台割（仕様書 7） ──────────────────────────────
export const plan = [
  { n: 1,  ja: '表紙・扉',            pages: 2 },
  { n: 2,  ja: '序（編集者の言葉）',   pages: 1 },
  { n: 3,  ja: '読み方・凡例',         pages: 2, note: '仕様書 8 の追加提案を採用。記号体系の凡例を巻頭に置く。' },
  { n: 4,  ja: '全体相関図',           pages: 2, note: '【最重要】全 49 組織を一望する関係図。' },
  { n: 5,  ja: '勢力分布図',           pages: 2 },
  { n: 6,  ja: '年表',                pages: 2, note: '白金協定・マルカルス事件・大戦・竜の帰還。' },
  { n: 7,  ja: '本編（分類 I〜VII）',   pages: 80 },
  { n: 8,  ja: '門戸・排他関係一覧表',  pages: 2, note: '原仕様「加入可否」を改称。' },
  { n: 9,  ja: '人物索引',             pages: 2 },
  { n: 10, ja: '総索引',              pages: 2 },
  { n: 11, ja: '追記欄',              pages: 4, note: '仕様書 8 の追加提案を採用。読者が書き込む白紙。' },
  { n: 12, ja: '奥付',                pages: 1 },
];
