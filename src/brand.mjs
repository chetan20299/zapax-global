// ZAPAX ENTERPRISE identity: logo geometry as clean vector paths. Single source for website and brand-assets.
// Symbol "Route Z": a Z traced as a trade route, beginning at a turmeric origin point, inside an indigo seal.

// The complete ZAPAX ENTERPRISE palette. No other colours are used anywhere in the identity.
// Softer shades are made only with transparency of these three (see brand guidelines).
export const colors = {
  indigo: '#2E3277',
  turmeric: '#E0A526',
  white: '#FFFFFF',
};

export const slogan = 'Where trust travels.';

const n = (v) => Math.round(v * 100) / 100;
const pts = (a) => a.map(([x, y]) => `${n(x)} ${n(y)}`).join(' L');
const poly = (a) => `M${pts(a)}Z`;

// Horizontal offset that gives a diagonal of perpendicular thickness t across height dy and span w.
function diagOffset(w, dy, t) {
  let o = t;
  for (let i = 0; i < 40; i++) o = (t * Math.hypot(dy, w - o)) / dy;
  return o;
}

// ---------- Wordmark: custom geometric letters, cap height 100 ----------
const H = 100, T = 21, GAP = 17;
const Z = (w = 124) => {
  const o = diagOffset(w, H - 2 * T, T);
  return { w, d: poly([[0, 0], [w, 0], [w, T], [o, H - T], [w, H - T], [w, H], [0, H], [0, H - T], [w - o, T], [0, T]]) };
};
const A = (w = 124) => {
  const top = 26, half = (w - top) / 2;
  const h = T / Math.cos(Math.atan(half / H)); // horizontal leg thickness
  const apexY = H - ((w / 2 - h) * H) / half;
  return { w, d: poly([[0, H], [half, 0], [half + top, 0], [w, H], [w - h, H], [w / 2, apexY], [h, H]]) };
};
const P = (w = 112) => {
  const r = 31, x = w - r, ri = r - T;
  return { w, d: `M0 ${H}V0H${x}A${r} ${r} 0 0 1 ${x} ${2 * r}H${T}V${H}ZM${T} ${T}V${2 * r - T}H${x}A${ri} ${ri} 0 0 0 ${x} ${T}Z`, rule: 'evenodd' };
};
const X = (w = 124) => {
  const h = diagOffset(w, H, T);
  return { w, d: `${poly([[0, 0], [h, 0], [w, H], [w - h, H]])}${poly([[w - h, 0], [w, 0], [h, H], [0, H]])}` };
};

