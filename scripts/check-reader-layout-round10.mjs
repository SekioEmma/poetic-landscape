// Audit Round 10 evidence captured from the running page. No browser is launched.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const base=(process.argv[2]??'docs/evidence/round10').replace(/\\/g,'/').replace(/\/$/,'')+'/';
const load=async name=>JSON.parse(await fs.readFile(base+name,'utf8'));
const {records,logs}=await load('layouts-final.json');
const bundle=(await fs.readFile('dist/index.html','utf8')).match(/<script[^>]*src="([^"]+)"/)?.[1];
assert.ok(bundle);assert.equal(records.length,40);assert.deepEqual(logs,[]);
const sizes=['1440x900','1280x720','1024x768','1000x750','768x1024','390x844','360x800','844x390'];
const budget=[];
for(const size of sizes){
 const rows=records.filter(r=>r.viewport.join('x')===size);assert.equal(rows.length,5,size);
 const by=label=>{const r=rows.find(r=>r.label===label);assert.ok(r,size+' '+label);return r;};
 const explore=by('exploring'),normal=by('reading'),collapsed=by('collapsed'),focus=by('focused'),restored=by('restored');
 assert.equal(explore.space,'exploring');assert.equal(explore.bodyVisible,false);
 assert.equal(normal.defaultSpace,size==='844x390'?'collapsed':'reading');
 assert.equal(normal.space,'reading');assert.equal(collapsed.space,'collapsed');assert.equal(focus.space,'focused');assert.equal(restored.space,'reading');
 assert.equal(collapsed.bodyVisible,false);assert.ok(collapsed.sheet.height>=104-1&&collapsed.sheet.height<=136);
 assert.ok(normal.body.height>=219,size+' original readable area');
 assert.ok(normal.fixed.height<=(normal.layout==='bottom'?108:96)+1,size+' fixed header');
 if(normal.layout==='bottom'){
  assert.ok(normal.mapRatio>=.50,size+' vertical map budget');
  assert.ok(normal.sheet.left>=11&&normal.sheet.right<=normal.viewport[0]-11,'12px phone/tablet gutter');
  assert.ok(focus.sheet.height/focus.work.height>=.9&&focus.sheet.height/focus.work.height<=.96);
 }else{
  assert.ok(normal.safe.width/normal.viewport[0]>=(size==='844x390'?.50:.55),size+' conservative viewport width budget');
  assert.ok(normal.sheet.width>=319&&normal.sheet.width<=421);
  assert.ok(focus.sheet.width>=Math.min(560,focus.viewport[0]*.6)-1&&focus.sheet.width<=Math.min(620,focus.viewport[0]*.6)+1);
 }
 assert.ok(Math.abs(restored.sheet.width-normal.sheet.width)<1&&Math.abs(restored.sheet.height-normal.sheet.height)<1);
 for(const r of rows){
  assert.equal(r.bundle,bundle,'current production bundle');assert.equal(r.overflow,false,size+' overflow');
  if(r.label==='exploring')continue;
  assert.equal(r.originalSize,'18px');assert.equal(r.fullParagraphs,4);assert.equal(r.sheetRadius,'24px');assert.equal(r.readerMotion,'idle');
  assert.ok(r.controls.every(c=>c.box.height>=43&&Number.parseFloat(c.font)>=14),'reader controls');
  for(const tool of r.tools.filter(t=>t.visible))for(const b of tool.buttons){assert.ok(b.box.height>=43&&b.box.width>=43,'map 44px input');}
 }
 for(const r of [normal,restored]){
  const {dot,map,safe}=r;assert.ok(dot);
  assert.ok(dot.left>=map.left+safe.left-1&&dot.right<=map.left+safe.left+safe.width+1&&dot.top>=map.top+safe.top-1&&dot.bottom<=map.top+safe.top+safe.height+1,size+' current anchor safe');
  assert.ok(r.entries.some(e=>e.name==='地图地点：湖心亭'),'selected place identity');
 }
 budget.push({size,layout:normal.layout,defaultSpace:normal.defaultSpace,width:normal.sheet.width,header:normal.fixed.height,body:normal.body.height,mapRatio:normal.mapRatio,viewportWidthRatio:normal.layout==='side'?normal.safe.width/normal.viewport[0]:null});
}
const p=await load('paths-final.json');for(let i=1;i<=9;i++)assert.ok(p['U0'+i]?.length,'U0'+i+' actual evidence');
const step=(list,name)=>{const r=list.find(x=>(x.step??x.stage)===name);assert.ok(r,name);return r;};
const memory=(a,b)=>{assert.equal(a.anchor,b.anchor);assert.ok(Math.abs(a.offset-b.offset)<=2,'semantic offset');};
const u1=p.U01,before=step(u1,'before-collapse'),manual=step(u1,'manual-map');
assert.equal(before.work,'song-menghaoran');assert.notEqual(manual.camera,before.camera);
for(const s of ['continued','focused','restored'])assert.equal(step(u1,s).camera,manual.camera,'manual map takes precedence');
memory(before,step(u1,'continued'));memory(before,step(u1,'restored'));
assert.equal(step(u1,'closed').space,'exploring');assert.equal(step(u1,'closed').camera,step(u1,'explore').camera);
const u2=p.U02;assert.equal(step(u2,'before').anchor,'paragraph-p2');
for(const s of ['continued','focused','restored','tab-return'])memory(step(u2,'before'),step(u2,s));
assert.ok(step(u2,'read-last-paragraph').lastParagraph.text.includes('莫说相公痴'));
for(const width of [390,768])for(const [s,state]of [['up','focused'],['down','reading'],['small-5px','reading']])assert.equal(p.U03.find(x=>x.step===s&&x.size.width===width)?.space,state);
for(const [s,state]of [['down-to-collapsed','collapsed'],['down-at-lowest','collapsed'],['up-from-collapsed','reading']]){assert.equal(step(p.U03,s).space,state);assert.equal(step(p.U03,s).panels,1);assert.equal(JSON.parse(step(p.U03,s).gesture).pointerType,'mouse');}
const bodyBefore=step(p.U03,'body-before');for(const s of ['body-selected','body-scroll'])assert.equal(step(p.U03,s).camera,bodyBefore.camera,'native text input does not move map');
assert.notEqual(step(p.U03,'body-scroll').top,bodyBefore.top);
const u4=p.U04;assert.equal(step(u4,'zero-directory').suspended,'true');assert.equal(step(u4,'zero-directory').readerVisible,'hidden');
assert.equal(step(u4,'returned').readerVisible,'visible');memory(step(u4,'before-directory'),step(u4,'returned'));
assert.equal(step(u4,'sushi').workId,'yin-hushang');assert.deepEqual(step(u4,'sushi').art,[]);
assert.equal(step(u4,'spring').workId,'qiantang-chunxing');assert.ok(step(u4,'spring').art[0].file.endsWith('qiantang-spring-r9-v1.png'));
const u5=p.U05;assert.notEqual(step(u5,'local-initial').bounds,step(u5,'zoomed').bounds);
for(const s of ['collapsed','continued','local-reentry'])assert.equal(step(u5,s).bounds,step(u5,'zoomed').bounds,'local user view restored');
for(const r of u5.filter(x=>x.instance)){assert.equal(r.instance,'1');assert.equal(r.created,'1');}
const photo=step(u5,'photo');assert.ok(photo.text.includes('Bjoertvedt')&&photo.text.includes('CC BY-SA'));assert.equal(photo.photoInfo.radius,'12px');assert.ok(photo.photoInfo.complete);assert.ok(Math.abs(photo.photoInfo.display.width/photo.photoInfo.display.height-photo.photoInfo.width/photo.photoInfo.height)<.01);
assert.equal(step(u5,'closed').space,'exploring');assert.equal(JSON.parse(step(u5,'closed').camera).scale,1);
const u6=p.U06;assert.ok(step(u6,'picker-Esc').focus.text.includes('诗篇'));
assert.equal(step(u6,'original-open').dialogs.length,2);assert.equal(step(u6,'original-Esc').dialogs.length,1);assert.ok(step(u6,'original-Esc').focus.text.includes('查看官方原图'));
assert.equal(step(u6,'source-Esc').dialogs.length,0);assert.equal(step(u6,'source-Esc').focus.text,'出处');assert.equal(step(u6,'reader-Esc').panels,0);
const u7=p.U07,trace=JSON.parse(step(u7,'reverse-end').trace),closing=trace.find(x=>x.closing),newPlace=trace.find(x=>x.selected==='dufu'),focused=trace.find(x=>x.space==='focused'),reverse=trace.find(x=>x.t>focused.t&&x.space==='reading');
const timings={exitReplacementMs:newPlace.t-closing.t,reversalMs:reverse.t-focused.t};
assert.ok(timings.exitReplacementMs>=25&&timings.exitReplacementMs<=100);assert.ok(timings.reversalMs<=100);
assert.equal(step(u7,'new-end').place,'dufu');assert.equal(step(u7,'new-end').panels,1);
assert.equal(step(u7,'reverse-second').motion,'moving');assert.equal(step(u7,'reverse-end').motion,'idle');assert.equal(step(u7,'reverse-end').space,'reading');
assert.ok(Math.abs(step(u7,'reverse-end').rect.width-step(u7,'reverse-0').rect.width)<1);
assert.deepEqual(p.U08.map(x=>x.local.layout),['side','side','bottom','bottom']);for(const r of p.U08){memory(p.U08[0],r);assert.equal(r.local.instance,'1');assert.equal(r.place,'huxin');}
for(const r of p.U09.filter(x=>x.step.startsWith('keyboard-')))assert.equal(r.focus.label,'调整阅读案高度');
assert.equal(step(p.U09,'keyboard-to-low').space,'collapsed');assert.equal(step(p.U09,'keyboard-low-Enter').space,'reading');
for(const s of ['quiet-restored','quiet-focused'])assert.equal(step(p.U09,s).readerMotion,'idle');
assert.equal(step(p.U09,'directory-last-Tab').focus.label,'收起地点目录');assert.ok(step(p.U09,'directory-first-ShiftTab').focus.text.includes('瓜洲渡'));
const motion=await load('motion-final.json');assert.equal(motion.length,2);
for(const m of motion){
 const key=m.size[0]===1000?'width':'height';assert.ok(m.zero.sheet[key]<m.middle.sheet[key]&&m.middle.sheet[key]<m.end.sheet[key]);
 assert.equal(m.middle.readerMotion,'moving');assert.equal(m.end.readerMotion,'idle');
 for(const r of [m.zero,m.middle,m.end]){assert.equal(r.bundle,bundle);assert.equal(r.originalSize,'18px');}
 const frames=JSON.parse(m.end.shellFrames);assert.ok(frames.length>3);assert.ok(frames.at(-1).t-frames[0].t>=240&&frames.at(-1).t-frames[0].t<=300);
}
const dom=await load('original-dom-final.json');assert.equal(dom.length,8);assert.equal(new Set(dom.map(x=>x.place)).size,6);
for(const w of dom){assert.equal(w.bundle,bundle);assert.ok(w.exactOriginal&&w.exactHighlight&&w.exactSource&&w.preferredMatch);assert.equal(w.canvas,0);}
const failure=await load('failures-final.json');assert.equal(failure.length,3);assert.ok(failure.every(x=>x.measure.fullParagraphs===4));
assert.ok(failure.find(x=>x.failure==='overviewFail').dom.includes('设计地图未能加载'));
assert.ok(failure.find(x=>x.failure==='mapFail').dom.includes('局部地图暂不可交互'));
assert.ok(failure.find(x=>x.failure==='artFail').dom.includes('意境图暂未加载'));
const search=await load('search-final.json');assert.ok(search.longPlace.fixed.height<=116);assert.ok(search.longPlace.body.height>=220);
for(const q of ['苏轼','茅屋','枫桥'])assert.equal(search.search.find(x=>x.query===q).directory.length,1);
for(const id of ['huxin','xihu'])assert.ok(search.search.find(x=>x.groupSelected===id).entries.some(x=>x.name===`地图地点：${id==='huxin'?'湖心亭':'西湖'}`));
const long=await load('long-title-final.json');assert.equal(long.title,'黄鹤楼送孟浩然之广陵');assert.ok(long.fixed.height<=109&&long.body.height>=220);
const dev=await load('development-final.json');assert.equal(dev.local.instance,'1');assert.equal(dev.closed.space,'exploring');assert.deepEqual(dev.logs,[]);
assert.deepEqual(await load('console-normal.json'),[]);
const screenshotManifest=await load('screenshot-manifest.json');
for(const r of records){const file=r.viewport.join('x')+'-'+r.label+'.jpg',shot=screenshotManifest.files.find(x=>x.file===file);assert.ok(shot,'actual screenshot '+file);assert.ok(Math.abs(shot.raster[0]-r.viewport[0])<=1&&Math.abs(shot.raster[1]-r.viewport[1])<=1,'viewport/raster rounding');}
const frozen=JSON.parse(await fs.readFile('docs/evidence/round5/frozen-inputs.json','utf8'));
const r5Assets=JSON.parse(await fs.readFile('docs/evidence/round5/assets.json','utf8')).files;
const r9Assets=JSON.parse(await fs.readFile('docs/evidence/round9/assets.json','utf8')).files;
const originals=JSON.parse(await fs.readFile('docs/evidence/basemaps/manifest.json','utf8')).files;
const frozenFiles=[];
for(const item of [...new Map([...frozen,...r5Assets,...r9Assets,...originals].map(x=>[x.path,x])).values()]){
 const bytes=await fs.readFile(item.path),sha256=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(sha256,item.sha256,'frozen asset '+item.path);frozenFiles.push({path:item.path,bytes:bytes.length,sha256});
}
await fs.writeFile(base+'invariants.json',JSON.stringify({at:new Date().toISOString(),files:frozenFiles,scope:'6 places / 8 works / 8 relations verified by check:data; hashes recomputed from current bytes, not copied runtime evidence'},null,2)+'\n');
const result={at:new Date().toISOString(),bundle,budget,timings,motion:'real layout dimensions; unchanged 18px text; no fps claim',status:'passed for recorded desktop/mouse/keyboard scope',unverified:['physical phone touch/pinch','UI pointercancel and rotate during active pointer capture','OS reduced-motion runtime','other browser/device/clean installation','independent G2-ui visual acceptance']};
await fs.writeFile(base+'layout-budget-check.json',JSON.stringify(result,null,2)+'\n');
console.log('PASS: new Round 10 40-state DOM matrix, 8 complete works, U01–U09 recorded portions, real shell interpolation, interrupted intent, search/source/local instance and injected failure paths. Physical touch / UI cancel / OS reduced-motion remain unverified.');
