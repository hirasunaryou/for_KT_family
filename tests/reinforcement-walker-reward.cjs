const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');

const root=path.join(__dirname,'..');
const rewardPath=path.join(root,'study/programming/reinforcement-walker/reward.html');
const rewardJsPath=path.join(root,'assets/reinforcement-walker/reward.js');
const rewardCssPath=path.join(root,'assets/reinforcement-walker/reward.css');
const enginePath=path.join(root,'assets/reinforcement-walker/engine.js');
const rewardHtml=fs.readFileSync(rewardPath,'utf8');
const rewardJs=fs.readFileSync(rewardJsPath,'utf8');
const rewardCss=fs.readFileSync(rewardCssPath,'utf8');
const Engine=require(enginePath);

const EXPECTED_REWARDS={
  safe:{forward:0,balance:.08,energy:.12,fall:35},
  both:{forward:5,balance:.08,energy:.12,fall:35},
  rush:{forward:20,balance:0,energy:0,fall:0}
};
const EXPECTED_RESULTS={
  safe:{medianDistance:0,finishes:0,falls:0,timeouts:20,averageEffort:47.824027871878286,reason:'timeout',representativeDistance:0},
  both:{medianDistance:20.031515508478243,finishes:17,falls:3,timeouts:0,averageEffort:294.01513638387263,reason:'finish',representativeDistance:20.10894964433476},
  rush:{medianDistance:4.6838197089107005,finishes:0,falls:20,timeouts:0,averageEffort:826.7030753231778,reason:'fall',representativeDistance:2.174827038324268}
};

function closeTo(actual,expected,message,tolerance=1e-8){
  assert(Number.isFinite(actual),`${message}: the actual value is finite`);
  assert(Math.abs(actual-expected)<=tolerance,`${message}: expected ${expected}, got ${actual}`);
}

function renderedNumber(text,value,digits=3){
  const normalized=String(text).replaceAll('\u2212','-').replaceAll(',','');
  return [2,3,digits].some(places=>normalized.includes(value.toFixed(places)));
}

function actionIndex(id){
  const index=Engine.ACTIONS.findIndex(action=>action.id===id);
  assert(index>=0,`the real engine still has action ${id}`);
  return index;
}

function realTrial(actionId){
  const engine=Engine.createEngine({
    seed:401,
    reward:EXPECTED_REWARDS.safe,
    physics:{roughness:0,maxSteps:40,targetDistance:30}
  });
  const bot=Engine.createBot({seed:402},false);
  const state=Engine.stateIndex(bot);
  const action=actionIndex(actionId);
  const result=Engine.step(engine,bot,action,{seed:403});
  const nextState=result.done?0:Engine.stateIndex(bot);
  const update=Engine.updateQ(engine,state,action,result.reward,nextState,result.done);
  return {...result,state,action,nextState,update};
}

function makeDom(){
  const dom=new JSDOM(rewardHtml,{
    runScripts:'outside-only',
    url:'https://example.test/study/programming/reinforcement-walker/reward.html'
  });
  dom.window.WalkerEngine=Engine;
  dom.window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
  dom.window.eval(rewardJs);
  return dom;
}

async function waitFor(predicate,message,timeout=20000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){
    if(predicate())return;
    await new Promise(resolve=>setTimeout(resolve,5));
  }
  assert.fail(message);
}

