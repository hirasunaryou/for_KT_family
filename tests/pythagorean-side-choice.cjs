const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=640&&b.y+b.height<=450,equal:Math.abs(m.a-m.d)<1e-8};
});}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.PUBLIC_URL?{proxy:{server:process.env.HTTPS_PROXY}}:{})});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/pythagorean/index.html#lesson-4`,page=await browser.newPage({reducedMotion:'reduce',ignoreHTTPSErrors:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 const seq=page.locator('#side-choice-sequence'),svg=seq.locator('svg'),slider=seq.locator('input');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});await seq.locator('[data-reset]').click();await expect(page.locator('#lesson-4 > figure')).toBeHidden();
  for(let i=0;i<8;i++){
   await expect(seq.locator('.sequence-count')).toHaveText(`${i+1} / 8`);await expect(seq.locator('.sequence-calculation')).toBeVisible({visible:i>=2});
   const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,i,g}));
   if(i>=2)await expect(seq.locator('.sequence-formula')).toContainText(['x² ＋ 3² ＝ 5²','x² ＋ 9 ＝ 25','x² ＋ 9 − 9 ＝ 25 − 9','x² ＝ 16','x ＝ ±√16 ＝ ±4','x ＞ 0 なので、x ＝ 4'][i-2]);
   if(i>=3)await expect(seq.locator('.sequence-previous')).toContainText('ひとつ前');
   await expect(svg.locator('text').filter({hasText:/^4$/})).toHaveCount(i===7?1:0);
   await expect(seq.locator('[data-root-note]')).toBeVisible({visible:i>=6});
   if(i===6){await expect(svg.locator('text').filter({hasText:/^x$/})).toHaveCount(1);await expect(seq.locator('.sequence-explanation')).toContainText('4²も(−4)²も16');}
   if(i===7){await expect(seq.locator('.sequence-previous')).toContainText('±4');await expect(seq.locator('.sequence-explanation')).toContainText('長さには使えません');}
   await svg.screenshot({path:`test-results/pythagorean/side-choice-${width}-${i}.png`});
   await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');
  }
  for(const solved of [false,true]){
   await seq.locator('[data-jump="0"]').click();await seq.locator('[data-next]').click();if(solved)for(let i=1;i<7;i++)await seq.locator('[data-next]').click();
   for(let rotation=0;rotation<=360;rotation+=15){
    await slider.fill(String(rotation));const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,solved,rotation,g}));
    const [ab,ac,bc]=g.edges,len=([a,b])=>Math.hypot(a[0]-b[0],a[1]-b[1]);assert(Math.abs(len(ab)-180)<1e-4);assert(Math.abs(len(ac)-135)<1e-4);assert(Math.abs(len(bc)-225)<1e-4);
    const u=ab[1].map((v,i)=>v-ab[0][i]),v=ac[1].map((v,i)=>v-ac[0][i]);assert(Math.abs(u[0]*v[0]+u[1]*v[1])<.02);await expect(seq.locator('.sequence-count')).toHaveText(solved?'8 / 8':'2 / 8');
   }
  }
  await seq.locator('[data-back]').click();await expect(svg.locator('text').filter({hasText:/^x$/})).toHaveCount(1);await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('条件');await page.keyboard.press('Escape');
  await slider.focus();await page.keyboard.press('ArrowLeft');await expect(slider).toHaveValue('345');await seq.locator('[data-jump="2"]').click();await expect(seq.locator('.sequence-count')).toHaveText('3 / 8');await expect(slider).toHaveValue('345');
  await seq.locator('[data-reset]').click();await expect(slider).toHaveValue('150');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 for(const href of ['#q6','#q7','#rearrange-lab']){await seq.locator(`a[href="${href}"]`).click();await expect(page.locator(href)).toBeInViewport();}
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-4 > figure')).toBeVisible();await expect(page.locator('#lesson-4 > ol')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false,ignoreHTTPSErrors:true});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#lesson-4 > figure')).toBeVisible();assert.deepEqual(errors,[]);
 console.log('PASS side choice: eight algebra steps with both roots then positive-length selection, 25 rotations × two reveal states × three widths, independent lengths/right angle, labels, previous equations, navigation, zoom, links, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
