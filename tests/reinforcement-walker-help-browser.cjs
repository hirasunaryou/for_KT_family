const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');

const root=path.resolve(__dirname,'..');
const server=http.createServer((request,response)=>{
  const pathname=new URL(request.url,'http://localhost').pathname;
  const file=path.resolve(root,`.${pathname}`);
  if(!file.startsWith(`${root}${path.sep}`)){response.writeHead(403);response.end();return;}
  fs.readFile(file,(error,data)=>{
    if(error){response.writeHead(404);response.end();return;}
    response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
    response.end(data);
  });
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const helpUrl=`${base}study/programming/reinforcement-walker/help.html#push`;
  const gameUrl=`${base}study/programming/reinforcement-walker/index.html`;
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({reducedMotion:'reduce'});
  const errors=[];
  context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
  try{
    for(const width of [1440,768,390,320]){
      const page=await context.newPage();
      page.on('pageerror',error=>errors.push(error.message));
      await page.setViewportSize({width,height:900});
      await page.goto(helpUrl);
      await expect(page.locator('#helpTopicTitle')).toHaveText('一歩で、なぜ右へ進む？');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`help overflows at ${width}px`);

      for(const id of ['helpPrev','helpNext','helpReset']){
        const box=await page.locator(`#${id}`).boundingBox();
        assert(box&&box.height>=44,`${id} is at least 44px high at ${width}px`);
      }
      if(width<=900){
        assert.equal(await page.locator('.help-controls').evaluate(element=>getComputedStyle(element).position),'sticky','mobile controls remain reachable');
        await page.evaluate(()=>scrollTo(0,document.querySelector('.help-stage-grid').getBoundingClientRect().top+scrollY+150));
        const sticky=await page.evaluate(()=>({nav:document.querySelector('.site-return-nav').getBoundingClientRect().bottom,controls:document.querySelector('.help-controls').getBoundingClientRect().top}));
        assert(Math.abs(sticky.nav-sticky.controls)<=2,`mobile controls stick below site navigation at ${width}px`);
      }
      if(width<=660){
        assert.equal(await page.locator('#gaitScene').getAttribute('viewBox'),'160 55 450 350','mobile scene zooms into the action');
        const labBox=await page.locator('#helpLab').boundingBox();
        assert(labBox&&labBox.y<800,`the first interactive frame is discoverable at ${width}px (${labBox&&labBox.y}px)`);
      }

      await page.locator('#helpNext').click();
      await expect(page.locator('#helpStepCount')).toHaveText('2 / 6');
      if(width<=900){
        const sceneBox=await page.locator('#gaitScene').boundingBox();
        assert(sceneBox&&sceneBox.y>=100&&sceneBox.y+sceneBox.height<=900,`the changed scene is visible after advancing at ${width}px`);
      }
      await expect(page.locator('#helpContact')).toBeVisible();
      await expect(page.locator('#helpPushArrow')).toBeHidden();
      const footLabels=await page.evaluate(()=>({left:Number(document.querySelector('#helpLeftFootLabel').getAttribute('x')),right:Number(document.querySelector('#helpRightFootLabel').getAttribute('x'))}));
      assert(footLabels.left>footLabels.right,'the left-foot label follows the forward left foot');
      await page.locator('#helpNext').click();
      await expect(page.locator('#helpPushArrow')).toBeVisible();
      await expect(page.locator('#helpReactionArrow')).toBeHidden();
      await page.locator('#helpNext').click();
      await expect(page.locator('#helpReactionArrow')).toBeVisible();
      await expect(page.locator('#helpTransferPath')).toBeVisible();
      assert.notEqual(await page.locator('#helpReactionArrow').evaluate(element=>getComputedStyle(element).display),'none','ground reaction is visibly rendered');
      const transferOverlapsBody=await page.evaluate(()=>{
        const label=document.querySelector('#helpTransferLabel').getBoundingClientRect();
        return ['helpHead','helpTorso','helpLeftArm','helpRightArm'].some(id=>{
          const part=document.querySelector(`#${id}`).getBoundingClientRect();
          return label.left<part.right&&label.right>part.left&&label.top<part.bottom&&label.bottom>part.top;
        });
      });
      assert(!transferOverlapsBody,'the force-transfer label stays clear of the stick figure');
      assert(/足を前へ押し/.test(await page.locator('#helpStepText').textContent())&&/体へ伝わ/.test(await page.locator('#helpStepText').textContent()),'reaction is explained through the foot');
      if([1440,768,390,320].includes(width))await page.screenshot({path:`test-results/walker-help-reaction-${width}.png`});

      await page.locator('[data-help-step="5"]').click();
      await expect(page.locator('#helpNext')).toContainText('踏ん張り');
      await page.locator('#helpNext').click();
      await expect(page).toHaveURL(/#brace$/);
      await expect(page.locator('#helpStepCount')).toHaveText('1 / 6');
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#helpStepCount')).toHaveText('2 / 6');
      await expect(page.locator('#helpRecovery')).toBeVisible();
      await expect(page.locator('#helpRecoveryLabel')).toHaveText('準備 あと1');
      await page.locator('[data-help-topic="arms"]').click();
      await expect(page.locator('#helpTopicTitle')).toContainText('腕は');
      await page.locator('[data-help-step="2"]').click();
      const leftRotation=await page.locator('#helpRotationPath').getAttribute('d');
      await page.locator('[data-help-step="3"]').click();
      const rightRotation=await page.locator('#helpRotationPath').getAttribute('d');
      assert.notEqual(leftRotation,rightRotation,'opposite arm choices display opposite rotation arrows');
      await page.locator('[data-help-topic="mistakes"]').click();
      await expect(page.locator('#helpTopicTitle')).toContainText('つまずいた');
      await page.locator('[data-help-step="1"]').click();
      await expect(page.locator('#helpRightLeg')).toHaveClass(/help-active-limb/);
      await expect(page.locator('#helpLeftLeg')).not.toHaveClass(/help-active-limb/);
      await expect(page.locator('#helpFailureSequence')).toBeVisible();
      await expect(page.locator('#helpFailureSequence')).toHaveText('左足 ✓ → 右足（準備1）×');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`stepped help overflows at ${width}px`);
      await page.close();
    }

    const printPage=await context.newPage();
    await printPage.goto(helpUrl);
    await printPage.emulateMedia({media:'print'});
    await expect(printPage.locator('.help-print-guide')).toBeVisible();
    await expect(printPage.locator('.help-lab')).toBeHidden();
    assert.equal(await printPage.locator('[data-print-frame]').count(),22,'printing includes the complete 22-frame walkthrough');
    await printPage.pdf({path:'test-results/walker-help-print.pdf',format:'A4',printBackground:true});
    await printPage.close();

    const noJsContext=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'});
    await noJsContext.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    const noJsPage=await noJsContext.newPage();
    await noJsPage.goto(helpUrl);
    await expect(noJsPage.locator('.help-print-guide')).toBeVisible();
    await expect(noJsPage.locator('.help-lab')).toBeHidden();
    await expect(noJsPage.locator('.help-interactive-intro')).toBeHidden();
    await expect(noJsPage.locator('.help-static-intro')).toBeVisible();
    await expect(noJsPage.locator('#helpGuideStart')).toBeVisible();
    assert.equal(await noJsPage.locator('[data-print-frame]').count(),22,'JavaScript-free readers receive all 22 frames');
    assert.equal(await noJsPage.locator('#closeHelp').evaluate(element=>element.tagName),'A','the prominent return control is a working link without JavaScript');
    await noJsPage.locator('#closeHelp').click();
    await expect(noJsPage).toHaveURL(/reinforcement-walker\/index\.html#manualControls$/);
    await noJsContext.close();

    const game=await context.newPage();
    game.on('pageerror',error=>errors.push(error.message));
    await game.setViewportSize({width:390,height:900});
    await game.goto(gameUrl);
    const canvasBox=await game.locator('#world').boundingBox();
    assert(canvasBox&&canvasBox.y<800,`the mobile game remains reachable after the focused HELP entrance (${canvasBox&&canvasBox.y}px)`);
    await game.screenshot({path:'test-results/walker-game-help-entry-390.png'});
    await game.evaluate(()=>{window.__walkerSessionMarker='keep-me';});
    const popupPromise=context.waitForEvent('page');
    await game.locator('.recommended-entrance').click();
    const help=await popupPromise;
    await help.waitForLoadState('domcontentloaded');
    await expect(help).toHaveURL(/help\.html#push$/);
    assert.equal(await game.evaluate(()=>window.__walkerSessionMarker),'keep-me','opening HELP preserves the game page in memory');
    assert(await help.evaluate(()=>Boolean(window.opener)),'HELP keeps an opener so its return button can restore the game tab');
    const closePromise=help.waitForEvent('close');
    await help.locator('#closeHelp').click();
    await closePromise;
    assert.equal(new URL(game.url()).pathname,new URL(gameUrl).pathname,'closing HELP returns to the existing game tab');
    assert.deepEqual(errors,[],'HELP and game produce no browser errors');
    console.log('PASS walker HELP browser: four widths, one-frame reveals, topics, keyboard, preserved game tab');
  }finally{
    await context.close();
    await browser.close();
    server.close();
  }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
