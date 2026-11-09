// Original SVG artwork for ZAPAX GLOBAL. Colours come from CSS classes, brand palette only: .s indigo line, .ft turmeric, .fl pale turmeric, .fc pale indigo, .fw white, .fm mist, .fi indigo, .sw white line.

// Deterministic pseudo-random numbers so builds are stable.
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r1 = (n) => Math.round(n * 10) / 10;

const svg = (vb, body, { cls = '', label = '' } = {}) =>
  `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"'}>${body}</svg>`;

// ---------- Product illustrations (viewBox 0 0 160 160) ----------
const onionBody = `
  <path class="ft o" d="M80 30c-2 12-8 20-20 27-22 13-30 37-20 58 9 19 31 27 40 27s31-8 40-27c10-21 2-45-20-58-12-7-18-15-20-27z"/>
  <path class="s" d="M80 30c-2 12-8 20-20 27-22 13-30 37-20 58 9 19 31 27 40 27s31-8 40-27c10-21 2-45-20-58-12-7-18-15-20-27z"/>
  <path class="s" d="M80 34c-6 22-24 34-26 62-1 18 10 34 26 46M80 34c6 22 24 34 26 62 1 18-10 34-26 46M80 36v104"/>
  <path class="s" d="M80 30c-1-8 1-14 5-20M80 30c-3-6-8-9-14-10"/>
  <path class="s" d="M70 141l-4 8M80 142v9M90 141l4 8"/>`;

