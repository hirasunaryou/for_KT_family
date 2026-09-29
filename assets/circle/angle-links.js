/* The diameter and cyclic quadrilateral both return to the arc being viewed. */
(()=>{
 'use strict';
 const M=window.CircleMath,blue='#3566a0',brown='#98502f',ink='#253b39',gray='#7a8781',O=[275,205],R=125;
 const pt=(d,r=R)=>[O[0]+r*Math.cos(d*Math.PI/180),O[1]-r*Math.sin(d*Math.PI/180)];
 const line=(a,b,c=gray,w=1.6,dash='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
 const txt=(x,y,s,c=ink,size=18)=>`<text x="${x}" y="${y}" fill="${c}" text-anchor="middle" font-size="${size}">${s}</text>`;
 const tag=(d,s)=>{const p=pt(d,150);return txt(p[0],p[1]+6,s);};
 const arc=(start,span,r,c,attr='')=>`<path ${attr} d="M ${pt(start,r)} A ${r} ${r} 0 ${span>180?1:0} 0 ${pt(start+span,r)}" stroke="${c}" stroke-width="${r===R?4:2}" fill="none"/>`;
 function angle(a,p,b,c){const u=Math.atan2(a[1]-p[1],a[0]-p[0]),v=Math.atan2(b[1]-p[1],b[0]-p[0]),d=(v-u+3*Math.PI)%(2*Math.PI)-Math.PI,r=20,s=[p[0]+r*Math.cos(u),p[1]+r*Math.sin(u)],e=[p[0]+r*Math.cos(v),p[1]+r*Math.sin(v)];return `<path d="M ${p} L ${s} A ${r} ${r} 0 0 ${d>0?1:0} ${e} Z" fill="${c===blue?'#e2ecf7':'#f4e4d7'}" stroke="${c}" stroke-width="1.8"/>`;}
 function right(a,p,b){const n=Math.hypot(a[0]-p[0],a[1]-p[1]),m=Math.hypot(b[0]-p[0],b[1]-p[1]),u=[(a[0]-p[0])*13/n,(a[1]-p[1])*13/n],v=[(b[0]-p[0])*13/m,(b[1]-p[1])*13/m],q=[p[0]+u[0],p[1]+u[1]],z=[p[0]+v[0],p[1]+v[1]];return `<path data-right d="M ${q} L ${q[0]+v[0]} ${q[1]+v[1]} L ${z}" fill="none" stroke="${blue}" stroke-width="2"/>`;}
 const number=n=>String(Math.round(n*10)/10),part=(s,c)=>`<span class="circle-${c}">${s}</span>`;
 const configs=[
  {id:'diameter-story',lesson:7,label:'P',min:30,max:150,value:65,step:5,titles:['ABが直径、という条件を見る','Pを含まない半円を選ぶ','中心で見ると、一直線の180°','Pで見ると、その半分の90°'],messages:['ABは中心Oを通る直径です。円周上のPからA・Bへ線を引きました。Pの角はどの弧を見ている？','青い半円ABにはPがありません。Pが上側で動いても、見る弧はこの半円のままです。','OAとOBは反対向きの半径。半円に対応する中心角は、一直線の180°です。','円周角は、同じ弧の中心角の半分。Pを動かしても、青い半円が変わらないので90°のままです。'],link:'<a href="#diameter-lab">円の内側・外側へ動かして比べる</a> · 紙へ：<a href="#q13">問13</a>・<a href="#q14">問14</a>'},
  {id:'cyclic-story',lesson:9,label:'D',min:4,max:84,value:4,step:4,titles:['向かい合うAとCの角に注目','Aが見ている弧をたどる','Cが見るのは、残りの弧','2つの弧を合わせると、円1周','それぞれ、中心角の半分になる','2つの半分を足すと、180°'],messages:['A・B・C・Dは同じ円周上にあります。Aの角とCの角は、それぞれどの弧を見ているでしょう？','AからB・Dへ線をたどります。Aを含まない青い弧BDが、Aの角に対応します。','今度はCからB・Dへ。Cを含まない茶色の弧BDは、さっきとは反対側です。','青と茶には、重なりも隙間もありません。2つの弧で円1周なので、対応する中心角の合計は360°です。','青い中心角の半分がAの角、茶色の中心角の半分がCの角。辺と弧、式の色を見比べよう。','半分にしてから足しても、合わせてから半分にしても同じ。Dを動かすと各角は変わりますが、合計は180°に保たれます。'],link:'紙へ：<a href="#q18">問18</a>・<a href="#q24">問24</a>で、向かい合う角を探そう。'}
 ];
 for(const config of configs){
  const card=document.getElementById('lesson-'+config.lesson);if(!card)continue;
  const seq=document.createElement('div');seq.id=config.id;seq.className='angle-story interactive';
  seq.innerHTML=`<div class="angle-story-controls"><button class="button" data-back>ひとつ前</button><span class="angle-story-count"></span><button class="button primary" data-next>次の手順</button><button class="button" data-reset>最初から</button></div><h3 class="angle-story-title"></h3><label class="control">${config.label}を円周上で動かす <input type="range" min="${config.min}" max="${config.max}" step="${config.step}" value="${config.value}" aria-label="${config.label}の円周上の位置"></label><figure><svg viewBox="0 0 550 420" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div aria-live="polite" aria-atomic="true"><p class="angle-story-before muted"></p><p class="angle-story-message"></p><p class="angle-story-formula"></p></div><p class="angle-story-links">${config.link}</p><details><summary>元の解説をまとめて読む</summary></details>`;
  seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-angle-story');
  let index=0;const slider=seq.querySelector('input'),svg=seq.querySelector('svg');
  function draw(){
   const v=Number(slider.value),diam=config.lesson===7;
   let g=`<circle cx="275" cy="205" r="125" fill="none" stroke="#a5afa9" stroke-width="1.5"/>`,formula='',caption='',segments=[];
   if(diam){
    const A=pt(180),B=pt(0),P=pt(v);segments=[[A,B],[P,A],[P,B]];
    g+=line(A,B,brown,2.5)+line(P,A)+line(P,B)+tag(180,'A')+tag(0,'B')+tag(v,'P');
    if(index>=1)g+=arc(180,180,R,blue,'data-semicircle');
    if(index>=2)g+=arc(180,180,32,brown,'data-central');
    if(index===3)g+=line(P,A,blue,2.5)+line(P,B,blue,2.5)+right(A,P,B);
    caption=['条件：ABは中心Oを通る直径','Pを含まない、青い半円AB','半円の中心角は180°','Pの円周角は、どこでも90°'][index];
    if(index===3)formula=`${part('180°','brown')} ÷ 2 ＝ ${part('90°','blue')}`;
    svg.dataset.firstAngle=number(M.angle(M.point(180),M.point(v),M.point(0)));
   }else{
    const A=pt(140),B=pt(220),C=pt(300),D=pt(v),span=140+v,a=span/2,c=(360-span)/2;
    segments=[[A,B],[B,C],[C,D],[D,A]];
    for(const [p,q]of segments)g+=line(p,q);
    if(index===1||index>=3){g+=arc(220,span,R,blue,'data-arc-a')+line(A,B,blue,2.5)+line(A,D,blue,2.5)+angle(B,A,D,blue);}
    if(index>=2){g+=arc(v,360-span,R,brown,'data-arc-c')+line(C,B,brown,2.5)+line(C,D,brown,2.5)+angle(B,C,D,brown);}
    if(index>=3){segments.push([O,B],[O,D]);g+=line(O,B,gray,1.4,'4 4')+line(O,D,gray,1.4,'4 4')+arc(220,span,32,blue,'data-central-a')+arc(v,360-span,32,brown,'data-central-c');}
    g+=tag(140,'A')+tag(220,'B')+tag(300,'C')+tag(v,'D');
    caption=['同じ円の上の、向かい合う2つの角','Aの角 ↔ 青い弧BD','Cの角 ↔ 茶色の弧BD','青い弧 ＋ 茶色の弧 ＝ 円1周',`Aの角 ${number(a)}° ／ Cの角 ${number(c)}°`,`Aの角 ${number(a)}° ＋ Cの角 ${number(c)}° ＝ 180°`][index];
    if(index===4)formula=`${part('A：'+number(span)+'° ÷ 2 ＝ '+number(a)+'°','blue')}<br>${part('C：'+number(360-span)+'° ÷ 2 ＝ '+number(c)+'°','brown')}`;
    if(index===5)formula=`(${part(number(span)+'°','blue')} ＋ ${part(number(360-span)+'°','brown')}) ÷ 2<br>＝ 360° ÷ 2 ＝ 180°`;
    svg.dataset.firstAngle=number(a);svg.dataset.secondAngle=number(c);
   }
   // A small centre label stays clear of the chords. The centre itself never moves.
   if(diam||index>=3){
    const cuts=[...segments];for(let j=0;j<72;j++)cuts.push([pt(j*5,32),pt((j+1)*5,32)]);
    const hit=(a,b,x,y)=>{let lo=0,hi=1;for(let k=0;k<2;k++){const min=(k?y:x)-(k?12:10),max=(k?y:x)+(k?12:10),d=b[k]-a[k];if(Math.abs(d)<1e-9){if(a[k]<min||a[k]>max)return false;}else{const p=(min-a[k])/d,q=(max-a[k])/d;lo=Math.max(lo,Math.min(p,q));hi=Math.min(hi,Math.max(p,q));if(lo>hi)return false;}}return true;};
    let label=null;for(const r of [19,43,52]){for(let j=0;j<24;j++){const p=pt(j*15,r);if(!cuts.some(([a,b])=>hit(a,b,p[0],p[1]))){label=p;break;}}if(label)break;}
    label=label||[260,180];g+='<circle cx="275" cy="205" r="2.5" fill="#253b39"/>'+txt(label[0],label[1]+6,'O',ink,17);
   }
   g+=txt(275,399,caption,index===1?blue:index===2?brown:ink,17);svg.innerHTML=g;svg.setAttribute('aria-label',config.titles[index]+'。'+config.messages[index]);
   seq.querySelector('.angle-story-count').textContent=`${index+1} / ${config.titles.length}`;seq.querySelector('.angle-story-title').textContent=config.titles[index];seq.querySelector('.angle-story-message').textContent=config.messages[index];
   seq.querySelector('.angle-story-before').textContent=index?'ひとつ前：'+config.titles[index-1]:'';const f=seq.querySelector('.angle-story-formula');f.innerHTML=formula;f.hidden=!formula;
   for(const [name,disabled]of [['back',index===0],['next',index===config.titles.length-1],['reset',index===0&&v===config.value]])seq.querySelector('[data-'+name+']').setAttribute('aria-disabled',String(disabled));
  }
  seq.querySelector('[data-back]').addEventListener('click',()=>{if(index>0){index--;draw();}});seq.querySelector('[data-next]').addEventListener('click',()=>{if(index<config.titles.length-1){index++;draw();}});
  seq.querySelector('[data-reset]').addEventListener('click',()=>{index=0;slider.value=config.value;seq.querySelector('details').open=false;draw();});slider.addEventListener('input',draw);
  seq.querySelector('[data-zoom]').addEventListener('click',()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));d.showModal();});draw();
 }
})();

