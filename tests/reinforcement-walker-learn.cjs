const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');

const root=path.join(__dirname,'..');
const learnPath=path.join(root,'study/programming/reinforcement-walker/learn.html');
const learnJsPath=path.join(root,'assets/reinforcement-walker/learn.js');
const enginePath=path.join(root,'assets/reinforcement-walker/engine.js');
const learnHtml=fs.readFileSync(learnPath,'utf8');
const learnJs=fs.readFileSync(learnJsPath,'utf8');
const Engine=require(enginePath);

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
  const engine=Engine.createEngine({
    seed:401,
    physics:{roughness:0,maxSteps:40,targetDistance:30}
  });
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
  const engine=Engine.createEngine({
    seed:401,
    physics:{roughness:0,maxSteps:40,targetDistance:30}
  });
  for(let index=0;index<count;index++)Engine.updateQ(
    engine,
    expected.short.state,
    expected.short.action,
    expected.short.result.reward,
    expected.short.nextState,
    expected.short.result.done
  );
  return engine.q[expected.short.state*Engine.ACTION_COUNT+expected.short.action];
}

function closeTo(actual,wanted,message,tolerance=1e-6){
  assert(Number.isFinite(actual),`${message}: actual value is finite`);
  assert(Math.abs(actual-wanted)<=tolerance,`${message}: expected ${wanted}, got ${actual}`);
}

function makeDom(hash=''){
  const dom=new JSDOM(learnHtml,{
    runScripts:'outside-only',
    url:`https://example.test/study/programming/reinforcement-walker/learn.html${hash}`
  });
  dom.window.WalkerEngine=Engine;
  dom.window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
  dom.window.requestAnimationFrame=callback=>{callback(0);return 1;};
  dom.window.cancelAnimationFrame=()=>{};
  dom.window.eval(learnJs);
  return dom;
}

function qValue(values,actionId){
  const index=actionIndex(actionId);
  if(Array.isArray(values)||ArrayBuffer.isView(values))return Number(values[index]);
  if(values&&Object.hasOwn(values,actionId))return Number(values[actionId]);
  if(values&&Object.hasOwn(values,index))return Number(values[index]);
  throw new Error(`cannot find ${actionId} in debug qValues`);
}

function experienceResult(experience){
  return experience&&experience.result?experience.result:experience;
}

function renderedNumber(text,value){
  const normalized=String(text).replaceAll('\u2212','-').replaceAll(',','');
  return [value.toFixed(2),value.toFixed(3)].some(number=>normalized.includes(number));
}

function checkEngineExamples(){
  assert.equal(expected.short.state,expected.long.state,'the short and long actions start in the same real engine state');
  assert.equal(expected.short.state,expected.brace.state,'the brace action starts in that same real engine state');
  assert.equal(Engine.encodeState(Engine.decodeState(expected.short.state)),expected.short.state,'the focused starting scene is a valid engine state');
  assert(expected.short.result.dx>0&&!expected.short.result.stumbled,'the small step is a successful forward example');
  assert(expected.long.result.stumbled&&expected.long.result.stumbleReason==='long-rest','the long step is the from-rest stumble example');
  assert.equal(expected.brace.result.dx,0,'bracing from rest does not move forward');
  assert(expected.short.result.reward>expected.brace.result.reward,'the forward short step earns more than waiting');
  assert(expected.brace.result.reward>expected.long.result.reward,'waiting earns more than a wasteful long stumble');
  for(const sample of Object.values(expected)){
    closeTo(sample.result.reward,Object.values(sample.result.components).reduce((sum,value)=>sum+value,0),`${sample.actionId} reward is its four real components`);
  }
}

