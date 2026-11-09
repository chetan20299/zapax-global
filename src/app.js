(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Navigation ----------
  const toggle = $('.nav-toggle');
  const list = $('#nav-list');
  const menus = $$('.menu-btn');
  const closeMenus = (except) => menus.forEach((b) => b !== except && b.setAttribute('aria-expanded', 'false'));
  const setNav = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    list.classList.toggle('open', open);
  };

  toggle?.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  menus.forEach((btn) =>
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      closeMenus(btn);
      btn.setAttribute('aria-expanded', String(open));
    }),
  );
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-menu')) closeMenus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = menus.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (open) { closeMenus(); open.focus(); }
    else if (toggle?.getAttribute('aria-expanded') === 'true') { setNav(false); toggle.focus(); }
  });
  // Close a desktop dropdown when focus leaves it.
  $$('.has-menu').forEach((li) =>
    li.addEventListener('focusout', (e) => {
      if (!li.contains(e.relatedTarget)) closeMenus();
    }),
  );
  matchMedia('(min-width: 980px)').addEventListener('change', () => { setNav(false); closeMenus(); });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- First-visit loader: hide once the page has loaded (short minimum so the facts can be read) ----------
  const loader = $('#loader');
  if (loader && !loader.hidden) {
    const hide = () => {
      setTimeout(() => {
        loader.classList.add('done');
        document.documentElement.classList.remove('is-loading');
        setTimeout(() => loader.remove(), 400);
      }, Math.max(0, (reduced ? 500 : 1300) - performance.now()));
    };
    if (document.readyState === 'complete') hide(); else addEventListener('load', hide, { once: true });
  }

  // ---------- Progress bar while the next page loads ----------
  const bar = $('.nav-progress');
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !bar || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(a.href, location.href);
    if (a.target || a.hasAttribute('download') || url.origin !== location.origin || /\.(pdf|xml|png)$/i.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same-page anchors
    bar.classList.add('go');
  });
  addEventListener('pageshow', () => bar?.classList.remove('go')); // back/forward cache

  // ---------- Back to top ----------
  const topBtn = $('.to-top');
  if (topBtn) {
    const onScroll = () => { topBtn.hidden = scrollY < 600; };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    topBtn.addEventListener('click', () => {
      scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      $('.brand')?.focus({ preventScroll: true });
    });
  }

  // ---------- Inquiry form ----------
  const form = $('#inquiry');
  if (!form) return;
  const status = $('.form-status', form);
  const submit = $('button[type="submit"]', form);
  const startedAt = Date.now();

  // Preselect product from ?product=slug
  const slug = new URLSearchParams(location.search).get('product');
  if (slug) {
    const opt = $(`#f-product option[data-slug="${CSS.escape(slug)}"]`);
    if (opt) opt.selected = true;
  }

  const messages = {
    name: 'Enter your full name.',
    company: 'Enter your company name.',
    email: 'Enter a valid business email address, like name@company.com.',
    country: 'Select your country.',
    product: 'Select the product you are interested in.',
    phone: 'Enter a phone number using digits, spaces, + or -.',
  };

  const showError = (el, msg) => {
    const err = $(`#${el.id}-error`);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.textContent = msg || ''; err.hidden = !msg; }
  };

  const validate = (el) => {
    const v = el.value.trim();
    let msg = '';
    if (el.required && !v) msg = messages[el.name] || 'This field is required.';
    else if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = messages.email;
    else if (el.type === 'tel' && v && !/^[+()\d\s.-]{6,30}$/.test(v)) msg = messages.phone;
    showError(el, msg);
    return !msg;
  };

  const fields = $$('input:not([type="hidden"]):not([name="website"]), select, textarea', form);
  fields.forEach((el) => {
    el.addEventListener('blur', () => { if (el.value || el.getAttribute('aria-invalid') === 'true') validate(el); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
  });

  const setStatus = (type, html, focus = true) => {
    status.className = `form-status${type ? ` is-${type}` : ''}`;
    status.innerHTML = html;
    if (type && focus) status.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = fields.filter((el) => !validate(el));
    if (invalid.length) {
      setStatus('error', `<p>Please correct ${invalid.length === 1 ? 'the highlighted field' : `the ${invalid.length} highlighted fields`} and send again.</p>`, false);
      invalid[0].focus();
      return;
    }
    // Spam checks: honeypot filled, or submitted faster than a person can type.
    if (form.website.value || Date.now() - startedAt < 3000) {
      setStatus('success', '<h2>Inquiry sent</h2><p>Thank you. Our team will reply by email.</p>');
      return;
    }

    const endpoint = form.dataset.endpoint;
    const email = form.dataset.email;
    const phone = form.dataset.phone;
    const wa = form.dataset.wa;
    const data = new FormData(form);
    data.set('started', String(startedAt));
    const fallback = [wa && `<a href="${wa}" target="_blank" rel="noopener">WhatsApp us</a>`, phone && `call ${phone}`, email && `email <a href="mailto:${email}">${email}</a>`].filter(Boolean).join(', ');

    if (!endpoint) {
      if (!email) {
        setStatus('error', '<p>Online inquiries are not available right now. Please try again later.</p>');
        return;
      }
      const body = [...data].filter(([k]) => !k.startsWith('_')).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join('\n');
      location.href = `mailto:${email}?subject=${encodeURIComponent(`Inquiry: ${data.get('product')}`)}&body=${encodeURIComponent(body)}`;
      setStatus('success', '<h2>Your email app is opening</h2><p>Your inquiry has been copied into a new email. Send it from your email app to reach our team.</p>');
      return;
    }

    const buyer = String(data.get('email'));
    submit.disabled = true;
    submit.innerHTML = '<span class="spinner" aria-hidden="true"></span>Sending…';
    form.setAttribute('aria-busy', 'true');
    setStatus('', '');
    try {
      // Netlify Forms: url-encoded POST to the site; it stores the submission and emails the team (no buyer confirmation).
      const netlify = endpoint === 'netlify';
      const res = netlify
        ? await fetch('/', { method: 'POST', body: new URLSearchParams(data), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        : await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const body = netlify ? { confirmation: false } : await res.json().catch(() => ({}));
      if (res.status === 400 && body.fields) {
        body.fields.forEach((f) => { const el = form.elements[f === 'destination_port' ? 'destination_port' : f]; if (el) showError(el, messages[f] || 'Please check this field.'); });
        setStatus('error', '<p>Please check the highlighted fields and send again.</p>');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
      setStatus('success', `<h2>Inquiry sent</h2><p>Thank you. Our team will contact you shortly.${body.confirmation === false ? '' : ` A confirmation has been sent to <strong>${esc(buyer)}</strong>. Please check your spam folder if you do not see it.`}</p>`);
    } catch {
      setStatus('error', `<p>Your inquiry could not be sent. Please try again${fallback ? `, or ${fallback}` : ''}.</p>`);
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send inquiry';
      form.removeAttribute('aria-busy');
    }
  });
})();
