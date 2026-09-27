const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/pythagorean/index.html#lesson-12`;
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 const seq=page.locator('#unknown-sequence'),plot=page.locator('#unknown-plot');
 const roots=[];for(let x=-10;x<=10;x++)if(x*x+(x+1)**2===25)roots.push(x);assert.deepEqual(roots,[-4,3]);assert.deepEqual(roots.filter(x=>x>0),[3]);
 for(const width of [1440,768,390]){
 await page.setViewportSize({width,height:1100});await page.locator('#unknown-reset').focus();await page.keyboard.press('Enter');
 for(let i=0;i<7;i++){
 await expect(seq).toBeVisible();await expect(page.locator('#lesson-12 .height-static')).toBeHidden();await expect(page.locator('#unknown-count')).toHaveText(`${i+1} / 7`);
 const labels=await plot.locator('text').allTextContents();assert.equal(labels.includes('3'),i===6);assert.equal(labels.includes('4'),i===6);
 assert.equal((await plot.textContent()).includes('候補 x＝−4'),i>=5);
 await expect(plot.locator('[data-expansion]')).toHaveCount(i===4?1:0);
 if(i<3)await expect(page.locator('#unknown-calculation')).toBeHidden();
 if(i===3)await expect(page.locator('#unknown-formula')).toHaveText('x² ＋ (x＋1)² ＝ 5²');
 if(i===4){await expect(page.locator('#unknown-previous')).toContainText('(x＋1)²');await expect(page.locator('#unknown-formula')).toContainText('2x² ＋ 2x − 24');}
 if(i===5){await expect(page.locator('#unknown-formula')).toContainText('(x＋4)(x−3)');await expect(plot).not.toContainText('使えない');}
 if(i===6)await expect(plot).toContainText('長さが負 → 使えない');
 const shape=await plot.evaluate(svg=>{
 const length=s=>{const e=svg.querySelector(s+' line');return Math.hypot(e.x2.baseVal.value-e.x1.baseVal.value,e.y2.baseVal.value-e.y1.baseVal.value);};
 const labels=Array.from(svg.querySelectorAll('text'),e=>e.getBBox());const segments=Array.from(svg.querySelectorAll('line'),e=>[{x:e.x1.baseVal.value,y:e.y1.baseVal.value},{x:e.x2.baseVal.value,y:e.y2.baseVal.value}]);
 const overlap=labels.some((a,i)=>labels.slice(i+1).some(b=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y));
 const collision=labels.some(b=>segments.some(([p,q])=>{let lo=0,hi=1;for(const k of ['x','y']){const d=q[k]-p[k],min=b[k]-2,max=b[k]+(k==='x'?b.width:b.height)+2;if(Math.abs(d)<1e-9){if(p[k]<min||p[k]>max)return false;}else{const a=(min-p[k])/d,c=(max-p[k])/d;lo=Math.max(lo,Math.min(a,c));hi=Math.min(hi,Math.max(a,c));if(lo>hi)return false;}}return true;}));
 const box=svg.getBBox(),m=svg.getScreenCTM();return {short:length('[data-short]'),long:length('[data-long]'),diagonal:length('[data-diagonal]'),overlap,collision,inside:box.x>=0&&box.y>=0&&box.x+box.width<=640&&box.y+box.height<=500,equal:Math.abs(m.a-m.d)<1e-8};});
 assert.equal(shape.short/shape.long,3/4);assert.equal(shape.short**2+shape.long**2,shape.diagonal**2);assert(shape.inside&&shape.equal&&!shape.overlap&&!shape.collision,JSON.stringify(shape));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await seq.screenshot({path:`test-results/unknown-${width}-${i}.png`});
 if(i<6){await page.locator('#unknown-next').focus();await page.keyboard.press('Enter');}
 }
 await expect(page.locator('#unknown-next')).toHaveAttribute('aria-disabled','true');await page.keyboard.press('Enter');await expect(page.locator('#unknown-count')).toHaveText('7 / 7');
 await seq.locator('.figure-open').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('#unknown-prev').click();await expect(plot).not.toContainText('使えない');
 await seq.locator('summary').click();await expect(seq.locator('details ol')).toContainText('辺は3 cmと4 cm');
 await page.locator('#unknown-reset').click();await expect(seq.locator('details')).not.toHaveAttribute('open','');await expect(plot).not.toContainText('候補');
 }
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-12 .height-static')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url);await expect(nojs.locator('#lesson-12 .height-static')).toBeVisible();
 assert.deepEqual(errors,[]);console.log('PASS unknown lengths: 7 stages, exact geometry, equation roots and length restriction, area expansion, 3 widths, labels, keyboard, reset, back, zoom, print, no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
