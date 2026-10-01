/* Read an inscribed angle before using a formula: endpoints, two arcs, then exclude P. */
(()=>{
 'use strict';
 const card=document.getElementById('lesson-1');if(!card)return;
 const blue='#3566a0',brown='#98502f',ink='#253b39',O=[275,210],R=105;
 const pt=(d,r=R)=>[O[0]+r*Math.cos(d*Math.PI/180),O[1]-r*Math.sin(d*Math.PI/180)];
 const text=(p,s,c=ink,size=17)=>`<text x="${p[0]}" y="${p[1]}" text-anchor="middle" fill="${c}" font-size="${size}">${s}</text>`;
 const line=(a,b,c,w=2,extra='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" ${extra}/>`;
 const arc=(start,span,c,dash='')=>`<path data-arc="${span===120?'short':'long'}" d="M ${pt(start)} A ${R} ${R} 0 ${span>180?1:0} 0 ${pt(start+span)}" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="${dash}"/>`;
 const seq=document.createElement('div');seq.id='arc-reading-story';seq.className='angle-story interactive';
 seq.innerHTML=`<p>まずは角度を計算せず、<strong>角が見ている弧</strong>を探そう。A・Bは固定し、円周上のPだけを移します。</p><div class="prior-chapters" aria-label="頂点Pの位置"><button class="button" data-side="top">Pを上側に置く</button><button class="button" data-side="bottom">Pを下側に置く</button></div><div class="angle-story-controls"><button class="button" data-back>ひとつ前</button><span class="angle-story-count"></span><button class="button primary" data-next>次の手順</button><button class="button" data-reset>最初から</button></div><h3 class="angle-story-title"></h3><figure><svg viewBox="0 0 550 450" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div class="arc-choices" hidden><p>Pを含まないのは、どちらの弧？</p><button class="button" data-choice="short">下を回る短い弧</button> <button class="button" data-choice="long">上を回る長い弧</button></div><div aria-live="polite" aria-atomic="true"><p class="angle-story-before muted"></p><p class="angle-story-message"></p></div><p class="angle-story-links">角度も比べたくなったら、<a href="#move-lab">Pを動かす体験へ</a>。紙では<a href="#q1">問1</a>で、弧と弦を確認しよう。</p><details><summary>弧と弦の違い・元の解説</summary><p>弧ABは円周に沿った部分。弦ABはAとBをまっすぐ結ぶ線分です。この体験では、円周に沿う2つの道を比べています。</p></details>`;
 seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-angle-story');
 let side='top',index=0,choice=null;const svg=seq.querySelector('svg');
 function draw(){
  const top=side==='top',P=pt(top?90:270),A=pt(210),B=pt(330),correct=top?'short':'long';
  const titles=['出発点は、角の頂点P','2本の線を、A・Bまでたどる','AからBへ、円周の道は2つある','Pを含まない方が、この角の弧'];
  let g=text([275,23],'A・Bは固定。Pは円周上の頂点',ink,14)+`<circle cx="275" cy="210" r="105" fill="none" stroke="#a5afa9" stroke-width="1.5"/>`;
  if(index===2||index===3&&top)g+=arc(210,120,blue);
  if(index===2||index===3&&!top)g+=arc(330,240,brown,'7 4');
  g+=line(P,A,index>=1?ink:'#a5afa9',index>=1?2.3:1.5,'data-pa')+line(P,B,index>=1?ink:'#a5afa9',index>=1?2.3:1.5,'data-pb');
  const u=Math.atan2(A[1]-P[1],A[0]-P[0]),v=Math.atan2(B[1]-P[1],B[0]-P[0]),d=(v-u+3*Math.PI)%(2*Math.PI)-Math.PI,r=17,a=[P[0]+r*Math.cos(u),P[1]+r*Math.sin(u)],b=[P[0]+r*Math.cos(v),P[1]+r*Math.sin(v)];
  g+=`<path d="M ${a} A ${r} ${r} 0 0 ${d>0?1:0} ${b}" stroke="${ink}" stroke-width="2" fill="none"/>`;
  for(const [p,s]of [[A,'A'],[B,'B'],[P,'P']]){g+=`<circle cx="${p[0]}" cy="${p[1]}" r="${s==='P'||index>=1?4:2}" fill="${ink}"/>`;const label=s==='P'?pt(top?90:270,137):pt(s==='A'?210:330,135);g+=text([label[0],label[1]+6],s,ink,19);}
  if(index>=2){if(index===2||!top)g+=text([275,53],'破線：上を回る長い弧AB',brown);if(index===2||top)g+=text([275,390],'実線：下を回る短い弧AB',blue);}
  g+=text([275,431],index===3?(top?'Pは上側 → 下を回る弧を見る':'Pは下側 → 上を回る弧を見る'):index===2?'円周をたどる。Pを通らないのは？':index===1?'線が届く先は、どちらもA・B':'Pでできる角に注目',index===3?(top?blue:brown):ink);
  svg.innerHTML=g;
  let message=['Pが角の頂点です。ここから伸びる2本の線を、目でたどってみよう。','線が円周に届く先はAとB。この2点が、探す弧の両端になります。','下を回っても、上を回ってもAとBを結べます。角の頂点Pを途中で通らない道を選んでみよう。',top?'下を回る短い弧にはPがありません。次はPを下側に置き、同じように探してみよう。':'今度は上を回る長い弧にPがありません。「いつも短い方」ではなく「Pを含まない方」を選びます。'][index];
  if(index===3&&choice)message=(choice===correct?'選んだ道にはPがありません。':'選んだ道は途中でPを通ります。もう一方の道に注目しよう。')+' '+message;
  svg.setAttribute('aria-label',titles[index]+'。'+message);seq.querySelector('.angle-story-title').textContent=titles[index];seq.querySelector('.angle-story-count').textContent=`${index+1} / 4`;seq.querySelector('.angle-story-message').textContent=message;seq.querySelector('.angle-story-before').textContent=index?'ひとつ前：'+titles[index-1]:'';seq.querySelector('.arc-choices').hidden=index!==2;
  for(const b of seq.querySelectorAll('[data-side]'))b.setAttribute('aria-pressed',String(b.dataset.side===side));
  seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===3));seq.querySelector('[data-next]').textContent=index===2?'弧を確かめる':'次の手順';
 }
 for(const b of seq.querySelectorAll('[data-side]'))b.onclick=()=>{side=b.dataset.side;index=0;choice=null;draw();};
 for(const b of seq.querySelectorAll('[data-choice]'))b.onclick=()=>{choice=b.dataset.choice;index=3;draw();seq.querySelector('[data-back]').focus();};
 seq.querySelector('[data-back]').onclick=()=>{if(index>0){index--;choice=null;draw();}};seq.querySelector('[data-next]').onclick=()=>{if(index<3){index++;choice=null;draw();}};
 seq.querySelector('[data-reset]').onclick=()=>{side='top';index=0;choice=null;seq.querySelector('details').open=false;draw();};
 seq.querySelector('[data-zoom]').onclick=()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));d.showModal();};draw();
})();

