// SEO gate: checks every built page in dist/ against SEO-CHECKLIST.md. Every check must PASS.
//   npm run seo                                   offline checks on dist/ (run `npm run build` first)
//   npm run seo -- https://zapaxenterprise.com    also live server checks (redirects, headers, speed)
// Section numbers match SEO-CHECKLIST.md.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import opentype from 'opentype.js';

const SITE = (process.env.SITE_URL || 'https://zapaxenterprise.com').replace(/\/$/, '');
const live = process.argv.slice(2).find((a) => a.startsWith('http'))?.replace(/\/$/, '');
const fails = [];
let passes = 0;
const check = (ok, id, page, detail = '') => { if (ok) passes++; else fails.push(`FAIL ${id} ${page}${detail ? ` (${detail})` : ''}`); };

// Pixel width as Google renders it: Arial 20px (title), Arial 14px (description).
// ponytail: falls back to 0.55em per char when Arial is not installed (non-Windows); install Arial for exact numbers.
const arialPath = ['C:/Windows/Fonts/arial.ttf', '/usr/share/fonts/truetype/msttcorefonts/Arial.ttf', '/Library/Fonts/Arial.ttf'].find(existsSync);
const arial = arialPath && opentype.parse(readFileSync(arialPath).buffer);
const px = (s, size) => Math.round(arial ? arial.getAdvanceWidth(s, size) : s.length * size * 0.55);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const attr = (tag, name) => decode(tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i'))?.[1] ?? '');
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];
const meta = (html, name) => attr(tags(html, 'meta').find((t) => attr(t, 'name').toLowerCase() === name) || '', 'content');
const linkRel = (html, rel) => tags(html, 'link').filter((t) => attr(t, 'rel').toLowerCase().split(/\s+/).includes(rel));

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
if (!existsSync('dist')) { console.error('dist/ missing: run `npm run build` first'); process.exit(2); }
// google<token>.html is the one-line Search Console ownership file, not a page.
const isGscFile = (f) => /google[0-9a-f]+\.html$/.test(f);
const pages = walk('dist').filter((f) => f.endsWith('.html') && !isGscFile(f)).map((f) => {
  const rel = relative('dist', f).replaceAll('\\', '/');
  return { file: f, path: '/' + rel.replace(/(^|\/)index\.html$/, '$1'), html: readFileSync(f, 'utf8') };
});

const robots = existsSync('dist/robots.txt') ? readFileSync('dist/robots.txt', 'utf8') : '';
check(!/^Disallow:\s*\/\s*$/m.test(robots), '1.3', 'robots.txt', 'blocks the whole site');
// 1.13 Search Console ownership file
const gsc = walk('dist').find(isGscFile);
check(gsc && readFileSync(gsc, 'utf8').startsWith('google-site-verification: '), '1.13', 'dist/', 'Google verification file missing');

// 1.8 Domain
const domain = new URL(SITE).hostname.replace(/^www\./, '');
check(domain.split('.').length === 2, '1.8', SITE, 'is a subdomain');
check(domain.split('.')[0].length <= 20, '1.8', SITE, 'domain name longer than 20 chars');
check(/^[a-z0-9.-]+$/.test(domain), '1.8', SITE, 'non-Latin characters');

