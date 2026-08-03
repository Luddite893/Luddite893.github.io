import { writeFileSync } from 'node:fs';
import { bust, SKULLS, HEADGEAR, HAIR, GARMENTS } from './busts.mjs';

const races = Object.keys(SKULLS), gears = Object.keys(HEADGEAR),
      hairs = Object.keys(HAIR), garbs = Object.keys(GARMENTS);
let n = 0;
const specs = [];
for (const race of races)
  for (const [i, headgear] of gears.entries())
    specs.push({ id: 'p' + (++n), race, headgear,
      hair: headgear === 'none' || headgear === 'circlet' ? hairs[(i + 1) % hairs.length] : 'none',
      garment: garbs[(n + i) % garbs.length] });

const cell = (s) => `<figure><div class="b">${bust(s)}</div>
  <div class="s">${bust(s)}</div>
  <figcaption>${s.race}<br><span>${s.headgear}／${s.hair}<br>${s.garment}</span></figcaption></figure>`;

writeFileSync(new URL('../out/proof-busts.html', import.meta.url), `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#eceae4;font-family:'Noto Serif JP',serif;padding:12mm;color:#1b1b1a}
h1{font-size:5.4mm;letter-spacing:.2em;font-weight:600;margin-bottom:2mm}
p.l{font-size:3mm;line-height:5mm;color:#5c5a54;max-width:180mm;margin-bottom:7mm}
.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6mm 4mm}
figure{text-align:center}
.b svg{width:26mm;height:31.2mm;display:block;margin:0 auto}
.s svg{width:14mm;height:16.8mm;display:block;margin:1.5mm auto 0}
figcaption{font-size:2.4mm;line-height:3.4mm;margin-top:1.5mm;color:#5c5a54}
figcaption span{color:#8a877e;font-size:2.2mm}
</style></head><body>
<h1>人物図版　胸像の生成系　検版</h1>
<p class="l">胸像は描かず、組む。頭蓋（種族）× 被り物 × 髪 × 肩（衣）の組み合わせとして記述し、
陰影はエングレービング・エンジンが与える。光源は全点で左上に固定してある。<br>
顔は描いていない。実寸 18mm では目鼻を線で描いても潰れるので、眼窩・鼻梁・頬の陰だけを置く。
上段 26mm＝設計寸法、下段 14mm＝実寸相当。${specs.length} 点表示（組み合わせ総数 ${races.length * gears.length * hairs.length * garbs.length} 点）。</p>
<div class="grid">${specs.map(cell).join('')}</div>
</body></html>`);
console.log(`胸像 ${specs.length} 点 → out/proof-busts.html`);