function checkStaticPage(){
  const dom=new JSDOM(rewardHtml,{url:'https://example.test/study/programming/reinforcement-walker/reward.html'});
  const doc=dom.window.document;
  assert(doc.body.classList.contains('walker-reward-page'),'the focused reward page has its own body class');
  assert.equal(doc.querySelector('.skip').getAttribute('href'),'#rewardGuideStart','the skip link reaches the experiment premise');
  assert.equal(doc.querySelectorAll('.site-return-nav a').length,3,'persistent navigation offers the site, lesson list, and game');
  assert(doc.querySelectorAll('a[data-close-reward][href="index.html#rewardTitle"]').length>=2,'prominent exits remain real links without JavaScript');
  assert.equal(doc.getElementById('rewardLab').getAttribute('data-reward-step'),'0','the first prediction is the meaningful static starting frame');
  assert.deepEqual(Array.from(doc.querySelectorAll('[data-reward-panel]'),panel=>Number(panel.dataset.rewardPanel)),[0,1,2,3,4,5],'the interactive story has six ordered frames');
  assert.equal(doc.querySelectorAll('[data-prediction]').length,3,'the learner predicts one of three plausible strategies');
  assert.equal(doc.querySelectorAll('[data-score-action]').length,2,'one step and one wait are scored separately');
  assert.equal(doc.querySelectorAll('#rewardMetricChoices [data-metric]').length,3,'the learner chooses one of three comparison metrics');
  assert(Array.from(doc.querySelectorAll('[data-prediction], #rewardMetricChoices [data-metric]')).every(button=>button.getAttribute('aria-pressed')==='false'),'prediction and metric choices expose their initial toggle state before JavaScript');
  assert(Array.from(doc.querySelectorAll('button')).every(button=>button.type==='button'),'every button is safe inside future forms');
  assert.equal(doc.getElementById('rewardLive').getAttribute('aria-live'),'polite','one compact status region announces changes politely');
  assert.equal(doc.getElementById('rewardLive').getAttribute('aria-atomic'),'true','status updates are announced as a whole');
  assert(doc.querySelector('#rewardScene[role="img"][aria-labelledby="rewardSceneTitle rewardSceneDesc"]'),'the changing stick-figure scene has a title and description');
  assert.equal(doc.querySelector('.reward-scene-card').getAttribute('tabindex'),'0','the documented arrow-key region is reachable with Tab');
  assert(doc.querySelector('#rewardCurve[role="img"][aria-labelledby="rewardCurveTitle rewardCurveDesc"]'),'the learning chart has an accessible title and description');
  assert(Array.from(doc.querySelectorAll('.reward-training-progress progress')).every(progress=>progress.hasAttribute('aria-label')),'every learning progress bar has an accessible name');
  assert(doc.querySelector('#rewardPrev[aria-controls="rewardLab"]')&&doc.querySelector('#rewardNext[aria-controls="rewardLab"]')&&doc.querySelector('#rewardReset[aria-controls="rewardLab"]'),'frame controls name the region they change');
  assert.equal(doc.getElementById('rewardZeroButton').getAttribute('aria-describedby'),'rewardZeroHint','the zero-point discovery has its explanatory hint');
  assert(/同じ体/.test(doc.querySelector('.reward-fixed-strip').textContent)&&/同じ地面/.test(doc.querySelector('.reward-fixed-strip').textContent)&&/同じ順番のゆらぎ（乱数）/.test(doc.querySelector('.reward-fixed-strip').textContent)&&/5,000回/.test(doc.querySelector('.reward-fixed-strip').textContent),'the fixed comparison conditions stay visible');
  assert(/採点表だけ変える/.test(doc.querySelector('.reward-fixed-strip').textContent),'the one changed variable is explicit');
  assert(/Qを0/.test(doc.body.textContent)&&/使い回さ/.test(doc.body.textContent),'the page explains why a changed reward starts from an empty Q table');
  assert(/報酬合計は物差し自体が違う/.test(`${doc.body.textContent} ${rewardJs}`),'the guided explanation warns against comparing totals from different reward scales');
  assert(/完走\+3\.5/.test(doc.body.textContent)&&/完走\+14/.test(doc.body.textContent),'the score sheet exposes both derived finish bonuses that affect the real result');
  assert(/先の点ほど少し小さく数えた、点の合計/.test(doc.body.textContent),'the static conclusion explains discounted future reward in plain language');
  assert(/reward hacking/.test(doc.body.textContent),'an optional adult note names reward hacking');
  assert.equal(doc.querySelectorAll('[data-reward-static-frame]').length,6,'print and no-JavaScript readers receive all six frames');
  assert.equal(doc.querySelectorAll('.reward-print-guide .help-print-topic').length,6,'the static guide preserves the same six-step sequence');
  assert(Array.from(doc.querySelectorAll('noscript')).some(element=>/静的6コマ/.test(element.textContent)),'JavaScript-free readers are directed to the complete static guide');
  assert(/\.reward-static-intro[\s\S]*\.reward-print-guide[\s\S]*display:\s*none/.test(rewardCss),'the duplicate static guide is hidden in the interactive view');
  assert(/@media\s+print[\s\S]*\.reward-lab[\s\S]*display:\s*none\s*!important[\s\S]*\.reward-print-guide[\s\S]*display:\s*block\s*!important/.test(rewardCss),'print switches from the lab to all six static frames');
  assert(/@media\s+\(prefers-reduced-motion:\s*reduce\)/.test(rewardCss),'the comparison respects reduced-motion preferences');
  const replayDuration=Number(rewardJs.match(/const duration=(\d+);/)?.[1]);
  assert(replayDuration>0&&replayDuration<5000,'automatic comparison motion ends in under five seconds');
  assert(/reward-chart-line-safe[\s\S]*stroke-dasharray/.test(rewardCss)&&/reward-chart-line-rush[\s\S]*stroke-dasharray/.test(rewardCss),'learning curves use line patterns as well as color');
  assert(/min-height:\s*44px/.test(rewardCss),'primary experiment controls keep a touch-sized target');
  const enginePosition=rewardHtml.indexOf('engine.js');
  const controllerPosition=rewardHtml.indexOf('reward.js');
  assert(enginePosition>=0&&controllerPosition>enginePosition,'the real engine loads before the reward controller');
  dom.window.close();
}

