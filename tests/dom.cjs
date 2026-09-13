const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'study/math/square-roots/index.html'),'utf8');
const data=fs.readFileSync(path.join(root,'assets/questions.js'),'utf8');
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
let errors=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
function make(stored,blocked=false){const dom=new JSDOM(html,{url:'https://example.test/for_KT_family/study/math/square-roots/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=dom.window;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};if(stored)w.localStorage.setItem('family-square-roots-v1',stored);if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('denied');}});w.eval(data);w.eval(app);return dom;}
let d=make(),w=d.window,doc=w.document;
const $=s=>doc.querySelector(s),click=s=>$(s).click();
function route(hash){w.location.hash=hash;w.dispatchEvent(new w.HashChangeEvent('hashchange'));}
function input(s,value){$(s).value=value;$(s).dispatchEvent(new w.Event('input',{bubbles:true}));}
function stored(){return JSON.parse(w.localStorage.getItem('family-square-roots-v1'));}
assert.equal(w.SQ_STAGES.flatMap(s=>s.questions).length,46);
for(const s of w.SQ_STAGES){route('practice/'+s.id);assert.equal(doc.querySelectorAll('.question-card').length,s.questions.length);for(const q of s.questions){assert.ok(q.answer);if(q.choices.length){assert.equal(q.choices.length,4);assert.equal(q.choices[q.correct],q.answer);}}}
route('practice/start');assert.equal($('#q1 .check-answer').disabled,true);
click('#q1 [data-choice="0"]');click('#q1 .check-answer');assert.match($('#q1 .quiz-feedback').textContent,/復習ポイント/);
click('#q1 [data-choice="3"]');assert.match($('#q1 .quiz-feedback').textContent,/選択を変更/);click('#q1 .check-answer');assert.match($('#q1 .quiz-feedback').textContent,/正解/);assert.equal(stored().questions['1'].firstCorrect,false);assert.equal(stored().questions['1'].currentCorrect,true);
const attempts=stored().questions['1'].attempts;click('#q1 .check-answer');assert.equal(stored().questions['1'].attempts,attempts);
click('#q2 [data-choice="2"]');click('#q2 .check-answer');assert.equal(stored().questions['2'].firstCorrect,true);
click('#q2 [data-choice="0"]');route('practice/start');assert.match($('#q2 .quiz-feedback').textContent,/選択を変更/);
route('results');assert.match($('.score-number').textContent,/1 \/ 8/);
route('practice/finish');$('#q31 .hint').open=true;$('#q31 .hint').dispatchEvent(new w.Event('toggle'));click('#q31 [data-choice="1"]');click('#q31 .check-answer');assert.equal(stored().questions['31'].firstAssisted,true);
route('practice/basic');click('#q12 .solution-button');assert.equal($('#solution-12').hidden,false);click('#q12 [data-grade="own"]');assert.equal(stored().questions['12'].status,'own');click('#q12 .solution-button');assert.equal($('#solution-12').hidden,true);
route('learn');input('#area-range','36');assert.equal($('#moving-square').getAttribute('width'),'240');input('#area-range','1');assert.equal($('#moving-square').getAttribute('width'),'40');click('[data-area="5"]');assert.match($('#area-explanation').textContent,/2より大きく、3より小さい/);
input('#simplify-number','72');assert.equal($('#simplify-result').textContent,'72=36×2=62');input('#simplify-number','98');assert.equal($('#simplify-result').textContent,'98=49×2=72');for(const invalid of ['0','201','2.5','']){input('#simplify-number',invalid);assert.match($('#simplify-result').textContent,/1〜200/);}
input('#number-range','100');assert.equal($('#number-dot').getAttribute('cx'),'590');input('#number-range','23');assert.match($('#number-explanation').textContent,/整数部分は4/);
click('[data-lesson="meaning"]');assert.equal(stored().lessons.meaning,true);
const saved=w.localStorage.getItem('family-square-roots-v1');d.window.close();d=make(saved);w=d.window;doc=w.document;route('results');assert.match($('.score-number').textContent,/1 \/ 8/);route('practice/basic');assert.equal($('#q12 .question-status').textContent,'自力でできた');
route('results');w.confirm=()=>false;click('#reset-record');assert.equal(stored().questions['1'].firstCorrect,false);w.confirm=()=>true;click('#reset-record');assert.equal(Object.keys(stored().questions).length,0);
d.window.close();d=make(null,true);w=d.window;doc=w.document;assert.equal($('#storage-notice').hidden,false);route('practice/start');click('#q1 [data-choice="3"]');click('#q1 .check-answer');assert.match($('#q1 .quiz-feedback').textContent,/正解/);
// Root-relative resource paths would break GitHub Pages project sites; require local paths.
for(const el of doc.querySelectorAll('script[src],link[href],a[href$=".pdf"]')){const p=el.getAttribute('src')||el.getAttribute('href');assert.ok(!p.startsWith('/')&&!p.startsWith('http'),p);assert.ok(fs.existsSync(path.join(root,'study/math/square-roots',p)),p);}
assert.deepEqual(errors,[]);d.window.close();console.log('PASS: all 46 questions, initial vs latest score, changed choice, duplicate submission, hints, self grading, persistence, reset, lesson marks, diagram values, invalid input, blocked storage, relative assets.');
