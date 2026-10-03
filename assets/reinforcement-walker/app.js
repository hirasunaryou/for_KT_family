(function(){
  'use strict';

  const E=window.WalkerEngine;
  if(!E)throw new Error('WalkerEngine could not be loaded.');

  const $=id=>document.getElementById(id);
  const canvas=$('world');
  const chart=$('rewardChart');
  const ctx=canvas.getContext('2d');
  const cctx=chart.getContext('2d');
  const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const replayMilestones=new Set([1,10,50,200,500,1000,2000,5000,10000]);
  const metricMeta={
    reward:{label:'報酬',value:r=>r.reward,color:'#d66a42'},
    distance:{label:'距離',value:r=>r.distance,color:'#176b87'},
    alternation:{label:'正しい足の割合',value:r=>r.correctRatio*100,color:'#4f7a42'}
  };
  const rewardPresets={
    balanced:{forward:11,balance:.025,energy:.045,fall:18},
    speed:{forward:16,balance:.006,energy:.025,fall:10},
    survival:{forward:7,balance:.055,energy:.035,fall:30},
    efficient:{forward:9,balance:.018,energy:.12,fall:16}
  };

  let engine=E.createEngine();
  let bot=E.createBot(engine,false);
  let runtime={seed:0x713c9a2d};
  let mode='manual';
  let armIndex=1;
  let history=[];
  let replays=[];
  let humanBest=0;
  let aiBest=0;
  let metric='distance';
  let training=false;
  let cancelTraining=false;
  let testTimer=0;
  let playback=null;
  let lastUiDraw=0;
  let lastEpisode=null;
  let focusedParameter='alpha';
  let dirty=true;

  const fmt=n=>Number(n||0).toLocaleString('ja-JP');
  const fixed=(n,d=1)=>Number.isFinite(n)?n.toFixed(d):'0.0';
  const currentAction=(legIndex,selectedArm=armIndex)=>legIndex*E.ARM_COMMANDS.length+selectedArm;

  function footName(value){return value<0?'左足':'右足';}

  function leanName(value){
    const amount=Math.abs(value);
    if(amount<.04)return 'ほぼまっすぐ';
    return `${value<0?'左':'右'}へ${amount>.31?'大きく':amount>.12?'少し':'わずかに'}`;
  }

  function spinName(value){
    if(Math.abs(value)<.035)return '回転は静か';
    return `${value<0?'左':'右'}へ${Math.abs(value)>.18?'速く':'ゆっくり'}回転`;
  }

  function leanMeasure(value){return Math.abs(value)<.005?'中央 0.00':`${value<0?'左':'右'} ${fixed(Math.abs(value),2)}`;}

  function renderMotionCause(motion,subject=bot){
    const host=$('motionCause');
    if(!host)return;
    const detail=motion||{kind:'ready',speedBefore:0,pushAdded:0,speedAfter:0,dx:0,reason:'',action:7};
    const phase=detail.kind||'ready';
    host.dataset.phase=phase;
    if($('motionPushValue'))$('motionPushValue').textContent=`+${fixed(detail.pushAdded||0,3)}`;
    if($('motionSpeedValue'))$('motionSpeedValue').textContent=`${fixed(detail.speedBefore||0,3)} → ${fixed(detail.speedAfter||0,3)}`;
    if($('motionDistanceValue'))$('motionDistanceValue').textContent=`+${fixed(detail.dx||0,2)} m`;

    let title='なぜ一歩で右へ進む？';
    let text='このゲームの「一歩」は、足を出して接地するだけでなく、地面を後ろへ押すところまでを1操作にまとめています。地面が足を前へ押し、その力が体へ伝わって前向き速度が増えます。';
    if(phase==='push'){
      const action=E.ACTIONS[detail.action]||E.ACTIONS[7];
      title='地面を後ろへ押したので、体が前へ進んだ';
      text=`「${action.label}」で、足が地面を後ろ（画面左）へ押した扱いです。地面が足を前へ押し、その力が体へ伝わって前向き速度を ${fixed(detail.pushAdded,3)} 足しました。その後、同じ操作内の抵抗と坂の影響を受けます。`;
    }else if(phase==='coast'){
      title=detail.speedBefore>.0005?'踏ん張り中は、新しい推進を足さず惰性で進む':'速度がないと、踏ん張るだけでは進まない';
      text=detail.speedBefore>.0005
        ?`「踏ん張る」は新しい前向き速度を足しません。前の一歩の速度は ${fixed(detail.speedBefore,3)} → ${fixed(detail.speedAfter,3)} と少し減りますが、残った速度で ${fixed(detail.dx,2)} m進み、その間に次の足の準備を1回進めます。`
        :'いまは前の一歩の速度がありません。「踏ん張る」は次の足の準備を進めます。回転を弱める成分もありますが、傾き・坂・腕の効果しだいでは操作後の回転が強まることもあり、これだけを続けても前へ進みません。';
    }else if(phase==='stumble'){
      const reasons={'wrong-foot':'足の順番が違った','recovering':'次の足の準備が終わっていなかった','long-rest':'止まったまま大股を選んだ','long-lean':'傾いたまま大股を選んだ','long-slope':'急な坂で大股を選んだ',slip:'でこぼこで滑った'};
      title='条件がそろわず、地面をうまく押せなかった';
      text=`${reasons[detail.reason]||'一歩が乱れた'}ため、今回増えた前向き速度は0です。${detail.dx>.005?`残っていた速度で ${fixed(detail.dx,2)} mだけ進みました。`:'前向き速度もほとんど残りませんでした。'}`;
    }
    if($('motionCauseTitle'))$('motionCauseTitle').textContent=title;
    if($('motionCauseText'))$('motionCauseText').textContent=text;
    host.querySelectorAll('[data-motion-stage]').forEach(stage=>{
      const name=stage.dataset.motionStage;
      stage.classList.toggle('is-active',phase==='push'?(name==='push'||name==='reaction'):phase==='coast'?name==='coast':false);
    });
    const helpLink=$('motionHelpLink');
    if(helpLink){
      const helpTopic=phase==='coast'?'brace':phase==='stumble'?'mistakes':'push';
      helpLink.href=`help.html#${helpTopic}`;
      helpLink.textContent=phase==='coast'?'踏ん張りの場面を、大きな図で一コマずつ見る →':phase==='stumble'?'この失敗の理由を、HELPで分けて見る →':'この場面を、大きな図で一コマずつ見る →';
    }
  }

  function resetActionInsight(){
    const host=$('actionInsight');
    if(host){host.dataset.outcome='ready';host.dataset.reason='none';}
    if($('actionChoice'))$('actionChoice').textContent='まだ一歩を選んでいません';
    if($('actionResult'))$('actionResult').textContent='左足の短い一歩から試してみよう';
    if($('actionWhy'))$('actionWhy').textContent='一歩で地面を後ろへ押して前向き速度を作り、その後は「踏ん張る」で次の足を出す準備をします。';
    if($('actionNext'))$('actionNext').textContent='観察 → 予想 → 一歩 → 結果、の順で比べよう。';
  }

  function updateMovementTheory(subject=bot,actionOverride=null){
    if(!subject)return;
    if($('bodyLean'))$('bodyLean').textContent=leanName(subject.lean);
    if($('bodySpin'))$('bodySpin').textContent=spinName(subject.leanV);
    if($('nextFootStatus'))$('nextFootStatus').textContent=footName(subject.nextFoot);
    if($('recoveryStatus'))$('recoveryStatus').textContent=subject.recovery>0?`あと ${subject.recovery} 回`:'OK';
    if($('recoveryHint'))$('recoveryHint').textContent=subject.recovery>0?'「踏ん張る・1拍待つ」で準備を1回ずつ進める':'いま次の足を出せます';

    const overrideAction=actionOverride===null?null:E.ACTIONS[actionOverride];
    const selected=E.ARM_COMMANDS[overrideAction?overrideAction.armIndex:armIndex]||E.ARM_COMMANDS[1];
    const armHost=$('armHint');
    let effect='neutral';
    let message='腕は前進力ではなく、体の回り方を変えます。';
    if(selected.arm===0){
      message='次の操作で腕を中央へ戻します。戻す瞬間にも反対向きの回転が出ます。';
    }else if(Math.abs(subject.lean)>.12&&Math.sign(selected.arm)===-Math.sign(subject.lean)){
      effect='recover';message='傾きと反対向き。体を中央へ戻す候補です。';
    }else if(Math.abs(subject.lean)>.12&&Math.sign(selected.arm)===Math.sign(subject.lean)){
      effect='worsen';message='傾きと同じ向き。さらに傾くかもしれません。';
    }else{
      message=`次の操作で、体へ${selected.arm<0?'左':'右'}向きの回転を足します。`;
    }
    if(armHost)armHost.dataset.balanceEffect=effect;
    if($('armHintChoice'))$('armHintChoice').textContent=selected.label.replace('腕','腕を').replace('←','左へ ←').replace('→','右へ →').replace('・','まんなか');
    if($('armHintText'))$('armHintText').textContent=message;

    const suggested=subject.recovery>0?'brace':subject.nextFoot<0?'left':'right';
    const slope=E.terrainSlope(subject.x)*(1+engine.physics.roughness*2.2);
    const longSafe=subject.recovery<=0&&subject.vx>=.022&&Math.abs(subject.lean)<=.29&&Math.abs(slope)<=.075;
    document.querySelectorAll('[data-leg]').forEach(button=>{
      const id=button.dataset.leg;
      const recommended=suggested==='brace'?id==='brace':id===`${suggested}-short`;
      const challenge=suggested!=='brace'&&longSafe&&id===`${suggested}-long`;
      button.classList.toggle('is-next',recommended);
      button.classList.toggle('is-challenge',challenge);
      button.dataset.guideLabel=recommended?(suggested==='brace'?'次':'おすすめ'):challenge?'挑戦':'';
    });
    renderMotionCause(subject.lastMotion,subject);
  }

  function renderManualOutcome(result,before,after){
    const host=$('actionInsight');
    if(!host||!result||!result.action)return;
    const action=result.action;
    let outcome='push';
    let reason='success';
    let resultText='';
    let why='';
    if(action.leg===0){
      outcome='brace';reason='brace';
      resultText=`一拍待った · 惰性で +${fixed(result.dx,2)} m · 準備 ${before.recovery} → ${after.recovery}`;
      why=before.vx>.0005?'新しい推進は足さず、前の一歩の速度を少し失いながら、次の足の準備を1回進めました。':'前向き速度がないため前進せず、次の足の準備を1回進めました。踏ん張りには回転を弱める成分もありますが、ほかの力も同時に働きます。';
    }else if(result.stumbled){
      outcome='stumble';reason=result.stumbleReason||'slip';
      const reasons={
        'wrong-foot':`いま出す番は${footName(before.nextFoot)}でした。足の順番が違います。`,
        recovering:`前の一歩からまだ準備中でした。「踏ん張る」があと${before.recovery}回必要です。`,
        'long-rest':'まだ止まっている状態で大股を選んだため、姿勢を崩しました。',
        'long-lean':'体が大きく傾いた状態で大股を選んだため、姿勢を崩しました。',
        'long-slope':'急な坂で大股を選んだため、姿勢を崩しました。',
        slip:'足の順番と準備は合っていましたが、でこぼこで滑りました。'
      };
      resultText=`つまずいた · 惰性を含め +${fixed(result.dx,2)} m · 傾き ${leanMeasure(before.lean)} → ${leanMeasure(after.lean)}`;
      why=reasons[reason]||reasons.slip;
    }else{
      resultText=`一歩成功 · +${fixed(result.dx,2)} m · 傾き ${leanMeasure(before.lean)} → ${leanMeasure(after.lean)}`;
      why=action.stride>1?'大股で地面を強く後ろへ押した扱いになり、推進と足側への回転が大きくなりました。':'順番と準備が合い、地面を後ろへ押した扱いになったので前向き速度が増えました。';
    }
    const armLabel=E.ARM_COMMANDS[action.armIndex].label;
    host.dataset.outcome=outcome;
    host.dataset.reason=reason;
    if($('actionChoice'))$('actionChoice').textContent=`${action.label.replace('＋',' ＋ ')}`;
    if($('actionResult'))$('actionResult').textContent=`${resultText} ／ この一歩の報酬 ${signed(result.reward)}`;
    if($('actionWhy'))$('actionWhy').textContent=why;
    const nextText=after.alive
      ?`${after.recovery>0?`次は「踏ん張る」あと${after.recovery}回`:`次は${footName(after.nextFoot)}`}。${armLabel}が傾きにどう効いたかも比べよう。`
      :after.finished?'20 m完走。最後の一歩と報酬を見比べよう。'
      :after.doneReason==='timeout'?'時間切れまで立てました。距離と使った力を見比べよう。'
      :'転倒する直前の「傾き」と腕の向きを見直して、もう一度試そう。';
    if($('actionNext'))$('actionNext').textContent=nextText;
    announce(`${action.label}。${resultText}。${why} ${nextText}`);
  }

  function announce(message){
    const el=$('liveStatus');
    if(el)el.textContent=message;
  }

  function stopMotion(){
    if(testTimer){clearInterval(testTimer);testTimer=0;}
    playback=null;
    if($('stopReplay'))$('stopReplay').hidden=true;
    setReplayActive(null);
  }

  function setReplayActive(episode){
    document.querySelectorAll('[data-replay]').forEach(button=>button.setAttribute('aria-pressed',episode!==null&&Number(button.dataset.replay)===Number(episode)?'true':'false'));
  }

  function revealStage(){
    const stage=$('gameStage');
    if(window.innerWidth<=980&&stage&&stage.scrollIntoView){
      stage.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    }
  }

  function setMode(next){
    mode=next;
    const labels={manual:'手動チャレンジ',training:'高速で学習中',test:'AIテスト',replay:'学習リプレイ',ready:'学習を観察'};
    if($('modeBadge'))$('modeBadge').textContent=labels[next]||next;
    if($('manualControls'))$('manualControls').hidden=next!=='manual';
    document.querySelectorAll('[data-leg],[data-arm]').forEach(button=>{button.disabled=next!=='manual';});
  }

  function lockExperimentControls(locked){
    const selectors='#manualStart,#testAi,#resetLearning,[data-train],[data-reward-preset],[data-parameter-focus],#rewardForward,#rewardBalance,#rewardEnergy,#rewardFall,#alpha,#gamma,#epsilon,#roughness';
    document.querySelectorAll(selectors).forEach(control=>{control.disabled=locked;});
    if($('stopTraining'))$('stopTraining').disabled=!locked;
  }

  function resetBot(jitter=false){
    runtime={seed:(0x713c9a2d+engine.episodes*97)>>>0};
    bot=E.createBot(runtime,jitter);
    armIndex=1;
    document.querySelectorAll('[data-arm]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.arm==='arms-center'?'true':'false'));
    updateHud();
    updateMovementTheory(bot);
    resetActionInsight();
    drawWorld(bot);
    updateMath(bot);
    dirty=false;
  }

  function updateHud(displayBot=bot){
    if(!displayBot)return;
    if($('distance'))$('distance').textContent=`${fixed(displayBot.x)} m`;
    if($('episodeReward'))$('episodeReward').textContent=fixed(displayBot.reward);
    if($('episode'))$('episode').textContent=`${fmt(engine.episodes)} 回`;
    if($('humanBest'))$('humanBest').textContent=`${fixed(humanBest)} m`;
    if($('aiBest'))$('aiBest').textContent=`${fixed(aiBest)} m`;
    if($('testAi'))$('testAi').textContent=`${fmt(engine.episodes)}回学習したAIを見る`;
  }

  function outcomeText(result){
    if(result.finished)return `完走。${fixed(result.distance)} m進みました。`;
    if(result.reason==='fall')return `${fixed(result.distance)} mで転倒。`;
    return `${fixed(result.distance)} m。時間切れまで粘りました。`;
  }

  function startManual(){
    if(training)return;
    stopMotion();
    resetBot(false);
    setMode('manual');
    if($('coach'))$('coach').textContent='「傾き・次の足・準備」を観察してから一歩。まず1 mを目指そう。';
    announce('手動チャレンジを開始しました。足と腕を操作できます。');
    const focusTarget=document.querySelector('.stage-column');
    if(focusTarget&&focusTarget.focus)focusTarget.focus({preventScroll:true});
    revealStage();
  }

  function manualLeg(legId){
    if(mode!=='manual'||training)return;
    if(!bot.alive){startManual();return;}
    const legIndex=E.LEG_COMMANDS.findIndex(item=>item.id===legId);
    if(legIndex<0)return;
    const action=currentAction(legIndex);
    const before=E.snapshot(bot);
    const result=E.step(engine,bot,action,runtime);
    dirty=true;
    humanBest=Math.max(humanBest,bot.x);
    flash(`[data-leg="${legId}"]`);
    updateHud();
    updateMovementTheory(bot);
    renderManualOutcome(result,before,bot);
    updateMath(bot);
    if(result.done){
      const summary=bot.finished?`やった！ ${fixed(bot.x)} m完走。`
        :bot.doneReason==='timeout'?`${fixed(bot.x)} m。時間切れまで立ち続けました。`
        :`${fixed(bot.x)} mでころんだ。腕の向きと足の順番を変えてみよう。`;
      if($('coach'))$('coach').textContent=summary;
      announce(summary);
    }
  }

  function manualArm(armId){
    if(mode!=='manual'||training)return;
    if(!bot.alive){startManual();return;}
    const next=E.ARM_COMMANDS.findIndex(item=>item.id===armId);
    if(next<0)return;
    armIndex=next;
    document.querySelectorAll('[data-arm]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.arm===armId?'true':'false'));
    flash(`[data-arm="${armId}"]`);
    const label=E.ARM_COMMANDS[next].label;
    updateMovementTheory(bot);
    const host=$('actionInsight');
    if(host){host.dataset.outcome='preview';host.dataset.reason='arm-selected';}
    if($('actionChoice'))$('actionChoice').textContent=`${label}を選択`;
    if($('actionResult'))$('actionResult').textContent='まだ体は動いていません';
    if($('actionWhy'))$('actionWhy').textContent=$('armHintText')?$('armHintText').textContent:'次の操作で足と腕を同時に動かします。';
    if($('actionNext'))$('actionNext').textContent=`次の操作（足を出す／一拍待つ）に、${label}を組み合わせます。`;
    if($('coach'))$('coach').textContent=`「${label}」を選択。腕だけでは時間は進まず、次の操作（足を出す／一拍待つ）と同時に動きます。`;
    announce(`${label}を選びました。次の足運びと組み合わせます。`);
  }

  function flash(selector){
    const el=document.querySelector(selector);
    if(!el)return;
    el.classList.add('pressed');
    window.setTimeout(()=>el.classList.remove('pressed'),130);
  }

  function historyRecord(result){
    return {
      episode:result.episode,
      reward:result.reward,
      distance:result.distance,
      correctRatio:result.correctRatio,
      counterArmRatio:result.counterArmRatio,
      legActions:result.legActions,
      armChoices:result.armChoices,
      stumbles:result.stumbles,
      effort:result.effort,
      finished:result.finished,
      components:result.components
    };
  }

  function addReplay(result,label){
    if(!result||!result.trace||result.trace.length<2)return;
    const replay={
      episode:result.episode||0,
      label:label||`${fmt(result.episode)}回`,
      trace:result.trace,
      result:{distance:result.distance,reward:result.reward,reason:result.reason,finished:result.finished,components:result.components}
    };
    const existing=replays.findIndex(item=>item.episode===replay.episode);
    if(existing>=0)replays.splice(existing,1,replay);else replays.push(replay);
    replays.sort((a,b)=>a.episode-b.episode);
    while(replays.length>14){const removable=replays.findIndex(item=>item.episode!==0);replays.splice(Math.max(0,removable),1);}
    renderReplayButtons();
  }

  function makeUntrainedReplay(){
    const result=E.runEpisode(engine,{learn:false,greedy:true,seed:9217,trace:true});
    result.episode=0;
    addReplay(result,'学習前');
  }

  function renderReplayButtons(){
    const host=$('replayButtons');
    if(!host)return;
    host.innerHTML='';
    replays.forEach(replay=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='replay-chip';
      button.textContent=replay.label;
      button.dataset.replay=String(replay.episode);
      button.setAttribute('aria-pressed',playback&&playback.replay.episode===replay.episode?'true':'false');
      button.setAttribute('aria-label',`${replay.label}の歩き方を再生`);
      button.addEventListener('click',()=>playReplay(replay));
      host.appendChild(button);
    });
    const toolbar=$('replayToolbar');
    if(toolbar)toolbar.hidden=training||engine.episodes<=0||replays.length<2;
  }

  function playReplay(replay){
    if(training||!replay)return;
    stopMotion();
    setReplayActive(replay.episode);
    setMode('replay');
    if(reduceMotion){
      const finalFrame=replay.trace[replay.trace.length-1];
      drawWorld(finalFrame);updateHud(finalFrame);updateMovementTheory(finalFrame,finalFrame.lastAction);updateMath(finalFrame);
      dirty=false;setMode('ready');
      if($('coach'))$('coach').textContent=`${replay.label}：動きを減らす設定のため、最後の姿勢を表示中。${outcomeText(replay.result)}`;
      announce(`${replay.label}の最後の姿勢を表示しました。${outcomeText(replay.result)}`);
      revealStage();
      return;
    }
    playback={replay,index:0,started:performance.now(),frameMs:72};
    if($('stopReplay'))$('stopReplay').hidden=false;
    dirty=true;
    if($('coach'))$('coach').textContent=`${replay.label}の歩き方。足だけでなく、長い腕がどちらへ振られているか見てみよう。`;
    announce(`${replay.label}の学習リプレイを再生します。`);
    revealStage();
  }

  function stopReplayPlayback(){
    if(!playback)return;
    const replay=playback.replay;
    playback=null;dirty=true;
    if($('stopReplay'))$('stopReplay').hidden=true;
    setReplayActive(null);
    setMode('ready');
    if($('coach'))$('coach').textContent=`${replay.label}の再生を止めました。別の節目と見比べられます。`;
    announce(`${replay.label}の学習リプレイを停止しました。`);
  }

  async function train(count){
    if(training)return;
    const returnFocus=document.activeElement;
    stopMotion();
    training=true;
    cancelTraining=false;
    setMode('training');
    renderReplayButtons();
    lockExperimentControls(true);
    const progress=$('trainingProgress');
    if(progress)progress.hidden=false;
    const stopControl=$('stopTraining');
    if(stopControl&&stopControl.focus)stopControl.focus({preventScroll:true});
    const startEpisode=engine.episodes;
    const finalEpisode=startEpisode+count;
    announce(`さらに${fmt(count)}回の学習を始めました。`);
    let newestReplay=null;

    let lastPaint=-Infinity;
    try{
      for(let i=0;i<count&&!cancelTraining;i++){
        const episode=engine.episodes+1;
        const wantsTrace=replayMilestones.has(episode)||episode===finalEpisode;
        const result=E.runEpisode(engine,{learn:true,trace:wantsTrace});
        history.push(historyRecord(result));
        lastEpisode=result;
        if(wantsTrace){addReplay(result,`${fmt(result.episode)}回`);newestReplay=replays.find(item=>item.episode===result.episode);}

        const now=performance.now();
        if(i===0||i===count-1||now-lastPaint>=80){
          if($('trainingBar'))$('trainingBar').value=Math.round((i+1)/count*100);
          if($('trainingLabel'))$('trainingLabel').textContent=`${fmt(engine.episodes)}回まで学習中 · 今回 ${fmt(i+1)} / ${fmt(count)}`;
          updateHud();
          if(document.querySelector('.math-lab[open]'))updateMath(bot);
          if(document.querySelector('.parameter-lab[open]'))renderParameterFocus();
          drawChart();
          renderDiscoveries();
          lastPaint=now;
        }
        if(i%20===0)await new Promise(resolve=>window.setTimeout(resolve,0));
      }
    }finally{
      training=false;
      lockExperimentControls(false);
      if(progress)progress.hidden=true;
      if(returnFocus&&returnFocus.focus)returnFocus.focus({preventScroll:true});
    }
    setMode('ready');
    renderReplayButtons();
    updateHud();
    drawChart();
    renderDiscoveries();
    renderQTable();
    updateMath(bot);
    renderParameterFocus();
    renderRewardBreakdown(lastEpisode);
    const learned=engine.episodes-startEpisode;
    const message=cancelTraining?`${fmt(learned)}回で学習を止めました。`:`${fmt(learned)}回の追加学習が完了しました。`;
    if($('coach'))$('coach').textContent=`${message} リプレイで昔と今を比べるか、AIテストで未知の揺れに挑戦させよう。`;
    announce(message);
    if(newestReplay&&!reduceMotion)playReplay(newestReplay);
  }

  function stopTraining(){
    if(training){cancelTraining=true;announce('学習を安全な区切りで止めます。');}
  }

  function startTest(){
    if(training)return;
    stopMotion();
    resetBot(true);
    setMode('test');
    if($('coach'))$('coach').textContent='冒険なし。いま最もQ値が高い行動だけを選びます。同じ体でも学習前と変わった？';
    announce(`${fmt(engine.episodes)}回学習したAIのテストを始めました。`);
    revealStage();
    testTimer=window.setInterval(()=>{
      if(!bot.alive){clearInterval(testTimer);testTimer=0;return;}
      const state=E.stateIndex(bot);
      const action=E.chooseAction(engine,state,false,runtime);
      const result=E.step(engine,bot,action,runtime);
      dirty=true;
      aiBest=Math.max(aiBest,bot.x);
      updateHud();
      updateMath(bot);
      if(result.done){
        clearInterval(testTimer);testTimer=0;
        const final={distance:bot.x,reward:bot.reward,reason:bot.doneReason,finished:bot.finished,components:bot.components};
        renderRewardBreakdown(final);
        const message=outcomeText(final);
        if($('coach'))$('coach').textContent=`AIテスト終了。${message}`;
        announce(`AIテスト終了。${message}`);
      }
    },reduceMotion?175:105);
  }

  function valuesFromRewardInputs(){
    return {
      forward:Number($('rewardForward')&&$('rewardForward').value||11),
      balance:Number($('rewardBalance')&&$('rewardBalance').value||.025),
      energy:Number($('rewardEnergy')&&$('rewardEnergy').value||.045),
      fall:Number($('rewardFall')&&$('rewardFall').value||18)
    };
  }

  function setRewardInputs(values){
    Object.entries({rewardForward:'forward',rewardBalance:'balance',rewardEnergy:'energy',rewardFall:'fall'}).forEach(([id,key])=>{
      if($(id))$(id).value=String(values[key]);
    });
    updateRewardFormula();
  }

  function updateRewardFormula(){
    const r=valuesFromRewardInputs();
    const outputs={rewardForwardValue:r.forward,rewardBalanceValue:r.balance,rewardEnergyValue:r.energy,rewardFallValue:r.fall};
    Object.entries(outputs).forEach(([id,value])=>{if($(id))$(id).textContent=String(value);});
    const formula=`報酬 = 前進 ${r.forward} × 距離 + 直立 ${r.balance} × 姿勢 − ${r.energy} × 力 − 転倒 ${r.fall}（完走時 +${fixed(r.forward*.7,1)}）`;
    if($('rewardFormula'))$('rewardFormula').textContent=formula;
  }

  function resetLearning(reason){
    if(training){announce('学習中は報酬やQテーブルを変更できません。「ここで止める」を先に押してください。');return;}
    stopMotion();
    cancelTraining=true;
    const settings={
      learning:Object.assign({},engine.learning),
      physics:Object.assign({},engine.physics),
      reward:valuesFromRewardInputs(),
      seed:0x51f15e
    };
    engine=E.createEngine(settings);
    history=[];
    replays=[];
    aiBest=0;
    lastEpisode=null;
    makeUntrainedReplay();
    resetBot(false);
    setMode('manual');
    drawChart();
    renderDiscoveries();
    renderQTable();
    renderParameterFocus();
    renderRewardBreakdown(null);
    if($('coach'))$('coach').textContent='新しい実験を開始。報酬の決め方が変わると、同じ行動の点数も変わります。';
    announce(reason||'学習を0回に戻しました。');
  }

  function applyRewardPreset(name){
    if(training)return;
    const preset=rewardPresets[name];
    if(!preset)return;
    setRewardInputs(preset);
    document.querySelectorAll('[data-reward-preset]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.rewardPreset===name?'true':'false'));
    resetLearning(`「${name==='speed'?'速さ':name==='survival'?'転ばない':name==='efficient'?'省エネ':'バランス'}」の報酬で、新しい実験を始めました。`);
  }

  function renderRewardBreakdown(result){
    const host=$('rewardBreakdown');
    const c=result&&result.components?result.components:{forward:0,balance:0,energy:0,fall:0};
    if(host)host.innerHTML=`<div><span>前進</span><b>${signed(c.forward)}</b></div><div><span>直立</span><b>${signed(c.balance)}</b></div><div><span>力</span><b>${signed(c.energy)}</b></div><div><span>転倒</span><b>${signed(c.fall)}</b></div>`;
    const ids={rewardContributionForward:'forward',rewardContributionBalance:'balance',rewardContributionEnergy:'energy',rewardContributionFall:'fall'};
    Object.entries(ids).forEach(([id,key])=>{if($(id))$(id).textContent=signed(c[key]);});
  }

  function signed(value){return `${value>=0?'+':''}${fixed(value,2)}`;}

  function renderDiscoveries(){
    const host=$('discoveries');
    if(!host)return;
    const recent=history.slice(-20);
    const checks=[
      {key:'first-meter',name:'1 mの壁',detail:'最近20回のうち3回以上、1 mを越えた',done:recent.filter(r=>r.distance>=1).length>=3},
      {key:'alternating',name:'足の交互運動',detail:'8歩以上で、正しい足を65%以上選んだ',done:history.some(r=>r.legActions>=8&&r.correctRatio>=.65&&r.distance>=2)},
      {key:'counter-arm',name:'カウンター腕',detail:'腕を8回以上使い、55%以上で傾きと反対を選んだ',done:history.some(r=>r.armChoices>=8&&r.counterArmRatio>=.55&&r.distance>=2)},
      {key:'ten-meters',name:'10 mの旅',detail:'少し長い歩き方を発見',done:history.some(r=>r.distance>=10)},
      {key:'steady-walk',name:'安定歩行',detail:'20 m以上、つまずき2回以下',done:history.some(r=>r.distance>=20&&r.stumbles<=2)}
    ];
    const existing=host.querySelector('[data-discovery]');
    if(existing){
      checks.forEach(item=>{
        const row=host.querySelector(`[data-discovery="${item.key}"]`);
        if(row){
          row.classList.toggle('found',item.done);
          const mark=row.querySelector('[aria-hidden="true"]');if(mark)mark.textContent=item.done?'✓':'○';
          const status=row.querySelector('[data-discovery-status]');if(status)status.textContent=item.done?'発見済み':'未発見';
        }
      });
    }else{
      host.innerHTML=checks.map(item=>`<li class="${item.done?'found':''}" data-discovery="${item.key}"><span aria-hidden="true">${item.done?'✓':'○'}</span><div><b>${item.name}</b><small>${item.detail}</small><span class="visually-hidden" data-discovery-status>${item.done?'発見済み':'未発見'}</span></div></li>`).join('');
    }
    if($('discoveryCount'))$('discoveryCount').textContent=`${checks.filter(item=>item.done).length} / ${checks.length}`;
  }

  function downsample(list,maxPoints){
    if(list.length<=maxPoints)return list.map((item,index)=>({item,index}));
    const step=(list.length-1)/(maxPoints-1);
    return Array.from({length:maxPoints},(_,i)=>{const index=Math.round(i*step);return {item:list[index],index};});
  }

  function movingAverage(values,windowSize){
    let sum=0;
    return values.map((value,index)=>{
      sum+=value;
      if(index>=windowSize)sum-=values[index-windowSize];
      return sum/Math.min(windowSize,index+1);
    });
  }

  function drawChart(){
    const w=chart.width,h=chart.height;
    cctx.clearRect(0,0,w,h);
    cctx.fillStyle='#fbfaf5';cctx.fillRect(0,0,w,h);
    cctx.strokeStyle='#d9ded8';cctx.lineWidth=1;
    for(let i=0;i<5;i++){const y=24+i*(h-52)/4;cctx.beginPath();cctx.moveTo(48,y);cctx.lineTo(w-18,y);cctx.stroke();}
    if(!history.length){
      cctx.fillStyle='#65706b';cctx.font='15px sans-serif';cctx.textAlign='center';
      cctx.fillText('学習すると、失敗も発見もここに残ります',w/2,h/2);cctx.textAlign='start';
      if($('chartSummary'))$('chartSummary').textContent='学習前';
      if($('chartA11y'))$('chartA11y').textContent='まだ学習前です。学習後に、試行ごとの報酬・距離・足の交互率を文章でも説明します。';
      return;
    }
    const meta=metricMeta[metric];
    const all=history.map(meta.value);
    const average=movingAverage(all,Math.max(5,Math.min(60,Math.round(all.length/20))));
    let min=Infinity,max=-Infinity,observedMin=Infinity,observedMax=-Infinity;
    for(const value of all){
      if(value<min)min=value;if(value>max)max=value;
      if(value<observedMin)observedMin=value;if(value>observedMax)observedMax=value;
    }
    for(const value of average){if(value<min)min=value;if(value>max)max=value;}
    if(metric==='distance'){min=0;max=Math.max(1,max);}
    if(metric==='alternation'){min=0;max=100;}
    if(max-min<.001){max+=1;min-=1;}
    const toX=index=>48+index/Math.max(1,all.length-1)*(w-70);
    const toY=value=>24+(max-value)/(max-min)*(h-54);
    const raw=downsample(history,650);
    cctx.strokeStyle='rgba(23,107,135,.72)';cctx.lineWidth=1;cctx.beginPath();
    raw.forEach(({item,index},i)=>{const x=toX(index),y=toY(meta.value(item));i?cctx.lineTo(x,y):cctx.moveTo(x,y);});cctx.stroke();
    cctx.strokeStyle=meta.color;cctx.lineWidth=3;cctx.beginPath();
    downsample(average,650).forEach(({item:value,index},i)=>{const x=toX(index),y=toY(value);i?cctx.lineTo(x,y):cctx.moveTo(x,y);});cctx.stroke();
    cctx.fillStyle='#53605b';cctx.font='12px sans-serif';cctx.textAlign='right';
    cctx.fillText(fixed(max,metric==='alternation'?0:1),43,29);cctx.fillText(fixed(min,metric==='alternation'?0:1),43,h-25);
    cctx.textAlign='left';cctx.fillText('1回',48,h-7);cctx.textAlign='right';cctx.fillText(`${fmt(history.length)}回`,w-18,h-7);cctx.textAlign='start';
    const recent=all.slice(-Math.min(50,all.length));
    const recentAverage=recent.reduce((a,b)=>a+b,0)/recent.length;
    if($('chartSummary'))$('chartSummary').textContent=`直近平均 ${fixed(recentAverage,metric==='alternation'?0:1)}${metric==='distance'?' m':metric==='alternation'?'%':''}`;
    if($('chartA11y')){
      const early=all.slice(0,Math.min(50,all.length));
      const earlyAverage=early.reduce((a,b)=>a+b,0)/early.length;
      const tolerance=Math.max(.01,(max-min)*.03);
      const trend=recentAverage>earlyAverage+tolerance?'上向き':recentAverage<earlyAverage-tolerance?'下向き':'ほぼ横ばい';
      const unit=metric==='distance'?'メートル':metric==='alternation'?'パーセント':'点';
      $('chartA11y').textContent=`${fmt(all.length)}回分の${meta.label}。最小 ${fixed(observedMin,1)} ${unit}、最大 ${fixed(observedMax,1)} ${unit}、最新 ${fixed(all[all.length-1],1)} ${unit}、直近平均 ${fixed(recentAverage,1)} ${unit}。最初の平均と比べて${trend}です。`;
    }
  }

  function stateDescription(subject){
    const parts=typeof subject==='number'?E.decodeState(subject):E.stateParts(subject);
    const lean=['大きく左','左','少し左','まっすぐ','少し右','右','大きく右'][parts[0]];
    const motion=['左へ速く回転','左へ回転','回転は静か','右へ回転','右へ速く回転'][parts[1]];
    const pace=['停止','ゆっくり','前進','速い'][parts[2]];
    const gait=['左足・準備OK','左足・休み中','右足・準備OK','右足・休み中'][parts[3]];
    const arm=['腕は左へ動く','腕は静か','腕は右へ動く'][parts[4]];
    const slope=['下り坂','ほぼ平ら','上り坂'][parts[5]];
    return {parts,text:`${lean} · ${motion} · ${pace} · ${gait} · ${arm} · ${slope}`};
  }

  function updateMath(subject){
    if(!subject)return;
    const u=engine.lastUpdate;
    const state=u?u.state:E.stateIndex(subject);
    const description=stateDescription(state);
    if($('stateLabel'))$('stateLabel').textContent=`${u?'最後に学んだ':'現在の'}状態 ${state}｜${description.text}`;
    renderQStory(u);
    renderQHeatmap(state,u?u.action:null);
  }

  function setQStoryNumber(id,value,digits=3,suffix=''){
    const output=$(id);
    if(!output)return;
    output.dataset.value=String(value);
    output.textContent=`${value>=0?'+':''}${fixed(value,digits)}${suffix}`;
  }

  function renderQStory(update){
    const host=$('qStory');
    if(!host)return;
    if(!update){
      host.dataset.state='';host.dataset.action='';
      if($('qStoryState'))$('qStoryState').textContent='まだ学習前';
      if($('qStoryAction'))$('qStoryAction').textContent='—';
      ['qStoryReward','qStoryFuture','qStoryOld','qStoryTarget','qStoryNew'].forEach(id=>{if($(id)){delete $(id).dataset.value;$(id).textContent='—';}});
      if($('qStoryChange'))$('qStoryChange').textContent='AIに学習させると、最後の一手をここでゆっくり読み解けます。';
      if($('equationNumbers'))$('equationNumbers').textContent='まだ更新前です。学習すると、実際の数字を代入して表示します。';
      return;
    }
    const description=stateDescription(update.state);
    host.dataset.state=String(update.state);
    host.dataset.action=String(update.action);
    if($('qStoryState'))$('qStoryState').textContent=`${update.state}｜${description.text}`;
    if($('qStoryAction'))$('qStoryAction').textContent=E.ACTIONS[update.action].label;
    setQStoryNumber('qStoryReward',update.reward);
    setQStoryNumber('qStoryFuture',update.future,3,update.done?'（終了）':'');
    setQStoryNumber('qStoryOld',update.old);
    setQStoryNumber('qStoryTarget',update.target);
    setQStoryNumber('qStoryNew',update.value);
    const changeText=update.td>.0005?'予想を上げました':update.td<-.0005?'予想を下げました':'予想はほぼ変わりませんでした';
    if($('qStoryChange'))$('qStoryChange').textContent=`目標との差は ${signed(update.td)}。一度に全部は信じず、実効学習率 ${fixed(update.alpha*100,1)}% だけ反映し、${changeText}。`;
    if($('equationNumbers'))$('equationNumbers').textContent=`${fixed(update.old,3)} + ${fixed(update.alpha,3)} × (${fixed(update.reward,3)} + ${fixed(engine.learning.gamma,2)} × ${fixed(update.future,3)} − ${fixed(update.old,3)}) = ${fixed(update.value,3)}`;
  }

  function renderQHeatmap(state,focusAction){
    const host=$('qHeatmap');
    if(!host)return;
    host.dataset.state=String(state);
    const values=E.qValues(engine,state);
    const maxAbs=Math.max(.001,...values.map(Math.abs));
    const bestIndex=values.indexOf(Math.max(...values));
    let cells=host.querySelectorAll('[data-q-action]');
    if(cells.length!==E.ACTION_COUNT){
      host.innerHTML='';
      E.ACTIONS.forEach((action,index)=>{const cell=document.createElement('output');cell.className='q-cell';cell.dataset.qAction=String(index);cell.setAttribute('role','cell');cell.setAttribute('aria-live','off');host.appendChild(cell);});
      cells=host.querySelectorAll('[data-q-action]');
    }
    cells.forEach((cell,index)=>{
      const value=values[index];
      cell.textContent=fixed(value,2);
      cell.style.setProperty('--q-strength',String(Math.min(1,Math.abs(value)/maxAbs)));
      cell.classList.toggle('positive',value>=0);
      cell.classList.toggle('negative',value<0);
      cell.classList.toggle('best',index===bestIndex&&maxAbs>.001);
      cell.classList.toggle('last-updated',index===focusAction);
      cell.title=`${E.ACTIONS[index].label}: Q=${fixed(value,3)}${index===focusAction?'（最後に書き換え）':''}`;
    });
    if($('qNote')){
      const spread=Math.max(...values)-Math.min(...values);
      const best=values.indexOf(Math.max(...values));
      $('qNote').textContent=focusAction!==null&&focusAction!==undefined
        ?`橙の枠が、最後に書き換えた「${E.ACTIONS[focusAction].label}」。${spread<.001?'ほかの予想との差はまだ小さいです。':`いま最高の予想は「${E.ACTIONS[best].label}」です。`}`
        :'まだ経験がないので15通りとも同じ予想です。0は「普通」ではなく、未経験の0かもしれません。';
    }
  }

  function renderQTable(){
    const body=$('qTableBody');
    if(!body)return;
    const visited=[];
    for(let state=0;state<E.STATE_COUNT;state++)if(engine.visits[state])visited.push(state);
    visited.sort((a,b)=>engine.visits[b]-engine.visits[a]);
    body.innerHTML=visited.slice(0,12).map(state=>{
      const values=E.qValues(engine,state);
      const max=Math.max(...values);const action=values.indexOf(max);
      return `<tr><th scope="row">${state}</th><td>${fmt(engine.visits[state])}</td><td>${E.ACTIONS[action].label}</td><td>${fixed(max,3)}</td></tr>`;
    }).join('')||'<tr><td colspan="4">まだ学習していません。</td></tr>';
  }

  function renderParameterFocus(){
    const input=$(focusedParameter);
    if(!input)return;
    const value=Number(input.value);
    const min=Number(input.min||0);
    const max=Number(input.max||1);
    const ratio=max>min?(value-min)/(max-min):0;
    if($(`${focusedParameter}Value`))$(`${focusedParameter}Value`).textContent=value.toFixed(2);
    document.querySelectorAll('[data-parameter-focus]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.parameterFocus===focusedParameter?'true':'false'));
    document.querySelectorAll('[data-parameter-panel]').forEach(panel=>{panel.hidden=panel.dataset.parameterPanel!==focusedParameter;});
    if($('parameterFocus'))$('parameterFocus').dataset.parameter=focusedParameter;
    if($('parameterFocusMeter'))$('parameterFocusMeter').style.width=`${Math.round(ratio*100)}%`;

    let category='AIの学び方';
    let title='';
    let lead='';
    let example='';
    let scale='';
    if(focusedParameter==='alpha'){
      const effective=E.effectiveRate(value,engine.episodes,.18,2400);
      const u=engine.lastUpdate;
      title='一度の経験を、どれくらい強く覚える？';
      lead='小さいとゆっくり安定して変わり、大きいと一度の偶然にも強く動きます。';
      example=u
        ?`設定 ${fixed(value*100,0)}% → 今の実効値 ${fixed(effective*100,1)}%。同じ目標なら ${fixed(u.old,2)} → ${fixed(u.old+effective*(u.target-u.old),2)}。`
        :`設定 ${fixed(value*100,0)}% → 学習開始時の実効値 ${fixed(effective*100,1)}%。予想を今回の目標へこの割合だけ近づけます。`;
      scale='左：ゆっくり覚える ／ 右：一気に覚える';
    }else if(focusedParameter==='gamma'){
      const u=engine.lastUpdate;
      title='先のごほうびを、今の一歩へどれくらい戻す？';
      lead='0なら今回だけ。1に近いほど、この一歩が後の成功につながるかも考えます。';
      example=`1手先は ${fixed(value*100,0)}%、2手先は ${fixed(value*value*100,0)}% 残す。${u?`最後の次Q ${fixed(u.future,2)} のうち ${fixed(value*u.future,2)} を目標へ加えます。`:''}`;
      scale='左：目先を重視 ／ 右：遠い成功も重視';
    }else if(focusedParameter==='epsilon'){
      const effective=E.effectiveRate(value,engine.episodes,.09,1850);
      title='いつもの一番以外も、どれくらい試す？';
      lead='高いと珍妙な動きから新しい作戦を探し、低いと知っている作戦を繰り返します。';
      example=`開始時 ${fixed(value*100,0)}% → ${fmt(engine.episodes)}回学習した今は約 ${fixed(effective*100,1)}%。100回なら約${Math.round(effective*100)}回が冒険です。`;
      scale='左：知っている作戦 ／ 右：未知の作戦も試す';
    }else{
      category='世界の設定（AIの頭ではない）';
      title='練習する道を、どれくらい意地悪にする？';
      lead='坂の影響、偶然の揺れ、足の滑りが増えます。同じ作戦でも結果が少し変わります。';
      example=`坂の影響は ${fixed(1+value*2.2,2)} 倍。1回の大股で滑る確率は約 ${fixed(value*.085*100,2)}%。`;
      scale='左：なめらか ／ 右：でこぼこ・揺れが強い';
    }
    if($('parameterFocusCategory'))$('parameterFocusCategory').textContent=category;
    if($('parameterFocusTitle'))$('parameterFocusTitle').textContent=title;
    if($('parameterFocusLead'))$('parameterFocusLead').textContent=lead;
    if($('parameterFocusExample'))$('parameterFocusExample').textContent=example;
    if($('parameterFocusScale'))$('parameterFocusScale').textContent=scale;
  }

  function selectParameterFocus(name){
    if(!['alpha','gamma','epsilon','roughness'].includes(name))return;
    focusedParameter=name;
    renderParameterFocus();
  }

  function drawWorld(subject){
    const w=canvas.width,h=canvas.height;
    const camera=Math.max(0,subject.x-7.5);
    const groundBase=342;
    ctx.clearRect(0,0,w,h);
    const sky=ctx.createLinearGradient(0,0,0,groundBase);sky.addColorStop(0,'#e6f1ee');sky.addColorStop(1,'#fbf0d7');
    ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,.65)';
    for(let i=0;i<4;i++){const x=((i*285-camera*8)%1200+1200)%1200-80;ctx.beginPath();ctx.ellipse(x,68+(i%2)*62,64,13,0,0,Math.PI*2);ctx.fill();}

    const roughnessScale=(1+engine.physics.roughness*2.2)/(1+E.DEFAULTS.physics.roughness*2.2);
    const terrainY=worldX=>groundBase-E.terrainHeight(worldX)*230*roughnessScale;
    ctx.beginPath();ctx.moveTo(0,h);
    for(let px=0;px<=w;px+=5){const worldX=camera+(px-150)/28;ctx.lineTo(px,terrainY(worldX));}
    ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle='#c7d6a2';ctx.fill();
    ctx.beginPath();
    for(let px=0;px<=w;px+=5){const worldX=camera+(px-150)/28;const y=terrainY(worldX);px?ctx.lineTo(px,y):ctx.moveTo(px,y);}
    ctx.strokeStyle='#304b3c';ctx.lineWidth=4;ctx.stroke();

    const goal=engine.physics.targetDistance;
    for(let marker=0;marker<=goal;marker+=5){const px=150+(marker-camera)*28;if(px>-30&&px<w+30){const y=terrainY(marker);ctx.strokeStyle='#304b3c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px,y+15);ctx.stroke();ctx.fillStyle='#304b3c';ctx.font='12px sans-serif';ctx.fillText(`${marker} m`,px+5,y+15);}}
    const finishX=150+(goal-camera)*28;if(finishX>-80&&finishX<w+80){const y=terrainY(goal);ctx.strokeStyle='#ad4b34';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(finishX,y);ctx.lineTo(finishX,y-110);ctx.stroke();ctx.fillStyle='#ad4b34';ctx.beginPath();ctx.moveTo(finishX,y-110);ctx.lineTo(finishX+55,y-93);ctx.lineTo(finishX,y-76);ctx.closePath();ctx.fill();}

    const px=150+(subject.x-camera)*28;
    const py=terrainY(subject.x)-3;
    drawStickFigure(ctx,px,py,subject);

    ctx.fillStyle='rgba(30,48,41,.8)';ctx.font='700 13px sans-serif';ctx.fillText(`${fixed(subject.x)} m`,Math.min(w-70,px+30),Math.max(24,py-118));
    if(!subject.alive){ctx.fillStyle='rgba(255,250,239,.88)';ctx.fillRect(w/2-142,24,284,44);ctx.fillStyle='#263b33';ctx.textAlign='center';ctx.font='700 19px sans-serif';ctx.fillText(subject.finished?`${goal} m 完走！`:'ころん…',w/2,52);ctx.textAlign='start';}
  }

  function drawStickFigure(g,x,y,subject){
    const action=E.ACTIONS[subject.lastAction]||E.ACTIONS[7];
    const activeLeg=action.leg;
    const stride=(action.stride||0)*18*(subject.stepFlash||0);
    const arm=subject.arm||0;
    g.save();g.translate(x,y);g.rotate(subject.lean*.72);g.lineCap='round';g.lineJoin='round';
    const ink='#182823',accent='#d75f3e';
    function limb(points,color=ink,width=6){g.strokeStyle=color;g.lineWidth=width;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();}
    const hip=[0,-43],shoulder=[0,-94];
    limb([hip,shoulder],ink,7);
    const leftKnee=[-12-stride*(activeLeg<0),-20],leftFoot=[-18-stride*(activeLeg<0),0];
    const rightKnee=[12+stride*(activeLeg>0),-20],rightFoot=[18+stride*(activeLeg>0),0];
    limb([hip,leftKnee,leftFoot],activeLeg<0?accent:ink,6);
    limb([hip,rightKnee,rightFoot],activeLeg>0?accent:ink,6);
    const leftHand=[-36+arm*25,-55-arm*9],rightHand=[36+arm*25,-55+arm*9];
    limb([shoulder,[-22+arm*12,-76],leftHand],ink,5);
    limb([shoulder,[22+arm*12,-76],rightHand],ink,5);
    g.fillStyle='#fffdf6';g.strokeStyle=ink;g.lineWidth=6;g.beginPath();g.arc(0,-126,31,0,Math.PI*2);g.fill();g.stroke();
    g.fillStyle=ink;g.beginPath();g.arc(-9,-132,2.8,0,Math.PI*2);g.arc(9,-132,2.8,0,Math.PI*2);g.fill();
    g.strokeStyle=ink;g.lineWidth=2.5;g.beginPath();g.moveTo(-8,-116);g.lineTo(8,-116);g.stroke();
    g.restore();
  }

  function animationFrame(now){
    let display=bot;
    let frameChanged=false;
    if(playback){
      const elapsed=now-playback.started;
      const nextIndex=Math.max(0,Math.min(playback.replay.trace.length-1,Math.floor(elapsed/playback.frameMs)));
      frameChanged=nextIndex!==playback.index;
      playback.index=nextIndex;
      display=playback.replay.trace[playback.index];
      if(playback.index>=playback.replay.trace.length-1&&elapsed>(playback.index+3)*playback.frameMs){
        const replay=playback.replay;playback=null;setMode('ready');
        if($('stopReplay'))$('stopReplay').hidden=true;
        setReplayActive(null);
        if($('coach'))$('coach').textContent=`${replay.label}：${outcomeText(replay.result)} 別の節目と見比べてみよう。`;
        announce(`${replay.label}の再生が終わりました。${outcomeText(replay.result)}`);
        frameChanged=true;
      }
    }
    if(frameChanged||dirty){
      drawWorld(display);
      if(now-lastUiDraw>180){updateHud(display);updateMovementTheory(display,mode==='manual'?null:display.lastAction);updateMath(display);lastUiDraw=now;}
      dirty=false;
    }
    window.requestAnimationFrame(animationFrame);
  }

  function bindEvents(){
    document.querySelectorAll('[data-leg]').forEach(button=>button.addEventListener('click',()=>manualLeg(button.dataset.leg)));
    document.querySelectorAll('[data-arm]').forEach(button=>button.addEventListener('click',()=>manualArm(button.dataset.arm)));
    document.querySelectorAll('[data-train]').forEach(button=>button.addEventListener('click',()=>train(Number(button.dataset.train))));
    document.querySelectorAll('[data-metric]').forEach(button=>button.addEventListener('click',()=>{
      metric=button.dataset.metric;
      document.querySelectorAll('[data-metric]').forEach(item=>item.setAttribute('aria-pressed',item===button?'true':'false'));
      drawChart();
    }));
    document.querySelectorAll('[data-reward-preset]').forEach(button=>button.addEventListener('click',()=>applyRewardPreset(button.dataset.rewardPreset)));
    document.querySelectorAll('[data-parameter-focus]').forEach(button=>button.addEventListener('click',()=>selectParameterFocus(button.dataset.parameterFocus)));
    if($('manualStart'))$('manualStart').addEventListener('click',startManual);
    if($('testAi'))$('testAi').addEventListener('click',startTest);
    if($('resetLearning'))$('resetLearning').addEventListener('click',()=>resetLearning('学習とQテーブルを0回に戻しました。'));
    if($('stopTraining'))$('stopTraining').addEventListener('click',stopTraining);
    if($('stopReplay'))$('stopReplay').addEventListener('click',stopReplayPlayback);
    document.querySelectorAll('[data-start-manual]').forEach(link=>link.addEventListener('click',event=>{
      event.preventDefault();
      if(training){announce('学習中です。「ここで止める」を押すと手動へ戻れます。');return;}
      startManual();
    }));

    ['rewardForward','rewardBalance','rewardEnergy','rewardFall'].forEach(id=>{
      if(!$(id))return;
      $(id).addEventListener('input',()=>{
        document.querySelectorAll('[data-reward-preset]').forEach(button=>button.setAttribute('aria-pressed','false'));
        updateRewardFormula();
      });
      $(id).addEventListener('change',()=>resetLearning('報酬の式を変更したので、新しいQテーブルで実験を始めました。'));
    });

    const paramBindings={alpha:['learning','alpha'],gamma:['learning','gamma'],epsilon:['learning','epsilon'],roughness:['physics','roughness']};
    const parameterNames={alpha:'学習率',gamma:'未来の重み',epsilon:'冒険率',roughness:'地面のでこぼこ'};
    Object.entries(paramBindings).forEach(([id,[group,key]])=>{
      if(!$(id))return;
      $(id).addEventListener('input',event=>{
        engine[group][key]=Number(event.target.value);
        if($(`${id}Value`))$(`${id}Value`).textContent=Number(event.target.value).toFixed(2);
        if(id==='roughness')dirty=true;
        renderParameterFocus();
      });
      $(id).addEventListener('change',event=>{
        engine[group][key]=Number(event.target.value);
        renderParameterFocus();
        resetLearning(`${parameterNames[id]}を確定したので、公平に比べられるよう0回から新しい実験を始めました。`);
      });
    });

    const keyboardTarget=document.querySelector('.stage-column')||document.querySelector('.game-shell');
    if(keyboardTarget){
      if(!keyboardTarget.hasAttribute('tabindex'))keyboardTarget.tabIndex=0;
      keyboardTarget.addEventListener('keydown',event=>{
        if(event.repeat||event.target.matches('button,input,summary'))return;
        const key=event.key.toLowerCase();
        const leg={a:event.shiftKey?'left-long':'left-short',s:'brace',d:event.shiftKey?'right-long':'right-short'}[key];
        const arm={j:'arms-left',k:'arms-center',l:'arms-right'}[key];
        if(leg||arm){event.preventDefault();if(leg)manualLeg(leg);else manualArm(arm);}
      });
    }
  }

  function initialize(){
    bindEvents();
    setRewardInputs(engine.reward);
    makeUntrainedReplay();
    resetBot(false);
    setMode('manual');
    drawChart();
    renderDiscoveries();
    renderQTable();
    renderRewardBreakdown(null);
    updateRewardFormula();
    renderParameterFocus();
    window.requestAnimationFrame(animationFrame);
    window.__walkerDebug={
      get engine(){return engine;},get history(){return history;},get replays(){return replays;},get bot(){return bot;},
      train,startTest,startManual,resetLearning,selectParameterFocus
    };
  }

  initialize();
})();
