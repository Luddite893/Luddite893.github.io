import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../out/', import.meta.url));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1700,height:1200}, deviceScaleFactor:2 });
await p.goto('file://' + out + 'sample.html', { waitUntil:'networkidle' });
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(700);
const over = await p.evaluate(() => [...document.querySelectorAll('.frame')].map((f,i)=>{
  const fb=f.getBoundingClientRect(); let max=0;
  for (const el of f.children) { if (getComputedStyle(el).position==='absolute') continue;
    const r=el.getBoundingClientRect(); if (r.height) max=Math.max(max,r.bottom); }
  return { n:i+1, over:+((max-fb.bottom)/(96/25.4)).toFixed(1), fill:+((max-fb.top)/(96/25.4)).toFixed(0) };
}));
console.log('充填 ' + over.map(x=>`p${x.n}:${x.fill}mm`).join('  ') + '  （版面 252mm）');
const bad = over.filter(x=>x.over>0.5);
console.log(bad.length ? '溢れ: '+bad.map(x=>`p${x.n} +${x.over}mm`).join(' / ') : '溢れ: なし');
for (const n of [1,3]) {
  await p.evaluate((n)=>{ const s=document.querySelectorAll('.sheet');
    const d=document.createElement('div'); d.style.cssText='display:flex'; d.id='pair'+n;
    s[n-1].parentNode.insertBefore(d, s[n-1]); d.appendChild(s[n-1]); if(s[n]) d.appendChild(s[n]);
  }, n);
  await p.locator('#pair'+n).screenshot({ path: out + `shot-sample-${n}.png` });
}
console.log('→ shot-sample-1.png / shot-sample-3.png');
await b.close();
