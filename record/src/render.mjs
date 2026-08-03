import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../out/', import.meta.url));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--font-render-hinting=none'] });
const p = await b.newPage();
await p.goto('file://' + out + 'record.html', { waitUntil:'networkidle' });
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(600);

// 版面からの溢れを機械で見る
const over = await p.evaluate(() => [...document.querySelectorAll('.frame')].map((f,i)=>{
  const fb=f.getBoundingClientRect(); let max=0;
  for (const el of f.children) { if (getComputedStyle(el).position==='absolute') continue;
    const r=el.getBoundingClientRect(); if (r.height) max=Math.max(max,r.bottom); }
  return { n:i+1, over:+((max-fb.bottom)/(96/25.4)).toFixed(1) };
}).filter(x=>x.over>0.5));
console.log(over.length ? '版面からの溢れ: ' + over.map(x=>`p${x.n} +${x.over}mm`).join(' / ') : '版面からの溢れ: なし');

await p.pdf({ path: out+'record-raw.pdf', width:'210mm', height:'297mm',
  printBackground:true, preferCSSPageSize:true, margin:{top:'0',right:'0',bottom:'0',left:'0'} });
console.log('PDF → out/record-raw.pdf');
await b.close();
