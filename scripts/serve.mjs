// Local static server for dist/ with clean URLs, the 404 page and the inquiry backend: node scripts/serve.mjs [port]
// POST /api/inquiry runs the real handler. Without RESEND_API_KEY it is a dry run: emails are saved to qa-shots/emails/.
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { handleInquiry } from '../server/inquiry-core.mjs';

const root = resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf' };

let dryRunCount = 0;
async function dryRunFetch(url, init) {
  const mail = JSON.parse(init.body);
  await mkdir('qa-shots/emails', { recursive: true });
  const file = `qa-shots/emails/${Date.now()}-${++dryRunCount}-${mail.to[0].replace(/[^\w.@-]/g, '_')}.html`;
  await writeFile(file, `<!-- From: ${mail.from} | To: ${mail.to.join(', ')} | Reply-To: ${mail.reply_to} | Subject: ${mail.subject} -->\n${mail.html}`);
  console.log(`[dry run] email to ${mail.to.join(', ')}: "${mail.subject}" → ${file}`);
  return new Response('{}', { status: 200 });
}

async function inquiry(req, res, port) {
  const templates = JSON.parse(await readFile('server/generated/email-templates.json', 'utf8'));
  const live = !!process.env.RESEND_API_KEY;
  const env = live ? process.env : { RESEND_API_KEY: 'dry-run', MAIL_FROM: 'ZAPAX GLOBAL <dev@localhost>', MAIL_TO: 'team@localhost', ...process.env, RESEND_API_KEY: 'dry-run' };
  env.ALLOWED_ORIGIN = `http://localhost:${port}`;
  const request = new Request(`http://localhost:${port}${req.url}`, { method: req.method, headers: req.headers, body: Readable.toWeb(req), duplex: 'half' });
  const response = await handleInquiry(request, env, templates, live ? fetch : dryRunFetch);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}

export function createDevServer(port) {
  return createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (urlPath === '/api/inquiry') return inquiry(req, res, port).catch((e) => { console.error(e); res.writeHead(500); res.end('{}'); });
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
      res.end(await readFile(join(root, '404.html')));
    }
  });
}

// Back-compat for scripts that import { server } (port 8091 used by QA).
export const server = createDevServer(8091);

if (process.argv[1]?.endsWith('serve.mjs')) {
  const port = Number(process.argv[2]) || 8080;
  createDevServer(port).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}${process.env.RESEND_API_KEY ? '' : ' (inquiry emails: dry run → qa-shots/emails/)'}`));
}
