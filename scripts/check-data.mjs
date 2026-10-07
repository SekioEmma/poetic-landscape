import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
import crypto from 'node:crypto';
const source=await fs.readFile('src/data/content.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {places,works,relations,placeDetails,photo}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const explorationCompiled=ts.transpileModule(await fs.readFile('src/data/exploration.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {explore,preferredWork,themes}=await import('data:text/javascript;base64,'+Buffer.from(explorationCompiled).toString('base64'));
const scope=JSON.parse(await fs.readFile('docs/evidence/round2/scope.json','utf8'));
const unique=(rows,label)=>assert.equal(new Set(rows.map(r=>r.id)).size,rows.length,label+' duplicate id');
for(const [rows,label] of [[places,'places'],[works,'works'],[relations,'relations']])unique(rows,label);
assert.deepEqual(places.map(p=>p.id).sort(),scope.places.map(p=>p.id).sort(),'round 2 scope');
assert.deepEqual(works.map(w=>w.id).sort(),scope.places.flatMap(p=>p.works).sort(),'all 8 expected works');
for(const p of places){assert.equal(p.coordinates.length,2);assert.ok(p.coordinates.every(Number.isFinite));assert.ok(p.coordinates[0]>=-180&&p.coordinates[0]<=180&&p.coordinates[1]>=-90&&p.coordinates[1]<=90);assert.equal(p.coordinateSystem,'WGS84');assert.ok(p.coordinateSource.startsWith('https://'));assert.ok(p.precision&&p.aliases.length&&p.themes.length);assert.ok(p.themes.every(t=>themes.includes(t)));const detail=placeDetails.filter(d=>d.placeId===p.id);assert.equal(detail.length,1);assert.ok(detail[0].intro&&detail[0].history.join('').length>=100);assert.ok(detail[0].historySources.every(s=>s.title&&s.url.startsWith('https://')));assert.ok(relations.some(r=>r.placeId===p.id));}
for(const w of works){assert.ok(w.title&&w.author&&w.era&&w.sourceTitle&&w.source.startsWith('https://')&&w.interpretation.length>=80&&w.variant);unique(w.paragraphs,'paragraphs '+w.id);assert.ok(w.paragraphs.length&&w.paragraphs.every(p=>p.id&&p.text));assert.ok(relations.some(r=>r.workId===w.id));}
assert.equal(new Set(relations.map(r=>r.placeId+'/'+r.workId)).size,relations.length);
for(const r of relations){assert.ok(places.some(p=>p.id===r.placeId));const w=works.find(w=>w.id===r.workId);assert.ok(w);const paragraph=w.paragraphs.find(p=>p.id===r.highlight.paragraphId);assert.ok(paragraph?.text.includes(r.highlight.text),'exact highlight '+r.id);assert.ok(r.highlight.text);assert.ok(scope.places.find(p=>p.id===r.placeId).works.includes(r.workId));}
const search=(q,t='全部')=>explore(places,works,relations,q,t);
assert.deepEqual(search('杭州').map(r=>r.place.id).sort(),['huxin','xihu']);
assert.equal(preferredWork(search('苏轼')[0],relations),'yin-hushang');
assert.equal(preferredWork(search('李白')[0],relations),'song-menghaoran');
assert.equal(preferredWork(search('白居易')[0],relations),'qiantang-chunxing');
assert.equal(search('茅屋')[0].place.id,'dufu');assert.equal(search('枫桥')[0].place.id,'hanshan');assert.equal(search('钱塘')[0].place.id,'xihu');
assert.equal(search('无此地点').length,0);assert.equal(search('').length,places.length);assert.equal(search('苏轼','楼台与城郭').length,0);assert.equal(search('杭州','江湖与行旅').length,2);assert.equal(search('  苏轼  ')[0].place.id,'xihu');assert.equal(search('','关山与家国').length,0);
assert.equal(photo.license,'CC BY-SA 4.0');assert.ok(photo.author&&photo.date&&photo.source&&photo.licenseUrl);
assert.equal(photo.width,4032);assert.equal(photo.height,2418);
for(const [placeId,file,osmId] of [['hanshan','hanshan-osm-search.json',741882129],['guazhou','guazhou-town-osm-search.json',14306193]]){
 const evidence=JSON.parse(await fs.readFile('docs/evidence/round2/'+file,'utf8'));assert.equal(evidence.status,200);const row=evidence.result.find(r=>r.osm_id===osmId);assert.ok(row);const p=places.find(p=>p.id===placeId);assert.ok(Math.abs(p.coordinates[0]-Number(row.lon))<1e-7&&Math.abs(p.coordinates[1]-Number(row.lat))<1e-7,'coordinate must match archived response '+placeId);
}
const raw=JSON.parse(await fs.readFile('docs/evidence/westlake-osm.json','utf8'));
const nodeMap=new Map(raw.elements.filter(e=>e.type==='node').map(e=>[e.id,e]));
const wayMap=new Map(raw.elements.filter(e=>e.type==='way').map(e=>[e.id,e]));
const rel=raw.elements.find(e=>e.type==='relation'&&e.id===2308774);
for(const m of rel.members){if(m.type==='way'){assert.ok(wayMap.has(m.ref),'missing way '+m.ref);for(const n of wayMap.get(m.ref).nodes)assert.ok(nodeMap.has(n),'missing node '+n);}}
const building=wayMap.get(30086285);const corners=building.nodes.slice(0,-1).map(id=>nodeMap.get(id));
const center=[corners.reduce((sum,n)=>sum+n.lon/corners.length,0),corners.reduce((sum,n)=>sum+n.lat/corners.length,0)];
const anchor=places.find(p=>p.id==='huxin').coordinates;assert.ok(Math.abs(anchor[0]-center[0])<1e-7&&Math.abs(anchor[1]-center[1])<1e-7,'modern pavilion anchor must match source footprint');
const geo=JSON.parse(await fs.readFile('public/geodata/westlake.json','utf8'));const lake=geo.features.find(f=>f.id==='relation/2308774');assert.ok(lake&&!lake.properties.tainted);assert.equal(lake.geometry.type,'MultiPolygon');
const vertices=lake.geometry.coordinates.flat(2);const lakeCenter=[(Math.min(...vertices.map(p=>p[0]))+Math.max(...vertices.map(p=>p[0])))/2,(Math.min(...vertices.map(p=>p[1]))+Math.max(...vertices.map(p=>p[1])))/2];
const lakePlace=places.find(p=>p.id==='xihu');assert.ok(lakePlace.coordinates.every((n,i)=>Math.abs(n-lakeCenter[i])<1e-7),'West Lake regional position matches archived geometry');
function insideRing(p,r){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
assert.ok(lake.geometry.coordinates.some(poly=>insideRing(anchor,poly[0])),'anchor must be within West Lake outer shore');
assert.ok(lake.geometry.coordinates.some(poly=>poly.slice(1).some(r=>insideRing(anchor,r))),'pavilion anchor must fall in an island hole, not lake water');
const downloads=JSON.parse(await fs.readFile('docs/evidence/downloads.json','utf8'));const p=downloads.find(d=>d.path===photo.file);assert.ok(p);const photoBytes=await fs.readFile('public/'+photo.file);assert.equal(crypto.createHash('sha256').update(photoBytes).digest('hex'),p.sha256);assert.equal(photoBytes[0],0xff);assert.equal(photoBytes[1],0xd8);
for(const file of ['src/App.tsx','src/data/content.ts','src/styles.css'])assert.ok(!(await fs.readFile(file,'utf8')).includes('\ufffd'));
const mapSource=await fs.readFile('src/data/basemap.ts','utf8');const mapCompiled=ts.transpileModule(mapSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {basemap,imageAnchors}=await import('data:text/javascript;base64,'+Buffer.from(mapCompiled).toString('base64'));
const officialBytes=await fs.readFile('public/'+basemap.file);assert.equal(crypto.createHash('sha256').update(officialBytes).digest('hex'),basemap.sha256);
const derivative=JSON.parse(await fs.readFile('docs/evidence/round5/derivative.json','utf8'));const design=await fs.readFile('public/'+basemap.designFile);assert.equal(crypto.createHash('sha256').update(design).digest('hex'),basemap.designSha256);assert.equal(derivative.output.sha256,basemap.designSha256);assert.equal(design.readUInt32BE(16),basemap.width);assert.equal(design.readUInt32BE(20),basemap.height);assert.deepEqual(derivative.transform,{xScale:1,yScale:1,xOffset:0,yOffset:0,oldWidth:5826,oldHeight:7249});
const manifest=JSON.parse(await fs.readFile('docs/evidence/basemaps/manifest.json','utf8'));assert.equal(manifest.runtime.sha256,basemap.sha256);assert.equal(manifest.files.find(f=>f.name.endsWith('.jpg')).sha256,basemap.sha256);
for(const f of manifest.files){const bytes=await fs.readFile(f.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256);assert.equal(bytes.length,f.bytes);}
assert.equal(imageAnchors.length,places.length);assert.equal(new Set(imageAnchors.map(a=>a.placeId)).size,places.length);
for(const a of imageAnchors){assert.ok(places.some(p=>p.id===a.placeId));assert.ok(a.x>0&&a.x<basemap.width&&a.y>0&&a.y<basemap.height);assert.ok(manifest.imageAnchors.some(m=>m.place===a.placeId&&m.pixel[0]===a.x&&m.pixel[1]===a.y));}
console.log(`PASS: ${places.length} places, ${works.length} works, ${relations.length} exact highlights; generic references, themes, coordinates, culture and sources; author/title/alias search + combinations; complete OSM geometry + island anchor; photograph hash/credit/license; immutable official JPG hash + ${imageAnchors.length} image anchors; UTF-8.`);
