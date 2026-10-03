(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WalkerEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const LEG_COMMANDS=[
    {id:'left-short',label:'左・短',leg:-1,stride:.72},
    {id:'left-long',label:'左・長',leg:-1,stride:1.28},
    {id:'brace',label:'踏ん張る',leg:0,stride:0},
    {id:'right-short',label:'右・短',leg:1,stride:.72},
    {id:'right-long',label:'右・長',leg:1,stride:1.28}
  ];
  const ARM_COMMANDS=[
    {id:'arms-left',label:'腕←',arm:-1},
    {id:'arms-center',label:'腕・',arm:0},
    {id:'arms-right',label:'腕→',arm:1}
  ];
  const ACTIONS=[];
  LEG_COMMANDS.forEach((leg,legIndex)=>ARM_COMMANDS.forEach((arm,armIndex)=>ACTIONS.push({
    id:`${leg.id}-${arm.id}`,
    label:`${leg.label}＋${arm.label}`,
    leg:leg.leg,
    stride:leg.stride,
    arm:arm.arm,
    legIndex,
    armIndex
  })));

  const STATE_SHAPE=[7,5,4,4,3,3];
  const STATE_COUNT=STATE_SHAPE.reduce((a,b)=>a*b,1);
  const ACTION_COUNT=ACTIONS.length;
  const Q_COUNT=STATE_COUNT*ACTION_COUNT;
  const DEFAULTS={
    learning:{alpha:.28,gamma:.94,epsilon:.58},
    physics:{roughness:.16,maxSteps:280,targetDistance:20},
    reward:{forward:11,balance:.025,energy:.045,fall:18}
  };

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function merge(base,extra){return Object.assign({},base,extra||{});}
  function random(runtime){runtime.seed=(Math.imul(runtime.seed,1664525)+1013904223)>>>0;return runtime.seed/4294967296;}
  function terrainHeight(x){return Math.sin(x*.61)*.055+Math.sin(x*1.73+1.1)*.022+Math.sin(x*.17-.8)*.07;}
  function terrainSlope(x){return Math.cos(x*.61)*.03355+Math.cos(x*1.73+1.1)*.03806+Math.cos(x*.17-.8)*.0119;}
  function bin(value,thresholds){for(let i=0;i<thresholds.length;i++)if(value<thresholds[i])return i;return thresholds.length;}

  function createEngine(options){
    const opts=options||{};
    return {
      q:new Float32Array(Q_COUNT),
      visits:new Uint32Array(STATE_COUNT),
      episodes:0,
      seed:(opts.seed===undefined?0x51f15e:opts.seed)>>>0,
      learning:merge(DEFAULTS.learning,opts.learning),
      physics:merge(DEFAULTS.physics,opts.physics),
      reward:merge(DEFAULTS.reward,opts.reward),
      lastUpdate:null
    };
  }

  function resetEngine(engine,seed){
    engine.q.fill(0);engine.visits.fill(0);engine.episodes=0;engine.lastUpdate=null;
    engine.seed=(seed===undefined?0x51f15e:seed)>>>0;
  }

  function createBot(runtime,jitter){
    const r=runtime||{seed:0x51f15e};
    const wobble=jitter===false?0:(random(r)-.5)*.12;
    return {
      x:0,vx:0,lean:wobble,leanV:0,
      nextFoot:-1,recovery:0,arm:0,armV:0,armTarget:0,
      time:0,reward:0,alive:true,finished:false,doneReason:'',
      totalSteps:0,correctSteps:0,stumbles:0,counterArm:0,armChoices:0,
      effort:0,
      lastAction:7,stepFlash:0,
      components:{forward:0,balance:0,energy:0,fall:0}
    };
  }

  function gaitPhase(bot){
    if(bot.nextFoot<0)return bot.recovery>0?1:0;
    return bot.recovery>0?3:2;
  }

  function stateParts(bot){
    const slope=terrainSlope(bot.x);
    return [
      bin(bot.lean,[-.54,-.31,-.12,.12,.31,.54]),
      bin(bot.leanV,[-.24,-.09,.09,.24]),
      bin(bot.vx,[.022,.055,.095]),
      gaitPhase(bot),
      bin(bot.armV,[-.055,.055]),
      bin(slope,[-.035,.035])
    ];
  }

  function encodeState(parts){
    let index=0;
    for(let i=0;i<STATE_SHAPE.length;i++)index=index*STATE_SHAPE[i]+clamp(parts[i]|0,0,STATE_SHAPE[i]-1);
    return index;
  }
  function stateIndex(bot){return encodeState(stateParts(bot));}
  function decodeState(index){
    const parts=new Array(STATE_SHAPE.length);
    let value=clamp(index|0,0,STATE_COUNT-1);
    for(let i=STATE_SHAPE.length-1;i>=0;i--){parts[i]=value%STATE_SHAPE[i];value=Math.floor(value/STATE_SHAPE[i]);}
    return parts;
  }
  function qValues(engine,state){
    const start=state*ACTION_COUNT;
    return Array.from(engine.q.subarray(start,start+ACTION_COUNT));
  }

  function effectiveRate(base,episodes,floor,scale){return base*(floor+(1-floor)*Math.exp(-episodes/scale));}
  function chooseAction(engine,state,explore,runtime){
    const r=runtime||engine;
    const epsilon=effectiveRate(engine.learning.epsilon,engine.episodes,.09,1850);
    if(explore&&random(r)<epsilon)return Math.floor(random(r)*ACTION_COUNT);
    const offset=state*ACTION_COUNT;
    let best=-Infinity,choices=[];
    for(let i=0;i<ACTION_COUNT;i++){
      const value=engine.q[offset+i];
      if(value>best+1e-7){best=value;choices=[i];}
      else if(Math.abs(value-best)<=1e-7)choices.push(i);
    }
    return choices[Math.floor(random(r)*choices.length)];
  }

  function updateQ(engine,state,action,reward,nextState,done){
    const offset=state*ACTION_COUNT+action;
    let future=0;
    if(!done){
      const nextOffset=nextState*ACTION_COUNT;
      future=-Infinity;
      for(let i=0;i<ACTION_COUNT;i++)future=Math.max(future,engine.q[nextOffset+i]);
    }
    const alpha=effectiveRate(engine.learning.alpha,engine.episodes,.18,2400);
    const old=engine.q[offset];
    const target=reward+engine.learning.gamma*future;
    const td=target-old;
    engine.q[offset]=old+alpha*td;
    engine.visits[state]++;
    engine.lastUpdate={state,action,reward,nextState,done,old,target,td,value:engine.q[offset],alpha,future};
    return engine.lastUpdate;
  }

  function step(engine,bot,actionIndex,runtime){
    if(!bot.alive)return {reward:0,done:true,components:{forward:0,balance:0,energy:0,fall:0}};
    const r=runtime||engine;
    const action=ACTIONS[clamp(actionIndex|0,0,ACTION_COUNT-1)];
    const oldX=bot.x;
    const slope=terrainSlope(bot.x)*(1+engine.physics.roughness*2.2);
    const oldTarget=bot.armTarget;
    const armCommandDelta=action.arm-oldTarget;
    bot.armTarget=action.arm;
    bot.armV=bot.armV*.38+armCommandDelta*.62;
    bot.arm=clamp(bot.arm+bot.armV*.58,-1,1);
    bot.leanV+=bot.armV*.078+bot.arm*.011;
    if(action.arm!==0){
      bot.armChoices++;
      if(Math.abs(bot.lean)>.12&&Math.sign(action.arm)===-Math.sign(bot.lean))bot.counterArm++;
    }

    let effort=Math.abs(armCommandDelta)*.36+Math.abs(bot.armV)*.12;
    let stumbled=false;
    if(action.leg!==0){
      effort+=.72+action.stride*.36;
      bot.totalSteps++;
      const correct=action.leg===bot.nextFoot;
      const ready=bot.recovery<=0;
      const longRisk=action.stride>1&&(
        Math.abs(bot.lean)>.29||Math.abs(slope)>.075||bot.vx<.022
      );
      const slipChance=engine.physics.roughness*(action.stride>1?.085:.028);
      if(correct&&ready&&!longRisk&&random(r)>slipChance){
        const upright=clamp(1-Math.abs(bot.lean)/.86,.12,1);
        bot.vx+=.022+.031*action.stride*upright;
        bot.leanV+=action.leg*(.03+.047*action.stride);
        bot.nextFoot=-bot.nextFoot;
        bot.recovery=action.stride>1?3:2;
        bot.correctSteps++;
        bot.stepFlash=1;
      }else{
        stumbled=true;bot.stumbles++;bot.vx*=.58;
        // A mistimed step wastes a noticeable amount of energy.  Without this,
        // the walker can "reward hack" by kicking while it coasts forward.
        effort+=16.45+action.stride*4;
        bot.leanV+=action.leg*(.13+.065*action.stride)+(random(r)-.5)*.09;
        bot.recovery=Math.max(bot.recovery,1);bot.stepFlash=.65;
      }
    }else{
      effort+=.08;
      bot.recovery=Math.max(0,bot.recovery-1);
      bot.leanV*=.91;bot.vx*=.978;
    }

    bot.leanV+=bot.lean*.041+slope*.075+(random(r)-.5)*engine.physics.roughness*.038;
    bot.leanV*=.82;
    bot.lean+=bot.leanV*.34;
    bot.vx-=Math.max(0,slope)*.009;
    bot.vx=clamp(bot.vx*.982,0,.145);
    bot.x+=bot.vx;
    bot.time++;
    bot.stepFlash*=.78;
    bot.lastAction=actionIndex;

    const fell=Math.abs(bot.lean)>.86;
    const reached=bot.x>=engine.physics.targetDistance;
    const timedOut=bot.time>=engine.physics.maxSteps;
    if(fell||reached||timedOut){
      bot.alive=false;bot.finished=reached;
      bot.doneReason=reached?'finish':fell?'fall':'timeout';
    }

    const dx=Math.max(0,bot.x-oldX);
    const upright=clamp(1-Math.abs(bot.lean)/.86,0,1);
    const components={
      forward:dx*engine.reward.forward,
      balance:upright*engine.reward.balance,
      energy:-effort*engine.reward.energy,
      fall:fell?-engine.reward.fall:0
    };
    if(reached)components.forward+=engine.reward.forward*.7;
    const reward=components.forward+components.balance+components.energy+components.fall;
    bot.effort+=effort;
    bot.reward+=reward;
    Object.keys(components).forEach(key=>{bot.components[key]+=components[key];});
    return {reward,done:!bot.alive,components,action,slope,stumbled};
  }

  function snapshot(bot,actionIndex){
    return {
      x:bot.x,vx:bot.vx,lean:bot.lean,leanV:bot.leanV,
      nextFoot:bot.nextFoot,recovery:bot.recovery,arm:bot.arm,armV:bot.armV,
      time:bot.time,reward:bot.reward,alive:bot.alive,finished:bot.finished,
      effort:bot.effort,
      lastAction:actionIndex===undefined?bot.lastAction:actionIndex,stepFlash:bot.stepFlash,
      components:Object.assign({},bot.components)
    };
  }

  function runEpisode(engine,options){
    const opts=options||{};
    const learn=opts.learn!==false;
    const runtime=opts.seed===undefined?engine:{seed:opts.seed>>>0};
    const bot=createBot(runtime,opts.jitter!==false);
    const trace=opts.trace?[snapshot(bot)]:null;
    let guard=0;
    while(bot.alive&&guard++<engine.physics.maxSteps+2){
      const state=stateIndex(bot);
      const action=chooseAction(engine,state,learn&&!opts.greedy,runtime);
      const result=step(engine,bot,action,runtime);
      const next=result.done?0:stateIndex(bot);
      if(learn)updateQ(engine,state,action,result.reward,next,result.done);
      if(trace&&(bot.time%2===0||result.done))trace.push(snapshot(bot,action));
    }
    if(learn)engine.episodes++;
    return {
      episode:engine.episodes,
      reward:bot.reward,distance:bot.x,finished:bot.finished,reason:bot.doneReason,
      steps:bot.time,correctRatio:bot.totalSteps?bot.correctSteps/bot.totalSteps:0,
      counterArmRatio:bot.armChoices?bot.counterArm/bot.armChoices:0,
      legActions:bot.totalSteps,armChoices:bot.armChoices,
      stumbles:bot.stumbles,effort:bot.effort,
      components:Object.assign({},bot.components),trace,final:snapshot(bot)
    };
  }

  function evaluate(engine,seeds){
    const list=seeds&&seeds.length?seeds:[11,29,47,83,131];
    const results=list.map(seed=>runEpisode(engine,{learn:false,greedy:true,seed,trace:false}));
    const sorted=results.map(result=>result.distance).sort((a,b)=>a-b);
    return {
      results,
      medianDistance:sorted[Math.floor(sorted.length/2)],
      finishRate:results.filter(result=>result.finished).length/results.length,
      averageSteps:results.reduce((sum,result)=>sum+result.steps,0)/results.length,
      averageEffort:results.reduce((sum,result)=>sum+result.effort,0)/results.length
    };
  }

  return {
    LEG_COMMANDS,ARM_COMMANDS,ACTIONS,STATE_SHAPE,STATE_COUNT,ACTION_COUNT,Q_COUNT,DEFAULTS,
    createEngine,resetEngine,createBot,stateParts,stateIndex,encodeState,decodeState,qValues,
    chooseAction,updateQ,step,runEpisode,evaluate,terrainHeight,terrainSlope,snapshot,clamp
  };
});
