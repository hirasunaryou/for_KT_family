(()=>{
'use strict';
const svg=document.getElementById('surface-3d-plot');if(!svg)return;
const status=document.getElementById('surface-3d-status');
const controls=[...document.querySelectorAll('#surface-3d-lab [data-path]')];
const ink='#253b39',gray='#77857e',blue='#3566a0',brown='#98502f';
const faceColors={front:'#dfeaf6',side:'#f6e4d6',top:'#e4efe1',back:'#f2f4f0'};
const V={
 A:[0,0,0],B:[3,0,0],C:[3,2,0],D:[0,2,0],
 E:[0,0,4],F:[3,0,4],G:[3,2,4],H:[0,2,4]
};
const faces=[
 {name:'front',ids:['A','B','F','E'],label:'3×4'},
 {name:'side',ids:['B','C','G','F'],label:'2×4'},
 {name:'top',ids:['E','F','G','H'],label:'3×2'},
 {name:'back',ids:['D','C','G','H'],label:''},
 {name:'back',ids:['A','D','H','E'],label:''},
 {name:'back',ids:['A','B','C','D'],label:''}
];
let yaw=-0.65,pitch=0.42,mode='inside',drag=null;
const center=[1.5,1,2];
const p1=[3,0,2.4];      // route 1 crosses BF
const p2=[3,6/7,0];      // route 2 crosses BC
const p3=[2,0,4];        // route 3 crosses EF
function rotate(v){
 let x=v[0]-center[0],y=v[1]-center[1],z=v[2]-center[2];
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const x1=cy*x-sy*y,y1=sy*x+cy*y;
 const y2=cp*y1-sp*z,z2=sp*y1+cp*z;
 return [x1,y2,z2];
}
function project(v){
 const r=rotate(v),scale=72;
 return {x:320+r[0]*scale,y:245-r[2]*scale,depth:r[1]};
}
function pathD(points){return points.map((p,i)=>{const q=project(p);return (i?'L':'M')+q.x.toFixed(2)+' '+q.y.toFixed(2)}).join(' ');}
function poly(ids){return ids.map(id=>{const q=project(V[id]);return q.x.toFixed(2)+','+q.y.toFixed(2)}).join(' ');}
function avgDepth(ids){return ids.reduce((s,id)=>s+project(V[id]).depth,0)/ids.length;}
function vertexLabel(id,dx=0,dy=0){const q=project(V[id]);return '<text x="'+(q.x+dx)+'" y="'+(q.y+dy)+'" text-anchor="middle" font-size="20" fill="'+ink+'">'+id+'</text>';}
function draw(){
 let out='<text x="320" y="28" text-anchor="middle" font-size="17" fill="'+ink+'">ドラッグ / スワイプで回転</text>';
 const sorted=[...faces].sort((a,b)=>avgDepth(a.ids)-avgDepth(b.ids));
 for(const f of sorted){
  const opacity=f.name==='back'?0.18:0.72;
  out+='<polygon points="'+poly(f.ids)+'" fill="'+faceColors[f.name]+'" fill-opacity="'+opacity+'" stroke="'+gray+'" stroke-width="1.4"/>';
  if(f.label&&avgDepth(f.ids)>-0.3){
   const qs=f.ids.map(id=>project(V[id])),x=qs.reduce((s,p)=>s+p.x,0)/4,y=qs.reduce((s,p)=>s+p.y,0)/4;
   out+='<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="16" fill="'+gray+'">'+f.label+'</text>';
  }
 }
 const allEdges=[['A','B'],['B','C'],['C','D'],['D','A'],['E','F'],['F','G'],['G','H'],['H','E'],['A','E'],['B','F'],['C','G'],['D','H']];
 for(const [u,v]of allEdges){out+='<path d="'+pathD([V[u],V[v]])+'" fill="none" stroke="'+ink+'" stroke-width="1.35" stroke-opacity=".72"/>';}
 const route={
   inside:{pts:[V.A,V.G],stroke:blue,dash:'9 6',label:'A–Gを直線で結ぶと、箱の内部を通るため今回は使えない。'},
   route1:{pts:[V.A,p1,V.G],stroke:'#9b5b33',dash:'',label:'候補①：3×4面 → 2×4面。開くと5×4の長方形になり、長さは√41 cm。'},
   route2:{pts:[V.A,p2,V.G],stroke:'#5b6f9b',dash:'',label:'候補②：3×2面 → 2×4面。開くと7×2の長方形になり、長さは√53 cm。'},
   route3:{pts:[V.A,p3,V.G],stroke:'#527a52',dash:'',label:'候補③：3×4面 → 3×2面。開くと6×3の長方形になり、長さは3√5 cm。'}
 }[mode];
 out+='<path data-active-route d="'+pathD(route.pts)+'" fill="none" stroke="'+route.stroke+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"'+(route.dash?' stroke-dasharray="'+route.dash+'"':'')+'/>';
 if(mode==='inside'){
   const m=project([1.5,1,2]);out+='<circle cx="'+m.x+'" cy="'+m.y+'" r="6" fill="'+blue+'"/><text x="'+(m.x+14)+'" y="'+(m.y-10)+'" font-size="17" fill="'+blue+'">内部</text>';
 }else{
   const hp=project(route.pts[1]);out+='<circle cx="'+hp.x+'" cy="'+hp.y+'" r="5" fill="'+route.stroke+'"/><text x="'+(hp.x+12)+'" y="'+(hp.y-10)+'" font-size="16" fill="'+route.stroke+'">面の境目</text>';
 }
 out+=vertexLabel('A',-14,20)+vertexLabel('G',15,-10);
 svg.innerHTML=out;
 svg.setAttribute('aria-label','回転できる直方体。'+route.label);
 status.textContent=route.label;
 controls.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.path===mode)));
}
function setMode(m){mode=m;draw();}
controls.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.path)));
document.querySelector('#surface-3d-lab [data-view-reset]')?.addEventListener('click',()=>{yaw=-0.65;pitch=0.42;draw();});
function pos(e){const r=svg.getBoundingClientRect();const p=e.touches?e.touches[0]:e;return [p.clientX-r.left,p.clientY-r.top];}
function start(e){drag=pos(e);svg.setPointerCapture?.(e.pointerId);e.preventDefault();}
function move(e){if(!drag)return;const p=pos(e),dx=p[0]-drag[0],dy=p[1]-drag[1];drag=p;yaw+=dx*.008;pitch=Math.max(-1.15,Math.min(1.15,pitch+dy*.008));draw();e.preventDefault();}
function end(e){drag=null;svg.releasePointerCapture?.(e.pointerId);}
svg.addEventListener('pointerdown',start);svg.addEventListener('pointermove',move);svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
svg.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch-=.10;if(e.key==='ArrowDown')pitch+=.10;pitch=Math.max(-1.15,Math.min(1.15,pitch));draw();e.preventDefault();});
draw();
})();