# QA report

Date: 8 November 2026 · Build: 21 pages (20 indexable + 404)

## How testing was done

- **Automated suite** (`npm run qa`, Chrome via puppeteer-core): every page at 360, 768, 1280 and 1920 px wide (84 page loads). Re-run it after any change.
- **Lighthouse 12** (mobile emulation, throttled) on 8 representative pages.
- **Visual review** of screenshots at 360 px and 1280 px for the home, product, contact, about, quality and documentation pages, plus open navigation states.

## Checks performed

| Area | Checks | Result |
|------|--------|--------|
| Layout | Horizontal overflow at 4 widths, every page | Pass |
| Console / network | JS errors, failed requests, HTTP 4xx/5xx assets | Pass, none |
| Images | Broken images, missing `alt` | Pass |
| Links | All 30 unique internal links return 200, no empty or `#` links | Pass |
| SEO metadata | Title 15–70 chars, description 70–165 chars, canonical, valid JSON-LD | Pass |
| Headings | One H1 per page, no skipped levels | Pass |
| HTML | Duplicate IDs, unlabelled form controls | Pass |
| Mobile nav | Opens, submenu opens, Escape closes | Pass |
| Desktop nav | Dropdown opens on click, closes on outside click, Tab moves into menu, Escape returns focus | Pass |
| Form | Product preselected from `?product=`, 5 required-field errors on empty submit, focus moves to first invalid field, invalid email flagged on blur | Pass |
| Form states | Success on HTTP 200, error message on HTTP 500 (mocked endpoint), honeypot submission not sent | Pass |

## Lighthouse (mobile): Performance / Accessibility / Best Practices / SEO

| Page | Scores | LCP | CLS | TBT |
|------|--------|-----|-----|-----|
| `/` | 96 / 100 / 100 / 100 | 2.1 s | 0 | 190 ms |
| `/products/` | 99 / 100 / 100 / 100 | 1.9 s | 0 | 120 ms |
| `/products/dehydrated-onion/` | 97–98 / 100 / 100 / 100 | 1.9 s | 0 | 150–170 ms |
| `/products/fresh-fruits/` | 98 / 100 / 100 / 100 | 1.9 s | 0 | 130 ms |
| `/quality/` | 99 / 100 / 100 / 100 | 1.8 s | 0 | 110 ms |
| `/documentation/` | 99 / 100 / 100 / 100 | 1.8 s | 0 | 130 ms |
| `/faq/` | 99 / 100 / 100 / 100 | 1.9 s | 0 | 120 ms |
| `/contact/` | 99 / 100 / 100 / 100 | 1.9 s | 0.001 | 0 ms |

Measured on a local server without compression or cache headers. Production hosting with gzip/brotli and the generated cache headers should be equal or better. Scores vary by a few points between runs (one onion-page run scored 91; two repeat runs scored 97 and 98).

Page weight: CSS 19 KB, JS 3.8 KB (both minified, hashed filenames), one self-hosted font file of 90 KB, header logo 280 px WebP.

## Issues found and fixed during QA

1. Titles on 5 pages and descriptions on 12 pages were too long for search results. **Shortened.**
2. Quality, Export and Sustainability pages jumped from H1 to H3. **Section headings added.**
3. After a failed submit, focus went to the status message instead of the first invalid field. **Fixed (accessibility).**
4. The "Granules" form glyph rendered as a line (random-number seeding bug). **Fixed.**
5. One route-map arc was clipped outside the illustration. **Fixed.**
6. Homepage hero illustration sat mostly below the fold at 1280×800. **Cropped and spacing tightened.**
7. On mobile, the hero illustration needed hidden horizontal scrolling and its labels were about 9 px. **Now fits the screen with readable labels.**
8. Homepage performance was 81: TBT 600 ms from about 400 animated SVG nodes, and CLS 0.097 from the font swap. **Particles merged into single paths and metric-matched fallback fonts added. Now 96–97 with CLS 0.**
9. Header logo was a 660 px PNG with a white box behind it. **Now a 280 px transparent WebP with PNG fallback.**
10. The sticky mobile quote bar overlapped the open menu and duplicated the contact form. **Hidden in both cases.**
11. Inherited from the old site: policy links pointing to another company's website, fictional testimonials, and social "search" links. **Removed or replaced.**

## Round 2: brand identity, three-colour palette and deployment (8 November 2026)

| Check | Result |
|-------|--------|
| Palette audit, text (`npm run colors`): 61 HTML/CSS/JS/SVG/source files | Pass: only #2E3277, #E0A526, #FFFFFF and their transparency |
| Palette audit, pixels: all 31 PNGs (logos, cards, social, share image, icons) | Pass: every pixel is a blend of the three brand colours |
| Browser QA, local build and `--url` live mode | Pass: no issues |
| Lighthouse after the palette change (median of 3 on home) | Home 97 / 100 / 100 / 100, onion 98, contact 100, quality 93. Colour-contrast audit passes on all pages |
| `build:production` without domain/inquiry route | Stops with a clear error (as designed) |
| Build with a different domain | Every canonical, sitemap, robots, redirect and `.htaccess` entry switches. No old domain left in `dist/` |
| `verify` script smoke test (against example.com) | Runs end to end and correctly reports missing redirects, headers and sitemap |

