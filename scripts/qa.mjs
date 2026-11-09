// Automated QA across all pages and viewports.
// Local build: node scripts/qa.mjs [--shots]   Live site: node scripts/qa.mjs --url https://www.example.com
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { executablePath } from './chrome.mjs';
import { server } from './serve.mjs';
import { pages } from '../src/pages.mjs';

const urlArg = process.argv.indexOf('--url');
const LIVE = urlArg > -1 ? process.argv[urlArg + 1].replace(/\/+$/, '') : '';
const PORT = 8091, base = LIVE || `http://localhost:${PORT}`;
const shots = process.argv.includes('--shots');
const viewports = [[360, 740], [768, 1024], [1280, 800], [1920, 1080]];
const issues = [];
const fail = (where, msg) => issues.push(`${where}: ${msg}`);
if (!LIVE) await new Promise((r) => server.listen(PORT, r));
if (shots) await mkdir('qa-shots', { recursive: true });

const browser = await puppeteer.launch({ executablePath });
const page = await browser.newPage();
// The first-visit loader is tested separately below; skip it for layout checks.
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem('zx-seen', '1'); } catch {} });
const errors = [];
page.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
page.on('requestfailed', (r) => !r.url().startsWith('https://forms.test') && errors.push(`request failed ${r.url()}`));
page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('/does-not-exist/') && !r.url().startsWith('https://forms.test') && errors.push(`${r.status()} ${r.url()}`));

const links = new Set();
const paths = pages.map((p) => (p.path === '/404' ? '/does-not-exist/' : p.path));
for (const path of paths) {
  for (const [w, h] of viewports) {
    errors.length = 0;
    await page.setViewport({ width: w, height: h });
    await page.goto(base + path, { waitUntil: 'networkidle0' });
    const where = `${path} @${w}`;
    const r = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
      const wide = [...document.querySelectorAll('body *')]
        .filter((e) => {
          const b = e.getBoundingClientRect();
          return b.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.form-scale-wrap,.table-wrap,.sr-only,.hp,.skip');
        })
        .map((e) => `${e.tagName}.${e.className.baseVal ?? e.className}`)
        .slice(0, 3);
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        wide,
        h1: document.querySelectorAll('h1').length,
        title: document.title,
        desc: document.querySelector('meta[name=description]')?.content || '',
        canonical: document.querySelector('link[rel=canonical]')?.href || '',
        dupIds: ids.filter((id, i) => ids.indexOf(id) !== i),
        noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
          try { JSON.parse(s.textContent); return true; } catch { return false; }
        }),
        headings: [...document.querySelectorAll('main h1,main h2,main h3')].map((h) => +h.tagName[1]),
        emptyLinks: [...document.querySelectorAll('a')].filter((a) => !a.getAttribute('href') || a.getAttribute('href') === '#' || !(a.textContent.trim() || a.getAttribute('aria-label'))).length,
        links: [...document.querySelectorAll('a[href]')].map((a) => a.href),
        unlabelled: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter((e) => !e.labels?.length).length,
      };
    });
    if (r.overflow) fail(where, `horizontal overflow ${r.wide.join(', ')}`);
    if (r.h1 !== 1) fail(where, `${r.h1} h1 elements`);
    if (w === 1280) {
      if (r.title.length > 70 || r.title.length < 15) fail(where, `title length ${r.title.length}: ${r.title}`);
      if (r.desc.length < 70 || r.desc.length > 165) fail(where, `description length ${r.desc.length}`);
      if (!r.canonical && path !== '/does-not-exist/') fail(where, 'missing canonical');
      if (r.dupIds.length) fail(where, `duplicate ids ${r.dupIds}`);
      if (r.noAlt) fail(where, `${r.noAlt} images without alt`);
      if (r.unlabelled) fail(where, `${r.unlabelled} unlabelled form controls`);
      if (r.ld.includes(false)) fail(where, 'invalid JSON-LD');
      if (r.emptyLinks) fail(where, `${r.emptyLinks} empty or placeholder links`);
      r.headings.forEach((lvl, i) => i && lvl - r.headings[i - 1] > 1 && fail(where, `heading jump h${r.headings[i - 1]}→h${lvl}`));
      r.links.forEach((l) => links.add(l.split('#')[0]));
    }
    if (r.broken.length) fail(where, `broken images ${r.broken}`);
    if (errors.length) fail(where, errors.join(' | '));
    if (shots && ['/', '/products/dehydrated-onion/', '/contact/', '/about/', '/quality/', '/documentation/', '/products/'].includes(path) && (w === 360 || w === 1280))
      await page.screenshot({ path: `qa-shots/${path.replace(/\//g, '_') || 'home'}-${w}.png`, fullPage: true });
  }
}

