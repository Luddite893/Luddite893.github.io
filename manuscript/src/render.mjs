// Chromium による組版 → PDF / 検版用画像
//   node src/render.mjs pdf   screen
//   node src/render.mjs pdf   print
//   node src/render.mjs shots screen 1 2 3 ...

import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { M } from './style.mjs';

const [, , task = 'pdf', mode = 'screen', ...rest] = process.argv;
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const bleed = mode === 'print' ? 3 : 0;
const marks = mode === 'print' ? 8 : 0;
const mediaW = M.trimW + (bleed + marks) * 2;
const mediaH = M.trimH + (bleed + marks) * 2;

const outDir = fileURLToPath(new URL('../out/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: EXE, args: ['--font-render-hinting=none'] });
const page = await browser.newPage(
  task === 'grounds' ? { deviceScaleFactor: 300 / 96 } : {});
const srcFile = task === 'grounds' ? 'grounds.html' : `${mode}.html`;
await page.goto('file://' + outDir + srcFile, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

if (task === 'grounds') {
  // 地紋を葉ごとに一枚へ焼き込む。300dpi 相当。
  mkdirSync(outDir + 'assets/', { recursive: true });
  const tiles = await page.locator('.tile').all();
  await page.setViewportSize({ width: 1760, height: 2490 });
  for (let i = 0; i < tiles.length; i++) {
    const f = String(i + 1).padStart(2, '0');
    await tiles[i].screenshot({
      path: outDir + `assets/ground-${f}.jpg`,
      type: 'jpeg', quality: 76, scale: 'device',
    });
  }
  console.log(`地紋 ${tiles.length} 葉 → out/assets/`);
} else if (task === 'pdf') {
  await page.pdf({
    path: outDir + `${mode}-raw.pdf`,
    width: `${mediaW}mm`,
    height: `${mediaH}mm`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  console.log(`PDF → out/${mode}-raw.pdf  (${mediaW}×${mediaH}mm)`);
} else {
  // 検版用。指定した丁だけを 300dpi 相当で書き出す。
  const nums = rest.length ? rest.map(Number) : [1];
  await page.setViewportSize({ width: Math.round(mediaW * 3.78), height: Math.round(mediaH * 3.78) });
  for (const n of nums) {
    const el = await page.locator('.sheet').nth(n - 1);
    await el.screenshot({ path: outDir + `shot-${mode}-${String(n).padStart(2, '0')}.png`, scale: 'css' });
    console.log(`shot → out/shot-${mode}-${String(n).padStart(2, '0')}.png`);
  }
}

await browser.close();
