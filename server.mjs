// Production Node server (Hostinger Node.js app): serves dist/ with clean URLs, security headers and POST /api/inquiry.
// Start: node server.mjs (or npm start). It rebuilds dist/ from the env vars first, so changing SITE_URL etc. in hPanel
// only needs a restart. Env: PORT, SITE_URL, EMAIL_DOMAIN, CONTACT_EMAIL, RESEND_API_KEY, MAIL_FROM, MAIL_TO (see .env.example).
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { handleInquiry } from './server/inquiry-core.mjs';

process.chdir(import.meta.dirname); // Hostinger may start the app from another working directory
if (process.env.SKIP_BUILD !== '1') execFileSync(process.execPath, ['--env-file-if-exists=.env', 'build.mjs', '--production'], { stdio: 'inherit' });
const root = resolve('dist');
const templates = JSON.parse(await readFile('server/generated/email-templates.json', 'utf8'));
const canonical = new URL(templates.allowedOrigin); // = SITE_URL baked in at build time
const altHost = canonical.host.startsWith('www.') ? canonical.host.slice(4) : `www.${canonical.host}`;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf', '.ico': 'image/x-icon' };
const retired = { '/about.html': '/about/', '/ZAPAX-product-overview.pdf': '/ZAPAX-ENTERPRISE-product-overview.pdf' };
// Same headers Netlify gets: the "/*" block of the generated _headers file.
const security = Object.fromEntries(
  (await readFile(join(root, '_headers'), 'utf8')).split(/\n(?=\S)/)[0].split('\n').slice(1).map((l) => l.trim().split(/:\s(.+)/).slice(0, 2)),
);

const send = (res, status, headers, body) => { res.writeHead(status, { ...security, ...headers }); res.end(body); };

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, canonical);
    if (req.headers.host === altHost) return send(res, 301, { Location: `${canonical.origin}${url.pathname}${url.search}` });
    if (url.pathname === '/api/inquiry') {
      const request = new Request(url, { method: req.method, headers: req.headers, body: req.method === 'POST' ? Readable.toWeb(req) : undefined, duplex: 'half' });
      const r = await handleInquiry(request, process.env, templates);
      return send(res, r.status, Object.fromEntries(r.headers), await r.text());
    }
    const path = decodeURIComponent(url.pathname);
    if (retired[path] || /^\/products\/fresh-(fruits|vegetables)\/?$/.test(path)) return send(res, 301, { Location: retired[path] || '/products/' });
    let file = resolve(join(root, path));
    if (file !== root && !file.startsWith(root + sep)) throw new Error('outside root');
    if (/^_(headers|redirects)$|^\.htaccess$/.test(file.split(sep).pop())) throw new Error('hidden');
    if ((await stat(file)).isDirectory()) {
      if (!path.endsWith('/')) return send(res, 301, { Location: `${path}/${url.search}` });
      file = join(file, 'index.html');
    }
    const ext = extname(file);
    const cache = /^\/(assets|fonts)\//.test(path) ? 'public, max-age=31536000, immutable' : ['.html', '.xml', '.txt'].includes(ext) ? 'public, max-age=0, must-revalidate' : 'public, max-age=604800';
    send(res, 200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': cache }, await readFile(file));
  } catch (e) {
    if (e.code !== 'ENOENT' && e.code !== 'ENOTDIR' && !/outside root|hidden/.test(e.message)) console.error(e);
    send(res, 404, { 'Content-Type': types['.html'] }, await readFile(join(root, '404.html')).catch(() => 'Not found'));
  }
}).listen(Number(process.env.PORT) || 3000, () => console.log(`ZAPAX site for ${canonical.origin} listening on port ${Number(process.env.PORT) || 3000}`));
