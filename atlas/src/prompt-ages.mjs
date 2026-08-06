// 人物図版の年齢帯
//
// ── なぜ別のファイルに持つか ────────────────────────
// **年齢は記録に無い。** records に書き込めば、本書が知らないことを
// 記録として主張することになる。だから指示文の側にだけ持つ。
// 凡例にも「顔と年頃は画工の構成であって、記録の主張ではない」と断ってある。
//
// ── なぜ数で書くか ─────────────────────────────
// 発注者様のご指摘のとおり、'deeply aged, lined skin' のような形容だけでは
// 中年程度に落ち着く。'past seventy' のように数を書くと、加齢が確実に出る。
//
// ── なぜ役から機械で引かないか ─────────────────────
// 一度は役の語（先代・長老・弟子…）から引く形にした。百七十四名のうち
// 当たったのは九名で、しかも一名を取り違えた。
// エリシフの役は「先代トリグの妻」である。「先代」に当たるが、
// 老いているのは夫のほうであって、本人は若い。
// 語の一致では、係り先が判らない。だから一名ずつ書く。
//
// ── 帯 ────────────────────────────────────────
// in their twenties / thirties / forties / fifties / past sixty / past seventy
// 人でない者・年齢の意味を持たない者は null。年齢の行を落とす。

const T20 = 'in their twenties';
const T30 = 'in their thirties';
const T40 = 'in their forties';
const T50 = 'in their fifties';
const T60 = 'past sixty';
const T70 = 'past seventy';

