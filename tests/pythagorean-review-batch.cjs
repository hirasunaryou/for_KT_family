const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function checkBounds(svg){return svg.evaluate(e=>{const b=e.getBBox(),m=e.getScreenCTM();return {inside:b.x>=0&&b.y>=0&&b.x+b.width<=640.5&&b.y+b.height<=470.5,equal:Math.abs(Math.abs(m.a)-Math.abs(m.d))<1e-8};});}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
  const url='http://127.0.0.1:'+server.address().port+'/study/math/pythagorean/index.html',page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'#lesson-11',{waitUntil:'domcontentloaded'});
  const cases=[
   {id:'#similar-proof-sequence',steps:10,checks:[
    [2,'△ACHと△ABC'],[4,'b:c=p:b'],[5,'b²=cp'],[6,'△BCHと△BAC'],[7,'a²=cq'],[8,'a²+b²=c(p+q)'],[9,'a²+b²=c²']
   ]},
   {id:'#surface-net-sequence',steps:7,checks:[
    [0,'表面だけ'],[2,'5²+4²=41'],[3,'7²+2²=53'],[4,'6²+3²=45'],[5,'41<45<53'],[6,'√41 cm']
   ]},
   {id:'#connection-sequence',steps:6,checks:[
    [0,'平方根'],[1,'円'],[2,'相似'],[3,'座標'],[4,'二次方程式'],[5,'条件を読む']
   ]}
  ];
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1100});
   for(const c of cases){
    const seq=page.locator(c.id);await expect(seq).toBeVisible();await seq.locator('[data-jump="0"]').click();
    const card=seq.locator('xpath=ancestor::article[1]');await expect(card.locator('.height-static')).toBeHidden();
    for(let i=0;i<c.steps;i++){
     await expect(seq.locator('.sequence-count')).toHaveText((i+1)+' / '+c.steps);
     const b=await checkBounds(seq.locator('[data-plot]'));assert(b.inside&&b.equal,JSON.stringify({width,id:c.id,i,b}));
     const found=c.checks.find(x=>x[0]===i);if(found)await expect(seq).toContainText(found[1]);
     if(i<c.steps-1){await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');}
    }
    await seq.locator('[data-back]').click();await expect(seq.locator('.sequence-count')).toHaveText((c.steps-1)+' / '+c.steps);
    await seq.locator('[data-reset]').click();await expect(seq.locator('.sequence-count')).toHaveText('1 / '+c.steps);
    await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),c.id+' overflow '+width);
   }
  }
  const sim=page.locator('#similar-proof-sequence');await sim.locator('[data-jump="6"]').click();await expect(sim.locator('.sequence-count')).toHaveText('7 / 10');await sim.locator('[data-jump="8"]').click();await expect(sim.locator('.sequence-count')).toHaveText('9 / 10');
  const net=page.locator('#surface-net-sequence');await net.locator('[data-jump="6"]').click();await expect(net).toContainText('√41 cm');
  for(const href of ['#q22','#q26','#q27','#q28']){const link=page.locator('a[href="'+href+'"]:visible').first();await expect(link).toHaveCount(1);}
  await page.emulateMedia({media:'print'});
  for(const c of cases){await expect(page.locator(c.id)).toBeHidden();await expect(page.locator(c.id).locator('xpath=ancestor::article[1]').locator('.height-static')).toBeVisible();}
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url,{waitUntil:'domcontentloaded'});
  for(const c of cases){await expect(nojs.locator(c.id)).toBeHidden();await expect(nojs.locator(c.id).locator('xpath=ancestor::article[1]').locator('.height-static')).toBeVisible();}
  assert.deepEqual(errors,[]);
  console.log('PASS review batch: similarity proof 10 steps, surface nets 7 steps, learning connections 6 steps; jumps/back/reset/zoom, three widths, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});