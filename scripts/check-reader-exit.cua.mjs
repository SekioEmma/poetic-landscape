// Run inside the supported cua_repl browser runtime, never a second automation
// connection. Pass its tab and viewport capability. See round 8 acceptance. The round 7 input is preserved; return is now collapse, not exit.
export async function checkReaderExit(tab,viewport,size){
 await viewport.set(size);
 const records=[];
 for(const exit of ['close','escape','home','collapse-close']){
  await tab.playwright.getByRole('button',{name:/寻诗文/}).click();
  await tab.playwright.locator('.directory-item[data-place-id="huanghe"]').click();
  await tab.playwright.getByRole('button',{name:'展开阅读',exact:true}).click();
  if(exit==='close')await tab.playwright.getByRole('button',{name:'关闭阅读案',exact:true}).click();
  if(exit==='collapse-close'){await tab.playwright.getByRole('button',{name:'恢复分屏',exact:true}).click();await tab.playwright.getByRole('button',{name:'收起读案',exact:true}).click();await tab.playwright.getByRole('button',{name:'关闭阅读案',exact:true}).click();}
  if(exit==='escape')await tab.playwright.getByRole('button',{name:'恢复分屏',exact:true}).press('Escape');
  if(exit==='home')await tab.playwright.getByRole('link',{name:'诗文山河首页',exact:true}).click();
  await tab.playwright.getByTestId('reading-sheet').waitFor({state:'detached'});
  const record=await tab.playwright.evaluate(()=>({time:new Date().toISOString(),viewport:[innerWidth,innerHeight],panelRemoved:!document.querySelector('.reading-sheet'),expandedCleared:!document.querySelector('main.app').classList.contains('reader-expanded'),controlsVisible:getComputedStyle(document.querySelector('.overview-controls')).visibility==='visible',entriesVisible:[...document.querySelectorAll('.overview-entry')].filter(e=>getComputedStyle(e).visibility==='visible').length,focus:document.activeElement?.getAttribute('aria-controls')||document.activeElement?.textContent,bundle:document.querySelector('script[type="module"][src]')?.getAttribute('src')}));
  if(!record.panelRemoved||!record.expandedCleared||!record.controlsVisible||record.entriesVisible<1)throw Error('Expanded exit failed: '+JSON.stringify(record));
  // Click the restored controls too; a visibility-only assertion is inadequate.
  await tab.playwright.getByRole('button',{name:'放大全国地图',exact:true}).click();
  const camera=JSON.parse(await tab.playwright.getByTestId('overview-viewport').getAttribute('data-camera'));
  if(camera.scale<=1)throw Error('Restored zoom control did not work');
  await tab.playwright.getByRole('button',{name:'看全国',exact:true}).click();
  record.exit=exit;record.zoomOperable=true;records.push(record);
 }
 return records;
}
