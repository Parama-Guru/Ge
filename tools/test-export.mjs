import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const output = path.resolve('out');
const deployment = JSON.parse(await readFile(path.join(output, 'deployment.json'), 'utf8'));
const pages = JSON.parse(await readFile(path.resolve('src', 'data', 'pages.json'), 'utf8'));
const siteUrl = deployment.siteUrl.replace(/\/$/, '');
const titles = new Set();
const descriptions = new Set();
let links = 0;

for (const { id } of pages) {
  const html = await readFile(path.join(output, `${id}.html`), 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title, `Title required: ${id}`);
  titles.add(title);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(description && description.length >= 70 && description.length <= 170, `Description of 70–170 characters required: ${id}`);
  descriptions.add(description);
  const canonical = `${siteUrl}${id === 'index' ? '/' : `/${id}.html`}`;
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `Canonical must match deployed URL: ${id}`);
  assert.ok(html.includes('property="og:title"') && html.includes('property="og:image"'), `Open Graph required: ${id}`);
  assert.ok(html.includes('name="twitter:card"'), `Twitter card required: ${id}`);
  assert.ok(html.includes('"@type":"Organization"'), `Organization data required: ${id}`);
  if (id !== 'index') assert.ok(html.includes('"@type":"BreadcrumbList"'), `Breadcrumb data required: ${id}`);
  assert.ok(html.includes('name="theme-color"'), `Theme colour required: ${id}`);
  assert.ok(html.includes('<html lang="en"'), `Language required: ${id}`);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `Exactly one h1 required: ${id}`);
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) assert.ok(/\balt="/.test(tag), `Image alt attribute required: ${id}`);
  if (deployment.indexable) assert.ok(!html.includes('content="noindex'), `Live page must not be noindex: ${id}`);
  for (const [tag] of html.matchAll(/<(?:a|link|script|img)\b[^>]*>/g)) {
    if (/\brel="(?:preconnect|dns-prefetch)"/.test(tag)) continue;
    const value = tag.match(/(?:src|href)="([^"]+)"/)?.[1];
    if (!value || !value.startsWith('/')) continue;
    assert.ok(value.startsWith(`${deployment.basePath}/`), `Root path escapes GitHub project: ${value}`);
    const url = new URL(value.replaceAll('&amp;', '&'), 'https://example.invalid');
    const relative = url.pathname.slice(deployment.basePath.length).replace(/^\/+/, '') || 'index.html';
    await access(path.join(output, ...relative.split('/')));
    links++;
  }
}
assert.equal(titles.size, pages.length, 'Each page needs a distinct title');
assert.equal(descriptions.size, pages.length, 'Each page needs a distinct description');
const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
for (const { id } of pages) assert.ok(sitemap.includes(`<loc>${siteUrl}${id === 'index' ? '/' : `/${id}.html`}</loc>`), `Sitemap must list ${id}`);
assert.ok((await readFile(path.join(output, 'robots.txt'), 'utf8')).includes(`${siteUrl}/sitemap.xml`));
await access(path.join(output, '.nojekyll'));
await access(path.join(output, '404.html'));

let total = 0;
async function measure(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) await measure(file);
    else total += (await stat(file)).size;
  }
}
await measure(output);
console.log(JSON.stringify({ pages: pages.length, checkedLinks: links, uniqueTitles: titles.size, totalStaticMiB: +(total / 1048576).toFixed(2), status: 'passed' }));
