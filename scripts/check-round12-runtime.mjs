// Audit evidence from native in-app-browser input; this does not drive a browser.
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import ts from 'typescript';import crypto from 'node:crypto';
const base='docs/evidence/round12/',rows=JSON.parse(await fs.readFile(base+'runtime-samples.json','utf8'));
const bundle=(await fs.readFile('dist/index.html','utf8')).match(/<script[^>]*src="([^"]+)"/)?.[1];
const one=n=>{const r=rows.findLast(r=>r.name===n);assert.ok(r,n);return r;};
const current=n=>{const r=one(n);assert.equal(r.bundle,bundle,n+' stale bundle');return r;};
const j=(r,k)=>JSON.parse(r.map[k]||'null'),cam=r=>j(r,'camera');
const trace=r=>j(r,'cameraTrace')||[];
function labels(r){const a=j(r,'annotations')||[],ids=new Set;for(const n of a){assert.equal(n.ids.length,n.count);assert.ok(n.leader<=48);for(const id of n.ids){assert.ok(!ids.has(id));ids.add(id);}}const displayed=a.filter(n=>n.label);for(let i=0;i<displayed.length;i++)for(let q=0;q<i;q++){const x=displayed[i].label,y=displayed[q].label;assert.ok(x.right<=y.left||y.right<=x.left||x.bottom<=y.top||y.bottom<=x.top,r.name+' label overlap');}for(const n of r.annotations)assert.ok(n.rect.width>=44&&n.rect.height>=44);return [...ids];}
const layouts=[];
for(const w of [1280,1000,390]){const a=['national','reading','collapsed','focused','search'].map(s=>current(`after-${w}-${s}`));const read=a[1],safe=j(read,'safeArea'),work=read.viewport.height-read.header.bottom-20;
 const ratio=read.app.readerLayout==='side'?safe.width/w:safe.height/work;assert.ok(ratio>=(w===390?.5:.55));assert.equal(read.font,'18px');assert.equal(read.map.selectedPlace,'huanghe');
 assert.ok(a[2].reader.height>=72&&a[2].reader.height<=96);assert.equal(a[3].app.readingSpace,'focused');assert.equal(a[4].app.directoryOpen,'true');
 for(const r of a){assert.equal(r.overflow,false);assert.equal(r.created,'1');labels(r);}layouts.push({viewport:read.viewport,type:read.app.readerLayout,reader:read.reader,mapRatio:ratio,collapsedHeight:a[2].reader.height,interfaceReadyMs:Number(a[0].app.interfaceReadyMs),mapReadyMs:Number(a[0].map.readyMs)});
}
const up=current('final-f01-up'),start=current('final-f01-start'),down=current('final-f01-down');assert.ok(cam(up).zoom>cam(start).zoom+2);assert.ok(cam(down).zoom<cam(up).zoom-2);
const merc=lat=>.5-Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))/(2*Math.PI);
function drag(name,x,y){const r=current(name),t=trace(r),end=t.findLastIndex(v=>v.event==='native-drag-end');assert.ok(end>=0);const before=t.slice(0,end).findLast(v=>v.event==='user-input'),last=t[end],world=512*2**last.zoom;
 const dx=(before.center[0]-last.center[0])*world/360,dy=(merc(before.center[1])-merc(last.center[1]))*world;assert.ok(Math.abs(dx-x)<2&&Math.abs(dy-y)<2,name+' pointer-release distance');assert.ok(t.filter(v=>v.event==='moving'&&v.t>before.t&&v.t<=last.t).length>6);return {name,requested:[x,y],release:[dx,dy],frames:t.filter(v=>v.event==='moving'&&v.t>before.t&&v.t<=last.t).length,method:'public camera trace at pointer input and native dragend; inertia excluded'};}
