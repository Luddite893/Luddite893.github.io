// 関係の記述
//
// 仕様書 5：「関係」欄は文章禁止。矢印と記号による関係図。ここが本書の実用価値の中心。
// 仕様書 13-4：関係図だけを追って、勢力の対立構造を理解できるか。
// 仕様書 14-4：全体相関図（49 ノード）の可読性を保つための設計案。
//
// ── 記法 ────────────────────────────────────────
// 関係は五種のみとする。増やすと凡例が本文より長くなり、読者は凡例を覚えない。
//
//   敵対  ══╳══   両端に印を持たない線の中央に、断ちの記号
//   同盟  ═════   二重線
//   従属  ───▶   矢は上位を指す。下位から上位へ向かう。
//   派生  ┈┈┈○   点線。○ の側が母体。
//   反目  ──╲──   競合するが交戦しない関係
//
// 「敵対」と「反目」を分けたのは、この世界では
// **交戦している relation と、席を争っている relation** が別物だからである。
// 帝国軍とストームクロークは前者、サイノッドとウィンターホールド大学は後者。
// 一本の線で書くと、読者は同盟国と競合相手の区別がつかなくなる。

export const KINDS = {
  hostile: { ja: '敵対', mark: 'cross',  dash: null,      w: 0.9 },
  ally:    { ja: '同盟', mark: 'double', dash: null,      w: 0.7 },
  vassal:  { ja: '従属', mark: 'arrow',  dash: null,      w: 0.7 },
  origin:  { ja: '派生', mark: 'circle', dash: '2.4 2.0', w: 0.6 },
  rival:   { ja: '反目', mark: 'slash',  dash: null,      w: 0.6 },
};

// from → to。vassal は from が下位、to が上位。origin は to が母体。
export const edges = [
  // ── 職能結社 ──
  ['companions', 'silverhand', 'hostile'],
  ['companions', 'glenmoril', 'hostile'],
  ['nightingale', 'thieves', 'origin'],
  ['thieves', 'eastempire', 'hostile'],
  ['thieves', 'blackbriar', 'ally'],
  ['brotherhood', 'penitus', 'hostile'],
  ['brotherhood', 'moragtong', 'origin'],
  ['brotherhood', 'daedriccults', 'vassal'],
  ['winterhold', 'psijic', 'origin'],
  ['winterhold', 'synod', 'rival'],
  ['winterhold', 'thalmor', 'hostile'],
  ['bards', 'moot', 'ally'],
  ['blades', 'thalmor', 'hostile'],
  ['blades', 'legion', 'origin'],
  ['blades', 'greybeards', 'rival'],
  ['blades', 'alduin', 'hostile'],
  ['dawnguard', 'volkihar', 'hostile'],
  ['dawnguard', 'auriel', 'ally'],
  ['volkihar', 'vigilants', 'hostile'],
  ['volkihar', 'idealmasters', 'ally'],
  ['greybeards', 'alduin', 'hostile'],
  ['greybeards', 'dragoncult', 'hostile'],

  // ── 国家・軍事 ──
  ['legion', 'stormcloaks', 'hostile'],
  ['legion', 'thalmor', 'vassal'],
  ['legion', 'penitus', 'ally'],
  ['legion', 'eastempire', 'ally'],
  ['legion', 'synod', 'ally'],
  ['legion', 'moth', 'ally'],
  ['legion', 'moot', 'rival'],
  ['legion', 'battleborn', 'ally'],
  ['legion', 'silverblood', 'ally'],
  ['legion', 'bandits', 'hostile'],
  ['legion', 'mythicdawn', 'hostile'],
  ['legion', 'orcstrongholds', 'rival'],
  ['stormcloaks', 'thalmor', 'hostile'],
  ['stormcloaks', 'graymane', 'ally'],
  ['stormcloaks', 'battleborn', 'hostile'],
  ['stormcloaks', 'moot', 'rival'],
  ['thalmor', 'ninedivines', 'hostile'],
  ['thalmor', 'psijic', 'hostile'],
  ['thalmor', 'alikr', 'hostile'],
  ['shadows', 'thalmor', 'vassal'],
  ['khajiitcaravans', 'thalmor', 'vassal'],
  ['eastempire', 'blackbriar', 'rival'],

  // ── 敵対組織 ──
  ['vigilants', 'daedriccults', 'hostile'],
  ['vigilants', 'namira', 'hostile'],
  ['vigilants', 'ninedivines', 'origin'],
  ['forsworn', 'silverblood', 'hostile'],
  ['forsworn', 'glenmoril', 'ally'],
  ['synod', 'moth', 'rival'],
  ['moragtong', 'tribunal', 'vassal'],
  ['whispers', 'penitus', 'rival'],

  // ── 商業・名家 ──
  ['graymane', 'battleborn', 'hostile'],
  ['silverblood', 'forsworn', 'hostile'],

  // ── 宗教・信仰 ──
  ['ninedivines', 'daedriccults', 'hostile'],
  ['auriel', 'ninedivines', 'rival'],
  ['moth', 'winterhold', 'ally'],
  ['tribunal', 'redoran', 'vassal'],
  ['tribunal', 'telvanni', 'vassal'],

  // ── 秘教・カルト ──
  ['namira', 'daedriccults', 'origin'],
  ['miraak', 'dragoncult', 'origin'],
  ['miraak', 'skaal', 'hostile'],
  ['miraak', 'alduin', 'rival'],
  ['dragoncult', 'alduin', 'vassal'],
  ['mythicdawn', 'daedriccults', 'origin'],
  ['peryite', 'daedriccults', 'origin'],
  ['idealmasters', 'daedriccults', 'rival'],
  ['glenmoril', 'forsworn', 'ally'],

  // ── 部族・辺境・その他 ──
  ['skaal', 'riekling', 'hostile'],
  ['redoran', 'telvanni', 'rival'],
  ['orcstrongholds', 'bandits', 'hostile'],
  ['khajiitcaravans', 'bandits', 'hostile'],
  ['alduin', 'skaal', 'hostile'],
];

// 指定した組織に接続する辺だけを取り出す。
export const edgesOf = (id) =>
  edges.filter(([a, b]) => a === id || b === id)
       .map(([a, b, k]) => (a === id ? { other: b, kind: k, out: true } : { other: a, kind: k, out: false }));

// 次数。何と敵対しているかの数。全体相関図の外周に打つ。
export const hostileDegree = (id) =>
  edges.filter(([a, b, k]) => k === 'hostile' && (a === id || b === id)).length;

export const stats = () => {
  const c = {};
  for (const [, , k] of edges) c[k] = (c[k] || 0) + 1;
  return { total: edges.length, byKind: c };
};