const art = {
  onion: onionBody,
  garlic: `
    <path class="fw" d="M80 34c-4 14-14 20-28 30-18 13-20 40-6 58 10 13 24 18 34 18s24-5 34-18c14-18 12-45-6-58-14-10-24-16-28-30z"/>
    <path class="s" d="M80 34c-4 14-14 20-28 30-18 13-20 40-6 58 10 13 24 18 34 18s24-5 34-18c14-18 12-45-6-58-14-10-24-16-28-30z"/>
    <path class="s" d="M80 38c-10 16-22 30-22 56 0 18 8 34 22 46M80 38c10 16 22 30 22 56 0 18-8 34-22 46M80 40c-4 30-4 70 0 100M62 66c-14 12-20 32-14 52M98 66c14 12 20 32 14 52"/>
    <path class="s" d="M80 34c0-10 2-16 6-22M76 14l8-2"/>
    <path class="ft o" d="M66 140c4 4 10 6 14 6s10-2 14-6"/>
    <path class="s" d="M70 144l-3 7M80 146v7M90 144l3 7"/>`,
  ginger: `
    <path class="ft o" d="M28 98c-6-10 0-22 12-22 4-12 18-16 26-8 6-12 22-14 30-4 10-6 24-2 26 10 12 2 18 14 12 24 8 8 4 22-8 24-4 10-16 12-24 6-8 8-22 8-28-2-10 6-24 2-26-8-12 0-20-10-20-20z"/>
    <path class="s" d="M28 98c-6-10 0-22 12-22 4-12 18-16 26-8 6-12 22-14 30-4 10-6 24-2 26 10 12 2 18 14 12 24 8 8 4 22-8 24-4 10-16 12-24 6-8 8-22 8-28-2-10 6-24 2-26-8-12 0-20-10-20-20z"/>
    <path class="s" d="M54 92c6 2 10 0 14-4M84 84c4 4 10 4 14 0M70 112c6 2 12 0 16-4M104 108c4 2 8 2 12-2M44 104c3 2 6 2 8 0"/>
    <path class="fl o" d="M96 64c-2-18 4-30 16-38-2 16-6 28-16 38z"/>
    <path class="s" d="M96 64c-2-18 4-30 16-38-2 16-6 28-16 38zM66 68c-4-12-2-22 6-30"/>`,
  vegetables: `
    <path class="ft o" d="M42 44l26 92c2 6 8 6 10 0l14-80c2-10-6-16-16-14z"/>
    <path class="s" d="M42 44l26 92c2 6 8 6 10 0l14-80c2-10-6-16-16-14zM56 70l10-2M62 92l10-2M68 114l8-2"/>
    <path class="fl o" d="M58 42c-6-12-6-22 0-30 4 8 4 18 0 30zM66 42c2-14 10-22 20-24-2 10-8 18-20 24z"/>
    <path class="s" d="M58 42c-6-12-6-22 0-30 4 8 4 18 0 30zM66 42c2-14 10-22 20-24-2 10-8 18-20 24z"/>
    <circle class="fc o" cx="114" cy="104" r="26"/><circle class="s" cx="114" cy="104" r="26"/>
    <path class="fl" d="M104 80l10 6 10-6-4 8 8 2-14 2-14-2 8-2z"/><path class="s" d="M104 80l10 6 10-6-4 8 8 2-14 2-14-2 8-2zM114 86v-10"/>
    <path class="fl o" d="M100 40c18 2 30 14 32 34-10-12-20-18-32-20z"/><path class="s" d="M100 40c18 2 30 14 32 34-10-12-20-18-32-20zM100 40c-4-4-6-8-6-14"/>`,
  driedfruit: `
    <path class="ft o" d="M30 96c0-30 22-56 52-58 24-2 40 14 40 34 0 30-26 56-58 58-20 2-34-14-34-34z"/>
    <path class="s" d="M30 96c0-30 22-56 52-58 24-2 40 14 40 34 0 30-26 56-58 58-20 2-34-14-34-34z"/>
    <path class="s" d="M44 70h60M38 88h78M38 106h72M46 124h52M60 50v86M80 40v96M100 46v80"/>
    <circle class="fw" cx="120" cy="124" r="16"/><circle class="s" cx="120" cy="124" r="16"/><circle class="s" cx="120" cy="124" r="6"/>
    <circle class="fw" cx="132" cy="56" r="12"/><circle class="s" cx="132" cy="56" r="12"/><path class="s" d="M132 46v20M122 56h20"/>`,
  blackgarlic: `
    <path class="fi" d="M80 34c-4 14-14 20-28 30-18 13-20 40-6 58 10 13 24 18 34 18s24-5 34-18c14-18 12-45-6-58-14-10-24-16-28-30z"/>
    <path class="s" d="M80 34c-4 14-14 20-28 30-18 13-20 40-6 58 10 13 24 18 34 18s24-5 34-18c14-18 12-45-6-58-14-10-24-16-28-30z"/>
    <path class="sw" d="M80 40c-10 16-20 30-20 54 0 17 7 32 20 44M80 40c10 16 20 30 20 54 0 17-7 32-20 44M80 42c-3 30-3 66 0 96M62 68c-12 12-17 30-12 48M98 68c12 12 17 30 12 48"/>
    <path class="s" d="M80 34c0-10 2-16 6-22M76 14l8-2"/>
    <path class="fi" d="M120 116c-6-8-6-18 2-24 4 8 10 12 10 20 0 6-6 9-12 4z"/>
    <path class="s" d="M120 116c-6-8-6-18 2-24 4 8 10 12 10 20 0 6-6 9-12 4z"/>
    <circle class="ft" cx="126" cy="72" r="5"/>`,
};

export const productArt = (key, label = '') => svg('0 0 160 160', art[key], { cls: 'art', label });