/* Keep the intercepted arc fixed while changing the viewpoint from O to P. */
(()=>{
 'use strict';
 const card=document.getElementById('lesson-2');if(!card)return;
 const blue='#3566a0',brown='#98502f',green='#285c50',gray='#a5afa9',ink='#253b39',O=[275,210],R=110;
 const pt=(d,r=R)=>[275+r*Math.cos(d*Math.PI/180),210-r*Math.sin(d*Math.PI/180)];
 const line=(a,b,c,w=2,attrs='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" ${attrs}/>`;
 const text=(p,s,c=ink,size=17)=>`<text x="${p[0]}" y="${p[1]}" text-anchor="middle" fill="${c}" font-size="${size}">${s}</text>`;
 const wedge=(a,p,b,r,c,fill,attrs='')=>{const u=Math.atan2(a[1]-p[1],a[0]-p[0]),v=Math.atan2(b[1]-p[1],b[0]-p[0]),d=(v-u+3*Math.PI)%(2*Math.PI)-Math.PI,q=[p[0]+r*Math.cos(u),p[1]+r*Math.sin(u)],z=[p[0]+r*Math.cos(v),p[1]+r*Math.sin(v)];return `<path ${attrs} d="M ${p} L ${q} A ${r} ${r} 0 0 ${d>0?1:0} ${z} Z" stroke="${c}" stroke-width="1.8" fill="${fill}"/>`;};
 const seq=document.createElement('div');seq.id='half-angle-story';seq.className='angle-story interactive';
 seq.innerHTML=`<div class="example-context"><strong>この体験の設定</strong><p>Oは円の中心、Pは円周上の頂点です。<br>A・Bの位置を変えて、中心角を<span data-setting>120</span>°にします。Pの角は何度になる？</p></div><label class="control">中心角の設定：<output>120°</output><input type="range" min="40" max="160" step="10" value="120" aria-label="中心角の設定"></label><div class="angle-story-controls"><button class="button" data-back>ひとつ前</button><span class="angle-story-count"></span><button class="button primary" data-next>中心から見る</button><button class="button" data-reset>最初から</button></div><h3 class="angle-story-title"></h3><figure><svg viewBox="0 0 550 470" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div aria-live="polite" aria-atomic="true"><p class="angle-story-before muted"></p><p class="angle-story-message"></p><p class="angle-story-formula" hidden></p></div><p class="angle-story-links">なぜ半分になる？ <a href="#proof-lab">半径を引いて、理由をたどる</a>。<br>Pの位置も変えてみるなら<a href="#move-lab">動く体験へ</a>。紙では<a href="#q2">問2</a>〜<a href="#q4">問4</a>。</p><details><summary>元の解説をまとめて読む</summary></details>`;
 seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-angle-story');
 let index=0;const slider=seq.querySelector('input'),svg=seq.querySelector('svg');
 function draw(){
  const central=Number(slider.value),a=270-central/2,b=270+central/2,A=pt(a),B=pt(b),P=pt(90),inscribed=central/2;
  const titles=['先に、同じ弧ABをそろえる','中心Oから、A・Bへ結ぶ','円周上Pからも、同じA・Bへ','同じ弧なら、Pの角はOの角の半分'];
  // Find one clear centre-label position using every stage's lines, so it stays put.
  const hits=(u,v,x,y)=>{let lo=0,hi=1;for(let k=0;k<2;k++){const min=(k?y:x)-(k?12:11),max=(k?y:x)+(k?12:11),d=v[k]-u[k];if(Math.abs(d)<1e-9){if(u[k]<min||u[k]>max)return false;}else{const s=(min-u[k])/d,t=(max-u[k])/d;lo=Math.max(lo,Math.min(s,t));hi=Math.min(hi,Math.max(s,t));if(lo>hi)return false;}}return true;};
  const cuts=[[P,A],[P,B],[O,A],[O,B]];for(let i=0;i<32;i++)cuts.push([pt(a+central*i/32,30),pt(a+central*(i+1)/32,30)]);
  let tag=null;for(const radius of [24,42,53]){for(let d=0;d<360;d+=15){const p=pt(d,radius);if(!cuts.some(([u,v])=>hits(u,v,p[0],p[1]))){tag=p;break;}}if(tag)break;}
  let g=text([275,23],`設定：中心角 ${central}° ／ Pは円周上`,ink,14)+`<circle cx="275" cy="210" r="110" fill="none" stroke="${gray}" stroke-width="1.5"/><path data-shared-arc d="M ${A} A 110 110 0 0 0 ${B}" fill="none" stroke="${green}" stroke-width="5"/>`;
  g+=line(P,A,index>=2?blue:gray,index>=2?2.5:1.4,'data-pa')+line(P,B,index>=2?blue:gray,index>=2?2.5:1.4,'data-pb');
  if(index>=1)g+=line(O,A,brown,2,'data-oa stroke-dasharray="5 3"')+line(O,B,brown,2,'data-ob stroke-dasharray="5 3"')+wedge(A,O,B,30,brown,'#f4e4d7','data-central');
  if(index>=2)g+=wedge(A,P,B,22,blue,'#e2ecf7','data-inscribed');
  g+=`<circle cx="275" cy="210" r="2.5" fill="${brown}"/>`+text([tag[0],tag[1]+6],'O',brown,18)+text([275,76],'P',blue,19);
  for(const [d,s]of [[a,'A'],[b,'B']]){const p=pt(d,138);g+=text([p[0],p[1]+6],s)+`<circle cx="${pt(d)[0]}" cy="${pt(d)[1]}" r="3" fill="${green}"/>`;}
  g+=text([275,375],'どちらも、この緑の弧ABを見る',green,16);
  if(index>=1)g+=text([275,408],`Oの中心角：${central}°`,brown,19);
  if(index>=2)g+=text([275,441],`Pの円周角：${index===3?inscribed+'°':'？'}`,blue,19);
  svg.innerHTML=g;svg.dataset.central=String(central);svg.dataset.inscribed=String(inscribed);
  const messages=[
   'Pを含まない、下側の弧ABを緑で示しました。この弧を変えずに、見る場所をOとPで比べます。',
   `茶色の破線は半径OA・OB。中心Oにできる角が「中心角」です。この例では${central}°に設定しました。`,
   '青い2本はPA・PB。円周上Pにできる角が「円周角」です。線の先はさっきと同じA・B。Pの角は何度になるか、予想してみよう。',
   `同じ弧に対する円周角は中心角の半分。${central}÷2＝${inscribed}°です。設定を変えても、この関係で求められます。なぜ半分になるかは、下の「理由をたどる」で確かめよう。`
  ];
  seq.querySelector('[data-setting]').textContent=central;seq.querySelector('output').textContent=central+'°';slider.setAttribute('aria-valuetext',central+'度');
  seq.querySelector('.angle-story-title').textContent=titles[index];seq.querySelector('.angle-story-count').textContent=`${index+1} / 4`;seq.querySelector('.angle-story-before').textContent=index?'ひとつ前：'+titles[index-1]:'';seq.querySelector('.angle-story-message').textContent=messages[index];
  const f=seq.querySelector('.angle-story-formula');f.hidden=index!==3;f.innerHTML=`<span class="circle-brown">中心角 ${central}°</span> ÷ 2<br>＝ <span class="circle-blue">円周角 ${inscribed}°</span><br><small>逆に求めるなら、<span class="circle-blue">${inscribed}°</span> × 2 ＝ <span class="circle-brown">${central}°</span></small>`;
  svg.setAttribute('aria-label',titles[index]+'。'+messages[index]);seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===3));seq.querySelector('[data-next]').textContent=['中心から見る','円周上から見る','角度を確かめる','角度を確かめる'][index];
 }
 slider.oninput=()=>{index=0;draw();};seq.querySelector('[data-back]').onclick=()=>{if(index>0){index--;draw();}};seq.querySelector('[data-next]').onclick=()=>{if(index<3){index++;draw();}};
 seq.querySelector('[data-reset]').onclick=()=>{index=0;slider.value=120;seq.querySelector('details').open=false;draw();};seq.querySelector('[data-zoom]').onclick=()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));d.showModal();};draw();
})();

