// Product photo "shot" built from `npm run photos` output.
// Load sequence: blurred 24 px preview + our own line doodle of the product (instant, inline) → real photo lazy-loads
// and is revealed by app.js. Without JS the photo simply paints over the placeholder.
// Interactive shots (default) get a magnifier lens on hover and open in the full-screen viewer (app.js).
import { readFileSync, existsSync } from 'node:fs';
import { icon } from './art.mjs';

const manifest = existsSync('src/photos.json') ? JSON.parse(readFileSync('src/photos.json', 'utf8')) : {};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`);
export const hasPhoto = (id) => !!manifest[id];

/**
 * @param {string} id     shot id, e.g. 'onion-white-range'
 * @param {string} alt    describes the photo
 * @param {object} [o]
 * @param {string} [o.sizes]        rendered width hint
 * @param {boolean} [o.eager]       true for the first visible (LCP) image on a page
 * @param {string} [o.doodle]       inline SVG shown while the photo loads
 * @param {string} [o.caption]      visible caption (also shown in the viewer)
 * @param {boolean} [o.interactive] false inside links/cards: no lens, no viewer button
 */
export function photo(id, alt, { sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw', eager = false, doodle = '', caption = '', interactive = true } = {}) {
  const p = manifest[id];
  if (!p) return doodle ? `<div class="shot-fallback">${doodle}</div>` : '';
  const url = (w, ext) => `/photos/${p.group}/${id}-${w}.${ext}`;
  const set = (ext) => p.widths.map((w) => `${url(w, ext)} ${w}w`).join(', ');
  const load = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  const data = interactive ? ` data-full="${url(p.w, 'webp')}" data-srcset="${set('webp')}" data-thumb="${url(p.widths[0], 'webp')}" data-caption="${esc(caption || alt)}"` : '';
  return `<figure class="shot${interactive ? ' is-interactive' : ''}"${data}>`
    + `<div class="shot-frame">`
    + `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">`
    + `<img class="shot-img" src="${url(p.widths.find((w) => w >= 800) ?? p.w, 'jpg')}" srcset="${set('jpg')}" sizes="${sizes}" width="${p.w}" height="${p.h}" alt="${esc(alt)}" ${load} decoding="async"></picture>`
    // Placeholder cover: under the photo by default (no JS), lifted above it by app.js and wiped away once loaded.
    // The photo itself is never clipped or hidden: browsers skip lazy-loading fully clipped images.
    + `<span class="shot-cover" aria-hidden="true"><img class="shot-lqip" src="${p.lqip}" alt="">`
    + (doodle ? `<span class="shot-doodle">${doodle}</span>` : '') + `</span>`
    + (interactive ? `<button class="shot-open" type="button" aria-label="Open larger view: ${esc(alt)}"><span class="shot-hint">${icon('zoom')}<span>View &amp; zoom</span></span></button>` : '')
    + `</div>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
}
