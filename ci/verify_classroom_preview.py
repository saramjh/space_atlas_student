#!/usr/bin/env python3
"""Contract: temporary teacher preview has no GA4/AdSense tags, no public mutation."""
from pathlib import Path
import os,subprocess,tempfile,hashlib
ROOT=Path(__file__).resolve().parents[1]
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
public_home=ROOT/'public/index.html'
before=digest(public_home) if public_home.exists() else None
with tempfile.TemporaryDirectory(prefix='space-atlas-classroom-test-') as parent:
 dest=Path(parent)/'classroom'
 env={**os.environ,'SITE_BASE':'/space_atlas_student',
   'CLASSROOM_PREVIEW':'1','SITE_OUTPUT_DIR':str(dest),'ADSENSE_ENABLED':'1'}
 res=subprocess.run(['python3','build.py'],cwd=ROOT,env=env,capture_output=True,text=True)
 assert res.returncode==0,(res.stdout+res.stderr)[-1800:]
 pages=list(dest.rglob('index.html'))
 assert len(pages)==29,len(pages)
 assert (dest/'assets/js/eclipse-geometry.js').is_file()
 assert (dest/'assets/vendor/three/build/three.module.js').is_file()
 assert (dest/'assets/vendor/three/build/three.core.js').is_file()
 assert (dest/'assets/vendor/three/examples/jsm/controls/OrbitControls.js').is_file()
 assert (dest/'assets/vendor/three/LICENSE').is_file()
 for path in pages:
  s=path.read_text()
  assert 'googletagmanager.com/gtag' not in s,path
  assert 'https://unpkg.com/three@' not in s,path
  assert '"three": "/space_atlas_student/assets/vendor/three/build/three.module.js"' in s,path
  assert 'G-DTCVV5XRD3' not in s,path
  assert 'adsbygoogle.js' not in s,path
  assert '<ins class="adsbygoogle' not in s,path
  assert 'classroom-preview' in s,path
  assert 'href="/space_atlas_student/teacher-guide.html"' in s,path
  assert '<meta name="robots" content="noindex,nofollow,noarchive"' in s,path
 assert (dest/'moon/eclipses/index.html').is_file()

 teacher=dest/'teacher-guide.html'
 assert teacher.is_file(), 'Printable teacher guide must be bundled in isolated preview'
 guide=teacher.read_text()
 for token in ('Moon Phases','Moon Eclipses','Transit method','Galaxy viewing angle','consent','not conducted','noindex'):
  assert token.lower() in guide.lower(),f'teacher guide missing {token}'
 assert not any(tag in guide.lower() for tag in ('adsbygoogle','googletagmanager','<script','<form','https://'))
 assert 'class="tally-scroll"' in guide and 'overflow-x:auto' in guide
 assert 'id="eclipseNode"' in (dest/'moon/eclipses/index.html').read_text()
 assert before==digest(public_home),'Classroom build touched production public tree'
 print('CLASSROOM_PREVIEW_PASS',len(pages),'pages no GA4/AdSense tags, noindex, public unchanged')
