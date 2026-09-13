const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),entry='study/math/quadratic-functions/index.html';
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
function make(saved,blocked=false){const d=new JSDOM(source(entry),{runScripts:'outside-only',url:'https://example.test/for_KT_family/'+entry,pretendToBeVisual:true,virtualConsole:vc});const w=d.window;w.HTMLElement.prototype.scrollIntoView=()=>{};if(saved)w.localStorage.setItem('family-quadratic-functions-v1',saved);w.localStorage.setItem('family-square-roots-v1','square-root-record');if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('denied');}});w.eval(source('assets/quadratic/questions.js'));w.eval(source('assets/quadratic/app.js'));return d;}
let d=make(),w=d.window,doc=w.document;
const $=s=>doc.querySelector(s),txt=s=>$(s).textContent;
const input=(s,v)=>{$(s).value=v;$(s).dispatchEvent(new w.Event('input',{bubbles:true}));};
function route(stage){w.location.hash='practice/'+stage;w.dispatchEvent(new w.HashChangeEvent('hashchange'));}
assert.equal(w.QUADRATIC_QUESTIONS.length,44);
const original=JSON.parse(source('materials/quadratic/questions.json'));
for(const q of w.QUADRATIC_QUESTIONS){assert.deepEqual(JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(q).filter(([k])=>!k.endsWith('HTML'))))),original[q.id-1]);assert.ok(!q.answerHTML.includes('downward'));assert.ok(!q.answerHTML.includes('>false<'));}
assert.match(txt('#shape-result'),/y = 4/);input('#shape-a','-2');input('#shape-x','-3');assert.match(txt('#shape-result'),/y = −18/);assert.match(txt('#shape-result'),/下向き/);
$('#range-plot').querySelectorAll('path').forEach(p=>assert.ok(!/NaN|Infinity/.test(p.getAttribute('d'))));
assert.match(txt('#range-result'),/0 ≤ y ≤ 9/);$('[data-range="negative"]').click();assert.match(txt('#range-result'),/1 ≤ y ≤ 9/);$('[data-range="down"]').click();assert.match(txt('#range-result'),/−18 ≤ y ≤ 0/);
input('#range-left','3');assert.equal($('#range-right').value,'3');assert.match(txt('#range-result'),/−18 ≤ y ≤ −18/);input('#range-right','-3');assert.equal($('#range-left').value,'-3');
$('[data-rate="first"]').click();assert.match(txt('#rate-result'),/3 ÷ 1 = 3/);$('[data-rate="second"]').click();assert.match(txt('#rate-result'),/5 ÷ 1 = 5/);$('[data-rate="symmetric"]').click();assert.match(txt('#rate-result'),/0 ÷ 4 = 0/);input('#rate-a','-0.5');input('#rate-left','-3');input('#rate-right','-1');assert.match(txt('#rate-result'),/4 ÷ 2 = 2/);
input('#rate-left','2.5');assert.equal($('#rate-right').value,'3');input('#rate-right','-2.5');assert.equal($('#rate-left').value,'-3');assert.ok(!/NaN|Infinity/.test(txt('#rate-result')));
// Exhaustive permitted explorer inputs: no undefined rates, correct interval extrema.
for(const a of [-2,-1,-.5,.5,1,2]){input('#range-a',a);for(let p=-3;p<=3;p+=.5)for(let q=p;q<=3;q+=.5){input('#range-left',p);input('#range-right',q);const values=[a*p*p,a*q*q,...(p<=0&&q>=0?[0]:[])];const f=n=>String(n).replace('-','−');assert.ok(txt('#range-result').includes(`${f(Math.min(...values))} ≤ y ≤ ${f(Math.max(...values))}`));}}
for(const [s,n] of Object.entries({start:6,basic:6,graph:4,'range-rate':8,apply:4,finish:6,challenge:4,retry:6})){route(s);assert.equal(doc.querySelectorAll('.q-card').length,n);if(s==='graph'){assert.ok($('#q13-plot path')===null);assert.ok($('#q13-answer-plot path'));assert.ok($('#q14-plot circle'));}}
route('start');$('#q1 [data-grade="own"]').click();assert.match(txt('#progress-text'),/1 \/ 44/);route('finish');$('#q29 [data-grade="help"]').click();assert.match(txt('#review-table'),/自力でできた/);assert.match(txt('#review-table'),/ヒントでできた/);
const saved=w.localStorage.getItem('family-quadratic-functions-v1');d.window.close();d=make(saved);w=d.window;doc=w.document;assert.match(txt('#progress-text'),/2 \/ 44/);route('start');assert.equal($('#q1 [data-grade="own"]').getAttribute('aria-pressed'),'true');w.confirm=()=>false;$('#reset-record').click();assert.match(txt('#progress-text'),/2 \/ 44/);w.confirm=()=>true;$('#reset-record').click();assert.match(txt('#progress-text'),/0 \/ 44/);assert.equal(w.localStorage.getItem('family-square-roots-v1'),'square-root-record');d.window.close();
d=make('not-json');w=d.window;doc=w.document;assert.equal($('#storage-notice').hidden,false);d.window.close();d=make(null,true);w=d.window;doc=w.document;assert.equal($('#storage-notice').hidden,false);$('#q1 [data-grade="own"]').click();assert.match(txt('#progress-text'),/1 \/ 44/);d.window.close();
// Every static local resource/navigation link resolves at its new location.
const pages=['index.html','study/index.html','study/math/index.html','study/math/square-roots/index.html',entry,'questions/index.html'];
for(const file of pages){const d=new JSDOM(source(file));for(const el of d.window.document.querySelectorAll('[href],[src]')){const url=el.getAttribute('href')||el.getAttribute('src');if(url.startsWith('#'))continue;assert.ok(!/^(https?:|\/)/.test(url),url);const target=path.resolve(root,path.dirname(file),url.split('#')[0]);assert.ok(target.startsWith(root+path.sep),url);assert.ok(fs.existsSync(target),`${file}: ${url}`);}const ids=[...d.window.document.querySelectorAll('[id]')].map(el=>el.id);assert.equal(new Set(ids).size,ids.length,file);d.window.close();}
assert.match(source('index.html'),/location\.replace\('study\/math\/square-roots\/index.html'\+location.hash\)/);
assert.deepEqual(errors,[]);console.log('PASS family: hierarchy/resources, 44 print-aligned items, diagrams, ranges/boundaries, rates, same-point interval, stage navigation, grades/reload/reset, isolated storage and denied storage.');
