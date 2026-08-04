// 溢れ検査用に組んだ out/fit.html を、そのまま校正刷りの PDF にする。
//   node src/check-fit.mjs && node src/render-fit.mjs [出力名]
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../out/', import.meta.url));
const name = process.argv[2] ?? '校正_第二版本文.pdf';
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--font-render-hinting=none'],
});
const p = await b.newPage();
await p.goto('file://' + out + 'fit.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(900);
await p.pdf({ path: out + name, width: '210mm', height: '297mm',
  printBackground: true, preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' } });
await b.close();
console.log('→ out/' + name);
