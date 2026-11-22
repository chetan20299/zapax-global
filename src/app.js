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

  // ---------- Floating buttons step up above the footer's last row, so it never needs extra empty space ----------
  const fabs = $('.fabs'), base = $('.footer-base');
  if (fabs && base && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => fabs.style.setProperty('--lift', en.isIntersecting ? `${base.offsetHeight + 8}px` : '0px')).observe(base);
  }

  // ---------- Product photos: reveal when loaded + in view ----------
  const shots = $$('.shot');
  const io = 'IntersectionObserver' in window && new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -6% 0px' });
  shots.forEach((s) => {
    const img = $('.shot-img', s);
    if (!img) return;
    const cell = s.closest('.cards > li, .gallery > *') || s;
    s.style.setProperty('--d', `${([...cell.parentElement.children].indexOf(cell) % 3) * 0.12}s`); // stagger a row
    s.classList.add('js-shot');
    const done = () => s.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done(); else img.addEventListener('load', done, { once: true });
    if (io) io.observe(s); else s.classList.add('in-view');
  });

  // ---------- Magnifier lens (mouse only): inspect each bowl without opening the viewer ----------
  const ZOOM = 2.4;
  $$('.shot.is-interactive').forEach((s) => {
    const frame = $('.shot-frame', s);
    let lens;
    const move = (e) => {
      const r = frame.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, L = lens.offsetWidth / 2;
      lens.style.transform = `translate(${x - L}px, ${y - L}px)`;
      lens.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
      lens.style.backgroundPosition = `${L - x * ZOOM}px ${L - y * ZOOM}px`;
    };
    frame.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !s.classList.contains('is-loaded')) return;
      if (!lens) {
        lens = document.createElement('span');
        lens.className = 'shot-lens';
        // full-size photo, with the already-loaded one underneath while it arrives
        lens.style.backgroundImage = `url("${s.dataset.full}"), url("${$('.shot-img', s).currentSrc}")`;
        frame.append(lens);
      }
      move(e);
      frame.classList.add('lensing');
    });
    frame.addEventListener('pointermove', (e) => { if (frame.classList.contains('lensing')) move(e); });
    frame.addEventListener('pointerleave', () => frame.classList.remove('lensing'));
  });

  // ---------- Full-screen viewer: zoom, pan, swipe, keyboard, thumbnails ----------
  const items = $$('.shot.is-interactive');
  const lb = items.length && document.createElement('dialog');
  if (lb && lb.showModal) {
    const svg = (d) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></g></svg>`;
    const touch = matchMedia('(hover: none)').matches;
    lb.className = `lb${items.length === 1 ? ' lb-single' : ''}`;
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = `
      <div class="lb-bar"><span class="lb-count"></span><p class="lb-text" aria-live="polite"></p>
        <button class="lb-btn lb-zoom" type="button" aria-pressed="false" aria-label="Zoom in">${svg('M11 4.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM16 16l5 5M8.5 11h5M11 8.5v5')}</button>
        <button class="lb-btn lb-close" type="button" aria-label="Close viewer">${svg('M6 6l12 12M18 6L6 18')}</button></div>
      <div class="lb-stage"><div class="lb-figure"><img class="lb-img" alt="" draggable="false"></div>
        <button class="lb-btn lb-prev" type="button" aria-label="Previous photo">${svg('M15 6l-6 6 6 6')}</button>
        <button class="lb-btn lb-next" type="button" aria-label="Next photo">${svg('M9 6l6 6-6 6')}</button></div>
      <div class="lb-foot"><p class="lb-tip">${touch ? 'Tap to zoom · drag to look around · swipe to browse' : 'Click or scroll to zoom · drag to look around · ← → to browse · Esc to close'}</p><div class="lb-thumbs"></div></div>`;
    // Built now but attached on first open, so its images never load (or count) until someone opens a photo.
    const img = $('.lb-img', lb), fig = $('.lb-figure', lb), stage = $('.lb-stage', lb), zoomBtn = $('.lb-zoom', lb);
    const thumbs = items.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Show photo ${i + 1}: ${s.dataset.caption}`);
      b.innerHTML = `<img src="${s.dataset.thumb}" alt="" loading="lazy">`;
      b.addEventListener('click', () => show(i, i > cur ? 1 : -1));
      $('.lb-thumbs', lb).append(b);
      return b;
    });
    let cur = 0, z = 1, tx = 0, ty = 0, opener = null, token = 0;

    const apply = () => {
      img.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
      lb.classList.toggle('zoomed', z > 1);
      zoomBtn.setAttribute('aria-pressed', String(z > 1));
      zoomBtn.setAttribute('aria-label', z > 1 ? 'Zoom out' : 'Zoom in');
    };
    const clamp = () => { // never pan past the photo's edges
      const r = stage.getBoundingClientRect();
      const mx = Math.max(0, (img.offsetWidth * z - r.width) / 2), my = Math.max(0, (img.offsetHeight * z - r.height) / 2);
      tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
    };
    const zoomTo = (nz, cx, cy) => { // keep the point under the cursor fixed while zooming
      const r = stage.getBoundingClientRect(), ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      if (cx == null) { cx = ox; cy = oy; }
      const qx = (cx - ox - tx) / z, qy = (cy - oy - ty) / z;
      z = Math.max(1, Math.min(4, nz));
      tx = cx - ox - z * qx; ty = cy - oy - z * qy;
      if (z === 1) tx = ty = 0;
      clamp(); apply();
    };
    const show = (i, dir = 0) => {
      cur = (i + items.length) % items.length;
      const s = items[cur], src = $('.shot-img', s), mine = ++token;
      z = 1; tx = ty = 0; apply();
      fig.classList.remove('in');
      fig.style.setProperty('--from', `${dir * 60}px`);
      $('.lb-count', lb).textContent = `${cur + 1} / ${items.length}`;
      $('.lb-text', lb).textContent = s.dataset.caption;
      thumbs.forEach((t, k) => t.setAttribute('aria-current', String(k === cur)));
      thumbs[cur].scrollIntoView({ block: 'nearest', inline: 'center' });
      setTimeout(() => {
        if (mine !== token) return;
        img.sizes = '100vw'; img.srcset = s.dataset.srcset; img.src = src.currentSrc || src.src; img.alt = src.alt;
        (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => { if (mine === token) fig.classList.add('in'); });
      }, lb.classList.contains('open') ? 180 : 0);
      [1, -1].forEach((k) => { const n = items[(cur + k + items.length) % items.length], p = new Image(); p.sizes = '100vw'; p.srcset = n.dataset.srcset; }); // preload neighbours
    };
    const open = (i) => {
      opener = document.activeElement;
      if (!lb.isConnected) document.body.append(lb);
      document.documentElement.classList.add('lb-lock');
      lb.showModal();
      show(i);
      requestAnimationFrame(() => lb.classList.add('open'));
    };
    const close = () => {
      lb.classList.remove('open');
      setTimeout(() => { lb.close(); document.documentElement.classList.remove('lb-lock'); opener?.focus({ preventScroll: true }); }, reduced ? 0 : 280);
    };

    items.forEach((s, i) => $('.shot-open', s).addEventListener('click', () => open(i)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(cur - 1, -1));
    $('.lb-next', lb).addEventListener('click', () => show(cur + 1, 1));
    zoomBtn.addEventListener('click', () => zoomTo(z > 1 ? 1 : 2.5));
    lb.addEventListener('cancel', (e) => { e.preventDefault(); close(); }); // Esc: animate out
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(cur + 1, 1);
      else if (e.key === 'ArrowLeft') show(cur - 1, -1);
      else if (e.key === '+' || e.key === '=') zoomTo(z * 1.5);
      else if (e.key === '-') zoomTo(z / 1.5);
      else if (e.key === '0') zoomTo(1);
      else return;
      e.preventDefault();
    });
    stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomTo(z * (e.deltaY < 0 ? 1.25 : 0.8), e.clientX, e.clientY); }, { passive: false });

    // One pointer handler: tap = zoom toggle (or close on the empty backdrop), drag = pan when zoomed, swipe = browse
    // ponytail: no pinch-zoom; tap-to-zoom + drag covers touch. Add a two-pointer pinch if buyers ask for it.
    let drag = null;
    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      drag = { x: e.clientX, y: e.clientY, tx, ty, moved: false, onImg: e.target === img }; // pointer capture retargets later events
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 6) { drag.moved = true; lb.classList.add('dragging'); }
      if (!drag.moved) return;
      if (z > 1) { tx = drag.tx + dx; ty = drag.ty + dy; clamp(); apply(); }
      else fig.style.translate = `${dx}px 0`;
    });
    const end = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, onImg = drag.onImg;
      lb.classList.remove('dragging');
      fig.style.translate = '';
      if (!drag.moved) { if (onImg) zoomTo(z > 1 ? 1 : 2.5, e.clientX, e.clientY); else if (z === 1) close(); }
      else if (z === 1 && Math.abs(dx) > 60 && items.length > 1) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      drag = null;
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    addEventListener('resize', () => { if (lb.open) { clamp(); apply(); } });
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

  // EximFlow dashboard: save a copy of the inquiry (Firestore REST, create-only). Never blocks or breaks the
  // normal email flow; keepalive lets it finish even if the page opens the email app or navigates away.
  const CRM_FIELDS = { name: 150, company: 150, email: 150, country: 80, phone: 30, product: 120, quantity: 100, destination_port: 100, message: 4000 };
  const saveToCrm = (url, data) => {
    if (!url) return;
    const fields = { createdAt: { timestampValue: new Date().toISOString() }, source: { stringValue: location.hostname.slice(0, 100) }, page: { stringValue: location.pathname.slice(0, 300) } };
    for (const [k, max] of Object.entries(CRM_FIELDS)) {
      const v = String(data.get(k) ?? '').trim().slice(0, max);
      if (v) fields[k === 'destination_port' ? 'port' : k] = { stringValue: v };
    }
    fetch(url, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) }).catch(() => {});
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
    saveToCrm(form.dataset.crm, new FormData(form));
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
