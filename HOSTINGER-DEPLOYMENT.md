# Put the ZAPAX ENTERPRISE website live on Hostinger

Two Hostinger plan types, two zips:

- **Single / Premium Web Hosting** (no Node.js): follow **Part 0** below, plus Parts 2, 3 and 5. For later changes, use **Update and redeploy (Single Web Hosting)**.
- **Business / Cloud with Node.js Apps**: skip Part 0 and follow Parts 1–7.

## Part 0. Single Web Hosting (static site)

No Node.js runs on the server. You build on your PC; Hostinger serves plain files. The quote form saves each inquiry straight to the EximFlow lead dashboard (Enquiries tab) through its API, from the browser. **No email is sent**, so no mail settings are needed on Hostinger.

- [ ] **0.1** In `D:\software\ZAPAX\.env` set `SITE_URL=https://zapaxenterprise.com` (already set).
- [ ] **0.2** Run `npm run package:hostinger`. It writes `hostinger-upload-1.zip` (pages, `assets/`, `fonts/`, `.htaccess`) and `hostinger-upload-2.zip`, `-3`, ... (photos, max 8 MB each). Together they are the contents of `dist/`. Nothing else from the project goes on the server.
- [ ] **0.3** hPanel → **Files → File Manager** → `public_html`. Delete Hostinger's placeholder (`default.php` / `index.php`) and any project files uploaded earlier (`src`, `public`, `server`, `server.mjs`, `package.json`, `node_modules` ...).
- [ ] **0.4** Upload **every** `hostinger-upload-N.zip` into `public_html`. For each one: right-click → **Extract** → extract **into `public_html` itself**, wait until it finishes, then delete that zip. Skipping or interrupting one leaves pages or photos missing (404). `index.html` and `.htaccess` must sit directly in `public_html` (turn on **Show hidden files** to see `.htaccess`).
- [ ] **0.5** Quote form: `EXIMFLOW_API_KEY` must be set in `D:\software\ZAPAX\.env` (already set). It is built into the site; nothing to set on Hostinger. If the server still has an `api` folder in `public_html` or `zapax-mail-config.php` one folder above it (from the old email form), delete both.
- [ ] **0.6** hPanel → **Security → SSL**: the certificate must be **Active**. Leave hPanel's **Force HTTPS** off: `.htaccess` already redirects to https and to the main address, and having both on can cause redirect loops.
- [ ] **0.7** **www**: hPanel → **Domains → DNS**: there must be a `CNAME` named `www` pointing to `zapaxenterprise.com` (or an `A` record `www` with the same IP as `@`). The SSL certificate must cover `www` too. `.htaccess` sends www visitors to `https://zapaxenterprise.com`.
- [ ] **0.8** Test as in Part 5. To change the site later, follow **Update and redeploy** below.

> Not needed: an SPA "rewrite everything to index.html" rule. This is not a React/Vite single-page app: every page is its own `index.html` in its own folder, and that rule would break the 404 page.

---

## Update and redeploy (Single Web Hosting)

Use this every time you change the live website after the first setup (Part 0). Hostinger only serves the built files, so every change is made and built on your PC and then uploaded again.

### A. Where to make the change

| What you want to change | Where |
|-------------------------|-------|
| Products, contact details, address, company info | `src/site.mjs` |
| Page text (About, FAQ, Shipping and so on) | `src/pages.mjs` |
| Colours, fonts, layout | `src/styles.css` |
| Images, product PDF, fonts | `public/` |
| Domain, phone, WhatsApp, contact email, Google Analytics | `.env` (all options are listed in `.env.example`) |
| Quote form (inquiries saved to EximFlow) | `EXIMFLOW_API_KEY` in `.env`, then rebuild and deploy |

### B. Update the website (on your PC, in `D:\software\ZAPAX`)

