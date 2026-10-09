import fs from 'node:fs/promises';import crypto from 'node:crypto';
const rows=[
 ['liangzhouci','https://kxqm.hunnu.edu.cn/Article/Detail/fcb771e0-4ab1-40c0-a1b7-d529a9e8c52d'],
 ['guanshanyue','https://www.sastind.gov.cn/history/n152/n81023/n81097/c112097/content.html'],
 ['song-yuaner','https://wxyj.xju.edu.cn/info/1056/1361.htm'],
 ['loulan-history-poem','https://www.neac.gov.cn/seac/c103391/202211/1159783.shtml'],
 ['yumen-history','https://www.gswbj.gov.cn/a/2022/01/18/12369.html'],
 ['yangguan-history','https://www.gswbj.gov.cn/a/2022/12/02/15782.html'],
 ['yumen-unesco-map','https://whc.unesco.org/en/list/1442/maps/'],
];
await fs.mkdir('docs/evidence/round13/sources',{recursive:true});
const records=await Promise.all(rows.map(async([id,url])=>{try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});const b=Buffer.from(await r.arrayBuffer());const file='docs/evidence/round13/sources/'+id+'.html';await fs.writeFile(file,b);return {id,url,status:r.status,file,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};}catch(e){return {id,url,error:String(e)};}}));
await fs.writeFile('docs/evidence/round13/sources/archive.json',JSON.stringify({at:new Date().toISOString(),records},null,2));console.log(records.map(r=>({id:r.id,status:r.status,bytes:r.bytes,error:r.error})));
