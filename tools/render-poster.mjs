import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('.cinema-shell')?.getAttribute('data-world') === 'ready', null, { timeout: 30000 });
  await page.addStyleTag({ content: '.cinema-header,.reading-main,.reading-footer,.cinema-shade,.world-status,.world-index{visibility:hidden!important}.world-poster{display:none!important}' });
  await page.waitForTimeout(1200);
  const screenshot = await page.screenshot({ type: 'png' });
  await sharp(screenshot).webp({ quality: 82 }).toFile(path.resolve('public', 'media', 'world-poster.webp'));
  console.log('Rendered a clean 3D-only fallback poster without any website controls or text.');
} finally {
  await browser.close();
}
