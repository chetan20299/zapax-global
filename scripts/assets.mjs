// Website brand assets in the ZAPAX ENTERPRISE identity: npm run assets
// → public/og-image.png, public/apple-touch-icon.png, public/brand/logo-symbol-512.png, public/ZAPAX-ENTERPRISE-product-overview.pdf
import { mkdir, readFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { executablePath, launchArgs } from './chrome.mjs';
import { lockup, symbol, modes, colors, slogan } from '../src/brand.mjs';
import { site, productGroups, fullAddress, sizeGuide } from '../src/site.mjs';

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
h1{font-size:60px;line-height:1.02;max-width:9ch;margin:40px 0 0}.og{position:absolute;right:0;bottom:0;width:640px;height:430px;object-fit:cover;border-top-left-radius:24px}
.tag{position:absolute;right:64px;top:62px;color:${colors.indigo};font:650 22px Archivo;font-stretch:108%}</style>
${logo('primary', '230px')}<span class="tag">${slogan}</span><h1>Indian exports, carried on trust.</h1><img class="og" src="data:image/jpeg;base64,${(await readFile('public/photos/products/onion-white-range-1200.jpg')).toString('base64')}" alt="">`);
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

// Product overview PDF (A4), generated from the live catalog.
// Content flows across pages (no fixed page boxes); Chrome repeats the footer band and table header on every page,
// and rows, cards and boxes are never split across a page break.
const host = site.domainConfirmed ? new URL(site.domain).host : '';
const pic = async (id, w = 480) => {
  const p = JSON.parse(await readFile('src/photos.json', 'utf8'))[id];
  return p ? `data:image/jpeg;base64,${(await readFile(`public/photos/${p.group}/${id}-${w}.jpg`)).toString('base64')}` : '';
};
const rows = (await Promise.all(productGroups.map(async (g) => `<tr class="grp"><th colspan="3">${g.label}</th></tr>`
  + (await Promise.all(g.items.map(async (p) => `<tr><th><img src="${await pic(p.photos[0][0])}" alt=""><span>${p.name}</span></th><td>${[...new Set(p.forms.map((f) => f[1]))].join(', ')}</td><td>${p.varieties.join(', ')}</td></tr>`))).join('')))).join('');
// Cover collage: one large photo beside two stacked (2fr + 1fr columns, all 3:2, so heights match)
const strip = (await Promise.all([['onion-white-range', 1200], ['veg-powders-range', 800], ['fruit-pieces-range', 800]].map(async ([id, w], i) => `<img class="c${i}" src="${await pic(id, w)}" alt="">`))).join('');
const packs = [
  ['pack-carton-25kg', 'Bulk cartons', 'Poly-lined corrugated cartons, commonly 10, 20 or 25 kg net.'],
  ['pack-vacuum-bulk', 'Barrier bags', 'Aluminium foil bags for powders and moisture-sensitive products.'],
  ['pack-pouch-range', 'Retail formats', 'Stand-up pouches and jars, where product and order size allow.'],
  ['pack-jumbo-bag', 'Sacks and jumbo bags', 'Kraft or PP sacks of 25 kg, and jumbo bags for bulk buyers.'],
];
const packCards = (await Promise.all(packs.map(async ([id, t, d]) => `<div class="card"><img src="${await pic(id)}" alt=""><strong>${t}</strong><p>${d}</p></div>`))).join('');
const month = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const I = colors.indigo, T = colors.turmeric;
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}
@page{size:A4;margin:14mm 0 18mm}*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;padding:0 16mm;font-family:Archivo;color:rgb(46 50 119 / .9);font-size:9.5pt;line-height:1.5}
h1,h2,strong,th{color:${I}}
h1{font-size:26pt;line-height:1.06;font-weight:760;font-stretch:118%;letter-spacing:-.01em;margin:0 0 4mm;max-width:16ch}
h2{font-size:14pt;font-weight:700;font-stretch:112%;margin:0 0 3.5mm;break-after:avoid}
p{margin:0 0 2.5mm}
section{margin-top:9mm}
.top{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:6mm;border-bottom:.3mm solid rgb(46 50 119 / .16)}
.top address{font-style:normal;text-align:right;font-size:8.5pt;line-height:1.6}
.top address b{color:${I};font-weight:650}
.kicker{display:flex;align-items:center;gap:3mm;margin:9mm 0 3mm;color:${I};font-weight:650;font-size:8.5pt;letter-spacing:.04em;text-transform:uppercase}
.kicker::before{content:'';width:8mm;height:.8mm;background:${T};border-radius:1mm}
.lead{font-size:11pt;line-height:1.5;max-width:150mm}
.strip{display:grid;grid-template-columns:2fr 1fr;gap:3mm;margin-top:7mm;align-items:center;break-inside:avoid}
.strip img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:2mm;display:block}.strip .c0{grid-row:span 2}
.page{break-before:page;margin-top:0}
table{width:100%;border-collapse:collapse;font-size:9pt}
thead{display:table-header-group}
th,td{text-align:left;vertical-align:top;padding:2mm 3mm;border-bottom:.3mm solid rgb(46 50 119 / .14)}
thead th{background:${I};color:#fff;font-weight:650;font-size:8.5pt}
tbody th{font-weight:650;width:30%}
tr{break-inside:avoid}
tbody th img{float:left;width:14mm;aspect-ratio:3/2;object-fit:cover;border-radius:1.2mm;margin:0 2.5mm 0 0}
tbody th span{display:block;padding-top:1mm}
tr.grp th{background:rgb(224 165 38 / .22);font-weight:700;font-size:8.5pt;letter-spacing:.04em;text-transform:uppercase;padding:1.8mm 3mm}
.spec tbody th{width:34%}
.two{display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.box{padding:5mm;border-radius:2.5mm;background:rgb(46 50 119 / .06);break-inside:avoid}
.box h2{font-size:11.5pt;margin-bottom:2mm}
.box p{margin:0}
.packs{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm}
.card{break-inside:avoid;border:.3mm solid rgb(46 50 119 / .16);border-radius:2.5mm;overflow:hidden}
.card img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block}
.card strong{display:block;padding:2.5mm 3mm 1mm;font-size:9pt}
.card p{padding:0 3mm 3mm;margin:0;font-size:8.5pt;line-height:1.45}
.end{display:grid;grid-template-columns:1fr 1.15fr;gap:6mm;align-items:start;break-inside:avoid}
ol{margin:0;padding:0;list-style:none;counter-reset:s}
ol li{counter-increment:s;position:relative;padding:0 0 2.6mm 8mm}
ol li::before{content:counter(s);position:absolute;left:0;top:-.2mm;width:5.2mm;height:5.2mm;border-radius:50%;background:rgb(224 165 38 / .22);color:${I};font-weight:700;font-size:8pt;display:grid;place-items:center}
.cta{padding:5mm;border-radius:2.5mm;background:${I};color:rgb(255 255 255 / .88)}
.cta strong{color:#fff;font-size:11pt;display:block;margin-bottom:2.5mm}
.cta dl{display:grid;grid-template-columns:auto 1fr;gap:1mm 4mm;margin:0 0 2.5mm;font-size:8.5pt}
.cta dt{color:${T};font-weight:650}.cta dd{margin:0;color:#fff}
.cta p{margin:0;font-size:8.5pt}
.note{margin-top:7mm;padding-top:3mm;border-top:.3mm solid rgb(46 50 119 / .16);font-size:7.5pt;color:rgb(46 50 119 / .78);break-inside:avoid}
</style></head><body>
<div class="top">${logo('primary', '56mm')}<address><b>${site.legalName}</b><br>${site.locality}, ${site.region}, ${site.country}<br>${site.phone} (phone / WhatsApp)<br>${site.email}${host ? `<br>${host}` : ''}</address></div>
<p class="kicker">Product overview · ${month}</p>
<h1>Products from India, prepared to your specification</h1>
<p class="lead">A starting point for importers, food manufacturers, seasoning blenders and distributors exploring bulk supply from India. Exact specifications, availability and documents are confirmed for each inquiry.</p>
<div class="strip">${strip}</div>
<section class="two">
  <div class="box"><h2>A partner-led supply model</h2><p>ZAPAX ENTERPRISE is a sourcing and export company, not a manufacturer. We work with producing partners selected for each product, agree the specification with you in writing, and coordinate packing, documents and shipment.</p></div>
  <div class="box"><h2>Every deal on written terms</h2><p>Specification, price, Incoterms, payment terms and documents are agreed in writing in the proforma invoice or contract before any order, for every shipment and every product category. Bank details are never changed by email or chat.</p></div>
</section>
<section class="page"><h2>Products and forms</h2><p>Every product is supplied in the forms below. Photos show the full range of each product side by side.</p><table><thead><tr><th>Product</th><th>Forms</th><th>Varieties</th></tr></thead><tbody>${rows}</tbody></table></section>
<section><h2>Reference size guide for dehydrated cuts</h2><table class="spec"><thead><tr><th>Form</th><th>Common size band (confirmed per order)</th></tr></thead><tbody>${sizeGuide.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</tbody></table></section>
<section class="page"><h2>Specification at a glance</h2><table class="spec"><thead><tr><th>Item</th><th>What we agree with you</th></tr></thead><tbody>
<tr><th>Form and cut</th><td>Whole, flakes, slices, dices, chopped, minced, granules or powder, as listed for each product. Fruits and vegetables are supplied dehydrated.</td></tr>
<tr><th>Mesh and particle size</th><td>Your required sieve range or cut size, confirmed against what our partners can supply.</td></tr>
<tr><th>Moisture and shelf life</th><td>Values and shelf life stated on the specification sheet for the agreed packing.</td></tr>
<tr><th>Quality documents</th><td>Microbiological, chemical, physical and other documents your destination requires.</td></tr></tbody></table></section>
<section><h2>Packaging options</h2><div class="packs">${packCards}</div></section>
<section class="end">
  <div><h2>To prepare a useful inquiry</h2><ol><li>Product and intended application</li><li>Required form, cut or mesh, and preferred packaging</li><li>Estimated quantity in metric tons or container loads</li><li>Destination port, target timing and document requirements</li></ol></div>
  <div class="cta"><strong>Talk to ZAPAX ENTERPRISE about your requirement</strong>
    <dl><dt>Phone / WhatsApp</dt><dd>${site.phone}</dd>${site.emails.map(([l, e]) => `<dt>${l}</dt><dd>${e}</dd>`).join('')}</dl>
    <p>${fullAddress}${host ? `<br>Request a quote online: ${host}/contact/` : ''}</p></div>
</section>
<p class="note">Important: product availability, origin, processing method, analytical values, shelf life, certification and packaging depend on the specific item, producing partner and order. Confirm current specifications and documents before purchase. This overview is for initial discussion and is not a batch-specific technical data sheet.</p>
</body></html>`);
await page.evaluate(() => document.fonts.ready);
// Footer band on every page (Chrome footer template: own styles, page numbers via .pageNumber/.totalPages)
const footerTemplate = `<style>${fontCss}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
<div style="width:100%;height:18mm;margin:0 0 -4mm;padding:0 16mm;display:flex;align-items:center;justify-content:space-between;gap:6mm;background:${I};color:#fff;font:400 7.5pt Archivo">
<span>${site.legalName} · ${site.region}, ${site.country}${host ? ` · ${host}` : ''}</span><span style="color:${T};font-weight:650">${slogan} &nbsp;<span style="color:#fff;font-weight:400">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></span></div>`;
await page.pdf({ path: 'public/ZAPAX-ENTERPRISE-product-overview.pdf', format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate, margin: { top: '14mm', bottom: '18mm', left: '0', right: '0' } });
await browser.close();
console.log('Generated og-image.png, apple-touch-icon.png, brand/logo-symbol-512.png, ZAPAX-ENTERPRISE-product-overview.pdf');
