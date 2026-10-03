const fs=require('fs');
const path=require('path');
const assert=require('assert');
const {JSDOM}=require('jsdom');

const root=path.join(__dirname,'..');
const htmlPath=path.join(root,'study/programming/reinforcement-walker/index.html');
const appPath=path.join(root,'assets/reinforcement-walker/app.js');
const enginePath=path.join(root,'assets/reinforcement-walker/engine.js');
const html=fs.readFileSync(htmlPath,'utf8');
const appJs=fs.readFileSync(appPath,'utf8');
const programming=fs.readFileSync(path.join(root,'study/programming/index.html'),'utf8');
const Engine=require(enginePath);

function closeTo(actual,expected,message,tolerance=1e-9){
  assert(Math.abs(actual-expected)<=tolerance,`${message}: expected ${expected}, got ${actual}`);
}

function checkEngineContract(){
  assert.strictEqual(Engine.ACTION_COUNT,15,'five leg commands times three arm commands produce 15 actions');
  assert.strictEqual(Engine.STATE_COUNT,5040,'discretized walker state has 5,040 combinations');
  assert.strictEqual(Engine.Q_COUNT,75600,'Q table contains one value per state/action pair');
  assert.deepStrictEqual(Engine.STATE_SHAPE,[7,5,4,4,3,3],'state dimensions stay explainable in the maths panel');
  assert.strictEqual(new Set(Engine.ACTIONS.map(action=>action.id)).size,15,'compound action ids are unique');
  assert.deepStrictEqual(new Set(Engine.ACTIONS.map(action=>action.arm)),new Set([-1,0,1]),'all three arm directions exist');
  assert.deepStrictEqual(new Set(Engine.ACTIONS.map(action=>action.leg)),new Set([-1,0,1]),'left, brace, and right leg choices exist');

  const engine=Engine.createEngine({seed:101});
  assert(engine.q instanceof Float32Array,'Q table uses compact numeric storage');
  assert(engine.visits instanceof Uint32Array,'state visit counts use compact numeric storage');
  assert.strictEqual(engine.q.length,Engine.Q_COUNT,'Q table allocation matches the public contract');
  assert.strictEqual(engine.visits.length,Engine.STATE_COUNT,'visit table allocation matches the public contract');

  for(let state=0;state<Engine.STATE_COUNT;state++){
    assert.strictEqual(Engine.encodeState(Engine.decodeState(state)),state,`state ${state} round trips`);
  }
  const extremeBot=Engine.createBot({seed:1},false);
  extremeBot.lean=99;
  extremeBot.leanV=-99;
  extremeBot.vx=99;
  extremeBot.nextFoot=1;
  extremeBot.recovery=2;
  extremeBot.armV=99;
  extremeBot.x=99;
  const parts=Engine.stateParts(extremeBot);
  parts.forEach((part,index)=>assert(part>=0&&part<Engine.STATE_SHAPE[index],`state dimension ${index} is clamped`));
  const state=Engine.stateIndex(extremeBot);
  assert(state>=0&&state<Engine.STATE_COUNT,'state index remains inside the Q table');
}

