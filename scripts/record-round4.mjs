import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root='docs/evidence/round4/';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const list=[];
for(const file of ['src/components/CategoryIcon.tsx','public/assets/lake-song.svg','public/assets/tower-song.svg','public/assets/reading-fibres.svg','src/song-design.css']){const bytes=await fs.readFile(file);list.push({file,bytes:bytes.length,sha256:hash(bytes),origin:'project-original-code',license:'NOTICE existing project rights; no added open license'});}
const skillPath='C:/Users/13398/.codex/skills/frontend-design/SKILL.md';
await fs.writeFile(root+'assets.json',JSON.stringify({date:'2026-10-06',skill:{path:skillPath,source:'https://github.com/anthropics/skills/tree/main/skills/frontend-design',sha256:hash(await fs.readFile(skillPath)),method:'official skill-installer script; full local SKILL.md read'},assets:list},null,2));
const before=JSON.parse(await fs.readFile(root+'before-captures.json','utf8')),after=JSON.parse(await fs.readFile(root+'after-captures.json','utf8'));
const cameraComparison=before.map(b=>{const a=after.find(a=>a.state===b.state&&a.viewport[0]===b.viewport[0]);const result={state:b.state,viewport:b.viewport,nationalExact:b.camera===a.camera};if(b.state==='local'){const l=JSON.parse(b.local).flat(),r=JSON.parse(a.local).flat();result.localMaxDegreeDelta=Math.max(...l.map((v,i)=>Math.abs(v-r[i])));result.localWithinHalfScreenPixel=result.localMaxDegreeDelta/Math.abs(l[2]-l[0])*b.viewport[0]<.5;}return result;});
await fs.writeFile(root+'camera-comparison.json',JSON.stringify(cameraComparison,null,2));
function lum(hex){const c=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
const contrasts=[];for(const foreground of ['#2e3430','#60685e','#506553','#8d5044'])for(const background of ['#f4f0e6','#fcfaf4']){const a=lum(foreground),b=lum(background);contrasts.push({foreground,background,ratio:Number(((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2))});}
await fs.writeFile(root+'text-contrast.json',JSON.stringify(contrasts,null,2));
function dimensions(bytes){
 if(bytes.subarray(1,4).toString()==='PNG')return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),format:'PNG'};
 if(bytes[0]===255&&bytes[1]===216){let i=2;while(i<bytes.length){if(bytes[i++]!==255)continue;while(bytes[i]===255)i++;const marker=bytes[i++];if(marker===216||marker===217)continue;const length=bytes.readUInt16BE(i);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return {width:bytes.readUInt16BE(i+5),height:bytes.readUInt16BE(i+3),format:'JPEG'};i+=length;}}
 throw Error('Unrecognized screenshot encoding');
}
const screenshots=[];for(const filename of (await fs.readdir('docs/screenshots/round4')).filter(f=>f.endsWith('.png'))){const bytes=await fs.readFile('docs/screenshots/round4/'+filename);screenshots.push({filename,...dimensions(bytes),bytes:bytes.length,sha256:hash(bytes)});}
await fs.writeFile(root+'screenshots.json',JSON.stringify(screenshots,null,2));
console.log(JSON.stringify({assets:list.length,screenshots:screenshots.length,cameras:cameraComparison,textContrast:contrasts},null,2));
