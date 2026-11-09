// Generates the independent brand asset package: npm run brand → brand-assets/
import { mkdir, writeFile, readFile, rm, cp } from 'node:fs/promises';
import QRCode from 'qrcode';
import { lockup, colors, slogan, symbol, modes } from '../src/brand.mjs';
import { taglinePath, browser, svgToPng, svgToPdf } from './brand-lib.mjs';
import { site } from '../src/site.mjs';

const OUT = 'brand-assets';
const siteUrlSet = !!process.env.SITE_URL?.trim();
const domain = siteUrlSet ? new URL(process.env.SITE_URL.trim()).host : '';
const xml = (svg) => `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`;

await rm(OUT, { recursive: true, force: true });
for (const d of ['logo/svg', 'logo/png', 'logo/pdf', 'logo/social', 'business-card', 'brand-guidelines', 'fonts']) await mkdir(`${OUT}/${d}`, { recursive: true });

const b = await browser();
const page = await b.newPage();

// ---------- 1. Logos ----------
// [file name, kind, mode, withSlogan, png width px, pdf width mm]
const variants = [
  ['primary-logo', 'horizontal', 'primary', false, 4000, 120],
  ['white-logo', 'horizontal', 'white', false, 4000, 120],
  ['dark-logo', 'horizontal', 'dark', false, 4000, 120],
  ['horizontal-logo-slogan-primary', 'horizontal', 'primary', true, 4000, 120],
  ['horizontal-logo-slogan-white', 'horizontal', 'white', true, 4000, 120],
  ['horizontal-logo-slogan-dark', 'horizontal', 'dark', true, 4000, 120],
  ['stacked-logo-primary', 'stacked', 'primary', false, 2400, 70],
  ['stacked-logo-white', 'stacked', 'white', false, 2400, 70],
  ['stacked-logo-dark', 'stacked', 'dark', false, 2400, 70],
  ['stacked-logo-slogan-primary', 'stacked', 'primary', true, 2400, 70],
  ['stacked-logo-slogan-white', 'stacked', 'white', true, 2400, 70],
  ['stacked-logo-slogan-dark', 'stacked', 'dark', true, 2400, 70],
  ['logo-symbol', 'symbol', 'primary', false, 2048, 40],
  ['logo-symbol-white', 'symbol', 'white', false, 2048, 40],
  ['logo-symbol-dark', 'symbol', 'dark', false, 2048, 40],
  ['wordmark-primary', 'wordmark', 'primary', false, 4000, 100],
  ['wordmark-white', 'wordmark', 'white', false, 4000, 100],
  ['wordmark-dark', 'wordmark', 'dark', false, 4000, 100],
];
for (const [name, kind, mode, tag, px, mm] of variants) {
  const l = lockup(kind, mode, { taglinePath: tag ? taglinePath : undefined, title: tag ? `ZAPAX GLOBAL: ${slogan}` : 'ZAPAX GLOBAL' });
  await writeFile(`${OUT}/logo/svg/${name}.svg`, xml(l.svg));
  const h = Math.round((px * l.height) / l.width);
  await svgToPng(page, l.svg, px, h, `${OUT}/logo/png/${name}.png`);
  await svgToPdf(page, l.svg, mm, Math.round(((mm * l.height) / l.width) * 100) / 100, `${OUT}/logo/pdf/${name}.pdf`);
}

// Social profile images (padded symbol on brand colour) and a favicon-size check
const social = (bg, mode) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="${bg}"/><g transform="translate(30 30)">${symbol(modes[mode])}</g></svg>`;
await svgToPng(page, social(colors.white, 'primary'), 1080, 1080, `${OUT}/logo/social/profile-1080-light.png`);
await svgToPng(page, social(colors.indigo, 'white'), 1080, 1080, `${OUT}/logo/social/profile-1080-indigo.png`);
const banner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1584 396"><rect width="1584" height="396" fill="${colors.indigo}"/><g transform="translate(120 128) scale(0.82)">${lockup('horizontal', 'white', { taglinePath }).svg.replace(/^<svg[^>]*>|<\/svg>$/g, '').replace(/<title>.*?<\/title>/, '')}</g></svg>`;
await svgToPng(page, banner, 1584, 396, `${OUT}/logo/social/linkedin-banner-1584x396.png`);

