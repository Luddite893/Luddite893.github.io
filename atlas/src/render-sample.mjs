import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../out/', import.meta.url));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--font-render-hinting=none'] });
const p = await b.newPage();
await p.goto('file://' + out + 'sample.html', { waitUntil:'networkidle' });
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(900);
await p.pdf({ path: out+'sample-raw.pdf', width:'210mm', height:'297mm',
  printBackground:true, preferCSSPageSize:true, margin:{top:'0',right:'0',bottom:'0',left:'0'} });
console.log('→ out/sample-raw.pdf');
await b.close();
