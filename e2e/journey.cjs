const { chromium } = require('playwright');
// A user's journey using taps only (no typed URLs after Home): every Figma app-tree branch from Home must be reachable.
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, timezoneId: 'Asia/Kolkata' });
  await ctx.addInitScript(() => {
    if (localStorage.getItem('e2e.seeded')) return;
    localStorage.setItem('e2e.seeded', '1');
    const d = (n) => new Date(Date.now() - n * 864e5).toISOString();
    localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true }));
    localStorage.setItem('evo.checkins.v1', JSON.stringify(Array.from({ length: 12 }, (_, i) => ({ id: 'c' + i, at: d(i), style: 'classic', feeling: 'Anxious', intensity: 60 }))));
  });
  const p = await ctx.newPage(); const U = process.env.BASE_URL || 'http://localhost:3000'; const log = (m) => console.log(m);
  const home = async () => { await p.goto(U + '/home'); await p.getByText(/Good (morning|afternoon|evening)/).waitFor(); };
  const tab = (n) => p.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: n }).click();

  await home(); await p.getByRole('button', { name: 'Check in' }).click(); await p.waitForURL(/\/check-in/); log('F  Home → check-in: ' + new URL(p.url()).pathname);
  await home(); await p.getByRole('link', { name: /Last check-in/ }).click(); await p.waitForURL('**/journal');
  await p.getByRole('link', { name: 'Patterns' }).click(); await p.waitForURL('**/insights'); await p.getByRole('link', { name: /Your week in feelings/ }).click(); await p.waitForURL('**/insights/week'); log('   journal → patterns → your week ok');
  await home(); await tab('Chat'); await p.waitForURL('**/chat'); log('A  Home → Chat ok');
  await home(); await p.getByRole('link', { name: /Untangle a thought/ }).click(); await p.waitForURL('**/tools'); log('B  Home → Toolkit ok');
  await p.getByRole('button', { name: 'Feeling too much' }).click(); await p.getByRole('link', { name: /Calm the body/ }).click(); await p.waitForURL('**/calm'); log('   Toolkit → Calm the body ok');
  await p.goBack(); await p.getByRole('button', { name: "Can't get going" }).click(); await p.getByRole('link', { name: /Small steps when stuck/ }).click(); await p.waitForURL(/\/ladder/); log('   Toolkit → Small steps ok');
  await home(); await p.getByRole('link', { name: 'Discover' }).click(); await p.waitForURL('**/discover');
  for (const t of ["Friend's chair", 'Unsent letter', 'Test a fear', 'Soothe kit', 'Eyes-closed calm', 'Values compass', 'Joy hunt', 'Storm signs', 'Panic companion']) { process.stdout.write(t + ' '); await p.getByRole('link', { name: new RegExp(t) }).click(); await p.waitForURL((u) => !u.pathname.endsWith('/discover')); await p.goBack(); await p.waitForURL('**/discover'); }
  log('C  Home → Discover → all 10 features ok');
  await home(); await tab('Settings'); await p.waitForURL('**/settings');
  for (const t of ['Connect your psychologist', 'My safety plan', 'What Evo remembers', 'Reminders', 'Your evidence', 'Evo Plus', 'Delete my account']) { process.stdout.write(t + ' '); await p.getByRole('link', { name: new RegExp(t) }).first().click(); await p.waitForURL((u) => !u.pathname.endsWith('/settings')); await p.goBack(); await p.waitForURL('**/settings'); }
  log('E  Home → You → every row ok');
  await home(); await p.getByRole('link', { name: 'Reminders and notifications' }).click(); await p.waitForURL('**/reminders'); log('   Home bell → Reminders ok');
  await home(); await tab('Voice'); await p.waitForURL('**/voice'); log('   Voice tab ok');
  await b.close();
})().catch((e) => { console.error('FAIL', e.message.split('\n')[0]); process.exit(1); });
