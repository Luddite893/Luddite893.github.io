// 相関図　第二版　——　札の文言と、主題ごとの配置
//
// ── なぜ書き下ろすか ──────────────────────────────
// 初版の相関図は、紋章と線だけで関係を表していた。
// 読む側は「この紋章は何か」「この線は何か」を二度とも凡例に戻って
// 確かめねばならず、図の上で完結しない。
//
// ご提示の相関図が読みやすいのは、**札の中で人物が説明されている**からである。
// 顔・名・肩書の三つが札の中にあるので、凡例に戻る必要がない。
// 本書の札も同じ構えにする。紋章・組織名・肩書・所在の四つを札に入れる。
//
// 肩書は八字以内。所在は七字以内。これ以上は札が破綻する。

export const ROLE = {
  // ── I　職能結社 ──
  companions:      { role: '傭兵団',        where: 'ホワイトラン' },
  thieves:         { role: '窃盗組織',      where: 'リフテン' },
  nightingale:     { role: '守護者 三名',   where: '黄昏の墓所' },
  brotherhood:     { role: '暗殺結社',      where: 'ファルクリース' },
  winterhold:      { role: '魔術の学院',    where: 'ウィンターホールド' },
  bards:           { role: '詩と楽の学舎',  where: 'ソリチュード' },
  blades:          { role: '皇帝の旧親衛',  where: '拠点を失う' },
  dawnguard:       { role: '吸血鬼狩り',    where: 'リフト領の砦' },
  volkihar:        { role: '吸血鬼の血族',  where: '氷結湖の城' },
  greybeards:      { role: '声を修める者',  where: '世界の喉' },

  // ── II　国家・軍事 ──
  legion:          { role: '帝国の常備軍',  where: 'ソリチュード' },
  stormcloaks:     { role: '反乱勢力',      where: 'ウィンドヘルム' },
  thalmor:         { role: '自治領の機構',  where: '大使館' },
  penitus:         { role: '皇帝直属の目',  where: 'ドーンスター' },
  moot:            { role: '九領の合議',    where: '招集は停止' },
  eastempire:      { role: '勅許の商会',    where: 'ウィンドヘルム' },

  // ── III　敵対組織 ──
  silverhand:      { role: '狼憑きの狩人',  where: '複数の砦' },
  vigilants:       { role: 'デイドラ追跡',  where: '本部は焼失' },
  forsworn:        { role: 'リーチの民',    where: '山地の野営' },
  psijic:          { role: '最古の術者',    where: '島は消えた' },
  synod:           { role: '帝国後援の術者', where: '帝都' },
  whispers:        { role: '実在が未確定',  where: '不明' },
  moragtong:       { role: '令状の暗殺者',  where: 'モロウウィンド' },
  alikr:           { role: '砂漠の傭兵',    where: '州内を移動' },
  shadows:         { role: '隠密（推定）',  where: '不明' },

  // ── IV　商業・名家 ──
  blackbriar:      { role: '蜂蜜酒の家',    where: 'リフテン' },
  silverblood:     { role: '銀鉱と獄の家',  where: 'マルカルス' },
  battleborn:      { role: '帝国派の名家',  where: 'ホワイトラン' },
  graymane:        { role: '鍛冶の名家',    where: 'ホワイトラン' },

  // ── V　宗教・信仰 ──
  ninedivines:     { role: '公認の教団',    where: 'ソリチュード' },
  auriel:          { role: '雪の民の祭祀',  where: '忘れられた谷' },
  moth:            { role: '星霜の書の僧',  where: '常設拠点なし' },
  tribunal:        { role: '三神の教団',    where: 'モロウウィンド' },

  // ── VI　秘教・カルト ──
  namira:          { role: '共食の信徒',    where: '地下祠堂' },
  miraak:          { role: '石を築く者',    where: 'ソルスセイム' },
  dragoncult:      { role: '竜を奉じた祭祀', where: '各地の墳墓' },
  glenmoril:       { role: '呪いの姉妹',    where: 'リーチの洞窟' },
  mythicdawn:      { role: '教典の残党',    where: '潜伏' },
  peryite:         { role: '疫病の信徒',    where: '州内の廃坑' },
  idealmasters:    { role: '魂を買う者',    where: 'ソウル・ケルン' },
  daedriccults:    { role: '十六の信徒団',  where: '各地の祭壇' },

  // ── VII　部族・辺境・その他 ──
  skaal:           { role: '北岸の民',      where: 'ソルスセイム' },
  redoran:         { role: '名誉の大家',    where: 'モロウウィンド' },
  telvanni:        { role: '術者の大家',    where: 'ソルスセイム' },
  orcstrongholds:  { role: '自治の集落',    where: '州内の砦' },
  khajiitcaravans: { role: '巡回の隊商',    where: '市門の外' },
  riekling:        { role: '雪原の民',      where: 'ソルスセイム' },
  bandits:         { role: '街道の略奪者',  where: '廃砦' },
  alduin:          { role: '復活した竜',    where: '各地の墳墓' },

  // ── VIII　領邦・宮廷 ──
  // 領の肩書は「何の領か」ではなく「何で立っている領か」を書く。
  // 九つを並べたときに、産と位置の違いが札の上で読めるようにするためである。
  holdHaafingar:   { role: '港と州都',      where: 'ソリチュード' },
  holdEastmarch:   { role: '最古の石の市',  where: 'ウィンドヘルム' },
  holdWhiterun:    { role: '街道の交点',    where: 'ホワイトラン' },
  holdReach:       { role: '銀と峡谷',      where: 'マルカルス' },
  holdRift:        { role: '湖と分岐',      where: 'リフテン' },
  holdFalkreath:   { role: '森と墓地',      where: 'ファルクリース' },
  holdPale:        { role: '凍らぬ港',      where: 'ドーンスター' },
  holdWinterhold:  { role: '崩れた市',      where: 'ウィンターホールド' },
  holdHjaalmarch:  { role: '湿地の杭',      where: 'モーサル' },
};

