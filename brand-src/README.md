# ZAPAX GLOBAL brand asset package

Everything needed to use the ZAPAX GLOBAL identity outside the website: letterheads, invoices, quotations, export documents, packaging, presentations, email signatures, social media and trade-show materials.

**Slogan:** *Where trust travels.* (rationale in `brand-slogan.md`)

## Folder guide

```
logo/svg/        Scalable vector logos: the master files for designers, printers and signage
logo/png/        High-resolution transparent PNGs (4000 px wide; symbol 2048 px) for Office, Canva, web
logo/pdf/        Vector PDFs for print vendors and Office documents
logo/social/     Profile images (1080 × 1080) and LinkedIn banner (1584 × 396)
logo/zapax-logo-master-editable.svg   All lockups on one artboard (open in Illustrator, Inkscape, Figma)
business-card/   Front/back, light/dark: 300 dpi PNG previews, print PDFs, editable SVGs, print-guide proofs
brand-guidelines/ brand-colors.pdf, typography-guidelines.pdf, logo-usage-guidelines.pdf
fonts/           Archivo (SIL Open Font License): static weights + variable font
```

## Which logo file do I use?

| Need | File |
|------|------|
| Default, on white or light backgrounds | `primary-logo` |
| On indigo, dark or photographic backgrounds | `white-logo` |
| One-colour print: stamps, invoices, photocopies, foil | `dark-logo`: one-colour indigo (or `white-logo` for foil on dark stock) |
| With the slogan (profiles, presentations, packaging) | `horizontal-logo-slogan-*` or `stacked-logo-slogan-*` |
| Square or tall spaces | `stacked-logo-*` |
| App icon, social avatar, favicon, packaging seal | `logo-symbol*` |
| Word only (narrow strips, co-branding) | `wordmark-*` |

Word, PowerPoint and Google Docs: insert the **PNG** (or SVG in Microsoft 365). Printers, sign makers and designers: send the **SVG or PDF**.

## Colours: three only

| Name | HEX | RGB | CMYK (starting point, proof on press) | Use |
|------|-----|-----|------|-----|
| ZAPAX GLOBAL Indigo | #2E3277 | 46 50 119 | 61 58 0 53 | Logo, text, buttons, dark backgrounds |
| Turmeric | #E0A526 | 224 165 38 | 0 26 83 12 | Origin dot, accents, buttons on indigo |
| White | #FFFFFF | 255 255 255 | 0 0 0 0 | Backgrounds, text on indigo |

No other colours are used anywhere. Softer shades (light panels, dividers, secondary text) are made only with transparency of these three, for example indigo at 6% for a light panel. See `brand-guidelines/brand-colors.pdf`.

## Logo rules (summary, details in `logo-usage-guidelines.pdf`)

- Clear space = half the symbol's height on all sides.
- Minimum size: horizontal logo 30 mm / 120 px wide; symbol 6 mm / 16 px.
- Never stretch, rotate, recolour, outline, add shadows or rearrange the parts.
- The origin dot is always turmeric in the full-colour logo.

## Business cards

- Size 90 × 54 mm trim, files are 96 × 60 mm including 3 mm bleed; keep text inside the 4 mm safe area (see `print-guides-*.png`).
- Print PDFs: page 1 = front, page 2 = back. Vector artwork, fonts embedded, RGB colour. Ask the printer to convert to CMYK with their press profile and supply a proof. (We can provide CMYK-converted PDFs if Ghostscript is available; see the main project docs.)
- Cards are ready for both founders, **Chetan Punani** and **Keval Chauhan** (Co-Founders), with phone/WhatsApp +91 99980 50731 and the office address. Files: `business-card-back-chetan-punani-*`, `business-card-back-keval-chauhan-*`, and print PDFs `business-card-print-<name>-<light|dark>.pdf`.
- **Email and website** fill in automatically from the company's own domain (`EMAIL_DOMAIN`, `SITE_URL`) when `npm run brand` is re-run. Until then they show a bracketed placeholder. Do not print the cards before the domain and mailboxes are live.
- The QR code is generated only when the confirmed website domain is set (`SITE_URL`). Test-scan the printed proof.
- Recommended finishes: 350–450 gsm matte or soft-touch board, optional spot UV or deboss on the symbol, foil matched to Turmeric #E0A526 on the origin dot. These are production options, not shown in the flat PNG previews.

## Regenerating

All files are generated from code in the website project (`src/brand.mjs`, `scripts/brand.mjs`):

```bash
npm run brand
```
