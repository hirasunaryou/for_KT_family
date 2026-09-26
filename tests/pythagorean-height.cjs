const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}/study/math/pythagorean/index.html#lesson-7`;
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);const plot=page.locator('#height-plot'),next=page.locator('#height-next'),prev=page.locator('#height-prev');
  await expect(page.locator('#height-sequence')).toBeVisible();await expect(page.locator('#lesson-7 .height-static')).toBeHidden();
  await expect(plot.locator('[data-height-edge]')).toHaveCount(0);await expect(page.locator('#height-calculation')).toBeHidden();
  // Measure the actual SVG, independently of the drawing arithmetic.
  const sides=await plot.locator('polygon').first().evaluate(el=>{
   const [a,b,c]=Array.from(el.points);return [Math.hypot(a.x-b.x,a.y-b.y),Math.hypot(a.x-c.x,a.y-c.y),Math.hypot(b.x-c.x,b.y-c.y)];
  });assert(Math.abs(sides[0]/sides[2]-5/6)<1e-10);assert.equal(sides[0],sides[1]);
  async function bounds(){
   const result=await plot.evaluate(svg=>{
    const b=svg.getBBox(),v=svg.viewBox.baseVal,m=svg.getScreenCTM();
    const labels=Array.from(svg.querySelectorAll('text'),el=>{const b=el.getBBox();return {text:el.textContent,x:b.x,y:b.y,w:b.width,h:b.height};});
    const overlaps=[];
    labels.forEach((a,i)=>labels.slice(i+1).forEach(b=>{if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)overlaps.push([a.text,b.text]);}));
    return {inside:b.x>=0&&b.y>=0&&b.x+b.width<=v.width&&b.y+b.height<=v.height,equal:Math.abs(m.a-m.d)<1e-8,overlaps};
   });assert(result.inside&&result.equal,JSON.stringify(result));assert.deepEqual(result.overlaps,[]);
  }
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1000});await page.locator('#height-reset').focus();await page.keyboard.press('Enter');
   for(let step=0;step<6;step++){
    await expect(page.locator('#height-count')).toHaveText(`${step+1} / 6`);
    const labels=await plot.locator('text').allTextContents();
    assert.equal(labels.includes('4'),step>=4);assert.equal(labels.includes('3'),step>=2&&step<=4);
    assert.equal(labels.includes('h'),step>=1&&step<=3);
    await bounds();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(step===1){
     await expect(plot.locator('[data-height-edge]')).toHaveCount(1);
     await expect(page.locator('#height-formula')).toBeHidden();
     assert.equal(await plot.locator('[data-height-edge]').evaluate(el=>getComputedStyle(el).animationName),'height-draw');
    }
    if(step===2)await expect(page.locator('#height-message')).toContainText('合同');
    if(step===3)await expect(page.locator('#height-formula')).toHaveText('h² ＋ 3² ＝ 5²');
    if(step===4){await expect(page.locator('#height-previous')).toContainText('h² ＋ 3² ＝ 5²');await expect(page.locator('#height-formula')).toContainText('h ＝ 4');}
    if(step===5){await expect(page.locator('#height-formula')).toHaveText('面積 ＝ 6 × 4 ÷ 2 ＝ 12');await expect(page.locator('#height-message')).toContainText('全体の6');}
    await page.locator('#height-sequence').screenshot({path:`test-results/height-steps/${width}-${step}.png`,animations:'disabled'});
    if(step<5){await next.focus();await page.keyboard.press('Enter');await expect(next).toBeFocused();}
   }
   await expect(next).toHaveAttribute('aria-disabled','true');await next.focus();await page.keyboard.press('Enter');await expect(page.locator('#height-count')).toHaveText('6 / 6');
   await prev.click();await prev.click();await expect(page.locator('#height-count')).toHaveText('4 / 6');assert(!(await plot.locator('text').allTextContents()).includes('4'));
  }
  await page.locator('#height-sequence .figure-open').click();await expect(page.locator('dialog')).toBeVisible();await expect(page.locator('dialog [data-height-edge]')).toHaveCount(1);await page.keyboard.press('Escape');
  await page.locator('.height-summary summary').click();await expect(page.locator('.height-summary ol')).toContainText('面積は6×4÷2＝12');
  await page.locator('#height-reset').click();await expect(page.locator('.height-summary')).not.toHaveAttribute('open','');
  await expect(page.locator('#height-count')).toHaveText('1 / 6');await expect(page.locator('#height-calculation')).toBeHidden();
  await prev.focus();await page.keyboard.press('Enter');await expect(page.locator('#height-count')).toHaveText('1 / 6');
  await page.emulateMedia({reducedMotion:'reduce'});await next.click();
  assert.equal(await plot.locator('[data-height-edge]').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.emulateMedia({media:'print'});await expect(page.locator('#height-sequence')).toBeHidden();await expect(page.locator('#lesson-7 .height-static')).toBeVisible();
  const nojs=await browser.newContext({javaScriptEnabled:false}),staticPage=await nojs.newPage();await staticPage.goto(url);
  await expect(staticPage.locator('#height-sequence')).toBeHidden();await expect(staticPage.locator('#lesson-7 .height-static')).toBeVisible();await expect(staticPage.locator('#lesson-7 ol')).toContainText('面積は6×4÷2＝12');
  await nojs.close();assert.deepEqual(errors,[]);
  console.log('PASS height reasoning: six stages, answer withholding/back/reset, exact geometry, matched equations, keyboard focus, zoom, no-JS/print, reduced motion, three widths and label bounds');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
