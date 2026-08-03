// 任意の見開きを撮る。頁番号（左頁のノンブル、偶数）で指定する。
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../out/', import.meta.url));
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport:{width:1700,height:1200}, deviceScaleFactor:2 });
await p.goto('file://' + out + (process.env.SRC ?? 'book.html'), { waitUntil:'networkidle' });
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);

const over = await p.evaluate(() => [...document.querySelectorAll('.sheet')].map((s, i) => {
  const f = s.querySelector('.frame'); if (!f) return null;
  const fb = f.getBoundingClientRect(); let max = 0;
  for (const el of f.children) {
    if (getComputedStyle(el).position === 'absolute') continue;   // 柱・ノンブル・表紙は版面の外に置く
    const r = el.getBoundingClientRect(); if (r.height) max = Math.max(max, r.bottom);
  }
  return { n: i + 1, over: +((max - fb.bottom) / (96/25.4)).toFixed(1) };
}).filter(x => x && x.over > 0.5));
console.log(over.length ? '版面からの溢れ: ' + over.map(x => `p${x.n} +${x.over}mm`).join(' / ') : '版面からの溢れ: なし');

for (const arg of process.argv.slice(2)) {
  const n = +arg;
  await p.evaluate((n)=>{ const s=document.querySelectorAll('.sheet');
    const d=document.createElement('div'); d.style.cssText='display:flex'; d.id='pair'+n;
    s[n-1].parentNode.insertBefore(d, s[n-1]); d.appendChild(s[n-1]);
    if (s[n]) d.appendChild(s[n]);
  }, n);
  await p.locator('#pair'+n).screenshot({ path: out + `shot-p${n}.png` });
  console.log('→ shot-p' + n + '.png');
}
await b.close();