function checkRealOneStepExamples(debug){
  const plainReward=id=>Object.fromEntries(Object.entries(debug.profiles[id].reward));
  assert.equal(debug.profiles.safe.label,'前進を採点しない','the first profile is named for the exact missing objective, not a vague safety slogan');
  assert.deepEqual(plainReward('safe'),EXPECTED_REWARDS.safe,'the missing-forward experiment uses the intended real reward weights');
  assert.deepEqual(plainReward('both'),EXPECTED_REWARDS.both,'the corrected experiment changes only forward reward from zero to five');
  assert.deepEqual(plainReward('rush'),EXPECTED_REWARDS.rush,'the deliberately extreme experiment rewards forward motion alone');
  const expected={
    step:realTrial('left-short-arms-center'),
    wait:realTrial('brace-arms-center')
  };
  for(const id of ['step','wait']){
    const actual=debug.trials[id].result;
    closeTo(actual.dx,expected[id].dx,`${id} distance comes from the real engine`);
    closeTo(actual.reward,expected[id].reward,`${id} reward comes from the real engine`);
    for(const component of ['forward','balance','energy','fall'])closeTo(actual.components[component],expected[id].components[component],`${id} ${component} component comes from the real engine`);
    closeTo(actual.reward,Object.values(actual.components).reduce((sum,value)=>sum+value,0),`${id} reward is exactly its four displayed components`);
    closeTo(debug.trials[id].update.value,expected[id].update.value,`${id} Q bridge uses the real engine update value`);
    closeTo(debug.trials[id].update.old,0,`${id} focused Q cell starts empty`);
    closeTo(debug.trials[id].update.future,0,`${id} first update begins with no learned future estimate`);
  }
  assert(expected.step.dx>0&&!expected.step.done,'the focused step moves forward without ending the episode');
  assert(expected.step.reward<0,'the step loses points when forward reward is missing');
  assert.equal(expected.wait.dx,0,'the brace example waits in place');
  assert(expected.wait.reward>0,'waiting safely earns a positive score');
  assert(expected.wait.reward>expected.step.reward,'the flawed score sheet really prefers waiting over stepping');
}

