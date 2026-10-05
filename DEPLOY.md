# Putting FreshFold online

From this folder to a live website with your own domain. About 15 minutes.

You'll need a free [GitHub](https://github.com) account. Everything after that is free too
until you're ready to pay for the persistent-disk upgrade (about $7/month).

---

## Step 1 — Push to GitHub

### If you downloaded the zip (it already contains the git history)

Unzip it, open a terminal in the folder, and run:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

Then create an **empty** repository on GitHub (no README, no .gitignore — click
"New repository", name it `freshfold-laundry`, and leave everything else blank).
GitHub will show you a page with commands; you only need these two:

```bash
git remote add origin https://github.com/YOUR-USERNAME/freshfold-laundry.git
git push -u origin main
```

### If you'd rather start the history fresh

```bash
git init -b main
git config user.name "Your Name"
git config user.email "you@example.com"
git add .
git commit -m "FreshFold laundry and cleaning website"
git remote add origin https://github.com/YOUR-USERNAME/freshfold-laundry.git
git push -u origin main
```

> **Using GitHub Desktop instead?** File → Add local repository → point at this folder →
> Publish repository. Same result, no terminal.

If git asks for a password, it wants a **personal access token**, not your GitHub password.
Create one at GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic),
with the `repo` scope. Paste it in place of the password.

---

## Step 2 — Deploy on Render

[Render](https://render.com) is the easiest fit: it runs the Node server exactly as-is.

1. Sign up with your GitHub account.
2. Click **New +** → **Blueprint**.
3. Pick your `freshfold-laundry` repository. Render finds `render.yaml` and shows the plan.
4. Click **Apply**. Your site builds and goes live at something like
   `https://freshfold-laundry.onrender.com`.
5. Go to **Environment** and copy the `ADMIN_KEY` value Render generated. That's the
   password for your staff dashboard at `/admin`.

**Important — the free plan forgets bookings when it restarts.** Render's free instances
sleep after 15 minutes idle and get a fresh disk on every restart, which wipes
`data/bookings.json`. Two options:

- **Testing / demos:** leave it. Fine to show people the site.
- **Real business:** upgrade the instance to Starter (~$7/month) and uncomment the `disk:`
  block at the bottom of `render.yaml` (it also sets `DATA_DIR`, which tells the server to
  write to the disk). Then redeploy. Bookings now survive everything.

### Alternative hosts

| Host | How | Notes |
|---|---|---|
| **Railway** | New Project → Deploy from GitHub | Detects Node automatically. Add a volume mounted at `/data` and set `DATA_DIR=/data`. |
| **Fly.io** | `fly launch` (it reads the Dockerfile), then `fly volumes create data` | Genuinely cheap, more setup. Good if you like tinkering. |
| **Your own VPS** | `git clone`, then `pm2 start server.js` behind nginx | Full control. Needs you to handle HTTPS (use Let's Encrypt/Certbot). |
| **Vercel / Netlify** | Not directly — see below | They don't run a long-lived Node server, and their filesystem is read-only. |

### Why not Vercel?

Vercel is excellent for static sites, but this project saves bookings to a file on the
server. Vercel has no writable disk — and its functions can't share state. To run on Vercel
you'd swap the JSON file for a hosted database (Supabase or Turso are both free to start),
which is a different piece of work. Ask me and I'll do it — it also makes the site
multi-user safe, which is worth it once orders get busy.

---

## Step 3 — Your own domain

1. Buy a `.com` (about $12/year from Namecheap or Porkbun) or a `.com.gh` from a local
   registrar. `.com` is cheaper and works fine for a Ghana business.
2. In Render: your service → **Settings** → **Custom Domains** → add `freshfold.gh`
   (or whatever you bought).
3. Render shows you a CNAME or A record. Add it where you bought the domain, in their
   DNS settings. Wait 10–60 minutes.
4. Render issues a free HTTPS certificate automatically. Done.

---

## Step 4 — Set your real details

On your computer, edit **`public/config.js`** — your name, phone, WhatsApp number, email,
address, service areas and prices all live there. Then:

```bash
git add .
git commit -m "Use real business details"
git push
```

Render redeploys automatically within a minute. That's the workflow from now on:
**edit → commit → push → live.**

---

## Step 5 — Before you tell customers

- [ ] `ADMIN_KEY` changed to something strong (Render's generated one is good)
- [ ] Real details in `public/config.js`
- [ ] Sample bookings cleared (open `/admin`, or delete `data/bookings.json` on the server)
- [ ] Test a real booking: submit the form, confirm it appears in `/admin`
- [ ] Check the WhatsApp button opens *your* chat with the message pre-filled
- [ ] Visit the site on your phone — most of your customers will be on mobile
- [ ] Remove the "Staff login" link from the footer in `index.html` if you don't want it public
      (the dashboard is still protected by `ADMIN_KEY`, this just keeps it off the radar)

---

## Updating the live site

Every push to `main` redeploys automatically:

```bash
git add .
git commit -m "what you changed"
git push
```

To roll back, Render keeps your deploy history — pick an earlier one and hit **Redeploy**.

---

## Backing up bookings

`data/bookings.json` is the only file with irreplaceable data in it. Download it from the
dashboard occasionally (Render → Shell → `cat /var/data/bookings.json`), or ask me to add
an "Export CSV" button to the staff dashboard.
