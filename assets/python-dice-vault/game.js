// The browser reference implements the printed rules. Notebook code runs separately.
const VaultGame = (()=>{
function fresh(target=60,limit=8){return {score:0,pot:0,turn:1,target,limit,shields:0,status:'playing',message:'宝を集めよう！'};}
function step(state,action,face=null){const s={...state};if(s.status!=='playing')return s;
if(action==='roll'){
 if(!Number.isInteger(face)||face<1||face>6)throw Error('出目は1〜6の整数');
 if(face===1){if(s.shields>0){s.shields--;s.message='シールドで1を防いだ！ 宝はそのまま';}else{s.pot=0;s.turn++;s.message='1が出た！ 手持ちの宝を失った';}}
 else{s.pot+=face;s.message=`${face}個の宝を発見！`;}
}else if(action==='bank'){
 if(s.pot===0){s.message='宝を集めてから持ち帰ろう';return s;}
 s.score+=s.pot;s.pot=0;s.turn++;s.message='宝を金庫に入れた！';
}else if(action==='buy'){
 if(s.score<8||s.shields>0){s.message='購入には金庫の宝8個と、空の装備枠が必要';return s;}
 s.score-=8;s.shields=1;s.message='宝8個でシールドを買った！';
}else throw Error('行動名を確かめよう');
if(s.score>=s.target){s.status='won';s.message='目標達成！ 金庫破り成功！';}
else if(s.turn>s.limit){s.status='lost';s.message='時間切れ！ 次は作戦を変えてみよう';}
return s;
}
function choose(s,stopAt=14){return s.score+s.pot>=s.target||s.pot>=stopAt?'bank':'roll';}
return {fresh,step,choose};
})();
