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
      + '軍としての練度と補給は反乱側を上回るが、住民の支持においては劣る、というのが概ね一致した評価である。'
      + '駐屯地は各領の主要都市に置かれるが、領主の交代に伴って接収された例がいくつかある。',
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
      + '住民の多くが、禁じられた側の神をなお私的に祀っているためである。'
      + '州内の聖堂の多くは反乱期に一度は閉鎖されており、現在の祭祀は中断を挟んだうえで再開されたものである。',
    aims: ['八神の祭祀の維持', '施療と埋葬の執行', '協定下における教団の存続'],
    seat: 'ソリチュード',
    seatNote: 'ハーフィンガル領・神々の神殿',
    people: [
      { ja: 'ルーンディル', race: 'nord', headgear: 'cowl', hair: 'none', garment: 'robe', note: '司祭。埋葬を司る' },
      { ja: 'エリシフ', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'robe', note: '首長。教団の後援者' },
      { ja: 'マラモール', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: 'マーラの司祭' },
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
      + '構成員の消滅を意味しない。この区別は本書全体で一貫させている。'
      + '霊廟の所在の多くは、現在もなお特定されていない。',
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
      + '州内における影響は限定的だが、術の水準においては学院と比較されることが多い。'
      + '州内に家としての代表は置かれておらず、交渉はその都度、個別の術者を相手に行われる。',
    aims: ['術の探究', '干渉の排除', '塔の維持'],
    seat: 'ソルスセイム',
    seatNote: 'テルミスリン',
    people: [
      { ja: 'ネロス', race: 'elf', headgear: 'none', hair: 'long', garment: 'robe', note: '魔術師。塔を持つ' },
      { ja: 'タルヴァス', race: 'elf', headgear: 'none', hair: 'short', garment: 'robe', note: '弟子' },
      { ja: 'ヴァローナ', race: 'elf', headgear: 'none', hair: 'short', garment: 'leather', note: '家令' },
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
    aims: ['（不詳）', '記録に現れる限りでは、特定の人物の所在の確認'],
    seat: '不定',
    seatNote: '拠点は特定されていない',
    people: [
      { ja: '書簡に現れる「S」', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '差出人。実在は未確認' },
      { ja: '尋問記録の被告', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '所属を認めなかった' },
      { ja: '密告者と目された者', race: 'human', headgear: 'hood', hair: 'none', garment: 'leather', note: '後に否認している' },
    ],
    quote: '名だけがある。名を持つ者がいない。',
  },

  // ══ I. 職能結社（続き） ═══════════════════════════
  thieves: {
    door: 'trial', scale: 'mid', reach: 'province', state: 'waning',
    summary:
      'リフテンの地下水路に本拠を置く窃盗組織。'
      + '州全域に散る「影の印」と呼ばれる記号体系を保持し、これによって成員は互いを知る。'
      + '第四紀に入って著しく退潮しており、当代の成員自身がその原因を「運が離れた」と説明する。'
      + '本書はこの説明を採らないが、退潮の時期が組織の守護者に関わる不祥事と一致する点は指摘しておく。'
      + '盗みそのものよりも、盗みを許容させる関係の維持に多くを費やす組織である。'
      + '組織の規模については、成員自身の申告以外に典拠がない。本書の記す人数は最小の見積りである。',
    aims: ['商圏における黙認の維持', '影の印の保全', '離れた運の回復'],
    seat: 'リフテン', seatNote: 'リフト領・鼠の穴',
    people: [
      { ja: 'ブリニョルフ', race: 'nord', headgear: 'none', hair: 'long', garment: 'leather', note: '第二席。人を見る' },
      { ja: 'メルセル', race: 'human', headgear: 'none', hair: 'short', garment: 'leather', note: '頭目' },
      { ja: 'ヴェックス', race: 'nord', headgear: 'none', hair: 'short', garment: 'leather', note: '錠前の名手' },
    ],
    quote: '運が離れたのだ、と彼らは言う。運とは、そういう名の何かではない。',
  },
  nightingale: {
    door: 'closed', scale: 'small', reach: 'province', state: 'active',
    summary:
      '常に三名からなる組織。盗賊組合の内側に置かれるが、組合の指揮系統には属さない。'
      + '夜の女神との契約により、ある聖域の守護を負うとされる。'
      + '成員の名は組合内部でも共有されず、死後にはじめて欠員が知られる。'
      + '三という数が守られてきた記録は残るが、三でなければならない理由を記した文書は現存しない。'
      + '本項の記述は、いずれも間接的な証言に基づく。'
      + 'なお、盗賊組合の退潮が始まった時期と、この組織に関する記録が途絶える時期は、ほぼ重なる。両者を因果で結ぶ証拠は無いが、無関係とみなす根拠も同様に無い。',
    aims: ['聖域の守護', '契約の履行', '三の維持'],
    seat: '不定', seatNote: '聖域の所在は公にされていない',
    people: [
      { ja: 'カーリア', race: 'elf', headgear: 'hood', hair: 'none', garment: 'leather', note: '現任の一人' },
      { ja: 'メルセル・フレイ', race: 'human', headgear: 'none', hair: 'short', garment: 'leather', note: '盟約を破った者' },
      { ja: 'ガルス・デシムス', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '先任。殺害される' },
    ],
    quote: '欠けたことは、次の者が立ってはじめて分かる。',
  },
  brotherhood: {
    door: 'closed', scale: 'small', reach: 'imperial', state: 'remnant',
    summary:
      '請負による殺害を業とする組織。'
      + '依頼は「闇の聖餐」と呼ばれる儀礼を経てはじめて受理される。'
      + 'かつては帝国全域に聖域を持ったが、第四紀の現在、機能している拠点は極めて少ない。'
      + '五箇条の戒律を持ち、これを破った者は同輩に処断される。'
      + '母体であるモラグ・トングとの分岐は第一紀に遡り、両者は現在も互いを僭称者と呼ぶ。'
      + '州内の聖域は近年、内部からの離反によって失われたとする報告がある。本書はこの報告の出所を確認できていないが、以後この組織の活動記録が途絶えている事実は付記しておく。',
    aims: ['聖餐の維持', '戒律の執行', '聖域の再建'],
    seat: 'ファルクリース', seatNote: 'ファルクリース領・森の聖域',
    people: [
      { ja: 'アストリッド', race: 'nord', headgear: 'none', hair: 'short', garment: 'leather', note: '聖域の長' },
      { ja: 'シセロ', race: 'human', headgear: 'cowl', hair: 'none', garment: 'leather', note: '守り手' },
      { ja: 'ナジール', race: 'human', headgear: 'none', hair: 'none', garment: 'leather', note: '会計を兼ねる' },
    ],
    quote: '闇の一党に入る道はない。招かれるだけである。',
  },
  winterhold: {
    door: 'open', scale: 'mid', reach: 'province', state: 'active',
    summary:
      '州内で唯一、魔術の体系的な教授を行う機関。'
      + '大崩壊によって市街の大半が海へ落ちた後も、学院の建つ岩塊のみが残った。'
      + 'この事実が住民のあいだで学院への疑いを生み、以後、学院と市街の関係は修復されていない。'
      + '入学に血統・国籍・年齢の条件を課さない点で、州内の組織としては例外的である。'
      + '蔵書と実技の水準は高いが、外部への発信をほとんど行わない。'
      + '蔵書の目録は外部に公開されておらず、規模を推定できるのは、他機関が写しを求めて拒まれた記録の数からのみである。その数は第四紀に入って急増している。',
    aims: ['知識の集積と保全', '実技の教授', '市街との関係の修復'],
    seat: 'ウィンターホールド', seatNote: 'ウィンターホールド領',
    people: [
      { ja: 'サヴォス', race: 'elf', headgear: 'hood', hair: 'none', garment: 'robe', note: '学長' },
      { ja: 'ミラベル', race: 'human', headgear: 'none', hair: 'short', garment: 'robe', note: '教頭' },
      { ja: 'トルフディル', race: 'nord', headgear: 'none', hair: 'short', garment: 'robe', note: '破壊術の教師' },
      { ja: 'ウラグ', race: 'orc', headgear: 'none', hair: 'topknot', garment: 'robe', note: '書庫番' },
    ],
    quote: '海が街を持っていった。岩の上だけが残った。それだけのことだ。',
  },
  bards: {
    door: 'open', scale: 'small', reach: 'province', state: 'active',
    summary:
      'ソリチュードに置かれた詩と楽の教育機関。'
      + '職能結社に分類されるが、卒業者に対する職の斡旋を行わない点で他と異なる。'
      + '「王の焼き討ち」と呼ばれる年次の祭を主催し、これが州内で唯一、'
      + '帝国派と反乱派の双方が同席する行事となっている。'
      + '所蔵する古謡の写しには、他に伝わらない異文が含まれると指摘されている。'
      + '祭の当日に限り、市街への武装した立ち入りが双方に許される。この慣行が破られた記録は、蜂起以後も一件も無い。'
      + '入学に身分の要件はなく、これも他の職能結社と異なる点である。',
    aims: ['古謡の伝承', '祭の主催', '中立の維持'],
    seat: 'ソリチュード', seatNote: 'ハーフィンガル領',
    people: [
      { ja: 'ヴィアルモ', race: 'elf', headgear: 'none', hair: 'long', garment: 'robe', note: '学長' },
      { ja: 'インゲ', race: 'nord', headgear: 'none', hair: 'long', garment: 'robe', note: '弦楽の師' },
      { ja: 'ジロー・ジェマーヌ', race: 'human', headgear: 'none', hair: 'short', garment: 'robe', note: '史学の師' },
    ],
    quote: 'この学舎の門は、両軍の兵に等しく開いている。年に一度だけだが。',
  },
  blades: {
    door: 'closed', scale: 'small', reach: 'imperial', state: 'remnant',
    summary:
      '本来は皇帝の親衛と情報を担った組織。'
      + '白金協定においてサルモールの要求により解散を命じられ、以後は追跡の対象となった。'
      + '第四紀の現在、州内で活動を確認できる成員は数名にとどまる。'
      + '竜に関する知識と、その知識を保管する施設を保持していた点が、'
      + '解散後のこの組織を他の残党と分ける。'
      + '再建の意思は明示されているが、成員の補充は行われていない。'
      + '保管施設の所在は、成員のうち一名のみが記憶しているとされる。記録を残さないというこの方針は、追跡を逃れる上では有効に働いたが、再建を著しく困難にしてもいる。',
    aims: ['竜に関する記録の保全', '組織の再建', '皇統の護持'],
    seat: '不定', seatNote: '公式の拠点は失われている',
    people: [
      { ja: 'デルフィン', race: 'nord', headgear: 'none', hair: 'long', garment: 'leather', note: '生き残りの一人' },
      { ja: 'エスバーン', race: 'nord', headgear: 'hood', hair: 'none', garment: 'robe', note: '記録官' },
      { ja: 'ジョウフレ', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '第三紀の宗匠' },
    ],
    quote: '解散は命じられた。従ったとは、どこにも書かれていない。',
  },
  dawnguard: {
    door: 'open', scale: 'small', reach: 'province', state: 'active',
    summary:
      '吸血鬼の討伐を単一の目的として第四紀に再興された組織。'
      + '古い砦を修復して本拠とし、弩を主装備とする点で州内の他の武装集団と区別される。'
      + '成員の多くが親族を失った者であり、志願の動機が私的である点を組織自身が認めている。'
      + 'ステンダールの守人が撤退した空白を、事実上この組織が埋めている。'
      + '再興の時期が、ヴォルキハル一族の活動再開と一致する点は複数の記録が指摘する。'
      + '弩という選択は象徴ではなく実務による。訓練期間が短く、非戦闘者でも扱える点が、志願者の性格と合致した。',
    aims: ['吸血鬼の討伐', '砦の維持', '守人が残した空白の補填'],
    seat: 'フォート・ドーンガード', seatNote: 'リフト領・ダートウォーター渓谷',
    people: [
      { ja: 'イスラン', race: 'human', headgear: 'none', hair: 'none', garment: 'plate', note: '創設者。元・守人' },
      { ja: 'ソリーヌ', race: 'human', headgear: 'none', hair: 'short', garment: 'leather', note: '弩の製作' },
      { ja: 'ゲルドゥル', race: 'nord', headgear: 'none', hair: 'braid', garment: 'fur', note: '追跡' },
    ],
    quote: '守人は祈って死んだ。我々は弩を作ることにした。',
  },
  volkihar: {
    door: 'blood', scale: 'small', reach: 'province', state: 'active',
    summary:
      '氷結湖上の城を本拠とする吸血鬼の血族。'
      + '成員は当主から直接に血を受けた者に限られ、他系統の吸血鬼を同族と認めない。'
      + '長く休眠状態にあったが、第四紀に入って活動を再開した。'
      + '当主が保持する予言の解釈をめぐり、血族内部に分岐が生じているとする記録がある。'
      + '本項が「小」と評価するのは成員数のことであり、影響力の評価ではない。'
      + '城が氷結湖の上にあるため、冬季以外は接近そのものが困難である。これがこの血族の存続を長く支えてきたと考えられる。',
    aims: ['予言の成就', '血統の純化', '日の光の廃絶'],
    seat: 'ヴォルキハル城', seatNote: '氷結湖上',
    people: [
      { ja: 'ハルコン', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'robe', note: '当主' },
      { ja: 'セラーナ', race: 'nord', headgear: 'hood', hair: 'long', garment: 'robe', note: '当主の娘' },
      { ja: 'ヴァレリカ', race: 'nord', headgear: 'none', hair: 'long', garment: 'robe', note: '当主の妻。失踪' },
    ],
    quote: '太陽の圧政、と彼らはそれを呼ぶ。',
  },
  greybeards: {
    door: 'trial', scale: 'small', reach: 'province', state: 'active',
    summary:
      '世界の喉の中腹に住み、「声の道」を修める者たち。'
      + '沈黙の戒を負い、通常の会話を行わない。'
      + '声を用いれば建物が崩れるため、応対はもっぱら書と身振りによる。'
      + '政治的な一切の関与を拒むが、竜の帰還にあたっては例外的に外部へ呼びかけを行った。'
      + '成員の数は四名を超えたことがないと伝えられる。'
      + '書による応対は、外部の者にとって著しく時間を要する。それでも訪問が絶えないのは、ここでしか得られない知識があるためである。'
      + '住まいへ至る道は七千段の階として数えられ、途中に刻まれた碑文が順路を示す。',
    aims: ['声の道の修得', '沈黙の維持', '呼ぶべき者を呼ぶこと'],
    seat: 'ハイフロスガー', seatNote: 'ホワイトラン領・世界の喉',
    people: [
      { ja: 'アーンゲール', race: 'nord', headgear: 'cowl', hair: 'none', garment: 'robe', note: '外部との応対を担う' },
      { ja: 'ボリ', race: 'nord', headgear: 'cowl', hair: 'none', garment: 'robe', note: '沈黙の戒を守る' },
      { ja: 'エインサー', race: 'nord', headgear: 'cowl', hair: 'none', garment: 'robe', note: '書によって応対する' },
    ],
    quote: '彼らは呼んだ。それだけで、山の雪が動いた。',
  },

  // ══ II. 国家・軍事（続き） ═════════════════════════
  stormcloaks: {
    door: 'open', scale: 'great', reach: 'province', state: 'active',
    summary:
      'ウィンドヘルムを本拠とする反乱勢力。'
      + '白金協定によるタロス信仰の禁圧を直接の契機として蜂起した。'
      + '兵力の大半は正規の訓練を受けていない志願兵で、装備と補給の点で帝国軍に大きく劣る。'
      + '一方で、領内の住民からの補給と情報の提供を受けやすい。'
      + '掲げる大義が信仰の自由であるにもかかわらず、'
      + '本拠地における非ノルド住民の処遇について複数の告発が残る点は、記録として付す。'
      + '指揮系統は首長の個人的な信任に依存しており、後継の規定を持たない。これが軍としてのこの勢力の最大の脆弱点である、という指摘は帝国側からも反乱側からも出ている。',
    aims: ['タロス信仰の回復', '州の独立', '外来勢力の排除'],
    seat: 'ウィンドヘルム', seatNote: 'イーストマーチ領・王の宮殿',
    people: [
      { ja: 'ウルフリック', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'fur', note: '首長。蜂起の首謀' },
      { ja: 'ガルマル', race: 'nord', headgear: 'horned', hair: 'none', garment: 'fur', note: '副将' },
      { ja: 'ラルフ', race: 'nord', headgear: 'helm', hair: 'none', garment: 'mail', note: '募兵を担う' },
    ],
    quote: '我らの声を、我らの口で。',
  },
  penitus: {
    door: 'closed', scale: 'small', reach: 'imperial', state: 'active',
    summary:
      '皇帝の身辺警護と諜報を担う帝国の機関。'
      + '軍の指揮系統には属さず、皇帝に直属する。'
      + '州内には少数の要員を置くにとどまるが、その配置は帝国軍にも通知されていない。'
      + '闇の一党の掃討を任務のひとつとし、これに関しては相当の成果を挙げている。'
      + '本機関に関する一次記録はほとんど公開されておらず、本項の記述は外部の観察による。'
      + '州内での活動が表面化したのは、闇の一党の聖域が壊滅した一件のみである。それ以前の記録は存在しないが、存在しなかったことを意味しない。',
    aims: ['皇帝の護衛', '暗殺組織の掃討', '州内情勢の報告'],
    seat: 'ドーンスター', seatNote: 'ペイル領・前線司令部',
    people: [
      { ja: 'マロ', race: 'human', headgear: 'helm', hair: 'none', garment: 'plate', note: '司令官' },
      { ja: 'グナル', race: 'nord', headgear: 'helm', hair: 'none', garment: 'mail', note: '前線要員' },
      { ja: 'ガイウス・マロ', race: 'human', headgear: 'none', hair: 'short', garment: 'mail', note: '司令官の子。巡察' },
    ],
    quote: '皇帝の目は、皇帝のいない場所にこそ置かれる。',
  },
  moot: {
    door: 'blood', scale: 'mid', reach: 'province', state: 'waning',
    summary:
      '九領の首長による合議体。上級王の空位に際して後継を選出する権能を持つ。'
      + '内戦のあいだ招集が停止しており、第四紀の現在、機能していない。'
      + '本項を「衰退」に分類するのはこの停止によるものであり、制度そのものの廃止を意味しない。'
      + '招集の権限が誰にあるのかについては、内戦の当事者双方が異なる解釈を主張している。'
      + '制度上、招集を要するのは上級王が空位となった場合に限られる。内戦の当事者双方が自らを上級王と称している現状では、空位であるか否かの判定自体が争点となる。',
    aims: ['上級王の選出', '領間の紛争の調停', '招集権の帰属の確定'],
    seat: '不定', seatNote: '招集地は都度定められる',
    people: [
      { ja: 'バルグルーフ', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'fur', note: 'ホワイトラン首長' },
      { ja: 'エリシフ', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'robe', note: 'ハーフィンガル首長' },
      { ja: 'ラエロフ', race: 'nord', headgear: 'circlet', hair: 'braid', garment: 'fur', note: 'リフト首長' },
    ],
    quote: '招集する者がいない。招集される側は、全員そろっている。',
  },
  eastempire: {
    door: 'open', scale: 'great', reach: 'imperial', state: 'waning',
    summary:
      '帝国の勅許を受けた交易会社。'
      + 'ウィンドヘルムに州内の拠点を置き、鉱産物と木材の海上輸送を担う。'
      + '内戦による航路の不安定化と、盗賊組合による継続的な損害により、'
      + '第四紀の現在、州内事業は縮小の一途をたどる。'
      + '会社としての性格上、内戦のいずれの側にも表立って与しないが、'
      + '港の安定を求める点で帝国側の利害と一致する。'
      + '倉庫の損害は帳簿に計上され続けており、その額は州内事業の年間利益を上回る年が続いている。それでも撤退しないのは、採掘権の失効を避けるためである。',
    aims: ['航路の安全確保', '倉庫損害の抑止', '採掘権の維持'],
    seat: 'ウィンドヘルム', seatNote: 'イーストマーチ領・港湾倉庫',
    people: [
      { ja: 'オーソス', race: 'elf', headgear: 'none', hair: 'short', garment: 'robe', note: '州内代理人' },
      { ja: 'スティグ', race: 'nord', headgear: 'none', hair: 'short', garment: 'leather', note: '船長' },
      { ja: 'ヴィットリア・ヴィキ', race: 'human', headgear: 'circlet', hair: 'long', garment: 'robe', note: 'ソリチュード支社の長' },
    ],
    quote: '旗はどちらでもよい。港が開いていればよい。',
  },

  // ══ III. 敵対組織 ═════════════════════════════════
  silverhand: {
    door: 'closed', scale: 'small', reach: 'province', state: 'active',
    summary:
      '狼憑きの根絶を目的とする狩人の集団。'
      + '銀の武具を用いることからこの名で呼ばれる。'
      + '同胞団の内円に対する敵意を主たる動機とするが、'
      + '討伐の対象を狼憑きに限定しない事例が複数記録されており、'
      + '住民からは同胞団と同様の武装集団としてしか区別されていない。'
      + '統一された指揮系統を持たず、複数の砦に分散して活動する。'
      + '銀の調達をシルバー・ブラッド家に依存しており、この一点においてのみ、この集団は外部の統制を受ける。'
      + '砦の数と所在は記録のたびに変動しており、常時の総数は不明である。',
    aims: ['狼憑きの根絶', '同胞団内円の摘発', '銀の確保'],
    seat: '不定', seatNote: '州内の複数の砦',
    people: [
      { ja: 'クリーヴ', race: 'nord', headgear: 'helm', hair: 'none', garment: 'mail', note: '一党の頭' },
      { ja: 'スカイル', race: 'nord', headgear: 'none', hair: 'braid', garment: 'leather', note: '追跡' },
      { ja: '砦頭のひとり', race: 'nord', headgear: 'helm', hair: 'none', garment: 'leather', note: '名を伝えない' },
    ],
    quote: '銀を持つ者が正しいとは、誰も言っていない。',
  },
  vigilants: {
    door: 'trial', scale: 'small', reach: 'province', state: 'remnant',
    summary:
      '慈悲の神ステンダールに仕え、デイドラの信仰とその産物を追跡した組織。'
      + '大戦後の混乱期に勢力を拡大したが、第四紀の現在、'
      + '拠点の大半が失われ、活動は散発的な巡回にとどまる。'
      + '装備を持たず祈祷のみで対処するという方針が、'
      + '損耗の主因であったとする批判が組織の外部から繰り返し提出されている。'
      + 'ドーンガードの成員には、この組織の元構成員が含まれる。'
      + '本部の焼失以後、成員の名簿が失われた。現在活動している者が何名であるかを、組織自身が把握していない。',
    aims: ['デイドラ信仰の摘発', '呪物の封印', '拠点の再建'],
    seat: '不定', seatNote: '巡回。本部は焼失',
    people: [
      { ja: 'カルセッテ', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '守人の長' },
      { ja: 'トラン', race: 'nord', headgear: 'cowl', hair: 'none', garment: 'robe', note: '巡回。祠堂で消息を絶つ' },
      { ja: 'ティラヌス', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '捜索にあたった一人' },
    ],
    quote: '祈りは武具ではない。それを教えたのは、彼らの死体である。',
  },
  forsworn: {
    door: 'blood', scale: 'mid', reach: 'hold', state: 'active',
    summary:
      'リーチの原住民のうち、帝国および現在の領主による統治を認めない者たち。'
      + '第四紀のはじめに一度リーチの支配を回復したが、'
      + '帝国軍と地元の名家の連合により短期間で覆された。'
      + '以後は山地に拠って抵抗を続ける。'
      + '「反逆者」の名は他称であり、彼ら自身は自らを本来の民と呼ぶ。'
      + '本書がこの名を見出しに用いるのは、記録上の通用に従うためである。'
      + '儀礼にはグレンモリルの魔女が関与するが、指揮関係は無い。この点を混同した記録が多いため、本書では両者を別項として扱う。',
    aims: ['リーチの奪還', '外来の統治の拒絶', '古い儀礼の保持'],
    seat: '不定', seatNote: 'リーチ領・山地の野営',
    people: [
      { ja: 'マドナック', race: 'human', headgear: 'horned', hair: 'long', garment: 'fur', note: 'リーチの王を称する' },
      { ja: 'ケイリー', race: 'human', headgear: 'none', hair: 'braid', garment: 'fur', note: '斥候' },
      { ja: 'ハグレイヴン', race: 'human', headgear: 'none', hair: 'long', garment: 'fur', note: '祭祀を司る' },
    ],
    quote: '奪い返す、と彼らは言う。奪ったのはどちらか、という問いが残る。',
  },
  psijic: {
    door: 'closed', scale: 'small', reach: 'beyond', state: 'active',
    summary:
      'アルテウム島を本拠とする最古の術者の結社。'
      + '第四紀のはじめに島ごと姿を消し、以後、外部との接触を絶っていた。'
      + '近年、州内で成員の目撃が散発的に報告されている。'
      + 'ウィンターホールド大学はこの結社から分岐したとする説が有力だが、'
      + '結社の側がこれを認めた記録はない。'
      + 'サルモールとは、術の統制をめぐって長く対立関係にある。'
      + '目撃の報告はいずれも、当事者が単独でいた場面に集中している。複数人の面前に現れた記録は一件も無い。',
    aims: ['（明示されていない）', '介入の時機の判断'],
    seat: '不定', seatNote: 'アルテウム島の所在は不明',
    people: [
      { ja: 'クァラン', race: 'elf', headgear: 'hood', hair: 'none', garment: 'robe', note: '来訪者' },
      { ja: 'ネリエン', race: 'elf', headgear: 'hood', hair: 'none', garment: 'robe', note: '警告を伝えた者' },
      { ja: 'イアケシス', race: 'elf', headgear: 'circlet', hair: 'long', garment: 'robe', note: '儀式長。第二紀' },
    ],
    quote: '島は沈んだのではない。見えなくなっただけだ、と彼らは言う。',
  },
  synod: {
    door: 'open', scale: 'mid', reach: 'imperial', state: 'active',
    summary:
      'シロディールに拠点を置く術者の団体。帝国の後援を受ける。'
      + '遺跡の調査と術具の収集を主たる活動とし、'
      + '州内には調査隊を派遣する形で関与する。'
      + '学院とは目的を共有しながら、'
      + '帝国との距離の取り方において根本的に異なる立場をとる。'
      + '調査隊の帰還率が低いことが、この団体に関する記録の乏しさの一因である。'
      + '州内の遺跡に関する調査許可を各領の首長に申請しているが、内戦下では処理されないまま滞留している。'
      + '州内における常設の拠点は、本書の調査では確認されなかった。',
    aims: ['遺跡の調査', '術具の収集', '帝国の後援の維持'],
    seat: '不定', seatNote: '州内には常設拠点を持たない',
    people: [
      { ja: 'ガヴロス・プリニウス', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '調査隊長' },
      { ja: 'パラトゥス・デキミウス', race: 'human', headgear: 'none', hair: 'short', garment: 'robe', note: '助手。生存者' },
      { ja: '使節', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '名を伝えない' },
    ],
    quote: '帰らなかった隊のほうが多い。それでも次の隊は出る。',
  },
  moragtong: {
    door: 'closed', scale: 'small', reach: 'beyond', state: 'remnant',
    summary:
      'モロウウィンドにおいて、法の内側で殺害を執行してきた組織。'
      + '寺院の認可のもとに「処刑令状」を発行し、これに基づく殺害は合法とされた。'
      + '寺院の権威の失墜とともに令状の効力も失われ、現在は残存する成員が散発的に活動する。'
      + '闇の一党はこの組織から分岐したものであり、両者は互いを僭称者と呼ぶ。'
      + '本書は分岐の是非を判定しない。'
      + '令状を持たない殺害を厳に禁じるが、令状の発行元が消滅した現在、この規定は事実上すべての活動を禁じることになる。それでも規定は改められていない。',
    aims: ['令状の効力の回復', '寺院の復権', '僭称者の排除'],
    seat: 'モロウウィンド', seatNote: '州内での活動は稀',
    people: [
      { ja: 'テネル', race: 'elf', headgear: 'cowl', hair: 'none', garment: 'leather', note: '令状執行者' },
      { ja: '書記', race: 'elf', headgear: 'hood', hair: 'none', garment: 'robe', note: '令状を発行した' },
      { ja: '残存の一人', race: 'elf', headgear: 'cowl', hair: 'none', garment: 'leather', note: '州内で確認された' },
    ],
    quote: '我らの殺しには書面がある。あちらにはない。',
  },
  alikr: {
    door: 'blood', scale: 'small', reach: 'beyond', state: 'active',
    summary:
      'ハンマーフェルのアリキール砂漠に由来する傭兵の集団。'
      + '州内では特定の人物の追跡を目的として活動する。'
      + '帝国の司法権を認めず、独自の判断で拘束を行うため、'
      + '各領の衛兵と繰り返し衝突している。'
      + '出身地の政治的経緯——大戦後にハンマーフェルが帝国から離脱した事実——を'
      + '背景として理解しなければ、この集団の行動は説明できない。'
      + '各領の衛兵は、この集団を賞金稼ぎとして扱う場合と、外国の武装勢力として扱う場合とがあり、対応が統一されていない。',
    aims: ['対象の身柄の確保', '帝国の司法権の否認'],
    seat: '不定', seatNote: '州内を移動',
    people: [
      { ja: 'ケマトゥ', race: 'human', headgear: 'hood', hair: 'none', garment: 'leather', note: '一隊の長' },
      { ja: '隊士', race: 'human', headgear: 'hood', hair: 'none', garment: 'leather', note: '追跡を担う' },
      { ja: '隊士', race: 'human', headgear: 'none', hair: 'short', garment: 'leather', note: '市門で拘束された' },
    ],
    quote: '我々の法は、ここには届いていない。だから自分で運んできた。',
  },
  shadows: {
    door: 'closed', scale: 'unknown', reach: 'imperial', state: 'active',
    summary:
      'サマーセット島に由来するとされる隠密の組織。'
      + 'サルモールの公的な機構には含まれないが、'
      + 'その活動が自治領の利害と一致することは複数の事例で確認されている。'
      + '存在を裏づける一次記録は乏しく、本項の記述は'
      + '複数の失踪事件に共通する手口の一致に基づく推定を含む。'
      + '推定である旨は、以下の記述全体にかかる。'
      + '手口の一致を根拠とする推定であるため、模倣による誤認の可能性を排除できない。本書はこの限界を明示したうえで項を立てる。',
    aims: ['（推定）自治領に不都合な人物の排除', '（推定）情報の遮断'],
    seat: '不定', seatNote: '拠点は特定されていない',
    people: [
      { ja: '目撃された一人', race: 'elf', headgear: 'cowl', hair: 'none', garment: 'leather', note: '背丈のみ一致する' },
      { ja: '失踪者の同行者', race: 'elf', headgear: 'hood', hair: 'none', garment: 'robe', note: '以後の記録がない' },
      { ja: '模倣と判定された者', race: 'human', headgear: 'cowl', hair: 'none', garment: 'leather', note: '別件で拘束' },
    ],
    quote: '手口が同じだ、という以外に、共通するものが何もない。',
  },

  // ══ IV. 商業・名家（続き） ═════════════════════════
  silverblood: {
    door: 'blood', scale: 'mid', reach: 'hold', state: 'active',
    summary:
      'マルカルスの銀鉱と、それに付随する労役施設を支配する家系。'
      + '領の首長は名目上の統治者であり、実務の決定権はこの家にあるとする観察が一致している。'
      + 'シドナ鉱山を私営の監獄として運用しており、'
      + '判決を受けた者がそのまま採掘に投入される仕組みが、家の収益の基礎をなす。'
      + 'フォースウォーンとの対立は経済的な理由による。'
      + 'リーチの原住民が鉱区を主張する限り、この家は彼らを反逆者と呼び続ける。'
      + '家の内部の継承については外部に公開された記録がなく、当主の交代は事後に知られるのが常である。',
    aims: ['銀鉱の独占', '労役の確保', 'リーチにおける原住民の主張の否認'],
    seat: 'マルカルス', seatNote: 'リーチ領・シドナ鉱山',
    people: [
      { ja: 'トンギヴァー', race: 'nord', headgear: 'circlet', hair: 'short', garment: 'robe', note: '当主' },
      { ja: 'ソンギヴァー', race: 'nord', headgear: 'none', hair: 'short', garment: 'leather', note: '鉱山の管理' },
      { ja: 'ベトリッド', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'robe', note: '当主の妻' },
    ],
    quote: '首長は宮殿にいる。決めるのは、鉱山にいる者だ。',
  },
  battleborn: {
    door: 'blood', scale: 'small', reach: 'hold', state: 'active',
    summary:
      'ホワイトランの二大家系のひとつ。帝国との結びつきを家の方針とする。'
      + '交易と土地の保有を基盤とし、領内の徴税と兵站に関与する。'
      + 'グレイ・メーン家との対立は、内戦の勃発以前から続く土地と婚姻をめぐる係争に淵源を持ち、'
      + '内戦はこれに政治的な名目を与えたにすぎない。'
      + '両家の対立は領の運営に直接の支障をきたしており、首長はこれを繰り返し調停している。'
      + '両家の男子が互いの結婚式に招かれなくなって久しい。領の記録には、招待状の写しが片方の家にのみ残っている年が複数ある。',
    aims: ['帝国との関係の維持', '領内における優位の確保', '対立家の影響力の削減'],
    seat: 'ホワイトラン', seatNote: 'ホワイトラン領・バトル・ボーン邸',
    people: [
      { ja: 'オルフィナ', race: 'nord', headgear: 'none', hair: 'long', garment: 'robe', note: '当主の娘' },
      { ja: 'イドルフ', race: 'nord', headgear: 'none', hair: 'short', garment: 'mail', note: '長子。軍務' },
      { ja: 'オルフリド', race: 'nord', headgear: 'none', hair: 'short', garment: 'robe', note: '当主' },
    ],
    quote: '争いは内戦より古い。名目のほうが後から来た。',
  },
  graymane: {
    door: 'blood', scale: 'small', reach: 'hold', state: 'active',
    summary:
      'ホワイトランの二大家系のひとつ。鍛冶を家業とし、タロス信仰を公言する。'
      + '公言そのものが白金協定に抵触するため、'
      + 'この家の存続はホワイトラン首長の黙認に依存している。'
      + '子の一人が反乱側に投じたのち消息を絶っており、'
      + 'その捜索が家としての最大の関心事となっている。'
      + '鍛冶の技術水準は州内で最も高い部類に属し、この点については対立家も否定しない。'
      + '鍛冶の技術は口伝によってのみ継承され、書き留められていない。継承者が絶えれば技術も絶えるという点で、この家は自らの存続に強い動機を持つ。',
    aims: ['信仰の保持', '失踪した子の捜索', '鍛冶の伝承'],
    seat: 'ホワイトラン', seatNote: 'ホワイトラン領・グレイ・メーン邸',
    people: [
      { ja: 'エオルンド', race: 'nord', headgear: 'none', hair: 'long', garment: 'leather', note: '鍛冶。天空炉を使う' },
      { ja: 'フラルディア', race: 'nord', headgear: 'none', hair: 'long', garment: 'robe', note: '当主の妻' },
      { ja: 'ヴィグナル', race: 'nord', headgear: 'none', hair: 'long', garment: 'fur', note: '一族の長老' },
    ],
    quote: '炉は消していない。名も、まだ呼んでいる。',
  },

  // ══ V. 宗教・信仰（続き） ═════════════════════════
  auriel: {
    door: 'blood', scale: 'small', reach: 'local', state: 'extinct',
    summary:
      '雪の民が奉じた太陽神アーリエルの祭祀組織。'
      + '第一紀にノルドとの戦に敗れた後、地下へ退いた民の一部が信仰を保ったが、'
      + '地下での変質によって民そのものが失われ、組織は事実上断絶した。'
      + '峡谷の奥に聖堂の遺構が現存し、'
      + '最後の騎士を名乗る一名が、単独でこれを守っているという報告がある。'
      + '本項を「滅亡」に分類するのは組織としての判断であり、報告の真偽とは別である。'
      + '報告のある人物は、自らを騎士団の最後の一人と称する。称する相手が現れない状態が数千年続いているため、その称号を検証する手段は無い。',
    aims: ['（組織としての目的は失われている）', '聖堂の維持', '弓の守護'],
    seat: '不定', seatNote: 'ハーフィンガル領・忘れられた谷',
    people: [
      { ja: 'ゲルミール', race: 'elf', headgear: 'helm', hair: 'none', garment: 'plate', note: '最後の騎士を称する' },
      { ja: 'ヴィルスール', race: 'elf', headgear: 'circlet', hair: 'none', garment: 'robe', note: '大司祭。堕落した' },
      { ja: '巡礼者', race: 'elf', headgear: 'hood', hair: 'none', garment: 'robe', note: '雪エルフ。名を伝えない' },
    ],
    quote: '守るべき民がいない。それでも聖堂は掃かれている。',
  },
  moth: {
    door: 'trial', scale: 'small', reach: 'imperial', state: 'active',
    summary:
      '星霜の書の解読を唯一の職務とする僧団。'
      + '解読には視力の喪失が伴い、この犠牲は入団時に告知される。'
      + '書を読み得る者が極めて少ないため、成員数は常に十数名にとどまる。'
      + '帝国の後援を受けるが、解読の内容については帝国にも報告義務を負わない。'
      + '州内には、竜の帰還に関連して一名が派遣された記録が残る。'
      + '解読された内容の一部は、解読者本人にも意味が理解できないまま口述される。僧団はこれを欠陥ではなく、書の性質と説明する。',
    aims: ['星霜の書の解読', '解読手順の伝承', '書の所在の把握'],
    seat: '不定', seatNote: '州内には常設拠点を持たない',
    people: [
      { ja: 'デクスィオン', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '解読僧。失明' },
      { ja: '先任の解読僧', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '失明。名を伝えない' },
      { ja: '写字僧', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '帝都の書庫に属する' },
    ],
    quote: '読めば見えなくなる。それでも読む者がいなければ、書は無いに等しい。',
  },
  tribunal: {
    door: 'open', scale: 'mid', reach: 'beyond', state: 'extinct',
    summary:
      'モロウウィンドにおいて三柱の生ける神を奉じた教団。'
      + '第三紀末に神格が失われ、以後は聖人の崇敬へ移行したが、'
      + 'レッドマウンテンの噴火と民の離散により組織としては解体した。'
      + '本項を「滅亡」に分類するのは、教義の継承者が現存しないためである。'
      + 'モラグ・トングに処刑令状を発行していたのはこの教団であり、'
      + '令状の効力が失われたのは、発行者が消滅したことによる。'
      + '寺院の建物の多くは他の用途に転用されたが、内陣の三つの壇だけは、いずれの転用先でも撤去されずに残されている例が多い。',
    aims: ['（組織としての目的は失われている）', '聖人の崇敬', '令状の効力の根拠'],
    seat: 'モロウウィンド', seatNote: '寺院は大半が失われた',
    people: [
      { ja: 'ヴィベク', race: 'elf', headgear: 'circlet', hair: 'long', garment: 'robe', note: '三柱の一' },
      { ja: 'アルマレクシア', race: 'elf', headgear: 'circlet', hair: 'long', garment: 'robe', note: '三柱の一' },
      { ja: 'ソーサ・シル', race: 'elf', headgear: 'none', hair: 'none', garment: 'robe', note: '三柱の一' },
    ],
    quote: '神が三柱いた。いなくなったのは、神のほうが先だった。',
  },

  // ══ VI. 秘教・カルト ══════════════════════════════
  namira: {
    door: 'closed', scale: 'small', reach: 'local', state: 'active',
    summary:
      '腐敗と忌避を司る神格に仕える信徒の集まり。'
      + '共食の儀礼を中核とし、これを外部に露見させないために'
      + '日常的には正規の共同体の内側に潜伏する。'
      + 'マルカルスの地下祠堂において、'
      + '司祭が公認の聖職者として振る舞っていた事例が発覚しており、'
      + 'この形態がこの信仰に固有のものであるか否かについては判断が保留されている。'
      + '発覚後、当該の司祭は聖堂の職を解かれたが、祠堂そのものは封鎖されたのみで取り壊されていない。理由は記録されていない。',
    aims: ['共食の儀礼の継続', '潜伏の維持', '忌避されるものの聖別'],
    seat: 'マルカルス', seatNote: 'リーチ領・地下祠堂',
    people: [
      { ja: 'エオラ', race: 'nord', headgear: 'hood', hair: 'none', garment: 'robe', note: '祠堂の司祭' },
      { ja: '会衆の一人', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '名を伝えない' },
      { ja: 'ヴェルルス', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '祠堂の管理者。殺害される' },
    ],
    quote: '祠堂は聖堂の下にあった。上と下で、別の神が祀られていた。',
  },
  miraak: {
    door: 'closed', scale: 'small', reach: 'local', state: 'active',
    summary:
      'ソルスセイムにおいて、最初のドヴァキンを名乗る者に従う信徒。'
      + '信徒は自らが従っていることを自覚せず、'
      + '石造物の建設に従事しながら、その記憶を保持しない。'
      + '本項を「秘教」に分類するのは、儀礼の秘匿によるのではなく、'
      + '信徒自身に対して秘匿されているという特異な構造による。'
      + 'スカール族はこの現象を「石の呼び声」と呼び、単独で抵抗を続けている。'
      + '石造物の位置は、島の地図上でひとつの図形を成すという指摘がある。図形の意味は解明されていない。',
    aims: ['石造物の建設', '主の帰還の準備'],
    seat: 'ソルスセイム', seatNote: '各地の石造物',
    people: [
      { ja: 'ミラーク', race: 'nord', headgear: 'horned', hair: 'none', garment: 'robe', note: '初代の竜司祭' },
      { ja: '使徒', race: 'nord', headgear: 'hood', hair: 'none', garment: 'fur', note: '名を伝えない' },
      { ja: '石工', race: 'nord', headgear: 'none', hair: 'short', garment: 'fur', note: '支配下の労役に就く' },
    ],
    quote: '働いている者に訊いても、何をしていたか答えられない。',
  },
  glenmoril: {
    door: 'blood', scale: 'small', reach: 'local', state: 'active',
    summary:
      'リーチの洞窟に住む魔女の系統。'
      + '狼憑きの呪いの起源に関与したとされ、'
      + '同胞団の内円が現在も負う血の由来はこの系統に遡る。'
      + '呪いを与えることと解くことの双方を行い、'
      + 'いずれの場合も対価を要求する。'
      + 'フォースウォーンとは協力関係にあるが、指揮を受ける立場にはない。'
      + '対価は金銭ではない場合が多く、何が求められるかは事前に告げられない。これを理由に取引を中断した者の記録は、ひとつも残っていない。'
      + '系統に属する者の数は判明していない。姉妹という呼称が実際の血縁を指すのかも確かめられていない。',
    aims: ['呪いの管理', '対価の徴収', '洞窟の秘匿'],
    seat: '不定', seatNote: 'リーチ領・グレンモリル洞窟',
    people: [
      { ja: '姉妹の一人', race: 'human', headgear: 'hood', hair: 'long', garment: 'fur', note: '呪いを与える側' },
      { ja: '姉妹の一人', race: 'human', headgear: 'none', hair: 'long', garment: 'fur', note: '呪いを解く側' },
      { ja: '姉妹の一人', race: 'human', headgear: 'hood', hair: 'none', garment: 'fur', note: '洞窟に留まる' },
    ],
    quote: '与えることも、解くことも、同じ値段である。',
  },
  mythicdawn: {
    door: 'closed', scale: 'small', reach: 'imperial', state: 'remnant',
    summary:
      '第三紀末、オブリビオンの動乱を引き起こした教団の残党。'
      + '本体は動乱の終結とともに壊滅したが、'
      + '教典の写本を保持する少数の信徒が各地に潜伏している。'
      + '第四紀の現在、州内で組織的な活動は確認されていない。'
      + '本項を立てるのは、この教団に関する記録が'
      + '「一度滅びた組織がどのように残るか」の典型例をなすためである。'
      + '写本の売買は禁書として取り締まりの対象だが、押収された部数は年ごとに増えている。刷られ続けていることを示す。',
    aims: ['教典の保全', '主の再来の準備'],
    seat: '不定', seatNote: '潜伏。拠点は特定されていない',
    people: [
      { ja: 'マンカー・カモラン', race: 'human', headgear: 'circlet', hair: 'long', garment: 'robe', note: '開祖。動乱の首謀' },
      { ja: 'シルス・ヴェスイウス', race: 'human', headgear: 'none', hair: 'short', garment: 'robe', note: '信徒の子孫。収集家' },
      { ja: '潜伏する信徒', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '名を伝えない' },
    ],
    quote: '滅びたはずの教団の書が、いまも売り買いされている。',
  },
  peryite: {
    door: 'closed', scale: 'small', reach: 'local', state: 'active',
    summary:
      '疫病と秩序を同時に司る神格に仕える信徒。'
      + 'この二つが同一の神格に帰せられる点が、'
      + 'この信仰を他のデイドラ信仰から分ける最大の特徴である。'
      + '信徒は疫病を無秩序の是正とみなし、'
      + '自らの罹患を任務の遂行と解釈する。'
      + '結果として、この信仰の集団は例外なく短命に終わる。'
      + '祭壇の周囲には常に複数の遺体があり、そのいずれもが同一の症状を示す。信徒は遺体を片づけないため、祭壇の場所は容易に特定できる。'
      + '祭壇は州内の複数箇所で確認されており、いずれも人里から離れ、水源の上流にあたる位置を占める。',
    aims: ['疫病の伝播', '秩序の回復', '罹患による証明'],
    seat: '不定', seatNote: '州内の廃坑',
    people: [
      { ja: 'カースティ', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '祭壇の守り手' },
      { ja: '参籠者', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '罹患したまま留まる' },
      { ja: '記録者', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '症状を書き留めた' },
    ],
    quote: '疫病は乱れではない。乱れを正すものだ、と彼らは言う。',
  },
  idealmasters: {
    door: 'closed', scale: 'unknown', reach: 'beyond', state: 'active',
    summary:
      '魂の売買を行う存在の総称。個体としての姿を持たず、'
      + '結晶体としてのみ観測される。'
      + '契約者に力を与える代わりに、契約者自身の魂を領域へ引き取る。'
      + '本項を「組織」として扱うことには異論があり得るが、'
      + '複数の契約が同一の条件と同一の手続きで成立している以上、'
      + '制度としての実体は認めざるを得ない。'
      + '契約者の遺族が契約の無効を申し立てた事例が複数あるが、申立を受理する機関が存在しない。'
      + '本項の記述は、契約の場から生還したと称する者の証言に依存している。証言者の数はきわめて少ない。',
    aims: ['魂の収集', '契約の履行の強制'],
    seat: '不定', seatNote: 'ソウル・ケルン',
    people: [
      { ja: '第一の結晶体', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '個体名を持たない' },
      { ja: '第二の結晶体', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '発話は同時に行われる' },
      { ja: '第三の結晶体', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '姿を見た者がいない' },
    ],
    quote: '相手の姿を見た者はいない。契約の文言だけが、繰り返し同じである。',
  },
  daedriccults: {
    door: 'closed', scale: 'mid', reach: 'imperial', state: 'active',
    summary:
      '十六の王それぞれに仕える信徒団の総称であり、単一の組織ではない。'
      + '本書がこれを一項にまとめるのは、'
      + '各信徒団が互いに連絡を持たず、独立して成立しているためである。'
      + '共通するのは、公認された祭祀の外にあること、'
      + 'そして祭壇が人里から一定の距離を保って置かれることの二点にとどまる。'
      + '個別の信徒団のうち、記録が十分に得られたものは別項を立てた。'
      + '祭壇の位置が人里から一定の距離を保つのは、信仰の性質によるのではなく、摘発を避けた結果である可能性が高い。',
    aims: ['各王への奉仕', '祭壇の維持', '摘発の回避'],
    seat: '不定', seatNote: '州内各地の祭壇',
    people: [
      { ja: 'メエルーンズ・デイゴンの信徒', race: 'human', headgear: 'hood', hair: 'none', garment: 'robe', note: '名を伝えない' },
      { ja: 'モラグ・バルの信徒', race: 'human', headgear: 'cowl', hair: 'none', garment: 'robe', note: '名を伝えない' },
      { ja: 'ボエシアの信徒', race: 'human', headgear: 'none', hair: 'long', garment: 'leather', note: '名を伝えない' },
    ],
    quote: '十六の王がいて、十六の別々の話がある。共通するのは祭壇の位置だけだ。',
  },

  // ══ VII. 部族・辺境・その他 ═══════════════════════
  skaal: {
    door: 'blood', scale: 'small', reach: 'local', state: 'active',
    summary:
      'ソルスセイム北岸の村に住むノルド系の民。'
      + '「全ての創造主」と呼ぶ単一の神格を奉じ、'
      + '土地から取ったものは必ず返すという規範を生活の全般に適用する。'
      + '外部との交易をほとんど行わず、'
      + 'テルヴァンニ家とも一定の距離を保つ。'
      + 'ミラークの信徒による影響に対し、州内で唯一、組織的な抵抗を維持している。'
      + '村の人口は百に満たない。それでも組織的な抵抗を維持できているのは、規範が生活の全般に及んでいるためだと考えられる。'
      + '村への訪問に事前の許可は要らないが、記録を取ることは慣例として好まれない。',
    aims: ['土地との均衡の保持', '石の呼び声への抵抗', '外部からの干渉の拒絶'],
    seat: 'ソルスセイム', seatNote: 'スカール村',
    people: [
      { ja: 'ストゥルン', race: 'nord', headgear: 'hood', hair: 'none', garment: 'fur', note: '賢者' },
      { ja: 'フレア', race: 'nord', headgear: 'none', hair: 'braid', garment: 'fur', note: '狩人' },
      { ja: 'バルドー', race: 'nord', headgear: 'none', hair: 'braid', garment: 'fur', note: '鍛冶' },
    ],
    quote: '取ったものは返す。返せぬものは取らない。',
  },
  redoran: {
    door: 'blood', scale: 'mid', reach: 'beyond', state: 'active',
    summary:
      'モロウウィンドの大家のひとつ。名誉と軍務を家風とする。'
      + 'レッドマウンテンの噴火以後、'
      + '避難民の受け入れと防衛の実務を担ったことにより、'
      + '大家のうちで最も高い威信を保っている。'
      + '州内には難民として移住した家人が少数居住するが、'
      + '家としての組織的な進出は行っていない。'
      + '州内に居住する家人は、家としての指示を受けていない。それでも家名を名乗り続けている点に、この家の性格がよく表れている。'
      + '州内の家人が家名において結んだ取引を、本国の家が追認した例は、いまのところ確認されていない。',
    aims: ['避難民の保護', '軍務の遂行', '家名の保持'],
    seat: 'モロウウィンド', seatNote: 'ブラックライト',
    people: [
      { ja: 'ラロー・モーヴェイン', race: 'elf', headgear: 'circlet', hair: 'none', garment: 'robe', note: '評議員' },
      { ja: 'ヴェレス', race: 'elf', headgear: 'helm', hair: 'none', garment: 'plate', note: '守備隊長' },
      { ja: 'アドリル・アラノ', race: 'elf', headgear: 'none', hair: 'short', garment: 'robe', note: '第一顧問' },
    ],
    quote: '名誉とは、退かなかった回数のことである。',
  },
  orcstrongholds: {
    door: 'blood', scale: 'small', reach: 'province', state: 'active',
    summary:
      '州内各地に点在するオークの自治集落。'
      + '各砦は互いに独立し、族長がひとりで統治する。'
      + '帝国の法は名目上及ぶが、実際には砦ごとの掟が優先される。'
      + '外来者の立ち入りは原則として拒まれるが、'
      + '血の代償を支払った者には成員としての資格が与えられる慣習が残る。'
      + '砦の数は減少を続けており、この形態の存続を危ぶむ観察が多い。'
      + '砦を離れた者は帰還を認められない慣習があり、この一方通行の規定が、人口の減少を加速させている。'
      + '砦の総数について、帝国側の統計と各砦の申告は一致しない。',
    aims: ['砦の自治の維持', 'マラキャスへの奉仕', '族長の血統の継承'],
    seat: '不定', seatNote: '州内の複数の砦',
    people: [
      { ja: 'ラーカク', race: 'orc', headgear: 'none', hair: 'topknot', garment: 'fur', note: '族長' },
      { ja: 'ゴル', race: 'orc', headgear: 'helm', hair: 'none', garment: 'mail', note: '鍛冶' },
      { ja: 'ブルグク', race: 'orc', headgear: 'none', hair: 'topknot', garment: 'fur', note: '別の砦の族長' },
    ],
    quote: '砦の掟は帝国の法より古い。だから帝国の法のほうが譲る。',
  },
  khajiitcaravans: {
    door: 'blood', scale: 'small', reach: 'province', state: 'active',
    summary:
      '州内の主要都市を巡回する隊商。'
      + '第四紀の現在、いずれの都市も城壁内への立ち入りを認めておらず、'
      + '市門の外に天幕を張って取引を行う。'
      + '自治領の統治下にあるエルスウェアの出身であるため、'
      + '住民からはしばしばサルモールの通報者と見なされるが、'
      + 'これを裏づける記録は本書の調査では得られなかった。'
      + '城壁内への立ち入りを求める請願は各領に繰り返し提出されているが、内戦の勃発以後、いずれも保留のまま処理されていない。'
      + '巡回路は季節によって変わり、冬季には南部の三都市のみを結ぶ経路に縮小される。',
    aims: ['巡回路の維持', '城壁内への立ち入りの許可', '同胞の身元保証'],
    seat: '不定', seatNote: '州内の市門外を巡回',
    people: [
      { ja: 'リ＝サード', race: 'khajiit', headgear: 'hood', hair: 'none', garment: 'leather', note: '隊商の長' },
      { ja: 'アトゥーバ', race: 'khajiit', headgear: 'none', hair: 'none', garment: 'robe', note: '呪具を扱う' },
      { ja: 'アカリ', race: 'khajiit', headgear: 'hood', hair: 'none', garment: 'leather', note: '別の隊商の長' },
    ],
    quote: '門の内には入れない。だから門の外に店を出した。',
  },
  riekling: {
    door: 'blood', scale: 'small', reach: 'local', state: 'active',
    summary:
      'ソルスセイムの雪原に住む小柄な種族。'
      + '槍を主たる武器とし、猪を騎乗獣として用いる。'
      + '固有の言語を持つが、外部の言語をほとんど解さないため、'
      + '交渉の記録がほぼ存在しない。'
      + '本項の記述は、いずれも外部からの観察に基づく。'
      + 'スカール族との衝突は資源をめぐるものであり、'
      + 'いずれの側にも殲滅の意図は認められない。'
      + '近年、外部の者に率いられた集団が確認されている。統率の仕組みが外部から持ち込み得るものであることを示す事例として、記録に留める。',
    aims: ['縄張りの維持', '越冬の備え'],
    seat: 'ソルスセイム', seatNote: '雪原の野営地',
    people: [
      { ja: '族長', race: 'orc', headgear: 'horned', hair: 'none', garment: 'fur', note: '名を伝えない' },
      { ja: '斥候', race: 'orc', headgear: 'none', hair: 'topknot', garment: 'fur', note: '猪に乗る' },
      { ja: '外から来た者', race: 'nord', headgear: 'helm', hair: 'none', garment: 'mail', note: '集団を率いた' },
    ],
    quote: '言葉が通じない。だから、これは彼らの記録ではない。',
  },
  bandits: {
    door: 'open', scale: 'mid', reach: 'province', state: 'active',
    summary:
      '街道と廃砦に拠って略奪を行う諸集団の総称。'
      + '単一の組織ではなく、指揮系統も共有しない。'
      + '内戦による治安機構の後退とともに数を増しており、'
      + '構成員には解隊された兵と没落した農民が多く含まれる。'
      + 'この項を立てるのは、彼らが州内の交通に与える影響が、'
      + 'いくつかの正規の組織を上回るためである。'
      + '一部の集団は廃砦を恒久的に占拠しており、事実上の徴税を行っている。これを略奪と呼ぶか統治と呼ぶかは、呼ぶ側の立場による。'
      + '本項に固有の紋章はない。掲げられた印はいずれも他所からの借り物である。',
    aims: ['街道における通行料の徴収', '廃砦の占拠', '冬季の食糧確保'],
    seat: '不定', seatNote: '街道沿いの廃砦',
    people: [
      { ja: '砦の頭目', race: 'nord', headgear: 'helm', hair: 'none', garment: 'mail', note: '徴税を行う' },
      { ja: '街道の見張り', race: 'human', headgear: 'hood', hair: 'none', garment: 'leather', note: '解隊された兵' },
      { ja: '没落した農民', race: 'human', headgear: 'none', hair: 'short', garment: 'fur', note: '名を伝えない' },
    ],
    quote: '兵をやめた者が山に入る。山から下りてくるときには、別の名になっている。',
  },
  alduin: {
    door: 'blood', scale: 'small', reach: 'province', state: 'active',
    summary:
      '第四紀に復活した竜と、それに従う個体の総称。'
      + '本項を「組織」として扱うことには異論があり得るが、'
      + '個体間に明確な序列が存在し、'
      + '墳墓からの復活が一定の順序で進行している点において、'
      + '統率された集団としての条件を満たす。'
      + '竜教団の司祭が現在もこの序列の内側にあるかについては、記録が分かれる。'
      + '復活した個体の数は、確認されているだけで二十を超える。墳墓の総数はこれを大きく上回るため、復活は途上にあると考えるほかない。',
    aims: ['序列の頂点への奉仕', '墳墓からの復活の継続', '世界の喉の奪還'],
    seat: '不定', seatNote: '州内各地の墳墓と塚',
    people: [
      { ja: 'アルドゥイン', race: 'argonian', headgear: 'horned', hair: 'none', garment: 'bare', note: '首領' },
      { ja: 'オダハヴィーング', race: 'argonian', headgear: 'horned', hair: 'none', garment: 'bare', note: '配下。のち離反' },
      { ja: 'サーロクニル', race: 'argonian', headgear: 'horned', hair: 'none', garment: 'bare', note: '復活の直後に討たれた' },
    ],
    quote: '飛ぶ順序が決まっている。決めている者がいる、ということだ。',
  },

  // ══ VIII. 領邦・宮廷 ═════════════════════════════
  // 九つの領の「門戸」は、いずれも「試練による」である。
  // 九つとも同じ値になった。これは記述の手抜きではなく、この州の統治の形である。
  // 首長の座は血によって継がれるが、宮廷に加わる道——従士（セイン）の位——は、
  // 領への功によってのみ開く。生まれで宮廷に入る者はおらず、
  // 願い出て入る者もいない。九領のすべてがこの一点で揃っている。
  holdHaafingar: {
    door: 'trial', scale: 'great', reach: 'hold', state: 'active',
    summary: '州の北西端、カース川の河口に架かる巨大な岩橋の上に市を置く領。帝国の州総督府と帝国軍の州司令部が同居し、白金協定以後は事実上の州都として扱われる。港は年を通して凍らず、東帝都社の州内取引の大半がここを経由する。首長の座はソリチュード家の血によって継がれるが、現首長エリシフは先代の妻であって、その血の外から座に着いた。この一事が、州の内戦において当領の正統性を問う根拠として繰り返し持ち出されている。宮廷は帝国側の助言者を常置し、領の裁定に帝国の意向が入る度合いは九領のうちで最も高い。',
    aims: [
      '港と岩橋を保ち、州外との交通を絶やさぬこと',
      '帝国の州統治の拠点であり続けること',
      '首長の座の継承に生じた疑義を、内戦の決着まで争わせぬこと',
    ],
    seat: 'ソリチュード', seatNote: 'ハーフィンガル領',
    people: [
      { ja: 'エリシフ', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'robe', note: '首長。先代トリグの妻' },
      { ja: 'ファルク・ファイアビアード', race: 'nord', headgear: 'none', hair: 'long', garment: 'robe', note: '執政。実務を握る' },
      { ja: 'ボルガンヤ', race: 'nord', headgear: 'none', hair: 'braid', garment: 'plate', note: '護衛官（ハスカール）' },
      { ja: 'シビ・ブラック＝ブライア', race: 'nord', headgear: 'none', hair: 'short', garment: 'leather', note: '宮廷詩人。リフテンの家の出' },
    ],
    quote: '首長は座っておられる。政は執政が行う。両方とも本当のことである。',
  },
  holdEastmarch: {
    door: 'trial', scale: 'great', reach: 'hold', state: 'active',
    summary: '州の東部、白の川の河口に石造の市を置く領。人の手になる市としては州内で最も古く、市壁の下層はイスグラモルの代に積まれたものとされる。王の宮と呼ばれる大広間を首長の座とし、現首長ウルフリックは同時にストームクロークの首魁である。領の統治と反乱の指揮が同一の人物に集まっているため、当領では宮廷の記録と軍の記録が分離していない。市内には灰の落ちるモロウウィンドから逃れたダンマーの区画があり、市壁の外に置かれている。この配置をめぐる申し立てが、市政の記録に断続的に現れる。',
    aims: [
      '古き市の形と、その積み方を変えぬこと',
      '州の統治をノルドの手に戻すこと',
      '首長の座と軍の指揮を分けぬこと',
    ],
    seat: 'ウィンドヘルム', seatNote: 'イーストマーチ領',
    people: [
      { ja: 'ウルフリック', race: 'nord', headgear: 'none', hair: 'long', garment: 'fur', note: '首長。蜂起の首謀' },
      { ja: 'ヨルレイフ', race: 'nord', headgear: 'none', hair: 'short', garment: 'robe', note: '執政。市政の実務' },
      { ja: 'ガルマル', race: 'nord', headgear: 'helm', hair: 'long', garment: 'plate', note: '副将。軍の指揮' },
      { ja: 'ウーンフェルス', race: 'nord', headgear: 'none', hair: 'short', garment: 'leather', note: '宮廷の鍛冶' },
    ],
    quote: 'この石を積んだ者の名を言えぬ者に、この市を語る資格はない。',
  },
  holdWhiterun: {
    door: 'trial', scale: 'great', reach: 'hold', state: 'active',
    summary: '州の中央、白きヴァルガルの平原に市を置く領。九領のいずれとも境を接し、州内の街道はほとんどがこの市を通る。丘の頂に建つ大広間は竜の顎を架したものと伝えられ、その名で呼ばれる。首長バルグルーフは内戦において帝国・ストームクロークのいずれにも与せぬ立場を公にしており、九領のうちでこの立場を保っている唯一の領である。中立は理念ではなく位置の結果でもある。市内では帝国派のバトル・ボーン家とタロス派のグレイ・メーン家が公然と分かれており、宮廷はその双方を席に置いている。',
    aims: [
      '街道の交わる位置を保ち、いずれの側にも門を閉ざさぬこと',
      '市内に分かれた二家を、いずれも宮廷から外さぬこと',
      '丘の大広間と、そこに架けられたものを損なわぬこと',
    ],
    seat: 'ホワイトラン', seatNote: 'ホワイトラン領',
    people: [
      { ja: 'バルグルーフ', race: 'nord', headgear: 'none', hair: 'long', garment: 'fur', note: '首長。中立を掲げる' },
      { ja: 'プロヴェントゥス・アヴェニッチ', race: 'human', headgear: 'none', hair: 'short', garment: 'robe', note: '執政。帝国の出' },
      { ja: 'イリレス', race: 'elf', headgear: 'none', hair: 'braid', garment: 'plate', note: '護衛官。ダンマー' },
      { ja: 'フレンガー', race: 'nord', headgear: 'hood', hair: 'long', garment: 'robe', note: '宮廷魔術師' },
    ],
    quote: '道が交わる場所に立つ者は、どちらへも行けるが、どこへも行けぬ。',
  },
  holdReach: {
    door: 'trial', scale: 'great', reach: 'hold', state: 'active',
    summary: '州の西端、峡谷の岩壁そのものを刳り抜いて市とした領。市の構造はドワーフの遺構を人が継いで用いたもので、階段と水路の大半は人の手になるものではない。銀の坑を持ち、州内の銀の産出はほぼこの領に集まる。坑と市の実権はシルバー・ブラッド家が握っており、首長イグムンドの宮廷は同家の資力の上に立つ。土地の旧来の住民は現在フォースウォーンと呼ばれ、領の統治を認めていない。第四紀一八八年の事変以後、市内での襲撃と鎮圧は絶えたことがなく、市門の記録は現在も日ごとに付けられている。',
    aims: [
      '銀の坑を止めぬこと',
      '峡谷の市を、外からの手に渡さぬこと',
      '土地の旧来の住民との係争を、領の外へ持ち出さぬこと',
    ],
    seat: 'マルカルス', seatNote: 'リーチ領',
    people: [
      { ja: 'イグムンド', race: 'nord', headgear: 'circlet', hair: 'short', garment: 'robe', note: '首長。父を蜂起で失う' },
      { ja: 'ラガタール', race: 'orc', headgear: 'none', hair: 'topknot', garment: 'plate', note: '護衛官。オーク' },
      { ja: 'ファレンガー', race: 'nord', headgear: 'none', hair: 'short', garment: 'mail', note: '衛兵長。市門の記録を付ける' },
      { ja: 'カルセルモ', race: 'elf', headgear: 'none', hair: 'none', garment: 'robe', note: '宮廷魔術師。遺構の解読' },
    ],
    quote: '我らはこの市を建てていない。住んでいるだけである。',
  },
  holdRift: {
    door: 'trial', scale: 'mid', reach: 'hold', state: 'active',
    summary: '州の南東、湖と黄葉の森に囲まれた領。市は湖岸に杭を打って建てられており、水路が市街を貫く。モロウウィンドとシロディールへ抜ける二つの街道の分岐に当たるため、州内の陸運はこの市を避けて通れない。首長ラエロフの宮廷は帝国に与しているが、領の実務——市場の差配・衛兵の給・裁定の順序——はブラック・ブライア家の蜂蜜酒の資力を通して動いており、宮廷の決定と同家の意向が食い違った記録は本書の調査した範囲に無い。市の地下水路は盗賊ギルドの拠点として知られ、市政はこれを黙認している。',
    aims: [
      '二つの街道の分岐を保つこと',
      '蜂蜜酒の醸造と、その取引の道を絶やさぬこと',
      '地下で起きていることを、地上の記録に書かぬこと',
    ],
    seat: 'リフテン', seatNote: 'リフト領',
    people: [
      { ja: 'ラエロフ', race: 'nord', headgear: 'circlet', hair: 'long', garment: 'robe', note: '首長。帝国に与する' },
      { ja: 'アニュース', race: 'nord', headgear: 'none', hair: 'short', garment: 'robe', note: '執政。市場の差配' },
      { ja: 'ウンミッド', race: 'nord', headgear: 'none', hair: 'short', garment: 'plate', note: '護衛官' },
      { ja: 'ハームフリッド', race: 'nord', headgear: 'none', hair: 'long', garment: 'mail', note: '衛兵長。地下に降りない' },
    ],
    quote: '市の下で何が起きているかは、市の記録には書かれない。',
  },
  holdFalkreath: {
    door: 'trial', scale: 'mid', reach: 'hold', state: 'active',
    summary: '州の南西、深い針葉樹の森に覆われた領。シロディールとの境を接し、州外への南の門にあたる。集落そのものは小さいが、州内で最も古く最も大きな墓地を持ち、領外から遺体を運び入れて葬る慣行が長く続いている。領の記録の中心は台帳ではなく墓標であり、当領の年代について問うとき、記録院はまず墓地の区画を数える。首長シッドゲイルは帝国に与しているが、その表明は内戦の開始から一年以上を経てのものであり、遅れの理由は宮廷の記録に記されていない。森には闇の一党の聖域があるとされ、領はその所在を確かめていない。',
    aims: [
      '墓地を絶やさず、区画を継ぎ足し続けること',
      '南の境の道を通じさせておくこと',
      '森の中で起きていることに、必要以上に立ち入らぬこと',
    ],
    seat: 'ファルクリース', seatNote: 'ファルクリース領',
    people: [
      { ja: 'シッドゲイル', race: 'nord', headgear: 'none', hair: 'short', garment: 'fur', note: '首長。帝国に与する' },
      { ja: 'ネンヤ', race: 'elf', headgear: 'none', hair: 'long', garment: 'robe', note: '執政。ボズマー' },
      { ja: 'ヘルヴァルド', race: 'nord', headgear: 'helm', hair: 'short', garment: 'plate', note: '護衛官' },
      { ja: 'ルーンイル', race: 'nord', headgear: 'hood', hair: 'none', garment: 'robe', note: '墓守。区画を継ぐ' },
    ],
    quote: 'この領で数えるべきものは、生きている者の数ではない。',
  },
  holdPale: {
    door: 'trial', scale: 'small', reach: 'hold', state: 'active',
    summary: '州の北岸、凍らぬ港を一つだけ持つ領。市は港と坑のほかに産を持たず、住民の多くが漁と採掘に従事する。冬季には北から吹き込む風のため陸路が三月ほど絶えるが、港は氷を張らないので海路は通じる。この一点によって、当領は小領でありながら州外との連絡を保ち続けてきた。首長スカルドは内戦においてストームクロークに与している。第四紀一九〇年代の末より、住民が同一の夢を見るという届が市政に繰り返し出されており、市政はこれを記録に留めたまま、原因についての判断を示していない。',
    aims: [
      '凍らぬ港を保つこと',
      '坑の産出を絶やさぬこと',
      '住民の届を、判断を加えずに書き留め続けること',
    ],
    seat: 'ドーンスター', seatNote: 'ペイル領',
    people: [
      { ja: 'スカルド', race: 'nord', headgear: 'none', hair: 'long', garment: 'fur', note: '首長。蜂起に与する' },
      { ja: 'ヨッド', race: 'nord', headgear: 'none', hair: 'short', garment: 'robe', note: '執政。届を受ける' },
      { ja: 'バルグルーヴ', race: 'nord', headgear: 'helm', hair: 'short', garment: 'mail', note: '護衛官' },
      { ja: 'フルーキ', race: 'nord', headgear: 'hood', hair: 'long', garment: 'robe', note: '宮廷の薬師。夢の届を集める' },
    ],
    quote: '同じ夢を見た者が三十七人いる。それだけを書いておく。',
  },
  holdWinterhold: {
    door: 'trial', scale: 'small', reach: 'hold', state: 'active',
    summary: '州の北東端。第二紀七五八年の大崩壊によって市街の大半が海に落ち、現在は数戸の家と、橋の先に残った学院のみが立つ領。領としての体裁は保たれているが、徴税の対象となる住民は九領で最も少なく、宮廷は首長と執政のほか常置の職を持たない。首長コルジールは領の窮乏の原因を学院に帰する立場を公にしており、学院との公式の往来は三百年にわたって無い。領の記録は崩壊以前のものが大半で、以後の三百年ぶんは合わせても崩壊前の一世紀に満たない。書くべきことが起きていないのではなく、書く者がいなくなったのである。',
    aims: [
      '領としての体裁を失わぬこと',
      '崩壊以前の記録を、これ以上失わぬこと',
      '学院との関係を、現在の状態のまま動かさぬこと',
    ],
    seat: 'ウィンターホールド', seatNote: 'ウィンターホールド領',
    people: [
      { ja: 'コルジール', race: 'nord', headgear: 'none', hair: 'long', garment: 'fur', note: '首長。学院に原因を帰する' },
      { ja: 'マルール・セレス', race: 'elf', headgear: 'none', hair: 'short', garment: 'robe', note: '執政。ダンマー' },
      { ja: 'トナル', race: 'nord', headgear: 'helm', hair: 'short', garment: 'mail', note: '護衛官。常置の兵はこの一名' },
    ],
    quote: '崩れた後のことは、誰も書かなかった。それが答えである。',
  },
  holdHjaalmarch: {
    door: 'trial', scale: 'small', reach: 'hold', state: 'active',
    summary: '州の北西、塩水の湿地に囲まれた領。集落は木造で、湿地に打った杭の上に建つ。産は泥炭と魚と、湿地に生える茸に限られ、九領のうちで最も貧しい。首長イドグロッド・ラヴンクローンは予見を語ることで知られ、宮廷の裁定にその語りが混じる。当人はこれを予見と呼ばず、「見えているものを言っているだけ」と述べる。領の記録には、他の八領には現れない種類の記述——夢・霧・水面に映るものについての届——が一貫して含まれており、記録院はこれを削らずに採録した。削れば、この領の記録がどういうものであるかが伝わらないためである。',
    aims: [
      '湿地の杭を打ち替え続けること',
      '首長の語ったことを、そのまま書き留めること',
      '領の外から来た者に、湿地を歩かせぬこと',
    ],
    seat: 'モーサル', seatNote: 'ヒャルマーク領',
    people: [
      { ja: 'イドグロッド', race: 'nord', headgear: 'none', hair: 'long', garment: 'robe', note: '首長。見えたことを語る' },
      { ja: 'アスラン', race: 'khajiit', headgear: 'hood', hair: 'none', garment: 'robe', note: '執政。キャジート' },
      { ja: 'ゴルム', race: 'nord', headgear: 'none', hair: 'short', garment: 'mail', note: '護衛官。首長の子' },
      { ja: 'ファレルダ', race: 'nord', headgear: 'none', hair: 'braid', garment: 'leather', note: '湿地の案内。杭を打ち替える' },
    ],
    quote: '見えているものを言っているだけである。当たるかどうかは、別の話である。',
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
