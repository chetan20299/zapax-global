// Local static server for dist/ with clean URLs and the 404 page: node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg','.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf' };

export function createDevServer(port) {
  return createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = resolve(join(root, urlPath));
    try {
      if (file !== root && !file.startsWith(root + sep)) throw new Error('outside root');
      if ((await stat(file)).isDirectory()) {
        if (!urlPath.endsWith('/')) { res.writeHead(301, { Location: `${urlPath}/` }); return res.end(); }
        file = join(file, 'index.html');
      }
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': types['.html'] });
      res.end(await readFile(join(root, '404.html')).catch(() => 'Not found. dist/ is incomplete: run "npm run build".'));
    }
  });
}

// Back-compat for scripts that import { server } (port 8091 used by QA).
export const server = createDevServer(8091);

if (process.argv[1]?.endsWith('serve.mjs')) {
  const port = Number(process.argv[2]) || 8080;
  createDevServer(port).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
}
