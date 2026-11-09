# Deployment guide: ZAPAX GLOBAL on your own domain

The site is a static, production-ready build with a small serverless inquiry backend. `npm run build:production` creates `dist/`, a complete website with every URL, canonical tag, sitemap entry and redirect generated from one setting: `SITE_URL`. There are no hardcoded preview or development URLs. Internal links are root-relative, so the same build works on any domain.

---

## 0. Go live on Netlify now (no domain or mailboxes needed yet)

The site can go live today on a free `*.netlify.app` address. Nothing needs to be configured first:

- **Address:** on Netlify the build uses the site's own URL automatically for canonicals, sitemap, robots.txt and structured data. No `SITE_URL` needed.
- **Quote form:** until `RESEND_API_KEY` is set, the form uses **Netlify Forms**. Every inquiry is stored in the Netlify dashboard and emailed to the address you choose (a Gmail address is fine). Buyers see "Inquiry sent"; they do not get an automatic confirmation email yet.
- **Email on the site:** hidden until a company domain exists. Buyers contact you by phone and WhatsApp (+91 99980 50731) and the form.

Steps (about 10 minutes):

1. Create a free GitHub account and an empty **private** repository, e.g. `zapax-global-website`.
2. Push this folder (Git for Windows is installed):
   ```bash
   cd D:\ZAPAX
   git init -b main
   git add .
   git commit -m "ZAPAX GLOBAL website"
   git remote add origin https://github.com/<your-account>/zapax-global-website.git
   git push -u origin main
   ```
   `.gitignore` already excludes `node_modules/`, `dist/`, `.env` and screenshots.
3. Sign up at **netlify.com** (log in with GitHub) → **Add new project → Import an existing project** → GitHub → pick the repository. Leave every build setting as detected (`netlify.toml` supplies them) → **Deploy**.
4. **Project configuration → General → Project details → Change project name**, e.g. `zapax-global`, which gives `https://zapax-global.netlify.app`. Then **Deploys → Trigger deploy → Deploy project** so the pages use the new address.
5. **Forms → Enable form detection**, then **Trigger deploy** once more. The `inquiry` form then appears under Forms.
6. **Forms → Form notifications → Add notification → Email notification** → form `inquiry` → the inbox that should receive inquiries (add one per founder if both should get them).
7. Send a test inquiry from the live Contact page and confirm it arrives in the dashboard and by email.

Every later `git push` redeploys automatically.

**When the domain is ready:** add it under Domain management and set it as **primary** (section 5, Option A), then **Trigger deploy**. The site switches to the new domain on its own, and the `netlify.app` address redirects to it. Then set `EMAIL_DOMAIN` and the Resend variables (sections 2 to 4) to show the email address and switch the form to the full backend with buyer confirmations, and regenerate the PDF and business cards (`npm run assets`, `npm run brand`).

## 1. Register the domain

**`zapax.com` is not available.** On 8 November 2026 it was a parked domain listed for sale on a domain marketplace (atom.com). Do not use it, and do not print any `@zapax.com` address.

1. Choose and register a domain in the company's name, for example a `.com` or `.in` variant of ZAPAX GLOBAL. Registration must be done by ZAPAX GLOBAL through a registrar (GoDaddy, Hostinger, BigRock, Namecheap and so on).
2. Pick **one** canonical address, for example `https://www.yourdomain.com`. The other form is redirected to it automatically.

The examples below use `yourdomain.com`.

## 2. Create the mailboxes

Create these on the new domain with Google Workspace or Zoho Mail (Zoho has a low-cost/free tier popular in India):

| Mailbox | Used for |
|---------|----------|
| `info@yourdomain.com` | Public contact address and team inbox for website inquiries |
| `chetan@yourdomain.com` | Chetan Punani, Co-Founder (business card) |
| `keval@yourdomain.com` | Keval Chauhan, Co-Founder (business card) |

The site and business cards derive these addresses automatically from `EMAIL_DOMAIN` (or the `SITE_URL` host).

## 3. Inquiry emails: team delivery and automatic buyer confirmation

When a buyer sends **Request a quote**:

1. The backend validates the form and blocks bots (honeypot, minimum time, same-site origin check).
2. **Team email** to `MAIL_TO` with all details. *Reply-To* is the buyer, so hitting Reply answers them directly.
3. **Confirmation email** to the buyer from your domain: thanks them, repeats their inquiry, says the team will contact them shortly, explains next steps, and includes the anti-fraud notice and company contact details.
4. If the team email fails, the buyer sees an error with WhatsApp/phone alternatives. If only the confirmation fails, the inquiry still counts as sent.

Setup (about 15 minutes):

