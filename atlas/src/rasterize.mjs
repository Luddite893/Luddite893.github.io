// 仮の入稿画像を作る。
// 発注者様から実データをいただくまでの間、
// 埋め込み工程を実データで通すために、こちらの線画を 350dpi のラスタに焼く。
// 実データが届いたら同じ名前で置き換えるだけでよい。
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { jorrvaskr } from './plate-jorrvaskr.mjs';
import { figure } from './figures.mjs';

const dir = fileURLToPath(new URL('../assets/artwork/', import.meta.url));
const DPI = 350, PX = (mm) => Math.round(mm / 25.4 * DPI);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();

const shoot = (svg, wmm, hmm, path) => p.setContent(
  `<style>html,body{margin:0;background:#fff}svg{display:block;width:${PX(wmm)}px;height:${PX(hmm)}px}</style>${svg}`)
  .then(() => p.setViewportSize({ width: PX(wmm), height: PX(hmm) }))
  .then(() => p.locator('svg').screenshot({ path, type: 'png' }))
  .then(() => console.log(`${path.split('/').pop()}　${PX(wmm)} × ${PX(hmm)} px　@${DPI}dpi`));

await shoot(jorrvaskr(), 174, 139.2, dir + '主図版/companions.png');
await shoot(figure({ race:'nord', face:'stern', hair:'braid', beard:'none', headgear:'none',
  garment:'leather', build:'normal', pose:'quarter', prop:'bow', mark:'scar', id:'aela', mm:62 }),
  62, 93, dir + '人物図版/companions-3.png');
await b.close();
