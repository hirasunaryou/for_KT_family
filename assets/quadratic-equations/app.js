/* Offline interactive companions to the shared print lesson. */
(() => {
'use strict';
const $=id=>document.getElementById(id), fmt=n=>String(Math.round(n*1000)/1000).replace('-', '−');
const math=s=>`<math xmlns="http://www.w3.org/1998/Math/MathML">${s}</math>`, num=n=>`<mn>${n}</mn>`;
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function fraction(n,d){if(d<0){n=-n;d=-d;}const g=gcd(n,d);n/=g;d/=g;return d===1?num(n):`<mfrac>${num(n)}${num(d)}</mfrac>`;}
function solve(a,b,c){
 const D=b*b-4*a*c;if(D<0)return {D,roots:[],html:'実数の範囲では解なし'};
 if(D===0)return {D,roots:[-b/(2*a)],html:math(`<mi>x</mi><mo>=</mo>${fraction(-b,2*a)}`)};
 const roots=[(-b-Math.sqrt(D))/(2*a),(-b+Math.sqrt(D))/(2*a)].sort((x,y)=>x-y);
 if(Number.isInteger(Math.sqrt(D)))return {D,roots,html:math(`<mi>x</mi><mo>=</mo>${fraction(-b-Math.sqrt(D),2*a)}<mo>,</mo>${fraction(-b+Math.sqrt(D),2*a)}`)};
 let k=1,r=D;for(let i=2;i*i<=r;i++)while(r%(i*i)===0){k*=i;r/=i*i;}
 let n=a>0?-b:b,d=2*Math.abs(a),g=gcd(gcd(n,k),d);n/=g;k/=g;d/=g;
 const top=`<mrow>${n?num(n):''}<mo>±</mo>${k===1?'':num(k)}<msqrt>${num(r)}</msqrt></mrow>`;
 return {D,roots,html:math(`<mi>x</mi><mo>=</mo>${d===1?top:`<mfrac>${top}${num(d)}</mfrac>`}`)};
}
function range(id,fn){$(id).addEventListener('input',()=>{const out=$(id+'-value');if(out)out.value=fmt(+$(id).value);fn();});}
function preset(attr,fn){document.querySelectorAll(`[data-${attr}]`).forEach(b=>b.addEventListener('click',()=>fn(b.dataset[attr.replace(/-([a-z])/g,(_,s)=>s.toUpperCase())])));}
function setRange(id,v){$(id).value=v;$(id).dispatchEvent(new Event('input',{bubbles:true}));}
const svgText=(x,y,s,anchor='middle',size=16)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}">${s}</text>`;
function rootSummary(k){const s=solve(1,0,-k);return `<strong>x² = ${fmt(k)}</strong><div class="root-values">${s.html}</div><p>${k>0?'異なる解は2つ。0から同じ距離だけ、右と左にあります。':k===0?'解は0の1つだけ。±0は同じ数です。':'実数の2乗は0以上。負の数にはなりません。'}</p>${k>0&&!Number.isInteger(Math.sqrt(k))?`<small>近似値：x ≈ ${s.roots.map(fmt).join('、')}</small>`:''}`;}
function roots(){const k=+$('root-k').value,unit=43,X=x=>250+unit*x;let s='<path d="M26 104H474" stroke="#61716b"/>';
 for(let x=-5;x<=5;x++)s+=`<path d="M${X(x)} 99V109" stroke="#61716b"/>`+svgText(X(x),135,fmt(x));
 if(k>=0){const r=Math.sqrt(k),rr=k===0?[0]:[-r,r];for(const x of rr){s+=`<circle cx="${X(x)}" cy="104" r="6" fill="#b6502f"/>`;if(k>0)s+=`<path d="M250 70H${X(x)}V96" stroke="#285c50" fill="none" stroke-dasharray="4 3"/>`;s+=svgText(X(x),49,fmt(x));}}
 else s+=svgText(250,49,'この数直線上には解がありません');
 $('roots-line').innerHTML=s;$('roots-result').innerHTML=rootSummary(k);
}
range('root-k',roots);preset('root-k',v=>setRange('root-k',v));roots();
function factor(){const x=+$('factor-x').value,key=$('factor-example').value;let l,r,L,R;if(key==='simple'){l=x-3;r=x+2;L='x − 3';R='x + 2';}else if(key==='zero'){l=x;r=x-4;L='x';R='x − 4';}else{l=x+1;r=x+1;L=R='x + 1';}
 $('factor-tiles').innerHTML=[[L,l],[R,r],['2つの積',l*r]].map(([label,v])=>`<div class="factor-tile ${v===0?'zero':''}">${label}<strong>${fmt(v)}</strong>${v===0?'ここが0！':''}</div>`).join('');
 $('factor-result').innerHTML=`x = ${fmt(x)} を代入<br>${fmt(l)} × ${fmt(r)} = ${fmt(l*r)}<br><strong>${l*r===0?'等式が成り立つ。これは解！':'積は0ではない。まだ解ではありません。'}</strong>`;
}
range('factor-x',factor);$('factor-example').addEventListener('change',factor);preset('factor-x',v=>setRange('factor-x',v));factor();
let filled=false;
function square(){const h=+$('square-h').value,u=30,x=4,L=55,T=38,a=x*u,b=h*u;let s=`<g stroke="#61716b"><rect x="${L}" y="${T}" width="${a}" height="${a}" fill="#eaf0df"/><rect x="${L+a}" y="${T}" width="${b}" height="${a}" fill="#d5e5f6"/><rect x="${L}" y="${T+a}" width="${a}" height="${b}" fill="#d5e5f6"/><rect x="${L+a}" y="${T+a}" width="${b}" height="${b}" fill="${filled?'#f4cbae':'none'}" stroke-dasharray="${filled?'0':'5 4'}"/></g>`;
 s+=svgText(L+a/2,T+a/2+6,'x²')+svgText(L+a+b/2,T+a/2+6,`${h}x`)+svgText(L+a/2,T+a+b/2+6,`${h}x`)+svgText(L+a+b/2,T+a+b/2+6,filled?h*h:'？')+svgText(L+a/2,T-12,'x = 4')+svgText(L+a+b/2,T-12,`h = ${h}`)+svgText(L+(a+b)/2,T+a+b+27,filled?`1辺は x + ${h}`:`足りない角は ${h} × ${h}`);
 $('square-plot').innerHTML=s;$('square-result').innerHTML=filled?`<strong>x² + ${2*h}x + ${h*h} = (x + ${h})²</strong><p>係数${2*h}の半分が${h}。その2乗の${h*h}を足すと、正方形になります。</p>`:`x² + ${2*h}x に、あと何を足せば正方形になる？<p>点線の角の面積を考えよう。</p>`;
 $('square-fill').textContent=filled?'足した角を外す':'足りない角を埋める';$('square-fill').setAttribute('aria-pressed',String(filled));
}
range('square-h',square);$('square-fill').addEventListener('click',()=>{filled=!filled;square();});square();
const steps=[['3x² − 6x = 9','まず両辺を3で割ると、x²の係数を1にできます。'],['x² − 2x = 3','両辺を3で割りました。次は−2の半分−1を2乗した1を、両辺に足します。'],['x² − 2x + 1 = 3 + 1','左辺だけに足してはいけません。両辺に同じ1を足して、等しさを保ちます。'],['(x − 1)² = 4','左辺を2乗の形にまとめました。2乗する前の数はx−1です。'],['x − 1 = ±2','平方根を考えると、2と−2の両方が必要です。'],['x = 1 ± 2<br>x = 3, −1','両辺に1を足しました。検算：x=3なら27−18=9、x=−1なら3+6=9。どちらも元の式を満たします。']];
let step=0;function renderStep(){$('step-equation').innerHTML=steps[step][0];$('step-result').textContent=steps[step][1];$('step-count').textContent=`手順 ${step+1} / ${steps.length}`;$('step-prev').disabled=step===0;$('step-next').disabled=step===steps.length-1;}
$('step-prev').addEventListener('click',()=>{if(step>0)step--;renderStep();});$('step-next').addEventListener('click',()=>{if(step<steps.length-1)step++;renderStep();});renderStep();
function formula(){const a=+$('coef-a').value,b=+$('coef-b').value,c=+$('coef-c').value,s=solve(a,b,c);
 $('formula-work').innerHTML=`<strong>(${fmt(a)})x² + (${fmt(b)})x + (${fmt(c)}) = 0</strong><p>a = ${fmt(a)}、b = ${fmt(b)}、c = ${fmt(c)}</p><p>根号の中：<br>(${fmt(b)})² − 4 × (${fmt(a)}) × (${fmt(c)})<br>= ${b*b} − (${fmt(4*a*c)}) = <b>${fmt(s.D)}</b></p><p>−b = ${fmt(-b)}、2a = ${fmt(2*a)}</p>`;
 $('formula-result').innerHTML=`<strong>${s.D>0?'異なる解は2つ':s.D===0?'異なる解は1つ':'実数の範囲では解なし'}</strong><div class="math-wrap">${s.html}</div>${s.D<0?'<p>実数の2乗は負にならないためです。</p>':s.roots.some(r=>!Number.isInteger(r))?`<small>小数で見ると：約 ${s.roots.map(fmt).join('、')}</small>`:''}`;
}
$('coef-a').addEventListener('change',formula);range('coef-b',formula);range('coef-c',formula);preset('formula',v=>{const [a,b,c]=v==='one'?[1,-2,1]:v==='none'?[1,0,1]:[2,-3,-1];$('coef-a').value=a;setRange('coef-b',b);setRange('coef-c',c);});formula();
function graph(){const k=+$('graph-k').value,unit=22.5,X=x=>220+x*unit,Y=y=>310-y*unit;let s='<defs><clipPath id="equation-clip"><rect x="40" y="40" width="360" height="360"/></clipPath></defs>';
 for(let x=-8;x<=8;x++){s+=`<line x1="${X(x)}" y1="40" x2="${X(x)}" y2="400" stroke="#d8dfd6"/>`;if(x&&x%2===0)s+=svgText(X(x),Y(0)+18,fmt(x),'middle',12);}
 for(let y=-4;y<=12;y++){s+=`<line x1="40" y1="${Y(y)}" x2="400" y2="${Y(y)}" stroke="#d8dfd6"/>`;if(y&&y%2===0)s+=svgText(X(0)-9,Y(y)+4,fmt(y),'end',12);}
 s+=`<path d="M40 ${Y(0)}H400M${X(0)} 40V400" stroke="#61716b" stroke-width="1.5"/>`;
 let pts=[];for(let i=0;i<=240;i++){const x=-Math.sqrt(12)+i*2*Math.sqrt(12)/240;pts.push(`${X(x)},${Y(x*x)}`);}
 s+=`<g clip-path="url(#equation-clip)"><polyline points="${pts.join(' ')}" fill="none" stroke="#285c50" stroke-width="2.5"/><line x1="40" y1="${Y(k)}" x2="400" y2="${Y(k)}" stroke="#b6502f" stroke-width="2" stroke-dasharray="6 4"/>`;
 if(k>=0)for(const r of k===0?[0]:[-Math.sqrt(k),Math.sqrt(k)])s+=`<path d="M${X(r)} ${Y(k)}V${Y(0)}" stroke="#3566a0" stroke-dasharray="3 3"/><circle class="intersection" data-x="${r}" data-y="${k}" cx="${X(r)}" cy="${Y(k)}" r="5" fill="#b6502f"/>`;
 s+='</g>'+svgText(402,27,'y = x²','end',14)+svgText(401,Y(k)-7,`y = ${fmt(k)}`,'end',14)+svgText(415,Y(0)+5,'x')+svgText(233,28,'y')+svgText(207,Y(0)+17,'O','middle',12);
 $('equation-plot').innerHTML=s;$('graph-result').innerHTML=rootSummary(k)+`<p>交点の個数：${k>0?2:k===0?1:0}個。解は交点の<strong>x座標</strong>です。</p>`;
}
range('graph-k',graph);preset('graph-k',v=>setRange('graph-k',v));graph();
const questions=window.EQUATION_QUESTIONS,groups=[...new Set(questions.map(q=>q.group))],key='family-quadratic-equations-v1',labels={own:'自力でできた',hint:'ヒントでできた',review:'もう一度'};
let grades={},storage=true,group=groups[0];
try{const raw=JSON.parse(localStorage.getItem(key)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [id,value] of Object.entries(raw))if(questions.some(q=>String(q.id)===id)&&Object.hasOwn(labels,value))grades[id]=value;}catch{storage=false;}
function report(){const n=Object.values(grades).filter(v=>v==='own').length;$('progress').value=n;$('progress-text').textContent=`自力でできた ${n} / 40問。ヒントでできた ${Object.values(grades).filter(v=>v==='hint').length}問。`;$('review-links').innerHTML=questions.filter(q=>['hint','review'].includes(grades[q.id])).map(q=>`<a class="button" href="#q${q.id}">問${q.id}へ戻る</a>`).join('');$('storage-notice').hidden=storage;}
function renderQuestions(){
 $('question-tabs').innerHTML=groups.map(g=>`<button type="button" data-group="${g}" aria-pressed="${g===group}">${g}</button>`).join('');const selected=questions.filter(q=>q.group===group);$('question-count').textContent=`${group}：問${selected[0].id}〜${selected.at(-1).id}（${selected.length}問）`;
 $('questions').innerHTML=selected.map(q=>`<article class="q-card" id="q${q.id}" tabindex="-1"><div class="q-head"><b>問${q.id}</b><span class="q-status">${labels[grades[q.id]]||'まだ記録していません'}</span></div><p class="q-prompt">${q.prompt}</p>${q.expressionHTML}<details><summary>ヒントを1つ見る</summary><div>${q.hint}</div></details><details class="solution"><summary>解答と解説を見る</summary><div><strong>答え</strong>${q.answerHTML}<div class="working">${q.stepsHTML}</div><p>${q.note}</p></div></details><div class="grade">${Object.entries(labels).map(([v,label])=>`<button type="button" data-q="${q.id}" data-grade="${v}" aria-pressed="${grades[q.id]===v}">${label}</button>`).join('')}</div></article>`).join('');
 $('question-tabs').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.group;renderQuestions();}));
 $('questions').querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.q,v=b.dataset.grade;if(grades[id]===v)delete grades[id];else grades[id]=v;try{localStorage.setItem(key,JSON.stringify(grades));}catch{storage=false;}const card=$('q'+id);card.querySelector('.q-status').textContent=labels[grades[id]]||'まだ記録していません';card.querySelectorAll('[data-grade]').forEach(el=>el.setAttribute('aria-pressed',String(grades[id]===el.dataset.grade)));report();}));
}
function route(){const match=location.hash.match(/^#q(\d+)$/);if(!match)return;const q=questions.find(q=>q.id===+match[1]);if(!q)return;group=q.group;renderQuestions();$('q'+q.id).focus();}
renderQuestions();report();window.addEventListener('hashchange',route);route();document.documentElement.classList.add('js-ready');
})();
