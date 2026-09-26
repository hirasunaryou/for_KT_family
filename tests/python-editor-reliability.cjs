const {chromium,expect}=require('playwright/test');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(error,body)=>{
    if(error){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type',({'html':'text/html; charset=utf-8','css':'text/css','js':'text/javascript'})[file.split('.').pop()]||'application/octet-stream');
    res.end(body);
  });
});
const storageKey='family-python-dice-v1';
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const browser=await chromium.launch({headless:true});
  try{
    const errors=[];
    // Both the website and the generated, downloadable lesson must behave alike.
    for(const filename of ['index.html','dice-lab.html']){
      const context=await browser.newContext({viewport:{width:1440,height:1000}});
      await context.addInitScript(()=>{
        const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
        window.storageFault='';
        Storage.prototype.getItem=function(key){
          if(window.storageFault==='denied')throw new DOMException('denied','SecurityError');
          return get.call(this,key);
        };
        Storage.prototype.setItem=function(key,value){
          if(window.storageFault)throw new DOMException('blocked',window.storageFault==='quota'?'QuotaExceededError':'SecurityError');
          return set.call(this,key,value);
        };
      });
      const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
      const url=filename==='dice-lab.html' ? 'file://'+path.join(root,'study/programming/python-dice',filename) : base+'study/programming/python-dice/'+filename;
      await page.goto(url);
      await page.evaluate(()=>localStorage.setItem('family-square-roots-v1','keep'));
      const editor=page.locator('#editor');
      async function edit(value,start,end=start,direction='forward'){
        await editor.fill(value);
        await editor.evaluate((el,selection)=>el.setSelectionRange(...selection),[start,end,direction]);
      }
      async function selection(start,end=start){
        assert.deepEqual(await editor.evaluate(el=>[el.selectionStart,el.selectionEnd]),[start,end]);
      }
      await edit('print(1)',0);await page.keyboard.press('Tab');
      await expect(editor).toHaveValue('    print(1)');await selection(4);
      await page.keyboard.press('Shift+Tab');await expect(editor).toHaveValue('print(1)');await selection(0);
      await edit('  print(1)',1);await page.keyboard.press('Shift+Tab');
      await expect(editor).toHaveValue('print(1)');await selection(0);
      await edit('    a\n    b\nc',0,12,'backward');await page.keyboard.press('Shift+Tab');
      await expect(editor).toHaveValue('a\nb\nc');await selection(0,4);
      assert.equal(await editor.evaluate(el=>el.selectionDirection),'backward');
      await page.keyboard.press('Tab');await expect(editor).toHaveValue('    a\n    b\nc');await selection(4,12);
      await edit('    a\n    b',0,8);await page.keyboard.press('Shift+Tab');
      await expect(editor).toHaveValue('a\nb');await selection(0,2);
      await edit('\nx',0,2);await page.keyboard.press('Tab');
      await expect(editor).toHaveValue('    \n    x');await selection(4,10);
      await edit('abc',1,2);await page.keyboard.press('Tab');await expect(editor).toHaveValue('    abc');await selection(5,6);

      const unchanged=await editor.inputValue();
      await page.keyboard.press('Escape');await page.keyboard.press('Tab');
      await expect(page.locator('#run')).toBeFocused();await expect(editor).toHaveValue(unchanged);
      await page.keyboard.press('Shift+Tab');await expect(editor).toBeFocused();
      await page.keyboard.press('Escape');await page.keyboard.press('Shift+Tab');
      await expect(editor).not.toBeFocused();await expect(editor).toHaveValue(unchanged);
      await editor.focus();await page.keyboard.press('Tab');await expect(editor).toBeFocused();
      // The shortcut still reaches execution; avoid any external Python download.
      await page.route('**/worker.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
      await page.evaluate(()=>{window.__workerSource='/* keyboard test */';});
      await page.keyboard.press('Control+Enter');await expect(page.locator('#stop')).toBeEnabled();await page.locator('#stop').click();

      await editor.fill('print("saved")');await page.locator('#notes').fill('保存を確かめた');
      await page.locator('#complete').check();
      await expect(page.locator('#storage-status')).toContainText('保存しました');
      await page.reload();await expect(editor).toHaveValue('print("saved")');
      await expect(page.locator('#notes')).toHaveValue('保存を確かめた');await expect(page.locator('#complete')).toBeChecked();
      assert.equal(await page.evaluate(()=>localStorage.getItem('family-square-roots-v1')),'keep');

      await page.evaluate(()=>window.storageFault='quota');
      await editor.fill('print("まだ未保存")');await page.locator('#notes').fill('手動で残すメモ');
      await expect(page.locator('#storage-status')).toContainText('保存できていません');
      await page.waitForTimeout(5500); // The previous warning disappeared after five seconds.
      await expect(page.locator('#storage-export')).toBeVisible();
      await expect(page.locator('#notes-storage')).toContainText('まだ保存できていません');
      assert.equal(JSON.parse(await page.evaluate(key=>localStorage.getItem(key),storageKey)).drafts[0],'print("saved")');
      for(const width of [1440,768,390]){
        await page.setViewportSize({width,height:1000});
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        if(filename==='index.html')await page.locator('.editor-card').screenshot({path:`test-results/reliability-01/storage-${width}.png`});
      }
      const waiting=page.waitForEvent('download');await page.locator('#storage-export').click();
      const download=await waiting;
      assert.equal(download.suggestedFilename(),'my_dice_game.py');
      const exported=fs.readFileSync(await download.path(),'utf8');
      assert(exported.includes('print("まだ未保存")'));assert(exported.includes('# 手動で残すメモ'));
      await expect(page.locator('#storage-status')).toContainText('保存できていません');
      await page.locator('[data-lesson="1"]').click();
      await expect(page.locator('#storage-status')).toContainText('保存できていません');
      await page.locator('[data-lesson="0"]').click();await expect(editor).toHaveValue('print("まだ未保存")');
      await page.evaluate(()=>window.storageFault='');await editor.fill('print("復旧")');
      await expect(page.locator('#storage-status')).toContainText('保存しました');
      await expect(page.locator('#storage-export')).toBeHidden();
      await page.reload();await expect(editor).toHaveValue('print("復旧")');
      await expect(page.locator('#notes')).toHaveValue('手動で残すメモ');
      await context.close();

      const denied=await browser.newContext();
      await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError');}}));
      const dp=await denied.newPage();dp.on('pageerror',error=>errors.push(error.message));
      await dp.goto(url);await expect(dp.locator('#storage-status')).toContainText('保存できていません');
      await dp.locator('#editor').fill('print(123)');await expect(dp.locator('#storage-export')).toBeVisible();
      await denied.close();
    }
    assert.deepEqual(errors,[]);
    console.log('PASS Python editor reliability: website/portable, indentation/selection, keyboard exit/re-entry/run, save/reload/isolation, denied storage/quota/persistent notice/export/recovery, 3 widths');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