function checkPhysicsAndRewards(){
  const engine=Engine.createEngine({seed:7,physics:{roughness:0,maxSteps:40,targetDistance:30}});
  const bot=Engine.createBot({seed:8},false);
  const result=Engine.step(engine,bot,7,{seed:9});
  const componentTotal=Object.values(result.components).reduce((sum,value)=>sum+value,0);
  closeTo(result.reward,componentTotal,'step reward equals the displayed component sum');
  closeTo(bot.reward,result.reward,'bot cumulative reward includes the step reward');
  assert.deepStrictEqual(Object.keys(result.components).sort(),['balance','energy','fall','forward'],'reward components stay user-editable and explainable');

  const leftEngine=Engine.createEngine({seed:20,physics:{roughness:0}});
  const rightEngine=Engine.createEngine({seed:20,physics:{roughness:0}});
  const leftBot=Engine.createBot({seed:21},false);
  const rightBot=Engine.createBot({seed:21},false);
  const braceArmsLeft=Engine.ACTIONS.findIndex(action=>action.leg===0&&action.arm===-1);
  const braceArmsRight=Engine.ACTIONS.findIndex(action=>action.leg===0&&action.arm===1);
  Engine.step(leftEngine,leftBot,braceArmsLeft,{seed:22});
  Engine.step(rightEngine,rightBot,braceArmsRight,{seed:22});
  assert(leftBot.lean<0&&rightBot.lean>0,'swinging arms left or right changes lean in opposite directions');
  assert(leftBot.leanV<0&&rightBot.leanV>0,'arm swing changes angular momentum, not only the drawing');

  const traceEngine=Engine.createEngine({seed:31,physics:{maxSteps:32}});
  const traced=Engine.runEpisode(traceEngine,{learn:false,greedy:true,seed:32,trace:true});
  assert(traced.trace.length>=2,'episode trace records a replay');
  closeTo(traced.trace.at(-1).x,traced.final.x,'last replay frame matches the episode result');
  closeTo(traced.reward,Object.values(traced.components).reduce((sum,value)=>sum+value,0),'episode reward equals all accumulated components',1e-7);
}

function actionIndex(id){
  const index=Engine.ACTIONS.findIndex(action=>action.id===id);
  assert(index>=0,`action ${id} exists`);
  return index;
}

function checkMovementPrinciples(){
  const make=()=>({
    engine:Engine.createEngine({seed:1,physics:{roughness:0}}),
    bot:Engine.createBot({seed:2},false),
    runtime:{seed:3}
  });

  let scene=make();
  let result=Engine.step(scene.engine,scene.bot,actionIndex('left-short-arms-center'),scene.runtime);
  assert(!result.stumbled&&scene.bot.x>0,'a short correct first step creates propulsion');
  assert.strictEqual(scene.bot.nextFoot,1,'a successful left step changes the next foot to right');
  assert.strictEqual(scene.bot.recovery,2,'a short step needs two brace actions before the next foot');
  assert(result.dx>0,'step result exposes the distance used by the explanation');

  scene=make();
  result=Engine.step(scene.engine,scene.bot,actionIndex('left-long-arms-center'),scene.runtime);
  assert(result.stumbled,'a long stride from rest stumbles');
  assert.strictEqual(result.stumbleReason,'long-rest','the UI can explain why the long first stride failed');

  scene=make();
  Engine.step(scene.engine,scene.bot,actionIndex('left-short-arms-center'),scene.runtime);
  result=Engine.step(scene.engine,scene.bot,actionIndex('right-short-arms-center'),scene.runtime);
  assert(result.stumbled,'the other foot still stumbles during recovery');
  assert.strictEqual(result.stumbleReason,'recovering','recovery failure has an exact reason code');

  scene=make();
  Engine.step(scene.engine,scene.bot,actionIndex('left-short-arms-center'),scene.runtime);
  Engine.step(scene.engine,scene.bot,actionIndex('brace-arms-center'),scene.runtime);
  Engine.step(scene.engine,scene.bot,actionIndex('brace-arms-center'),scene.runtime);
  result=Engine.step(scene.engine,scene.bot,actionIndex('right-short-arms-center'),scene.runtime);
  assert(!result.stumbled,'two brace actions prepare the other foot after a short step');
  assert.strictEqual(scene.bot.correctSteps,2,'the alternating sequence records two correct steps');

  const left=make();
  const right=make();
  left.bot.lean=right.bot.lean=.35;
  Engine.step(left.engine,left.bot,actionIndex('brace-arms-left'),left.runtime);
  Engine.step(right.engine,right.bot,actionIndex('brace-arms-right'),right.runtime);
  assert(Math.abs(left.bot.lean)<Math.abs(right.bot.lean),'an arm swing opposite the lean corrects more than a same-side swing');
  closeTo(left.bot.x,0,'arms do not directly propel the walker');
  closeTo(right.bot.x,0,'arms do not directly propel the walker');
}

