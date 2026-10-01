(()=>{
 'use strict';
 const M=window.PythagoreanMath,$=s=>document.querySelector(s),blue='#3566a0',brown='#98502f',ink='#253b39',gray='#77857e',light='#d8dfd6';
 const fmt=n=>String(Number(n.toFixed(4))),point=(x,y)=>({x,y});
 const line=(a,b,c=gray,dash='',w=1.7)=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
 const poly=(pts,c=ink,fill='none',w=1.6,dash='')=>`<polygon points="${pts.map(p=>`${p.x},${p.y}`).join(' ')}" stroke="${c}" fill="${fill}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linejoin="round"/>`;
 const text=(x,y,t,c=ink,size=18,anchor='start')=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" text-anchor="${anchor}">${t}</text>`;
 const mid=(a,b,t,dx=0,dy=0,c=ink)=>text((a.x+b.x)/2+dx,(a.y+b.y)/2+dy,t,c,19,'middle');
 function right(a,o,b,z=11){const u={x:a.x-o.x,y:a.y-o.y},v={x:b.x-o.x,y:b.y-o.y},nu=Math.hypot(u.x,u.y),nv=Math.hypot(v.x,v.y);if(nu<1e-8||nv<1e-8)return '';const p=point(o.x+u.x/nu*z,o.y+u.y/nu*z),q=point(p.x+v.x/nv*z,p.y+v.y/nv*z),r=point(o.x+v.x/nv*z,o.y+v.y/nv*z);return line(p,q)+line(q,r);}
 function arrow(a,b){const r=Math.atan2(b.y-a.y,b.x-a.x);return line(a,b,gray,'',1.2)+line(b,point(b.x-8*Math.cos(r-.4),b.y-8*Math.sin(r-.4)),gray,'',1.2)+line(b,point(b.x-8*Math.cos(r+.4),b.y-8*Math.sin(r+.4)),gray,'',1.2);}
 function initHeightSequence(){
  const sequence=$('#height-sequence');if(!sequence)return;
  const side=Number(sequence.dataset.side),base=Number(sequence.dataset.base),half=base/2;
  if(!(side>half&&half>0))return;
  const square=side*side-half*half,h=Math.sqrt(square),area=base*h/2;
  const scale=Math.min(360/base,240/h),A=point(320,325-h*scale),B=point(320-half*scale,325),C=point(320+half*scale,325),H=point(320,325);
  const number=n=>fmt(n),part=(s,c)=>`<span class="sequence-${c}">${s}</span>`;
  const hTerm=part('h²','height'),baseTerm=part(number(half)+'²','base'),sideTerm=part(number(side)+'²','side');
  const equation=`${hTerm} ＋ ${baseTerm} ＝ ${sideTerm}`;
  const steps=[
   {title:'高さは、どこからどこまで？',message:`等しい2辺が${number(side)}、底辺が${number(base)}の二等辺三角形。面積を求めるには、まず高さが必要です。`,caption:'どこに線を引くと、直角ができる？',description:`2辺が${number(side)}、底辺が${number(base)}。高さを表す補助線はまだありません。`},
   {title:'頂点から、底辺へ垂線を下ろす',message:'青い線が高さ h。直角の印のところで、2つの直角三角形ができました。',caption:'ここに、直角ができた',description:'頂点から底辺へ青い垂線 h を引き、足元に直角の印が付きました。'},
   {title:'二等辺三角形だから、底辺も半分',message:`左右は、斜辺${number(side)}と共通の高さ h が等しい直角三角形なので合同。底辺も等しく、${number(base)}÷2＝${number(half)}です。`,caption:'同じ印の2つの部分が等しい',description:`左右の直角三角形は合同。底辺の両半分に同じ印が付き、それぞれ${number(half)}と分かりました。`},
   {title:'片側だけを見ると、三平方が使える',message:`斜辺は${number(side)}。直角をはさむ辺は h と${number(half)}。色と辺の名前を、式と見比べよう。`,caption:'左の直角三角形に注目',description:`左の直角三角形を強調。高さ h、底辺の半分${number(half)}、斜辺${number(side)}を使って式を作ります。`,formula:equation},
   {title:'高さ h を求める',message:`h²＝${number(side*side)}−${number(half*half)}＝${number(square)}。h は長さなので、正の値${number(h)}を選びます。`,caption:'高さが分かった',description:`高さ h が${number(h)}に変わりました。`,previous:equation,formula:`${hTerm} ＝ ${number(square)} → ${part('h ＝ '+number(h),'height')}`},
   {title:'三角形全体へ戻って、面積を求める',message:`面積で使う底辺は、全体の${number(base)}。さっきの${number(half)}は、三平方に使った「半分」でした。`,caption:'面積は「底辺全体 × 高さ ÷ 2」',description:`三角形全体を強調。底辺全体${number(base)}と高さ${number(h)}を使い、面積は${number(area)}です。`,formula:`面積 ＝ ${part(number(base),'base')} × ${part(number(h),'height')} ÷ 2 ＝ ${number(area)}`}
  ];
  let index=0;
  function draw(){
   const step=steps[index],focusHalf=index===3||index===4;
   let g=poly([A,B,C],focusHalf?light:gray,index===5?'#edf2e7':'none');
   if(index===2)g+=poly([A,B,H],light,'#edf3f9')+poly([A,H,C],light,'#edf3f9');
   if(focusHalf)g+=poly([A,B,H],ink,'#edf3f9',2)+line(B,H,brown,'',2.8);
   const leftLabel=mid(A,B,number(side),-28,-8,ink),rightLabel=mid(A,C,number(side),28,-8,focusHalf?light:ink);
   g+=leftLabel+rightLabel;
   // Equal-side marks establish the isosceles condition before the altitude appears.
   for(const [P,Q]of [[A,B],[A,C]]){
    const mx=(P.x+Q.x)/2,my=(P.y+Q.y)/2,dx=Q.x-P.x,dy=Q.y-P.y,len=Math.hypot(dx,dy);
    g+=line(point(mx-dy/len*6,my+dx/len*6),point(mx+dy/len*6,my-dx/len*6),focusHalf&&Q===C?light:gray);
   }
   if(index>=1){
    g+=`<path data-height-edge d="M ${A.x} ${A.y} L ${H.x} ${H.y}" fill="none" stroke="${blue}" stroke-width="2.8"${index===1?' class="height-draw" pathLength="1"':''}/>`;
    g+=right(A,H,B)+text(H.x+18,(A.y+H.y)/2+5,index>=4?number(h):'h',blue,22);
   }
   if(index>=2&&index<=4){
    for(const [P,Q]of [[B,H],[H,C]]){
     const x=(P.x+Q.x)/2;g+=line(point(x,319),point(x,331),brown,'',2);
     g+=text(x,352,number(half),focusHalf&&P===H?gray:brown,21,'middle');
    }
   }
   if(index===5)g+=line(B,C,brown,'',3);
   const baseColor=index===5?brown:gray;
   g+=line(point(B.x,370),point(C.x,370),baseColor,'',1.2)+line(point(B.x,365),point(B.x,375),baseColor,'',1.2)+line(point(C.x,365),point(C.x,375),baseColor,'',1.2);
   g+=text(320,397,number(base)+(index>=2?'（全体）':''),baseColor,20,'middle');
   g+=text(320,35,step.caption,index===5?brown:ink,18,'middle');
   $('#height-plot').innerHTML=g;$('#height-plot').setAttribute('aria-label',step.description);
   $('#height-count').textContent=`${index+1} / ${steps.length}`;$('#height-title').textContent=step.title;$('#height-message').textContent=step.message;
   $('#height-calculation').hidden=!step.formula;$('#height-formula').innerHTML=step.formula||'';
   $('#height-previous').innerHTML=step.previous?'ひとつ前：'+step.previous:'';$('#height-previous').hidden=!step.previous;
   // Keep boundary controls focusable so a keyboard user does not lose their place.
   $('#height-prev').setAttribute('aria-disabled',String(index===0));$('#height-next').setAttribute('aria-disabled',String(index===steps.length-1));
   $('#height-reset').setAttribute('aria-disabled',String(index===0));
  }
  $('#height-prev').addEventListener('click',()=>{if(index>0){index--;draw();}});
  $('#height-next').addEventListener('click',()=>{if(index<steps.length-1){index++;draw();}});
  $('#height-reset').addEventListener('click',()=>{if(index){index=0;sequence.querySelector('.height-summary').open=false;draw();}});
  const card=sequence.closest('.concept-card'),notes=card.querySelector('.height-static ol');
  sequence.querySelector('.height-summary').append(notes.cloneNode(true));
  draw();sequence.hidden=false;card.classList.add('has-height-sequence');
 }
 initHeightSequence();
 function initDiameterSequence(){
  const sequence=$('#diameter-sequence');if(!sequence)return;
  const A=point(135,250),B=point(505,250),P=point(268.2,72.4),O=point(320,250);
  const term=(s,c)=>`<span class="sequence-${c}">${s}</span>`;
  const equation=`${term('6²','base')} ＋ ${term('x²','height')} ＝ ${term('10²','side')}`;
  const steps=[
   ['直径がある。どの角に使える？','ABは中心Oを通る直径で、長さは10。Pは円周上の点です。AP＝6のとき、BPの長さを考えよう。','条件：ABは直径、Pは円周上の点'],
   ['円で学んだことから、直角が分かる','直径ABに対する円周角だから、∠APB＝90°。Pのところに、三平方を使える直角が見つかりました。','直径に対する円周角は90°'],
   ['直角の向かいが、斜辺','直角はP。向かい側のAB＝10が斜辺です。求めたいBPをxと置きます。','斜辺ABと、直角をはさむ2辺に注目'],
   ['辺と式を、色と名前でつなぐ','直角をはさむ辺はAP＝6とBP＝x。2つの平方を足すと、斜辺AB＝10の平方になります。','AP² ＋ BP² ＝ AB²',equation],
   ['平方根で、長さに戻る','x²＝100−36＝64。xは長さなので正の値を選び、BP＝8。円の角の知識が、長さを求める道具になりました。','BPの長さが分かった',`${term('x²','height')} ＝ 64 → ${term('x ＝ 8','height')}`]
  ];
  let index=0;
  function draw(){
   const step=steps[index];
   let g=`<circle cx="320" cy="250" r="185" fill="none" stroke="${index>=2?light:gray}" stroke-width="1.5"/>`;
   g+=poly([A,P,B],gray,index>=2?'#edf3f9':'none');
   if(index>=2)g+=line(A,P,brown,'',3)+line(P,B,blue,'',3)+line(A,B,ink,'',3);
   g+=text(113,261,'A')+text(523,261,'B')+text(P.x,P.y-18,'P',ink,20,'middle');
   g+=`<circle cx="320" cy="250" r="3" fill="${gray}"/>`+text(320,276,'O',gray,17,'middle');
   g+=mid(A,P,'AP = 6',42,36,index>=2?brown:ink)+mid(P,B,index===4?'BP = 8':index>=2?'BP = x':'BP = ?',-36,36,index>=2?blue:ink);
   g+=text(320,309,'直径 AB = 10',ink,19,'middle');
   if(index>=1)g+=`<g data-diameter-right>${right(A,P,B,18)}</g>`+text(P.x+4,P.y+56,'90°',blue,18,'middle');
   if(index>=2)g+=text(320,340,'斜辺',ink,18,'middle');
   g+=text(320,462,step[2],ink,18,'middle');
   $('#diameter-plot').innerHTML=g;$('#diameter-plot').setAttribute('aria-label',step[1]);
   $('#diameter-count').textContent=`${index+1} / ${steps.length}`;
   $('#diameter-title').textContent=step[0];$('#diameter-message').textContent=step[1];
   $('#diameter-calculation').hidden=!step[3];$('#diameter-formula').innerHTML=step[3]||'';
   $('#diameter-previous').hidden=index!==4;$('#diameter-previous').innerHTML=index===4?'ひとつ前：'+equation:'';
   for(const [id,disabled]of [['prev',index===0],['reset',index===0],['next',index===4]])$('#diameter-'+id).setAttribute('aria-disabled',String(disabled));
  }
  $('#diameter-prev').addEventListener('click',()=>{if(index>0){index--;draw();}});
  $('#diameter-next').addEventListener('click',()=>{if(index<4){index++;draw();}});
  $('#diameter-reset').addEventListener('click',()=>{if(index){index=0;sequence.querySelector('details').open=false;draw();}});
  const card=sequence.closest('.concept-card');sequence.querySelector('details').append(card.querySelector('.height-static ol').cloneNode(true));
  draw();sequence.hidden=false;card.classList.add('has-height-sequence');
 }
 initDiameterSequence();

 let rearrangeShown=false;
 function rearrange(changed=false){
  if(changed)rearrangeShown=false;
  const a=Number($('#rearrange-a').value),b=4,t=Number($('#rearrange-position').value)/100,l=a+b,scale=31,ox=150,oy=70,cv=p=>point(ox+p.x*scale,oy+p.y*scale),atEnd=t===0||t===1;
  let g=poly([point(0,0),point(l,0),point(l,l),point(0,l)].map(cv),ink,'white');
  const fills=['#edf3f9','#f7eee6','#edf2e7','#f2f0f7'];
  M.layout(a,b,t).forEach((tri,i)=>{g+=poly(tri.map(cv),gray,fills[i]);const c=point(tri.reduce((s,p)=>s+p.x,0)/3,tri.reduce((s,p)=>s+p.y,0)/3),p=cv(c);g+=text(p.x,p.y+5,String(i+1),gray,18,'middle');});
  g+=text(320,31,'三角形の形・大きさはそのまま',ink,20,'middle');
  if(t===0){g+=text(ox+l*scale/2,oy+l*scale/2+8,rearrangeShown?`c² = ${fmt(a*a+b*b)}`:'c²',ink,23,'middle');g+=text(ox+a*scale/2,oy-10,`a = ${a}`,blue,17,'middle')+text(ox+ l*scale+12,oy+a*scale/2,'a',blue);}
  if(t===1){g+=text(ox+a*scale/2,oy+a*scale/2+6,rearrangeShown?`a² = ${fmt(a*a)}`:'a²',blue,20,'middle');g+=text(ox+(a+b/2)*scale,oy+(a+b/2)*scale+6,rearrangeShown?`b² = ${b*b}`:'b²',brown,20,'middle');}
  g+=text(320,395,atEnd?'同じ大きい正方形 − 同じ4枚':'移動中。面積の比較は両端で。',gray,17,'middle');
  $('#rearrange-plot').innerHTML=g;$('#rearrange-a-value').textContent=a;$('#rearrange-position-value').textContent=`${Math.round(t*100)} / 100`;$('#rearrange-reveal').disabled=!atEnd;$('#rearrange-reveal').setAttribute('aria-pressed',String(rearrangeShown));
  $('#rearrange-result').textContent=!atEnd?'途中は三角形が重なります。端まで動かしてから、空きの面積を比べよう。':rearrangeShown?`大きい面積${fmt(l*l)} − 4枚分${fmt(2*a*b)} = ${fmt(a*a+b*b)}。左のc²も、右のa²＋b²も同じ。`:'予想してから「面積を確かめる」。左と右では、空きの形がどう違う？';
 }
 for(const id of ['rearrange-a','rearrange-position'])$('#'+id).addEventListener('input',()=>rearrange(true));
 for(const [id,v]of [['rearrange-left','0'],['rearrange-right','100']])$('#'+id).addEventListener('click',()=>{$('#rearrange-position').value=v;rearrange(true);});
 $('#rearrange-reveal').addEventListener('click',()=>{rearrangeShown=!rearrangeShown;rearrange();});rearrange();
 let conditionShown=false,previous={a:3,angle:90},current={a:3,angle:90};
 function condition(changed=false){
  if(changed){previous={...current};conditionShown=false;}const a=Number($('#condition-a').value),ang=Number($('#condition-angle').value);current={a,angle:ang};const tri=M.triangle(a,4,ang),old=M.triangle(previous.a,4,previous.angle),cv=p=>point(282+p.x*25,252-p.y*25);
  let g='';
  // Traverse counterclockwise C->B->A; outward squares use the right normal.
  const points=[tri.C,tri.B,tri.A],colors=[blue,ink,brown],fills=['#edf3f9','#edf2e7','#f7eee6'];
  for(let i=0;i<3;i++){const u=points[i],v=points[(i+1)%3],dx=v.x-u.x,dy=v.y-u.y,quad=[u,v,point(v.x+dy,v.y-dx),point(u.x+dy,u.y-dx)];g+=poly(quad.map(cv),colors[i],fills[i]);const c=cv(point(quad.reduce((s,p)=>s+p.x,0)/4,quad.reduce((s,p)=>s+p.y,0)/4));const area=dx*dx+dy*dy;g+=text(c.x,c.y+6,conditionShown?(i===1&&ang!==90?'≈ '+area.toFixed(2):fmt(area)):['a²','c²','b²'][i],colors[i],20,'middle');}
  g+=poly(points.map(cv),ink,'white')+poly([old.C,old.B,old.A].map(cv),'#9ba59e','none',1.2,'5 4')+text(282+25,252-15,`${ang}°`,gray,17);if(ang===90)g+=right(cv(tri.A),cv(tri.C),cv(tri.B));
  g+=text(25,31,`a = ${a}、b = 4`,ink,20)+text(320,405,'正方形も三角形も、縦横は同じ縮尺。',gray,17,'middle');
  $('#condition-plot').innerHTML=g;$('#condition-a-value').textContent=a;$('#condition-angle-value').textContent=`${ang}°`;$('#condition-reveal').setAttribute('aria-pressed',String(conditionShown));
  $('#condition-result').textContent=conditionShown?`a²＋b² = ${fmt(a*a+16)}。c² ${ang===90?'= '+fmt(tri.c*tri.c):'≈ '+(tri.c*tri.c).toFixed(2)}。${ang===90?'等しい。直角の条件が保たれています。':'等しくない。角を変えると、cも変わります。'}`:'角を動かして予想しよう。2つの面積の和と、cの正方形は同じ？';
 }
 for(const id of ['condition-a','condition-angle'])$('#'+id).addEventListener('input',()=>condition(true));$('#condition-right').addEventListener('click',()=>{$('#condition-angle').value='90';condition(true);});$('#condition-reveal').addEventListener('click',()=>{conditionShown=!conditionShown;condition();});condition();
 let findShown=false;
 function find(changed=false){
  if(changed)findShown=false;const kind=$('#find-case').value,v=Number($('#find-position').value),lines=$('#find-lines').checked;let g='',result='';
  if(kind==='circle'){
   const r=5,h=v,m=M.chord(r,h),cv=p=>point(300+p.x*26,205-p.y*26),O=cv(point(0,0)),A=cv(point(-m.half,-h)),B=cv(point(m.half,-h)),H=cv(point(0,-h));
   g=`<circle cx="300" cy="205" r="130" fill="none" stroke="${gray}" stroke-width="1.5"/>`+line(A,B,ink,'',2)+text(O.x-8,O.y-13,'O')+text(A.x-25,A.y+10,'A')+text(B.x+13,B.y+10,'B');
   if(lines){g+=poly([O,A,H],blue,'#edf3f9')+line(O,H,blue,'5 3',2)+right(O,H,A)+mid(O,A,'5',-24,-3,brown)+mid(O,H,fmt(h),23,4,blue)+text(H.x-6,H.y+25,'H');if(findShown)g+=mid(A,H,M.radical(25-h*h),0,29,brown);}
   g+=text(25,32,`半径5、中心から弦まで${h}`,ink,20)+text(320,396,'使うのは、弦の「半分」。',gray,18,'middle');result=`AH² = 5²−${h}² = ${fmt(25-h*h)}。AH = ${M.radical(25-h*h)}。弦全体AB = ${M.radical(m.square)}。`;
  }else{
   const m=M.coord(v),cv=p=>point(315+p.x*45,333-p.y*45),O=cv(point(0,0)),A=cv(m),H=cv(point(v,0));
   for(let x=-3;x<=3;x++)g+=line(cv(point(x,-.5)),cv(point(x,5)),light,'',.7);
   for(let y=0;y<=5;y++)g+=line(cv(point(-3,y)),cv(point(3,y)),light,'',.7);
   g+=line(cv(point(-3.2,0)),cv(point(3.3,0)))+line(cv(point(0,-.5)),cv(point(0,5.3)));
   const curve=[];for(let i=-60;i<=60;i++)curve.push(cv(M.coord(i/20)));const curveGraphic=`<polyline points="${curve.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="${brown}" stroke-width="2"/>`;
   for(let x=-3;x<=3;x++)if(x)g+=text(cv(point(x,0)).x,352,String(x),gray,13,'middle');for(let y=1;y<=5;y++)g+=text(304,cv(point(0,y)).y+4,String(y),gray,13,'end');
   if(lines&&v!==0)g+=poly([O,H,A],blue,'#edf3f9')+line(O,H,blue,'5 3',2)+line(H,A,brown,'5 3',2)+right(O,H,A)+mid(O,H,fmt(Math.abs(v)),0,34,blue)+mid(H,A,fmt(m.y),v>0?24:-24,4,brown);
   g+=curveGraphic+line(O,A,ink,'',2)+text(291,369,'O')+text(A.x+(v>=0?11:-11),A.y-11,`A(${v}, ${fmt(m.y)})`,ink,18,v>=0?'start':'end')+text(477,334,'x',gray)+text(322,79,'y',gray)+text(25,31,'y = x²/2。座標の差を長さにする。',ink,20);
   result=v===0?'AとOが重なるので距離は0。直角三角形は作れません。':`横の長さは${fmt(Math.abs(v))}、縦は${fmt(m.y)}。OA² = ${fmt(v*v)}＋${fmt(m.y*m.y)} = ${fmt(m.square)}。OA = ${M.radical(m.square)}。`;
  }
  $('#find-plot').innerHTML=g;$('#find-value').textContent=v;$('#find-reveal').setAttribute('aria-pressed',String(findShown));$('#find-result').textContent=findShown?result:'補助線を予想してから表示しよう。直角と斜辺を指して、式を考えてみる。';
 }
 $('#find-case').addEventListener('change',()=>{const par=$('#find-case').value==='parabola',slider=$('#find-position');slider.min=par?'-3':'1';slider.max=par?'3':'4';slider.value=par?'2':'3';$('#find-label').textContent=par?'Aのx座標':'中心から弦までの距離';$('#find-lines').checked=false;find(true);});$('#find-position').addEventListener('input',()=>find(true));$('#find-lines').addEventListener('change',()=>find());$('#find-reveal').addEventListener('click',()=>{findShown=!findShown;if(findShown)$('#find-lines').checked=true;find();});find();
 let stage=0;
 function space(reset=false){
  if(reset)stage=0;const h=Number($('#space-height').value),m=M.box(3,4,h),scale=18,cv=p=>point(66+(p.x+.55*p.y)*scale,336-(p.z+.32*p.y)*scale),raw=[{x:0,y:0,z:0},{x:3,y:0,z:0},{x:3,y:4,z:0},{x:0,y:4,z:0},{x:0,y:0,z:h},{x:3,y:0,z:h},{x:3,y:4,z:h},{x:0,y:4,z:h}],p=raw.map(cv),[A,B,C,D,E,F,G,H]=p;
  let g=text(114,35,'箱の見取り図',gray,18,'middle');
  // Fill first, then redraw the wireframe, so the front edge stays in front.
  if(stage>=2)g+=poly([A,C,G],blue,'#edf3f9');
  if(stage>=1)g+=poly([A,B,C],brown,'#f7eee6');
  for(const [i,j]of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])g+=line(p[i],p[j],gray,([3].includes(i)||j===3)?'4 3':'');
  if(stage>=1)g+=line(A,B,brown,'',2)+line(B,C,brown,'',2)+line(A,C,blue,'',2.6);
  g+=line(A,G,ink,stage>=2?'':'6 4',2);
  if(stage>=2)g+=line(C,G,ink,'',2);
  g+=line(B,F,'white','',4.2)+line(B,F,gray,'',1.7);
  g+=mid(A,B,'3',0,28,stage?brown:ink)+mid(B,C,'4',27,28,stage?brown:ink)+mid(C,G,fmt(h),26,5)+text(A.x-23,A.y+14,'A')+text(B.x-4,B.y+16,'B')+text(C.x+13,C.y+4,'C')+text(G.x+10,G.y-13,'G');
  // Extracted triangles keep one scale and the shared edge AC stays blue.
  if(stage>=1){
   const first=stage===1,u=first?3:5,v=first?4:h,P=point(358,338),Q=point(P.x+u*18,P.y),S=point(Q.x,Q.y-v*18),color=first?brown:blue;
   const arrowY=(Q.y+S.y)/2;
   g+=arrow(point(225,arrowY),point(284,arrowY))+poly([P,Q,S],first?brown:ink,first?'#f7eee6':'#edf3f9')+right(P,Q,S);
   g+=line(P,first?S:Q,blue,'',2.6)+mid(P,Q,fmt(u),0,29,first?brown:blue)+mid(Q,S,fmt(v),28,5,first?brown:ink);
   if(first)g+=mid(P,S,'5',-24,-10,blue);
   if(stage===3)g+=mid(P,S,M.radical(m.square),-30,-10,ink);
   g+=text(P.x-22,P.y+7,'A')+text(Q.x+11,Q.y+19,first?'B':'C')+text(S.x+10,S.y-12,first?'C':'G');
   g+=text(429,35,first?'① 底面 ABC':'② 断面 ACG',color,20,'middle');
   g+=text(429,70,first?'青いACを求める':'青いACを、次の底辺へ',blue,17,'middle');
  }
  g+=text(320,400,'図を取り出しても、同じ辺には同じ長さ。',gray,18,'middle');
  const steps=['底面の対角線ACと、空間の対角線AG。どちらから求める？','底面でd² = 3²＋4² = 25。d = 5。',`AC = 5を次の三角形へ。CG = ${h}は底面に垂直なので、ACとも垂直。`,`ℓ² = 5²＋${h}² = ${m.square}。ℓ = ${M.radical(m.square)}。`];
  $('#space-plot').innerHTML=g;$('#space-height-value').textContent=h;$('#space-step').textContent=`手順 ${stage+1} / 4`;$('#space-before').textContent=stage?'ひとつ前：'+steps[stage-1]:'';$('#space-result').textContent=steps[stage];$('#space-prev').disabled=stage===0;$('#space-next').disabled=stage===3;
 }
 $('#space-height').addEventListener('input',()=>space(true));$('#space-prev').addEventListener('click',()=>{stage=Math.max(0,stage-1);space();});$('#space-next').addEventListener('click',()=>{stage=Math.min(3,stage+1);space();});space();
const dialog=document.createElement('dialog');dialog.className='figure-dialog';dialog.setAttribute('aria-label','図を大きく表示');const close=document.createElement('button');close.textContent='閉じる';close.className='button';const large=document.createElement('div');large.className='large-figure';dialog.append(close,large);document.body.append(dialog);close.addEventListener('click',()=>dialog.close());document.querySelectorAll('.concept-card figure,.q-card figure,.lab-figure').forEach(f=>{const svg=f.querySelector('svg');if(!svg)return;const button=document.createElement('button');button.className='figure-open interactive';button.textContent='図を大きく見る';button.addEventListener('click',()=>{const copy=svg.cloneNode(true);copy.removeAttribute('id');large.replaceChildren(copy);dialog.showModal();});f.append(button);});
const key='family-pythagorean-v1' ,allowed=['own','hint','review'];let records={};try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved)){for(const [id,v]of Object.entries(saved))if(/^([1-9]|1[0-9]|2[0-8])$/.test(id)&&allowed.includes(v))records[id]=v;}}catch{$('#storage-notice').hidden=false;}
function render(){let own=0;$('#review-links').replaceChildren();for(const card of document.querySelectorAll('.q-card')){const id=card.id.slice(1),v=records[id];card.querySelector('.q-status').textContent=({own:'自力でできた',hint:'ヒントでできた',review:'もう一度'})[v]||'未記録';card.querySelectorAll('[data-grade]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.grade===v)));if(v==='own')own++;if(v==='hint'||v==='review'){const a=document.createElement('a');a.href='#q'+id;a.textContent='問'+id;$('#review-links').append(a);}}$('#progress-text').textContent=`自力でできた ${own} / 28問。図を使って理由も説明できた？`;}
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>{records[b.closest('.q-card').id.slice(1)]=b.dataset.grade;try{localStorage.setItem(key,JSON.stringify(records));}catch{$('#storage-notice').hidden=false;}render();}));render();
function focus(){if(/^#q([1-9]|1[0-9]|2[0-8])$/.test(location.hash))$(location.hash)?.focus();}window.addEventListener('hashchange',focus);document.documentElement.classList.add('js-ready');focus();
})();

/* Attach the square to the actual hypotenuse before returning from area to length. */
(()=>{
 'use strict';
 const card=document.getElementById('lesson-3');if(!card)return;
 const blue='#3566a0',ink='#253b39',gray='#87928b';
 const seq=document.createElement('div');seq.id='root-length-sequence';seq.className='height-sequence interactive';
 seq.innerHTML=`<p class="sequence-intro"><strong>この例の条件：</strong>直角をはさむ2辺が2と3。斜辺の長さcを求めます。<br>斜辺に正方形を作ると、「c²」が何の面積か見えてきます。</p><div class="sequence-chapters"><button data-jump="0">図の意味を見る</button><button data-jump="2">式で求める</button><button data-jump="5">長さに戻す</button></div><div class="sequence-controls"><button class="button" data-back>ひとつ前</button><span class="sequence-count"></span><button class="button primary" data-next>次の手順</button><button class="sequence-reset" data-reset>最初から</button></div><div class="sequence-explanation" aria-live="polite" aria-atomic="true"><h3></h3><p></p></div><figure><svg viewBox="0 0 640 420" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div class="sequence-calculation" hidden><p class="sequence-previous"></p><p class="sequence-formula"></p><p class="sequence-intro" data-root-note hidden>√13そのものは正の数です。±は、方程式の正と負の解を両方書くために付けています。</p></div><p>なぜ面積を足せる？ <a href="#rearrange-lab">同じ4枚を並べ替えて確かめる</a>。<br><a href="../square-roots/index.html">平方根の意味を振り返る</a> · 紙では<a href="#q4">問4</a>・<a href="#q5">問5</a>。</p><details class="height-summary"><summary>元の解説をまとめて読む</summary></details>`;
 seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-side-choice');
 const c=s=>`<span class="sequence-height">${s}</span>`;
 const steps=[
  ['求めたいのは、青い辺の長さ','直角の向かいの青い辺が斜辺です。その長さをcと置きました。まず、この辺に正方形を作ってみよう。',''],
  ['斜辺を一辺にすると、面積はc²','青い辺cを、そのまま正方形の一辺にしました。縦も横もcだから面積はc×c＝c²。三角形の面積ではありません。',`${c('c')} × ${c('c')} ＝ ${c('c²')}`],
  ['三平方で、この正方形の面積を求める','直角をはさむ辺は2と3。三平方の定理から、斜辺に作った正方形の面積c²は、2²と3²の和です。',`${c('c²')} ＝ 2² ＋ 3²`],
  ['2と3を、それぞれ二乗する','2²は4、3²は9。長さ2と3をそのまま足すのではなく、二乗してから足します。',`${c('c²')} ＝ 4 ＋ 9`],
  ['分かった13は、面積の方','4＋9＝13。青い正方形の面積が13と分かりました。求めたいのは、その一辺の長さcです。',`${c('c²')} ＝ ${c('13')}`],
  ['方程式だけなら、正と負の解がある','二乗すると13になる数は、√13と−√13。c²＝13という方程式の解は2つあります。次に、長さという条件を確認します。',`${c('c')} ＝ ${c('±√13')}`],
  ['長さなので、正の√13を選ぶ','c＞0なので、c＝√13。面積13の正方形の一辺の長さを、この記号で正確に表せます。小数に直さなくても答えになります。',`c ＞ 0 なので、${c('c ＝ √13')}`]
 ];
 let index=0;const svg=seq.querySelector('svg');
 const text=(x,y,s,color=ink,size=20)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-size="${size}">${s}</text>`;
 function draw(){
  let g=text(320,25,'条件：直角をはさむ辺は2と3。斜辺cを求める。',ink,16);
  if(index>=1)g+='<polygon data-square points="335,280 200,190 290,55 425,145" fill="#edf3f9" stroke="#3566a0" stroke-width="1.6"/>'+text(312.5,150,'正方形の面積',blue,17)+text(312.5,184,index>=4?'13':'c²',blue,25);
  g+='<line data-leg-a x1="200" y1="280" x2="200" y2="190" stroke="#253b39" stroke-width="2"/><line data-leg-b x1="200" y1="280" x2="335" y2="280" stroke="#253b39" stroke-width="2"/><line data-hypotenuse x1="200" y1="190" x2="335" y2="280" stroke="#3566a0" stroke-width="3"/><path data-right d="M 200 265 H 215 V 280" fill="none" stroke="#87928b" stroke-width="1.6"/>';
  g+=text(175,240,'2')+text(267.5,309,'3')+text(252,264,index===6?'√13':'c',blue,22);
  g+=text(320,378,index===0?'青い辺の長さをcと置く':index<4?'辺の長さはc。正方形の面積はc²。':index<6?'面積は13。辺の長さも13、ではない。':'面積13 → 一辺の長さ√13',blue,18);
  svg.innerHTML=g;svg.setAttribute('aria-label',steps[index][0]+'。'+steps[index][1]);seq.querySelector('h3').textContent=steps[index][0];seq.querySelector('.sequence-explanation p').textContent=steps[index][1];seq.querySelector('.sequence-count').textContent=`${index+1} / 7`;
  seq.querySelector('.sequence-calculation').hidden=index===0;seq.querySelector('.sequence-formula').innerHTML=steps[index][2];const previous=seq.querySelector('.sequence-previous');previous.hidden=index<2;previous.innerHTML=index>=2?'ひとつ前：'+steps[index-1][2]:'';seq.querySelector('[data-root-note]').hidden=index<5;
  seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===6));
  for(const b of seq.querySelectorAll('[data-jump]')){if(Number(b.dataset.jump)===(index<2?0:index<5?2:5))b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
 }
 seq.querySelector('[data-next]').onclick=()=>{if(index<6){index++;draw();}};seq.querySelector('[data-back]').onclick=()=>{if(index>0){index--;draw();}};for(const b of seq.querySelectorAll('[data-jump]'))b.onclick=()=>{index=Number(b.dataset.jump);draw();};seq.querySelector('[data-reset]').onclick=()=>{index=0;seq.querySelector('details').open=false;draw();};seq.querySelector('[data-zoom]').onclick=()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));d.showModal();};draw();
})();

/* Rotation changes the picture, not which side faces the right angle. */
(()=>{
 'use strict';
 const card=document.getElementById('lesson-4');if(!card)return;
 const blue='#3566a0',brown='#98502f',ink='#253b39',gray='#87928b';
 const seq=document.createElement('div');seq.id='side-choice-sequence';seq.className='height-sequence interactive';
 seq.innerHTML=`<p class="sequence-intro"><strong>この例の条件：</strong>直角をはさむ辺がxと3、向かいの辺が5。xの長さを求めます。<br>図を回して、斜辺を見失わないか確かめよう。</p><label class="control">図の向き：<output>150°</output><input type="range" min="0" max="360" step="15" value="150" aria-label="三角形の回転角度"></label><div class="sequence-chapters"><button data-jump="0">斜辺を見つける</button><button data-jump="2">式を作る</button><button data-jump="3">xを求める</button></div><div class="sequence-controls"><button class="button" data-back>ひとつ前</button><span class="sequence-count"></span><button class="button primary" data-next>次の手順</button><button class="sequence-reset" data-reset>最初から</button></div><div class="sequence-explanation" aria-live="polite" aria-atomic="true"><h3></h3><p></p></div><figure><svg viewBox="0 0 640 450" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure><div class="sequence-calculation" hidden><p class="sequence-previous"></p><p class="sequence-formula"></p></div><p>なぜ二乗を足す？ <a href="#rearrange-lab">同じ4枚を並べ替えて、面積で確かめる</a>。<br>紙では<a href="#q6">問6</a>・<a href="#q7">問7</a>で斜辺を見つけよう。</p><details class="height-summary"><summary>元の解説をまとめて読む</summary></details>`;
 seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-side-choice');
 const part=(s,c)=>`<span class="sequence-${c===blue?'height':c===brown?'base':'side'}">${s}</span>`,x=part('x²',blue),n=part('3²',ink),h=part('5²',brown);
 const steps=[
  ['図が回っていても、直角を探す','小さな四角の印が直角です。図を回しても、この角が90°であることは変わりません。向かいの辺はどれでしょう？',''],
  ['直角に触れていない辺が、斜辺','茶色の5が斜辺です。「斜めに見える辺」ではなく「直角の向かいの辺」。回しても5が斜辺のままか、確かめよう。',''],
  ['まず、二乗の和の式に戻る','直角をはさむxと3の二乗を足すと、斜辺5の二乗。まだ足す・引くを決めず、3辺の役割から式を作ります。',`${x} ＋ ${n} ＝ ${h}`],
  ['分かっている数の二乗を計算する','3²は9、5²は25。x²はまだ分からないので、そのまま残します。',`${x} ＋ 9 ＝ ${part('25',brown)}`],
  ['両辺から、同じ9を引く','左の＋9をなくすために、両辺から9を引きます。右だけ、左だけを変えないのが方程式の約束です。',`${x} ＋ 9 <span class="sequence-change">− 9</span> ＝ ${part('25',brown)} <span class="sequence-change">− 9</span>`],
  ['左はx²だけ。右は16になる','9−9は0、25−9は16。引き算になったのは、最初の二乗の和の式を変形したからです。',`${x} ＝ ${part('16',blue)}`],
  ['方程式の解は、正と負の2つ','4²も(−4)²も16。方程式x²＝16だけを見ると、解は4と−4の2つあります。次に、もとの問題の条件を確認します。',`${part('x',blue)} ＝ ±√16 ＝ ${part('±4',blue)}`],
  ['長さの条件で、正の解を選ぶ','このxは辺の長さなので、x＞0。−4は方程式を満たしても、長さには使えません。だからx＝4。斜辺5より短いことも確認できます。',`x ＞ 0 なので、${part('x ＝ 4',blue)}`]
 ];
 let index=0;const slider=seq.querySelector('input'),svg=seq.querySelector('svg');
 const text=(p,s,c=ink,size=20)=>`<text x="${p[0]}" y="${p[1]}" fill="${c}" text-anchor="middle" font-size="${size}">${s}</text>`;
 function draw(){
  const rad=Number(slider.value)*Math.PI/180,cv=p=>[320+p[0]*Math.cos(rad)-p[1]*Math.sin(rad),225+p[0]*Math.sin(rad)+p[1]*Math.cos(rad)];
  const A=cv([-60,-45]),B=cv([120,-45]),C=cv([-60,90]);
  const edge=(a,b,c,attr)=>`<line ${attr} x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${index>=1&&attr==='data-hypotenuse'?4:2.4}"/>`;
  let g=text([320,25],'条件：直角をはさむ辺がxと3、向かいの辺が5',ink,16)+edge(A,B,blue,'data-unknown')+edge(A,C,ink,'data-leg')+edge(B,C,index>=1?brown:gray,'data-hypotenuse');
  const r=[[-45,-45],[-45,-30],[-60,-30]].map(cv);g+=`<path data-right d="M ${r[0]} L ${r[1]} L ${r[2]}" stroke="${ink}" stroke-width="${index===1?3:1.7}" fill="none"/>`;
  const labels=[[[30,-78],index===7?'4':'x',blue],[[-95,22.5],'3',ink],[[51.6,51.3],'5',index>=1?brown:gray]];
  for(const [p,s,c]of labels){const q=cv(p);g+=text([q[0],q[1]+7],s,c,23);}
  g+=text([320,426],index===0?'先に直角。その向かいが斜辺。':index===6?'4²＝16、(−4)²＝16。長さに合うのは？':index===7?'長さなのでx＞0。辺には4を使う。':'回しても、茶色の5が斜辺。',index>=1?brown:ink,18);
  svg.innerHTML=g;svg.setAttribute('aria-label',steps[index][0]+'。'+steps[index][1]);seq.querySelector('output').textContent=slider.value+'°';slider.setAttribute('aria-valuetext',slider.value+'度');
  seq.querySelector('h3').textContent=steps[index][0];seq.querySelector('.sequence-explanation p').textContent=steps[index][1];seq.querySelector('.sequence-count').textContent=`${index+1} / ${steps.length}`;
  seq.querySelector('.sequence-calculation').hidden=index<2;seq.querySelector('.sequence-formula').innerHTML=steps[index][2];const previous=seq.querySelector('.sequence-previous');previous.hidden=index<3;previous.innerHTML=index>=3?'ひとつ前：'+steps[index-1][2]:'';
  let note=seq.querySelector('[data-root-note]');if(!note){note=document.createElement('p');note.dataset.rootNote='';note.className='sequence-intro';note.textContent='√16そのものは4です。±は、方程式の解である4と−4の両方を書くために付けています。';seq.querySelector('.sequence-calculation').append(note);}note.hidden=index<6;
  seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===steps.length-1));
  for(const b of seq.querySelectorAll('[data-jump]')){const active=Number(b.dataset.jump)===(index<2?0:index===2?2:3);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
 }
 slider.oninput=draw;seq.querySelector('[data-next]').onclick=()=>{if(index<steps.length-1){index++;draw();}};seq.querySelector('[data-back]').onclick=()=>{if(index>0){index--;draw();}};
 for(const b of seq.querySelectorAll('[data-jump]'))b.onclick=()=>{index=Number(b.dataset.jump);draw();};seq.querySelector('[data-reset]').onclick=()=>{index=0;slider.value=150;seq.querySelector('details').open=false;draw();};
 seq.querySelector('[data-zoom]').onclick=()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));d.showModal();};draw();
})();

