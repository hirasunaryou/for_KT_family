const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');

const root=path.resolve(__dirname,'..');
const output=path.join(root,'test-results');
fs.mkdirSync(output,{recursive:true});
const Engine=require(path.join(root,'assets/reinforcement-walker/engine.js'));
const ACTION_IDS={
  short:'left-short-arms-center',
  long:'left-long-arms-center',
  brace:'brace-arms-center'
};

function actionIndex(id){
  const index=Engine.ACTIONS.findIndex(action=>action.id===id);
  assert(index>=0,`the real engine still has action ${id}`);
  return index;
}

function trialFor(actionId){
  const engine=Engine.createEngine({seed:401,physics:{roughness:0,maxSteps:40,targetDistance:30}});
  const bot=Engine.createBot({seed:402},false);
  const state=Engine.stateIndex(bot);
  const action=actionIndex(actionId);
  const result=Engine.step(engine,bot,action,{seed:403});
  const nextState=result.done?0:Engine.stateIndex(bot);
  const update=Engine.updateQ(engine,state,action,result.reward,nextState,result.done);
  return {actionId,action,state,nextState,result,update};
}

const expected={
  short:trialFor(ACTION_IDS.short),
  long:trialFor(ACTION_IDS.long),
  brace:trialFor(ACTION_IDS.brace)
};

function qAfterShortExperiences(count){
  const engine=Engine.createEngine({seed:401,physics:{roughness:0,maxSteps:40,targetDistance:30}});
  for(let index=0;index<count;index++)Engine.updateQ(engine,expected.short.state,expected.short.action,expected.short.result.reward,expected.short.nextState,expected.short.result.done);
  return engine.q[expected.short.state*Engine.ACTION_COUNT+expected.short.action];
}

function signed(value,digits=3){
  const number=Math.abs(value)<Math.pow(10,-digits)/2?0:value;
  if(number>0)return `+${number.toFixed(digits)}`;
  if(number<0)return `−${Math.abs(number).toFixed(digits)}`;
  return number.toFixed(digits);
}

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

async function expectNoOverflow(page,label){
  const layout=await page.evaluate(()=>({
    documentWidth:document.documentElement.scrollWidth,
    bodyWidth:document.body.scrollWidth,
    viewport:innerWidth
  }));
  assert(layout.documentWidth<=layout.viewport+1&&layout.bodyWidth<=layout.viewport+1,`${label} does not overflow horizontally: ${JSON.stringify(layout)}`);
}

