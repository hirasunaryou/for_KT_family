/* Paper-first companion: all lesson and question text also works without JavaScript. */
(()=>{'use strict';
const $=id=>document.getElementById(id),M=window.SimilarityMath,f=n=>String(Math.round(n*1000)/1000),T=(x,y,s,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`,poly=(p,cls)=>`<polygon points="${p.map(v=>v.join(',')).join(' ')}" class="${cls}"/>`,line=(a,b,cls='line')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}"/>`;
function dots(p,names,colors=false){return p.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="4" fill="${colors?['#285c50','#3566a0','#b6502f'][i]:'#253b39'}"/>`+T(x+(i===1?13:-12),y+(i===2?-12:22),names[i])).join('');}
function input(id,fn){$(id).addEventListener('input',fn);}
function shape(){const k=+$('shape-k').value,both=$('shape-mode').value==='both',v=M.stretch(k,both),u=34,base=[[0,0],[3,0],[0,2]],map=(p,x)=>p.map(([a,b])=>[x+a*u,240-b*u]);$('shape-k-value').value=f(k);
 const p=map(base,45),q=map(base.map(([x,y])=>[x*v.sx,y*v.sy]),295);
 $('shape-plot').innerHTML=T(100,35,'もとの△ABC')+T(395,35,'変形後の△DEF')+poly(p,'shape')+poly(map(base,295),'ghost')+poly(q,'target')+dots(p,'ABC')+dots(q,'DEF')+T(90,285,'横3・縦2')+T(390,285,`横${f(3*v.sx)}・縦${f(2*v.sy)}`);
 $('shape-result').innerHTML=`<strong>${v.similar?'対応する辺の倍率がそろう → 相似':'辺の倍率がそろわない → 相似ではない'}</strong><div class="ratio-list"><span>横の辺：${f(v.sx)}倍 ／ 縦の辺：${f(v.sy)}倍</span><span>斜めの辺：約${f(v.sideRatio)}倍</span><span>∠B ≈ ${f(Math.atan2(2,3)*180/Math.PI)}°</span><span>∠E ≈ ${f(v.angle)}°</span></div>`;
}
input('shape-k',shape);input('shape-mode',shape);document.querySelectorAll('[data-shape]').forEach(b=>b.addEventListener('click',()=>{const [mode,k]=b.dataset.shape.split(',');$('shape-mode').value=mode;$('shape-k').value=k;shape();}));shape();
let stage=0;function match(){const source=M.match(4),p=M.match(stage),colors=$('match-colors').checked;
 const notes=['まず対応を予想しよう。2つの三角形は重なり、向きも違います。','△DEFを右へ移動しました。辺の長さと角は変わりません。','△DEFを回しました。まだ左右が逆です。長さは変わりません。','△DEFを裏返しました。A↔D、B↔E、C↔Fの向きがそろいました。','△DEFを2/3倍に縮めて移動すると、△ABCと重なります。各辺が同じ倍率で変わり、角は変わりません。'];
 $('match-plot').innerHTML=T(270,30,`手順 ${stage+1} / 5`)+(stage?poly(M.match(stage-1),'ghost'):'')+poly(source,'shape')+poly(p,'target')+dots(source,stage===4?['A/D','B/E','C/F']:'ABC',colors)+(stage===4?'':dots(p,'DEF',colors));
 $('match-result').innerHTML=`<strong>${['予想する','移動する','回転する','裏返す','倍率をそろえる'][stage]}</strong><p>${notes[stage].split('。').filter(Boolean).map(t=>`<span class="short-line">${t}。</span>`).join('')}</p>`;
 document.querySelectorAll('[data-match]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.match===stage)));
}document.querySelectorAll('[data-match]').forEach(b=>b.addEventListener('click',()=>{stage=+b.dataset.match;match();}));input('match-colors',match);match();
let parallelView='left';
function angleArc(a,o,b,color,double=false,dashed=false){
 const start=Math.atan2(a[1]-o[1],a[0]-o[0]);let delta=Math.atan2(b[1]-o[1],b[0]-o[0])-start;
 while(delta>Math.PI)delta-=2*Math.PI;while(delta< -Math.PI)delta+=2*Math.PI;
 return (double?[17,23]:[20]).map(r=>{const p=[o[0]+r*Math.cos(start),o[1]+r*Math.sin(start)],q=[o[0]+r*Math.cos(start+delta),o[1]+r*Math.sin(start+delta)];return `<path data-angle-arc d="M${p} A${r},${r} 0 0 ${delta>0?1:0} ${q}" fill="none" stroke="${color}" stroke-width="2.5"${dashed?' stroke-dasharray="3 3"':''}/>`;}).join('');
}
function parallel(){const t=+$('parallel-t').value;if($('parallel-lock').checked)$('parallel-u').value=t;$('parallel-u').disabled=$('parallel-lock').checked;const u=+$('parallel-u').value,v=M.parallel(t,u),map=p=>[245+40*p[0],50+40*p[1]],A=map(v.A),B=map(v.B),C=map(v.C),D=map(v.D),E=map(v.E);$('parallel-t-value').value=f(t);$('parallel-u-value').value=f(u);
 $('parallel-plot').innerHTML=poly([A,B,C],'shape')+poly([A,D,E],'inner')+[A,B,C].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#253b39"/>`).join('')+T(A[0],A[1]-14,'A')+T(B[0]-12,B[1]+23,'B')+T(C[0]+12,C[1]+23,'C')+T(D[0]-16,D[1],'D')+T(E[0]+16,E[1],'E')+T(270,345,v.parallel?'DE ∥ BC':'DEはBCと平行ではない');
 const left=parallelView==='left',right=parallelView==='right',color=left?'#3566a0':'#98502f',moving=v.parallel?color:'#61716b';
 if(left||right){
  $('parallel-plot').innerHTML+=left?angleArc(A,D,E,moving,false,!v.parallel)+angleArc(A,B,C,color):angleArc(A,E,D,moving,v.parallel,!v.parallel)+angleArc(A,C,B,color,true);
  const names=left?['ADE','ABC']:['AED','ACB'],values=v.angles[parallelView],degrees=n=>(Math.round(n*10)/10).toFixed(1);
  $('parallel-angle-result').innerHTML=`<strong>${left?'DとB':'EとC'}の角に注目</strong><p><span style="color:${moving}">∠${names[0]} ≈ ${degrees(values[0])}°</span><br><span style="color:${color}">∠${names[1]} ≈ ${degrees(values[1])}°</span></p><p>${v.parallel?'同じ向きの平行線が作る同位角なので、等しくなります。':'破線の角が変わり、2つの角は等しくありません。平行の条件が大切です。'}</p>`;
 }else{
  $('parallel-plot').innerHTML+=angleArc(A,D,E,v.parallel?'#3566a0':'#61716b',false,!v.parallel)+angleArc(A,B,C,'#3566a0')+angleArc(A,E,D,v.parallel?'#98502f':'#61716b',v.parallel,!v.parallel)+angleArc(A,C,B,'#98502f',true);
  $('parallel-angle-result').innerHTML=`<strong>${v.parallel?'2組の角が、それぞれ等しい':'今は、平行ではありません'}</strong><p>${v.parallel?'D ↔ B、E ↔ C。2組の角がそろうので、△ADE ∽ △ABC。だから対応する辺の比もそろいます。':'AD/ABとAE/ACが違うので、この対応の相似や比の式は使えません。「平行に保つ」を選び、角と比がそろう様子を確かめよう。'}</p>`;
 }
 $('parallel-plot').setAttribute('aria-label',`${v.parallel?'DEとBCは平行':'DEとBCは平行ではない'}。${$('parallel-angle-result').textContent}`);
 document.querySelectorAll('[data-parallel-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.parallelView===parallelView)));
 $('parallel-result').hidden=parallelView!=='ratios';
 $('parallel-result').innerHTML=`<strong>${v.parallel?'平行 → 2組の角が等しい':'平行の条件を外した状態'}</strong><div class="ratio-list"><span>AD / AB = ${f(v.ratios[0])}</span><span>AE / AC = ${f(v.ratios[1])}</span><span>DE / BC ≈ ${f(v.ratios[2])}</span></div><p>${v.parallel?'△ADE ∽ △ABC。対応する3組の辺の比がそろいます。':'AD/ABとAE/ACが違うので、この対応で相似とは言えません。平行のときの比の式をそのまま使えません。'}</p>`;
}
document.querySelectorAll('[data-parallel-view]').forEach(b=>b.addEventListener('click',()=>{parallelView=b.dataset.parallelView;parallel();}));
['parallel-t','parallel-u','parallel-lock'].forEach(id=>input(id,parallel));$('parallel-mid').addEventListener('click',()=>{$('parallel-lock').checked=true;$('parallel-t').value=.5;parallel();});$('parallel-break').addEventListener('click',()=>{$('parallel-lock').checked=false;const t=+$('parallel-t').value;$('parallel-u').value=f(t+(t<=.55?.25:-.25));parallel();});parallel();
let revealed=false,scaleKind='stretch';
function square(x,y,w,h,unit,cls){let s=poly([[x,y],[x+w,y],[x+w,y-h],[x,y-h]],cls);for(let a=unit;a<w-1e-8;a+=unit)s+=line([x+a,y],[x+a,y-h]);for(let a=unit;a<h-1e-8;a+=unit)s+=line([x,y-a],[x+w,y-a]);return s;}
function cube(x,y,k){const n=45,kx=k*n,dx=.48*kx,dy=.4*kx;let s=poly([[x,y],[x+kx,y],[x+kx,y-kx],[x,y-kx]],'shape')+poly([[x,y-kx],[x+dx,y-kx-dy],[x+kx+dx,y-kx-dy],[x+kx,y-kx]],'inner')+poly([[x+kx,y],[x+kx+dx,y-dy],[x+kx+dx,y-kx-dy],[x+kx,y-kx]],'target');
 for(let a=1;a<k;a++){const z=a*n;s+=line([x+z,y],[x+z,y-kx])+line([x,y-z],[x+kx,y-z])+line([x+z,y-kx],[x+z+dx,y-kx-dy])+line([x+.48*z,y-kx-.4*z],[x+kx+.48*z,y-kx-.4*z])+line([x+kx,y-z],[x+kx+dx,y-z-dy])+line([x+kx+.48*z,y-.4*z],[x+kx+.48*z,y-kx-.4*z]);}return s;}
function scaleDimensions(x,y,kx,ky,depth=false){const w=45*kx,h=45*ky;return `<g class="scale-axis-y">${line([x,y],[x,y-h],'scale-edge')}${T(x-28,y-h/2+6,`縦${f(ky)}`)}</g><g class="scale-axis-x">${line([x,y],[x+w,y],'scale-edge')}${T(x+w/2,y+30,`横${f(kx)}`)}</g>`+(depth?`<g class="scale-axis-z">${line([x+w,y],[x+w+.48*w,y-.4*h],'scale-edge')}${T(x+w+.24*w+26,y-.2*h+8,`奥行${f(kx)}`,'start')}</g>`:'');}
function scale(reset=false){if(reset)revealed=false;const k=+$('scale-k').value,kind=scaleKind,v=M.powers(k,kind),kx=kind==='stretch'?1:k;$('scale-k-value').value=f(k);let s=T(100,40,'もとの図')+T(370,40,'変えた図');
 if(kind==='volume')s+=`<g data-scale-original>${cube(65,270,1)}</g><g data-scale-target>${cube(280,270,k)}</g>`+scaleDimensions(65,270,1,1,true)+scaleDimensions(280,270,k,k,true);
 else{s+=`<g data-scale-original>${square(65,270,45,45,45,'shape')}</g><g data-scale-target>${square(280,270,45*kx,45*k,45,'target')}</g>`;
  if(kind==='area'&&k!==1){const previous=[[280,270],[325,270],[325,270-45*k],[280,270-45*k]];s+=`<g data-scale-previous>${poly(previous,'scale-previous-under')}${poly(previous,'scale-previous-outline')}</g>`;}
  s+=scaleDimensions(65,270,1,1)+scaleDimensions(280,270,kx,k);
 }
 s+=T(270,355,kind==='stretch'?'横は1のまま。縦だけを変えた。':kind==='area'?(k===1?'k＝1なら、もとの図と同じ。':'破線は①の形。横も同じ倍率にした。'):'正面の縦・横に、奥行きが加わる。');
 const axis=(name,value,cls)=>`<span class="scale-axis-${cls}">${name}${f(value)}</span>`;
 const factors=axis('縦',k,'y')+' × '+axis('横',kx,'x')+(kind==='volume'?' × '+axis('奥行',k,'z'):'');
 $('scale-focus').innerHTML=kind==='stretch'?'まずは一方向。<br>青い縦だけを変え、茶色の横は1のまま。':kind==='area'?'次は二方向。<br>縦の長さを保ち、茶色の横も同じ倍率に。': '立体では三方向。<br>正面の縦・横に、緑の奥行きも加わります。';
 document.querySelectorAll('[data-scale-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scaleKind===kind)));
 $('scale-plot').innerHTML=s;$('scale-reveal').textContent=revealed?'結果を隠して、もう一度予想':'予想したので、結果を見る';$('scale-reveal').setAttribute('aria-pressed',String(revealed));
 $('scale-result').innerHTML=!revealed?'図を手がかりに、倍率を紙に予想してから結果を開こう。':kind==='volume'?`<strong>体積は ${f(v.volume)}倍</strong><p>${factors} = ${f(v.volume)}<br>縦・横・奥行きの3方向。<br>表面積は ${f(v.area)}倍です。</p>`:kind==='stretch'?`<strong>面積は ${f(v.area)}倍</strong><p>${factors} = ${f(v.area)}<br>${k===1?'k=1なので、元と同じ図です。':'縦と横の倍率が違うので、元の正方形とは相似ではありません。'}</p>`:`<strong>面積は ${f(v.area)}倍</strong><p>${factors} = ${f(v.area)}<br>縦・横ともにk倍だから、面積はk × k＝k²倍。<br>周の長さは ${f(k)}倍です。</p>`;
 $('scale-plot').setAttribute('aria-label',`${kind==='volume'?'立方体':kind==='stretch'?'縦だけを変えた長方形':'縦横を同じ倍率にした正方形'}。もとの1辺は1。変えた図は縦${f(k)}、横${f(kx)}${kind==='volume'?`、奥行き${f(k)}`:''}。${revealed?$('scale-result').textContent:'面積・体積の倍率を予想しよう。'}`);
}
input('scale-k',()=>scale(true));document.querySelectorAll('[data-scale-kind]').forEach(b=>b.addEventListener('click',()=>{scaleKind=b.dataset.scaleKind;scale(true);}));document.querySelectorAll('[data-scale]').forEach(b=>b.addEventListener('click',()=>{$('scale-k').value=b.dataset.scale;scale(true);}));$('scale-reveal').addEventListener('click',()=>{revealed=!revealed;scale();});scale();
const key='family-similarity-v1',labels={own:'自力でできた',hint:'ヒントでできた',review:'もう一度'},cards=[...document.querySelectorAll('.q-card')];let grades={},storage=true;
try{const raw=JSON.parse(localStorage.getItem(key)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [id,v] of Object.entries(raw))if(cards.some(c=>c.id===id)&&Object.hasOwn(labels,v))grades[id]=v;localStorage.setItem(key,JSON.stringify(grades));}catch{storage=false;}
function report(){cards.forEach(c=>{c.querySelector('.q-status').textContent=labels[grades[c.id]]||'まだ記録していません';c.querySelectorAll('[data-grade]').forEach(b=>b.setAttribute('aria-pressed',String(grades[c.id]===b.dataset.grade)));});const n=Object.values(grades).filter(v=>v==='own').length;$('progress').value=n;$('progress-text').textContent=`自力でできた ${n} / ${cards.length}問。ヒントでできた ${Object.values(grades).filter(v=>v==='hint').length}問。`;$('storage-notice').hidden=storage;$('review-links').innerHTML=cards.filter(c=>['hint','review'].includes(grades[c.id])).map(c=>`<a class="button" href="#${c.id}">問${c.id.slice(1)}へ</a>`).join('');}
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>{const id=b.closest('.q-card').id;if(grades[id]===b.dataset.grade)delete grades[id];else grades[id]=b.dataset.grade;try{localStorage.setItem(key,JSON.stringify(grades));}catch{storage=false;}report();}));
function group(name){cards.forEach(c=>c.hidden=name!=='all'&&c.dataset.group!==name);document.querySelectorAll('[data-group-button]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.groupButton===name)));}
document.querySelectorAll('[data-group-button]').forEach(b=>b.addEventListener('click',()=>{group(b.dataset.groupButton);if(/^#q\d+$/.test(location.hash))history.replaceState(null,'','#practice');}));
function route(){if(!/^#q\d+$/.test(location.hash))return;const c=$(location.hash.slice(1));if(!c||!c.classList.contains('q-card'))return;group(c.dataset.group);c.focus();c.scrollIntoView({block:'start'});}
report();group(cards[0].dataset.group);document.documentElement.classList.add('js-ready');route();window.addEventListener('hashchange',route);
})();
