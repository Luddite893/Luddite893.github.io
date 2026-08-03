import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../out/', import.meta.url));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1700,height:1200}, deviceScaleFactor:2 });
await p.goto('file://' + out + 'spreads.html', { waitUntil:'networkidle' });
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(600);
// 版面からの溢れを機械で見る。目視では、頁を全部めくらないと見つからない。
const over = await p.evaluate(() => [...document.querySelectorAll('.frame')].map((f, i) => {
  const fb = f.getBoundingClientRect();
  let max = 0;
  for (const el of f.children) max = Math.max(max, el.getBoundingClientRect().bottom);
  return { i, over: +((max - fb.bottom) / (96 / 25.4)).toFixed(1) };
}).filter((x) => x.over > 0.3));
console.log(over.length ? '版面からの溢れ: ' + over.map((x) => `頁${x.i} +${x.over}mm`).join(' / ') : '版面からの溢れ: なし');

const n = +(process.argv[2] ?? 0);
const sheets = await p.locator('.sheet').all();
await p.evaluate((i)=>{ const s=document.querySelectorAll('.sheet'); const d=document.createElement('div');
  d.style.cssText='display:flex'; s[i].parentNode.insertBefore(d, s[i]); d.appendChild(s[i]); d.appendChild(s[i+1]); d.id='pair';
}, n);
await p.locator('#pair').screenshot({ path: out + `shot-spread-${n}.png` });
console.log('→ shot-spread-' + n + '.png');
await b.close();
