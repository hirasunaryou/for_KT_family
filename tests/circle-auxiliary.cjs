const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path,circle'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].slice(0,4).map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=550&&b.y+b.height<=400,equal:Math.abs(m.a-m.d)<1e-8};
});}

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#proof-lab`,page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded'});
 const d=page.locator('#auxiliary-detour'),svg=d.locator('svg');
 await expect(d).not.toHaveAttribute('open','');await expect(svg).toBeHidden();
 await page.locator('[data-proof-case="inside"]').click();await page.locator('#proof-next').click();await page.locator('#proof-next').click();
 const proof=await page.locator('#proof-plot').innerHTML();
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});await d.locator('summary').focus();await page.keyboard.press('Enter');
  for(const mode of ['none','radius','chord']){
   await d.locator('[data-aux="'+mode+'"]').focus();await page.keyboard.press('Enter');
   await expect(d.locator('[data-aux="'+mode+'"]')).toHaveAttribute('aria-pressed','true');
   const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({width,mode,g}));
   await expect(svg.locator('[data-aux-right]')).toHaveCount(mode==='chord'?1:0);
   await expect(svg.locator('[data-aux-angle]')).toHaveCount(mode==='radius'?2:0);
   if(mode==='radius'){
    const pts=await svg.locator('polygon').evaluate(e=>[...e.points].map(p=>[p.x,p.y]));const [p,o,b]=pts;
    assert(Math.abs(Math.hypot(p[0]-o[0],p[1]-o[1])-Math.hypot(b[0]-o[0],b[1]-o[1]))<1e-4);
    for(const a of await svg.locator('[data-aux-angle]').evaluateAll(es=>es.map(e=>Number(e.dataset.degrees))))assert(Math.abs(a-30)<1e-8);
    await expect(d.locator('.auxiliary-result')).toContainText('同じ円の半径');
   }
   if(mode==='chord'){
    const [p,a,b]=await svg.locator('polygon').evaluate(e=>[...e.points].map(p=>[p.x,p.y]));
    assert(Math.abs((p[0]-b[0])*(a[0]-b[0])+(p[1]-b[1])*(a[1]-b[1]))<0.01);
    await expect(d.locator('.auxiliary-result')).toContainText('面積や三平方');
   }
   assert.equal(await page.locator('#proof-plot').innerHTML(),proof);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await svg.screenshot({path:`test-results/circle/auxiliary-${width}-${mode}.png`});
  }
  if(width===1440)await d.screenshot({path:'test-results/circle/auxiliary-open.png'});
  await d.locator('[data-aux-zoom]').click();await expect(page.locator('dialog[open]')).toContainText('基本形');await page.keyboard.press('Escape');
  await d.locator('[data-aux-close]').click();await expect(d).not.toHaveAttribute('open','');await expect(d.locator('summary')).toBeFocused();assert.equal(await page.locator('#proof-plot').innerHTML(),proof);
 }
 await page.emulateMedia({media:'print'});await expect(d).toBeHidden();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url,{waitUntil:'domcontentloaded'});await expect(nojs.locator('#auxiliary-detour')).toHaveCount(0);await expect(nojs.locator('#lesson-4 > figure')).toBeVisible();
 assert.deepEqual(errors,[]);console.log('PASS auxiliary detour: three choices × three widths, equal radii/angles and right angle independently checked, labels, proof preservation, keyboard, close, zoom, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

