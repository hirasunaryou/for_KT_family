const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/pythagorean/index.html#lesson-9`,page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 const seq=page.locator('#circle-length-sequence'),plot=page.locator('#circle-length-plot'),next=page.locator('#circle-length-next'),prev=page.locator('#circle-length-prev'),reset=page.locator('#circle-length-reset');
 const expected={chord:[null,null,null,'AH ＝ HB ＝ 8 ÷ 2 ＝ 4','OH² ＋ 4² ＝ 5²','OH² ＝ 5² − 4²','OH² ＝ 25 − 16','OH² ＝ 9','OH ＝ √9 ＝ 3 cm'],tangent:[null,null,null,'PA² ＋ 5² ＝ 13²','PA² ＝ 13² − 5²','PA² ＝ 169 − 25','PA² ＝ 144','PA ＝ √144 ＝ 12 cm']};
 for(const width of [1440,768,390]){
 await page.setViewportSize({width,height:1100});
 for(const mode of ['chord','tangent']){
 const count=expected[mode].length,last=count-1;
 await seq.locator(`[data-circle-mode="${mode}"]`).click();await reset.focus();await page.keyboard.press('Enter');
 for(let i=0;i<count;i++){
 await expect(seq).toHaveAttribute('data-mode',mode);await expect(seq).toHaveAttribute('data-step',String(i));await expect(page.locator('#circle-length-count')).toHaveText(`${i+1} / ${count}`);await expect(page.locator('#lesson-9 .height-static')).toBeHidden();
 await expect(seq.locator('[aria-pressed="true"]')).toHaveCount(1);await expect(plot.locator('[data-right]')).toHaveCount(i>=2?1:0);await expect(plot.locator('[data-oa]')).toHaveCount(i>=1?1:0);
 if(mode==='chord'){await expect(plot.locator('[data-ob]')).toHaveCount(i>=1?1:0);await expect(plot.locator('[data-oh]')).toHaveCount(i>=2?1:0);await expect(plot.locator('[data-half]')).toHaveCount(i>=3?1:0);}
 const labels=await plot.locator('text').allTextContents();assert.equal(labels.includes(mode==='chord'?'3':'12'),i===last);
 if(!expected[mode][i])await expect(page.locator('#circle-length-calculation')).toBeHidden();else await expect(page.locator('#circle-length-formula')).toHaveText(expected[mode][i]);
 if(i>(mode==='chord'?4:3))await expect(page.locator('#circle-length-previous')).toHaveText('ひとつ前：'+expected[mode][i-1]);
 if(i===last)await expect(page.locator('#circle-length-practice')).toBeVisible();else await expect(page.locator('#circle-length-practice')).toBeHidden();
 const g=await plot.evaluate(svg=>{
 const points=Object.fromEntries(Array.from(svg.querySelectorAll('[data-point]'),e=>[e.dataset.point,{x:+e.getAttribute('cx'),y:+e.getAttribute('cy')}]))
 const c=svg.querySelector('[data-circle]'),radius=+c.getAttribute('r'),box=svg.getBBox(),m=svg.getScreenCTM(),labels=Array.from(svg.querySelectorAll('text'),e=>e.getBBox());
 const overlap=labels.some((a,i)=>labels.slice(i+1).some(b=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y));
 const lines=Array.from(svg.querySelectorAll('line'),e=>[+e.getAttribute('x1'),+e.getAttribute('y1'),+e.getAttribute('x2'),+e.getAttribute('y2')]);
 const collision=labels.some(b=>lines.some(([x1,y1,x2,y2])=>{let lo=0,hi=1;for(const [start,end,min,max]of [[x1,x2,b.x-2,b.x+b.width+2],[y1,y2,b.y-2,b.y+b.height+2]]){const d=end-start;if(Math.abs(d)<1e-9){if(start<min||start>max)return false;}else{const t=(min-start)/d,u=(max-start)/d;lo=Math.max(lo,Math.min(t,u));hi=Math.min(hi,Math.max(t,u));if(lo>hi)return false;}}return true;}));
 // A circle's outline must not pass through any text box.
 const cx=+c.getAttribute('cx'),cy=+c.getAttribute('cy');const arcCollision=labels.some(b=>{const nx=Math.max(b.x-2,Math.min(cx,b.x+b.width+2)),ny=Math.max(b.y-2,Math.min(cy,b.y+b.height+2));const min=Math.hypot(nx-cx,ny-cy),max=Math.max(...[b.x-2,b.x+b.width+2].flatMap(x=>[b.y-2,b.y+b.height+2].map(y=>Math.hypot(x-cx,y-cy))));return min<=radius&&max>=radius;});
 return {points,radius,overlap,collision,arcCollision,inside:box.x>=0&&box.y>=0&&box.x+box.width<=640&&box.y+box.height<=520,equal:Math.abs(m.a-m.d)<1e-8};
 });
 const {O,A,B,H,P}=g.points,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),dot=(a,o,b)=>(a.x-o.x)*(b.x-o.x)+(a.y-o.y)*(b.y-o.y),scale=g.radius/5;
 assert.equal(dist(O,A),g.radius);
 if(mode==='chord'){assert.equal(dist(O,B),g.radius);assert.equal(dist(A,B)/scale,8);if(i>=2){assert(Math.abs(dot(O,H,A))<1e-8);assert.equal(dist(O,H)/scale,3);assert.equal(dist(A,H),dist(B,H));assert.equal(dist(A,H)/scale,4);}}
 else{assert.equal(dist(O,P)/scale,13);assert.equal(dist(P,A)/scale,12);assert(Math.abs(dot(O,A,P))<1e-8);}
 assert(g.inside&&g.equal&&!g.overlap&&!g.collision&&!g.arcCollision,JSON.stringify({mode,i,width,...g}));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await seq.screenshot({path:`test-results/circle-length-${mode}-${width}-${i}.png`});
 if(i<last){await next.focus();await page.keyboard.press('Enter');}
 }
 await expect(next).toHaveAttribute('aria-disabled','true');await page.keyboard.press('Enter');await expect(seq).toHaveAttribute('data-step',String(last));
 await seq.locator('.figure-open').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
 for(let i=last-1;i>=0;i--){await prev.click();await expect(seq).toHaveAttribute('data-step',String(i));assert(!(await plot.locator('text').allTextContents()).includes(mode==='chord'?'3':'12'));}
 await prev.focus();await page.keyboard.press('Enter');await expect(seq).toHaveAttribute('data-step','0');
 await next.click();await seq.locator('summary').click();await reset.click();await expect(seq.locator('details')).not.toHaveAttribute('open','');
 }}
 // Switching diagrams preserves independent progress; reset affects only the selected one.
 await next.click();await next.click();await seq.locator('[data-circle-mode="chord"]').click();await expect(seq).toHaveAttribute('data-step','0');await next.click();await seq.locator('[data-circle-mode="tangent"]').focus();await page.keyboard.press('Space');await expect(seq).toHaveAttribute('data-step','2');await reset.click();await seq.locator('[data-circle-mode="chord"]').click();await expect(seq).toHaveAttribute('data-step','1');
 for(const [mode,q]of [['chord',16],['chord',18],['tangent',17]]){await seq.locator(`[data-circle-mode="${mode}"]`).click();await reset.focus();await page.keyboard.press('Enter');for(let i=1;i<expected[mode].length;i++)await next.click();await page.locator(`#circle-length-practice a[href="#q${q}"]`).click();await expect(page.locator(`#q${q}`)).toBeFocused();await page.goto(url);}
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-9 .height-static')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url);await expect(nojs.locator('#lesson-9 .height-static')).toBeVisible();await expect(nojs.locator('#circle-length-sequence')).toBeHidden();
 assert.deepEqual(errors,[]);console.log('PASS circle lengths: chord/tangent 17 stages, radius/length/orthogonality, no answer leak, no text/edge/circle collisions, 3 widths, mode state, keyboard/back/reset/zoom, question links, print/no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
