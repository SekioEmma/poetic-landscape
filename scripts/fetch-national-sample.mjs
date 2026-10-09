import fs from 'node:fs/promises';import crypto from 'node:crypto';
const dir='docs/evidence/round11';await fs.mkdir(dir,{recursive:true});
const resources=[['https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json','geoatlas-100000-full.json'],['https://raw.githubusercontent.com/wandergis/coordtransform/master/index.js','coordtransform-reference.cjs'],['https://raw.githubusercontent.com/wandergis/coordtransform/master/LICENSE','coordtransform-LICENSE.txt']];
const records=[];
for(const [url,file] of resources){const r=await fetch(url);if(!r.ok)throw Error(`${r.status} ${url}`);const bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile(dir+'/'+file,bytes);records.push({url,file,at:new Date().toISOString(),status:r.status,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
const national=JSON.parse(await fs.readFile(dir+'/geoatlas-100000-full.json','utf8'));
if(national.features.length!==35||!national.features.some(f=>f.properties.adcode==='100000_JD'))throw Error('Unexpected GeoAtlas feature set');
await fs.copyFile(dir+'/geoatlas-100000-full.json','public/geodata/national-geoatlas.json');await fs.copyFile(dir+'/coordtransform-LICENSE.txt','public/legal/coordtransform-MIT.txt');
await fs.writeFile(dir+'/downloads.json',JSON.stringify({records,features:national.features.map(f=>({id:f.properties.adcode,name:f.properties.name,type:f.geometry.type,polygons:f.geometry.coordinates.length})),sourceConvention:'GCJ-02 adopted from DataV official map-data-format + AMap origin; payload itself has no CRS declaration',publication:'learning-exchange only; formal publishing pending'},null,2));console.log(JSON.stringify(records));
