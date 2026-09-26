(function(root){
 'use strict';
 const point=(x,y)=>({x,y});
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const finitePositive=x=>Number.isFinite(x)&&x>0;
 function triangle(a,b,degrees=90){
  if(!finitePositive(a)||!finitePositive(b)||!Number.isFinite(degrees)||degrees<=0||degrees>=180)return null;
  const t=degrees*Math.PI/180,C=point(0,0),A=point(b*Math.cos(t),b*Math.sin(t)),B=point(a,0);
  return {A,B,C,a,b,c:distance(A,B),angle:degrees};
 }
 function layout(a,b,progress=0){
  if(!finitePositive(a)||!finitePositive(b)||!Number.isFinite(progress))return null;
  const l=a+b,t=Math.max(0,Math.min(1,progress));
  const start=[[0,0],[l,0],[l,l],[0,l]],end=[[0,a],[l,0],[a,l],[a,a]];
  return start.map((p,i)=>{const x=p[0]+(end[i][0]-p[0])*t,y=p[1]+(end[i][1]-p[1])*t,r=i*Math.PI/2;return [point(x,y),point(x+a*Math.cos(r),y+a*Math.sin(r)),point(x-b*Math.sin(r),y+b*Math.cos(r))];});
 }
 function chord(r,h){if(!finitePositive(r)||!Number.isFinite(h)||h<0||h>r)return null;const half=Math.sqrt(Math.max(0,r*r-h*h));return {half,length:2*half,square:4*(r*r-h*h)};}
 function box(a,b,h){if(![a,b,h].every(finitePositive))return null;return {base:Math.hypot(a,b),diagonal:Math.hypot(a,b,h),square:a*a+b*b+h*h};}
 const coord=x=>({x,y:x*x/2,square:x*x+x*x*x*x/4});
 function radical(n){if(!Number.isFinite(n)||n<0)return null;if(n===0)return '0';if(Math.abs(Math.round(n)-n)>1e-8)return '√'+Number(n.toFixed(4));n=Math.round(n);let f=1;for(let i=2;i*i<=n;i++)if(n%(i*i)===0)f=i;const rest=n/(f*f);return rest===1?String(f):(f===1?'':String(f))+'√'+rest;}
 const model={point,distance,triangle,layout,chord,box,coord,radical};if(typeof module!=='undefined'&&module.exports)module.exports=model;root.PythagoreanMath=model;
})(typeof window!=='undefined'?window:globalThis);
