const PixelMonster = (()=>{
const clone=p=>JSON.parse(JSON.stringify(p));
function check(p){if(!p||p.version!==1||!Array.isArray(p.size)||p.size[0]!==16||p.size[1]!==16||p.size.length!==2)throw Error('16×16の設計図JSONを選ぼう');if(!p.palette||Array.isArray(p.palette)||typeof p.palette!=='object'||Object.keys(p.palette).length>16||!Object.keys(p.palette).length)throw Error('色は1〜16色');for(const[k,v]of Object.entries(p.palette)){if(k.length!==1||!Array.isArray(v)||v.length!==4||v.some(n=>!Number.isInteger(n)||n<0||n>255))throw Error('色は0〜255のRGBA値4つで指定しよう');}if(!p.palette['.']||p.palette['.'][3]!==0)throw Error('透明色の.はA=0にしよう');if(!Array.isArray(p.frames)||p.frames.length<1||p.frames.length>8)throw Error('絵は1〜8枚');if(!Array.isArray(p.durations)||p.durations.length!==p.frames.length||p.durations.some(t=>!Number.isInteger(t)||t<20||t>5000||t%10))throw Error('表示時間は20〜5000msの10ms単位');for(const f of p.frames)if(!Array.isArray(f)||f.length!==16||f.some(row=>typeof row!=='string'||row.length!==16||[...row].some(c=>!Object.hasOwn(p.palette,c))))throw Error('設計図は16行×16文字で、パレットの文字を使おう');return clone(p);}
function rgba(p,frame,x,y){return p.palette[p.frames[frame][y][x]];}
function paint(p,frame,x,y,symbol){const r=clone(p),row=[...r.frames[frame][y]];row[x]=symbol;r.frames[frame][y]=row.join('');return r;}
function mirror(p,frame){const r=clone(p);r.frames[frame]=r.frames[frame].map(row=>[...row].reverse().join(''));return r;}
function blink(p){if(!p.palette.B||!p.palette['#'])throw Error('標準のBと#がないので、目を手で描き変えよう');let r=clone(p);const closed=[...r.frames[0]];for(const x of[5,6,9,10]){let row=[...closed[5]];row[x]='B';closed[5]=row.join('');row=[...closed[6]];row[x]='#';closed[6]=row.join('');}if(r.frames.length===1){r.frames.push(closed);r.durations.push(140);}else r.frames[1]=closed;return r;}
function pixels(p,f){const values=[];for(let y=0;y<16;y++)for(let x=0;x<16;x++)values.push(...rgba(p,f,x,y));return values;}
return {clone,check,rgba,paint,mirror,blink,pixels};
})();
