(function(){
  'use strict';

  const E=window.WalkerEngine;
  const $=id=>document.getElementById(id);
  const fixed=(value,digits=3)=>Number.isFinite(value)?value.toFixed(digits):(0).toFixed(digits);

  function actionIndex(id){return E?E.ACTIONS.findIndex(action=>action.id===id):-1;}

  function sampleMotion(){
    if(!E)return {step:{pushAdded:.044,speedBefore:0,speedAfter:.043,dx:.04},brace1:{pushAdded:0,speedBefore:.043,speedAfter:.040,dx:.04},brace2:{pushAdded:0,speedBefore:.040,speedAfter:.037,dx:.04},right:{pushAdded:.044,speedBefore:.037,speedAfter:.079,dx:.08}};
    const engine=E.createEngine({seed:401,physics:{roughness:0,maxSteps:40,targetDistance:30}});
    const bot=E.createBot({seed:402},false);
    const runtime={seed:403};
    const step=E.step(engine,bot,actionIndex('left-short-arms-center'),runtime).motion;
    const brace1=E.step(engine,bot,actionIndex('brace-arms-center'),runtime).motion;
    const brace2=E.step(engine,bot,actionIndex('brace-arms-center'),runtime).motion;
    const right=E.step(engine,bot,actionIndex('right-short-arms-center'),runtime).motion;
    return {step,brace1,brace2,right};
  }

  const motion=sampleMotion();
  const poses={
    stand:{x:330,lean:0,left:'0,-62 -14,-30 -21,0',right:'0,-62 15,-30 22,0',leftArm:'0,-108 -22,-84 -36,-59',rightArm:'0,-108 22,-84 36,-59',active:'none'},
    reach:{x:330,lean:0,left:'0,-62 24,-32 58,0',right:'0,-62 -10,-30 -20,0',leftArm:'0,-108 -24,-82 -39,-55',rightArm:'0,-108 24,-87 38,-65',active:'left'},
    push:{x:330,lean:0,left:'0,-62 24,-32 58,0',right:'0,-62 -12,-30 -24,0',leftArm:'0,-108 -24,-82 -39,-55',rightArm:'0,-108 24,-87 38,-65',active:'left'},
    coast:{x:354,lean:0,left:'0,-62 19,-31 38,0',right:'0,-62 -13,-30 -25,0',leftArm:'0,-108 -21,-84 -34,-61',rightArm:'0,-108 21,-84 34,-61',active:'none'},
    rightStep:{x:370,lean:-1,left:'0,-62 -12,-30 -25,0',right:'0,-62 25,-32 58,0',leftArm:'0,-108 -25,-87 -40,-65',rightArm:'0,-108 25,-82 40,-55',active:'right'},
    leanRight:{x:330,lean:13,left:'0,-62 -15,-30 -23,0',right:'0,-62 15,-30 23,0',leftArm:'0,-108 -22,-84 -36,-59',rightArm:'0,-108 22,-84 36,-59',active:'none'},
    armsLeft:{x:330,lean:10,left:'0,-62 -15,-30 -23,0',right:'0,-62 15,-30 23,0',leftArm:'0,-108 -40,-90 -67,-75',rightArm:'0,-108 5,-78 -18,-55',active:'none'},
    armsRight:{x:330,lean:17,left:'0,-62 -15,-30 -23,0',right:'0,-62 15,-30 23,0',leftArm:'0,-108 -5,-78 18,-55',rightArm:'0,-108 40,-90 67,-75',active:'none'},
    long:{x:330,lean:0,left:'0,-62 38,-31 88,0',right:'0,-62 -10,-30 -22,0',leftArm:'0,-108 -30,-82 -49,-53',rightArm:'0,-108 29,-88 48,-68',active:'left'},
    fail:{x:330,lean:23,left:'0,-62 39,-27 92,0',right:'0,-62 -7,-28 -16,0',leftArm:'0,-108 -34,-75 -54,-45',rightArm:'0,-108 36,-92 57,-78',active:'left'},
    failRight:{x:330,lean:23,left:'0,-62 -7,-28 -16,0',right:'0,-62 39,-27 92,0',leftArm:'0,-108 -36,-92 -57,-78',rightArm:'0,-108 34,-75 54,-45',active:'right'}
  };

  const topics={
    push:{
      kicker:'まず見る',title:'一歩で、なぜ右へ進む？',lead:'1回の「一歩」を説明のため6コマに分け、足裏と地面の力を追います。',
      frames:[
        {pose:'stand',question:'この図では、どちらが「前」？',title:'まず、向きをそろえる',text:'右が「前」、左が「後ろ」です。左足・右足という名前と、画面の左右を分けて考えます。',look:'地面と、画面右上の「前」の矢印',metric:'前向き速度 0.000',takeaway:'まだ止まっている。まず方向の約束を確認する。',caution:'このページでは「前＝画面右」に固定して説明します。',caption:'向きをそろえ、次のコマで足裏に注目します。',scene:'止まっている棒人間。画面右が前、左が後ろ。',layers:[]},
        {pose:'reach',question:'足を前へ出し、地面に触れただけで進む？',title:'足を出して、接地する',text:'左足が地面に触れました。このコマでは、まだ前向きの速度を足していません。',look:'色のついた左足と「接地点」',metric:'今回増えた速度 +0.000',takeaway:'接地は、地面を押すための準備。置くだけとは分けて見る。',caution:'ゲームの1クリックは、この接地と次の「押す」をまとめています。',caption:'接地点だけを新しく表示。体の位置はまだ同じです。',scene:'左足を前へ出して接地した棒人間。接地点が強調されている。',layers:['contact']},
        {pose:'push',question:'足は、地面をどちらへ押す？',title:'地面を後ろへ押す',text:'足裏が、進む向きと反対の「後ろ（画面左）」へ地面を押した扱いです。',look:'足裏から左へ向かう橙色の矢印',metric:`今回増える前向き速度 +${fixed(motion.step.pushAdded)}`,takeaway:'前へ進むため、足は地面を後ろへ押す。',caution:'「左へ」は左足の意味ではありません。後ろ＝画面左という力の向きです。',caption:'足から地面へ、後ろ向きの力を表示しています。',scene:'左足の接地点から後ろへ、足が地面を押す矢印が出ている。',layers:['contact','push']},
        {pose:'push',question:'体を前へ押す力は、どこから来る？',title:'地面が足を前へ押し返す',text:'足が地面を後ろへ押すのと同時に、摩擦（足が滑るのを止める力）で地面が足を前へ押し、その力が脚から体へ伝わります。',look:'接地点の右向き青矢印と、脚の点線',metric:`押した結果 +${fixed(motion.step.pushAdded)}`,takeaway:'地面から足が受ける前向きの力が、体へ伝わる。',caution:'橙と青の力は順番に発生するのではなく、理解のため一コマずつ表示しています。',caption:'青い横矢印は足が受ける力、点線は脚から体への伝わり方です。',scene:'足が地面を後ろへ押す矢印、地面が足を前へ押す矢印、脚から体への点線。',layers:['contact','push','reaction']},
        {pose:'push',question:'押し返されたあと、何が変わる？',title:'前向き速度が増える',text:'ゲームは「1コマで前へ進む量」に近い前向き速度を持ちます。同じ操作の中で抵抗と坂の減速も働くため、足で増やした量と操作後の速度は少し違います。',look:'体の上に現れた緑の矢印',metric:`${fixed(motion.step.speedBefore)} + ${fixed(motion.step.pushAdded)} − ${fixed(Math.max(0,motion.step.speedBefore+motion.step.pushAdded-motion.step.speedAfter))} ≈ ${fixed(motion.step.speedAfter)}`,takeaway:'押して速度を足し、抵抗と坂の分を引いた速度で進む。',caution:'画面の「勢い」は日常語です。質量を掛ける物理学の運動量そのものではありません。',caption:'操作後の前向き速度を、体の上の緑矢印で示します。',scene:'棒人間の上に操作後の前向き速度を示す右向きの矢印がある。',speed:motion.step.speedAfter,layers:['contact','push','reaction','speed']},
        {pose:'coast',question:'足で押し終わった直後も、体は進む？',title:'得た速度で、少し前へ移る',text:`抵抗と坂の影響を受けた後も前向き速度が残るため、体は右へ約 ${fixed(motion.step.dx,2)} m移ります。その後も各操作で少しずつ遅くなります。`,look:'薄い前の位置と、右へ移った現在の体',metric:`この操作で +${fixed(motion.step.dx,2)} m`,takeaway:'一歩＝足を出す＋接地＋地面を後ろへ押す。',caution:'本物の歩行には上下の力や関節の動きもあります。ここでは前後と回転へ絞っています。',caption:'薄い姿勢が前の位置。現在の体は少し右へ移りました。',scene:'薄い以前の姿勢より、棒人間が右へ移動している。前向き速度の矢印が残る。',speed:motion.step.speedAfter,layers:['ghost','speed']}
      ]
    },
    brace:{
      kicker:'歩き続ける',title:'「踏ん張る」は、なぜ少し進む？',lead:'新しい推進ではなく、前の一歩で得た速度と、次の足の準備を分けて見ます。',
      frames:[
        {pose:'push',question:'一歩の直後、すぐ反対の足を出せる？',title:'速度はあるが、足は準備中',text:'左足の小さな一歩に成功。前向き速度はありますが、次の右足を出すには準備が2段階残っています。',look:'速度の矢印と「準備 あと2」',metric:`速度 ${fixed(motion.step.speedAfter)} ／ 準備 2`,takeaway:'進める速度と、足を出せる準備は別の状態。',caution:'すぐ右足を出すと、このゲームでは「準備不足」でつまずきます。',caption:'左足の一歩直後。速度はあるが右足はまだ準備中です。',speed:motion.step.speedAfter,recovery:2,layers:['speed','recovery']},
        {pose:'coast',question:'踏ん張ると、もう一度前へ押す？',title:'1回目：新しい推進は0',text:'踏ん張りでは地面を後ろへ押す力を足しません。前の一歩の速度で惰性移動します。',look:'押す矢印がなく、速度の矢印だけが残る',metric:`足した速度 +0.000 ／ ${fixed(motion.brace1.speedBefore)} → ${fixed(motion.brace1.speedAfter)}`,takeaway:'踏ん張りが加速させるのではない。残った速度で進む。',caution:'抵抗があるため、前向き速度は少し減ります。',caption:'足から地面への推進矢印はなく、残った速度だけを表示しています。',scene:'棒人間が惰性で右へ進む。新しい推進矢印はない。',speed:motion.brace1.speedAfter,recovery:1,layers:['ghost','speed','recovery']},
        {pose:'coast',question:'1回待つと、何の準備が進む？',title:'次の足の準備が 2 → 1',text:`惰性で約 ${fixed(motion.brace1.dx,2)} m進む間に、準備を1段階だけ進めます。`,look:'図の準備丸と、体の移動',metric:`準備 2 → 1 ／ +${fixed(motion.brace1.dx,2)} m`,takeaway:'踏ん張る＝惰性で進む＋一拍待つ。',caution:'踏ん張りには回転を弱める成分もありますが、傾き・坂・腕の効果しだいでは、操作後の回転が強まることもあります。',caption:'一拍待つ間に、準備丸が一つ埋まります。',scene:'惰性で少し移動する棒人間。次の足の準備が2から1になる。',speed:motion.brace1.speedAfter,recovery:1,layers:['ghost','speed','recovery']},
        {pose:'coast',question:'もう1回待つと、次の足を出せる？',title:'2回目：準備が 1 → 0',text:'短い一歩のあとに2回待つと準備OK。速度はさらに少し減っています。',look:'二つとも埋まった準備丸と、短くなった速度矢印',metric:`速度 ${fixed(motion.brace2.speedBefore)} → ${fixed(motion.brace2.speedAfter)} ／ 準備OK`,takeaway:'短い一歩の後は、二拍待って反対の足へ。',caution:'大股の後は3回待つ、というゲーム内の約束です。',caption:'2回目の待ち拍で、二つの準備丸が埋まります。',scene:'惰性で進みながら右足の準備が完了した棒人間。',speed:motion.brace2.speedAfter,recovery:0,layers:['speed','recovery']},
        {pose:'rightStep',question:'準備OKなら、どちらの足を出す？',title:'反対の右足で、次の一歩',text:'左足の次は右足。右足も、体を画面右へ進ませます。',look:'色のついた右足。右足の名前と進行方向を分ける',metric:`新しく足す速度 +${fixed(motion.right.pushAdded)}`,takeaway:'左・短 → 待つ → 待つ → 右・短が最小の歩行周期。',caution:'右足ボタンは「右へ進む」の意味ではなく、右足を使うという意味です。',caption:'準備後は反対の右足を出します。',scene:'右足を前へ出した棒人間。右足が強調されている。',recovery:0,layers:['contact','push','reaction','recovery']},
        {pose:'stand',question:'止まったまま、踏ん張るだけなら進む？',title:'前の速度がなければ、進まない',text:'踏ん張りは新しい速度を足さないため、最初から繰り返しても前進できません。',look:'速度矢印も推進矢印もない状態',metric:'足した速度 +0.000 ／ 移動 +0.00 m',takeaway:'前へ進む役は一歩。踏ん張りは惰性と準備。',caution:'「踏ん張った力で前へ進む」と覚えないよう、役割を分けます。',caption:'速度がない状態では、踏ん張るだけで体は移動しません。',scene:'止まった棒人間。力や速度の矢印はない。',layers:[]}
      ]
    },
    arms:{
      kicker:'転ばない工夫',title:'腕は、何を変える？',lead:'腕は前進用のエンジンではなく、体の回り方を変える操作です。',
      frames:[
        {pose:'stand',question:'腕の向きを選んだだけで、体は進む？',title:'選択しただけでは、まだ動かない',text:'腕ボタンは「次の操作で振る向き」の予約です。足または踏ん張りを押したとき、同時に動きます。',look:'まっすぐな体と、力の矢印がないこと',metric:'移動 +0.00 m ／ 時間 +0',takeaway:'腕の選択だけでは、シミュレーションの一コマは進まない。',caution:'ゲーム本体の表示も「次の操作で振る」が正確です。',caption:'腕を選んだだけの状態。体はまだ動きません。',scene:'まっすぐ立つ棒人間。矢印はない。',layers:[]},
        {pose:'leanRight',question:'体が右へ傾き、右回りになっている。どうする？',title:'まず、傾きと回転を見る',text:'傾きは今の姿勢、回転はこれから傾きが変わる向きです。AIは両方を別の状態として見ます。',look:'右へ傾いた体と、右回りの青い矢印',metric:'前向き速度への追加 +0.000',takeaway:'腕が直接変えるのは、まず体の回転。',caution:'現在の傾きと回転方向は同じとは限りません。',caption:'右へ傾き、右向きに回ろうとする体です。',scene:'右へ傾く棒人間と右回りを表す曲線矢印。',rotation:'right',layers:['rotation']},
        {pose:'armsLeft',question:'右へ回りすぎるとき、腕を左へ振ると？',title:'反対向きの回転を足す候補',text:'腕を左へ振る変化が、体へ左向きの回転効果を加えます。中央へ戻りやすくなる候補です。',look:'左へ大きく動いた腕と、左回りの青い矢印',metric:'前向き速度への追加 +0.000',takeaway:'傾きと反対の腕は、立て直しの候補。',caution:'傾き・坂・それまでの回転があるため、必ず中央へ戻るとは限りません。',caption:'右傾きに対して腕を左へ振り、反対の回転を足そうとします。',scene:'右傾きの体が腕を左へ振り、左回りの矢印が出ている。',rotation:'left',layers:['rotation']},
        {pose:'armsRight',question:'右へ傾いているとき、腕も右へ振ると？',title:'同じ向きの回転を強めることがある',text:'傾きと同じ方向へ回転効果を足すと、さらに姿勢を崩す場合があります。',look:'右へ動いた腕と、右回りの青い矢印',metric:'前向き速度への追加 +0.000',takeaway:'腕の向きは、今の体の状態と組み合わせて選ぶ。',caution:'腕の左右に、いつでも正しい固定答えがあるわけではありません。',caption:'右傾きの体が腕も右へ振り、同じ向きの回転を足しています。',scene:'右へ大きく傾き、腕も右へ振る棒人間と右回りの矢印。',rotation:'right',layers:['rotation']},
        {pose:'stand',question:'腕だけを激しく振れば、ゴールまで進める？',title:'腕は前進速度を足さない',text:'腕が変えるのは回転です。前向き速度を作るには、足で地面を後ろへ押す一歩が必要です。',look:'前向きの力・速度矢印がないこと',metric:'腕による前向き速度 +0.000',takeaway:'足は推進、腕は回転の舵。役割が違う。',caution:'本物の歩行では腕も全身の角運動量などに関わります。ここでは画面内の回転へ簡略化しています。',caption:'腕だけでは、前向きの速度は増えません。',scene:'まっすぐな棒人間。腕による前向きの矢印はない。',layers:[]}
      ]
    },
    mistakes:{
      kicker:'失敗を読む',title:'なぜ、つまずいた？',lead:'「失敗した」で終わらず、状態と選んだ行動のどこが合わなかったかを分けます。',
      frames:[
        {pose:'fail',question:'左足の次に、また左足を出したら？',title:'足の順番が違う',text:'このゲームは左右交互が約束です。次が右足の状態で左足を選ぶと、地面をうまく押せません。',look:'赤くなった「足の順番」と失敗の×印',metric:'今回足す速度 +0.000',takeaway:'状態の「次の足」を見る。',caution:'左右交互は教材として決めたゲーム規則です。',caption:'同じ足を続けて選び、つまずいた場面です。',scene:'同じ足を続けて出して姿勢を崩した棒人間。足の順番が強調されている。',failure:'wrong-foot',layers:['failure']},
        {pose:'failRight',question:'足の順番が合っていても、すぐ出したら？',title:'まだ準備中',text:'短い一歩の後は2回、大股の後は3回待つ約束です。準備が残る状態では反対足でも失敗します。',look:'色のついた右足と、赤くなった「次の足の準備」',metric:'準備 1 ／ 今回足す速度 +0.000',takeaway:'足の順番と準備OKの両方が必要。',caution:'これは実際の秒数ではなく、ゲーム内の待ち拍です。',caption:'左足の次に右足を出したが、準備が終わる前なので失敗した場面です。',scene:'左足の次に右足を出したが、準備不足で姿勢を崩した棒人間。右足と準備条件が強調されている。',failure:'recovering',layers:['failure']},
        {pose:'long',question:'最初から大股なら、速く進める？',title:'停止中の大股は失敗',text:'大股は成功時の推進が大きい代わりに、足側への回転と力の消費が増え、次の足まで3拍待ちます。止まった状態では失敗するゲーム規則です。',look:'赤くなった「大股の条件」と伸ばした足',metric:'推進 大 ／ 消費 大 ／ 準備 3拍',takeaway:'大きい行動には、大きい利益と負担がある。',caution:'まず小さな一歩で速度を作る。大きな傾きや急な坂でも大股は失敗します。',caption:'止まった状態から大股を選び、うまく押せない場面です。',scene:'停止中に大股を選んだ棒人間。大股の条件が強調されている。',failure:'long',layers:['contact','failure']},
        {pose:'fail',question:'条件が合っていても、毎回同じ結果になる？',title:'でこぼこでは、滑ることもある',text:'地面をでこぼこにすると、同じ行動でも小さな確率で滑ります。AIは一度の成功だけでなく、繰り返した結果から学びます。',look:'赤くなった「でこぼこの滑り」と接地点',metric:'今回足す速度 +0.000',takeaway:'同じ行動でも結果が揺れる環境がある。',caution:'HELPの主な歩行例は、理屈を見やすくするため滑りなしの固定条件です。',caption:'足順と準備は合っていても、でこぼこで滑った場面です。',scene:'接地点で滑り、姿勢を崩した棒人間。滑り条件が強調されている。',failure:'slip',layers:['contact','failure']},
        {pose:'fail',question:'つまずきと転倒は、同じ？',title:'つまずいた後も、まだ立っている場合がある',text:'つまずきは一歩の失敗。転倒は体の傾きがゲーム内の限界を越えた判定です。失敗後も惰性で少し進むことがあります。',look:'赤くなった「つまずき／転倒」と速度矢印',metric:'新しい推進 0 ／ 残った速度あり',takeaway:'進んだ距離だけで、一歩の成功を決めない。',caution:'転倒の限界も、学びやすくするために決めたゲーム規則です。',caption:'つまずき後、残った速度で進みながら大きく傾いています。',scene:'つまずいた後に傾き、残った速度で少し進む棒人間。転倒との区別が強調されている。',failure:'fall',speed:motion.step.speedAfter*.5,layers:['speed','failure']}
      ]
    }
  };

  const topicOrder=['push','brace','arms','mistakes'];
  const topicNames={push:'一歩',brace:'踏ん張り',arms:'腕',mistakes:'失敗'};
  let topic='push';
  let step=0;

  function setHidden(id,hidden){const element=$(id);if(element)element.toggleAttribute('hidden',Boolean(hidden));}

  function localPoints(value){
    return value.trim().split(/\s+/).map(pair=>pair.split(',').map(Number));
  }

  function scenePoint(pose,point){
    const radians=pose.lean*Math.PI/180;
    return {
      x:pose.x+point[0]*Math.cos(radians)-point[1]*Math.sin(radians),
      y:352+point[0]*Math.sin(radians)+point[1]*Math.cos(radians)
    };
  }

  function setLine(id,x1,y1,x2,y2){
    const line=$(id);if(!line)return;
    line.setAttribute('x1',x1.toFixed(1));line.setAttribute('y1',y1.toFixed(1));
    line.setAttribute('x2',x2.toFixed(1));line.setAttribute('y2',y2.toFixed(1));
  }

  function setTextPoint(id,x,y){
    const label=$(id);if(!label)return;
    label.setAttribute('x',x.toFixed(1));label.setAttribute('y',y.toFixed(1));
  }

  function renderPose(frame){
    const pose=poses[frame.pose]||poses.stand;
    const figure=$('helpFigure');
    figure.setAttribute('transform',`translate(${pose.x} 352) rotate(${pose.lean})`);
    $('helpLeftLeg').setAttribute('points',pose.left);
    $('helpRightLeg').setAttribute('points',pose.right);
    $('helpLeftArm').setAttribute('points',pose.leftArm);
    $('helpRightArm').setAttribute('points',pose.rightArm);
    $('helpLeftLeg').classList.toggle('help-active-limb',pose.active==='left');
    $('helpRightLeg').classList.toggle('help-active-limb',pose.active==='right');
    $('helpLeftFootLabel').classList.toggle('is-active',pose.active==='left');
    $('helpRightFootLabel').classList.toggle('is-active',pose.active==='right');
    const leftPoints=localPoints(pose.left);
    const rightPoints=localPoints(pose.right);
    const leftFoot=scenePoint(pose,leftPoints.at(-1));
    const rightFoot=scenePoint(pose,rightPoints.at(-1));
    setTextPoint('helpLeftFootLabel',leftFoot.x,Math.max(383,leftFoot.y+30));
    setTextPoint('helpRightFootLabel',rightFoot.x,Math.max(383,rightFoot.y+30));
    const activePoints=pose.active==='right'?rightPoints:leftPoints;
    const activeFoot=scenePoint(pose,activePoints.at(-1));
    const activeKnee=scenePoint(pose,activePoints.at(-2));
    const activeHip=scenePoint(pose,activePoints[0]);
    for(const id of ['helpContactRing','helpContactDot']){
      const point=$(id);if(point){point.setAttribute('cx',activeFoot.x.toFixed(1));point.setAttribute('cy',activeFoot.y.toFixed(1));}
    }
    setTextPoint('helpContactLabel',activeFoot.x+16,activeFoot.y-21);
    setLine('helpPushLine',activeFoot.x-10,activeFoot.y+19,activeFoot.x-176,activeFoot.y+19);
    setTextPoint('helpPushLabel',activeFoot.x-168,activeFoot.y+53);
    setLine('helpReactionLine',activeFoot.x+5,activeFoot.y-18,activeFoot.x+165,activeFoot.y-18);
    setTextPoint('helpReactionLabel',activeFoot.x+28,activeFoot.y-37);
    const transfer=$('helpTransferPath');
    if(transfer)transfer.setAttribute('points',`${activeFoot.x.toFixed(1)},${(activeFoot.y-5).toFixed(1)} ${activeKnee.x.toFixed(1)},${activeKnee.y.toFixed(1)} ${activeHip.x.toFixed(1)},${activeHip.y.toFixed(1)}`);
    setTextPoint('helpTransferLabel',275,267);
    const speedRatio=frame.speed&&motion.step.speedAfter?Math.max(.42,Math.min(1,frame.speed/motion.step.speedAfter)):1;
    const speedStart=pose.x+46;
    setLine('helpSpeedLine',speedStart,137,speedStart+203*speedRatio,137);
    setTextPoint('helpSpeedLabel',speedStart+34,116);
    const rotationLeft=frame.rotation==='left';
    if($('helpRotationPath'))$('helpRotationPath').setAttribute('d',rotationLeft?'M268 171 C217 191 211 250 250 278':'M392 171 C443 191 449 250 410 278');
    setTextPoint('helpRotationLabel',rotationLeft?155:447,212);
    if($('helpRotationLabel'))$('helpRotationLabel').textContent=rotationLeft?'腕が足した左回転':'体の右回転';
    const recovery=Number.isFinite(frame.recovery)?frame.recovery:null;
    if(recovery!==null){
      $('helpRecoveryLabel').textContent=recovery===0?'準備 OK':`準備 あと${recovery}`;
      $('helpRecoveryDot1').classList.toggle('is-ready',recovery<=1);
      $('helpRecoveryDot2').classList.toggle('is-ready',recovery===0);
    }
    document.querySelectorAll('[data-failure-reason]').forEach(row=>row.classList.toggle('is-active',row.dataset.failureReason===frame.failure));
    const layers=new Set(frame.layers||[]);
    setHidden('helpGhostFigure',!layers.has('ghost'));
    setHidden('helpContact',!layers.has('contact'));
    setHidden('helpPushArrow',!layers.has('push'));
    setHidden('helpReactionArrow',!layers.has('reaction'));
    setHidden('helpSpeedArrow',!layers.has('speed'));
    setHidden('helpRotationArrow',!layers.has('rotation'));
    setHidden('helpRecovery',!layers.has('recovery'));
    setHidden('helpFailureMark',!layers.has('failure'));
    setHidden('helpFailureSequence',frame.failure!=='recovering');
  }

  function renderDots(frames){
    const host=$('helpStepDots');
    host.innerHTML='';
    frames.forEach((frame,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.dataset.helpStep=String(index);
      button.textContent=String(index+1);
      button.setAttribute('aria-label',`${index+1}コマ目：${frame.title}`);
      button.setAttribute('aria-pressed',index===step?'true':'false');
      button.addEventListener('click',()=>{setStep(index);revealScene();});
      host.appendChild(button);
    });
  }

  function render(){
    const selected=topics[topic];
    const frame=selected.frames[step];
    $('helpLab').dataset.topic=topic;
    $('helpLab').dataset.step=String(step);
    $('helpTopicKicker').textContent=selected.kicker;
    $('helpTopicTitle').textContent=selected.title;
    $('helpTopicLead').textContent=selected.lead;
    $('helpStepCount').textContent=`${step+1} / ${selected.frames.length}`;
    $('helpFrameNumber').textContent=`FRAME ${step+1}`;
    $('helpStepQuestion').textContent=frame.question;
    $('helpStepTitle').textContent=frame.title;
    $('helpStepText').textContent=frame.text;
    $('helpLookFor').textContent=frame.look;
    $('helpMetric').textContent=frame.metric;
    $('helpTakeaway').textContent=frame.takeaway;
    $('helpCaution').textContent=frame.caution;
    $('helpSceneCaption').textContent=frame.caption;
    $('gaitSceneTitle').textContent=frame.title;
    $('gaitSceneDesc').textContent=frame.scene;
    renderPose(frame);
    renderDots(selected.frames);
    const topicIndex=topicOrder.indexOf(topic);
    const firstOfGuide=topicIndex===0&&step===0;
    const lastOfTopic=step===selected.frames.length-1;
    $('helpPrev').disabled=firstOfGuide;
    $('helpPrev').textContent=step===0&&!firstOfGuide?`← 前：${topicNames[topicOrder[topicIndex-1]]}`:'← ひとつ前';
    $('helpNext').disabled=false;
    $('helpNext').textContent=lastOfTopic?(topicIndex<topicOrder.length-1?`次：${topicNames[topicOrder[topicIndex+1]]} →`:'ゲームで試す →'):'次の一コマ →';
    $('helpReset').disabled=step===0;
    document.querySelectorAll('[data-help-topic]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.helpTopic===topic?'true':'false'));
  }

  function setStep(next){
    const last=topics[topic].frames.length-1;
    step=Math.max(0,Math.min(last,Number(next)||0));
    render();
  }

  function setTopic(next,updateHash=true){
    if(!topics[next])return;
    topic=next;step=0;
    if(updateHash&&window.history&&window.history.replaceState)window.history.replaceState(null,'',`#${topic}`);
    render();
  }

  function revealScene(){
    const scene=document.querySelector('.help-scene-card');
    if(window.matchMedia&&window.matchMedia('(max-width: 900px)').matches&&scene&&scene.scrollIntoView)scene.scrollIntoView({block:'start',behavior:'auto'});
  }

  function previousFrame(){
    if(step>0){setStep(step-1);revealScene();return;}
    const index=topicOrder.indexOf(topic);
    if(index<=0)return;
    const previous=topicOrder[index-1];
    setTopic(previous);
    setStep(topics[previous].frames.length-1);
    revealScene();
  }

  function nextFrame(){
    const last=topics[topic].frames.length-1;
    if(step<last){setStep(step+1);revealScene();return;}
    const index=topicOrder.indexOf(topic);
    if(index<topicOrder.length-1){setTopic(topicOrder[index+1]);revealScene();return;}
    returnToGame();
  }

  function returnToGame(){
    if(window.opener&&!window.opener.closed){window.opener.focus();window.close();return;}
    window.location.href='index.html#manualControls';
  }

  document.querySelectorAll('[data-help-topic]').forEach(button=>button.addEventListener('click',()=>{setTopic(button.dataset.helpTopic);revealScene();}));
  $('helpPrev').addEventListener('click',previousFrame);
  $('helpNext').addEventListener('click',nextFrame);
  $('helpReset').addEventListener('click',()=>{setStep(0);revealScene();});
  document.querySelectorAll('#closeHelp,[data-close-help]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();returnToGame();}));
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
    if(event.key==='ArrowLeft'){event.preventDefault();previousFrame();}
    if(event.key==='ArrowRight'){event.preventDefault();nextFrame();}
  });
  window.addEventListener('hashchange',()=>{const next=window.location.hash.slice(1);if(topics[next])setTopic(next,false);});

  const initial=window.location.hash.slice(1);
  if(topics[initial])topic=initial;
  const mobileScene=window.matchMedia?window.matchMedia('(max-width: 660px)'):null;
  const syncSceneViewBox=()=>$('gaitScene').setAttribute('viewBox',mobileScene&&mobileScene.matches?'160 55 450 350':'0 0 760 440');
  if(mobileScene){if(mobileScene.addEventListener)mobileScene.addEventListener('change',syncSceneViewBox);else if(mobileScene.addListener)mobileScene.addListener(syncSceneViewBox);}
  syncSceneViewBox();
  render();

  window.__walkerHelpDebug={get topic(){return topic;},get step(){return step;},topics,setStep,setTopic,motion};
})();
