const { chromium } = require('playwright');
// Classic check-in (2.2–2.6) → reflection → journal; then a very heavy check-in → safety response.
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 393, height: 852 } });
const U=process.env.BASE_URL||'http://localhost:3000'; const log=(m)=>console.log(m);
async function checkIn(feeling, word, value){
  await p.goto(U+'/check-in'); await p.getByRole('radio',{name:feeling}).click(); await p.getByRole('button',{name:/^Next/}).click();
  await p.waitForURL('**step=name'); if(word) await p.getByRole('button',{name:word,exact:true}).click();
  await p.getByLabel('How strong is it?').fill(String(value)); await p.getByRole('button',{name:/^Next/}).click();
  await p.waitForURL('**step=body'); await p.getByRole('button',{name:'Chest',exact:true}).click(); await p.getByRole('button',{name:'Skip this step'}).click();
  await p.waitForURL('**step=cause'); await p.getByRole('button',{name:'Work'}).click(); await p.getByRole('button',{name:/Save check-in/}).click();
  await p.waitForURL('**step=reflect'); }
await checkIn('Anxious','tense',75); await p.getByText('Breathe it down').waitFor(); await p.getByText('recommended first').waitFor(); log('reflect: breathe recommended');
await p.goto(U+'/journal'); await p.getByText(/Anxious 75/).waitFor(); log('journal ok');
await checkIn('Sad','hopeless',90); await p.getByText('are you safe right now?').waitFor(); log('safety ok');
await b.close(); })().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