/* A changed triangle can still intercept the same arc; crossing AB changes the arc. */
(()=>{
 'use strict';
 const card=document.getElementById('lesson-3');if(!card)return;
 const blue='#3566a0',brown='#98502f',gray='#a5afa9',ink='#253b39',O=[275,205],R=105;
 const pt=(d,r=R)=>[275+r*Math.cos(d*Math.PI/180),205-r*Math.sin(d*Math.PI/180)];
 const A=pt(210),B=pt(330),Q=pt(270),old=pt(75);
 const line=(a,b,c,w=2,extra='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" ${extra}/>`;
 const text=(p,s,c=ink,size=17)=>`<text x="${p[0]}" y="${p[1]}" text-anchor="middle" fill="${c}" font-size="${size}">${s}</text>`;
 const arc=(start,span,r,c,extra='')=>`<path d="M ${pt(start,r)} A ${r} ${r} 0 ${span>180?1:0} 0 ${pt(start+span,r)}" fill="none" stroke="${c}" stroke-width="${r===R?4:2}" ${extra}/>`;
 const mark=(a,p,b,c)=>{const u=Math.atan2(a[1]-p[1],a[0]-p[0]),v=Math.atan2(b[1]-p[1],b[0]-p[0]),d=(v-u+3*Math.PI)%(2*Math.PI)-Math.PI,r=20,s=[p[0]+r*Math.cos(u),p[1]+r*Math.sin(u)],z=[p[0]+r*Math.cos(v),p[1]+r*Math.sin(v)];return `<path d="M ${p} L ${s} A ${r} ${r} 0 0 ${d>0?1:0} ${z} Z" fill="${c===blue?'#e2ecf7':'#f4e4d7'}" stroke="${c}" stroke-width="1.8"/>`;};
 const seq=document.createElement('div');seq.id='same-arc-story';seq.className='angle-story interactive';
 seq.innerHTML=`<div class="example-context"><strong>この体験の設定</strong><p>A・Bと円は固定。短い弧ABに対応する中心角を120°とします。<br>まず同じ側でPを動かし、次に反対側のQと比べます。</p></div><div class="prior-chapters" aria-label="見直すところ"><button class="button" data-jump="0">同じ側で比べる</button><button class="button" data-jump="3">反対側を比べる</button></div><div class="angle-story-controls"><button class="button" data-back>ひとつ前</button><span class="angle-story-count"></span><button class="button primary" data-next>同じ側で動かす</button><button class="button" data-reset>最初から</button></div><h3 class="angle-story-title"></h3><div data-position hidden><label class="control">同じ側でのPの位置：<output></output><input type="range" min="35" max="145" step="5" value="135" aria-label="同じ側でのPの位置"></label></div><figure><svg viewBox="0 0 550 470" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div aria-live="polite" aria-atomic="true"><p class="angle-story-before muted"></p><p class="angle-story-message"></p><p class="angle-story-formula" hidden></p></div><p class="angle-story-links">半分になる理由は<a href="#proof-lab">半径を引いてたどる</a>。<br>両側で自由に動かすなら<a href="#move-lab">体験1へ</a>。紙では<a href="#q5">問5</a>〜<a href="#q8">問8</a>。</p><details><summary>元の解説をまとめて読む</summary></details>`;
 seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-angle-story');
 let index=0;const svg=seq.querySelector('svg'),slider=seq.querySelector('input');
 function draw(){
  const opposite=index>=3,p=index===0?75:Number(slider.value),P=pt(p),span=opposite?240:120,start=opposite?330:210;
  const titles=['最初のPは、どの弧を見ている？','三角形の形は変わった。角度は？','同じ弧だから、同じ半分になる','反対側のQは、どの弧を見る？','弧が変わると、半分にする角も変わる'];
  let g=text([275,23],'設定：短い弧ABに対応する中心角は120°',ink,14)+`<circle cx="275" cy="205" r="105" fill="none" stroke="${gray}" stroke-width="1.5"/>`;
  if(index===1||index===2){if(p!==75)g+=`<g data-previous>${line(old,A,gray,1.3,'stroke-dasharray="4 4"')+line(old,B,gray,1.3,'stroke-dasharray="4 4"')}</g>`;g+=text([275,53],p===75?'今は、最初の位置と同じ':'薄い破線：最初の位置',ink,14);}
  g+=line(A,B,gray,1.3,'data-fixed-chord')+arc(start,span,R,opposite?brown:blue,'data-seen-arc');
  if(opposite)g+=arc(210,120,R,'#ccd7e3','stroke-dasharray="4 4" data-old-arc');
  g+=line(P,A,opposite?'#afc2d8':blue,opposite?1.4:2.5,'data-pa')+line(P,B,opposite?'#afc2d8':blue,opposite?1.4:2.5,'data-pb');
  if(opposite)g+=line(Q,A,brown,2.5,'data-qa')+line(Q,B,brown,2.5,'data-qb')+mark(A,Q,B,brown);else g+=mark(A,P,B,blue);
  if(index>=2){
   g+=line(O,A,gray,1.4,'stroke-dasharray="5 4"')+line(O,B,gray,1.4,'stroke-dasharray="5 4"')+arc(start,span,30,opposite?brown:blue,'data-centre-arc');
   const cuts=[[A,B],[P,A],[P,B],[old,A],[old,B],[Q,A],[Q,B],[O,A],[O,B]];for(let i=0;i<72;i++)cuts.push([pt(i*5,30),pt((i+1)*5,30)]);
   const hits=(a,b,x,y)=>{let lo=0,hi=1;for(let k=0;k<2;k++){const min=(k?y:x)-(k?12:11),max=(k?y:x)+(k?12:11),d=b[k]-a[k];if(Math.abs(d)<1e-9){if(a[k]<min||a[k]>max)return false;}else{const s=(min-a[k])/d,t=(max-a[k])/d;lo=Math.max(lo,Math.min(s,t));hi=Math.min(hi,Math.max(s,t));if(lo>hi)return false;}}return true;};
   let label=null;for(const radius of [17,48,60]){for(let d=0;d<360;d+=15){const p=pt(d,radius);if(!cuts.some(([a,b])=>hits(a,b,p[0],p[1]))&&Math.hypot(p[0]-275,p[1]-205)>20){label=p;break;}}if(label)break;}
   g+=`<circle cx="275" cy="205" r="2.5" fill="${ink}"/>`+text([label[0],label[1]+6],'O',ink,17);
  }
  for(const [d,s,c]of [[210,'A',ink],[330,'B',ink],[p,'P',blue],...(opposite?[[270,'Q',brown]]:[])]){const v=pt(d,135);g+=text([v[0],v[1]+6],s,c,19);}
  const caption=opposite?'Qを含まないのは、上を回る長い弧':index>=1?'Pを動かしても、下の短い弧は同じ':'Pを含まない、下の短い弧AB';g+=text([275,378],caption,opposite?brown:blue,17);
  if(index===2)g+=text([275,415],'Pの円周角：120° ÷ 2 ＝ 60°',blue,19);
  if(opposite){g+=text([275,410],'対応する中心角：360° − 120° ＝ 240°',brown,16)+text([275,443],index===3?'Qの円周角：？':'Qの円周角：240° ÷ 2 ＝ 120°',brown,19);}
  svg.innerHTML=g;svg.dataset.span=String(span);
  const messages=[
   'PからA・Bへ線をたどると、Pを含まない短い弧ABが見つかります。次にPを動かすと、角度も変わると思う？',
   'スライダーでPを動かそう。線の長さや三角形の形は変わります。でも、青い弧ABは変わりましたか？ 角度も変わるか、予想してから次へ。',
   'どの位置でも、Pが見ているのは同じ短い弧AB。対応する中心角が120°のままなので、その半分の円周角も60°のままです。',
   'Qは弦ABの反対側。短い弧にはQがあるので、見るのは残りの長い弧です。中心角も、茶色の大きい方を使います。Qの角は何度になりそう？',
   '長い弧に対応する中心角240°の半分で、Qの角は120°。「同じ弦AB」だけでは同じ角と言えません。「同じ弧を見ているか」まで確かめよう。'
  ];
  seq.querySelector('.angle-story-title').textContent=titles[index];seq.querySelector('.angle-story-count').textContent=`${index+1} / 5`;seq.querySelector('.angle-story-message').textContent=messages[index];seq.querySelector('.angle-story-before').textContent=index?'ひとつ前：'+titles[index-1]:'';
  const f=seq.querySelector('.angle-story-formula');f.hidden=index!==4;f.innerHTML='<span class="circle-blue">P：短い弧 → 120° ÷ 2 ＝ 60°</span><br><span class="circle-brown">Q：長い弧 → 240° ÷ 2 ＝ 120°</span>';
  seq.querySelector('[data-position]').hidden=index!==1&&index!==2;const pos=Math.round((Number(slider.value)-35)/110*100);seq.querySelector('output').textContent=pos+' / 100';slider.setAttribute('aria-valuetext','位置 '+pos+' / 100');
  svg.setAttribute('aria-label',titles[index]+'。'+messages[index]);seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===4));seq.querySelector('[data-next]').textContent=['同じ側で動かす','理由と角度を確かめる','反対側と比べる','Qの角度を確かめる','Qの角度を確かめる'][index];
  for(const b of seq.querySelectorAll('[data-jump]'))b.setAttribute('aria-pressed',String(Number(b.dataset.jump)===(opposite?3:0)));
 }
 slider.oninput=()=>{index=1;draw();};seq.querySelector('[data-next]').onclick=()=>{if(index<4){index++;draw();}};seq.querySelector('[data-back]').onclick=()=>{if(index>0){index--;draw();}};
 for(const b of seq.querySelectorAll('[data-jump]'))b.onclick=()=>{index=Number(b.dataset.jump);draw();};seq.querySelector('[data-reset]').onclick=()=>{index=0;slider.value=135;seq.querySelector('details').open=false;draw();};seq.querySelector('[data-zoom]').onclick=()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));d.showModal();};draw();
})();

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
