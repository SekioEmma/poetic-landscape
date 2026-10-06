import fs from 'node:fs/promises';
import osmtogeojson from 'osmtogeojson';
import bbox from '@turf/bbox';
const osm=JSON.parse(await fs.readFile('docs/evidence/westlake-osm.json','utf8'));
const geo=osmtogeojson(osm);
const lake=geo.features.find(f=>f.id==='relation/2308774');
if(!lake||lake.properties.tainted)throw Error('West Lake geometry incomplete');
const features=geo.features.filter(f=>['relation/2308774','relation/2162646','way/161419347','relation/5740510'].includes(f.id));
const lines=geo.features.filter(f=>f.geometry.type==='LineString'&&['苏堤','白堤'].includes(f.properties.name)&&f.properties.highway);
const labels=[];
const island=geo.features.find(f=>f.id==='relation/5740510');
if(island){const b=bbox(island);labels.push({name:'小瀛洲',coordinates:[(b[0]+b[2])/2,(b[1]+b[3])/2],source:island.id,purpose:'几何包围盒中心，仅放置地物文字'});}
const ruan=osm.elements.find(e=>e.type==='node'&&e.id===9035381270);
if(ruan)labels.push({name:'阮公墩',coordinates:[ruan.lon,ruan.lat],source:'node/'+ruan.id,purpose:'OSM 现代岛屿参照'});
await fs.writeFile('public/geodata/westlake.json',JSON.stringify({type:'FeatureCollection',features}));
await fs.writeFile('public/geodata/causeways.json',JSON.stringify({type:'FeatureCollection',features:lines}));
await fs.writeFile('public/geodata/local-labels.json',JSON.stringify(labels,null,2));
await fs.writeFile('docs/evidence/local-preparation.json',JSON.stringify({retrieved:'2026-10-05',lake:{id:lake.id,version:lake.properties.version,timestamp:lake.properties.timestamp},features:features.map(f=>({id:f.id,name:f.properties.name,tainted:!!f.properties.tainted})),causeways:lines.map(f=>({id:f.id,name:f.properties.name})),labels,process:'选取真实水域、岛屿及堤道；保留原始几何，未简化局部数据；岛屿在西湖水域中保留内环。'},null,2));
console.log('prepared',features.length,lines.length,labels);