// Editable master sheet: every lockup on one artboard
{
  const items = [['horizontal', 'primary', 0], ['horizontal', 'primary', 1], ['stacked', 'primary', 1], ['symbol', 'primary', 0], ['horizontal', 'white', 0], ['symbol', 'white', 0], ['horizontal', 'dark', 0], ['symbol', 'dark', 0]];
  let y = 80, body = '';
  for (const [kind, mode, tag] of items) {
    const l = lockup(kind, mode, { taglinePath: tag ? taglinePath : undefined });
    const s = kind === 'symbol' ? 1.6 : kind === 'stacked' ? 1 : 1;
    const inner = l.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<title>.*?<\/title>/, '');
    const bg = mode === 'white' ? `<rect x="0" y="${y - 40}" width="1600" height="${l.height * s + 80}" fill="${colors.indigo}"/>` : '';
    body += `${bg}<g id="${kind}-${mode}${tag ? '-slogan' : ''}" transform="translate(80 ${y}) scale(${s})">${inner}</g>`;
    y += l.height * s + 120;
  }
  await writeFile(`${OUT}/logo/zapax-logo-master-editable.svg`, xml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 ${y}" width="1600" height="${y}"><title>ZAPAX GLOBAL logo master</title><rect width="1600" height="${y}" fill="#FFFFFF"/>${body}</svg>`));
}

// ---------- 2. Business cards (90 × 54 mm trim, 3 mm bleed, 4 mm safe area) ----------
const W = 96, H = 60, BLEED = 3;
const fontFace = async () => {
  const f = async (file, w) => `@font-face{font-family:Archivo;font-weight:${w};src:url(data:font/ttf;base64,${(await readFile(`brand-src/fonts/${file}`)).toString('base64')})}`;
  return (await Promise.all([f('Archivo-Regular.ttf', 400), f('Archivo-Medium.ttf', 500), f('Archivo-SemiBold.ttf', 600), f('Archivo-Bold.ttf', 700)])).join('');
};
const FONTS = await fontFace();
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<title>.*?<\/title>/, '');
const wm = lockup('wordmark', 'primary');
const wmWhite = lockup('wordmark', 'white');
const tagSvg = taglinePath(slogan, 10);

let qr = '';
if (siteUrlSet) {
  const q = QRCode.create(process.env.SITE_URL.trim(), { errorCorrectionLevel: 'M' });
  const size = q.modules.size, data = q.modules.data;
  let d = '';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (data[r * size + c]) d += `M${c} ${r}h1v1h-1z`;
  qr = { size, d };
}
const qrBlock = (x, y, s, dark) => {
  const pad = 1.6;
  const frame = `<rect x="${x - pad}" y="${y - pad}" width="${s + 2 * pad}" height="${s + 2 * pad}" rx="1.4" fill="#FFFFFF"/>`;
  if (!qr) return `${frame}<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="none" stroke="${colors.indigo}" stroke-width="0.25" stroke-dasharray="0.8 0.6"/><text x="${x + s / 2}" y="${y + s / 2 - 0.6}" font-family="Archivo" font-size="2.1" font-weight="600" fill="${colors.indigo}" text-anchor="middle">[QR code]</text><text x="${x + s / 2}" y="${y + s / 2 + 2.2}" font-family="Archivo" font-size="1.6" fill="${colors.indigo}" text-anchor="middle">set SITE_URL</text>`;
  return `${frame}<g transform="translate(${x} ${y}) scale(${s / qr.size})"><path d="${qr.d}" fill="${colors.indigo}"/></g>`;
};

// Dotted route: from the symbol's origin point, arcing off the card edge
const route = (x0, y0, color) => `<path d="M${x0} ${y0} C ${x0 + 24} ${y0 - 14}, ${x0 + 52} ${y0 + 10}, ${W + 2} ${y0 - 6}" fill="none" stroke="${color}" stroke-width="0.45" stroke-linecap="round" stroke-dasharray="0.05 1.3"/>`;

