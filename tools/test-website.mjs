import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const data = JSON.parse(await readFile(path.resolve('src', 'data', 'site.json'), 'utf8'));
const pages = JSON.parse(await readFile(path.resolve('src', 'data', 'pages.json'), 'utf8'));
const base = process.env.SITE_URL || 'http://127.0.0.1:3000';
const output = path.resolve('quality');
await mkdir(output, { recursive: true });
const report = { status: 'running', checks: [], accessibility: [], errors: [], transfer: {} };
const check = (value, message) => { assert.ok(value, message); report.checks.push(message); };
const content = id => data.pages.find(page => page.id === id);
const home = content('home').paragraphs;
const ids = pages.map(page => page.id);
const expectedText = {
  index: [home[28]],
  about: [home[5], home[28], '345 clients, 200000 hours of safety record', 'Safety award by Cortico', 'First MNC client..', 'Founder Kumerason and team', '11/09/2014'],
  features: [home[6], home[7], home[8], home[9], home[10], home[11], home[12], home[13], '274', '421', '40,000'],
  clients: [home[24], ...home.slice(14, 20)],
  contact: [home[25], home[27], 'ganeshvar@yahoo.com', 'kumareson@ganeshvar.com'],
  founder: content('founder').paragraphs.slice(0, 2),
  ehs: [...content('ehs').paragraphs.slice(0, 7), ...data.commitments],
  downloads: [content('downloads').paragraphs[0], 'Overview and detailed profile', 'News and Events', 'Outreach'],
};
const browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'msedge' } : {}), headless: true });

