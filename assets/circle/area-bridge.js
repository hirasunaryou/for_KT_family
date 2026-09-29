/* Rotate the same 6–8 triangle: a height is perpendicular to the chosen base. */
(()=>{
 'use strict';
 const card=document.getElementById('lesson-12');if(!card)return;
 const blue='#3566a0',brown='#98502f',ink='#253b39',gray='#819089';
 const titles=['条件を見る。まだ直角の印はない','直径に対する円周角は90°','回してみると、底辺と高さが見えてくる','知っている三角形の公式で解く','同じ三角形をもう1枚。長方形になる','長方形の半分だから、6×8÷2'];
 const messages=[
  'ABは直径、Pは円周上。与えられた長さはAP＝6 cm、BP＝8 cmです。面積を求めるには、まずどこが直角かを確かめよう。',
  'Pを含まない弧ABは半円。中心角180°の半分なので、Pの角は90°になります。直角の印を付けられる理由は「ABが直径」だからです。',
  '青いAPと茶色のBPは垂直です。APを底辺に選べば、Bから底辺への高さはBPそのもの。画面の横・縦ではなく、2辺が垂直かどうかで決まります。',
  '底辺はAP＝6 cm、高さはBP＝8 cm。三角形の面積＝底辺×高さ÷2を使って、6×8÷2＝24 cm²です。円の問題も、直角が見つかると知っている面積の問題になります。',
  '破線の側に、同じ三角形をもう1枚合わせました。青い辺と茶色の辺を隣り合う辺とする長方形です。元の三角形は、この長方形のちょうど半分。向きを戻しても関係は同じです。',
  '長方形の面積は6×8＝48 cm²。その半分が△APBの面積なので、48÷2＝24 cm²です。円の性質で見つけた直角が、知っている面積の公式につながりました。'
 ];
 const seq=document.createElement('div');seq.id='area-bridge';seq.className='angle-story interactive';
 seq.innerHTML=`<div class="example-context"><strong>例題の条件 · 問22</strong><p>ABは円Oの直径。Pは円周上の点です。</p><p>与えられた長さ：AP＝6 cm、BP＝8 cm<br>求めるもの：△APBの面積</p></div><div class="prior-chapters" aria-label="見直すところ"><button class="button" data-jump="0">直角を見つける</button><button class="button" data-jump="2">底辺と高さ</button><button class="button" data-jump="3">公式で面積</button></div><div class="angle-story-controls"><button class="button" data-back>ひとつ前</button><span class="angle-story-count"></span><button class="button primary" data-next>次の手順</button><button class="button" data-reset>最初から</button><button class="button" data-return hidden>面積の解き方へ戻る</button></div><h3 class="angle-story-title" tabindex="-1"></h3><div class="area-turn" hidden><p class="area-turn-purpose">斜めのAP・BPも、底辺と高さにできる？<br>回して、見やすい向きにしてみよう。</p><p class="muted area-turn-skip">もう底辺と高さが見えている人は、そのまま次へ進めます。</p><label class="control">三角形の向き <input type="range" min="0" max="100" step="5" value="0" aria-label="三角形の回転量"></label><button class="button" data-horizontal>底辺APを水平にする</button> <button class="button" data-original>元の向きに戻す</button><p class="muted">変えるのは向きだけ。辺の長さ・角度・面積は同じ。</p></div><figure><svg viewBox="0 0 550 460" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div aria-live="polite" aria-atomic="true"><p class="angle-story-before muted"></p><p class="angle-story-message"></p><p class="angle-story-formula" hidden></p></div><div class="area-detour" hidden><h4>公式は使える。あえて別の見方で考えてみる？</h4><p>同じ三角形をもう1枚合わせたら、どんな形になるだろう。<br>公式の「÷2」が、図ではどう見えるか確かめてみよう。</p><button class="button" data-explore>もう1枚合わせて考える（寄り道）</button><p class="muted">ここまでで問題は解けています。気になったら、のぞいてみよう。</p></div><p class="angle-story-links">紙へ：<a href="#q22">問22を自分で解く</a> · <a href="../pythagorean/index.html#lesson-8">次は、この直角から直径の長さを求める</a></p><details><summary>元の解説と、三平方へのつながり</summary></details>`;
 seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-angle-story');
 let index=0;const slider=seq.querySelector('input'),svg=seq.querySelector('svg');
 const line=(a,b,c=gray,w=2,dash='',attr='')=>`<line ${attr} x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
 const text=(p,s,c=ink,size=18)=>`<text x="${p[0]}" y="${p[1]}" fill="${c}" text-anchor="middle" font-size="${size}">${s}</text>`;
 function draw(){
  const t=index>=2?Number(slider.value)/100:0,theta=t*Math.atan2(4,3),cs=Math.cos(theta),sn=Math.sin(theta);
  const move=([x,y])=>[238+97*t+(x-238)*cs-(y-106)*sn,106-t+(x-238)*sn+(y-106)*cs];
  const A=move([130,250]),B=move([430,250]),P=move([238,106]),O=move([280,250]),Q=move([322,394]);
  const centre=[(A[0]+B[0]+P[0])/3,(A[1]+B[1]+P[1])/3];
  const outward=(p,d)=>{const n=Math.hypot(p[0]-centre[0],p[1]-centre[1]);return[p[0]+d*(p[0]-centre[0])/n,p[1]+d*(p[1]-centre[1])/n+6];};
  let g=text([275,24],'例題：ABは直径、AP＝6 cm、BP＝8 cm',ink,14);
  if(index<2){g+=`<circle cx="${O[0]}" cy="${O[1]}" r="150" fill="none" stroke="#a5afa9" stroke-width="1.5"/>`+text([O[0],O[1]+27],'O',ink,17)+`<circle cx="${O[0]}" cy="${O[1]}" r="2.5" fill="${ink}"/>`;if(index===1)g+=`<path data-half-circle d="M ${A} A 150 150 0 0 0 ${B}" fill="none" stroke="${blue}" stroke-width="4"/>`;}
  if(index>=4)g+=`<polygon data-copy points="${A} ${Q} ${B}" fill="#f3ede1"/>`+line(A,Q,brown,2,'6 5')+line(Q,B,blue,2,'6 5');
  g+=`<polygon data-triangle points="${A} ${P} ${B}" fill="${index>=2?'#edf2e8':'none'}"/>`+line(A,B,gray,1.5,index>=4?'5 4':'','data-ab')+line(A,P,index>=2?blue:gray,index>=2?3:2,'','data-ap')+line(P,B,index>=2?brown:gray,index>=2?3:2,'','data-bp');
  if(index>=1){const u=[(A[0]-P[0])/180*14,(A[1]-P[1])/180*14],v=[(B[0]-P[0])/240*14,(B[1]-P[1])/240*14];g+=`<path data-right d="M ${P[0]+u[0]} ${P[1]+u[1]} l ${v} l ${-u[0]} ${-u[1]}" fill="none" stroke="${ink}" stroke-width="2"/>`;}
  g+=text(outward(A,24),'A')+text(outward(B,24),'B')+text(outward(P,24),'P');
  if(index>=2){const label=(a,b,s,c)=>{const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy);let nx=-dy/n,ny=dx/n;if(nx*(centre[0]-mid[0])+ny*(centre[1]-mid[1])>0){nx=-nx;ny=-ny;}return text([mid[0]+nx*54,mid[1]+ny*54+6],s,c,18);};g+=label(A,P,'底辺 6 cm',blue)+label(P,B,'高さ 8 cm',brown);}
  const captions=['面積を求めるために、直角を探そう','半円の180° ÷ 2 → Pの角は90°','AP ⊥ BP。だから底辺と高さにできる','三角形の面積：6 × 8 ÷ 2 ＝ 24 cm²','実線の三角形 ＋ 同じ三角形 ＝ 長方形','△APBの面積：6 × 8 ÷ 2 ＝ 24 cm²'];
  g+=text([275,440],captions[index],ink,17);svg.innerHTML=g;svg.setAttribute('aria-label',titles[index]+'。'+messages[index]);
  seq.querySelector('.area-turn').hidden=index<2;
  seq.querySelector('.area-turn-purpose').textContent=index>=4?'同じ三角形2枚を、向きを変えて見比べよう。':index===2?'斜めのAP・BPも、底辺と高さにできる？ 回して、見やすい向きにしてみよう。':'向きを変えても、底辺6 cm・高さ8 cmは同じです。';
  seq.querySelector('.area-turn-skip').hidden=index!==2;
  seq.querySelector('.area-detour').hidden=index!==3;
  seq.querySelector('[data-return]').hidden=index<4;
  seq.querySelector('.angle-story-title').textContent=titles[index];
  seq.querySelector('.angle-story-count').textContent=index<4?`${index+1} / 4`:`寄り道 ${index-3} / 2`;
  seq.querySelector('.angle-story-message').textContent=messages[index];
  seq.querySelector('.angle-story-before').textContent=index===4?'ここからは別の見方。同じ答えを、長方形から確かめます。':index?'ひとつ前：'+titles[index-1]:'';
  const formula=seq.querySelector('.angle-story-formula');formula.hidden=index!==3&&index!==5;
  formula.innerHTML=index===3?'面積 ＝ 底辺 × 高さ ÷ 2<br>＝ <span class="circle-blue">6</span> × <span class="circle-brown">8</span> ÷ 2<br>＝ 24 cm²':'<span class="circle-blue">6</span> × <span class="circle-brown">8</span> ＝ 48 cm²<br>48 ÷ 2 ＝ 24 cm²';
  seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0||index===4));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===3||index===5));
  for(const button of seq.querySelectorAll('[data-jump]')){const i=Number(button.dataset.jump);button.setAttribute('aria-pressed',String(index<4&&(i===0?index<2:index===i)));}
 }
 seq.querySelector('[data-back]').onclick=()=>{if(index!==0&&index!==4){index--;draw();}};seq.querySelector('[data-next]').onclick=()=>{if(index!==3&&index!==5){index++;draw();}};
 function switchPath(target){index=target;draw();seq.querySelector('.angle-story-title').focus({preventScroll:true});seq.querySelector('.angle-story-controls').scrollIntoView({block:'center',behavior:'instant'});}
 seq.querySelector('[data-explore]').onclick=()=>switchPath(4);
 seq.querySelector('[data-return]').onclick=()=>switchPath(3);
 seq.querySelector('[data-reset]').onclick=()=>{index=0;slider.value=0;seq.querySelector('details').open=false;draw();};slider.oninput=draw;
 seq.querySelector('[data-horizontal]').onclick=()=>{slider.value=100;draw();};seq.querySelector('[data-original]').onclick=()=>{slider.value=0;draw();};
 for(const button of seq.querySelectorAll('[data-jump]'))button.onclick=()=>{index=Number(button.dataset.jump);draw();};
 seq.querySelector('[data-zoom]').onclick=()=>{const dialog=document.querySelector('.figure-dialog');dialog.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));dialog.showModal();};draw();
})();
