# N&B Solutions — website

Website for **N&B Solutions**, a registered Ghanaian company providing industrial,
commercial and residential **cleaning and laundry services**.

This is a **company profile / portfolio site** rather than a shop. It presents who
N&B Solutions is, what the company does and who it serves, and gives visitors a direct
way to get in touch. There are no published prices — services are discussed and scoped
per client, starting with a free site assessment.

It's still a complete, working site: an enquiry form that saves real messages, and a
staff dashboard to manage them. Built with **zero dependencies** — plain HTML, CSS and
JavaScript on a small Node server. No `npm install`, nothing to keep updated.

---

## Run it

```bash
node server.js
# open http://localhost:3000
```

Optional environment variables:

```bash
PORT=8080 node server.js                 # run on a different port
ADMIN_KEY=my-secret node server.js       # protect the staff dashboard
DATA_DIR=/var/data node server.js        # store requests on a persistent disk
```

Or keep them in a file — copy `.env.example` to `.env` and run
`node --env-file=.env server.js` (needs Node 20.6+). On a hosting platform you'll set
these in their dashboard instead.

| Page | What it does |
|---|---|
| `/` | Home — company profile, services, who we serve, how we work, FAQ, contact |
| `/contact` (`contact.html`) | Contact form — the main call to action on every page |
| `/admin` (`admin.html`) | Staff dashboard — manage incoming enquiries |
| `/api/health` | Quick check that the server is alive |

---

## Your business details

**Confirmed and already on the site:**

| | |
|---|---|
| Company name | N&B Solutions (registered in Ghana) |
| Founder | Benjamin Ansah |
| Phone (calls) | +233 59 613 4611 |
| WhatsApp | +233 55 396 5448 |
| Cleaning services | Deep, industrial, commercial, hotel & guesthouse, move-in/move-out, post-event |
| Laundry services | Washing, ironing, drying, folding, stain treatment |
| Vision / mission | On the About section of the home page |
| Objectives | The six objectives are listed on the About section |

**Still needed from you** — nothing breaks in the meantime, these just improve the site:

- [ ] **Email address** — add it to `public/config.js` (`email: ''`) and the email row
      reappears automatically in the contact section and footer.
- [ ] **Business address / registered office** — currently reads "Greater Accra, Ghana".
- [ ] **Opening hours** — currently "Monday to Saturday".
- [ ] **Real service areas** — the site lists Accra neighbourhoods as a starting set.
      Trim `areas` in `config.js` to what you actually cover, then update the chips on
      the home page contact section.
- [ ] **Registration number** — nice for trust once you have it to hand.
- [ ] **Photographs** — real photos of the team and finished jobs would lift this a lot.
      Ask me and I'll add a gallery section with the images you supply ("before you
      send photos, read the note in *Photographs* below).

---

## Make it yours

Two files cover almost everything:

| File | What lives there |
|---|---|
| `public/config.js` | Contact details, services offered, who you serve, service areas, time slots |
| `public/index.html` | The marketing copy — company description, vision, mission, objectives, FAQ |

**Services and client sectors are driven from `config.js`.** Add, remove or rename an
entry in `services` and the enquiry form updates itself. Add a sector to `sectors` and
a new card appears in the "Who we serve" section. Available icons: `office`, `hotel`,
`factory`, `school`, `home`, `event`.

### config.js

```js
window.SITE = {
  name: 'N&B Solutions',
  founder: 'Benjamin Ansah',
  phoneDisplay: '+233 59 613 4611',   // shown to customers
  phoneRaw: '+233596134611',          // used for click-to-call
  whatsapp: '233553965448',           // country code, no + or spaces
  email: '',                          // add it here when you have one
  ...
};
```

**Services are driven from this file.** Add, remove or rename an entry in the
`services` array and the booking form updates itself. Anything listed in
`cleaningValues` is treated as "quoted per site" — the form hides the laundry
item list for those and asks for an assessment instead.

There is deliberately **no pricing anywhere on the site**. Pricing was removed so that
every enquiry becomes a conversation. If you'd rather show indicative rates for laundry
later, say the word and I'll add a rate card back.

---

## How enquiries work

1. A visitor fills in `/contact` — service needed, where they are, how to reach them,
   and a description of the job. Date and time are optional, so they can simply ask
   you to call.
2. It POSTs to `/api/bookings`, which validates it and saves it to `data/bookings.json`
   with a reference like `NB-261005-AK41`.
