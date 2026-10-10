const {test,expect}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('content-type','text/html');res.end(fs.readFileSync(path.join(__dirname,'../index.html')));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try {
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:')?route.continue():route.abort());
  await page.clock.install({time:new Date('2026-10-10T14:00:00Z')});
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(success,error){error({code:1});}}});
    Object.defineProperty(navigator,'clipboard',{value:{async writeText(text){window.copiedText=text;}}});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  assert.match(await page.locator('#nowHeadline').innerText(),/unavailable/);
  assert.equal(await page.evaluate(()=>groupStatus('A').state),'unknown');
  const states=await page.evaluate(()=>[
    groupStatus('A',Date.parse('2026-04-25T05:59:59Z')).state,
    groupStatus('A',Date.parse('2026-04-25T06:00:00Z')).state,
    groupStatus('A',Date.parse('2026-04-25T12:00:00Z')).state,
    groupStatus('A',Date.parse('2026-05-02T05:59:59Z')).state,
    groupStatus('A',Date.parse('2026-05-02T06:00:00Z')).state]);
  assert.deepEqual(states,['unknown','off','on','off','unknown']);
  await page.locator('#searchInput').fill('fictional-no-such-area-xyz');
  await page.locator('#searchBtn').click();
  assert.match(await page.locator('#summary').innerText(),/No match found/);
  await page.locator('#useLocationBtn').click();
  assert.match(await page.locator('#geoStatus').innerText(),/denied.*manually/i);
  assert.equal(await page.locator('#searchInput').isEnabled(),true);
  await page.locator('#searchInput').fill('Madina');
  await page.locator('#searchBtn').click();
  const groups=await page.locator('[data-result-group]').evaluateAll(items=>items.map(i=>i.dataset.resultGroup));
  assert.ok(new Set(groups).size>=2,'same-name cross-group candidates must be preserved');
  await page.evaluate(()=>copyShareText());
  assert.match(await page.evaluate(()=>window.copiedText),/Historical timetable only/);
  assert.match(await page.evaluate(()=>window.copiedText),/not live electricity status/i);
  assert.deepEqual(errors,[]);
  if(process.env.SCREENSHOT_PATH) await page.screenshot({path:process.env.SCREENSHOT_PATH,fullPage:true});
  console.log('PASS: historical status, 5 slot boundaries, no match, denied GPS/manual fallback, ambiguity, shared warning, no page errors.');
 } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
