const { chromium } = require('playwright');
// Classic check-in (2.2–2.6) → reflection → journal; then a very heavy check-in → safety response.
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 393, height: 852 } });
const U=process.env.BASE_URL||'http://localhost:3000'; const log=(m)=>console.log(m);
async function checkIn(feeling, word, value){
  await p.goto(U+'/check-in'); await p.getByRole('radio',{name:feeling}).click(); await p.getByRole('button',{name:/^Next/}).click();
  await p.waitForURL('**step=name'); if(word) await p.getByRole('button',{name:word,exact:true}).click();
  await p.getByLabel('How strong is it?').fill(String(value)); await p.getByRole('button',{name:/^Next/}).click();
  await p.waitForURL('**step=body'); await p.getByRole('button',{name:'Chest',exact:true}).click(); await p.getByRole('button',{name:'Skip this step'}).click();
  await p.waitForURL('**step=cause'); await p.getByRole('button',{name:'Work'}).click(); await p.getByRole('button',{name:/Save check-in/}).click(); }
await checkIn('Anxious','tense',75); await p.waitForURL('**step=reflect'); await p.getByText('Breathe it down').waitFor(); await p.getByText('recommended first').waitFor(); log('reflect: breathe recommended');
await p.goto(U+'/journal'); await p.getByText(/Anxious 75/).waitFor(); log('journal ok');
await checkIn('Sad','hopeless',90); await p.waitForURL('**/check-in/low'); await p.getByText('are you safe right now?').waitFor(); await p.getByText('Tele-MANAS 14416').waitFor(); log('C13 safety ok');
// Check-in v2 (C1–C12)
await p.goto(U+'/check-in/style'); await p.getByRole('radio',{name:/Feelings wheel/}).click(); await p.waitForURL('**/check-in/wheel');
await p.goto(U+'/home'); await p.getByRole('button',{name:'Check in',exact:true}).click(); await p.waitForURL('**/check-in/wheel'); log('C1 style → home chip ok');
await p.getByRole('button',{name:'Scared'}).click(); await p.getByRole('button',{name:'Anxious'}).click(); await p.getByRole('button',{name:'Overwhelmed'}).click();
await p.getByRole('button',{name:/That's the one/}).click(); await p.waitForURL('**step=reflect'); log('C4 wheel ok');
await p.goto(U+'/check-in/quick'); await p.getByRole('radio',{name:'Good'}).click(); await p.waitForURL('**/home'); log('C2 quick ok');
await p.goto(U+'/check-in/morning'); await p.getByRole('button',{name:'Well',exact:true}).click(); await p.getByRole('button',{name:/Start my day/}).click(); await p.waitForURL('**/home'); log('C7 morning ok');
await p.goto(U+'/check-in/two-week'); for (const fs of await p.locator('fieldset').all()) await fs.getByRole('button',{name:'Nearly every day'}).click();
await p.getByRole('status').getByText('Talking to someone could really help').waitFor(); log('C9 two-week threshold ok');
await p.goto(U+'/check-in/rerate?tool=breathe'); await p.getByText('After 1 minute of breathing.').waitFor(); await p.getByRole('button',{name:'A bit better'}).click(); await p.getByRole('button',{name:/^Done/}).click(); log('C10 rerate ok');
await p.goto(U+'/check-in/missed'); await p.getByRole('radio',{name:'Okay'}).click(); await p.getByRole('button',{name:/Check in for today/}).waitFor(); log('C11 missed ok');
await p.goto(U+'/insights/week'); await p.getByText('Your week in feelings').waitFor(); log('C12 week ok');
await b.close(); })().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