/* The converse: first check the hypotheses, then reveal the circle through A, B, P. */
(()=>{
 'use strict';
 const card=document.getElementById('lesson-8');if(!card)return;
 const blue='#3566a0',brown='#98502f',ink='#253b39',gray='#819089',R=95,O=[275,180];
 const pt=d=>[O[0]+R*Math.cos(d*Math.PI/180),O[1]-R*Math.sin(d*Math.PI/180)];
 const A=pt(222),B=pt(318),P=pt(70),baseline=A[1];
 const text=(p,s,c=ink,size=18)=>`<text x="${p[0]}" y="${p[1]}" text-anchor="middle" fill="${c}" font-size="${size}">${s}</text>`;
 const line=(a,b,c,w=2,dash='',attr='')=>`<line ${attr} x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
 function mark(a,p,b,c){const u=Math.atan2(a[1]-p[1],a[0]-p[0]),v=Math.atan2(b[1]-p[1],b[0]-p[0]),d=(v-u+3*Math.PI)%(2*Math.PI)-Math.PI,r=19,q=[p[0]+r*Math.cos(u),p[1]+r*Math.sin(u)],z=[p[0]+r*Math.cos(v),p[1]+r*Math.sin(v)];return `<path d="M ${p} L ${q} A ${r} ${r} 0 0 ${d>0?1:0} ${z} Z" fill="${c===blue?'#e2ecf7':'#f4e4d7'}" stroke="${c}" stroke-width="1.6"/>`;}
 const seq=document.createElement('div');seq.id='converse-story';seq.className='angle-story interactive';
 seq.innerHTML=`<div class="example-context"><strong>この体験の設定 · 最初は問16と同じ条件</strong><p>A・B・Pを固定し、∠APB＝48°とします。<br>Qの位置を変えて、4点が同じ円の上にあるか考えます。</p></div><div class="prior-chapters" aria-label="比べる条件"><button class="button" data-converse="same">同じ側・等しい角</button><button class="button" data-converse="different">同じ側・角を変える</button><button class="button" data-converse="opposite">反対側・等しい角</button></div><label class="control">Qの位置を動かす <input type="range" min="105" max="160" step="5" value="145" aria-label="Qの位置"></label><p class="converse-setting"></p><div class="angle-story-controls"><button class="button" data-back>ひとつ前</button><span class="angle-story-count"></span><button class="button primary" data-next>角を比べる</button><button class="button" data-reset>最初から</button></div><h3 class="angle-story-title"></h3><figure><svg viewBox="0 0 550 490" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div aria-live="polite" aria-atomic="true"><p class="angle-story-before muted"></p><p class="angle-story-message"></p><p class="angle-story-formula" hidden></p></div><p class="angle-story-links">紙へ：<a href="#q16">問16</a>・<a href="#q17">問17</a>で条件を言葉にしよう。<br>90°の場合は、<a href="#diameter-lab">直径の円で確かめる</a>。</p><details><summary>元の解説と、反対側の場合の補足</summary><p>反対側なら必ず別の円、という意味ではありません。例えば角がどちらも90°なら、ABを直径とする同じ円の両側に点を置けます。</p></details>`;
 seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-angle-story');
 let mode='same',index=0;const slider=seq.querySelector('input'),svg=seq.querySelector('svg');
 function draw(){
  const Q=pt(Number(slider.value));if(mode==='different')Q[1]+=22;if(mode==='opposite')Q[1]=2*baseline-Q[1];
  const qAngle=window.CircleMath.angle({x:A[0],y:A[1]},{x:Q[0],y:Q[1]},{x:B[0],y:B[1]}),equal=mode!=='different',same=mode!=='opposite',qLabel=equal?'48°':'約'+qAngle.toFixed(1)+'°';
  const titles=['まず、直線ABのどちら側かを見る','次に、同じ線分ABを見る角を比べる','A・B・Pを通る円を描いて確かめる'];
  let g=text([275,23],'設定：A・B・Pは固定。Pの角は48°',ink,14);
  if(index===0)g+=`<rect x="70" y="63" width="410" height="${baseline-63}" fill="#edf2e8"/>`;
  if(index===2)g+=`<circle data-converse-circle cx="275" cy="180" r="95" fill="none" stroke="#819089" stroke-width="2"/>`;
  g+=line([75,baseline],[475,baseline],gray,1.3,'5 5')+line(A,B,ink,2.2)+line(P,A,blue,2,'','data-pa')+line(P,B,blue,2,'','data-pb')+line(Q,A,brown,2,'','data-qa')+line(Q,B,brown,2,'','data-qb');
  if(index>=1)g+=mark(A,P,B,blue)+mark(A,Q,B,brown);
  const baseQ=pt(Number(slider.value));let qTag=same?[275+(baseQ[0]-275)*(R+28)/R,180+(baseQ[1]-180)*(R+28)/R+6]:[Q[0]-18,Q[1]+28];
  // Prefer a label beside the displaced point; move it outside only near the circle/lines.
  if(mode==='different'){
   const candidate=[Q[0]-30,Q[1]+6],lo=[candidate[0]-11,candidate[1]-23],hi=[candidate[0]+11,candidate[1]+5];
   const near=Math.hypot(Math.max(lo[0]-O[0],0,O[0]-hi[0]),Math.max(lo[1]-O[1],0,O[1]-hi[1])),far=Math.max(...[lo[0],hi[0]].flatMap(x=>[lo[1],hi[1]].map(y=>Math.hypot(x-O[0],y-O[1]))));
   const crosses=(a,b)=>{let l=0,h=1;for(let k=0;k<2;k++){const d=b[k]-a[k];if(Math.abs(d)<1e-9){if(a[k]<lo[k]||a[k]>hi[k])return false;}else{const u=(lo[k]-a[k])/d,v=(hi[k]-a[k])/d;l=Math.max(l,Math.min(u,v));h=Math.min(h,Math.max(u,v));if(l>h)return false;}}return true;};
   if(!(near<=R+1&&far>=R-1)&&![[P,A],[P,B],[Q,A],[Q,B],[[75,baseline],[475,baseline]]].some(([a,b])=>crosses(a,b)))qTag=candidate;
  }
  g+=text([A[0]-21,baseline+25],'A')+text([B[0]+23,baseline+25],'B')+text([P[0]+9,P[1]-19],'P',blue)+text(qTag,'Q',brown)+text([448,baseline-13],'直線AB',gray,14);
  g+=`<circle cx="${P[0]}" cy="${P[1]}" r="3" fill="${blue}"/><circle cx="${Q[0]}" cy="${Q[1]}" r="3" fill="${brown}"/>`;
  const caption=index===0?(same?'PとQは、直線ABの同じ側':'PとQは、直線ABの反対側'):index===1?'P：48° ／ Q：'+qLabel:mode==='same'?'条件がそろう → Qも同じ円の上':mode==='different'?'同じ側でも、角が違う → Qは円の上にない':'この48°の例：Qは同じ円の上にない';
  g+=text([275,469],caption,ink,17);svg.innerHTML=g;svg.dataset.qAngle=String(qAngle);
  const setting=mode==='same'?'Qを動かしても、同じ側で48°を保つ設定です。':mode==='different'?'Qを同じ側のまま、48°の位置から少しずらす設定です。':'Qを直線ABの反対側へ折り返し、48°を保つ設定です。';seq.querySelector('.converse-setting').textContent=setting;
  const messages=index===0?(same?'薄緑の側にPとQが両方あります。まず「直線ABの同じ側」という条件を確認できました。次は2つの角を比べよう。':'Pは薄緑の側、Qは反対側です。ここで「同じ側」という条件が外れました。角が等しければ、それでも同じ円になるでしょうか？'):index===1?(equal?'PもQも、同じ線分ABを48°で見ています。ここまでの条件から、QはA・B・Pと同じ円の上にあると思う？ 円を描いて確かめよう。':'Pは48°、Qは'+qLabel+'。同じ側でも角は等しくありません。A・B・Pを通る円にQも乗るか、予想してから確かめよう。'):mode==='same'?'同じ線分ABを見る角が等しく、PとQは直線ABの同じ側。この条件から、円周角の定理の逆により4点は同じ円周上にあると言えます。円を先に仮定せず、条件からたどりました。':mode==='different'?'Qは円の上にありません。もし同じ円の上で同じ側なら、同じ弧ABに対する角は等しくなるはず。角が違うので、この4点は同じ円周上にはありません。':'この48°の例では、QはA・B・Pを通る円の上にありません。「角が等しい」だけでは足りないことが見えました。定理の逆を使うときは、同じ側という条件も確認します。';
  seq.querySelector('.angle-story-title').textContent=titles[index];seq.querySelector('.angle-story-count').textContent=`${index+1} / 3`;seq.querySelector('.angle-story-before').textContent=index?'ひとつ前：'+titles[index-1]:'';seq.querySelector('.angle-story-message').textContent=messages;
  const f=seq.querySelector('.angle-story-formula');f.hidden=index<1;f.innerHTML=`<span class="circle-blue">∠APB＝48°</span><br><span class="circle-brown">∠AQB${equal?'＝':'≈'}${equal?'48':qAngle.toFixed(1)}°</span>`;
  svg.setAttribute('aria-label',setting+'。'+caption+'。'+messages);
  for(const b of seq.querySelectorAll('[data-converse]'))b.setAttribute('aria-pressed',String(b.dataset.converse===mode));
  seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===2));seq.querySelector('[data-next]').textContent=index===0?'角を比べる':'円を描いて確かめる';
 }
 for(const b of seq.querySelectorAll('[data-converse]'))b.onclick=()=>{mode=b.dataset.converse;index=0;draw();};slider.oninput=()=>{index=0;draw();};
 seq.querySelector('[data-next]').onclick=()=>{if(index<2){index++;draw();}};seq.querySelector('[data-back]').onclick=()=>{if(index>0){index--;draw();}};
 seq.querySelector('[data-reset]').onclick=()=>{index=0;mode='same';slider.value=145;seq.querySelector('details').open=false;draw();};
 seq.querySelector('[data-zoom]').onclick=()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));d.showModal();};draw();
})();
