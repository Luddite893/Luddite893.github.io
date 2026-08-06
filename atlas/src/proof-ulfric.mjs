import { writeFileSync } from 'node:fs';
import { ulfric } from './plate-ulfric.mjs';
const a = ulfric({ circlet: true, scar: false });
const b = ulfric({ circlet: false, scar: true });
writeFileSync(new URL('../out/proof-ulfric.html', import.meta.url),
`<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0}body{background:#e8e6e0;padding:8mm;display:flex;gap:8mm;align-items:flex-start}
.w svg{width:150mm;height:225mm;display:block;background:#fff}
.r svg{width:62mm;height:93mm;display:block;background:#fff}
.s svg{width:34mm;height:51mm;display:block;background:#fff;margin-top:6mm}
</style><div class="w">${a}</div><div><div class="r">${a}</div><div class="s">${a}</div></div>
<div><div class="r">${b}</div></div>`);
console.log('svg bytes', a.length);