async function transfer(page) {
  return page.evaluate(() => Math.round(performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0)
    + (performance.getEntriesByType('navigation')[0]?.encodedBodySize || 0)));
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  let rowCount = 0;

  for (const id of ids) {
    const response = await page.goto(`${base}/${id}.html`, { waitUntil: 'networkidle' });
    check(response.status() === 200, `Endpoint responds: ${id}.html`);
    check(await page.locator('h1').count() === 1, `One h1: ${id}`);
    check(await page.locator('[data-scene]').count() > 0, `Page declares 3D scenes: ${id}`);
    check(await page.locator('.scene-poster').count() > 0, `Page has scene fallback images: ${id}`);
    if (id !== 'index') check(await page.getByRole('navigation', { name: 'Breadcrumb' }).isVisible(), `Visible breadcrumb: ${id}`);
    check(await page.locator('.mode-switch,.chapter-rail,.journey-dock,.explore-panel').count() === 0, `No presentation controls: ${id}`);
    const text = await page.locator('main').innerText();
    for (const expected of expectedText[id] ?? []) check(text.includes(expected), `Original content on ${id}: ${expected.slice(0, 40)}`);
    if (id.startsWith('project')) {
      const actual = await page.locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.textContent)));
      assert.deepEqual(actual, content(id).tables.flatMap(table => table.slice(1)));
      rowCount += actual.length;
      report.checks.push(`All project fields match: ${id}`);
    }
    if (id === 'team' || id === 'org') {
      const actual = await page.locator('.organisation > .team-tree').evaluate(root => {
        const parse = list => [...list.children].map(item => ({
          label: item.querySelector(':scope > span').textContent,
          children: item.querySelector(':scope > ul') ? parse(item.querySelector(':scope > ul')) : [],
        }));
        return parse(root);
      });
      assert.deepEqual(actual, data.trees[id]);
      report.checks.push(`Organisation hierarchy preserved: ${id}`);
    }
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    report.accessibility.push({ page: id, violations: audit.violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) })) });
  }
  check(rowCount === 45, 'All 45 project rows, including repeats, remain available');

  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  for (const [anchor, target] of [['about', 'about'], ['why-us', 'features'], ['clients', 'clients'], ['contact', 'contact']]) {
    check(await page.locator(`#${anchor} a[href$="/${target}.html"]`).count() > 0, `Homepage #${anchor} links to ${target}.html`);
  }
  check(await page.locator('.logo-grid img').count() === 6, 'Homepage shows a client logo preview');
  await page.goto(`${base}/clients.html`, { waitUntil: 'networkidle' });
  check(await page.locator('.logo-grid img').count() === 12, 'Clients page shows all 12 logos');
  for (const image of await page.locator('img').all()) await image.evaluate(async element => { element.loading = 'eager'; await element.decode(); });
  check(await page.locator('img').evaluateAll(images => images.every(i => i.naturalWidth > 0)), 'Clients page images decode');

  const missing = await page.goto(`${base}/does-not-exist.html`);
  check(missing.status() === 404, 'Unknown endpoint returns 404');
  check(await page.locator('.not-found a').count() >= 10, '404 page links to every main page');

  for (const width of [320, 390, 768, 1280, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ids) {
      await page.goto(`${base}/${id}.html`, { waitUntil: 'domcontentloaded' });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow: ${id} at ${width}px`);
    }
    await page.goto(`${base}/project1.html`, { waitUntil: 'domcontentloaded' });
    if (width <= 560) check(await page.locator('.table-scroll').first().evaluate(element => element.scrollWidth <= element.clientWidth), `Project rows stack without sideways scrolling at ${width}px`);
    else if (width <= 900) check(await page.locator('.table-hint').first().isVisible(), `Table scrolling explained at ${width}px`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Website menu' });
  check(await menu.isVisible(), 'Mobile menu opens');
  for (const href of ['/about.html', '/features.html', '/clients.html', '/contact.html', '/founder.html', '/team.html', '/project1.html', '/ehs.html', '/downloads.html']) {
    check(await menu.locator(`a[href$="${href}"]`).count() === 1, `Menu links to ${href}`);
  }
  await page.keyboard.press('Escape');
  check(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement), 'Menu returns keyboard focus');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/contact.html`, { waitUntil: 'networkidle' });
  await page.getByLabel('Your name').fill('Website Test');
  await page.getByLabel('Email address').fill('test@example.invalid');
  await page.getByLabel('Tell us about your project').fill('Validation only; do not send.');
  await page.getByRole('button', { name: 'Prepare email draft' }).click();
  check((await page.locator('.prepared-draft').getAttribute('href')).startsWith('mailto:ganeshvar@yahoo.com?'), 'Enquiry prepares an email draft');
  await context.close();

  const animatedContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const animated = await animatedContext.newPage();
  animated.on('pageerror', error => report.errors.push(error.message));
  await animated.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await animated.waitForFunction(() => document.querySelector('.site-shell')?.dataset.world === 'ready', null, { timeout: 30000 });
  check(await animated.locator('.world-stage canvas').count() === 1, 'One persistent Three.js canvas');
  await animated.waitForFunction(() => document.querySelector('.world-stage canvas')?.dataset.scene === 'cable', null, { timeout: 10000 });
  check(true, 'Homepage hero shows the cable scene');
  check(await animated.evaluate(() => document.documentElement.dataset.motion) === 'enabled', 'GSAP motion initializes');
  await animated.waitForTimeout(900);
  check(await animated.locator('.scene-poster').first().evaluate(element => Number(getComputedStyle(element).opacity) < .05), 'Fallback images hide when 3D is ready');
  await animated.screenshot({ path: path.join(output, 'home-desktop.png') });

  const expectedScenes = [['about', 'insulator'], ['why-us', 'busbar'], ['projects', 'switchgear'], ['clients', 'network'], ['contact', 'coil']];
  let maxCalls = 0;
  let maxTriangles = 0;
  for (const [anchor, scene] of expectedScenes) {
    await animated.locator(`#${anchor}`).evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await animated.waitForFunction(key => document.querySelector('.world-stage canvas')?.dataset.scene === key, scene, { timeout: 10000 });
    await animated.waitForTimeout(700);
    const metrics = await animated.locator('.world-stage canvas').evaluate(element => ({ calls: Number(element.dataset.drawCalls), triangles: Number(element.dataset.triangles) }));
    maxCalls = Math.max(maxCalls, metrics.calls);
    maxTriangles = Math.max(maxTriangles, metrics.triangles);
    check(metrics.calls > 0, `Scroll activates the ${scene} scene at #${anchor}`);
    await animated.screenshot({ path: path.join(output, `home-${anchor}.png`) });
  }
  report.scene = { maxCalls, maxTriangles };
  check(maxCalls <= 100 && maxTriangles <= 120000, `3D within budget (${maxCalls} calls, ${maxTriangles} triangles)`);

  await animated.locator('#projects').evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await animated.mouse.move(0, 0);
  await animated.waitForFunction(() => document.querySelector('.image-carousel')?.getAttribute('data-active') !== '0', null, { timeout: 15000 });
  check(true, 'Banner images rotate automatically');
  await animated.getByRole('button', { name: 'Pause image rotation', exact: true }).click();
  const pausedImage = await animated.locator('.image-carousel').getAttribute('data-active');
  await animated.mouse.move(0, 0);
  await animated.waitForTimeout(5600);
  check(await animated.locator('.image-carousel').getAttribute('data-active') === pausedImage, 'Image pause stops rotation');

  await animated.locator('#contact').evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await animated.waitForTimeout(1500);
  check(await animated.locator('#contact [data-reveal]').evaluate(element => Number(getComputedStyle(element).opacity) > .95), 'Scroll reveal shows contact content');

  await animated.getByRole('button', { name: 'Menu', exact: true }).click();
  await animated.getByLabel('Pause motion').check();
  await animated.keyboard.press('Escape');
  await animated.waitForTimeout(400);
  const pausedTime = await animated.locator('.world-stage canvas').getAttribute('data-time');
  await animated.mouse.wheel(0, 30);
  await animated.waitForTimeout(900);
  const laterTime = await animated.locator('.world-stage canvas').getAttribute('data-time');
  check(laterTime === pausedTime, `Pause motion stops ambient 3D animation (${pausedTime} → ${laterTime})`);

  await animated.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await animated.waitForFunction(() => document.querySelector('.site-shell')?.dataset.world === 'ready', null, { timeout: 30000 });
  await animated.waitForTimeout(500);
  report.transfer.home = await transfer(animated);
  check(report.transfer.home <= 1.5 * 1024 * 1024, `Home first-visit transfer ${Math.round(report.transfer.home / 1024)} KiB ≤ 1.5 MB`);
  await animated.emulateMedia({ reducedMotion: 'reduce' });
  await animated.waitForTimeout(300);
  check(await animated.locator('.world-stage canvas').count() === 0, 'Reduced motion removes the renderer');
  check(await animated.locator('.scene-poster').first().evaluate(element => Number(getComputedStyle(element).opacity) > .95), 'Reduced motion shows fallback images');
  check(await animated.locator('[data-reveal]').evaluateAll(elements => elements.every(e => Number(getComputedStyle(e).opacity) > .95)), 'Reduced motion restores all reveal content');
  await animatedContext.close();

  const innerContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const inner = await innerContext.newPage();
  inner.on('pageerror', error => report.errors.push(error.message));
  await inner.goto(`${base}/ehs.html`, { waitUntil: 'networkidle' });
  await inner.waitForFunction(() => document.querySelector('.site-shell')?.dataset.world === 'ready', null, { timeout: 30000 });
  await inner.waitForFunction(() => document.querySelector('.world-stage canvas')?.dataset.scene === 'breaker', null, { timeout: 10000 });
  report.transfer.inner = await transfer(inner);
  check(report.transfer.inner <= 1024 * 1024, `Inner page first-visit transfer ${Math.round(report.transfer.inner / 1024)} KiB ≤ 1 MB`);
  await inner.screenshot({ path: path.join(output, 'ehs-desktop.png') });
  for (const [id, scene] of [['project1', 'switchgear'], ['founder', 'cable'], ['downloads', 'coil'], ['features', 'busbar'], ['about', 'insulator']]) {
    await inner.goto(`${base}/${id}.html`, { waitUntil: 'networkidle' });
    await inner.waitForFunction(key => document.querySelector('.world-stage canvas')?.dataset.scene === key, scene, { timeout: 30000 });
    check(true, `${id}.html renders the ${scene} scene`);
  }
  await inner.setViewportSize({ width: 390, height: 844 });
  await inner.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await inner.waitForFunction(() => document.querySelector('.site-shell')?.dataset.world === 'ready', null, { timeout: 30000 });
  await inner.waitForTimeout(800);
  await inner.screenshot({ path: path.join(output, 'home-mobile.png') });
  await innerContext.close();

  const plainContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await plainContext.newPage();
  await plain.goto(`${base}/index.html`);
  check(await plain.getByRole('heading', { level: 1 }).isVisible(), 'Heading readable without JavaScript');
  check(await plain.getByRole('navigation', { name: 'All website pages' }).isVisible(), 'All pages reachable without JavaScript');
  await plain.goto(`${base}/project1.html`);
  check(await plain.locator('tbody tr').count() === 13, 'Project data complete without JavaScript');
  await plainContext.close();

  const saverContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await saverContext.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } }));
  const saver = await saverContext.newPage();
  await saver.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await saver.waitForTimeout(3000);
  check(await saver.locator('.world-stage canvas').count() === 0, 'Data Saver skips the 3D renderer');
  check(await saver.locator('.image-carousel').getAttribute('data-rotating') === 'false', 'Data Saver skips automatic image rotation');
  await saverContext.close();

  const unsupportedContext = await browser.newContext({ reducedMotion: 'no-preference' });
  await unsupportedContext.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl2' || type === 'webgl') return null;
      return original.call(this, type, ...args);
    };
  });
  const unsupported = await unsupportedContext.newPage();
  await unsupported.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await unsupported.waitForFunction(() => document.querySelector('.site-shell')?.dataset.world === 'fallback', null, { timeout: 15000 });
  check(await unsupported.locator('.world-status').isVisible(), 'Unavailable WebGL reports a fallback');
  check(await unsupported.locator('.scene-poster').first().evaluate(element => Number(getComputedStyle(element).opacity) > .95), 'Fallback images show without WebGL');
  await unsupportedContext.close();

  const realErrors = report.errors.filter(message => !/WebGL|getContext/i.test(message));
  check(realErrors.length === 0, `No uncaught browser errors: ${realErrors.join(' | ')}`);
  const violations = report.accessibility.flatMap(entry => entry.violations.map(v => ({ page: entry.page, ...v })));
  if (violations.length) console.log(JSON.stringify(violations, null, 2));
  check(violations.length === 0, 'No automated WCAG A/AA violations');
  report.status = 'passed';
  console.log(JSON.stringify({ status: report.status, checks: report.checks.length, projectRows: rowCount, scene: report.scene, transferKiB: { home: Math.round(report.transfer.home / 1024), inner: Math.round(report.transfer.inner / 1024) } }));
} catch (error) {
  report.status = 'failed';
  report.failure = error.message;
  console.error(error);
  process.exitCode = 1;
} finally {
  report.checkedAt = new Date().toISOString();
  await writeFile(path.join(output, 'website-validation.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
