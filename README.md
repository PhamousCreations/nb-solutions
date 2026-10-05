# FreshFold — Laundry & Cleaning website

A complete, working website for a laundry and cleaning business in Accra: marketing pages,
a booking form that saves real orders, and a staff dashboard to manage them.

Built with **zero dependencies** — plain HTML, CSS and JavaScript on a small Node server.
No `npm install`, nothing to keep updated.

---

## 1. Run it

```bash
cd laundry-site
node server.js
# open http://localhost:3000
```

Optional environment variables:

```bash
PORT=8080 node server.js                 # run on a different port
ADMIN_KEY=my-secret node server.js       # protect the staff dashboard
```

Pages:

| Page | What it does |
|---|---|
| `/` | Home — hero, services, how it works, pricing, reviews, FAQ, contact |
| `/book` (`book.html`) | Booking form with item list and live price estimate |
| `/admin` (`admin.html`) | Staff dashboard — view and update bookings |
| `/api/health` | Quick check that the server is alive |

---

## 2. Make it yours (5 minutes)

Everything editable lives in **`public/config.js`** — one file, no other code to touch.

```js
window.SITE = {
  name: 'FreshFold',                       // ← your business name
  fullName: 'FreshFold Laundry & Cleaning',
  phoneDisplay: '+233 20 000 0000',        // ← shown to customers
  phoneRaw: '+233200000000',               // ← used for click-to-call
  whatsapp: '233200000000',                // ← country code, no + or spaces
  email: 'hello@freshfold.gh',
  address: '12 Ring Road Central, Accra',
  ...
  laundryPrices: [ ... ]                   // ← prices feed the table AND the booking form
};
```

Every value marked **PLACEHOLDER** in that file is sample data I invented — swap in your real
details. Changes appear everywhere at once (header buttons, footer, booking form, WhatsApp links).

> Edit `laundryPrices` once and both the pricing table and the booking form's item
> dropdown + live estimate update together.

---

## 3. How bookings work

1. A customer fills in `/book`. The form calculates a live estimate from your price list.
2. On submit it POSTs to `/api/bookings`, which validates the data and saves it to
   `data/bookings.json` with a reference like `FF-261005-AK41`.
3. The customer sees a confirmation screen with their reference and a one-tap
   "Confirm on WhatsApp" button.
4. You open `/admin`, see the new booking, and move it through:
   **new → confirmed → picked up → delivered** (or cancelled). You can also WhatsApp
   the customer directly from the dashboard.

### API reference

```
POST /api/bookings                  create a booking (public)
GET  /api/bookings?key=<ADMIN_KEY>  list bookings
POST /api/bookings/:ref/status      { "key": "...", "status": "confirmed" }
GET  /api/health
```

### Admin dashboard

Default key: `freshfold-admin` (change it before going live — see below).
Bookings are stored in `data/bookings.json`, which comes pre-loaded with 3 sample
orders so the dashboard isn't empty. Delete them when you're ready for real data
(keep the `{"bookings": []}` structure).

---

## 4. Before you launch — checklist

- [ ] Replace every PLACEHOLDER in `public/config.js` (name, phone, WhatsApp, email, address)
- [ ] Update prices in `laundryPrices`
- [ ] Update the service areas list
- [ ] Replace the sample bookings in `data/bookings.json`
- [ ] Set a real admin key: `ADMIN_KEY=... node server.js`
- [ ] Replace the sample trust-bar numbers and testimonials on `index.html` with your real ones
- [ ] Don't link `admin.html` publicly if you'd rather keep it hidden (there's a small
      "Staff login" link in the footer you can delete)
- [ ] Add your own domain, and point a real email address

---

## 5. Hosting (turning this into your live site)

**See [DEPLOY.md](DEPLOY.md) for the full step-by-step walkthrough** — GitHub push,
Render deploy, custom domain, and the backup checklist.

Short version:

| Host | Works how? |
|---|---|
| **Render** | Best fit — runs the Node server as-is. `render.yaml` is included; just connect the repo. |
| **Railway** | Connect GitHub. Add a volume at `/data` and set `DATA_DIR=/data`. |
| **Fly.io** | Uses the included `Dockerfile`. Cheapest option that stays awake. |
| **Your own VPS** | `pm2 start server.js` behind nginx. Full control, you handle HTTPS. |
| **Vercel / Netlify** | Static pages yes; the booking API needs a database instead of a file. |

⚠️ **Bookings and free hosting:** on a free instance the disk is wiped on every restart, so
`data/bookings.json` gets cleared. For a real business, use a persistent disk and set
`DATA_DIR` to its mount path (see `render.yaml`).

**Getting a domain in Ghana:** register a `.com` (cheap, works fine) or a `.com.gh`, then
point the DNS record at your host. Render gives you free HTTPS automatically.

**Payments:** the site records the order and lets you collect by MoMo/cash. To take payment
online you'd add a Paystack or Flutterwave account (both support Ghana) and call their
checkout from the success screen — happy to wire that up when you're ready.

---

## 6. File layout

```
laundry-site/
├── server.js              # Node server: static files + booking API
├── package.json
├── render.yaml            # one-click deploy config for Render
├── Procfile               # for Railway / Heroku-style hosts
├── Dockerfile             # for Fly.io, any VPS, or Docker anywhere
├── .env.example           # copy to .env for local secrets
├── DEPLOY.md              # ← full hosting walkthrough
├── data/
│   └── bookings.json      # your orders live here (sample data included, gitignored)
├── public/
│   ├── config.js          # ← YOUR BUSINESS DETAILS (edit this)
│   ├── app.js             # front-end logic: pricing, booking form, admin
│   ├── styles.css         # all styling
│   ├── index.html         # home page
│   ├── book.html          # booking page
│   ├── admin.html         # staff dashboard
│   └── 404.html
└── README.md
```

---

## 7. Nice next steps

- Email/SMS notification to you and the customer when a booking is created
- Paystack / Flutterwave online payment or deposits
- Customer order tracking page (enter your reference → see status)
- Real photography instead of the illustrations
- Google Business Profile + WhatsApp Business catalogue, linking to this site
