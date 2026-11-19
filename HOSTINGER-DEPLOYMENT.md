# Put the ZAPAX ENTERPRISE website live on Hostinger

Two Hostinger plan types, two zips:

- **Single / Premium Web Hosting** (no Node.js): follow **Part 0** below, plus Parts 2, 3 and 5.
- **Business / Cloud with Node.js Apps**: skip Part 0 and follow Parts 1–7.

## Part 0. Single Web Hosting (static site + PHP form)

No Node.js runs on the server. You build on your PC; Hostinger serves plain files, and `api/inquiry.php` handles the quote form.

- [ ] **0.1** In `D:\software\ZAPAX\.env` set `SITE_URL=https://zapaxenterprise.com` (already set).
- [ ] **0.2** Run `npm run package:hostinger`. It writes `hostinger-upload.zip`: the contents of `dist/` (23 pages, `assets/`, `fonts/`, `.htaccess`, `api/inquiry.php`). Nothing else from the project goes on the server.
- [ ] **0.3** hPanel → **Files → File Manager** → `public_html`. Delete Hostinger's placeholder (`default.php` / `index.php`) and any project files uploaded earlier (`src`, `public`, `server`, `server.mjs`, `package.json`, `node_modules` ...).
- [ ] **0.4** Upload `hostinger-upload.zip` into `public_html` → right-click → **Extract** → extract **into `public_html` itself**, then delete the zip. `index.html` and `.htaccess` must sit directly in `public_html` (turn on **Show hidden files** to see `.htaccess`).
- [ ] **0.5** Quote form secrets: in File Manager go **one level up** from `public_html` (the folder `domains/zapaxenterprise.com/`) and create `zapax-mail-config.php` there, **not** inside `public_html`:

  ```php
  <?php return [
    'RESEND_API_KEY' => 're_your_key_here',
    'MAIL_FROM' => 'ZAPAX ENTERPRISE <inquiries@zapaxenterprise.com>',
    'MAIL_TO' => 'info@zapaxenterprise.com',
  ];
  ```
- [ ] **0.6** hPanel → **Advanced → PHP Configuration**: PHP **8.1 or newer**, with the `curl` and `mbstring` extensions enabled (they usually are).
- [ ] **0.7** hPanel → **Security → SSL**: the certificate must be **Active**. Leave hPanel's **Force HTTPS** off: `.htaccess` already redirects to https and to the main address, and having both on can cause redirect loops.
- [ ] **0.8** **www**: hPanel → **Domains → DNS**: there must be a `CNAME` named `www` pointing to `zapaxenterprise.com` (or an `A` record `www` with the same IP as `@`). The SSL certificate must cover `www` too. `.htaccess` sends www visitors to `https://zapaxenterprise.com`.
- [ ] **0.9** Test as in Part 5. Updating later: edit → `npm run package:hostinger` → upload and extract again (overwrite).

> Not needed: an SPA "rewrite everything to index.html" rule. This is not a React/Vite single-page app: every page is its own `index.html` in its own folder, and that rule would break the 404 page.

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
