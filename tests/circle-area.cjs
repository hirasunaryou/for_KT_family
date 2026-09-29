const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path,circle'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].slice(0,4).map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=550&&b.y+b.height<=460,equal:Math.abs(m.a-m.d)<1e-8};
});}

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#lesson-12`,page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded'});
 const seq=page.locator('#area-bridge'),svg=seq.locator('svg'),slider=seq.locator('input');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});await seq.locator('[data-reset]').click();
  for(let i=0;i<6;i++){
   await expect(seq.locator('.angle-story-count')).toHaveText(i<4?`${i+1} / 4`:`寄り道 ${i-3} / 2`);
   await expect(seq.locator('.example-context')).toContainText('AP＝6 cm、BP＝8 cm');
   const positions=await seq.evaluate(e=>[e.querySelector('.example-context').getBoundingClientRect().bottom,e.querySelector('svg').getBoundingClientRect().top]);assert(positions[0]<positions[1]);
   await expect(svg.locator('[data-right]')).toHaveCount(i>=1?1:0);
   await expect(svg.locator('[data-copy]')).toHaveCount(i>=4?1:0);
   await expect(seq.locator('.angle-story-formula')).toBeVisible({visible:i===3||i===5});
   for(const v of i>=2?Array.from({length:21},(_,n)=>n*5):[0]){
    if(i>=2)await slider.fill(String(v));
    const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({i,v,width,g}));
    const points=await svg.locator('[data-triangle]').evaluate(e=>[...e.points].map(p=>[p.x,p.y]));
    const [a,p,b]=points,ap=Math.hypot(a[0]-p[0],a[1]-p[1]),bp=Math.hypot(b[0]-p[0],b[1]-p[1]);
    assert(Math.abs(ap-180)<1e-4&&Math.abs(bp-240)<1e-4);
    const cross=(a[0]-p[0])*(b[1]-p[1])-(a[1]-p[1])*(b[0]-p[0]),dot=(a[0]-p[0])*(b[0]-p[0])+(a[1]-p[1])*(b[1]-p[1]);
    assert(Math.abs(dot)<0.02);assert(Math.abs(Math.abs(cross)/2/900-24)<1e-4);
    if(i>=4){const copy=await svg.locator('[data-copy]').evaluate(e=>[...e.points].map(p=>[p.x,p.y]));const q=copy[1];assert(Math.abs(Math.hypot(q[0]-a[0],q[1]-a[1])-240)<1e-4);assert(Math.abs(Math.hypot(q[0]-b[0],q[1]-b[1])-180)<1e-4);}
    if(v===100)assert(Math.abs(a[1]-p[1])<1e-4&&Math.abs(b[0]-p[0])<1e-4);
   }
   if(i>=2)await slider.fill('0');
   await svg.screenshot({path:`test-results/circle/area-${width}-${i}.png`});
   if(i>=2){await seq.locator('[data-horizontal]').click();await svg.screenshot({path:`test-results/circle/area-horizontal-${width}-${i}.png`});await seq.locator('[data-original]').click();await expect(slider).toHaveValue('0');}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(i===3){
    await expect(seq.locator('.area-detour')).toBeVisible();await expect(seq.locator('.area-detour')).toContainText('あえて別の見方');
    await expect(seq.locator('.angle-story-formula')).toContainText('6 × 8 ÷ 2');
    await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');await expect(seq.locator('.angle-story-count')).toHaveText('4 / 4');await expect(svg.locator('[data-copy]')).toHaveCount(0);
    await seq.locator('.area-detour').screenshot({path:`test-results/circle/area-detour-${width}.png`});
    if(width===1440)await seq.screenshot({path:'test-results/circle/area-main-complete.png'});
    await seq.locator('[data-explore]').focus();await page.keyboard.press('Enter');await expect(seq.locator('.angle-story-title')).toBeFocused();
   }else{await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');}
  }
  await expect(seq.locator('.angle-story-formula')).toContainText('48 ÷ 2 ＝ 24 cm²');
  await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('AP＝6 cm');await page.keyboard.press('Escape');
  await slider.fill('55');await seq.locator('[data-return]').click();await expect(seq.locator('.angle-story-count')).toHaveText('4 / 4');await expect(slider).toHaveValue('55');await expect(svg.locator('[data-copy]')).toHaveCount(0);await expect(seq.locator('.angle-story-title')).toBeFocused();
  await seq.locator('[data-jump="2"]').click();await expect(seq.locator('.angle-story-formula')).toBeHidden();await expect(seq.locator('.area-turn-purpose')).toContainText('見やすい向き');await expect(seq.locator('.area-turn-skip')).toBeVisible();
  await slider.focus();await page.keyboard.press('ArrowRight');await expect(slider).toHaveValue('60');
  await seq.locator('[data-jump="3"]').click();await expect(seq.locator('.angle-story-formula')).toBeVisible();await seq.locator('[data-explore]').click();await seq.locator('[data-back]').focus();await page.keyboard.press('Enter');await expect(seq.locator('.angle-story-count')).toHaveText('寄り道 1 / 2');
  await seq.locator('[data-next]').click();await seq.locator('[data-back]').click();await expect(seq.locator('.angle-story-count')).toHaveText('寄り道 1 / 2');
  await seq.locator('summary').click();await expect(seq.locator('details ol')).toBeVisible();await seq.locator('[data-reset]').click();await expect(seq.locator('details')).not.toHaveAttribute('open','');await expect(slider).toHaveValue('0');
 }
 await seq.locator('a[href="#q22"]').click();await expect(page.locator('#q22')).toBeFocused();
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-12 > figure')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#lesson-12 > figure')).toBeVisible();
 assert.deepEqual(errors,[]);console.log('PASS circle area: four main stages + two optional stages, preserved return position, all rotation positions at three widths; fixed lengths/area/perpendicularity, congruent copy, labels, controls, zoom, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
