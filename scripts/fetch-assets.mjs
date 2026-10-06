import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import bbox from '@turf/bbox';
import simplify from '@turf/simplify';
const out = new URL('../public/', import.meta.url);
await fs.mkdir(new URL('geodata/', out), {recursive:true});
await fs.mkdir(new URL('assets/', out), {recursive:true});
await fs.mkdir(new URL('../docs/evidence/', import.meta.url), {recursive:true});
const evidence=[];
async function download(url,path){
 const response=await fetch(url,{signal:AbortSignal.timeout(60000)}); if(!response.ok)throw Error(`${response.status} ${url}`);
 const buffer=Buffer.from(await response.arrayBuffer()); await fs.writeFile(new URL(path,out),buffer);
 evidence.push({url,resolvedUrl:response.url,path,bytes:buffer.length,sha256:crypto.createHash('sha256').update(buffer).digest('hex'),retrieved:'2026-10-05'}); return buffer;
}
const land=JSON.parse(await download('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson','../docs/evidence/naturalearth-land-original.json'));
land.features=land.features.filter(f=>{const b=bbox(f);return b[2]>=65&&b[0]<=145&&b[3]>=0&&b[1]<=60;}).map(f=>simplify(f,{tolerance:0.015,highQuality:true}));
await fs.writeFile(new URL('geodata/land.json',out),JSON.stringify(land));
const photo='https://commons.wikimedia.org/wiki/Special:Redirect/file/West_Lake_IMG_8759_huxin_pavillion_island.jpg';
await download(photo,'assets/huxin-2017.jpg');
// Use fetch-osm-grid.mjs then prepare-local.mjs for the official OSM API path.
await fs.writeFile(new URL('../docs/evidence/downloads.json',import.meta.url),JSON.stringify(evidence,null,2));
console.log('assets saved',evidence.map(e=>({path:e.path,bytes:e.bytes,sha256:e.sha256})));