// Descriptor "ENTERPRISE": Archivo Expanded SemiBold outlines (cap height 44), justified to the wordmark width (676).
// Outlined once so this module needs no font at runtime. Regenerate only if the wordmark width changes.
const DESCRIPTOR = 'M39.9 44L0 44L0-0.1L39.4-0.1L39.4 7.6L9.0 7.6L9.0 17.7L36.1 17.7L36.1 25.3L9.0 25.3L9.0 36.4L39.9 36.4L39.9 44ZM80.7 44L72.0 44L72.0-0.1L80.5-0.1L102.0 24.5Q102.6 25.1 103.4 26.0Q104.2 26.9 105.0 27.9Q105.8 28.9 106.3 29.6L106.3 29.6L106.8 29.6Q106.7 28.4 106.7 27.0Q106.6 25.6 106.6 24.5L106.6 24.5L106.6-0.1L115.3-0.1L115.3 44L106.9 44L85.3 19.2Q84.2 18.0 83.0 16.4Q81.7 14.8 81.0 14.0L81.0 14.0L80.6 14.0Q80.6 14.8 80.6 16.3Q80.7 17.8 80.7 19.6L80.7 19.6L80.7 44ZM173.2 44L164.2 44L164.2 7.8L147.4 7.8L147.4-0.1L190.0-0.1L190.0 7.8L173.2 7.8L173.2 44ZM262.0 44L222.1 44L222.1-0.1L261.6-0.1L261.6 7.6L231.2 7.6L231.2 17.7L258.3 17.7L258.3 25.3L231.2 25.3L231.2 36.4L262.0 36.4L262.0 44ZM303.2 44L294.1 44L294.1-0.1L323.1-0.1Q327.9-0.1 331.0 1.7Q334.1 3.5 335.6 6.6Q337.2 9.7 337.2 13.7L337.2 13.7Q337.2 17.8 335.2 21.1Q333.3 24.5 329.3 26.3L329.3 26.3L338.5 44L328.5 44L320.4 28.0L303.2 28.0L303.2 44ZM303.2 7.6L303.2 20.4L321.5 20.4Q324.6 20.4 326.3 18.6Q327.9 16.8 327.9 13.8L327.9 13.8Q327.9 11.8 327.2 10.4Q326.5 9.0 325.0 8.3Q323.6 7.6 321.5 7.6L321.5 7.6L303.2 7.6ZM379.7 44L370.6 44L370.6-0.1L397.8-0.1Q402.4-0.1 405.6 1.7Q408.7 3.5 410.4 6.7Q412.1 9.9 412.1 14.2L412.1 14.2Q412.1 18.5 410.4 21.7Q408.7 25.0 405.4 26.8Q402.1 28.6 397.4 28.6L397.4 28.6L379.7 28.6L379.7 44ZM379.7 7.6L379.7 21.0L396.0 21.0Q399.3 21.0 401.1 19.2Q403.0 17.4 403.0 14.2L403.0 14.2Q403.0 12.1 402.1 10.6Q401.3 9.2 399.8 8.4Q398.3 7.6 396.0 7.6L396.0 7.6L379.7 7.6ZM453.3 44L444.2 44L444.2-0.1L473.2-0.1Q478.0-0.1 481.1 1.7Q484.2 3.5 485.7 6.6Q487.3 9.7 487.3 13.7L487.3 13.7Q487.3 17.8 485.3 21.1Q483.4 24.5 479.4 26.3L479.4 26.3L488.6 44L478.5 44L470.5 28.0L453.3 28.0L453.3 44ZM453.3 7.6L453.3 20.4L471.6 20.4Q474.7 20.4 476.4 18.6Q478.0 16.8 478.0 13.8L478.0 13.8Q478.0 11.8 477.3 10.4Q476.6 9.0 475.1 8.3Q473.7 7.6 471.6 7.6L471.6 7.6L453.3 7.6ZM529.8 44L520.7 44L520.7-0.1L529.8-0.1L529.8 44ZM583.0 44.8L583.0 44.8Q578.7 44.8 574.9 44.1Q571.0 43.4 568.1 41.7Q565.2 40.1 563.5 37.4Q561.9 34.7 561.9 30.8L561.9 30.8Q561.9 30.5 561.9 30.2Q561.9 30.0 561.9 29.8L561.9 29.8L571.0 29.8Q570.9 30.0 570.9 30.3Q570.8 30.7 570.8 31.0L570.8 31.0Q570.8 33.1 572.3 34.5Q573.8 35.9 576.6 36.5Q579.3 37.2 583.0 37.2L583.0 37.2Q585.0 37.2 586.8 37.0Q588.5 36.8 590.0 36.4Q591.5 36.0 592.6 35.4Q593.6 34.8 594.2 33.9Q594.8 33.0 594.8 32.0L594.8 32.0Q594.8 30.2 593.5 29.1Q592.1 28.0 589.9 27.3Q587.6 26.6 584.8 26.0Q581.9 25.4 578.9 24.8Q575.9 24.2 573.1 23.2Q570.2 22.3 568.0 20.8Q565.7 19.4 564.4 17.1Q563.0 14.9 563.0 11.7L563.0 11.7Q563.0 8.6 564.4 6.3Q565.8 3.9 568.5 2.3Q571.1 0.8 574.8-0.0Q578.5-0.8 583.2-0.8L583.2-0.8Q587.6-0.8 591.3 0Q594.9 0.8 597.4 2.4Q600.0 4.0 601.3 6.4Q602.6 8.8 602.6 11.9L602.6 11.9L602.6 12.8L593.7 12.8L593.7 12.1Q593.7 10.5 592.4 9.3Q591.0 8.1 588.7 7.4Q586.4 6.7 583.4 6.7L583.4 6.7Q579.6 6.7 577.2 7.3Q574.7 7.8 573.5 8.9Q572.3 9.9 572.3 11.3L572.3 11.3Q572.3 12.8 573.6 13.8Q574.9 14.8 577.2 15.5Q579.4 16.1 582.3 16.6Q585.1 17.2 588.2 17.9Q591.2 18.5 594.0 19.5Q596.8 20.4 599.1 21.9Q601.4 23.3 602.7 25.5Q604.0 27.7 604.0 30.9L604.0 30.9Q604.0 35.9 601.3 39.0Q598.7 42.0 593.9 43.4Q589.2 44.8 583.0 44.8ZM676.0 44L636.1 44L636.1-0.1L675.6-0.1L675.6 7.6L645.1 7.6L645.1 17.7L672.2 17.7L672.2 25.3L645.1 25.3L645.1 36.4L676.0 36.4L676.0 44Z';
const DESC_GAP = 20, DESC_H = 45;