- [ ] **B.1** Make your changes in the files from section A.
- [ ] **B.2** Preview locally: run `npm run build`, then `npm run serve`, and open <http://localhost:8080>. Check every page you changed. Press **Ctrl + C** to stop the preview.
- [ ] **B.3** Run `npm run package:hostinger`. It writes new `hostinger-upload-N.zip` files for `https://zapaxenterprise.com`. If it prints an error, fix it first and do not upload.
- [ ] **B.4** Recommended: save a backup copy of the change in Git: `git add -A`, then `git commit -m "Update website: <what changed>"`.

### Recommended: one command, `npm run deploy` (no zips, no File Manager)

File Manager's **Extract** silently drops files from large zips (missing photos and pages). `npm run deploy` uploads directly over encrypted FTP instead, and only what changed.

One-time setup:
1. hPanel → **Files → FTP Accounts**: note the **FTP host**, **username**, and set a **password**.
2. Put them in `D:\software\ZAPAX\.env` (never committed): `FTP_HOST=` (IP or name, **without** `ftp://`), `FTP_USER=`, `FTP_PASS=`, and `FTP_DIR=/domains/zapaxenterprise.com/public_html`. FTP_DIR must be this **full path**: the FTP login opens in its own `public_html`, which is **not** the website folder, so files uploaded there never appear on the site. An IP address is fine: the certificate is checked against Hostinger's `*.hstgr.io` name automatically.

Every update:
1. Edit, preview (`npm run build`, `npm run serve`).
2. `npm run deploy`. It builds the production site, then uploads **only new or changed files**. It remembers what is on the server in `.deploy-state.json`, so unchanged photos are never uploaded again. It also re-uploads anything the live site is missing, then checks every uploaded file on the live site (3 tries). It ends with `✓ Live site matches dist/`.
3. Optional: `npm run deploy -- --dry` lists what would be uploaded without uploading.

Photo URLs carry a version (`?v=...`) that changes when a photo is regenerated, so visitors always get the new image, never a cached old one.

### C. Manual redeploy with zips (fallback; hPanel → Files → File Manager)

- [ ] **C.1** Open `public_html`, turn on **Show hidden files**, select **everything** inside `public_html` (including `.htaccess`) and delete it.
  Clearing the folder first also removes pages you deleted from the site and old CSS/JS files.
- [ ] **C.2** Upload **all** new `hostinger-upload-N.zip` files into `public_html`. Wait until each upload reaches 100%.
- [ ] **C.3** For each zip: right-click → **Extract** → extract **into `public_html` itself** (not a new subfolder) → wait until it finishes → delete the zip.
- [ ] **C.4** Check that `index.html`, `.htaccess` and the `api` folder sit directly in `public_html`.
- [ ] **C.5** On your PC run `node scripts/check-live.mjs`. It must print `N/N files OK`; any 404 means hPanel did not fully extract a zip; it then names the exact zips to upload and extract again.
- [ ] **C.6** Open <https://zapaxenterprise.com> and press **Ctrl + F5** to skip the cached copy. Check the pages you changed.
- [ ] **C.7** If you changed anything near the quote form, send one test inquiry (wait at least 5 seconds before submitting).

### D. Changes that need no new zip

- **One-time settings stay as they are:** the `www` DNS record, SSL certificate and PHP version are not affected by redeploys.

> Changing anything in `.env` (domain, phone, email) **does** need steps B.3 and C again: those values are written into the pages when they are built on your PC.

---

## Node.js app (Business / Cloud plans)

Build its zip with `npm run package:hostinger-node`. This part deploys the site as a **Hostinger Node.js web app** (Business or Cloud plan: hPanel → **Websites → Add website → Node.js Apps**). Follow the parts in order and tick each step. **`yourdomain.com`** stands for your real domain; type it wherever you see it.

## How it works

`npm run package:hostinger-node` creates **`hostinger-upload.zip`** (about 0.4 MB) in the project folder. Hostinger unpacks it, runs `npm install` (only `esbuild`), then starts `server.mjs`. On every start, `server.mjs`:

1. builds the 23 pages into `dist/` using the **environment variables you set in hPanel** (domain, emails), then
2. serves the website and the quote form endpoint `/api/inquiry` (emails go out through Resend).

So changing the domain or email settings later only needs an env-var change and a restart in hPanel, no new zip.

### What is in the zip (and what is not)

| Included | Why |
|----------|-----|
| `package.json` (at the zip root, as Hostinger requires) | Tells Hostinger: install `esbuild`, start with `node server.mjs` |
| `server.mjs` | Production web server (pages, redirects, security headers, quote form) |
| `build.mjs`, `src/` | Generates the pages from the content |
| `public/` | Fonts, images, logo, product PDF |
| `server/inquiry-core.mjs`, `server/email-templates.mjs` | Quote form handler and email templates |
| `.env.example` | Reference list of settings (not used by the server) |

| Excluded | Why |
|----------|-----|
| `node_modules/` | Hostinger installs dependencies itself; uploading it breaks the install |
| `dist/` | Rebuilt on the server with the right domain |
| `.env` | Can contain secrets; set values in hPanel instead |
| `brand-assets/`, `brand-src/`, `_legacy/`, `qa-shots/` | Print/design files and QA output, not part of the website |
| `scripts/`, dev tools (puppeteer, opentype, qrcode) | Only for QA and brand-asset generation on your PC |
| `netlify/`, `functions/`, `netlify.toml`, `server/php/` | For other hosts (Netlify, Cloudflare, PHP hosting) |
| `*.md` docs, `.git/`, `package-lock.json` | Not needed to run the site |

---

## Part 1. Build the zip (on your PC)

- [ ] **1.1** Open a terminal in `D:\software\ZAPAX`.
- [ ] **1.2** First time only: `npm ci`
- [ ] **1.3** `npm run package:hostinger-node`
  It builds the site once as a check, runs the 14 quote-form tests, and writes `D:\software\ZAPAX\hostinger-upload.zip`. Stop if anything fails.
- [ ] **1.4** Optional check: open the zip. `package.json`, `server.mjs` and the `src` folder must be **directly** inside it, not inside another folder. Do not add or remove files.

---

## Part 2. Create the company mailboxes

Most Hostinger plans include free email for your domain. If yours does not, use Zoho Mail (free tier) or Google Workspace instead.

- [ ] **2.1** hPanel → **Emails** → choose `yourdomain.com` → **Hostinger Email** (activate the free email if asked).
- [ ] **2.2** **Email accounts → Create email account** and create these mailboxes, each with a strong password:

  | Mailbox | Used for |
  |---------|----------|
  | `info@yourdomain.com` | Public contact address and the inbox that receives website inquiries |
  | `chetan@yourdomain.com` | Chetan Punani, Co-Founder (printed on the business card) |
  | `keval@yourdomain.com` | Keval Chauhan, Co-Founder (printed on the business card) |

- [ ] **2.3** Hostinger adds the mail DNS records (MX, SPF) automatically. Check in **Domains → DNS / Nameservers** that the **MX** records for `@` point to Hostinger mail servers.
- [ ] **2.4** Log in at **mail.hostinger.com** as `info@yourdomain.com`, send a test email to a personal Gmail address, reply from Gmail and confirm the reply arrives.

---

## Part 3. Set up Resend (sends the quote form emails)

The quote form uses **Resend** (3,000 emails a month free), so form emails land in the inbox and not in spam.

