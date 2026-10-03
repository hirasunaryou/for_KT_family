const fs=require('fs');
const path=require('path');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');

const root=path.join(__dirname,'..');
const helpPath=path.join(root,'study/programming/reinforcement-walker/help.html');
const gamePath=path.join(root,'study/programming/reinforcement-walker/index.html');
const helpJsPath=path.join(root,'assets/reinforcement-walker/help.js');
const enginePath=path.join(root,'assets/reinforcement-walker/engine.js');
const programmingPath=path.join(root,'study/programming/index.html');
const helpHtml=fs.readFileSync(helpPath,'utf8');
const gameHtml=fs.readFileSync(gamePath,'utf8');
const helpJs=fs.readFileSync(helpJsPath,'utf8');
const programming=fs.readFileSync(programmingPath,'utf8');
const Engine=require(enginePath);

function makeDom(hash=''){
  const dom=new JSDOM(helpHtml,{runScripts:'outside-only',url:`https://example.test/study/programming/reinforcement-walker/help.html${hash}`});
  dom.window.WalkerEngine=Engine;
  dom.window.eval(helpJs);
  return dom;
}

function checkStaticPage(){
  const dom=new JSDOM(helpHtml,{url:'https://example.test/study/programming/reinforcement-walker/help.html'});
  const doc=dom.window.document;
  assert.equal(doc.querySelectorAll('[data-help-topic]').length,4,'help divides walking into four focused topics');
  assert.equal(doc.querySelectorAll('.site-return-nav a').length,3,'help has persistent exits to the site, list, and game');
  assert(doc.querySelector('#gaitScene[role="img"]'),'the side-view scene is exposed as an image');
  assert(doc.getElementById('gaitSceneTitle')&&doc.getElementById('gaitSceneDesc'),'the changing scene has a title and description');
  assert.equal(doc.querySelector('.help-explanation').getAttribute('aria-live'),'polite','one changing explanation is announced without flooding');
  assert(doc.getElementById('helpPrev')&&doc.getElementById('helpNext')&&doc.getElementById('helpReset'),'previous, next, and reset controls are present');
  assert(/簡略モデル/.test(doc.querySelector('.help-model-note').textContent),'the game model is distinguished before the walkthrough');
  assert(/画面右が前/.test(doc.querySelector('.help-model-note').textContent),'screen direction is explicit before left and right feet appear');
  assert(/物理学の運動量|速度と運動量は別/.test(doc.querySelector('.help-accuracy').textContent),'game momentum wording is distinguished from formal physics');
  assert(/JavaScriptなし/.test(doc.querySelector('noscript').textContent),'a complete no-JavaScript summary remains readable');
  assert(gameHtml.indexOf('help.html#push')>=0&&gameHtml.indexOf('help.html#push')<gameHtml.indexOf('id="world"'),'the game links to help before the canvas');
  assert(/target="_blank" rel="opener"/.test(gameHtml),'help opens separately so an in-memory learning session is preserved');
  assert(gameHtml.includes('id="motionHelpLink"'),'the live result has a contextual help entrance');
  assert(programming.includes('reinforcement-walker/help.html#push'),'the programming index offers the guide as a separate entrance');
  assert(helpHtml.includes('engine.js?v=20261004-1')&&helpHtml.includes('help.js?v=20261004-1'),'help loads versioned local assets in dependency order');
  dom.window.close();
}

