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
  let metric='reward';
  let training=false;
  let cancelTraining=false;
  let testTimer=0;
  let playback=null;
  let lastUiDraw=0;
  let lastEpisode=null;
  let dirty=true;

  const fmt=n=>Number(n||0).toLocaleString('ja-JP');
  const fixed=(n,d=1)=>Number.isFinite(n)?n.toFixed(d):'0.0';
  const currentAction=(legIndex,selectedArm=armIndex)=>legIndex*E.ARM_COMMANDS.length+selectedArm;

  function announce(message){
    const el=$('liveStatus');
    if(el)el.textContent=message;
  }

  function stopMotion(){
    if(testTimer){clearInterval(testTimer);testTimer=0;}
    playback=null;
  }

  function setMode(next){
    mode=next;
    const labels={manual:'手動チャレンジ',training:'高速で学習中',test:'AIテスト',replay:'学習リプレイ',ready:'学習を観察'};
    if($('modeBadge'))$('modeBadge').textContent=labels[next]||next;
    if($('manualControls'))$('manualControls').hidden=next!=='manual';
    document.querySelectorAll('[data-leg],[data-arm]').forEach(button=>{button.disabled=next!=='manual';});
  }

  function lockExperimentControls(locked){
    const selectors='#manualStart,#testAi,#resetLearning,[data-train],[data-reward-preset],#rewardForward,#rewardBalance,#rewardEnergy,#rewardFall,#alpha,#gamma,#epsilon,#roughness';
    document.querySelectorAll(selectors).forEach(control=>{control.disabled=locked;});
    if($('stopTraining'))$('stopTraining').disabled=!locked;
  }

  function resetBot(jitter=false){
    runtime={seed:(0x713c9a2d+engine.episodes*97)>>>0};
    bot=E.createBot(runtime,jitter);
    armIndex=1;
    document.querySelectorAll('[data-arm]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.arm==='arms-center'?'true':'false'));
    updateHud();
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
    if($('coach'))$('coach').textContent='足だけではすぐ倒れます。A / S / D と腕の J / K / L を組み合わせて、まず1 mを目指そう。';
    announce('手動チャレンジを開始しました。足と腕を操作できます。');
    const focusTarget=document.querySelector('.stage-column');
    if(focusTarget&&focusTarget.focus)focusTarget.focus({preventScroll:true});
  }

  function manualLeg(legId){
    if(mode!=='manual'||training)return;
    if(!bot.alive){startManual();return;}
    const legIndex=E.LEG_COMMANDS.findIndex(item=>item.id===legId);
    if(legIndex<0)return;
    const action=currentAction(legIndex);
    const result=E.step(engine,bot,action,runtime);
    dirty=true;
    humanBest=Math.max(humanBest,bot.x);
    flash(`[data-leg="${legId}"]`);
    updateHud();
    updateMath(bot);
    if(result.done){
      const summary=bot.finished?`やった！ ${fixed(bot.x)} m完走。`:`${fixed(bot.x)} mでころんだ。腕の向きと足の順番を変えてみよう。`;
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
    if($('coach'))$('coach').textContent=`「${label}」を選択。次の足ボタンで、足と腕を同時に動かします。`;
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
      button.setAttribute('aria-label',`${replay.label}の歩き方を再生`);
      button.addEventListener('click',()=>playReplay(replay));
      host.appendChild(button);
    });
  }

  function playReplay(replay){
    if(training||!replay)return;
    stopMotion();
    setMode('replay');
    playback={replay,index:0,started:performance.now(),frameMs:reduceMotion?180:72};
    dirty=true;
    if($('coach'))$('coach').textContent=`${replay.label}の歩き方。足だけでなく、長い腕がどちらへ振られているか見てみよう。`;
    announce(`${replay.label}の学習リプレイを再生します。`);
  }

  async function train(count){
    if(training)return;
    stopMotion();
    training=true;
    cancelTraining=false;
    setMode('training');
    lockExperimentControls(true);
    const progress=$('trainingProgress');
    if(progress)progress.hidden=false;
    const startEpisode=engine.episodes;
    const finalEpisode=startEpisode+count;
    announce(`さらに${fmt(count)}回の学習を始めました。`);
    let newestReplay=null;

    for(let i=0;i<count&&!cancelTraining;i++){
      const episode=engine.episodes+1;
      const wantsTrace=replayMilestones.has(episode)||episode===finalEpisode;
      const result=E.runEpisode(engine,{learn:true,trace:wantsTrace});
      history.push(historyRecord(result));
      lastEpisode=result;
      if(wantsTrace){addReplay(result,`${fmt(result.episode)}回`);newestReplay=replays.find(item=>item.episode===result.episode);}

      if(i%20===0||i===count-1){
        if($('trainingBar'))$('trainingBar').value=Math.round((i+1)/count*100);
        if($('trainingLabel'))$('trainingLabel').textContent=`${fmt(engine.episodes)}回まで学習中 · 今回 ${fmt(i+1)} / ${fmt(count)}`;
        updateHud();
        drawChart();
        renderDiscoveries();
        await new Promise(resolve=>window.setTimeout(resolve,0));
      }
    }

    training=false;
    lockExperimentControls(false);
    if(progress)progress.hidden=true;
    setMode('ready');
    updateHud();
    drawChart();
    renderDiscoveries();
    renderQTable();
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
      {key:'counter-arm',name:'カウンター腕',detail:'腕を8回以上使い、55%以上で傾きと反対へ振った',done:history.some(r=>r.armChoices>=8&&r.counterArmRatio>=.55&&r.distance>=2)},
      {key:'ten-meters',name:'10 mの旅',detail:'少し長い歩き方を発見',done:history.some(r=>r.distance>=10)},
      {key:'steady-walk',name:'安定歩行',detail:'20 m以上、つまずき2回以下',done:history.some(r=>r.distance>=20&&r.stumbles<=2)}
    ];
    const existing=host.querySelector('[data-discovery]');
    if(existing){
      checks.forEach(item=>{const row=host.querySelector(`[data-discovery="${item.key}"]`);if(row){row.classList.toggle('found',item.done);const mark=row.querySelector('[aria-hidden="true"]');if(mark)mark.textContent=item.done?'✓':'○';}});
    }else{
      host.innerHTML=checks.map(item=>`<li class="${item.done?'found':''}" data-discovery="${item.key}"><span aria-hidden="true">${item.done?'✓':'○'}</span><div><b>${item.name}</b><small>${item.detail}</small></div></li>`).join('');
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
      return;
    }
    const meta=metricMeta[metric];
    const all=history.map(meta.value);
    const average=movingAverage(all,Math.max(5,Math.min(60,Math.round(all.length/20))));
    let min=Infinity,max=-Infinity;
    for(const value of all){if(value<min)min=value;if(value>max)max=value;}
    for(const value of average){if(value<min)min=value;if(value>max)max=value;}
    if(metric==='distance'){min=0;max=Math.max(1,max);}
    if(metric==='alternation'){min=0;max=100;}
    if(max-min<.001){max+=1;min-=1;}
    const toX=index=>48+index/Math.max(1,all.length-1)*(w-70);
    const toY=value=>24+(max-value)/(max-min)*(h-54);
    const raw=downsample(history,650);
    cctx.strokeStyle='rgba(23,107,135,.22)';cctx.lineWidth=1;cctx.beginPath();
    raw.forEach(({item,index},i)=>{const x=toX(index),y=toY(meta.value(item));i?cctx.lineTo(x,y):cctx.moveTo(x,y);});cctx.stroke();
    cctx.strokeStyle=meta.color;cctx.lineWidth=3;cctx.beginPath();
    downsample(average,650).forEach(({item:value,index},i)=>{const x=toX(index),y=toY(value);i?cctx.lineTo(x,y):cctx.moveTo(x,y);});cctx.stroke();
    cctx.fillStyle='#53605b';cctx.font='12px sans-serif';cctx.textAlign='right';
    cctx.fillText(fixed(max,metric==='alternation'?0:1),43,29);cctx.fillText(fixed(min,metric==='alternation'?0:1),43,h-25);
    cctx.textAlign='left';cctx.fillText('1回',48,h-7);cctx.textAlign='right';cctx.fillText(`${fmt(history.length)}回`,w-18,h-7);cctx.textAlign='start';
    const recent=all.slice(-Math.min(50,all.length));
    const recentAverage=recent.reduce((a,b)=>a+b,0)/recent.length;
    if($('chartSummary'))$('chartSummary').textContent=`直近平均 ${fixed(recentAverage,metric==='alternation'?0:1)}${metric==='distance'?' m':metric==='alternation'?'%':''}`;
  }

  function stateDescription(subject){
    const parts=E.stateParts(subject);
    const lean=['大きく左','左','少し左','まっすぐ','少し右','右','大きく右'][parts[0]];
    const motion=['左へ急','左へ','静か','右へ','右へ急'][parts[1]];
    const pace=['停止','ゆっくり','前進','速い'][parts[2]];
    const foot=parts[3]<2?'左足の番':'右足の番';
    return {parts,text:`${lean} · ${motion} · ${pace} · ${foot}`};
  }

  function updateMath(subject){
    if(!subject)return;
    const state=E.stateIndex(subject);
    const description=stateDescription(subject);
    if($('stateLabel'))$('stateLabel').textContent=`状態 ${state}｜${description.text}`;
    renderQHeatmap(state);
    const u=engine.lastUpdate;
    if($('equationNumbers')){
      $('equationNumbers').textContent=u
        ?`${fixed(u.old,3)} + ${fixed(u.alpha,3)} × (${fixed(u.reward,3)} + ${fixed(engine.learning.gamma,2)} × ${fixed(u.future,3)} − ${fixed(u.old,3)}) = ${fixed(u.value,3)}`
        :'まだ更新前です。学習すると、実際の数字を代入して表示します。';
    }
  }

  function renderQHeatmap(state){
    const host=$('qHeatmap');
    if(!host)return;
    const values=E.qValues(engine,state);
    const maxAbs=Math.max(.001,...values.map(Math.abs));
    const bestIndex=values.indexOf(Math.max(...values));
    let cells=host.querySelectorAll('[data-q-action]');
    if(cells.length!==E.ACTION_COUNT){
      host.innerHTML='';
      E.ACTIONS.forEach((action,index)=>{const cell=document.createElement('output');cell.className='q-cell';cell.dataset.qAction=String(index);host.appendChild(cell);});
      cells=host.querySelectorAll('[data-q-action]');
    }
    cells.forEach((cell,index)=>{
      const value=values[index];
      cell.textContent=fixed(value,2);
      cell.style.setProperty('--q-strength',String(Math.min(1,Math.abs(value)/maxAbs)));
      cell.classList.toggle('positive',value>=0);
      cell.classList.toggle('negative',value<0);
      cell.classList.toggle('best',index===bestIndex&&maxAbs>.001);
      cell.title=`${E.ACTIONS[index].label}: Q=${fixed(value,3)}`;
    });
    if($('qNote')){
      const spread=Math.max(...values)-Math.min(...values);
      const best=values.indexOf(Math.max(...values));
      $('qNote').textContent=spread<.001?'この状態の経験がまだ少なく、15通りの予想に差がありません。':`この状態では「${E.ACTIONS[best].label}」の予想が最高です。`;
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
    const leftHand=[-36-arm*25,-55-arm*9],rightHand=[36-arm*25,-55+arm*9];
    limb([shoulder,[-22-arm*12,-76],leftHand],ink,5);
    limb([shoulder,[22-arm*12,-76],rightHand],ink,5);
    g.fillStyle='#fffdf6';g.strokeStyle=ink;g.lineWidth=6;g.beginPath();g.arc(0,-126,31,0,Math.PI*2);g.fill();g.stroke();
    g.fillStyle=ink;g.beginPath();g.arc(-9,-132,2.8,0,Math.PI*2);g.arc(9,-132,2.8,0,Math.PI*2);g.fill();
    g.strokeStyle=ink;g.lineWidth=2.5;g.beginPath();g.moveTo(-8,-116);g.lineTo(8,-116);g.stroke();
    g.restore();
  }

  function animationFrame(now){
    let display=bot;
    const wasPlaying=Boolean(playback);
    if(playback){
      const elapsed=now-playback.started;
      playback.index=Math.min(playback.replay.trace.length-1,Math.floor(elapsed/playback.frameMs));
      display=playback.replay.trace[playback.index];
      if(playback.index>=playback.replay.trace.length-1&&elapsed>(playback.index+3)*playback.frameMs){
        const replay=playback.replay;playback=null;setMode('ready');
        if($('coach'))$('coach').textContent=`${replay.label}：${outcomeText(replay.result)} 別の節目と見比べてみよう。`;
      }
    }
    if(wasPlaying||dirty){
      drawWorld(display);
      if(now-lastUiDraw>180){updateHud(display);updateMath(display);lastUiDraw=now;}
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
    if($('manualStart'))$('manualStart').addEventListener('click',startManual);
    if($('testAi'))$('testAi').addEventListener('click',startTest);
    if($('resetLearning'))$('resetLearning').addEventListener('click',()=>resetLearning('学習とQテーブルを0回に戻しました。'));
    if($('stopTraining'))$('stopTraining').addEventListener('click',stopTraining);

    ['rewardForward','rewardBalance','rewardEnergy','rewardFall'].forEach(id=>{
      if(!$(id))return;
      $(id).addEventListener('input',()=>{
        document.querySelectorAll('[data-reward-preset]').forEach(button=>button.setAttribute('aria-pressed','false'));
        updateRewardFormula();
      });
      $(id).addEventListener('change',()=>resetLearning('報酬の式を変更したので、新しいQテーブルで実験を始めました。'));
    });

    const paramBindings={alpha:['learning','alpha'],gamma:['learning','gamma'],epsilon:['learning','epsilon'],roughness:['physics','roughness']};
    Object.entries(paramBindings).forEach(([id,[group,key]])=>{
      if(!$(id))return;
      $(id).addEventListener('input',event=>{
        engine[group][key]=Number(event.target.value);
        if($(`${id}Value`))$(`${id}Value`).textContent=Number(event.target.value).toFixed(2);
        if(id==='roughness')dirty=true;
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
    window.requestAnimationFrame(animationFrame);
    window.__walkerDebug={
      get engine(){return engine;},get history(){return history;},get replays(){return replays;},get bot(){return bot;},
      train,startTest,startManual,resetLearning
    };
  }

  initialize();
})();
