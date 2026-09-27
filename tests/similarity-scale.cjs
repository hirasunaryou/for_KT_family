const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/similarity/index.html#scale-lab`;await page.goto(url);
 const lab=page.locator('#scale-lab'),plot=page.locator('#scale-plot'),reveal=page.locator('#scale-reveal'),result=page.locator('#scale-result');
 await expect(lab.locator('[data-scale-kind=stretch]')).toHaveAttribute('aria-pressed','true');
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});let offset=null;
  for(const kind of ['stretch','area','volume']){
   await lab.locator(`[data-scale-kind="${kind}"]`).focus();await page.keyboard.press('Enter');
   await expect(reveal).toHaveAttribute('aria-pressed','false');await expect(lab.locator('[data-scale-kind][aria-pressed=true]')).toHaveCount(1);
   const y=await plot.evaluate(e=>e.getBoundingClientRect().top-e.closest('.lab').getBoundingClientRect().top);
   if(offset!==null)assert(Math.abs(y-offset)<1,'diagram must stay in place when switching direction');offset=y;
   for(const k of [.5,1,1.5,2,2.5,3]){
    await page.locator('#scale-k').fill(String(k));await expect(reveal).toHaveAttribute('aria-pressed','false');await expect(result).toContainText('予想');
    const geometry=await plot.evaluate(svg=>{
     const boxes=[...svg.querySelectorAll('text')].map(e=>({text:e.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,e.getBBox()[k]]))}));
     const overlaps=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.text,b.text]);}
     const data=e=>{const b=e.getBBox();return {x:b.x,y:b.y,w:b.width,h:b.height};};
     const b=svg.getBBox();return {original:data(svg.querySelector('[data-scale-original]')),target:data(svg.querySelector('[data-scale-target]')),overlaps,inside:b.x>=0&&b.y>=0&&b.x+b.width<=540&&b.y+b.height<=390};
    });
    assert(geometry.inside&&!geometry.overlaps.length,JSON.stringify({kind,k,width,geometry}));
    const near=(a,b)=>assert(Math.abs(a-b)<.001,`${a} vs ${b}`),g=geometry.target,o=geometry.original;
    near(o.x,65);near(g.x,280);near(o.y+o.h,270);near(g.y+g.h,270);
    near(g.w/o.w,kind==='stretch'?1:k);near(g.h/o.h,k);
    if(kind!=='volume'){near(o.w,45);near(o.h,45);}
    else{near(o.w,45*1.48);near(o.h,45*1.4);}
    await expect(plot.locator('[data-scale-previous]')).toHaveCount(kind==='area'&&k!==1?1:0);
    if(kind==='area'&&k!==1){const prev=await plot.locator('[data-scale-previous]').evaluate(e=>({w:e.getBBox().width,h:e.getBBox().height}));near(prev.w,45);near(prev.h,45*k);}
    await reveal.click();const value=kind==='volume'?k**3:kind==='area'?k*k:k;await expect(result.locator('strong')).toHaveText(`${kind==='volume'?'体積':'面積'}は ${value}倍`);
    await expect(result.locator('.scale-axis-y')).toHaveText('縦'+k);await expect(result.locator('.scale-axis-x')).toHaveText('横'+(kind==='stretch'?1:k));
    if(kind==='volume')await expect(result.locator('.scale-axis-z')).toHaveText('奥行'+k);
    if(k===.5||k===2||k===3)await plot.screenshot({path:`test-results/scale-${width}-${kind}-${k}.png`});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await reveal.click();await expect(result).toContainText('予想');
   }
  }
 }
 await lab.locator('[data-scale="2"]').click();await expect(reveal).toHaveAttribute('aria-pressed','false');
 await lab.locator('summary').click();await lab.locator('a[href="#q28"]').click();await expect(page).toHaveURL(/#q28$/);
 assert.deepEqual(errors,[]);console.log('PASS similarity scale: 3 directions × 6 multipliers × 3 widths; fixed scale/position, previous outline, labels, formulas, reveal reset, keyboard and paper link');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
