const {chromium, expect}=require('playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');

const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
  res.end(fs.readFileSync(file));
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:800}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    for(const course of ['python-dice-vault','python-maze-robot','python-pixel-monster']){
      for(const hash of ['#mission-2','#setup','#play',...Array.from({length:6},(_,i)=>`#mission-${i+1}`).filter(h=>h!=='#mission-2')]){
        await page.goto('about:blank');
        await page.goto(`${base}study/programming/${course}/index.html${hash}`);
        const main=page.locator('#main');
        const originalMain=await main.elementHandle();
        const heading=await main.locator('h1').textContent();
        // An open explanation must survive the skip; it is not a chapter change.
        const details=main.locator('details').first();
        await details.evaluate(el=>el.open=true);
        await page.keyboard.press('Tab');
        await expect(page.locator('.skip')).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(main).toBeFocused();
        assert.equal(new URL(page.url()).hash,hash,`${course}: current chapter hash must remain`);
        assert(await originalMain.evaluate(el=>el.isConnected),`${course}: skip must not rerender the chapter`);
        await expect(main.locator('h1')).toHaveText(heading);
        await expect(details).toHaveAttribute('open','');
        const top=await main.evaluate(el=>el.getBoundingClientRect().top);
        assert(Math.abs(top)<=1,`${course}: main content should scroll into view (${top})`);
        await page.keyboard.press('Tab');
        assert(await main.evaluate(el=>el.contains(document.activeElement)),`${course}: Tab must continue inside the main content`);
        await originalMain.dispose();
      }
      // Normal chapter links still route after the skip handler is used.
      await page.locator('[data-route="2"]').click();
      await expect(page).toHaveURL(/#mission-3$/);
      await expect(page.locator('[data-route="2"]')).toHaveAttribute('aria-current','step');
    }
    assert.deepEqual(errors,[]);
    console.log('PASS Python skip links: 3 courses × 8 routes, keyboard focus, preserved chapter/details, scrolling and normal routing');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
