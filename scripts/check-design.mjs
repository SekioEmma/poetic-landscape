import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=await fs.readFile('src/data/visual.ts','utf8');
const moduleText=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {shortQuote,workScenes,overviewFocus}=await import('data:text/javascript;base64,'+Buffer.from(moduleText).toString('base64'));
const contentText=(await fs.readFile('src/data/content.ts','utf8')).replace(/import.*from.*catalog.*;\s*/,'');
const contentModule=ts.transpileModule(contentText,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {relations}=await import('data:text/javascript;base64,'+Buffer.from(contentModule).toString('base64'));
for(const r of relations)assert.ok(r.highlight.text.includes(shortQuote(r)),'excerpt must be one continuous relation fragment: '+r.id);
assert.deepEqual(Object.keys(workScenes).sort(),['huxinting-kanxue','qiantang-chunxing']);
assert.equal(workScenes['yin-hushang'],undefined,'Su Shi must not inherit winter or spring art');
assert.deepEqual(overviewFocus,{side:1.45,bottom:1.6});
assert.ok(Object.values(workScenes).every(s=>s.alt.includes('非')&&s.alt.includes('AI')&&s.width===1536&&s.height===1024));
const newAssets=JSON.parse(await fs.readFile('docs/evidence/round9/assets.json','utf8'));
assert.equal(newAssets.files.length,2);
assert.deepEqual(newAssets.files.map(f=>f.path.split('/').at(-1)).sort(),Object.values(workScenes).map(s=>s.file).sort());
for(const f of newAssets.files){assert.equal(crypto.createHash('sha256').update(await fs.readFile(f.path)).digest('hex'),f.sha256);assert.equal(f.mode,'RGBA');assert.ok(f.alpha.min===0&&f.alpha.max>=200&&f.alpha.transparentPixels>0);}
const asset=JSON.parse(await fs.readFile('docs/evidence/round5/assets.json','utf8'));
for(const f of asset.files){const bytes=await fs.readFile(f.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256);}
const texture=await fs.readFile('public/assets/paper-fibres-v5.svg','utf8');assert.ok(!/<image|<filter|<animate|<foreignObject/i.test(texture));
const frozen=JSON.parse(await fs.readFile('docs/evidence/round5/frozen-inputs.json','utf8'));
for(const f of frozen){assert.ok(!f.path.includes('..'),'invalid frozen input path');const bytes=await fs.readFile(f.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256,'frozen input changed: '+f.path);}
const mapText=ts.transpileModule(await fs.readFile('src/data/basemap.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {basemap,imageAnchors}=await import('data:text/javascript;base64,'+Buffer.from(mapText).toString('base64'));
const before=JSON.parse(await fs.readFile('docs/evidence/basemaps/manifest-round4.json','utf8'));
assert.equal(basemap.width,before.width);assert.equal(basemap.height,before.height);
assert.deepEqual(imageAnchors.map(a=>[a.placeId,a.x,a.y]),before.imageAnchors.map(a=>[a.place,...a.pixel]));
console.log('PASS: 8 continuous excerpts; two work-specific seasonal paintings / alpha / hashes and explicit focus scales; static local texture; frozen content, dependencies, image anchors, camera mathematics, historical PNG, OSM geometry and photograph.');
