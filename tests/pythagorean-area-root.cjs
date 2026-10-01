const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path,polygon'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=640&&b.y+b.height<=420,equal:Math.abs(m.a-m.d)<1e-8};
});}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.PUBLIC_URL?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{
 const url=process.env.PUBLIC_URL||'http://127.0.0.1:'+server.address().port+'/study/math/pythagorean/index.html#lesson-3',page=await browser.newPage({reducedMotion:'reduce',ignoreHTTPSErrors:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 const seq=page.locator('#root-length-sequence'),svg=seq.locator('svg');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});await seq.locator('[data-reset]').click();await expect(page.locator('#lesson-3 > figure')).toBeHidden();
  for(let i=0;i<7;i++){
   await expect(seq.locator('.sequence-count')).toHaveText((i+1)+' / 7');
   const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,i,g}));
   const length=([a,b])=>Math.hypot(a[0]-b[0],a[1]-b[1]);assert(Math.abs(length(g.edges[0])/45-2)<1e-8);assert(Math.abs(length(g.edges[1])/45-3)<1e-8);assert(Math.abs(length(g.edges[2])/45-Math.sqrt(13))<1e-8);
   await expect(svg.locator('[data-square]')).toHaveCount(i>=1?1:0);
   if(i>=1){
    const q=await svg.locator('[data-square]').evaluate(e=>[...e.points].map(p=>[p.x,p.y]));const u=q[1].map((v,k)=>v-q[0][k]),v=q[2].map((v,k)=>v-q[1][k]);assert.equal(u[0]*v[0]+u[1]*v[1],0);assert.equal(Math.hypot(...u),Math.hypot(...v));assert.equal(Math.abs(u[0]*v[1]-u[1]*v[0])/45**2,13);assert.deepEqual(q.slice(0,2),[g.edges[2][1],g.edges[2][0]]);
   }
   await expect(svg.locator('text').filter({hasText:/^13$/})).toHaveCount(i>=4?1:0);await expect(svg.locator('text').filter({hasText:/^√13$/})).toHaveCount(i===6?1:0);
   await expect(seq.locator('[data-root-note]')).toBeVisible({visible:i>=5});
   if(i>=1)await expect(seq.locator('.sequence-formula')).toContainText(['c × c ＝ c²','c² ＝ 2² ＋ 3²','c² ＝ 4 ＋ 9','c² ＝ 13','c ＝ ±√13','c ＞ 0 なので、c ＝ √13'][i-1]);
   if(i===5)await expect(svg.locator('text').filter({hasText:/^c$/})).toHaveCount(1);if(i===6)await expect(seq.locator('.sequence-previous')).toContainText('±√13');
   await svg.screenshot({path:'test-results/pythagorean/area-root-'+width+'-'+i+'.png'});
   await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');
  }
  await seq.locator('[data-back]').click();await expect(svg.locator('text').filter({hasText:/^√13$/})).toHaveCount(0);await seq.locator('[data-next]').click();await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('正方形の面積');await expect(page.locator('dialog[open]')).toContainText('√13');await page.keyboard.press('Escape');
  await seq.locator('[data-jump="2"]').click();await expect(seq.locator('.sequence-count')).toHaveText('3 / 7');await expect(svg.locator('text').filter({hasText:/^13$/})).toHaveCount(0);await seq.locator('[data-jump="5"]').click();await expect(seq.locator('.sequence-formula')).toContainText('±√13');await seq.locator('[data-reset]').click();await expect(svg.locator('[data-square]')).toHaveCount(0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 for(const href of ['#q4','#q5','#rearrange-lab']){await seq.locator('a[href="'+href+'"]').click();await expect(page.locator(href)).toBeInViewport();}
 const link=seq.locator('a[href="../square-roots/index.html"]');await expect(link).toHaveCount(1);
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-3 > figure')).toBeVisible();const nojs=await browser.newPage({javaScriptEnabled:false,ignoreHTTPSErrors:true});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#lesson-3 > figure')).toBeVisible();assert.deepEqual(errors,[]);
 console.log('PASS area to root: seven steps × three widths; true square attached to hypotenuse, area 13, both roots then positive length, no early answer, labels, controls, zoom, links, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

