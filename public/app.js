/* N&B Solutions — shared front-end logic (no dependencies) */
(function () {
  'use strict';

  const S = window.SITE || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Escape anything that came from a visitor before putting it in the page.
     Enquiries are free text, so this stops someone typing HTML into the form
     and having it run in your staff dashboard. */
  const esc = (v) =>
    String(v == null ? '' : v).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

  function waLink(extra) {
    const text = (extra ? extra + '\n\n' : '') + (S.whatsappMessage || '');
    return 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(text);
  }

  /* Icons for the "who we serve" section, keyed to config.js */
  const SECTOR_ICONS = {
    office:  '<rect x="4" y="3.5" width="10" height="17" rx="1.8"/><path d="M14 9h5.5v11.5"/><path d="M7 7.5h4M7 11h4M7 14.5h4"/><path d="M3 20.5h18"/>',
    hotel:   '<path d="M3 20.5V9.2L12 3.5l9 5.7v11.3z"/><path d="M9.5 20.5v-6h5v6"/><path d="M17.5 6.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    factory: '<path d="M3 20.5V9.8l5 3V9.8l5 3V9.8l5 3V20.5z"/><path d="M18 20.5V5.5h3v15"/><path d="M20 9h.5M20 12.5h.5"/><path d="M2 20.5h20"/>',
    school:  '<path d="M12 3.5 21 8l-9 4.5L3 8z"/><path d="M6 10.2v5.3c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.3"/><path d="M21 8v6"/>',
    home:    '<path d="M3.5 11 12 4.5 20.5 11"/><path d="M5.5 12.5v8h13v-8"/><path d="M10 20.5v-5h4v5"/>',
    event:   '<path d="M8 3.5h8l-1.1 6.2a3 3 0 0 1-5.8 0z"/><path d="M12 12.7v6M9 20.5h6"/><path d="M5 5.5l3.4 1.2M19 5.5l-3.4 1.2"/>',
  };

  /* ----------------------------- config injection ---------------------------- */
  function hydrate() {
    const map = {
      name: S.name,
      fullName: S.fullName,
      tagline: S.tagline,
      founder: S.founder,
      phone: S.phoneDisplay,          // html uses data-site="phone"
      phoneDisplay: S.phoneDisplay,
      whatsappDisplay: S.whatsappDisplay,
      email: S.email,
      address: S.address,
      hours: S.hours,
      hoursSunday: S.hoursSunday,
    };
    $$('[data-site]').forEach((el) => {
      const v = map[el.dataset.site];
      if (v != null && v !== '') el.textContent = v;
    });
    $$('[data-site-href]').forEach((el) => {
      const key = el.dataset.siteHref;
      if (key === 'phone') el.href = 'tel:' + S.phoneRaw;
      if (key === 'email') el.href = 'mailto:' + S.email;
      if (key === 'whatsapp') {
        el.href = waLink();
        el.target = '_blank';
        el.rel = 'noopener';
      }
    });

    /* No email address yet? Hide those rows rather than showing a dead link.
       Add one in config.js and they reappear everywhere automatically. */
    if (!S.email) {
      $$('[data-site="email"], [data-site-href="email"]').forEach((el) => {
        const row = el.closest('li');
        (row || el).hidden = true;
      });
    }

    $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
    document.title = document.title.replace(/%SITE%/g, S.fullName || S.name || '');
  }

  /* --------------------------------- chrome --------------------------------- */
  function chrome() {
    const header = $('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    const toggle = $('.nav-toggle');
    const nav = $('.site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      $$('a', nav).forEach((a) =>
        a.addEventListener('click', () => {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        })
      );
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
        { threshold: 0.12 }
      );
      $$('.reveal').forEach((el) => io.observe(el));
    } else {
      $$('.reveal').forEach((el) => el.classList.add('in'));
    }
  }

  /* ----------------------------- who we serve ------------------------------ */
  function renderSectors() {
    const box = $('#sectorGrid');
    if (!box || !Array.isArray(S.sectors)) return;
    box.innerHTML = S.sectors
      .map((sec) => {
        const path = SECTOR_ICONS[sec.icon] || SECTOR_ICONS.office;
        return `<article class="card reveal">
          <div class="icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>
          </div>
          <h3>${esc(sec.title)}</h3>
          <p>${esc(sec.text)}</p>
        </article>`;
      })
      .join('');
    /* these were injected after the observer ran, so reveal them now */
    $$('.reveal', box).forEach((el) => el.classList.add('in'));
  }

  /* ------------------------------ enquiry form ------------------------------ */
  function initEnquiry() {
    const form = $('#bookingForm');
    if (!form) return;

    /* Service choices come from config.js so this list stays in sync with
       whatever services the business offers. */
    const optsBox = $('#serviceOptions');
    if (optsBox && Array.isArray(S.services)) {
      optsBox.innerHTML = S.services
        .map(
          (s, i) => `<label class="choice">
            <input type="radio" name="servicePick" value="${esc(s.value)}"${i === 0 ? ' checked' : ''} />
            <span>${esc(s.label)}${s.hint ? `<small>${esc(s.hint)}</small>` : ''}</span>
          </label>`
        )
        .join('');
    }

    const areaSel = $('#area');
    if (areaSel) areaSel.innerHTML = '<option value="">Select your area…</option>' + (S.areas || []).map((a) => `<option>${esc(a)}</option>`).join('');

    const slotSel = $('#slot');
    if (slotSel) slotSel.innerHTML = '<option value="">Any time / not sure yet</option>' + (S.timeSlots || []).map((t) => `<option>${esc(t)}</option>`).join('');

    const dateInput = $('#pickupDate');
    if (dateInput) {
      const today = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    }

    // Service can be radio inputs (name="servicePick") or a <select id="service">
    function getService() {
      const sel = $('#service');
      if (sel) return sel.value;
      const picked = document.querySelector('input[name="servicePick"]:checked');
      return picked ? picked.value : 'laundry';
    }

    function showErrors(list) {
      const box = $('#formErrors');
      box.innerHTML = list.map((e) => `<li>${esc(e)}</li>`).join('');
      box.hidden = !list.length;
      if (list.length) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      showErrors([]);
      const btn = $('#submitBtn');
      const payload = {
        name: $('#name').value,
        phone: $('#phone').value,
        email: $('#email').value,
        service: getService(),
        area: $('#area').value,
        address: $('#address').value,
        pickupDate: $('#pickupDate').value,
        slot: $('#slot').value,
        frequency: $('#frequency') ? $('#frequency').value : '',
        notes: $('#notes').value,
        items: [],
      };
      btn.disabled = true;
      const label = btn.textContent;
      btn.textContent = 'Sending…';
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error((data.errors || [data.error || 'Something went wrong.']).join(' '));
        $('#bookingForm').hidden = true;
        const done = $('#success');
        done.hidden = false;
        $('#refOut').textContent = data.ref;
        $('#waConfirm').href = waLink(
          `Hello ${S.name}, I've just sent an enquiry through your website. My reference is ${data.ref} (${payload.service}).`
        );
        done.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        showErrors([err.message + ' You can also reach us on WhatsApp.']);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  /* ---------------------------------- admin ---------------------------------- */
  function initAdmin() {
    const app = $('#adminApp');
    if (!app) return;
    const state = {
      key: localStorage.getItem('nb_key') || 'nb-solutions-admin',
      bookings: [],
      filter: 'all',
      q: '',
    };
    $('#adminKey').value = state.key;

    const badge = (s) => `<span class="badge badge-${esc(s)}">${esc(s).replace('-', ' ')}</span>`;

    function render() {
      const list = state.bookings.filter(
        (b) =>
          (state.filter === 'all' || b.status === state.filter) &&
          (!state.q ||
            [b.ref, b.name, b.phone, b.area, b.service].join(' ').toLowerCase().includes(state.q.toLowerCase()))
      );
      const stats = ['new', 'confirmed', 'picked-up', 'delivered'].map(
        (s) => `<div class="stat"><span class="stat-num">${state.bookings.filter((b) => b.status === s).length}</span><span class="stat-label">${s.replace('-', ' ')}</span></div>`
      );
      $('#adminStats').innerHTML = stats.join('');
      $('#adminCount').textContent = `${list.length} enquir${list.length === 1 ? 'y' : 'ies'}`;
      if (!list.length) {
        $('#adminList').innerHTML = `<p class="empty">No enquiries here yet. New ones sent from the website will appear automatically.</p>`;
        return;
      }
      $('#adminList').innerHTML = list
        .map(
          (b) => `<article class="booking-card">
            <header>
              <div><strong>${esc(b.ref)}</strong> ${badge(b.status)}</div>
              <time>${new Date(b.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
            </header>
            <p class="bk-main">${esc(b.name)} · <a href="tel:${esc(String(b.phone).replace(/\s/g, ''))}">${esc(b.phone)}</a></p>
            <p class="bk-sub">${esc(String(b.service).replace(/-/g, ' '))} · ${esc(b.area)}${b.pickupDate ? ' · ' + esc(b.pickupDate) : ''}${b.slot ? ' (' + esc(b.slot) + ')' : ''}${b.frequency ? ' · ' + esc(b.frequency) : ''}</p>
            <p class="bk-sub">${esc(b.address)}</p>
            ${b.email ? `<p class="bk-sub">✉ <a href="mailto:${esc(b.email)}">${esc(b.email)}</a></p>` : ''}
            ${b.notes ? `<p class="bk-note">“${esc(b.notes)}”</p>` : ''}
            <footer>
              ${['new', 'confirmed', 'picked-up', 'delivered', 'cancelled']
                .filter((s) => s !== b.status)
                .map((s) => `<button class="chip" data-ref="${esc(b.ref)}" data-status="${esc(s)}">Mark ${esc(s).replace('-', ' ')}</button>`)
                .join('')}
              <button class="chip chip-wa" data-wa="${esc(String(b.phone).replace(/\D/g, ''))}" data-ref="${esc(b.ref)}">WhatsApp</button>
            </footer>
          </article>`
        )
        .join('');
    }

    async function load() {
      state.key = $('#adminKey').value.trim();
      localStorage.setItem('nb_key', state.key);
      const res = await fetch('/api/bookings?key=' + encodeURIComponent(state.key));
      if (res.status === 401) {
        $('#adminList').innerHTML = `<p class="empty">That admin key wasn’t accepted. The default is <code>nb-solutions-admin</code> — change it with the ADMIN_KEY environment variable.</p>`;
        $('#adminStats').innerHTML = '';
        return;
      }
      const data = await res.json();
      state.bookings = data.bookings || [];
      render();
    }

    $('#adminLoad').addEventListener('click', load);
    $('#adminSearch').addEventListener('input', (e) => {
      state.q = e.target.value;
      render();
    });
    $$('.filters .chip').forEach((btn) =>
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;
        $$('.filters .chip').forEach((b) => b.classList.toggle('is-active', b === btn));
        render();
      })
    );
    $('#adminList').addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.wa) {
        window.open(
          'https://wa.me/' + btn.dataset.wa + '?text=' +
            encodeURIComponent('Hello, this is ' + (S.name || '') + ' about your enquiry ' + btn.dataset.ref + '.'),
          '_blank'
        );
        return;
      }
      if (!btn.dataset.status) return;
      btn.disabled = true;
      await fetch(`/api/bookings/${encodeURIComponent(btn.dataset.ref)}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: state.key, status: btn.dataset.status }),
      });
      await load();
    });

    load();
  }

  document.addEventListener('DOMContentLoaded', function () {
    hydrate();
    chrome();
    renderSectors();
    initEnquiry();
    initAdmin();
  });
})();
