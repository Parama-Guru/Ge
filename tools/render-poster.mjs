import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ reducedMotion: 'no-preference' });
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(process.env.SITE_URL || 'http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('.cinema-shell')?.getAttribute('data-world') === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2200);
    await page.addStyleTag({ content: '.cinema-header,.reading-main,.reading-footer,.cinema-shade,.world-status,.world-index{visibility:hidden!important}.world-poster{display:none!important}' });
    const canvas = page.locator('.world-stage canvas');
    const bounds = await canvas.boundingBox();
    if (!bounds) throw new Error('The cable canvas has no dimensions.');
    const screenshot = await page.screenshot({ clip: bounds });
    await sharp(screenshot).webp({ quality: 84 }).toFile(path.resolve('public', 'media', `cable-${name}.webp`));
  }
  console.log('Rendered clean desktop and portrait cable posters without HTML or controls.');
} finally {
  await browser.close();
}