// ── 主題別相関図 ─────────────────────────────────
//
// 分類は「その組織が何であるか」による区分であって、
// 「何が起きているか」による区分ではない。
// 内戦を追いたい読者は、分類 II の頁だけを見ても事情を掴めない。
// 名家も、教団も、隊商も内戦の中にいるからである。
//
// そこで主題ごとの図を別に立てる。**札の位置は一枚ずつ手で決めている。**
// 力学的な自動配置を使わないのは、線が交差しない配置を機械が見つけられないためである。
//
// col は 0/1/2（左・中・右）、row は 0 から。座標は relmap.mjs が決める。

export const THEMES = [
  {
    key: 'civilwar',
    n: '一',
    ja: '内戦',
    en: 'BELLVM CIVILE',
    lead: '白金協定によるタロス信仰の禁圧を契機として、四E一七六年に始まった。'
      + '当事者は二つだが、この二つだけを見ても事情は掴めない。'
      + '協定を書かせた側、履行を強いられる側、そのどちらにも属さぬまま巻き込まれた家がある。',
    nodes: [
      { id: 'thalmor',     col: 1, row: 0 },
      { id: 'legion',      col: 0, row: 2 },
      { id: 'stormcloaks', col: 2, row: 2 },
      { id: 'eastempire',  col: 0, row: 4 },
      { id: 'moot',        col: 1, row: 4 },
      { id: 'graymane',    col: 2, row: 4 },
      { id: 'bandits',     col: 0, row: 6 },
      { id: 'bards',       col: 1, row: 6 },
      { id: 'battleborn',  col: 2, row: 6 },
    ],
    note: '「ムート」は九領の首長による合議体で、上級王の空位に際して後継を選ぶ。'
      + '内戦の当事者双方が自らを上級王と称しているため、'
      + '空位であるか否かの判定そのものが争点となり、招集が二十五年止まっている。',
  },
  {
    key: 'talos',
    n: '二',
    ja: '信仰の禁圧',
    en: 'DE CVLTV PROHIBITO',
    lead: '協定は、禁圧の執行を帝国自身に負わせる形で書かれている。'
      + '自治領は監視のみを担い、実兵力を割いていない。'
      + 'この構図が、以下のすべての関係を規定している。',
    nodes: [
      { id: 'thalmor',     col: 1, row: 0 },
      { id: 'legion',      col: 0, row: 2 },
      { id: 'ninedivines', col: 2, row: 2 },
      { id: 'blades',      col: 0, row: 4 },
      { id: 'graymane',    col: 2, row: 4 },
      { id: 'winterhold',  col: 1, row: 6 },
      { id: 'psijic',      col: 0, row: 6 },
      { id: 'alikr',       col: 2, row: 6 },
      { id: 'stormcloaks', col: 1, row: 8 },
    ],
    note: '九大神聖堂は公式の祭祀からタロスを除いたが、'
      + '州内の聖堂では第九の壇が空席のまま掃き清められている。'
      + '撤去した聖堂は州内に一つも無い。監視する側もこれを把握したうえで、措置を取っていない。',
  },
  {
    key: 'dragon',
    n: '三',
    ja: '竜の帰還',
    en: 'DE REDITV DRACONVM',
    lead: '四E二〇一年、墳墓からの復活が始まる。'
      + '復活が一定の順序で進んでいることが、これを竜の群れではなく統率された集団と見る根拠である。'
      + '竜をめぐる知識は、三つの系統に分かれて保たれてきた。',
    nodes: [
      { id: 'alduin',      col: 1, row: 0 },
      { id: 'dragoncult',  col: 0, row: 2 },
      { id: 'miraak',      col: 2, row: 2 },
      { id: 'greybeards',  col: 0, row: 4 },
      { id: 'skaal',       col: 2, row: 4 },
      { id: 'blades',      col: 0, row: 6 },
      { id: 'moth',        col: 2, row: 6 },
      { id: 'legion',      col: 1, row: 6 },
    ],
    note: 'ブレイズとグレイビアードは、同じ竜の知識を持ちながら反目している。'
      + '争点は知識の中身ではなく、声を武器として扱うか否かである。',
  },
  {
    key: 'blood',
    n: '四',
    ja: '血と呪い',
    en: 'SANGVIS ET MALEDICTIO',
    lead: '血によって受け継がれ、血によってしか解けないとされる関係を集めた。'
      + 'いずれも、与えた側と負う側が現在も生きている。',
    nodes: [
      { id: 'glenmoril',   col: 1, row: 0 },
      { id: 'companions',  col: 0, row: 2 },
      { id: 'forsworn',    col: 2, row: 2 },
      { id: 'silverhand',  col: 0, row: 4 },
      { id: 'silverblood', col: 2, row: 4 },
      { id: 'volkihar',    col: 1, row: 6 },
      { id: 'dawnguard',   col: 0, row: 6 },
      { id: 'vigilants',   col: 2, row: 6 },
      { id: 'idealmasters', col: 1, row: 8 },
      { id: 'auriel',      col: 0, row: 8 },
    ],
    note: '同胞団の内円が負う血は、グレンモリルの魔女の系統に遡る。'
      + 'シルバーハンドはその血を狩る側にあり、'
      + '銀の調達をシルバー・ブラッド家に依存している。'
      + '与える者・負う者・狩る者・銀を売る者が、一本の線でつながっている。',
  },
  {
    key: 'theft',
    n: '五',
    ja: '盗みと負債',
    en: 'FVRTVM ET DEBITVM',
    lead: '銭で動く関係を集めた。'
      + 'この主題では、敵対よりも黙認のほうが強い結びつきとして働いている。',
    nodes: [
      { id: 'thieves',      col: 1, row: 0 },
      { id: 'nightingale',  col: 0, row: 0 },
      { id: 'blackbriar',   col: 2, row: 2 },
      { id: 'eastempire',   col: 0, row: 2 },
      { id: 'legion',       col: 1, row: 4 },
      { id: 'silverblood',  col: 2, row: 4 },
      { id: 'khajiitcaravans', col: 0, row: 5 },
      { id: 'bandits',      col: 1, row: 6 },
      { id: 'orcstrongholds', col: 2, row: 6 },
    ],
    note: '盗賊ギルドとブラック・ブライア家のあいだに、文書による取り決めは無い。'
      + '家の帳簿には「例年どおり」とのみ記された支出が、毎年同じ月に計上されている。'
      + '名指しは無く、額も動かない。',
  },
  {
    key: 'record',
    n: '六',
    ja: '記録と知',
    en: 'LITTERAE ET SCIENTIA',
    lead: '知識を持つ組織のあいだの関係は、ほとんどが「写しを渡すか否か」に帰着する。'
      + '争点は所蔵ではなく、持ち出しの可否である。',
    nodes: [
      { id: 'winterhold',  col: 1, row: 0 },
      { id: 'psijic',      col: 0, row: 0 },
      { id: 'synod',       col: 2, row: 2 },
      { id: 'moth',        col: 0, row: 2 },
      { id: 'thalmor',     col: 1, row: 4 },
      { id: 'legion',      col: 2, row: 4 },
      { id: 'blades',      col: 0, row: 5 },
      { id: 'dragoncult',  col: 1, row: 6 },
      { id: 'mythicdawn',  col: 2, row: 6 },
    ],
    note: 'ウィンターホールド大学はモスプリーストには写しを渡し、サイノッドには渡さない。'
      + '書庫番の言によれば、基準は「持ち出さぬからである」の一点にある。'
      + 'この基準は成文化されていない。',
  },
  {
    key: 'faith',
    n: '七',
    ja: '容認されざる祭祀',
    en: 'MYSTERIA ILLICITA',
    lead: '公認された祭祀の外にある信仰と、それを追う側を並べた。'
      + '追う側の拠点が失われて以後、摘発の実務を担う組織は州内に無い。',
    nodes: [
      { id: 'daedriccults', col: 1, row: 0 },
      { id: 'vigilants',    col: 0, row: 2 },
      { id: 'ninedivines',  col: 2, row: 2 },
      { id: 'namira',       col: 0, row: 4 },
      { id: 'mythicdawn',   col: 1, row: 4 },
      { id: 'peryite',      col: 2, row: 4 },
      { id: 'brotherhood',  col: 0, row: 6 },
      { id: 'moragtong',    col: 1, row: 6 },
      { id: 'idealmasters', col: 2, row: 6 },
      { id: 'tribunal',     col: 1, row: 8 },
    ],
    note: '十六の信徒団は互いに連絡を持たない。'
      + 'これを一つにまとめたのは信徒の側ではなく、摘発する側である。'
      + '本書の一項も、その束を引き継いでいる。',
  },
  {
    key: 'frontier',
    n: '八',
    ja: '辺境と部族',
    en: 'GENTES ET FINES',
    lead: '国家に属さない集団と、その周囲を並べた。'
      + '共通するのは、外の法が名目上しか及んでいないという一点である。',
    nodes: [
      { id: 'skaal',           col: 0, row: 0 },
      { id: 'miraak',          col: 1, row: 0 },
      { id: 'telvanni',        col: 2, row: 0 },
      { id: 'riekling',        col: 0, row: 2 },
      { id: 'redoran',         col: 2, row: 2 },
      { id: 'tribunal',        col: 1, row: 3 },
      { id: 'orcstrongholds',  col: 0, row: 5 },
      { id: 'legion',          col: 1, row: 5 },
      { id: 'khajiitcaravans', col: 2, row: 5 },
      { id: 'bandits',         col: 1, row: 7 },
    ],
    note: 'オークの砦は帝国の徴募の対象から外されている。'
      + '外した理由を記した文書は無い。'
      + '砦の側は「砦の掟は帝国の法より古い。だから帝国の法のほうが譲る」と述べる。',
  },
  {
    key: 'holds',
    n: '九',
    ja: '九領の帰属',
    en: 'PRAEFECTVRAE',
    lead: '九つの領が、内戦においてどちらに立っているかを一枚にした。'
      + '四領が帝国、四領がストームクローク、一領が中立である。'
      + 'ただし帰属の言い方には領ごとに幅があり、'
      + '与すると書いた文書がそのまま与したことを意味するとは限らない。'
      + '数の上では拮抗しているが、四領の側と四領の側では、'
      + '兵の数も港の数も産の量も等しくない。'
      + 'この図が示すのは勢力の均衡ではなく、帰属の分かれ方そのものである。',
    // 左が帝国の側、右が蜂起の側。
    // 中央には、ムートと、**帰属の言い方に留保がついた三領**を置いた。
    // ホワイトランは与せず、ファルクリースは一年以上遅れて表明し、
    // モーサルは与すると書いた同じ文書の中で自らの選択を疑っている。
    nodes: [
      { id: 'legion',          col: 0, row: 0 },
      { id: 'moot',            col: 1, row: 0 },
      { id: 'stormcloaks',     col: 2, row: 0 },
      { id: 'holdHaafingar',   col: 0, row: 2 },
      { id: 'holdEastmarch',   col: 2, row: 2 },
      { id: 'holdReach',       col: 0, row: 4 },
      { id: 'holdPale',        col: 2, row: 4 },
      { id: 'holdRift',        col: 0, row: 6 },
      { id: 'holdWinterhold',  col: 2, row: 6 },
      { id: 'holdWhiterun',    col: 1, row: 3 },
      { id: 'holdFalkreath',   col: 1, row: 5 },
      { id: 'holdHjaalmarch',  col: 1, row: 7 },
    ],
    note: 'ムートは九領の首長による合議体であり、九領のすべてが席を持つ。'
      + 'したがって九本の従属の線は、どれか一本でも欠ければムートが成立しないことを示している。'
      + '中央の三領は、帰属の言い方に留保のついた領である。'
      + 'ホワイトランはいずれとも反目にとどまり、'
      + 'ファルクリースは表明が一年以上遅れ、'
      + 'モーサルは与すると書いた同じ文書の中で自らの選択を疑っている。'
      + 'ホワイトランの中立は理念の表明ではなく、位置の結果でもある。'
      + '九領のうちでこの領だけが、両側の街道の交点に立っている。'
      + 'なお、この一枚は領に関わる線だけを引いている。'
      + '帝国軍とストームクロークのあいだの線は主題一「内戦」に出る。'
      + '両方を一枚に載せると、中央の二枚の札が線に埋もれる。',
    // 領に関わる辺だけに絞る。帝国軍は辺を十七本持つので、
    // 絞らないと札の背が八十ミリを超え、図が版面から出る。
    focus: new Set([
      'holdHaafingar', 'holdEastmarch', 'holdWhiterun', 'holdReach', 'holdRift',
      'holdFalkreath', 'holdPale', 'holdWinterhold', 'holdHjaalmarch',
    ]),
    pitch: 9.8, top: 29,
  },
];
