// 各項の図版指定。情景の構成・小カットの選択・図版説明。
// 主図版は「その組織を象徴する情景」なので、拠点そのものではなく
// その組織が何をしている場所かを選ぶ。
export const plates = {
  companions: { num: '1', scene: { id:'companions', structure:'city' },
    caption: '図一　ホワイトランの丘上に立つジョラーヴァスクル。屋根は伏せた竜船を模す。',
    cuts: ['axe','shield','anvil'], cutCaps: ['ヴィルカスの斧','団の盾','鍛冶場の金床'] },
  legion: { num: '11', scene: { id:'legion', structure:'fort' },
    caption: '図一一　街道沿いの砦。第四紀の帝国軍は野戦よりも街道の確保を主とする。',
    cuts: ['helm','sword','banner'], cutCaps: ['軍団兵の兜','帝国剣','軍旗'] },
  thalmor: { num: '13', scene: { id:'thalmor', structure:'tower', night:1 },
    caption: '図一三　大使館。丘の上に単独で建ち、街道から見上げる位置にある。',
    cuts: ['scroll','key','torch'], cutCaps: ['尋問記録','監房の鍵','審問の灯'] },
  blackbriar: { num: '26', scene: { id:'blackbriar', structure:'city' },
    caption: '図二六　リフテンの運河。醸造所は水路に面し、荷は夜間にも動く。',
    cuts: ['potion','coin','ledger'], cutCaps: ['蜂蜜酒','リフトの貨','出納の帳'] },
  ninedivines: { num: '30', scene: { id:'ninedivines', structure:'temple' },
    caption: '図三〇　神々の神殿。内陣の第九の壇は、現在も空席のまま保たれている。',
    cuts: ['chalice','book','crown'], cutCaps: ['聖別の杯','八神の書','タロスの冠（撤去）'] },
  dragoncult: { num: '38', scene: { id:'dragoncult', structure:'ruin', night:1 },
    caption: '図三八　高地の墳墓。入口の壁面には竜文字による碑文が残る。',
    cuts: ['mask','torch','gate'], cutCaps: ['竜司祭の仮面','墓室の灯','墳墓の門'] },
  telvanni: { num: '45', scene: { id:'telvanni', structure:'tower' },
    caption: '図四五　テルミスリンの菌塔。石は用いず、菌類を育てて構造とする。',
    cuts: ['potion','scroll','book'], cutCaps: ['術薬','巻子','術書'] },
  whispers: { num: '23', scene: { id:'whispers', structure:'ruin', night:1, figures:0 },
    caption: '図二三　（本項に対応する図版は存在しない。掲げるのは、名の現れた書簡の発見地である。）',
    cuts: ['scroll','key','coin'], cutCaps: ['当該書簡','用途不明の鍵','刻印のない貨'] },
};
export const plateOf = (f) => plates[f.id] ?? {
  num: '—', scene: { id: f.id, structure: 'fort' },
  caption: '（図版未制作）', cuts: ['sword','shield','banner'], cutCaps: ['','',''] };
