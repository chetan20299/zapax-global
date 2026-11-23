# ZAPAX ENTERPRISE website

A static site built by `build.mjs` into `dist/`. The main commands are in `package.json`: `build`, `serve`, `qa`, `seo`, `deploy`.

## SEO gate: ask the user before every run

The SEO rules are in [SEO-CHECKLIST.md](SEO-CHECKLIST.md) and `npm run seo` enforces them. **Every point must pass, with zero failures.**

After you finish **any** change to this project:

1. **Don't run the SEO check yet.** First ask the user: *"Changes are complete. Shall I run the SEO check (`npm run build && npm run seo`)?"*
2. **Wait for an answer.** Don't run it until the user says yes. If they say no or don't answer, don't run it. Wait.
3. If they say yes, run `npm run build && npm run seo`. After a deploy, also ask before running `npm run seo -- https://zapaxenterprise.com`.
4. Report the result. If anything fails, show each failing line, fix it, and with the user's OK run the check again until it ends with `0 failed`.
5. Never call a change done while the SEO check has failures. Never loosen a rule in `scripts/seo.mjs` just to make a page pass.

If a change adds a new SEO rule, update `SEO-CHECKLIST.md` and `scripts/seo.mjs` together.