function checkQUpdate(){
  const terminal=Engine.createEngine({seed:40,learning:{alpha:1,gamma:.5,epsilon:0}});
  const state=3,action=4,nextState=9;
  terminal.q[state*Engine.ACTION_COUNT+action]=12;
  terminal.q[nextState*Engine.ACTION_COUNT+2]=100;
  const update=Engine.updateQ(terminal,state,action,4,nextState,true);
  closeTo(update.future,0,'terminal transition ignores future Q values');
  closeTo(update.target,4,'terminal Q target is just the immediate reward');
  closeTo(terminal.q[state*Engine.ACTION_COUNT+action],4,'alpha=1 writes the terminal target');
  assert.strictEqual(terminal.visits[state],1,'Q update records the state visit');

  const continuing=Engine.createEngine({seed:41,learning:{alpha:1,gamma:.5,epsilon:0}});
  continuing.q[nextState*Engine.ACTION_COUNT+2]=100;
  const nextUpdate=Engine.updateQ(continuing,state,action,4,nextState,false);
  closeTo(nextUpdate.future,100,'continuing transition finds the best future action');
  closeTo(nextUpdate.target,54,'continuing target includes discounted future value');
  closeTo(continuing.q[state*Engine.ACTION_COUNT+action],54,'Q update follows the displayed formula');
}

function checkDeterminismAndFiniteNumbers(){
  const first=Engine.createEngine({seed:0xabc123});
  const second=Engine.createEngine({seed:0xabc123});
  const firstEpisodes=[];
  const secondEpisodes=[];
  for(let i=0;i<80;i++){
    firstEpisodes.push(Engine.runEpisode(first));
    secondEpisodes.push(Engine.runEpisode(second));
  }
  firstEpisodes.forEach((episode,index)=>{
    closeTo(episode.distance,secondEpisodes[index].distance,`seeded episode ${index+1} is deterministic`);
    closeTo(episode.reward,secondEpisodes[index].reward,`seeded episode ${index+1} reward is deterministic`);
    assert(Number.isFinite(episode.distance)&&Number.isFinite(episode.reward),'episode metrics never become NaN or Infinity');
  });
  for(let index=0;index<first.q.length;index++){
    assert(Number.isFinite(first.q[index]),`Q value ${index} remains finite`);
    assert.strictEqual(first.q[index],second.q[index],`Q value ${index} is reproducible`);
  }
  const evaluation=Engine.evaluate(first,[11,29,47]);
  assert(Number.isFinite(evaluation.medianDistance),'evaluation produces a finite median distance');
  assert(evaluation.finishRate>=0&&evaluation.finishRate<=1,'evaluation finish rate is a probability');

  first.q[123]=9;
  first.visits[4]=5;
  Engine.resetEngine(first,99);
  assert.strictEqual(first.episodes,0,'reset returns the learning count to zero');
  assert.strictEqual(first.q[123],0,'reset clears learned Q values');
  assert.strictEqual(first.visits[4],0,'reset clears state visit counts');
  assert.strictEqual(first.seed,99,'reset applies the requested deterministic seed');
}

function fakeCanvasContext(){
  return {
    fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'start',textBaseline:'alphabetic',globalAlpha:1,
    beginPath(){},closePath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},stroke(){},fill(){},fillRect(){},
    arc(){},ellipse(){},roundRect(){},save(){},restore(){},translate(){},rotate(){},scale(){},setLineDash(){},fillText(){},
    clearRect(){},measureText(){return {width:40};},createLinearGradient(){return {addColorStop(){}};}
  };
}

