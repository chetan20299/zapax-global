// Email templates for the inquiry backend. Rendered at build time with {{tokens}} so the JS (Netlify/Cloudflare)
// and PHP (cPanel) handlers share identical wording. Brand palette only: Indigo, Turmeric, White (+ tints).
// Tokens: name company email country phone product quantity port message (HTML-escaped by the handler).
import { site, fullAddress } from '../src/site.mjs';

const I = '#2E3277', T = '#E0A526', W = '#FFFFFF', MUTED = '#5C5F95', LINE = '#DEDEE9', MIST = '#F2F3F7', TURM_SOFT = '#F8EBCF'; // tints of the brand colours
const host = new URL(site.domain).host;
const logoUrl = `${site.domain}/brand/logo-email.png`;

const shell = (preheader, inner) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ZAPAX GLOBAL</title></head>
<body style="margin:0;padding:0;background:${MIST};font-family:Arial,Helvetica,sans-serif;color:${I}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MIST}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${W};border-radius:12px;overflow:hidden">
<tr><td style="padding:24px 32px;border-bottom:4px solid ${T}"><img src="${logoUrl}" width="160" height="30" alt="ZAPAX GLOBAL" style="display:block;border:0"></td></tr>
${inner}
<tr><td style="padding:20px 32px;background:${I};color:${W};font-size:13px;line-height:1.6">
<strong style="color:${T}">${site.slogan}</strong><br>
${site.legalName} · ${fullAddress}<br>
Phone / WhatsApp: <a href="tel:${site.phone.replace(/[^\d+]/g, '')}" style="color:${W}">${site.phone}</a>${site.email ? ` · <a href="mailto:${site.email}" style="color:${W}">${site.email}</a>` : ''}<br>
<a href="${site.domain}/" style="color:${W}">${host}</a>
</td></tr></table></td></tr></table></body></html>`;

const row = (label, token) => `<tr><td style="padding:8px 12px;border-bottom:1px solid ${LINE};color:${MUTED};font-size:13px;width:150px;vertical-align:top">${label}</td><td style="padding:8px 12px;border-bottom:1px solid ${LINE};font-size:14px;vertical-align:top">{{${token}}}</td></tr>`;
const fields = [['Name', 'name'], ['Company', 'company'], ['Business email', 'email'], ['Country', 'country'], ['Phone / WhatsApp', 'phone'], ['Product', 'product'], ['Quantity', 'quantity'], ['Destination port', 'port'], ['Message', 'message']];
const table = (list) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:8px;border-collapse:separate">${list.map(([l, t]) => row(l, t)).join('')}</table>`;
const textFields = (list) => list.map(([l, t]) => `${l}: {{${t}}}`).join('\n');

export function buildTemplates() {
  const team = {
    subject: 'New inquiry: {{product}} – {{company}} ({{country}})',
    html: shell('New website inquiry', `<tr><td style="padding:28px 32px">
<h1 style="margin:0 0 6px;font-size:22px;color:${I}">New quote request</h1>
<p style="margin:0 0 18px;font-size:14px;color:${MUTED}">Submitted through the website inquiry form. Reply to this email to answer the buyer directly.</p>
${table(fields)}
<p style="margin:18px 0 0;padding:12px 14px;background:${TURM_SOFT};border-left:4px solid ${T};font-size:13px">Before quoting, verify the buyer’s company details and agree all terms in writing, as set out in the ZAPAX GLOBAL trade terms.</p>
</td></tr>`),
    text: `New quote request from the ZAPAX GLOBAL website\n\n${textFields(fields)}\n\nReply to this email to answer the buyer directly.`,
  };

  const securityHtml = `<p style="margin:0;padding:12px 14px;background:${TURM_SOFT};border-left:4px solid ${T};font-size:13px;line-height:1.6"><strong>For your security:</strong> ZAPAX GLOBAL contacts you only from ${site.emailDomain ? `<strong>@${site.emailDomain}</strong> email addresses` : 'our official email address'} and <strong>${site.phone}</strong>. Our bank details appear only in the official proforma invoice and are never changed by email or chat. If anything looks unusual, call us before making any payment.</p>`;
  const securityText = `For your security: ZAPAX GLOBAL contacts you only from ${site.emailDomain ? `@${site.emailDomain} email addresses` : 'our official email address'} and ${site.phone}. Our bank details appear only in the official proforma invoice and are never changed by email or chat. If anything looks unusual, call us before making any payment.`;

  const reply = {
    subject: 'We have received your inquiry | ZAPAX GLOBAL',
    html: shell('Thank you, our team will contact you shortly.', `<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6">
<h1 style="margin:0 0 12px;font-size:22px;color:${I}">Thank you, {{name}}</h1>
<p style="margin:0 0 14px">We have received your inquiry. Our team will contact you shortly by email or WhatsApp.</p>
<p style="margin:0 0 8px;font-weight:bold">Your inquiry</p>
${table([['Company', 'company'], ['Product', 'product'], ['Quantity', 'quantity'], ['Destination port', 'port'], ['Message', 'message']])}
<p style="margin:20px 0 8px;font-weight:bold">What happens next</p>
<ol style="margin:0 0 18px;padding-left:20px"><li>We review your requirement and check availability with our producing partners.</li><li>We reply with options, or with any questions about your specification.</li><li>Once the details are clear, you receive a written quotation. Every ZAPAX GLOBAL deal follows pre-agreed written terms.</li></ol>
${securityHtml}
<p style="margin:18px 0 0;font-size:13px;color:${MUTED}">This is an automatic confirmation. You can reply to this email to reach our team.</p>
</td></tr>`),
    text: `Thank you, {{name}}\n\nWe have received your inquiry. Our team will contact you shortly by email or WhatsApp.\n\nYour inquiry\n${textFields([['Company', 'company'], ['Product', 'product'], ['Quantity', 'quantity'], ['Destination port', 'port'], ['Message', 'message']])}\n\nWhat happens next\n1. We review your requirement and check availability with our producing partners.\n2. We reply with options, or with any questions about your specification.\n3. Once the details are clear, you receive a written quotation. Every ZAPAX GLOBAL deal follows pre-agreed written terms.\n\n${securityText}\n\nZAPAX GLOBAL · ${site.slogan}\n${fullAddress}\nPhone / WhatsApp: ${site.phone}${site.email ? `\nEmail: ${site.email}` : ''}\n${site.domain}/\n\nThis is an automatic confirmation. You can reply to this email to reach our team.`,
  };
  return { team, reply, allowedOrigin: site.domain };
}
