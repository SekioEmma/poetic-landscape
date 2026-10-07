import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const qa=JSON.parse(await fs.readFile('docs/evidence/round3/browser-acceptance.json','utf8'));
const unresolved=qa.cases.filter(c=>!c.pass&&!qa.cases.some(r=>r.case===c.resolvedBy&&r.pass));assert.equal(unresolved.length,0,'unresolved acceptance observations');
const content=await fs.readFile('src/data/content.ts');
const files=[];for(const dir of ['dist/assets','docs/screenshots/round3'])for(const name of await fs.readdir(dir)){const path=dir+'/'+name;const b=await fs.readFile(path);files.push({path,bytes:b.length,sha256:sha(b)});}
const record={date:'2026-10-06',scope:{places:6,works:8,contentSha256:sha(content)},route:'Restricted JPG deterministic mapping; EPS conversion not executed',checks:{data:'check-data.txt',build:'build.txt',overviewMath:'overview-math-check.json'},browser:{cases:qa.cases.length,directPasses:qa.cases.filter(c=>c.pass).length,resolvedObservations:qa.cases.filter(c=>!c.pass&&c.resolvedBy).length,unresolved:0,physicalTouchPinch:'unverified',tested:'Chromium mouse/keyboard; viewport 1440x900,768x1024,390x844 and1024x900'},artLimit:'Annotation density and original visual boundary width remain; map artwork not fully achieved',files};
await fs.writeFile('docs/evidence/round3/delivery-manifest.json',JSON.stringify(record,null,2));console.log(JSON.stringify(record.browser));
