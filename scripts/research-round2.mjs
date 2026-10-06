import fs from 'node:fs/promises';
await fs.mkdir('docs/evidence/round2',{recursive:true});
for (const [id,query] of [['guazhou','瓜洲古渡'],['hanshan','寒山寺']]) {
 const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=4&accept-language=zh&'+new URLSearchParams({q:query});
 try {const r=await fetch(url,{headers:{'User-Agent':'PoeticLandscapeLocalResearch/0.2 (one-off academic source verification)'},signal:AbortSignal.timeout(20000)});const body=await r.text();await fs.writeFile(`docs/evidence/round2/${id}-osm-search.json`,JSON.stringify({date:'2026-10-05',url,status:r.status,result:r.ok?JSON.parse(body):body.slice(0,300)},null,2));console.log(id,r.status,r.ok?body.slice(0,2300):body.slice(0,200));} catch(e){console.log(id,e.message);}
}
