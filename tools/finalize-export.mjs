import { access, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('out');
const ids = ['index', 'founder', 'team', 'org', 'project1', 'project2', 'project3', 'project4', 'ehs', 'downloads'];
for (const id of ids) await access(path.join(output, `${id}.html`));

// Local ignored archive copies must never enter the deployable artifact.
await rm(path.join(output, 'original'), { recursive: true, force: true });
await rm(path.join(output, 'media', 'campus-poster.svg'), { force: true });
await rm(path.join(output, 'media', 'slide1.webp'), { force: true });
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'deployment.json'), JSON.stringify({
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://parama-guru.github.io/Ge',
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === 'true',
}, null, 2));
console.log(`Static export ready: ${ids.length} original HTML pages. No server or scraped archive required.`);
