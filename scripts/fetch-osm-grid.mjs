import fs from 'node:fs/promises';
import osmtogeojson from 'osmtogeojson';
const elements=new Map();const requests=[];
for(const x of [120.115,120.135,120.155])for(const y of [30.225,30.245,30.265]){
 const bounds=[x,y,Number((x+0.02).toFixed(3)),Number((y+0.02).toFixed(3))];
 const url='https://www.openstreetmap.org/api/0.6/map.json?bbox='+bounds.join(',');
 const r=await fetch(url,{headers:{'User-Agent':'PoeticLandscape/0.1 (local educational map; source audit)'},signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`${r.status} ${await r.text()}`);
 const json=await r.json();for(const e of json.elements)elements.set(e.type+'/'+e.id,e);
 requests.push({url,count:json.elements.length,generator:json.generator,version:json.version});console.log(bounds,json.elements.length);
}
const osm={version:0.6,elements:[...elements.values()]};
await fs.writeFile('docs/evidence/westlake-osm.json',JSON.stringify(osm));
const all=osmtogeojson(osm);const features=all.features.filter(f=>['Polygon','MultiPolygon'].includes(f.geometry.type)&&(f.properties.natural==='water'||f.properties.place==='islet'));
await fs.writeFile('public/geodata/westlake.json',JSON.stringify({type:'FeatureCollection',features}));
await fs.writeFile('docs/evidence/osm-requests.json',JSON.stringify({retrieved:'2026-10-05',requests,features:features.map(f=>({id:f.id,tags:f.properties,geometryType:f.geometry.type}))},null,2));
console.log('water/islets',features.map(f=>({id:f.id,name:f.properties.name,type:f.geometry.type})));
