/* One geometric reason per step; examples are followed by the general relation. */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s),M=window.CircleMath;
 const blue='#3566a0',brown='#98502f',green='#285c50',ink='#253b39',gray='#7a8781',light='#cbd4ce';
 const O=[275,190],point=d=>{const p=M.point(d);return [275+112*p.x,190-112*p.y];};
 const line=(a,b,c=gray,w=1.7,dash='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
 const text=(x,y,s,c=ink,size=18)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" text-anchor="middle">${s}</text>`;
 const tag=(d,s)=>{const p=M.point(d);return text(275+137*p.x,195-137*p.y,s,ink,18);};
 function mark(a,p,b,c,r=25,fill=false,attr=''){
  const u=Math.atan2(a[1]-p[1],a[0]-p[0]),v=Math.atan2(b[1]-p[1],b[0]-p[0]),d=(v-u+3*Math.PI)%(2*Math.PI)-Math.PI;
  const q=[p[0]+r*Math.cos(u),p[1]+r*Math.sin(u)],z=[p[0]+r*Math.cos(v),p[1]+r*Math.sin(v)];
  return `<path ${attr} data-degrees="${Math.abs(d)*180/Math.PI}" d="${fill?`M ${p} L ${q}`:`M ${q}`} A ${r} ${r} 0 0 ${d>0?1:0} ${z}${fill?' Z':''}" stroke="${c}" stroke-width="2" fill="${fill?({[blue]:'#e2ecf7',[brown]:'#f4e4d7',[green]:'#e6eee5'}[c]):'none'}"/>`;
 }
 function equal(a,b,c){const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy);return line([x-5*dy/n,y+5*dx/n],[x+5*dy/n,y-5*dx/n],c,2);}
 const part=(v,c)=>`<span class="circle-${c}">${v}</span>`;
 const data={
  single:{a:270,b:330,p:90,steps:[
   ['まず、求めたい角を見る','P・O・Aは一直線。円周上のPの角と、中心Oの角を比べます。','条件：P・O・Aは一直線'],
   ['半径OBを1本足す','OPとOBは、どちらも同じ円の半径。三角形OPBが見えてきました。','青い三角形OPBに注目'],
   ['同じ半径だから、二等辺三角形','OPとOBに同じ印を付けました。向かい側のPとBの底角も等しくなります。','同じ印の2辺 → 底角も等しい'],
   ['底角は、同じ角度になる','この図ではPの角を30°とします。等しい底角なので、Bの角も30°です。','PとBの青い角：30°ずつ'],
   ['OAは、OPを反対へ延ばした線','Oのところで、三角形の外側に角ができました。これが比べたい中心角∠AOBです。','Oの外角は、離れた2つの内角の和'],
   ['外角は、30°と30°を足した角','中2で学んだ外角の性質を使います。等しい角を2つ足すので、中心角は円周角の2倍です。','Pで30° → Oで60°',`${part('30°','blue')} ＋ ${part('30°','blue')} ＝ ${part('60°','green')}`],
   ['同じ弧ABを見ると、中心では2倍','30°に限りません。底角がx°なら、外角はx°＋x°＝2x°。だから円周角は中心角の半分です。','同じ弧AB：円周角30° ／ 中心角60°','x° ＋ x° ＝ 2x°']
  ]},
  inside:{a:226,b:340,p:90,alpha:22,beta:35,steps:[
   ['中心Oが、Pの角の内側にある','今度はどこに半径を引くと、さっきの基本形を使えるでしょう？','求めたいのは、Pの角とOの角の関係'],
   ['PからOを通り、円まで線を延ばす','延ばした先をCとします。Pの角が左右に分かれました。まず、この青い補助線PCに注目しよう。','PCで、Pの角が左右に分かれた'],
   ['まず左側。OPとOAは同じ半径','青い三角形OPAは二等辺三角形。この図のPの左側の角は22°なので、Aの底角も22°です。','PとAの青い角：22°ずつ'],
   ['青い角だけ、中心と比べる','OCはOPの延長。外角∠AOCは22°＋22°＝44°。基本形と同じ見方です。','青：Pで22° → Oで44°',`${part('22° ＋ 22° ＝ 44°','blue')}`],
   ['次に右側。OPとOBも同じ半径','茶色の三角形OPBも二等辺三角形。今度はPとBの底角が35°ずつです。','PとBの茶色の角：35°ずつ'],
   ['茶色の角も、中心では2倍','外角∠COBは35°＋35°＝70°。右側でも同じ関係になりました。','茶：Pで35° → Oで70°',`${part('35° ＋ 35° ＝ 70°','brown')}`],
   ['元の角へ戻すには、左右を足す','PでもOでも、青と茶が隣り合っています。2つを合わせると、それぞれ元の角に戻ります。','P：22°＋35° ／ O：44°＋70°',`P：${part('22°','blue')} ＋ ${part('35°','brown')} ＝ 57°<br>O：${part('44°','blue')} ＋ ${part('70°','brown')} ＝ 114°`],
   ['足しても、2倍の関係は保たれる','どちらの部分も中心では2倍。足した全体も2倍です。数値は一例で、どんなα・βでも同じ考え方が使えます。','同じ弧AB：円周角57° ／ 中心角114°',`2${part('α','blue')} ＋ 2${part('β','brown')} ＝ 2(${part('α','blue')} ＋ ${part('β','brown')})`]
  ]},
  outside:{a:210,b:330,p:190,alpha:80,beta:20,steps:[
   ['中心Oが、Pの角の外側にある','Pの角の中にはOがありません。それでも基本形へ戻せるでしょうか？','求めたいのは、Pの角とOの角の関係'],
   ['同じように、PからOを通って延ばす','円との交点をCとします。今度はPCが元の角の外側。大きい角と、その中に重なる小さい角ができます。','PCは、元の角の外側に出る'],
   ['大きい角を、先に見る','青い三角形OPAではOP＝OA。PとAの底角は、この図では80°ずつです。','大きい方：PとAの青い角は80°ずつ'],
   ['大きい角は、中心では160°','OCはOPの延長。外角∠AOCは80°＋80°＝160°です。','青：Pで80° → Oで160°',`${part('80° ＋ 80° ＝ 160°','blue')}`],
   ['重なっている、小さい角を見る','茶色の三角形OPBではOP＝OB。PとBの底角は20°ずつ。これは、さっきの大きい角に含まれる部分です。','引く部分：PとBの茶色の角は20°ずつ'],
   ['重なった部分も、中心では2倍','外角∠BOCは20°＋20°＝40°。中心でも茶色の角が大きい青い角に含まれています。','茶：Pで20° → Oで40°',`${part('20° ＋ 20° ＝ 40°','brown')}`],
   ['茶色の重なりを除くと、元の角','青い大きい角から、茶色の部分を引きます。残った部分が∠APBと∠AOB。PでもOでも「引く」のは同じです。','残る角：Pは80°−20° ／ Oは160°−40°',`P：${part('80°','blue')} − ${part('20°','brown')} ＝ 60°<br>O：${part('160°','blue')} − ${part('40°','brown')} ＝ 120°`],
   ['引いても、2倍の関係は保たれる','大きい角も、取り除く角も、中心では2倍。差も2倍になります。数値に限らず、α・βでも同じです。','同じ弧AB：円周角60° ／ 中心角120°',`2${part('α','blue')} − 2${part('β','brown')} ＝ 2(${part('α','blue')} − ${part('β','brown')})`]
  ]}
 };
 let kind='single';const positions={single:0,inside:0,outside:0};
 function draw(){
  const s=data[kind],i=positions[kind],A=point(s.a),B=point(s.b),P=point(s.p),C=point(s.p+180),single=kind==='single',alpha=i===2||i===3,beta=i===4||i===5;
  const example=single?'この例：Pの角を30°として考える':kind==='inside'?'この例：Pの角を22°と35°に分ける':'この例：大きい角80°、重なる角20°';
  let g=text(275,20,example,gray,14)+'<circle cx="275" cy="190" r="112" fill="none" stroke="#a5afa9" stroke-width="1.5"/>';
  const triangle=(Q,c)=>`<polygon points="${P} ${O} ${Q}" fill="${c}" fill-opacity=".09" stroke="none"/>`;
  if(single&&i>=1&&i<=5)g+=triangle(B,blue);
  if(!single&&alpha)g+=triangle(A,blue);if(!single&&beta)g+=triangle(B,brown);
  g+=line(P,A)+line(P,B);
  if(i>=1){
   if(single)g+=line(O,A,gray,1.5)+line(O,B,blue,1.5)+line(P,O,blue,2);
   else{g+=line(P,O,i===1?blue:gray,2)+line(O,C,i===1?blue:gray,1.7,'5 4');if(i>=2)g+=line(O,A,light,1.5);if(i>=4)g+=line(O,B,light,1.5);}
  }
  if(single){
   if(i>=2&&i<=5)g+=equal(P,O,blue)+equal(O,B,blue);
   if(i>=2&&i<=5)g+=mark(O,P,B,blue,24,false,'data-angle="P-base"')+mark(P,B,O,blue,24,false,'data-angle="B-base"');
   if(i>=4)g+=line(O,A,green,3)+mark(A,O,B,green,32,i>=5,'data-angle="O-whole"');
   if(i===6)g+=mark(A,P,B,green,28,true,'data-angle="P-whole"');
  }else{
   if(kind==='outside'&&i===5)g+=mark(A,P,C,blue,22,true,'data-angle="P-outer"')+mark(A,O,C,blue,38,true,'data-angle="O-outer"');
   if(alpha||beta){const Q=alpha?A:B,c=alpha?blue:brown;g+=line(P,O,c,2.5)+line(O,Q,c,2.5)+equal(P,O,c)+equal(O,Q,c);g+=mark(O,P,Q,c,18,false,'data-angle="P-base"')+mark(P,Q,O,c,18,false,'data-angle="Q-base"');
    if(i===3||i===5)g+=mark(Q,P,C,c,22,true,'data-angle="P-part"')+mark(Q,O,C,c,38,true,'data-angle="O-part"');
   }
   if(i>=6){
    g+=mark(A,P,C,blue,27,true,'data-angle="P-alpha"')+mark(A,O,C,blue,42,true,'data-angle="O-alpha"');
    g+=mark(C,P,B,brown,27,true,'data-angle="P-beta"')+mark(C,O,B,brown,42,true,'data-angle="O-beta"');
    if(kind==='outside')g+=line(P,C,brown,1.2,'3 4');
    if(i===7)g+=mark(A,P,B,green,34,false,'data-angle="P-whole"')+mark(A,O,B,green,50,false,'data-angle="O-whole"');
   }
  }
  if(i===s.steps.length-1){const a=point(s.a),b=point(s.b),span=M.intercepted(s.a,s.b,s.p);g+=`<path data-proof-arc d="M ${a} A 112 112 0 ${span>180?1:0} 0 ${b}" fill="none" stroke="${green}" stroke-width="4"/>`;}
  g+=tag(s.a,'A')+tag(s.b,'B')+tag(s.p,'P');if(!single&&i>=1)g+=tag(s.p+180,'C');
  g+='<circle cx="275" cy="190" r="2.5" fill="#253b39"/>'+text(single?257:260,177,'O',ink,17);
  g+=text(275,366,s.steps[i][2],i===s.steps.length-1?green:single?(i>=4?green:blue):alpha?blue:beta?brown:ink,17);
  const [title,message,,formula]=s.steps[i];$('#proof-plot').innerHTML=g;$('#proof-plot').setAttribute('aria-label',title+'。'+message);
  $('#proof-title').textContent=title;$('#proof-step').textContent=`手順 ${i+1} / ${s.steps.length}`;$('#proof-result').textContent=message;
  $('#proof-before').textContent=i?'ひとつ前：'+s.steps[i-1][0]:'';$('#proof-formula').innerHTML=formula||'';$('#proof-formula').hidden=!formula;
  for(const [id,disabled]of [['prev',i===0],['reset',i===0],['next',i===s.steps.length-1]])$('#proof-'+id).setAttribute('aria-disabled',String(disabled));
  document.querySelectorAll('[data-proof-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.proofCase===kind)));
 }
 document.querySelectorAll('[data-proof-case]').forEach(b=>b.addEventListener('click',()=>{kind=b.dataset.proofCase;draw();}));
 document.querySelectorAll('[data-proof-open]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();kind=a.dataset.proofOpen;positions[kind]=0;draw();location.hash='proof-lab';requestAnimationFrame(()=>$(`[data-proof-case="${kind}"]`).focus({preventScroll:true}));}));
 $('#proof-prev').addEventListener('click',()=>{if(positions[kind]>0){positions[kind]--;draw();}});
 $('#proof-next').addEventListener('click',()=>{if(positions[kind]<data[kind].steps.length-1){positions[kind]++;draw();}});
 $('#proof-reset').addEventListener('click',()=>{positions[kind]=0;draw();});draw();
})();