1. Create a free account at **Resend** (resend.com) → Domains → add `yourdomain.com` (or a sending subdomain such as `mail.yourdomain.com`).
2. Add the DNS records Resend shows (SPF/DKIM TXT and MX) at your registrar, then wait for **Verified**. Adding a DMARC record (`_dmarc` TXT `v=DMARC1; p=none; rua=mailto:info@yourdomain.com`) improves inbox placement.
3. Create an API key (sending access only).
4. Set the runtime variables on your host (section 4): `RESEND_API_KEY` (secret), `MAIL_FROM` = `ZAPAX GLOBAL <inquiries@yourdomain.com>`, `MAIL_TO` = `info@yourdomain.com` (add more addresses separated by commas).
5. After deploying, **send a real test inquiry** with your own email: confirm the team email arrives (Reply goes to the buyer) and the confirmation arrives in the buyer inbox (check spam).

Local testing: `npm run build && npm run serve` runs the same backend in dry-run mode and saves both emails as HTML files in `qa-shots/emails/` for preview. With `RESEND_API_KEY` set in `.env`, it sends for real.

## 4. Environment variables

All settings are environment variables, documented in `.env.example`. Locally: copy it to `.env`. On the host: set them in the dashboard.

| Variable | When | Required | Purpose |
|----------|------|----------|---------|
| `SITE_URL` | build | **Yes** | Canonical origin (`https://`, no trailing slash): canonicals, sitemap, robots, redirects, schema, PDF, card QR |
| `EMAIL_DOMAIN` | build | **Yes**\* | Domain of the mailboxes (defaults to the `SITE_URL` host without `www.`) |
| `CONTACT_EMAIL` | build | No | Public email (defaults to `info@EMAIL_DOMAIN`) |
| `CONTACT_PHONE`, `WHATSAPP_NUMBER` | build | No | Default to the confirmed +91 99980 50731 |
| `LEGAL_NAME` | build | Recommended | Registered company name |
| `FORM_ENDPOINT` | build | No | Defaults to the built-in `/api/inquiry` |
| `DEPLOY_TARGET` | build | cPanel only | `cpanel` includes the PHP handler in `dist/` |
| `GA_MEASUREMENT_ID`, `GOOGLE_SITE_VERIFICATION` | build | Optional | Analytics and Search Console |
| `RESEND_API_KEY` | runtime | **Yes** | **Secret.** Email API key. Set only in the host dashboard, never commit |
| `MAIL_FROM` | runtime | **Yes** | Sender on your verified domain |
| `MAIL_TO` | runtime | **Yes** | Team inbox(es) |

\* `build:production` stops with an error if `SITE_URL` or the email domain is missing.

### After setting the final domain, regenerate the offline assets once

```bash
npm run assets   # product overview PDF (shows the domain), share image, icons, email logo
npm run brand    # business cards get the real emails, website and a scannable QR code
```

Commit the results. These steps need Chrome, so they run on your computer, not on the host.

## 5. Choose a host and deploy

All three options give free automatic SSL and work with any registrar.

### Option A: Netlify (recommended, simplest)

1. Put the project in a Git repository (GitHub/GitLab/Bitbucket) and import it in Netlify. `netlify.toml` sets the build command, publish folder, Node version and the inquiry function (`netlify/functions/inquiry.mjs` → `/api/inquiry`).
2. Site configuration → Environment variables: add the build **and** runtime variables from section 4. Mark `RESEND_API_KEY` as secret.
3. Domain management → Add a domain → add both `yourdomain.com` and `www.yourdomain.com`, and set your canonical one as **primary**.
4. DNS at your registrar:

   | Type | Name | Value |
   |------|------|-------|
   | A | `@` | `75.2.60.5` (Netlify load balancer; confirm the value shown in your Netlify dashboard) |
   | CNAME | `www` | `<your-site>.netlify.app` |

   Or switch the domain's nameservers to Netlify DNS for automatic setup. Keep the mail (MX) and Resend records when changing DNS.
5. HTTPS: Netlify issues a Let's Encrypt certificate automatically once DNS resolves. Then enable **Force HTTPS**.
6. The generated `_redirects` handles HTTP→HTTPS, www/non-www and `/about.html`. `_headers` sets security and caching headers.

### Option B: Cloudflare Pages

1. Create a Pages project from the repository. Build command `npm run build:production`, output directory `dist`, `NODE_VERSION` = `22`. The `functions/api/inquiry.js` file is deployed automatically as `/api/inquiry`.
2. Settings → Variables: add the build and runtime variables (encrypt `RESEND_API_KEY`).
3. Custom domains → add the canonical domain (and the alternate). If the domain uses Cloudflare DNS, records are created automatically. Otherwise add the CNAME shown.
4. SSL is automatic. Set SSL/TLS to **Full (strict)** and enable **Always Use HTTPS**.
5. Cloudflare Pages reads `_headers` and the path rule in `_redirects`, but **not** domain-level rules. Create a **Redirect Rule** sending the alternate host to the canonical one, for example `yourdomain.com/*` → `https://www.yourdomain.com/${1}`, 301.

