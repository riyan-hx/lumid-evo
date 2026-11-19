const { chromium } = require('playwright');
// Flow 8: soft check-in → safety moment → crisis → plan → reach out → rough-day Home → gentle return; ladder reset. SHOTS=<dir> saves screenshots.
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  await ctx.addInitScript(() => { if (!localStorage.getItem('evo.profile.v1')) localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true })); });
  const p = await ctx.newPage(); const U = process.env.BASE_URL || 'http://localhost:3000'; const S = process.env.SHOTS; const log = (m) => console.log(m);
  const shot = async (n) => { if (S) { await p.waitForTimeout(500); await p.screenshot({ path: `${S}/w-${n}.png` }); } };
  const send = async (t) => { await p.getByLabel(/Message Evo/i).fill(t); await p.keyboard.press('Enter'); };

  await p.goto(U + '/chat/live?mode=talk'); await send("I can't keep doing this");
  await p.getByRole('link', { name: /Support/ }).waitFor(); await p.getByText(/make sure you're okay right now/).waitFor(); await shot('s2');
  await p.getByRole('button', { name: "I'm okay, just exhausted" }).click(); await p.getByText(/Calm me first/).first().waitFor(); log('8.2 soft check-in ok');
  await send("I don't want to wake up tomorrow"); await p.waitForURL('**/safety/moment**');
  await p.getByText('Are you safe right now?').waitFor(); await p.getByText("I don't want to wake up tomorrow").waitFor(); await shot('s3');
  if (!(await p.evaluate(() => JSON.parse(localStorage.getItem('evo.safety.v1')).pausedUntil))) throw new Error('not paused'); log('8.3 safety moment ok');
  await p.getByRole('button', { name: "I'm not sure" }).click(); await p.waitForURL('**/crisis');
  await p.getByText('14416', { exact: true }).waitFor(); if (await p.getByRole('link', { name: /In immediate danger/ }).getAttribute('href') !== 'tel:112') throw new Error('112'); await shot('s4'); log('8.4 crisis ok');

  await p.goto(U + '/safety'); await p.getByRole('button', { name: /My warning signs/ }).click();
  await p.getByLabel('My warning signs').fill('Not sleeping, skipping meals'); await p.getByRole('button', { name: 'Save' }).click();
  await p.getByRole('button', { name: /My reason to stay/ }).click(); await p.getByLabel('My reason to stay').fill('My little sister'); await p.getByRole('button', { name: 'Save' }).click();
  await p.getByText('"My little sister"').waitFor(); await shot('s5');
  await p.reload(); await p.getByText('Not sleeping, skipping meals').waitFor(); log('8.5 safety plan ok');

  await p.goto(U + '/safety/reach-out'); await p.getByLabel('Name').fill('Anu'); await p.getByLabel('Who they are to you').fill('Sister'); await p.getByLabel('Phone number').fill('+91 98470 00000');
  await p.getByRole('button', { name: 'Save' }).click(); await p.getByText('Send your ready message?').waitFor(); await p.getByText('Sister · SMS').waitFor(); await shot('s6'); log('8.6 reach out ok');

  await p.goto(U + '/home'); await p.getByText("Let's keep today tiny.").waitFor(); await shot('s1');
  await p.getByRole('button', { name: 'Done' }).click(); await p.getByText('Done. That counts.').waitFor(); log('8.1 rough-day home ok');
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('evo.safety.v1')); s.pausedUntil = new Date(Date.now() - 1000).toISOString(); localStorage.setItem('evo.safety.v1', JSON.stringify(s)); });
  await p.goto(U + '/home'); await p.waitForURL('**/safety/return'); await p.getByText("Glad you're back.").waitFor(); await shot('s8');
  await p.getByRole('link', { name: /A bit better/ }).click(); await p.waitForURL('**/home'); await p.getByText(/Good (morning|afternoon|evening)/).waitFor(); log('8.8 gentle return ok');

  await p.evaluate(() => localStorage.setItem('evo.ladder.v1', JSON.stringify({ goal: 'tell Riya why I disappeared', current: 2, moment: 'After dinner', momentAt: new Date(Date.now() - 2 * 864e5).toISOString(), history: [],
    rungs: [{ text: 'Tell Riya the whole story', dread: 9 }, { text: 'Say "it\'s been a hard month"', dread: 7 }, { text: 'Send "sorry I went quiet"', dread: 5 }, { text: 'Open Riya\'s chat and type "hey"', dread: 3 }, { text: "Look at Riya's last message", dread: 1 }] })));
  await p.goto(U + '/ladder'); await p.waitForURL('**/ladder/reset'); await p.getByText('Lots of people get stuck right here.').waitFor(); await shot('s7');
  await p.getByRole('button', { name: /Do the smaller one/ }).click(); await p.waitForURL('**/ladder'); await p.getByText('Open Riya\'s chat and type "hey".').waitFor(); log('8.7 reset ok');
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
