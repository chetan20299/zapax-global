// Product photos → responsive sizes + blur placeholders: npm run photos
// In:  product-images/masters/*.png (product ranges) and product-images/packaging/*.png (one master per shot, 3:2, ≥2400 px wide)
// Out: public/photos/<group>/<id>-<w>.{avif,webp,jpg} and src/photos.json (manifest read by src/photo.mjs)
// Every size is the same 3:2 crop, so phone, tablet, laptop and large screens show the same view.
import { readdir, mkdir, stat, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const IN = [['products', 'product-images/masters'], ['packaging', 'product-images/packaging']], OUT = 'public/photos', MANIFEST = 'src/photos.json';
const WIDTHS = [480, 800, 1200, 1600, 2400];
const RATIO = 3 / 2;
const force = process.argv.includes('--force');
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7); // rebuild one shot id, keep the rest

// Watermark: the real ZAPAX ENTERPRISE logo (outlined SVG paths), small and clear bottom-right + large and faint in the centre,
// so a cropped corner still leaves the brand on the photo. Tune the two opacities here.
const LOGO = await readFile('brand-assets/logo/svg/primary-logo.svg', 'utf8');
const [, lw, lh] = LOGO.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
const logoInner = LOGO.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>.*?<\/title>/, '');
// Centre mark off: the masters already carry the brand (towel / packaging); a faint overlay only muddied them.
const CORNER = { width: 0.15, opacity: 0.85 }, CENTRE = { width: 0.5, opacity: 0 };
const watermark = (w, h) => {
  const place = (frac, x, y, op) => { const pw = w * frac, ph = pw * lh / lw;
    return `<g opacity="${op}"><svg x="${x(pw)}" y="${y(ph)}" width="${pw}" height="${ph}" viewBox="0 0 ${lw} ${lh}">${logoInner}</svg></g>`; };
  const m = w * 0.025;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`
    + place(CENTRE.width, (pw) => (w - pw) / 2, (ph) => (h - ph) / 2, CENTRE.opacity)
    + place(CORNER.width, (pw) => w - pw - m, (ph) => h - ph - m, CORNER.opacity) + '</svg>');
};

// Masters arrive with marks we do not want twice: a grey "ZAPAX ENTERPRISE" towel text at bottom-centre (product ranges)
// and a generator sparkle at bottom-right (all shots). Our single logo is stamped later, so both are removed here.
// Positions are fractions of the 2528×1696 masters; tune them if a new batch is framed differently.
const TEXT = { x0: 0.33, x1: 0.68, y0: 0.9, y1: 0.985 }, SPARK = { x: 0.958, y: 0.935, r: 0.028, shift: 0.07 };
async function clean(src, hasText) {
  const { data, info } = await sharp(src).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  // Sparkle: blend in the backdrop from just left of it, feathered so no edge shows.
  const sx = Math.round(W * SPARK.x), sy = Math.round(H * SPARK.y), R = Math.round(W * SPARK.r), shift = Math.round(W * SPARK.shift);
  for (let y = Math.max(0, sy - R); y < Math.min(H, sy + R); y++)
    for (let x = sx - R; x < Math.min(W, sx + R); x++) {
      const d = Math.hypot(x - sx, y - sy) / R;
      if (d >= 1) continue;
      const a = d < 0.7 ? 1 : (1 - d) / 0.3, i = (y * W + x) * 3, j = (y * W + x - shift) * 3;
      for (let c = 0; c < 3; c++) data[i + c] = data[i + c] * (1 - a) + data[j + c] * a;
    }
  if (hasText) {
    // Text: neutral-grey pixels (never the brown labels or blue bowls) that differ from the median-filtered cloth are
    // masked, grown 3 px to take the emboss halo, then rebuilt as smooth cloth (median) + the weave texture borrowed
    // from clean cloth ~36 px above or below, so no smooth "ghost" of the letters is left.
    const PAD = 80, OFF = 36;
    const x0 = Math.round(W * TEXT.x0), yA = Math.round(H * TEXT.y0) - PAD, w = Math.round(W * TEXT.x1) - x0, h = Math.round(H * TEXT.y1) - yA;
    const src = Buffer.from(data.subarray(yA * W * 3, (yA + h) * W * 3)); // untouched copy of the band rows
    const med = await sharp(data, { raw: info }).extract({ left: x0, top: yA, width: w, height: h }).median(41).raw().toBuffer();
    const sat = (r, g, b) => { const mx = Math.max(r, g, b); return mx ? (mx - Math.min(r, g, b)) / mx : 0; };
    const lum = (r, g, b) => 0.3 * r + 0.59 * g + 0.11 * b;
    const px = (y, x) => (y * W + x0 + x) * 3; // index into src (band-relative row)
    const raw0 = new Uint8Array(w * h), mask = new Uint8Array(w * h);
    for (let y = PAD; y < h; y++) for (let x = 0; x < w; x++) {
      const i = px(y, x), m = (y * w + x) * 3;
      if (sat(src[i], src[i + 1], src[i + 2]) < 0.15 && sat(med[m], med[m + 1], med[m + 2]) < 0.15
        && Math.abs(lum(src[i], src[i + 1], src[i + 2]) - lum(med[m], med[m + 1], med[m + 2])) > 8) raw0[y * w + x] = 1;
    }
    const dilate = (from, G) => { // separable box dilation: rows then columns
      const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let d = -G; d <= G; d++) if (from[y * w + Math.min(w - 1, Math.max(0, x + d))]) { tmp[y * w + x] = 1; break; }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let d = -G; d <= G; d++) if (tmp[Math.min(h - 1, Math.max(0, y + d)) * w + x]) { out[y * w + x] = 1; break; }
      return out;
    };
    mask.set(dilate(raw0, 3));
    // Keep clear of labels and bowls (and their soft shadows): never edit or borrow within 14 px of a coloured pixel.
    const colour = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = px(y, x); if (sat(src[i], src[i + 1], src[i + 2]) > 0.22) colour[y * w + x] = 1; }
    const near = dilate(colour, 14);
    const cloth = (v, x) => { const i = px(v, x), m = (v * w + x) * 3; return !near[v * w + x] && !raw0[v * w + x] && Math.abs(lum(src[i], src[i + 1], src[i + 2]) - lum(med[m], med[m + 1], med[m + 2])) < 10; };
    for (let y = PAD; y < h; y++) for (let x = 0; x < w; x++) {
      if (!mask[y * w + x] || near[y * w + x]) continue;
      const m = (y * w + x) * 3;
      const ys = [y - OFF, y + OFF, y - 2 * OFF, y + 2 * OFF].find((v) => v >= 0 && v < h && cloth(v, x));
      const o = (yA + y) * W * 3 + (x0 + x) * 3;
      for (let c = 0; c < 3; c++) {
        const tex = ys == null ? 0 : src[px(ys, x) + c] - med[(ys * w + x) * 3 + c];
        data[o + c] = Math.max(0, Math.min(255, med[m + c] + tex));
      }
    }
  }
  return { data, info: { width: W, height: H, channels: 3 } };
}

const old = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {};
const manifest = {};
let made = 0;

for (const [group, dir] of IN) {
  if (!existsSync(dir)) continue;
  for (const file of await readdir(dir)) {
    const { name, ext } = parse(file);
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); // 'pack-container (2)' → 'pack-container-2'
    if (!/^\.(jpe?g|png|webp|tiff?)$/i.test(ext)) continue;
    if (only && id !== only) { if (old[id]) manifest[id] = old[id]; continue; }
    if (manifest[id]) throw new Error(`Duplicate shot id "${id}" (${group}/${file}). Ids must be unique across groups.`);
    const src = join(dir, file);
    const mtime = (await stat(src)).mtimeMs;
    // Skip unchanged masters
    if (!force && old[id]?.mtime === mtime && existsSync(join(OUT, group, `${id}-${old[id].widths.at(-1)}.jpg`))) { manifest[id] = old[id]; continue; }

    const raw = await clean(src, group === 'products');
    const img = sharp(raw.data, { raw: raw.info });
    const { width: w0, height: h0 } = raw.info;
    const srcW = Math.min(w0, Math.round(h0 * RATIO)); // widest 3:2 crop the master allows
    if (srcW < 1600) console.warn(`! ${group}/${file}: only ${srcW}px wide after 3:2 crop. Large screens will look soft; supply ≥2400px.`);
    const top = Math.min(srcW, WIDTHS.at(-1));
    const widths = WIDTHS.filter((w) => w < top).concat(top);
    // sharp keeps one resize per pipeline, so crop + scale happen in a single call per output
    const at = (width, kernel = 'lanczos3') => img.clone().resize({ width, height: Math.round(width / RATIO), fit: 'cover', position: 'centre', kernel });

    await mkdir(join(OUT, group), { recursive: true });
    for (const w of widths) {
      const r = sharp(await at(w).sharpen({ sigma: 0.5 }).composite([{ input: watermark(w, Math.round(w / RATIO)) }]).png().toBuffer())
        .withMetadata({ icc: 'srgb' });
      const p = join(OUT, group, `${id}-${w}`);
      await Promise.all([
        r.clone().avif({ quality: 55, effort: 6 }).toFile(`${p}.avif`),
        r.clone().webp({ quality: 80, effort: 6 }).toFile(`${p}.webp`),
        r.clone().jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(`${p}.jpg`),
      ]);
    }
    // Placeholder: 24 px pre-blurred WebP inlined as a data URI (~300 bytes), shown until the real photo arrives.
    const lqip = await at(24).blur(1.2).webp({ quality: 50 }).toBuffer();
    manifest[id] = { group, widths, w: widths.at(-1), h: Math.round(widths.at(-1) / RATIO), mtime,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
    made++;
    console.log(`✓ ${group}/${id}  ${widths.join(', ')}`);
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
console.log(`${made} processed, ${Object.keys(manifest).length} in ${MANIFEST}`);
