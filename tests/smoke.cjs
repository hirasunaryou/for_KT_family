const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
fs.mkdirSync(output, {recursive:true});
const server = http.createServer((req,res)=>{
  const file=path.join(root, decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));
  if (!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
  fs.readFile(file,(err,buf)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'html':'text/html; charset=utf-8','js':'text/javascript; charset=utf-8','css':'text/css; charset=utf-8','pdf':'application/pdf','svg':'image/svg+xml'})[file.split('.').pop()]||'application/octet-stream');res.end(buf);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch({headless:true,...(process.env.TEST_CHROME?{executablePath:process.env.TEST_CHROME}:{}),args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1080}});
 const page=await context.newPage();const errors=[];const requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(base);await page.locator('.hero h1').waitFor();
 assert.equal(await page.locator('#home-done').innerText(),'0');
 await page.screenshot({path:path.join(output,'home-desktop.png'),fullPage:true});
 await page.locator('.hero .primary').click();
 assert.equal(await page.locator('.question-card').count(),8);
 assert.equal(await page.locator('#q1 .check-answer').isEnabled(),false);
 await page.locator('#q1 [data-choice="0"]').click();await page.locator('#q1 .check-answer').click();
 assert.match(await page.locator('#q1 .quiz-feedback').innerText(),/復習ポイント/);
 await page.locator('#q1 [data-choice="3"]').click();await page.locator('#q1 .check-answer').click();
 assert.match(await page.locator('#q1 .quiz-feedback').innerText(),/正解/);
 assert.equal(await page.locator('#q1 .question-status').innerText(),'ヒントでできた');
 await page.locator('#q2 [data-choice="2"]').click();await page.locator('#q2 .check-answer').click();
 assert.equal(await page.locator('#q2 .question-status').innerText(),'自力でできた');
 await page.reload();
 assert.match(await page.locator('#q1 .quiz-feedback').innerText(),/正解/);
 // A new selection clears the displayed feedback but preserves the previous scored attempt.
 await page.locator('#q2 [data-choice="0"]').click();await page.reload();
 assert.match(await page.locator('#q2 .quiz-feedback').innerText(),/選択を変更/);
 await page.locator('[data-nav="results"]').click();
 assert.equal(await page.locator('.score-number').first().innerText(),'1 / 8');
 assert.match(await page.locator('tbody tr').first().innerText(),/復習ポイント/);
 // A hint before a first correct answer is recorded separately.
 await page.goto(base+'#practice/finish');
 await page.locator('#q31 .hint summary').click();
 await page.locator('#q31 [data-choice="1"]').click();await page.locator('#q31 .check-answer').click();
 assert.equal(await page.locator('#q31 .question-status').innerText(),'ヒントでできた');
 await page.locator('[data-nav="results"]').click();
 assert.match(await page.locator('.score-card').last().innerText(),/回答前にヒント・解答を見た問題 1問/);
 await page.locator('tbody tr').first().getByRole('link').click();
 await page.locator('#q39').waitFor();
 // Self grading survives navigation and reload; it doesn't change checkpoint scores.
 await page.goto(base+'#practice/basic');
 await page.locator('#q12 .solution-button').click();
 assert.equal(await page.locator('#q12 .solution').isVisible(),true);
 await page.locator('#q12 [data-grade="own"]').click();await page.reload();
 assert.equal(await page.locator('#q12 .question-status').innerText(),'自力でできた');
 await page.screenshot({path:path.join(output,'practice-desktop.png'),fullPage:true});
 // All 46 questions render, with exactly one correct option for checkpoint questions.
 const stages={start:8,basic:8,algebra:6,apply:4,challenge:4,finish:8,retry:8};
 for(const [stage,count] of Object.entries(stages)){await page.goto(base+'#practice/'+stage);assert.equal(await page.locator('.question-card').count(),count);}
 await page.goto(base+'#learn');
 await page.locator('[data-area="5"]').click();
 assert.match(await page.locator('#area-result').innerText(),/5/);
 assert.match(await page.locator('#area-explanation').innerText(),/2より大きく、3より小さい/);
 await page.locator('#area-range').fill('36');
 assert.equal(Number(await page.locator('#moving-square').getAttribute('width')),240);
 await page.locator('#area-range').fill('1');
 assert.equal(Number(await page.locator('#moving-square').getAttribute('width')),40);
 await page.locator('#simplify-number').fill('72');
 assert.match((await page.locator('#simplify-result').innerText()).replace(/\s/g,''),/72=36×2=62/);
 await page.locator('#simplify-number').fill('0');assert.match(await page.locator('#simplify-result').innerText(),/1〜200/);
 await page.locator('#simplify-number').fill('2.5');assert.match(await page.locator('#simplify-result').innerText(),/1〜200/);
 await page.locator('#simplify-number').fill('98');assert.match((await page.locator('#simplify-result').innerText()).replace(/\s/g,''),/98=49×2=72/);
 await page.locator('#number-range').fill('100');
 assert.equal(await page.locator('#number-dot').getAttribute('cx'),'590');
 assert.match(await page.locator('#number-explanation').innerText(),/10² = 100/);
 await page.locator('#number-range').fill('23');assert.match(await page.locator('#number-explanation').innerText(),/整数部分は4/);
 await page.locator('[data-lesson="meaning"]').click();await page.reload();
 assert.equal(await page.locator('[data-lesson="meaning"]').getAttribute('aria-pressed'),'true');
 await page.screenshot({path:path.join(output,'learn-desktop.png'),fullPage:true});
 // Export/import round trip and rejecting malformed files.
 await page.goto(base+'#results');
 const downloadPromise=page.waitForEvent('download');await page.locator('#export-record').click();const download=await downloadPromise;const exported=path.join(output,'progress.json');await download.saveAs(exported);
 const saved=JSON.parse(fs.readFileSync(exported));assert.equal(saved.questions['1'].firstCorrect,false);assert.equal(saved.questions['1'].currentCorrect,true);assert.equal(saved.questions['31'].firstAssisted,true);
 page.once('dialog',d=>d.dismiss());await page.locator('#reset-record').click();assert.equal(await page.locator('.score-number').first().innerText(),'1 / 8');
 page.once('dialog',d=>d.accept());await page.locator('#reset-record').click();assert.equal(await page.locator('.score-number').first().innerText(),'— / 8');
 page.once('dialog',d=>d.accept());await page.locator('#import-record').setInputFiles(exported);await page.waitForFunction(()=>document.querySelector('#record-message').textContent.includes('読み込みました'));
 assert.equal(await page.locator('.score-number').first().innerText(),'1 / 8');
 await page.locator('#import-record').setInputFiles({name:'wrong.json',mimeType:'application/json',buffer:Buffer.from('{"version":999}')});
 await page.waitForFunction(()=>document.querySelector('#record-message').textContent.includes('読み込めません'));
 assert.equal(await page.locator('.score-number').first().innerText(),'1 / 8');
 await page.screenshot({path:path.join(output,'results-desktop.png'),fullPage:true});
 // Narrow screens: no page-level horizontal overflow, even with longer equations.
 await page.setViewportSize({width:390,height:844});
 for(const route of ['home','learn','practice/start','practice/algebra','practice/challenge','results']){
 await page.goto(base+'#'+route);
 const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(dims.scroll<=dims.width+1,`${route} mobile overflow: ${JSON.stringify(dims)}`);
 await page.screenshot({path:path.join(output,route.replaceAll('/','-')+'-mobile.png'),fullPage:true});
 }
 for(const pdf of ['guide','workbook','answers']){const res=await context.request.get(base+`print/square-roots-${pdf}.pdf`);assert.equal(res.status(),200);assert.equal((await res.body()).subarray(0,4).toString(),'%PDF');}
 assert.deepEqual(errors,[]);
 assert.ok(requests.every(url=>url.startsWith(base)||url.startsWith('blob:')),'Unexpected external requests');
 // Storage restrictions should degrade to an in-memory session.
 const noStore=await browser.newContext();await noStore.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});
 const ns=await noStore.newPage();await ns.goto(base);assert.equal(await ns.locator('#storage-notice').isVisible(),true);await ns.goto(base+'#practice/start');await ns.locator('#q1 [data-choice="3"]').click();await ns.locator('#q1 .check-answer').click();assert.match(await ns.locator('#q1 .quiz-feedback').innerText(),/正解/);await noStore.close();
 // An extracted ZIP works with file:// too: no fetch/module dependency.
 const offline=await browser.newContext();const op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('.hero h1').isVisible(),true);await op.locator('.hero .primary').click();assert.equal(await op.locator('.question-card').count(),8);await offline.close();
 console.log('PASS: checkpoint scoring, retry history, hints, self grading, reload, all 46 questions, diagrams, invalid input, export/import/reset, mobile overflow, PDFs, storage denied, offline entry, no external requests.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
