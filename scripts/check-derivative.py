from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'docs/evidence/round3/derivative.json').read_text(encoding='utf-8'))
src=Image.open(root/manifest['input']['path']).convert('RGB')
out=Image.open(root/manifest['output']['path']).convert('RGB')
assert src.size==out.size==(5826,7249)
rows=0
for y in range(0,src.height,128):
 region=(0,y,src.width,min(y+128,src.height))
 a=np.asarray(src.crop(region),dtype=np.float32)
 d=(255-a.min(axis=2))/255
 expected=np.rint(np.array([244,240,230],dtype=np.float32)+(np.array([80,101,83],dtype=np.float32)-np.array([244,240,230],dtype=np.float32))*d[...,None]**0.85).clip(0,255).astype(np.uint8)
 assert np.array_equal(expected,np.asarray(out.crop(region))),f'Pixel correspondence mismatch at row {y}'
 rows+=expected.shape[0]
assert rows==7249
assert hashlib.sha256((root/manifest['output']['path']).read_bytes()).hexdigest()==manifest['output']['sha256']
record={'date':'2026-10-06','passed':True,'checkedPixels':5826*7249,'mapping':'Same monotone RGB mapping at every original pixel; no positions, borders, island or label pixels selectively removed','dimensions':[5826,7249],'semanticLayerSeparation':False,'vectorConversionVerified':False}
(root/'docs/evidence/round3/derivative-check.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(record,ensure_ascii=False))
