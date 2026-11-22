// Hostinger upload package → hostinger-upload.zip. See HOSTINGER-DEPLOYMENT.md.
//   npm run package:hostinger       Single Web Hosting (Apache + PHP): built site + .htaccess + PHP form handler.
//                                   Extract the zip directly into public_html.
//   npm run package:hostinger-node  Business/Cloud Node.js app: source + server.mjs, package.json at the zip root;
//                                   Hostinger runs npm install, then server.mjs builds dist/ from the hPanel env vars.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const NODE = process.argv.includes('--node');
const build = (env, args = []) => execFileSync(process.execPath, ['--env-file-if-exists=.env', 'build.mjs', ...args], { stdio: 'inherit', env: { ...process.env, ...env } });
let stage;

if (NODE) {
  // Sanity check: the site must build before we ship it.
  build({ SITE_URL: process.env.SITE_URL || 'https://example.com' });
  const INCLUDE = ['server.mjs', 'build.mjs', 'src', 'public', '.env.example'];
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const esbuild = JSON.parse(readFileSync('node_modules/esbuild/package.json', 'utf8')).version;
  stage = mkdtempSync(join(tmpdir(), 'zapax-hostinger-'));
  for (const p of INCLUDE) cpSync(p, join(stage, p), { recursive: true });
  writeFileSync(join(stage, 'package.json'), JSON.stringify({
    name: pkg.name, version: '1.0.0', private: true, type: 'module', main: 'server.mjs',
    scripts: { build: 'node build.mjs --production', start: 'node server.mjs' },
    dependencies: { esbuild }, // the build only needs esbuild at runtime
    engines: pkg.engines,
  }, null, 2) + '\n');
} else {
  // Production build stops if SITE_URL (set in .env) is missing. 
  build({}, ['--production']);
  stage = mkdtempSync(join(tmpdir(), 'zapax-hostinger-'));
  cpSync('dist', stage, { recursive: true, filter: (src) => !/[\\/]_(headers|redirects)$/.test(src) }); // Netlify-only files
}

for (const f of readdirSync('.')) if (/^hostinger-upload(-\d+)?\.zip$/.test(f)) rmSync(f); // zips from earlier runs
const tarZip = (name, files) => {
  const zip = resolve(name), list = `${stage}.txt`;
  writeFileSync(list, files.join('\n'));
  // Windows 10+ ships bsdtar (System32\tar.exe), which writes real .zip files with forward-slash paths.
  if (process.platform === 'win32') execFileSync(`${process.env.SystemRoot}\\System32\\tar.exe`, ['-a', '-c', '-f', zip, '-T', list], { cwd: stage, stdio: 'inherit' });
  else execFileSync('zip', ['-q', zip, '-@'], { cwd: stage, input: files.join('\n') });
  rmSync(list);
  console.log(`✓ ${name} (${(statSync(zip).size / 1048576).toFixed(1)} MB, ${files.length} files)`);
};
if (NODE) tarZip('hostinger-upload.zip', readdirSync(stage));
else {
  // One 66 MB zip got cut off during upload/extract in hPanel (half of photos/ and all of products/ never went live).
  // hPanel also silently drops files from 20 MB zips, so: pages first, then photos in parts of at most 8 MB.
  // hostinger-upload-parts.json maps each file to its part, so scripts/check-live.mjs can name the part to extract again.
  const walk = (d) => readdirSync(join(stage, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}${e.name}/`) : [`${d}${e.name}`]));
  const all = walk('');
  const parts = [all.filter((p) => !p.startsWith('photos/'))];
  let size = Infinity;
  for (const p of all.filter((p) => p.startsWith('photos/'))) {
    const n = statSync(join(stage, p)).size;
    if (size + n > 8 * 1048576) { parts.push([]); size = 0; }
    parts.at(-1).push(p); size += n;
  }
  parts.forEach((files, i) => tarZip(`hostinger-upload-${i + 1}.zip`, files));
  writeFileSync('hostinger-upload-parts.json', JSON.stringify(Object.fromEntries(parts.flatMap((f, i) => f.map((p) => [p, i + 1])))));
}
rmSync(stage, { recursive: true, force: true });
console.log(NODE ? '\nFor a Hostinger Node.js app. See HOSTINGER-DEPLOYMENT.md.'
  : '\nFor public_html: upload and extract EVERY hostinger-upload-N.zip into public_html, then run: node scripts/check-live.mjs');
