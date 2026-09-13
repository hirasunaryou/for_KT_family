/* Independent static lesson. All graphs are calculated locally. */
(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const Q=window.QUADRATIC_QUESTIONS;
const fmt=n=>String(Math.round((Object.is(n,-0)?0:n)*1000000)/1000000).replace('-', '−');
const coeff=a=>a===1?'':a===-1?'−':a===.5?'½':a===-.5?'−½':fmt(a);
const formula=a=>`y = ${coeff(a)}x²`;
const value=id=>Number($('#'+id).value);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='family-quadratic-functions-v1';
const grades={own:'自力でできた',help:'ヒントでできた',review:'もう一度'};
let state={},stage='start';
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(saved.version===1&&saved.grades&&typeof saved.grades==='object'){for(const q of Q)if(Object.hasOwn(grades,saved.grades[q.id]))state[q.id]=saved.grades[q.id];}localStorage.setItem(KEY,JSON.stringify({version:1,grades:state}));}catch{$('#storage-notice').hidden=false;}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,grades:state}));}catch{$('#storage-notice').hidden=false;}}
// SVG coordinates: fixed viewport for the three explorers; equal scales for geometry/worksheet graphs.
function draw(svg,{a=null,compare=false,points=[],interval=null,secant=null,geometry=false,blank=false,xmin=-3.5,xmax=3.5,ymin=-20,ymax=20,equal=false}={}){
 let w=460,h=366,l=50,t=32;
 if(equal){const u=Math.min(w/(xmax-xmin),h/(ymax-ymin));l+=(w-u*(xmax-xmin))/2;w=u*(xmax-xmin);h=u*(ymax-ymin);}
 const X=x=>l+(x-xmin)/(xmax-xmin)*w,Y=y=>t+(ymax-y)/(ymax-ymin)*h;
 const clip='clip-'+svg.id;
 let s=`<defs><clipPath id="${clip}"><rect x="${l}" y="${t}" width="${w}" height="${h}"/></clipPath></defs>`;
 const line=(x1,y1,x2,y2,cls)=>`<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" class="${cls}"/>`;
 const text=(x,y,label,extra='')=>`<text x="${x}" y="${y}" ${extra}>${esc(label)}</text>`;
 const ystep=equal?((ymax-ymin)>24?5:(ymax-ymin)>14?2:1):(ymax>50?25:5);
 for(let x=Math.ceil(xmin);x<=xmax;x++){s+=line(x,ymin,x,ymax,'gridline');if(x)s+=text(X(x),Y(0)+20,fmt(x),'text-anchor="middle"');}
 for(let y=Math.ceil(ymin/ystep)*ystep;y<=ymax;y+=ystep){s+=line(xmin,y,xmax,y,'gridline');if(y)s+=text(X(0)-10,Y(y)+4,fmt(y),'text-anchor="end"');}
 s+=line(xmin,0,xmax,0,'axis')+line(0,ymin,0,ymax,'axis');s+=text(X(xmax)+13,Y(0)+5,'x')+text(X(0)+10,Y(ymax)-12,'y')+text(X(0)-14,Y(0)+20,'O');
 const curve=(a,cls,lo=xmin,hi=xmax)=>{let d='';for(let i=0;i<=240;i++){const x=lo+(hi-lo)*i/240;d+=`${i?'L':'M'}${X(x).toFixed(2)},${Y(a*x*x).toFixed(2)} `;}return `<path d="${d}" class="${cls}"/>`;};
 s+=`<g clip-path="url(#${clip})">`;
 if(compare)s+=curve(1,'guide');if(a!==null&&!blank)s+=curve(a,'curve');
 if(interval){const [p,q]=interval;const vals=[a*p*p,a*q*q];if(p<=0&&q>=0)vals.push(0);const low=Math.min(...vals),high=Math.max(...vals);s+=`<rect x="${l}" y="${Y(high)}" width="${w}" height="${Math.max(1,Y(low)-Y(high))}" fill="#3566a0" opacity=".08"/>`+curve(a,'highlight',p,q);s+=`<line x1="${l+w-5}" x2="${l+w-5}" y1="${Y(low)}" y2="${Y(high)}" stroke="#3566a0" stroke-width="5"/>`;}
 if(secant){const [p,q]=secant,yp=a*p*p,yq=a*q*q,m=(yq-yp)/(q-p),b=yp-m*p;s+=line(xmin,m*xmin+b,xmax,m*xmax+b,'secant')+line(p,yp,q,yp,'guide')+line(q,yp,q,yq,'guide');}
 if(geometry){
  const {p,q,step}=geometry,yp=a*p*p,yq=a*q*q,c=-a*p*q,m=a*(p+q);
  const poly=(pts,cls)=>`<polygon points="${pts.map(([x,y])=>`${X(x)},${Y(y)}`).join(' ')}" class="${cls}"/>`;
  s+=line(xmin,m*xmin+c,xmax,m*xmax+c,'guide');
  if(step===0)s+=poly([[0,0],[p,yp],[q,yq]],'area-whole');
  else s+=poly([[0,0],[p,yp],[0,c]],'area-a-fill')+poly([[0,0],[0,c],[q,yq]],'area-b-fill');
  if(step>=1)s+=line(0,0,0,c,'area-base');
  if(step>=2)s+=line(p,yp,0,yp,'height-a')+line(q,yq,0,yq,'height-b');
 }
 s+='</g>';
 for(const [x,y,label] of points){if(x<xmin||x>xmax||y<ymin||y>ymax)continue;s+=`<circle cx="${X(x)}" cy="${Y(y)}" r="4.5" fill="#b6502f"/>`;if(label)s+=text(X(x)+9,Y(y)-9,label);}
 svg.innerHTML=s;
}
function shape(changed){
 if(changed==='shape-a-number'){
  const el=$('#shape-a-number'),n=Number(el.value);
  if(el.value.trim()===''||!Number.isFinite(n)||n< -10||n>10||Math.abs(n*20-Math.round(n*20))>1e-7){$('#shape-input-message').textContent='−10〜10の数を、0.05刻みで入力してください。';el.setAttribute('aria-invalid','true');return;}
  $('#shape-a').value=n;
 }
 const a=value('shape-a'),x=value('shape-x'),y=a*x*x,extent=value('shape-view');
 $('#shape-a-number').value=a;$('#shape-a-number').removeAttribute('aria-invalid');$('#shape-input-message').textContent='';
 $('#shape-a-value').textContent=fmt(a);$('#shape-x-value').textContent=fmt(x);
 draw($('#shape-plot'),{a,compare:true,ymin:-extent,ymax:extent,points:[[x,y,'P'],[-x,y,x!==0?'P′':'']]});
 $('#shape-plot').setAttribute('aria-label',`${formula(a)}。点P(${fmt(x)}, ${fmt(y)})。y軸に対して対称。${Math.abs(y)>extent?'点Pは表示範囲の外です。':''}`);
 $('#shape-result').innerHTML=`<strong>${a===0?'y = 0':formula(a)}</strong><br>x = ${fmt(x)} → y = ${fmt(y)}<br>${a===0?'a = 0ではx軸と重なる直線。二次関数ではありません。':(a>0?'上':'下')+'向きに開きます。'}<br>x = ${fmt(-x)} でも、yは同じ ${fmt(y)}。${Math.abs(y)>extent?'<br><b>点Pは表示範囲の外です。「広く見る」で確認できます。</b>':''}`;
 $('#shape-table').innerHTML=`<table class="data-table"><caption>${a===0?'y = 0':formula(a)} の表。左右を比べてみよう。</caption><tbody><tr><th scope="row">x</th>${[-3,-2,-1,0,1,2,3].map(x=>`<td>${fmt(x)}</td>`).join('')}</tr><tr><th scope="row">y</th>${[-3,-2,-1,0,1,2,3].map(x=>`<td>${fmt(a*x*x)}</td>`).join('')}</tr></tbody></table>`;
}
let areaStep=3,areaBounds=null;
function area(){
 const a=value('area-a'),p=value('area-left'),q=value('area-right'),yp=a*p*p,yq=a*q*q,c=-a*p*q;
 const base=Math.abs(c),ha=-p,hb=q,sa=base*ha/2,sb=base*hb/2,total=sa+sb;
 for(const [id,n] of [['a',a],['left',p],['right',q]])$('#area-'+id+'-value').textContent=fmt(n);
 if(!areaBounds||!$('#area-lock').checked)areaBounds={xmin:-3.5,xmax:3.5,ymin:Math.min(-1,Math.floor(Math.min(yp,yq,c,0)/2)*2-1),ymax:Math.max(10,Math.ceil(Math.max(yp,yq,c,0)/2)*2+1)};
 const doubleButton=$('[data-area="double"]');doubleButton.disabled=Math.abs(a)>1.5||a===0;doubleButton.title=doubleButton.disabled?'2倍の値が−3〜3に入る、0以外のaで使えます。':'AとBのx座標を保ち、aを2倍にします。';
 const outside=[yp,yq,c].some(y=>y<areaBounds.ymin||y>areaBounds.ymax);
 draw($('#area-plot'),{a,geometry:{p,q,step:areaStep},...areaBounds,equal:true,points:[[p,yp,'A'],[q,yq,'B'],...(a!==0&&areaStep>=1?[[0,c,'C']]:[])]});
 $('#area-plot').setAttribute('aria-label',`A(${fmt(p)}, ${fmt(yp)})、B(${fmt(q)}, ${fmt(yq)})、C(0, ${fmt(c)})。底辺OCは${fmt(base)}、高さは${fmt(ha)}と${fmt(hb)}。三角形OABの面積は${fmt(total)}。`);
 $('#area-coordinates').textContent=`${a===0?'y = 0':formula(a)}　A(${fmt(p)}, ${fmt(yp)})　B(${fmt(q)}, ${fmt(yq)})　C(0, ${fmt(c)})`;
 const steps=[
  'まずは三角形OAB全体を見よう。aを変えると、AとBは縦に動きます。斜めの辺を測らずに面積を出すには？',
  '直線ABとy軸の交点をCとします。紫のOCで分けると、青い三角形OACと橙の三角形OCBになります。',
  `共通の底辺は紫のOC = ${fmt(base)}。高さは底辺に垂直な「横の距離」で、青が${fmt(ha)}、橙が${fmt(hb)}です。A・Bのy座標は高さではありません。`,
  `青と橙それぞれで「底辺 × 高さ ÷ 2」を計算し、最後に足します。${a<0?'下向きでも、底辺の長さと面積は正の数です。':'A・Bのxを固定すると、|a|を2倍にしたとき底辺も面積も2倍になります。'}`
 ];
 $('#area-guidance').textContent=a===0?'a = 0ではO・A・Bが一直線に並びます。底辺OCは0、面積も0。二次関数の三角形との比較用です。':steps[areaStep];
 $('#area-calculation').hidden=areaStep<3;
 const card=(name,cls,h,answer)=>`<div class="area-part ${cls}"><strong>${name}</strong><span>底辺 ${fmt(base)} × 高さ ${fmt(h)} ÷ 2</span><b>${fmt(answer)}</b></div>`;
 $('#area-calculation').innerHTML=card('青：三角形OAC','area-part-a',ha,sa)+card('橙：三角形OCB','area-part-b',hb,sb)+`<div class="area-total"><span>三角形OABの面積</span><strong>${fmt(sa)} + ${fmt(sb)} = ${fmt(total)}</strong></div>`;
 $('#area-scale-note').textContent=($('#area-lock').checked?'目盛りを固定中。':'図全体が見えるよう、拡大率を自動調整しています。大きさを比べるときは「目盛りを固定」を使おう。')+(outside?' 一部の点が表示範囲の外です。「図全体が入る範囲に戻す」で確認できます。':'');
 $$('[data-area-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.areaStep)===areaStep)));
}
function range(changed){const a=value('range-a');let p=value('range-left'),q=value('range-right');if(p>q){if(changed==='range-left')$('#range-right').value=p;else $('#range-left').value=q;p=value('range-left');q=value('range-right');}$('#range-left-value').textContent=fmt(p);$('#range-right-value').textContent=fmt(q);const zero=p<=0&&q>=0,vals=[a*p*p,a*q*q,...(zero?[0]:[])],lo=Math.min(...vals),hi=Math.max(...vals);draw($('#range-plot'),{a,interval:[p,q],points:[[p,a*p*p,'A'],[q,a*q*q,p!==q?'B':'']]});const why=p===q?'xが1つに決まるので、yも1つの値です。':zero?`0を含むので、原点のy = 0も調べます。`:'0を含まないので、両端のyを比べます。';$('#range-result').innerHTML=`${formula(a)}<br>${fmt(p)} ≤ x ≤ ${fmt(q)}<br><strong>${fmt(lo)} ≤ y ≤ ${fmt(hi)}</strong><br>両端のy：${fmt(a*p*p)} と ${fmt(a*q*q)}<br>${why}`;$('#range-plot').setAttribute('aria-label',`${formula(a)}、${fmt(p)}から${fmt(q)}の区間。yの変域は${fmt(lo)}以上${fmt(hi)}以下。`);}
function rate(changed){const a=value('rate-a');let p=value('rate-left'),q=value('rate-right');if(q-p<.5){if(changed==='rate-left')$('#rate-right').value=p+.5;else $('#rate-left').value=q-.5;p=value('rate-left');q=value('rate-right');}$('#rate-left-value').textContent=fmt(p);$('#rate-right-value').textContent=fmt(q);const yp=a*p*p,yq=a*q*q,dy=yq-yp,dx=q-p,m=dy/dx;draw($('#rate-plot'),{a,secant:[p,q],points:[[p,yp,'A'],[q,yq,'B']]});$('#rate-result').innerHTML=`${formula(a)}<br>A(${fmt(p)}, ${fmt(yp)}) → B(${fmt(q)}, ${fmt(yq)})<br>xの増加量：${fmt(dx)}<br>yの増加量：${fmt(dy)}<br><strong>${fmt(dy)} ÷ ${fmt(dx)} = ${fmt(m)}</strong><br>${m===0?'両端のyは同じ。でも、途中のyは変化しています。':m<0?'平均すると、xが1増えるあたりyが'+fmt(-m)+'減ります。':'平均すると、xが1増えるあたりyが'+fmt(m)+'増えます。'}`;$('#rate-plot').setAttribute('aria-label',`${formula(a)}、xが${fmt(p)}から${fmt(q)}。変化の割合は${fmt(m)}。`);}
for(const prefix of ['shape','range','rate'])$$(`[id^="${prefix}-"]`).filter(el=>el.matches('input,select')).forEach(el=>el.addEventListener('input',()=>({shape,range,rate}[prefix])(el.id)));
$('#shape-flip').addEventListener('click',()=>{$('#shape-a').value=-value('shape-a');shape();});
$$('[data-shape]').forEach(el=>el.addEventListener('click',()=>{$('#shape-a').value=el.dataset.shape;shape();}));
$$('[data-range]').forEach(el=>el.addEventListener('click',()=>{const [a,p,q]={cross:[1,-2,3],negative:[1,-3,-1],down:[-2,-1,3]}[el.dataset.range];$('#range-a').value=a;$('#range-left').value=p;$('#range-right').value=q;range();}));
$$('[data-rate]').forEach(el=>el.addEventListener('click',()=>{const [p,q]={first:[1,2],second:[2,3],symmetric:[-2,2]}[el.dataset.rate];$('#rate-a').value=1;$('#rate-left').value=p;$('#rate-right').value=q;rate();}));
for(const id of ['area-a','area-left','area-right'])$('#'+id).addEventListener('input',area);
$('#area-lock').addEventListener('change',area);
$('#area-fit').addEventListener('click',()=>{$('#area-lock').checked=false;area();});
$$('[data-area-step]').forEach(b=>b.addEventListener('click',()=>{areaStep=Number(b.dataset.areaStep);area();}));
$$('[data-area]').forEach(b=>b.addEventListener('click',()=>{
 const mode=b.dataset.area;
 if(mode==='original'){$('#area-a').value=1;$('#area-left').value=-1;$('#area-right').value=2;$('#area-lock').checked=false;areaStep=3;}
 if(mode==='double'&&Math.abs(value('area-a'))<=1.5)$('#area-a').value=2*value('area-a');
 if(mode==='symmetric'){$('#area-left').value=-2;$('#area-right').value=2;}
 if(mode==='flip')$('#area-a').value=-value('area-a');
 area();
}));
const STAGES=[['start','最初の6問',1,6,'5〜8分 · 現在地を確かめよう。'],['basic','代入と2乗',7,12,'解説01に対応。符号と答えの形に注意。'],['graph','グラフ',13,16,'解説02に対応。点を取り、なめらかにつなごう。'],['range-rate','割合と変域',17,24,'解説03・04に対応。両端と原点を確認。'],['apply','基本を使う',25,28,'解説05に対応。図形と文章題。'],['finish','最後の6問',29,34,'5〜8分 · 解説を閉じて、最初と同じ型に挑戦。'],['challenge','発展〈任意〉',35,38,'今日は1問だけでもOK。37は二次方程式を習った場合に。'],['retry','再挑戦〈任意〉',39,44,'最後の6問で迷った型だけ選ぼう。']];
function diagram(id,label){return `<svg id="${id}" class="plot" style="max-width:480px" viewBox="0 0 560 440" role="img" aria-label="${label}"></svg>`;}
function questionHTML(q){let extra='';if(q.id===13)extra='<table class="data-table"><caption>yの値を紙に書き、図に対応するグラフを描こう。1目盛り1。</caption><tbody><tr><th scope="row">x</th><td>−4</td><td>−2</td><td>0</td><td>2</td><td>4</td></tr><tr><th scope="row">y</th><td>？</td><td>？</td><td>？</td><td>？</td><td>？</td></tr></tbody></table>'+diagram('q13-plot','作図用の方眼。xはマイナス4から4、yはマイナス1から9。');if(q.id===14)extra=diagram('q14-plot','点P(2, マイナス2)を通る下向きの放物線。');return `<article class="q-card" id="q${q.id}"><div class="q-head"><strong>問 ${String(q.id).padStart(2,'0')}</strong><span class="q-status">${grades[state[q.id]]||'まだ記録なし'}</span></div><p class="q-prompt">${esc(q.prompt)}</p><div class="math-wrap">${q.expressionHTML}</div>${extra}<details class="hint"><summary>考え始めるヒント</summary><div>${esc(q.hint)}</div></details><details class="solution"><summary>解答と考え方を見る</summary><div><div class="math-wrap"><strong>${q.answerHTML}</strong></div><div class="math-wrap working">${q.workingHTML}</div>${q.id===13?diagram('q13-answer-plot','正解の放物線と5つの点'):''}<p>${esc(q.explanation)}</p></div></details><div class="grade" aria-label="問${q.id}の自己評価">${Object.entries(grades).map(([id,label])=>`<button type="button" data-grade="${id}" aria-pressed="${state[q.id]===id}">${label}</button>`).join('')}</div></article>`;}
function renderPractice(id){const s=STAGES.find(s=>s[0]===id)||STAGES[0];stage=s[0];$('#practice-tabs').innerHTML=STAGES.map(t=>`<button type="button" data-stage="${t[0]}" aria-pressed="${t[0]===stage}">${t[1]}</button>`).join('');$('#stage-title').textContent=s[1];$('#stage-description').textContent=s[4];$('#question-list').innerHTML=Q.filter(q=>q.id>=s[2]&&q.id<=s[3]).map(questionHTML).join('');$$('[data-stage]').forEach(el=>el.addEventListener('click',()=>{location.hash='practice/'+el.dataset.stage;}));$$('.grade button').forEach(el=>el.addEventListener('click',()=>{const card=el.closest('.q-card'),id=Number(card.id.slice(1));state[id]=el.dataset.grade;save();card.querySelector('.q-status').textContent=grades[state[id]];card.querySelectorAll('[data-grade]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));review();}));if(stage==='graph'){draw($('#q13-plot'),{blank:true,xmin:-4,xmax:4,ymin:-1,ymax:9,equal:true});draw($('#q13-answer-plot'),{a:.5,xmin:-4,xmax:4,ymin:-1,ymax:9,equal:true,points:[[-4,8,''],[-2,2,''],[0,0,''],[2,2,''],[4,8,'']]});draw($('#q14-plot'),{a:-.5,xmin:-4,xmax:4,ymin:-9,ymax:1,equal:true,points:[[2,-2,'P']]});}}
function review(){const count=Object.keys(state).length;$('#progress').value=count;$('#progress-text').textContent=`自己評価を記録 ${count} / 44問`;
const names=['代入','係数a','開く向き','変化の割合','変域','xの倍率'];$('#review-table').innerHTML=`<table class="data-table"><thead><tr><th scope="col">型</th><th scope="col">最初</th><th scope="col">最後</th><th scope="col">再挑戦</th></tr></thead><tbody>${names.map((name,i)=>`<tr><th scope="row">${name}</th><td>${grades[state[i+1]]||'未記録'}</td><td>${grades[state[i+29]]||'未記録'}</td><td><a href="#practice/retry/q${i+39}">問${i+39} →</a></td></tr>`).join('')}</tbody></table>`;const retry=Q.filter(q=>state[q.id]==='review');$('#retry-links').innerHTML=retry.length?retry.map(q=>`<a class="button" href="#practice/${STAGES.find(s=>q.id>=s[2]&&q.id<=s[3])[0]}/q${q.id}">もう一度：問${q.id}</a>`).join(''):'<p class="empty">迷った問題は「もう一度」を押すと、ここから戻れます。</p>';}
function route(){const parts=location.hash.slice(1).split('/');if(parts[0]==='practice'&&parts[1]){renderPractice(parts[1]);const target=/^q\d+$/.test(parts[2]||'')?document.getElementById(parts[2]):$('#stage-title');if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({block:'start'});}}}
$('#reset-record').addEventListener('click',()=>{if(!confirm('二次関数の自己評価を消して、最初から始めますか？'))return;state={};save();renderPractice(stage);review();$('#record-message').textContent='二次関数の自己評価をリセットしました。';});
window.addEventListener('hashchange',route);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){$$('.toc a').forEach(a=>{const on=a.hash==='#'+e.target.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-10% 0px -65% 0px'});$$('.chapter').forEach(el=>observer.observe(el));}
shape();range();rate();area();renderPractice('start');review();route();
})();
