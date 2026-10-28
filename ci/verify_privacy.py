#!/usr/bin/env python3
"""Public, truthful Space Atlas data-use disclosure build contract (not a legal-compliance certificate)."""
import json
from pathlib import Path
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
PUB=ROOT/'public'
notice=PUB/'privacy/index.html'
assert notice.is_file(), 'missing published /privacy/ route'
html=notice.read_text(encoding='utf8')
for phrase in ('Google Analytics 4','Google AdSense','cookies','privacy','contact','children','Google'):
 assert phrase.lower() in html.lower(),f'notice must honestly describe {phrase}'
assert 'https://policies.google.com/technologies/partner-sites' in html,'Google partner-data disclosure link missing'
assert 'adsbygoogle.js' not in html, 'privacy notice must not serve AdSense placements'
assert 'data-ad-slot=' not in html,'notice must not have ads'
meta=json.loads((ROOT/'pages/privacy/meta.json').read_text())
assert meta['adFree'] is True and meta['excludeFromTopicSearch'] is True
assert meta['pageType']=='WebPage'
for path in PUB.rglob('index.html'):
 page=path.read_text(encoding='utf8')
 assert page.count('href="/space_atlas_student/privacy/"')==1,f'privacy footer must appear once: {path}'
sitemap=(PUB/'sitemap.xml').read_text(encoding='utf8')
assert 'https://saramjh.github.io/space_atlas_student/privacy/' in sitemap
assert 'certified COPPA compliant' not in html.lower()
print('PASS: 1 truthful privacy page, global link, sitemap and ad-free notice')
