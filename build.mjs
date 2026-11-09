// Static site build: node build.mjs → dist/
import { mkdir, writeFile, readFile, rm, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { transform } from 'esbuild';
import { site, products, exportPages, fullAddress, telHref, waHref } from './src/site.mjs';
import { buildTemplates } from './server/email-templates.mjs';
import { pages } from './src/pages.mjs';
import { icon, patternTile } from './src/art.mjs';
import { lockup, symbol, modes } from './src/brand.mjs';

// Inline vector logos (no image request, crisp at any size)
const inlineLogo = (mode, cls) => lockup('horizontal', mode).svg.replace('<svg ', `<svg class="${cls}" focusable="false" `).replace(/ width="[^"]*" height="[^"]*"/, '');

const OUT = 'dist';
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const abs = (p) => site.domain + p;
const today = new Date().toISOString().slice(0, 10);

// ---------- Assets: minify + content hash for long-term caching ----------
async function asset(src, loader) {
  const { code } = await transform(await readFile(src, 'utf8'), { loader, minify: true, target: 'es2019' });
  const name = `${src.split('/').pop().replace(/\.\w+$/, '')}.${createHash('sha1').update(code).digest('hex').slice(0, 8)}.${loader}`;
  await writeFile(`${OUT}/assets/${name}`, code);
  return `/assets/${name}`;
}

const orgId = abs('/#organization');
const organization = {
  '@type': 'Organization',
  '@id': orgId,
  name: site.brand,
  ...(site.legalName && { legalName: site.legalName }),
  url: abs('/'),
  logo: abs('/brand/logo-symbol-512.png'),
  slogan: site.slogan,
  description: 'India-based export company for dehydrated onion, garlic, black garlic, ginger, vegetables and fruits, growing into a wide range of products from India.',
  slogan: site.slogan,
  founder: site.people.map((p) => ({ '@type': 'Person', name: p.name, jobTitle: p.role })),
  address: { '@type': 'PostalAddress', streetAddress: site.street, addressLocality: site.locality, postalCode: site.postalCode, addressRegion: site.region, addressCountry: 'IN' },
  areaServed: 'Worldwide',
  ...(site.email && { email: site.email }),
  ...(site.phone && { telephone: site.phone }),
  ...((site.email || site.phone) && {
    contactPoint: { '@type': 'ContactPoint', contactType: 'sales', availableLanguage: ['English', 'Hindi', 'Gujarati'], ...(site.email && { email: site.email }), ...(site.phone && { telephone: site.phone }) },
  }),
  ...(site.social.length && { sameAs: site.social.map((s) => s.url) }),
};

// ---------- Layout ----------
const navProducts = products.map((p) => [`/products/${p.slug}/`, p.name]);

function nav(current) {
  const is = (p) => (current === p || (p !== '/' && current.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = (id, label, items, base) => `
    <li class="has-menu">
      <button class="nav-link menu-btn" type="button" aria-expanded="false" aria-controls="${id}"${current.startsWith(base) ? ' data-current' : ''}>${label}${icon('down')}</button>
      <ul class="dropdown" id="${id}">${items.map(([href, t]) => `<li><a href="${href}"${is(href)}>${t}</a></li>`).join('')}</ul>
    </li>`;
  return `
  <header class="site-header">
    <a class="skip" href="#main">Skip to content</a>
    <nav class="nav wrap" aria-label="Main">
      <a class="brand" href="/" aria-label="ZAPAX GLOBAL home">${inlineLogo('primary', 'brand-logo')}</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-list"><span class="sr-only">Menu</span>${icon('menu')}${icon('close')}</button>
      <ul class="nav-list" id="nav-list">
        ${menu('menu-products', 'Products', [['/products/', 'All products'], ...navProducts], '/products/')}
        <li><a class="nav-link" href="/quality/"${is('/quality/')}>Quality</a></li>
        ${menu('menu-export', 'Export', exportPages, '/export/')}
        <li><a class="nav-link" href="/vision/"${is('/vision/')}>Our vision</a></li>
        <li><a class="nav-link" href="/sustainability/"${is('/sustainability/')}>Sustainability</a></li>
        <li><a class="nav-link" href="/about/"${is('/about/')}>About</a></li>
        <li class="nav-cta"><a class="btn btn-primary" href="/contact/">Request a quote</a></li>
      </ul>
    </nav>
  </header>`;
}

function footer() {
  const contactLines = [
    `<li>${icon('pin')}<span>${site.addressLines.join('<br>')}</span></li>`,
    `<li>${icon('phone')}<a href="${telHref}">${site.phone}</a></li>`,
    `<li>${icon('whatsapp')}<a href="${waHref()}" target="_blank" rel="noopener">WhatsApp ${site.phone}</a></li>`,
    site.email && `<li>${icon('mail')}<a href="mailto:${site.email}">${site.email}</a></li>`,
  ].filter(Boolean).join('');
  const col = (title, links) => `<div><h2 class="footer-h">${title}</h2><ul>${links.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></div>`;
  return `
  <footer class="site-footer">
    <div class="footer-band" aria-hidden="true"></div>
    <div class="wrap footer-grid">
      <div class="footer-about">
        ${inlineLogo('white', 'footer-logo')}
        <p class="footer-slogan">${site.slogan}</p>
        <p>Products from India, sourced through trusted producing partners and exported from Gujarat on clear, written terms.</p>
        <ul class="footer-contact">${contactLines}</ul>
        ${site.social.length ? `<ul class="footer-social">${site.social.map((s) => `<li><a href="${s.url}" rel="noopener" target="_blank">${esc(s.name)}</a></li>`).join('')}</ul>` : ''}
      </div>
      ${col('Products', navProducts)}
      ${col('Export', [...exportPages, ['/quality/', 'Quality assurance']])}
      ${col('Company', [['/about/', 'About ZAPAX GLOBAL'], ['/vision/', 'Our vision'],['/company-registrations/', 'Company registrations'], ['/sustainability/', 'Sustainability'], ['/trade-terms/', 'Trade terms and fraud prevention'], ['/faq/', 'FAQ'], ['/contact/', 'Contact and quotes'], ['/ZAPAX-GLOBAL-product-overview.pdf', 'Product overview (PDF)']])}
    </div>
    <div class="wrap footer-base">
      <p>© <span data-year>${new Date().getFullYear()}</span> ${esc(site.legalName)}. All rights reserved.</p>
      <ul><li><a href="/privacy/">Privacy policy</a></li><li><a href="/terms/">Terms of use</a></li><li><a href="/sitemap.xml">Sitemap</a></li></ul>
    </div>
  </footer>
  <div class="mobile-bar">
    <a class="btn btn-primary" href="/contact/">Request a quote</a>
  </div>`;
}

// First-visit loader: brand card with verified company facts over a skeleton of the page.
// Hidden by default (no-JS visitors never see it); the inline script shows it once per session.
const loaderFacts = [
  `Export company from ${site.region}, ${site.country}`,
  'Dehydrated onion, garlic, black garlic, ginger, vegetables and fruits',
  'Every deal on pre-agreed written terms',
  `Registered as ${site.legalName}`,
];
const loaderHtml = `
<div class="loader" id="loader" role="status" aria-label="Loading ZAPAX GLOBAL" hidden>
  <div class="sk" aria-hidden="true">
    <div class="sk-head"><div class="wrap"><span class="sk-b sk-logo"></span><span class="sk-b sk-nav"></span></div></div>
    <div class="wrap sk-body">
      <span class="sk-b sk-line w30"></span><span class="sk-b sk-h"></span><span class="sk-b sk-h w60"></span>
      <span class="sk-b sk-line w70"></span><span class="sk-b sk-line w50"></span>
      <div class="sk-row"><span class="sk-b sk-pill"></span><span class="sk-b sk-pill"></span></div>
      <div class="sk-blocks"><span class="sk-b"></span><span class="sk-b"></span><span class="sk-b"></span><span class="sk-b"></span><span class="sk-b"></span></div>
    </div>
  </div>
  <div class="loader-card">
    <div class="loader-logo">${lockup('horizontal', 'primary').svg.replace(/ width="[^"]*" height="[^"]*"/, ' aria-hidden="true" focusable="false"').replace(/ role="img" aria-label="ZAPAX GLOBAL"/, '').replace(/<title>.*?<\/title>/, '')}</div>
    <p class="loader-slogan">${site.slogan}</p>
    <ul class="loader-facts">${loaderFacts.map((f) => `<li>${f}</li>`).join('')}</ul>
    <div class="loader-progress" aria-hidden="true"><span></span></div>
  </div>
</div>`;
export const loaderScript = "(function(){var l=document.getElementById('loader');try{if(sessionStorage.getItem('zx-seen'))return;sessionStorage.setItem('zx-seen','1')}catch(e){}l.hidden=false;document.documentElement.classList.add('is-loading');setTimeout(function(){document.documentElement.classList.remove('is-loading');l.remove()},6000)})();";
export const loaderHash = `sha256-${createHash('sha256').update(loaderScript).digest('base64')}`;

const floating = (page) => `
<div class="nav-progress" aria-hidden="true"></div>
<div class="fabs">
  <button class="to-top" type="button" aria-label="Back to top" hidden>${icon('up')}</button>
  <a class="fab-wa" href="${waHref(page.waText)}" target="_blank" rel="noopener" aria-label="Chat with ZAPAX GLOBAL on WhatsApp, ${site.phone}">${icon('whatsapp')}<span class="fab-label">Chat on WhatsApp</span></a>
</div>`;

function breadcrumbHtml(trail) {
  if (!trail) return '';
  return `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${trail.map(([href, t], i) => `<li>${i === trail.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${href}">${esc(t)}</a>`}</li>`).join('')}</ol></nav>`;
}

function layout(page, assets) {
  const url = abs(page.path);
  const title = page.path === '/' ? page.title : `${page.title} | ${site.brand}`;
  const graph = [
    organization,
    page.path === '/' && { '@type': 'WebSite', '@id': abs('/#website'), url: abs('/'), name: site.brand, publisher: { '@id': orgId }, inLanguage: 'en' },
    { '@type': page.schemaType || 'WebPage', '@id': url + '#webpage', url, name: title, description: page.description, isPartOf: { '@id': abs('/#website') }, about: { '@id': orgId }, inLanguage: 'en' },
    page.trail && { '@type': 'BreadcrumbList', itemListElement: page.trail.map(([href, name], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(href) })) },
    ...(page.schema || []),
  ].filter(Boolean);
  const ga = site.gaMeasurementId
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.gaMeasurementId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaMeasurementId}');</script>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
${page.noindex ? '' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#2E3277">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${site.googleSiteVerification}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.brand}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${abs('/og-image.png')}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="ZAPAX GLOBAL: exports from India. Where trust travels.">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/archivo-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>
${ga}
</head>
<body class="${page.bodyClass || ''}">
${loaderHtml}
<script>${loaderScript}</script>
${nav(page.path)}
<main id="main" tabindex="-1">
${breadcrumbHtml(page.trail)}
${page.body}
</main>
${footer()}
${floating(page)}
<script src="${assets.js}" defer></script>
</body>
</html>`;
}

// ---------- Build ----------
// `--production` refuses to build a site that cannot receive inquiries or has no confirmed domain.
const PRODUCTION = process.argv.includes('--production');
if (PRODUCTION) {
  const errors = [];
  if (new URL(site.domain).protocol !== 'https:') errors.push('SITE_URL is not set (the final https:// domain). On Netlify the site URL is used automatically.');
  if (!site.formEndpoint && !site.email) errors.push('Set FORM_ENDPOINT and/or CONTACT_EMAIL so inquiries can be delivered.');
  if (errors.length) { console.error(`✖ Production build stopped:\n- ${errors.join('\n- ')}\nSee .env.example and DEPLOYMENT.md.`); process.exit(1); }
}
const host = new URL(site.domain).host;
const altHost = host.startsWith('www.') ? host.slice(4) : `www.${host}`;
await rm(OUT, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
await mkdir(`${OUT}/assets`, { recursive: true });
await cp('public', OUT, { recursive: true });
await writeFile(`${OUT}/assets/pattern.svg`, patternTile);
await writeFile(`${OUT}/favicon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${symbol(modes.primary)}</svg>`);
const assets = { css: await asset('src/styles.css', 'css'), js: await asset('src/app.js', 'js') };

for (const page of pages) {
  const file = page.path === '/404' ? `${OUT}/404.html` : `${OUT}${page.path}index.html`;
  await mkdir(file.replace(/[^/]+$/, ''), { recursive: true });
  await writeFile(file, layout(page, assets));
}

// Email templates for the inquiry backend (shared by Netlify, Cloudflare and PHP handlers)
await mkdir('server/generated', { recursive: true });
const emailTemplates = JSON.stringify(buildTemplates());
await writeFile('server/generated/email-templates.json', emailTemplates);
// cPanel/Apache: ship the PHP handler with the site (DEPLOY_TARGET=cpanel)
if (process.env.DEPLOY_TARGET === 'cpanel') {
  await mkdir(`${OUT}/api`, { recursive: true });
  await cp('server/php/inquiry.php', `${OUT}/api/inquiry.php`);
  await writeFile(`${OUT}/api/email-templates.json`, emailTemplates);
}

const indexable = pages.filter((p) => !p.noindex);
await writeFile(
  `${OUT}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`,
);
await writeFile(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
// Netlify / Cloudflare Pages conventions. See DEPLOYMENT.md for other hosts.
// CSP is derived from config: inline script and Google hosts only when analytics is on, form origin only when set.
const formOrigin = /^https?:\/\//.test(site.formEndpoint) ? new URL(site.formEndpoint).origin : '';
const gaHosts = site.gaMeasurementId ? ' https://www.googletagmanager.com https://*.google-analytics.com' : '';
const csp = [
  "default-src 'self'", "img-src 'self' data:", "style-src 'self'", "font-src 'self'",
  `script-src 'self' '${loaderHash}'${site.gaMeasurementId ? " 'unsafe-inline' https://www.googletagmanager.com" : ''}`,
  `connect-src 'self'${formOrigin ? ` ${formOrigin}` : ''}${gaHosts}`,
  `form-action 'self'${formOrigin ? ` ${formOrigin}` : ''} mailto:`,
  "frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'",
].join('; ');
// Netlify: canonical host + HTTPS (Cloudflare Pages ignores domain rules; see DEPLOYMENT.md), plus retired URLs.
await writeFile(
  `${OUT}/_redirects`,
  `http://${altHost}/* ${site.domain}/:splat 301!\nhttps://${altHost}/* ${site.domain}/:splat 301!\nhttp://${host}/* ${site.domain}/:splat 301!\n/about.html /about/ 301\n/products/fresh-fruits/* /products/ 301\n/products/fresh-vegetables/* /products/ 301\n/ZAPAX-product-overview.pdf /ZAPAX-GLOBAL-product-overview.pdf 301\n`,
);
// Apache / cPanel shared hosting (e.g. Hostinger, GoDaddy, Bluehost): HTTPS, canonical host, errors, caching, headers.
await writeFile(
  `${OUT}/.htaccess`,
  `# Generated by build.mjs for ${site.domain}. Do not edit by hand.
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  # 1. Force HTTPS
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^ https://${host}%{REQUEST_URI} [L,R=301]
  # 2. Force the canonical host (${host})
  RewriteCond %{HTTP_HOST} ^${altHost.replace(/\./g, '\\.')}$ [NC]
  RewriteRule ^ https://${host}%{REQUEST_URI} [L,R=301]
  # 3. Inquiry form backend (PHP handler, DEPLOY_TARGET=cpanel)
  RewriteRule ^api/inquiry$ api/inquiry.php [L]
  # 4. Retired URLs from the previous site
  RewriteRule ^about\\.html$ /about/ [L,R=301]
  RewriteRule ^products/fresh-(fruits|vegetables)/?$ /products/ [L,R=301]
  RewriteRule ^ZAPAX-product-overview\\.pdf$ /ZAPAX-GLOBAL-product-overview.pdf [L,R=301]
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "DENY"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains" env=HTTPS
  Header always set Content-Security-Policy "${csp}"
  <FilesMatch "\\.(css|js|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(html|xml|txt)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
  <FilesMatch "\\.(png|svg|pdf|webp)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript image/svg+xml application/xml text/plain
</IfModule>

<FilesMatch "^email-templates\\.json$">
  Require all denied
</FilesMatch>

AddType font/woff2 .woff2
AddType image/svg+xml .svg
`,
);
await writeFile(
  `${OUT}/_headers`,
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: ${csp}
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`,
);

const missing = [['EMAIL_DOMAIN or CONTACT_EMAIL', 'email']].filter(([, k]) => !site[k]).map(([e]) => e);
console.log(`Built ${pages.length} pages for ${site.domain} → ${OUT}/${PRODUCTION ? ' (production)' : ''}`);
if (!process.env.SITE_URL) console.warn(`⚠ SITE_URL not set: built for ${site.domain} (set your own domain when you have one)`);
if (site.formEndpoint === 'netlify') console.warn('⚠ Inquiry form uses Netlify Forms (enable form detection + email notification in the Netlify dashboard). Set RESEND_API_KEY, MAIL_FROM, MAIL_TO for buyer confirmations.');
if (missing.length) console.warn(`⚠ Not configured: ${missing.join(', ')} (see .env.example and CONTENT-REVIEW.md)`);
