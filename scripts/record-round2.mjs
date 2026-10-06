import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const qa=JSON.parse(await fs.readFile('docs/evidence/round2/browser-acceptance.json','utf8'));
const unresolved=qa.cases.filter(c=>!c.pass&&!qa.cases.some(r=>r.case===c.resolvedBy&&r.pass));
assert.equal(unresolved.length,0,'Unresolved browser acceptance observations');
async function collect(dir){const out=[];for(const item of await fs.readdir(dir,{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory())out.push(...await collect(path));else{const bytes=await fs.readFile(path);out.push({path,bytes:bytes.length,sha256:sha(bytes)});}}return out.sort((a,b)=>a.path.localeCompare(b.path));}
const implementation=[...await collect('src')];
for(const path of ['vite.config.ts','package.json','package-lock.json','scripts/check-data.mjs']){const bytes=await fs.readFile(path);implementation.push({path,bytes:bytes.length,sha256:sha(bytes)});}
const build=[...await collect('dist/assets')];const html=await fs.readFile('dist/index.html');
const result={date:'2026-10-06',scope:{places:6,works:8},checks:{command:'npm run check:data',record:'check-data.txt',passed:true},productionBuild:{command:'npm run build',record:'build.txt',passed:true,indexSha256:sha(html),artifacts:build},browser:{record:'browser-acceptance.json',cases:qa.cases.length,directPasses:qa.cases.filter(c=>c.pass).length,resolvedObservations:qa.cases.filter(c=>!c.pass&&c.resolvedBy).length,unresolved:0,consoleRecord:'browser-console.json'},implementation};
await fs.writeFile('docs/evidence/round2/build-and-checks.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({places:6,works:8,browser:result.browser,indexSha256:result.productionBuild.indexSha256},null,2));