- [ ] **3.1** Go to **resend.com** → **Sign up**.
- [ ] **3.2** Resend → **Domains → Add domain** → type `yourdomain.com` → **Add**.
- [ ] **3.3** Resend shows 3 or 4 DNS records (typically an **MX** and a **TXT** on `send`, a **TXT** on `resend._domainkey`, and an optional DMARC record). Keep this page open.
- [ ] **3.4** In a second tab: hPanel → **Domains** → `yourdomain.com` → **DNS / Nameservers** → **Manage DNS records**. Add each record Resend shows:

  | Field in hPanel | What to type |
  |-----------------|--------------|
  | **Type** | Same as Resend (MX or TXT) |
  | **Name** | Only the part **before** your domain: `send.yourdomain.com` → `send`; `resend._domainkey` → `resend._domainkey` |
  | **Points to / Content / Value** | Copy exactly from Resend with the copy button |
  | **Priority** (MX only) | The number Resend shows (usually `10`) |
  | **TTL** | Leave the default |

  These records are on the `send` subdomain, so they do **not** affect the mailboxes from Part 2.
- [ ] **3.5** DMARC: if hPanel has no **TXT** record named `_dmarc`, add one: Type **TXT**, Name `_dmarc`, Value `v=DMARC1; p=none; rua=mailto:info@yourdomain.com`
- [ ] **3.6** Back in Resend, click **Verify DNS records** and wait until the domain shows **Verified** (minutes, at most a few hours).
- [ ] **3.7** Resend → **API Keys → Create API key**: name `zapax-website`, permission **Sending access**, domain `yourdomain.com` → **Create**. **Copy the key** (starts with `re_`); Resend shows it only once.

> Treat the API key like a password. Put it only in hPanel's environment variables (Part 4), never in files, Git, WhatsApp or email.

---

## Part 4. Create the Node.js app on Hostinger

hPanel labels change from time to time; if a name differs slightly, pick the closest one.

- [ ] **4.1** hPanel → **Websites → Add website → Node.js Apps**.
- [ ] **4.2** Choose **Upload your website files** and upload `hostinger-upload.zip`.
- [ ] **4.3** Choose the domain `yourdomain.com` (connect it to Hostinger first if hPanel asks; a domain bought at Hostinger is connected automatically).
- [ ] **4.4** Build settings:

  | Setting | Value |
  |---------|-------|
  | Framework / preset | **Express** (or **Other**) |
  | Node.js version | **20.x** or **22.x** (20.12 or newer) |
  | Root directory | `./` (default) |
  | Entry file | `server.mjs` |
  | Package manager | **npm** |
  | Build command | leave empty, or `npm run build` |
  | Start command (if asked) | `npm start` |
  | Output directory (if asked) | leave empty |

