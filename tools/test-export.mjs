import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const output = path.resolve('out');
const deployment = JSON.parse(await readFile(path.join(output, 'deployment.json'), 'utf8'));
const ids = ['index', 'founder', 'team', 'org', 'project1', 'project2', 'project3', 'project4', 'ehs', 'downloads'];
const titles = new Set();
let links = 0;
for (const id of ids) {
  const html = await readFile(path.join(output, `${id}.html`), 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title, `Title required: ${id}`);
  titles.add(title);
  assert.ok(html.includes('name="description"'), `Description required: ${id}`);
  const canonical = `${deployment.siteUrl.replace(/\/$/, '')}${id === 'index' ? '/' : `/${id}.html`}`;
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `Canonical must match deployed URL: ${id}`);
  assert.ok(html.includes('property="og:image"'), `Social image required: ${id}`);
  assert.ok(html.includes('application/ld+json'), `Organisation data required: ${id}`);
  if (deployment.indexable) assert.ok(!html.includes('content="noindex'), `Live page must not be noindex: ${id}`);
  for (const [tag] of html.matchAll(/<(?:a|link|script|img)\b[^>]*>/g)) {
    if (/\brel="(?:preconnect|dns-prefetch)"/.test(tag)) continue;
    const value = tag.match(/(?:src|href)="([^"]+)"/)?.[1];
    if (!value) continue;
    if (!value.startsWith('/')) continue;
    assert.ok(value.startsWith(`${deployment.basePath}/`), `Root path escapes GitHub project: ${value}`);
    const url = new URL(value.replaceAll('&amp;', '&'), 'https://example.invalid');
    const relative = url.pathname.slice(deployment.basePath.length).replace(/^\/+/, '') || 'index.html';
    const file = path.join(output, ...relative.split('/'));
    await access(file);
    links++;
  }
}
assert.equal(titles.size, 10, 'Each original page needs a distinct title');
const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, 10);
assert.ok((await readFile(path.join(output, 'robots.txt'), 'utf8')).includes(`${deployment.siteUrl}/sitemap.xml`));
await access(path.join(output, '.nojekyll'));
assert.ok(!(await readdir(output)).includes('original'), 'Scraped files must not be deployed');
let total = 0;
async function measure(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) await measure(file);
    else total += (await stat(file)).size;
  }
}
await measure(output);
console.log(JSON.stringify({ pages: ids.length, checkedLinks: links, uniqueTitles: titles.size, totalStaticMiB: +(total / 1048576).toFixed(2), status: 'passed' }));
