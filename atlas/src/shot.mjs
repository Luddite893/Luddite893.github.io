import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../out/', import.meta.url));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1240,height:1600}, deviceScaleFactor:2 });
await p.goto('file://' + out + (process.argv[2] || 'proof-emblems.html'), { waitUntil:'networkidle' });
await p.evaluate(()=>document.fonts.ready);
await p.waitForFunction(()=>document.body.dataset.measured==='1', null, {timeout:30000}).catch(()=>{});
const bad = await p.evaluate(()=>[...document.querySelectorAll('.area')].map(e=>({id:e.dataset.area,pct:+e.dataset.pct})));
console.log('面積率 外れ値:', bad.filter(x=>x.pct<18||x.pct>34).map(x=>`${x.id} ${x.pct}%`).join(' / ') || 'なし');
const v = bad.map(x=>x.pct).filter(Number.isFinite);
console.log(`面積率 平均 ${(v.reduce((a,c)=>a+c,0)/v.length).toFixed(1)}%  最小 ${Math.min(...v)}%  最大 ${Math.max(...v)}%`);
for (const [i, sec] of (await p.locator('section.cat').all()).entries()) {
  await sec.screenshot({ path: out + `proof-cat-${i+1}.png` });
}
await b.close();
