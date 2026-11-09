# ZAPAX GLOBAL website and brand identity

Production-ready static website and independent brand asset package for ZAPAX GLOBAL, an export company in Gujarat, India.

**Slogan:** *Where trust travels.*
**Colours (only these three):** Indigo `#2E3277` · Turmeric `#E0A526` · White `#FFFFFF`

Before launch read **[CONTENT-REVIEW.md](CONTENT-REVIEW.md)** (what ZAPAX GLOBAL must confirm) and **[DEPLOYMENT.md](DEPLOYMENT.md)** (domain, DNS, SSL, hosting, verification checklist).

## Quick start

```bash
npm install                 # dev tools only (esbuild, puppeteer-core, opentype.js, qrcode)
cp .env.example .env        # then fill in SITE_URL, EMAIL_DOMAIN …
npm run build               # → dist/  (build:production enforces required settings)
npm run serve               # → http://localhost:8080 (inquiry emails saved to qa-shots/emails/ in dry-run mode)
```

| Command | What it does |
|---------|--------------|
| `npm run build` / `build:production` | Build the site into `dist/` (production fails without domain + inquiry route) |
| `npm run qa` | Browser QA: all pages × 4 screen sizes, links, SEO, accessibility basics, navigation, loader, WhatsApp, back-to-top, form states, end-to-end inquiry (dry run) |
| `npm test` | Inquiry backend tests (validation, spam, emails, failures) with a mocked email API |
| `npm run colors` | Palette audit: fails on any colour other than indigo, turmeric or white (text files and PNG pixels) |
| `npm run verify -- https://domain` | Post-deployment checks against the live domain (HTTPS, redirects, SEO, headers) plus the full QA |
| `npm run assets` | Regenerate share image, icons and product overview PDF |
| `npm run brand` | Regenerate the brand asset package in `brand-assets/` |

QA, assets and brand need Google Chrome or Microsoft Edge installed (set `CHROME_PATH` if it is not found).

## Project structure

```
src/site.mjs        Company facts, env-based settings, PRODUCT CATALOG
src/pages.mjs       Page content
src/brand.mjs       Logo geometry (symbol, wordmark, lockups) and the three brand colours
src/art.mjs         Original illustrations, form glyphs, icons
src/styles.css      Design system (palette tokens at the top)
src/app.js          Navigation and inquiry form
build.mjs           Layout, SEO, schema, sitemap, robots, _redirects, _headers, .htaccess
public/             Static files (fonts, product overview PDF, icons, share image)
server/             Inquiry backend: shared handler, email templates, PHP version for cPanel
netlify/functions/  Netlify adapter for the inquiry backend
functions/api/      Cloudflare Pages adapter for the inquiry backend
scripts/            Server, QA, tests, verify, colour audit, asset and brand generators
brand-src/          Fonts and documents used to build the brand package
brand-assets/       ★ The independent brand package (logos, business cards, guidelines, fonts)
_legacy/            The previous site and original logo, kept for reference
```

## Common edits

- **Domain, email, keys:** `.env` locally, the host dashboard in production. Phone, WhatsApp, address and founders are in `src/site.mjs`.
- **Loader duration:** minimum display time in `src/app.js` (search `1300`). Shorter means faster Largest Contentful Paint.
- **Add a product category:** add one object to `products` in `src/site.mjs`. Pages, navigation, sitemap, form options, schema and the product overview PDF all update.
- **Copy:** product text in `src/site.mjs`, everything else in `src/pages.mjs`.
- **Logo or colours:** `src/brand.mjs` and the tokens in `src/styles.css`, then run `npm run assets && npm run brand && npm run colors`.
