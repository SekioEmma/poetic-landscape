import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const out='docs/evidence/round12';
await fs.mkdir(out,{recursive:true});await fs.mkdir('docs/screenshots/round12',{recursive:true});
async function walk(p){const rows=[];for(const e of await fs.readdir(p,{withFileTypes:true})){const f=p+'/'+e.name;rows.push(...e.isDirectory()?await walk(f):[f]);}return rows;}
const files=[...await walk('src'),...await walk('public'),'package.json','package-lock.json','vite.config.ts'];
const records=await Promise.all(files.map(async path=>{const b=await fs.readFile(path);return{path,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};}));
if(await fs.stat(out+'/input-hashes.json').catch(()=>null))throw Error('Input already saved; preserve it.');
await fs.writeFile(out+'/input-hashes.json',JSON.stringify({at:new Date().toISOString(),files:records},null,2)+'\n');
await fs.cp('src',out+'/input-src',{recursive:true});await fs.cp('dist','.tmp/round12-baseline/dist',{recursive:true});
await fs.copyFile('../诗文山河_MVP开发计划_2026-10-05.md','docs/tasks/诗文山河_MVP开发计划_第十二轮输入v3.4.md');
console.log('Preserved input, current uncommitted source, assets and round11 production build.');
