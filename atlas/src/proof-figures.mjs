// 上半身像の校正刷り。個体が割れているかを一覧で見る。
import { writeFileSync } from 'node:fs';
import { figure, LAYERS, combinations } from './figures.mjs';

const people = [
  { ja:'コドラク', race:'nord', face:'weary', hair:'long', beard:'full', headgear:'none',
    garment:'fur', build:'broad', pose:'frontal', prop:'book', mark:'aged', note:'先代の長' },
  { ja:'ヴィルカス', race:'nord', face:'stern', hair:'short', beard:'stubble', headgear:'none',
    garment:'mail', build:'normal', pose:'quarter', prop:'sword', mark:'scar', note:'内円' },
  { ja:'アエラ', race:'nord', face:'calm', hair:'braid', beard:'none', headgear:'none',
    garment:'leather', build:'slight', pose:'turned', prop:'bow', mark:'none', note:'内円・狩人' },
  { ja:'エレンウェン', race:'elf', face:'wry', hair:'long', beard:'none', headgear:'circlet',
    garment:'robe', build:'slight', pose:'frontal', prop:'scroll', mark:'none', note:'第一使節' },
  { ja:'ウルフリック', race:'nord', face:'stern', hair:'short', beard:'braided', headgear:'none',
    garment:'fur', build:'broad', pose:'frontal', prop:'axe', mark:'none', note:'反乱の首領' },
  { ja:'ラーカク', race:'orc', face:'calm', hair:'topknot', beard:'none', headgear:'none',
    garment:'leather', build:'broad', pose:'quarter', prop:'warhammer', mark:'scar', note:'族長' },
  { ja:'リ＝サード', race:'khajiit', face:'wry', hair:'none', beard:'none', headgear:'hood',
    garment:'robe', build:'normal', pose:'turned', prop:'purse', mark:'none', note:'隊商の長' },
  { ja:'デクスィオン', race:'human', face:'calm', hair:'none', beard:'moustache', headgear:'hood',
    garment:'robe', build:'slight', pose:'bowed', prop:'phial', mark:'eyepatch', note:'解読僧。失明' },
  { ja:'エオルンド', race:'nord', face:'weary', hair:'long', beard:'full', headgear:'none',
    garment:'apron', build:'broad', pose:'quarter', prop:'smithHammer', mark:'aged', note:'鍛冶' },
  { ja:'マドナック', race:'human', face:'stern', hair:'long', beard:'full', headgear:'horned',
    garment:'fur', build:'normal', pose:'frontal', prop:'antlerCut', mark:'none', note:'リーチの王を称する' },
  { ja:'ミラベル', race:'human', face:'stern', hair:'short', beard:'none', headgear:'none',
    garment:'robe', build:'normal', pose:'quarter', prop:'staff', mark:'none', note:'教頭' },
  { ja:'ヴェレス', race:'elf', face:'stern', hair:'none', beard:'none', headgear:'helm',
    garment:'plate', build:'normal', pose:'frontal', prop:'spear', mark:'none', note:'守備隊長' },
];

const cells = people.map((p, i) =>
  `<figure><div class="c">${figure({ ...p, id: 'pf' + i })}</div>
   <figcaption><b>${p.ja}</b><span>${p.note}</span></figcaption></figure>`).join('');

writeFileSync(new URL('../out/proof-figures.html', import.meta.url),
`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>上半身像 校正</title><style>
body{background:#efece4;font-family:'Noto Serif JP',serif;margin:0;padding:16px}
h2{font-size:13px;letter-spacing:.2em;margin:0 0 10px}
.g{display:flex;flex-wrap:wrap;gap:8px}
figure{margin:0;width:128px;background:#fff;outline:1px solid #ccc}
.c svg{width:100%;height:auto;display:block}
figcaption{font-size:9px;text-align:center;padding:3px 2px 5px}
figcaption b{display:block;font-size:10px}
figcaption span{color:#666}
</style></head><body>
<h2>上半身像　十層・組み合わせ ${combinations().toLocaleString()} 通り</h2>
<div class="g">${cells}</div></body></html>`);
console.log('→ out/proof-figures.html');
console.log('層', LAYERS.map(([n, c]) => `${n}:${c}`).join('  '));
console.log('組み合わせ', combinations().toLocaleString());
