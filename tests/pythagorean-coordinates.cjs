const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/pythagorean/index.html#lesson-10`;
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 const seq=page.locator('#coordinate-sequence'),plot=page.locator('#coordinate-plot');
 const expected=[null,'横：4 − (−2) ＝ 6','縦：9 − 1 ＝ 8','AH ＝ 6 ／ HB ＝ 8','AB² ＝ 6² ＋ 8²','AB² ＝ 36 ＋ 64','AB² ＝ 100','AB ＝ √100 ＝ 10'];
 for(const width of [1440,768,390]){
 await page.setViewportSize({width,height:1100});await page.locator('#coordinate-reset').focus();await page.keyboard.press('Enter');
 for(let i=0;i<8;i++){
 await expect(seq).toBeVisible();await expect(page.locator('#lesson-10 .height-static')).toBeHidden();await expect(seq).toHaveAttribute('data-step',String(i));await expect(page.locator('#coordinate-count')).toHaveText(`${i+1} / 8`);
 await expect(plot.locator('[data-horizontal]')).toHaveCount(i>=1?1:0);await expect(plot.locator('[data-vertical]')).toHaveCount(i>=2?1:0);await expect(plot.locator('[data-right]')).toHaveCount(i>=3?1:0);await expect(plot.locator('[data-triangle]')).toHaveCount(i>=3?1:0);
 if(i===0)await expect(page.locator('#coordinate-calculation')).toBeHidden();else await expect(page.locator('#coordinate-formula')).toHaveText(expected[i]);
 if(i>=5)await expect(page.locator('#coordinate-previous')).toHaveText('ひとつ前：'+expected[i-1]);
 assert.equal((await plot.textContent()).includes('AB = 10'),i===7);if(i<7)await expect(page.locator('#coordinate-practice')).toBeHidden();else await expect(page.locator('#coordinate-practice')).toBeVisible();
 const g=await plot.evaluate(svg=>{
 const getLine=s=>{const e=svg.querySelector(s+' line');return e?[+e.getAttribute('x1'),+e.getAttribute('y1'),+e.getAttribute('x2'),+e.getAttribute('y2')]:null;};
 const point=name=>{const e=svg.querySelector(`[data-point="${name}"]`);return {x:+e.getAttribute('cx'),y:+e.getAttribute('cy')};};
 const xAxis=getLine('[data-x-axis]'),yAxis=getLine('[data-y-axis]'),a=point('A'),b=point('B'),m=svg.getScreenCTM(),box=svg.getBBox();
 const labels=Array.from(svg.querySelectorAll('text'),e=>e.getBBox());
 const overlap=labels.some((a,i)=>labels.slice(i+1).some(b=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y));
 const edges=['[data-horizontal]','[data-vertical]','[data-distance]'].map(getLine).filter(Boolean);
 const collision=labels.some(b=>edges.some(([x1,y1,x2,y2])=>{let lo=0,hi=1;for(const [start,end,min,max]of [[x1,x2,b.x-2,b.x+b.width+2],[y1,y2,b.y-2,b.y+b.height+2]]){const d=end-start;if(Math.abs(d)<1e-9){if(start<min||start>max)return false;}else{const t=(min-start)/d,u=(max-start)/d;lo=Math.max(lo,Math.min(t,u));hi=Math.min(hi,Math.max(t,u));if(lo>hi)return false;}}return true;}));
 return {a,b,origin:{x:yAxis[0],y:xAxis[1]},horizontal:getLine('[data-horizontal]'),vertical:getLine('[data-vertical]'),distance:getLine('[data-distance]'),overlap,collision,inside:box.x>=0&&box.y>=0&&box.x+box.width<=640&&box.y+box.height<=480,equal:Math.abs(m.a-m.d)<1e-8};
 });
 // Read coordinates back using the drawn axes, then independently verify the lengths.
 const ux=(g.b.x-g.origin.x)/4,uy=(g.origin.y-g.b.y)/9;assert.equal(ux,uy);assert.equal((g.a.x-g.origin.x)/ux,-2);assert.equal((g.origin.y-g.a.y)/uy,1);
 assert.equal((g.b.x-g.a.x)/ux,6);assert.equal((g.a.y-g.b.y)/uy,8);assert.equal(Math.hypot(g.b.x-g.a.x,g.b.y-g.a.y)/ux,10);
 if(i>=1)assert.deepEqual(g.horizontal,[g.a.x,g.a.y,g.b.x,g.a.y]);if(i>=2)assert.deepEqual(g.vertical,[g.b.x,g.a.y,g.b.x,g.b.y]);assert.deepEqual(g.distance,[g.a.x,g.a.y,g.b.x,g.b.y]);
 assert(g.inside&&g.equal&&!g.overlap&&!g.collision,JSON.stringify(g));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await seq.screenshot({path:`test-results/coordinates-${width}-${i}.png`});
 if(i<7){await page.locator('#coordinate-next').focus();await page.keyboard.press('Enter');}
 }
 await expect(page.locator('#coordinate-next')).toHaveAttribute('aria-disabled','true');await page.keyboard.press('Enter');await expect(seq).toHaveAttribute('data-step','7');
 await seq.locator('.figure-open').click();await expect(page.locator('dialog[open]')).toContainText('AB = 10');await page.keyboard.press('Escape');
 for(let i=6;i>=0;i--){await page.locator('#coordinate-prev').click();await expect(seq).toHaveAttribute('data-step',String(i));await expect(plot).not.toContainText('AB = 10');}
 await page.locator('#coordinate-prev').focus();await page.keyboard.press('Enter');await expect(seq).toHaveAttribute('data-step','0');
 await seq.locator('summary').click();await expect(seq.locator('details ol')).toContainText('AB＝10');await page.locator('#coordinate-next').click();await page.locator('#coordinate-reset').click();await expect(seq.locator('details')).not.toHaveAttribute('open','');
 }
 for(let i=0;i<7;i++)await page.locator('#coordinate-next').click();
 await page.locator('#coordinate-practice a[href="#q19"]').click();await expect(page.locator('#q19')).toBeFocused();
 await page.goto(url);await page.locator('#coordinate-reset').click();for(let i=0;i<7;i++)await page.locator('#coordinate-next').click();await page.locator('#coordinate-practice a[href="#q20"]').click();await expect(page.locator('#q20')).toBeFocused();
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-10 .height-static')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url);await expect(nojs.locator('#lesson-10 .height-static')).toBeVisible();await expect(nojs.locator('#coordinate-sequence')).toBeHidden();
 assert.deepEqual(errors,[]);console.log('PASS coordinates: 8 stages, axis units and coordinates, triangle and distance, no early answer, labels, 3 widths, keyboard/back/reset/zoom, paper questions, print/no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
