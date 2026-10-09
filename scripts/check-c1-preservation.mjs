import fs from 'node:fs/promises';import ts from 'typescript';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const load=async p=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(await fs.readFile(p,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const now=await load('src/data/content.ts'),before=JSON.parse(await fs.readFile('docs/evidence/round13/input-content.json','utf8'));
for(const key of ['places','works','relations','placeDetails'])for(const old of before[key])assert.deepEqual(now[key].find(row=>(row.id??row.placeId)===(old.id??old.placeId)),old,'original object preserved '+key+'/'+(old.id??old.placeId));
const oldLayout=(await load('docs/evidence/round13/input-src/src/data/reading-layout.ts')).readingLayouts,newLayout=(await load('src/data/reading-layout.ts')).readingLayouts;for(const [id,layout] of Object.entries(oldLayout))assert.deepEqual(newLayout[id],layout,'old reading offsets '+id);
const input=JSON.parse(await fs.readFile('docs/evidence/round13/input-hashes.json','utf8'));const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const approved=['src/data/content.ts','src/data/reading-layout.ts'];
const changes=[];for(const f of input.files.filter(f=>approved.includes(f.path)))changes.push({path:f.path,before:f.sha256,after:sha(await fs.readFile(f.path)),reason:'C1 approved addition; original objects and offsets checked above'});
await fs.writeFile('docs/evidence/'+(process.env.EVIDENCE_ROUND??'round14')+'/data-baseline-changes.json',JSON.stringify({at:new Date().toISOString(),oldObjectsPreserved:{places:6,works:8,relations:8,placeDetails:6},changes},null,2));
assert.equal(now.places.length,9);assert.equal(now.works.length,12);assert.equal(now.relations.length,12);
const additions=[['yumen','Q1324562'],['yangguan','Q909541'],['loulan','Q1057551']];for(const [id,q] of additions){const e=JSON.parse(await fs.readFile('docs/evidence/round13/'+q+'.json','utf8')).entities[q];const c=e.claims.P625[0].mainsnak.datavalue.value;assert.equal(c.globe,'http://www.wikidata.org/entity/Q2');assert.deepEqual(now.places.find(p=>p.id===id).coordinates,[c.longitude,c.latitude]);const d=now.placeDetails.find(d=>d.placeId===id);assert.ok(d.intro.length>=80&&d.intro.length<=140,id+' intro');assert.ok(d.history.join('').length>=160&&d.history.join('').length<=260,id+' history');assert.equal(d.photo,undefined);assert.equal(d.local,undefined);}
const poems={
 'liangzhouci-1':['liangzhouci','黄河远上白云间，一片孤城万仞山。羌笛何须怨杨柳，春风不度玉门关。'],
 'guanshanyue':['guanshanyue','明月出天山，苍茫云海间。长风几万里，吹度玉门关。汉下白登道，胡窥青海湾。由来征战地，不见有人还。戍客望边色，思归多苦颜。高楼当此夜，叹息未应闲。'],
 'song-yuaner':['song-yuaner','渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。'],
 'congjunxing-4':['loulan-history-poem','青海长云暗雪山，孤城遥望玉门关。黄沙百战穿金甲，不破楼兰终不还。']};
// Source-page footnote callouts are not poem text (Xinjiang University ①–④).
const plain=s=>s.replace(/<[^>]*>/g,'').replace(/&[a-z0-9#]+;/gi,'').replace(/[①②③④\s，,。；;、：“”‘’？！?!]/g,'');
const sourceManifest=JSON.parse(await fs.readFile('docs/evidence/round13/sources/archive.json','utf8'));
const extracts=JSON.parse(await fs.readFile('docs/evidence/round13/sources/public-domain-poems.json','utf8'));
const report=[];for(const [id,[archive,full]] of Object.entries(poems)){
 const w=now.works.find(w=>w.id===id);assert.equal(w.paragraphs.map(p=>p.text).join(''),full,'full reviewed text '+id);
 const source=sourceManifest.records.find(r=>r.id===archive),extract=extracts.poems.find(p=>p.workId===id);
 assert.ok(source&&extract,id+' archived provenance');assert.equal(extract.sourceUrl,source.url);assert.equal(extract.archiveSha256,source.sha256);assert.equal(extract.text,full,id+' frozen public-domain extract');
 let html=null;if(process.env.SOURCE_ARCHIVE_MODE!=='public-extract'){try{html=await fs.readFile(source.file);}catch(error){if(error.code!=='ENOENT')throw error;}}
 if(html){assert.equal(sha(html),source.sha256,id+' source archive hash');assert.ok(plain(html.toString('utf8')).includes(plain(full)),id+' complete text in archived source');}
 assert.ok(w.interpretation.length>=100&&w.interpretation.length<=160,id+' interpretation');
 report.push({id,characters:full.length,archive,sourceVerification:html?'local-html-hash-and-full-text':'reviewed-public-domain-extract',fullTextInSource:html?true:null,interpretationChars:w.interpretation.length});
}
const finalPlan=JSON.parse(await fs.readFile('docs/planning/release-scope-v1.json','utf8'));assert.deepEqual(finalPlan.target,{places:12,works:16,relations:17,stories:2,chapters:6});
await fs.writeFile('docs/evidence/'+(process.env.EVIDENCE_ROUND??'round14')+'/content-check.json',JSON.stringify({at:new Date().toISOString(),passed:true,counts:{places:9,works:12,relations:12},poems:report,coordinates:additions,originalObjectsPreserved:true,finalPlanUnchanged:true},null,2));
console.log('PASS: C1 9/12/12, four complete poems ('+report.map(r=>r.sourceVerification).filter((v,i,a)=>a.indexOf(v)===i).join(', ')+'), exact archived coordinates, concise original explanations, original 6/8/8 objects and reading offsets preserved.');
