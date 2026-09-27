/* Two different right triangles: find the right angle before the hypotenuse. */
(()=>{
 'use strict';
 const seq=document.getElementById('circle-length-sequence');if(!seq)return;
 const find=s=>seq.querySelector('#circle-length-'+s),blue='#3566a0',brown='#98502f',ink='#253b39',gray='#77857e',light='#d8dfd6';
 const term=(s,c)=>`<span class="sequence-${c}">${s}</span>`,change=s=>`<span class="sequence-change">${s}</span>`;
 const eq=(u,b,c)=>`${term(u+'²','height')} ＋ ${term(b+'²','base')} ＝ ${c}²`;
 const steps={chord:[
  ['中心から弦までの距離は？','半径5 cm、弦ABは8 cm。中心Oから弦ABまでの距離を求めます。どこに直角を作れるでしょう？'],
  ['2本の半径で、二等辺三角形になる','OとA、OとBを結びます。OAもOBも半径なので5 cm。△OABは二等辺三角形です。'],
  ['中心から弦へ、垂線を下ろす','OからABに垂線を下ろし、交わる点をHとします。求めたい距離は、このOHです。Hに直角ができました。'],
  ['二等辺三角形だから、弦も半分','二等辺三角形の頂点から底辺への垂線は、底辺を二等分します。AH＝HB＝8÷2＝4 cmです。',`${term('AH ＝ HB ＝ 8 ÷ 2 ＝ 4','base')}`],
  ['左側の直角三角形に注目','直角Hの向かい、OAが斜辺で5。残りの辺はOHとAH＝4です。弦全体の8ではなく、半分の4を使います。',eq('OH',4,5)],
  ['両辺から4²を引く','左辺の4²を消すため、両辺から4²を引きます。OH²だけが残ります。',`${term('OH²','height')} ＝ 5² ${change('− 4²')}`],
  ['二乗した数に置き換える','5²＝25、4²＝16です。',`${term('OH²','height')} ＝ ${change('25 − 16')}`],
  ['引き算をする','25−16＝9。ここで分かったのは、OHの二乗です。',`${term('OH²','height')} ＝ ${change('9')}`],
  ['長さに戻すと、OH＝3 cm','長さは正なので、OH＝√9＝3 cm。半径と弦の半分を使って、中心からの距離が求まりました。',change(term('OH ＝ √9 ＝ 3 cm','height'))]
 ],tangent:[
  ['接点までの長さPAを求める','半径5 cmの円Oに、外の点Pから接線PAを引いています。Aが接点で、OP＝13 cm。PAの長さを求めます。'],
  ['中心と接点を結び、半径OAを引く','Oと接点Aを結びます。OAは半径なので5 cmです。これで△OAPができました。'],
  ['接点への半径と、接線は垂直','半径OAと接線PAは、接点Aで垂直です。直角があるのは、中心Oではなく接点Aです。'],
  ['直角Aの向かい、OPが斜辺','この図の斜辺はOP＝13。半径OA＝5は、直角をはさむ辺の一つです。直角の位置から、使う辺を決めよう。',eq('PA',5,13)],
  ['両辺から5²を引く','左辺の5²を消すため、両辺から5²を引きます。PA²だけが残ります。',`${term('PA²','height')} ＝ 13² ${change('− 5²')}`],
  ['二乗した数に置き換える','13²＝169、5²＝25です。',`${term('PA²','height')} ＝ ${change('169 − 25')}`],
  ['引き算をする','169−25＝144。ここで分かったのは、PAの二乗です。',`${term('PA²','height')} ＝ ${change('144')}`],
  ['長さに戻すと、PA＝12 cm','長さは正なので、PA＝√144＝12 cm。半径がいつも斜辺になるわけではありません。直角の向かいを確かめよう。',change(term('PA ＝ √144 ＝ 12 cm','height'))]
 ]};
 let mode='chord';const position={chord:0,tangent:0};
 const pt=(x,y)=>({x,y});
 const line=(a,b,c=gray,w=1.7,dash='')=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
 const text=(x,y,s,c=ink,size=19)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" text-anchor="middle">${s}</text>`;
 const polygon=(pts,fill)=>`<polygon data-triangle points="${pts.map(p=>p.x+','+p.y).join(' ')}" fill="${fill}" stroke="none"/>`;
 const circle=o=>`<circle data-circle cx="${o.x}" cy="${o.y}" r="120" fill="none" stroke="${gray}" stroke-width="1.5"/>`;
 const point=(p,name,x,y)=>`<circle data-point="${name}" cx="${p.x}" cy="${p.y}" r="3.5" fill="${ink}"/>`+text(x,y,name);
 function chord(i){
  const O=pt(320,205),A=pt(224,277),B=pt(416,277),H=pt(320,277);
  let g=text(320,26,'半径5 cm ／ 弦AB＝8 cm',gray,18)+circle(O);
  if(i>=4)g+=polygon([O,A,H],'#f1f2ef');
  g+=`<g data-chord>${line(A,B,i>=4?light:gray)}</g>`;
  if(i>=1){g+=`<g data-oa>${line(O,A,ink,i>=4?3:2)}</g><g data-ob>${line(O,B,i>=4?light:ink,2)}</g>`;
   g+=text(254,230,'5',ink,22)+text(386,230,'5',i>=4?gray:ink,22);
  }
  if(i>=2){g+=`<g data-oh>${line(O,H,blue,3,'5 3')}</g><path data-right d="M 308 277 v -12 h 12" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
   g+=point(H,'H',338,299)+text(298,255,i===8?'3':'?',blue,22);
  }
  if(i>=3){g+=`<g data-half>${line(A,H,brown,3)}</g>`;
   for(const [x,labelX]of [[256,280],[384,360]])g+=line(pt(x,271),pt(x,283),i>=4&&x>320?gray:brown,2)+text(labelX,305,'4',i>=4&&x>320?gray:brown,22);
  }
  g+=point(O,'O',320,185)+point(A,'A',205,292)+point(B,'B',436,292);
  g+=line(pt(224,357),pt(416,357))+line(pt(224,352),pt(224,362))+line(pt(416,352),pt(416,362))+text(320,386,'8（弦全体）',gray,20);
  g+=text(320,447,i>=4?'直角Hの向かい：斜辺はOA':i>=3?'AHとHBは、どちらも弦の半分':i>=2?'求めたい距離は、垂直に下ろしたOH':i>=1?'OA＝OB。同じ円の半径は等しい':'中心から弦へ、どう線を引こう？',ink,18);
  return g;
 }
 function tangent(i){
  const O=pt(225,345),A=pt(345,345),P=pt(345,57);
  let g=text(200,27,'半径5 cm ／ OP＝13 cm',gray,18)+circle(O);
  if(i>=3)g+=polygon([O,A,P],'#f1f2ef');
  g+=line(A,pt(345,445),gray,1.4)+`<g data-pa>${line(P,A,blue,3)}</g><g data-op>${line(O,P,ink,i>=3?3:1.8)}</g>`;
  g+=text(260,190,'13',ink,22)+text(376,205,i===7?'12':'?',blue,22);
  if(i>=1)g+=`<g data-oa>${line(O,A,brown,3)}</g>`+text(285,374,'5',brown,22);
  if(i>=2)g+=`<path data-right d="M 333 345 v -12 h 12" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
  g+=point(O,'O',204,366)+point(A,'A',366,366)+point(P,'P',367,63);
  g+=text(480,405,'PAは接線',blue,18);
  g+=text(320,494,i>=3?'直角Aの向かい：斜辺はOP':i>=2?'接点Aで、半径と接線が直角に交わる':i>=1?'半径OAを引くと、三角形ができた':'Aは、接線が円にふれる点',ink,18);
  return g;
 }
 function render(){
  const i=position[mode],s=steps[mode][i],start=mode==='chord'?4:3;
  seq.dataset.mode=mode;seq.dataset.step=String(i);
  seq.querySelectorAll('[data-circle-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.circleMode===mode)));
  find('plot').innerHTML=mode==='chord'?chord(i):tangent(i);find('plot').setAttribute('aria-label',s[0]+'。'+s[1]);
  find('title').textContent=s[0];find('message').textContent=s[1];find('count').textContent=`${i+1} / ${steps[mode].length}`;
  find('calculation').hidden=!s[2];find('formula').innerHTML=s[2]||'';
  const prev=i>start?steps[mode][i-1][2]:null;find('previous').hidden=!prev;find('previous').innerHTML=prev?'ひとつ前：'+prev:'';
  find('practice').hidden=i!==steps[mode].length-1;find('practice').innerHTML=mode==='chord'?'紙で確かめよう：<a href="#q16">問16</a> · <a href="#q18">問18：弦の長さを求める</a>':'紙で確かめよう：<a href="#q17">問17：接線の長さ</a>';
  for(const [name,disabled]of [['prev',i===0],['reset',i===0],['next',i===steps[mode].length-1]])find(name).setAttribute('aria-disabled',String(disabled));
 }
 find('next').addEventListener('click',()=>{if(position[mode]<steps[mode].length-1){position[mode]++;render();}});
 find('prev').addEventListener('click',()=>{if(position[mode]>0){position[mode]--;render();}});
 find('reset').addEventListener('click',()=>{position[mode]=0;seq.querySelector('details').open=false;render();});
 seq.querySelectorAll('[data-circle-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.circleMode;seq.querySelector('details').open=false;render();}));
 const card=seq.closest('.concept-card');seq.querySelector('details').append(card.querySelector('.height-static ol').cloneNode(true));render();seq.hidden=false;card.classList.add('has-height-sequence');
})();
