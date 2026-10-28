#!/usr/bin/env python3
"""TDD gate: bounded, opt-in contribution feedback in lesson footer (not an endorsement)."""
import json
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import build

def require(p, description):
    assert p, description

data_path = ROOT / "data" / "lesson-acknowledgments.json"
require(data_path.is_file(), "curated lesson-level feedback data exists")
data = json.loads(data_path.read_text(encoding="utf-8"))
require(data.get("schemaVersion") == 1, "schema is explicitly versioned")
require("records" in data and "/moon/phases/" in data["records"], "specific lesson owns records")
entries = data["records"]["/moon/phases/"]
require(isinstance(entries,list) and len(entries) >= 2, "at least two independently verified improvements")
for entry in entries:
    require(entry["credit"]["kind"]=="anonymous", "existing private correspondents not named without consent")
    require("name" not in entry and "email" not in entry, "no identifying private fields in public config")
    require(entry["credit"]["label"] and entry["date"] and entry["title"] and entry["change"], "specific credit fields")
require(any("CER" in x["title"] for x in entries),"Moon CER improvement provenance")
require(any("illumination" in x["change"].lower() for x in entries),"Moon scientific model provenance")
built = (ROOT / "public" / "moon" / "phases" / "index.html").read_text(encoding="utf-8")
require('id="lesson-acknowledgments"' in built, "acknowledgment appears in actual built Moon lesson")
require('class="lesson-acknowledgments"' in built, "single compact container")
require('<details' in built.split('id="lesson-acknowledgments"',1)[1][:240], "closed native details used")
require('aria-label="Lesson improvement acknowledgments"' in built, "accessible details section")
require('<summary>' in built.split('id="lesson-acknowledgments"',1)[1][:500], "collapsed one-line summary")
require("See all updates" in built, "full archive linked")
require("/space_atlas_student/updates/" in built,"archive uses correct static base")
require("No endorsement" in built, "editorial advice not represented as endorsement")
require(built.index('id="lesson-acknowledgments"') > built.index('class="section section-last"'), "placed after learning content")
require("Christine Weis" not in built and "Jeff Adkins" not in built, "unapproved personal names never published")
seasons = (ROOT / "public" / "earth" / "seasons" / "index.html").read_text(encoding="utf-8")
require('id="lesson-acknowledgments"' in seasons and 'no-tilt hypothesis' in seasons.lower(), "new actual seasons lesson outcome credited")
require(data["records"]["/earth/seasons/"][0]["credit"]["kind"] == "anonymous", "no unauthorised educator naming")
require('id="lesson-acknowledgments"' not in (ROOT / "public" / "solar-system" / "gravity-and-orbits" / "index.html").read_text(encoding="utf-8"), "unrelated lessons stay untouched")
require(built.count('rel="canonical"')==1 and "application/ld+json" in built, "SEO preserved")
require("adsbygoogle" in built, "original site advertising stays unchanged")
# Renderer must bound lists to three even if many later contributions accumulate.
mock_entries = [dict(entries[0], id=f"example-{n}", title=f"Example {n}") for n in range(10)]
html = build.render_lesson_acknowledgments("/moon/phases/", {"/moon/phases/":mock_entries})
require(html.count("lesson-acknowledgments-item")==3, "only three most recent entries appear, regardless of history size")
require("Example 9" in html and "Example 0" not in html, "sort by date/order newest only")
require("See all updates" in html, "rest available in updates archive")
require(build.render_lesson_acknowledgments("/earth/seasons/", {"/moon/phases/":entries}) == "", "opt-in not global")
try:
    build.render_lesson_acknowledgments("/moon/phases/", {"/moon/phases/":[dict(entries[0], credit={"kind":"named","name":"Private User"})]})
except ValueError:
    pass
else:
    raise AssertionError("named credit without affirmative explicit permission must fail closed")
print("LESSON_ACKNOWLEDGMENTS_PASS: page-scoped, collapsed, max3, privacy, long-term scaling, SEO/ads")
