"""Exact local Round 13 dist archive, preserved if already created."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json, zipfile
root = Path.cwd().resolve()
dist = root / 'dist'
target = root / 'releases' / '诗文山河_第十三轮静态包_2026-10-08.zip'
assert target.resolve().parent == (root / 'releases').resolve()
files = sorted(p for p in dist.rglob('*') if p.is_file())
assert (dist / 'index.html') in files
target.parent.mkdir(exist_ok=True)
if not target.exists():
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for p in files:
            archive.write(p, p.relative_to(dist).as_posix())
entries = []
with zipfile.ZipFile(target) as archive:
    assert sorted(archive.namelist()) == sorted(p.relative_to(dist).as_posix() for p in files)
    for p in files:
        name = p.relative_to(dist).as_posix()
        original, packed = p.read_bytes(), archive.read(name)
        assert original == packed, name
        entries.append({'path': name, 'bytes': len(original), 'sha256': sha256(original).hexdigest(), 'identical': True})
digest = sha256(target.read_bytes()).hexdigest()
target.with_suffix('.sha256.txt').write_text(f'{digest}  {target.name}\n', encoding='utf-8')
record = {'at': datetime.now(timezone.utc).isoformat(), 'zip': target.relative_to(root).as_posix(), 'bytes': target.stat().st_size, 'sha256': digest, 'fileCount': len(files), 'rootIndex': True, 'fileSetIdentical': True, 'allBytesIdentical': True, 'files': entries, 'usage': 'local learning prototype; map publication permission pending', 'deployment': 'no commit, push or public hosting'}
(root / 'docs/evidence/round13/release.json').write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({k: record[k] for k in ['zip', 'bytes', 'sha256', 'fileCount', 'allBytesIdentical']}, ensure_ascii=False))
