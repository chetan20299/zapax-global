// npm run deploy: build, then upload ONLY new or changed files to Hostinger over FTPS, then verify the live site.
// Replaces zips + File Manager "Extract", which silently dropped files. Needs in .env (see .env.example):
//   FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR (folder of the site on the FTP account, usually public_html), FTP_TLS_INSECURE=1 if FTP_HOST is an IP
// .deploy-state.json remembers what is on the server (path -> sha1), so unchanged photos are never uploaded again.
// Any file the live site does not serve (404) is uploaded again, up to 3 rounds.
//   node scripts/deploy.mjs --dry   show what would be uploaded, upload nothing
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const { FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR = '', SITE_URL } = process.env;
const DRY = process.argv.includes('--dry');
if (!DRY && !(FTP_HOST && FTP_USER && FTP_PASS)) throw new Error('Set FTP_HOST, FTP_USER, FTP_PASS and FTP_DIR in .env (hPanel → Files → FTP Accounts).');

execFileSync(process.execPath, ['build.mjs', '--production'], { stdio: 'inherit', env: { ...process.env, DEPLOY_TARGET: 'cpanel' } });

const STATE = '.deploy-state.json';
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const files = Object.fromEntries(walk('dist').map((f) => relative('dist', f).replaceAll('\\', '/'))
  .filter((p) => !/(^|\/)_(headers|redirects)$/.test(p)) // Netlify-only
  .map((p) => [p, createHash('sha1').update(readFileSync(join('dist', p))).digest('hex')]));

// Live check: GET (Hostinger's CDN can answer HEAD from a stale cache). Server-only files (.htaccess, PHP) are not public.
const missingLive = async (paths) => {
  const site = (SITE_URL || 'https://zapaxenterprise.com').replace(/\/$/, '');
  const pub = paths.filter((p) => !/(^|\/)\.htaccess$|^api\//.test(p)), bad = [];
  let i = 0;
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (i < pub.length) {
      const p = pub[i++];
      const r = await fetch(`${site}/${p.replace(/(^|\/)index\.html$/, '$1')}`, { redirect: 'manual' }).catch(() => ({ status: 0 }));
      await r.body?.cancel();
      if (r.status !== 200) bad.push(p);
    }
  }));
  return bad;
};

const q = (s) => `"${s.replace(/[\\"]/g, '\\$&')}"`;
const upload = (paths) => {
  const cfg = join(tmpdir(), `zapax-ftp-${process.pid}.cfg`); // password goes in a temp file, not on the command line
  const remote = (p) => `ftp://${FTP_HOST}/${[FTP_DIR, p].filter(Boolean).join('/').split('/').map(encodeURIComponent).join('/')}`;
  writeFileSync(cfg, [`user = ${q(`${FTP_USER}:${FTP_PASS}`)}`, 'ssl-reqd', 'ftp-create-dirs', 'parallel', 'parallel-max = 4', 'retry = 3', 'silent', 'show-error',
    ...(process.env.FTP_TLS_INSECURE === '1' ? ['insecure'] : []), // still encrypted; only for an FTP_HOST given as an IP address
    ...(process.platform === 'win32' ? ['ssl-no-revoke'] : []),
    `write-out = ${q('%{exitcode} %{url}\\n')}`, ...paths.flatMap((p) => [`upload-file = ${q(join('dist', p))}`, `url = ${q(remote(p))}`])].join('\n'));
  const curl = process.platform === 'win32' ? `${process.env.SystemRoot}\\System32\\curl.exe` : 'curl';
  const r = spawnSync(curl, ['-K', cfg], { encoding: 'utf8', maxBuffer: 1 << 26 });
  rmSync(cfg, { force: true });
  if (r.error) throw r.error;
  if (r.stderr) console.error(r.stderr.trim());
  const ok = new Set(r.stdout.split('\n').filter((l) => l.startsWith('0 ')).map((l) => decodeURIComponent(l.slice(2).trim())));
  const done = paths.filter((p) => ok.has(decodeURIComponent(remote(p))));
  for (const p of done) state[p] = files[p];
  writeFileSync(STATE, JSON.stringify(state, null, 1)); // saved after every round, so an interrupted deploy resumes
  return done;
};

let todo = Object.keys(files).filter((p) => state[p] !== files[p]);
const absent = await missingLive(Object.keys(files).filter((p) => !todo.includes(p)));
todo.push(...absent);
console.log(`${Object.keys(files).length} files, ${todo.length} to upload (${absent.length} missing on the live site).`);
if (DRY) { console.log(todo.join('\n')); process.exit(); }

for (let round = 1; todo.length && round <= 3; round++) {
  const done = upload(todo), failed = todo.filter((p) => !done.includes(p));
  console.log(`Round ${round}: uploaded ${done.length}/${todo.length}`);
  todo = [...failed, ...await missingLive(done)];
  for (const p of todo) delete state[p];
  writeFileSync(STATE, JSON.stringify(state, null, 1));
}
if (todo.length) { console.error(`Not uploaded or not live (run npm run deploy again):\n${todo.join('\n')}`); process.exit(1); }
console.log('✓ Live site matches dist/. If an old page still shows, purge the CDN cache in hPanel.');
