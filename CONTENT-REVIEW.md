# Content review: items ZAPAX GLOBAL must confirm before launch

The website publishes only facts taken from the existing site and product overview PDF, plus general trade information. Everything below needs a decision or confirmation from ZAPAX GLOBAL. Each item names the file to edit.

## Confirmed by ZAPAX GLOBAL (8 November 2026)

- Founders: **Chetan Punani** and **Keval Chauhan**, Co-Founders
- Phone / WhatsApp: **+91 99980 50731** (site, floating WhatsApp button, schema, PDF, emails, business cards)
- Address: **Opposite Old Ice Factory, Near Lake, Baleviya Kotha Road, Limbdi 363421, Gujarat, India**
- Every deal on pre-agreed written terms to prevent fraud (new page `/trade-terms/`)
- Request-a-quote inquiries go to the company email with an automatic confirmation to the buyer

## Must do before going live

| # | Item | Where | Current state |
|---|------|-------|---------------|
| 1 | **Register a domain** | Registrar | **Blocking.** `zapax.com` is a parked domain for sale by a third party. Not used anywhere. |
| 2 | **Create mailboxes** info@, chetan@, keval@ on that domain | Google Workspace / Zoho | Site and cards show them automatically once `EMAIL_DOMAIN` is set; placeholders until then. |
| 3 | **Email delivery** (Resend domain verification + API key) | Host env: `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO` | Backend built and tested; needs the account and keys. |
| 4 | **Registered legal company name** | `LEGAL_NAME` | Empty, so the brand "ZAPAX GLOBAL" is used. It should also appear on proforma invoices with the company bank account (trade terms page). |
| 5 | **Official social profiles** | `src/site.mjs` → `social` | None. |
| 6 | **Regenerate assets** after 1–2 | `npm run assets && npm run brand` | PDF, cards (emails, website, QR) update automatically. |

## Brand decisions to approve

| Item | Status |
|------|--------|
| **New logo (Route Z symbol + redrawn wordmark)** | Replaces the supplied ZAPAX GLOBAL wordmark on the website, icons and PDF. The wordmark keeps the original's wide letterforms and crossbar-less A. The original logo files are kept in `_legacy/`. If you prefer the original logo, say so and the site can switch back. |
| **Slogan "Where trust travels."** | Recommended from 12 concepts (`brand-assets/brand-slogan.md`). Web searches found no conflicting use, but **this is not trademark clearance.** Search IP India (Classes 29, 30, 31, 35) and WIPO, ideally via a trademark attorney, before large print runs. |
| **Three-colour palette** | Indigo #2E3277, Turmeric #E0A526, White. Enforced by `npm run colors` across website, logos, cards and PDFs. |
| **Business card details** | Ready for both founders with phone/WhatsApp and address. Only email and website remain placeholders until the domain exists. |
| **Business card print colour** | PDFs are vector RGB with embedded fonts. Ask the printer for CMYK conversion and a proof, or ask us to produce CMYK PDFs (needs Ghostscript installed). |

## Claims to check (written carefully, but confirm they reflect how ZAPAX GLOBAL actually works)

| Claim | Page(s) |
|-------|---------|
| Samples "can be arranged where the product and partner allow" | Home (process), FAQ |
| Buyer verification before a first order (registration, import licence, official email) | Trade terms |
| Payment options named as examples (advance, LC, D/P); actual terms per contract | Trade terms, FAQ |
| Bank account in the company's name; bank details never changed by email or chat | Trade terms, confirmation email, contact page |
| Founders "personally involved in every buyer relationship" | About |
| Independent inspection / lab testing "can be arranged at your request, usually at your cost" | Home, Quality |
| Producing partners are reviewed (processes, hygiene, documentation) before supplying | Home, Quality |
| Partner certificates and test reports are shared for buyer review | Home, Quality, FAQ |
| Offers quoted on Incoterms such as FOB, CFR, CIF | Export, Shipping, FAQ |
| Shipments "typically leave from a west-coast port in Gujarat" | Shipping |
| Sea freight in dry containers and air freight where suitable | Home, Export, Shipping |
| Lot/batch codes carried through to packing "where partners provide them" | Quality |
| Packing options: poly-lined cartons (10/20/25 kg), foil vacuum bags, retail pouches (from the PDF) | Product pages, Packaging |
| Contact languages English, Hindi, Gujarati (schema `availableLanguage`, appears only once email or phone is set) | `build.mjs` |
| Saurashtra described as "one of India's main onion dehydration centres" (industry context, not a ZAPAX GLOBAL claim) | Dehydrated onion page |

## Product information to add when available

- **Black Garlic (new product):** forms (whole bulbs, peeled cloves, powder) and varieties (multi-clove, single-clove) are typical trade options. Confirm which ones you actually supply, and edit `src/site.mjs` if any differ. Fresh fruits and vegetables were removed (dehydrated only); old URLs redirect to /products/.
- **Specification values:** product pages list *parameters* (moisture, mesh, microbiology and so on) and state that values are agreed per order. Once ZAPAX GLOBAL has partner-approved specification sheets, they can be added as downloadable PDFs per product.
- **Dehydrated fruits** is kept from the existing site and PDF, although it was not in the new brief's list. Remove it from `products` in `src/site.mjs` if it is no longer offered.
- **Garlic variety:** listed as "White garlic". Confirm.

## Content deliberately removed or replaced from the old site

- **Fictional testimonials** (clearly labelled samples). Replace only with genuine, customer-approved quotes.
- **Policy links to aethexhealthcare.com.** These pointed to another company's legal pages. New ZAPAX GLOBAL privacy policy and terms pages were written instead.
- **Page loader animation.** It delayed content and hurt performance.
- **Old product overview PDF** (old logo, yellow and grey colours). Regenerated in the new identity from the live catalogue (`npm run assets`).

## Legal pages

`/privacy/` and `/terms/` are written in plain English for a B2B website but are **not legal advice**. Have them reviewed by a qualified advisor, especially if you enable analytics, add newsletter sign-up, or target EU/UK buyers (GDPR). Update the privacy policy if you enable Google Analytics.

## Photography (recommended next step)

All visuals are original SVG illustrations created for ZAPAX GLOBAL. Real photography of genuine products (for example overhead shots of flakes, granules and powder on neutral backgrounds, and packed cartons) would strengthen trust considerably. Use only photos ZAPAX GLOBAL owns or has licensed. Export them as WebP/AVIF at 1x/2x and add them with `<picture>` and `loading="lazy"`.

## Company registrations (needed for the trust section)

Company name: **ZAPAX GLOBAL** (brand), registered as **ZAPAX GLOBAL LLP** (used for copyright, privacy/terms, contact address, business cards, email footer, product PDF, structured data).

Fill `registrations` in `src/site.mjs` with the exact numbers from each certificate. Only entries with a number appear on `/company-registrations/` and the home page (the LLP entry always shows). Optional certificate scans go in `public/legal/`, with signatures and any personal PAN/Aadhaar hidden first.

- [ ] LLPIN (MCA Certificate of Incorporation)
- [ ] GSTIN
- [ ] IEC (DGFT)
- [ ] APEDA RCMC number
- [ ] Spices Board CRES number (dried ginger, garlic)
- [ ] FSSAI licence number
- [ ] Udyam (MSME) number
