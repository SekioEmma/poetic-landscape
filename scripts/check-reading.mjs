import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
import path from 'node:path';
const load=async path=>{const source=await fs.readFile(path,'utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));};
const {works,relations}=await load('src/data/content.ts');
const {readingLayouts}=await load('src/data/reading-layout.ts');
assert.deepEqual(Object.keys(readingLayouts).sort(),works.map(w=>w.id).sort());
const report=[];
for(const w of works){const layout=readingLayouts[w.id];assert.deepEqual(Object.keys(layout.paragraphs),w.paragraphs.map(p=>p.id));let lines=0,marks='';const relation=relations.find(r=>r.workId===w.id);
 for(const p of w.paragraphs){const offsets=layout.paragraphs[p.id],h=relation.highlight,at=p.id===h.paragraphId?p.text.indexOf(h.text):-1;let spans;
  if(layout.form==='prose'){assert.equal(offsets.length,0);spans=[[0,p.text.length]];}
  else{assert.equal(offsets[0],0,w.id+'/'+p.id);assert.equal(offsets.at(-1),p.text.length,w.id+'/'+p.id+' final offset');assert.ok(offsets.every((n,i)=>Number.isInteger(n)&&(i===0||n>offsets[i-1])));spans=offsets.slice(0,-1).map((n,i)=>[n,offsets[i+1]]);lines+=spans.length;}
  assert.equal(spans.map(([a,b])=>p.text.slice(a,b)).join(''),p.text,'lossless original '+w.id+'/'+p.id);
  for(const [a,b] of spans){const left=Math.max(a,at),right=Math.min(b,at+h.text.length);if(at>=0&&right>left)marks+=p.text.slice(left,right);}
 }
 if(layout.form==='quatrain')assert.equal(lines,4);if(layout.form==='regulated')assert.equal(lines,8);if(layout.form==='song'||layout.form==='prose')assert.equal(w.paragraphs.length,4);if(layout.form==='ancient'){assert.equal(w.id,'guanshanyue');assert.equal(w.paragraphs.length,6);assert.equal(lines,12);}
 assert.equal(marks,relation.highlight.text,'cross-line highlight '+w.id);report.push({workId:w.id,form:layout.form,paragraphs:w.paragraphs.length,lines,lossless:true,highlight:true});
}
const output=process.argv[2]??'docs/evidence/round8/reading-layout-check.json';
await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify({checkedAt:new Date().toISOString(),works:report},null,2)+'\n');
console.log(`${works.length} works: explicit offsets, source-exact paragraphs and continuous relation highlights verified.`);
