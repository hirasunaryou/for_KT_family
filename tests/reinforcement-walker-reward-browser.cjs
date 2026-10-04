const {chromium,expect}=require('playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');

const root=path.resolve(__dirname,'..');
const output=path.join(root,'test-results');
fs.mkdirSync(output,{recursive:true});

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

function watchErrors(page,errors,label){
  page.on('pageerror',error=>errors.push(`${label} pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error')errors.push(`${label} console: ${message.text()}`);
  });
}

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

function signed(value,digits=3){
  const limit=Math.pow(10,-digits)/2;
  const number=Math.abs(value)<limit?0:value;
  if(number>0)return `+${number.toFixed(digits)}`;
  if(number<0)return `−${Math.abs(number).toFixed(digits)}`;
  return number.toFixed(digits);
}

async function bundleSummary(page,id){
  return page.evaluate(profileId=>{
    const bundle=window.__walkerRewardDebug.bundles[profileId];
    const qValues=Array.from(bundle.engine.q);
    return {
      episodes:bundle.engine.episodes,
      qNonZero:qValues.filter(value=>value!==0).length,
      qFingerprint:qValues.reduce((sum,value,index)=>sum+value*((index%97)+1),0),
      curve:bundle.curve,
      summary:bundle.summary,
      representative:{
        reason:bundle.representative.reason,
        distance:bundle.representative.distance,
        steps:bundle.representative.steps,
        traceLength:bundle.representative.trace.length
      }
    };
  },id);
}

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const rewardUrl=`${base}study/programming/reinforcement-walker/reward.html`;
  const browser=await chromium.launch({
    headless:true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})
  });
  const context=await browser.newContext({reducedMotion:'reduce'});
  const errors=[];
  await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
  try{
    const page=await context.newPage();
    watchErrors(page,errors,'interactive');
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(rewardUrl);
    await expect(page.locator('body')).toHaveClass(/walker-reward-page/);
    await expect(page.locator('#rewardStepCount')).toHaveText('1 / 6');
    await expect(page.locator('#rewardStepDots [data-reward-step]')).toHaveCount(6);
    await expect(page.locator('#rewardNext')).toBeDisabled();
    await expect(page.locator('#rewardStepDots [data-reward-step="5"]')).toBeDisabled();
    assert.equal(await page.evaluate(()=>window.__walkerRewardDebug.TRAIN_EPISODES),5000,'the browser lesson uses the promised 5,000 learning episodes');
    assert.equal(await page.evaluate(()=>window.__walkerRewardDebug.profiles.safe.label),'前進を採点しない','the first profile names the omitted forward reward precisely');
    await expect(page.locator('#rewardSafeResult')).toBeHidden();
    await expect(page.locator('#rewardCurveWrap')).toBeHidden();
    await expect(page.locator('#rewardComparison')).toBeHidden();
    await expect(page.locator('#rewardFinalInsight')).toBeHidden();
    await expect(page.locator('#rewardQBridge')).toBeHidden();
    await expect(page.locator('#rewardMotionArrow')).toHaveAttribute('hidden','');
    await expect(page.locator('#rewardFallMark')).toHaveAttribute('hidden','');
    await expect(page.locator('#rewardScoreTag')).toHaveAttribute('hidden','');
    await expect(page.locator('#rewardPredictionFeedback')).toContainText('まだ結果は見せません');
    await expectNoOverflow(page,'initial reward guide at 1440px');
    await expectHitTargets(page,'#rewardPrev, #rewardNext, #rewardReset','frame controls',3);
    await expectHitTargets(page,'#rewardPredictions [data-prediction]','prediction choices',3);
    await expectHitTargets(page,'#rewardStepDots [data-reward-step]','progress dots',6);

    await page.locator('[data-prediction="still"]').click();
    await expect(page.locator('[data-prediction="still"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('#rewardPredictionFeedback')).toContainText('その場で待つ');
    await expect(page.locator('#rewardNext')).toBeEnabled();
    await page.locator('#rewardNext').click();

    await expect(page.locator('#rewardStepCount')).toHaveText('2 / 6');
    await expect(page.locator('[data-reward-panel="1"]')).toBeVisible();
    await expect(page.locator('#rewardFrameText')).toContainText('自分で探してください');
    await expect(page.locator('#rewardTakeaway')).toContainText('答えを読む前に');
    await expect(page.locator('#rewardFrameText')).not.toContainText('値は0');
    await expect(page.locator('#rewardTakeaway')).not.toContainText('歩くは数に入っていない');
    await expect(page.locator('#rewardBoardForward')).toHaveText(/前進\s*0/);
    await expect(page.locator('#rewardZeroDiscovery')).toBeHidden();
    await expect(page.locator('#rewardNext')).toBeDisabled();
    for(const button of await page.locator('[data-prediction]').all())await expect(button).toBeDisabled();
    await page.locator('#rewardZeroButton').click();
    await expect(page.locator('#rewardZeroDiscovery')).toBeVisible();
    await expect(page.locator('#rewardZeroDiscovery')).toContainText('前へ歩く');
    await page.locator('#rewardNext').click();

    await expect(page.locator('#rewardStepCount')).toHaveText('3 / 6');
    await expect(page.locator('#rewardTakeaway')).toContainText('先に両方を採点');
    await expect(page.locator('#rewardTakeaway')).not.toContainText('待つ方が高得点');
    await expect(page.locator('#rewardActionVerdict')).toBeHidden();
    await expect(page.locator('#rewardQBridge')).toBeHidden();
    await expect(page.locator('#rewardScoreTag')).toHaveAttribute('hidden','');
    await expect(page.locator('#rewardMotionArrow')).toHaveAttribute('hidden','');
    await expect(page.locator('#rewardFallMark')).toHaveAttribute('hidden','');
    await expectHitTargets(page,'[data-reward-panel="2"] [data-score-action]','one-step scoring controls',2);
    await page.locator('[data-score-action="step"]').click();
    await expect(page.locator('#rewardQBridge')).toBeHidden();
    await expect(page.locator('#rewardActionVerdict')).toBeHidden();
    await expect(page.locator('#rewardScoreTag')).not.toHaveAttribute('hidden','');
    await expect(page.locator('#rewardMotionArrow')).not.toHaveAttribute('hidden','');
    await expect(page.locator('#rewardFallMark')).toHaveAttribute('hidden','');
    await page.locator('[data-score-action="wait"]').click();
    await expect(page.locator('#rewardScoreTag')).not.toHaveAttribute('hidden','');
    await expect(page.locator('#rewardMotionArrow')).toHaveAttribute('hidden','');
    await expect(page.locator('#rewardFallMark')).toHaveAttribute('hidden','');
    await expect(page.locator('#rewardActionVerdict')).toBeVisible();
    await expect(page.locator('#rewardActionVerdict')).toContainText('その場で待つ方が高得点');
    const trialRewards=await page.evaluate(()=>({
      step:window.__walkerRewardDebug.trials.step.result.reward,
      wait:window.__walkerRewardDebug.trials.wait.result.reward,
      stepQ:window.__walkerRewardDebug.trials.step.update.value,
      waitQ:window.__walkerRewardDebug.trials.wait.update.value
    }));
    assert(trialRewards.step<0,`the real small step receives a negative score (${trialRewards.step})`);
    assert(trialRewards.wait>0,`the real wait action receives a positive score (${trialRewards.wait})`);
    assert(trialRewards.wait>trialRewards.step,'the flawed reward really ranks waiting above stepping');
    await expect(page.locator('[data-action-score="step"]')).toContainText('−');
    await expect(page.locator('[data-action-score="wait"]')).toContainText('+');
    await expect(page.locator('#rewardQBridge')).toBeVisible();
    await expect(page.locator('#rewardQValues')).toHaveText(`一歩のQ：0 → ${signed(trialRewards.stepQ)} ／ 待つQ：0 → ${signed(trialRewards.waitQ)}`);
    await expect(page.locator('#rewardQBridge')).toContainText('この先どれくらい得しそうか');
    await expect(page.locator('#rewardQBridge')).toContainText('高いQの動きを選びやすくなる');
    await page.locator('#rewardNext').click();

    await expect(page.locator('#rewardStepCount')).toHaveText('4 / 6');
    await expect(page.locator('#rewardTakeaway')).toContainText('結果を見る前に予想');
    await expect(page.locator('#rewardTakeaway')).not.toContainText('動かない攻略');
    await expect(page.locator('#rewardSafeResult')).toBeHidden();
    await expect(page.locator('#rewardTrainSafe')).toBeEnabled();
    await page.locator('#rewardTrainSafe').click();
    await expect(page.locator('#rewardSafeResult')).toBeVisible({timeout:120000});
    await expect(page.locator('#rewardSafeProgress [data-progress-label]')).toHaveText('5,000 / 5,000回');
    await expect(page.locator('#rewardSafeResult [data-result="distance"]')).toHaveText('0.00 m');
    await expect(page.locator('#rewardSafeResult [data-result="falls"]')).toHaveText('0 / 20');
    await expect(page.locator('#rewardSafeResult [data-result="timeouts"]')).toHaveText('20 / 20');
    await expect(page.locator('#rewardSafeResult [data-result="brace"]')).toHaveText('100%');
    await expect(page.locator('#rewardSafePredictionRecall')).toContainText('実際は「その場で待つ」');
    const safe=await bundleSummary(page,'safe');
    assert.equal(safe.episodes,5000,'the no-forward reward really trains for 5,000 episodes');
    assert.equal(safe.curve.length,11,'the no-forward curve includes 0 and every 500-episode checkpoint');
    assert.equal(safe.summary.medianDistance,0,'the no-forward agent learns to stay still');
    assert.equal(safe.summary.falls,0,'the no-forward agent avoids every fall');
    assert.equal(safe.summary.timeouts,20,'the no-forward agent times out in all 20 fair tests');
    assert.equal(safe.summary.averageBraceRate,1,'the no-forward agent chooses brace/wait for every test action');
    assert(safe.qNonZero>0,'the no-forward agent learned a non-empty Q table');
    await expect(page.locator('#rewardCurveWrap')).toBeVisible();
    await expect(page.locator('#rewardCurve .reward-chart-line')).toHaveCount(1);
    await expect(page.locator('#rewardCurve .reward-chart-point')).toHaveCount(11);

    await page.locator('#rewardStepDots [data-reward-step="0"]').click();
    await expect(page.locator('#rewardStepCount')).toHaveText('1 / 6');
    await expect(page.locator('[data-prediction="still"]')).toHaveAttribute('aria-pressed','true');
    for(const button of await page.locator('[data-prediction]').all())await expect(button).toBeDisabled();
    assert.equal(await page.evaluate(()=>window.__walkerRewardDebug.bundles.safe.engine.episodes),5000,'returning to an earlier frame preserves the trained agent');
    await expect(page.locator('#rewardCurveWrap')).toBeHidden();
    await page.locator('#rewardStepDots [data-reward-step="3"]').click();
    await expect(page.locator('#rewardSafeResult')).toBeVisible();
    await expect(page.locator('#rewardSafeResult [data-result="brace"]')).toHaveText('100%');
    await expect(page.locator('#rewardCurveWrap')).toBeVisible();
    await expect(page.locator('#rewardCurve .reward-chart-line')).toHaveCount(1);
    await page.locator('#rewardNext').click();

    await expect(page.locator('#rewardStepCount')).toHaveText('5 / 6');
    await expect(page.locator('#rewardTakeaway')).toContainText('ほかを固定し、一つだけ変える');
    await expect(page.locator('#rewardTakeaway')).not.toContainText('入れた目的だけ');
    await expect(page.locator('#rewardTrainBoth')).toBeDisabled();
    await page.locator('#rewardAddForward').click();
    await expect(page.locator('#rewardBoardForward')).toHaveText(/前進\s*5/);
    await expect(page.locator('#rewardTrainBoth')).toBeEnabled();
    await page.locator('#rewardTrainBoth').click();
    await expect(page.locator('#rewardBothResult')).toBeVisible({timeout:120000});
    await expect(page.locator('#rewardBothProgress [data-progress-label]')).toHaveText('5,000 / 5,000回');
    await expect(page.locator('#rewardBothResult [data-result="finishes"]')).toHaveText('17 / 20');
    const both=await bundleSummary(page,'both');
    assert.equal(both.episodes,5000,'the repaired reward really starts fresh and trains for 5,000 episodes');
    assert.equal(both.curve.length,11,'the repaired reward curve has every checkpoint');
    assert(both.summary.medianDistance>20,`the repaired reward reaches the goal (median ${both.summary.medianDistance})`);
    assert.equal(both.summary.finishes,17,'the repaired reward finishes 17 of the 20 fair tests');
    assert.equal(both.summary.falls,3,'the repaired reward exposes its remaining three falls');
    assert.notEqual(both.qFingerprint,safe.qFingerprint,'changing only the reward produces a different learned Q table');
    await expect(page.locator('#rewardCurve .reward-chart-line')).toHaveCount(2);
    await expect(page.locator('#rewardCurve .reward-chart-point')).toHaveCount(22);
    await page.locator('#rewardNext').click();

    await expect(page.locator('#rewardStepCount')).toHaveText('6 / 6');
    await expect(page.locator('#rewardTakeaway')).toContainText('結果を決めつけずに比べる');
    await expect(page.locator('#rewardTakeaway')).not.toContainText('想定外の攻略法');
    await expect(page.locator('#rewardComparison')).toBeHidden();
    await expect(page.locator('#rewardFinalInsight')).toBeHidden();
    await expect(page.locator('#rewardFallMark')).toHaveAttribute('hidden','');
    await page.locator('#rewardCompareButton').click();
    await expect(page.locator('#rewardComparison')).toBeVisible({timeout:120000});
    await expect(page.locator('#rewardRushProgress [data-progress-label]')).toHaveText('5,000 / 5,000回');
    const rush=await bundleSummary(page,'rush');
    assert.equal(rush.episodes,5000,'the forward-only reward really trains for 5,000 episodes');
    assert.equal(rush.curve.length,11,'the forward-only curve has every checkpoint');
    assert.equal(rush.summary.finishes,0,'the forward-only agent never finishes');
    assert.equal(rush.summary.falls,20,'the forward-only agent falls in all 20 fair tests');
    assert(rush.summary.averageEffort>both.summary.averageEffort*2,`the forward-only agent uses much more effort (${rush.summary.averageEffort} vs ${both.summary.averageEffort})`);
    assert.equal(safe.representative.reason,'timeout','the shared representative seed shows waiting for the no-forward agent');
    assert.equal(both.representative.reason,'finish','the shared representative seed shows a finish for the balanced agent');
    assert.equal(rush.representative.reason,'fall','the shared representative seed shows a fall for the forward-only agent');
    for(const result of [safe,both,rush])assert(result.representative.traceLength>1,'each representative animation is backed by a real engine trace');
    await expect(page.locator('#rewardLanes [data-lane]')).toHaveCount(3);
    await expect(page.locator('#rewardCurveWrap')).toBeVisible();
    const finalChartBox=await page.locator('#rewardCurveWrap').boundingBox();
    assert(finalChartBox&&finalChartBox.width>0&&finalChartBox.height>0,'the final three-profile learning graph is visibly laid out');
    await expect(page.locator('#rewardCurve .reward-chart-line')).toHaveCount(3);
    await expect(page.locator('#rewardCurve .reward-chart-point')).toHaveCount(33);
    await expect(page.locator('#rewardCurveDesc')).toContainText('前進を採点しない');
    await expect(page.locator('#rewardCurveDesc')).toContainText('前進＋安全');
    await expect(page.locator('#rewardCurveDesc')).toContainText('前進だけ');
    await expect(page.locator('#rewardCurveLegend')).toContainText('前進を採点しない');
    await expect(page.locator('[data-lane="safe"]')).toContainText('前進を採点しない');
    await expect(page.locator('#rewardFallMark')).not.toHaveAttribute('hidden','');
    await expect(page.locator('#rewardMotionArrow')).toHaveAttribute('hidden','');
    await expect(page.locator('#rewardScoreTag')).toHaveAttribute('hidden','');
    await expectHitTargets(page,'#rewardMetricChoices [data-metric]','comparison questions',3);
    await page.locator('#rewardMetricChoices [data-metric="fall"]').click();
    await expect(page.locator('#rewardMetricChoices [data-metric="fall"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('#rewardFinalInsight')).toBeVisible();
    await expect(page.locator('#rewardMetricFinding')).toContainText('転倒は 0/20回 → 3/20回 → 20/20回');
    await expect(page.locator('#rewardFinalInsight')).toContainText('先の点ほど少し小さく数えた、点の合計');
    await expect(page.locator('#rewardFinalInsight')).toContainText('報酬 → Qの予想を少し直す');
    await expect(page.locator('#rewardNext')).toHaveText('6コマ完了');

    await page.locator('#rewardStepDots [data-reward-step="2"]').click();
    await expect(page.locator('#rewardStepCount')).toHaveText('3 / 6');
    await expect(page.locator('#rewardQBridge')).toBeVisible();
    await expect(page.locator('#rewardQValues')).toHaveText(`一歩のQ：0 → ${signed(trialRewards.stepQ)} ／ 待つQ：0 → ${signed(trialRewards.waitQ)}`);
    await expect(page.locator('#rewardCurveWrap')).toBeHidden();
    assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(window.__walkerRewardDebug.bundles).map(([id,bundle])=>[id,bundle.engine.episodes]))),{safe:5000,both:5000,rush:5000},'going back preserves all three trained results');
    await page.locator('#rewardStepDots [data-reward-step="3"]').click();
    await expect(page.locator('#rewardSafeResult')).toBeVisible();
    await expect(page.locator('#rewardSafeResult [data-result="brace"]')).toHaveText('100%');
    await expect(page.locator('#rewardCurve .reward-chart-line')).toHaveCount(1);
    await page.locator('#rewardStepDots [data-reward-step="4"]').click();
    await expect(page.locator('#rewardBothResult')).toBeVisible();
    await expect(page.locator('#rewardBothResult [data-result="finishes"]')).toHaveText('17 / 20');
    await expect(page.locator('#rewardCurve .reward-chart-line')).toHaveCount(2);
    await page.locator('#rewardStepDots [data-reward-step="5"]').click();
    await expect(page.locator('#rewardComparison')).toBeVisible();
    await expect(page.locator('#rewardFinalInsight')).toBeVisible();
    await expect(page.locator('#rewardMetricChoices [data-metric="fall"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('#rewardCurve .reward-chart-line')).toHaveCount(3);

    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:1000});
      await expectNoOverflow(page,`completed three-agent comparison at ${width}px`);
      await expect(page.locator('#rewardComparison')).toBeVisible();
      await expect(page.locator('#rewardFinalInsight')).toBeVisible();
      await expect(page.locator('#rewardLanes [data-lane]')).toHaveCount(3);
      await expectHitTargets(page,'#rewardPrev, #rewardNext, #rewardReset',`frame controls at ${width}px`,3);
      await expectHitTargets(page,'#rewardStepDots [data-reward-step]',`progress dots at ${width}px`,6);
      await expectHitTargets(page,'#rewardReplayButton',`replay control at ${width}px`,1);
      await expectHitTargets(page,'#rewardMetricChoices [data-metric]',`metric controls at ${width}px`,3);
      const labBox=await page.locator('#rewardLab').boundingBox();
      assert(labBox&&labBox.width<=width+1,`the reward lab fits the ${width}px viewport`);
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:path.join(output,`walker-reward-${width}.png`),fullPage:true});
    }
    await page.close();

    const keyboardPage=await context.newPage();
    watchErrors(keyboardPage,errors,'keyboard');
    await keyboardPage.setViewportSize({width:390,height:900});
    await keyboardPage.goto(rewardUrl);
    await keyboardPage.locator('[data-prediction="careful"]').click();
    await keyboardPage.locator('.reward-scene-card').focus();
    await keyboardPage.keyboard.press('ArrowRight');
    await expect(keyboardPage.locator('#rewardStepCount')).toHaveText('2 / 6');
    await keyboardPage.locator('.reward-scene-card').focus();
    await keyboardPage.keyboard.press('ArrowLeft');
    await expect(keyboardPage.locator('#rewardStepCount')).toHaveText('1 / 6');
    await expectNoOverflow(keyboardPage,'keyboard-operated guide at 390px');
    await keyboardPage.close();

    const printPage=await context.newPage();
    watchErrors(printPage,errors,'print');
    await printPage.goto(rewardUrl);
    await printPage.emulateMedia({media:'print'});
    await expect(printPage.locator('.reward-print-guide')).toBeVisible();
    await expect(printPage.locator('.reward-lab')).toBeHidden();
    assert.equal(await printPage.locator('[data-reward-static-frame]').count(),6,'printing includes all six reward-design frames');
    await expect(printPage.locator('.reward-print-aha')).toContainText('人の願いを察したのではなく');
    await expect(printPage.locator('.reward-print-aha')).toContainText('先の点ほど少し小さく');
    await printPage.pdf({path:path.join(output,'walker-reward-print.pdf'),format:'A4',printBackground:true});
    await printPage.close();

    const noJsContext=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'});
    await noJsContext.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    const noJsPage=await noJsContext.newPage();
    watchErrors(noJsPage,errors,'no-JavaScript');
    await noJsPage.setViewportSize({width:390,height:900});
    await noJsPage.goto(rewardUrl);
    await expect(noJsPage.locator('.reward-print-guide')).toBeVisible();
    await expect(noJsPage.locator('.reward-lab')).toBeHidden();
    await expect(noJsPage.locator('.reward-interactive-intro')).toBeHidden();
    await expect(noJsPage.locator('.reward-static-intro')).toBeVisible();
    assert.equal(await noJsPage.locator('[data-reward-static-frame]').count(),6,'JavaScript-free readers receive all six reward-design frames');
    const returnLink=noJsPage.locator('[data-close-reward]').first();
    await expect(returnLink).toBeVisible();
    assert.equal(await returnLink.evaluate(element=>element.tagName),'A','the JavaScript-free return control is a real link');
    await expectNoOverflow(noJsPage,'JavaScript-free reward guide at 390px');
    await noJsContext.close();

    assert.deepEqual(errors,[],'the reward-design lesson produces no browser or console errors');
    console.log('PASS walker reward browser: six real steps, three 5,000-episode agents, four widths, keyboard, print and no-JavaScript');
  }finally{
    await context.close();
    await browser.close();
    server.close();
  }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
