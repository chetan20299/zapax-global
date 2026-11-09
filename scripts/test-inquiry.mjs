// Tests for the inquiry backend with a mocked email API: node scripts/test-inquiry.mjs
import assert from 'node:assert/strict';
import { handleInquiry } from '../server/inquiry-core.mjs';
import { buildTemplates } from '../server/email-templates.mjs';

const templates = buildTemplates();
const env = { RESEND_API_KEY: 're_test', MAIL_FROM: 'ZAPAX GLOBAL <inquiries@example.in>', MAIL_TO: 'info@example.in' };
const ORIGIN = templates.allowedOrigin;

function req(fields = {}, { method = 'POST', origin = ORIGIN } = {}) {
  const fd = new FormData();
  const base = { name: 'Asha Buyer', company: 'Fresh Foods GmbH', email: 'asha@freshfoods.de', country: 'Germany', product: 'Dehydrated Onion', started: String(Date.now() - 10_000), website: '' };
  for (const [k, v] of Object.entries({ ...base, ...fields })) if (v !== undefined) fd.set(k, v);
  return new Request('https://site.test/api/inquiry', { method, body: method === 'POST' ? fd : undefined, headers: origin ? { Origin: origin } : {} });
}
function mockFetch(statuses = [200, 200]) {
  const calls = [];
  const fn = async (url, init) => { calls.push({ url, body: JSON.parse(init.body), auth: init.headers.Authorization }); const s = statuses[calls.length - 1] ?? 200; return new Response('{}', { status: s }); };
  fn.calls = calls;
  return fn;
}
const run = async (r, f = mockFetch(), e = env) => { const res = await handleInquiry(r, e, templates, f); return { status: res.status, body: await res.json(), calls: f.calls }; };
let n = 0;
const test = async (name, fn) => { await fn(); n++; console.log(`✓ ${name}`); };

await test('valid inquiry: team email then buyer confirmation', async () => {
  const { status, body, calls } = await run(req({ quantity: '2 x 20ft FCL', message: 'Need 80-100 mesh\nwith COA', destination_port: 'Hamburg' }));
  assert.equal(status, 200); assert.deepEqual(body, { ok: true, confirmation: true });
  assert.equal(calls.length, 2);
  const [team, reply] = calls.map((c) => c.body);
  assert.equal(calls[0].auth, 'Bearer re_test');
  assert.deepEqual(team.to, ['info@example.in']); assert.equal(team.reply_to, 'asha@freshfoods.de');
  assert.equal(team.subject, 'New inquiry: Dehydrated Onion – Fresh Foods GmbH (Germany)');
  assert.match(team.html, /Need 80-100 mesh<br>with COA/); assert.match(team.text, /Destination port: Hamburg/);
  assert.deepEqual(reply.to, ['asha@freshfoods.de']); assert.equal(reply.reply_to, 'info@example.in');
  assert.match(reply.html, /Thank you, Asha Buyer/); assert.match(reply.text, /contact you shortly/);
  assert.match(reply.text, /never changed by email or chat/);
});

await test('HTML in fields is escaped in the email', async () => {
  const { calls } = await run(req({ name: '<script>alert(1)</script>', message: '<b>x</b>' }));
  assert.ok(!calls[0].body.html.includes('<script>alert')); assert.match(calls[0].body.html, /&lt;script&gt;/);
});

await test('optional fields show "Not provided"', async () => {
  const { calls } = await run(req());
  assert.match(calls[0].body.text, /Quantity: Not provided/);
});

await test('subject cannot carry line breaks (header injection)', async () => {
  const { calls } = await run(req({ company: 'Evil\r\nBcc: x@y.z' }));
  assert.ok(!/[\r\n]/.test(calls[0].body.subject));
});

await test('honeypot → silent ok, nothing sent', async () => {
  const { status, calls } = await run(req({ website: 'http://spam' })); assert.equal(status, 200); assert.equal(calls.length, 0);
});

await test('submitted too fast → silent ok, nothing sent', async () => {
  const { status, calls } = await run(req({ started: String(Date.now() - 500) })); assert.equal(status, 200); assert.equal(calls.length, 0);
});

await test('missing required fields → 400 with field list', async () => {
  const { status, body, calls } = await run(req({ company: '', country: '' }));
  assert.equal(status, 400); assert.deepEqual(body.fields.sort(), ['company', 'country']); assert.equal(calls.length, 0);
});

await test('invalid email → 400', async () => {
  const { status, body } = await run(req({ email: 'not-an-email' })); assert.equal(status, 400); assert.deepEqual(body.fields, ['email']);
});

await test('cross-site origin → 403', async () => {
  const { status, calls } = await run(req({}, { origin: 'https://evil.example' })); assert.equal(status, 403); assert.equal(calls.length, 0);
});

await test('GET → 405', async () => {
  const { status } = await run(req({}, { method: 'GET' })); assert.equal(status, 405);
});

await test('missing configuration → 500, nothing sent', async () => {
  const { status, calls } = await run(req(), mockFetch(), {}); assert.equal(status, 500); assert.equal(calls.length, 0);
});

await test('team email fails → 502 (buyer told to retry)', async () => {
  const { status, calls } = await run(req(), mockFetch([500])); assert.equal(status, 502); assert.equal(calls.length, 1);
});

await test('confirmation fails → still ok, inquiry not lost', async () => {
  const { status, body } = await run(req(), mockFetch([200, 500])); assert.equal(status, 200); assert.deepEqual(body, { ok: true, confirmation: false });
});

await test('templates use brand palette only', async () => {
  const allowed = new Set(['#2E3277', '#E0A526', '#FFFFFF', '#5C5F95', '#DEDEE9', '#F2F3F7', '#F8EBCF']); // brand + documented tints
  for (const t of [templates.team.html, templates.reply.html]) for (const c of t.match(/#[0-9A-Fa-f]{6}\b/g)) assert.ok(allowed.has(c.toUpperCase()), c);
});

console.log(`\n${n} tests passed`);
