import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('out');
const pages = JSON.parse(await readFile(path.resolve('src', 'data', 'pages.json'), 'utf8'));
for (const { id } of pages) await access(path.join(output, `${id}.html`));
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'deployment.json'), JSON.stringify({
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://parama-guru.github.io/Ge',
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === 'true',
}, null, 2));
console.log(`Static export ready: ${pages.length} HTML pages.`);
