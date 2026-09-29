const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path,circle'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].slice(0,4).map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=550&&b.y+b.height<=490,equal:Math.abs(m.a-m.d)<1e-8};
});}

const angle=(a,p,b)=>Math.atan2(Math.abs((a[0]-p[0])*(b[1]-p[1])-(a[1]-p[1])*(b[0]-p[0])),(a[0]-p[0])*(b[0]-p[0])+(a[1]-p[1])*(b[1]-p[1]))*180/Math.PI;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#lesson-8`,page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded'});
 const seq=page.locator('#converse-story'),svg=seq.locator('svg'),slider=seq.locator('input');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});await seq.locator('[data-reset]').click();await expect(page.locator('#lesson-8 > figure')).toBeHidden();
  for(const mode of ['same','different','opposite']){
   await seq.locator('[data-converse="'+mode+'"]').click();
   for(let v=105;v<=160;v+=5){
    await slider.fill(String(v));await expect(seq.locator('.angle-story-count')).toHaveText('1 / 3');await expect(svg.locator('[data-converse-circle]')).toHaveCount(0);
    for(let i=0;i<3;i++){
     const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,mode,v,i,g}));
     const pts=await svg.evaluate(e=>{const endpoints=s=>{const l=e.querySelector(s);return [[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]];};return {pa:endpoints('[data-pa]'),pb:endpoints('[data-pb]'),qa:endpoints('[data-qa]')};});
     const [p,a]=pts.pa,b=pts.pb[1],q=pts.qa[0],qa=angle(a,q,b);
     assert(Math.abs(angle(a,p,b)-48)<1e-4);assert(Math.abs(qa-Number(await svg.getAttribute('data-q-angle')))<1e-4);
     assert.equal((p[1]-a[1])*(q[1]-a[1])>0,mode!=='opposite');
     const on=Math.abs(Math.hypot(q[0]-275,q[1]-180)-95)<1e-4;assert.equal(on,mode==='same');
     if(mode!=='different')assert(Math.abs(qa-48)<1e-4);else assert(Math.abs(qa-48)>1);
     await expect(svg.locator('[data-converse-circle]')).toHaveCount(i===2?1:0);await expect(seq.locator('.angle-story-formula')).toBeVisible({visible:i>=1});
     if(i===2){await expect(seq.locator('.angle-story-message')).toContainText(mode==='same'?'定理の逆':mode==='different'?'角が違う':'この48°の例');}
     if(v===145)await svg.screenshot({path:`test-results/circle/converse-${width}-${mode}-${i}.png`});
     await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');
    }
   }
   await seq.locator('[data-back]').click();await expect(svg.locator('[data-converse-circle]')).toHaveCount(0);
   await seq.locator('[data-next]').click();await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('設定');await page.keyboard.press('Escape');
  }
  await slider.focus();await page.keyboard.press('ArrowLeft');await expect(seq.locator('.angle-story-count')).toHaveText('1 / 3');await expect(svg.locator('[data-converse-circle]')).toHaveCount(0);
  await seq.locator('summary').click();await expect(seq.locator('details')).toContainText('90°なら');await seq.locator('[data-reset]').click();await expect(slider).toHaveValue('145');await expect(seq.locator('details')).not.toHaveAttribute('open','');await expect(seq.locator('[data-converse="same"]')).toHaveAttribute('aria-pressed','true');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await seq.locator('a[href="#q16"]').click();await expect(page.locator('#q16')).toBeFocused();await seq.locator('a[href="#diameter-lab"]').click();await expect(page).toHaveURL(/#diameter-lab$/);
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-8 > figure')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#lesson-8 > figure')).toBeVisible();
 assert.deepEqual(errors,[]);console.log('PASS circle converse: three conditions × 12 positions × three stages × three widths; independent angles/circle/side, reveal resets, labels, controls, zoom, links, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

