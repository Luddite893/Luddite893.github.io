// 年表（2P）
//
// 仕様書 8：巻末付録に年表 2P。
//
// 年表の役目は、本編の各項に散らばった年号を一本の線に戻すことである。
// だから項目は「事件」ではなく「本書のどの項に効いたか」で選ぶ。
// 効いた項の番号を各行に添えるので、年表から本編へ引ける。
// 逆に、有名だが本書のどの項も動かさない事件は落とす。

export const eras = [
  { id: 'me', ja: 'メレシック紀', note: '紀年は伝承による。年の特定はできない。' },
  { id: 'e1', ja: '第一紀',       note: '' },
  { id: 'e2', ja: '第二紀',       note: '' },
  { id: 'e3', ja: '第三紀',       note: '' },
  { id: 'e4', ja: '第四紀',       note: '本書の記述の現在は 201 年である。' },
];

// year：表示する紀年。refs：関係する項（faction の id）。
export const events = [
  { era: 'me', year: '—', text: '竜が世を統べ、竜司祭が地上の統治にあたる。竜教団の成立。', refs: ['dragoncult', 'alduin'] },
  { era: 'me', year: '—', text: '竜戦争。人間側の勝利により竜教団は組織としての機能を失う。', refs: ['dragoncult', 'greybeards'] },
  { era: 'me', year: '—', text: 'イスグラモルと五百人の同志、州へ渡る。のちの同胞団の起源とされる。', refs: ['companions'] },
  { era: 'me', year: '—', text: '雪エルフの一部が地下へ退く。アーリエルの聖堂はこの時期に閉ざされたと伝わる。', refs: ['auriel'] },

  { era: 'e1', year: '68',  text: '高王ハラルド、州を統一する。領の区分が現在の形に近づく。', refs: ['moot'] },
  { era: 'e1', year: '139', text: '同胞団、ホワイトランの丘上にジョラーヴァスクルを建てる。', refs: ['companions'] },
  { era: 'e1', year: '221', text: 'グレイビアード、ハイフロスガーに定まる。以後、外部への関与を絶つ。', refs: ['greybeards'] },
  { era: 'e1', year: '360', text: '吟遊詩人の大学、ソリチュードに置かれる。卒業者への職の斡旋は当初から行わない。', refs: ['bards'] },
  { era: 'e1', year: '416', text: 'モロウウィンドに三柱の生ける神が成立。寺院の権威が確立する。', refs: ['tribunal', 'moragtong'] },
  { era: 'e1', year: '420', text: '大家の体制が固まる。レドランは軍務を、テルヴァンニは術を家風とする。', refs: ['redoran', 'telvanni'] },

  { era: 'e2', year: '321', text: 'モラグ・トング、寺院の認可のもとに処刑令状の発行を始める。', refs: ['moragtong'] },
  { era: 'e2', year: '431', text: '暗殺結社の禁令。令状を持たぬ一派が分岐し、闇の一党を名乗る。', refs: ['brotherhood', 'moragtong'] },
  { era: 'e2', year: '852', text: 'タイバー・セプティム、帝国を建てる。皇帝の刃が親衛と情報を担う。', refs: ['blades', 'penitus'] },

  { era: 'e3', year: '389', text: 'サイジック会、帝国の助言者の座を退く。サイノッドがその位置を占める。', refs: ['psijic', 'synod'] },
  { era: 'e3', year: '427', text: 'レッドマウンテンの変。三柱の神格が失われ、寺院は聖人の崇敬へ移る。', refs: ['tribunal'] },
  { era: 'e3', year: '433', text: 'オブリビオンの動乱。神話の夜明けによる皇帝の暗殺。ブレイズは大半を失う。', refs: ['mythicdawn', 'blades'] },
  { era: 'e3', year: '433', text: '動乱の終結。セプティムの血統が絶える。以後、上級王の権威は各地で揺らぐ。', refs: ['moot', 'legion'] },
  { era: 'e3', year: '433', text: '動乱の後、星霜の書を読み得る写字僧の数が減り続ける。補充の手立ては見つかっていない。', refs: ['moth'] },

  { era: 'e4', year: '5',   text: 'レッドマウンテンの噴火。モロウウィンド荒廃。レドランが避難民の受け入れにあたる。', refs: ['redoran', 'telvanni', 'tribunal'] },
  { era: 'e4', year: '6',   text: 'ソルスセイムがダンマーに割譲される。スカール族と外部との接触が増える。', refs: ['skaal', 'telvanni', 'riekling'] },
  { era: 'e4', year: '16',  text: 'ウィンターホールドの街の大半が海へ落ちる。学院だけが橋の先に残る。', refs: ['winterhold'] },
  { era: 'e4', year: '22',  text: '東帝都社、ソリチュードに支社を置く。州内の海運の実務を握る。', refs: ['eastempire'] },
  { era: 'e4', year: '29',  text: 'サルモール、サマーセットで権力を握る。以後、記録に現れる失踪が増える。', refs: ['thalmor', 'shadows'] },
  { era: 'e4', year: '129', text: 'オークの砦の数が減り始める。砦を離れた者の帰還を認めない慣習が原因として指摘される。', refs: ['orcstrongholds'] },
  { era: 'e4', year: '168', text: 'ヴァレンウッド併合。アルドメリ自治領が成立する。', refs: ['thalmor'] },
  { era: 'e4', year: '171', text: '大戦の開戦。帝国軍は南方に兵を割き、州内の駐屯が薄くなる。', refs: ['legion', 'thalmor'] },
  { era: 'e4', year: '174', text: '帝都の陥落。以後、講和の交渉が始まる。', refs: ['legion', 'penitus'] },
  { era: 'e4', year: '175', text: '白金協定。タロス信仰の禁圧とブレイズの解散が定められる。', refs: ['thalmor', 'blades', 'ninedivines', 'legion'] },
  { era: 'e4', year: '176', text: 'ステンダールの守人、結成。動乱の再発を防ぐことを目的に掲げる。', refs: ['vigilants'] },
  { era: 'e4', year: '176', text: '盗賊ギルドの退潮が始まる。当代の成員はこれを「運が離れた」と説明する。', refs: ['thieves', 'nightingale'] },
  { era: 'e4', year: '180', text: 'ハンマーフェルが帝国から離脱する。州内に現れる傭兵の背景がここにある。', refs: ['alikr'] },
  { era: 'e4', year: '181', text: 'ブラック・ブライア家、リフテンの醸造権を握る。以後、領の実務に食い込む。', refs: ['blackbriar'] },
  { era: 'e4', year: '188', text: 'マルカルスの事変。リーチの蜂起と鎮圧。フォースウォーンの現在の形が定まる。', refs: ['forsworn', 'silverblood'] },
  { era: 'e4', year: '190', text: '街道の治安機構が後退し、廃砦を恒久的に占拠する集団が急増する。', refs: ['bandits', 'legion'] },
  { era: 'e4', year: '195', text: 'ドーンガード、砦を放棄する。再興は 201 年を待つ。', refs: ['dawnguard', 'volkihar'] },
  { era: 'e4', year: '199', text: 'シルバーハンド、砦を複数占拠。同胞団の内円との衝突が記録に現れ始める。', refs: ['silverhand', 'companions'] },
  { era: 'e4', year: '201', text: '高王トリグの死。内戦の開始。ムートは開かれないまま現在に至る。', refs: ['stormcloaks', 'legion', 'moot'] },
  { era: 'e4', year: '201', text: 'ホワイトランの二家、内戦により公然と分かれる。市場を挟んで往来が絶える。', refs: ['battleborn', 'graymane'] },
  { era: 'e4', year: '201', text: '隊商、いずれの都市でも城壁内への立ち入りを認められなくなる。請願は保留のまま。', refs: ['khajiitcaravans'] },
  { era: 'e4', year: '201', text: '竜の帰還。墳墓からの復活が一定の順序で進行していることが確認される。', refs: ['alduin', 'dragoncult', 'greybeards'] },
  { era: 'e4', year: '201', text: 'ドーンガードの再興。ヴォルキハル一族の動きがこれに先立つ。', refs: ['dawnguard', 'volkihar'] },
  { era: 'e4', year: '201', text: 'サイノッドの調査隊、遺跡で消息を絶つ。以後、州内への派遣は途絶えている。', refs: ['synod'] },
  { era: 'e4', year: '201', text: 'ソルスセイムで石を積む者が現れる。積んでいた間の記憶を持たないと証言する。', refs: ['miraak', 'skaal'] },
];

// 各行に添える項番号。年表から本編へ引くための唯一の手がかりである。
export const refNums = (refs, factions) =>
  refs.map((id) => factions.findIndex((f) => f.id === id) + 1).filter((n) => n > 0);

export const stats = () => ({
  events: events.length,
  eras: eras.length,
  refs: new Set(events.flatMap((e) => e.refs)).size,
});
