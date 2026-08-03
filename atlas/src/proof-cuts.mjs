// 小カットと構築物の校正刷り。形が潰れていないかを一覧で見る。
import { writeFileSync } from 'node:fs';
import { CUTS, cut, STRUCTURES, scene } from './scene.mjs';

const cells = Object.keys(CUTS).map((k) =>
  `<figure><div class="c">${cut(k, { seed: 'proof' })}</div><figcaption>${k}</figcaption></figure>`).join('');
const scenes = Object.keys(STRUCTURES).map((k) =>
  `<figure class="s"><div class="c">${scene({ id: 'p' + k, structure: k, mm: 80 })}</div><figcaption>${k}</figcaption></figure>`).join('');

writeFileSync(new URL('../out/proof-cuts.html', import.meta.url),
`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>小カット・構築物 校正</title><style>
body{background:#efece4;font-family:'Noto Serif JP',serif;margin:0;padding:16px}
h2{font-size:14px;letter-spacing:.2em;margin:18px 0 8px}
.g{display:flex;flex-wrap:wrap;gap:6px}
figure{margin:0;width:96px;background:#fff;outline:1px solid #ccc}
figure.s{width:300px}
.c svg{width:100%;height:auto;display:block}
figcaption{font-size:9px;text-align:center;padding:2px;color:#555}
</style></head><body>
<h2>小カット ${Object.keys(CUTS).length} 点</h2><div class="g">${cells}</div>
<h2>構築物 ${Object.keys(STRUCTURES).length} 種</h2><div class="g">${scenes}</div>
</body></html>`);
console.log('→ out/proof-cuts.html');
