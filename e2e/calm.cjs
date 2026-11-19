const { chromium } = require('playwright');
// Flow 6: calm space and its five exercises. SHOTS=<dir> saves a screenshot per screen.
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  await ctx.addInitScript(() => { if (!localStorage.getItem('evo.profile.v1')) localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true })); });
  const p = await ctx.newPage(); const U = process.env.BASE_URL || 'http://localhost:3000'; const S = process.env.SHOTS; const log = (m) => console.log(m);
  const shot = async (n) => { if (S) { await p.waitForTimeout(400); await p.screenshot({ path: `${S}/w-${n}.png` }); } };

  await p.goto(U + '/calm'); await p.getByText('What does your body need?').waitFor(); await shot('g61');
  await p.goto(U + '/calm?tool=ground'); await p.waitForURL('**/calm/ground'); log('6.1 calm space + alias ok');

  await p.goto(U + '/calm/breathe'); await p.waitForTimeout(2300); await p.getByText('Breathe in… and a little more').waitFor(); await shot('g62');
  await p.getByRole('button', { name: 'Pause' }).click(); await p.getByText('Paused').waitFor(); await p.getByRole('button', { name: "I'm done" }).click(); await p.waitForURL('**/check-in/rerate?tool=breathe'); log('6.2 breathe ok');

  await p.goto(U + '/calm/ground');
  for (let i = 0; i < 5; i++) await p.getByRole('group').getByRole('button').nth(i).click();
  await p.getByRole('button', { name: /Next sense/ }).click(); await p.getByText('Name 4 things you can feel.').waitFor();
  await p.getByRole('button', { name: 'My feet on the floor' }).click(); await p.getByRole('button', { name: 'The chair behind me' }).click(); await p.getByText('2 of 4.').waitFor(); await shot('g63');
  for (let i = 0; i < 3; i++) await p.getByRole('button', { name: /Next sense/ }).click();
  await p.getByRole('button', { name: /I'm back in the room/ }).click(); await p.waitForURL('**tool=ground'); log('6.3 grounding ok');

  await p.goto(U + '/calm/relax'); for (let i = 0; i < 4; i++) await p.getByRole('button', { name: /^(Release|Next muscle)/ }).click();
  await p.getByText('Squeeze your shoulders up to your ears…').waitFor(); await p.waitForTimeout(2200); await shot('g64');
  for (let i = 0; i < 9; i++) await p.getByRole('button', { name: /^(Release|Next muscle)/ }).click();
  await p.getByRole('button', { name: /^Finish/ }).click(); await p.waitForURL('**tool=relax'); log('6.4 relax ok');

  await p.goto(U + '/calm/tipp'); await p.getByRole('radio', { name: /Temperature/, checked: true }).waitFor(); await shot('g65');
  await p.getByRole('button', { name: /Start · 30 seconds/ }).click(); await p.getByText('29').waitFor({ timeout: 3000 }).catch(() => {}); await p.getByRole('button', { name: /steadier/ }).click(); await p.waitForURL('**tool=tipp'); log('6.5 tipp ok');

  await p.goto(U + '/calm/wind-down'); await p.getByText('Let the day go.').waitFor();
  await p.getByRole('button', { name: /Screens dim/ }).click(); await p.getByRole('button', { name: /Screens dim/, pressed: true }).waitFor(); await shot('g66');
  await p.getByRole('button', { name: /Goodnight/ }).click(); await p.waitForURL('**/home');
  await p.waitForFunction(() => JSON.parse(localStorage.getItem('evo.winddown.v1')).length === 1); log('6.6 wind down ok');
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
