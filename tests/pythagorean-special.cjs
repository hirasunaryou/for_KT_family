const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/pythagorean/index.html#lesson-6`;
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 assert(!(await page.locator('#lesson-6').innerText()).includes('√'),'Do not reveal the ratios in the opening text');
 for(const width of [1440,768,390]){
 await page.setViewportSize({width,height:1100});
 for(const [id,count,answerStep,radical] of [['square',5,3,'√2'],['equilateral',6,4,'√3']]){
 const seq=page.locator('#'+id+'-sequence'),plot=page.locator('#'+id+'-plot');
 await page.locator('#'+id+'-reset').focus();await page.keyboard.press('Enter');
 for(let i=0;i<count;i++){
 await expect(seq).toBeVisible();await expect(page.locator('#lesson-6 .height-static')).toBeHidden();
 await expect(page.locator('#'+id+'-count')).toHaveText(`${i+1} / ${count}`);
 await expect(plot.locator('[data-auxiliary]')).toHaveCount(i?1:0);
 assert.equal((await plot.textContent()).includes(radical),i>=answerStep);
 if(i<(id==='square'?2:3))await expect(page.locator('#'+id+'-calculation')).toBeHidden();
 if(i===answerStep)await expect(page.locator('#'+id+'-previous')).toBeVisible();
 const m=await plot.evaluate(svg=>{
 const points=Array.from(svg.querySelector('[data-original]').points);
 const lengths=points.map((p,j)=>Math.hypot(p.x-points[(j+1)%points.length].x,p.y-points[(j+1)%points.length].y));
 const labels=Array.from(svg.querySelectorAll('text'),e=>e.getBBox());
 const overlap=labels.some((a,i)=>labels.slice(i+1).some(b=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y));
 const segments=Array.from(svg.querySelectorAll('line'),e=>[{x:e.x1.baseVal.value,y:e.y1.baseVal.value},{x:e.x2.baseVal.value,y:e.y2.baseVal.value}]);
 for(const el of svg.querySelectorAll('polygon')){const pts=Array.from(el.points);pts.forEach((p,i)=>segments.push([p,pts[(i+1)%pts.length]]));}
 const lineCollision=labels.some(b=>segments.some(([p,q])=>{
 let lo=0,hi=1;for(const key of ['x','y']){const d=q[key]-p[key],min=b[key]-2,max=b[key]+(key==='x'?b.width:b.height)+2;if(Math.abs(d)<1e-9){if(p[key]<min||p[key]>max)return false;}else{const a=(min-p[key])/d,c=(max-p[key])/d;lo=Math.max(lo,Math.min(a,c));hi=Math.min(hi,Math.max(a,c));if(lo>hi)return false;}}return true;
 }));
 const box=svg.getBBox(),matrix=svg.getScreenCTM();
 return {lengths,overlap,lineCollision,inside:box.x>=0&&box.y>=0&&box.x+box.width<=640&&box.y+box.height<=420,equal:Math.abs(matrix.a-matrix.d)<1e-8};
 });
 assert(Math.max(...m.lengths)-Math.min(...m.lengths)<.001);assert(m.inside&&m.equal&&!m.overlap&&!m.lineCollision,JSON.stringify(m));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await seq.screenshot({path:`test-results/special-${id}-${width}-${i}.png`});
 if(i<count-1){await page.locator('#'+id+'-next').focus();await page.keyboard.press('Enter');}
 }
 await expect(page.locator('#'+id+'-next')).toHaveAttribute('aria-disabled','true');
 await page.keyboard.press('Enter');await expect(page.locator('#'+id+'-count')).toHaveText(`${count} / ${count}`);
 const explorer=seq.locator('.ratio-explorer');await expect(explorer).toBeVisible();await explorer.locator('summary').click();
 for(const k of [.5,1,1.5,2]){
  await explorer.locator('input').fill(String(k));await expect(explorer.locator('[data-ratio-reveal]')).toHaveAttribute('aria-pressed','false');
  const geometry=await explorer.locator('svg').evaluate(svg=>{
   const ps=Array.from(svg.querySelector('[data-ratio-triangle]').points),lengths=ps.map((p,i)=>Math.hypot(p.x-ps[(i+1)%3].x,p.y-ps[(i+1)%3].y));
   const texts=Array.from(svg.querySelectorAll('text'),e=>({text:e.textContent,...Object.fromEntries(['x','y','width','height'].map(k=>[k,e.getBBox()[k]]))}));
   const overlaps=[];for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){let a=texts[i],b=texts[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([a.text,b.text]);}
   const collisions=[];for(const e of svg.querySelectorAll('line,polygon,path'))for(let i=0;i<=200;i++){const p=e.getPointAtLength(e.getTotalLength()*i/200);for(const t of texts)if(p.x>t.x-1&&p.x<t.x+t.width+1&&p.y>t.y-1&&p.y<t.y+t.height+1)collisions.push(t.text);}
   const b=svg.getBBox();return {lengths,overlaps,collisions,inside:b.x>=0&&b.y>=0&&b.x+b.width<=640&&b.y+b.height<=490};
  });
  const wanted=id==='square'?[1,1,Math.sqrt(2)]:[1,Math.sqrt(3),2];geometry.lengths.forEach((v,i)=>assert(Math.abs(v-100*k*wanted[i])<.001));
  assert(geometry.inside&&!geometry.overlaps.length&&!geometry.collisions.length,JSON.stringify({id,k,width,geometry}));
  await expect(explorer.locator('[data-ratio-original]')).toHaveCount(k===1?0:1);
  await explorer.locator('[data-ratio-reveal]').focus();await page.keyboard.press('Enter');await expect(explorer.locator('.ratio-result')).toContainText(`3つとも ${k} で割る`);
  const rad=(n,r)=>n===1?r:String(n)+r;
  await expect(explorer.locator('.ratio-result p').first()).toHaveText(id==='square'?`${k} ： ${k} ： ${rad(k,'√2')}`:`${k} ： ${rad(k,'√3')} ： ${2*k}`);
  const norm=explorer.locator('.ratio-result p').last();await expect(norm).toContainText(id==='square'?'1 ： 1 ： √2':'1 ： √3 ： 2');
  await explorer.screenshot({path:`test-results/ratio-${id}-${width}-${k}.png`});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await explorer.locator('[data-ratio-zoom]').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
 await explorer.locator('[data-ratio-reset]').click();await expect(explorer.locator('input')).toHaveValue('1');await expect(explorer.locator('[data-ratio-reveal]')).toHaveAttribute('aria-pressed','false');
 await explorer.locator('input').focus();await page.keyboard.press('ArrowRight');await expect(explorer.locator('input')).toHaveValue('1.5');
 const question=id==='square'?11:12;await explorer.locator(`a[href="#q${question}"]`).click();await expect(page).toHaveURL(new RegExp(`#q${question}$`));await expect(page.locator(`#q${question}`)).toBeFocused();
 await page.locator('#'+id+'-prev').click();await expect(explorer).toBeHidden();await page.locator('#'+id+'-next').click();
 await seq.locator('figure > .figure-open').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
 await seq.locator('.height-summary summary').click();await expect(seq.locator('details ol')).toContainText(radical);
 await page.locator('#'+id+'-reset').click();await expect(plot).not.toContainText(radical);await expect(seq.locator('.height-summary')).not.toHaveAttribute('open','');await expect(explorer).toBeHidden();await expect(explorer).not.toHaveAttribute('open','');
 await page.locator('#'+id+'-next').click();await page.locator('#'+id+'-prev').click();await expect(plot.locator('[data-auxiliary]')).toHaveCount(0);
 }
 }
 await page.locator('#square-next').click();await expect(page.locator('#equilateral-count')).toHaveText('1 / 6');
 await page.emulateMedia({media:'print'});for(const id of ['square','equilateral'])await expect(page.locator('#'+id+'-sequence')).toBeHidden();await expect(page.locator('#lesson-6 .height-static')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url);await expect(nojs.locator('#lesson-6 .height-static')).toBeVisible();
 assert.deepEqual(errors,[]);console.log('PASS special ratios: 11 stages and 2 shapes × 4 multipliers × 3 widths; exact lengths, labels, ratio calculations, keyboard, reset, zoom, paper links, print and no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
