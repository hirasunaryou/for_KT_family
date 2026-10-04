(function(){
  'use strict';

  const E=window.WalkerEngine;
  const $=id=>document.getElementById(id);
  if(!E||!$('learnLab'))return;

  const ACTION_IDS={
    short:'left-short-arms-center',
    long:'left-long-arms-center',
    brace:'brace-arms-center'
  };
  const ACTION_LABELS={
    [ACTION_IDS.short]:'左足・小さく',
    [ACTION_IDS.long]:'左足・大きく',
    [ACTION_IDS.brace]:'一拍待つ'
  };
  const ACTION_ORDER=[ACTION_IDS.short,ACTION_IDS.long,ACTION_IDS.brace];
  const actionIndex=id=>E.ACTIONS.findIndex(action=>action.id===id);
  const createExplanationEngine=()=>E.createEngine({
    seed:401,
    physics:{roughness:0,maxSteps:40,targetDistance:30}
  });

  function makeTrial(actionId){
    const engine=createExplanationEngine();
    const bot=E.createBot({seed:402},false);
    const state=E.stateIndex(bot);
    const action=actionIndex(actionId);
    const result=E.step(engine,bot,action,{seed:403});
    const nextState=result.done?0:E.stateIndex(bot);
    const update=E.updateQ(engine,state,action,result.reward,nextState,result.done);
    return {actionId,action,state,nextState,result,update,bot:E.snapshot(bot,action)};
  }

  const trials={
    [ACTION_IDS.short]:makeTrial(ACTION_IDS.short),
    [ACTION_IDS.long]:makeTrial(ACTION_IDS.long),
    [ACTION_IDS.brace]:makeTrial(ACTION_IDS.brace)
  };
  const experience=trials[ACTION_IDS.short];
  const startState=experience.state;
  const startParts=E.decodeState(startState);

  const frames=[
    {
      question:'人には予想がある。未経験のAIは？',
      title:'同じ場面から比べる',
      text:'AIが見ているのは棒人間の絵そのものではなく、傾き・回転・速さ・足の段階・腕の動き・坂を区切った6つの情報です。',
      look:'人の予想と、AIの未経験Q=0.00を分ける',
      changed:'行動だけ。開始状態と採点ルールは同じ',
      takeaway:'AIは「いまの状態」に対して、次の「行動」を選ぶ。',
      caution:'Q=0は「普通」ではなく、まだ試していない0かもしれません。'
    },
    {
      question:'正解を言わずに、どう良し悪しを伝える？',
      title:'結果を、報酬という点数へ',
      text:'一手のあとに、前進・直立・使った力・転倒という四つの数字を足します。AIへ返すのは「左足が正解」ではなく、結果の点数だけです。',
      look:'同じ開始場面でも、動きによって報酬の内訳が変わる',
      changed:'棒人間の結果を、人が決めた採点ルールで数にする',
      takeaway:'報酬は気持ちでも正解ラベルでもなく、結果につける採点。',
      caution:'報酬を変えると「何をよいとするか」も変わります。攻略法を探すのはAI、目標を決めるのは人です。'
    },
    {
      question:'1回うまくいったら、急に確信する？',
      title:'選んだ1マスだけ、少し直す',
      text:'小さな一歩で得た経験を、その状態×行動のQ値へ入れます。ほかの動きのマスは変わりません。',
      look:'0.000から今回の目標まで、一気に飛ばないところ',
      changed:'小さな一歩のQ値、ただ1マス',
      takeaway:'1回の経験を全部は信じず、Qの予想を目標へ少しだけ近づける。',
      caution:'Q値は成功確率でも、直前にもらった報酬そのものでもありません。「この先も含む期待点」の予想です。'
    },
    {
      question:'一度の成功だけで「歩ける」と言える？',
      title:'経験を重ねて、好みが育つ',
      text:'同じ経験でもう一度更新すると、Q値は少しずつ目標へ近づきます。一回のまぐれと、繰り返して残る傾向を分けます。',
      look:'回数を増やすほど、Q値の伸び幅が小さくなるところ',
      changed:'同じ状態×行動を経験した回数と、そのQ値',
      takeaway:'学習回数は魔法ではない。経験を重ね、予想メモを少しずつ直した回数。',
      caution:'ここでは同じ1手だけを反復します。本編の「50回」は、転ぶ・完走・時間切れまでを50チャレンジです。'
    },
    {
      question:'よい動きを知ったのに、なぜ変な失敗をする？',
      title:'探索で、あえて別案を調べる',
      text:'学習中は、高いQを使う「活用」と、別の動きを試す「探索」を混ぜます。知らない案を試さなければ、もっとよい方法を見落とすかもしれません。',
      look:'選んだ理由が「高いQ」か「調べるため」か',
      changed:'探索した大股のQ値。よい小さな一歩のQは消えない',
      takeaway:'探索中の失敗は、AIが学びを忘れたのではなく、情報を集めた一回かもしれない。',
      caution:'実力テストは探索なし・Q更新なし。練習中の珍妙さと、いまの実力を分けて見ます。'
    },
    {
      question:'まっすぐで覚えたら、傾いた場面も得意？',
      title:'状態が変わると、別のメモ',
      text:'Qテーブルは、状態ごとに別の行を持ちます。まっすぐな場面で得た好みは、右へ傾いた未経験の行を自動では埋めません。',
      look:'経験済みの行と、未経験で0.000の別の行',
      changed:'傾きの区分。するとAIが参照するQの行も変わる',
      takeaway:'別の状態は、別のQメモ。場面ごとの小さな好みの集まりが「方策」になる。',
      caution:'この表形式のQ学習は、似た場面へ自動で知識を広げるとは限りません。だから多様な場面の経験が必要です。'
    }
  ];

  const stateLabels=[
    ['大きく左','左','少し左','まっすぐ','少し右','右','大きく右'],
    ['強く左回り','左回り','静か','右回り','強く右回り'],
    ['ほぼ停止','ゆっくり','中くらい','速い'],
    ['左・準備OK','左・準備中','右・準備OK','右・準備中'],
    ['左へ動く','静か','右へ動く'],
    ['下り側','ほぼ平ら','上り側']
  ];

  let step=0;
  let maxUnlocked=0;
  let selectedAction=null;
  let selectedRewardAction=ACTION_IDS.short;
  let qEngine=createExplanationEngine();
  let experienceCount=0;
  let explored=false;
  let unknownTried=false;
  let lastShortUpdate=null;
  let explorationUpdate=null;

  const lab=$('learnLab');
  const sceneCard=lab.querySelector('.learn-scene-card');
  const actionButtons=Array.from(document.querySelectorAll('[data-learn-action]'));
  const panels=Array.from(document.querySelectorAll('[data-learn-panel]'));
  const qCells=Array.from(document.querySelectorAll('[data-q-cell]'));

  function signed(value,digits){
    const number=Math.abs(value)<Math.pow(10,-digits)/2?0:value;
    if(number>0)return `+${number.toFixed(digits)}`;
    if(number<0)return `−${Math.abs(number).toFixed(digits)}`;
    return number.toFixed(digits);
  }

  function outcomeLabel(trial){
    if(trial.result.stumbled)return trial.result.stumbleReason==='long-rest'?'停止中の大股でつまずく':'つまずく';
    if(trial.result.dx>0)return `${trial.result.dx.toFixed(3)} m 前へ`;
    return '転ばないが、前進0 m';
  }

  function setStateChips(parts){
    const keys=['lean','spin','speed','gait','arm','slope'];
    keys.forEach((key,index)=>{
      const element=document.querySelector(`[data-state-part="${key}"]`);
      if(element)element.textContent=stateLabels[index][parts[index]];
    });
  }

  function createResultCards(){
    const container=$('learnResultCards');
    ACTION_ORDER.forEach(actionId=>{
      const trial=trials[actionId];
      const button=document.createElement('button');
      button.type='button';
      button.dataset.rewardAction=actionId;
      button.setAttribute('aria-pressed',actionId===selectedRewardAction?'true':'false');
      button.innerHTML=`<b>${ACTION_LABELS[actionId]}</b><span>${signed(trial.result.reward,3)}</span><small>${outcomeLabel(trial)}</small>`;
      button.addEventListener('click',()=>{
        selectedRewardAction=actionId;
        renderReward();
        renderScene();
        announce(`${ACTION_LABELS[actionId]}の結果。報酬 ${signed(trial.result.reward,3)}。${outcomeLabel(trial)}。`);
      });
      container.appendChild(button);
    });
  }

  function createDots(){
    const container=$('learnStepDots');
    frames.forEach((frame,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.dataset.learnStep=String(index);
      button.setAttribute('aria-label',`${index+1}コマ目：${frame.title}`);
      button.setAttribute('aria-pressed',index===0?'true':'false');
      button.textContent=String(index+1);
      button.addEventListener('click',()=>setStep(index,true));
      container.appendChild(button);
    });
  }

  function qValues(){
    return E.qValues(qEngine,startState);
  }

  function qFor(actionId){
    return qEngine.q[startState*E.ACTION_COUNT+actionIndex(actionId)];
  }

  function applyTransition(actionId){
    const trial=trials[actionId];
    return E.updateQ(qEngine,trial.state,trial.action,trial.result.reward,trial.nextState,trial.result.done);
  }

  function ensureFirstExperience(){
    if(experienceCount>0)return lastShortUpdate;
    lastShortUpdate=applyTransition(ACTION_IDS.short);
    experienceCount=1;
    return lastShortUpdate;
  }

  function renderReward(){
    const trial=trials[selectedRewardAction];
    document.querySelectorAll('[data-reward-action]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.rewardAction===selectedRewardAction?'true':'false'));
    $('learnRewardTotal').textContent=signed(trial.result.reward,3);
    $('learnRewardOutcome').textContent=outcomeLabel(trial);
    $('learnRewardForward').textContent=signed(trial.result.components.forward,3);
    $('learnRewardBalance').textContent=signed(trial.result.components.balance,3);
    $('learnRewardEnergy').textContent=signed(trial.result.components.energy,3);
    $('learnRewardFall').textContent=signed(trial.result.components.fall,3);
    $('learnRewardWhy').textContent=trial.result.stumbled
      ?'前へ進めず、使った力のマイナスが残りました。失敗にも「この動きは得ではなさそう」という情報があります。'
      :trial.result.dx>0
        ?'前へ進んだプラスと直立のプラスから、使った力を引きます。「左足が正解」と直接は伝えていません。'
        :'直立の小さなプラスはありますが、前進は0。採点しだいでは「動かない」が好まれることもあります。';
  }

  function renderQ(){
    qCells.forEach(cell=>{
      const actionId=cell.dataset.qCell;
      const value=qFor(actionId);
      const learned=actionId===ACTION_IDS.short?experienceCount>0:actionId===ACTION_IDS.long?explored:false;
      cell.querySelector('[data-q-value]').textContent=signed(value,3);
      cell.querySelector('[data-q-status]').textContent=learned?'経験あり':'未経験';
      cell.classList.toggle('is-updated',(step===2&&actionId===ACTION_IDS.short&&experienceCount>0)||(step===4&&actionId===ACTION_IDS.long&&explored));
    });
    $('learnKnownQ').textContent=signed(qFor(ACTION_IDS.short),3);
    $('learnKnownLongQ').textContent=signed(qFor(ACTION_IDS.long),3);
    const values=ACTION_ORDER.map(qFor);
    $('learnBubbleQ').textContent=values.map(value=>signed(value,2)).join('　');
    $('learnBubbleNote').textContent=experienceCount===0&&!explored?'どれも未経験で同点':'経験により好みが分かれてきた';
  }

  function renderUpdate(){
    const update=lastShortUpdate;
    if(!update){
      $('learnOldQ').textContent='0.000';
      $('learnTargetQ').textContent='—';
      $('learnNewQ').textContent='—';
      $('learnNumberFormula').textContent='ボタンを押すと実数が入ります';
      return;
    }
    $('learnOldQ').textContent=signed(update.old,3);
    $('learnTargetQ').textContent=signed(update.target,3);
    $('learnNewQ').textContent=signed(update.value,3);
    $('learnNumberFormula').textContent=`${update.old.toFixed(3)} + ${update.alpha.toFixed(3)} × (${update.reward.toFixed(3)} + ${qEngine.learning.gamma.toFixed(2)} × ${update.future.toFixed(3)} − ${update.old.toFixed(3)}) = ${update.value.toFixed(3)}`;
  }

  function renderExperience(){
    $('learnExperienceButton').disabled=experienceCount>0;
    $('learnExperienceButton').textContent=experienceCount>0?'1マスだけ更新しました':'小さな一歩の経験を覚える';
  }

  function renderRepeat(){
    $('learnRepeatCount').textContent=`${experienceCount}回`;
    const target=Math.max(.001,Math.abs(experience.update.target));
    const current=Math.max(0,qFor(ACTION_IDS.short));
    const percent=Math.min(100,current/target*100);
    $('learnQMeterFill').style.width=`${percent}%`;
    $('learnQMeterPoint').textContent=`Q ${signed(current,3)}`;
    $('learnQMeterGoal').textContent=`目標 ${signed(experience.update.target,2)}`;
    $('learnPolicyReadout').textContent=experienceCount===0?'まだ比較できません':`この場面では「小さな一歩」を好む予想へ`;
  }

  function renderExplore(){
    $('learnExploreResult').hidden=!explored;
    $('learnExploreButton').disabled=explored;
    $('learnExploreButton').textContent=explored?'探索の経験をQへ残しました':'探索で「停止中の大股」を試す';
    if(explored){
      $('learnExploreNew').textContent=signed(qFor(ACTION_IDS.long),3);
    }
  }

  function renderUnknown(){
    $('learnUnknownButton').disabled=unknownTried;
    $('learnUnknownButton').textContent=unknownTried?'未知の場面で一度選びました':'未知の場面でAIに選ばせる';
    $('learnFinalInsight').hidden=!unknownTried;
  }

  function canAdvance(){
    if(step===0)return Boolean(selectedAction);
    if(step===2)return experienceCount>0;
    if(step===4)return explored;
    return true;
  }

  function renderControls(){
    $('learnPrev').disabled=step===0;
    const atEnd=step===frames.length-1;
    $('learnNext').disabled=atEnd||!canAdvance();
    $('learnNext').textContent=atEnd
      ?unknownTried?'6コマ完了':'最後の実験をすると完了'
      :step===0&&!selectedAction?'予想を選ぶと次へ'
        :step===2&&experienceCount===0?'Qを更新すると次へ'
          :step===4&&!explored?'探索すると次へ':'次の気づき →';
    $('learnReset').disabled=step===0&&!selectedAction&&experienceCount===0&&!explored&&!unknownTried;
    document.querySelectorAll('#learnStepDots [data-learn-step]').forEach(button=>{
      const index=Number(button.dataset.learnStep);
      button.setAttribute('aria-pressed',index===step?'true':'false');
      button.disabled=index>maxUnlocked;
    });
  }

  function renderScene(){
    const figure=$('learnFigure');
    const ghost=$('learnGhostFigure');
    const motion=$('learnMotionArrow');
    const stumble=$('learnStumbleMark');
    const sweep=$('learnResetSweep');
    let mode='ready';
    if(step===1)mode=selectedRewardAction===ACTION_IDS.short?'success':selectedRewardAction===ACTION_IDS.long?'stumble':'wait';
    if(step===2||step===3)mode=experienceCount>0?'success':'ready';
    if(step===4)mode=explored?'stumble':'ready';
    if(step===5)mode='unknown';
    ghost.hidden=mode!=='success';
    motion.hidden=mode!=='success';
    stumble.hidden=mode!=='stumble';
    sweep.hidden=!(step===0||step===1);
    figure.setAttribute('transform',mode==='success'?'translate(274 278)':mode==='stumble'?'translate(250 278) rotate(12)':mode==='unknown'?'translate(238 278) rotate(10)':'translate(238 278)');
    $('learnLeftLeg').setAttribute('points',mode==='success'?'0,-52 26,-29 54,0':mode==='stumble'?'0,-52 34,-25 68,-3':'0,-52 -17,-27 -29,0');
    $('learnRightLeg').setAttribute('points',mode==='stumble'?'0,-52 8,-24 4,0':'0,-52 18,-26 31,0');
    const descriptions={
      ready:['同じ開始姿勢へ戻した棒人間','棒人間はほぼまっすぐ立ち、左足を出せる状態です。三つのQ値はまだ同点です。'],
      success:['小さな一歩で前へ進んだ棒人間','左足の小さな一歩により、棒人間が少し右へ進みました。開始位置の薄い人影が残っています。'],
      stumble:['停止中の大股でつまずいた棒人間','停止した状態から左足を大きく出し、つまずきました。赤いばつ印が表示されています。'],
      wait:['一拍待って同じ場所にいる棒人間','踏ん張って一拍待ちました。転びませんでしたが前進距離は0です。'],
      unknown:['右へ少し傾いた未知の状態の棒人間','棒人間が右へ少し傾きました。この状態のQ値はまだすべて0です。']
    };
    $('learnSceneTitle').textContent=descriptions[mode][0];
    $('learnSceneDesc').textContent=descriptions[mode][1];
    const captions={
      ready:'人には歩き方の予想がある。でも未経験のAIは、三つともQ値0.00です。',
      success:`小さな一歩で ${experience.result.dx.toFixed(3)} m 前進。結果が報酬になり、選んだQだけを直します。`,
      stumble:'停止中の大股はつまずきました。探索した失敗も「避けたい」というQメモになります。',
      wait:'一拍待ちは転びませんが、停止中なので前進は0 mです。',
      unknown:'傾きの区分が変わると、AIは別のQ行を見ます。この行はまだ未経験です。'
    };
    $('learnSceneCaption').textContent=captions[mode];
  }

  function renderFrame(){
    const frame=frames[step];
    lab.dataset.learnStep=String(step);
    $('learnStepCount').textContent=`${step+1} / ${frames.length}`;
    $('learnFrameNumber').textContent=`FRAME ${step+1}`;
    $('learnQuestion').textContent=frame.question;
    $('learnTitle').textContent=frame.title;
    $('learnText').textContent=frame.text;
    $('learnLookFor').textContent=frame.look;
    $('learnChanged').textContent=frame.changed;
    $('learnTakeaway').textContent=frame.takeaway;
    $('learnCaution').textContent=frame.caution;
    panels.forEach(panel=>{panel.hidden=Number(panel.dataset.learnPanel)!==step;});
    setStateChips(step===5?[4,startParts[1],startParts[2],startParts[3],startParts[4],startParts[5]]:startParts);
    renderReward();
    renderQ();
    renderUpdate();
    renderExperience();
    renderRepeat();
    renderExplore();
    renderUnknown();
    renderScene();
    renderControls();
  }

  function announce(message){
    $('learnLive').textContent=message;
  }

  function rebuildLearningForFrame(target){
    qEngine=createExplanationEngine();
    experienceCount=0;
    explored=false;
    unknownTried=false;
    lastShortUpdate=null;
    explorationUpdate=null;
    if(target>=3){
      lastShortUpdate=applyTransition(ACTION_IDS.short);
      experienceCount=1;
    }
    if(target>=5){
      explorationUpdate=applyTransition(ACTION_IDS.long);
      explored=true;
    }
    $('learnExploreOld').textContent='0.000';
    $('learnExploreNew').textContent=explorationUpdate?signed(explorationUpdate.value,3):'−0.000';
    $('learnUnknownResult').textContent='未経験どうしは同点。まだ、どれを選ぶべきか分かりません。';
  }

  function setStep(next,focusScene,force){
    let bounded=Math.max(0,Math.min(frames.length-1,Number(next)||0));
    if(!force&&bounded>maxUnlocked){
      if(bounded===step+1&&canAdvance())maxUnlocked=bounded;
      else bounded=maxUnlocked;
    }
    if(force)maxUnlocked=Math.max(maxUnlocked,bounded);
    if(bounded===step&&lab.dataset.learnStep===String(step))return;
    if(bounded<step){
      maxUnlocked=bounded;
      rebuildLearningForFrame(bounded);
    }
    step=bounded;
    renderFrame();
    announce(`${step+1}コマ目。${frames[step].title}。${frames[step].takeaway}`);
    if(focusScene&&window.matchMedia&&window.matchMedia('(max-width: 900px)').matches){
      if(sceneCard&&typeof sceneCard.scrollIntoView==='function')sceneCard.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  function resetDemo(){
    step=0;
    maxUnlocked=0;
    selectedAction=null;
    selectedRewardAction=ACTION_IDS.short;
    qEngine=createExplanationEngine();
    experienceCount=0;
    explored=false;
    unknownTried=false;
    lastShortUpdate=null;
    explorationUpdate=null;
    actionButtons.forEach(button=>button.setAttribute('aria-pressed','false'));
    $('learnActionFeedback').textContent='まずは自分の予想を一つ選んでください。ここではまだ正解を表示しません。';
    $('learnExperienceButton').disabled=false;
    $('learnExperienceButton').textContent='小さな一歩の経験を覚える';
    $('learnExploreOld').textContent='0.000';
    $('learnExploreNew').textContent='−0.000';
    $('learnUnknownResult').textContent='未経験どうしは同点。まだ、どれを選ぶべきか分かりません。';
    renderFrame();
    announce('最初からやり直しました。1コマ目、同じ場面から予想します。');
  }

  actionButtons.forEach(button=>button.addEventListener('click',()=>{
    selectedAction=button.dataset.learnAction;
    selectedRewardAction=selectedAction;
    actionButtons.forEach(candidate=>candidate.setAttribute('aria-pressed',candidate===button?'true':'false'));
    $('learnActionFeedback').innerHTML=`あなたの予想：<b>${ACTION_LABELS[selectedAction]}</b>。AIはまだ三つともQ=0.00。次のコマで同じ条件の結果を比べます。`;
    renderControls();
    announce(`${ACTION_LABELS[selectedAction]}が高得点だと予想しました。AIはまだ未経験です。`);
  }));

  $('learnExperienceButton').addEventListener('click',()=>{
    lastShortUpdate=ensureFirstExperience();
    renderQ();
    renderUpdate();
    renderExperience();
    renderRepeat();
    renderScene();
    renderControls();
    announce(`小さな一歩のQ値が ${signed(lastShortUpdate.old,3)} から ${signed(lastShortUpdate.value,3)} へ変わりました。ほかの二つは変わりません。`);
  });

  $('learnRepeatButtons').addEventListener('click',event=>{
    const button=event.target.closest('[data-repeat]');
    if(!button)return;
    const count=Math.max(1,Number(button.dataset.repeat)||1);
    ensureFirstExperience();
    for(let index=0;index<count;index++)lastShortUpdate=applyTransition(ACTION_IDS.short);
    experienceCount+=count;
    renderQ();
    renderUpdate();
    renderRepeat();
    renderScene();
    renderControls();
    announce(`同じ経験を${count}回追加しました。合計${experienceCount}回、小さな一歩のQ値は ${signed(qFor(ACTION_IDS.short),3)} です。`);
  });

  $('learnExploreButton').addEventListener('click',()=>{
    ensureFirstExperience();
    const old=qFor(ACTION_IDS.long);
    explorationUpdate=applyTransition(ACTION_IDS.long);
    explored=true;
    $('learnExploreOld').textContent=signed(old,3);
    renderQ();
    renderUpdate();
    renderRepeat();
    renderExplore();
    renderScene();
    renderControls();
    announce(`探索で停止中の大股を試し、つまずきました。大股のQ値は ${signed(old,3)} から ${signed(qFor(ACTION_IDS.long),3)} へ変わりました。`);
  });

  $('learnUnknownButton').addEventListener('click',()=>{
    const unknownBot=E.createBot({seed:402},false);
    unknownBot.lean=.25;
    const unknownState=E.stateIndex(unknownBot);
    const picked=E.chooseAction(qEngine,unknownState,false,{seed:177});
    const label=E.ACTIONS[picked].label.replace('左・短','左足・小さく').replace('左・長','左足・大きく').replace('右・短','右足・小さく').replace('右・長','右足・大きく');
    unknownTried=true;
    $('learnUnknownResult').innerHTML=`未知の行は15動作とも0.000で同点。今回は <b>${label}</b> が選ばれました。これは正解を知った選択ではなく、同点候補からの一例です。`;
    renderUnknown();
    renderScene();
    renderControls();
    announce(`未知の状態では全行動が同点です。今回は${label}が選ばれました。`);
  });

  $('learnPrev').addEventListener('click',()=>setStep(step-1,true));
  $('learnNext').addEventListener('click',()=>{if(step<frames.length-1)setStep(step+1,true);});
  $('learnReset').addEventListener('click',resetDemo);

  lab.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target.closest&&event.target.closest('a,button,input,select,textarea,summary'))return;
    if(event.key==='ArrowRight'&&step<frames.length-1){event.preventDefault();setStep(step+1,true);}
    if(event.key==='ArrowLeft'&&step>0){event.preventDefault();setStep(step-1,true);}
  });
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target!==document.body&&event.target!==document.documentElement&&event.target!==document)return;
    if(event.key==='ArrowRight'&&step<frames.length-1){event.preventDefault();setStep(step+1,false);}
    if(event.key==='ArrowLeft'&&step>0){event.preventDefault();setStep(step-1,false);}
  });

  document.querySelectorAll('[data-close-learn]').forEach(link=>link.addEventListener('click',event=>{
    if(!window.opener||window.opener.closed)return;
    event.preventDefault();
    try{
      const target=new URL(link.href,window.location.href);
      if(target.hash)window.opener.location.hash=target.hash;
      window.opener.focus();
      window.close();
    }catch(error){
      window.location.href=link.href;
    }
  }));

  createResultCards();
  createDots();
  const hashSteps={state:0,reward:1,q:2};
  const initialHash=window.location.hash.slice(1);
  if(Object.prototype.hasOwnProperty.call(hashSteps,initialHash)){
    step=hashSteps[initialHash];
    maxUnlocked=step;
  }
  renderFrame();

  const debug={
    frames,
    trials,
    startState,
    startParts,
    setStep,
    reset:resetDemo
  };
  Object.defineProperties(debug,{
    step:{get:()=>step},
    selectedAction:{get:()=>selectedAction},
    experience:{get:()=>experience},
    qValues:{get:qValues},
    repeatCount:{get:()=>experienceCount},
    explored:{get:()=>explored}
  });
  window.__walkerLearnDebug=debug;
})();
