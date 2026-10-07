// Validate recorded production DOM measurements, not simulated component state.
// Capture through cua_repl first; this command never launches another browser.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const evidence=process.argv[2]??'docs/evidence/round8';
const base=evidence.replace(/\\/g,'/').replace(/\/$/,'')+'/';
if(evidence.includes('round10')){await import('./check-reader-layout-round10.mjs');process.exit(0);}
const focusScales=evidence.includes('round9')?JSON.parse(await fs.readFile(base+'invariants.json','utf8')).focusScales:{side:1.85,bottom:2.1};
const load=async name=>JSON.parse(await fs.readFile(base+name,'utf8'));
const {records,logs}=await load('layouts-final.json');
const bundle=(await fs.readFile('dist/index.html','utf8')).match(/<script[^>]*src="([^"]+)"/)?.[1];assert.ok(bundle);
assert.equal(records.length,40);
assert.deepEqual(logs,[]);
const cases=[['1440x900','side',400,420],['1280x720','side',380,400],['1024x768','side',340,360],['1000x750','side',340,360],['768x1024','bottom',600,640],['390x844','bottom',389,391],['360x800','bottom',359,361],['844x390','side',319,321]];
const budget=[];
for(const [key,type,min,max] of cases){
 const list=records.filter(r=>r.viewport.join('x')===key);
 assert.equal(list.length,5,key);
 const by=label=>list.find(r=>r.label===label);
 const first=by('default'),normal=by('matched-reading'),collapsed=by('collapsed'),focus=by('focused'),restored=by('restored');
 assert.equal(first.layout,type,key);
 assert.ok(normal.sheet.width>=min-1&&normal.sheet.width<=max+1,key+' normal width');
 assert.ok(first.mapRatio>=(type==='bottom'||key==='844x390'?.5:.55),key+' map budget');
 if(type==='side')assert.ok(first.safe.width/first.viewport[0]>=(key==='844x390'?.5:.55),key+' conservative viewport width budget');
 assert.equal(first.space,key==='844x390'?'collapsed':'reading');
 if(first.space==='reading')assert.ok(first.body.height>=220-1,key+' original area');
 assert.equal(collapsed.space,'collapsed');
 assert.ok(collapsed.sheet.height>=88&&collapsed.sheet.height<=136);
 assert.equal(collapsed.bodyVisible,false);
 assert.equal(focus.space,'focused');
 if(type==='side'){assert.ok(focus.sheet.width>=Math.min(560,focus.viewport[0]*.6)-1&&focus.sheet.width<=640+1);assert.ok(focus.sheet.width<=focus.viewport[0]*.6+1);}
 else assert.ok(focus.sheet.height/focus.work.height>=.9&&focus.sheet.height/focus.work.height<=.96);
 assert.equal(restored.space,'reading');
 assert.ok(Math.abs(restored.sheet.width-normal.sheet.width)<1&&Math.abs(restored.sheet.height-normal.sheet.height)<1);
 for(const r of list){
  assert.equal(r.overflow,false,key+' horizontal overflow');
  assert.equal(r.originalSize,'18px');
  assert.equal(r.fullParagraphs,4);
  assert.equal(r.bundle,bundle,'final production bundle');
  assert.equal(JSON.parse(r.camera).scale,r.label==='default'?focusScales[type]:1,'camera scale is preserved after explicit overview');
  assert.ok(r.controls.every(c=>c.box.height>=43&&Number.parseFloat(c.font)>=14));
 }
 for(const r of [first,focus,restored]){
  if(r.layout==='bottom'&&r.space==='focused'){assert.equal(r.entries.length,0);continue;}
  const {dot,map,safe}=r;
  assert.ok(dot.left>=map.left+safe.left-1&&dot.right<=map.left+safe.left+safe.width+1&&dot.top>=map.top+safe.top-1&&dot.bottom<=map.top+safe.top+safe.height+1,key+' selected anchor safe');
 }
 budget.push({size:key,layout:type,defaultSpace:first.space,mapRatio:first.mapRatio,normalWidth:normal.sheet.width,normalBody:normal.body.height,collapsedHeight:collapsed.sheet.height});
}
const exits=await load('R01-final.json');assert.equal(exits.records.length,8);assert.deepEqual(exits.logs,[]);
assert.ok(exits.records.every(r=>r.panelRemoved&&r.expandedCleared&&r.controlsVisible&&r.zoomOperable));
const originals=await load('original-dom-final.json');assert.equal(originals.length,8);
assert.ok(originals.every(r=>r.originalExact&&r.highlightExact&&r.sourceExact&&!r.overflow&&r.mapNodes===0));
const rapid=await load('rapid-final.json');assert.equal(rapid.length,2);
for(const r of rapid){const closing=r.trace.findLast(t=>t.closing);const selection=r.trace.findLast(t=>t.selected);assert.ok(closing&&selection);assert.ok(selection.t-closing.t<220);assert.equal(r.panels,1);assert.equal(r.space,'reading');assert.equal(r.place,selection.selected);}
const picker=await load('picker-memory-final.json');
for(const r of picker){assert.equal(r.before.anchor,r.returned.anchor);assert.ok(Math.abs(r.before.offset-r.returned.offset)<1);assert.equal(r.before.camera,r.newWork.camera);assert.equal(r.before.camera,r.returned.camera);assert.equal(r.newWork.top,0);}
const local=await load('local-reentry-final.json');assert.deepEqual(local.logs,[]);assert.equal(local.root.scrollTop,0);assert.equal(local.root.height,local.root.scrollHeight);
assert.ok(local.records.every(r=>r.bounds===local.records[0].bounds&&r.created==='1'&&r.instance==='1'));
assert.ok(local.photo.includes('Bjoertvedt')&&local.photo.includes('CC BY-SA'));
const side=await load('local-side-focused-final.json');assert.ok(side.marker.right<=side.sheet.left-8,'whole local place title clear');
const memory=await load('reading-memory-final.json');
for(const r of memory.filter(r=>r.state!=='collapsed')){assert.equal(r.anchor,memory[0].anchor);assert.ok(Math.abs(r.offset-memory[0].offset)<1);}
assert.equal(memory[1].hidden,'');assert.equal(memory[1].inert,'');
const resize=await load('resize-memory-final.json');assert.deepEqual(resize.slice(0,2).map(r=>r.layout),['side','side']);
assert.ok(resize.every(r=>r.anchor===resize[0].anchor&&Math.abs(r.offset-resize[0].offset)<1&&JSON.parse(r.camera).scale===JSON.parse(resize[0].camera).scale));
const anchors=await load('anchor-view-final.json');assert.equal(anchors.before,anchors.after);assert.ok(anchors.frames.length>1&&anchors.maxError<.25);assert.deepEqual(anchors.logs,[]);
await fs.writeFile(base+'layout-budget-check.json',JSON.stringify({checkedAt:new Date().toISOString(),passed:true,budget,checks:['40 current-bundle DOM states','default map budget','whole selected anchor','44px controls / 18px original','8 R01 exits and real zoom','8 exact originals and lazy WebGL','2 rapid new selections before exit timer','per-work semantic memory','local single instance and camera / credit','1024 to 1025 and orientation anchor memory']},null,2)+'\n');
console.log('PASS: recorded current recorded layout budgets, reading and camera regressions.');
