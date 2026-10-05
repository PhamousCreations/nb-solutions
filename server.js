/**
 * FreshFold Laundry & Cleaning — zero-dependency web server
 * Serves the static site from /public and a small JSON API for bookings.
 *
 *   node server.js            -> http://localhost:3000
 *   PORT=8080 node server.js  -> custom port
 *   ADMIN_KEY=mysecret node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // required so the live preview proxy can reach it
const PUBLIC_DIR = path.join(__dirname, 'public');
// On a host with a persistent disk (Render, Fly, Docker volume) set DATA_DIR to that
// mount path so bookings survive restarts and redeploys. Defaults to ./data locally.
const DATA_FILE = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'bookings.json')
  : path.join(__dirname, 'data', 'bookings.json');
const ADMIN_KEY = process.env.ADMIN_KEY || 'freshfold-admin';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const STATUSES = ['new', 'confirmed', 'picked-up', 'delivered', 'cancelled'];
const SERVICES = ['laundry', 'dry-cleaning', 'ironing', 'home-cleaning', 'deep-cleaning', 'mixed'];

/* ---------------------------------- data ---------------------------------- */

function readBookings() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.bookings || [];
  } catch (err) {
    return [];
  }
}

function writeBookings(list) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ bookings: list }, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function makeRef() {
  const d = new Date();
  const stamp =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FF-${stamp}-${rand}`;
}

/* -------------------------------- helpers --------------------------------- */

function send(res, status, body, type = 'application/json; charset=utf-8') {
  const payload =
    type.startsWith('application/json') && typeof body !== 'string'
      ? JSON.stringify(body)
      : body;
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const str = (v, max = 100) => String(v == null ? '' : v).trim().slice(0, max);

function validateBooking(input) {
  const errors = [];
  const b = {
    name: str(input.name, 80),
    phone: str(input.phone, 24),
    email: str(input.email, 120),
    service: str(input.service, 30),
    area: str(input.area, 60),
    address: str(input.address, 300),
    pickupDate: str(input.pickupDate, 10),
    slot: str(input.slot, 30),
    frequency: str(input.frequency, 30),
    payment: str(input.payment, 20),
    notes: str(input.notes, 600),
    items: [],
  };

  if (b.name.length < 2) errors.push('Please enter your full name.');
  if (!/^[+()\-\s\d]{7,24}$/.test(b.phone)) errors.push('Please enter a valid phone number.');
  if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) errors.push('That email address looks invalid.');
  if (!SERVICES.includes(b.service)) errors.push('Please choose a service.');
  if (b.area.length < 2) errors.push('Please choose your area.');
  if (b.address.length < 5) errors.push('Please give us a pickup address (at least 5 characters).');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.pickupDate)) {
    errors.push('Please choose a pickup date (YYYY-MM-DD).');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(b.pickupDate + 'T00:00:00');
    const max = new Date(today.getTime() + 60 * 864e5);
    if (isNaN(picked.getTime())) errors.push('That pickup date is not valid.');
    else if (picked < today) errors.push('Pickup date cannot be in the past.');
    else if (picked > max) errors.push('Please pick a date within the next 60 days.');
  }
  if (!b.slot) errors.push('Please choose a pickup time window.');

  const rawItems = Array.isArray(input.items) ? input.items.slice(0, 60) : [];
  b.items = rawItems
    .map((it) => ({
      name: str(it && it.name, 60),
      qty: Math.max(1, Math.min(999, parseInt(it && it.qty, 10) || 1)),
    }))
    .filter((it) => it.name);

  return { booking: b, errors };
}

/* ------------------------------- API routes -------------------------------- */

async function handleApi(req, res, url) {
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') return send(res, 204, '');

  // GET /api/health
  if (parts[0] === 'health' && method === 'GET') {
    return send(res, 200, { ok: true, service: 'freshfold-api', time: new Date().toISOString() });
  }

  // POST /api/bookings
  if (parts[0] === 'bookings' && parts.length === 1 && method === 'POST') {
    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      return send(res, 400, { ok: false, error: err.message });
    }
    const { booking, errors } = validateBooking(body);
    if (errors.length) return send(res, 422, { ok: false, errors });

    const record = {
      ref: makeRef(),
      status: 'new',
      createdAt: new Date().toISOString(),
      ...booking,
    };
    const list = readBookings();
    list.unshift(record);
    writeBookings(list);
    console.log(`[booking] ${record.ref} — ${record.name} — ${record.service} — ${record.pickupDate} ${record.slot}`);
    return send(res, 201, { ok: true, ref: record.ref, booking: record });
  }

  // GET /api/bookings?key=...
  if (parts[0] === 'bookings' && parts.length === 1 && method === 'GET') {
    if (url.searchParams.get('key') !== ADMIN_KEY) {
      return send(res, 401, { ok: false, error: 'Missing or invalid admin key.' });
    }
    const list = readBookings();
    const status = url.searchParams.get('status');
    const filtered = status && status !== 'all' ? list.filter((b) => b.status === status) : list;
    return send(res, 200, { ok: true, count: filtered.length, bookings: filtered });
  }

  // POST /api/bookings/:ref/status  { key, status }
  if (parts[0] === 'bookings' && parts[2] === 'status' && method === 'POST') {
    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      return send(res, 400, { ok: false, error: err.message });
    }
    if (body.key !== ADMIN_KEY) return send(res, 401, { ok: false, error: 'Invalid admin key.' });
    if (!STATUSES.includes(body.status)) {
      return send(res, 422, { ok: false, error: 'Unknown status.' });
    }
    const list = readBookings();
    const record = list.find((b) => b.ref === parts[1]);
    if (!record) return send(res, 404, { ok: false, error: 'Booking not found.' });
    record.status = body.status;
    record.updatedAt = new Date().toISOString();
    writeBookings(list);
    return send(res, 200, { ok: true, booking: record });
  }

  return send(res, 404, { ok: false, error: 'Unknown API route.' });
}

/* ------------------------------ static files ------------------------------- */

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  if (!path.extname(rel) && !rel.endsWith('/')) {
    // friendly URLs: /book -> /book.html
    const asHtml = rel + '.html';
    if (fs.existsSync(path.join(PUBLIC_DIR, asHtml.replace(/^\//, '')))) rel = asHtml;
  }
  const filePath = path.join(PUBLIC_DIR, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');

  fs.readFile(filePath, (err, buf) => {
    if (err) {
      const fallback = path.join(PUBLIC_DIR, '404.html');
      fs.readFile(fallback, (e2, page) => {
        if (e2) return send(res, 404, 'Page not found', 'text/plain; charset=utf-8');
        send(res, 404, page, MIME['.html']);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(buf);
  });
}

/* --------------------------------- server ---------------------------------- */

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch((err) => {
      console.error(err);
      send(res, 500, { ok: false, error: 'Server error.' });
    });
    return;
  }
  serveStatic(req, res, url);
});

server.listen(PORT, HOST, () => {
  console.log(`FreshFold site running on http://localhost:${PORT}  (admin key: ${ADMIN_KEY})`);
});
