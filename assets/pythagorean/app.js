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