export const AGE = {
  // ── I 職能結社 ──
  'companions-1': T60,  // ハービンジャー。先代の長
  'companions-2': T30,  // 内円。双子の兄
  'companions-3': T30,  // 内円。狩人
  'thieves-1': T50,     // 第二席。外部との交渉
  'thieves-2': T50,     // 頭目
  'thieves-3': T30,     // 錠前の名手
  'nightingale-1': T40,
  'nightingale-2': T50,  // 先任。殺害される
  'nightingale-3': T50,  // 盟約を破った者
  'brotherhood-1': T40,  // 聖域の長
  'brotherhood-2': T50,  // 守り手。古い系統
  'brotherhood-3': T40,  // 会計
  'winterhold-1': T60,   // 学長
  'winterhold-2': T50,   // 教頭
  'winterhold-3': T60,   // 書庫番
  'bards-1': T50,        // 学長
  'bards-2': T60,        // 弦楽の師。古謡の暗誦
  'bards-3': T50,        // 史学の師
  'blades-1': T50,       // 生き残り
  'blades-2': T70,       // 記録官。位置を記憶する
  'blades-3': T60,       // 第三紀の宗匠
  'dawnguard-1': T50,    // 創設者
  'dawnguard-2': T30,    // 製作
  'dawnguard-3': T30,    // 追跡
  'volkihar-1': T60,     // 当主。齢は外見に現れないが、風格として採る
  'volkihar-2': T20,     // 当主の娘
  'volkihar-3': T50,     // 当主の妻
  'greybeards-1': T70,   // 応対を担う
  'greybeards-2': T70,   // 沈黙の戒
  'greybeards-3': T70,   // 書による応対
  // ── II 国家・軍事 ──
  'legion-1': T50,       // 将軍
  'legion-2': T40,       // 副官
  'legion-3': T20,       // 兵長
  'stormcloaks-1': T40,  // 首長。蜂起の首謀
  'stormcloaks-2': T60,  // 副将
  'stormcloaks-3': T30,  // 募兵
  'thalmor-1': T50,      // 第一使節
  'thalmor-2': T40,      // 尋問官
  'thalmor-3': T40,      // 派遣顧問
  'penitus-1': T50,      // 司令官
  'penitus-2': T30,      // 前線要員
  'penitus-3': T20,      // 司令官の子
  'moot-1': T50,         // ホワイトラン首長
  'moot-2': T20,         // ハーフィンガル首長。先代の妻であって、本人は若い
  'moot-3': T60,         // リフト首長
  'eastempire-1': T50,   // 州内代理人
  'eastempire-2': T40,   // 船長
  'eastempire-3': T30,   // 支社の長
  // ── III 敵対組織 ──
  'silverhand-1': T40,
  'silverhand-2': T30,
  'silverhand-3': T40,
  'vigilants-1': T50,    // 守人の長
  'vigilants-2': T30,    // 巡回
  'vigilants-3': T30,    // 捜索
  'forsworn-1': T60,     // リーチの王を称する
  'forsworn-2': T20,     // 斥候
  'forsworn-3': T70,     // 祭祀を司る
  'psijic-1': T40,       // 来訪者。エルフ。齢は容貌に出ない
  'psijic-2': T40,       // 警告を伝えた者
  'psijic-3': T70,       // 儀式長。第二紀からの者
  'synod-1': T50,        // 調査隊長
  'synod-2': T40,        // 助手。生存者
  'synod-3': T40,        // 使節
  'whispers-1': null,    // 実在が未確認。年齢の主張をしない
  'whispers-2': T40,     // 被告
  'whispers-3': T40,     // 密告者と目された者
  'moragtong-1': T50,    // 令状執行者
  'moragtong-2': T60,    // 書記
  'moragtong-3': T70,    // 残存の一人
  'alikr-1': T40,        // 一隊の長
  'alikr-2': T30,
  'alikr-3': T30,
  'shadows-1': null,     // 背丈のみ一致する。顔は伝わっていない
  'shadows-2': T30,      // 失踪者の同行者
  'shadows-3': T30,      // 模倣と判定された者
  // ── IV 商業・名家 ──
  'blackbriar-1': T60,   // 当主
  'blackbriar-2': T30,   // 長子
  'blackbriar-3': T20,   // 次女
  'silverblood-1': T60,  // 当主
  'silverblood-2': T50,  // 鉱山の管理
  'silverblood-3': T50,  // 当主の妻
  'battleborn-1': T60,   // 当主
  'battleborn-2': T30,   // 長子
  'battleborn-3': T20,   // 当主の娘
  'graymane-1': T60,     // 鍛冶。天空炉を使う
  'graymane-2': T50,     // 当主の妻
  'graymane-3': T70,     // 一族の長老
  // ── V 宗教・信仰 ──
  'ninedivines-1': T60,  // 司祭。埋葬を司る
  'ninedivines-2': T20,  // エリシフ。ソリチュードと同一人
  'ninedivines-3': T40,  // マーラの司祭
  'auriel-1': T70,       // 最後の騎士を称する
  'auriel-2': T70,       // 大司祭
  'auriel-3': T60,       // 巡礼者
  'moth-1': T50,         // 解読僧。失明
  'moth-2': T70,         // 先任の解読僧
  'moth-3': T40,         // 写字僧
  'tribunal-1': T50,     // 三柱の一。神格を失った後の姿として採る
  'tribunal-2': T50,
  'tribunal-3': T50,
  // ── VI 秘教・カルト ──
  'namira-1': T50,       // 祠堂の司祭
  'namira-2': T40,       // 会衆の一人
  'namira-3': T60,       // 祠堂の管理者
  'miraak-1': T50,       // 初代の竜司祭。仮面の下は伝わっていないが、姿として採る
  'miraak-2': T40,       // 使徒
  'miraak-3': T30,       // 石工。労役に就く
  'dragoncult-1': null,  // 竜司祭。仮面が顔である
  'dragoncult-2': null,
  'dragoncult-3': null,
  'glenmoril-1': T70,    // 姉妹。いずれも老いた姿で伝わる
  'glenmoril-2': T70,
  'glenmoril-3': T70,
  'mythicdawn-1': T50,   // 開祖
  'mythicdawn-2': T30,   // 信徒の子孫
  'mythicdawn-3': T40,   // 潜伏する信徒
  'peryite-1': T40,      // 祭壇の守り手
  'peryite-2': T50,      // 参籠者。罹患したまま留まる
  'peryite-3': T40,      // 記録者
  'idealmasters-1': null,  // 結晶体。人ではない
  'idealmasters-2': null,
  'idealmasters-3': null,
  'daedriccults-1': T30,
  'daedriccults-2': T40,
  'daedriccults-3': T40,
  // ── VII 部族・辺境・その他 ──
  'skaal-1': T70,        // 賢者
  'skaal-2': T30,        // 狩人
  'skaal-3': T50,        // 鍛冶
  'redoran-1': T60,      // 評議員
  'redoran-2': T40,      // 守備隊長
  'redoran-3': T60,      // 第一顧問
  'telvanni-1': T70,     // 魔術師。塔を持つ
  'telvanni-2': T20,     // 弟子
  'telvanni-3': T40,     // 家令
  'orcstrongholds-1': T50,  // 族長
  'orcstrongholds-2': T40,  // 鍛冶
  'orcstrongholds-3': T50,  // 別の砦の族長
  'khajiitcaravans-1': T50, // 隊商の長
  'khajiitcaravans-2': T40, // 呪具を扱う
  'khajiitcaravans-3': T40, // 別の隊商の長
  'riekling-1': null,    // 人ではない
  'riekling-2': null,
  'riekling-3': null,
  'bandits-1': T40,      // 砦の頭目
  'bandits-2': T30,      // 解隊された兵
  'bandits-3': T50,      // 没落した農民
  'alduin-1': null,      // 竜
  'alduin-2': null,
  'alduin-3': null,
  // ── VIII 領邦・宮廷 ──
  'holdHaafingar-1': T20,  // エリシフ。先代の妻。老いているのは夫のほうである
  'holdHaafingar-2': T70,  // 執政。先代の代から同じ職にある
  'holdHaafingar-3': T30,  // 護衛官
  'holdEastmarch-1': T40,  // 首長。蜂起の首謀
  'holdEastmarch-2': T50,  // 執政
  'holdEastmarch-3': T60,  // 副将
  'holdWhiterun-1': T50,   // 首長
  'holdWhiterun-2': T60,   // 執政。帝国の出
  'holdWhiterun-3': T40,   // 護衛官
  'holdReach-1': T30,      // 首長。父を蜂起で失って座に着いた
  'holdReach-2': T40,      // 護衛官
  'holdReach-3': T70,      // 宮廷魔術師。遺構の解読を続ける
  'holdRift-1': T60,       // 首長
  'holdRift-2': T50,       // 執政
  'holdRift-3': T50,       // 衛兵長
  'holdFalkreath-1': T50,  // 首長
  'holdFalkreath-2': T40,  // 執政。ボズマー
  'holdFalkreath-3': T70,  // 墓守。口伝で継ぐ
  'holdPale-1': T70,       // 首長
  'holdPale-2': T50,       // 執政
  'holdPale-3': T60,       // 宮廷の薬師
  'holdWinterhold-1': T60, // 首長
  'holdWinterhold-2': T50, // 執政。ダンマー
  'holdWinterhold-3': T40, // 護衛官。常置の兵はこの一名
  'holdHjaalmarch-1': T60, // 首長。見えたことを語る
  'holdHjaalmarch-2': T40, // 執政。キャジート
  'holdHjaalmarch-3': T30, // 湿地の案内
};
