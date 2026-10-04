const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const pages=['study/index.html','questions/index.html','study/math/index.html','study/programming/index.html',...['square-roots','quadratic-functions','quadratic-equations','similarity','circle','pythagorean'].map(s=>`study/math/${s}/index.html`),...['python-dice','python-dice-jupyter','python-dice-vault','python-maze-robot','python-pixel-monster'].map(s=>`study/programming/${s}/index.html`),'study/programming/python-dice/dice-lab.html','study/programming/reinforcement-walker/index.html','study/programming/reinforcement-walker/help.html','study/programming/reinforcement-walker/learn.html','study/programming/reinforcement-walker/reward.html'];
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.PUBLIC_BASE||`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch({headless:true});
 try{
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const u=route.request().url();return u.startsWith(base)||u.startsWith('blob:')?route.continue():route.abort();});
 for(const width of [1440,768,390]){
 await page.setViewportSize({width,height:900});
 for(const file of pages){
 await page.goto(base+file);const nav=page.locator('.site-return-nav');await expect(nav).toHaveCount(1);await expect(nav).toBeVisible();
 const home=nav.locator('.site-home-link');await expect(home).toHaveText('サイトのトップ');
 const href=await home.getAttribute('href');assert.equal(new URL(href,base+file).pathname,file.endsWith('dice-lab.html')?'/for_KT_family/index.html':new URL(base+'index.html').pathname);
 const links=await nav.locator('a').evaluateAll(es=>es.map(e=>e.href));for(const u of links){assert(!new URL(u).hash);if(u.startsWith(base))assert.equal((await page.request.get(u)).status(),200);}
 const expectedLinks=file.startsWith('study/programming/reinforcement-walker/')?3:file.split('/').length===4?2:1;assert.equal(links.length,expectedLinks,file);
 for(const fraction of [0,.5,1]){
 await page.evaluate(f=>scrollTo({top:f*document.documentElement.scrollHeight,behavior:'instant'}),fraction);
 const g=await nav.evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,left:r.left,right:r.right,bottom:r.bottom,hit:[...el.querySelectorAll('a')].every(a=>{const b=a.getBoundingClientRect();return a.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));})};});
 assert(Math.abs(g.top)<1&&g.left>=0&&g.right<=width+1&&g.hit,JSON.stringify({file,width,fraction,g}));
 if(width>900&&await page.locator('.toc').count()){const toc=await page.locator('.toc').boundingBox();if(toc&&fraction>0)assert(toc.y>=g.bottom&&toc.y+toc.height<=901,JSON.stringify({file,toc,g}));}
 }
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file);
 if(['study/math/pythagorean/index.html','study/math/square-roots/index.html','study/programming/python-pixel-monster/index.html','study/programming/reinforcement-walker/help.html','study/programming/reinforcement-walker/learn.html','study/programming/reinforcement-walker/reward.html'].includes(file))await page.screenshot({path:`test-results/site-nav-${file.endsWith('learn.html')?'walker-learn':file.endsWith('reward.html')?'walker-reward':file.includes('reinforcement-walker')?'walker-help':file.split('/')[2]}-${width}.png`});
 // Returning home clears any chapter hash; square-root legacy redirects must not intercept it.
 if(!file.endsWith('dice-lab.html')){await home.focus();await page.keyboard.press('Enter');await page.waitForURL(base+'index.html');assert.equal(new URL(page.url()).hash,'');}
 }
 }
 // Deep links and changing chapters retain the common bar and leave headings below it.
 for(const file of ['study/math/pythagorean/index.html#lesson-9','study/programming/python-dice-vault/index.html#mission-2']){
 await page.goto(base+file);await expect(page.locator('.site-return-nav')).toBeVisible();
 if(file.includes('pythagorean')){await expect(page.locator('#circle-length-next')).toBeVisible();await page.locator('#circle-length-next').click();await expect(page.locator('#circle-length-sequence')).toHaveAttribute('data-step','1');}
 else{await page.locator('.skip').focus();await page.keyboard.press('Enter');const main=await page.locator('#main').boundingBox(),nav=await page.locator('.site-return-nav').boundingBox();assert(main.y>=nav.y+nav.height);}
 }
 await page.emulateMedia({media:'print'});await expect(page.locator('.site-return-nav')).toBeHidden();
 const nojs=await browser.newPage({javaScriptEnabled:false});for(const file of pages){await nojs.goto(base+file);await expect(nojs.locator('.site-return-nav .site-home-link')).toBeVisible();}
 assert.deepEqual(errors,[]);console.log(`PASS site navigation: ${pages.length} pages, 3 widths, persistent reachable links at top/middle/end, keyboard home, chapter interactions, no-JS, print`);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