// ---------- Form glyphs (viewBox 0 0 48 48): a visual vocabulary for cuts ----------
const glyphs = {
  flakes: `<path class="ft s" d="M8 20l10-6 8 4-4 10-10 2zM26 30l10-4 6 6-6 6-10-2zM28 10l8 2 2 8-8 2-4-6z"/>`,
  chopped: `<g class="ft s"><rect x="8" y="10" width="9" height="9" rx="1.5"/><rect x="22" y="8" width="8" height="8" rx="1.5" transform="rotate(12 26 12)"/><rect x="31" y="20" width="9" height="8" rx="1.5"/><rect x="12" y="26" width="8" height="9" rx="1.5" transform="rotate(-10 16 30)"/><rect x="24" y="31" width="8" height="8" rx="1.5"/></g>`,
  minced: `<g class="ft s">${[[10,12],[20,9],[31,12],[14,22],[25,20],[35,24],[10,32],[21,31],[30,34],[38,36]].map(([x,y])=>`<rect x="${x}" y="${y}" width="5" height="5" rx="1"/>`).join('')}</g>`,
  granules: (() => { const g = rng(7); return `<g class="ft">${Array.from({ length: 34 }, () => `<circle cx="${r1(8 + g() * 32)}" cy="${r1(10 + g() * 30)}" r="1.9"/>`).join('')}</g>`; })(),
  powder: `<path class="ft o" d="M6 40c6-14 12-20 18-20s12 6 18 20z"/><path class="s" d="M6 40c6-14 12-20 18-20s12 6 18 20zM4 40h40"/>${(() => { const g = rng(41); return `<g class="ft">${Array.from({ length: 14 }, () => `<circle cx="${r1(10 + g() * 28)}" cy="${r1(12 + g() * 8)}" r="0.9"/>`).join('')}</g>`; })()}`,
  clove: `<path class="fw s" d="M24 8c-8 8-12 18-10 26 2 6 6 8 10 8s8-2 10-8c2-8-2-18-10-26z"/><path class="s" d="M24 12c-3 8-3 20 0 30"/>`,
  slices: `<g class="s"><ellipse class="ft" cx="16" cy="24" rx="8" ry="12"/><ellipse class="ft" cx="32" cy="24" rx="8" ry="12"/><path d="M16 16v16M32 16v16"/></g>`,
  crushed: `<path class="ft s" d="M8 30l6-8 6 4-2 8zM22 18l8-4 4 6-6 6zM30 32l8-2 2 6-8 4zM12 12l6 0 2 5-6 2z"/>`,
  cubes: `<g class="s"><path class="ft" d="M8 18l8-4 8 4v9l-8 4-8-4z"/><path d="M8 18l8 4 8-4M16 22v9"/><path class="fc" d="M24 28l8-4 8 4v9l-8 4-8-4z"/><path d="M24 28l8 4 8-4M32 32v9"/></g>`,
  chunks: `<path class="ft s" d="M8 22l10-10 10 4 2 12-10 8-10-4zM28 30l8-6 6 4-2 10-8 2z"/>`,
  whole: `<circle class="ft s" cx="20" cy="26" r="12"/><circle class="fl s" cx="34" cy="20" r="8"/><path class="s" d="M20 14c0-4 2-6 4-8"/>`,
};
export const glyph = (key) => svg('0 0 48 48', glyphs[key] || glyphs.whole, { cls: 'glyph' });

