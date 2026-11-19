const { chromium } = require('playwright');
// Flow 9 + 7.7: You, psychologist connect/brief/plan, memories, reminders, offline, Plus + retry, evidence, delete. SHOTS=<dir> saves screenshots.
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  await ctx.addInitScript(() => {
    if (localStorage.getItem('e2e.seeded')) return;
    const d = (n, h = 20) => { const x = new Date(Date.now() - n * 864e5); x.setHours(h, 0, 0, 0); return x.toISOString(); };
    localStorage.setItem('e2e.seeded', '1');
    localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true, locales: ['English', 'Malayalam'], chatLanguage: 'Malayalam' }));
    localStorage.setItem('evo.checkins.v1', JSON.stringify([{ id: 'a', at: d(1), style: 'classic', feeling: 'Anxious', intensity: 60 }, { id: 'b', at: d(2), style: 'classic', feeling: 'Anxious', intensity: 70 }, { id: 'c', at: d(3), style: 'classic', feeling: 'Calm', intensity: 30 }, { id: 'e', at: d(4), style: 'classic', feeling: 'Calm', intensity: 30 }]));
    localStorage.setItem('evo.thoughts.v1', JSON.stringify([{ id: 't', at: d(2), situation: 'Fight', when: '', who: 'Amma', emotions: [], hot: "I'm never good enough", belief: 85, beliefAfter: 45, traps: [], supports: [], against: [], balanced: 'Arguments with Amma hurt most when I feel compared.' }]));
    localStorage.setItem('evo.ladder.v1', JSON.stringify({ goal: 'tell Riya', current: 3, rungs: [{ text: 'a', dread: 9 }, { text: 'b', dread: 7 }, { text: 'c', dread: 5 }, { text: "Open Riya's chat", dread: 3 }, { text: 'e', dread: 1 }],
      history: [[8, 3], [7, 5], [9, 4], [6, 4], [8, 3]].map(([e, a], i) => ({ text: i ? `Step ${i}` : 'Reached out to Riya', expected: e, actual: a, at: d(i, 12) })) }));
    localStorage.setItem('evo.activities.v1', JSON.stringify([1, 2, 3].map((i) => ({ id: 'w' + i, at: d(i), kind: 'walk', text: 'Walk', guess: 4, when: '', actual: 7 }))));
  });
  const p = await ctx.newPage(); const U = process.env.BASE_URL || 'http://localhost:3000'; const S = process.env.SHOTS; const log = (m) => console.log(m);
  const shot = async (n) => { if (S) { await p.waitForTimeout(500); await p.screenshot({ path: `${S}/w-${n}.png` }); } };

  await p.goto(U + '/settings'); await p.getByText('Evo Free · English + Malayalam').waitFor();
  await p.getByRole('switch', { name: 'Discreet mode' }).click(); await p.getByRole('switch', { name: 'App lock' }).click();
  await p.goto(U + '/psychologist/connect'); await p.getByLabel('Code from your psychologist').fill('meera4k2'); await p.getByText('Code matched').waitFor();
  await p.getByRole('switch', { name: 'Share mood trends' }).click(); await p.getByRole('switch', { name: 'Share steps and tools' }).click(); await shot('p1');
  await p.getByRole('button', { name: /Connect/ }).click(); await p.waitForURL('**/settings'); log('9.1 connect ok');
  await p.getByText('Connected · sharing 2 things').waitFor();
  await p.goto(U + '/memories'); await p.getByText('NEW · SAVE THIS?').waitFor(); await p.getByRole('button', { name: 'Save', exact: true }).click();
  await p.getByRole('button', { name: 'Save', exact: true }).click(); await p.getByRole('button', { name: 'Save', exact: true }).click(); await p.getByText('"Arguments with Amma hurt most when I feel compared."').waitFor();
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('evo.memory.v1')); s.pending = [{ text: 'Mornings are the calmest time.', source: 'From check-ins', at: new Date().toISOString() }]; localStorage.setItem('evo.memory.v1', JSON.stringify(s)); });
  await p.reload(); await p.getByText('Mornings are the calmest time.').waitFor(); await shot('p5');
  await p.getByRole('button', { name: 'Forget this' }).first().click(); await p.getByText('Forgotten.').waitFor(); log('9.5 memories ok');
  await p.goto(U + '/settings'); await p.getByText(/Updated|Make one/).waitFor(); await p.getByText('2 memories').waitFor(); await shot('p4'); log('9.4 you ok');

  await p.goto(U + '/psychologist/brief'); await p.getByText('Mostly anxious; two calmer evenings').waitFor(); await p.getByText(`"I'm never good enough" · belief 85 → 45`).waitFor(); await p.getByText(/Reached out to Riya · Step 1 · walked 3 times/).waitFor();
  await p.getByPlaceholder('Something you want to talk about').fill('Why arguments with Amma hit so hard'); await shot('p2');
  await p.getByRole('button', { name: 'Preview' }).click(); await p.getByText('WHAT MEERA WILL SEE').waitFor(); await p.getByRole('button', { name: 'Edit' }).click();
  await p.getByRole('button', { name: /Send brief/ }).click(); await p.waitForURL('**/settings'); log('9.2 brief ok');

  await p.evaluate(() => localStorage.setItem('evo.homework.v1', JSON.stringify([
    { id: 'h1', text: 'Thought record after the next argument', note: 'When it happens', done: true, prompt: { text: 'When a fight with Amma starts, notice the first thought — tap once to log it.', chips: ['Here we go again', "She doesn't get it", "I'm not enough"] } },
    { id: 'h2', text: 'Walk after work, 3 times', note: '', target: 3, count: 2 }, { id: 'h3', text: 'Call Riya back', note: 'Weekend' }])));
  await p.goto(U + '/home'); await p.getByRole('link', { name: '2 things from Dr. Meera this week' }).click(); await p.waitForURL('**/plan');
  await p.getByText('From Dr. Meera').waitFor(); await shot('p3');
  await p.getByRole('button', { name: '"Here we go again"' }).click(); await p.getByText(/Only you can see/).waitFor();
  await p.getByRole('button', { name: /Walk after work/ }).click(); await p.getByText('3 of 3 done').waitFor(); log('9.3 plan ok');

  await p.goto(U + '/reminders'); await p.getByRole('switch', { name: 'Before bed reminder' }).click(); await p.getByRole('switch', { name: 'Worry time reminder' }).click(); await p.getByRole('switch', { name: 'Discreet wording' }).click();
  await p.getByText('PLANNER', { exact: true }).waitFor(); await shot('p6'); await p.reload(); if (!(await p.getByRole('switch', { name: 'Worry time reminder' }).getAttribute('aria-checked')).includes('true')) throw new Error('reminder not saved'); log('9.6 reminders ok');

  await p.goto(U + '/offline?q=' + encodeURIComponent('honestly i just feel alone tonight')); await p.getByText('Saved · ready to send').waitFor(); await ctx.setOffline(true);
  await p.getByText("You're offline. Your words are safe on this phone.").waitFor(); await p.getByText('Saved · waiting to send').waitFor(); await shot('p7');
  await ctx.setOffline(false); await p.getByText('Saved · ready to send').waitFor(); log('9.7 offline ok');

  await p.goto(U + '/wins'); await p.getByText('Expected vs real, last 5 steps').waitFor(); await shot('e7'); log('7.7 evidence ok');

  await p.evaluate(() => localStorage.setItem('evo.dev.pay', JSON.stringify('fail')));
  await p.goto(U + '/plus'); await p.getByRole('radio', { name: /1,499/ }).waitFor(); await shot('p9');
  await p.getByRole('button', { name: /Continue with UPI/ }).click(); await p.waitForURL('**/plus/retry**'); await p.getByText("Payment didn't go through").waitFor();
  await p.evaluate(() => localStorage.setItem('evo.plan.v1', JSON.stringify({ tier: 'plus', plan: 'year' }))); await p.reload(); await p.getByText('3 days to sort it out').waitFor(); await shot('p10');
  await p.evaluate(() => localStorage.removeItem('evo.dev.pay')); await p.getByRole('button', { name: /Try UPI again/ }).click(); await p.waitForURL('**/settings'); await p.getByText(/Evo Plus · English/).waitFor(); log('9.9/9.10 plus ok');

  await p.goto(U + '/delete'); await p.getByText('Stays with Dr. Meera — ask Meera about it').waitFor();
  if (!(await p.getByRole('button', { name: 'Delete my account' }).isDisabled())) throw new Error('delete not guarded');
  await p.getByLabel('Type DELETE to confirm').fill('DELE'); await shot('p8'); await p.getByLabel('Type DELETE to confirm').fill('delete');
  await p.getByRole('button', { name: 'Delete my account' }).click(); await p.waitForURL('**/welcome');
  const left = await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('evo.'))); if (left.length) throw new Error('left: ' + left); log('9.8 delete ok');
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