function checkStepper(){
  const dom=makeDom();
  const {document:doc}=dom.window;
  const debug=dom.window.__walkerHelpDebug;
  assert(debug,'help exposes deterministic state for regression checks');
  assert.equal(debug.topic,'push');
  assert.equal(debug.step,0);
  assert.equal(doc.getElementById('helpStepCount').textContent,'1 / 6');
  assert(doc.getElementById('helpPrev').disabled,'previous is disabled on the first frame');
  assert(doc.getElementById('helpReset').disabled,'reset is disabled before any movement');
  assert(!doc.getElementById('helpNext').disabled,'next is available on the first frame');

  doc.getElementById('helpNext').click();
  assert.equal(debug.step,1,'next advances exactly one frame');
  assert(!doc.getElementById('helpContact').hasAttribute('hidden'),'contact appears on its own frame');
  assert(doc.getElementById('helpPushArrow').hasAttribute('hidden'),'the push is not revealed before its frame');
  assert(Number(doc.getElementById('helpLeftFootLabel').getAttribute('x'))>Number(doc.getElementById('helpRightFootLabel').getAttribute('x')),'the left-foot label follows the left foot when it crosses to screen right');

  doc.getElementById('helpNext').click();
  assert.equal(debug.step,2);
  assert(!doc.getElementById('helpPushArrow').hasAttribute('hidden'),'the foot-to-ground arrow appears on the push frame');
  assert(doc.getElementById('helpReactionArrow').hasAttribute('hidden'),'the reaction arrow waits for the next frame');
  doc.getElementById('helpNext').click();
  assert(!doc.getElementById('helpReactionArrow').hasAttribute('hidden'),'the ground reaction appears on its own frame');
  assert(/地面が足を前へ押す/.test(doc.getElementById('helpReactionLabel').textContent),'the force direction is labelled separately from transmission through the leg');
  doc.getElementById('helpPrev').click();
  assert(doc.getElementById('helpReactionArrow').hasAttribute('hidden'),'going back removes later-frame emphasis');
  doc.getElementById('helpReset').click();
  assert.equal(debug.step,0,'reset returns to the first frame');

  doc.querySelector('[data-help-topic="brace"]').click();
  assert.equal(debug.topic,'brace','a topic button selects the requested explanation');
  assert.equal(debug.step,0,'changing topic starts at its first frame');
  assert.equal(dom.window.location.hash,'#brace','topic selection creates a shareable deep link');
  doc.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  assert.equal(debug.step,1,'right arrow advances one frame');
  assert(/推進|速度/.test(doc.getElementById('helpStepText').textContent),'brace frames explain propulsion and retained speed');

  debug.setStep(999);
  assert.equal(debug.step,debug.topics.brace.frames.length-1,'the state cannot advance beyond the topic');
  assert(!doc.getElementById('helpNext').disabled&&/腕/.test(doc.getElementById('helpNext').textContent),'the last brace frame leads into the arm topic');
  doc.getElementById('helpNext').click();
  assert.equal(debug.topic,'arms','next connects one topic to the next');
  assert.equal(debug.step,0,'the next topic begins at its first frame');
  doc.querySelector('[data-help-topic="brace"]').click();
  debug.setStep(-20);
  assert.equal(debug.step,0,'the state cannot move before the first frame');

  doc.querySelector('[data-help-topic="arms"]').click();
  assert.equal(doc.getElementById('helpStepCount').textContent,'1 / 5','each topic owns its own frame count');
  doc.querySelector('[data-help-topic="mistakes"]').click();
  assert(/つまず/.test(doc.getElementById('helpTopicTitle').textContent),'failure reasons have a dedicated entry');
  assert(debug.motion.step.pushAdded>0,'the guide takes the successful push value from the real engine');
  assert.equal(debug.motion.brace1.pushAdded,0,'the guide takes zero brace propulsion from the real engine');
  assert(debug.motion.brace1.speedAfter<debug.motion.brace1.speedBefore,'the guide reflects real coasting slowdown');
  dom.window.close();
}

function checkDeepLink(){
  const dom=makeDom('#arms');
  assert.equal(dom.window.__walkerHelpDebug.topic,'arms','a direct topic hash opens the requested explanation');
  assert.equal(dom.window.__walkerHelpDebug.step,0,'a deep-linked topic starts from its first frame');
  dom.window.close();
}

function checkGuidedRoute(){
  const dom=makeDom('#push');
  const {document:doc}=dom.window;
  const debug=dom.window.__walkerHelpDebug;
  const visited=[debug.topic];
  let guard=0;
  while(!(debug.topic==='mistakes'&&debug.step===debug.topics.mistakes.frames.length-1)&&guard<40){
    const beforeTopic=debug.topic;
    doc.getElementById('helpNext').click();
    if(debug.topic!==beforeTopic)visited.push(debug.topic);
    guard++;
  }
  assert.deepEqual(visited,['push','brace','arms','mistakes'],'the recommended route connects all four topics in order');
  assert(guard<40,'the guide reaches its final frame without a loop');
  assert(/ゲームで試す/.test(doc.getElementById('helpNext').textContent),'the final frame returns the learner to practice');
  dom.window.close();
}

checkStaticPage();
checkStepper();
checkDeepLink();
checkGuidedRoute();
console.log('reinforcement walker help checks passed');
