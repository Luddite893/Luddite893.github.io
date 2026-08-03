import { writeFileSync } from 'node:fs';
import { jorrvaskr } from './plate-jorrvaskr.mjs';
writeFileSync(new URL('../out/proof-plate.html', import.meta.url),
`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>基準原図</title><style>
body{background:#efece4;margin:0;padding:14px;font-family:'Noto Serif JP',serif}
.w{width:1000px}.w svg{width:100%;height:auto;display:block;background:#fff}
.s{width:400px;margin-top:14px}.s svg{width:100%;height:auto;display:block;background:#fff}
p{font-size:11px;color:#555;margin:6px 0}
</style></head><body>
<div class="w">${jorrvaskr()}</div>
<p>刷り上がり 174mm 相当（上）／ 縮小検分 70mm 相当（下）</p>
<div class="s">${jorrvaskr()}</div>
</body></html>`);
console.log('→ out/proof-plate.html');
