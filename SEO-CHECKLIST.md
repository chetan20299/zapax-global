# SEO Checklist

Every page must pass every point below. `npm run seo` checks them all (see [scripts/seo.mjs](scripts/seo.mjs)); the numbers match its output.

- **Offline:** `npm run build && npm run seo` checks the pages built into `dist/`.
- **Live:** `npm run seo -- https://zapaxenterprise.com` also runs the server checks (5.x).

The target values come from the Seobility audit of the home page. Pixel widths use Arial: 20px for titles and 14px for descriptions, the same way Google measures them.

## 1) Meta data
| # | Rule (must pass) |
|---|---|
| 1.1 | **Title:** present, ≤ 580 px, no duplicate words, unique across pages |
| 1.2 | **Meta description:** present, ≥ 70 chars, ≤ 1000 px, unique across pages |
| 1.3 | **Crawlability:** robots.txt does not block the site; no `noindex`/`nofollow`; the live page returns 200 |
| 1.4 | **Canonical:** `<link rel="canonical">` equals the page's own absolute https URL |
| 1.5 | **Language:** `<html lang="en">` |
| 1.6 | **Alternate/hreflang:** none on the page |
| 1.7 | **Other meta:** no `rel=next` / `rel=prev` |
| 1.8 | **Domain:** not a subdomain (www is allowed), name ≤ 20 chars, Latin characters only |
| 1.9 | **Page URL:** no parameters, no session ID, ≤ 3 subdirectories |
| 1.10 | **Charset:** `<meta charset="utf-8">` |
| 1.11 | **Doctype:** `<!doctype html>`, first in the file |
| 1.12 | **Favicon:** `<link rel="icon">` points to a file that exists |
| 1.13 | **Search Console:** `google<token>.html` ownership file in `dist/`; home page has the `google-site-verification` meta tag |

## 2) Page quality
| # | Rule (must pass) |
|---|---|
| 2.1 | **Content:** ≥ 250 words; at least one list; no placeholder text or images; no duplicate page content; average sentence ≤ 20 words; every word of the title and of the H1 also appears in the page content |
| 2.2 | **Frames:** no `<frameset>`/`<frame>` |
| 2.3 | **Mobile:** viewport `width=device-width, initial-scale=1`; Apple Touch icon linked and present |
| 2.4 | **Strong/bold:** `<strong>`/`<b>` count ≤ 2% of words (min allowance 5) |
| 2.5 | **Image SEO:** every `<img>` has a non-empty `alt` (Seobility counts `alt=""` as missing) |
| 2.6 | **Social media:** Open Graph title, description, image and url are set; share links (LinkedIn, Facebook, X, WhatsApp) on every page |
| 2.7 | **Additional markup:** valid schema.org JSON-LD |
| 2.8 | **HTTPS:** no `http://` resources or links |

## 3) Headings
| # | Rule (must pass) |
|---|---|
| 3.1 | **H1:** exactly one, 10–70 chars |
| 3.2 | **Headings:** at least one h2–h6 per 150 words, and at least 50 words per heading (not too many) |

## 4) Link structure
| # | Rule (must pass) |
|---|---|
| 4.1 | **Internal links:** 3–150 per page; no `?` parameters; every target exists in the build; no internal anchor text over 60 chars; each anchor text used only once per page |
| 4.2 | **External links:** all https |

## 5) Server configuration (live check only)
| # | Rule (must pass) |
|---|---|
| 5.1 | **Redirects:** `http://`, `http://www.` and `https://www.` all 301/308 to the canonical origin |
| 5.2 | **HTTP header:** `Content-Type` includes `charset=utf-8`; no `X-Powered-By`; responses compressed (br/gzip) |
| 5.3 | **Performance:** HTML response ≤ 0.40 s; HTML file ≤ 100 kB (also checked offline) |

## 6) External factors (manual)
| # | Rule |
|---|---|
| 6.1 | **Backlinks:** a script can't check these. Review them in Seobility or Search Console from time to time. |
| 6.2 | **Search Console:** add `zapaxenterprise.com` as a Domain property (DNS TXT at the registrar) and keep the URL-prefix verification (meta tag + file) in place. Submit `https://zapaxenterprise.com/sitemap.xml`, then URL Inspection → Request indexing for the home page. |
| 6.3 | **Google Business Profile:** ZAPAX ENTERPRISE LLP, Opposite Old Ice Factory, Near Lake, Baleviya Kotha Road, Limbdi 363421, Gujarat; +91 99980 50731; website https://zapaxenterprise.com/; categories Exporter / Food products supplier. |
| 6.4 | **Profiles and directories:** LinkedIn company page, IndiaMART, TradeIndia, ExportersIndia, Alibaba, YouTube, plus APEDA / FIEO / DGFT listings, all with the exact name ZAPAX ENTERPRISE (legal: ZAPAX ENTERPRISE LLP) and the website link. Add each official profile URL to `site.social` in `src/site.mjs`: it then appears in the footer and in the Organization schema `sameAs`. |