function checkStaticPage(){
  const dom=new JSDOM(learnHtml,{url:'https://example.test/study/programming/reinforcement-walker/learn.html'});
  const doc=dom.window.document;
  assert(doc.body.classList.contains('walker-learn-page'),'the dedicated page has its own body class');
  assert(doc.getElementById('learnLab'),'the six-frame learning lab is present');
  assert.equal(doc.getElementById('learnLab').getAttribute('data-learn-step'),'0','the static first frame is meaningful before JavaScript runs');
  for(const id of [
    'learnStepCount','learnStepDots','learnPrev','learnNext','learnReset','learnQuestion','learnTitle',
    'learnText','learnTakeaway','learnLive','learnScene','learnActionChoices','learnExperienceButton',
    'learnExploreButton','learnRepeatButtons','learnUnknownButton'
  ])assert(doc.getElementById(id),`${id} is present`);
  assert.equal(doc.getElementById('learnLive').getAttribute('aria-live'),'polite','one compact update is announced politely');
  assert.equal(doc.querySelectorAll('#learnActionChoices [data-learn-action]').length,3,'the same state offers exactly three focused actions');
  assert.equal(doc.querySelectorAll('#learnRepeatButtons button').length,3,'one, ten, and fifty repeat controls are separated');
  assert(doc.querySelector('#learnScene[role="img"]'),'the changing scene has an accessible image role');
  assert(doc.querySelector('#learnPrev[aria-controls="learnLab"]')&&doc.querySelector('#learnNext[aria-controls="learnLab"]'),'frame controls name the region they change');
  assert(/Q値.*成功確率では|成功確率では.*Q値/.test(doc.body.textContent),'Q value is explicitly distinguished from a success probability');
  assert(/報酬.*正解|正解.*報酬/.test(doc.body.textContent),'reward is distinguished from a supplied correct answer');
  assert(/状態|いまの場面/.test(doc.body.textContent)&&/行動|動き/.test(doc.body.textContent),'state and action are introduced in plain language');
  assert(/探索|冒険/.test(doc.body.textContent)&&/方策|好み/.test(doc.body.textContent),'exploration and the learned preference are both named');
  assert(/5,?040/.test(doc.body.textContent)&&/15/.test(doc.body.textContent),'the focused three-action example is connected to the full game scale');
  assert.equal(doc.querySelectorAll('[data-learn-static-frame]').length,6,'print and no-JavaScript readers receive all six frames');
  assert(Array.from(doc.querySelectorAll('noscript')).some(element=>/6コマ|六コマ/.test(element.textContent)),'JavaScript-free readers are directed to the complete six-frame guide');
  assert.equal(doc.querySelectorAll('a[href^="index.html"]' ).length>0,true,'the guide has a real link back to the game');
  const enginePosition=learnHtml.indexOf('engine.js');
  const learnPosition=learnHtml.indexOf('learn.js');
  assert(enginePosition>=0&&learnPosition>enginePosition,'the real engine loads before the learning guide controller');
  dom.window.close();
}