function checkBundle(id,bundle){
  const expected=EXPECTED_RESULTS[id];
  assert(bundle,`${id} training produced a result bundle`);
  assert.equal(bundle.engine.episodes,5000,`${id} uses exactly 5,000 learning episodes`);
  assert.deepEqual(bundle.engine.reward,EXPECTED_REWARDS[id],`${id} trains with its displayed score sheet`);
  assert.equal(bundle.results.length,20,`${id} is tested on the same 20 unseen seeds`);
  assert.equal(bundle.curve.length,11,`${id} records zero and every 500 episodes through 5,000`);
  assert.deepEqual(Array.from(bundle.curve,point=>point.episode),[0,500,1000,1500,2000,2500,3000,3500,4000,4500,5000],`${id} chart checkpoints cannot silently drift`);
  closeTo(bundle.summary.medianDistance,expected.medianDistance,`${id} median distance is deterministic`);
  closeTo(bundle.summary.averageEffort,expected.averageEffort,`${id} effort is deterministic`);
  assert.equal(bundle.summary.finishes,expected.finishes,`${id} finish count matches the fixed comparison`);
  assert.equal(bundle.summary.falls,expected.falls,`${id} fall count matches the fixed comparison`);
  assert.equal(bundle.summary.timeouts,expected.timeouts,`${id} timeout count matches the fixed comparison`);
  assert.equal(bundle.representative.reason,expected.reason,`${id} representative seed 223 has the intended outcome`);
  closeTo(bundle.representative.distance,expected.representativeDistance,`${id} representative seed 223 distance is deterministic`);
  assert(Array.isArray(bundle.representative.trace)&&bundle.representative.trace.length>1,`${id} retains a real trace for the comparison replay`);
  if(id==='safe')closeTo(bundle.summary.averageBraceRate,1,'the no-forward policy braces for every action in all 20 tests');
}

