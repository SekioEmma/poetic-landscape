from pathlib import Path
import json,hashlib,numpy as np
from PIL import Image
root=Path.cwd();outdir=root/'docs/evidence/round5';src=root/'public/assets/official-china-gs20232763.jpg'
a=np.asarray(Image.open(src).convert('RGB'));paper=np.array([244,240,230]);records=[]
for name,power,ink in [('a',1.08,[70,87,83]),('b',1.22,[65,82,82])]:
 lut=np.rint(paper+(np.array(ink)-paper)*((255-np.arange(256))/255)[:,None]**power).astype('uint8')
 out=root/f'public/assets/china-design-paper-v5{name}.png' if name=='a' else outdir/'china-design-paper-v5b.png';mapped=lut[a.min(axis=2)];Image.fromarray(mapped).save(out,optimize=True)
 verified=all(np.array_equal(np.asarray(Image.open(out).convert('RGB'))[y],lut[a[y].min(axis=1)]) for y in range(0,7249,97))
 records.append({'candidate':name,'input':{'path':str(src.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(src.read_bytes()).hexdigest()},'output':{'path':str(out.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size,'dimensions':[5826,7249]},'formula':f'd=(255-min(R,G,B))/255; RGB=round([244,240,230]+({ink}-[244,240,230])*d^{power})','power':power,'ink':ink,'transform':{'xScale':1,'yScale':1,'xOffset':0,'yOffset':0,'oldWidth':5826,'oldHeight':7249},'sampleRowsVerified':verified,'limitation':'Uniform monotone colour mapping only. No layer separation, geometry changes, mask, blur, alpha or erasure.'})
(outdir/'map-candidates.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print([(r['candidate'],r['output']['sha256']) for r in records])