- [ ] **4.5** **Environment variables** (same screen, or later in the app's **Settings → Environment variables**):

  | Name | Value | Required |
  |------|-------|----------|
  | `SITE_URL` | `https://yourdomain.com` (https, no slash at the end; use `https://www.yourdomain.com` if www should be the main address) | **Yes** |
  | `RESEND_API_KEY` | the `re_...` key from step 3.7 (secret) | Yes, for the form |
  | `MAIL_FROM` | `ZAPAX ENTERPRISE <inquiries@yourdomain.com>` | Yes, for the form |
  | `MAIL_TO` | `info@yourdomain.com` (several allowed, comma-separated) | Yes, for the form |
  | `EMAIL_DOMAIN` | `yourdomain.com` | Optional (defaults to the domain) |
  | `CONTACT_EMAIL` | `info@yourdomain.com` | Optional (defaults to info@domain) |

  Do **not** set `PORT`; Hostinger sets it. Other optional settings (phone, WhatsApp, Google Analytics) are listed in `.env.example`.
- [ ] **4.6** Click **Deploy** and wait. The log should end with `Built 23 pages for https://yourdomain.com → dist/ (production)` and `ZAPAX site for https://yourdomain.com listening on port ...`.
- [ ] **4.7** hPanel → **Security → SSL** for the domain: the free certificate must be **Active**.

---

## Part 5. Test everything

- [ ] **5.1** Open `https://yourdomain.com`: check Home, About, Products, a product page and Contact.
- [ ] **5.2** Open the other form (`https://www.yourdomain.com`, or without www): it must jump to the main address. If it does not load at all, add a DNS record in hPanel: `CNAME`, name `www`, pointing to `yourdomain.com`.
- [ ] **5.3** Open `https://yourdomain.com/does-not-exist`: the ZAPAX 404 page must show.
- [ ] **5.4** Quote form: use your own Gmail address, wait at least 5 seconds, submit. You should see the success message; `info@` receives the inquiry and Gmail receives the confirmation. Replying to the inquiry must go to the Gmail address.
- [ ] **5.5** Open `https://yourdomain.com/sitemap.xml`: every link must start with your real domain.

---

## Part 6. Updating the website later

- **Text, products, pages:** edit on your PC → `npm run package:hostinger-node` → hPanel → your Node.js app → **Redeploy** with the new zip. Environment variables are kept.
- **Domain or emails only:** change the environment variable in hPanel → **Restart** the app. No new zip.
- **Google Search:** after going live, add the site in Google Search Console and submit `https://yourdomain.com/sitemap.xml`. For meta-tag verification set `GOOGLE_SITE_VERIFICATION` in hPanel and restart.

---

## Part 7. Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Deploy fails: `Production build stopped: SITE_URL is not set` | `SITE_URL` missing or not `https://` | Step 4.5, then Redeploy |
| Deploy fails: `Cannot find module 'esbuild'` or `package.json not found` | Zip has an extra folder level, or was changed | Upload the zip from `npm run package:hostinger-node` unchanged (step 1.4) |
| 503 / "application not running" | App stopped at start | Open the app's **Logs** in hPanel; the first error line says what is wrong |
| Form says it could not send; log shows `Inquiry backend not configured` | `RESEND_API_KEY`, `MAIL_FROM` or `MAIL_TO` missing | Step 4.5, then Restart |
| Form error; log shows `Email API 403` | Resend domain not verified, or `MAIL_FROM` on another domain | Finish step 3.6; `MAIL_FROM` must end in `@yourdomain.com` |
| Form fails only on Hostinger's temporary preview address | The form accepts only the `SITE_URL` address | Test on the real domain; `SITE_URL` must match exactly (www vs non-www) |
| Emails go to spam | DKIM/DMARC missing | Steps 3.4–3.5; Resend must show **Verified** |
| Old content after redeploy | Browser cache | **Ctrl + F5** |

**Still stuck?** Hostinger live chat (hPanel, bottom-right) can read the Node.js app logs with you. Tell them: *"Node.js app, entry file server.mjs, Node 20+, it builds itself at start and listens on process.env.PORT"*.

---

## Update procedure

**On your PC (in `D:\software\ZAPAX`)**

1. Make your edits.
2. To preview, run `npm run build` and then `npm run serve`, and open http://localhost:8080. Check the pages you changed. Press Ctrl+C to stop.
3. Run `npm run package:hostinger`. This makes new `hostinger-upload-N.zip` files for `https://zapaxenterprise.com`. If it prints an error, fix that first and don't upload.
4. Optional but recommended: save a backup in git with `git add -A` and then `git commit -m "Update website"`.

**In hPanel (File Manager)**

5. Open `public_html` and select everything in it. Turn on **Show hidden files** so `.htaccess` is included, then delete it all.
   - Deleting first also removes any pages you've removed from the site and old CSS/JS files.
6. Upload all new `hostinger-upload-N.zip` files into `public_html`. Right-click each, choose **Extract**, and extract it into `public_html` itself (not into a new folder). Wait for it to finish, then delete the zip.
7. Check that `index.html`, `.htaccess` and the `api` folder sit directly in `public_html`, then run `node scripts/check-live.mjs` on your PC: every file must be OK.

**Check the live site**

8. Open https://zapaxenterprise.com and press **Ctrl+F5** to skip the old cached copy. Check the pages you changed.
9. If you changed anything about the contact form, send one test inquiry.
