(()=>{
'use strict';
const ink='#253b39',blue='#3566a0',brown='#98502f',gray='#77857e',light='#d8dfd6';
const pt=(x,y)=>({x,y});
const line=(a,b,c=gray,w=1.6,dash='')=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
const poly=(ps,c=gray,fill='none',w=1.6,dash='')=>`<polygon points="${ps.map(p=>p.x+','+p.y).join(' ')}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linejoin="round"/>`;
const txt=(x,y,s,c=ink,size=18,anchor='middle')=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
function right(a,o,b,z=13){const u=pt(a.x-o.x,a.y-o.y),v=pt(b.x-o.x,b.y-o.y),nu=Math.hypot(u.x,u.y),nv=Math.hypot(v.x,v.y);const p=pt(o.x+u.x/nu*z,o.y+u.y/nu*z),q=pt(p.x+v.x/nv*z,p.y+v.y/nv*z),r=pt(o.x+v.x/nv*z,o.y+v.y/nv*z);return line(p,q)+line(q,r);}
function setup(id,steps,draw,summarySelector){
 const seq=document.getElementById(id);if(!seq)return;let index=0;
 const plot=seq.querySelector('[data-plot]'),calc=seq.querySelector('[data-calculation]'),formula=seq.querySelector('[data-formula]'),previous=seq.querySelector('[data-previous]');
 const render=()=>{const s=steps[index];plot.innerHTML=draw(index);plot.setAttribute('aria-label',s.aria||s.message);seq.querySelector('[data-title]').textContent=s.title;seq.querySelector('[data-message]').textContent=s.message;seq.querySelector('.sequence-count').textContent=`${index+1} / ${steps.length}`;if(calc)calc.hidden=!s.formula;if(formula)formula.innerHTML=s.formula||'';if(previous){previous.hidden=!s.previous;previous.innerHTML=s.previous?'ひとつ前：'+s.previous:'';}seq.querySelector('[data-back]').setAttribute('aria-disabled',String(index===0));seq.querySelector('[data-next]').setAttribute('aria-disabled',String(index===steps.length-1));seq.querySelector('[data-reset]').setAttribute('aria-disabled',String(index===0));for(const b of seq.querySelectorAll('[data-jump]')){const j=Number(b.dataset.jump);if(j===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}};
 seq.querySelector('[data-next]').addEventListener('click',()=>{if(index<steps.length-1){index++;render();}});
 seq.querySelector('[data-back]').addEventListener('click',()=>{if(index>0){index--;render();}});
 seq.querySelector('[data-reset]').addEventListener('click',()=>{index=0;render();});
 seq.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{index=Math.min(steps.length-1,Number(b.dataset.jump));render();}));
 seq.querySelector('[data-zoom]')?.addEventListener('click',()=>seq.querySelector('figure .figure-open')?.click());
 const card=seq.closest('.concept-card'),summary=seq.querySelector('.height-summary');
 if(card&&summary&&summarySelector){const source=card.querySelector(summarySelector);if(source)summary.append(source.cloneNode(true));}
 render();seq.hidden=false;card?.classList.add('has-height-sequence');
}
const span=(s,c)=>`<span class="sequence-${c}">${s}</span>`;

/* Lesson 11: similarity proof */
const A=pt(160,70),C=pt(160,310),B=pt(480,310),H=pt(275.2,156.4);
const simSteps=[
 {title:'まず、元の直角三角形を見る',message:'△ABCはCが直角。斜辺ABをc、BCをa、ACをbとします。まだ相似は使いません。'},
 {title:'斜辺へ高さCHを下ろす',message:'Cから斜辺ABへ垂線を下ろし、足をHとします。ABはAH=pとHB=qに分かれます。'},
 {title:'左の小三角形と全体を比べる',message:'△ACHと△ABCに注目。∠AHCと∠ACBはどちらも90°、さらに∠Aは共通なので相似です。'},
 {title:'対応する辺を、色でそろえる',message:'△ACH ↔ △ABCでは、AC=b ↔ AB=c、AH=p ↔ AC=b。対応を確認してから比を書きます。'},
 {title:'対応する辺で比例式を作る',message:'b:c=p:b。外側と内側を掛けるとb²=cpになります。',formula:`${span('b','base')} : c ＝ ${span('p','height')} : ${span('b','base')}`},
 {title:'左側から、b²=cpが出た',message:'左の相似から得た式を残します。次は右側でも同じ見方をします。',previous:`${span('b','base')} : c ＝ ${span('p','height')} : ${span('b','base')}`,formula:`${span('b²','base')} ＝ c${span('p','height')}`},
 {title:'右の小三角形と全体を比べる',message:'△BCHと△BACに注目。HとCが直角、∠Bが共通なので、この2つも相似です。'},
 {title:'右側でも対応から式を作る',message:'BC=a ↔ BA=c、BH=q ↔ BC=a。だからa:c=q:a、a²=cqです。',formula:`${span('a','side')} : c ＝ ${span('q','height')} : ${span('a','side')} → ${span('a²','side')} ＝ c${span('q','height')}`},
 {title:'2つの式を足す',message:'a²=cq と b²=cp を足すと、a²+b²=c(p+q)。左右の小三角形の結果が一つになります。',previous:`${span('a²','side')}＝cq、${span('b²','base')}＝cp`,formula:`${span('a²','side')} ＋ ${span('b²','base')} ＝ c(p＋q)`},
 {title:'p＋qは、斜辺cそのもの',message:'AH+HB=ABなのでp+q=c。代入するとa²+b²=c²。相似から三平方の定理にたどり着きました。',previous:`${span('a²','side')} ＋ ${span('b²','base')} ＝ c(p＋q)`,formula:`${span('a²','side')} ＋ ${span('b²','base')} ＝ c×c ＝ c²`}
];
function drawSim(i){
 let g=poly([A,C,B],gray,'#fff',1.8)+right(A,C,B);
 g+=line(A,C,brown,2.8)+line(C,B,blue,2.8)+line(A,B,ink,2.8);
 if(i>=1)g+=line(C,H,blue,2.2,'5 3')+right(A,H,C,11);
 const fade=i>=2&&i<=5?'#aeb7b1':gray;
 if(i>=2&&i<=5){g+=poly([A,C,H],ink,'#edf3f9',2.3)+line(A,C,brown,3.3)+line(A,H,brown,3.3);}
 if(i>=6&&i<=7){g+=poly([B,C,H],ink,'#f7eee6',2.3)+line(B,C,blue,3.3)+line(B,H,blue,3.3);}
 g+=txt(138,62,'A')+txt(501,323,'B')+txt(137,329,'C')+(i>=1?txt(H.x+18,H.y-8,'H'): '');
 g+=txt(132,193,'b',brown,20)+txt(320,337,'a',blue,20)+txt(340,98,'c',ink,20);
 if(i>=1){g+=txt(215,99,'p',brown,19)+txt(390,214,'q',blue,19);}
 if(i===2||i===3)g+=txt(320,395,'△ACH ∽ △ABC',ink,22);
 if(i===3){g+=txt(118,222,'b',brown,18)+txt(374,93,'c',brown,18)+txt(210,115,'p',blue,18)+txt(132,170,'b',blue,18);}
 if(i===6)g+=txt(320,395,'△BCH ∽ △BAC',ink,22);
 if(i>=8)g+=txt(320,405,'AH ＋ HB ＝ AB　→　p ＋ q ＝ c',i===9?blue:gray,20);
 return g+txt(320,450,i<2?'高さを引くと、2つの小さな直角三角形ができる':i<6?'左：△ACH と △ABC':'右：△BCH と △BAC',fade,16);
}
setup('similar-proof-sequence',simSteps,drawSim,'ol');

/* Lesson 15: surface routes and nets */
const netSteps=[
 {title:'何を求める問題？',message:'AからGまで、箱の表面だけを通る最短の道を求めます。「表面だけ」がこの問題の一番大事な条件です。'},
 {title:'まっすぐ結ぶと短そう。でも通れない',message:'AとGを空間の直線で結ぶと箱の内部を通ります。これは空間対角線で、今回の「表面だけ」という条件には合いません。'},
 {title:'立体を回して、中を通ることを確かめる',message:'点線は箱の内部を通っています。下の3D体験では、自分で回して奥行きを確かめられます。'},
 {title:'では、表面を通る道は？',message:'表面では面と面の境目で道が折れて見えます。でも、その2面を平らに開けば1本の直線として比べられます。'},
 {title:'面の色を覚えておこう',message:'青・橙・緑の面は、立体でも展開図でも同じ面です。開いても「どの面だったか」を色で追えます。'},
 {title:'候補①：3×4面と2×4面を開く',message:'青い3×4面と橙の2×4面を横につなぐと、横は3+2=5、縦は4。対角線の二乗は41です。',formula:`①　(3＋2)² ＋ 4² ＝ 5²＋4² ＝ ${span('41','side')}`},
 {title:'候補②：3×2面と3×4面を開く',message:'緑の3×2面と青い3×4面をつなぐと、横は4+3=7、縦は2。対角線の二乗は53です。',previous:'①　5²＋4²＝41',formula:`②　(4＋3)² ＋ 2² ＝ 7²＋2² ＝ ${span('53','height')}`},
 {title:'候補③：2×4面と3×2面を開く',message:'橙の2×4面と緑の3×2面をつなぐと、横は4+2=6、縦は3。対角線の二乗は45です。',previous:'②　7²＋2²＝53',formula:`③　(4＋2)² ＋ 3² ＝ 6²＋3² ＝ ${span('45','base')}`},
 {title:'3つを同じ基準で比べる',message:'候補は√41、√53、√45。どれも正の長さなので、平方根を計算しなくても二乗41・53・45を比べれば順番が分かります。',previous:'候補：√41、√53、√45',formula:`41、53、45 を比べる`},
 {title:'41＜45＜53',message:'一番小さいのは41。したがって候補①が最短です。',previous:'41、53、45',formula:`${span('41','side')} ＜ ${span('45','base')} ＜ ${span('53','height')}`},
 {title:'答えは√41 cm',message:'最短経路は候補①の√41 cm。大事なのは、立体の中の直線ではなく「通れる表面」を開いて比べたことです。',previous:'41＜45＜53',formula:`最短 ＝ ${span('√41 cm','side')}`}
];
function netRect(x,y,w,h,label,a,b,active,answer,split,colors){
 let g=poly([pt(x,y),pt(x+w,y),pt(x+w,y+h),pt(x,y+h)],active?ink:light,'#fff',active?2:1.3);
 if(split&&colors){
   const sw=w*split;
   g+=`<rect x="${x}" y="${y}" width="${sw}" height="${h}" fill="${colors[0]}" opacity=".72"/>`;
   g+=`<rect x="${x+sw}" y="${y}" width="${w-sw}" height="${h}" fill="${colors[1]}" opacity=".72"/>`;
   g+=line(pt(x+sw,y),pt(x+sw,y+h),gray,1.2,'5 4');
   g+=poly([pt(x,y),pt(x+w,y),pt(x+w,y+h),pt(x,y+h)],active?ink:light,'none',active?2:1.3);
 }
 g+=line(pt(x,y+h),pt(x+w,y),active?ink:light,active?2.7:1.2);
 g+=txt(x+w/2,y-18,label,active?ink:gray,20)+txt(x+w/2,y-2,String(a),active?blue:gray,17)+txt(x+w+20,y+h/2,String(b),active?brown:gray,17);
 if(answer)g+=txt(x+w/2,y+h+34,answer,active?ink:gray,20);return g;
}
function boxStatic(showInside=true,showSurface=false){
 const A=pt(170,315),B=pt(365,315),C=pt(445,255),D=pt(250,255),E=pt(170,145),F=pt(365,145),G=pt(445,85),H=pt(250,85);
 let g=poly([A,B,F,E],ink,'#dfeaf6',1.7)+poly([B,C,G,F],ink,'#f6e4d6',1.7)+poly([E,F,G,H],ink,'#e4efe1',1.7);
 for(const [u,v] of [[A,D],[D,C],[D,H],[H,G],[C,G]])g+=line(u,v,gray,1.2,'5 4');
 g+=txt(A.x-18,A.y+18,'A',ink,20)+txt(G.x+18,G.y-8,'G',ink,20);
 if(showInside)g+=line(A,G,blue,3,'7 5')+txt(316,210,'箱の中',blue,18);
 if(showSurface)g+=line(A,B,brown,3.5)+line(B,G,brown,3.5)+txt(386,238,'表面',brown,18);
 g+=txt(267,347,'3',blue,17)+txt(389,303,'2',brown,17)+txt(145,235,'4',ink,17);
 return g;
}
function drawNet(i){
 let g=txt(320,28,'問い：A → G を「表面だけ」で進む最短経路は？',ink,18);
 if(i===0)return g+boxStatic(false,false)+txt(320,405,'まず「どこを通ってよいか」を確認する',gray,18);
 if(i===1)return g+boxStatic(true,false)+txt(320,405,'空間対角線は短そうでも、箱の内部なので条件外',blue,18);
 if(i===2)return g+boxStatic(true,false)+txt(320,405,'下の3Dで回して、点線の奥行きを確かめよう',blue,18);
 if(i===3)return g+boxStatic(false,true)+txt(320,405,'表面の道は面の境目で折れて見える',brown,18);
 if(i===4)return g+boxStatic(false,true)+txt(320,420,'青 3×4　橙 2×4　緑 3×2　→ 展開しても同じ色',ink,17);
 if(i===5)return g+netRect(170,120,300,180,'候補①',5,4,true,'√41',3/5,['#dfeaf6','#f6e4d6'])+txt(320,390,'青3 + 橙2 = 5',ink,19);
 if(i===6)return g+netRect(145,145,350,100,'候補②',7,2,true,'√53',4/7,['#dfeaf6','#e4efe1'])+txt(320,360,'青4 + 緑3 = 7',ink,19);
 if(i===7)return g+netRect(170,145,300,150,'候補③',6,3,true,'3√5',4/6,['#f6e4d6','#e4efe1'])+txt(320,390,'橙4 + 緑2 = 6',ink,19);
 g+=netRect(35,115,155,124,'①',5,4,true,'√41',3/5,['#dfeaf6','#f6e4d6']);
 g+=netRect(242,115,196,56,'②',7,2,true,'√53',4/7,['#dfeaf6','#e4efe1']);
 g+=netRect(482,115,132,66,'③',6,3,true,'3√5',4/6,['#f6e4d6','#e4efe1']);
 g+=txt(320,330,'二乗：① 41　② 53　③ 45',i>=9?blue:ink,21);
 if(i>=9)g+=txt(320,375,'41 ＜ 45 ＜ 53',blue,23);
 if(i===10)g+=txt(320,420,'最短は ① √41 cm',blue,25);
 return g;
}
setup('surface-net-sequence',netSteps,drawNet,'ol');

/* Lesson 16: connections */
const connSteps=[
 {title:'平方根：面積から長さへ戻す',message:'三平方でc²=13まで求めても、欲しいのは辺の長さ。平方根を使ってc=√13へ戻します。'},
 {title:'円：直角を見つける',message:'直径に対する円周角や、半径と接線の直角が「三平方を使える三角形」を見つける入口になります。'},
 {title:'相似：足りない関係を作る',message:'高さを引いてできる相似から辺の対応を読み、三平方そのものを証明したり、長さの関係を増やしたりできます。'},
 {title:'座標：差を2辺の長さにする',message:'x座標の差とy座標の差を直角三角形の横・縦にすると、2点間の距離を三平方で求められます。'},
 {title:'二次方程式：未知の長さを式にする',message:'辺をxと置き、三平方の式を二次方程式として解きます。最後に「長さ>0」など元の条件で解を選びます。'},
 {title:'道具を選ぶ順番が見えてきた',message:'条件を読む→直角三角形を見つける→辺を式につなぐ→計算する→元の条件へ戻る。この流れが次の学びにもつながります。'}
];
const labels=[
 ['平方根','c²＝13','c＝√13'],
 ['円','直径 → 90°','直角三角形'],
 ['相似','対応する辺','比例式'],
 ['座標','Δx・Δy','2辺の長さ'],
 ['二次方程式','x²＋(x＋1)²＝25','解＋条件']
];
function drawConn(i){
 let g='';const upto=i===5?4:i;
 for(let k=0;k<=upto;k++){const y=55+k*66,active=i===5||k===i,c=active?blue:gray;g+=`<rect x="55" y="${y}" width="145" height="46" rx="10" fill="${active?'#edf3f9':'#fafafa'}" stroke="${c}" stroke-width="${active?2:1.2}"/>`+txt(127,y+29,labels[k][0],c,18)+line(pt(210,y+23),pt(280,y+23),c,active?2:1.2)+txt(245,y+14,'→',c,18)+`<rect x="290" y="${y}" width="140" height="46" rx="10" fill="#fff" stroke="${c}" stroke-width="${active?2:1.2}"/>`+txt(360,y+29,labels[k][1],c,16)+line(pt(440,y+23),pt(485,y+23),c,active?2:1.2)+txt(462,y+14,'→',c,18)+txt(548,y+29,labels[k][2],c,17);}
 if(i===5)g+=txt(320,403,'条件 → 直角三角形 → 式 → 計算 → 条件へ戻る',ink,21);
 return g;
}
setup('connection-sequence',connSteps,drawConn,'ol');
})();