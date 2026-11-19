const { chromium } = require('playwright');
// Flow 7: ladder → moment → two-minute start → rate → quiet company → how hard was it. SHOTS=<dir> saves screenshots.
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  await ctx.addInitScript(() => { if (!localStorage.getItem('evo.profile.v1')) localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true })); });
  const p = await ctx.newPage(); const U = process.env.BASE_URL || 'http://localhost:3000'; const S = process.env.SHOTS; const log = (m) => console.log(m);
  const shot = async (n) => { if (S) { await p.waitForTimeout(400); await p.screenshot({ path: `${S}/w-${n}.png` }); } };

  await p.goto(U + '/ladder'); await p.waitForURL('**/ladder/build');
  await p.getByLabel('What feels too big').fill('tell Riya why I disappeared'); await p.keyboard.press('Enter');
  await p.getByRole('radio', { name: /Open Riya's chat and type "hey"/, checked: true }).waitFor(); await p.getByText('Evo picked rung 4').waitFor(); await shot('h2'); log('7.2 ladder ok');
  await p.getByRole('button', { name: /Start with this rung/ }).click(); await p.waitForURL('**/ladder/moment');
  await p.getByText(`"After dinner, I'll open Riya's chat and type hey."`).waitFor(); await shot('h3');
  await p.getByRole('switch').click(); await p.getByRole('button', { name: /Set my moment/ }).click(); await p.waitForURL('**/ladder'); log('7.3 moment ok');
  await p.getByText('Open Riya\'s chat and type "hey".').waitFor(); await shot('h1'); log('7.1 two-minute start ok');
  await p.getByRole('button', { name: /Start · 2 min/ }).click(); await p.waitForURL('**/ladder/rate');
  const orb = p.getByRole('button', { name: /Hold to rate/ }); const box = await orb.boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.waitForTimeout(3400); await shot('h4'); await p.mouse.up();
  const n = Number(await p.locator('p[aria-live="polite"]').first().innerText()); if (n < 7) throw new Error('hold did not climb: ' + n); log('7.4 rate ok (' + n + ')');
  await p.getByRole('button', { name: /^Start/ }).click(); await p.waitForURL('**/ladder/do'); await p.getByText('Put your song on').waitFor(); await p.waitForTimeout(1200); await shot('h5');
  await p.getByRole('button', { name: '+2 min' }).click(); await p.getByRole('button', { name: /^Done/ }).click(); await p.waitForURL('**/ladder/done'); log('7.5 quiet company ok');
  await p.getByLabel('How hard it really was').fill('3'); await p.getByText('Much easier than you thought.').waitFor(); await shot('h6');
  await p.getByRole('button', { name: /One more rung/ }).click(); await p.waitForURL('**/ladder/rate');
  await p.waitForFunction(() => { const l = JSON.parse(localStorage.getItem('evo.ladder.v1')); return l.history.length === 1 && l.history[0].actual === 3 && l.current === 2; }); log('7.6 done + next rung ok');
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
