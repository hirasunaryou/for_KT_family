const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function geometry(svg){return svg.evaluate(e=>{
 const labels=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],b=labels[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path'))for(let i=0;i<=120;i++){const p=l.getPointAtLength(l.getTotalLength()*i/120);for(const t of labels)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].slice(0,4).map(l=>[[l.x1.baseVal.value,l.y1.baseVal.value],[l.x2.baseVal.value,l.y2.baseVal.value]]);return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=550&&b.y+b.height<=420,equal:Math.abs(m.a-m.d)<1e-8};
});}
const point=d=>[Math.cos(d*Math.PI/180),Math.sin(d*Math.PI/180)];
function measured(a,p,b){const u=[a[0]-p[0],a[1]-p[1]],v=[b[0]-p[0],b[1]-p[1]];return Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))))*180/Math.PI;}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#lesson-7`,page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1100});
  for(const [id,lesson,count,values]of [['diameter-story',7,4,[30,65,150]],['cyclic-story',9,6,[4,44,84]]]){
   const seq=page.locator('#'+id),svg=seq.locator('svg'),slider=seq.locator('input');await seq.locator('[data-reset]').focus();await page.keyboard.press('Enter');let offset=null;
   for(let i=0;i<count;i++){
    await expect(seq.locator('.angle-story-count')).toHaveText(`${i+1} / ${count}`);await expect(page.locator(`#lesson-${lesson} > figure`)).toBeHidden();
    const y=await svg.evaluate(e=>e.getBoundingClientRect().top-e.closest('article').getBoundingClientRect().top);if(offset!==null)assert(Math.abs(offset-y)<1);offset=y;
    for(const v of values){
     await slider.fill(String(v));const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({id,i,v,width,g}));
     const actual=id==='diameter-story'?[measured(g.edges[0][0],g.edges[1][0],g.edges[0][1])]:[measured(g.edges[0][1],g.edges[0][0],g.edges[3][0]),measured(g.edges[0][1],g.edges[1][1],g.edges[3][0])];
     // SVGLength exposes float32 coordinates; allow 0.0001° for rendered geometry, far below the displayed precision.
     assert(Math.abs(actual[0]-Number(await svg.getAttribute('data-first-angle')))<1e-4,JSON.stringify({id,i,v,actual,expected:await svg.getAttribute('data-first-angle'),edges:g.edges}));if(actual.length===2)assert(Math.abs(actual[1]-Number(await svg.getAttribute('data-second-angle')))<1e-4);
     if(id==='diameter-story'){await expect(svg.locator('[data-right]')).toHaveCount(i===3?1:0);await expect(svg.locator('[data-semicircle]')).toHaveCount(i>=1?1:0);await expect(svg.locator('[data-central]')).toHaveCount(i>=2?1:0);assert(Math.abs(measured(point(180),point(v),point(0))-90)<1e-8);if(i===3)await expect(seq.locator('.angle-story-formula')).toHaveText('180° ÷ 2 ＝ 90°');}
     else{const a=measured(point(220),point(140),point(v)),c=measured(point(220),point(300),point(v));assert(Math.abs(a+c-180)<1e-8);assert(Math.abs(Number(await svg.getAttribute('data-first-angle'))-a)<1e-8);assert(Math.abs(Number(await svg.getAttribute('data-second-angle'))-c)<1e-8);await expect(svg.locator('[data-arc-a]')).toHaveCount(i===1||i>=3?1:0);await expect(svg.locator('[data-arc-c]')).toHaveCount(i>=2?1:0);if(i===4){await expect(seq.locator('.angle-story-formula')).toContainText(`A：${Math.round(2*a)}° ÷ 2 ＝ ${Math.round(a)}°`.replace(/\.0+°/g,'°'));}if(i===5)await expect(seq.locator('.angle-story-formula')).toContainText('360° ÷ 2 ＝ 180°');}
     if(i<(id==='diameter-story'?3:4))await expect(seq.locator('.angle-story-formula')).toBeHidden();
    }
    await svg.screenshot({path:`test-results/circle/${id}-${width}-${i}.png`});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await seq.locator('[data-next]').focus();await page.keyboard.press('Enter');
   }
   for(let v=Number(await slider.getAttribute('min'));v<=Number(await slider.getAttribute('max'));v+=Number(await slider.getAttribute('step'))){await slider.fill(String(v));const g=await geometry(svg);assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({id,v,width,g}));}
   await expect(seq.locator('.angle-story-count')).toHaveText(`${count} / ${count}`);await seq.locator('[data-zoom]').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
   await slider.focus();await page.keyboard.press('ArrowLeft');await seq.locator('summary').click();await expect(seq.locator('details ol')).toBeVisible();await seq.locator('[data-back]').click();await seq.locator('[data-reset]').click();await expect(seq.locator('details')).not.toHaveAttribute('open','');await expect(seq.locator('.angle-story-count')).toHaveText(`1 / ${count}`);
  }
 }
 await page.locator('#cyclic-story a[href="#q18"]').click();await expect(page.locator('#q18')).toBeFocused();await page.locator('#diameter-story a[href="#diameter-lab"]').click();await expect(page).toHaveURL(/#diameter-lab$/);
 await page.emulateMedia({media:'print'});for(const n of [7,9]){await expect(page.locator(`#lesson-${n} > figure`)).toBeVisible();await expect(page.locator(`#lesson-${n} .angle-story`)).toBeHidden();}
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url);for(const n of [7,9])await expect(nojs.locator(`#lesson-${n} > figure`)).toBeVisible();
 assert.deepEqual(errors,[]);console.log('PASS circle angle links: 10 stages × 3 positions × 3 widths; independent angle measurements, fixed diagrams, labels/edges, controls, zoom, links, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
