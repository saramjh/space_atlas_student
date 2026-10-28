#!/usr/bin/env python3
"""A direct, accessible, teacher-led no-tilt experiment, not a claim of use."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
page=(root/'pages/earth/seasons/content.html').read_text(encoding='utf-8')
built=(root/'public/earth/seasons/index.html').read_text(encoding='utf-8')
handout=root/'assets/handouts/earth-seasons-no-tilt.html'
assert handout.is_file(), 'separate static, self-contained lesson handout required'
printable=handout.read_text(encoding='utf-8')
assert 'id="noTiltTeacherTest"' in page
assert '<details' in page[page.index('id="noTiltTeacherTest"')-150:page.index('id="noTiltTeacherTest"')+100]
assert '<summary>' in page[page.index('id="noTiltTeacherTest"'):page.index('id="noTiltTeacherTest"')+310]
assert 'Prediction' in page and 'Evidence' in page and 'Reasoning' in page
assert '23.5' in page and '0° tilt' in page
assert 'June' in page and 'December' in page
assert 'lamp' in page.lower() and 'globe' in page.lower()
assert 'same direction' in page.lower() and 'teacher' in page.lower()
assert 'orbit' in page.lower() and 'not to scale' in page.lower()
assert 'href="{{BASE}}/assets/handouts/earth-seasons-no-tilt.html"' in page
assert 'id="noTiltTeacherTest"' in built
assert '/space_atlas_student/assets/handouts/earth-seasons-no-tilt.html' in built
assert (root/'public/assets/handouts/earth-seasons-no-tilt.html').is_file()
assert 'rel="canonical"' in built and 'application/ld+json' in built
assert 'adsbygoogle' in built
assert '<meta name="robots" content="noindex"' in printable
assert '<style>' in printable and '@media print' in printable and '@page' in printable
for val in ('Teacher guide','Student worksheet','Claim','Evidence','Reasoning','23.5','zero tilt','LED lamp','June','December','not classroom-tested'):
 assert val.lower() in printable.lower(),val
for bad in ('<script','<iframe','google-analytics','googletagmanager','adsbygoogle','src="https:','href="https://saramjh.github.io'):
 assert bad not in printable, bad
ack=json.loads((root/'data/lesson-acknowledgments.json').read_text(encoding='utf-8'))['records']
assert '/earth/seasons/' in ack
assert len(ack['/earth/seasons/'])==1
item=ack['/earth/seasons/'][0]
assert item['credit']['kind']=='anonymous'
assert 'name' not in item['credit']
assert '0°' in item['change']
assert 'id="lesson-acknowledgments"' in built
assert '0°' in built[built.index('id="lesson-acknowledgments"'):]
release=json.loads((root/'data/releases.json').read_text(encoding='utf-8'))['releases'][0]
assert release['id']=='2026-10-28-seasons-zero-tilt-teacher-test'
assert 'eb247f9' in release['commits']
assert any(x['path']=='/earth/seasons/' for x in release['links'])
assert 'no-tilt' in (root/'public/updates/index.html').read_text(encoding='utf-8').lower()
print('SEASONS_NO_TILT_CLASSROOM_GATE_PASS')