// ---------- Hero: the form scale, from whole bulb to powder ----------
export function formScale() {
  const g = rng(2026);
  // Each particle group is one <path> to keep the DOM small and rendering cheap.
  const flakes = Array.from({ length: 15 }, () => {
    const x = 470 + g() * 150, y = 150 + g() * 110, s = 10 + g() * 9, a = g() * Math.PI * 2;
    const p = (dx, dy) => [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)].map(r1).join(' ');
    return `M${p(0, 0)}Q${p(s * 0.6, -s * 0.7)} ${p(s * 1.4, -s * 0.1)}Q${p(s * 1.2, s * 0.7)} ${p(0, 0)}Z`;
  }).join('');
  const granules = Array.from({ length: 60 }, () => {
    const x = 690 + g() * 150, y = 170 + g() * 95, a = g() * Math.PI / 2, h = 3;
    const pt = (dx, dy) => [x + dx * Math.cos(a) - dy * Math.sin(a), y + dx * Math.sin(a) + dy * Math.cos(a)].map(r1).join(' ');
    return `M${pt(-h, -h)}L${pt(h, -h)} ${pt(h, h)} ${pt(-h, h)}Z`;
  }).join('');
  const powder = Array.from({ length: 220 }, () => {
    const t = g(), x = 905 + t * 170, hh = Math.sin(t * Math.PI) * 85, y = 268 - g() * hh;
    return `M${r1(x - 1.4)} ${r1(y)}a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0-2.8 0`;
  }).join('');
  const label = (x, t) => `<text x="${x}" y="338" text-anchor="middle">${t}</text>`;
  const ticks = Array.from({ length: 57 }, (_, i) => `<path d="M${40 + i * 20} 290v${i % 5 ? 6 : 12}"/>`).join('');
  return svg(
    '0 40 1160 320',
    `
    <g class="fs-stage fs-1" transform="translate(40 70) scale(1.35)">${onionBody}</g>
    <g class="fs-stage fs-2 s">
      ${[0, 1, 2].map((i) => `<g transform="translate(${310 + i * 44} ${190 + (i % 2) * 18}) rotate(${-14 + i * 12})"><ellipse class="ft o" rx="34" ry="46"/><ellipse rx="34" ry="46"/><ellipse rx="24" ry="33"/><ellipse rx="13" ry="19"/></g>`).join('')}
    </g>
    <path class="fs-stage fs-3 ft s" d="${flakes}"/>
    <path class="fs-stage fs-4 ft s thin" d="${granules}"/>
    <path class="fs-stage fs-5 ft" d="${powder}"/>
    <g class="s ruler"><path d="M40 290h1120"/>${ticks}</g>
    <g class="fs-labels">${label(150, 'Whole')}${label(355, 'Sliced')}${label(545, 'Flakes')}${label(765, 'Granules')}${label(990, 'Powder')}</g>
    `,
    { cls: 'form-scale', label: 'An onion shown at five stages: whole, sliced, flakes, granules and powder' },
  );
}

// ---------- Route doodle: Gujarat outward ----------
export function routeArt() {
  const arcs = [
    [470, 120], [520, 230], [430, 330], [300, 70], [180, 160], [140, 300],
  ].map(([x, y]) => `<path class="route" d="M330 250Q${(330 + x) / 2} ${Math.max(20, Math.min(250, y) - 70)} ${x} ${y}"/><circle class="ft" cx="${x}" cy="${y}" r="6"/>`).join('');
  return svg(
    '0 0 600 400',
    `<g class="s faint"><circle cx="330" cy="220" r="170"/><ellipse cx="330" cy="220" rx="70" ry="170"/><ellipse cx="330" cy="220" rx="130" ry="170"/><path d="M160 220h340M178 140h304M178 300h304"/></g>
     ${arcs}
     <circle class="ft" cx="330" cy="250" r="11"/><circle class="s" cx="330" cy="250" r="18"/>`,
    { cls: 'route-art' },
  );
}

// ---------- Ajrakh-inspired lattice tile (original geometry) ----------
export const patternTile = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><g fill="none" stroke="#E0A526" stroke-opacity=".35" stroke-width="1.2"><path d="M28 6l6 16 16 6-16 6-6 16-6-16-16-6 16-6z"/><circle cx="28" cy="28" r="4"/><path d="M0 0l8 8M56 0l-8 8M0 56l8-8M56 56l-8-8"/></g></svg>`;

// ---------- Line icons (24px) ----------
const icons = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  sprout: '<path d="M12 21v-9M12 12c0-4-3-7-8-7 0 4 3 7 8 7zM12 14c0-4 3-7 8-7 0 4-3 7-8 7z"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9"/>',
  doc: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
  ship: '<path d="M3 15l2 5h14l2-5zM6 15V9h12v6M9 9V5h6v4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  leaf: '<path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15zM5 19l7-7"/>',
  thermo: '<path d="M10 4a2 2 0 014 0v10a4 4 0 11-4 0z"/>',
  scale: '<path d="M12 4v16M5 20h14M5 8h14M5 8l-3 6h6zM19 8l-3 6h6z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  mail: '<path d="M3 6h18v12H3zM3 6l9 7 9-7"/>',
  phone: '<path d="M6 3h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 014 5a2 2 0 012-2z"/>',
  pin: '<path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/>',
  file: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M12 11v6M9 14l3 3 3-3"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
};
export const icon = (k) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[k]}</g></svg>`;
