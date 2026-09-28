/* Follow equal angles into similarity, and add a radius to find a right angle. */
(()=>{
 'use strict';
 const blue='#3566a0',brown='#98502f',green='#285c50',gray='#a5afa9',ink='#253b39';
 const line=(a,b,c=gray,w=1.6,attr='')=>`<line ${attr} x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}"/>`;
 const text=(p,s,c=ink,size=18)=>`<text x="${p[0]}" y="${p[1]}" text-anchor="middle" fill="${c}" font-size="${size}">${s}</text>`;
 const polar=(o,r,d)=>[o[0]+r*Math.cos(d*Math.PI/180),o[1]-r*Math.sin(d*Math.PI/180)];
 const arc=(o,r,start,span,c,attr='')=>`<path ${attr} d="M ${polar(o,r,start)} A ${r} ${r} 0 ${span>180?1:0} 0 ${polar(o,r,start+span)}" fill="none" stroke="${c}" stroke-width="2.5"/>`;
 function angle(a,p,b,c,r=21){let s=Math.atan2(p[1]-a[1],a[0]-p[0])*180/Math.PI,t=Math.atan2(p[1]-b[1],b[0]-p[0])*180/Math.PI,d=(t-s+540)%360-180;if(d<0){s=t;d=-d;}return arc(p,r,s,d,c);}
 const part=(s,c)=>`<span class="circle-${c}">${s}</span>`;
 const configs=[
  {id:'chord-story',lesson:10,titles:['交点Xを使う、2つの三角形','Xの向かい合う角は等しい','Aの角が見ている弧は？','Dの角も、同じ弧BCを見ている','同じ向きに並べると、対応が見える','AXからDXへ、長さは2倍','BXに対応するのは、CX','同じ2倍で、長さが求まる'],messages:[
   'ACとBDの交点がXです。△AXBと△DXCが相似だと分かれば、長さの比が使えそう。等しい角を2組探そう。',
   'Xで交わる2本の直線に注目。茶色の∠AXBと∠DXCは対頂角なので等しくなります。',
   'AからXへ進む線を、その先のCまでたどります。もう1本はBへ。Aの角は青い弧BCを見ています。',
   'DからXへ進む線の先もB。もう1本はCへ。AとDは同じ弧BCに対する円周角なので、青い角も等しくなります。',
   '茶色と青の2組の角が等しいので相似です。下は元の2つの三角形を同じ向きに並べ直した図。A↔D、X↔X、B↔Cの順に対応します。',
   'ここから問20の長さを使います。青い辺AXは3 cm、対応するDXは6 cm。小さい三角形から大きい三角形へ、長さは6÷3＝2倍です。',
   '次は茶色の辺。BXに対応するのはCXです。相似なら、こちらも同じ2倍。4 cmを何倍すればよいでしょう？',
   'CX＝4×2＝8 cm。新しい公式を覚えなくても、円周角で相似を見つけ、対応する辺の比から求められました。'
  ],links:'紙へ：<a href="#q19">問19の証明</a>・<a href="#q20">問20の長さ</a> ／ <a href="../similarity/index.html">相似を振り返る</a>'},
  {id:'tangent-story',lesson:11,titles:['接線と弦の間に、どんな角がある？','接点Aへ、半径OAを足す','半径と接線で、90°が見つかる','分かっている角を、90°の中に置く','求める角は、90°の残り'],messages:[
   '直線lはAで円に接しています。弦ABとの小さい方の角を求めたい。中心Oから、どこへ線を足すと役立つでしょう？',
   '接している点Aへ、半径OAを引きます。接線の問題で使える、中1で学んだ線です。',
   '接点を通る半径は、接線と垂直。Aに直角の印が付きました。弦ABはこの90°の内側にあります。',
   '茶色が半径OAと弦ABの角です。求めたいのは、接線と弦ABの間。90°の中を、2つの角に分けて見よう。',
   '青い角は90°から茶色の角を引いた残り。Bを動かすと、一方が大きくなる分、もう一方が小さくなります。'
  ],links:'紙へ：<a href="#q21">問21</a> ／ <a href="../pythagorean/index.html#lesson-9">半径の直角から、長さを求める</a>'}
 ];
 for(const cfg of configs){
  const card=document.getElementById('lesson-'+cfg.lesson);if(!card)continue;
  const seq=document.createElement('div');seq.id=cfg.id;seq.className='angle-story prior-story interactive';
  const cross=cfg.lesson===10;
  seq.innerHTML=`<div class="angle-story-controls"><button class="button" data-back>ひとつ前</button><span class="angle-story-count"></span><button class="button primary" data-next>次の手順</button><button class="button" data-reset>最初から</button></div>${cross?'<nav class="prior-chapters" aria-label="相似の説明を選ぶ"><button class="button" data-jump="0">等しい角を探す</button><button class="button" data-jump="4">対応を比べる</button><button class="button" data-jump="5">長さを求める</button></nav>':''}<h3 class="angle-story-title"></h3>${cross?'':'<label class="control">Bを円周上で動かす <input aria-label="Bの円周上の位置" type="range" min="40" max="120" step="10" value="80"></label>'}<figure><svg viewBox="0 0 550 400" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div aria-live="polite" aria-atomic="true"><p class="angle-story-before muted"></p><p class="angle-story-message"></p><p class="angle-story-formula"></p></div>${cross?'<section class="chord-comparison" hidden><h4>同じ2つの三角形を、同じ向きに</h4><p>回転・裏返しで向きをそろえました。辺の長さは変えていません。</p><figure><svg viewBox="0 0 550 270" role="img" aria-label="△AXBと△DXCを同じ向き、同じ縮尺で並べた図"></svg><button class="figure-open" data-compare-zoom>対応の図を大きく見る</button></figure></section><div class="prior-story-footer"><button class="button" data-tail-back>ひとつ前</button><span class="prior-footer-count" data-tail-count></span><button class="button primary" data-tail-next>次の手順</button></div>':''}<p class="angle-story-links">${cfg.links}</p><details><summary>元の解説をまとめて読む</summary></details>`;
  seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-angle-story');
  let index=0;const svg=seq.querySelector('svg'),slider=seq.querySelector('input');
  function draw(){
   let g='',formula='',caption='';
   if(cross){
    const O=[275,195],R=130,k=R/Math.sqrt(37),cv=p=>[275+(p[0]-2.5)*k,195-(p[1]+Math.sqrt(27)/2)*k];
    const A=cv([-3,0]),B=cv([2,Math.sqrt(12)]),C=cv([8,0]),D=cv([-3,-Math.sqrt(27)]),X=cv([0,0]);
    g=`<circle cx="275" cy="195" r="130" fill="none" stroke="${gray}" stroke-width="1.4"/>`;
    for(const [p,q,id]of [[A,C,'AC'],[B,D,'BD'],[A,B,'AB'],[D,C,'DC']])g+=line(p,q,gray,1.6,`data-edge="${id}"`);
    if(index<=1)g+=`<path d="M ${A} L ${X} L ${B} Z M ${D} L ${X} L ${C} Z" fill="#edf2e880" stroke="${green}" stroke-width="1.8"/>`;
    if(index>=1&&index<=4)g+=angle(A,X,B,brown,18)+angle(D,X,C,brown,18);
    if(index>=2&&index<=4){const s=Math.atan2(O[1]-B[1],B[0]-O[0])*180/Math.PI,t=Math.atan2(O[1]-C[1],C[0]-O[0])*180/Math.PI;g+=arc(O,R,t,(s-t+360)%360,blue,'data-shared-arc')+line(A,C,blue,2.3)+line(A,B,blue,2.3)+angle(X,A,B,blue);}
    if(index>=3&&index<=4)g+=line(D,B,blue,2.3)+line(D,C,blue,2.3)+angle(X,D,C,blue);
    if(index>=5){g+=line(A,X,blue,3)+line(D,X,blue,3)+text([(A[0]+X[0])/2,A[1]+24],'3',blue)+text([(D[0]+X[0])/2-19,(D[1]+X[1])/2+4],'6',blue);}
    if(index>=6)g+=line(B,X,brown,3)+line(C,X,brown,3)+text([(B[0]+X[0])/2+18,(B[1]+X[1])/2+3],'4',brown)+text([(C[0]+X[0])/2,X[1]+22],index===7?'8':'?',brown);
    for(const [p,s]of [[A,'A'],[B,'B'],[C,'C'],[D,'D']]){const d=Math.atan2(O[1]-p[1],p[0]-O[0])*180/Math.PI,q=polar(O,153,d);g+=text([q[0],q[1]+6],s);}
    g+=text([X[0]+24,X[1]+32],'X');
    caption=['△AXBと△DXCに注目','対頂角：Xの角が等しい','A → C と A → B をたどる','AとDは、同じ青い弧BCを見る','2組の角が等しい → 相似','青い辺：AX 3 cm → DX 6 cm','茶色の辺：BX 4 cm → CX ?','CX ＝ 8 cm'][index];
    if(index===4)formula='△AXB ∽ △DXC<br>A ↔ D ／ X ↔ X ／ B ↔ C';
    if(index===5)formula=part('DX ÷ AX ＝ 6 ÷ 3 ＝ 2','blue');
    if(index===6)formula=part('AX：DX ＝ 3：6 ＝ 1：2','blue')+'<br>'+part('BX：CX ＝ 4：? ＝ 1：2','brown');
    if(index===7)formula=part('CX ＝ 4 × 2 ＝ 8 cm','brown');
    const comparison=seq.querySelector('.chord-comparison');comparison.hidden=index<4;
    const U=[50,210],V=[50+3*k,210],W=[50+5*k,210-Math.sqrt(12)*k],F=[280,210],G=[280+6*k,210],H=[280+10*k,210-2*Math.sqrt(12)*k];
    let h=text([112,25],'△AXB',ink,17)+text([390,25],'△DXC',ink,17);
    for(const [a,x,b,names]of [[U,V,W,['A','X','B']],[F,G,H,['D','X','C']]]){
     h+=line(a,x,index>=5?blue:gray,2.5)+line(x,b,index>=6?brown:gray,2.5)+line(b,a,gray);
     h+=angle(x,a,b,blue,20)+angle(a,x,b,brown,14);
     h+=text([a[0]-10,a[1]+24],names[0],blue)+text([x[0]+8,x[1]+24],names[1],brown)+text([b[0]+8,b[1]-12],names[2],green);
    }
    if(index>=5){h+=text([(U[0]+V[0])/2,237],'3',blue)+text([(F[0]+G[0])/2,237],'6',blue)+line([198,145],[248,145],blue,1.5)+line([248,145],[241,140],blue,1.5)+line([248,145],[241,150],blue,1.5)+text([223,130],'2倍',blue,16);}
    if(index>=6)h+=text([(V[0]+W[0])/2+18,(V[1]+W[1])/2+5],'4',brown)+text([(G[0]+H[0])/2+18,(G[1]+H[1])/2+5],index===7?'8':'?',brown);
    comparison.querySelector('svg').innerHTML=h;
   }else{
    const v=Number(slider.value),O=[300,205],A=[180,205],B=polar(O,120,v),theta=v/2;
    g=`<circle cx="300" cy="205" r="120" fill="none" stroke="${gray}" stroke-width="1.4"/>`+line([180,45],[180,360],green,2.5,'data-tangent')+line(A,B,ink,2,'data-chord')+text([153,55],'l',green)+text([153,226],'A')+text([320,226],'O');
    const tag=polar(O,146,v);g+=text([tag[0],tag[1]+6],'B')+'<circle cx="300" cy="205" r="2.5" fill="#253b39"/>';
    if(index>=1)g+=line(A,O,brown,2,'data-radius stroke-dasharray="5 4"')+text([244,231],'半径',brown,16);
    if(index>=2)g+='<path data-right d="M 180 190 L 195 190 L 195 205" fill="none" stroke="#285c50" stroke-width="1.6"/>';
    if(index>=3){const q=polar(A,132,theta/2);g+=arc(A,40,0,theta,brown,'data-known')+text([q[0],q[1]+6],theta+'°',brown);}
    if(index===4){const q=polar(A,105,(theta+90)/2);g+=arc(A,55,theta,90-theta,blue,'data-answer')+text([q[0],q[1]+6],(90-theta)+'°',blue);formula='90° − '+part(theta+'°','brown')+' ＝ '+part((90-theta)+'°','blue');}
    caption=['lはAでの接線。ABとの角を探そう','中心Oから、接点Aへ','半径OA ⊥ 接線l','90°の中の、茶色の角','青い角 ＋ 茶色の角 ＝ 90°'][index];
    svg.dataset.knownAngle=theta;svg.dataset.answerAngle=90-theta;
   }
   svg.innerHTML=g+text([275,388],caption,ink,17);svg.setAttribute('aria-label',cfg.titles[index]+'。'+cfg.messages[index]);
   seq.querySelector('.angle-story-count').textContent=`${index+1} / ${cfg.titles.length}`;seq.querySelector('.angle-story-title').textContent=cfg.titles[index];seq.querySelector('.angle-story-message').textContent=cfg.messages[index];seq.querySelector('.angle-story-before').textContent=index?'ひとつ前：'+cfg.titles[index-1]:'';
   const f=seq.querySelector('.angle-story-formula');f.innerHTML=formula;f.hidden=!formula;
   if(cross){seq.querySelector('[data-tail-count]').textContent=`${index+1} / ${cfg.titles.length}`;seq.querySelector('[data-tail-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-tail-next]').setAttribute('aria-disabled',String(index===cfg.titles.length-1));}
   for(const [name,disabled]of [['back',index===0],['next',index===cfg.titles.length-1],['reset',index===0&&(!slider||slider.value==='80')]])seq.querySelector('[data-'+name+']').setAttribute('aria-disabled',String(disabled));
   seq.querySelectorAll('[data-jump]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.jump)===(index<4?0:index===4?4:5))));
  }
  seq.querySelector('[data-back]').addEventListener('click',()=>{if(index>0){index--;draw();}});seq.querySelector('[data-next]').addEventListener('click',()=>{if(index<cfg.titles.length-1){index++;draw();}});seq.querySelector('[data-reset]').addEventListener('click',()=>{index=0;if(slider)slider.value=80;seq.querySelector('details').open=false;draw();});
  seq.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{index=Number(b.dataset.jump);draw();}));if(slider)slider.addEventListener('input',draw);
  if(cross){seq.querySelector('[data-tail-back]').addEventListener('click',()=>{if(index>0){index--;draw();}});seq.querySelector('[data-tail-next]').addEventListener('click',()=>{if(index<cfg.titles.length-1){index++;draw();}});}
  seq.querySelectorAll('[data-zoom],[data-compare-zoom]').forEach(b=>b.addEventListener('click',()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(b.closest('figure').querySelector('svg').cloneNode(true));d.showModal();}));draw();
 }
})();
