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
 const areaTerm=s=>term(s,'base');
 const cellTerm=(s,c)=>`<span class="sequence-area-${c}">${s}</span>`;
 const changed=s=>`<span class="sequence-change">${s}</span>`;
 const f=[null,null,null,equation,
  `${areaTerm('(x＋1)²')} ＝ ${areaTerm('(x＋1) × (x＋1)')}`,
  null,
  cellTerm('x × x ＝ x²','square'),
  cellTerm('x × 1 ＝ x ／ 1 × x ＝ x','strip'),
  cellTerm('1 × 1 ＝ 1','unit'),
  `${areaTerm('(x＋1)²')} ＝ ${cellTerm('x²','square')} ＋ ${cellTerm('x','strip')} ＋ ${cellTerm('x','strip')} ＋ ${cellTerm('1','unit')}`,
  `${areaTerm('(x＋1)²')} ＝ ${cellTerm('x²','square')} ＋ ${changed(cellTerm('2x','strip'))} ＋ ${cellTerm('1','unit')}`,
  `${term('x²','height')} ＋ ${areaTerm('(x²＋2x＋1)')} ＝ 5²`,
  `x² ＋ (x²＋2x＋1) ＝ ${changed('25')}`,
  `${changed('x² ＋ x² ＋ 2x ＋ 1')} ＝ 25`,
  `${changed('2x²')} ＋ 2x ＋ 1 ＝ 25`,
  `2x² ＋ 2x ＋ 1 ${changed('− 25')} ＝ 25 ${changed('− 25')}`,
  `2x² ＋ 2x ${changed('− 24')} ＝ ${changed('0')}`,
  `(2x² ＋ 2x − 24) ${changed('÷ 2')} ＝ 0 ${changed('÷ 2')}`,
  `${changed('x² ＋ x − 12')} ＝ ${changed('0')}`,
  `${changed('(x＋4)(x−3)')} ＝ 0`,
  `${changed('x＋4 ＝ 0')} または ${changed('x−3 ＝ 0')}`,
  `${changed('x ＝ −4')} または ${changed('x ＝ 3')}`,
  `${term('短い辺 3 cm','height')} ／ ${term('長い辺 4 cm','base')}`
 ];
 const steps=[
  ['分かっている条件を、図で見る','長方形の対角線は5 cm。長い辺は、短い辺より1 cm長い。この2辺の長さを求めます。'],
  ['まず、短い辺をx cmと置く','青い短い辺をxと呼びます。値はまだ分からなくても、名前を付ければ式に使えます。'],
  ['長い辺は「同じx」と「あと1」','長い辺は短い辺より1 cm長いので、x＋1。下の棒で、同じ長さの部分と、余分な1を見比べよう。'],
  ['対角線が斜辺。三平方の式になる','長方形の角は90°。直角をはさむ辺がxとx＋1、斜辺が5なので、それぞれを平方して式を作れます。'],
  ['(x＋1)²は、どんな面積？','いま調べるのは、式の茶色の部分だけ。長い辺と同じx＋1を縦にも横にも使うと、正方形ができます。その面積が(x＋1)²です。'],
  ['縦も横も「x」と「1」に分ける','正方形の大きさはそのまま。辺のxと1の境目から線を引くと、4つの部分ができます。それぞれの面積を見ていこう。'],
  ['左上は、x × x','紫の部分は、縦がx、横もx。だから面積はx²です。ここでのx²は、この正方形の中の一部分の面積です。'],
  ['細い長方形は、それぞれ面積x','右側は縦x・横1で、x×1＝x。下側は縦1・横xで、1×x＝x。同じ面積xの長方形が2枚あります。'],
  ['右下は、1 × 1','残った小さな正方形は、縦も横も1。面積は1です。これで4つの部分がそろいました。'],
  ['4つを足すと、正方形全体の面積','すき間も重なりもないので、4つの面積を足せます。全体の(x＋1)²は、x²＋x＋x＋1と同じです。'],
  ['面積xが2枚あるから、2x','x＋xを2xとまとめます。これで(x＋1)²＝x²＋2x＋1。次に、この結果をもとの三平方の式へ戻します。'],
  ['もとの式の、茶色の部分を置き換える','短い辺から来た青いx²は、そのまま残します。長い辺から来た(x＋1)²だけを、今調べたx²＋2x＋1に置き換えます。'],
  ['まず、右辺の5²を計算する','5²は5×5なので25。左辺はまだ変えません。色の付いたところだけが、一つ前の式から変わっています。'],
  ['＋の後のかっこを外す','かっこの前が＋なので、中の各項の符号を変えずに外せます。x²が2つあることに注目しよう。'],
  ['x²とx²をまとめる','x²＋x²＝2x²。2xと1は、そのまま残します。'],
  ['両辺から、同じ25を引く','右辺を0にするために、左右の両方から25を引きます。同じ数を引くので、等しい関係は保たれます。'],
  ['1−25と、25−25を計算する','左辺の1−25は−24。右辺の25−25は0になります。'],
  ['両辺を、同じ2で割る','左辺の3つの項は、すべて2で割れます。右辺も2で割れば、等しい関係は保たれます。'],
  ['それぞれの項を、2で割った結果','2x²÷2＝x²、2x÷2＝x、−24÷2＝−12。右辺は0÷2＝0。因数分解しやすい形になりました。'],
  ['和が1、積が−12になる数を探す','4と−3なら、4＋(−3)＝1、4×(−3)＝−12。だからx²＋x−12を、(x＋4)(x−3)と因数分解できます。'],
  ['積が0なら、どちらかが0','x＋4とx−3の積が0。だから、x＋4＝0またはx−3＝0です。'],
  ['それぞれの式から、候補を求める','x＋4＝0からx＝−4。x−3＝0からx＝3。方程式の解は2つですが、どちらを長さに使えるでしょう？'],
  ['元の条件へ戻して、確かめる','長さは正なので、x＝−4は使えません。x＝3なら短い辺は3 cm、長い辺は4 cm。差は1、3²＋4²＝25で対角線も5 cmになります。']
 ].map((step,i)=>[...step,f[i],i===11?equation:i===4?equation:i>=10?f[i-1]:null]);
 const chapters=[{name:'図と式',start:0,end:3},{name:'平方の意味',start:4,end:10},{name:'式変形',start:11,end:18},{name:'解と条件',start:19,end:22}];
 let index=0;
 function diagram(){
  const solved=index===22;
  let g=text(270,35,'長方形（長さの単位：cm）',gray,17);
  g+=rect(140,85,240,180,'none',index>=3?light:gray);
  if(index>=3)g+=`<polygon data-focus points="140,85 140,265 380,265" fill="#f1f2ef" stroke="none"/>`;
  g+=`<g data-short>${line(140,85,140,265,index>=1?blue:gray,index>=1?3:1.7)}</g>`;
  g+=`<g data-long>${line(140,265,380,265,index>=2?brown:gray,index>=2?3:1.7)}</g>`;
  g+=`<g data-diagonal>${line(140,85,380,265,ink,index>=3?3:1.7)}</g>`;
  g+=`<path d="M 140 250 h 15 v 15" fill="none" stroke="${gray}" stroke-width="1.5"/>`;
  g+=text(100,181,solved?'3':index>=1?'x':'?',index>=1?blue:ink,23);
  g+=text(260,298,solved?'4':index>=2?'x＋1':'?',index>=2?brown:ink,23);
  g+=text(280,156,'5',ink,23);
  if(index>=21){
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
 function areaDiagram(){
  const cells=[{x:200,y:130,w:180,h:180,color:'#6f5885',fill:'#efe9f4'},
   {x:380,y:130,w:60,h:180,color:'#476b48',fill:'#edf3e7'},
   {x:200,y:310,w:180,h:60,color:'#476b48',fill:'#edf3e7'},
   {x:380,y:310,w:60,h:60,color:'#8b671d',fill:'#fbf2d9'}];
  let g=`<g data-expansion>`+text(320,35,'いま調べるのは、(x＋1)²',brown,22);
  g+=text(320,64,'長い辺と同じ長さで作った正方形',gray,17);
  g+=rect(200,130,240,240,'#fffefb',brown);
  if(index>=5){
   cells.forEach((c,k)=>{
    const active=index>=9||(index===6&&k===0)||(index===7&&(k===1||k===2))||(index===8&&k===3);
    g+=`<g data-cell="${k}">${rect(c.x,c.y,c.w,c.h,active?c.fill:'#fafaf7',gray)}`;
    const shown=index>=9||(index>=6&&k===0)||(index>=7&&(k===1||k===2))||(index>=8&&k===3);
    if(shown){
     const cx=c.x+c.w/2,cy=c.y+c.h/2;
     const product=['x × x','x × 1','1 × x','1 × 1'][k],answer=['x²','x','x','1'][k];
     g+=text(cx,cy-10,product,active?c.color:gray,k===0?22:15)+text(cx,cy+20,'＝ '+answer,active?c.color:gray,k===0?23:18);
    }
    g+='</g>';
   });
   g+=text(290,115,'x',gray,21)+text(410,115,'1',gray,21)+text(178,226,'x',gray,21)+text(178,345,'1',gray,21);
  }else g+=text(320,242,'面積',gray,18)+text(320,278,'(x＋1)²',brown,26);
  g+=line(200,401,440,401,brown,1)+line(200,396,200,406,brown)+line(440,396,440,406,brown)+text(320,432,'x＋1',brown,22);
  g+=line(466,130,466,370,brown,1)+line(461,130,471,130,brown)+line(461,370,471,370,brown)+text(515,258,'x＋1',brown,22);
  g+=text(320,479,index===4?'縦 × 横 が、正方形の面積':index>=9?'4つの面積を足すと、全体の面積':'形と大きさは変えずに、部分を見る',ink,18);
  return g+'</g>';
 }
 function render(){
  const [title,message,formula,previous]=steps[index];
  find('plot').innerHTML=index>=4&&index<=10?areaDiagram():diagram();
  find('plot').closest('figure').hidden=index>=12&&index<=20;find('plot').setAttribute('aria-label',title+'。'+message);
  const chapter=chapters.find(c=>index>=c.start&&index<=c.end);
  find('count').textContent=`${index-chapter.start+1} / ${chapter.end-chapter.start+1}`;
  find('phase').textContent=chapter.name;seq.dataset.step=String(index);
  seq.querySelectorAll('[data-chapter]').forEach(b=>{if(Number(b.dataset.chapter)===chapter.start)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});find('title').textContent=title;find('message').textContent=message;
  find('calculation').hidden=!formula;find('formula').innerHTML=formula||'';
  find('previous').hidden=!previous;find('previous').innerHTML=previous?'ひとつ前：'+previous:'';
  for(const [name,disabled]of [['prev',index===0],['reset',index===0],['next',index===steps.length-1]])find(name).setAttribute('aria-disabled',String(disabled));
 }
 find('prev').addEventListener('click',()=>{if(index){index--;render();}});
 find('next').addEventListener('click',()=>{if(index<steps.length-1){index++;render();}});
 find('reset').addEventListener('click',()=>{if(index){index=0;seq.querySelector('details').open=false;render();}});
 seq.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>{index=Number(b.dataset.chapter);seq.querySelector('details').open=false;render();}));
 const card=seq.closest('.concept-card');seq.querySelector('details').append(card.querySelector('.height-static ol').cloneNode(true));
 render();seq.hidden=false;card.classList.add('has-height-sequence');
})();
