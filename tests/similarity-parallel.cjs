const {chromium,expect}=require('playwright/test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),M=require('../assets/similarity/model.js');
// An independent cosine calculation checks all slider combinations, including unlocked equality.
const angle=(a,o,b)=>{const x=a.map((n,i)=>n-o[i]),y=b.map((n,i)=>n-o[i]);return Math.acos(Math.max(-1,Math.min(1,(x[0]*y[0]+x[1]*y[1])/(Math.hypot(...x)*Math.hypot(...y)))))*180/Math.PI;};
for(let t=4;t<=16;t++)for(let u=4;u<=16;u++){const v=M.parallel(t/20,u/20);for(const [side,args] of [['left',[[v.A,v.D,v.E],[v.A,v.B,v.C]]],['right',[[v.A,v.E,v.D],[v.A,v.C,v.B]]]]){args.forEach((a,i)=>assert(Math.abs(v.angles[side][i]-angle(...a))<1e-8));assert.equal(Math.abs(v.angles[side][0]-v.angles[side][1])<1e-8,t===u);}}
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.PUBLIC_URL||`http://127.0.0.1:${server.address().port}/study/math/similarity/index.html#parallel-lab`);
const lab=page.locator('#parallel-lab'),plot=page.locator('#parallel-plot'),result=page.locator('#parallel-angle-result');
for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});for(const view of ['left','right','ratios']){
await page.locator(`[data-parallel-view="${view}"]`).focus();await page.keyboard.press('Enter');await page.locator('#parallel-mid').click();
await expect(lab.locator('[data-parallel-view][aria-pressed=true]')).toHaveCount(1);await expect(plot.locator('[data-angle-arc]')).toHaveCount(view==='left'?2:view==='right'?4:6);
if(view==='ratios')await expect(page.locator('#parallel-result')).toBeVisible();else{await expect(page.locator('#parallel-result')).toBeHidden();await expect(result).toContainText(view==='left'?'63.4°':'56.3°');}
for(const broken of [false,true]){if(broken){const before=await page.locator('#parallel-t').inputValue();await page.locator('#parallel-break').click();await expect(page.locator('#parallel-t')).toHaveValue(before);}await expect(plot.locator('[data-angle-arc][stroke-dasharray]')).toHaveCount(broken?(view==='ratios'?2:1):0);
assert(await plot.evaluate(svg=>{const b=svg.getBBox();return b.x>=0&&b.y>=0&&b.x+b.width<=540&&b.y+b.height<=380&&!svg.innerHTML.match(/NaN|Infinity/);}));
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await lab.screenshot({path:`test-results/parallel-${width}-${view}-${broken}.png`});
}
// Unlocked sliders at equal ratios still give parallel lines and equal angle marks.
await page.locator('#parallel-u').evaluate(e=>{e.value=document.getElementById('parallel-t').value;e.dispatchEvent(new Event('input',{bubbles:true}));});await expect(plot.locator('[data-angle-arc][stroke-dasharray]')).toHaveCount(0);await expect(result).toContainText('等し');
// Extremes: the arcs stay inside the SVG, without touching vertex labels.
for(const [t,u]of [['0.2','0.8'],['0.8','0.2'],['0.2','0.2'],['0.8','0.8']]){for(const [id,v]of [['parallel-t',t],['parallel-u',u]])await page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},v);assert(await plot.evaluate(svg=>{const boxes=[...svg.querySelectorAll('text')].map(e=>e.getBBox());return [...svg.querySelectorAll('[data-angle-arc]')].every(p=>{for(let i=0;i<=30;i++){const q=p.getPointAtLength(p.getTotalLength()*i/30);if(boxes.some(b=>q.x>b.x-2&&q.x<b.x+b.width+2&&q.y>b.y-2&&q.y<b.y+b.height+2))return false;}return true;});}));}
}}
await page.locator('#parallel-mid').click();await page.locator('[data-parallel-view=ratios]').click();await lab.locator('summary').click();await lab.locator('a[href="#q17"]').click();await expect(page).toHaveURL(/#q17$/);assert.deepEqual(errors,[]);console.log('PASS similarity parallel: 169 exact angle cases, 3 views × 3 widths, equality/broken/restored, keyboard, extreme arc-label separation, paper link');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
