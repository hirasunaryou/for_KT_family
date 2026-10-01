const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path,polygon,ellipse'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=640&&b.y+b.height<=430,equal:Math.abs(m.a-m.d)<1e-8};
});}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.PUBLIC_URL?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{
 const url=process.env.PUBLIC_URL||'http://127.0.0.1:'+server.address().port+'/study/math/pythagorean/index.html#lesson-14',page=await browser.newPage({reducedMotion:'reduce',ignoreHTTPSErrors:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 const seq=page.locator('#cone-section-sequence'),svg=seq.locator('svg'),length=([a,b])=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});await seq.locator('[data-reset]').click();await expect(page.locator('#lesson-14 > figure')).toBeHidden();
  for(let i=0;i<11;i++){
   await expect(seq.locator('.sequence-count')).toHaveText((i+1)+' / 11');
   const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,i,g}));
   assert.equal(length(g.edges[0])/50,4);assert.equal(length(g.edges[1])/50,3);assert.equal(length(g.edges[2])/50,5);
   // Height and radius meet at O at a right angle; mother line joins their other ends.
   assert.deepEqual(g.edges[0][1],g.edges[1][0]);assert.deepEqual(g.edges[2],[g.edges[0][0],g.edges[1][1]]);
   const u=g.edges[0][0].map((v,k)=>v-g.edges[0][1][k]),v=g.edges[1][1].map((v,k)=>v-g.edges[1][0][k]);assert.equal(u[0]*v[0]+u[1]*v[1],0);
   await expect(svg.locator('[data-section]')).toHaveCount(i===1?1:0);await expect(svg.locator('[data-half]')).toHaveCount(i>=2?1:0);await expect(svg.locator('[data-right]')).toHaveCount(i>=2?1:0);await expect(svg.locator('[data-base]')).toHaveCount(i>=9?1:0);
   await expect(svg.locator('text').filter({hasText:/^高さ4$/})).toHaveCount(i>=8?1:0);await expect(svg.locator('text').filter({hasText:/^母線5$/})).toHaveCount(1);await expect(svg.locator('text').filter({hasText:/^半径3$/})).toHaveCount(1);
   await expect(seq.locator('[data-outline-control]')).toBeVisible({visible:i>=2});await expect(seq.locator('[data-root-note]')).toBeVisible({visible:i===7||i===8});
   if(i>=3)await expect(seq.locator('.sequence-formula')).toHaveText(['h² ＋ 3² ＝ 5²','h² ＋ 9 ＝ 25','h² ＋ 9 − 9 ＝ 25 − 9','h² ＝ 16','h ＝ ±√16 ＝ ±4','h ＞ 0 なので、h ＝ 4 cm','体積 ＝ π × 3² × 4 ÷ 3','体積 ＝ π × 9 × 4 ÷ 3 ＝ 12π cm³'][i-3]);
   if(i===8)await expect(seq.locator('.sequence-previous')).toContainText('±4');if(i===9)await expect(seq.locator('.sequence-previous')).toBeHidden();
   if(i>=2){await seq.locator('input').uncheck();await expect(svg.locator('[data-shell]')).toHaveCount(0);assert.deepEqual((await geometry(svg)).edges,g.edges);await seq.locator('input').check();await expect(svg.locator('[data-shell]')).toHaveCount(1);}
   await svg.screenshot({path:'test-results/pythagorean/cone-'+width+'-'+i+'.png'});
   await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');
  }
  await seq.locator('[data-jump="9"]').click();await expect(seq.locator('.sequence-count')).toHaveText('10 / 11');await expect(svg).toContainText('高さ4');await seq.locator('[data-back]').click();await seq.locator('[data-back]').click();await expect(svg).toContainText('高さh');await expect(svg.locator('text').filter({hasText:/^高さ4$/})).toHaveCount(0);
  await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('条件：半径3 cm・母線5 cm');await expect(page.locator('dialog[open]')).toContainText('±4');await page.keyboard.press('Escape');
  await seq.locator('[data-jump="3"]').click();await expect(seq.locator('.sequence-count')).toHaveText('4 / 11');await seq.locator('[data-reset]').click();await expect(seq.locator('.sequence-count')).toHaveText('1 / 11');await expect(seq.locator('.sequence-calculation')).toBeHidden();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 for(const href of ['#q25','#space-lab']){await seq.locator('a[href="'+href+'"]').click();await expect(page.locator(href)).toBeInViewport();}
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-14 > figure')).toBeVisible();const nojs=await browser.newPage({javaScriptEnabled:false,ignoreHTTPSErrors:true});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#lesson-14 > figure')).toBeVisible();assert.deepEqual(errors,[]);
 console.log('PASS cone: eleven steps × three widths; exact 3-4-5 section, radius vs diameter, stable outline comparison, roots before positive height, volume, labels, controls, zoom, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
