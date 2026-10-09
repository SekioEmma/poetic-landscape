// Scheduler contract only. Native gesture acceptance is separate browser evidence.
import fs from 'node:fs/promises';import ts from 'typescript';import assert from 'node:assert/strict';
const text=ts.transpileModule(await fs.readFile('src/map/camera-intent.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {CameraIntent}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
const intent=new CameraIntent();const a=intent.begin('place'),b=intent.begin('place');
assert.ok(!intent.owns(a)&&intent.owns(b));intent.finish(a);assert.equal(intent.active,true);
assert.equal(intent.cancel(),true);assert.equal(intent.cancel(),false);assert.ok(!intent.owns(b));
let id;for(let n=0;n<10;n++)id=intent.begin('button',(intent.zoomTarget??2)+.5);
assert.equal(intent.zoomTarget,7);id=intent.begin('button',intent.zoomTarget-.5);assert.equal(intent.zoomTarget,6.5);
intent.finish(id);assert.equal(intent.zoomTarget,undefined);assert.equal(intent.active,false);
const source=await fs.readFile('src/map/MapAdapter.ts','utf8');assert.ok(!source.includes('map.stop(true)'));assert.ok(source.includes('markManual(false)')&&source.includes('capture:true'));
const report={at:new Date().toISOString(),passed:true,checks:['superseded callback has no ownership','only one automatic cancellation','ten targets accumulate','reverse target accumulates','completion clears target'],scope:'application scheduler; native wheels and drags require runtime evidence'};
await fs.writeFile('docs/evidence/'+(process.env.EVIDENCE_ROUND??'round14')+'/camera-intent-check.json',JSON.stringify(report,null,2));console.log('PASS: camera ownership, cancellation and cumulative targets.');