async function checkPageAndUi(){
  assert(html.includes('id="world"'),'walker canvas is present');
  assert(html.includes('data-train="500"'),'500-episode cumulative training control is present');
  assert(html.includes('data-train="2000"'),'a harder multi-thousand-episode experiment is present');
  assert(html.includes('id="rewardChart"'),'learning chart is present');
  assert(/Q\s*[（(]?s\s*,\s*a[）)]?/i.test(html)||html.includes('Q値'),'Q values are explained');
  assert(html.includes('報酬')&&html.includes('腕'),'reward design and arm control are visible topics');
  assert(html.indexOf('engine.js')>=0&&html.indexOf('engine.js')<html.indexOf('app.js'),'pure engine loads before the interface controller');
  assert(programming.includes('reinforcement-walker/index.html'),'programming index links to walker');

  const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://example.test/study/programming/reinforcement-walker/'});
  const {window}=dom;
  const staticDoc=window.document;
  assert(staticDoc.getElementById('replayButtons'),'learning milestone replays have a dedicated control');
  assert(staticDoc.getElementById('discoveries'),'evidence-based discoveries have a dedicated list');
  assert(staticDoc.getElementById('equationNumbers'),'the numeric Q update can be inspected');
  assert(staticDoc.getElementById('qTableBody'),'visited Q-table rows have a dedicated table body');
  assert.strictEqual(staticDoc.querySelectorAll('#qHeatmap [data-q-action]').length,15,'the initial Q heatmap exposes all 15 actions');
  assert.strictEqual(staticDoc.querySelectorAll('#qHeatmap [role="row"]').length,6,'the Q heatmap has accessible table rows');
  assert.strictEqual(staticDoc.querySelectorAll('#qHeatmap [role="cell"][aria-live="off"]').length,15,'Q cells do not create live-region flooding');
  assert.strictEqual(staticDoc.querySelectorAll('#rewardForward, #rewardBalance, #rewardEnergy, #rewardFall').length,4,'all four reward terms can be designed');
  assert(staticDoc.getElementById('stopTraining'),'long training can be stopped between episodes');
  assert.strictEqual(staticDoc.getElementById('trainingBar').getAttribute('aria-labelledby'),'trainingLabel','training progress has an accessible name');
  assert(staticDoc.getElementById('stopReplay'),'long learning replays can be stopped');
  assert(staticDoc.getElementById('chartA11y'),'the learning chart has a text equivalent');
  assert.strictEqual(staticDoc.querySelectorAll('#discoveries [data-discovery-status]').length,5,'each discovery exposes found or not-found text');
  assert(staticDoc.getElementById('movementTheory'),'movement principles sit beside the manual controls');
  assert(staticDoc.getElementById('actionInsight'),'each manual action has a dynamic explanation');
  assert(staticDoc.getElementById('qStory'),'one Q-table update has a focused explanation');
  assert(staticDoc.getElementById('parameterFocus'),'one parameter at a time has a focused explanation');
  assert(/成功確率ではありません/.test(staticDoc.getElementById('qStory').textContent),'Q value is explicitly distinguished from a probability');
  assert(/足は交互|足の順番/.test(staticDoc.getElementById('movementTheory').textContent),'alternating feet are explained');
  assert(/腕.*回転|回転.*腕/.test(staticDoc.getElementById('movementTheory').textContent),'arm rotation is explained');
  assert(/踏ん張る/.test(staticDoc.getElementById('movementTheory').textContent),'bracing and recovery are explained');
  window.HTMLCanvasElement.prototype.getContext=()=>fakeCanvasContext();
  window.requestAnimationFrame=()=>0;
  window.cancelAnimationFrame=()=>{};
  window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
  let uiStepCalls=0;
  window.WalkerEngine=Object.assign({},Engine,{
    step(...args){uiStepCalls++;return Engine.step(...args);}
  });
  window.eval(appJs);
  const doc=window.document;
  const debug=window.__walkerDebug;

  assert(/完走.*\+/.test(doc.getElementById('rewardFormula').textContent),'displayed reward formula includes the finish bonus');
  const beforeArmTime=debug.bot.time;
  const beforeArmX=debug.bot.x;
  doc.querySelector('[data-arm="arms-left"]').click();
  assert.strictEqual(debug.bot.time,beforeArmTime,'selecting an arm direction alone does not advance simulated time');
  closeTo(debug.bot.x,beforeArmX,'selecting an arm direction alone does not move the walker');
  assert.strictEqual(uiStepCalls,0,'arm selection alone does not call the shared physics step');
  debug.bot.lean=.35;
  doc.querySelector('[data-arm="arms-left"]').click();
  assert.strictEqual(doc.getElementById('armHint').dataset.balanceEffect,'recover','opposite arm is described as the recovery side');
  doc.querySelector('[data-arm="arms-right"]').click();
  assert.strictEqual(doc.getElementById('armHint').dataset.balanceEffect,'worsen','same-side arm warns that lean may grow');
  doc.querySelector('[data-arm="arms-center"]').click();
  debug.bot.lean=0;
  doc.querySelector('[data-leg="left-short"]').click();
  assert.strictEqual(uiStepCalls,1,'the next leg click calls the shared physics exactly once');
  assert.strictEqual(debug.bot.time,beforeArmTime+1,'the compound leg-and-arm action advances exactly one time step');
  assert(debug.bot.x>beforeArmX,'the first valid compound step advances the walker');
  assert.strictEqual(doc.getElementById('actionInsight').dataset.outcome,'push','a successful step is labelled as propulsion');
  assert.strictEqual(doc.getElementById('nextFootStatus').textContent,'右足','the body readout changes to the next foot');
  assert(/あと 2 回/.test(doc.getElementById('recoveryStatus').textContent),'the body readout exposes short-step recovery');
  doc.querySelector('[data-leg="right-short"]').click();
  assert.strictEqual(uiStepCalls,2,'a premature second foot still advances physics exactly once');
  assert.strictEqual(doc.getElementById('actionInsight').dataset.outcome,'stumble','a premature foot is labelled as a stumble');
  assert.strictEqual(doc.getElementById('actionInsight').dataset.reason,'recovering','the dynamic explanation exposes recovery as the cause');
  debug.startManual();
  debug.bot.time=debug.engine.physics.maxSteps-1;
  doc.querySelector('[data-leg="brace"]').click();
  assert.strictEqual(debug.bot.doneReason,'timeout','the manual test can end by time rather than a fall');
  assert(/時間切れ/.test(doc.getElementById('coach').textContent)&&!/ころん/.test(doc.getElementById('coach').textContent),'timeout guidance is not mislabeled as a fall');
  debug.startManual();

  const train50=doc.querySelector('[data-train="50"]');
  assert(train50,'fast training button can be operated');
  train50.click();
  assert.strictEqual(doc.activeElement,doc.getElementById('stopTraining'),'keyboard focus moves to the stop control during training');
  assert(doc.getElementById('resetLearning').disabled,'reset is disabled while asynchronous training is active');
  assert(doc.getElementById('rewardForward').disabled,'reward sliders are disabled while asynchronous training is active');
  assert(doc.querySelector('[data-reward-preset]').disabled,'reward presets are disabled while asynchronous training is active');
  const engineWhileTraining=debug.engine;
  const episodesWhileTraining=debug.engine.episodes;
  debug.resetLearning('test must not reset an active batch');
  assert.strictEqual(debug.engine,engineWhileTraining,'resetLearning cannot replace the engine during an active batch');
  assert.strictEqual(debug.engine.episodes,episodesWhileTraining,'resetLearning cannot erase progress during an active batch');
  const episodeElement=doc.getElementById('episode');
  const displayedEpisodes=()=>Number((episodeElement&&episodeElement.textContent||'').replace(/[^0-9]/g,''));
  for(let i=0;i<250&&episodeElement&&displayedEpisodes()!==50;i++){
    await new Promise(resolve=>setTimeout(resolve,4));
  }
  assert(episodeElement,'learning count is exposed in the HUD');
  assert.strictEqual(displayedEpisodes(),50,'50 training episodes complete without blocking the UI');
  const trainingProgress=doc.getElementById('trainingProgress');
  for(let i=0;i<100&&trainingProgress&&!trainingProgress.hidden;i++){
    await new Promise(resolve=>setTimeout(resolve,4));
  }
  assert(!trainingProgress||trainingProgress.hidden,'training returns control to the learner after the batch');
  assert(!/まだ学習前/.test(doc.getElementById('chartA11y').textContent),'training updates the chart text equivalent');

  if(debug&&debug.engine){
    assert.strictEqual(debug.engine.episodes,50,'UI count agrees with the engine count');
    assert(debug.engine.q.some(value=>value!==0),'training changes the Q table');
    const update=debug.engine.lastUpdate;
    const story=doc.getElementById('qStory');
    assert.strictEqual(Number(story.dataset.state),update.state,'Q story uses the last updated state');
    assert.strictEqual(Number(story.dataset.action),update.action,'Q story uses the last updated action');
    assert.strictEqual(Number(doc.getElementById('qHeatmap').dataset.state),update.state,'Q heatmap shows the same state as the story');
    assert.strictEqual(doc.querySelectorAll(`.last-updated[data-q-action="${update.action}"]`).length,1,'exactly one Q cell marks the updated action');
    closeTo(Number(doc.getElementById('qStoryOld').dataset.value),update.old,'Q story old value matches the engine');
    closeTo(Number(doc.getElementById('qStoryReward').dataset.value),update.reward,'Q story reward matches the engine');
    closeTo(Number(doc.getElementById('qStoryFuture').dataset.value),update.future,'Q story future value matches the engine');
    closeTo(Number(doc.getElementById('qStoryNew').dataset.value),update.value,'Q story new value matches the engine');
    assert(!/まだ更新/.test(doc.getElementById('equationNumbers').textContent),'numeric formula appears after learning');
  }
  const contributionIds=['rewardContributionForward','rewardContributionBalance','rewardContributionEnergy','rewardContributionFall'];
  const contributions=contributionIds.map(id=>doc.getElementById(id)).filter(Boolean);
  if(contributions.length){
    assert.strictEqual(contributions.length,4,'the last episode exposes all four reward contributions');
    assert(contributions.some(element=>!/^[-+−]0\.00$/.test(element.textContent.trim())),'training replaces the reward-breakdown placeholders');
  }

  const alpha=doc.getElementById('alpha');
  if(alpha&&debug){
    doc.querySelector('[data-parameter-focus="epsilon"]').click();
    assert.strictEqual(doc.getElementById('parameterFocus').dataset.parameter,'epsilon','parameter tabs reveal one selected concept');
    assert(/今は約/.test(doc.getElementById('parameterFocusExample').textContent),'epsilon distinguishes initial and current exploration');
    doc.querySelector('[data-parameter-focus="alpha"]').click();
    alpha.value=String(Number(alpha.value)+.01);
    alpha.dispatchEvent(new window.Event('input',{bubbles:true}));
    closeTo(Number(doc.getElementById('alphaValue').textContent),Number(alpha.value),'parameter preview updates while dragging');
    alpha.dispatchEvent(new window.Event('change',{bubbles:true}));
    assert.strictEqual(debug.engine.episodes,0,'confirming a parameter starts a fair experiment from zero');
    assert.strictEqual(debug.history.length,0,'parameter reset clears the mixed-condition graph history');
    assert(!debug.engine.q.some(value=>value!==0),'parameter reset clears the mixed-condition Q table');
  }

  const rewardInput=doc.querySelector('[data-reward], #rewardForward, #forwardReward');
  if(rewardInput){
    rewardInput.value=String(Number(rewardInput.value)+Number(rewardInput.step||.01));
    rewardInput.dispatchEvent(new window.Event('change',{bubbles:true}));
    assert.strictEqual(displayedEpisodes(),0,'changing the reward design starts a fresh experiment');
  }
  const safetyPreset=doc.querySelector('[data-reward-preset="safe"], [data-reward-preset="survival"]');
  if(safetyPreset&&debug&&debug.engine){
    const before=JSON.stringify(debug.engine.reward);
    safetyPreset.click();
    assert.notStrictEqual(JSON.stringify(debug.engine.reward),before,'every visible reward preset applies a reward design');
  }

  const testButton=doc.getElementById('testAi');
  assert(testButton,'AI test remains available before or after training');
  testButton.click();
  assert(/AI|テスト/.test(doc.getElementById('modeBadge').textContent),'AI test switches the visible mode');
  dom.window.close();
}

checkEngineContract();
checkPhysicsAndRewards();
checkMovementPrinciples();
checkQUpdate();
checkDeterminismAndFiniteNumbers();
checkPageAndUi()
  .then(()=>console.log('reinforcement walker checks passed'))
  .catch(error=>{console.error(error);process.exitCode=1;});
