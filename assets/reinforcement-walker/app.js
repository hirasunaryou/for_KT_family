(function(){
  'use strict';
  const ACTIONS=['left','wait','right'];
  const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
  const chart=document.getElementById('rewardChart'),cctx=chart.getContext('2d');
  const $=id=>document.getElementById(id);
  const params={alpha:.25,gamma:.92,epsilon:.2,noise:.12};
  let q=new Map(),rewards=[],episodeCount=0,best=0,mode='manual',running=true,timer=0,last=performance.now(),bot;

  function resetBot(){bot={x:0,speed:0,lean:0,leanV:0,nextFoot:0,stepFlash:0,alive:true,time:0,reward:0,lastAction:'wait'};updateHud();}
  function stateKey(){const lean=Math.max(0,Math.min(6,Math.floor((bot.lean+1.05)/.3)));const vel=Math.max(0,Math.min(4,Math.floor((bot.leanV+1.25)/.5)));const pace=Math.max(0,Math.min(3,Math.floor(bot.speed/.45)));return `${lean}|${vel}|${pace}|${bot.nextFoot}`;}
  function values(key){if(!q.has(key))q.set(key,[0,0,0]);return q.get(key);}
  function choose(key,explore){if(explore&&Math.random()<params.epsilon)return Math.floor(Math.random()*3);const v=values(key),max=Math.max(...v),choices=v.map((x,i)=>x===max?i:-1).filter(i=>i>=0);return choices[Math.floor(Math.random()*choices.length)];}
  function physics(action){
    if(!bot.alive)return {reward:0,done:true};
    const oldX=bot.x,dir=action===0?-1:action===2?1:0;
    const correct=(action===0&&bot.nextFoot===0)||(action===2&&bot.nextFoot===1);
    if(dir){bot.leanV+=dir*.31;if(correct){bot.speed+=.22;bot.nextFoot=1-bot.nextFoot;}else{bot.leanV+=dir*.2;bot.speed*=.78;}bot.stepFlash=1;}
    bot.leanV+=bot.lean*.115+(Math.random()-.5)*params.noise;bot.leanV*=.88;bot.lean+=bot.leanV*.12;
    bot.speed=Math.max(0,Math.min(1.6,bot.speed*.985));bot.x+=bot.speed*.055;bot.time++;bot.stepFlash*=.82;bot.lastAction=ACTIONS[action];
    let reward=(bot.x-oldX)*14+.005-Math.abs(bot.lean)*.045-(action===1?.025:0);
    if(Math.abs(bot.lean)>1.02||bot.time>700){bot.alive=false;reward+=Math.abs(bot.lean)>1.02?-18:8;}
    bot.reward+=reward;updateHud();return {reward,done:!bot.alive};
  }
  function updateQ(oldKey,action,reward,newKey){const current=values(oldKey),future=newKey?Math.max(...values(newKey)):0;current[action]+=params.alpha*(reward+params.gamma*future-current[action]);}
  function trainingEpisode(){resetBot();let guard=0;while(bot.alive&&guard++<720){const old=stateKey(),action=choose(old,true),result=physics(action),next=result.done?null:stateKey();updateQ(old,action,result.reward,next);}rewards.push(bot.reward);episodeCount++;best=Math.max(best,bot.x);}
  async function train(count){running=false;mode='training';setMode();disableControls(true);$('trainingProgress').hidden=false;const chunk=count>100?20:5;for(let i=0;i<count;i++){trainingEpisode();if(i%chunk===0||i===count-1){$('trainingBar').value=Math.round((i+1)/count*100);$('trainingLabel').textContent=`学習中 ${i+1} / ${count}回`;drawChart();await new Promise(r=>setTimeout(r,0));}}$('trainingProgress').hidden=true;disableControls(false);startTest();}
  function startTest(){resetBot();mode='test';running=true;timer=0;setMode();$('coach').textContent='冒険なし。AIは今まででQ値が最も高かった行動だけを選びます。';}
  function startManual(){resetBot();mode='manual';running=true;timer=0;setMode();$('coach').textContent='A と D を交互に押してみよう。傾いた側の足を出すと立て直しやすい。';}
  function setMode(){const labels={manual:'手動チャレンジ',training:'高速で学習中',test:'AIテスト'};$('modeBadge').textContent=labels[mode];$('manualControls').hidden=mode!=='manual';}
  function manualAction(index){if(mode!=='manual')return;if(!bot.alive){startManual();return;}physics(index);flash(ACTIONS[index]);}
  function flash(name){const el=document.querySelector(`[data-action="${name}"]`);if(el){el.classList.add('pressed');setTimeout(()=>el.classList.remove('pressed'),120);}}
  function tick(now){const dt=Math.min(40,now-last);last=now;if(running&&bot.alive){if(mode==='test'){timer+=dt;if(timer>115){timer=0;physics(choose(stateKey(),false));}}else if(mode==='manual'){bot.leanV+=bot.lean*.003+(Math.random()-.5)*params.noise*.012;bot.leanV*=.997;bot.lean+=bot.leanV*.012;if(Math.abs(bot.lean)>1.02){bot.alive=false;$('coach').textContent='転んだ！ 傾いた方向と、最後に出した足を見てもう一度。';}}}drawWorld();drawQ();requestAnimationFrame(tick);}
  function updateHud(){$('distance').textContent=`${bot.x.toFixed(1)} m`;$('episodeReward').textContent=bot.reward.toFixed(1);$('episode').textContent=episodeCount;$('bestDistance').textContent=`${best.toFixed(1)} m`;}
  function drawWorld(){
    const w=canvas.width,h=canvas.height,ground=342,scroll=Math.max(0,bot.x*90-210);const sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,'#bfe3e8');sky.addColorStop(1,'#eaf4ed');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,.72)';for(let i=0;i<5;i++){let x=((i*260-scroll*.16)%1200+1200)%1200-80;ctx.beginPath();ctx.ellipse(x,80+(i%2)*55,80,20,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#96b890';ctx.beginPath();ctx.moveTo(0,ground);for(let x=0;x<=w;x+=90){const world=x+scroll*.32;ctx.lineTo(x,ground-42-Math.sin(world*.008)*34);}ctx.lineTo(w,ground);ctx.fill();ctx.fillStyle='#4f6d56';ctx.fillRect(0,ground,w,h-ground);ctx.strokeStyle='#f2d475';ctx.lineWidth=4;ctx.setLineDash([25,18]);ctx.beginPath();ctx.moveTo(0,ground+44);ctx.lineTo(w,ground+44);ctx.stroke();ctx.setLineDash([]);
    for(let m=0;m<80;m+=5){const x=115+m*90-scroll;if(x>-80&&x<w+80){ctx.fillStyle='#274539';ctx.fillRect(x,ground-18,3,18);ctx.fillStyle='#fff';ctx.font='14px sans-serif';ctx.fillText(`${m} m`,x+7,ground-5);}}
    const px=Math.min(360,130+bot.x*90),py=ground-53;ctx.save();ctx.translate(px,py);ctx.rotate(bot.alive?bot.lean:Math.sign(bot.lean||1)*1.18);const stride=bot.stepFlash*22;ctx.strokeStyle='#173246';ctx.lineWidth=13;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-9,4);ctx.lineTo(-20-stride*(bot.lastAction==='left'),47);ctx.stroke();ctx.beginPath();ctx.moveTo(9,4);ctx.lineTo(20+stride*(bot.lastAction==='right'),47);ctx.stroke();ctx.fillStyle='#2a6f9e';ctx.beginPath();ctx.roundRect(-27,-70,54,82,18);ctx.fill();ctx.fillStyle='#f2c14e';ctx.beginPath();ctx.arc(0,-91,48,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#173246';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#173246';ctx.beginPath();ctx.arc(-16,-99,5,0,Math.PI*2);ctx.arc(16,-99,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#173246';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-80,16,.15*Math.PI,.85*Math.PI);ctx.stroke();ctx.restore();
    if(!bot.alive){ctx.fillStyle='rgba(20,40,60,.88)';ctx.fillRect(w/2-150,28,300,56);ctx.fillStyle='white';ctx.textAlign='center';ctx.font='700 23px sans-serif';ctx.fillText('ころんだ！',w/2,63);ctx.textAlign='start';}
  }
  function drawQ(){const v=values(stateKey()),maxAbs=Math.max(1,...v.map(Math.abs));ACTIONS.forEach((name,i)=>{const bar=document.querySelector(`[data-qbar="${name}"]`),val=document.querySelector(`[data-qvalue="${name}"]`),pct=Math.abs(v[i])/maxAbs*48;bar.style.width=`${pct}%`;bar.style.left=v[i]>=0?'50%':`${50-pct}%`;bar.style.background=v[i]>=0?'#59c6d2':'#df654b';val.textContent=v[i].toFixed(2);});const lean=bot.lean<-.22?'左へ傾く':bot.lean>.22?'右へ傾く':'ほぼ直立';$('stateLabel').textContent=`${lean} · ${bot.nextFoot?'右':'左'}足の番`;const spread=Math.max(...v)-Math.min(...v);$('qNote').textContent=spread<.02?'この状態の経験がまだ少なく、予想に差がありません。':`この状態では「${['左足','こらえる','右足'][v.indexOf(Math.max(...v))]}」の予想点が最高です。`;}
  function drawChart(){const w=chart.width,h=chart.height;cctx.clearRect(0,0,w,h);cctx.fillStyle='#f7faf9';cctx.fillRect(0,0,w,h);cctx.strokeStyle='#d9e4e1';for(let i=0;i<5;i++){const y=24+i*(h-52)/4;cctx.beginPath();cctx.moveTo(42,y);cctx.lineTo(w-16,y);cctx.stroke();}if(!rewards.length){cctx.fillStyle='#6b7b78';cctx.font='16px sans-serif';cctx.textAlign='center';cctx.fillText('学習すると、ここに報酬の変化が出ます',w/2,h/2);cctx.textAlign='start';return;}const shown=rewards.slice(-300),min=Math.min(-20,...shown),max=Math.max(10,...shown),range=max-min||1;cctx.strokeStyle='#2a6f9e';cctx.lineWidth=3;cctx.beginPath();shown.forEach((r,i)=>{const x=42+i/Math.max(1,shown.length-1)*(w-60),y=24+(max-r)/range*(h-52);i?cctx.lineTo(x,y):cctx.moveTo(x,y);});cctx.stroke();cctx.fillStyle='#536a66';cctx.font='13px sans-serif';cctx.fillText(max.toFixed(0),8,29);cctx.fillText(min.toFixed(0),8,h-23);cctx.fillText(`${Math.max(1,episodeCount-shown.length+1)}回`,42,h-7);cctx.textAlign='right';cctx.fillText(`${episodeCount}回`,w-16,h-7);cctx.textAlign='start';const recent=rewards.slice(-Math.min(20,rewards.length)),avg=recent.reduce((a,b)=>a+b,0)/recent.length;$('chartSummary').textContent=`直近平均 ${avg.toFixed(1)}`;}
  function disableControls(on){document.querySelectorAll('button').forEach(b=>b.disabled=on);}
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>manualAction(ACTIONS.indexOf(b.dataset.action))));document.querySelectorAll('[data-train]').forEach(b=>b.addEventListener('click',()=>train(Number(b.dataset.train))));$('manualStart').addEventListener('click',startManual);$('testAi').addEventListener('click',startTest);$('resetLearning').addEventListener('click',()=>{q=new Map();rewards=[];episodeCount=0;best=0;drawChart();startManual();});document.addEventListener('keydown',e=>{if(e.repeat)return;const idx={a:0,s:1,d:2}[e.key.toLowerCase()];if(idx!==undefined){e.preventDefault();manualAction(idx);}});['alpha','gamma','epsilon','noise'].forEach(id=>$(id).addEventListener('input',e=>{params[id]=Number(e.target.value);$(`${id}Value`).textContent=Number(e.target.value).toFixed(2);}));
  resetBot();drawChart();setMode();requestAnimationFrame(tick);
})();
