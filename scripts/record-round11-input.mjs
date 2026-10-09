import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const out='docs/evidence/round11';await fs.mkdir(out,{recursive:true});
const hash=async p=>({path:p,bytes:(await fs.stat(p)).size,sha256:crypto.createHash('sha256').update(await fs.readFile(p)).digest('hex')});
async function walk(p){const rows=[];for(const e of await fs.readdir(p,{withFileTypes:true})){const f=p+'/'+e.name;rows.push(...(e.isDirectory()?await walk(f):[f]));}return rows;}
const files=[...await walk('src'),...await walk('public'),...await walk('docs/evidence/basemaps/original'),'package.json','package-lock.json','vite.config.ts'];
await fs.writeFile(out+'/input-hashes.json',JSON.stringify({at:new Date().toISOString(),files:await Promise.all(files.map(hash))},null,2));
await fs.copyFile('../诗文山河_MVP开发计划_2026-10-05.md','docs/tasks/诗文山河_MVP开发计划_第十一轮实际输入v3.1.md');
await fs.cp('src',out+'/input-src',{recursive:true});
await fs.cp('dist','.tmp/round11-baseline/dist',{recursive:true});
console.log('Saved input source, hashes, v3.1 and round 10 preview dist.');
