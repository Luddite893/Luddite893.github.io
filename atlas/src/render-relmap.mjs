// out/relmap.html を PDF と PNG に焼く。PNG は目視の確認用。
//   node src/render-relmap.mjs [出力名]
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../out/', import.meta.url));
const name = process.argv[2] ?? '校正_相関図.pdf';
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--font-render-hinting=none'],
});
const p = await b.newPage({ viewportSize: { width: 900, height: 1240 }, deviceScaleFactor: 2 });
await p.goto('file://' + out + 'relmap.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(700);

await p.pdf({ path: out + name, width: '210mm', height: '297mm',
  printBackground: true, preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' } });

const sheets = await p.$$('.sheet');
for (const [i, s] of sheets.entries()) {
  await s.screenshot({ path: `${out}relmap-${i + 1}.png` });
}
await b.close();
console.log(`→ out/${name}　PNG ${sheets.length} 枚`);