### Option C: cPanel / shared hosting (Hostinger, GoDaddy, Bluehost and similar)

1. On your computer, with `.env` filled in and `DEPLOY_TARGET=cpanel`: `npm ci && npm run build:production`.
2. Upload the **contents** of `dist/` (including the hidden `.htaccess` and the `api/` folder) to `public_html/`. Turn on "show hidden files".
3. Create `zapax-mail-config.php` **one level above** `public_html` (so it can never be downloaded):
   ```php
   <?php return ['RESEND_API_KEY' => 're_...', 'MAIL_FROM' => 'ZAPAX GLOBAL <inquiries@yourdomain.com>', 'MAIL_TO' => 'info@yourdomain.com'];
   ```
   The handler needs PHP 8 with the `curl` and `mbstring` extensions (standard on these hosts).
4. In cPanel → SSL/TLS Status, issue the free **AutoSSL / Let's Encrypt** certificate for both `yourdomain.com` and `www.yourdomain.com`.
5. DNS: point `@` (A record) to the host's server IP and `www` (CNAME) to `@` or the host name the provider gives you.
6. The generated `.htaccess` forces HTTPS and the canonical host, routes `/api/inquiry` to the PHP handler, serves `404.html`, redirects `/about.html`, enables compression, and sets security and caching headers.
7. To update: rebuild and re-upload `dist/`.

**Note:** the PHP handler mirrors the tested JavaScript handler but could not be executed in our test environment. Test it on the host with a real inquiry before launch, or use Option A/B.

## 6. Updating the site

Edit content in `src/`, then:

```bash
npm run build && npm run qa && npm run colors && npm test   # local checks
git commit -am "Update content" && git push     # Netlify/Cloudflare redeploy automatically
```

Hashed CSS/JS filenames mean visitors always get the new version, with no cache clearing needed.

## 7. Search Console and analytics

1. **Google Search Console:** add a *Domain* property and verify via the DNS TXT record at your registrar. Submit `https://<your-domain>/sitemap.xml`.
2. **Bing Webmaster Tools:** import from Search Console.
3. **Google Analytics 4 (optional):** set `GA_MEASUREMENT_ID`, redeploy, update the privacy policy. EU/UK visitors may require a consent banner.
4. Use identical business name, address, phone and website on Google Business Profile, LinkedIn and trade directories. Add official profile URLs to `social` in `src/site.mjs`.
5. Validate with Google's Rich Results Test once live.

## 8. Final deployment and verification checklist

Deployment is **not complete** until every item below is ticked on the live domain.

**Before deploying**
- [ ] Domain registered in the company's name; mailboxes info@, chetan@, keval@ working
- [ ] Resend domain verified; `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO` set on the host
- [ ] `SITE_URL`, `EMAIL_DOMAIN`, `LEGAL_NAME` set
- [ ] `npm run assets` and `npm run brand` re-run with the final values, results committed
- [ ] `npm run build:production`, `npm run qa` and `npm run colors` all pass locally
- [ ] Items in CONTENT-REVIEW.md "Must confirm" completed

**After DNS and SSL are live: automated**
- [ ] `npm run verify -- https://www.your-domain.com` reports **0 failed**. It checks:
  - certificate validity, HTTP→HTTPS and www/non-www redirects, `/about.html` redirect
  - robots.txt and sitemap on the production domain
  - every page returns 200 with the correct canonical/og:url, indexable, no preview URLs
  - a real 404 status, security headers, compression and long-term asset caching
  - the inquiry form has a delivery route
  - the full browser QA on the live site: every page at 4 screen sizes, console errors, broken links/images, navigation, mobile menu, form validation and states

**After DNS and SSL are live: manual**
- [ ] Submit one real inquiry: the team email arrives (Reply goes to the buyer) and the buyer receives the confirmation email
- [ ] Tap the floating WhatsApp button on a phone: chat opens with +91 99980 50731
- [ ] Tap the WhatsApp and email links on a phone
- [ ] Check the site on an iPhone (Safari) and an Android phone (Chrome), plus Firefox on desktop
- [ ] Share the homepage link in WhatsApp/LinkedIn and confirm the preview image and title appear
- [ ] Scan the QR code on a printed business-card proof
- [ ] Search Console: domain verified, sitemap submitted, homepage "URL inspection" shows indexable

## 9. Reliability and maintenance

- Keep the Git repository as the backup and source of truth. Any version can be redeployed in one click on Netlify/Cloudflare.
- Optional uptime monitoring (for example UptimeRobot) on `/` and `/contact/`.
- Re-run `npm run verify` after DNS, host or certificate changes. SSL renews automatically on all three hosting options.
- Review the legal pages yearly.
