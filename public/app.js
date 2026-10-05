/* FreshFold — shared front-end logic (no dependencies) */
(function () {
  'use strict';

  const S = window.SITE || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = (n) => S.currency + ' ' + Number(n).toLocaleString('en-GH');

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
      // "phone" in the HTML maps to phoneDisplay in config.js
      phone: S.phoneDisplay,
      phoneDisplay: S.phoneDisplay,
      currency: S.currency,
      email: S.email,
      address: S.address,
      hours: S.hours,
      hoursSunday: S.hoursSunday,
    };
    $$('[data-site]').forEach((el) => {
      const v = map[el.dataset.site];
      if (v != null) el.textContent = v;
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
            <td><strong>${p.name}</strong>${p.note ? `<span class="price-note">${p.note}</span>` : ''}</td>
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

    const areaSel = $('#area');
    if (areaSel) areaSel.innerHTML = '<option value="">Select your area…</option>' + (S.areas || []).map((a) => `<option>${a}</option>`).join('');

    const slotSel = $('#slot');
    if (slotSel) slotSel.innerHTML = '<option value="">Select a window…</option>' + (S.timeSlots || []).map((t) => `<option>${t}</option>`).join('');

    // min pickup date = today (Accra)
    const dateInput = $('#pickupDate');
    if (dateInput) {
      const today = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    }

    const itemsBox = $('#itemRows');
    const prices = S.laundryPrices || [];

    // Service can be a <select id="service"> or radio inputs named "servicePick"
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
          ${prices.map((p) => `<option value="${p.name}" data-price="${p.price}">${p.name}</option>`).join('')}
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
      if (!out) return;
      const service = getService();
      const cleaningOnly = service === 'home-cleaning' || service === 'deep-cleaning';
      if (cleaningOnly) {
        out.innerHTML = `Cleaning jobs are quoted per space — <strong>from ${money(150)}</strong>. We confirm the exact price before we start.`;
        return;
      }
      const total = currentItems().reduce((sum, it) => {
        const p = prices.find((x) => x.name === it.name);
        return sum + (p ? p.price * it.qty : 0);
      }, 0);
      out.innerHTML = total
        ? `Estimated total: <strong>${money(total)}</strong> <span class="muted">— confirmed after we weigh/inspect your items.</span>`
        : 'Add items above and we’ll show a running estimate.';
    }

    addRow({ name: prices[0] ? prices[0].name : 'Wash & fold (per kg)', qty: 5 });
    $('#addItem').addEventListener('click', () => addRow());
    const serviceSel = $('#service');
    if (serviceSel) serviceSel.addEventListener('change', updateEstimate);
    $$('input[name="servicePick"]').forEach((r) => r.addEventListener('change', updateEstimate));
    updateEstimate();

    function showErrors(list) {
      const box = $('#formErrors');
      box.innerHTML = list.map((e) => `<li>${e}</li>`).join('');
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
        items: currentItems(),
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
          `Hi ${S.name}! I just booked a pickup. My reference is ${data.ref} (${payload.service} on ${payload.pickupDate}, ${payload.slot}).`
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
    const state = { key: localStorage.getItem('ff_key') || 'freshfold-admin', bookings: [], filter: 'all', q: '' };
    $('#adminKey').value = state.key;

    const badge = (s) => `<span class="badge badge-${s}">${s.replace('-', ' ')}</span>`;

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
      $('#adminCount').textContent = `${list.length} booking${list.length === 1 ? '' : 's'}`;
      if (!list.length) {
        $('#adminList').innerHTML = `<p class="empty">No bookings here yet. New requests from the website will appear automatically.</p>`;
        return;
      }
      $('#adminList').innerHTML = list
        .map(
          (b) => `<article class="booking-card">
            <header>
              <div><strong>${b.ref}</strong> ${badge(b.status)}</div>
              <time>${new Date(b.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
            </header>
            <p class="bk-main">${b.name} · <a href="tel:${b.phone.replace(/\s/g, '')}">${b.phone}</a></p>
            <p class="bk-sub">${b.service.replace('-', ' ')} · ${b.area} · pickup ${b.pickupDate} (${b.slot}) · pay by ${b.payment}${b.frequency ? ' · ' + b.frequency : ''}</p>
            <p class="bk-sub">${b.address}</p>
            ${b.items && b.items.length ? `<ul class="bk-items">${b.items.map((i) => `<li>${i.qty} × ${i.name}</li>`).join('')}</ul>` : ''}
            ${b.notes ? `<p class="bk-note">“${b.notes}”</p>` : ''}
            <footer>
              ${['new', 'confirmed', 'picked-up', 'delivered', 'cancelled']
                .filter((s) => s !== b.status)
                .map((s) => `<button class="chip" data-ref="${b.ref}" data-status="${s}">Mark ${s.replace('-', ' ')}</button>`)
                .join('')}
              <button class="chip chip-wa" data-wa="${b.phone.replace(/\D/g, '')}" data-ref="${b.ref}">WhatsApp</button>
            </footer>
          </article>`
        )
        .join('');
    }

    async function load() {
      state.key = $('#adminKey').value.trim();
      localStorage.setItem('ff_key', state.key);
      const res = await fetch('/api/bookings?key=' + encodeURIComponent(state.key));
      if (res.status === 401) {
        $('#adminList').innerHTML = `<p class="empty">That admin key wasn’t accepted. Default key is <code>freshfold-admin</code> (change it with the ADMIN_KEY environment variable).</p>`;
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
        window.open('https://wa.me/' + btn.dataset.wa + '?text=' + encodeURIComponent('Hi! This is ' + S.name + ' about your booking ' + btn.dataset.ref + '.'), '_blank');
        return;
      }
      if (!btn.dataset.status) return;
      btn.disabled = true;
      await fetch(`/api/bookings/${btn.dataset.ref}/status`, {
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