async function checkSixFrameExperiment(){
  const dom=makeDom();
  const {document:doc}=dom.window;
  const debug=dom.window.__walkerRewardDebug;
  assert(debug,'the guide exposes deterministic state for regression checks');
  assert.equal(debug.TRAIN_EPISODES,5000,'the displayed learning count is also the executed learning count');
  assert.equal(debug.TRAIN_SEED,4242,'all score sheets begin with the documented common training seed');
  assert.equal(debug.TRACE_SEED,223,'the replay uses the documented unknown test condition');
  assert.deepEqual(Array.from(debug.EVALUATION_SEEDS),[11,29,47,83,131,149,197,223,269,307,353,401,449,503,557,601,653,701,751,809],'the 20 test conditions stay fixed');
  assert.deepEqual(Array.from(debug.CURVE_SEEDS),[17,61,109,181,277],'the learning curve uses its own five fixed test conditions');
  assert(Array.from(debug.CURVE_SEEDS).every(seed=>!Array.from(debug.EVALUATION_SEEDS).includes(seed)),'curve checks and final evaluation use disjoint seeds');
  assert(/Math\.imul\(seed,1664525\)\+1013904223/.test(rewardJs),'every profile advances through the same explicit training-seed sequence');
  checkRealOneStepExamples(debug);

  assert.equal(debug.step,0,'the route begins with a prediction');
  assert.equal(doc.getElementById('rewardStepCount').textContent.trim(),'1 / 6');
  assert(doc.getElementById('rewardPrev').disabled,'previous is disabled on the first frame');
  assert(doc.getElementById('rewardNext').disabled,'the result stays locked until the learner predicts');
  assert(doc.getElementById('rewardReset').disabled,'reset is disabled before any experiment');
  assert.equal(doc.querySelectorAll('#rewardStepDots [data-reward-step]').length,6,'one progress control is created for every frame');
  assert(Array.from(doc.querySelectorAll('#rewardStepDots [data-reward-step]')).slice(1).every(button=>button.disabled),'future frames remain locked');
  for(const id of ['rewardZeroDiscovery','rewardActionVerdict','rewardQBridge','rewardSafeResult','rewardComparison','rewardCurveWrap'])assert(doc.getElementById(id).hidden,`${id} does not reveal a later conclusion before its operation`);
  assert(doc.getElementById('rewardFallMark').hasAttribute('hidden'),'the final fall is not shown before the experiment');

  const stillPrediction=doc.querySelector('[data-prediction="still"]');
  stillPrediction.click();
  assert.equal(debug.prediction,'still','the learner prediction is remembered separately from training');
  assert.equal(stillPrediction.getAttribute('aria-pressed'),'true','the chosen prediction is exposed to assistive technology');
  assert(!doc.getElementById('rewardNext').disabled,'a prediction unlocks only the next frame');
  doc.getElementById('rewardNext').click();
  assert.equal(debug.step,1,'next reveals the score sheet exactly one frame later');
  assert(doc.getElementById('rewardNext').disabled,'the score-sheet gap must be found before continuing');
  assert(Array.from(doc.querySelectorAll('[data-prediction]')).every(button=>button.disabled),'the prediction is fixed after leaving its frame');
  doc.querySelector('[data-prediction="careful"]').click();
  assert.equal(debug.prediction,'still','a disabled prediction cannot be revised after seeing later evidence');
  assert(doc.getElementById('rewardZeroDiscovery').hidden,'the missing objective is not stated before the learner opens it');
  assert(!/歩く.*数に入っていない/.test(doc.getElementById('rewardTakeaway').textContent),'the explanation asks the learner to inspect before stating the answer');

  doc.getElementById('rewardZeroButton').click();
  assert(debug.zeroFound,'the forward zero is recorded as discovered');
  assert(!doc.getElementById('rewardZeroDiscovery').hidden,'the explanation appears only after the discovery');
  assert(/前進\s*0/.test(doc.getElementById('rewardBoardForward').textContent),'the visual score sheet reveals the missing forward points');
  assert(!doc.getElementById('rewardNext').disabled,'finding the gap unlocks the one-step test');
  doc.getElementById('rewardNext').click();
  assert.equal(debug.step,2,'the route reaches one-step scoring');
  assert(doc.getElementById('rewardActionVerdict').hidden&&doc.getElementById('rewardQBridge').hidden,'the preferred action and Q update wait until both trials are run');

  const stepButton=doc.querySelector('[data-score-action="step"]');
  const waitButton=doc.querySelector('[data-score-action="wait"]');
  stepButton.click();
  assert.deepEqual(Array.from(debug.scoredActions),['step'],'scoring one action does not silently reveal the other');
  assert(doc.getElementById('rewardNext').disabled,'both actions must be tried before continuing');
  assert(renderedNumber(stepButton.textContent,debug.trials.step.result.reward),'the step button renders the real negative reward');
  assert(!doc.getElementById('rewardGhost').hasAttribute('hidden')&&!doc.getElementById('rewardMotionArrow').hasAttribute('hidden'),'the SVG step and motion arrow remove their hidden attributes after the step operation');
  assert(!doc.getElementById('rewardScoreTag').hasAttribute('hidden'),'the SVG score tag removes its hidden attribute after scoring');
  assert(doc.getElementById('rewardActionVerdict').hidden&&doc.getElementById('rewardQBridge').hidden,'one score still does not reveal the two-action conclusion');
  waitButton.click();
  assert.deepEqual(new Set(Array.from(debug.scoredActions)),new Set(['step','wait']),'both real actions have now been scored');
  assert(renderedNumber(waitButton.textContent,debug.trials.wait.result.reward),'the wait button renders the real positive reward');
  assert(!doc.getElementById('rewardActionVerdict').hidden,'the comparison verdict appears only after both scores');
  assert(!doc.getElementById('rewardQBridge').hidden,'the Q bridge appears only after both scores');
  assert(/待つ方が高得点/.test(doc.getElementById('rewardActionVerdict').textContent),'the page names the reward loophole plainly');
  assert(renderedNumber(doc.getElementById('rewardQValues').textContent,debug.trials.step.update.value)&&renderedNumber(doc.getElementById('rewardQValues').textContent,debug.trials.wait.update.value),'the bridge renders both real first-update Q values');
  assert(doc.getElementById('rewardGhost').hasAttribute('hidden')&&doc.getElementById('rewardMotionArrow').hasAttribute('hidden'),'choosing the wait example hides step-only SVG marks again');
  assert(!doc.getElementById('rewardScoreTag').hasAttribute('hidden'),'the wait score remains visible in the SVG');
  assert.equal(doc.getElementById('rewardTrialDetails').querySelectorAll('article').length,2,'both four-part score breakdowns are inspectable');
  assert(!doc.getElementById('rewardNext').disabled,'two scores unlock learning');
  doc.getElementById('rewardNext').click();
  assert.equal(debug.step,3,'the route reaches the flawed-reward training frame');
  assert(doc.getElementById('rewardSafeResult').hidden&&doc.getElementById('rewardCurveWrap').hidden,'the stopped policy and curve are not shown before training');
  assert(/結果を見る前に予想/.test(doc.getElementById('rewardTakeaway').textContent),'the pre-training explanation asks for a prediction instead of stating the outcome');

  doc.getElementById('rewardTrainSafe').click();
  assert.equal(debug.trainingProfile,'safe','the first click begins the intended real training job');
  assert.equal(doc.getElementById('rewardLab').getAttribute('aria-busy'),'true','the lab exposes that training is in progress');
  assert(doc.getElementById('rewardPrev').disabled&&doc.getElementById('rewardNext').disabled,'navigation is locked during training');
  await waitFor(()=>Boolean(debug.bundles.safe),'the safe profile did not finish training');
  assert.equal(debug.trainingProfile,null,'training releases the interaction lock');
  assert(!doc.getElementById('rewardLab').hasAttribute('aria-busy'),'the busy state clears after training');
  checkBundle('safe',debug.bundles.safe);
  assert.notEqual(debug.bundles.safe.engine.q.every?.(value=>value===0),true,'the real Q table is not a decorative placeholder');
  assert(!doc.getElementById('rewardSafeResult').hidden,'the 20-condition test result is visible');
  assert.equal(doc.querySelector('#rewardSafeResult [data-result="distance"]').textContent,'0.00 m','the stopped policy is rendered as zero median distance');
  assert.equal(doc.querySelector('#rewardSafeResult [data-result="timeouts"]').textContent,'20 / 20','all stopped tests visibly end by timeout');
  assert.equal(doc.querySelector('#rewardSafeResult [data-result="brace"]').textContent,'100%','the visible result says the learned policy braces on every test action');
  assert(/最初の予想「その場で待つ」/.test(doc.getElementById('rewardSafePredictionRecall').textContent),'the fixed prediction is recalled only after the first policy is tested');
  assert.equal(doc.getElementById('rewardCurve').querySelectorAll('.reward-chart-point').length,11,'the chart renders all safe-profile checkpoints');
  assert(doc.getElementById('rewardCurveTitle')&&/前進を採点しない/.test(doc.getElementById('rewardCurveDesc').textContent),'the dynamically redrawn chart keeps its accessible title and exact current profile name');
  assert(!doc.getElementById('rewardNext').disabled,'the completed real training unlocks the score-sheet repair');
  doc.getElementById('rewardNext').click();
  assert.equal(debug.step,4,'the route reaches the one-change repair');

  assert(doc.getElementById('rewardTrainBoth').disabled,'the second training waits for the explicit score change');
  doc.getElementById('rewardAddForward').click();
  assert(debug.forwardAdded,'forward reward is explicitly changed from zero to five');
  assert(/前進\s*5/.test(doc.getElementById('rewardBoardForward').textContent),'the changed value is visible on the score sheet');
  assert(!doc.getElementById('rewardTrainBoth').disabled,'only that one change unlocks fresh training');
  doc.getElementById('rewardTrainBoth').click();
  await waitFor(()=>Boolean(debug.bundles.both),'the balanced profile did not finish training');
  checkBundle('both',debug.bundles.both);
  assert.notEqual(debug.bundles.safe.engine,debug.bundles.both.engine,'the new reward starts with a separate engine and Q table');
  assert.notEqual(debug.bundles.safe.engine.q,debug.bundles.both.engine.q,'Q memory is not reused across reward definitions');
  assert.equal(doc.querySelector('#rewardBothResult [data-result="finishes"]').textContent,'17 / 20','the repaired score visibly produces seventeen finishes');
  assert.equal(doc.getElementById('rewardCurve').querySelectorAll('.reward-chart-line').length,2,'the same chart now compares both learned policies');
  assert(!doc.getElementById('rewardGhost').hasAttribute('hidden')&&!doc.getElementById('rewardMotionArrow').hasAttribute('hidden'),'the successful learned walk removes the SVG movement marks hidden attributes');
  assert(!doc.getElementById('rewardNext').disabled,'the repaired experiment unlocks the final comparison');
  doc.getElementById('rewardNext').click();
  assert.equal(debug.step,5,'the route reaches the over-reward comparison');
  assert(doc.getElementById('rewardFinalInsight').hidden,'the final explanation waits for both training and learner observation');
  assert(doc.getElementById('rewardComparison').hidden&&doc.getElementById('rewardFallMark').hasAttribute('hidden'),'the rush result and fall remain hidden before the third training operation');
  assert(/結果を決めつけずに比べる/.test(doc.getElementById('rewardTakeaway').textContent),'the third condition is posed as a question before its result');

  doc.getElementById('rewardCompareButton').click();
  await waitFor(()=>debug.compared&&Boolean(debug.bundles.rush),'the forward-only profile did not finish training');
  checkBundle('rush',debug.bundles.rush);
  assert.equal(doc.querySelectorAll('#rewardLanes [data-lane]').length,3,'three real policies are rendered side by side');
  assert.equal(doc.getElementById('rewardCurve').querySelectorAll('.reward-chart-line').length,3,'the learning chart contains all three score sheets');
  for(const id of ['safe','both','rush'])assert(renderedNumber(doc.getElementById('rewardCurveDesc').textContent,debug.bundles[id].curve.at(-1).distance),`${id} chart description states the plotted five-condition endpoint rather than the separate final evaluation`);
  assert(doc.getElementById('rewardFinalInsight').hidden,'comparison alone does not skip the learner reflection');
  assert(!doc.getElementById('rewardFallMark').hasAttribute('hidden'),'the SVG fall mark removes its hidden attribute only after the rush result exists');
  assert(debug.bundles.safe.summary.medianDistance<debug.bundles.rush.summary.medianDistance&&debug.bundles.rush.summary.medianDistance<debug.bundles.both.summary.medianDistance,'the three fixed policies show stop, rush, and finish rather than a fabricated ordering');
  assert(debug.bundles.safe.summary.averageEffort<debug.bundles.both.summary.averageEffort&&debug.bundles.both.summary.averageEffort<debug.bundles.rush.summary.averageEffort,'the real effort results expose the cost of rushing');
  for(const id of ['safe','both','rush']){
    const before=debug.bundles[id].engine.episodes;
    debug.evaluateEngine(debug.bundles[id].engine,debug.EVALUATION_SEEDS,false);
    assert.equal(debug.bundles[id].engine.episodes,before,`${id} testing never leaks learning into the evaluation`);
  }

  const fallMetric=doc.querySelector('#rewardMetricChoices [data-metric="fall"]');
  fallMetric.click();
  assert.equal(debug.selectedMetric,'fall','the learner observation is retained');
  assert.equal(fallMetric.getAttribute('aria-pressed'),'true','the chosen metric is exposed to assistive technology');
  assert(!doc.getElementById('rewardFinalInsight').hidden,'choosing what to inspect reveals the final aha');
  assert(/先の点ほど少し小さく数えた、点の合計/.test(doc.getElementById('rewardFinalInsight').textContent),'the conclusion explains discounted future reward rather than human mind-reading');
  assert(/一手の結果.*報酬.*Qの予想を少し直す.*高いQ/.test(doc.getElementById('rewardFinalInsight').textContent),'the final loop reconnects action, reward, a small Q update, and later choice');
  assert(/6コマ完了/.test(doc.getElementById('rewardNext').textContent),'the route has an explicit completed state');

  const completedBundles={safe:debug.bundles.safe,both:debug.bundles.both,rush:debug.bundles.rush};
  assert.equal(debug.maxUnlocked,5,'finishing the route leaves every frame unlocked');
  debug.setStep(4);
  assert.equal(debug.step,4,'going back reaches the requested earlier explanation');
  assert.equal(debug.maxUnlocked,5,'going back does not relock completed frames');
  for(const id of ['safe','both','rush'])assert.equal(debug.bundles[id],completedBundles[id],`going back preserves the completed ${id} learning result`);
  assert(debug.compared&&debug.forwardAdded,'going back preserves completed comparison and score-sheet change');
  assert.equal(debug.selectedMetric,'fall','going back preserves the learner metric selection');
  assert.equal(doc.querySelectorAll('#rewardCurve .reward-chart-line').length,2,'reviewing frame five hides the not-yet-introduced third curve without deleting it');
  debug.setStep(2);
  assert.deepEqual(new Set(Array.from(debug.scoredActions)),new Set(['step','wait']),'going back preserves both one-step observations');
  assert(debug.zeroFound,'going back preserves the discovered missing objective');
  assert.equal(Object.keys(debug.bundles).length,3,'going back is review navigation, not destructive experiment reset');
  assert(doc.getElementById('rewardCurveWrap').hidden,'reviewing before training hides all future learning curves');
  assert(doc.getElementById('rewardGhost').hasAttribute('hidden')&&doc.getElementById('rewardMotionArrow').hasAttribute('hidden')&&!doc.getElementById('rewardScoreTag').hasAttribute('hidden'),'the retained last wait example renders without step marks and keeps its score visible');
  debug.setStep(0);
  assert.equal(debug.prediction,'still','the original prediction remains fixed while reviewing the first frame');
  assert.equal(debug.maxUnlocked,5,'reviewing frame one preserves access to every completed frame');
  assert(Array.from(doc.querySelectorAll('[data-prediction]')).every(button=>button.disabled),'reviewing the prediction does not allow hindsight edits');
  doc.querySelector('[data-prediction="rush"]').click();
  assert.equal(debug.prediction,'still','a completed route still ignores attempts to change the original prediction');
  debug.setStep(5);
  assert.equal(debug.selectedMetric,'fall','returning to the final frame restores the selected comparison');
  assert(!doc.getElementById('rewardFinalInsight').hidden,'the completed final explanation stays available when revisited');
  assert.equal(doc.querySelectorAll('#rewardCurve .reward-chart-line').length,3,'returning to the final frame restores all three learning curves');
  doc.getElementById('rewardReset').click();
  assert.equal(debug.step,0,'reset returns the complete experiment to frame one');
  assert.equal(debug.prediction,null,'reset clears the learner prediction');
  assert.equal(debug.maxUnlocked,0,'reset locks future frames again');
  assert.equal(Object.keys(debug.bundles).length,0,'reset clears every learned profile');
  assert.equal(debug.selectedMetric,null,'reset clears the comparison selection');
  assert.equal(debug.zeroFound,false,'reset clears the discovered score-sheet gap');
  assert.deepEqual(Array.from(debug.scoredActions),[],'reset clears both one-step observations');
  assert.equal(debug.forwardAdded,false,'reset restores the original score sheet');
  assert.equal(debug.compared,false,'reset clears the completed comparison');
  assert(doc.getElementById('rewardNext').disabled,'the prediction gate is restored after reset');
  assert(Array.from(doc.querySelectorAll('[data-prediction]')).every(button=>!button.disabled),'only a full reset makes the prediction choices editable again');

  doc.querySelector('[data-prediction="careful"]').click();
  doc.getElementById('rewardLab').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  assert.equal(debug.step,1,'right arrow advances an unlocked frame when focus is not on a control');
  doc.getElementById('rewardLab').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
  assert.equal(debug.step,0,'left arrow returns one frame for review');
  assert.equal(debug.maxUnlocked,1,'keyboard review also preserves the furthest unlocked frame');
  assert.equal(debug.prediction,'careful','keyboard review preserves the fixed prediction');
  assert(Array.from(doc.querySelectorAll('[data-prediction]')).every(button=>button.disabled),'the prediction remains fixed after keyboard review');
  dom.window.close();
}

async function main(){
  checkStaticPage();
  await checkSixFrameExperiment();
  console.log('reinforcement walker reward-design guide checks passed');
}

main().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
