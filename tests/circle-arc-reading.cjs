const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path,circle'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].slice(0,4).map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=550&&b.y+b.height<=450,equal:Math.abs(m.a-m.d)<1e-8};
});}

const angle=(a,p,b)=>Math.atan2(Math.abs((a[0]-p[0])*(b[1]-p[1])-(a[1]-p[1])*(b[0]-p[0])),(a[0]-p[0])*(b[0]-p[0])+(a[1]-p[1])*(b[1]-p[1]))*180/Math.PI;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.PUBLIC_URL?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#lesson-1`,page=await browser.newPage({reducedMotion:'reduce',ignoreHTTPSErrors:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 const seq=page.locator('#arc-reading-story'),svg=seq.locator('svg');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});
  for(const side of ['top','bottom']){
   await seq.locator(`[data-side="${side}"]`).click();await expect(seq.locator('.angle-story-count')).toHaveText('1 / 4');
   for(let i=0;i<4;i++){
    const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,side,i,g}));
    const pts=await svg.evaluate(e=>{const l=e.querySelector('[data-pa]'),b=e.querySelector('[data-pb]');return [[l.x2.baseVal.value,l.y2.baseVal.value],[l.x1.baseVal.value,l.y1.baseVal.value],[b.x2.baseVal.value,b.y2.baseVal.value]];});
    assert(Math.abs(angle(...pts)-(side==='top'?60:120))<1e-4);
    await expect(svg.locator('[data-arc]')).toHaveCount(i<2?0:i===2?2:1);
    if(i===3)await expect(svg.locator('[data-arc]')).toHaveAttribute('data-arc',side==='top'?'short':'long');
    await svg.screenshot({path:`test-results/circle/arc-reading-${width}-${side}-${i}.png`});
    await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');
   }
   await seq.locator('[data-back]').click();await seq.locator(`[data-choice="${side==='top'?'long':'short'}"]`).click();await expect(seq.locator('.angle-story-message')).toContainText('途中でPを通ります');
   await seq.locator('[data-back]').click();await seq.locator(`[data-choice="${side==='top'?'short':'long'}"]`).click();await expect(seq.locator('.angle-story-message')).toContainText('選んだ道にはPがありません');
   await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('A・Bは固定');await page.keyboard.press('Escape');
  }
  await seq.locator('[data-reset]').click();await expect(seq.locator('[data-side="top"]')).toHaveAttribute('aria-pressed','true');await expect(svg.locator('[data-arc]')).toHaveCount(0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 for(const href of ['#q1','#move-lab']){await seq.locator(`a[href="${href}"]`).click();await expect(page.locator(href)).toBeInViewport();}
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-1 > figure')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false,ignoreHTTPSErrors:true});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#lesson-1 > figure')).toBeVisible();assert.deepEqual(errors,[]);
 console.log('PASS arc reading: two sides, four stages, three widths, independent angles, correct/wrong choices, labels, keyboard, reset, zoom, links, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
