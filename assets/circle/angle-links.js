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