3. They see a confirmation with their reference and a one-tap "Send it on WhatsApp too"
   button.
4. You open `/admin` and move the enquiry through:
   **new → confirmed → picked up → delivered** (or cancelled). You can WhatsApp the
   customer straight from the dashboard.

### API reference

```
POST /api/bookings                  create a request (public)
GET  /api/bookings?key=<ADMIN_KEY>  list requests
POST /api/bookings/:ref/status      { "key": "...", "status": "confirmed" }
GET  /api/health
```

### Staff dashboard

Default key: `nb-solutions-admin` — **change this before going live**:

```bash
ADMIN_KEY=a-long-random-password node server.js
```

`data/bookings.json` ships with five sample enquiries (a hotel, an industrial site, a
home deep clean and two laundry jobs) so the dashboard isn't empty when you first look. Delete them when you're ready for real data (keep the
`{"bookings": []}` structure).

That file is in `.gitignore` on purpose: it holds customer names, phone numbers and
addresses, so it never leaves your server. Your deployed site starts with an empty
dashboard, which is exactly what you want.

---

## Before you launch — checklist

- [ ] Set a real admin key: `ADMIN_KEY=... node server.js`
- [ ] Add your email to `config.js`
- [ ] Trim the service areas to what you actually cover
- [ ] Confirm your opening hours and address
- [ ] Replace the five sample enquiries in `data/bookings.json`
- [ ] Update the trust bar on `index.html` once you have real figures to show
- [ ] Ask your first few clients for a short quote, then we can swap the
      "Our promise" section for real testimonials
- [ ] Decide whether to keep the "Staff login" link in the footer (the dashboard is
      protected by `ADMIN_KEY` either way — this just keeps it off the radar)

---

## Hosting

**See [DEPLOY.md](DEPLOY.md) for the full walkthrough** — GitHub push, Render deploy,
custom domain, backups.

| Host | Works how? |
|---|---|
| **Render** | Best fit — runs the Node server as-is. `render.yaml` is included. |
| **Railway** | Connect GitHub. Add a volume at `/data` and set `DATA_DIR=/data`. |
| **Fly.io** | Uses the included `Dockerfile`. Cheapest option that stays awake. |
| **Your own VPS** | `pm2 start server.js` behind nginx. Full control, you handle HTTPS. |
| **Vercel / Netlify** | Static pages yes; the request API needs a database instead of a file. |

⚠️ **Enquiries and free hosting:** on a free instance the disk is wiped on every restart,
so `data/bookings.json` gets cleared — you'd lose enquiries. For a real business use a
persistent disk and set `DATA_DIR` to its mount path (see `render.yaml`). Clients can
always reach you by phone or WhatsApp in the meantime, but don't rely on the dashboard
alone until this is set up.

**Domain in Ghana:** register a `.com` (cheap, works fine) or a `.com.gh`, then point
the DNS record at your host. Render issues free HTTPS automatically.

**Payments:** since there are no prices on the site, payment is settled directly with
each client by MoMo, cash, transfer or monthly invoice. If you later want deposits or
online payment for contract work, Paystack and Flutterwave both support Ghana.

---

## File layout

```
laundry-site/
├── server.js              # Node server: static files + request API
├── package.json
├── render.yaml            # one-click deploy config for Render
├── Procfile               # for Railway / Heroku-style hosts
├── Dockerfile             # for Fly.io, any VPS, or Docker anywhere
├── .env.example           # copy to .env for local secrets
├── DEPLOY.md              # ← full hosting walkthrough
├── data/
│   └── bookings.json      # incoming enquiries (sample data included, gitignored)
├── public/
│   ├── config.js          # ← YOUR DETAILS, SERVICES AND PRICES
│   ├── app.js             # front-end logic: pricing, form, dashboard
│   ├── styles.css         # all styling
│   ├── index.html         # home page  ← marketing copy lives here
│   ├── contact.html       # contact / enquiry page
│   ├── admin.html         # staff dashboard
│   └── 404.html
└── README.md
```

---

## Nice next steps

- **Email or SMS notification** when an enquiry arrives, so you don't have to keep
  the dashboard open
- **A photo gallery** with real images of completed jobs — the single biggest upgrade
  to a portfolio site like this
- **A downloadable company profile (PDF)** to send hotels and offices with a proposal
- Google Business Profile with photos, linking to this site
