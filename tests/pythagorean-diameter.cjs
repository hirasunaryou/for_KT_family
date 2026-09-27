const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/pythagorean/index.html#lesson-8`;
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 for(const width of [1440,390]){
 await page.setViewportSize({width,height:1100});await page.locator('#diameter-reset').focus();await page.keyboard.press('Enter');
 for(let i=0;i<5;i++){
 await expect(page.locator('#diameter-count')).toHaveText(`${i+1} / 5`);
 await expect(page.locator('#diameter-plot [data-diameter-right]')).toHaveCount(i?1:0);
 assert.equal((await page.locator('#diameter-plot').textContent()).includes('BP = 8'),i===4);
 if(i<3)await expect(page.locator('#diameter-calculation')).toBeHidden();
 if(i===3)await expect(page.locator('#diameter-formula')).toHaveText('6² ＋ x² ＝ 10²');
 if(i===4)await expect(page.locator('#diameter-previous')).toContainText('6²');
 const geometry=await page.locator('#diameter-plot').evaluate(svg=>{
 const [a,p,b]=Array.from(svg.querySelector('polygon').points);
 const labels=Array.from(svg.querySelectorAll('text'),e=>e.getBBox());
 const overlap=labels.some((a,i)=>labels.slice(i+1).some(b=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y));
 const box=svg.getBBox();return {ratio:Math.hypot(a.x-p.x,a.y-p.y)/Math.hypot(a.x-b.x,a.y-b.y),dot:(a.x-p.x)*(b.x-p.x)+(a.y-p.y)*(b.y-p.y),overlap,inside:box.x>=0&&box.y>=0&&box.x+box.width<=640&&box.y+box.height<=480};});
 assert(Math.abs(geometry.ratio-.6)<1e-6);assert(Math.abs(geometry.dot)<.01);assert(!geometry.overlap&&geometry.inside,JSON.stringify(geometry));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('#diameter-sequence').screenshot({path:`test-results/diameter-${width}-${i}.png`});
 if(i<4)await page.locator('#diameter-next').click();
 }
 await page.locator('#diameter-prev').click();await expect(page.locator('#diameter-plot')).not.toContainText('BP = 8');
 await page.locator('#diameter-sequence .figure-open').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
 }
 await page.emulateMedia({media:'print'});await expect(page.locator('#diameter-sequence')).toBeHidden();await expect(page.locator('#lesson-8 .height-static')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url);await expect(nojs.locator('#lesson-8 .height-static')).toBeVisible();assert.deepEqual(errors,[]);
 console.log('PASS diameter: all stages, geometry, labels, answer hiding, back, zoom, print, no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
