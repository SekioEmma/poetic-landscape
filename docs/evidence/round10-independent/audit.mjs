import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const independent='docs/evidence/round10-independent/';
await fs.mkdir(independent,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const checks=[];
for(const args of [['scripts/check-data.mjs'],['scripts/check-design.mjs'],['scripts/check-reading.mjs',independent+'reading-check.json'],['scripts/check-overview.mjs',independent+'overview-check.json'],['scripts/check-reader-gesture.mjs']]){
 const output=execFileSync(process.execPath,args,{encoding:'utf8'});checks.push({args,output,exitCode:0});
}
let audit=await fs.readFile('scripts/check-reader-layout-round10.mjs','utf8');
audit="const independent='"+independent+"';\n"+audit.replaceAll("fs.writeFile(base+","fs.writeFile(independent+");
await import('data:text/javascript;base64,'+Buffer.from(audit).toString('base64'));
checks.push({args:['check-reader-layout-round10.mjs','docs/evidence/round10'],scope:'Audit developer records; not new runtime execution',exitCode:0});
const manifest=JSON.parse(await fs.readFile('docs/evidence/basemaps/manifest.json','utf8'));
const item=manifest.files.find(x=>x.name.endsWith('.eps'));
const eps=await fs.readFile(item.path);assert.equal(sha(eps),item.sha256);
const offset=eps.readUInt32LE(4),length=eps.readUInt32LE(8),ps=eps.subarray(offset,offset+length).toString('latin1');
const bodyAt=ps.indexOf('%%EndProlog'),body=ps.slice(bodyAt);
const count=token=>(body.match(new RegExp('(?:^|\\s)'+token+'(?=\\s|$)','gm'))??[]).length;
await fs.writeFile(independent+'eps-vector-inspection.json',JSON.stringify({at:new Date().toISOString(),path:item.path,bytes:eps.length,sha256:sha(eps),postscript:{offset,length},boundingBox:(ps.match(/%%BoundingBox:[^\r\n]*/g)??[]).slice(0,4),prologEnd:bodyAt,bodyOperatorOccurrences:{m:count('m'),l:count('l'),c:count('c'),'@c':count('@c'),image:count('image'),colorimage:count('colorimage'),imagemask:count('imagemask')},scope:'Text inspection only; vector paths exist. No EPS rendering, semantic layer extraction or geographic registration validated.'},null,2)+'\n');
const zipPath='releases/诗文山河_第十轮静态包_2026-10-07.zip',zip=await fs.readFile(zipPath);
let end=zip.length-22;while(end>=0&&zip.readUInt32LE(end)!==0x06054b50)end--;assert.ok(end>=0);
const total=zip.readUInt16LE(end+10),files=[];let p=zip.readUInt32LE(end+16);
for(let i=0;i<total;i++){
 assert.equal(zip.readUInt32LE(p),0x02014b50);const method=zip.readUInt16LE(p+10),size=zip.readUInt32LE(p+20),nl=zip.readUInt16LE(p+28),el=zip.readUInt16LE(p+30),cl=zip.readUInt16LE(p+32),lp=zip.readUInt32LE(p+42),name=zip.subarray(p+46,p+46+nl).toString('utf8');p+=46+nl+el+cl;if(name.endsWith('/'))continue;
 const start=lp+30+zip.readUInt16LE(lp+26)+zip.readUInt16LE(lp+28),compressed=zip.subarray(start,start+size);assert.ok([0,8].includes(method));const data=method===8?zlib.inflateRawSync(compressed):compressed,dist=await fs.readFile('dist/'+name);assert.equal(sha(data),sha(dist),name);files.push({path:name,bytes:data.length,sha256:sha(data),identical:true});
}
const walk=async dir=>(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?await walk(dir+'/'+e.name):[dir+'/'+e.name]))).flat();
assert.deepEqual(files.map(x=>x.path).sort(),(await walk('dist')).map(x=>x.slice(5)).sort());
const html=await fs.readFile('dist/index.html','utf8'),assets=[...html.matchAll(/(?:src|href)="([^" ]+\.(?:js|css))"/g)].map(x=>x[1]);const http=[];
for(const url of ['/',...assets]){const resolved=new URL(url,'http://127.0.0.1:4173/');const response=await fetch(resolved);assert.ok(response.ok,url);const body=Buffer.from(await response.arrayBuffer()),local=await fs.readFile('dist/'+(resolved.pathname==='/'?'index.html':resolved.pathname.slice(1)));assert.equal(sha(body),sha(local),url);http.push({url,sha256:sha(body),identical:true});}
await fs.writeFile(independent+'checks-and-release.json',JSON.stringify({at:new Date().toISOString(),checks,zip:{path:zipPath,bytes:zip.length,sha256:sha(zip),fileCount:files.length,fileSetIdentical:true,allBytesIdentical:true},files,http,build:'Not rerun; current production HTTP/dist/ZIP byte identity and current script checks verified'},null,2)+'\n');
console.log(JSON.stringify({checks:checks.length,zipFiles:files.length,zipSha256:sha(zip),productionAssets:assets},null,2));