const seenTitle = new Map(), seenDesc = new Map(), seenBody = new Map();
for (const { path, html } of pages) {
  const is404 = path === '/404.html';
  const head = html.slice(0, html.search(/<\/head>/i));
  const body = html.slice(html.search(/<body\b/i));

  // 1.11 Doctype first
  check(/^<!doctype html>/i.test(html), '1.11', path, 'doctype missing or not first');
  // 1.10 Charset
  check(/<meta charset="utf-8">/i.test(head), '1.10', path, 'no <meta charset="utf-8">');
  // 1.5 Language
  check(/<html[^>]*\slang="en"/i.test(html), '1.5', path, 'html lang="en" missing');
  // 1.6 / 1.7 No hreflang alternates, no rel=next/prev
  check(!linkRel(head, 'alternate').some((t) => attr(t, 'hreflang')), '1.6', path, 'hreflang alternate present');
  check(!linkRel(head, 'next').length && !linkRel(head, 'prev').length, '1.7', path, 'rel=next/prev present');
  // 2.3 Mobile
  check(meta(head, 'viewport').replace(/\s/g, '') === 'width=device-width,initial-scale=1', '2.3', path, 'viewport');
  const touch = linkRel(head, 'apple-touch-icon')[0];
  check(touch && existsSync(join('dist', attr(touch, 'href'))), '2.3', path, 'apple-touch-icon missing');
  // 1.12 Favicon
  const icon = linkRel(head, 'icon')[0];
  check(icon && existsSync(join('dist', attr(icon, 'href'))), '1.12', path, 'favicon missing');
  // 2.2 Frames
  check(!/<frameset\b|<frame\b/i.test(html), '2.2', path, 'frameset used');
  // 2.8 HTTPS: every included file and link is https or relative
  const insecure = [...html.matchAll(/\s(?:src|href|srcset|content)="(http:\/\/[^"]+)"/gi)].map((m) => m[1]);
  check(!insecure.length, '2.8', path, `http:// resources: ${insecure.slice(0, 3).join(', ')}`);
  // 5.3 HTML size
  const kb = Buffer.byteLength(html) / 1024;
  check(kb <= 100, '5.3', path, `HTML ${kb.toFixed(0)} kB > 100 kB`);

  if (is404) continue; // 404 is noindex: content/meta rules below do not apply

  // 1.1 Title
  const title = decode(head.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '').trim();
  const tpx = px(title, 20);
  check(title && tpx <= 580, '1.1', path, `title ${tpx}px > 580px: "${title}"`);
  const words = title.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const dup = words.filter((w, i) => words.indexOf(w) !== i);
  check(!dup.length, '1.1', path, `duplicate words in title: ${[...new Set(dup)].join(', ')}`);
  check(!seenTitle.has(title), '1.1', path, `same title as ${seenTitle.get(title)}`); seenTitle.set(title, path);
  // 1.2 Meta description
  const desc = meta(head, 'description').trim();
  const dpx = px(desc, 14);
  check(desc && dpx <= 1000, '1.2', path, `description ${dpx}px > 1000px`);
  check(desc.length >= 70, '1.2', path, `description too short (${desc.length} chars)`);
  check(!seenDesc.has(desc), '1.2', path, `same description as ${seenDesc.get(desc)}`); seenDesc.set(desc, path);
  // 1.3 Crawlability
  check(!/noindex|nofollow/i.test(meta(head, 'robots')), '1.3', path, 'robots meta blocks indexing');
  // 1.4 Canonical
  const canon = attr(linkRel(head, 'canonical')[0] || '', 'href');
  check(canon === SITE + path, '1.4', path, `canonical "${canon}" != ${SITE + path}`);
  // 1.9 Page URL
  check(!/[?#]/.test(path) && !/sid=|sessionid|jsessionid/i.test(path), '1.9', path, 'parameters / session id in URL');
  check(path.split('/').filter(Boolean).length <= 3, '1.9', path, 'more than 3 subdirectories');
  // 2.7 Additional markup: valid JSON-LD
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  check(ld.length && ld.every((m) => { try { JSON.parse(m[1]); return true; } catch { return false; } }), '2.7', path, 'no valid JSON-LD');
  // 1.13 Search Console verification meta tag on the home page
  if (path === '/') check(meta(head, 'google-site-verification').length > 20, '1.13', path, 'google-site-verification meta missing');
  // 2.6 Social: sharing links on the page
  check(/linkedin\.com\/sharing|facebook\.com\/sharer/.test(body), '2.6', path, 'no social sharing links');
  // 2.6 Social: Open Graph present
  check(['og:title', 'og:description', 'og:image', 'og:url'].every((p) => head.includes(`property="${p}"`)), '2.6', path, 'Open Graph tags incomplete');

  // 2.1 Content
  const text = decode(body.replace(/<(script|style|svg|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<\/(p|li|h[1-6]|td|th|dt|dd|div|button|a|label|figcaption|summary)>/gi, '. ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  const wc = (text.match(/[\p{L}\p{N}]+/gu) || []).length;
  check(wc >= 250, '2.1', path, `only ${wc} words (min 250)`);
  check(/<(ul|ol)\b/i.test(body), '2.1', path, 'no list on page');
  check(!/lorem ipsum|placeholder text|\bTODO\b|\bTBD\b|example\.com/i.test(text), '2.1', path, 'placeholder text found');
  check(!tags(body, 'img').some((t) => /placeholder|dummy/i.test(attr(t, 'src'))), '2.1', path, 'placeholder image found');
  // Block ends count as sentence ends (as Seobility does), so nav/list items don't inflate the average.
  const sentences = text.split(/[.!?:]+(?:\s|$)/).map((s) => (s.match(/[\p{L}\p{N}]+/gu) || []).length).filter((n) => n >= 3);
  const avg = sentences.length ? sentences.reduce((a, b) => a + b, 0) / sentences.length : 0;
  check(avg <= 20, '2.1', path, `average sentence ${avg.toFixed(1)} words > 20`);
  const hash = createHash('sha1').update(text).digest('hex');
  check(!seenBody.has(hash), '2.1', path, `duplicate content of ${seenBody.get(hash)}`); seenBody.set(hash, path);
  // 2.4 Strong/bold: at most ~2% of words
  const bold = (body.match(/<(strong|b)\b/gi) || []).length;
  check(bold <= Math.max(5, Math.round(wc * 0.02)), '2.4', path, `${bold} strong/b tags, max ${Math.max(5, Math.round(wc * 0.02))}`);
  // 2.5 Image alt attributes
  // Seobility counts alt="" as missing, so the alt must have text.
  const noAlt = tags(body, 'img').filter((t) => !/\salt="[^"]+"/i.test(t));
  check(!noAlt.length, '2.5', path, `${noAlt.length} <img> with missing or empty alt`);
  // 3.1 H1
  const h1 = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h1text = decode((h1[0] || '').replace(/<[^>]+>/g, '')).trim();
  check(h1.length === 1 && h1text.length >= 10 && h1text.length <= 70, '3.1', path, `${h1.length} h1, "${h1text}"`);
  // 3.2 Headings in proportion: one h2-h6 per 150 words
  const hn = (body.match(/<h[2-6]\b/gi) || []).length;
  check(hn >= Math.floor(wc / 150), '3.2', path, `${hn} sub-headings for ${wc} words, need ${Math.floor(wc / 150)}`);
  // ...and not too many: at least 50 words of text per heading (h1 included)
  check(wc / (hn + 1) >= 50, '3.2', path, `${hn + 1} headings for ${wc} words (${(wc / (hn + 1)).toFixed(0)} words per heading, min 50)`);
  // 2.1 Title and H1 words appear in the page content (outside the title and the H1 itself)
  const content = (decode(body.replace(/<h1\b[\s\S]*?<\/h1>/i, ' ').replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).toLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
  const has = new Set(content);
  const absent = (s) => [...new Set((s.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter((w) => !has.has(w)))];
  check(!absent(title).length, '2.1', path, `title words not in content: ${absent(title).join(', ')}`);
  check(!absent(h1text).length, '2.1', path, `H1 words not in content: ${absent(h1text).join(', ')}`);
  // 4.1 Internal links: count, no parameters, target exists
  const hrefs = tags(body, 'a').map((t) => attr(t, 'href')).filter(Boolean);
  const internal = hrefs.filter((h) => h.startsWith('/') && !h.startsWith('//') || h.startsWith(SITE));
  check(internal.length >= 3 && internal.length <= 150, '4.1', path, `${internal.length} internal links`);
  const dyn = internal.filter((h) => h.includes('?'));
  check(!dyn.length, '4.1', path, `dynamic parameters: ${dyn.slice(0, 3).join(', ')}`);
  const broken = [...new Set(internal.map((h) => h.replace(SITE, '').split(/[?#]/)[0]).filter(Boolean))]
    .filter((p) => !existsSync(join('dist', p, p.endsWith('/') ? 'index.html' : '')));
  check(!broken.length, '4.1', path, `broken internal links: ${broken.slice(0, 3).join(', ')}`);
  // 4.1 Anchor texts: short, and each text used for one link only
  const anchors = [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
    .map(([, a, t]) => [attr(`<a ${a}>`, 'href'), decode(t.replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()])
    .filter(([h, t]) => t && h.startsWith('/'));
  const long = anchors.filter(([, t]) => t.length > 60);
  check(!long.length, '4.1', path, `anchor text over 60 chars: "${long[0]?.[1].slice(0, 60)}…"`);
  const seenAnchor = new Set(), reused = new Set();
  for (const [, t] of anchors) (seenAnchor.has(t.toLowerCase()) ? reused : seenAnchor).add(t.toLowerCase());
  check(!reused.size, '4.1', path, `anchor text used more than once: ${[...reused].slice(0, 5).join(' | ')}`);
  // 4.2 External links are https
  const ext = hrefs.filter((h) => /^https?:\/\//.test(h) && !h.startsWith(SITE));
  check(ext.every((h) => h.startsWith('https://')), '4.2', path, 'external link over http');
}

// 5. Server configuration (live only)
if (live) {
  const { host } = new URL(live);
  const alt = host.startsWith('www.') ? host.slice(4) : `www.${host}`;
  for (const from of [`http://${host}/`, `http://${alt}/`, `https://${alt}/`]) {
    const r = await fetch(from, { redirect: 'manual' }).catch((e) => ({ status: e.cause?.code || e.message, headers: new Headers() }));
    check([301, 308].includes(r.status) && (r.headers.get('location') || '').startsWith(live), '5.1', from, `${r.status} → ${r.headers.get('location')}`);
  }
  for (const p of pages.filter((p) => p.path !== '/404.html')) {
    const t = performance.now();
    const r = await fetch(live + p.path, { headers: { 'Accept-Encoding': 'br, gzip' } }).catch(() => null);
    const ms = performance.now() - t;
    if (!r) { check(false, '1.3', p.path, 'not reachable'); continue; }
    await r.arrayBuffer();
    check(r.status === 200, '1.3', p.path, `status ${r.status}`);
    check(/charset=utf-8/i.test(r.headers.get('content-type') || ''), '5.2', p.path, `Content-Type "${r.headers.get('content-type')}" has no charset`);
    check(!r.headers.get('x-powered-by'), '5.2', p.path, `X-Powered-By: ${r.headers.get('x-powered-by')}`);
    check(/br|gzip|deflate/.test(r.headers.get('content-encoding') || ''), '5.2', p.path, 'no compression');
    check(ms <= 400, '5.3', p.path, `response ${ms.toFixed(0)} ms > 400 ms`);
  }
} else console.log('Live checks (1.3 status, 5.1–5.3 server) skipped: pass the site URL to run them.');

console.log(fails.join('\n'));
console.log(`\nSEO: ${passes} passed, ${fails.length} failed across ${pages.length} pages${arial ? '' : ' (Arial not found: pixel widths estimated)'}`);
if (fails.length) process.exitCode = 1;
