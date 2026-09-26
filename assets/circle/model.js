(function(root){
'use strict';
const point=d=>({x:Math.cos(d*Math.PI/180),y:Math.sin(d*Math.PI/180)});
function angle(a,p,b){const u={x:a.x-p.x,y:a.y-p.y},v={x:b.x-p.x,y:b.y-p.y};if(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y)<1e-10)return null;return Math.atan2(Math.abs(u.x*v.y-u.y*v.x),u.x*v.x+u.y*v.y)*180/Math.PI;}
function intercepted(a,b,p){let span=((b-a)%360+360)%360,pos=((p-a)%360+360)%360;if(pos<1e-9||Math.abs(pos-span)<1e-9)return null;return pos<span?360-span:span;}
const model={point,angle,intercepted};if(typeof module!=='undefined'&&module.exports)module.exports=model;root.CircleMath=model;
})(typeof window!=='undefined'?window:globalThis);
