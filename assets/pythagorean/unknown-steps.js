/* Connect the geometric condition, area expansion and admissible equation roots. */
(()=>{
 'use strict';
 const seq=document.getElementById('unknown-sequence');if(!seq)return;
 const blue='#3566a0',brown='#98502f',ink='#253b39',gray='#77857e',light='#d8dfd6';
 const find=name=>seq.querySelector('#unknown-'+name);
 const line=(x1,y1,x2,y2,c=gray,w=1.7,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
 const text=(x,y,t,c=ink,size=19)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" text-anchor="middle">${t}</text>`;
 const rect=(x,y,w,h,fill='none',stroke=gray)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
 const term=(s,c)=>`<span class="sequence-${c}">${s}</span>`;
 const equation=`${term('x²','height')} ＋ ${term('(x＋1)²','base')} ＝ ${term('5²','side')}`;
 const simplified='x² ＋ x − 12 ＝ 0';
 const steps=[
  ['分かっている条件を、図で見る','長方形の対角線は5 cm。長い辺は、短い辺より1 cm長い。この2辺の長さを求めます。'],
  ['まず、短い辺をx cmと置く','青い短い辺をxと呼びます。値はまだ分からなくても、名前を付ければ式に使えます。'],
  ['長い辺は「同じx」と「あと1」','長い辺は短い辺より1 cm長いので、x＋1。下の棒で、同じ長さの部分と、余分な1を見比べよう。'],
  ['対角線が斜辺。三平方の式になる','長方形の角は90°。直角をはさむ辺がxとx＋1、斜辺が5なので、それぞれを平方して式を作れます。',equation],
  ['(x＋1)²を、面積でほどく','右の正方形は、x²・x・x・1の4つに分かれます。展開して25を左へ移し、同じ項をまとめる。最後に両辺を2で割ります。','2x² ＋ 2x − 24 ＝ 0<br>↓ 両辺を2で割る<br>'+simplified,equation],
  ['因数分解すると、候補は2つ','和が1、積が−12になる数は4と−3。積が0なので、x＋4＝0またはx−3＝0です。どちらを長さに使えるでしょう？','(x＋4)(x−3) ＝ 0<br>x ＝ −4 または 3',simplified],
  ['元の条件へ戻して、確かめる','長さは正なので、x＝−4は使えません。x＝3なら短い辺は3 cm、長い辺は4 cm。差は1、3²＋4²＝25で対角線も5 cmになります。',`${term('短い辺 3 cm','height')} ／ ${term('長い辺 4 cm','base')}`,'x ＝ −4 または 3']
 ];
 let index=0;
 function diagram(){
  const solved=index===6;
  let g=text(270,35,'長方形（長さの単位：cm）',gray,17);
  g+=rect(140,85,240,180,'none',index>=3?light:gray);
  if(index>=3)g+=`<polygon data-focus points="140,85 140,265 380,265" fill="#edf3f9" stroke="none"/>`;
  g+=`<g data-short>${line(140,85,140,265,index>=1?blue:gray,index>=1?3:1.7)}</g>`;
  g+=`<g data-long>${line(140,265,380,265,index>=2?brown:gray,index>=2?3:1.7)}</g>`;
  g+=`<g data-diagonal>${line(140,85,380,265,ink,index>=3?3:1.7)}</g>`;
  g+=`<path d="M 140 250 h 15 v 15" fill="none" stroke="${gray}" stroke-width="1.5"/>`;
  g+=text(100,181,solved?'3':index>=1?'x':'?',index>=1?blue:ink,23);
  g+=text(260,298,solved?'4':index>=2?'x＋1':'?',index>=2?brown:ink,23);
  g+=text(280,156,'5',ink,23);
  if(index===4){
   g+=`<g data-expansion>${text(510,59,'長い辺の平方',brown,17)}`;
   g+=rect(445,105,90,90,'#edf3f9')+rect(535,105,30,90,'#f7eee6')+rect(445,195,90,30,'#f7eee6')+rect(535,195,30,30,'#edf2e7');
   g+=text(490,91,'x',blue,17)+text(550,91,'1',brown,17)+text(429,154,'x',blue,17)+text(429,216,'1',brown,17);
   g+=text(490,155,'x²',blue,20)+text(550,155,'x',brown,17)+text(490,216,'x',brown,17)+text(550,216,'1',ink,17);
   g+=text(510,253,'x²＋x＋x＋1',brown,17)+'</g>';
  }
  if(index>=5){
   g+=`<g data-candidates>${rect(60,350,240,120,solved?'#f7eee6':'white',solved?brown:gray)}${rect(340,350,240,120,solved?'#edf3f9':'white',solved?blue:gray)}`;
   g+=text(180,380,'候補 x＝−4',brown)+text(460,380,'候補 x＝3',blue);
   if(solved)g+=text(180,413,'長さが負 → 使えない',brown,17)+text(180,447,'−4 cm、−3 cm',gray,17)+text(460,413,'長さも条件も合う',blue,17)+text(460,447,'3 cm、4 cm',ink,17);
   else g+=text(180,425,'長さの条件に合う？',gray,17)+text(460,425,'長さの条件に合う？',gray,17);
   g+='</g>';
  }else if(index>=1){
   // Equal horizontal scale makes the extra unit visible without rotating the rectangle.
   g+=text(95,368,'短い辺',blue,17)+line(160,362,340,362,blue,6)+text(250,349,'x',blue,20);
   if(index>=2){
    g+=text(95,428,'長い辺',brown,17)+line(160,422,340,422,brown,6)+line(340,422,400,422,brown,6,'5 4');
    g+=text(250,410,'同じx',brown,18)+text(370,410,'＋1',brown,18);
   }
   g+=text(320,480,index===1?'短い辺の長さを、式に使える名前にする':'同じ長さの部分 ＋ 余分な1',ink,18);
  }else g+=text(320,392,'長い辺は、短い辺より1 cm長い',ink,20);
  return g;
 }
 function render(){
  const [title,message,formula,previous]=steps[index];
  find('plot').innerHTML=diagram();find('plot').setAttribute('aria-label',title+'。'+message);
  find('count').textContent=`${index+1} / ${steps.length}`;find('title').textContent=title;find('message').textContent=message;
  find('calculation').hidden=!formula;find('formula').innerHTML=formula||'';
  find('previous').hidden=!previous;find('previous').innerHTML=previous?'ひとつ前：'+previous:'';
  for(const [name,disabled]of [['prev',index===0],['reset',index===0],['next',index===6]])find(name).setAttribute('aria-disabled',String(disabled));
 }
 find('prev').addEventListener('click',()=>{if(index){index--;render();}});
 find('next').addEventListener('click',()=>{if(index<6){index++;render();}});
 find('reset').addEventListener('click',()=>{if(index){index=0;seq.querySelector('details').open=false;render();}});
 const card=seq.closest('.concept-card');seq.querySelector('details').append(card.querySelector('.height-static ol').cloneNode(true));
 render();seq.hidden=false;card.classList.add('has-height-sequence');
})();
