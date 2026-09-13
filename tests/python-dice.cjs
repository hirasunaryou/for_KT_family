const {JSDOM}=require('jsdom');const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const entry='study/programming/python-dice-jupyter/index.html';
function make(hash='',saved=null,blocked=false){const d=new JSDOM(read(entry),{url:'https://example.test/for_KT_family/'+entry+hash,runScripts:'outside-only'}),w=d.window;w.scrollTo=()=>{};if(saved)w.localStorage.setItem('family-python-dice-jupyter-v1',saved);w.localStorage.setItem('family-square-roots-v1','keep');if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('denied');}});w.eval(read('assets/python-dice-jupyter/content.js')+'\n'+read('assets/python-dice-jupyter/app.js'));return d;}
let d=make(),w=d.window,doc=w.document;
assert.equal(doc.querySelectorAll('[data-mission]').length,8);assert.match(doc.querySelector('h1').textContent,/作る場所/);
assert.ok(doc.querySelector('a[download="dice_tools.py"]'));assert.ok(doc.querySelector('a[download="dice_lab.ipynb"]'));
for(let i=0;i<7;i++){doc.querySelector(`[data-mission="${i}"]`).click();assert.equal(w.location.hash,`#mission-${i+1}`);assert.ok(doc.querySelector('pre code'));assert.match(doc.body.textContent,/dice_lab.ipynb/);const input=doc.querySelector('#done');input.checked=true;input.dispatchEvent(new w.Event('change'));}
assert.equal(JSON.parse(w.localStorage.getItem('family-python-dice-jupyter-v1')).done.length,7);assert.equal(w.localStorage.getItem('family-square-roots-v1'),'keep');const saved=w.localStorage.getItem('family-python-dice-jupyter-v1');d.window.close();
d=make('#mission-7',saved);assert.equal(d.window.document.querySelector('#done').checked,true);assert.match(d.window.document.querySelector('h1').textContent,/友達/);d.window.close();
for(const [value,blocked] of [['null',false],['broken',false],[null,true]]){d=make('',value,blocked);assert.ok(d.window.document.querySelector('#main'));d.window.close();}
const pages=['index.html','study/index.html','study/programming/index.html',entry,'study/programming/python-dice/index.html'];
for(const page of pages){const d=new JSDOM(read(page));for(const el of d.window.document.querySelectorAll('[href],[src]')){const ref=el.getAttribute('href')||el.getAttribute('src');if(/^(#|data:)/.test(ref))continue;assert(!/^(https?:|\/)/.test(ref),ref);assert(fs.existsSync(path.resolve(root,path.dirname(page),ref.split('#')[0])),`${page}: ${ref}`);}d.window.close();}
const missions=vm.runInNewContext(read('assets/python-dice-jupyter/content.js')+';JUPYTER_MISSIONS');assert.equal(missions.length,7);assert(missions[6].cells.some(c=>c.code.includes('save_game(title, dice_faces')));
const nb=JSON.parse(read('materials/python-dice/dice_lab.ipynb'));assert.equal(nb.nbformat,4);assert(nb.cells.every(c=>c.cell_type!=='code'||c.execution_count===null));
assert(read('assets/python-dice/app.js').includes("fetch(assetURL('worker.js'))"));assert(read('study/programming/python-dice/dice-lab.html').includes('window.__workerSource='));
console.log('PASS Python learning: 8 sections, navigation/deep links, completion/reload/isolation, invalid/denied storage, relative links, notebook scaffold, browser worker path.');
