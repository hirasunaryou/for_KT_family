const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
async function inspect(svg){return svg.evaluate(e=>{
 const ts=[...e.querySelectorAll('text')].map(t=>({s:t.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,t.getBBox()[k]]))})),overlaps=[],hits=new Set();
 for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const a=ts[i],b=ts[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.s,b.s]);}
 for(const l of e.querySelectorAll('line,path'))for(let i=0;i<=160;i++){const p=l.getPointAtLength(l.getTotalLength()*i/160);for(const t of ts)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)hits.add(t.s);}
 const b=e.getBBox(),m=e.getScreenCTM(),edges=[...e.querySelectorAll('line')].map(l=>({id:l.getAttribute('data-edge'),points:[[Number(l.getAttribute('x1')),Number(l.getAttribute('y1'))],[Number(l.getAttribute('x2')),Number(l.getAttribute('y2'))]]}));
 return {edges,overlaps,hits:[...hits],inside:b.x>=0&&b.y>=0&&b.x+b.width<=550&&b.y+b.height<=e.viewBox.baseVal.height,equal:Math.abs(m.a-m.d)<1e-8};
 });}
const len=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function angle(a,p,b){const u=[a[0]-p[0],a[1]-p[1]],v=[b[0]-p[0],b[1]-p[1]];return Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))))*180/Math.PI;}
function crossMath(g){const [A,C]=g.edges.find(x=>x.id==='AC').points,[B,D]=g.edges.find(x=>x.id==='BD').points;const t=(A[1]-B[1])/(D[1]-B[1]),X=[B[0]+t*(D[0]-B[0]),A[1]];assert(Math.abs(angle(A,X,B)-angle(D,X,C))<1e-8);assert(Math.abs(angle(X,A,B)-angle(X,D,C))<1e-8);assert(Math.abs(len(D,X)/len(A,X)-2)<1e-8);assert(Math.abs(len(C,X)/len(B,X)-2)<1e-8);assert(Math.abs(len(B,X)/len(A,X)-4/3)<1e-8);return {A,B,C,D,X};}
function clean(g,context){assert(g.inside&&g.equal&&!g.overlaps.length&&!g.hits.length,JSON.stringify({context,g}));}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
  const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/circle/index.html#lesson-10`,p=await browser.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url,{waitUntil:'domcontentloaded'});
  for(const width of [1440,768,390]){
   await p.setViewportSize({width,height:1100});
   for(const [id,lesson,count]of [['chord-story',10,8],['tangent-story',11,5]]){
    const seq=p.locator('#'+id),svg=seq.locator('figure svg').first();await seq.locator('[data-reset]').focus();await p.keyboard.press('Enter');let y0=null;
    for(let i=0;i<count;i++){
     await expect(seq.locator('.angle-story-count')).toHaveText(`${i+1} / ${count}`);await expect(p.locator(`#lesson-${lesson} > figure`)).toBeHidden();
     const y=await svg.evaluate(e=>e.getBoundingClientRect().top-e.closest('article').getBoundingClientRect().top);if(y0!==null)assert(Math.abs(y-y0)<1);y0=y;
     clean(await inspect(svg),{width,id,i});
     if(lesson===10){
      await expect(seq.locator('.example-context')).toContainText('与えられた長さ');await expect(seq.locator('.example-context')).toContainText('AX＝3 cm、DX＝6 cm、BX＝4 cm');
      assert(await seq.locator('.example-context').evaluate(e=>e.getBoundingClientRect().bottom<e.parentElement.querySelector('figure').getBoundingClientRect().top));
      if(i===5)await expect(seq.locator('.angle-story-title')).toHaveText('この例では、6÷3で2倍');
      if(i===5)await seq.screenshot({path:`test-results/circle/chord-context-${width}.png`});
      const original=crossMath(await inspect(svg));await expect(svg.locator('[data-shared-arc]')).toHaveCount(i>=2&&i<=4?1:0);
      const compare=seq.locator('.chord-comparison');if(i<4)await expect(compare).toBeHidden();else{
       await expect(compare).toBeVisible();const view=compare.locator('svg'),g=await inspect(view);clean(g,{width,id,i,view:'comparison'});
       for(let n=0;n<3;n++)assert(Math.abs(len(...g.edges[n+3].points)/len(...g.edges[n].points)-2)<1e-8);
       assert(Math.abs(len(...g.edges[0].points)-len(original.A,original.X))<1e-8);assert(Math.abs(len(...g.edges[1].points)-len(original.B,original.X))<1e-8);
       await view.screenshot({path:`test-results/circle/chord-compare-${width}-${i}.png`});
      }
      if(i<5)await expect(svg.locator('text').filter({hasText:/^[3468?]$/})).toHaveCount(0);
      if(i===6)await expect(seq.locator('.angle-story-formula')).toHaveText('AX：DX ＝ 3：6 ＝ 1：2BX：CX ＝ 4：? ＝ 1：2');
      if(i===7)await expect(seq.locator('.angle-story-formula')).toHaveText('CX ＝ 4 × 2 ＝ 8 cm');
     }else{
      for(let v=40;v<=120;v+=10){await seq.locator('input').fill(String(v));await expect(seq.locator('[data-given-angle]')).toContainText('∠OAB＝'+v/2+'°');const g=await inspect(svg);clean(g,{width,id,i,v});const A=g.edges[1].points[0],B=g.edges[1].points[1],O=[300,205],known=angle(O,A,B),answer=angle([180,45],A,B);assert(Math.abs(known+answer-90)<1e-8);assert(Math.abs(known-Number(await svg.getAttribute('data-known-angle')))<1e-8);assert(Math.abs(answer-Number(await svg.getAttribute('data-answer-angle')))<1e-8);if(i===4)await expect(seq.locator('.angle-story-formula')).toHaveText(`90° − ${v/2}° ＝ ${90-v/2}°`);}
      await expect(svg.locator('[data-radius]')).toHaveCount(i>=1?1:0);await expect(svg.locator('[data-right]')).toHaveCount(i>=2?1:0);await expect(svg.locator('[data-known]')).toHaveCount(i>=3?1:0);await expect(svg.locator('[data-answer]')).toHaveCount(i===4?1:0);
     }
     if(i<4)await expect(seq.locator('.angle-story-formula')).toBeHidden();await svg.screenshot({path:`test-results/circle/${id}-${width}-${i}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     await seq.locator('[data-next]').focus();await p.keyboard.press('Enter');
    }
    await expect(seq.locator('.angle-story-count')).toHaveText(`${count} / ${count}`);await seq.locator('[data-zoom]').click();await expect(p.locator('dialog[open]')).toBeVisible();await p.keyboard.press('Escape');
    if(lesson===10){await seq.locator('[data-compare-zoom]').click();await expect(p.locator('dialog[open]')).toBeVisible();await p.keyboard.press('Escape');for(const n of [0,4,5]){await seq.locator(`[data-jump="${n}"]`).click();await expect(seq.locator('.angle-story-count')).toHaveText(`${n+1} / 8`);}}
    else{await seq.locator('input').focus();await p.keyboard.press('ArrowLeft');await expect(seq.locator('.angle-story-formula')).toHaveText('90° − 55° ＝ 35°');}
    if(lesson===10){await expect(seq.locator('.example-context')).toContainText('求めるもの');await seq.locator('[data-tail-back]').click();await expect(seq.locator('[data-tail-count]')).toHaveText('5 / 8');await seq.locator('[data-tail-next]').focus();await p.keyboard.press('Enter');await expect(seq.locator('.angle-story-count')).toHaveText('6 / 8');await expect(seq.locator('[data-tail-count]')).toHaveText('6 / 8');}
    await seq.locator('summary').click();await expect(seq.locator('details ol')).toBeVisible();await seq.locator('[data-back]').click();await seq.locator('[data-reset]').click();await seq.locator('[data-back]').focus();await p.keyboard.press('Enter');await expect(seq.locator('.angle-story-count')).toHaveText(`1 / ${count}`);await expect(seq.locator('details')).not.toHaveAttribute('open','');
   }
  }
  await p.locator('#chord-story a[href="#q19"]').click();await expect(p.locator('#q19')).toBeFocused();await p.locator('#tangent-story a[href="#q21"]').click();await expect(p.locator('#q21')).toBeFocused();
  await p.emulateMedia({media:'print'});for(const n of [10,11]){await expect(p.locator(`#lesson-${n} > figure`)).toBeVisible();await expect(p.locator(`#lesson-${n} .prior-story`)).toBeHidden();}
  assert.deepEqual(errors,[]);console.log('PASS circle prior learning: 13 stages × 3 widths; similarity measurements and preserved scale, all tangent positions, collisions, controls, zoom, links and print');
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url,{waitUntil:'domcontentloaded'});for(const n of [10,11])await expect(nojs.locator(`#lesson-${n} > figure`)).toBeVisible();console.log('PASS circle prior learning no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
