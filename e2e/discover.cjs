const { chromium } = require('playwright');
const path = require('path');
// Flow 10: Discover hub + O2–O11. SHOTS=<dir> saves screenshots.
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, permissions: ['microphone'] });
  await ctx.addInitScript(() => {
    if (localStorage.getItem('e2e.seeded')) return;
    localStorage.setItem('e2e.seeded', '1');
    const d = (n) => new Date(Date.now() - n * 864e5).toISOString();
    localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true }));
    localStorage.setItem('evo.checkins.v1', JSON.stringify([0, 1, 2].map((i) => ({ id: 'm' + i, at: d(i), style: 'morning', feeling: i ? 'Tired' : 'Calm', intensity: 40, sleep: { quality: 'poor', hours: 5 } }))));
    localStorage.setItem('evo.activities.v1', JSON.stringify([10, 12].map((n) => ({ id: 'w' + n, at: d(n), kind: 'walk', text: 'Walk', guess: 4, when: '', actual: 6 }))));
    localStorage.setItem('evo.trusted.v1', JSON.stringify({ name: 'Riya', relation: 'Friend', phone: '+910000000000', message: 'hi' }));
    localStorage.setItem('evo.thoughts.v1', JSON.stringify([{ id: 't', at: d(1), situation: '', when: '', who: '', emotions: [], hot: "I'm useless. I always mess things up.", belief: 80, traps: [], supports: [], against: [], balanced: '' }]));
  });
  const p = await ctx.newPage(); const U = process.env.BASE_URL || 'http://localhost:3000'; const S = process.env.SHOTS; const log = (m) => console.log(m);
  const shot = async (n) => { if (S) { await p.waitForTimeout(500); await p.screenshot({ path: `${S}/w-${n}.png` }); } };
  const photo = path.join(__dirname, 'fixture-photo.jpg');

  await p.goto(U + '/discover'); await p.getByText('Record a note for a future hard day').waitFor(); await shot('o1'); log('O1 hub ok');

  await p.getByRole('link', { name: /PICKED FOR TONIGHT/ }).click(); await p.waitForURL('**/future-note');
  await p.getByRole('button', { name: 'Record', exact: true }).click(); await p.waitForTimeout(2200); await shot('o2');
  await p.getByRole('button', { name: 'Stop recording' }).click(); await p.getByRole('button', { name: 'Play it back' }).isEnabled();
  await p.getByRole('button', { name: /When should Evo play it/ }).click(); await p.getByText('Only when you ask').waitFor();
  await p.getByRole('button', { name: /Save my note/ }).click(); await p.waitForURL('**/discover');
  if (!(await p.evaluate(() => JSON.parse(localStorage.getItem('evo.futurenotes.v1'))[0].audio.startsWith('data:audio')))) throw new Error('no audio'); log('O2 future note ok');

  await p.goto(U + '/discover/friends-chair'); await p.getByText('If Riya said this to you, what would you tell Riya?').waitFor();
  await p.getByLabel("What you'd tell Riya").fill("One meeting doesn't erase everything you do. You're tired, not useless."); await p.getByText('That kinder voice is yours too.').waitFor(); await shot('o3'); log('O3 friends chair ok');

  await p.goto(U + '/discover/letter'); await p.getByPlaceholder('Who is it to?').fill('Amma');
  await p.getByLabel('Your letter').fill("I know you want the best for me. But when you compare me to Arun, I hear that I'm not enough. I shut down, then I say mean things.");
  await p.getByRole('button', { name: /Turn it into a real message/ }).click(); await p.getByText(`"Amma, when you compare me to Arun, I hear that I'm not enough. I'd love it if we could talk about it calmly. Can we try?"`).waitFor();
  await shot('o4'); await p.getByRole('button', { name: /Keep it, locked/ }).click(); await p.waitForURL('**/discover'); log('O4 letter ok');

  await p.goto(U + '/discover/fear'); await p.getByLabel('The fear').fill("If I share my idea again, my manager will brush it off.");
  await p.getByLabel('The experiment').fill('Send it in writing'); await p.getByLabel('When').fill('Thursday');
  await p.getByRole('button', { name: 'Done' }).click(); await p.getByLabel('What actually happened').fill("She said 'good point, let's add it'.");
  await p.getByLabel('How much came true').fill('10'); await p.getByLabel('How much came true').press('Enter');
  await p.getByText('Your brain predicted 80%. Reality was 10%. Worth remembering next time.').waitFor(); await shot('o5'); log('O5 fear ok');

  await p.goto(U + '/discover/soothe'); await p.getByLabel('hear').fill('Rain on a tin roof · 12 min'); await p.getByLabel('taste').fill('Cardamom chai, slowly');
  await p.getByLabel('touch').fill('Cold water on wrists'); await p.getByLabel('smell').fill('Jasmine oil on the pillow');
  await p.getByPlaceholder('Words that help you ride it out').fill("This feeling is a wave. I've surfed every one so far.");
  await p.locator('input[type=file]').setInputFiles(photo); await p.getByAltText('Your calming photo').waitFor(); await shot('o6');
  await p.getByRole('button', { name: /Open my kit now/ }).click(); await p.getByText('Rain on a tin roof · 12 min').waitFor(); log('O6 soothe ok');

  await p.goto(U + '/discover/eyes-closed'); await p.getByText(/breathe in|breathe out/).first().waitFor(); await shot('o7');
  await p.waitForTimeout(3200); await p.getByRole('button', { name: /Screen dimmed/ }).click(); log('O7 eyes-closed ok');

  await p.goto(U + '/discover/joy'); await shot('o8'); await p.locator('input[type=file]').last().setInputFiles(photo);
  await p.getByAltText(/Your find/).waitFor(); log('O8 joy ok');

  await p.goto(U + '/discover/storm-signs'); await p.getByText('Showing now').first().waitFor();
  if ((await p.getByText('Showing now').count()) !== 2) throw new Error('signs');
  await p.getByLabel('Add a sign you notice').fill('Shorter replies to friends'); await p.getByLabel('Add a sign you notice').press('Enter');
  for (const s of ['Bed by 11 — phone outside the room', 'A 10-min walk, even in the rain', 'Tell Riya "I\'m in a dip"']) { await p.getByLabel('Add a step to your plan').fill(s); await p.getByLabel('Add a step to your plan').press('Enter'); }
  await shot('o9'); await p.getByRole('switch', { name: /Let Riya know/ }).click(); await p.getByRole('link', { name: /Send Riya "check on me"/ }).waitFor(); log('O9 storm signs ok');

  await p.goto(U + '/companion'); await p.getByText('Panic support · step 1 of 4').waitFor(); await p.getByRole('button', { name: 'Next step' }).click();
  await p.getByText('Name 3 things you can see. Take your time.').waitFor(); await shot('o10'); log('O10 companion ok');

  await p.goto(U + '/discover/compass'); await shot('o11'); await p.getByRole('radio', { name: 'Health' }).click(); await p.getByText('ONE STEP TOWARDS HEALTH, TONIGHT').waitFor();
  await p.getByRole('button', { name: /I'll do this/ }).click(); await p.waitForURL('**/home'); log('O11 compass ok');
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
