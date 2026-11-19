const { chromium } = require('playwright');
// 4.1 toolkit → thought record 4.2–4.8, prefilled from a chat. SHOTS=<dir> also saves a screenshot per step.
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  await ctx.addInitScript(() => {
    if (localStorage.getItem('evo.chats.v1')) return;
    const now = new Date().toISOString();
    localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true }));
    localStorage.setItem('evo.checkins.v1', JSON.stringify([{ id: 'a', at: now, style: 'classic', feeling: 'Anxious', word: 'anxious', intensity: 70 }]));
    localStorage.setItem('evo.chats.v1', JSON.stringify([{ id: 'c1', mode: 'untangle', startedAt: now, updatedAt: now, topic: 'fight with Amma', insights: [],
      feelings: [{ name: 'Hurt', start: 80 }, { name: 'Guilty', start: 70 }],
      thought: "I'm never good enough for her", belief: [85, 85],
      parts: [{ id: 'p1', t: 'me', text: "Amma compared me to my cousin's results at dinner. I said something mean and left the table." },
              { id: 'p2', t: 'evidence', supports: ['She compared me again tonight', 'I snapped at her'], against: ['She came to my college day', 'She asked about my week on Monday'] }] }]));
  });
  const p = await ctx.newPage(); const U = process.env.BASE_URL || 'http://localhost:3000'; const S = process.env.SHOTS; const log = (m) => console.log(m);
  const shot = async (n) => { if (S) { await p.waitForTimeout(400); await p.screenshot({ path: `${S}/w-${n}.png` }); } };
  const next = async (label = /^Next/) => { await p.getByRole('button', { name: label }).click(); await p.waitForTimeout(500); };

  await p.goto(U + '/tools'); await p.getByText('Right now: anxious, 70.').waitFor(); await shot('t41');
  await p.getByRole('button', { name: 'Hard on myself' }).click(); await p.getByRole('link').filter({ hasText: 'Self-compassion break' }).first().waitFor();
  const first = await p.getByRole('listitem').first().innerText(); if (!first.includes('Self-compassion')) throw new Error('order not by need'); log('4.1 toolkit ok');
  await p.getByRole('link', { name: /Thought record/ }).click(); await p.waitForURL('**/tools/thought-record');
  await p.getByText("Amma compared me to my cousin's results").waitFor(); await p.getByRole('button', { name: 'Amma', exact: true }).waitFor(); await shot('t42'); log('4.2 prefilled ok');
  await next(); await p.getByRole('slider', { name: 'Hurt' }).waitFor(); await p.getByRole('button', { name: 'Angry', exact: true }).click(); await shot('t43'); log('4.3 emotions ok');
  await next(); await p.getByRole('radio', { name: /never good enough/ }).click(); await shot('t44'); log('4.4 hot thought ok');
  await next(); await p.getByRole('button', { name: /All-or-nothing/, pressed: true }).waitFor(); await p.getByText(/"Never" is often a clue/).waitFor(); await shot('t45'); log('4.5 traps ok');
  await next(); await p.getByRole('button', { name: /I snapped at her — move/ }).waitFor(); await shot('t46');
  await p.getByRole('button', { name: 'Add' }).last().click(); await p.getByLabel("Add something that doesn't fit").fill('My manager praised my work'); await p.keyboard.press('Enter'); await p.getByText('My manager praised my work').waitFor(); log('4.6 evidence ok');
  await next(); await p.getByRole('radio').first().click(); await p.getByRole('slider', { name: 'Belief now' }).fill('45'); await shot('t47'); log('4.7 balanced ok');
  await next(/^Save/); await p.getByText('That thought got lighter.').waitFor(); await p.getByText('From 85% to 45% believable.').waitFor(); await shot('t48');
  await p.getByRole('button', { name: 'Save to journal' }).click(); await p.waitForFunction(() => JSON.parse(localStorage.getItem('evo.thoughts.v1'))[0].journal === true); log('4.8 saved ok');
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
