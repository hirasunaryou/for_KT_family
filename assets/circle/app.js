(()=>{'use strict';const M=window.CircleMath,$=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const blue='#3566a0',brown='#98502f',gray='#7a8781';
const xy=p=>[275+112*p.x,190-112*p.y],pt=d=>xy(M.point(d));
const line=(a,b,c=gray,dash='',w=1.7)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}"/>`;
const text=(p,t,c='#253b39',size=17)=>`<text x="${p[0]}" y="${p[1]}" fill="${c}" font-size="${size}">${t}</text>`;
const circle=()=>'<circle cx="275" cy="190" r="112" fill="none" stroke="#9aa69f" stroke-width="1.5"/>';
function arc(a,span,r=112,c=blue){const p=[275+r*Math.cos(a*Math.PI/180),190-r*Math.sin(a*Math.PI/180)],z=[275+r*Math.cos((a+span)*Math.PI/180),190-r*Math.sin((a+span)*Math.PI/180)];return `<path d="M ${p} A ${r} ${r} 0 ${span>180?1:0} 0 ${z}" fill="none" stroke="${c}" stroke-width="3"/>`;}
function tag(d,t){const p=M.point(d);return text([275+132*p.x-5,190-132*p.y+5],t);}
function angleMark(a,p,b,label='',c=blue,r=25){let u=Math.atan2(a[1]-p[1],a[0]-p[0]),v=Math.atan2(b[1]-p[1],b[0]-p[0]);let d=(v-u+3*Math.PI)%(2*Math.PI)-Math.PI;let z=[p[0]+r*Math.cos(v),p[1]+r*Math.sin(v)],s=[p[0]+r*Math.cos(u),p[1]+r*Math.sin(u)];return `<path d="M ${s} A ${r} ${r} 0 0 ${d>0?1:0} ${z}" stroke="${c}" stroke-width="1.5" fill="none"/>`+(label?text([p[0]+(r+24)*Math.cos(u+d/2)-8,p[1]+(r+24)*Math.sin(u+d/2)+4],label,c,16):'');}
const fmt=n=>Math.abs(n-Math.round(n))<1e-8?String(Math.round(n)):n.toFixed(1);
// Keep the centre's name beside the point, clear of the moving chords and angle arc.
function centreTag(segments,start,span){
 const curve=[];for(let i=0;i<=64;i++){const a=(start+span*i/64)*Math.PI/180;curve.push([275+35*Math.cos(a),190-35*Math.sin(a)]);}for(let i=1;i<curve.length;i++)segments.push([curve[i-1],curve[i]]);
 const hits=(a,b,x,y)=>{let lo=0,hi=1;for(let k=0;k<2;k++){const min=(k?y:x)-(k?12:10),max=(k?y:x)+(k?12:10),d=b[k]-a[k];if(Math.abs(d)<1e-9){if(a[k]<min||a[k]>max)return false;}else{const u=(min-a[k])/d,v=(max-a[k])/d;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));if(lo>hi)return false;}}return true;};
 for(const radius of [22,28,42])for(let i=0;i<24;i++){const a=(-45+i*15)*Math.PI/180,x=275+radius*Math.cos(a),y=190+radius*Math.sin(a);if(!segments.some(([p,q])=>hits(p,q,x,y)))return text([x-6,y+6],'O',brown);}
 return text([263,168],'O',brown);
}
let previous=90,current=90,moveShown=false,moveView='p';
function move(changed=false){
 const side=$('#move-side').value,v=Number($('#move-position').value);if(changed){previous=current;moveShown=false;}
 current=side==='major'?345+v*2.1:225+v*.9;const p=((current%360)+360)%360,A=pt(210),B=pt(330),P=pt(p),old=pt(previous),O=[275,190];
 const value=M.angle(M.point(210),M.point(p),M.point(330)),span=M.intercepted(210,330,p),start=span===120?210:330,atP=moveView!=='o',atO=moveView!=='p';
 let g=circle()+line(old,A,'#aab1ac','5 4')+line(old,B,'#aab1ac','5 4')+arc(start,span)+line(P,A,atP?blue:gray,'',atP?2.4:1.4)+line(P,B,atP?blue:gray,'',atP?2.4:1.4);
 if(atP)g+=`<g data-move-p>${angleMark(A,P,B,'',blue,23)}</g>`;
 if(atO)g+=line(O,A,brown,'4 3',2)+line(O,B,brown,'4 3',2)+`<g data-move-o data-span="${span}">${arc(start,span,35,brown)}</g>`+'<circle cx="275" cy="190" r="2.5" fill="#98502f"/>'+centreTag([[P,A],[P,B],[old,A],[old,B],[O,A],[O,B]],start,span);
 g+=tag(210,'A')+tag(330,'B')+tag(p,'P')+text([24,30],'同じ青い弧ABを、どこから見る？',blue,18);
 if(atP)g+=text([30,365],`Pの円周角：${moveShown?fmt(value)+'°':'？'}`,blue,18);
 if(atO)g+=text([285,365],`Oの中心角：${moveShown?span+'°':'？'}`,brown,18);
 $('#move-plot').innerHTML=g;$('#move-plot').setAttribute('aria-label',`Pを含まない弧AB。同じ弧を${moveView==='p'?'P':moveView==='o'?'O':'PとO'}から見る。${moveShown?'円周角'+fmt(value)+'度、中心角'+span+'度。':''}`);
 $('#move-value').textContent=`${v} / 100`;$('#move-reveal').setAttribute('aria-pressed',String(moveShown));
 const focus=moveView==='p'?'PからA・Bへ、青い2本をたどる。Pを含まない方の弧が青です。':moveView==='o'?'今度はOから、同じA・Bへ。茶色の角は、青い弧と同じ側を回ります。':'Pの青い角と、Oの茶色の角。どちらも同じ青い弧ABを見ています。';
 $('#move-focus').textContent=focus+(atO&&span>180?' 今は長い弧なので、中心角も180°を超える大きい方です。':'');
 $('#move-result').textContent=moveShown?(moveView==='p'?`∠APB = ${fmt(value)}°。同じ側のままPを動かして比べよう。`:moveView==='o'?`中心角は${span}°。Pが動いても、O・A・Bは動かないので変わりません。`:`円周角 ${fmt(value)}° × 2 = 中心角 ${span}°。同じ弧なら、円周角は中心角の半分です。`):'先に予想してから「角度を確かめる」。';
 document.querySelectorAll('[data-move-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.moveView===moveView)));
}
 document.querySelectorAll('[data-move-view]').forEach(b=>b.addEventListener('click',()=>{moveView=b.dataset.moveView;moveShown=false;move();}));
$('#move-position').addEventListener('input',()=>move(true));$('#move-side').addEventListener('change',()=>move(true));$('#move-reveal').addEventListener('click',()=>{moveShown=!moveShown;move();});move();
let diamShown=false;function diameter(changed=false){if(changed)diamShown=false;const x=Number($('#diameter-x').value),k=Number($('#diameter-height').value),y=Math.sqrt(1-x*x)*k,A=pt(180),B=pt(0),P=xy({x,y}),a=M.angle({x:-1,y:0},{x,y},{x:1,y:0});$('#diameter-x-value').textContent=x.toFixed(2);$('#diameter-plot').innerHTML=circle()+line(A,B,brown,'5 3')+line(P,A)+line(P,B)+tag(180,'A')+tag(0,'B')+text([P[0]-5,Math.max(24,P[1]-17)],'P')+text([278,209],'O')+angleMark(A,P,B,diamShown?fmt(a)+'°':'?')+text([24,365],'ABは直径。縦横は同じ縮尺。',blue);$('#diameter-result').textContent=diamShown?`∠APB ${Math.abs(a-90)<1e-8?'= 90°':`≈ ${fmt(a)}°`}。${k===1?'円周上なら直角。':'円周から離れると90°ではなくなります。'} `:'予想：90°より大きい？ 小さい？ 同じ？';$('#diameter-reveal').setAttribute('aria-pressed',String(diamShown));}
$('#diameter-x').addEventListener('input',()=>diameter(true));$('#diameter-height').addEventListener('change',()=>diameter(true));$('#diameter-reveal').addEventListener('click',()=>{diamShown=!diamShown;diameter();});diameter();
const dialog=document.createElement('dialog');dialog.className='figure-dialog';dialog.setAttribute('aria-label','図を大きく表示');const close=document.createElement('button');close.textContent='閉じる';close.className='button';const large=document.createElement('div');large.className='large-figure';dialog.append(close,large);document.body.append(dialog);close.addEventListener('click',()=>dialog.close());document.querySelectorAll('.concept-card figure,.q-card figure,.circle-lab-figure').forEach(f=>{const svg=f.querySelector('svg');if(!svg)return;const button=document.createElement('button');button.className='figure-open interactive';button.textContent='図を大きく見る';button.addEventListener('click',()=>{const copy=svg.cloneNode(true);copy.removeAttribute('id');large.replaceChildren(copy);dialog.showModal();});f.append(button);});
const key='family-circle-v1' ,allowed=['own','hint','review'];let records={};try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved)){for(const [id,v]of Object.entries(saved))if(/^([1-9]|1[0-9]|2[0-4])$/.test(id)&&allowed.includes(v))records[id]=v;}}catch{$('#storage-notice').hidden=false;}
function render(){let own=0;$('#review-links').replaceChildren();for(const card of document.querySelectorAll('.q-card')){const id=card.id.slice(1),v=records[id];card.querySelector('.q-status').textContent=({own:'自力でできた',hint:'ヒントでできた',review:'もう一度'})[v]||'未記録';card.querySelectorAll('[data-grade]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.grade===v)));if(v==='own')own++;if(v==='hint'||v==='review'){const a=document.createElement('a');a.href='#q'+id;a.textContent='問'+id;$('#review-links').append(a);}}$('#progress-text').textContent=`自力でできた ${own} / 24問。図を使って理由も説明できた？`;}
document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>{records[b.closest('.q-card').id.slice(1)]=b.dataset.grade;try{localStorage.setItem(key,JSON.stringify(records));}catch{$('#storage-notice').hidden=false;}render();}));render();
function focus(){if(/^#q([1-9]|1[0-9]|2[0-4])$/.test(location.hash))$(location.hash)?.focus();}window.addEventListener('hashchange',focus);document.documentElement.classList.add('js-ready');focus();
})();
