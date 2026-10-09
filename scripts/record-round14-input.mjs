import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const base='docs/evidence/round14';
await fs.mkdir(base,{recursive:true});
try {await fs.access(base+'/input-hashes.json');throw Error('Round14 input already recorded; do not overwrite');}catch(e){if(e.code!=='ENOENT')throw e;}
const files=[];
async function walk(root){for(const e of await fs.readdir(root,{withFileTypes:true})){const p=root+'/'+e.name;if(e.isDirectory())await walk(p);else {const b=await fs.readFile(p);files.push({path:p,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});if(root.startsWith('src')){const out=base+'/input-src/'+p;await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,b);}}}}
await walk('src');await walk('public');
for(const p of ['package.json','package-lock.json','vite.config.ts','docs/planning/release-scope-v1.json']){const b=await fs.readFile(p);files.push({path:p,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});}
await fs.writeFile(base+'/input-hashes.json',JSON.stringify({at:new Date().toISOString(),files},null,2));
const code=ts.transpileModule(await fs.readFile('src/data/content.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {places,works,relations,placeDetails}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
await fs.writeFile(base+'/input-content.json',JSON.stringify({places,works,relations,placeDetails},null,2));
await fs.copyFile('../诗文山河_MVP开发计划_2026-10-05.md','docs/tasks/诗文山河_MVP开发计划_第十四轮输入v3.8.md');
await fs.copyFile('README.md',base+'/README.md.before');
await fs.cp('dist','.tmp/round14-baseline/dist',{recursive:true});
await fs.mkdir('docs/screenshots/round14',{recursive:true});
console.log('Recorded Round14 immutable input and baseline build.');
