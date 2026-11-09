// Website brand assets in the ZAPAX GLOBAL identity: npm run assets
// → public/og-image.png, public/apple-touch-icon.png, public/brand/logo-symbol-512.png, public/ZAPAX-GLOBAL-product-overview.pdf
import { mkdir, readFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { executablePath, launchArgs } from './chrome.mjs';
import { formScale } from '../src/art.mjs';
import { lockup, symbol, modes, colors, slogan } from '../src/brand.mjs';
import { site, products, fullAddress } from '../src/site.mjs';

await mkdir('public/brand', { recursive: true });
const browser = await puppeteer.launch({ executablePath, args: launchArgs });
const page = await browser.newPage();
const font = (await readFile('public/fonts/archivo-latin-var.woff2')).toString('base64');
const fontCss = `@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${font});font-weight:400 800;font-stretch:100% 125%}`;
const css = (await readFile('src/styles.css', 'utf8')).replace(/@font-face\s*{[^}]*}/g, '');
const logo = (mode, w) => lockup('horizontal', mode).svg.replace(/ width="[^"]*" height="[^"]*"/, ` style="width:${w};height:auto;display:block"`);

// Open Graph image 1200 × 630
await page.setViewport({ width: 1200, height: 630 });
await page.setContent(`<style>${fontCss}${css}
body{margin:0;padding:52px 64px;width:1200px;height:630px;box-sizing:border-box;background:#fff;overflow:hidden;padding-bottom:0}
h1{font-size:60px;line-height:1.02;max-width:16ch;margin:34px 0 0}.fs{margin-top:8px}.fs-stage{animation:none!important}
.tag{position:absolute;right:64px;top:62px;color:${colors.indigo};font:650 22px Archivo;font-stretch:108%}</style>
${logo('primary', '230px')}<span class="tag">${slogan}</span><h1>Indian exports, carried on trust.</h1><div class="fs">${formScale()}</div>`);
await page.screenshot({ path: 'public/og-image.png' });

// Square icons
const square = (px, file, pad) => page.setViewport({ width: px, height: px }).then(() =>
  page.setContent(`<style>body{margin:0}</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${100 + 2 * pad} ${100 + 2 * pad}" width="${px}" height="${px}"><rect width="100%" height="100%" fill="${colors.indigo}"/><g transform="translate(${pad} ${pad})">${symbol(modes.primary)}</g></svg>`)).then(() => page.screenshot({ path: file }));
await square(180, 'public/apple-touch-icon.png', 0);
await page.setViewport({ width: 512, height: 512 });
await page.setContent(`<style>body{margin:0}</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">${symbol(modes.primary)}</svg>`);
await page.screenshot({ path: 'public/brand/logo-symbol-512.png', omitBackground: true });

// Email header logo (PNG: email clients do not render SVG). 3× of the 160 px display width, on white.
{
  const l = lockup('horizontal', 'primary');
  const h = Math.round((480 * l.height) / l.width);
  await page.setViewport({ width: 480, height: h });
  await page.setContent(`<style>body{margin:0;background:#fff}svg{display:block;width:480px;height:${h}px}</style>${l.svg}`);
  await page.screenshot({ path: 'public/brand/logo-email.png' });
}