async function expectHitTargets(page,selector,label,expectedCount){
  const boxes=await page.locator(selector).evaluateAll(elements=>elements.map(element=>{
    const style=getComputedStyle(element);
    const rect=element.getBoundingClientRect();
    return {text:element.textContent.trim(),width:rect.width,height:rect.height,display:style.display,visibility:style.visibility};
  }));
  assert.equal(boxes.length,expectedCount,`${label} exposes all ${expectedCount} expected controls`);
  for(const box of boxes){
    assert(box.display!=='none'&&box.visibility!=='hidden'&&box.width>0&&box.height>0,`${label} “${box.text}” is visible`);
    assert(box.height>=43.5,`${label} “${box.text}” is at least 44px high (got ${box.height})`);
  }
}

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const learnUrl=`${base}study/programming/reinforcement-walker/learn.html`;
  const gameUrl=`${base}study/programming/reinforcement-walker/index.html`;
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({reducedMotion:'reduce'});
  const errors=[];
  await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
  try{
    for(const width of [1440,768,390,320]){
      const page=await context.newPage();
      page.on('pageerror',error=>errors.push(`${width}px pageerror: ${error.message}`));
      page.on('console',message=>{if(message.type()==='error')errors.push(`${width}px console: ${message.text()}`);});
      await page.setViewportSize({width,height:900});
      await page.goto(learnUrl);
      await expect(page.locator('body')).toHaveClass(/walker-learn-page/);
      await expect(page.locator('#learnStepCount')).toHaveText('1 / 6');
      await expect(page.locator('#learnStepDots [data-learn-step]')).toHaveCount(6);
      await expect(page.locator('#learnNext')).toBeDisabled();
      await expect(page.locator('#learnStepDots [data-learn-step="5"]')).toBeDisabled();
      await expectNoOverflow(page,`initial AI guide at ${width}px`);
      await expectHitTargets(page,'#learnPrev, #learnNext, #learnReset',`frame controls at ${width}px`,3);
      await expectHitTargets(page,'#learnActionChoices [data-learn-action]',`prediction choices at ${width}px`,3);
      await expectHitTargets(page,'#learnStepDots [data-learn-step]',`progress dots at ${width}px`,6);

      const labBox=await page.locator('#learnLab').boundingBox();
      assert(labBox&&labBox.width<=width+1,`the lab fits the ${width}px viewport`);
      const sceneBox=await page.locator('#learnScene').boundingBox();
      assert(sceneBox&&sceneBox.width<=width+1,`the learning scene fits the ${width}px viewport`);
      await page.locator(`[data-learn-action="left-long-arms-center"]`).click();
      await expect(page.locator(`[data-learn-action="left-long-arms-center"]`)).toHaveAttribute('aria-pressed','true');
      await expect(page.locator('#learnNext')).toBeEnabled();

      await page.locator('#learnNext').click();
      await expect(page.locator('#learnStepCount')).toHaveText('2 / 6');
      await expect(page.locator('[data-learn-panel="1"]')).toBeVisible();
      await expect(page.locator('[data-reward-component]')).toHaveCount(4);
      for(const sample of Object.values(expected))await expect(page.locator(`[data-reward-action="${sample.actionId}"]`)).toContainText(signed(sample.result.reward));
      await expect(page.locator('#learnRewardTotal')).toHaveText(signed(expected.long.result.reward));
      await page.locator(`[data-reward-action="${ACTION_IDS.short}"]`).click();
      await expect(page.locator('#learnRewardTotal')).toHaveText(signed(expected.short.result.reward));
      await expect(page.locator('#learnRewardForward')).toHaveText(signed(expected.short.result.components.forward));
      await expect(page.locator('#learnRewardBalance')).toHaveText(signed(expected.short.result.components.balance));
      await expect(page.locator('#learnRewardEnergy')).toHaveText(signed(expected.short.result.components.energy));
      await expect(page.locator('#learnRewardFall')).toHaveText(signed(expected.short.result.components.fall));
      await expect(page.locator('#learnLab')).toContainText(/前進/);
      await expect(page.locator('#learnLab')).toContainText(/転倒/);
      await expectNoOverflow(page,`reward frame at ${width}px`);

      await page.locator('#learnNext').click();
      await expect(page.locator('#learnStepCount')).toHaveText('3 / 6');
      await expect(page.locator('#learnExperienceButton')).toBeVisible();
      await expectHitTargets(page,'#learnExperienceButton',`one-experience control at ${width}px`,1);
      await page.locator('#learnExperienceButton').click();
      await expect(page.locator('#learnExperienceButton')).toBeDisabled();
      await expect(page.locator('#learnNewQ')).toHaveText(signed(expected.short.update.value));
      await expect(page.locator(`[data-q-cell="${ACTION_IDS.short}"] [data-q-value]`)).toHaveText(signed(expected.short.update.value));
      await expectNoOverflow(page,`Q-update frame at ${width}px`);

      await page.locator('#learnNext').click();
      await expect(page.locator('#learnStepCount')).toHaveText('4 / 6');
      await expect(page.locator('#learnRepeatButtons')).toBeVisible();
      await expectHitTargets(page,'#learnRepeatButtons button',`repeat controls at ${width}px`,3);
      await page.locator('#learnRepeatButtons [data-repeat="10"]').click();
      await expect(page.locator('#learnRepeatCount')).toHaveText('11回');
      await expect(page.locator('#learnQMeterPoint')).toHaveText(`Q ${signed(qAfterShortExperiences(11))}`);
      await expectNoOverflow(page,`repetition frame at ${width}px`);

      await page.locator('#learnNext').click();
      await expect(page.locator('#learnStepCount')).toHaveText('5 / 6');
      await expect(page.locator('#learnExploreButton')).toBeVisible();
      await expectHitTargets(page,'#learnExploreButton',`exploration control at ${width}px`,1);
      await page.locator('#learnExploreButton').click();
      await expect(page.locator('#learnExploreButton')).toBeDisabled();
      await expect(page.locator('#learnExploreResult')).toBeVisible();
      await expect(page.locator('#learnExploreNew')).toHaveText(signed(expected.long.update.value));
      await expect(page.locator('#learnLab')).toContainText(/探索|冒険/);
      await expect(page.locator('#learnLab')).toContainText(/大股|左・長/);
      await expectNoOverflow(page,`exploration frame at ${width}px`);

      await page.locator('#learnNext').click();
      await expect(page.locator('#learnStepCount')).toHaveText('6 / 6');
      await expect(page.locator('#learnUnknownButton')).toBeVisible();
      await expectHitTargets(page,'#learnUnknownButton',`unknown-state control at ${width}px`,1);
      await expect(page.locator('#learnFinalInsight')).toBeHidden();
      await page.locator('#learnUnknownButton').click();
      await expect(page.locator('#learnUnknownButton')).toBeDisabled();
      await expect(page.locator('#learnFinalInsight')).toBeVisible();
      await expect(page.locator('#learnUnknownResult')).toContainText('今回は');
      await expect(page.locator('#learnLab')).toContainText(/未経験|未知/);
      await expect(page.locator('#learnLab')).toContainText(/0[.,]00/);
      await expectNoOverflow(page,`unknown-state frame at ${width}px`);

      await page.locator('#learnReset').click();
      await expect(page.locator('#learnStepCount')).toHaveText('1 / 6');
      await page.locator(`[data-learn-action="${ACTION_IDS.short}"]`).click();
      await page.locator('.learn-scene-card').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#learnStepCount')).toHaveText('2 / 6');
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:path.join(output,`walker-learn-${width}.png`),fullPage:true});
      await page.close();
    }

    const printPage=await context.newPage();
    printPage.on('pageerror',error=>errors.push(`print pageerror: ${error.message}`));
    await printPage.goto(learnUrl);
    await printPage.emulateMedia({media:'print'});
    await expect(printPage.locator('.learn-print-guide')).toBeVisible();
    await expect(printPage.locator('.learn-lab')).toBeHidden();
    assert.equal(await printPage.locator('[data-learn-static-frame]').count(),6,'printing includes all six learning frames');
    await printPage.pdf({path:path.join(output,'walker-learn-print.pdf'),format:'A4',printBackground:true});
    await printPage.close();

    const noJsContext=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'});
    await noJsContext.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    const noJsPage=await noJsContext.newPage();
    await noJsPage.setViewportSize({width:390,height:900});
    await noJsPage.goto(learnUrl);
    await expect(noJsPage.locator('.learn-print-guide')).toBeVisible();
    await expect(noJsPage.locator('.learn-lab')).toBeHidden();
    await expect(noJsPage.locator('.learn-interactive-intro')).toBeHidden();
    await expect(noJsPage.locator('.learn-static-intro')).toBeVisible();
    assert.equal(await noJsPage.locator('[data-learn-static-frame]').count(),6,'JavaScript-free readers receive all six frames');
    const returnLink=noJsPage.locator('a[href^="index.html"]').first();
    await expect(returnLink).toBeVisible();
    assert.equal(await returnLink.evaluate(element=>element.tagName),'A','the JavaScript-free return control is a real link');
    await expectNoOverflow(noJsPage,'JavaScript-free guide at 390px');
    await noJsContext.close();

    const game=await context.newPage();
    game.on('pageerror',error=>errors.push(`game pageerror: ${error.message}`));
    game.on('console',message=>{if(message.type()==='error')errors.push(`game console: ${message.text()}`);});
    await game.setViewportSize({width:390,height:900});
    await game.goto(gameUrl);
    await game.evaluate(()=>{window.__walkerSessionMarker='keep-the-learning-session';});
    const popupPromise=context.waitForEvent('page');
    await game.locator('.recommended-entrance[href^="learn.html"]').click();
    const learnPopup=await popupPromise;
    learnPopup.on('pageerror',error=>errors.push(`popup pageerror: ${error.message}`));
    learnPopup.on('console',message=>{if(message.type()==='error')errors.push(`popup console: ${message.text()}`);});
    await learnPopup.waitForLoadState('domcontentloaded');
    await expect(learnPopup).toHaveURL(/reinforcement-walker\/learn\.html$/);
    assert.equal(await game.evaluate(()=>window.__walkerSessionMarker),'keep-the-learning-session','opening the guide preserves the in-memory game session');
    assert(await learnPopup.evaluate(()=>Boolean(window.opener)),'the separate learning guide keeps an opener for returning to the same game tab');
    const closePromise=learnPopup.waitForEvent('close');
    await learnPopup.locator('.learn-heading [data-close-learn]').click();
    await closePromise;
    await expect(game).toHaveURL(/reinforcement-walker\/index\.html#trainingControls$/);
    assert.equal(await game.evaluate(()=>window.__walkerSessionMarker),'keep-the-learning-session','returning from the guide does not reload the game');
    await game.close();

    assert.deepEqual(errors,[],'the AI learning guide produces no browser errors');
    console.log('PASS walker AI learning guide browser: four widths, six frames, print, no-JavaScript and preserved game tab');
  }finally{
    await context.close();
    await browser.close();
    server.close();
  }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
