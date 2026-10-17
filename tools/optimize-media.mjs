import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const directory = path.resolve('public', 'media');
let generatedBytes = 0;
for (const name of ['slide3', 'hd2', 'hd3', 'hd4', 'hd5']) {
  const source = await readFile(path.join(directory, `${name}.webp`));
  for (const width of [480, 960]) {
    const image = await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toBuffer();
    await writeFile(path.join(directory, `${name}-${width}.webp`), image);
    generatedBytes += image.length;
  }
}
console.log(`Created 10 responsive image variants (${Math.round(generatedBytes / 1024)} KiB combined).`);
const contentFile = path.resolve('src', 'data', 'site.json');
const site = JSON.parse(await readFile(contentFile, 'utf8'));
let saved = 0;
for (const image of site.images.filter(image => image.name.startsWith('client-'))) {
  const file = path.join(directory, `${image.name}.webp`);
  const input = await readFile(file);
  const metadata = await sharp(input).metadata();
  if (metadata.width <= 320 && metadata.height <= 160) continue;
  const result = await sharp(input).resize({ width: 320, height: 160, fit: 'inside', withoutEnlargement: true }).webp({ lossless: true, effort: 6 }).toBuffer();
  await writeFile(file, result);
  const size = await sharp(result).metadata();
  image.width = size.width;
  image.height = size.height;
  saved += input.length - result.length;
}
await writeFile(contentFile, JSON.stringify(site, null, 2));
console.log(`Reduced oversized client-logo transfers by ${Math.round(saved / 1024)} KiB.`);
