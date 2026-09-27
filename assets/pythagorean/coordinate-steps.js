/* Build a right triangle from coordinate differences, keeping equal axis units. */
(()=>{
 'use strict';
 const seq=document.getElementById('coordinate-sequence');if(!seq)return;
 const find=s=>seq.querySelector('#coordinate-'+s),blue='#3566a0',brown='#98502f',ink='#253b39',gray='#77857e';
 const p=(x,y)=>({x:240+32*x,y:390-32*y}),A=p(-2,1),B=p(4,9),H=p(4,1);
 const line=(a,b,c,w=1.5,dash='')=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
 const text=(x,y,s,c=ink,size=18,anchor='middle')=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" text-anchor="${anchor}" paint-order="stroke" stroke="#fffefb" stroke-width="4" stroke-linejoin="round">${s}</text>`;
 const term=(s,c)=>`<span class="sequence-${c}">${s}</span>`;
 const change=s=>`<span class="sequence-change">${s}</span>`;
 const eq=`AB² ＝ ${term('6²','height')} ＋ ${term('8²','base')}`;
 const steps=[
  ['求めたいのは、斜めの距離AB','A(−2,1)とB(4,9)を、まっすぐ結んだ長さを求めます。まず、横と縦に分けて見てみよう。',null],
  ['横は、x座標の差','Aから右へ、Bと同じx座標4まで進みます。−2から0まで2、0から4まで4。合わせて6です。',term('横：4 − (−2) ＝ 6','height')],
  ['縦は、y座標の差','曲がり角をHとします。Hから上へ、Bと同じy座標9まで進みます。1から9までなので、縦は8です。',term('縦：9 − 1 ＝ 8','base')],
  ['横と縦で、直角三角形ができた','AHはx軸に平行、HBはy軸に平行。だからHの角は90°です。横6・縦8の2辺が分かりました。',`${term('AH ＝ 6','height')} ／ ${term('HB ＝ 8','base')}`],
  ['直角の向かいのABが、斜辺','求めたいABは、この直角三角形の斜辺です。横の6と縦の8を二乗して足します。',eq],
  ['それぞれの数を、二乗する','6²＝36、8²＝64。二乗した数に置き換えます。',`AB² ＝ ${change(term('36','height'))} ＋ ${change(term('64','base'))}`],
  ['二乗した数を足す','36＋64＝100。分かったのは、まだABそのものではなく、AB²です。',`AB² ＝ ${change('100')}`],
  ['長さに戻すと、AB＝10','AB²＝100で、長さは正。だからAB＝√100＝10です。横6＋縦8＝14は、Hで曲がる道のり。まっすぐ結ぶABとは違います。',`${change('AB ＝ √100 ＝ 10')}`]
 ];
 let index=0;
 function render(){
  let g='';
  if(index>=3)g+=`<polygon data-triangle points="${A.x},${A.y} ${H.x},${H.y} ${B.x},${B.y}" fill="#f1f2ef" stroke="none"/>`;
  for(let x=-4;x<=6;x++)g+=line(p(x,-1),p(x,11),'#e8ece5',.8);
  for(let y=-1;y<=11;y++)g+=line(p(-4,y),p(6,y),'#e8ece5',.8);
  g+=`<g data-x-axis>${line(p(-4.4,0),p(6.6,0),gray)}</g><g data-y-axis>${line(p(0,-1.3),p(0,11.4),gray)}</g>`;
  g+=text(466,397,'x',gray)+text(230,17,'y',gray)+text(225,413,'O',gray,16);
  for(const x of [-2,4])g+=text(p(x,0).x,413,String(x).replace('-','−'),index>=1?blue:gray,16);
  g+=text(222,350,'1',index>=2?brown:gray,16)+text(222,108,'9',index>=2?brown:gray,16);
  if(index>=1)g+=`<g data-horizontal>${line(A,H,blue,index===1?4:3)}</g>`+text(285,342,'6',blue,23);
  if(index>=2)g+=`<g data-vertical>${line(H,B,brown,index===2?4:3)}</g>`+text(389,239,'8',brown,23)+text(388,379,'H',gray,18);
  if(index>=3)g+=`<path data-right d="M ${H.x-15} ${H.y} v -15 h 15" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
  g+=`<g data-distance>${line(A,B,index>=4?ink:gray,index>=4?3:1.8)}</g>`;
  g+=text(222,222,index===7?'AB = 10':'AB = ?',ink,21);
  for(const [name,P,x,y,tx,ty]of [['A',A,-2,1,137,334],['B',B,4,9,404,81]]){
   g+=`<circle data-point="${name}" cx="${P.x}" cy="${P.y}" r="4" fill="${ink}"/>`;
   g+=text(tx,ty,`${name}(<tspan fill="${index>=1?blue:ink}">${String(x).replace('-','−')}</tspan>,<tspan fill="${index>=2?brown:ink}">${y}</tspan>)`,ink,18);
  }
  g+=text(320,463,index===0?'x軸とy軸の「1」は同じ長さ':index===1?'横だけ進むと、y座標は1のまま':index===2?'縦だけ進むと、x座標は4のまま':index===7?'求めたのは、AとBをまっすぐ結ぶ長さ':'横の辺・縦の辺・斜辺を見比べよう',gray,17);
  find('plot').innerHTML=g;find('plot').setAttribute('aria-label',steps[index][0]+'。'+steps[index][1]);
  find('title').textContent=steps[index][0];find('message').textContent=steps[index][1];find('count').textContent=`${index+1} / ${steps.length}`;seq.dataset.step=String(index);
  find('calculation').hidden=!steps[index][2];find('formula').innerHTML=steps[index][2]||'';
  const previous=index>=5?steps[index-1][2]:null;find('previous').hidden=!previous;find('previous').innerHTML=previous?'ひとつ前：'+previous:'';
  find('practice').hidden=index!==7;
  for(const [id,disabled]of [['prev',index===0],['next',index===7],['reset',index===0]])find(id).setAttribute('aria-disabled',String(disabled));
 }
 find('next').addEventListener('click',()=>{if(index<7){index++;render();}});
 find('prev').addEventListener('click',()=>{if(index>0){index--;render();}});
 find('reset').addEventListener('click',()=>{index=0;seq.querySelector('details').open=false;render();});
 const card=seq.closest('.concept-card');seq.querySelector('details').append(card.querySelector('.height-static ol').cloneNode(true));
 render();seq.hidden=false;card.classList.add('has-height-sequence');
})();