// Product overview PDF (A4), generated from the live catalog
const host = site.domainConfirmed ? new URL(site.domain).host : '';
const contactLine = `Phone / WhatsApp ${site.phone}${site.email ? ` · ${site.email}` : ''}`;
const rows = products.map((p) => `<tr><th>${p.name}</th><td>${p.forms.map((f) => f[1]).join(', ')}</td><td>${p.varieties.join(', ')}</td></tr>`).join('');
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Archivo;color:${colors.indigo};font-size:10pt;line-height:1.5}
.pg{width:210mm;height:297mm;padding:18mm 18mm 22mm;position:relative;break-after:page}.pg:last-child{break-after:auto}
h1{font-size:28pt;line-height:1.08;margin:12mm 0 4mm;font-stretch:115%}h2{font-size:15pt;margin:9mm 0 3mm;font-stretch:110%}p{margin:0 0 3mm;color:rgb(46 50 119 / .9)}
table{width:100%;border-collapse:collapse;font-size:9.5pt}th,td{text-align:left;vertical-align:top;padding:2.6mm 3mm;border-bottom:.3mm solid rgb(46 50 119 / .16)}thead th{background:${colors.indigo};color:#fff;font-weight:600}tbody th{width:28%}
.band{position:absolute;left:0;right:0;bottom:0;height:12mm;background:${colors.indigo};color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 18mm;font-size:8.5pt}
.band b{color:${colors.turmeric};font-weight:650}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.cards div{padding:4mm;border-radius:2.5mm;background:rgb(46 50 119 / .06)}
.cards strong{display:block;margin-bottom:1mm}ol{padding-left:5mm;margin:0}li{margin-bottom:1.5mm}.note{font-size:8pt;color:rgb(46 50 119 / .78);margin-top:8mm}
.cta{margin-top:8mm;padding:6mm;border-radius:3mm;background:rgb(224 165 38 / .22);box-shadow:inset 1.5mm 0 0 ${colors.turmeric}}
</style></head><body>
<div class="pg">${logo('primary', '62mm')}<h1>Products from India, prepared to your specification</h1>
<p>A starting point for importers, food manufacturers, seasoning blenders and distributors exploring bulk supply from India. Exact specifications, availability and documents are confirmed for each inquiry.</p>
<h2>Products and forms</h2><table><thead><tr><th>Product</th><th>Forms</th><th>Varieties</th></tr></thead><tbody>${rows}</tbody></table>
<h2>A partner-led supply model</h2><p>ZAPAX GLOBAL is a sourcing and export company, not a manufacturer. We work with producing partners selected for each product, agree the specification with you in writing, and coordinate packing, documents and shipment.</p>
<h2>Every deal on written terms</h2><p>Specification, price, Incoterms, payment terms and documents are agreed in writing in the proforma invoice or contract before any order, for every shipment and every product category. Bank details are never changed by email or chat.</p>
<div class="band"><span>${site.legalName} · ${site.region}, ${site.country}</span><b>${slogan}</b></div></div>
<div class="pg">${logo('primary', '40mm')}<h2 style="margin-top:10mm">Specification at a glance</h2><table><thead><tr><th>Item</th><th>What we agree with you</th></tr></thead><tbody>
<tr><th>Form and cut</th><td>Flakes, chopped, minced, granules or powder, as listed for each product.</td></tr>
<tr><th>Mesh and particle size</th><td>Your required sieve range or cut size, confirmed against what our partners can supply.</td></tr>
<tr><th>Moisture and shelf life</th><td>Values and shelf life stated on the specification sheet for the agreed packing.</td></tr>
<tr><th>Quality documents</th><td>Microbiological, chemical, physical and other documents your destination requires.</td></tr></tbody></table>
<h2>Packaging options</h2><div class="cards"><div><strong>Bulk cartons</strong>Poly-lined corrugated cartons. Commonly requested net weights include 10, 20 and 25 kg, subject to product and agreement.</div><div><strong>Barrier bags</strong>Aluminium foil vacuum bags for products and markets that need extra moisture protection.</div><div><strong>Retail formats</strong>Stand-up pouches, where product, labelling and order size allow.</div></div>
<h2>To prepare a useful inquiry</h2><ol><li>Product and intended application</li><li>Required form, cut or mesh, and preferred packaging</li><li>Estimated quantity in metric tons or container loads</li><li>Destination port, target timing and document requirements</li></ol>
<div class="cta"><strong>Talk to ZAPAX GLOBAL about your requirement</strong><br>${contactLine}<br>${fullAddress}${host ? `<br>Request a quote online: ${host}/contact/` : ''}</div>
<p class="note">Important: product availability, origin, processing method, analytical values, shelf life, certification and packaging depend on the specific item, producing partner and order. Confirm current specifications and documents before purchase. This overview is for initial discussion and is not a batch-specific technical data sheet.</p>
<div class="band"><span>${host || contactLine}</span><b>${slogan}</b></div></div></body></html>`);
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: 'public/ZAPAX-GLOBAL-product-overview.pdf', format: 'A4', printBackground: true });
await browser.close();
console.log('Generated og-image.png, apple-touch-icon.png, brand/logo-symbol-512.png, ZAPAX-GLOBAL-product-overview.pdf');
