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
  assert.strictEqual(staticDoc.querySelectorAll('#rewardForward, #rewardBalance, #rewardEnergy, #rewardFall').length,4,'all four reward terms can be designed');
  assert(staticDoc.getElementById('stopTraining'),'long training can be stopped between episodes');
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
  doc.querySelector('[data-leg="left-short"]').click();
  assert.strictEqual(uiStepCalls,1,'the next leg click calls the shared physics exactly once');
  assert.strictEqual(debug.bot.time,beforeArmTime+1,'the compound leg-and-arm action advances exactly one time step');
  assert(debug.bot.x>beforeArmX,'the first valid compound step advances the walker');

  const train50=doc.querySelector('[data-train="50"]');
  assert(train50,'fast training button can be operated');
  train50.click();
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

  if(debug&&debug.engine){
    assert.strictEqual(debug.engine.episodes,50,'UI count agrees with the engine count');
    assert(debug.engine.q.some(value=>value!==0),'training changes the Q table');
  }
  const contributionIds=['rewardContributionForward','rewardContributionBalance','rewardContributionEnergy','rewardContributionFall'];
  const contributions=contributionIds.map(id=>doc.getElementById(id)).filter(Boolean);
  if(contributions.length){
    assert.strictEqual(contributions.length,4,'the last episode exposes all four reward contributions');
    assert(contributions.some(element=>!/^[-+−]0\.00$/.test(element.textContent.trim())),'training replaces the reward-breakdown placeholders');
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
checkQUpdate();
checkDeterminismAndFiniteNumbers();
checkPageAndUi()
  .then(()=>console.log('reinforcement walker checks passed'))
  .catch(error=>{console.error(error);process.exitCode=1;});
