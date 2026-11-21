// Compare the local build (dist/) with the live site: every file must be served with status 200.
//   node scripts/check-live.mjs [https://zapaxenterprise.com]
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const base = (process.argv[2] || 'https://zapaxenterprise.com').replace(/\/$/, '');
const SKIP = /(^|\/)(\.htaccess|_headers|_redirects)$|^api\//; // server config / PHP: not public files
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const paths = walk('dist').map((f) => relative('dist', f).replaceAll('\\', '/')).filter((p) => !SKIP.test(p))
  .map((p) => '/' + p.replace(/(^|\/)index\.html$/, '$1'));

const bad = [];
let i = 0;
await Promise.all(Array.from({ length: 12 }, async () => {
  while (i < paths.length) {
    const p = paths[i++];
    // GET, not HEAD: Hostinger's CDN can answer HEAD from a stale cache while GET is 404.
    const r = await fetch(base + p, { redirect: 'manual' }).catch((e) => ({ status: e.message }));
    await r.body?.cancel();
    if (r.status !== 200) bad.push(`${r.status} ${p}`);
  }
}));
console.log(`${paths.length - bad.length}/${paths.length} files OK on ${base}`);
if (bad.length) {
  console.log(bad.sort().join('\n'));
  process.exitCode = 1;
  let map = {};
  try { map = JSON.parse(readFileSync('hostinger-upload-parts.json', 'utf8')); } catch {}
  const parts = [...new Set(bad.map((b) => map[b.split(' ')[1].slice(1).replace(/(^|\/)$/, '$1index.html')]).filter(Boolean))].sort((a, b) => a - b);
  if (parts.length) console.log(`\nUpload and extract again: ${parts.map((n) => `hostinger-upload-${n}.zip`).join(', ')}`);
}
