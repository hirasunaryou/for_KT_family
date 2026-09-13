const MazeRobot = (() => {
const SAMPLE=['#############','#.....#.....#','#.###.#.###.#','#...#...#...#','###.#####.#.#','#...#.....#.#','#.###.#####.#','#.....#.....#','#.#####.###.#','#...........#','#############'];
const key=p=>p.join(','),same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
function walkable(grid,p){return p[1]>=0&&p[1]<grid.length&&p[0]>=0&&p[0]<grid[0].length&&grid[p[1]][p[0]]==='.';}
function neighbors(grid,p){return [[1,0],[0,1],[-1,0],[0,-1]].map(d=>[p[0]+d[0],p[1]+d[1]]).filter(n=>walkable(grid,n));}
function search(grid,start,goal){if(!walkable(grid,start)||!walkable(grid,goal))return {path:[],order:[]};const queue=[start],parents=new Map([[key(start),null]]),order=[];let head=0;
while(head<queue.length){let p=queue[head++];order.push(p);if(same(p,goal)){const path=[];while(p!==null){path.push(p);p=parents.get(key(p));}return {path:path.reverse(),order};}for(const n of neighbors(grid,p)){if(!parents.has(key(n))){parents.set(key(n),p);queue.push(n);}}}return {path:[],order};}
function fresh(grid=SAMPLE,start=[1,1],goal=[grid[0].length-2,1],robot=[1,grid.length-2],every=2){return {grid:[...grid],player:[...start],goal:[...goal],robot:[...robot],steps:0,robot_every:every,status:'playing',message:'ゴールへ向かおう！'};}
function turn(state,action){const s={...state};if(s.status!=='playing')return s;let p=s.player;if(action!=='wait'){const d={right:[1,0],down:[0,1],left:[-1,0],up:[0,-1]}[action];if(!d)throw Error('方向名を確認しよう');p=[p[0]+d[0],p[1]+d[1]];if(!walkable(s.grid,p)){s.message='壁には進めない。手数は増えないよ';return s;}}s.player=p;s.steps++;
if(same(p,s.robot)){s.status='lost';s.message='ロボットにぶつかった！';return s;}if(same(p,s.goal)){s.status='won';s.message='脱出成功！';return s;}
if(s.steps%s.robot_every===0){const {path}=search(s.grid,s.robot,p);if(path.length>=2)s.robot=path[1];}if(same(s.robot,p)){s.status='lost';s.message='つかまった！ 次はルートを変えよう';}else s.message='次はどう動く？';return s;}
function generate(seed,width=13,height=11){let s=seed>>>0;const random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};for(let attempt=0;attempt<200;attempt++){const g=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>x===0||y===0||x===width-1||y===height-1?'#':random()<.3?'#':'.'));const start=[1,1],goal=[width-2,1],robot=[1,height-2];for(const [x,y]of[start,goal,robot])g[y][x]='.';const grid=g.map(r=>r.join(''));if(search(grid,start,goal).path.length&&search(grid,robot,start).path.length)return grid;}throw Error('つながる地図ができなかった。もう一度試そう');}
return {SAMPLE,same,key,walkable,neighbors,search,fresh,turn,generate};
})();