// Internal link check (every unique link found on every page)
for (const l of links) {
  if (!l.startsWith(base) || l.endsWith('/does-not-exist/')) continue;
  const res = await fetch(l);
  if (res.status !== 200) fail('links', `${res.status} ${l}`);
}
const external = [...links].filter((l) => !l.startsWith(base) && l.startsWith('http'));

// Navigation tests
const isOpen = (sel) => page.$eval(sel, (e) => e.getBoundingClientRect().height > 0);
await page.setViewport({ width: 375, height: 800 });
await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
await page.click('.nav-toggle');
if (!(await isOpen('#nav-list'))) fail('nav', 'mobile menu did not open');
await page.click('.menu-btn[aria-controls="menu-products"]');
if (!(await isOpen('#menu-products'))) fail('nav', 'mobile products submenu did not open');
await page.keyboard.press('Escape');
await page.keyboard.press('Escape');
if (await isOpen('#nav-list')) fail('nav', 'Escape did not close mobile menu');
await page.setViewport({ width: 1280, height: 800 });
await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
await page.click('.menu-btn[aria-controls="menu-export"]');
if (!(await isOpen('#menu-export'))) fail('nav', 'desktop export dropdown did not open');
await page.mouse.click(10, 600);
if (await isOpen('#menu-export')) fail('nav', 'outside click did not close dropdown');
// Keyboard: Tab into dropdown, Escape returns focus to button
await page.focus('.menu-btn[aria-controls="menu-products"]');
await page.keyboard.press('Enter');
await page.keyboard.press('Tab');
const inMenu = await page.evaluate(() => !!document.activeElement.closest('#menu-products'));
if (!inMenu) fail('nav', 'Tab did not move into open dropdown');
await page.keyboard.press('Escape');
const back = await page.evaluate(() => document.activeElement.getAttribute('aria-controls'));
if (back !== 'menu-products') fail('nav', 'Escape did not return focus to dropdown button');

// Loader: shown on first visit, removed after load
{
  const ctx = await browser.createBrowserContext();
  const p2 = await ctx.newPage();
  await p2.setViewport({ width: 1280, height: 800 });
  await p2.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  const shown = await p2.$eval('#loader', (l) => !l.hidden).catch(() => false);
  if (!shown) fail('loader', 'not shown on first visit');
  await p2.waitForFunction(() => !document.getElementById('loader'), { timeout: 8000 }).catch(() => fail('loader', 'not removed after load'));
  if (await p2.evaluate(() => document.documentElement.classList.contains('is-loading'))) fail('loader', 'page scroll still locked');
  await p2.goto(`${base}/about/`, { waitUntil: 'domcontentloaded' });
  if (await p2.$eval('#loader', (l) => !l.hidden).catch(() => false)) fail('loader', 'shown again on second page in same session');
  await ctx.close();
}

// Floating actions: WhatsApp link and back to top
await page.setViewport({ width: 1280, height: 800 });
await page.goto(`${base}/products/dehydrated-garlic/`, { waitUntil: 'networkidle0' });
const wa = await page.$eval('.fab-wa', (a) => a.href);
if (!wa.startsWith('https://wa.me/919998050731?text=') || !decodeURIComponent(wa).includes('Dehydrated Garlic')) fail('whatsapp', `unexpected link ${wa}`);
if (!(await page.$eval('.to-top', (b) => b.hidden))) fail('to-top', 'visible at top of page');
await page.evaluate(() => scrollTo(0, 2000));
await page.waitForFunction(() => !document.querySelector('.to-top').hidden, { timeout: 2000 }).catch(() => fail('to-top', 'not shown after scrolling'));
await page.click('.to-top');
await page.waitForFunction(() => scrollY === 0, { timeout: 3000 }).catch(() => fail('to-top', 'did not scroll to top'));