function front(theme) {
  const dark = theme === 'dark';
  const bg = dark ? colors.indigo : colors.white;
  const symMode = dark ? modes.white : modes.primary;
  const s = 13, sx = 3 + 8, sy = 3 + 8; // symbol 13 mm, inside safe area
  const dotY = sy + (32.5 / 100) * s; // route leaves the tile at the origin dot's height
  const wmW = 48, wmS = wmW / wm.width;
  return `<rect width="${W}" height="${H}" fill="${bg}"/>
${route(sx + s + 0.8, dotY, colors.turmeric)}
<g transform="translate(${sx} ${sy}) scale(${s / 100})">${symbol(symMode)}</g>
<g transform="translate(${sx} 33) scale(${wmS})" fill="${dark ? '#FFFFFF' : colors.indigo}">${inner((dark ? wmWhite : wm).svg)}</g>
<g transform="translate(${sx} ${33 + wm.height * wmS + 2.4}) scale(${3.1 / 10})" fill="${dark ? colors.turmeric : colors.indigo}">${tagSvg.body}</g>`;
}

function back(theme, person) {
  const dark = theme === 'dark';
  const bg = dark ? colors.indigo : colors.white;
  const text = dark ? colors.white : colors.indigo;
  const muted = dark ? `fill="${colors.white}" fill-opacity="0.78"` : `fill="${colors.indigo}" fill-opacity="0.78"`;
  const label = colors.turmeric;
  const labelAttr = dark ? `fill="${colors.turmeric}"` : `fill="${colors.indigo}"`;
  const x = 3 + 7, lx = x, vx = x + 13;
  const first = person.name.split(' ')[0].toLowerCase();
  const rows = [
    ['Phone', `${site.phone} (WhatsApp)`],
    ['Email', person.email || `${first}@[company-domain]`],
    ['Web', domain || '[website domain]'],
    ['Address', site.addressLines[0]],
    ['', site.addressLines[1]],
    ['', site.addressLines[2]],
  ];
  const rowY = 27.2, gap = 3.55;
  return `<rect width="${W}" height="${H}" fill="${bg}"/>
<rect x="0" y="${H - BLEED - 3.2}" width="${W}" height="${BLEED + 3.2}" fill="${dark ? colors.turmeric : colors.indigo}"/>
<rect x="0" y="${H - BLEED - 3.2}" width="${W * 0.18}" height="${BLEED + 3.2}" fill="${dark ? colors.white : colors.turmeric}"/>
<text id="name" x="${x}" y="15" font-family="Archivo" font-weight="700" font-size="3.9" fill="${text}">${person.name}</text>
<text id="designation" x="${x}" y="19.4" font-family="Archivo" font-weight="500" font-size="2.45" ${muted}>${person.role} · ${site.legalName}</text>
<rect x="${x}" y="21.6" width="8" height="0.5" fill="${colors.turmeric}"/>
${rows.map(([l, v], i) => `<text x="${lx}" y="${rowY + i * gap}" font-family="Archivo" font-weight="600" font-size="2.05" ${labelAttr}>${l}</text><text id="contact-${i}" x="${vx}" y="${rowY + i * gap}" font-family="Archivo" font-weight="400" font-size="2.45" fill="${text}">${v}</text>`).join('\n')}
${qrBlock(W - 3 - 7 - 15, 11, 15, dark)}
<text x="${W - 3 - 7 - 7.5}" y="31.4" font-family="Archivo" font-weight="500" font-size="1.85" ${muted} text-anchor="middle">Scan to visit</text>
<g transform="translate(${W - 3 - 7 - 22} ${H - BLEED - 3.2 - 7.6}) scale(${22 / wm.width})" fill="${dark ? '#FFFFFF' : colors.indigo}">${inner((dark ? wmWhite : wm).svg)}</g>`;
}

