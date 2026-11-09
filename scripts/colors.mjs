// Palette audit: fails if any colour other than Indigo #2E3277, Turmeric #E0A526 or White #FFFFFF
// (or transparency of those three) appears in the website build, brand assets or their generators.
// Usage: node scripts/colors.mjs
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

// Brand colours, plus the documented tints pre-blended over white for email clients (brand-colors.pdf, page 2):
// indigo 78% #5C5F95, indigo 16% #DEDEE9, indigo 6% #F2F3F7, turmeric 22% #F8EBCF.
const ALLOWED_RGB = new Set(['46,50,119', '224,165,38', '255,255,255', '92,95,149', '222,222,233', '242,243,247', '248,235,207']);
const roots = ['dist', 'brand-assets', 'src', 'scripts', 'public', 'server', 'netlify', 'functions'];
const exts = new Set(['.html', '.css', '.js', '.mjs', '.svg', '.xml', '.php', '.json']);
const skipFiles = new Set(['colors.mjs', 'qa.mjs', 'slices.mjs']); // this audit and test tooling (no brand output)
const NAMED = /(?:fill|stroke|color|background(?:-color)?|stop-color|border(?:-color)?)\s*[:=]\s*["']?\s*(black|red|green|blue|gr[ae]y|yellow|orange|purple|pink|brown|silver|navy|maroon|olive|teal|lime|aqua|fuchsia)\b/gi;

const hexToRgb = (h) => {
  h = h.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h.slice(0, 3)].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',');
};

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', 'fonts'].includes(e.name)) yield* walk(p); }
    else if (exts.has(extname(e.name)) && !skipFiles.has(e.name)) yield p;
  }
}

const problems = [];
let files = 0;
for (const root of roots) {
  for await (const file of walk(root)) {
    files++;
    const text = (await readFile(file, 'utf8'))
      .replace(/data:[a-z/+-]+;base64,[A-Za-z0-9+/=]+/g, '') // embedded fonts/images
      .replace(/\b(?:id|href|class|aria-controls)="[^"]*"/g, ''); // e.g. fragment ids that look like hex
    const found = new Map();
    for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      const hex = m[0];
      if (![4, 5, 7, 9].includes(hex.length)) continue;
      const before = text.slice(Math.max(0, m.index - 12), m.index);
      if (/(?:&|url\(|href=")$/.test(before) || /[\w/]$/.test(before)) continue; // entities, anchors, paths
      if (!ALLOWED_RGB.has(hexToRgb(hex))) found.set(hex.toUpperCase(), (found.get(hex.toUpperCase()) || 0) + 1);
    }
    for (const m of text.matchAll(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/g)) {
      const key = `${m[1]},${m[2]},${m[3]}`;
      if (!ALLOWED_RGB.has(key)) found.set(`rgb(${key})`, (found.get(`rgb(${key})`) || 0) + 1);
    }
    for (const m of text.matchAll(NAMED)) found.set(m[1].toLowerCase(), (found.get(m[1].toLowerCase()) || 0) + 1);
    for (const [c, n] of found) problems.push(`${file}: ${c} (${n}×)`);
  }
}

console.log(`Palette audit: ${files} files checked. Allowed: #2E3277, #E0A526, #FFFFFF and their transparency.`);
if (problems.length) {
  console.log(`\n${problems.length} off-palette colour(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('No off-palette colours found.');

// ---------- Raster check (--raster): every pixel must be a blend of the three brand colours ----------
// Blends of indigo, turmeric and white (anti-aliasing, tints) lie on one plane in RGB space; anything off it is foreign.
if (process.argv.includes('--raster')) {
  const { default: puppeteer } = await import('puppeteer-core');
  const { executablePath } = await import('./chrome.mjs');
  const pngs = [];
  for (const root of ['brand-assets', 'public']) {
    const walkPng = async (d) => { for (const e of await readdir(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) await walkPng(p); else if (p.endsWith('.png')) pngs.push(p); } };
    await walkPng(root);
  }
  const b = await puppeteer.launch({ executablePath });
  const page = await b.newPage();
  const bad = [];
  for (const f of pngs) {
    const data = (await readFile(f)).toString('base64');
    const worst = await page.evaluate(async (src) => {
      const img = new Image(); img.src = src; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      const I = [46, 50, 119], T = [224, 165, 38], W = [255, 255, 255];
      const u = T.map((v, i) => v - I[i]), v = W.map((w, i) => w - I[i]);
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const len = Math.hypot(...n);
      let max = 0, at = '';
      for (let i = 0; i < d.length; i += 4 * 3) {
        if (d[i + 3] < 128) continue; // transparent
        const dist = Math.abs((d[i] - I[0]) * n[0] + (d[i + 1] - I[1]) * n[1] + (d[i + 2] - I[2]) * n[2]) / len;
        if (dist > max) { max = dist; at = `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`; }
      }
      return { max: Math.round(max), at };
    }, `data:image/png;base64,${data}`);
    if (worst.max > 8) bad.push(`${f}: off-palette pixel ${worst.at} (distance ${worst.max})`);
  }
  await b.close();
  console.log(`Raster audit: ${pngs.length} PNG files checked.`);
  if (bad.length) { console.log(`- ${bad.join('\n- ')}`); process.exit(1); }
  console.log('All PNG pixels are blends of the brand colours.');
}
