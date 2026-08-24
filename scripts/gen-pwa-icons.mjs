import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svg = readFileSync(path.join(root, 'public/favicon.svg'), 'utf-8');
const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const targets = [
  { file: 'public/pwa-192.png', size: 192 },
  { file: 'public/pwa-512.png', size: 512 },
  { file: 'public/pwa-maskable-512.png', size: 512, maskable: true },
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage();

for (const { file, size, maskable } of targets) {
  // Maskable icons need ~20% safe-zone padding so the shape isn't clipped by OS masks.
  const pad = maskable ? Math.round(size * 0.1) : 0;
  const inner = size - pad * 2;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`
    <html><body style="margin:0;width:${size}px;height:${size}px;background:${maskable ? '#e8fbfb' : 'transparent'};display:flex;align-items:center;justify-content:center;">
      <img src="${svgDataUrl}" width="${inner}" height="${inner}" />
    </body></html>
  `);
  const buffer = await page.screenshot({ omitBackground: !maskable });
  writeFileSync(path.join(root, file), buffer);
  console.log(`wrote ${file} (${size}x${size}${maskable ? ', maskable' : ''})`);
}

await browser.close();