// Form tests
await page.goto(`${base}/contact/?product=dehydrated-garlic`, { waitUntil: 'networkidle0' });
if ((await page.$eval('#f-product', (e) => e.value)) !== 'Dehydrated Garlic') fail('form', 'product preselect from URL failed');
await page.$eval('#f-product', (e) => (e.value = ''));
await page.click('button[type=submit]');
const errCount = await page.$$eval('.error:not([hidden])', (e) => e.length);
if (errCount !== 5) fail('form', `expected 5 required-field errors, got ${errCount}`);
if ((await page.evaluate(() => document.activeElement.id)) !== 'f-name') fail('form', 'focus not moved to first invalid field');
await page.type('#f-email', 'bad@x');
await page.$eval('#f-email', (e) => e.dispatchEvent(new Event('blur')));
if (!(await page.$eval('#f-email-error', (e) => !e.hidden))) fail('form', 'invalid email not flagged');

async function submitWith(status, { honeypot = false } = {}) {
  await page.goto(`${base}/contact/`, { waitUntil: 'networkidle0' });
  await page.$eval('#inquiry', (f) => (f.dataset.endpoint = 'https://forms.test/submit'));
  let posted = false;
  await page.setRequestInterception(true);
  const handler = (req) => {
    if (req.url().startsWith('https://forms.test')) { posted = true; return req.respond({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{}' }); }
    return req.continue();
  };
  page.on('request', handler);
  await page.type('#f-name', 'Test Buyer');
  await page.type('#f-company', 'Test Foods Ltd');
  await page.type('#f-email', 'buyer@testfoods.com');
  await page.select('#f-country', 'Germany');
  await page.select('#f-product', 'Dehydrated Onion');
  if (honeypot) await page.$eval('#f-website', (e) => (e.value = 'spam'));
  await new Promise((r) => setTimeout(r, 3100));
  await page.click('button[type=submit]');
  await page.waitForSelector('.form-status.is-success, .form-status.is-error');
  const cls = await page.$eval('.form-status', (e) => e.className);
  page.off('request', handler);
  await page.setRequestInterception(false);
  return { cls, posted };
}
let res = await submitWith(200);
if (!res.cls.includes('is-success') || !res.posted) fail('form', 'success state not shown on 200');
res = await submitWith(500);
if (!res.cls.includes('is-error')) fail('form', 'error state not shown on 500');
res = await submitWith(200, { honeypot: true });
if (res.posted) fail('form', 'honeypot submission was sent to endpoint');

// End-to-end inquiry through the real handler (local dry run only, never against a live site)
if (!LIVE) {
  const { readdir } = await import('node:fs/promises');
  const count = async () => (await readdir('qa-shots/emails').catch(() => [])).length;
  const before = await count();
  await page.goto(`${base}/contact/`, { waitUntil: 'networkidle0' });
  await page.type('#f-name', 'E2E Buyer');
  await page.type('#f-company', 'Test Import Co');
  await page.type('#f-email', 'e2e@testimport.com');
  await page.select('#f-country', 'Netherlands');
  await page.select('#f-product', 'Dehydrated Ginger');
  await page.type('#f-message', 'Crushed bits for tea blends');
  await new Promise((r) => setTimeout(r, 3100));
  await page.click('button[type=submit]');
  await page.waitForSelector('.form-status.is-success, .form-status.is-error', { timeout: 10000 });
  const txt = await page.$eval('.form-status', (e) => e.className + ' ' + e.textContent);
  if (!txt.includes('is-success') || !txt.includes('e2e@testimport.com')) fail('e2e inquiry', txt.trim());
  if ((await count()) - before !== 2) fail('e2e inquiry', 'expected team email + confirmation email');
}

await browser.close();
if (!LIVE) server.close();
console.log(`Checked ${paths.length} pages × ${viewports.length} viewports, ${links.size} unique links (${external.length} external: ${external.join(', ')})`);
console.log(issues.length ? `\n${issues.length} issue(s):\n- ${issues.join('\n- ')}` : '\nNo issues found.');
process.exit(issues.length ? 1 : 0);
