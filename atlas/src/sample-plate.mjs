// 段階 1　基準原図の提出　——　参考図と直接比較するための一組
import { writeFileSync } from 'node:fs';
import { css } from './grid.mjs';
import { jorrvaskr, why } from './plate-jorrvaskr.mjs';
import { figure } from './figures.mjs';

const P = (body, head) => `<section class="sheet recto"><div class="trim"><div class="frame">
  <div class="rh">${head}</div>${body}</div></div></section>`;

const ae = { race:'nord', face:'stern', hair:'braid', beard:'none', headgear:'none',
  garment:'leather', build:'normal', pose:'quarter', prop:'bow', mark:'scar', id:'aela-ko' };

const pages = [
  P(`<h2>基準原図　主図版　図一　ジョラーヴァスクル</h2>
     <p class="lead">生成系を離れ、この図のためだけに座標を書き起こしたもの。刷り上がり 174mm。</p>
     <div class="plate">${jorrvaskr()}</div>
     <p class="cap">図一　ホワイトランの丘上に立つジョラーヴァスクル。屋根は伏せた竜船を模す。</p>
     <p class="why"><b>なぜこれを選んだか</b>　${why}</p>
     <div class="mat"><b>素材の描き分け（八種）</b>
       空／山／針葉樹／木材／屋根板／石／布／炎。<b>固有要素（五点）</b>
       竜頭三基／妻の旗／旗竿の門の旗／吊り灯／篝火二基。
       <b>光源</b>　左上に固定。庇の下・柱の右・段の蹴上げに陰。篝火は二次光源。</div>`,
    '段階 1　基準原図　主図版'),

  P(`<h2>基準原図　人物図版　甲　アエラ</h2>
     <p class="lead">改訂指示書 6-4「甲については拡大を認める」に従い、
       第二版見本の 34 × 51mm を 62 × 93mm へ拡大したもの。</p>
     <div class="fig">${figure({ ...ae, mm: 62 })}</div>
     <p class="cap">図　アエラ。内円。狩人。</p>
     <p class="why"><b>この一点で確かめていただきたいこと</b>　
       拡大しても情報量が増えていません。線の本数も、面の数も、34mm のときと同じです。
       参考図 B にある骨格の変化・毛皮の一本ずつの流れ・瞳の中の反射は、
       枠を広げても現れません。これはこちらの描画の上限です。</p>`,
    '段階 1　基準原図　人物図版　甲'),
];

writeFileSync(new URL('../out/sample-plate.html', import.meta.url),
`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>基準原図</title>
<style>${css({})}
body{background:#d8d5cc}
.rh{position:absolute;top:-9mm;width:var(--frame-w);font-size:2.5mm;letter-spacing:.18em;
    color:var(--ink-weak);border-bottom:.3mm solid var(--rule);padding-bottom:1.4mm}
h2{font-size:5.4mm;line-height:calc(var(--lead)*2);font-weight:600;letter-spacing:.08em;margin-bottom:2mm}
.lead{font-size:2.9mm;line-height:calc(var(--lead)*0.86);color:var(--ink-mid);
      text-indent:0;margin-bottom:calc(var(--lead)*0.8)}
.plate svg{width:var(--frame-w);height:auto;display:block}
.fig svg{width:62mm;height:auto;display:block;margin:4mm 0}
.cap{font-size:2.6mm;line-height:calc(var(--lead)*0.8);color:var(--ink-mid);text-indent:0;margin-top:2.4mm}
.why{font-size:2.9mm;line-height:calc(var(--lead)*0.9);text-indent:0;margin-top:calc(var(--lead)*1);
     border-left:.6mm solid #6b563a;padding-left:3mm}
.mat{font-size:2.7mm;line-height:calc(var(--lead)*0.86);color:var(--ink-mid);text-indent:0;
     margin-top:calc(var(--lead)*0.8);border-top:.3mm solid var(--rule);padding-top:2mm}
</style></head><body>${pages.join('\n')}</body></html>`);
console.log('→ out/sample-plate.html');