const cardSvg = (body, { editable } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">${editable ? `<style>@font-face{font-family:Archivo;src:url(../fonts/Archivo-Variable.ttf)}</style>` : ''}${body}</svg>`;

// Guides overlay (not printed): trim and safe area
const guides = `<rect x="${BLEED}" y="${BLEED}" width="${W - 2 * BLEED}" height="${H - 2 * BLEED}" fill="none" stroke="#E0A526" stroke-width="0.25"/><rect x="${BLEED + 4}" y="${BLEED + 4}" width="${W - 2 * BLEED - 8}" height="${H - 2 * BLEED - 8}" fill="none" stroke="#2E3277" stroke-width="0.2" stroke-dasharray="1 0.6"/>`;

const DPI300 = 300 / 25.4;
async function renderCard(body, file, { trim = true, scale = DPI300, withGuides = false } = {}) {
  const wpx = Math.round(W * scale), hpx = Math.round(H * scale);
  await page.setViewport({ width: wpx, height: hpx, deviceScaleFactor: 1 });
  await page.setContent(`<style>${FONTS}html,body{margin:0}svg{display:block;width:${wpx}px;height:${hpx}px}</style>${cardSvg(body + (withGuides ? guides : ''))}`);
  await page.evaluate(() => document.fonts.ready);
  const b3 = Math.round(BLEED * scale);
  await page.screenshot({ path: file, clip: trim ? { x: b3, y: b3, width: wpx - 2 * b3, height: hpx - 2 * b3 } : { x: 0, y: 0, width: wpx, height: hpx } });
}

// One shared front per theme; one back per founder per theme. Print PDFs pair them (page 1 front, page 2 back).
for (const theme of ['light', 'dark']) {
  const f = front(theme);
  await renderCard(f, `${OUT}/business-card/business-card-front-${theme}.png`);
  await writeFile(`${OUT}/business-card/business-card-front-${theme}-editable.svg`, xml(cardSvg(f, { editable: true })));
  for (const person of site.people) {
    const bk = back(theme, person);
    await renderCard(bk, `${OUT}/business-card/business-card-back-${person.slug}-${theme}.png`);
    await writeFile(`${OUT}/business-card/business-card-back-${person.slug}-${theme}-editable.svg`, xml(cardSvg(bk, { editable: true })));
    await page.setContent(`<style>${FONTS}@page{size:${W}mm ${H}mm;margin:0}html,body{margin:0}svg{display:block;width:${W}mm;height:${H}mm;break-after:page}</style>${cardSvg(f)}${cardSvg(bk)}`);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: `${OUT}/business-card/business-card-print-${person.slug}-${theme}.pdf`, width: `${W}mm`, height: `${H}mm`, printBackground: true });
  }
}
// Proof with trim (magenta) and safe-area (cyan) guides
await renderCard(front('light') , `${OUT}/business-card/print-guides-front.png`, { trim: false, withGuides: true });
await renderCard(back('light', site.people[0]), `${OUT}/business-card/print-guides-back.png`, { trim: false, withGuides: true });

// Presentation image: all four sides
{
  const side = (body, x, y) => `<g transform="translate(${x} ${y})"><rect x="0.6" y="1.2" width="90" height="54" rx="1.2" fill="#2E3277" opacity=".16"/><svg x="0" y="0" width="90" height="54" viewBox="${BLEED} ${BLEED} 90 54"><clipPath id="c${x}${y}"><rect x="${BLEED}" y="${BLEED}" width="90" height="54" rx="1.2"/></clipPath><g clip-path="url(#c${x}${y})">${body}</g></svg></g>`;
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 140"><rect width="220" height="140" fill="#FFFFFF"/><rect width="220" height="140" fill="#2E3277" fill-opacity=".07"/>${side(front('light'), 14, 12)}${side(back('light', site.people[0]), 116, 12)}${side(front('dark'), 14, 76)}${side(back('dark', site.people[1]), 116, 76)}</svg>`;
  await page.setViewport({ width: 2640, height: 1680 });
  await page.setContent(`<style>${FONTS}html,body{margin:0}svg{display:block;width:2640px;height:1680px}</style>${sheet}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT}/business-card/business-card-presentation.png` });
}

