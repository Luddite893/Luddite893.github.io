// 各項の記事
//
// 仕様書 5 の右ページ（情報面）に載る八項目。
//   名称／分類タグ／概要／目的／拠点／主要人物／関係／象徴的な一文
//
// ── 文体の規約 ─────────────────────────────────
// 語り手は「後世の第三者（学者）」。姉妹編『暁の砕き手』の当事者とは真逆。
//   ・感情語を使わない。「悲劇的な」「勇敢な」は書かない。
//   ・断定できないことは断定しない。「とされる」「記録が残る」で受ける。
//   ・組織を主語にする。個人の物語にしない。
//   ・現在形で書く。滅んだ組織だけ過去形に落とす。
// 概要は 200〜300 字。短いと図鑑にならず、長いと読み物になる。
//
// ── 分類タグ ──────────────────────────────────
// 原仕様の「加入可否」は操作者から見た区分だったので、
// 「門戸」に改めた。開くか、閉ざすか、血統によるか。世界の内側の基準である。

export const TAGS = {
  door:  { ja: '門戸', values: { open: '開く', closed: '閉ざす', blood: '血統による', trial: '試練による' } },
  scale: { ja: '規模', values: { great: '大', mid: '中', small: '小', unknown: '不詳' } },
  reach: { ja: '活動範囲', values: { imperial: '帝国全域', province: '州全域', hold: '一領', local: '局地', beyond: '境域外' } },
  state: { ja: '現存', values: { active: '現存', waning: '衰退', remnant: '残存', extinct: '滅亡' } },
};

