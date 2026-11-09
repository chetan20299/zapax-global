// Inquiry handler shared by the Netlify and Cloudflare adapters (and the local dev server).
// Validates input, blocks bots, emails the team (reply-to = buyer) and sends the buyer a confirmation via the Resend API.
// Runtime env: RESEND_API_KEY (secret), MAIL_FROM ("ZAPAX GLOBAL <inquiries@yourdomain>"), MAIL_TO (team inbox, comma-separated allowed).
// Uses only web-standard APIs (Request, Response, fetch, FormData) so it runs on Node 18+, Netlify and Cloudflare Workers.

const MAX = { name: 100, company: 150, email: 150, country: 80, phone: 30, product: 80, quantity: 100, destination_port: 100, message: 4000 };
const REQUIRED = ['name', 'company', 'email', 'country', 'product'];
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);

export function render(tpl, data, { html } = {}) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = data[k] || (['phone', 'quantity', 'port', 'message'].includes(k) ? 'Not provided' : '');
    return html ? esc(v).replace(/\r?\n/g, '<br>') : v;
  });
}
const subjectLine = (tpl, data) => render(tpl, data).replace(/[\r\n]+/g, ' ').slice(0, 200);

async function send(fetchImpl, key, mail) {
  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  });
  if (!res.ok) throw new Error(`Email API ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

export async function handleInquiry(request, env, templates, fetchImpl = fetch) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' });

  // Same-site submissions only (browsers always send Origin on cross-site POST).
  const origin = request.headers.get('origin');
  const allowed = [templates.allowedOrigin, env.ALLOWED_ORIGIN].filter(Boolean);
  if (origin && !allowed.includes(origin)) return json(403, { ok: false, error: 'origin' });

  let form;
  try { form = await request.formData(); } catch { return json(400, { ok: false, error: 'body' }); }

  // Bots: honeypot filled or submitted faster than a person can type. Answer "ok" so they learn nothing.
  const started = Number(form.get('started'));
  if (form.get('website') || !started || Date.now() - started < 3000) return json(200, { ok: true });

  const d = {};
  for (const [k, max] of Object.entries(MAX)) d[k] = clean(form.get(k), max);
  const invalid = REQUIRED.filter((k) => !d[k]);
  if (d.email && !EMAIL_RE.test(d.email)) invalid.push('email');
  if (d.phone && !/^[+()\d\s.-]{6,30}$/.test(d.phone)) invalid.push('phone');
  if (invalid.length) return json(400, { ok: false, error: 'validation', fields: [...new Set(invalid)] });
  const data = { ...d, port: d.destination_port };

  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) {
    console.error('Inquiry backend not configured: set RESEND_API_KEY, MAIL_FROM and MAIL_TO.');
    return json(500, { ok: false, error: 'config' });
  }
  const to = env.MAIL_TO.split(',').map((s) => s.trim()).filter(Boolean);

  // 1. Team notification: must succeed, otherwise the buyer is told to retry or use WhatsApp.
  try {
    await send(fetchImpl, env.RESEND_API_KEY, {
      from: env.MAIL_FROM, to, reply_to: data.email,
      subject: subjectLine(templates.team.subject, data),
      html: render(templates.team.html, data, { html: true }), text: render(templates.team.text, data),
    });
  } catch (e) {
    console.error('Team email failed:', e.message);
    return json(502, { ok: false, error: 'send' });
  }

  // 2. Confirmation to the buyer: a failure here must not hide a delivered inquiry.
  try {
    await send(fetchImpl, env.RESEND_API_KEY, {
      from: env.MAIL_FROM, to: [data.email], reply_to: to[0],
      subject: subjectLine(templates.reply.subject, data),
      html: render(templates.reply.html, data, { html: true }), text: render(templates.reply.text, data),
    });
  } catch (e) {
    console.error('Confirmation email failed:', e.message);
    return json(200, { ok: true, confirmation: false });
  }
  return json(200, { ok: true, confirmation: true });
}
