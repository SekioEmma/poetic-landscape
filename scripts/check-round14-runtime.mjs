// Audit captured UI observations; this does not replay browser actions.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const base='docs/evidence/round14/';
const read=async name=>JSON.parse(await fs.readFile(base+name+'.json','utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest={
 national:['accepted-national-1280','accepted-national-1000','delivery-national-390'],
 northwest:['delivery-northwest-1280','accepted-northwest-1000','delivery-northwest-390'],
 dunhuang:['delivery-dunhuang-1280','accepted-dunhuang-1000','delivery-dunhuang-390'],
 hangzhou:['delivery-hangzhou-1280','accepted-hangzhou-1000','delivery-hangzhou-390-settled'],
 selected:['delivery-selected-1280','accepted-selected-1000','delivery-escape-390'],
 fixtures:[...['12','40'].flatMap(n=>['1280','1000','390'].map(s=>`stress${n}-national-${s}`)), 'stress12-long-focus-390','corrected-stress12-edge-focus-390','stress40-same-coordinate-a','stress40-same-coordinate-b','corrected-stress40-list-reader-390'],
 stability:[...Array.from({length:3},(_,i)=>`accepted-idle-${i+1}`),...Array.from({length:5},(_,i)=>`accepted-in-${i+1}`),...Array.from({length:5},(_,i)=>`accepted-out-${i+1}`)]
};
const camera=r=>JSON.parse(r.map.camera),annotations=r=>JSON.parse(r.map.annotations||'[]');
const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
const rectArea=r=>({left:r.left,top:r.top,right:r.left+r.width,bottom:r.top+r.height});
let maxError=0,observations=0;
for(const name of [...new Set(Object.values(manifest).flat())]){
 const r=await read(name);observations++;
 assert.equal(r.map.renderState,'idle',name+' settled');
 assert.equal(r.map.cameraActive,'false',name+' no pending auto');
 assert.equal(r.map.annotationCamera,r.map.camera,name+' current annotation camera');
 const ids=annotations(r).flatMap(a=>a.ids);assert.equal(new Set(ids).size,ids.length,name+' unique membership');
 const blocked=JSON.parse(r.map.labelObstacles||'[]'),safe=rectArea(JSON.parse(r.map.safeArea));
 for(const a of annotations(r)){
  assert.equal(a.count,a.ids.length,name+' count');assert.deepEqual(a.offset,[0,0]);
  const e=r.entries.find(e=>e.annotationKey===a.key);assert.ok(e,name+' actual button');
  const error=Math.max(Math.abs((e.rect.left+e.rect.right)/2-a.anchor.x),Math.abs((e.rect.top+e.rect.bottom)/2-a.anchor.y));maxError=Math.max(maxError,error);assert.ok(error<=1,name+' icon vs projection '+error);
  assert.ok(e.rect.width>=44&&e.rect.height>=44,name+' transparent hit target');
  if(a.label){assert.ok(a.label.left>=safe.left&&a.label.right<=safe.right&&a.label.top>=safe.top&&a.label.bottom<=safe.bottom,name+' text in safe area');assert.ok(!blocked.some(b=>overlap(a.label,b)),name+' text avoids obstacles');}
 }
 const labels=annotations(r).flatMap(a=>a.label?[a.label]:[]);for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)assert.ok(!overlap(labels[i],labels[j]),name+' labels do not overlap');
 if(r.listRect){assert.ok(!r.tools.some(t=>overlap(r.listRect,t.rect)),name+' list avoids tools');if(r.reader)assert.ok(!overlap(r.listRect,r.reader),name+' list avoids reader');assert.ok(!r.entries.some(e=>overlap(r.listRect,e.rect)),name+' list avoids culture hit targets');}
}
for(const name of manifest.national){const r=await read(name);assert.equal(annotations(r).flatMap(a=>a.ids).length,9);assert.ok(Math.abs(camera(r).zoom-Number(r.map.z0))<1e-8,name+' full fit');}
for(const n of ['12','40'])for(const s of ['1280','1000','390'])assert.equal(annotations(await read(`stress${n}-national-${s}`)).flatMap(a=>a.ids).length,Number(n));
const signature=r=>annotations(r).map(a=>[a.key,a.candidate,a.nodeSerial]).sort((a,b)=>a[0].localeCompare(b[0]));
for(let i=2;i<=3;i++)assert.deepEqual(signature(await read('accepted-idle-'+i)),signature(await read('accepted-idle-1')));
for(const direction of ['in','out'])for(let i=2;i<=5;i++)assert.deepEqual(signature(await read(`accepted-${direction}-${i}`)),signature(await read(`accepted-${direction}-1`)));
for(let i=0;i<3;i++){const national=await read(manifest.national[i]),nw=await read(manifest.northwest[i]),dh=await read(manifest.dunhuang[i]);assert.ok(camera(nw).zoom-camera(national).zoom<=2.001);assert.equal(camera(dh).zoom,camera(nw).zoom);assert.ok(dh.list.includes('玉门关')&&dh.list.includes('阳关'));}
for(const name of manifest.hangzhou){const r=await read(name);assert.ok(r.list.includes('湖心亭')&&r.list.includes('西湖'));}
for(const name of ['delivery-dunhuang-390','accepted-dunhuang-1000','accepted-hangzhou-1000','delivery-hangzhou-390-settled','corrected-stress40-list-reader-390']){const r=await read(name);assert.ok(r.listButtons.every(b=>b.rect.width>=44&&b.rect.height>=44),name+' close and members 44px');}
const scroll=await read('corrected-stress40-list-scroll-390');assert.ok(scroll.listScroll.scrollTop>0&&scroll.listScroll.scrollHeight>scroll.listScroll.clientHeight);assert.ok(scroll.listButtons[0].rect.top>=scroll.listRect.top&&scroll.listButtons[0].rect.bottom<=scroll.listRect.bottom,'fixed close remains inside list');
const a=await read('stress40-same-coordinate-a'),b=await read('stress40-same-coordinate-b');assert.equal(a.map.selectedPlace,'test-00');assert.equal(b.map.selectedPlace,'test-13');assert.deepEqual(camera(a),camera(b));
const focus=await read('stress12-long-focus-390');assert.ok(focus.focus.includes('测试8'));assert.ok(annotations(focus).find(a=>a.focused)?.label);
const edgeFocus=await read('corrected-stress12-edge-focus-390');assert.ok(annotations(edgeFocus).find(a=>a.focused)?.label,'actual edge focus has visible name');
const wheels=await Promise.all([1,2,3,4].map(i=>read('accepted-native-wheel-'+i)));for(let i=1;i<4;i++)assert.ok(camera(wheels[i]).zoom>camera(wheels[i-1]).zoom+.1);
const mid=await read('accepted-native-drag-release'),idle=await read('accepted-native-drag-idle');assert.equal(mid.map.renderState,'moving');assert.ok(mid.entries.length>0);assert.equal(idle.map.renderState,'idle');assert.notDeepEqual(camera(mid).center,camera(idle).center);assert.equal(camera(mid).zoom,camera(idle).zoom);
const max=await read('delivery-manual-max'),reset=await read('delivery-reset-from-max');assert.equal(camera(max).zoom,11.5);assert.ok(Math.abs(camera(reset).zoom-Number(reset.map.z0))<1e-8);
const local=await read('accepted-local-xihu'),returned=await read('accepted-local-return'),entered=await read('accepted-reading-xihu');assert.equal(local.map.instanceId,returned.map.instanceId);assert.equal(local.map.mapView,'local');assert.deepEqual(camera(returned),camera(entered));
assert.ok((await read('corrected-mapfail-reading-390')).poem.includes('叹息未应闲'));assert.equal((await read('corrected-mapfail-reading-390')).marks.join(''),'长风几万里，吹度玉门关。');
for(const file of ['production-console','stress-console','development-console','failure-after-fix-console'])assert.deepEqual(await read(file),[],file+' normal warn/error');
const allowedChanges=new Set(['src/map/MapAdapter.ts','src/map/national-config.ts','src/national-map.css','src/exploration-interface.css','src/components/OverviewViewport.tsx']);
const input=await read('input-hashes');let frozenFiles=0;for(const f of input.files.filter(f=>!allowedChanges.has(f.path))){assert.equal(sha(await fs.readFile(f.path)),f.sha256,f.path+' frozen');frozenFiles++;}
const result={at:new Date().toISOString(),passed:true,scope:'development audit of new Round14 browser observations; not independent or physical-device acceptance',manifest,observations,maxProjectionErrorPx:maxError,frozenFiles,checks:['unique counts and complete overview 9/12/40','stable candidates and cached DOM across 3 settles and 5 cycles','zero icon displacement and DOM projection <=1px','safe text, lists and 44px controls','progressive <=2 levels and complete lists','same-coordinate separate selections','native wheels, moving drag and inertia','11.5 manual then full national reset','same-instance local return','map-failure full reading','empty normal console; input assets/content/lock frozen']};
await fs.writeFile(base+'runtime-audit.json',JSON.stringify(result,null,2)+'\n');console.log(`PASS: ${observations} captured stable observations; maximum icon projection error ${maxError.toFixed(3)}px; ${frozenFiles} frozen input files.`);