// ---------- 3. Brand guidelines (A4 landscape PDFs) ----------
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const cmyk = (h) => {
  const [r, g, bl] = hexRgb(h).map((v) => v / 255), k = 1 - Math.max(r, g, bl);
  return k === 1 ? [0, 0, 0, 100] : [r, g, bl].map((v) => Math.round(((1 - v - k) / (1 - k)) * 100)).concat(Math.round(k * 100));
};
const lum = (h) => { const c = hexRgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, bb) => { const [l1, l2] = [lum(a), lum(bb)].sort((x, y) => y - x); return ((l1 + 0.05) / (l2 + 0.05)).toFixed(1); };
const palette = [
  ['ZAPAX GLOBAL Indigo', colors.indigo, 'Primary. Logo, headings, body text, buttons, dark backgrounds.'],
  ['Turmeric', colors.turmeric, 'Accent. The origin point, highlights, buttons on indigo. Never for text on white.'],
  ['White', colors.white, 'Base. Backgrounds and text on indigo.'],
];
// The only permitted softer shades: transparency of the three brand colours.
const tints = [
  ['Indigo 90%', colors.indigo, 0.9, 'Body text'], ['Indigo 78%', colors.indigo, 0.78, 'Secondary text'], ['Indigo 55%', colors.indigo, 0.55, 'Form borders'],
  ['Indigo 16%', colors.indigo, 0.16, 'Divider lines'], ['Indigo 6%', colors.indigo, 0.06, 'Light panels'], ['Turmeric 38%', colors.turmeric, 0.38, 'Illustration fills'],
  ['Turmeric 22%', colors.turmeric, 0.22, 'Icon backgrounds, notices'], ['White 88%', colors.white, 0.88, 'Text on indigo'],
];
const blend = (h, a, over = colors.white) => '#' + hexRgb(h).map((v, i) => Math.round(v * a + hexRgb(over)[i] * (1 - a)).toString(16).padStart(2, '0')).join('');
const doc = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
@page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Archivo;color:${colors.indigo};font-size:10.5pt;line-height:1.5}
.pg{width:297mm;height:210mm;padding:16mm 18mm;position:relative;break-after:page;overflow:hidden}
.pg:last-child{break-after:auto}h1{font-size:30pt;margin:0 0 4mm;color:${colors.indigo};font-weight:700;letter-spacing:-.01em}h2{font-size:15pt;margin:0 0 3mm;color:${colors.indigo}}p{margin:0 0 3mm;max-width:150mm}
.ft{position:absolute;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:space-between;font-size:8pt;color:rgb(46 50 119 / .78);border-top:.3mm solid rgb(46 50 119 / .16);padding-top:2.5mm}
.grid{display:grid;gap:6mm}.muted{color:rgb(46 50 119 / .78)}table{border-collapse:collapse;width:100%;font-size:9.5pt}td,th{text-align:left;padding:2mm 3mm;border-bottom:.3mm solid rgb(46 50 119 / .16);vertical-align:top}th{color:${colors.indigo}}
.box{border-radius:3mm;display:flex;align-items:center;justify-content:center}.small{font-size:8.5pt}
</style></head><body>${body}</body></html>`;
const footer = (t) => `<div class="ft"><span>ZAPAX GLOBAL brand guidelines · ${t}</span><span>${slogan}</span></div>`;
modes['x-turmeric'] = { knockout: colors.turmeric, word: colors.turmeric, tag: colors.turmeric };
modes['x-dot'] = { tile: colors.indigo, mark: colors.white, dot: colors.white, word: colors.indigo, tag: colors.indigo };
const L = (k, m, t) => inner(lockup(k, m, t ? { taglinePath } : {}).svg);
const svgWrap = (k, m, t, w) => { const l = lockup(k, m, t ? { taglinePath } : {}); return `<svg viewBox="0 0 ${l.width} ${l.height}" style="width:${w};height:auto;display:block">${inner(l.svg)}</svg>`; };

const colorsDoc = doc('Colours', `
<div class="pg"><h1>Brand colours</h1><p>ZAPAX GLOBAL uses exactly three colours: indigo and turmeric, two dyes with deep roots in Gujarat’s textile tradition, and white. No other colours are used in the logo, website, stationery, packaging or presentations.</p>
<div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:8mm;gap:8mm">${palette.map(([n, h, u]) => `<div><div class="box" style="height:52mm;background:${h};border:${h === colors.white ? '.3mm solid rgb(46 50 119 / .16)' : '0'}"></div><p style="margin-top:3mm"><strong style="font-size:13pt">${n}</strong><br>HEX ${h} · RGB ${hexRgb(h).join(' ')} · CMYK ${cmyk(h).join(' ')}<br><span class="small muted">${u}</span></p></div>`).join('')}</div>
<p class="small muted" style="max-width:none">CMYK values are mathematical starting points. Colour on paper depends on stock and press, so always approve a printed proof. Ask the printer to match HEX ${colors.indigo} and ${colors.turmeric} on the chosen stock (and, if a Pantone spot colour is used, choose it from a physical swatch book against these values).</p>${footer('Colours')}</div>
<div class="pg"><h1>Tints: the only softer shades</h1><p>When a lighter shade is needed, use transparency of indigo, turmeric or white over white (or over indigo for the white tint). Never introduce greys, blacks, greens, reds or any other colour.</p>
<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:6mm;margin-top:6mm">${tints.map(([n, h, a, u]) => `<div><div class="box" style="height:24mm;background:${h === colors.white ? colors.indigo : '#fff'};border:.3mm solid rgb(46 50 119 / .16)"><div style="width:100%;height:100%;border-radius:3mm;background:${h};opacity:${a}"></div></div><p style="margin-top:2mm"><strong>${n}</strong><br><span class="small muted">${u} · prints as ${blend(h, a, h === colors.white ? colors.indigo : colors.white).toUpperCase()}</span></p></div>`).join('')}</div>${footer('Colours')}</div>
<div class="pg"><h1>Usage and contrast</h1>
<div class="grid" style="grid-template-columns:1fr 1fr;gap:12mm"><div><h2>Proportion</h2><div style="display:flex;height:14mm;border-radius:2mm;overflow:hidden;margin-bottom:4mm;border:.3mm solid rgb(46 50 119 / .16)"><div style="flex:60;background:#fff"></div><div style="flex:32;background:${colors.indigo}"></div><div style="flex:8;background:${colors.turmeric}"></div></div><p>Roughly: white 60%, indigo 32%, turmeric 8%. Turmeric works because it is rare.</p></div>
<div><h2>Accessible text pairs (WCAG)</h2><table><tr><th>Text / background</th><th>Ratio</th><th>Use</th></tr>
${[[colors.indigo, colors.white, 'Headings, body text, links, buttons'], [blend(colors.indigo, 0.78), colors.white, 'Secondary text (indigo 78%)'], [colors.white, colors.indigo, 'Text on indigo'], [colors.turmeric, colors.indigo, 'Accent text on indigo'], [colors.indigo, colors.turmeric, 'Text on turmeric buttons'], [colors.turmeric, colors.white, 'Avoid for text (graphics only)']].map(([f, bgc, u]) => `<tr><td><span style="display:inline-block;padding:1mm 3mm;border-radius:1mm;background:${bgc};color:${f};border:.3mm solid rgb(46 50 119 / .16)">Aa ${f.toUpperCase()} on ${bgc.toUpperCase()}</span></td><td>${contrast(f, bgc)}:1</td><td>${u}</td></tr>`).join('')}</table><p class="small muted">4.5:1 or higher is required for body text, 3:1 for large text and graphics.</p></div></div>${footer('Colours')}</div>`);

const typeDoc = doc('Typography', `
<div class="pg"><h1>Typography</h1><p>ZAPAX GLOBAL uses one typeface family, <strong>Archivo</strong>, a grotesque with a variable width axis. Expanded widths echo the wide letterforms of the ZAPAX GLOBAL wordmark; normal width keeps body text compact and readable.</p>
<div style="font-size:54pt;font-weight:700;color:${colors.indigo};font-stretch:118%;line-height:1;margin:8mm 0 2mm">Aa Bb Cc 123</div><div style="font-size:16pt;margin-bottom:8mm">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 & ₹ $ € %</div>
<table><tr><th>Role</th><th>Weight</th><th>Width</th><th>Size (print / web)</th><th>Sample</th></tr>
<tr><td>Display headline</td><td>Bold 700–760</td><td>Expanded 112–118%</td><td>28–48 pt / 40–96 px</td><td style="font-weight:700;font-size:16pt;color:${colors.indigo}">Indian produce</td></tr>
<tr><td>Section heading</td><td>Bold 700</td><td>Semi-expanded 112%</td><td>16–24 pt / 28–42 px</td><td style="font-weight:700;font-size:13pt">Quality you can check</td></tr>
<tr><td>Subheading</td><td>SemiBold 600–680</td><td>Normal–105%</td><td>11–14 pt / 18–20 px</td><td style="font-weight:600">Specification parameters</td></tr>
<tr><td>Body</td><td>Regular 400</td><td>Normal 100%</td><td>9.5–11 pt / 16–17 px</td><td>We agree every detail in writing.</td></tr>
<tr><td>Labels, captions</td><td>Medium–SemiBold 500–600</td><td>Normal 100%</td><td>7–8.5 pt / 13–14 px</td><td style="font-weight:600;font-size:8.5pt">Mobile · Email</td></tr></table>${footer('Typography')}</div>
<div class="pg"><h1>Rules and files</h1><div class="grid" style="grid-template-columns:1fr 1fr;gap:12mm"><div><h2>Do</h2><p>Use sentence case for headings and buttons.<br>Left-align text; centre only short lockups.<br>Keep body lines under about 75 characters.<br>Use line height 1.5–1.65 for body, 1.05–1.2 for headlines.<br>Minimum print size 6 pt; minimum web size 13 px.</p><h2>Avoid</h2><p>All-caps paragraphs or long all-caps labels.<br>Synthetic italics, outlines or shadows on text.<br>Mixing additional typefaces in brand materials.<br>Setting the word “ZAPAX GLOBAL” in Archivo as a logo. Always use the logo artwork.</p></div>
<div><h2>Font files</h2><p>Archivo is licensed under the SIL Open Font License 1.1: free for commercial use, embedding and redistribution. Files are in <strong>brand-assets/fonts/</strong>: static Regular, Medium, SemiBold and Bold (best for Office, Canva and print vendors) and the variable font with width and weight axes (for Figma, Illustrator, InDesign and the web). Source: fonts.google.com/specimen/Archivo.</p><h2>Fallbacks</h2><p>If Archivo is unavailable (for example in plain email), use Arial or Helvetica. In Microsoft Office documents, embed fonts or export to PDF.</p></div></div>${footer('Typography')}</div>`);

const logoDoc = doc('Logo usage', `
<div class="pg"><h1>The ZAPAX GLOBAL logo</h1><div class="grid" style="grid-template-columns:1.25fr 1fr;gap:14mm;align-items:center"><div>${svgWrap('horizontal', 'primary', 1, '150mm')}</div><div><h2>The Route Z</h2><p>The symbol traces a Z as a trade route. It begins at the turmeric <strong>origin point</strong>, the source of every product we supply, and travels in three decisive strokes, <strong>source, prepare, deliver</strong>, to its destination. The rounded indigo tile works like a seal of quality: a contained, accountable promise.</p><p>The wordmark keeps the wide, geometric ZAPAX GLOBAL letterforms. The A is drawn without a crossbar, an open upward form that reads as ascent and growth.</p><p><strong>Slogan:</strong> ${slogan}</p></div></div>${footer('Logo usage')}</div>
<div class="pg"><h1>Logo versions</h1><div class="grid" style="grid-template-columns:repeat(3,1fr);gap:6mm">
<div class="box" style="height:42mm;border:.3mm solid rgb(46 50 119 / .16)">${svgWrap('horizontal', 'primary', 0, '62mm')}</div>
<div class="box" style="height:42mm;background:${colors.indigo}">${svgWrap('horizontal', 'white', 0, '62mm')}</div>
<div class="box" style="height:42mm;border:.3mm solid rgb(46 50 119 / .16)">${svgWrap('horizontal', 'dark', 0, '62mm')}</div>
<div class="box" style="height:56mm;border:.3mm solid rgb(46 50 119 / .16)">${svgWrap('stacked', 'primary', 1, '38mm')}</div>
<div class="box" style="height:56mm;background:${colors.indigo}">${svgWrap('stacked', 'white', 1, '38mm')}</div>
<div class="box" style="height:56mm;border:.3mm solid rgb(46 50 119 / .16);gap:8mm">${svgWrap('symbol', 'primary', 0, '22mm')}${svgWrap('symbol', 'dark', 0, '22mm')}</div></div>
<p class="small" style="max-width:none;margin-top:5mm"><strong>Primary</strong> (full colour) on white or light indigo tints. <strong>White</strong> (one colour) on indigo or dark photography. <strong>Dark</strong> (one-colour indigo) for single-colour print, stamps, invoices and embossing on light stock. Use the <strong>horizontal</strong> logo by default, <strong>stacked</strong> where space is square or tall, and the <strong>symbol</strong> alone only where ZAPAX GLOBAL is already established (app icons, social avatars, packaging seals, favicons).</p>${footer('Logo usage')}</div>
<div class="pg"><h1>Clear space and minimum size</h1><div class="grid" style="grid-template-columns:1.2fr 1fr;gap:14mm;align-items:start">
<div><div style="position:relative;display:inline-block;padding:15mm;background:repeating-linear-gradient(45deg,rgb(46 50 119 / .08) 0 2mm,#fff 2mm 4mm);border:.3mm dashed ${colors.indigo}">${svgWrap('horizontal', 'primary', 0, '110mm')}</div><p class="small" style="margin-top:3mm">Clear space on every side = <strong>half the symbol height</strong> (shown hatched). Keep text, edges and other graphics out of this area.</p></div>
<div><table><tr><th>Version</th><th>Print min.</th><th>Screen min.</th></tr><tr><td>Horizontal logo</td><td>30 mm wide</td><td>120 px wide</td></tr><tr><td>Horizontal with slogan</td><td>45 mm wide</td><td>200 px wide</td></tr><tr><td>Stacked logo</td><td>20 mm wide</td><td>80 px wide</td></tr><tr><td>Symbol</td><td>6 mm</td><td>16 px</td></tr></table><p class="small" style="margin-top:4mm">Below the slogan minimum, use the logo without the slogan.</p></div></div>${footer('Logo usage')}</div>
<div class="pg"><h1>Do not</h1><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:6mm">
${[['Stretch or squash', 'transform:scaleX(1.25)', 'primary'], ['Rotate', 'transform:rotate(-12deg)', 'primary'], ['Recolour (for example all turmeric)', '', 'x-turmeric'], ['Add shadows or effects', 'filter:drop-shadow(1.5mm 1.5mm 1mm rgba(46,50,119,.55))', 'primary'], ['Place on low-contrast backgrounds', 'background:#E0A526', 'primary'], ['Fade or reduce opacity', 'opacity:.35', 'primary'], ['Change the origin dot colour', '', 'x-dot'], ['Rearrange or resize parts', '', 'parts']].map(([t, st, m]) => `<div><div class="box" style="height:34mm;border:.3mm solid rgb(46 50 119 / .16);position:relative;overflow:hidden;${st.startsWith('background') ? st : ''}"><div style="${st.startsWith('background') ? '' : st}">${m === 'parts' ? `<div style="display:flex;align-items:flex-end;gap:2mm">${svgWrap('wordmark', 'primary', 0, '34mm')}${svgWrap('symbol', 'primary', 0, '9mm')}</div>` : svgWrap('horizontal', m, 0, m === 'primary' && st.includes('scaleX') ? '40mm' : '50mm')}</div><svg viewBox="0 0 10 10" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="none"><path d="M0 10L10 0" stroke="${st.startsWith('background') ? '#2E3277' : '#E0A526'}" stroke-width=".25"/></svg></div><p class="small" style="margin-top:2mm">${t}</p></div>`).join('')}</div>
<h2 style="margin-top:4mm">Business card print finishes (recommended options)</h2><p class="small" style="max-width:none">Card size 90 × 54 mm (Indian standard), files include 3 mm bleed and a 4 mm safe area. Suggested: 350–450 gsm matte or soft-touch laminated board; optional spot UV or debossing on the symbol (front); foil matched to Turmeric #E0A526 on the origin point only (no other foil colours). Finishes are production options. The digital PNG previews show flat colour, not the effect.</p>${footer('Logo usage')}</div>`);

for (const [name, html] of [['brand-colors', colorsDoc], ['typography-guidelines', typeDoc], ['logo-usage-guidelines', logoDoc]]) {
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: `${OUT}/brand-guidelines/${name}.pdf`, width: '297mm', height: '210mm', printBackground: true });
}

await b.close();
for (const f of ['Archivo-Regular.ttf', 'Archivo-Medium.ttf', 'Archivo-SemiBold.ttf', 'Archivo-Bold.ttf', 'Archivo-Variable.ttf', 'OFL.txt']) await cp(`brand-src/fonts/${f}`, `${OUT}/fonts/${f}`);
await cp('brand-src/README.md', `${OUT}/README.md`);
await cp('brand-src/brand-slogan.md', `${OUT}/brand-slogan.md`);
console.log(`Brand assets written to ${OUT}/${siteUrlSet ? '' : ' (SITE_URL not set: QR code and web domain on the card are placeholders)'}${site.emailDomain ? '' : ' (EMAIL_DOMAIN not set: card emails are placeholders)'}`);
