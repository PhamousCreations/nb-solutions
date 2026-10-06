#!/usr/bin/env node
/**
 * Check the email alert setup for N&B Solutions.
 *
 *   node --env-file=.env check-email-setup.js
 *
 * Verifies, in order:
 *   1. the provider and key are set
 *   2. the key is accepted by the provider
 *   3. which sender addresses are verified on the account
 *   4. whether the provider will accept mail from where you are running this
 *   5. sends one test email, if everything above is satisfied
 *
 * It never sends a test unless steps 1-4 all pass, and it explains exactly
 * what to fix when something is wrong.
 */

const PROVIDER = (process.env.NOTIFY_PROVIDER || '').toLowerCase();
const KEY = process.env.NOTIFY_API_KEY || '';
const FROM = process.env.NOTIFY_FROM || '';
const TO = (process.env.NOTIFY_TO || '').split(',').map((s) => s.trim()).filter(Boolean);

const ok = (m) => console.log('  \x1b[32m✓\x1b[0m ' + m);
const bad = (m) => console.log('  \x1b[31m✗\x1b[0m ' + m);
const info = (m) => console.log('    ' + m);
const step = (n, m) => console.log(`\n[${n}] ${m}`);

async function api(path, init = {}) {
  const url = PROVIDER === 'brevo' ? `https://api.brevo.com/v3${path}` : `https://api.resend.com${path}`;
  const headers =
    PROVIDER === 'brevo'
      ? { 'api-key': KEY, accept: 'application/json', ...(init.headers || {}) }
      : { authorization: `Bearer ${KEY}`, ...(init.headers || {}) };
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { res, json };
}

(async () => {
  console.log('\nN&B Solutions — email alert setup check\n' + '─'.repeat(44));

  /* 1 ─ configuration present */
  step(1, 'Configuration');
  if (!PROVIDER) return bad('NOTIFY_PROVIDER is not set (use "brevo" or "resend")');
  if (!KEY) return bad('NOTIFY_API_KEY is not set');
  ok(`provider "${PROVIDER}"`);
  ok(`key length ${KEY.length} chars, starts "${KEY.slice(0, 8)}…"`);
  if (!FROM) info('NOTIFY_FROM is not set yet — will check it below.');
  if (!TO.length) info('NOTIFY_TO is not set yet — where should the alerts go?');
  if (FROM && TO.length) ok(`sending from ${FROM}, alerts to ${TO.join(', ')}`);

  /* 2 ─ is the key accepted? */
  step(2, 'Is the key accepted?');
  let account;
  try {
    account = await api(PROVIDER === 'brevo' ? '/account' : '/domains');
  } catch (err) {
    return bad(`Could not reach ${PROVIDER}: ${err.message} — check your internet connection.`);
  }

  const msg = String(account.json.message || '');
  const isIpIssue = /unrecognised IP|unauthorized_ip|IP address/i.test(msg);

  if (account.res.ok) {
    ok('key is valid and accepted');
  } else if (isIpIssue) {
    // The key itself is fine; the provider is blocking this location.
    console.log('  \x1b[33m!\x1b[0m The key works, but the provider is blocking this IP address:');
    info(`"${msg.slice(0, 120)}…"`);
    console.log('\n  This is not a problem with your key or with this project. It is a');
    console.log('  security setting on your provider account, and it WILL also block');
    console.log('  alerts from your live website — hosting platforms change IP address');
    console.log('  on every deploy, so allow-listing one address does not hold.\n');
    if (PROVIDER === 'brevo') {
      console.log('  Fix it here:  https://app.brevo.com/security/authorised_ips');
      console.log('  Turn OFF the "Authorised IPs" restriction, then run this again.');
    }
    console.log('\n  Meanwhile the website still works: every enquiry is saved to the');
    console.log('  dashboard, and the visitor sees their confirmation as normal.');
    process.exit(1);
  } else {
    bad(`key rejected (HTTP ${account.res.status}): ${msg || JSON.stringify(account.json).slice(0, 200)}`);
    info('Create a fresh key and update NOTIFY_API_KEY. If you ever pasted this');
    info('key somewhere public, delete it in the provider dashboard first.');
    process.exit(1);
  }

  if (!FROM || !TO.length) {
    console.log('\n  The key is good, but the setup is not finished.');
    if (!FROM) info('Set NOTIFY_FROM to an address you verified in the provider dashboard.');
    if (!TO.length) info('Set NOTIFY_TO to the inbox where alerts should arrive.');
    process.exit(1);
  }

  /* 3 ─ verified senders */
  step(3, 'Verified sender addresses');
  if (PROVIDER === 'brevo') {
    const { json } = await api('/senders');
    const senders = json.senders || [];
    if (!senders.length) {
      bad('No senders on the account yet.');
      info('Brevo -> Settings -> Senders & IPs -> Add a sender, then click the');
      info('confirmation link Brevo emails you, and set NOTIFY_FROM to it.');
      process.exit(1);
    }
    senders.forEach((s) => ok(`${s.email}${s.active ? '' : '  (inactive — not yet confirmed)'}`));
    const match = senders.find((s) => s.active && s.email.toLowerCase() === FROM.toLowerCase());
    if (!match) {
      bad(`NOTIFY_FROM (${FROM}) is not one of the confirmed senders above.`);
      info('Brevo will refuse to send from an unverified address.');
      process.exit(1);
    }
    ok(`NOTIFY_FROM (${FROM}) is verified and active`);
  }

  /* 4 ─ send a test */
  step(4, 'Sending a test email');
  const subject = 'N&B Solutions — test alert';
  const body =
    'This is a test from check-email-setup.js.\n\n' +
    'If you are reading this, your website will email you every time a new\n' +
    'enquiry arrives. Nothing else to do.\n';

  let sent;
  if (PROVIDER === 'brevo') {
    sent = await api('/smtp/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: FROM, name: 'N&B Solutions website' },
        to: TO.map((email) => ({ email })),
        subject,
        textContent: body,
      }),
    });
  } else {
    sent = await api('/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: TO, subject, text: body }),
    });
  }

  if (sent.res.ok) {
    ok(`test email accepted by ${PROVIDER}`);
    info(`Check the inbox for ${TO.join(', ')} — including the spam folder.`);
    console.log('\n  Setup complete. Start the site with:');
    console.log('      node --env-file=.env server.js\n');
  } else {
    bad(`send failed (HTTP ${sent.res.status}): ${sent.json.message || JSON.stringify(sent.json).slice(0, 200)}`);
    process.exit(1);
  }
})();
