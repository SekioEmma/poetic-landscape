import fs from 'node:fs/promises';
// Historical image fallback validation only. Round 11 primary engine uses
// check-national.mjs and check-reader-layout-round11.mjs, with new cameras.
import assert from 'node:assert/strict';
import ts from 'typescript';
const compiled=ts.transpileModule(await fs.readFile('src/map/overview-math.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {fittedImage,projectAnchor,focusCamera,resizedCamera,clusters}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const image={width:5826,height:7249},anchor={x:4887,y:3588};
let checked=0;
for(const frame of [{width:1392,height:710},{width:720,height:834},{width:370,height:650},{width:1392,height:736},{width:720,height:860},{width:370,height:684}]){
 const fit=fittedImage(frame,image);assert.ok(fit.left>=0&&fit.top>=0&&fit.width<=frame.width&&fit.height<=frame.height);assert.ok(Math.abs(fit.width/fit.height-image.width/image.height)<1e-9);
 for(const scale of [1,1.85,3,7]){const target={x:frame.width*.42,y:frame.height*.32},c=focusCamera(anchor,frame,image,target,scale),p=projectAnchor(anchor,frame,image,c);assert.ok(Math.abs(p.x-target.x)<1e-8&&Math.abs(p.y-target.y)<1e-8,'focus must land inside safe reading area');const changed=resizedCamera(c,frame,{width:370,height:650}),back=resizedCamera(changed,{width:370,height:650},frame);assert.ok(Math.abs(back.x-c.x)<1e-8&&Math.abs(back.y-c.y)<1e-8&&back.scale===c.scale,'resize round-trip preserves image-space view');checked++;}
 const c={x:20,y:-35,scale:2.4},copy={...c};projectAnchor(anchor,frame,image,c);assert.deepEqual(c,copy,'projection cannot mutate saved camera');
}
const points=[{id:'su',x:100,y:100},{id:'yang',x:120,y:100},{id:'hz1',x:138,y:120},{id:'hz2',x:138,y:120},{id:'wuhan',x:20,y:100}];assert.equal(clusters(points).length,2);const zoomed=points.map(p=>({...p,x:p.x*4,y:p.y*4}));assert.equal(clusters(zoomed).length,4,'separate actual city anchors at high scale, keep coincident Hangzhou selectable');
const record={date:new Date().toISOString().slice(0,10),passed:true,focusAndResizeCases:checked,checks:['full-extent fit and aspect','safe-area target lands exactly','resize round-trip','saved camera immutable','screen collision grouping separates cities at high scale']};
await fs.writeFile(process.argv[2]??'docs/evidence/round5/overview-math-check.json',JSON.stringify(record,null,2));console.log('PASS overview geometry:',JSON.stringify(record));
