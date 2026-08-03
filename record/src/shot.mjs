import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../out/', import.meta.url));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:900,height:1300}, deviceScaleFactor:2 });
await p.goto('file://' + out + 'record.html', { waitUntil:'networkidle' });
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(500);
for (const n of process.argv.slice(2)) {
  await p.locator('.sheet').nth(+n-1).screenshot({ path: out+`shot-${n}.png` });
  console.log('→ shot-'+n+'.png');
}
await b.close();
