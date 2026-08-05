// 各項の図版指定
//
// 仕様書 5：左ページ。主図版＝その組織を象徴する情景、1 点、大きく。
//            小カット＝装備・拠点・象徴物など 2〜3 点。
//
// 主図版は「その組織を象徴する情景」なので、拠点そのものではなく
// **その組織が何をしている場所か**を選ぶ。城を持つ組織でも、
// 城が主題とは限らない。シルバー・ブラッド家の主図版が屋敷ではなく
// 坑口なのは、この家の実体が銀と労役だからである。
//
// 図番は本編の並び順から機械で振る。手で書くと、項を入れ替えた瞬間に狂う。
// 図版説明の頭の「図一一」も同じ番号から作る。

import { factions } from './factions.mjs';

// 漢数字。図版説明は本文と同じ和文なので、算用数字を混ぜない。
const KANJI = '〇一二三四五六七八九'.split('');
const kanji = (n) => (n < 10 ? KANJI[n]
  : n < 20 ? '十' + (n % 10 ? KANJI[n % 10] : '')
  : KANJI[Math.floor(n / 10)] + '十' + (n % 10 ? KANJI[n % 10] : ''));

// structure：情景の構築物。night：夜の刷り（空の調子を上げる）。
// figures：0 で前景の人影を落とす。人のいない図版は、それ自体が記述になる。
export const plates = {
  // ── I 職能結社 ──
  companions: { structure: 'city',
    caption: 'ホワイトランの丘上に立つジョラーヴァスクル。屋根は伏せた竜船を模す。',
    cuts: ['axe', 'shield', 'anvil'], cutCaps: ['内円の斧', '団の盾', '天空炉の金床'] },
  thieves: { structure: 'crypt', night: 1,
    caption: 'リフテンの地下水路への降り口。市街の側からは、ただの排水口にしか見えない。',
    cuts: ['lockpick', 'markSign', 'purse'], cutCaps: ['開錠具', '影の印', '分け前の袋'] },
  nightingale: { structure: 'stones', night: 1, figures: 0,
    caption: '三つの立石が円をなす座。現任が三名を欠いた期間の記録は残っていない。',
    cuts: ['mask', 'amulet', 'key'], cutCaps: ['面', '誓約の護符', '暁の鍵（写し）'] },
  brotherhood: { structure: 'crypt', night: 1,
    caption: '聖域の入口。扉は問いに答えた者にだけ開くとされる。',
    cuts: ['dagger', 'phial', 'contract'], cutCaps: ['儀式の刃', '毒', '依頼の書付'] },
  winterhold: { structure: 'college',
    caption: '学院。街の大半が崩れたのちも、橋とその先だけが残った。',
    cuts: ['staff', 'book', 'soulgem'], cutCaps: ['魔道士の杖', '術書', '魂石'] },
  bards: { structure: 'keep',
    caption: 'ソリチュードの学舎。祭の当日には門前に櫓が組まれる。',
    cuts: ['lute', 'drum', 'flute'], cutCaps: ['撥弦', '太鼓', '笛'] },
  blades: { structure: 'monastery',
    caption: '峡谷の壁に掘られた祠。外からは入口が見えない位置に開かれている。',
    cuts: ['sword', 'tablet', 'scroll'], cutCaps: ['アカヴィリの刀', '壁の拓本', '系譜の巻子'] },
  dawnguard: { structure: 'fort',
    caption: 'フォート・ドーンガード。峡谷の奥に建ち、道は一本しかない。',
    cuts: ['bow', 'shield', 'torch'], cutCaps: ['弩', '盾', '篝火'] },
  volkihar: { structure: 'keep', night: 1, figures: 0,
    caption: '氷海の島に建つ城。渡る橋は落ちており、図は対岸から測られた。',
    cuts: ['chalice', 'fang', 'ring'], cutCaps: ['血の杯', '牙', '一族の指輪'] },
  greybeards: { structure: 'monastery',
    caption: 'ハイフロスガー。七千段の階の上にあり、階の途中に碑文が並ぶ。',
    cuts: ['bell', 'tablet', 'scroll'], cutCaps: ['鐘', '碑文', '書による応対'] },

  // ── II 国家・軍事 ──
  legion: { structure: 'fort',
    caption: '街道沿いの砦。第四紀の帝国軍は野戦よりも街道の確保を主とする。',
    cuts: ['helm', 'sword', 'banner'], cutCaps: ['軍団兵の兜', '帝国剣', '軍旗'] },
  stormcloaks: { structure: 'longhouse',
    caption: 'ウィンドヘルムの王宮。石は第一紀のものと伝えられる。',
    cuts: ['axe', 'cuirass', 'banner'], cutCaps: ['戦斧', '熊革の胴当て', '熊の旗'] },
  thalmor: { structure: 'tower', night: 1,
    caption: '大使館。丘の上に単独で建ち、街道からは見上げる位置にある。',
    cuts: ['scroll', 'key', 'manacles'], cutCaps: ['尋問記録', '監房の鍵', '枷'] },
  penitus: { structure: 'gatehouse',
    caption: '都の門。皇帝の来訪に備えて封鎖された日の記録による。',
    cuts: ['helm', 'letter', 'dagger'], cutCaps: ['兜', '密書', '護衛の刃'] },
  moot: { structure: 'arch', figures: 0,
    caption: '会同の石門。開かれる日以外は無人であり、番人も置かれない。',
    cuts: ['crown', 'scales', 'seal'], cutCaps: ['上級王の冠', '議決の秤', '各領の印章'] },
  eastempire: { structure: 'dock',
    caption: 'ソリチュードの埠頭。倉は三棟、いずれも社の所有である。',
    cuts: ['crate', 'ledger', 'anchor'], cutCaps: ['荷箱', '出納の帳', '錨'] },

  // ── III 敵対組織 ──
  silverhand: { structure: 'palisade',
    caption: '隠れ処のひとつ。柵は建物より後から足されたものである。',
    cuts: ['ingot', 'sword', 'hide'], cutCaps: ['銀の延べ金', '銀の刃', '剥いだ毛皮'] },
  vigilants: { structure: 'hut',
    caption: 'ステンダールの祠堂。図は焼失前の写しによる。',
    cuts: ['mace', 'amulet', 'censer'], cutCaps: ['鎚矛', '守人の護符', '香炉'] },
  forsworn: { structure: 'camp',
    caption: 'リーチの高地の野営。石環の近くに設けられる例が多い。',
    cuts: ['antlerCut', 'boneCut', 'herb'], cutCaps: ['角の冠', '骨の装具', '儀式の草'] },
  psijic: { structure: 'tower', figures: 0,
    caption: 'アルテウムの塔。島ごと現れ、島ごと消えるとされる。図は現れていた期間のもの。',
    cuts: ['staff', 'gem', 'hourglass'], cutCaps: ['杖', '透明の玉', '時の砂'] },
  synod: { structure: 'ruin',
    caption: '調査隊が最後に入った遺跡。入口は現在も塞がれていない。',
    cuts: ['staff', 'lantern', 'tablet'], cutCaps: ['杖', '照明の器', '石板の写し'] },
  whispers: { structure: 'ruin', night: 1, figures: 0,
    caption: '（本項に対応する図版は存在しない。掲げるのは、名の現れた書簡の発見地である。）',
    cuts: ['letter', 'key', 'coin'], cutCaps: ['当該書簡', '用途不明の鍵', '刻印のない貨'] },
  moragtong: { structure: 'crypt', night: 1,
    caption: 'モロウウィンドの地下祠。令状はここで発行され、ここに控えが残された。',
    cuts: ['dagger', 'contract', 'mask'], cutCaps: ['儀式の刃', '処刑令状', '面'] },
  alikr: { structure: 'wagon',
    caption: '市門の外の野。この集団は城壁内に入らない。入れないのではない。',
    cuts: ['sword', 'purse', 'letter'], cutCaps: ['曲刀', '前金の袋', '人相書'] },
  shadows: { structure: 'forest', night: 1, figures: 0,
    caption: '失踪の起きた林道。図は事件の後に測られたものであり、当時の状態ではない。',
    cuts: ['dagger', 'rope', 'markSign'], cutCaps: ['刃（推定）', '縄', '残された印'] },

  // ── IV 商業・名家 ──
  blackbriar: { structure: 'city',
    caption: 'リフテンの運河。醸造所は水路に面し、荷は夜間にも動く。',
    cuts: ['potion', 'coin', 'ledger'], cutCaps: ['蜂蜜酒', 'リフトの貨', '出納の帳'] },
  silverblood: { structure: 'mine',
    caption: 'シドナ鉱山の坑口。判決を受けた者は、法廷からここへ直接送られる。',
    cuts: ['pickaxe', 'ingot', 'manacles'], cutCaps: ['鶴嘴', '銀の延べ金', '囚人の枷'] },
  battleborn: { structure: 'keep',
    caption: 'ホワイトランの屋敷。市場に面し、扉は街路に直接開く。',
    cuts: ['cuirass', 'coin', 'banner'], cutCaps: ['胴鎧', '帝国の貨', '帝国旗'] },
  graymane: { structure: 'hut',
    caption: '灰の街区の家。天空炉へは市場を通らない道で通う。',
    cuts: ['smithHammer', 'anvil', 'tongs'], cutCaps: ['鍛冶槌', '金床', '火挟'] },

  // ── V 宗教・信仰 ──
  ninedivines: { structure: 'temple',
    caption: '神々の神殿。内陣の第九の壇は、現在も空席のまま保たれている。',
    cuts: ['chalice', 'book', 'crown'], cutCaps: ['聖別の杯', '八神の書', 'タロスの冠（撤去）'] },
  auriel: { structure: 'monastery', figures: 0,
    caption: '谷の聖堂。氷の下にあり、外からは入口の一部しか見えない。',
    cuts: ['bow', 'bell', 'feather'], cutCaps: ['聖堂の弓', '祈りの鐘', '聖印の羽'] },
  moth: { structure: 'tower',
    caption: '写字室。窓は塞がれている。読む者にとって明暗はもはや意味を持たない。',
    cuts: ['scroll', 'quill', 'phial'], cutCaps: ['星霜の書', '羽根筆', '洗眼の薬'] },
  tribunal: { structure: 'temple', figures: 0,
    caption: '寺院の内陣。三つの壇は、いずれの転用先でも撤去されずに残されている。',
    cuts: ['chalice', 'mask', 'censer'], cutCaps: ['聖別の杯', '聖人の面', '香炉'] },

  // ── VI 秘教・カルト ──
  namira: { structure: 'cave', night: 1,
    caption: '祠堂の下の洞。会衆は日没の後にのみ集まる。',
    cuts: ['chalice', 'boneCut', 'skull'], cutCaps: ['供物の杯', '骨', '遺骨'] },
  miraak: { structure: 'stones', night: 1,
    caption: '石の座。石を積む者は、積んでいた間の記憶を持たない。',
    cuts: ['mask', 'tablet', 'fungus'], cutCaps: ['仮面', '碑文', '島の菌'] },
  dragoncult: { structure: 'barrow', night: 1, figures: 0,
    caption: '高地の墳墓。入口の壁面には竜文字による碑文が残る。',
    cuts: ['mask', 'torch', 'gate'], cutCaps: ['竜司祭の仮面', '墓室の灯', '墳墓の門'] },
  glenmoril: { structure: 'cave',
    caption: 'リーチの洞。入口は三つあり、いずれも塞がれていない。',
    cuts: ['herb', 'mortar', 'claw'], cutCaps: ['儀式の草', '乳鉢', '爪'] },
  mythicdawn: { structure: 'ruin', figures: 0,
    caption: '集会所とされる廃屋。動乱の終結の直後に焼かれ、以後は再建されていない。',
    cuts: ['book', 'brazier', 'contract'], cutCaps: ['教典の写本', '火鉢', '入信の誓書'] },
  peryite: { structure: 'altar', figures: 0,
    caption: '祭壇。周囲の遺体はいずれも同一の症状を示し、片づけられた形跡がない。',
    cuts: ['phial', 'censer', 'skull'], cutCaps: ['病の小瓶', '香炉', '遺骨'] },
  idealmasters: { structure: 'stones', night: 1, figures: 0,
    caption: '魂の牢と呼ばれる領域。図は生還したと称する者の証言による復元である。',
    cuts: ['soulgem', 'chain', 'contract'], cutCaps: ['魂石', '鎖', '契約の文言'] },
  daedriccults: { structure: 'altar', night: 1,
    caption: '祭壇。位置はいずれも人里から一定の距離を保つ。距離はほぼ揃っている。',
    cuts: ['brazier', 'dagger', 'mask'], cutCaps: ['供物の火', '儀式の刃', '面'] },

  // ── VII 部族・辺境・その他 ──
  skaal: { structure: 'hut',
    caption: 'スカール村。家は十に満たず、村の外へ道は一本しか出ていない。',
    cuts: ['drum', 'herb', 'hide'], cutCaps: ['儀式の太鼓', '薬草', '毛皮'] },
  redoran: { structure: 'gatehouse',
    caption: 'レイヴン・ロックの門。噴火の灰を防ぐために、後から高く積み直された。',
    cuts: ['cuirass', 'spear', 'bell'], cutCaps: ['甲殻の鎧', '槍', '警鐘'] },
  telvanni: { structure: 'mushroom',
    caption: '菌塔。石は用いず、菌類を育てて構造とする。増築は術者の一存で行われる。',
    cuts: ['potion', 'scroll', 'book'], cutCaps: ['術薬', '巻子', '術書'] },
  orcstrongholds: { structure: 'palisade',
    caption: '砦。外壁は木と骨で組まれ、門は一つしかない。',
    cuts: ['smithHammer', 'warhammer', 'hide'], cutCaps: ['鍛冶槌', '戦鎚', '毛皮'] },
  khajiitcaravans: { structure: 'wagon',
    caption: '市門の外の天幕。城壁内への立ち入りは、現在いずれの領でも認められていない。',
    cuts: ['crate', 'coin', 'amulet'], cutCaps: ['荷', '取引の貨', '月の護符'] },
  riekling: { structure: 'camp',
    caption: '雪原の集落。天幕は雪を掻き寄せて骨組みに掛ける。',
    cuts: ['spear', 'boneCut', 'fang'], cutCaps: ['槍', '骨の飾り', '猪の牙'] },
  bandits: { structure: 'ruin',
    caption: '街道沿いの廃砦。占拠された後、門だけが直されている。',
    cuts: ['sword', 'purse', 'gate'], cutCaps: ['奪われた剣', '分け前', '直された門'] },
  alduin: { structure: 'barrow', night: 1, figures: 0,
    caption: '墳墓の上空。復活は一定の順序で進行しており、順序を決めている者がいる。',
    cuts: ['skull', 'fang', 'claw'], cutCaps: ['竜の頭骨', '牙', '爪'] },

  // ── VIII 領邦・宮廷 ──
  // 領の主図版は市そのものである。他の分類では「その組織が何をしている場所か」を選ぶが、
  // 領においては、市の形がそのまま統治の形だからである。
  // 峡谷を刳り抜いた市と、湿地に杭を打った市とでは、そこで行い得る統治が違う。
  holdHaafingar: { structure: 'city',
    caption: '岩橋の上に載るソリチュード。橋の下を船が通る。港は年を通して凍らない。',
    cuts: ['banner', 'anchor', 'seal'], cutCaps: ['領の旗', '港の錨', '総督府の印'] },
  holdEastmarch: { structure: 'keep',
    caption: '王の宮。市壁の下層は、人の手になる石積みとしては州内で最も古い。',
    cuts: ['crown', 'banner', 'brazier'], cutCaps: ['王冠（座のみ）', '領の旗', '大広間の火'] },
  holdWhiterun: { structure: 'city',
    caption: '平原に立つ丘と、その頂の大広間。九領のいずれとも境を接する。',
    cuts: ['gate', 'banner', 'shield'], cutCaps: ['市門', '領の旗', '衛兵の盾'] },
  holdReach: { structure: 'city',
    caption: '峡谷の岩壁を刳り抜いた市。階段と水路の大半は、人の手になるものではない。',
    cuts: ['tongs', 'pickaxe', 'ingot'], cutCaps: ['遺構の鉗子', '坑の鶴嘴', '銀の延べ'] },
  holdRift: { structure: 'dock',
    caption: '湖岸に杭を打って建てた市。水路が市街を貫き、その下にもう一つの道がある。',
    cuts: ['barrel', 'ledger', 'lantern'], cutCaps: ['蜂蜜酒の樽', '市場の帳', '水路の灯'] },
  holdFalkreath: { structure: 'forest',
    caption: '針葉樹の森に開かれた墓地。区画は現在も継ぎ足されている。',
    cuts: ['cairn', 'sickle', 'candle'], cutCaps: ['墓標', '下草を刈る鎌', '通夜の灯'] },
  holdPale: { structure: 'dock', night: 1,
    caption: '凍らぬ港。陸路は冬季に三月ほど絶えるが、海は開いている。',
    cuts: ['anchor', 'pickaxe', 'net'], cutCaps: ['港の錨', '坑の鶴嘴', '漁の網'] },
  holdWinterhold: { structure: 'ruin', figures: 0,
    caption: '崩壊のあと。残ったのは数戸の家と、橋の先だけである。',
    cuts: ['runestone', 'chain', 'hourglass'], cutCaps: ['崩壊以前の碑', '橋の鎖', '三百年'] },
  holdHjaalmarch: { structure: 'hut',
    caption: '湿地に打った杭の上の集落。杭は数年ごとに打ち替えねばならない。',
    cuts: ['fungus', 'oar', 'herb'], cutCaps: ['湿地の茸', '泥炭を運ぶ櫂', '薬草'] },
};

const ORDER = new Map(factions.map((f, i) => [f.id, i + 1]));

export function plateOf(f) {
  const n = ORDER.get(f.id) ?? 0;
  const p = plates[f.id];
  if (!p) {
    return { num: String(n), scene: { id: f.id, structure: 'fort' },
      caption: `図${kanji(n)}　（図版未制作）`, cuts: ['sword', 'shield', 'banner'], cutCaps: ['', '', ''] };
  }
  return {
    num: String(n),
    scene: { id: f.id, structure: p.structure, night: p.night, figures: p.figures },
    caption: `図${kanji(n)}　${p.caption}`,
    cuts: p.cuts, cutCaps: p.cutCaps,
  };
}

// 小カットの延べ点数と、実際に用いた種類の数。納品書の図版点数はここから採る。
export const plateStats = () => {
  const used = new Set();
  let placed = 0;
  for (const f of factions) {
    const p = plates[f.id];
    if (!p) continue;
    for (const k of p.cuts) { used.add(k); placed++; }
  }
  return { scenes: Object.keys(plates).length, cutKinds: used.size, cutPlacements: placed };
};
