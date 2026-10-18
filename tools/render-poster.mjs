import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';

const scenes = ['cable', 'busbar', 'insulator', 'switchgear', 'breaker', 'network', 'coil'];
const base = process.env.SITE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'msedge' } : {}), headless: true });
try {
  for (const scene of scenes) {
    const page = await browser.newPage({ viewport: { width: 720, height: 720 }, reducedMotion: 'no-preference' });
    await page.addInitScript(key => { window.__gePoster = key; }, scene);
    await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html,body{background:transparent!important}.site-header,main,.site-footer,.world-status,.site-menu{visibility:hidden!important}' });
    await page.waitForFunction(() => document.querySelector('.site-shell')?.getAttribute('data-world') === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const image = await page.locator('.world-stage canvas').screenshot({ omitBackground: true });
    await sharp(image).resize(720, 720, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(path.resolve('public', 'media', `scene-${scene}.webp`));
    await page.close();
  }
  console.log(`Rendered ${scenes.length} transparent scene posters.`);
} finally {
  await browser.close();
}
