const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
  const url='http://127.0.0.1:'+server.address().port+'/study/math/pythagorean/index.html#lesson-15',page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#lesson-15')).toContainText('向かい合う頂点AからGまで');
  await expect(page.locator('#surface-question-title')).toContainText('箱の表面だけ');
  const lab=page.locator('#surface-3d-lab'),svg=page.locator('#surface-3d-plot'),status=page.locator('#surface-3d-status');
  await expect(lab).toBeVisible();await expect(svg).toBeVisible();
  await expect(status).toContainText('箱の内部');
  await expect(lab.locator('[data-path="inside"]')).toHaveAttribute('aria-pressed','true');
  const d0=await svg.locator('[data-active-route]').getAttribute('d');

  for(const [mode,text] of [['route1','√41'],['route2','√53'],['route3','3√5'],['inside','箱の内部']]){
   await lab.locator('[data-path="'+mode+'"]').click();await expect(status).toContainText(text);await expect(lab.locator('[data-path="'+mode+'"]')).toHaveAttribute('aria-pressed','true');
  }

  const box=await svg.boundingBox();assert(box);
  await page.mouse.move(box.x+box.width*.45,box.y+box.height*.45);await page.mouse.down();await page.mouse.move(box.x+box.width*.70,box.y+box.height*.60,{steps:5});await page.mouse.up();
  const d1=await svg.locator('[data-active-route]').getAttribute('d');assert.notEqual(d0,d1,'drag should change projection');

  await svg.focus();const beforeKey=await svg.locator('[data-active-route]').getAttribute('d');await page.keyboard.press('ArrowRight');const afterKey=await svg.locator('[data-active-route]').getAttribute('d');assert.notEqual(beforeKey,afterKey,'keyboard rotation should change projection');
  await lab.locator('[data-view-reset]').click();const reset=await svg.locator('[data-active-route]').getAttribute('d');assert.equal(reset,d0,'reset should restore initial view');

  await expect(lab.locator('.face-front')).toBeVisible();await expect(lab.locator('.face-side')).toBeVisible();await expect(lab.locator('.face-top')).toBeVisible();
  for(const width of [1440,768,390]){await page.setViewportSize({width,height:1100});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);}
  await page.emulateMedia({media:'print'});await expect(lab).toBeHidden();await expect(page.locator('#lesson-15 .height-static')).toBeVisible();
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#surface-3d-lab')).toBeHidden();await expect(nojs.locator('#lesson-15 .height-static')).toBeVisible();
  assert.deepEqual(errors,[]);
  console.log('PASS surface 3D: explicit question, inside/surface routes, route switching, drag/keyboard rotation, view reset, face key, three widths, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});