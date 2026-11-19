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
  // Sanity check: the site must build and the form tests must pass before we ship it.
  build({ SITE_URL: process.env.SITE_URL || 'https://example.com' });
  execFileSync(process.execPath, ['scripts/test-inquiry.mjs'], { stdio: 'inherit' });
  const INCLUDE = ['server.mjs', 'build.mjs', 'src', 'public', 'server/inquiry-core.mjs', 'server/email-templates.mjs', '.env.example'];
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
  // Production build stops if SITE_URL (set in .env) is missing. DEPLOY_TARGET=cpanel adds api/inquiry.php.
  build({ DEPLOY_TARGET: 'cpanel' }, ['--production']);
  stage = mkdtempSync(join(tmpdir(), 'zapax-hostinger-'));
  cpSync('dist', stage, { recursive: true, filter: (src) => !/[\\/]_(headers|redirects)$/.test(src) }); // Netlify-only files
}

const zip = resolve('hostinger-upload.zip');
rmSync(zip, { force: true });
// Windows 10+ ships bsdtar (System32\tar.exe), which writes real .zip files with forward-slash paths.
if (process.platform === 'win32') execFileSync(`${process.env.SystemRoot}\\System32\\tar.exe`, ['-a', '-c', '-f', zip, ...readdirSync(stage)], { cwd: stage, stdio: 'inherit' });
else execFileSync('zip', ['-r', zip, ...readdirSync(stage)], { cwd: stage, stdio: 'inherit' });
rmSync(stage, { recursive: true, force: true });
console.log(`\n✓ ${zip} (${(statSync(zip).size / 1048576).toFixed(1)} MB) for ${NODE ? 'a Hostinger Node.js app' : 'public_html (Single Web Hosting)'}. See HOSTINGER-DEPLOYMENT.md.`);
