/* N&B Solutions — shared front-end logic (no dependencies) */
(function () {
  'use strict';

  const S = window.SITE || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = (n) => S.currency + ' ' + Number(n).toLocaleString('en-GH');

  /* Escape anything that came from a visitor before putting it in the page.
     Bookings are free text, so this stops someone typing HTML into the form
     and having it run in your staff dashboard. */
  const esc = (v) =>
    String(v == null ? '' : v).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

  function waLink(extra) {
    const text = (extra ? extra + '\n\n' : '') + (S.whatsappMessage || '');
    return 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(text);
  }

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
        const row = el.closest('li') || el.closest('.contact-row');
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

  /* ------------------------------ pricing table ------------------------------ */
  function renderPricing() {
    const tbody = $('#priceRows');
    if (tbody && Array.isArray(S.laundryPrices)) {
      tbody.innerHTML = S.laundryPrices
        .map(
          (p) => `<tr>
            <td><strong>${esc(p.name)}</strong>${p.note ? `<span class="price-note">${esc(p.note)}</span>` : ''}</td>
            <td class="price-cell">${money(p.price)}</td>
          </tr>`
        )
        .join('');
    }
  }

  /* --------------------------------- booking --------------------------------- */
  function initBooking() {
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
    if (slotSel) slotSel.innerHTML = '<option value="">Select a window…</option>' + (S.timeSlots || []).map((t) => `<option>${esc(t)}</option>`).join('');

    const dateInput = $('#pickupDate');
    if (dateInput) {
      const today = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    }

    const itemsBox = $('#itemRows');
    const prices = S.laundryPrices || [];
    const cleaningSet = S.cleaningValues || [];

    // Service can be radio inputs (name="servicePick") or a <select id="service">
    function getService() {
      const sel = $('#service');
      if (sel) return sel.value;
      const picked = document.querySelector('input[name="servicePick"]:checked');
      return picked ? picked.value : 'laundry';
    }

    function addRow(preset) {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <select class="item-name" aria-label="Item type">
          ${prices.map((p) => `<option value="${esc(p.name)}" data-price="${p.price}">${esc(p.name)}</option>`).join('')}
        </select>
        <input class="item-qty" type="number" inputmode="numeric" min="1" max="999" value="1" aria-label="Quantity" />
        <button type="button" class="icon-btn remove-row" aria-label="Remove item">&times;</button>`;
      itemsBox.appendChild(row);
      if (preset) {
        $('.item-name', row).value = preset.name;
        $('.item-qty', row).value = preset.qty;
      }
      row.addEventListener('input', updateEstimate);
      row.addEventListener('change', updateEstimate);
      $('.remove-row', row).addEventListener('click', () => {
        if ($$('.item-row', itemsBox).length > 1) row.remove();
        else {
          $('.item-qty', row).value = 1;
          $('.item-name', row).selectedIndex = 0;
        }
        updateEstimate();
      });
      updateEstimate();
    }

    function currentItems() {
      return $$('.item-row', itemsBox)
        .map((row) => ({
          name: $('.item-name', row).value,
          qty: Math.max(1, parseInt($('.item-qty', row).value, 10) || 1),
        }))
        .filter((i) => i.qty > 0);
    }

    function updateEstimate() {
      const out = $('#estimate');
      const service = getService();
      const isCleaning = cleaningSet.includes(service);

      /* Cleaning is quoted per site, so the item list isn't relevant — hide it
         rather than asking people to fill in a form that doesn't apply. */
      const fs = $('#itemsFieldset');
      if (fs) fs.hidden = isCleaning;

      if (!out) return;
      if (isCleaning) {
        out.innerHTML = 'Cleaning is quoted per site, so there\'s no fixed price list. <strong>Submit this and we\'ll arrange a free assessment</strong>, then send you a written quote.';
        return;
      }
      if (service === 'mixed') {
        out.innerHTML = 'Mixed jobs are priced after we see the details — <strong>laundry by weight or item, cleaning after a free assessment.</strong>';
        return;
      }
      const total = currentItems().reduce((sum, it) => {
        const p = prices.find((x) => x.name === it.name);
        return sum + (p ? p.price * it.qty : 0);
      }, 0);
      out.innerHTML = total
        ? `Estimated total: <strong>${money(total)}</strong> <span class="muted">— confirmed when we weigh and count your items.</span>`
        : 'Add items above and we’ll show a running estimate.';
    }

    if (prices.length) addRow({ name: prices[0].name, qty: 5 });
    $('#addItem').addEventListener('click', () => addRow());
    const serviceSel = $('#service');
    if (serviceSel) serviceSel.addEventListener('change', updateEstimate);
    $$('input[name="servicePick"]').forEach((r) => r.addEventListener('change', updateEstimate));
    updateEstimate();

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
        payment: $('#payment') ? $('#payment').value : 'cash',
        notes: $('#notes').value,
        items: cleaningSet.includes(getService()) ? [] : currentItems(),
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
          `Hello ${S.name}, I've just sent a request through your website. My reference is ${data.ref} (${payload.service} on ${payload.pickupDate}, ${payload.slot}).`
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
      $('#adminCount').textContent = `${list.length} request${list.length === 1 ? '' : 's'}`;
      if (!list.length) {
        $('#adminList').innerHTML = `<p class="empty">No requests here yet. New ones sent from the website will appear automatically.</p>`;
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
            <p class="bk-sub">${esc(String(b.service).replace(/-/g, ' '))} · ${esc(b.area)} · ${esc(b.pickupDate)} (${esc(b.slot)}) · pay by ${esc(b.payment)}${b.frequency ? ' · ' + esc(b.frequency) : ''}</p>
            <p class="bk-sub">${esc(b.address)}</p>
            ${b.items && b.items.length ? `<ul class="bk-items">${b.items.map((i) => `<li>${esc(i.qty)} × ${esc(i.name)}</li>`).join('')}</ul>` : ''}
            ${b.notes ? `<p class="bk-note">“${esc(b.notes)}”</p>` : ''}
            ${b.email ? `<p class="bk-sub">✉ <a href="mailto:${esc(b.email)}">${esc(b.email)}</a></p>` : ''}
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
            encodeURIComponent('Hello, this is ' + (S.name || '') + ' about your request ' + btn.dataset.ref + '.'),
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
    renderPricing();
    initBooking();
    initAdmin();
  });
})();