const drags=[drag('final-f02-horizontal',250,0),drag('final-f02-diagonal',200,150)];
const rapid=current('final-f03'),t=trace(rapid),fits=t.filter(v=>v.event==='fit-place').slice(-3),take=t.findLast(v=>v.event==='cancel-automatic-before-handler');assert.deepEqual(fits.map(v=>v.selected),['huxin','huanghe','dufu']);assert.ok(fits[2].t-fits[0].t<320);assert.ok(take.t-fits[2].t<100);assert.equal(rapid.map.selectedPlace,'dufu');assert.ok(!t.some(v=>v.t>take.t&&v.event==='safe-correction'));
const zstart=cam(current('final-f04-start')).zoom,zplus=cam(current('final-f04-plus')).zoom,zminus=cam(current('final-f04-minus')).zoom;assert.ok(Math.abs(zplus-zstart-5)<.001&&Math.abs(zminus-zstart)<.001);
assert.deepEqual(cam(current('final-f07-national')),cam(current('final-f07-return')));assert.deepEqual(cam(current('final-f07-local')),cam(current('final-f07-reenter')));for(const n of ['final-f07-national','final-f07-local','final-f07-return','final-f07-reenter'])assert.equal(current(n).created,'1');
assert.deepEqual(cam(current('final-boundary-1024')),cam(current('final-boundary-1025')));
const compile=async p=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(await fs.readFile(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
const {works,relations}=await compile('src/data/content.ts');const originals=['张岱','崔颢','李白','茅屋','苏轼','白居易','枫桥','王安石'].map(q=>current('final-original-'+q));
assert.equal(new Set(originals.map(r=>r.work)).size,8);assert.equal(new Set(originals.map(r=>r.map.selectedPlace)).size,6);
for(const r of originals){const w=works.find(w=>w.id===r.work),relation=relations.find(v=>v.workId===r.work);assert.deepEqual(r.paragraphs,w.paragraphs.map(p=>p.text));assert.equal(r.highlight,relation.highlight.text);assert.equal(r.font,'18px');}
const input=JSON.parse(await fs.readFile(base+'input-hashes.json','utf8')),frozen=input.files.filter(f=>f.path.startsWith('public/')||f.path.startsWith('src/data/')||/package(-lock)?\.json/.test(f.path));
for(const f of frozen)assert.equal(crypto.createHash('sha256').update(await fs.readFile(f.path)).digest('hex'),f.sha256,f.path+' changed');
assert.equal(one('f06-dufu-scroll').scroll.top,one('f06-dufu-restored').scroll.top);
assert.equal(one('lifecycle-ten-local-cycles').created,'1');assert.equal(one('lifecycle-unmounted').destroyed,'1');assert.equal(one('lifecycle-remounted').created,'2');assert.equal(one('lifecycle-remounted').destroyed,'1');
for(const count of [12,40]){const r=one('stress-'+count+'-overview');assert.equal(labels(r).length,count);}labels(one('stress-40-phone-expanded'));
assert.deepEqual(JSON.parse(await fs.readFile(base+'production-console.json','utf8')),[]);assert.deepEqual(JSON.parse(await fs.readFile(base+'dev-console.json','utf8')),[]);
const result={at:new Date().toISOString(),bundle,passed:true,layouts,drags,rapidMilliseconds:fits[2].t-fits[0].t,takeoverMilliseconds:take.t-fits[2].t,zoomButtons:{start:zstart,afterTenPlus:zplus,afterTenMinus:zminus},originals:originals.map(r=>r.work),frozenFiles:frozen.length,lifecycle:{cycles:10,created:1,remount:{created:2,destroyed:1}},scope:'native in-app-browser developer acceptance; current bundle for final layouts, gestures, buttons, rapid selection, camera memory, boundary and eight texts. Earlier same-round unchanged logic evidence for stress, long-reading, lifecycle, failure and keyboard retained with its actual bundle.',unverified:['physical phone touch/pinch/cancel','OS reduce dynamic switching','another environment/browser','independent acceptance','formal map publication permission and file-specific CRS']};
await fs.writeFile(base+'runtime-audit.json',JSON.stringify(result,null,2));console.log('PASS: recorded native gesture distances, 15 final states, cumulative camera, 8 exact texts, memory, frozen inputs and lifecycle evidence.');
