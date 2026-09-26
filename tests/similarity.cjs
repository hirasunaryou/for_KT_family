const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),M=require('../assets/similarity/model.js');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),data=JSON.parse(read('materials/similarity/content.json'));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
// Independent shoelace areas and side ratios, including shrink and nonuniform stretch.
for(let k=.5;k<=3;k+=.1){
 const both=M.stretch(k,true),wide=M.stretch(k,false);near(both.sideRatio,k);near(both.area,k*k);assert(both.similar);assert.equal(wide.similar,Math.abs(k-1)<1e-10);
 near(M.area([[0,0],[3*k,0],[0,2*k]])/3,both.area);near(M.area([[0,0],[3*k,0],[0,2]])/3,wide.area);
}
for(let ti=4;ti<=16;ti++)for(let ui=4;ui<=16;ui++){
 const t=ti/20,u=ui/20,v=M.parallel(t,u);near(M.distance(v.A,v.D)/M.distance(v.A,v.B),t);near(M.distance(v.A,v.E)/M.distance(v.A,v.C),u);
 assert.equal(v.parallel,ti===ui);if(ti===ui){near(v.ratios[2],t);near(M.area([v.A,v.D,v.E])/M.area([v.A,v.B,v.C]),t*t);}
}
const source=M.match(4);for(let stage=0;stage<5;stage++){const p=M.match(stage);for(let i=0;i<3;i++)near(M.distance(p[i],p[(i+1)%3])/M.distance(source[i],source[(i+1)%3]),stage===4?1:1.5);}
assert.deepEqual(M.powers(2,'volume'),{length:2,area:4,volume:8});near(M.powers(.5,'area').area,.25);near(M.powers(3,'stretch').area,3);
// Numerical answer audit using independently stated problem quantities.
const values={4:8*3/2,6:9*4/6,7:40*3/5,13:10*3/(3+2),14:15*2/5,15:14/2,19:5*6/4,21:20*(3/2)**2,22:20*Math.sqrt(9/16),24:16*(3/2)**3,25:1.5*8/2,26:6*25000/100000,27:45*(1-(2/3)**2),29:9*10/6,30:15*4/10,31:6/Math.sqrt(4/25)};
const expected={4:12,6:6,7:24,13:6,14:6,15:7,19:7.5,21:45,22:15,24:54,25:6,26:1.5,27:25,29:15,30:6,31:15};for(const [id,v] of Object.entries(values)){near(v,expected[id]);assert(data.questions[id-1].answer.includes(String(expected[id])));}
near(M.area([[0,0],[-1,1],[2,4]]),3);near(M.area([[0,0],[-2,2],[4,8]]),12);near(M.area([[0,0],[-1,2],[2,8]]),6);
function make(saved,blocked=false){const d=new JSDOM(read('study/math/similarity/index.html'),{url:'https://example.test/for_KT_family/study/math/similarity/index.html',runScripts:'outside-only'}),w=d.window;w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('family-square-roots-v1','keep');if(saved)w.localStorage.setItem('family-similarity-v1',saved);if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('blocked');}});w.eval(read('assets/similarity/model.js'));w.eval(read('assets/similarity/app.js'));return d;}
let d=make(),w=d.window,doc=w.document;const $=s=>doc.querySelector(s),input=(s,v)=>{$(s).value=v;$(s).dispatchEvent(new w.Event('input'));};
assert.equal(doc.querySelectorAll('.q-card').length,32);assert.equal(doc.querySelectorAll('.lab.interactive').length,4);assert.equal(doc.querySelectorAll('details[open]').length,0);
for(const q of data.questions){const card=$('#q'+q.id);assert(card.textContent.includes(q.prompt));assert(card.textContent.includes(q.answer));assert(card.querySelector('.solution').textContent.includes(q.note));}
input('#shape-mode','wide');input('#shape-k','2');assert($('#shape-result').textContent.includes('相似ではない'));input('#shape-k','1');assert(!$('#shape-result').textContent.includes('相似ではない'));
$('#parallel-break').click();assert(!$('#parallel-u').disabled);assert($('#parallel-result').textContent.includes('比が違う')||$('#parallel-result').textContent.includes('違うので'));$('#parallel-mid').click();assert($('#parallel-u').disabled);input('#parallel-t','.8');assert.equal($('#parallel-u').value,'0.8');
$('#scale-reveal').click();assert($('#scale-result').textContent.includes('4倍'));input('#scale-kind','volume');assert.equal($('#scale-reveal').getAttribute('aria-pressed'),'false');$('#scale-reveal').click();assert($('#scale-result').textContent.includes('8倍'));
$('#q1 [data-grade="own"]').click();const saved=w.localStorage.getItem('family-similarity-v1');assert.equal(w.localStorage.getItem('family-square-roots-v1'),'keep');d.window.close();
d=make(saved);w=d.window;doc=w.document;assert($('#progress-text').textContent.includes('1 / 32'));w.location.hash='#q31';w.dispatchEvent(new w.HashChangeEvent('hashchange'));assert(!$('#q31').hidden);assert.equal(doc.activeElement.id,'q31');$('#q31 [data-grade="review"]').click();assert($('#review-links').textContent.includes('問31'));d.window.close();
for(const [saved,blocked] of [['bad-json',false],[null,true],['{"q999":"own","q1":"bad"}',false]]){d=make(saved,blocked);doc=d.window.document;assert.equal(doc.querySelector('#progress').value,0);if(blocked||saved==='bad-json')assert.equal(doc.querySelector('#storage-notice').hidden,false);d.window.close();}
// Navigation, fragments and CSS/JS/PDF resources work under a project-path prefix.
const file='study/math/similarity/index.html';d=new JSDOM(read(file));const ids=[...d.window.document.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length);
for(const e of d.window.document.querySelectorAll('[href],[src]')){const url=e.getAttribute('href')||e.getAttribute('src');assert(!/^(https?:|\/)/.test(url),url);const [p,hash]=url.split('#'),target=p?path.resolve(root,path.dirname(file),p):path.join(root,file);assert(fs.existsSync(target),url);if(hash&&target.endsWith('.html')){const other=new JSDOM(fs.readFileSync(target,'utf8'));assert(other.window.document.getElementById(hash),url);other.window.close();}}
d.window.close();console.log('PASS similarity: geometry, independent numeric answers, 32 source-aligned questions, four labs, storage, routing, local links and fragment targets');