// 未執筆の項は placeholder: true を立てる。組版の検証には支障がないが、
// 校正刷りには「稿」の印が出るので、書き漏らしが版面上で見える。
export const records = {

  companions: {
    door: 'trial', scale: 'mid', reach: 'province', state: 'active',
    summary:
      '白きヴァルガルの丘に館を構える傭兵団。イスグラモルの五百人の同胞に淵源を持つと称し、'
      + '現存する組織としては州内で最も古い部類に入る。金銭で雇われる点では傭兵に違いないが、'
      + '報酬の多寡で依頼を選ばぬ慣習を保っており、周辺の農村からは治安機構の代替として扱われる。'
      + '首長への従属関係を持たず、いかなる領主の紋章も掲げない。'
      + '内円（サークル）と呼ばれる少数の上位成員が、狼の血に関わる秘事を保持しているとする記録が複数ある。',
    aims: ['依頼の遂行によって名を保つこと', '館と、館に伝わる武具を絶やさぬこと', 'いかなる領主にも属さぬこと'],
    seat: 'ジョラーヴァスクル',
    seatNote: 'ホワイトラン領',
    people: [
      { ja: 'ヴィルカス', race: 'nord', headgear: 'none', hair: 'long', garment: 'plate', note: '内円。剣を選ぶ' },
      { ja: 'ファルカス', race: 'nord', headgear: 'none', hair: 'short', garment: 'plate', note: '内円。ヴィルカスの双子' },
      { ja: 'アエラ', race: 'nord', headgear: 'circlet', hair: 'braid', garment: 'leather', note: '内円。狩人' },
      { ja: 'コドラク', race: 'nord', headgear: 'none', hair: 'long', garment: 'fur', note: '先代の長。ハービンジャー' },
    ],
    quote: '我らは団ではない。館である。',
  },

  legion: {
    door: 'open', scale: 'great', reach: 'imperial', state: 'active',
    summary:
      'シロディールに本拠を置く帝国の常備軍。第四紀の現在、州内では反乱の鎮圧を主任務とする。'
      + '大戦の講和にあたって結ばれた白金協定により、タロス信仰の禁圧を執行する義務を負っており、'
      + 'これが州内における帝国軍の立場を著しく難しくしている。'
      + '兵の多くは州の出身者で、自ら禁じる信仰の下に育った者も少なくない。'
      + '軍としての練度と補給は反乱側を上回るが、住民の支持においては劣る、というのが概ね一致した評価である。',
    aims: ['州の帝国領としての保全', '白金協定の履行', 'サルモールとの再戦に備えた戦力の温存'],
    seat: 'ソリチュード',
    seatNote: 'ハーフィンガル領・キャッスル・ドーア',
    people: [
      { ja: 'トゥリウス', race: 'human', headgear: 'none', hair: 'short', garment: 'plate', note: '将軍。州の全軍を指揮' },
      { ja: 'リカーヤ', race: 'elf', headgear: 'helm', hair: 'none', garment: 'mail', note: '副官。ハンマーフェル出身' },
      { ja: 'ハドバル', race: 'nord', headgear: 'helm', hair: 'none', garment: 'mail', note: '兵長。リバーウッド出身' },
    ],
    quote: '帝国は敗けたのではない。次に備えたのだ。',
  },

  thalmor: {
    door: 'blood', scale: 'great', reach: 'imperial', state: 'active',
    summary:
      'アルドメリ自治領の統治機構であり、同時にその情報機関でもある。'
      + '州内には大使館と複数の監房を置き、白金協定を根拠としてタロス信仰者の摘発にあたる。'
      + '帝国軍に対しては条約上の優位に立つが、実兵力は州内に多くを置いていない。'
      + '摘発の目的が信仰の根絶にあるのか、それとも帝国と反乱勢力の双方を消耗させることにあるのかについては、'
      + '同時代の記録者のあいだでも見解が分かれる。'
      + '後者を採る立場は、サルモールが反乱の鎮圧に一度も戦力を割いていない事実を根拠とする。',
    aims: ['タロス信仰の根絶', '帝国の弱体化', '次の大戦に向けた州内情勢の把握'],
    seat: 'ソリチュード',
    seatNote: 'ハーフィンガル領・大使館',
    people: [
      { ja: 'エレンウェン', race: 'elf', headgear: 'circlet', hair: 'long', garment: 'robe', note: '第一使節。大使館を統べる' },
      { ja: 'ロルスケル', race: 'elf', headgear: 'hood', hair: 'none', garment: 'robe', note: '尋問官' },
      { ja: 'アンカノ', race: 'elf', headgear: 'none', hair: 'short', garment: 'robe', note: '学院への派遣顧問' },
    ],
    quote: '協定は結ばれた。履行されぬ協定に意味はない。',
  },

  blackbriar: {
    door: 'blood', scale: 'mid', reach: 'hold', state: 'active',
    summary:
      'リフテンの蜂蜜酒醸造所を基盤とする家系。'
      + '第四紀に入って急速に台頭し、現在では領の首長・衛兵隊・司法のいずれにも影響を及ぼす。'
      + '表向きは醸造と交易の家であるが、盗賊組合との資金的な結びつきを指摘する記録が複数存在する。'
      + '当主は自らを商人と称し、いかなる公職にも就いていない。'
      + '公職に就かぬことが、かえってこの家の力の源泉になっている——というのが、'
      + 'この家について書かれたもののうち、最も広く引かれる評言である。',
    aims: ['醸造の独占', '領の統治機構への影響力の維持', '負債による他家の従属'],
    seat: 'リフテン',
    seatNote: 'リフト領・ブラック＝ブライア醸造所',
    people: [
      { ja: 'メイビン', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'robe', note: '当主。公職には就かない' },
      { ja: 'ハースィル', race: 'nord', headgear: 'none', hair: 'short', garment: 'leather', note: '長子' },
      { ja: 'イングン', race: 'nord', headgear: 'none', hair: 'long', garment: 'robe', note: '次女。錬金術を学ぶ' },
    ],
    quote: '負債は、剣より確かに人を従える。',
  },

  ninedivines: {
    door: 'open', scale: 'great', reach: 'imperial', state: 'waning',
    summary:
      '八つの神格を奉ずる帝国の公認教団。'
      + '白金協定の締結まではタロスを加えた九柱を祀っており、名称もそれに由来する。'
      + '協定以降、公式の祭祀からタロスは除かれたが、'
      + '州内の聖堂では第九の壇が空席のまま残されている例が多く報告されている。'
      + '教団としての組織は帝国全域に及ぶものの、州内における権威は反乱以後いちじるしく後退した。'
      + '住民の多くが、禁じられた側の神をなお私的に祀っているためである。',
    aims: ['八神の祭祀の維持', '施療と埋葬の執行', '協定下における教団の存続'],
    seat: 'ソリチュード',
    seatNote: 'ハーフィンガル領・神々の神殿',
    people: [
      { ja: 'ルーンディル', race: 'nord', headgear: 'cowl', hair: 'none', garment: 'robe', note: '司祭。埋葬を司る' },
      { ja: 'エリシフ', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'robe', note: '首長。教団の後援者' },
    ],
    quote: '第九の壇は、掃き清められたまま空いている。',
  },

  dragoncult: {
    door: 'closed', scale: 'unknown', reach: 'province', state: 'extinct',
    summary:
      'メレシック紀に竜を神として奉じ、州の全域を統べた祭祀組織。'
      + '竜司祭と呼ばれる高位の祭司が各地の霊廟を治め、住民を隷属させたと伝えられる。'
      + '竜戦争における人間側の勝利によって組織としては解体したが、'
      + '祭司の遺骸は各地の墳墓に葬られたまま現存し、そのいくつかは活動を続けている。'
      + '本項を「滅亡」に分類するのは組織としての機能を失っているためであり、'
      + '構成員の消滅を意味しない。この区別は本書全体で一貫させている。',
    aims: ['（組織としての目的は失われている）', '霊廟と仮面の保持', '主の帰還'],
    seat: '不定',
    seatNote: '州内各地の墳墓',
    people: [
      { ja: 'クロシス', race: 'human', headgear: 'horned', hair: 'none', garment: 'robe', note: '竜司祭。仮面を負う' },
      { ja: 'モロキ', race: 'human', headgear: 'horned', hair: 'none', garment: 'robe', note: '竜司祭' },
      { ja: 'ヴォクン', race: 'human', headgear: 'horned', hair: 'none', garment: 'robe', note: '竜司祭' },
    ],
    quote: '仮面は残った。顔のほうが先に失われた。',
  },

  telvanni: {
    door: 'trial', scale: 'mid', reach: 'beyond', state: 'active',
    summary:
      'モロウウィンドの大家のひとつ。'
      + '術者としての力量のみを序列の根拠とし、血統も年齢も考慮しない点で、他の大家と大きく異なる。'
      + '評議は名目上存在するが、参集の要請に応じる義務がないため、実質的には各人が独立して振る舞う。'
      + 'レッドマウンテンの噴火以後、一部の家人がソルスセイムに移り、'
      + '菌類を育てて塔と成す独特の建築を持ち込んだ。'
      + '州内における影響は限定的だが、術の水準においては学院と比較されることが多い。',
    aims: ['術の探究', '干渉の排除', '塔の維持'],
    seat: 'ソルスセイム',
    seatNote: 'テルミスリン',
    people: [
      { ja: 'ネロス', race: 'elf', headgear: 'none', hair: 'long', garment: 'robe', note: '魔術師。塔を持つ' },
      { ja: 'タルヴァス', race: 'elf', headgear: 'none', hair: 'short', garment: 'robe', note: '弟子' },
    ],
    quote: '評議には出ない。呼ばれてはいるが。',
  },

  whispers: {
    door: 'closed', scale: 'unknown', reach: 'local', state: 'remnant',
    summary:
      '存在そのものが確定していない組織。'
      + '名は複数の書簡と尋問記録に現れるが、構成員・拠点・目的のいずれについても一次記録が得られていない。'
      + '皇帝の目に属する何者かの隠語であるとする説、'
      + '実体を持たず、他組織が責任を転嫁するために用いた名であるとする説、'
      + 'その双方が現在も並立している。'
      + '本書がこの項を立てるのは、実在を主張するためではなく、'
      + '同時代の記録に繰り返し現れる以上、記述しないという判断もまた恣意にあたると考えるからである。',
    aims: ['（不詳）'],
    seat: '不定',
    seatNote: '拠点は特定されていない',
    people: [],
    quote: '名だけがある。名を持つ者がいない。',
  },
};

// 未執筆の項の受け皿。版面の検証は通り、校正刷りには「稿」の印が出る。
export const blank = (f) => ({
  door: 'closed', scale: 'unknown', reach: 'local', state: 'active',
  summary: '（本文未執筆）'.repeat(1) + `　${f.ja}の概要は執筆待ちである。`
    + '本項は版面の検証のために置かれており、文言は納品時までに差し替える。',
  aims: ['（未執筆）'], seat: '不定', seatNote: '（未執筆）', people: [], quote: '（未執筆）',
  placeholder: true,
});

export const recordOf = (f) => records[f.id] ?? blank(f);
export const written = () => Object.keys(records).length;
