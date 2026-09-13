'use strict';
(() => {
const STAGES = window.SQ_STAGES;
const ALL = STAGES.flatMap(s => s.questions);
const BY_ID = new Map(ALL.map(q => [q.id, q]));
const LESSONS = ['meaning','simplify','calculate','compare','application'];
const KEY = 'family-square-roots-v1';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const empty = () => ({version:1,questions:{},lessons:{}});
// Only allow known scalar fields. Imported files never become HTML or executable code.
function validate(raw) {
 if (!raw || raw.version !== 1 || typeof raw.questions !== 'object' || raw.questions === null || Array.isArray(raw.questions) || !raw.lessons || typeof raw.lessons !== 'object' || Array.isArray(raw.lessons)) throw Error('形式が違います。この学習室で書き出したJSONを選んでください。');
 const s = empty();
 for (const q of ALL) {
  const r = raw.questions[q.id]; if (!r || typeof r !== 'object') continue;
  const v = {};
  for (const key of ['hint','revealed','firstCorrect','firstAssisted','currentCorrect']) if (typeof r[key] === 'boolean') v[key] = r[key];
  for (const key of ['choice','submittedChoice']) if (Number.isInteger(r[key]) && r[key] >= 0 && r[key] < q.choices.length) v[key] = r[key];
  if (Number.isInteger(r.attempts) && r.attempts >= 0 && r.attempts <= 10000) v.attempts = r.attempts;
  if (['own','help','review'].includes(r.status)) v.status = r.status;
  s.questions[q.id] = v;
 }
 for (const l of LESSONS) if (raw.lessons[l] === true) s.lessons[l] = true;
 return s;
}
let state = empty(), persistent = true;
try { const raw = localStorage.getItem(KEY); if (raw) state = validate(JSON.parse(raw)); } catch { persistent = false; }
function save() {
 try { localStorage.setItem(KEY, JSON.stringify(state)); persistent = true; } catch { persistent = false; }
 $('#storage-notice').hidden = persistent;
 $('#saved-label').textContent = persistent ? 'このブラウザに保存' : '記録は画面を閉じるまで';
 updateHome();
}
function record(id) { return state.questions[id] || (state.questions[id] = {}); }
function statusText(r) { if (r.status==='own') return '自力でできた'; if (r.status==='help') return 'ヒントでできた'; if (r.status==='review') return 'もう一度'; return 'これから'; }
function touched(r) {return Boolean(r && (r.attempts || r.status || r.hint || r.revealed));}
function updateHome() {
 const count=Object.values(state.questions).filter(touched).length;
 $('#home-done').textContent=count;$('#home-bar').style.width=`${count/46*100}%`;
 const own=Object.values(state.questions).filter(r=>r.status==='own').length;
 const help=Object.values(state.questions).filter(r=>r.status==='help').length;
 $('#home-progress-note').textContent=count ? `自力でできた ${own}問 · ヒントでできた ${help}問。次も自分のペースで。` : '最初の1問から、ここに記録がたまります。';
}
function math(content) { return `<math xmlns="http://www.w3.org/1998/Math/MathML">${content}</math>`; }
const mn = n => `<mn>${n}</mn>`;
const root = n => `<msqrt>${mn(n)}</msqrt>`;
function simplified(n) { let a=1;for(let i=1;i*i<=n;i++) if(n%(i*i)===0)a=i;return {a,b:n/(a*a)}; }
function simpleMath(n) { const {a,b}=simplified(n);return b===1?mn(a):(a===1?'':mn(a))+root(b); }
function areaUpdate() {
 const n=Number($('#area-range').value),side=Math.sqrt(n),px=side*40;
 $('#area-value').value=n;
 for (const id of ['moving-square','square-grid']) {const el=$('#'+id);el.setAttribute('width',px);el.setAttribute('height',px);el.setAttribute('y',280-px);}
 $('#square-label').textContent=n;$('#square-label').setAttribute('x',40+px/2);$('#square-label').setAttribute('y',280-px/2+7);
 $('#side-label').textContent=Number.isInteger(side)?`1辺 ${side}`:`1辺 √${n}`;$('#side-label').setAttribute('x',40+px/2);
 $('#area-svg').setAttribute('aria-label',`面積${n}、1辺は${Number.isInteger(side)?side:'ルート'+n}の正方形`);
 $('#area-result').innerHTML=math(root(n)+'<mo>=</mo>'+simpleMath(n));
 $('#area-explanation').textContent=Number.isInteger(side)?`${side} × ${side} = ${n}。面積${n}の1辺は${side}です。`:`1辺は約${side.toFixed(3)}。${Math.floor(side)}より大きく、${Math.ceil(side)}より小さい長さです。`;
}
function simplifyUpdate() {
 const raw=$('#simplify-number').value,n=Number(raw);
 if(!raw || !Number.isInteger(n)||n<1||n>200){$('#simplify-result').textContent='1〜200の整数を入れてね。';return;}
 const {a,b}=simplified(n);
 $('#simplify-result').innerHTML=math(root(n)+'<mo>=</mo>'+ (a>1&&b>1?`<msqrt><mrow>${mn(a*a)}<mo>×</mo>${mn(b)}</mrow></msqrt><mo>=</mo>`:'')+simpleMath(n));
}
function numberUpdate() {
 const n=Number($('#number-range').value),s=Math.sqrt(n),x=30+s*56;
 $('#number-value').value=n;$('#number-dot').setAttribute('cx',x);$('#number-dot-label').setAttribute('x',x);$('#number-dot-label').textContent=`√${n}`;
 $('#number-svg').setAttribute('aria-label',`0から10までの数直線上のルート${n}。約${s.toFixed(3)}。`);
 $('#number-result').innerHTML=Number.isInteger(s)?math(root(n)+'<mo>=</mo>'+mn(s)):math(mn(Math.floor(s))+'<mo>&lt;</mo>'+root(n)+'<mo>&lt;</mo>'+mn(Math.ceil(s)));
 $('#number-explanation').textContent=Number.isInteger(s)?`${s}² = ${n}。平方数なので、ちょうど整数の位置です。`:`${Math.floor(s)**2} < ${n} < ${Math.ceil(s)**2}。整数部分は${Math.floor(s)}、小数で表すと約${s.toFixed(3)}です。`;
}
$('#number-ticks').innerHTML=Array.from({length:11},(_,n)=>`<line x1="${30+n*56}" y1="74" x2="${30+n*56}" y2="86" stroke="#5b6a5d"/><text class="svg-small" x="${30+n*56}" y="111" text-anchor="middle">${n}</text>`).join('');
$('#area-range').addEventListener('input',areaUpdate);$('#number-range').addEventListener('input',numberUpdate);$('#simplify-number').addEventListener('input',simplifyUpdate);
$$('[data-area]').forEach(el=>el.addEventListener('click',()=>{$('#area-range').value=el.dataset.area;areaUpdate();}));
areaUpdate();simplifyUpdate();numberUpdate();
function updateLessons(){ $$('[data-lesson]').forEach(b=>{const done=state.lessons[b.dataset.lesson];b.classList.toggle('is-done',Boolean(done));b.setAttribute('aria-pressed',String(Boolean(done)));b.textContent=done?'✓ 確認できた':'この考え方を確認した';}); }
$$('[data-lesson]').forEach(b=>b.addEventListener('click',()=>{state.lessons[b.dataset.lesson]=!state.lessons[b.dataset.lesson];save();updateLessons();}));
let activeStage='start';
function questionHTML(q) {
 const r=state.questions[q.id]||{},number=String(q.id).padStart(2,'0');
 const choiceUI=q.choices.length?`<div class="choices" role="group" aria-label="問${number}の選択肢">${q.choices.map((html,i)=>`<button class="choice ${r.choice===i?'selected':''}" data-choice="${i}" aria-pressed="${r.choice===i}"><span class="sr-only">選択肢${i+1} </span>${html}</button>`).join('')}</div><button class="button primary check-answer" ${r.choice===undefined?'disabled':''}>答え合わせ</button><div class="quiz-feedback ${r.currentCorrect===true?'good':'review'}" role="status">${r.attempts&&r.choice!==r.submittedChoice?'選択を変更しました。答え合わせで確認しよう。':r.currentCorrect===true?'正解！ '+(r.firstAssisted||r.attempts>1?'考え直して解けたね。':'その考え方で合っています。'):r.currentCorrect===false?'ここは復習ポイント。ヒントを見て、もう一度考えてみよう。':''}</div>`:'';
 let extra=q.id===29?'<p>つまり (√10 + 3) − √10 = 3 です。</p>':q.id===30?'<p>誤りは、足し算なのにルートの中を足しているところ。同じルートの係数を足します。</p>':'';
 return `<article class="question-card" id="q${q.id}" data-q="${q.id}" aria-label="問${number}"><div class="question-top"><span class="question-number">${number}</span><span class="question-status">${statusText(r)}</span></div><p class="question-prompt">${esc(q.prompt)}</p><div class="question-formula">${q.formula}</div>${choiceUI}<details class="hint"><summary>ヒントを1つ見る</summary><p>${esc(q.hint)}</p></details><button class="solution-button" aria-expanded="${Boolean(r.revealed)}" aria-controls="solution-${q.id}">${r.revealed?'解答を閉じる':'解答と考え方を開く'}</button><div class="solution" id="solution-${q.id}" ${r.revealed?'':'hidden'}><span class="eyebrow">ANSWER & WHY</span><div class="answer">${q.answer}</div><div class="reason">${q.reason}${extra}</div><p class="small">式を隠してもう一度。自分の手で再現できたかな？</p><div class="self-grade" aria-label="自分の理解を記録">${[['own','自力でできた'],['help','ヒントでできた'],['review','もう一度']].map(([status,label])=>`<button data-grade="${status}" class="${r.status===status?'active':''}" aria-pressed="${r.status===status}">${label}</button>`).join('')}</div></div></article>`;
}
function bindQuestion(card,q) {
 $$('[data-choice]',card).forEach(b=>b.addEventListener('click',()=>{const r=record(q.id);r.choice=Number(b.dataset.choice);save();$$('[data-choice]',card).forEach(c=>{c.classList.toggle('selected',c===b);c.setAttribute('aria-pressed',String(c===b));});$('.check-answer',card).disabled=false; if(r.attempts && r.choice!==r.submittedChoice) { $('.quiz-feedback',card).textContent='選択を変更しました。答え合わせで確認しよう。'; $('.quiz-feedback',card).className='quiz-feedback'; }}));
 $('.check-answer',card)?.addEventListener('click',()=>{
  const r=record(q.id);if(r.choice===undefined)return;
  // Re-checking an unchanged answer doesn't create another attempt.
  if(r.submittedChoice===r.choice && r.attempts)return;
  const correct=r.choice===q.correct;
  if(r.firstCorrect===undefined){r.firstCorrect=correct;r.firstAssisted=Boolean(r.hint||r.revealed);}
  r.attempts=(r.attempts||0)+1;r.submittedChoice=r.choice;r.currentCorrect=correct;
  r.status=correct?(r.attempts===1&&!r.firstAssisted?'own':'help'):'review';save();replaceQuestion(card,q,'.check-answer');updateStageProgress();
 });
 $('.hint',card).addEventListener('toggle',e=>{if(e.target.open){record(q.id).hint=true;save();}});
 $('.solution-button',card).addEventListener('click',e=>{const solution=$('.solution',card);solution.hidden=!solution.hidden;e.target.setAttribute('aria-expanded',String(!solution.hidden));e.target.textContent=solution.hidden?'解答と考え方を開く':'解答を閉じる';if(!solution.hidden){record(q.id).revealed=true;save();}});
 $$('[data-grade]',card).forEach(b=>b.addEventListener('click',()=>{record(q.id).status=b.dataset.grade;save();$$('[data-grade]',card).forEach(c=>{c.classList.toggle('active',c===b);c.setAttribute('aria-pressed',String(c===b));});$('.question-status',card).textContent=statusText(record(q.id));updateStageProgress();}));
}
function replaceQuestion(card,q,focus){card.outerHTML=questionHTML(q);const next=$(`#q${q.id}`);bindQuestion(next,q);$(focus,next)?.focus({preventScroll:true});}
function updateStageProgress(){const s=STAGES.find(s=>s.id===activeStage);const count=s.questions.filter(q=>Boolean(state.questions[q.id]?.status)).length;$('#stage-count').textContent=`記録済み ${count} / ${s.questions.length}問`;}
function renderPractice(id){
 const stage=STAGES.find(s=>s.id===id)||STAGES[0];activeStage=stage.id;
 $('#stage-tabs').innerHTML=STAGES.map(s=>`<a href="#practice/${s.id}" class="${s.id===stage.id?'active':''}" ${s.id===stage.id?'aria-current="page"':''}>${s.title}${s.optional?'<small>任意</small>':''}</a>`).join('');
 const checkpoint=stage.id==='start'||stage.id==='finish';
 const next={start:['learn','図と解説へ'],basic:['practice/algebra','式の計算へ'],algebra:['practice/apply','考える4問へ'],apply:['practice/finish','休憩したら最後の8問へ'],challenge:['practice/finish','最後の8問へ'],finish:['results','できたを振り返る'],retry:['results','学習記録を見る']}[stage.id];
 const guidance=checkpoint?'選択肢を選んで「答え合わせ」。最初の回答を比較用に記録します。ヒント・解答を見た場合は、そのことも記録します。':'紙で解いてから、解答を開こう。途中式を確認して「自力でできた・ヒントでできた・もう一度」を自分で記録します。';
 $('#practice-content').innerHTML=`<div class="stage-head"><div><h2>${stage.no}　${stage.title}</h2><p>${stage.description}${stage.optional?' · 今日は飛ばしてもOK':''}</p></div><div class="stage-meta">目安 ${stage.time}<div class="stage-progress" id="stage-count"></div></div></div><div class="practice-guidance">${guidance}</div><div class="question-list">${stage.questions.map(questionHTML).join('')}</div><div class="stage-end"><div><h3>${stage.id==='finish'?'今の自分を、確かめられたかな？':'ひと区切り。ここまでの工夫を振り返ろう。'}</h3><p>ヒントを使った問題は、式を隠してもう一度解ければOK。</p></div><a class="button primary" href="#${next[0]}">${next[1]} →</a></div>`;
 stage.questions.forEach(q=>bindQuestion($(`#q${q.id}`),q));updateStageProgress();
}
function score(stage){const rows=STAGES.find(s=>s.id===stage).questions.map(q=>state.questions[q.id]||{});return {answered:rows.filter(r=>typeof r.firstCorrect==='boolean').length,correct:rows.filter(r=>r.firstCorrect).length,help:rows.filter(r=>r.firstAssisted).length};}
function renderResults(){
 const start=score('start'),finish=score('finish');const names=['平方根の意味','√の記号','ルートの整理','かけ算','分母の有理化','足し算','大きさ','無理数'];
 const verdict=id=>{const r=state.questions[id];return !r||r.firstCorrect===undefined?'未回答':(r.firstCorrect?'○ 正解':'復習ポイント')+(r.firstAssisted?'（補助あり）':'');};
 const own=Object.values(state.questions).filter(r=>r.status==='own').length,help=Object.values(state.questions).filter(r=>r.status==='help').length;
 const review=ALL.filter(q=>state.questions[q.id]?.status==='review');
 let caption='最初と最後に8問ずつ解くと、同じ型の問題で変化を見比べられます。';
 if(start.answered===8&&finish.answered===8){const delta=finish.correct-start.correct;caption=delta>0?`最初の回答で正解した問題が${delta}問増えました。どの考え方が役に立ったかな？`:delta===0?'同じ点数でも、迷わず解けた問題や説明できることが増えていれば前進です。':'今日迷った型が見つかりました。休憩してから、再挑戦の問題で1つずつ確認しよう。';}
 $('#results-content').innerHTML=`<div class="score-grid">${[['はじめの8問',start],['最後の8問',finish]].map(([label,s])=>`<div class="score-card"><h2>${label}</h2><div class="score-number">${s.answered?s.correct:'—'} <span>/ 8</span></div><p>最初の回答で正解 · 回答済み ${s.answered}/8問<br>回答前にヒント・解答を見た問題 ${s.help}問</p></div>`).join('')}</div><p class="score-caption">${caption}</p><div class="results-table-wrap"><table class="results-table"><thead><tr><th scope="col">確認する型</th><th scope="col">はじめ</th><th scope="col">最後</th><th scope="col">再挑戦</th></tr></thead><tbody>${names.map((name,i)=>`<tr><th scope="row">${name}</th><td>${verdict(i+1)}</td><td>${verdict(i+31)}</td><td><a href="#practice/retry/q${i+39}">問${i+39} →</a></td></tr>`).join('')}</tbody></table></div><div class="stats-row"><div class="stat"><strong>${own}</strong><span>自力でできた問題</span></div><div class="stat"><strong>${help}</strong><span>ヒントでできた問題</span></div><div class="stat"><strong>${Object.values(state.lessons).filter(Boolean).length} / 5</strong><span>確認した解説</span></div></div><p class="small muted">上の表は最初の回答の記録です。解き直しても変わりません。下の「できた問題」は最新の判定・自己評価を反映します。</p><h2 style="font-size:20px">${review.length?'もう一度やってみる':'次の一歩'}</h2><div class="review-links">${review.length?review.map(q=>`<a href="#practice/${STAGES.find(s=>s.questions.includes(q)).id}/q${q.id}">問${q.id} →</a>`).join(''):'<a href="#practice/finish">最後の8問を解く →</a><a href="#practice/challenge">発展に挑戦する →</a>'}</div>`;
}
function route(){
 const parts=location.hash.slice(1).split('/'),view=['home','learn','practice','results'].includes(parts[0])?parts[0]:'home';
 $$('.view').forEach(el=>el.hidden=el.id!==`view-${view}`);
 $$('[data-nav]').forEach(el=>{const active=el.dataset.nav===view;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
 if(view==='practice')renderPractice(parts[1]);if(view==='results')renderResults();if(view==='learn')updateLessons();updateHome();
 document.title=({home:'今日の学習',learn:'図と解説',practice:'練習問題',results:'学習記録'}[view])+' | 平方根の学習室';
 const target=view==='learn'&&LESSONS.includes(parts[1])?document.getElementById(parts[1]):view==='practice'&&/^q\d+$/.test(parts[2]||'')?document.getElementById(parts[2]):null;
 if(target)requestAnimationFrame(()=>{target.scrollIntoView({block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});});else{window.scrollTo(0,0);$('#main').focus({preventScroll:true});}
}
window.addEventListener('hashchange',route);
$('#export-record').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='square-roots-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#record-message').textContent='記録を書き出しました。ダウンロードしたJSONファイルを保管してください。';});
$('#import-record').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>200000)throw Error('ファイルが大きすぎます。学習記録のJSONを選んでください。');const incoming=validate(JSON.parse(await file.text()));if(!confirm('このブラウザの学習記録を、ファイルの内容に置き換えますか？'))return;state=incoming;save();renderResults();updateLessons();$('#record-message').textContent='学習記録を読み込みました。';}catch(error){$('#record-message').textContent='読み込めませんでした。'+(error instanceof SyntaxError?'JSON形式の学習記録を選んでください。':error.message);}finally{e.target.value='';}});
$('#reset-record').addEventListener('click',()=>{if(!confirm('すべての学習記録を消して、最初から始めますか？ 必要なら先に記録を書き出してください。'))return;state=empty();save();renderResults();updateLessons();$('#record-message').textContent='記録をリセットしました。';});
save();updateLessons();route();
})();