/* A cone's axial section connects the solid, the right triangle, and its height. */
(()=>{
 'use strict';
 const card=document.getElementById('lesson-14');if(!card)return;
 const blue='#3566a0',brown='#98502f',ink='#253b39',gray='#87928b';
 const seq=document.createElement('div');seq.id='cone-section-sequence';seq.className='height-sequence interactive';
 seq.innerHTML=`<p class="sequence-intro"><strong>問25と同じ条件：</strong>底面の半径3 cm、母線5 cmの円すい。高さと体積を求めます。<br>母線は表面に沿った斜めの長さ。体積の式に使う「高さ」はどこでしょう？</p>
 <div class="sequence-chapters"><button data-jump="0">断面を見つける</button><button data-jump="3">高さを求める</button><button data-jump="9">体積につなぐ</button></div>
 <div class="sequence-controls"><button class="button" data-back>ひとつ前</button><span class="sequence-count"></span><button class="button primary" data-next>次の手順</button><button class="sequence-reset" data-reset>最初から</button></div>
 <div class="sequence-explanation" aria-live="polite" aria-atomic="true"><h3></h3><p></p></div>
 <label class="check" data-outline-control hidden><input type="checkbox" checked> 円すいの輪郭を残して見比べる</label>
 <figure><svg viewBox="0 0 640 430" role="img"></svg><button class="figure-open" data-zoom>図を大きく見る</button></figure>
 <p class="sequence-intro">立体は模式図です。取り出した断面は、縦横を同じ倍率で描いています。</p>
 <div class="sequence-calculation" hidden><p class="sequence-previous"></p><p class="sequence-formula"></p><p class="sequence-intro" data-root-note hidden>√16そのものは4。±は方程式の2つの解を表します。高さなのでh＞0という条件で、正の解を選びます。</p></div>
 <p>紙では<a href="#q25">問25</a>を自分の式で解こう。<br>「三平方を2回使う」立体も見る：<a href="#space-lab">箱の中の対角線</a>。</p>
 <details class="height-summary"><summary>元の解説をまとめて読む</summary></details>`;
 seq.querySelector('details').append(card.querySelector('ol').cloneNode(true));card.append(seq);card.classList.add('has-side-choice');
 const part=(s,c)=>`<span class="sequence-${c}">${s}</span>`;
 const h=s=>part(s,'height'),r=s=>part(s,'base');
 const steps=[
  ['斜めの5と、高さhは別の長さ','Vは頂点、Oは底面の中心。高さはVから底面へ垂直に下ろしたVOです。母線VA＝5を、そのまま高さに使えるでしょうか？','', '斜めの母線5と、垂直な高さhを見比べる'],
  ['頂点と底面の中心を通って切る','軸VOを含む平面で切ると、左右対称の二等辺三角形が現れます。断面の下の辺は、底面の直径です。','', '色のついた三角形が、軸を通る断面'],
  ['断面の半分に、直角三角形がある','右半分の△VOAに注目。VOは底面に垂直なので、∠VOA＝90°。横のOAは中心から円周までの半径3です。直径6ではありません。','', '横の辺OAは、直径の半分＝半径3'],
  ['高さ・半径・母線を、式でつなぐ','直角をはさむ高さhと半径3。その向かいが母線5です。直角三角形が見つかったので、三平方の定理が使えます。',`${h('h²')} ＋ ${r('3²')} ＝ 5²`, '直角の向かいにある母線5が、斜辺'],
  ['分かっている数を二乗する','3²は9、5²は25。まだ分からない高さのh²は、そのまま残します。',`${h('h²')} ＋ ${r('9')} ＝ 25`, '高さhの二乗を求めているところ'],
  ['両辺から、同じ9を引く','左側をh²だけにするため、左右の両方から9を引きます。',`${h('h²')} ＋ 9 <span class="sequence-change">− 9</span> ＝ 25 <span class="sequence-change">− 9</span>`, '半径の二乗9を、両辺から引く'],
  ['高さの二乗は16になる','左の9−9は0、右の25−9は16。16は高さそのものではなく、高さを二乗した値です。',`${h('h²')} ＝ 16`, 'h²＝16。高さh＝16ではない'],
  ['方程式の解は、正と負の2つ','4²も(−4)²も16なので、方程式h²＝16の解は4と−4。ここから、問題に合う解を選びます。',`${h('h')} ＝ ±√16 ＝ ±4`, '4²も(−4)²も16。高さに使えるのは？'],
  ['高さなので、正の解を選ぶ','高さは正の長さなのでh＞0。したがってh＝4 cmです。斜めの母線5より短いことも、図と照らして確認しよう。',`h ＞ 0 なので、${h('h ＝ 4 cm')}`, '垂直な高さは4 cm。母線5 cmとは別'],
  ['体積に使うのは、求めた高さ4','円すいの体積は「底面積×高さ÷3」。底面は半径3の円なので、底面積はπ×3²です。母線5ではなく、青い高さ4を使います。',`体積 ＝ π × ${r('3²')} × ${h('4')} ÷ 3`, '円の底面積 × 垂直な高さ ÷ 3'],
  ['高さを求めたことで、体積も分かる','3²＝9なので、π×9×4÷3＝12π。高さの単位はcm、体積の単位はcm³です。立体の中に平面の三角形を見つけたことが、入口でした。','体積 ＝ π × 9 × 4 ÷ 3 ＝ 12π cm³', '高さ4 cm → 円すいの体積12π cm³']
 ];
 let index=0;const svg=seq.querySelector('svg'),outline=seq.querySelector('input');
 const text=(x,y,s,c=ink,size=20)=>`<text x="${x}" y="${y}" fill="${c}" text-anchor="middle" font-size="${size}">${s}</text>`;
 function draw(){
  const shell=index<2||outline.checked,volume=index>=9;
  let g=text(320,24,'条件：半径3 cm・母線5 cm。高さと体積を求める',ink,16);
  if(shell){
   g+=`<g data-shell opacity="${index<2?1:'.35'}"><path d="M 170 285 L 320 85 L 470 285" fill="none" stroke="${gray}" stroke-width="1.7"/><path d="M 170 285 A 150 32 0 0 1 470 285" fill="none" stroke="${gray}" stroke-width="1.5" stroke-dasharray="5 4"/><path d="M 170 285 A 150 32 0 0 0 470 285" fill="none" stroke="${gray}" stroke-width="1.7"/></g>`;
  }
  if(index===1)g+='<polygon data-section points="170,285 320,85 470,285" fill="#edf2e7" stroke="#56714e" stroke-width="2"/>';
  if(index>=2)g+=`<polygon data-half points="320,85 320,285 470,285" fill="${volume?'#f5f7fa':'#edf3f9'}" stroke="none"/>`;
  if(volume)g+='<ellipse data-base cx="320" cy="285" rx="150" ry="32" fill="#edf2e7" fill-opacity=".8" stroke="#56714e" stroke-width="1.5"/>';
  g+=`<line data-height x1="320" y1="85" x2="320" y2="285" stroke="${blue}" stroke-width="3" ${index<2?'stroke-dasharray="6 4"':''}/><line data-radius x1="320" y1="285" x2="470" y2="285" stroke="${brown}" stroke-width="${index>=2?3:2}"/><line data-generator x1="320" y1="85" x2="470" y2="285" stroke="${ink}" stroke-width="${index>=3?3:2}"/>`;
  if(index>=2)g+='<path data-right d="M 320 271 H 334 V 285" stroke="#87928b" fill="none" stroke-width="1.6"/>';
  g+=text(320,64,'V')+text(296,275,'O')+text(491,292,'A');
  g+=text(279,216,index>=8?'高さ4':'高さh',blue,21)+text(435,176,'母線5',ink,21)+text(388,242,'半径3',brown,21);
  if(index===1)g+=text(320,343,'下の辺全体は、直径6',ink,18);
  g+=text(320,379,steps[index][3],index>=9?ink:blue,18);
  if(index>=3)g+=text(320,410,seqText(steps[index][2]),ink,17);
  svg.innerHTML=g;svg.setAttribute('aria-label',steps[index][0]+'。'+steps[index][1]);
  seq.querySelector('h3').textContent=steps[index][0];seq.querySelector('.sequence-explanation p').textContent=steps[index][1];seq.querySelector('.sequence-count').textContent=`${index+1} / ${steps.length}`;
  seq.querySelector('[data-outline-control]').hidden=index<2;
  seq.querySelector('.sequence-calculation').hidden=index<3;seq.querySelector('.sequence-formula').innerHTML=steps[index][2];
  const previous=seq.querySelector('.sequence-previous');previous.hidden=index<4||index===9;previous.innerHTML=index>=4?'ひとつ前：'+steps[index-1][2]:'';seq.querySelector('[data-root-note]').hidden=index<7||index>8;
  seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===steps.length-1));
  for(const b of seq.querySelectorAll('[data-jump]')){if(Number(b.dataset.jump)===(index<3?0:index<9?3:9))b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
 }
 function seqText(html){const e=document.createElement('span');e.innerHTML=html;return e.textContent;}
 outline.onchange=draw;
 seq.querySelector('[data-next]').onclick=()=>{if(index<steps.length-1){index++;draw();}};
 seq.querySelector('[data-back]').onclick=()=>{if(index>0){index--;draw();}};
 for(const b of seq.querySelectorAll('[data-jump]'))b.onclick=()=>{index=Number(b.dataset.jump);draw();};
 seq.querySelector('[data-reset]').onclick=()=>{index=0;outline.checked=true;seq.querySelector('details').open=false;draw();};
 seq.querySelector('[data-zoom]').onclick=()=>{const d=document.querySelector('.figure-dialog');d.querySelector('.large-figure').replaceChildren(svg.cloneNode(true));d.showModal();};
 draw();
})();
