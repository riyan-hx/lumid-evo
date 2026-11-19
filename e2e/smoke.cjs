const { chromium } = require('playwright');
const fs = require('fs');
// Opens every route with a seeded user; fails on page errors, React errors, broken images or failed same-origin requests.
(async () => {
  const path = require('path');
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name === 'page.tsx' ? [d] : []));
  const app = path.join(__dirname, '../src/app');
  const routes = walk(app).map((d) => '/' + path.relative(app, d).split(path.sep).filter((s) => !/^\(.*\)$/.test(s)).join('/')).filter((r) => r !== '/dev/ui' && !r.includes('[')).sort();
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, timezoneId: process.env.TZID || 'Asia/Kolkata' });
  await ctx.addInitScript(() => {
    if (localStorage.getItem('e2e.seeded')) return;
    localStorage.setItem('e2e.seeded', '1');
    const d = (n) => new Date(Date.now() - n * 864e5).toISOString();
    localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true, phone: '9876543210', ageBand: '18-24' }));
    localStorage.setItem('evo.checkins.v1', JSON.stringify(Array.from({ length: 12 }, (_, i) => ({ id: 'c' + i, at: d(i), style: 'classic', feeling: i % 3 ? 'Anxious' : 'Calm', intensity: 60, causes: ['Work'] }))));
    localStorage.setItem('evo.ladder.v1', JSON.stringify({ goal: 'tell Riya', current: 3, rungs: [{ text: 'a', dread: 9 }, { text: 'b', dread: 7 }, { text: 'c', dread: 5 }, { text: 'd', dread: 3 }, { text: 'e', dread: 1 }], history: [{ text: 'd', expected: 6, actual: 3, at: d(1) }] }));
    localStorage.setItem('evo.clinician.v1', JSON.stringify({ clinician: { code: 'MEERA-4K2', name: 'Dr. Meera R.', short: 'Dr. Meera', first: 'Meera', title: 'Clinical psychologist', city: 'Kozhikode' }, sharing: { mood: true, steps: true, chats: false }, connectedAt: d(3) }));
  });
  const U = process.env.BASE_URL || 'http://localhost:3000'; const bad = [];
  for (const r of routes) {
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource: net::ERR_INTERNET|navigator.vibrate/.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
    p.on('requestfailed', (q) => { if (q.url().startsWith(U) && !/_rsc=|__nextjs/.test(q.url())) errs.push('requestfailed: ' + q.url().replace(U, '')); });
    p.on('response', (s) => { if (s.url().startsWith(U) && s.status() >= 400) errs.push(`${s.status()}: ${s.url().replace(U, '')}`); });
    try { await p.goto(U + r, { waitUntil: 'networkidle', timeout: 20000 }); } catch (e) { errs.push('goto: ' + e.message.split('\n')[0]); }
    await p.waitForTimeout(300);
    const broken = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && !i.src.startsWith('data:')).map((i) => i.getAttribute('src')));
    broken.forEach((s) => errs.push('broken img: ' + s));
    const text = await p.evaluate(() => document.body.innerText);
    if (/Application error|Unhandled Runtime Error|This page could not be found/.test(text)) errs.push('error page shown');
    if (errs.length) bad.push([r, [...new Set(errs)]]);
    await p.close();
  }
  for (const [r, e] of bad) console.log('✗', r, '\n   ' + e.join('\n   '));
  console.log(`${routes.length - bad.length}/${routes.length} screens clean`);
  await b.close(); process.exit(bad.length ? 1 : 0);
})();
