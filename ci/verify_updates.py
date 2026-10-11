#!/usr/bin/env python3
"""Release publication and audience-specific HTML regression gate."""
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
records = json.loads((ROOT / "data/releases.json").read_text(encoding="utf-8"))["releases"]
html = (PUBLIC / "updates/index.html").read_text(encoding="utf-8")
index = (PUBLIC / "index.html").read_text(encoding="utf-8")
search = json.loads((PUBLIC / "assets/search-index.json").read_text(encoding="utf-8"))

class Doc(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.ids = []
        self.times = []
        self.details = 0
        self.h1 = 0
        self.jsonld = []
        self.in_script = False
        self.buf = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "a":
            self.hrefs.append(data.get("href", ""))
        if "id" in data:
            self.ids.append(data["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "time":
            self.times.append(data.get("datetime"))
        if tag == "details":
            self.details += 1
        if tag == "script" and data.get("type") == "application/ld+json":
            self.in_script = True
            self.buf = []
    def handle_data(self, data):
        if self.in_script:
            self.buf.append(data)
    def handle_endtag(self, tag):
        if self.in_script and tag == "script":
            self.jsonld.append(json.loads("".join(self.buf)))
            self.in_script = False

parse = Doc()
parse.feed(html)
errors = []
def require(condition, message):
    if not condition:
        errors.append(message)

require(len(records) >= 1, "missing releases")
require(parse.h1 == 1, f"expected H1 exactly once, got {parse.h1}")
require(len(parse.times) == len(records), "one time element per milestone")
require(parse.details == len(records), "each release needs accessible technical disclosure")
require(len(set(parse.ids)) == len(parse.ids), "duplicate ids")
require(len(parse.jsonld) == 1, "exactly one JSON-LD")
if parse.jsonld:
    graph = parse.jsonld[0].get("@graph", [])
    collections = [x for x in graph if x.get("@type") == "CollectionPage"]
    require(len(collections) == 1, "updates must be CollectionPage, not LearningResource")
    require(not any(x.get("@type") == "LearningResource" for x in graph), "release notes mislabeled as lessons")
    if collections:
        require(collections[0].get("url") ==
                "https://saramjh.github.io/space_atlas_student/updates/", "canonical mismatch")
        require(collections[0].get("dateModified") == records[0]["date"], "lastmod must be latest release date")
require("ad-slot" not in html and "adsbygoogle.js" not in html, "release page must be ad-free")
require(len(search) == 27 and all(x["path"] != "/updates/" for x in search),
        "release page incorrectly included in lesson search")
require("27 topics" in index or 'Search <kbd>/</kbd>' in index, "learning search placeholder changed")
require('class="home-update-note"' in index and '/updates/' in index, "home release entry missing")
require("id=\"for-learners\"" in html and "id=\"for-educators\"" in html and
        "id=\"for-builders\"" in html, "reader pathways missing")
require("{{RELEASE_TIMELINE}}" not in html, "unresolved build placeholder")
require('rel="canonical"' in html, "missing canonical")
for r in records:
    require(f'id="release-{r["id"]}"' in html, f"missing milestone {r['id']}")
    require(r["date"] in parse.times, f"missing release date {r['date']}")
    for c in r["commits"]:
        require(f"/commit/{c}" in html, f"missing traceable commit {c}")
    for link in r["links"]:
        require(link["path"] in html, f"missing topic link {link['path']}")
        require((PUBLIC / link["path"].lstrip("/") / "index.html").is_file(),
                f"target topic not generated: {link['path']}")
for href in parse.hrefs:
    if href.startswith(("/space_atlas_student/", "/")) and not href.startswith("//"):
        clean = href.split("#")[0].replace("/space_atlas_student/", "", 1).lstrip("/")
        require((PUBLIC / clean / "index.html").is_file() or (PUBLIC / clean).is_file(),
                f"broken local link {href}")
sitemap = (PUBLIC / "sitemap.xml").read_text(encoding="utf-8")
require(sitemap.count("<url>") == 28, "28 public sitemap pages required")
require("<loc>https://saramjh.github.io/space_atlas_student/updates/</loc>" in sitemap,
        "sitemap missing release page")
for entry in PUBLIC.rglob("index.html"):
    contents = entry.read_text(encoding="utf-8")
    require('class="site-footer"' in contents and
            'class="site-footer-nav" aria-label="Footer navigation"' in contents and
            'href="/space_atlas_student/updates/"' in contents,
            f"accessible shared footer or updates link missing on {entry}")
if errors:
    print("Release history gate FAILED:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print(f"Release history gate PASS: {len(records)} verified milestones, 27 lessons, 1 updates CollectionPage")