export function wordmark() {
  let x = 0;
  const parts = [Z(), A(), P(), A(), X()].map((g) => {
    const p = `<path transform="translate(${n(x)} 0)" d="${g.d}"${g.rule ? ` fill-rule="${g.rule}"` : ''}/>`;
    x += g.w + GAP;
    return p;
  });
  parts.push(`<path transform="translate(0 ${H + DESC_GAP})" d="${DESCRIPTOR}"/>`);
  return { width: x - GAP, height: H + DESC_GAP + DESC_H, body: parts.join('') };
}

// ---------- Symbol (100 × 100) ----------
const zPath = poly([[38, 25], [76, 25], [76, 40], [49, 60], [76, 60], [76, 75], [24, 75], [24, 60], [51, 40], [38, 40]]);
const dotPath = 'M19 32.5a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0-15 0Z';
const tilePath = 'M22 0H78A22 22 0 0 1 100 22V78A22 22 0 0 1 78 100H22A22 22 0 0 1 0 78V22A22 22 0 0 1 22 0Z';
export function symbol(c) {
  // One-colour modes knock the route and origin point out of the tile (single path, even-odd), ideal for foil or one-ink print.
  if (c.knockout) return `<path d="${tilePath}${zPath}${dotPath}" fill-rule="evenodd" fill="${c.knockout}"/>`;
  return `<path d="${tilePath}" fill="${c.tile}"/><path d="${zPath}" fill="${c.mark}"/><path d="${dotPath}" fill="${c.dot}"/>`;
}

// Colourways
export const modes = {
  primary: { tile: colors.indigo, mark: colors.white, dot: colors.turmeric, word: colors.indigo, tag: colors.indigo },
  dark: { knockout: colors.indigo, word: colors.indigo, tag: colors.indigo }, // one-colour indigo
  white: { knockout: colors.white, word: colors.white, tag: colors.white },
};

// ---------- Lockups ----------
// taglinePath(text, size) is injected so this module stays free of font dependencies (used in the browser build too).
export function lockup(kind, mode = 'primary', { taglinePath, title = 'ZAPAX ENTERPRISE' } = {}) {
  const c = modes[mode];
  const wm = wordmark();
  const sym = (x, y, s) => `<g transform="translate(${n(x)} ${n(y)}) scale(${n(s / 100)})">${symbol(c)}</g>`;
  const word = (x, y, s) => `<g transform="translate(${n(x)} ${n(y)}) scale(${n(s)})" fill="${c.word}">${wm.body}</g>`;
  let w, h, body;

  if (kind === 'symbol') {
    w = h = 100; body = symbol(c);
  } else if (kind === 'wordmark') {
    w = wm.width; h = wm.height; body = word(0, 0, 1);
  } else if (kind === 'horizontal') {
    // Symbol height = 1.7 × ZAPAX ENTERPRISE cap height; ZAPAX ENTERPRISE + ENTERPRISE block centred on the symbol; gap = 0.38 × symbol
    const s = 170, gap = 64, ws = 1;
    w = s + gap + wm.width * ws; h = s;
    body = sym(0, 0, s) + word(s + gap, (s - wm.height * ws) / 2, ws);
    if (taglinePath) {
      const t = taglinePath(slogan, 30);
      body += `<g transform="translate(${s + gap} ${s + 24})" fill="${c.tag}">${t.body}</g>`;
      h = s + 24 + t.height;
      w = Math.max(w, s + gap + t.width);
    }
  } else if (kind === 'stacked') {
    const s = 220, ws = 0.82, ww = wm.width * ws, gap = 56;
    w = Math.max(s, ww); h = s + gap + wm.height * ws;
    body = sym((w - s) / 2, 0, s) + word((w - ww) / 2, s + gap, ws);
    if (taglinePath) {
      const t = taglinePath(slogan, 40);
      body += `<g transform="translate(${n((w - t.width) / 2)} ${n(h + 40)})" fill="${c.tag}">${t.body}</g>`;
      h += 40 + t.height;
    }
  }
  return {
    width: n(w), height: n(h),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(w)} ${n(h)}" width="${n(w)}" height="${n(h)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`,
  };
}
