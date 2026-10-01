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
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#lesson-3`,page=await browser.newPage({reducedMotion:'reduce',ignoreHTTPSErrors:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 const seq=page.locator('#same-arc-story'),svg=seq.locator('svg'),slider=seq.locator('input');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});await seq.locator('[data-reset]').click();await expect(page.locator('#lesson-3 > figure')).toBeHidden();await expect(seq.locator('.angle-story-count')).toHaveText('1 / 5');
  for(let v=35;v<=145;v+=5){
   await seq.locator('[data-jump="0"]').click();await seq.locator('[data-next]').click();await slider.fill(String(v));await expect(seq.locator('.angle-story-count')).toHaveText('2 / 5');
   for(let i=1;i<=4;i++){
    const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,v,i,g}));
    const pts=await svg.evaluate(e=>{const pair=s=>{const l=e.querySelector(s);return l?[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]:null;};return {pa:pair('[data-pa]'),pb:pair('[data-pb]'),qa:pair('[data-qa]'),qb:pair('[data-qb]'),span:e.querySelector('[data-seen-arc]').getTotalLength()/105*180/Math.PI,central:e.querySelector('[data-centre-arc]')?.getTotalLength()/30*180/Math.PI};});
    assert(Math.abs(angle(pts.pa[1],pts.pa[0],pts.pb[1])-60)<1e-4);assert(Math.abs(pts.span-(i>=3?240:120))<.2);if(i>=2)assert(Math.abs(pts.central-(i>=3?240:120))<.2);
    if(i>=3)assert(Math.abs(angle(pts.qa[1],pts.qa[0],pts.qb[1])-120)<1e-4);
    for(const p of [pts.pa[0],pts.pa[1],pts.pb[1]])assert(Math.abs(Math.hypot(p[0]-275,p[1]-205)-105)<1e-4);
    await expect(svg.locator('[data-previous]')).toHaveCount(i<=2&&v!==75?1:0);await expect(seq.locator('.angle-story-formula')).toBeVisible({visible:i===4});
    if(i===1)await expect(svg).not.toContainText('60°');if(i===2)await expect(svg).toContainText('120° ÷ 2 ＝ 60°');if(i===3)await expect(svg).toContainText('Qの円周角：？');if(i===4)await expect(svg).toContainText('240° ÷ 2 ＝ 120°');
    if([35,75,135,145].includes(v))await svg.screenshot({path:`test-results/circle/same-arc-${width}-${v}-${i}.png`});
    await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');
   }
  }
  await seq.locator('[data-back]').click();await expect(svg).toContainText('Qの円周角：？');await seq.locator('[data-next]').click();await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('設定');await expect(page.locator('dialog[open]')).toContainText('240° ÷ 2 ＝ 120°');await page.keyboard.press('Escape');
  await seq.locator('[data-jump="0"]').click();await seq.locator('[data-next]').click();await seq.locator('[data-next]').click();await slider.focus();await page.keyboard.press('ArrowLeft');await expect(seq.locator('.angle-story-count')).toHaveText('2 / 5');await expect(svg).not.toContainText('60°');
  await seq.locator('[data-jump="3"]').click();await expect(seq.locator('.angle-story-count')).toHaveText('4 / 5');await expect(svg).toContainText('Qの円周角：？');await seq.locator('[data-reset]').click();await expect(slider).toHaveValue('135');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 for(const href of ['#q5','#q8','#proof-lab','#move-lab']){await seq.locator(`a[href="${href}"]`).click();await expect(page.locator(href)).toBeInViewport();}
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-3 > figure')).toBeVisible();const nojs=await browser.newPage({javaScriptEnabled:false,ignoreHTTPSErrors:true});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#lesson-3 > figure')).toBeVisible();assert.deepEqual(errors,[]);
 console.log('PASS same arc: 23 positions × four comparison stages × three widths, independent inscribed angles and reflex arcs, ghost, reveal reset, labels, controls, zoom, links, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
