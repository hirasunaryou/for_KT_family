const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function inspect(plot){return plot.evaluate(svg=>{
 const boxes=[...svg.querySelectorAll('text')].map(e=>({s:e.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,e.getBBox()[k]]))}));
 const overlaps=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 const collisions=new Set();for(const e of svg.querySelectorAll('line,path,polygon'))for(let i=0;i<=120;i++){const p=e.getPointAtLength(e.getTotalLength()*i/120);for(const t of boxes)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)collisions.add(t.s);}
 const b=svg.getBBox(),v=svg.viewBox.baseVal,m=svg.getScreenCTM();return {overlaps,collisions:[...collisions],inside:b.x>=0&&b.y>=0&&b.x+b.width<=v.width&&b.y+b.height<=v.height,equal:Math.abs(m.a-m.d)<1e-8};
});}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#proof-lab`,page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 const plot=page.locator('#proof-plot');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});
  for(const [kind,count,alpha,beta]of [['single',7,30,0],['inside',8,22,35],['outside',8,80,20]]){
   await page.locator(`[data-proof-case="${kind}"]`).click();await page.locator('#proof-reset').focus();await page.keyboard.press('Enter');let offset=null;
   for(let i=0;i<count;i++){
    await expect(page.locator('#proof-step')).toHaveText(`手順 ${i+1} / ${count}`);
    const y=await plot.evaluate(e=>e.getBoundingClientRect().top-e.closest('.lab').getBoundingClientRect().top);if(offset!==null)assert(Math.abs(y-offset)<1);offset=y;
    const g=await inspect(plot);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.collisions.length,JSON.stringify({kind,i,width,g}));
    await expect(plot.locator('[data-proof-arc]')).toHaveCount(i===count-1?1:0);
    const angle=async(name,wanted)=>{const actual=Number(await plot.locator(`[data-angle="${name}"]`).getAttribute('data-degrees'));assert(Math.abs(actual-wanted)<1e-7,`${name}: ${actual} vs ${wanted}`);};
    if(kind==='single'&&i>=2&&i<=5){await angle('P-base',30);await angle('B-base',30);}
    if(kind!=='single'&&(i===3||i===5)){await angle('P-part',i===3?alpha:beta);await angle('O-part',2*(i===3?alpha:beta));}
    if(kind!=='single'&&i>=6){await angle('P-alpha',alpha);await angle('P-beta',beta);await angle('O-alpha',alpha*2);await angle('O-beta',beta*2);}
    if(i===count-1){const whole=kind==='single'?30:kind==='inside'?alpha+beta:alpha-beta;await angle('P-whole',whole);await angle('O-whole',whole*2);}
    await plot.screenshot({path:`test-results/circle/proof-${kind}-${width}-${i}.png`});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.locator('#proof-next').focus();await page.keyboard.press('Enter');
   }
   await expect(page.locator('#proof-next')).toHaveAttribute('aria-disabled','true');await expect(page.locator('#proof-step')).toHaveText(`手順 ${count} / ${count}`);
   await page.locator('#proof-prev').click();await expect(plot.locator('[data-proof-arc]')).toHaveCount(0);
   await page.locator('#proof-lab .figure-open').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
   await page.locator('#proof-reset').click();await expect(page.locator('#proof-formula')).toBeHidden();await expect(plot.locator('[data-angle]')).toHaveCount(0);
  }
 }
 await page.locator('[data-proof-case=inside]').click();await page.locator('#proof-next').click();await page.locator('[data-proof-case=outside]').click();await page.locator('[data-proof-case=inside]').click();await expect(page.locator('#proof-step')).toHaveText('手順 2 / 8');
 for(const [id,k]of [[4,'single'],[5,'inside'],[6,'outside']]){await page.locator(`#lesson-${id} [data-proof-open]`).click();await expect(page.locator(`[data-proof-case="${k}"]`)).toBeFocused();await expect(page).toHaveURL(/#proof-lab$/);await expect(page.locator('#proof-step')).toContainText('手順 1 /');}
 const mp=page.locator('#move-plot');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1100});
  for(const view of ['p','o','both']){
   await page.locator(`[data-move-view="${view}"]`).focus();await page.keyboard.press('Enter');
   await expect(page.locator('#move-reveal')).toHaveAttribute('aria-pressed','false');
   for(const side of ['major','minor'])for(const v of [0,10,30,50,70,90,100]){
    await page.locator('#move-side').selectOption(side);await page.locator('#move-position').fill(String(v));await expect(page.locator('#move-reveal')).toHaveAttribute('aria-pressed','false');
    await page.locator('#move-reveal').click();const span=side==='major'?120:240;
    await expect(mp.locator('[data-move-p]')).toHaveCount(view==='o'?0:1);await expect(mp.locator('[data-move-o]')).toHaveCount(view==='p'?0:1);
    if(view!=='p'){await expect(mp.locator('[data-move-o]')).toHaveAttribute('data-span',String(span));const d=await mp.locator('[data-move-o] path').getAttribute('d');assert(d.includes(`A 35 35 0 ${span>180?1:0} 0`));}
    await expect(page.locator('#move-result')).toContainText(view==='o'?`${span}°`:`${span/2}°`);
    const g=await inspect(mp);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.collisions.length,JSON.stringify({view,side,v,width,g}));
    if(v===50)await mp.screenshot({path:`test-results/circle/move-${view}-${side}-${width}.png`});
   }
  }
 }
 await page.locator('#move-lab .figure-open').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('#proof-lab a[href="#q11"]').click();await expect(page.locator('#q11')).toBeFocused();
 assert.deepEqual(errors,[]);console.log('PASS circle stories: 23 proof stages × 3 widths; angle geometry, fixed view, labels, boundaries, case memory, reset, zoom, lesson links; 3 arc views × 2 sides × 7 positions × 2 widths');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
