const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path,circle'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].slice(0,4).map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=550&&b.y+b.height<=470,equal:Math.abs(m.a-m.d)<1e-8};
});}

const angle=(a,p,b)=>Math.atan2(Math.abs((a[0]-p[0])*(b[1]-p[1])-(a[1]-p[1])*(b[0]-p[0])),(a[0]-p[0])*(b[0]-p[0])+(a[1]-p[1])*(b[1]-p[1]))*180/Math.PI;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.PUBLIC_URL?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#lesson-2`,page=await browser.newPage({reducedMotion:'reduce',ignoreHTTPSErrors:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 const seq=page.locator('#half-angle-story'),svg=seq.locator('svg'),slider=seq.locator('input');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});await expect(page.locator('#lesson-2 > figure')).toBeHidden();
  for(let value=40;value<=160;value+=10){
   await slider.fill(String(value));await expect(seq.locator('.angle-story-count')).toHaveText('1 / 4');await expect(seq.locator('[data-setting]')).toHaveText(String(value));
   let previous=null;
   for(let i=0;i<4;i++){
    const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,value,i,g}));
    const pts=await svg.evaluate(e=>{const l=e.querySelector('[data-pa]'),b=e.querySelector('[data-pb]'),o=[...e.querySelectorAll('text')].find(t=>t.textContent==='O');return {a:[l.x2.baseVal.value,l.y2.baseVal.value],p:[l.x1.baseVal.value,l.y1.baseVal.value],b:[b.x2.baseVal.value,b.y2.baseVal.value],label:[o.x.baseVal[0].value,o.y.baseVal[0].value],arc:e.querySelector('[data-shared-arc]').getAttribute('d')};});
    assert(Math.abs(angle(pts.a,pts.p,pts.b)-value/2)<1e-4);assert(Math.abs(angle(pts.a,[275,210],pts.b)-value)<1e-4);
    for(const p of [pts.a,pts.b,pts.p])assert(Math.abs(Math.hypot(p[0]-275,p[1]-210)-110)<1e-4);
    if(previous)assert.deepEqual(pts,previous,'Same geometry, shared arc and O label across stages');previous=pts;
    await expect(svg.locator('[data-central]')).toHaveCount(i>=1?1:0);await expect(svg.locator('[data-inscribed]')).toHaveCount(i>=2?1:0);await expect(seq.locator('.angle-story-formula')).toBeVisible({visible:i===3});
    if(i===2)await expect(svg).toContainText('Pの円周角：？');if(i===3){await expect(svg).toContainText(`Pの円周角：${value/2}°`);await expect(seq.locator('.angle-story-formula')).toContainText(`${value/2}° × 2 ＝ ${value}°`);}
    if([40,120,160].includes(value))await svg.screenshot({path:`test-results/circle/half-angle-${width}-${value}-${i}.png`});
    await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');
   }
  }
  await seq.locator('[data-back]').click();await expect(svg).toContainText('Pの円周角：？');await expect(seq.locator('.angle-story-formula')).toBeHidden();
  await seq.locator('[data-next]').click();await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('設定：中心角 160°');await expect(page.locator('dialog[open]')).toContainText('Pの円周角：80°');await page.keyboard.press('Escape');
  await slider.focus();await page.keyboard.press('ArrowLeft');await expect(seq.locator('.angle-story-count')).toHaveText('1 / 4');await expect(svg.locator('[data-inscribed]')).toHaveCount(0);
  await seq.locator('[data-reset]').click();await expect(slider).toHaveValue('120');await expect(seq.locator('.angle-story-formula')).toBeHidden();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 for(const href of ['#q2','#q4','#proof-lab','#move-lab']){await seq.locator(`a[href="${href}"]`).click();await expect(page.locator(href)).toBeInViewport();}
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-2 > figure')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false,ignoreHTTPSErrors:true});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#lesson-2 > figure')).toBeVisible();assert.deepEqual(errors,[]);
 console.log('PASS half angle: 13 settings × four stages × three widths, independent angles/radii, stable arc and label, reveal reset, labels, controls, zoom, links, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
