const { chromium } = require('playwright');
// Chat (X1–X14, 3.1–3.6): talk → feeling → strength; untangle → evidence → fairer → step → summary → close;
// safety question on risk words; listening mode; late-night parking; results; history search; voice (typed fallback); style.
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  await ctx.addInitScript(() => {
    if (!localStorage.getItem('evo.profile.v1')) localStorage.setItem('evo.profile.v1', JSON.stringify({ name: 'Alex', onboarded: true }));
    if (!localStorage.getItem('evo.checkins.v1')) localStorage.setItem('evo.checkins.v1', JSON.stringify([{ id: 'a', at: new Date().toISOString(), style: 'classic', feeling: 'Anxious', word: 'tense', intensity: 70, causes: ['Work'] }]));
    delete window.SpeechRecognition; delete window.webkitSpeechRecognition;
  });
  const p = await ctx.newPage(); const U = process.env.BASE_URL || 'http://localhost:3000'; const log = (m) => console.log(m);
  const say = async (t) => { await p.getByLabel('Message Evo').fill(t); await p.getByRole('button', { name: 'Send' }).click(); await p.getByRole('status', { name: 'Evo is typing' }).waitFor({ state: 'detached' }).catch(() => {}); await p.waitForTimeout(300); };
  const chip = async (n) => { await p.getByRole('button', { name: n, exact: true }).last().click(); await p.waitForTimeout(1500); };

  await p.goto(U + '/chat'); await p.getByText('You checked in tense · 70').waitFor(); await p.getByRole('link', { name: "Yes, let's talk" }).click();
  await p.getByText('Tense at 70').waitFor(); await p.getByRole('button', { name: 'Something with work' }).click(); await p.getByRole('radio', { name: '8' }).click();
  await p.getByText("That's a lot to hold").waitFor(); log('X1 → 3.1 guided start ok');
  await say('My manager ignored my idea in the meeting again. I feel useless.'); await chip('Invisible');
  await p.getByRole('slider', { name: 'How strong is it?' }).focus(); await p.keyboard.press('Enter'); await p.getByText(/Invisible at 50/).waitFor(); log('X3 feeling + strength ok');

  await p.goto(U + '/chat/live?mode=untangle'); await p.waitForTimeout(800); await say("Everyone at work thinks I'm useless.");
  await p.getByText('Mind reading').waitFor(); log('X5 trap ok');
  await p.getByText('Want to check what the evidence actually says?').click({ button: 'right' }); await p.getByRole('dialog', { name: 'Message actions' }).waitFor();
  await p.getByRole('button', { name: /Save as insight/ }).click(); await p.getByText('Saved to your library').waitFor(); log('X7 actions ok');
  await chip('Check the evidence'); await p.getByRole('radio', { name: '8' }).click(); await p.waitForTimeout(1500);
  await say('Idea skipped twice'); await say('Report praised last week, Riya asked for my help');
  await p.getByText('A FAIRER THOUGHT').waitFor(); await p.getByRole('slider', { name: /now\?/ }).fill('40'); await chip('That fits'); log('X6 evidence + fairer ok');
  await p.getByRole('button', { name: 'Pick a small step' }).click(); await p.waitForURL('**/chat/step**');
  await p.getByRole('radio', { name: '5 of 10' }).click(); await p.getByRole('button', { name: /Make it smaller/ }).click(); await p.getByText(/Just start:/).first().waitFor();
  await p.getByRole('button', { name: /Commit to it/ }).click(); await p.waitForURL('**/chat/summary**'); await p.getByText('Your next small step').waitFor(); await p.getByText(/80 → 40/).waitFor(); log('X10 → X9 ok');
  await p.getByRole('button', { name: /Save to my journal/ }).click(); await p.waitForURL('**/chat/close**');
  await p.getByRole('radio', { name: 'Lighter' }).click(); await p.getByRole('button', { name: /Close chat/ }).click(); await p.waitForURL('**/chat'); log('X11 close ok');

  await p.goto(U + '/chat/live?mode=untangle'); await p.waitForTimeout(800); await say("Everyone at work thinks I'm useless."); await chip("That's not it");
  await p.getByRole('button', { name: /Just listen for a while/ }).click(); await p.getByText('Evo switched to listening mode').waitFor(); log('X8 repair ok');

  await p.goto(U + '/chat/live?mode=talk'); await p.waitForTimeout(800); await say("Honestly what's the point of any of this.");
  await p.getByText('A CAREFUL QUESTION').waitFor(); await p.getByRole('link', { name: /Talk to a person now/ }).waitFor();
  await p.getByRole('button', { name: 'Sometimes, yes' }).click(); await p.getByRole('button', { name: 'Open my safety plan' }).waitFor(); log('X12 safety ok');

  await p.goto(U + '/chat/live?mode=listen'); await p.waitForTimeout(800); await p.getByText('Listening mode').waitFor();
  await say('she always compares me to my cousin'); await say('and I feel terrible'); await p.getByRole('button', { name: /Want help with this/ }).click(); await p.getByRole('button', { name: 'Untangle the thought' }).waitFor(); log('3.2 listening ok');

  await p.goto(U + '/chat/live?mode=night'); await p.waitForTimeout(800); await say("Can't sleep. Replaying the meeting over and over.");
  await p.getByText('Parked: the meeting').waitFor(); log('X14 late night ok');

  await p.goto(U + '/chat/live?mode=calm'); await p.getByText('Box breathing').waitFor(); await p.getByRole('button', { name: 'Skip — keep talking' }).click(); await p.getByText('Okay — we\'ll keep talking').waitFor(); log('X4 breath ok');

  await p.goto(U + '/chats/results'); await p.getByText(/REFRAME/).first().waitFor(); await p.getByText(/INSIGHT/).first().waitFor();
  await p.getByRole('checkbox').first().click(); await p.getByText(/Step · done/).waitFor(); log('X13 results ok');
  await p.goto(U + '/chats'); await p.getByLabel('Search your chats').fill('useless'); await p.getByText(/thought record/).first().waitFor(); log('3.6 search ok');
  await p.goto(U + '/insights/noticed'); await p.getByText('Evo insight').waitFor(); await p.getByRole('button', { name: 'Ask Evo' }).click();
  await p.getByRole('textbox', { name: 'Ask Evo' }).fill('Why does this happen?'); await p.getByRole('button', { name: 'Ask', exact: true }).click(); await p.getByText('Confidence', { exact: true }).waitFor(); log('3.4 + 3.5 ok');

  await p.goto(U + '/voice'); await p.getByRole('button', { name: 'Start listening' }).click(); await p.getByText(/VOICE ISN'T AVAILABLE/).waitFor();
  await p.getByLabel('What Evo heard').fill('Fought with my mum again'); await p.getByRole('button', { name: /^Send/ }).click(); await p.waitForURL('**/chat/live**');
  await p.goto(U + '/chats'); await p.getByRole('button', { name: 'Voice', exact: true }).click(); await p.getByText(/Fight with mum/i).waitFor(); log('3.3 voice ok');

  await p.goto(U + '/chat/style'); await p.getByRole('radio', { name: /Straight to the point/ }).click(); await p.getByText("Let's pick one thing to tackle first.").waitFor();
  await p.getByRole('button', { name: /Save my style/ }).click(); await p.waitForFunction(() => JSON.parse(localStorage.getItem('evo.profile.v1')).chatTone === 'direct'); log('X2 style ok');
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
