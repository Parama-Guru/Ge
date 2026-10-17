import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const output = path.resolve('out');
const { basePath } = JSON.parse(await readFile(path.join(output, 'deployment.json'), 'utf8'));
const port = Number(process.env.PORT || 3000);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end('Invalid URL'); return; }
  if (pathname === basePath && basePath) {
    response.writeHead(301, { Location: `${basePath}/` }).end();
    return;
  }
  if (basePath && !pathname.startsWith(`${basePath}/`)) {
    response.writeHead(404).end('Not found');
    return;
  }
  const relative = pathname.slice(basePath.length).replace(/^\/+/, '') || 'index.html';
  let file = path.resolve(output, ...relative.split('/'));
  if (!file.startsWith(`${output}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    const type = types[path.extname(file)] || 'application/octet-stream';
    const compressed = /text\/|application\/(json|xml)/.test(type) && /\bgzip\b/.test(request.headers['accept-encoding'] || '');
    const payload = compressed ? gzipSync(body) : body;
    response.writeHead(200, {
      'Content-Type': type, 'Content-Length': payload.length, Vary: 'Accept-Encoding',
      ...(compressed ? { 'Content-Encoding': 'gzip' } : {}),
    });
    response.end(request.method === 'HEAD' ? undefined : payload);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : await readFile(path.join(output, '404.html')));
    } else {
      console.error('Static preview failed:', error);
      response.writeHead(500).end('Unable to read static file');
    }
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Static website: http://127.0.0.1:${port}${basePath}/`));
