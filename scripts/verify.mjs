// Post-deployment verification of the LIVE production domain.
// Usage: npm run verify -- https://www.your-domain.com   (add --skip-browser to run HTTP checks only)
// Checks HTTPS, redirects, every sitemap page, canonical/SEO domain, headers, caching, 404, forms config,
// then runs the full browser QA suite (all pages × 4 viewports, navigation, form states) against the live site.
import { spawnSync } from 'node:child_process';
import tls from 'node:tls';

const arg = process.argv.slice(2).find((a) => a.startsWith('http'));
if (!arg) { console.error('Usage: npm run verify -- https://www.your-domain.com'); process.exit(2); }
const origin = new URL(arg).origin;
const { host } = new URL(origin);
const altHost = host.startsWith('www.') ? host.slice(4) : `www.${host}`;
const results = [];
const check = (ok, name, detail = '') => { results.push({ ok, name, detail }); console.log(`${ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`); };
const get = (url, opts = {}) => fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'ZAPAX-deploy-verify', 'Accept-Encoding': 'br, gzip' }, ...opts });

console.log(`Verifying ${origin}\n`);

// 1. HTTPS and certificate
check(origin.startsWith('https://'), 'Site URL uses HTTPS');
await new Promise((resolve) => {
  const s = tls.connect(443, host, { servername: host }, () => {
    const c = s.getPeerCertificate();
    const days = Math.round((new Date(c.valid_to) - Date.now()) / 864e5);
    check(s.authorized, 'TLS certificate valid for host', s.authorized ? `expires in ${days} days` : String(s.authorizationError));
    s.end(); resolve();
  });
  s.on('error', (e) => { check(false, 'TLS connection', e.message); resolve(); });
});

// 2. Redirects: http → https, alternate host → canonical host
for (const from of [`http://${host}/`, `http://${altHost}/`, `https://${altHost}/`]) {
  try {
    const r = await get(from);
    const loc = r.headers.get('location') || '';
    check([301, 308].includes(r.status) && loc.startsWith(origin), `Redirect ${from}`, `${r.status} → ${loc || 'none'}`);
  } catch (e) { check(from.includes(altHost) ? null : false, `Redirect ${from}`, `not reachable: ${e.cause?.code || e.message}${from.includes(altHost) ? ' (add DNS for the alternate host to redirect it)' : ''}`); }
}
try { const r = await get(`${origin}/about.html`); check([301, 308].includes(r.status), 'Old URL /about.html redirects', `${r.status} → ${r.headers.get('location')}`); } catch (e) { check(false, 'Old URL /about.html redirects', e.message); }

// 3. robots.txt and sitemap use the production domain
const robots = await (await get(`${origin}/robots.txt`)).text();
check(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'robots.txt points to production sitemap');
check(!/Disallow:\s*\/\s*$/m.test(robots), 'robots.txt does not block the site');
const sitemap = await (await get(`${origin}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check(urls.length > 0 && urls.every((u) => u.startsWith(origin)), 'Sitemap URLs use production domain', `${urls.length} URLs`);

// 4. Every page: 200, canonical, og:url, indexable, no dev/preview references
let pageFails = 0;
for (const u of urls) {
  const r = await get(u);
  const html = await r.text();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const og = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  const problems = [];
  if (r.status !== 200) problems.push(`status ${r.status}`);
  if (canonical !== u) problems.push(`canonical ${canonical}`);
  if (og !== u) problems.push(`og:url ${og}`);
  if (/noindex/.test(html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || '')) problems.push('noindex');
  if (/localhost|127\.0\.0\.1|netlify\.app|pages\.dev|vercel\.app/.test(html)) problems.push('dev/preview URL in HTML');
  if (problems.length) { pageFails++; console.log(`      ${u}: ${problems.join(', ')}`); }
}
check(urls.length > 0 && pageFails === 0, 'All sitemap pages: 200, correct canonical/og:url, indexable, no preview URLs', `${urls.length - pageFails}/${urls.length} OK`);

// 5. 404 handling
const nf = await get(`${origin}/this-page-does-not-exist-${Date.now()}/`);
check(nf.status === 404, 'Missing pages return HTTP 404', String(nf.status));

// 6. Headers: security, caching, compression
const home = await get(`${origin}/`);
const homeHtml = await home.text();
for (const h of ['strict-transport-security', 'x-content-type-options', 'referrer-policy', 'content-security-policy']) check(!!home.headers.get(h), `Header ${h}`);
check(/br|gzip/.test(home.headers.get('content-encoding') || ''), 'HTML is compressed', home.headers.get('content-encoding') || 'none');
const css = homeHtml.match(/href="(\/assets\/[^"]+\.css)"/)?.[1];
if (css) { const r = await get(origin + css); check(/immutable|max-age=31536000/.test(r.headers.get('cache-control') || ''), 'Hashed assets cached long-term', r.headers.get('cache-control') || 'none'); }

// 7. Inquiry delivery configured
const contact = await (await get(`${origin}/contact/`)).text();
const endpoint = contact.match(/data-endpoint="([^"]*)"/)?.[1];
const email = contact.match(/data-email="([^"]*)"/)?.[1];
check(!!(endpoint || email), 'Inquiry form has a delivery route', endpoint ? `endpoint ${endpoint}` : email ? `email draft to ${email}` : 'none configured');
if (endpoint && endpoint.startsWith('/')) {
  const r = await get(origin + endpoint);
  check(r.status === 405, 'Inquiry backend deployed (GET answers 405)', `${r.status}`);
}
check(null, 'Real inquiry delivery', 'submit one test inquiry by hand: confirm the team email arrives AND the buyer receives the confirmation');

// 8. Browser QA on the live site
if (!process.argv.includes('--skip-browser')) {
  console.log('\nRunning browser QA against the live site…');
  const r = spawnSync(process.execPath, ['scripts/qa.mjs', '--url', origin], { stdio: 'inherit' });
  check(r.status === 0, 'Browser QA (all pages × 4 viewports, navigation, form states)');
}

const failed = results.filter((r) => r.ok === false).length;
console.log(`\n${results.filter((r) => r.ok).length} passed, ${failed} failed, ${results.filter((r) => r.ok === null).length} manual/skipped`);
process.exit(failed ? 1 : 0);
