"""Deterministic JPG colour mapping; never changes geometry, opacity or extent.
Run with a Python environment containing Pillow and numpy (versions recorded).
"""
from pathlib import Path
import json, hashlib, struct
import numpy as np
from PIL import Image, __version__ as pillow_version

root=Path(__file__).resolve().parents[1]
src=root/'public/assets/official-china-gs20232763.jpg'
out=root/'public/assets/china-design-paper-v1.png'
im=Image.open(src).convert('RGB')
a=np.asarray(im,dtype=np.float32)
# Minimum channel measures the darkest existing ink, irrespective of hue.
# Every pixel gets the same monotone mapping; no mask, path deletion or blur.
darkness=(255-a.min(axis=2))/255
paper=np.array([244,240,230],dtype=np.float32)
ink=np.array([80,101,83],dtype=np.float32)
mapped=np.rint(paper+(ink-paper)*darkness[...,None]**0.85).clip(0,255).astype(np.uint8)
Image.fromarray(mapped).save(out,optimize=True)
eps=next((root/'docs/evidence/basemaps/original').glob('*.eps'))
header=eps.read_bytes()[:28]
record={
 'date':'2026-10-06','route':'JPG deterministic monotone colour mapping (restricted derivative)',
 'epsFeasibility':{'existingConverters':[],'headerHex':header.hex(),'binaryPreviewHeader':header[:4].hex()=='c5d0d3c6','postscriptOffset':struct.unpack('<I',header[4:8])[0], 'postscriptBytes':struct.unpack('<I',header[8:12])[0], 'outcome':'Official Ghostscript 10.08.0 download/silent installation rejected by automatic approval policy. No conversion executed, no vector correctness claim.'},
 'input':{'path':str(src.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'dimensions':list(im.size)},
 'output':{'path':str(out.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size,'dimensions':list(im.size)},
 'tools':{'Pillow':pillow_version,'numpy':np.__version__},
 'formula':'d=(255-min(R,G,B))/255; RGB=round([244,240,230]+([80,101,83]-[244,240,230])*d^0.85)',
 'transform':{'xScale':1,'yScale':1,'xOffset':0,'yOffset':0,'oldWidth':5826,'oldHeight':7249},
 'changed':'All source colours mapped into paper/green-ink range; annotation, imprint and borders undergo same mapping.',
 'unchanged':'All 5826x7249 pixels retained at their original locations; no crop, blur, morphology, erasure, alpha transparency or invented geography.',
 'limitation':'No semantic separation; existing city annotations remain dense on zoom. EPS vector route and scale-dependent city labels remain unimplemented.'
}
(root/'docs/evidence/round3/derivative.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
# Comparative QA retains full extent, with scaled copies explicitly for inspection only.
pair=Image.new('RGB',(1166,1450),(244,240,230))
pair.paste(im.resize((583,725)),(0,0));pair.paste(Image.fromarray(mapped).resize((583,725)),(583,0))
pair=pair.crop((0,0,1166,725))
pair.save(root/'docs/evidence/round3/map-colour-comparison.png')
print(json.dumps(record,ensure_ascii=False))
