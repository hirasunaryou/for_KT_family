/* Pure geometry. No display rounding is used to decide mathematical conditions. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SimilarityMath=api;})(typeof globalThis==='object'?globalThis:this,()=>{
 'use strict';
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0))/2;
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
 function stretch(k,both){const sx=k,sy=both?k:1;return {sx,sy,sideRatio:Math.hypot(3*sx,2*sy)/Math.sqrt(13),angle:Math.atan2(2*sy,3*sx)*180/Math.PI,similar:Math.abs(sx-sy)<1e-10,area:sx*sy};}
 function parallel(t,u){const A=[0,0],B=[-3,6],C=[4,6],D=mix(A,B,t),E=mix(A,C,u);return {A,B,C,D,E,ratios:[t,u,distance(D,E)/distance(B,C)],parallel:Math.abs(t-u)<1e-10};}
 function powers(k,kind){return {length:k,area:kind==='stretch'?k:k*k,volume:k*k*k};}
 function match(stage){const source=[[-4/3,-1],[8/3,-1],[-4/3,2]],angle=stage<2?110*Math.PI/180:0,flip=stage<3?-1:1,k=stage<4?1.5:1,center=stage===0?[245,185]:stage<4?[365,185]:[145,185];return source.map(([x,y])=>{x*=flip;return [center[0]+35*k*(x*Math.cos(angle)-y*Math.sin(angle)),center[1]-35*k*(x*Math.sin(angle)+y*Math.cos(angle))];});}
 return {distance,area,mix,stretch,parallel,powers,match};
});
