/* Special ratios grow out of familiar shapes. Each control belongs to one example. */
(()=>{
 'use strict';
 const blue='#3566a0',brown='#98502f',ink='#253b39',gray='#77857e',light='#d8dfd6';
 const point=(x,y)=>({x,y});
 const line=(a,b,color=gray,width=1.7,dash='')=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash}"/>`;
 const text=(x,y,value,color=ink,size=20)=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="middle">${value}</text>`;
 const poly=(pts,color=gray,fill='none',attr='')=>`<polygon ${attr} points="${pts.map(p=>`${p.x},${p.y}`).join(' ')}" fill="${fill}" stroke="${color}" stroke-width="1.7"/>`;
 const right=(p,dir=1)=>`<path data-right d="M ${p.x+dir*15} ${p.y} v -15 h ${-dir*15}" fill="none" stroke="${gray}" stroke-width="1.5"/>`;
 const term=(s,c)=>`<span class="sequence-${c}">${s}</span>`;
 const arc=(o,r,start,end)=>{const a=start*Math.PI/180,b=end*Math.PI/180;return `<path d="M ${o.x+r*Math.cos(a)} ${o.y+r*Math.sin(a)} A ${r} ${r} 0 0 1 ${o.x+r*Math.cos(b)} ${o.y+r*Math.sin(b)}" fill="none" stroke="${gray}" stroke-width="1.5"/>`;};
 function square(i){
  const A=point(205,325),B=point(435,325),C=point(435,95),D=point(205,95);
  let g=poly([A,B,C,D],i>=2?light:gray,'none','data-original');
  if(i>=2)g+=poly([A,B,C],gray,'#edf3f9','data-focus');
  g+=line(A,B,brown,i>=2?3:1.7)+line(B,C,ink,i>=2?3:1.7)+right(B,-1);
  g+=text(320,356,'1',brown)+text(466,216,'1',ink);
  if(i>=1)g+=`<g data-auxiliary>${line(A,C,blue,3)}</g>`+text(295,195,i>=3?'√2':'x',blue,23);
  if(i===4)g+=arc(A,34,-45,0)+arc(C,34,90,135)+text(278,303,'45°',gray,18)+text(409,169,'45°',gray,18);
  g+=text(320,396,i===4?'直角をはさむ辺：1 と 1 ／ 斜辺：√2':i>=2?'正方形の半分に注目':'一辺が1の正方形',ink,18);
  return g;
 }
 function equilateral(i){
  const A=point(320,325-230*Math.sqrt(3)/2),B=point(205,325),C=point(435,325),H=point(320,325);
  let g=poly([A,B,C],i>=3?light:gray,'none','data-original');
  if(i>=3)g+=poly([A,B,H],gray,'#edf3f9','data-focus')+line(A,B,ink,3)+line(B,H,brown,3);
  g+=text(230,218,'2',ink)+text(410,218,'2',i>=3?gray:ink);
  if(i>=1)g+=`<g data-auxiliary>${line(A,H,blue,3)}</g>`+right(H,-1)+text(342,249,i>=4?'√3':'h',blue,23);
  if(i>=2){
   for(const x of [262.5,377.5])g+=line(point(x,319),point(x,331),brown,2)+text(x,354,'1',brown);
  }
  if(i===5)g+=arc(B,35,-60,0)+arc(A,35,90,120)+text(267,304,'60°',gray,18)+text(299,220,'30°',gray,18);
  g+=line(point(205,378),point(435,378),gray,1)+line(point(205,373),point(205,383))+line(point(435,373),point(435,383))+text(320,408,'2（底辺全体）',gray,18);
  return g;
 }
 const squareEq=`${term('1²','base')} ＋ ${term('1²','side')} ＝ ${term('x²','height')}`;
 const equilateralEq=`${term('1²','base')} ＋ ${term('h²','height')} ＝ ${term('2²','side')}`;
 const examples=[{
  id:'square',draw:square,note:0,steps:[
   ['正方形の辺は、どれも1','対角線の長さはまだ分かりません。正方形の中に、三平方を使える形を作れそうですか？'],
   ['対角線を引くと、三角形が2つ','青い対角線をxと置きました。正方形の角は90°。どちらの三角形にも、直角があります。'],
   ['右下の半分で、式を作る','直角をはさむ2辺は1と1。向かいの青い辺xが斜辺なので、1²＋1²＝x²です。',squareEq],
   ['面積の関係から、長さへ','x²＝2。xは長さなので正の平方根を選び、対角線は√2になります。',`${term('x²','height')} ＝ 2 → ${term('x ＝ √2','height')}`,squareEq],
   ['45°・45°・90°の三角形の比になる','2辺が等しい直角三角形だから、残りの角は45°ずつ。同じ角の三角形は相似なので、大きさが変わってもこの比を使えます。',`${term('1','base')} ： ${term('1','side')} ： ${term('√2','height')}`]
  ]},{
  id:'equilateral',draw:equilateral,note:1,steps:[
   ['今度は、一辺2の正三角形','3辺とも2の正三角形です。高さが分かると、どんな辺の比が見えてくるでしょう？'],
   ['頂点から、底辺へ垂線を下ろす','青い高さhで、2つの直角三角形ができました。斜辺はどちらも2。高さhも共通です。'],
   ['合同だから、底辺は1ずつ','斜辺と他の1辺が等しい直角三角形なので、左右は合同。底辺2も半分に分かれ、2÷2＝1になります。'],
   ['左の直角三角形で考える','底辺1と高さhが直角をはさみ、斜辺は2。正三角形全体の底辺2を使わないようにしよう。',equilateralEq],
   ['高さも、平方根で求まる','h²＝4−1＝3。hは長さなので正の平方根を選び、高さは√3です。',`${term('h²','height')} ＝ 3 → ${term('h ＝ √3','height')}`,equilateralEq],
   ['30°・60°・90°の三角形の比になる','正三角形の角は60°。頂点の角は合同な2つの三角形に分かれるので30°ずつ。同じ角の三角形は相似だから、この比が使えます。',`${term('1','base')} ： ${term('√3','height')} ： ${term('2','side')}`]
  ]}
 ];
 for(const ex of examples){
  const seq=document.getElementById(ex.id+'-sequence');if(!seq)continue;
  const find=name=>seq.querySelector('#'+ex.id+'-'+name);let index=0;
  function render(){
   const [title,message,formula,previous]=ex.steps[index];
   find('plot').innerHTML=ex.draw(index);find('plot').setAttribute('aria-label',title+'。'+message);
   find('count').textContent=`${index+1} / ${ex.steps.length}`;find('title').textContent=title;find('message').textContent=message;
   find('calculation').hidden=!formula;find('formula').innerHTML=formula||'';
   find('previous').hidden=!previous;find('previous').innerHTML=previous?'ひとつ前：'+previous:'';
   for(const [name,disabled] of [['prev',index===0],['reset',index===0],['next',index===ex.steps.length-1]])find(name).setAttribute('aria-disabled',String(disabled));
  }
  find('prev').addEventListener('click',()=>{if(index>0){index--;render();}});
  find('next').addEventListener('click',()=>{if(index<ex.steps.length-1){index++;render();}});
  find('reset').addEventListener('click',()=>{if(index){index=0;seq.querySelector('details').open=false;render();}});
  const card=seq.closest('.concept-card'),notes=card.querySelectorAll('.height-static li'),list=document.createElement('ol');
  list.append(notes[ex.note].cloneNode(true),notes[2].cloneNode(true));seq.querySelector('details').append(list);
  render();seq.hidden=false;
 }
 const card=document.getElementById('lesson-6');
 if(card&&examples.every(ex=>document.getElementById(ex.id+'-sequence')?.hidden===false))card.classList.add('has-height-sequence');
})();