**Issues found and fixed in round 2:**

1. 40+ off-palette colours (greys, ink, cream, green, red, error reds, magenta/cyan print guides). **Replaced with brand colours or their tints.**
2. Leaf/tomato colours in illustrations. **Remapped to pale turmeric and pale indigo.**
3. Current-page indicator in the menu relied on colour alone. **Now a turmeric underline plus bold weight.**
4. Form error state used red. **Now indigo text with a turmeric marker, an icon and a message (not colour alone).**
5. Coloured subpixel text fringes in rendered PNGs, which are off-palette and bad for print. **Greyscale anti-aliasing enforced.**
6. Business card route line showed through the knocked-out symbol. **Fixed.**
7. Guidelines suggested gold foil, a fourth colour. **Changed to turmeric-matched foil.**
8. Verify script passed "all pages OK" when the sitemap was empty. **Fixed.**

**Not yet possible:** testing on the actual production domain. No domain or hosting account has been provided. Run `npm run verify -- https://<domain>` after go-live. Deployment is not complete until it reports 0 failures and the manual checklist in DEPLOYMENT.md §7 is done.

## Round 3: WhatsApp, loader, trade terms, inquiry emails, founder cards (8 November 2026)

| Check | Result |
|-------|--------|
| Browser QA (22 pages × 4 viewports) + new tests | Pass. New tests: loader shows on first visit, is removed after load and does not reappear in the same session; WhatsApp link targets +91 99980 50731 with a product-specific message; back-to-top appears after scrolling and returns to top |
| End-to-end inquiry (real form → real handler, dry run) | Pass: success message names the buyer's email; team email and buyer confirmation both produced |
| Backend unit tests (`npm test`) | 14/14 pass: valid flow, reply-to, HTML escaping, subject header-injection, honeypot, too-fast, missing/invalid fields, cross-site origin, wrong method, missing config, team-email failure, confirmation failure, palette |
| Netlify and Cloudflare adapters | Bundle cleanly with esbuild. Cloudflare bundle has no Node-only APIs; bundled Netlify function runs |
| Production build, cPanel target | PHP handler and templates packaged; `.htaccess` routes `/api/inquiry` and blocks the template file |
| Palette audit | Pass: 71 text files and 34 PNGs |
| Lighthouse home (median of 3) | 89 / 100 / 100 / 100, LCP 2.4 s, CLS 0. Down from 97 because Lighthouse always sees the first-visit loader (see below) |

**Issues found and fixed in round 3:**

1. Copying `.env.example` to `.env` would have blanked the phone, WhatsApp and form endpoint (empty values did not fall back to defaults). **Fixed.**
2. The verify script could not tell whether the inquiry backend was deployed. **It now checks that `/api/inquiry` answers.**
3. The palette audit did not scan the backend and email templates. **Scope widened.**

**Known trade-offs and limits:**

- **Loader vs speed:** the loader covers the page for at least 1.3 s on the first page of each visit, which delays Largest Contentful Paint (still within Google's 2.5 s "good" limit in tests). The minimum can be shortened in `src/app.js`.
- **PHP (cPanel) handler not executed.** Downloading a PHP runtime was blocked in this environment. It mirrors the tested JS handler, but must be tested on the host with a real inquiry, or use Netlify/Cloudflare.
- **Real email delivery not yet tested.** It needs the company domain, a verified Resend domain and API key.

## Remaining limitations

- **Form delivery is not configured.** Set `FORM_ENDPOINT` (and/or `CONTACT_EMAIL`). `build:production` will not build without it.
- **Live-domain verification is pending** (see above).
- **Business card PDFs are RGB**, vector with embedded fonts and 3 mm bleed. CMYK conversion needs Ghostscript or the printer's RIP.
- **Tested in Chrome only** (desktop and emulated mobile). Code uses standard, widely supported features (CSS `:has()` is used only to hide the mobile bar while the menu is open). Before launch, manually check Safari on iPhone, Firefox and Samsung Internet.
- No real screen-reader session (NVDA/VoiceOver) was performed. Structure, labels, focus order and ARIA states were verified automatically and by Lighthouse.
- Structured data was checked for valid JSON and correct schema types. Run Google's Rich Results Test once the site is on its live domain.
- No product photography is included (see CONTENT-REVIEW.md).
- Legal pages need professional review.

## Deployment readiness

**Technically ready.** Launch after the items in CONTENT-REVIEW.md "Must confirm before going live" are completed, a test inquiry has been received successfully on the live domain, and the manual browser checks above are done.
