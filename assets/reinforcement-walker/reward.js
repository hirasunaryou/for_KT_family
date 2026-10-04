(function(){
  'use strict';

  const E=window.WalkerEngine;
  const $=id=>document.getElementById(id);
  if(!E||!$('rewardLab'))return;

  const TRAIN_EPISODES=5000;
  const TRAIN_SEED=4242;
  const TRACE_SEED=223;
  const EVALUATION_SEEDS=[11,29,47,83,131,149,197,223,269,307,353,401,449,503,557,601,653,701,751,809];
  const CURVE_SEEDS=[17,61,109,181,277];
  const CHECKPOINT=500;
  const PROFILES={
    safe:{
      id:'safe',label:'前進を採点しない',short:'前進0の採点',color:'#6a7d77',
      reward:{forward:0,balance:.08,energy:.12,fall:35},
      description:'前進0点/m・完走+0。直立・省エネ・転倒回避を採点。'
    },
    both:{
      id:'both',label:'前進＋安全',short:'一つ直した採点',color:'#267a70',
      reward:{forward:5,balance:.08,energy:.12,fall:35},
      description:'前進+5点/m・完走+3.5。ほかは同じ。'
    },
    rush:{
      id:'rush',label:'前進だけ',short:'安全条件を外した採点',color:'#c85b3f',
      reward:{forward:20,balance:0,energy:0,fall:0},
      description:'前進+20点/m・完走+14。直立・力・転倒は0。'
    }
  };
  const PROFILE_ORDER=['safe','both','rush'];
  const PREDICTION_LABELS={careful:'ゆっくり歩く',still:'その場で待つ',rush:'大股で進む'};
  const ACTION_IDS={step:'left-short-arms-center',wait:'brace-arms-center'};
  const actionIndex=id=>E.ACTIONS.findIndex(action=>action.id===id);
  const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const frames=[
    {
      question:'「安全」を強くほめたら、AIはどうする？',
      title:'答えを見る前に予想する',
      text:'人は「転ばずに歩いて」と一文で言えます。でもAIが受け取るのは、結果につけた数字だけです。',
      look:'自分の予想を、最後の実際の動きと比べる',
      changed:'まだ何も変えない。まず予想だけ',
      takeaway:'人の願いと、AIへ渡した採点表は同じとは限らない。',
      caution:'予想に正解・不正解をつけるのが目的ではありません。結果とのずれが、採点を考える入口です。'
    },
    {
      question:'AIには「安全に歩いて」のどこまで届いた？',
      title:'願いを、四つの数字へ翻訳する',
      text:'直立、力、転倒は数字にしました。前進の欄もありますが、値は0です。AIは書かれていない目的を補いません。',
      look:'人の言葉「前へ」と、採点表の前進0点のずれ',
      changed:'採点表を見えるようにしただけ',
      takeaway:'「転ばずに」は数にした。でも「歩く」は数に入っていない。',
      caution:'報酬は正解ラベルではなく、結果へ返す点です。0点の目的は、AIから見ると増やす理由がありません。'
    },
    {
      question:'小さな一歩と、一拍待つ。どちらが得？',
      title:'同じ一瞬を、実際に採点する',
      text:'二つの行動を同じ開始場面から実行します。物理的な結果を四項目へ分け、その合計だけをAIへ返します。',
      look:'前進した一歩が負、動かない一拍が正になるところ',
      changed:'行動だけ。体、開始場面、採点表は同じ',
      takeaway:'この採点では、前へ出るより待つ方が高得点。',
      caution:'AIが怠けたり反抗したりしたのではありません。渡した数字を比べています。'
    },
    {
      question:'5,000回学べば、いつか願いを察して歩く？',
      title:'抜けた採点を、上手に攻略する',
      text:'空の経験メモ（Qテーブル）から5,000回練習します。途中は固定5条件、最後は別の20条件でテストし、探索もQ更新もしません。',
      look:'学習回数が増えても、テスト距離が0のままか',
      changed:'経験回数だけ。採点の抜けは直していない',
      takeaway:'この固定条件では、回数を増やすほど「動かない攻略」が定着した。',
      caution:'「5,000回も学んだのに失敗」ではありません。この採点では転ばず点を守れているので、AI側では成功です。'
    },
    {
      question:'採点表へ何を一つ足せば、動き始める？',
      title:'前進点だけを、0から5へ直す',
      text:'直立・力・転倒はそのまま。前進だけを+5/mへ変えます。完走ボーナスも同じ係数から+3.5になります。Qを0へ戻して同じ5,000回を行います。',
      look:'一つの採点変更で、距離の線と完走数が変わるところ',
      changed:'前進係数 0 → 5だけ。完走ボーナスはその0.7倍',
      takeaway:'入れた目的だけが、AIの学習対象になる。',
      caution:'前のQを引き継ぐと、報酬変更だけの比較になりません。毎回Q=0から公平に比べます。'
    },
    {
      question:'安全・省エネを外し、前進だけをほめたら？',
      title:'採点へ入れたもの、外したものを比べる',
      text:'安全・省エネの採点を外し、前進だけ20点/m（完走+14）にした条件も育てます。報酬合計は物差し自体が違うため比べず、距離・結果・操作コストを見ます。',
      look:'停止、完走、突進して転倒という三つの攻略法',
      changed:'最後は採点表だけ。体・乱数列・回数は同じ',
      takeaway:'報酬設計は、想定外の攻略法を見て採点を直す往復。',
      caution:'一つの再生だけで決めず、同じ20条件の中央値や回数も見ます。教材では違いを見やすくするため、採点を極端にしています。'
    }
  ];

  function makeTrial(actionId){
    const engine=E.createEngine({
      seed:401,
      reward:PROFILES.safe.reward,
      physics:{roughness:0,maxSteps:40,targetDistance:30}
    });
    const bot=E.createBot({seed:402},false);
    const state=E.stateIndex(bot);
    const action=actionIndex(actionId);
    const result=E.step(engine,bot,action,{seed:403});
    const nextState=result.done?0:E.stateIndex(bot);
    const update=E.updateQ(engine,state,action,result.reward,nextState,result.done);
    return {actionId,action,state,nextState,result,update,bot:E.snapshot(bot,action)};
  }

  const trials={step:makeTrial(ACTION_IDS.step),wait:makeTrial(ACTION_IDS.wait)};
  let step=0;
  let maxUnlocked=0;
  let prediction=null;
  let zeroFound=false;
  let scoredActions=new Set();
  let lastScoredAction=null;
  let forwardAdded=false;
  let bundles={};
  let trainingProfile=null;
  let compared=false;
  let selectedMetric=null;
  let replayToken=0;

  const lab=$('rewardLab');
  const sceneCard=lab.querySelector('.reward-scene-card');
  const panels=Array.from(document.querySelectorAll('[data-reward-panel]'));

  function signed(value,digits=3){
    const limit=Math.pow(10,-digits)/2;
    const number=Math.abs(value)<limit?0:value;
    if(number>0)return `+${number.toFixed(digits)}`;
    if(number<0)return `−${Math.abs(number).toFixed(digits)}`;
    return number.toFixed(digits);
  }

  function median(values){
    const sorted=values.slice().sort((a,b)=>a-b);
    if(!sorted.length)return 0;
    const middle=Math.floor(sorted.length/2);
    return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
  }

  function average(values){
    return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0;
  }

  function nextEpisodeSeed(seed){
    return (Math.imul(seed,1664525)+1013904223)>>>0;
  }

  function evaluateEngine(engine,seeds,withTrace){
    const beforeEpisodes=engine.episodes;
    const results=seeds.map(seed=>E.runEpisode(engine,{learn:false,greedy:true,seed,trace:Boolean(withTrace&&seed===TRACE_SEED)}));
    const distances=results.map(result=>result.distance);
    const representative=results[seeds.indexOf(TRACE_SEED)]||null;
    const summary={
      medianDistance:median(distances),
      averageDistance:average(distances),
      finishes:results.filter(result=>result.reason==='finish').length,
      falls:results.filter(result=>result.reason==='fall').length,
      timeouts:results.filter(result=>result.reason==='timeout').length,
      averageEffort:average(results.map(result=>result.effort)),
      averageStumbles:average(results.map(result=>result.stumbles)),
      averageBraceRate:average(results.map(result=>result.steps?(result.steps-result.legActions)/result.steps:0))
    };
    if(engine.episodes!==beforeEpisodes)throw new Error('Evaluation changed the learning episode count.');
    return {results,summary,representative};
  }

  function createDots(){
    const container=$('rewardStepDots');
    frames.forEach((frame,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.dataset.rewardStep=String(index);
      button.setAttribute('aria-label',`${index+1}コマ目：${frame.title}`);
      button.setAttribute('aria-pressed',index===0?'true':'false');
      button.textContent=String(index+1);
      button.addEventListener('click',()=>setStep(index,true));
      container.appendChild(button);
    });
  }

  function renderTrialDetails(){
    const host=$('rewardTrialDetails');
    const items=['step','wait'].filter(id=>scoredActions.has(id));
    host.innerHTML=items.map(id=>{
      const trial=trials[id];
      const c=trial.result.components;
      return `<article><b>${id==='step'?'小さな一歩':'踏ん張る（1手待つ）'}　${signed(trial.result.reward)}</b><span>前進 ${signed(c.forward)} ＋ 直立 ${signed(c.balance)} ＋ 操作コスト ${signed(c.energy)} ＋ 転倒 ${signed(c.fall)}</span></article>`;
    }).join('');
  }

  function renderScoring(){
    document.querySelectorAll('[data-score-action]').forEach(button=>{
      const id=button.dataset.scoreAction;
      const done=scoredActions.has(id);
      button.setAttribute('aria-pressed',done?'true':'false');
      const output=button.querySelector(`[data-action-score="${id}"]`);
      output.textContent=done?`報酬 約${signed(trials[id].result.reward,2)}`:'まだ採点していない';
    });
    $('rewardActionVerdict').hidden=scoredActions.size<2;
    $('rewardQBridge').hidden=scoredActions.size<2;
    if(scoredActions.size===2)$('rewardQValues').textContent=`一歩のQ：0 → ${signed(trials.step.update.value)} ／ 待つQ：0 → ${signed(trials.wait.update.value)}`;
    renderTrialDetails();
  }

  function renderBoard(){
    const label=$('rewardBoardLabel');
    const title=$('rewardBoardTitle');
    const forward=$('rewardBoardForward');
    const balance=$('rewardBoardBalance');
    const energy=$('rewardBoardEnergy');
    const fall=$('rewardBoardFall');
    if(step===0){
      label.textContent='人の願い';title.textContent='転ばず前へ歩いて';
      forward.textContent='前進　？';balance.textContent='直立　？';energy.textContent='力　？';fall.textContent='転倒　？';
      return;
    }
    let profile=PROFILES.safe;
    if(step===4&&forwardAdded)profile=PROFILES.both;
    if(step===5)profile=PROFILES.rush;
    label.textContent='AIへ渡した採点表';
    title.textContent=profile.label;
    forward.textContent=`前進　${profile.reward.forward}/m・完走+${(profile.reward.forward*.7).toFixed(1)}`;
    balance.textContent=`直立　${profile.reward.balance}`;
    energy.textContent=`力　${profile.reward.energy?`−${profile.reward.energy}`:'0'}`;
    fall.textContent=`転倒　${profile.reward.fall?`−${profile.reward.fall}`:'0'}`;
  }

  function renderScene(){
    const figure=$('rewardFigure');
    const ghost=$('rewardGhost');
    const motion=$('rewardMotionArrow');
    const fall=$('rewardFallMark');
    const scoreTag=$('rewardScoreTag');
    let mode='ready';
    if(step===2&&lastScoredAction==='step')mode='step';
    if(step===2&&lastScoredAction==='wait')mode='wait';
    if(step===3&&bundles.safe)mode='wait';
    if(step===4&&bundles.both)mode='walk';
    if(step===5&&bundles.rush)mode='fall';
    ghost.toggleAttribute('hidden',!(mode==='step'||mode==='walk'));
    motion.toggleAttribute('hidden',!(mode==='step'||mode==='walk'));
    fall.toggleAttribute('hidden',mode!=='fall');
    scoreTag.toggleAttribute('hidden',!(step===2&&lastScoredAction));
    figure.setAttribute('transform',mode==='step'?'translate(238 269)':mode==='walk'?'translate(310 269)':mode==='fall'?'translate(260 269) rotate(54)':'translate(202 269)');
    $('rewardLeftLeg').setAttribute('points',mode==='step'||mode==='walk'?'0,-52 26,-29 54,0':mode==='fall'?'0,-52 37,-25 72,-3':'0,-52 -17,-27 -29,0');
    $('rewardRightLeg').setAttribute('points',mode==='fall'?'0,-52 5,-24 0,0':'0,-52 18,-26 31,0');
    if(step===2&&lastScoredAction)$('rewardScoreText').textContent=`報酬 ${signed(trials[lastScoredAction].result.reward)}`;
    const descriptions={
      ready:['採点表を見上げる棒人間','棒人間は同じ開始姿勢で立っています。まだ、どんな歩き方になるかは表示していません。','人の願いは「転ばず前へ」。でも、AIへ渡るのは数字の採点表だけです。'],
      step:['小さな一歩を出した棒人間','同じ開始姿勢から左足を小さく出し、0.043メートル進みました。','前へ進んでも、使った力のマイナスが大きく、この採点では報酬が負になりました。'],
      wait:['その場で一拍待つ棒人間','同じ開始姿勢で足を出さず、一拍待っています。','動かず転ばない一拍が、この採点では正の報酬になります。'],
      walk:['前へ歩く棒人間','前進点を加えた採点で学び、棒人間が前へ歩いています。','前進を採点へ入れると、転ばず前へ進む工夫が学習対象になりました。'],
      fall:['無理に進んで倒れた棒人間','前進だけを採点した棒人間が無理に足を出し、倒れています。','前進だけを強く採点すると、つまずきや力を気にせず突進する攻略が生まれました。']
    };
    $('rewardSceneTitle').textContent=descriptions[mode][0];
    $('rewardSceneDesc').textContent=descriptions[mode][1];
    $('rewardSceneCaption').textContent=descriptions[mode][2];
    renderBoard();
  }

  function renderProgress(profileId,value){
    const prefix=profileId==='safe'?'Safe':profileId==='both'?'Both':'Rush';
    const host=$(`reward${prefix}Progress`);
    if(!host)return;
    host.hidden=false;
    host.querySelector('progress').value=value;
    host.querySelector('[data-progress-label]').textContent=`${value.toLocaleString('ja-JP')} / ${TRAIN_EPISODES.toLocaleString('ja-JP')}回`;
  }

  function profilePrefix(profileId){
    return profileId==='safe'?'Safe':profileId==='both'?'Both':'Rush';
  }

  function renderResult(profileId){
    const bundle=bundles[profileId];
    if(!bundle)return;
    const prefix=profilePrefix(profileId);
    const host=$(`reward${prefix}Result`);
    if(!host)return;
    host.hidden=false;
    const summary=bundle.summary;
    const distance=host.querySelector('[data-result="distance"]');
    const finishes=host.querySelector('[data-result="finishes"]');
    const falls=host.querySelector('[data-result="falls"]');
    const timeouts=host.querySelector('[data-result="timeouts"]');
    if(distance)distance.textContent=`${summary.medianDistance.toFixed(2)} m`;
    if(finishes)finishes.textContent=`${summary.finishes} / ${EVALUATION_SEEDS.length}`;
    if(falls)falls.textContent=`${summary.falls} / ${EVALUATION_SEEDS.length}`;
    if(timeouts)timeouts.textContent=`${summary.timeouts} / ${EVALUATION_SEEDS.length}`;
    const brace=host.querySelector('[data-result="brace"]');
    if(brace)brace.textContent=`${Math.round(summary.averageBraceRate*100)}%`;
    if(profileId==='safe')$('rewardSafePredictionRecall').textContent=`最初の予想「${PREDICTION_LABELS[prediction]||'未選択'}」 → 実際は「その場で待つ」。${prediction==='still'?'予想どおり！':'このずれが採点の抜けを見つける手掛かりです。'}`;
  }

  function renderChart(){
    const visibleIds=step<3?[]:step===3?['safe']:step===4?['safe','both']:PROFILE_ORDER;
    const active=visibleIds.filter(id=>bundles[id]);
    const wrap=$('rewardCurveWrap');
    if(!active.length){wrap.hidden=true;return;}
    wrap.hidden=false;
    const svg=$('rewardCurve');
    const left=50,right=660,top=18,bottom=205,maxY=22;
    const x=episode=>left+(episode/TRAIN_EPISODES)*(right-left);
    const y=value=>bottom-(Math.max(0,Math.min(maxY,value))/maxY)*(bottom-top);
    const description=active.map(id=>`${PROFILES[id].label}は、途中確認の固定5条件で5,000回後の距離中央値${bundles[id].curve[bundles[id].curve.length-1].distance.toFixed(2)}メートル`).join('。');
    let markup=`<title id="rewardCurveTitle">学習回数とテスト距離</title><desc id="rewardCurveDesc">${description}</desc>`;
    [0,5,10,15,20].forEach(value=>{
      markup+=`<line class="reward-chart-grid" x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}"/><text class="reward-chart-axis" x="${left-8}" y="${y(value)+4}" text-anchor="end">${value}m</text>`;
    });
    [0,1000,2000,3000,4000,5000].forEach(value=>{
      markup+=`<line class="reward-chart-grid" x1="${x(value)}" x2="${x(value)}" y1="${top}" y2="${bottom}"/><text class="reward-chart-axis" x="${x(value)}" y="${bottom+20}" text-anchor="middle">${value===0?'0':`${value/1000}千`}</text>`;
    });
    active.forEach(id=>{
      const points=bundles[id].curve;
      const path=points.map((point,index)=>`${index?'L':'M'}${x(point.episode).toFixed(1)} ${y(point.distance).toFixed(1)}`).join(' ');
      markup+=`<path class="reward-chart-line reward-chart-line-${id}" d="${path}" stroke="${PROFILES[id].color}"/>`;
      points.forEach(point=>{markup+=`<circle class="reward-chart-point" cx="${x(point.episode).toFixed(1)}" cy="${y(point.distance).toFixed(1)}" r="4" fill="${PROFILES[id].color}"/>`;});
    });
    svg.innerHTML=markup;
    $('rewardCurveLegend').innerHTML=active.map(id=>`<span class="reward-chart-legend-${id}" style="--legend-color:${PROFILES[id].color}">${PROFILES[id].label}</span>`).join('');
  }

  async function trainProfile(profileId){
    if(trainingProfile||bundles[profileId])return bundles[profileId]||null;
    const profile=PROFILES[profileId];
    if(!profile)return null;
    trainingProfile=profileId;
    lab.setAttribute('aria-busy','true');
    renderControls();
    const engine=E.createEngine({seed:TRAIN_SEED,reward:profile.reward});
    const curve=[{episode:0,distance:evaluateEngine(engine,CURVE_SEEDS,false).summary.medianDistance}];
    let episodeSeed=TRAIN_SEED;
    renderProgress(profileId,0);
    announce(`${profile.label}の採点で、5,000回の学習を始めました。`);
    for(let episode=1;episode<=TRAIN_EPISODES;episode++){
      episodeSeed=nextEpisodeSeed(episodeSeed);
      E.runEpisode(engine,{learn:true,seed:episodeSeed,trace:false});
      if(episode%CHECKPOINT===0){
        curve.push({episode,distance:evaluateEngine(engine,CURVE_SEEDS,false).summary.medianDistance});
      }
      if(episode%50===0){
        renderProgress(profileId,episode);
        await new Promise(resolve=>window.setTimeout(resolve,0));
      }
    }
    const evaluated=evaluateEngine(engine,EVALUATION_SEEDS,true);
    bundles[profileId]={profile,engine,curve,...evaluated};
    trainingProfile=null;
    lab.removeAttribute('aria-busy');
    renderProgress(profileId,TRAIN_EPISODES);
    renderResult(profileId);
    renderChart();
    renderScene();
    renderControls();
    announce(`${profile.label}の5,000回学習が完了。20条件の距離中央値は${evaluated.summary.medianDistance.toFixed(2)}メートルです。`);
    return bundles[profileId];
  }

  function laneMarkup(profileId){
    const bundle=bundles[profileId];
    const profile=PROFILES[profileId];
    const rep=bundle.representative;
    const resultLabel=rep.reason==='finish'?'完走':rep.reason==='fall'?'転倒':'時間切れ';
    return `<article class="reward-lane" data-lane="${profileId}" style="--lane-color:${profile.color}">
      <div class="reward-lane-summary"><strong>${profile.label}</strong><span>20回中央値 ${bundle.summary.medianDistance.toFixed(2)} m</span><small>${profile.description}<br>完走 ${bundle.summary.finishes}/20・転倒 ${bundle.summary.falls}/20・平均累積操作コスト ${bundle.summary.averageEffort.toFixed(0)}</small></div>
      <div class="reward-lane-stage"><svg viewBox="0 0 480 120" role="img" aria-label="${profile.label}の同じ固定条件での一例"><line x1="18" y1="96" x2="462" y2="96" stroke="#526b61" stroke-width="3"/><line x1="22" y1="88" x2="22" y2="101" stroke="#6d827b" stroke-width="2"/><text x="22" y="114" text-anchor="middle" font-size="9" fill="#526b61">0m</text><line x1="454" y1="88" x2="454" y2="101" stroke="#6d827b" stroke-width="2"/><text x="454" y="114" text-anchor="middle" font-size="9" fill="#526b61">20m</text><g class="reward-lane-figure" id="rewardLaneFigure-${profileId}" transform="translate(24 96)"><circle cx="0" cy="-51" r="14"/><circle class="lane-eye" cx="5" cy="-54" r="1.5"/><line x1="0" y1="-37" x2="0" y2="-20"/><polyline data-lane-left points="0,-20 -8,-10 -12,0"/><polyline data-lane-right points="0,-20 8,-10 12,0"/><polyline data-lane-left-arm points="0,-33 -10,-25 -14,-17"/><polyline data-lane-right-arm points="0,-33 10,-25 14,-17"/></g></svg><span class="reward-lane-status" id="rewardLaneStatus-${profileId}">${resultLabel}</span></div>
    </article>`;
  }

  function traceFrameAt(trace,time){
    if(!trace||!trace.length)return null;
    let result=trace[0];
    for(const frame of trace){
      if(frame.time>time)break;
      result=frame;
    }
    return result;
  }

  function updateLane(profileId,frame,finished){
    if(!frame)return;
    const figure=$(`rewardLaneFigure-${profileId}`);
    if(!figure)return;
    const x=24+Math.max(0,Math.min(20,frame.x))/20*430;
    let angle=Math.max(-24,Math.min(24,frame.lean*32));
    const rep=bundles[profileId].representative;
    if(finished&&rep.reason==='fall')angle=frame.lean<0?-68:68;
    figure.setAttribute('transform',`translate(${x.toFixed(1)} 96) rotate(${angle.toFixed(1)})`);
    const action=E.ACTIONS[frame.lastAction]||E.ACTIONS[7];
    const reach=action.leg===0?8:action.stride>1?17:13;
    figure.querySelector('[data-lane-left]').setAttribute('points',action.leg<0?`0,-20 ${reach},-9 ${reach+7},0`:'0,-20 -8,-10 -12,0');
    figure.querySelector('[data-lane-right]').setAttribute('points',action.leg>0?`0,-20 ${reach},-9 ${reach+7},0`:'0,-20 8,-10 12,0');
    const arm=Math.round((frame.arm||0)*10);
    figure.querySelector('[data-lane-left-arm]').setAttribute('points',`0,-33 ${-10-arm},-25 ${-14-arm},-17`);
    figure.querySelector('[data-lane-right-arm]').setAttribute('points',`0,-33 ${10-arm},-25 ${14-arm},-17`);
    const status=$(`rewardLaneStatus-${profileId}`);
    if(!finished){status.textContent=`${frame.x.toFixed(1)} m`;}else{
      status.textContent=rep.reason==='finish'?'完走':rep.reason==='fall'?'転倒':'時間切れ';
    }
  }

  function startReplay(){
    if(!compared)return;
    replayToken++;
    const token=replayToken;
    const traces=Object.fromEntries(PROFILE_ORDER.map(id=>[id,bundles[id].representative.trace]));
    if(reduceMotion||!window.requestAnimationFrame){
      PROFILE_ORDER.forEach(id=>updateLane(id,traces[id][traces[id].length-1],true));
      return;
    }
    const start=performance.now();
    const duration=4600;
    function tick(now){
      if(token!==replayToken)return;
      const ratio=Math.min(1,(now-start)/duration);
      const time=Math.round(ratio*280);
      PROFILE_ORDER.forEach(id=>{
        const trace=traces[id];
        const rep=bundles[id].representative;
        const finished=time>=rep.steps;
        updateLane(id,traceFrameAt(trace,Math.min(time,rep.steps)),finished);
      });
      if(ratio<1)window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  function renderComparison(){
    const ready=PROFILE_ORDER.every(id=>bundles[id]);
    const host=$('rewardComparison');
    host.hidden=!ready;
    if(!ready)return;
    const predictionLabel=PREDICTION_LABELS[prediction]||'未選択';
    $('rewardPredictionRecall').textContent=`最初の予想「${predictionLabel}」 → この学習例の「前進を採点しない」は、その場で待ち続けた。${prediction==='still'?'予想どおり！':'このずれが、採点の抜けを見つける手掛かり。'}`;
    $('rewardLanes').innerHTML=PROFILE_ORDER.map(laneMarkup).join('');
    document.querySelectorAll('#rewardMetricChoices [data-metric]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.metric===selectedMetric?'true':'false'));
    $('rewardFinalInsight').hidden=!selectedMetric;
    if(selectedMetric)$('rewardMetricFinding').textContent=metricFinding(selectedMetric);
    if(compared&&step===5)startReplay();
  }

  function metricFinding(metric){
    const safe=bundles.safe.summary;
    const both=bundles.both.summary;
    const rush=bundles.rush.summary;
    if(metric==='distance')return `距離中央値は ${safe.medianDistance.toFixed(2)} m → ${both.medianDistance.toFixed(2)} m → ${rush.medianDistance.toFixed(2)} m。前進だけを強くほめても、一番遠くまで進めませんでした。`;
    if(metric==='fall')return `転倒は ${safe.falls}/20回 → ${both.falls}/20回 → ${rush.falls}/20回。前進だけのAIは、20回すべてで途中転倒しました。`;
    return `平均累積操作コストは ${safe.averageEffort.toFixed(0)} → ${both.averageEffort.toFixed(0)} → ${rush.averageEffort.toFixed(0)}。前進だけのAIは、安全もほめたAIの約${(rush.averageEffort/both.averageEffort).toFixed(1)}倍でした。`;
  }

  function canAdvance(){
    if(trainingProfile)return false;
    if(step===0)return Boolean(prediction);
    if(step===1)return zeroFound;
    if(step===2)return scoredActions.size===2;
    if(step===3)return Boolean(bundles.safe);
    if(step===4)return Boolean(bundles.both);
    return false;
  }

  function renderControls(){
    $('rewardPrev').disabled=step===0||Boolean(trainingProfile);
    const atEnd=step===frames.length-1;
    $('rewardNext').disabled=atEnd||!canAdvance();
    $('rewardNext').textContent=atEnd
      ?selectedMetric?'6コマ完了':'上の指標を一つ選ぶと完了'
      :trainingProfile?'学習中…'
        :step===0&&!prediction?'予想を選ぶと次へ'
          :step===1&&!zeroFound?'0点の抜けを見つけると次へ'
            :step===2&&scoredActions.size<2?'二つを採点すると次へ'
              :step===3&&!bundles.safe?'5,000回学習すると次へ'
                :step===4&&!bundles.both?'採点を直して学習すると次へ':'次の気づき →';
    $('rewardReset').disabled=Boolean(trainingProfile)||(step===0&&!prediction&&!zeroFound&&!scoredActions.size&&!Object.keys(bundles).length);
    document.querySelectorAll('#rewardStepDots [data-reward-step]').forEach(button=>{
      const index=Number(button.dataset.rewardStep);
      button.setAttribute('aria-pressed',index===step?'true':'false');
      button.disabled=Boolean(trainingProfile)||index>maxUnlocked;
    });
    document.querySelectorAll('[data-prediction]').forEach(button=>{button.disabled=maxUnlocked>0||Boolean(trainingProfile);});
    $('rewardTrainSafe').disabled=Boolean(trainingProfile)||Boolean(bundles.safe);
    $('rewardTrainSafe').textContent=bundles.safe?'5,000回学習しました':'この採点で5,000回学習する';
    $('rewardAddForward').disabled=Boolean(trainingProfile)||forwardAdded;
    $('rewardAddForward').textContent=forwardAdded?'前進を+5 / mへ変更済み':'+5 / mへ変える';
    $('rewardTrainBoth').disabled=Boolean(trainingProfile)||!forwardAdded||Boolean(bundles.both);
    $('rewardTrainBoth').textContent=bundles.both?'新しい採点で学習しました':'Qを0へ戻して5,000回学習する';
    $('rewardCompareButton').disabled=Boolean(trainingProfile)||Boolean(bundles.rush);
    $('rewardCompareButton').textContent=bundles.rush?'3条件を同じ条件で比較しました':'3つ目も5,000回学習して比べる';
  }

  function renderFrame(){
    const frame=frames[step];
    lab.dataset.rewardStep=String(step);
    $('rewardStepCount').textContent=`${step+1} / ${frames.length}`;
    $('rewardFrameNumber').textContent=`FRAME ${step+1}`;
    $('rewardQuestion').textContent=frame.question;
    $('rewardFrameTitle').textContent=frame.title;
    $('rewardFrameText').textContent=frame.text;
    $('rewardLookFor').textContent=frame.look;
    $('rewardChanged').textContent=frame.changed;
    $('rewardTakeaway').textContent=frame.takeaway;
    $('rewardCaution').textContent=frame.caution;
    if(step===1&&!zeroFound){
      $('rewardFrameText').textContent='人の願いと、左の4項目を一つずつ対応させます。数字にし忘れた目的がないか、自分で探してください。';
      $('rewardLookFor').textContent='「前へ歩く」に対応する点は、採点表のどこか';
      $('rewardTakeaway').textContent='答えを読む前に、人の言葉とAIへ渡す数字を照らし合わせる。';
      $('rewardCaution').textContent='0点の欄も、AIには大切な情報です。まず左の採点表で見つけます。';
    }
    if(step===2&&scoredActions.size<2){
      $('rewardLookFor').textContent='二つを同じ開始場面から採点し、4項目の内訳を比べる';
      $('rewardTakeaway').textContent='先に両方を採点してから、どちらをAIが選びやすいか考える。';
      $('rewardCaution').textContent='一つの合計点だけで決めず、前進・直立・操作コスト・転倒へ分けて見ます。';
    }
    if(step===3&&!bundles.safe){
      $('rewardLookFor').textContent='回数とともに、冒険なしテストの距離がどう変わるか';
      $('rewardTakeaway').textContent='「たくさん学べば願いを察するか」を、結果を見る前に予想する。';
      $('rewardCaution').textContent='5,000回は採点表を変えません。増えるのは、その採点での経験です。';
    }
    if(step===4&&!bundles.both){
      $('rewardLookFor').textContent='前進だけを0から5へ変え、前の結果と公平に比べる';
      $('rewardTakeaway').textContent='ほかを固定し、一つだけ変えると原因を考えやすい。';
    }
    if(step===5&&!compared){
      $('rewardLookFor').textContent='距離・転倒や完走・操作コストのうち、どこに差が出るか';
      $('rewardTakeaway').textContent='「前進だけ」ならどう育つか、結果を決めつけずに比べる。';
    }
    panels.forEach(panel=>{panel.hidden=Number(panel.dataset.rewardPanel)!==step;});
    $('rewardZeroDiscovery').hidden=!zeroFound;
    renderScoring();
    renderResult('safe');
    renderResult('both');
    renderChart();
    renderComparison();
    renderScene();
    renderControls();
  }

  function announce(message){
    $('rewardLive').textContent=message;
  }

  function updateSceneViewport(){
    const compact=window.matchMedia&&window.matchMedia('(max-width: 660px)').matches;
    $('rewardScene').setAttribute('viewBox',compact?'70 60 380 220':'0 0 760 330');
  }

  function setStep(next,focusScene){
    let bounded=Math.max(0,Math.min(frames.length-1,Number(next)||0));
    if(trainingProfile)return;
    if(bounded>maxUnlocked){
      if(bounded===step+1&&canAdvance())maxUnlocked=bounded;
      else bounded=maxUnlocked;
    }
    if(bounded===step&&lab.dataset.rewardStep===String(step))return;
    if(bounded<step)replayToken++;
    step=bounded;
    renderFrame();
    announce(`${step+1}コマ目。${frames[step].title}。${frames[step].takeaway}`);
    if(focusScene&&window.matchMedia&&window.matchMedia('(max-width: 900px)').matches&&sceneCard&&typeof sceneCard.scrollIntoView==='function'){
      sceneCard.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    }
  }

  function resetDemo(){
    if(trainingProfile)return;
    replayToken++;
    step=0;
    maxUnlocked=0;
    prediction=null;
    zeroFound=false;
    scoredActions=new Set();
    lastScoredAction=null;
    forwardAdded=false;
    bundles={};
    compared=false;
    selectedMetric=null;
    document.querySelectorAll('[data-prediction]').forEach(button=>button.setAttribute('aria-pressed','false'));
    document.querySelectorAll('[data-score-action]').forEach(button=>button.setAttribute('aria-pressed','false'));
    document.querySelectorAll('#rewardMetricChoices [data-metric]').forEach(button=>button.setAttribute('aria-pressed','false'));
    $('rewardPredictionFeedback').textContent='まず一つ予想してください。まだ結果は見せません。';
    ['rewardSafeProgress','rewardBothProgress','rewardRushProgress','rewardSafeResult','rewardBothResult','rewardCurveWrap','rewardComparison'].forEach(id=>{$(id).hidden=true;});
    renderFrame();
    announce('最初からやり直しました。1コマ目、安全を強く採点するとどうなるか予想します。');
  }

  document.querySelectorAll('[data-prediction]').forEach(button=>button.addEventListener('click',()=>{
    prediction=button.dataset.prediction;
    document.querySelectorAll('[data-prediction]').forEach(candidate=>candidate.setAttribute('aria-pressed',candidate===button?'true':'false'));
    const label=button.querySelector('b').textContent;
    $('rewardPredictionFeedback').innerHTML=`あなたの予想：<b>${label}</b>。この予想を覚えておき、最後の実際の動きと比べます。`;
    renderControls();
    announce(`${label}と予想しました。まだ結果は表示していません。`);
  }));

  $('rewardZeroButton').addEventListener('click',()=>{
    zeroFound=true;
    renderFrame();
    announce('前進が0点であることを見つけました。「前へ歩く」は採点に入っていません。');
  });

  document.querySelectorAll('[data-score-action]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.scoreAction;
    scoredActions.add(id);
    lastScoredAction=id;
    renderFrame();
    announce(`${id==='step'?'小さな一歩':'踏ん張る（1手待つ）'}の報酬は${signed(trials[id].result.reward)}です。${scoredActions.size===2?'この採点では踏ん張って待つ方が高得点で、Qメモもその方向へ変わります。':''}`);
  }));

  $('rewardTrainSafe').addEventListener('click',async()=>{
    await trainProfile('safe');
    renderFrame();
  });

  $('rewardAddForward').addEventListener('click',()=>{
    forwardAdded=true;
    renderBoard();
    renderControls();
    announce('前進の点だけを0から5へ変えました。Qテーブルは0から学び直します。');
  });

  $('rewardTrainBoth').addEventListener('click',async()=>{
    if(!forwardAdded)return;
    await trainProfile('both');
    renderFrame();
  });

  $('rewardCompareButton').addEventListener('click',async()=>{
    await trainProfile('rush');
    compared=true;
    renderFrame();
    announce('3つの採点を同じ条件で比較しました。距離、結果、使った力の合計のどれかに注目してください。');
  });

  $('rewardReplayButton').addEventListener('click',()=>{
    startReplay();
    announce('学習更新に使っていない同じ固定条件で、3体の一例をもう一度再生します。');
  });

  $('rewardMetricChoices').addEventListener('click',event=>{
    const button=event.target.closest('[data-metric]');
    if(!button)return;
    selectedMetric=button.dataset.metric;
    document.querySelectorAll('#rewardMetricChoices [data-metric]').forEach(candidate=>candidate.setAttribute('aria-pressed',candidate===button?'true':'false'));
    $('rewardFinalInsight').hidden=false;
    const finding=metricFinding(selectedMetric);
    $('rewardMetricFinding').textContent=finding;
    renderControls();
    announce(`${finding} 最後の気づき。AIは人の願いではなく、先の点ほど少し小さく数えた合計を増やす方法を覚えました。`);
  });

  $('rewardPrev').addEventListener('click',()=>setStep(step-1,true));
  $('rewardNext').addEventListener('click',()=>{if(step<frames.length-1)setStep(step+1,true);});
  $('rewardReset').addEventListener('click',resetDemo);

  lab.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||trainingProfile)return;
    if(event.target.closest&&event.target.closest('a,button,input,select,textarea,summary'))return;
    if(event.key==='ArrowRight'&&step<frames.length-1&&canAdvance()){event.preventDefault();setStep(step+1,true);}
    if(event.key==='ArrowLeft'&&step>0){event.preventDefault();setStep(step-1,true);}
  });

  document.querySelectorAll('[data-close-reward]').forEach(link=>link.addEventListener('click',event=>{
    if(!window.opener||window.opener.closed)return;
    event.preventDefault();
    try{
      const target=new URL(link.href,window.location.href);
      if(target.hash)window.opener.location.hash=target.hash;
      window.opener.focus();
      window.setTimeout(()=>window.close(),0);
    }catch(error){
      window.location.href=link.href;
    }
  }));

  createDots();
  updateSceneViewport();
  window.addEventListener('resize',updateSceneViewport);
  renderFrame();

  const debug={
    frames,profiles:PROFILES,trials,TRAIN_EPISODES,TRAIN_SEED,TRACE_SEED,EVALUATION_SEEDS,CURVE_SEEDS,
    trainProfile,setStep,reset:resetDemo,evaluateEngine
  };
  Object.defineProperties(debug,{
    step:{get:()=>step},
    maxUnlocked:{get:()=>maxUnlocked},
    prediction:{get:()=>prediction},
    zeroFound:{get:()=>zeroFound},
    scoredActions:{get:()=>Array.from(scoredActions)},
    forwardAdded:{get:()=>forwardAdded},
    bundles:{get:()=>bundles},
    trainingProfile:{get:()=>trainingProfile},
    compared:{get:()=>compared},
    selectedMetric:{get:()=>selectedMetric}
  });
  window.__walkerRewardDebug=debug;
})();
