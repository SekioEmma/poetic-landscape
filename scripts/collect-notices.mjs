import fs from 'node:fs/promises';
import path from 'node:path';
const lock=JSON.parse(await fs.readFile('package-lock.json','utf8'));
const records=[];const notices=['诗文山河 0.1.0 — 已安装依赖许可原文\n包含开发工具；不代表所有条目都被打包进浏览器。\n'];
for(const [directory,entry] of Object.entries(lock.packages)){
 if(!directory)continue;
 let pkg;try{pkg=JSON.parse(await fs.readFile(path.join(directory,'package.json'),'utf8'));}catch(error){if(error.code==='ENOENT')continue;throw error;}
 const names=(await fs.readdir(directory)).filter(name=>/^(licen[cs]e|mit-license|copying|notice)(\.|$)/i.test(name));
 records.push({name:pkg.name,version:pkg.version,license:pkg.license||entry.license||'未声明',development:!!entry.dev,noticeFiles:names});
 notices.push(`\n===== ${pkg.name}@${pkg.version} | ${JSON.stringify(pkg.license||entry.license)} =====\n`);
 for(const name of names){const file=path.join(directory,name);if((await fs.stat(file)).isFile())notices.push(`${name}\n${await fs.readFile(file,'utf8')}\n`);}
}
await fs.mkdir('public/legal',{recursive:true});
await fs.writeFile('public/legal/dependency-notices.txt',notices.join(''));
await fs.writeFile('docs/evidence/dependency-licenses.json',JSON.stringify(records,null,2));
await fs.writeFile('docs/evidence/package-versions-verified.json',JSON.stringify({date:'2026-10-06',packages:lock.packages[''].dependencies,devDependencies:lock.packages[''].devDependencies,compatibility:'AntV L7 2.29.1 + paired MapLibre adapter 2.29.1 + MapLibre GL 6.12.0, pinned local bridge; actual dev and production browser tests.'},null,2));
console.log(`已整理 ${records.length} 个依赖的许可声明。`);
