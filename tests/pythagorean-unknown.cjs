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
 const url=process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/pythagorean/index.html#lesson-12`;
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 const seq=page.locator('#unknown-sequence'),plot=page.locator('#unknown-plot');
 let triangleColor='';
 const roots=[];for(let x=-10;x<=10;x++)if(x*x+(x+1)**2===25)roots.push(x);assert.deepEqual(roots,[-4,3]);assert.deepEqual(roots.filter(x=>x>0),[3]);
 for(const width of [1440,768,390]){
 await page.setViewportSize({width,height:1100});await page.locator('#unknown-reset').focus();await page.keyboard.press('Enter');
 // The default route must never enter the optional area explanation, even backwards.
 const mainSteps=[0,1,2,3,11,12,13,14,15,16,17,18,19,20,21,22];
 for(const i of mainSteps){await expect(seq).toHaveAttribute('data-step',String(i));await expect(seq).toHaveAttribute('data-branch','main');await expect(plot.locator('[data-expansion]')).toHaveCount(0);await expect(page.locator('#unknown-detour')).toBeHidden();if(i<22)await page.locator('#unknown-next').click();}
 for(const i of [...mainSteps].reverse()){await expect(seq).toHaveAttribute('data-step',String(i));if(i>0)await page.locator('#unknown-prev').click();}
 let previousFormula='';
 for(let i=0;i<23;i++){
 await expect(seq).toBeVisible();await expect(page.locator('#lesson-12 .height-static')).toBeHidden();await expect(seq).toHaveAttribute('data-step',String(i));
 const phase=i<4?[0,4,'図と式']:i<11?[4,7,'補足 · 展開を面積図で確かめる']:i<19?[11,8,'式変形']:[19,4,'解と条件'];
 await expect(page.locator('#unknown-count')).toHaveText(`${i-phase[0]+1} / ${phase[1]}`);await expect(page.locator('#unknown-phase')).toHaveText(phase[2]);
 const labels=await plot.locator('text').allTextContents();assert.equal(labels.includes('3'),i===22);assert.equal(labels.includes('4'),i===22);
 assert.equal((await plot.textContent()).includes('候補 x＝−4'),i>=21);
 await expect(plot.locator('[data-expansion]')).toHaveCount(i>=4&&i<=10?1:0);
 if(i<3)await expect(page.locator('#unknown-calculation')).toBeHidden();
 if(i===3){await expect(page.locator('#unknown-formula')).toHaveText('x² ＋ (x＋1)² ＝ 5²');triangleColor=await plot.locator('[data-focus]').getAttribute('fill');}
 if(i===4){await expect(plot).toContainText('(x＋1)²');await expect(plot.locator('[data-cell]')).toHaveCount(0);await expect(plot.locator('[data-focus]')).toHaveCount(0);}
 if(i===5){await expect(plot.locator('[data-cell]')).toHaveCount(4);await expect(plot).not.toContainText('x²');}
 const products=[['x × x',6],['x × 1',7],['1 × x',7],['1 × 1',8]];
 if(i>=5&&i<=10)for(const [product,at]of products)assert.equal((await plot.textContent()).includes(product),i>=at);
 if(i===6)assert.notEqual(await plot.locator('[data-cell="0"] rect').getAttribute('fill'),triangleColor);
 if(i>=5&&i<=10){const areas=await plot.locator('[data-cell] rect').evaluateAll(cells=>cells.map(c=>c.width.baseVal.value*c.height.baseVal.value));assert.deepEqual(areas.map(a=>a/areas[3]),[9,3,3,1]);assert.equal(areas.reduce((a,b)=>a+b,0),240*240);}
 if(i===9)await expect(page.locator('#unknown-formula')).toHaveText('(x＋1)² ＝ x² ＋ x ＋ x ＋ 1');
 if(i===10)await expect(page.locator('#unknown-formula')).toHaveText('(x＋1)² ＝ x² ＋ 2x ＋ 1');
 if(i===11){await expect(page.locator('#unknown-previous')).toContainText('(x＋1)²');await expect(page.locator('#unknown-formula')).toHaveText('x² ＋ (x²＋2x＋1) ＝ 5²');}
 if(i===15)await expect(page.locator('#unknown-formula')).toHaveText('2x² ＋ 2x ＋ 1 − 25 ＝ 25 − 25');
 if(i===17)await expect(page.locator('#unknown-formula')).toHaveText('(2x² ＋ 2x − 24) ÷ 2 ＝ 0 ÷ 2');
 if(i===21){await expect(page.locator('#unknown-formula')).toContainText('x ＝ −4');await expect(plot).not.toContainText('使えない');}
 if(i===22)await expect(plot).toContainText('長さが負 → 使えない');
 if(i>=12)await expect(page.locator('#unknown-previous')).toContainText(previousFormula);
 const formula=await page.locator('#unknown-formula').innerText();
 // Independently evaluate every displayed equation in the algebra section.
 if(i===9||i===10||(i>=11&&i<=19)){
  const sides=formula.split('＝');assert.equal(sides.length,2);
  const calc=(v,x)=>{let code=v.replace(/\s/g,'').replace(/＋/g,'+').replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/²/g,'**2').replace(/(\d)x/g,'$1*x').replace(/\)\(/g,')*(').replace(/x/g,`(${x})`);assert(/^[0-9()+*/.\-]+$/.test(code));return Function('return '+code)();};
  for(let x=-8;x<=8;x++)assert.equal(Math.abs(calc(sides[0],x)-calc(sides[1],x))<1e-8,i<=10||[-4,3].includes(x));
 }
 previousFormula=formula;
 const visible=!(i>=12&&i<=20);
 if(visible){
 const shape=await plot.evaluate(svg=>{
 const length=s=>{const e=svg.querySelector(s+' line');if(!e)return null;return Math.hypot(e.x2.baseVal.value-e.x1.baseVal.value,e.y2.baseVal.value-e.y1.baseVal.value);};
 const labels=Array.from(svg.querySelectorAll('text'),e=>e.getBBox());const segments=Array.from(svg.querySelectorAll('line'),e=>[{x:e.x1.baseVal.value,y:e.y1.baseVal.value},{x:e.x2.baseVal.value,y:e.y2.baseVal.value}]);
 const overlap=labels.some((a,i)=>labels.slice(i+1).some(b=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y));
 const collision=labels.some(b=>segments.some(([p,q])=>{let lo=0,hi=1;for(const k of ['x','y']){const d=q[k]-p[k],min=b[k]-2,max=b[k]+(k==='x'?b.width:b.height)+2;if(Math.abs(d)<1e-9){if(p[k]<min||p[k]>max)return false;}else{const a=(min-p[k])/d,c=(max-p[k])/d;lo=Math.max(lo,Math.min(a,c));hi=Math.min(hi,Math.max(a,c));if(lo>hi)return false;}}return true;}));
 const box=svg.getBBox(),m=svg.getScreenCTM();return {short:length('[data-short]'),long:length('[data-long]'),diagonal:length('[data-diagonal]'),overlap,collision,inside:box.x>=0&&box.y>=0&&box.x+box.width<=640&&box.y+box.height<=500,equal:Math.abs(m.a-m.d)<1e-8};});
 if(!(i>=4&&i<=10)){assert.equal(shape.short/shape.long,3/4);assert.equal(shape.short**2+shape.long**2,shape.diagonal**2);}assert(shape.inside&&shape.equal&&!shape.overlap&&!shape.collision,JSON.stringify(shape));
 }else await expect(plot).toBeHidden();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await seq.screenshot({path:`test-results/unknown-${width}-${i}.png`});
 if(i===3){await page.locator('#unknown-expansion-open').focus();await page.keyboard.press('Enter');await expect(page.locator('#unknown-title')).toBeFocused();}
 else if(i===10){await page.locator('#unknown-next').click();await expect(seq).toHaveAttribute('data-step','3');await expect(page.locator('#unknown-expansion-open')).toBeFocused();await page.locator('#unknown-next').click();}
 else if(i<22){await page.locator('#unknown-next').focus();await page.keyboard.press('Enter');}
 }
 await expect(page.locator('#unknown-next')).toHaveAttribute('aria-disabled','true');await page.keyboard.press('Enter');await expect(page.locator('#unknown-count')).toHaveText('4 / 4');
 await seq.locator('.figure-open').click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('#unknown-prev').click();await expect(plot).not.toContainText('使えない');
 await seq.locator('summary').click();await expect(seq.locator('details ol')).toContainText('辺は3 cmと4 cm');
 await page.locator('#unknown-reset').click();await expect(seq.locator('details')).not.toHaveAttribute('open','');await expect(plot).not.toContainText('候補');
 }
 // Entry after expansion also restores its own position. Every exit is keyboard-accessible.
 await seq.locator('[data-chapter="11"]').click();await expect(seq).toHaveAttribute('data-step','11');await expect(page.locator('#unknown-formula')).toContainText('x²＋2x＋1');
 await page.locator('#unknown-expansion-open').focus();await page.keyboard.press('Space');await expect(seq).toHaveAttribute('data-step','4');
 await expect(seq.locator('[aria-current="step"]')).toHaveCount(0);await expect(page.locator('#unknown-detour')).toBeVisible();
 await page.locator('#unknown-prev').focus();await page.keyboard.press('Enter');await expect(seq).toHaveAttribute('data-step','4');
 await page.locator('#unknown-next').click();await page.locator('#unknown-next').click();await expect(seq).toHaveAttribute('data-step','6');
 await page.locator('#unknown-prev').click();await expect(seq).toHaveAttribute('data-step','5');
 await page.locator('#unknown-reset').click();await expect(seq).toHaveAttribute('data-step','4');
 await page.locator('#unknown-next').click();await page.locator('#unknown-expansion-close').focus();await page.keyboard.press('Enter');
 await expect(seq).toHaveAttribute('data-step','11');await expect(page.locator('#unknown-expansion-open')).toBeFocused();
 await page.locator('#unknown-prev').click();await expect(seq).toHaveAttribute('data-step','3');await page.locator('#unknown-next').click();
 await page.locator('#unknown-expansion-open').click();for(let i=4;i<10;i++)await page.locator('#unknown-next').click();
 await page.locator('#unknown-next').click();await expect(seq).toHaveAttribute('data-step','11');
 await page.locator('#unknown-expansion-open').click();await page.locator('#unknown-next').click();
 await seq.locator('[data-chapter="19"]').click();await expect(seq).toHaveAttribute('data-step','19');await expect(plot).toBeHidden();await expect(page.locator('#unknown-detour')).toBeHidden();
 await page.locator('#unknown-reset').click();await expect(seq).toHaveAttribute('data-step','0');
 await seq.locator('[data-chapter="11"]').click();await page.locator('#unknown-expansion-open').click();
 await seq.locator('[data-chapter="0"]').click();await expect(seq).toHaveAttribute('data-step','0');
 await page.emulateMedia({media:'print'});await expect(seq).toBeHidden();await expect(page.locator('#lesson-12 .height-static')).toBeVisible();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(url);await expect(nojs.locator('#lesson-12 .height-static')).toBeVisible();
 assert.deepEqual(errors,[]);console.log('PASS unknown lengths: 16 main steps and 7 optional expansion steps, default skip/back, detour return/reset/chapter exits, area meaning and progressive partition, equivalent equations, exact geometry, no false area colors, 3 widths, labels, keyboard, reset, back, zoom, print, no-JS');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