function checkSixFrameRoute(){
  const dom=makeDom();
  const {document:doc}=dom.window;
  const debug=dom.window.__walkerLearnDebug;
  assert(debug,'the guide exposes deterministic state for regression checks');
  assert.equal(debug.step,0,'the route begins with the learner prediction');
  assert.equal(doc.getElementById('learnStepCount').textContent.trim(),'1 / 6');
  assert.equal(doc.querySelectorAll('#learnStepDots [data-learn-step]').length,6,'there is one reachable dot for every frame');
  assert(doc.getElementById('learnPrev').disabled,'previous is disabled on the first frame');
  assert(doc.getElementById('learnNext').disabled,'the learner predicts before revealing the result');
  assert(doc.getElementById('learnReset').disabled,'reset is disabled before any experiment');
  assert(Array.from(doc.querySelectorAll('#learnStepDots [data-learn-step]')).slice(1).every(button=>button.disabled),'future frames stay locked until their preceding idea is reached');
  assert.deepEqual(Array.from(doc.querySelectorAll('#learnStepDots [data-learn-step]'),element=>Number(element.dataset.learnStep)),[0,1,2,3,4,5],'frame indices stay stable for deep QA and accessibility');

  const actions=Array.from(doc.querySelectorAll('#learnActionChoices [data-learn-action]'));
  assert.deepEqual(new Set(actions.map(button=>button.dataset.learnAction)),new Set(Object.values(ACTION_IDS)),'the three choices are short step, long step, and brace with arms fixed');
  const longChoice=doc.querySelector(`[data-learn-action="${ACTION_IDS.long}"]`);
  longChoice.click();
  assert.equal(debug.selectedAction,ACTION_IDS.long,'the learner prediction is kept separately from AI learning');
  assert.equal(longChoice.getAttribute('aria-pressed'),'true','the selected prediction is exposed to assistive technology');
  assert(!doc.getElementById('learnNext').disabled,'making a prediction unlocks the result frame');

  doc.getElementById('learnNext').click();
  assert.equal(debug.step,1,'next reveals the real outcomes exactly one frame later');
  assert.equal(doc.getElementById('learnStepCount').textContent.trim(),'2 / 6');
  assert(!doc.querySelector('[data-learn-panel="1"]').hidden,'the live reward panel is revealed');
  const frameOneText=`${doc.getElementById('learnScene').textContent} ${doc.getElementById('learnText').textContent} ${doc.getElementById('learnTakeaway').textContent}`;
  for(const sample of Object.values(expected)){
    const resultButton=doc.querySelector(`[data-reward-action="${sample.actionId}"]`);
    assert(resultButton&&renderedNumber(resultButton.textContent,sample.result.reward),`${sample.actionId} renders its real reward in the live result card`);
  }
  assert(/前進/.test(frameOneText)&&/直立|バランス/.test(frameOneText)&&/力|エネルギー/.test(frameOneText)&&/転倒/.test(frameOneText),'the four reward meanings are visible with the result');
  assert.equal(doc.querySelectorAll('[data-reward-component]').length,4,'the selected result has four inspectable reward components');
  doc.querySelector(`[data-reward-action="${ACTION_IDS.short}"]`).click();
  const componentElements={
    forward:doc.getElementById('learnRewardForward'),
    balance:doc.getElementById('learnRewardBalance'),
    energy:doc.getElementById('learnRewardEnergy'),
    fall:doc.getElementById('learnRewardFall')
  };
  assert(renderedNumber(doc.getElementById('learnRewardTotal').textContent,expected.short.result.reward),'the live reward total matches the real short-step result');
  for(const key of Object.keys(componentElements))assert(renderedNumber(componentElements[key].textContent,expected.short.result.components[key]),`the live ${key} amount matches the real engine`);
  const actualExperience=experienceResult(debug.experience);
  assert(actualExperience&&actualExperience.components,'the displayed experience comes from a real engine result');
  closeTo(actualExperience.reward,expected.short.result.reward,'the guide experience uses the fixed real short-step reward');
  for(const key of ['forward','balance','energy','fall'])closeTo(actualExperience.components[key],expected.short.result.components[key],`the displayed ${key} component comes from the real engine`);

  debug.setStep(2);
  assert.equal(doc.getElementById('learnStepCount').textContent.trim(),'3 / 6');
  for(const actionId of Object.values(ACTION_IDS))closeTo(qValue(debug.qValues,actionId),0,`${actionId} starts unknown`);
  doc.getElementById('learnExperienceButton').click();
  closeTo(qValue(debug.qValues,ACTION_IDS.short),expected.short.update.value,'one experience applies the real Q update');
  closeTo(qValue(debug.qValues,ACTION_IDS.long),0,'the unchosen long-step cell does not change');
  closeTo(qValue(debug.qValues,ACTION_IDS.brace),0,'the unchosen brace cell does not change');
  assert(renderedNumber(doc.getElementById('learnLab').textContent,expected.short.update.value),'the changed Q value is visible');
  assert(/1回|少し/.test(doc.getElementById('learnTakeaway').textContent),'the page says one experience only changes the estimate a little');

  debug.setStep(3);
  const beforeRepeat=qValue(debug.qValues,ACTION_IDS.short);
  const beforeRepeatCount=debug.repeatCount;
  const repeatOne=doc.querySelector('#learnRepeatButtons [data-repeat="1"]')||doc.querySelector('#learnRepeatButtons button');
  assert(repeatOne,'the +1 repeat button can be located');
  repeatOne.click();
  assert.equal(debug.repeatCount,beforeRepeatCount+1,'the +1 control applies exactly one additional experience');
  assert(qValue(debug.qValues,ACTION_IDS.short)>beforeRepeat,'repeating the same useful experience strengthens its preference');
  closeTo(qValue(debug.qValues,ACTION_IDS.short),qAfterShortExperiences(2),'two displayed experiences equal two real Q updates');
  closeTo(qValue(debug.qValues,ACTION_IDS.long),0,'repeating short-step experience still leaves the long action unknown');
  const beforeBatch=qValue(debug.qValues,ACTION_IDS.short);
  const repeatTen=doc.querySelector('#learnRepeatButtons [data-repeat="10"]')||doc.querySelectorAll('#learnRepeatButtons button')[1];
  repeatTen.click();
  assert.equal(debug.repeatCount,beforeRepeatCount+11,'the +10 control applies ten, not one, additional experiences');
  assert(qValue(debug.qValues,ACTION_IDS.short)>beforeBatch,'ten more experiences move the prediction further toward the observed return');
  closeTo(qValue(debug.qValues,ACTION_IDS.short),qAfterShortExperiences(12),'the +10 result equals twelve real Q updates in total');
  const repeatFifty=doc.querySelector('#learnRepeatButtons [data-repeat="50"]')||doc.querySelectorAll('#learnRepeatButtons button')[2];
  repeatFifty.click();
  assert.equal(debug.repeatCount,beforeRepeatCount+61,'the +50 control applies fifty additional experiences');
  closeTo(qValue(debug.qValues,ACTION_IDS.short),qAfterShortExperiences(62),'the +50 result equals sixty-two real Q updates in total');

  debug.setStep(4);
  const goodBeforeExplore=qValue(debug.qValues,ACTION_IDS.short);
  doc.getElementById('learnExploreButton').click();
  assert(qValue(debug.qValues,ACTION_IDS.long)<0,'the fixed exploration example learns that the long step from rest is costly');
  closeTo(qValue(debug.qValues,ACTION_IDS.short),goodBeforeExplore,'exploring a different action does not erase the known good action');
  assert(/探索|冒険/.test(doc.getElementById('learnLab').textContent)&&/わざと|あえて|調べ/.test(doc.getElementById('learnLab').textContent),'exploration is explained as deliberate information gathering');

  debug.setStep(5);
  assert.equal(doc.getElementById('learnStepCount').textContent.trim(),'6 / 6');
  assert(doc.getElementById('learnFinalInsight').hidden,'the final insight waits for the learner to try the unknown state');
  const unknownButton=doc.getElementById('learnUnknownButton');
  const unknownBefore=doc.getElementById('learnUnknownResult').textContent;
  assert(!unknownButton.disabled,'the unknown-state experiment starts available');
  unknownButton.click();
  assert(unknownButton.disabled,'the deterministic unknown-state example runs once');
  assert(!doc.getElementById('learnFinalInsight').hidden,'the final insight appears after the last experiment');
  assert.notEqual(doc.getElementById('learnUnknownResult').textContent,unknownBefore,'the unknown-state result changes after the experiment');
  assert(/今回は/.test(doc.getElementById('learnUnknownResult').textContent),'the unknown-state result names the action chosen from the tie');
  assert(/未経験|未知/.test(doc.getElementById('learnLab').textContent),'the final frame identifies the second state as unknown');
  assert(/0\.00/.test(doc.getElementById('learnLab').textContent),'the unknown state begins with zero-valued memories');
  assert(/別.*状態|状態.*別|場面.*別/.test(doc.getElementById('learnTakeaway').textContent),'the conclusion says different states keep different memories');
  assert(doc.getElementById('learnNext').disabled||/ゲーム/.test(doc.getElementById('learnNext').textContent),'the route has a clear end or a return to the game');

  doc.querySelector('[data-learn-step="2"]').click();
  assert.equal(debug.step,2,'going back reaches the selected earlier frame');
  for(const actionId of Object.values(ACTION_IDS))closeTo(qValue(debug.qValues,actionId),0,`rewinding removes later ${actionId} experiences`);
  assert(!doc.getElementById('learnExperienceButton').disabled,'the one-cell update can be tried again after rewinding');
  assert(doc.getElementById('learnNext').disabled,'the Q-update frame must be completed again before moving forward');
  doc.querySelector('[data-learn-step="0"]').click();
  assert.equal(debug.step,0,'a progress dot returns to an earlier frame');
  doc.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  assert.equal(debug.step,1,'right arrow advances one frame');
  doc.getElementById('learnReset').click();
  assert.equal(debug.step,0,'reset returns the complete experience to frame one');
  for(const actionId of Object.values(ACTION_IDS))closeTo(qValue(debug.qValues,actionId),0,`reset clears the focused ${actionId} Q cell`);
  dom.window.close();
}

checkEngineExamples();
checkStaticPage();
checkSixFrameRoute();
console.log('reinforcement walker AI learning guide checks passed');
