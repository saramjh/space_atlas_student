#!/usr/bin/env python3
"""Dependency-free regression gate for generated Space Atlas output."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys

PUBLIC = Path("public")
SOURCE_PAGES = Path("pages")
SITE_PREFIX = "/space_atlas_student"


class AuditParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.images = []
        self.h1 = 0
        self.jsonld = []
        self._jsonld = False
        self._buf = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if data.get("id"):
            self.ids.append(data["id"])
        if tag == "a" and data.get("href"):
            self.links.append(data["href"])
        if tag == "img":
            self.images.append(data)
        if tag == "h1":
            self.h1 += 1
        if tag == "script" and data.get("type") == "application/ld+json":
            self._jsonld = True
            self._buf = []

    def handle_data(self, data):
        if self._jsonld:
            self._buf.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._jsonld:
            self.jsonld.append("".join(self._buf))
            self._jsonld = False
            self._buf = []


def local_target(page, href):
    clean = href.split("#", 1)[0].split("?", 1)[0]
    if not clean or clean.startswith(("http://", "https://", "mailto:", "tel:", "javascript:")):
        return None
    if clean.startswith(SITE_PREFIX):
        clean = clean[len(SITE_PREFIX):] or "/"
    if clean.startswith("/"):
        return PUBLIC / clean.lstrip("/")
    return page.parent / clean


errors = []
pages = sorted(PUBLIC.rglob("index.html"))
if len(pages) != 27:
    errors.append(f"expected 27 generated pages, got {len(pages)}")

# Production builds contain the AdSense loader; local/default builds deliberately do not.
# When monetization is enabled, keep the site on the controlled one-slot contract.
monetized = any(
    "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" in page.read_text(encoding="utf-8")
    for page in pages
)

teacher_experiment_pages = {
    "earth/seasons/index.html",
    "moon/phases/index.html",
    "universe/scale/index.html",
}
teacher_helper = PUBLIC / "assets" / "js" / "teacher-distribution.js"
if not teacher_helper.exists():
    errors.append("missing teacher-distribution.js experiment helper")
else:
    helper_text = teacher_helper.read_text(encoding="utf-8")
    for event_name in ("model_interact", "evidence_open", "classroom_share"):
        if event_name not in helper_text:
            errors.append(f"teacher-distribution.js: missing {event_name} event")

secondary_pages = set()
for meta_path in SOURCE_PAGES.rglob("meta.json"):
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    if not meta.get("secondaryAd"):
        continue
    path = meta.get("path", "/")
    rel = "index.html" if path == "/" else f"{path.strip('/')}/index.html"
    secondary_pages.add(rel)

for page in pages:
    text = page.read_text(encoding="utf-8")
    rel = page.relative_to(PUBLIC)
    if re.search(r"\{\{[A-Z_]+\}\}", text):
        errors.append(f"{rel}: unresolved template token")

    is_teacher_experiment = rel.as_posix() in teacher_experiment_pages
    if is_teacher_experiment:
        if text.count('class="section teacher-use-section"') != 1:
            errors.append(f"{rel}: expected one teacher-use experiment section")
        if text.count('data-growth-model') != 1:
            errors.append(f"{rel}: expected one tracked model")
        if text.count('data-teacher-share') != 1:
            errors.append(f"{rel}: expected one Classroom share control")
        if text.count('id="evidence"') != 1:
            errors.append(f"{rel}: expected one evidence anchor")
    elif 'teacher-use-section' in text or 'data-teacher-share' in text:
        errors.append(f"{rel}: teacher experiment leaked to a non-target page")

    if monetized:
        if text.count("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js") != 1:
            errors.append(f"{rel}: expected one AdSense loader")
        primary_count = text.count('data-ad-slot="2983244729"')
        secondary_count = text.count('data-ad-slot="1670163057"')
        expected_secondary = rel.as_posix() in secondary_pages
        if primary_count != 1:
            errors.append(f"{rel}: expected one primary AdSense unit")
        if secondary_count != int(expected_secondary):
            errors.append(
                f"{rel}: expected {int(expected_secondary)} secondary AdSense unit(s), "
                f"got {secondary_count}"
            )
        if 'data-ad-format=' in text:
            errors.append(f"{rel}: exact-size AdSense units must not use data-ad-format")
        if 'data-full-width-responsive=' in text:
            errors.append(
                f"{rel}: exact-size AdSense units must not use data-full-width-responsive"
            )
        if text.count('class="adsbygoogle space_atlas_ad_primary"') != 1:
            errors.append(f"{rel}: expected one exact-size primary ad class")
        expected_secondary_class = int(expected_secondary)
        if text.count('class="adsbygoogle space_atlas_ad_secondary"') != expected_secondary_class:
            errors.append(
                f"{rel}: expected {expected_secondary_class} exact-size secondary ad class(es)"
            )

    parser = AuditParser()
    parser.feed(text)

    duplicates = [value for value, count in Counter(parser.ids).items() if count > 1]
    if duplicates:
        errors.append(f"{rel}: duplicate ids {duplicates}")
    if parser.h1 != 1:
        errors.append(f"{rel}: expected one h1, got {parser.h1}")
    for image in parser.images:
        if "alt" not in image:
            errors.append(f"{rel}: image missing alt: {image.get('src')}")

    for href in parser.links:
        target = local_target(page, href)
        if target is None:
            continue
        if not (target.exists() or (target / "index.html").exists() or target.with_suffix(".html").exists()):
            errors.append(f"{rel}: broken internal link {href}")

    if len(parser.jsonld) != 1:
        errors.append(f"{rel}: expected one JSON-LD graph, got {len(parser.jsonld)}")
        continue

    try:
        data = json.loads(parser.jsonld[0])
    except Exception as exc:
        errors.append(f"{rel}: invalid JSON-LD: {exc}")
        continue

    graph = data.get("@graph", [])
    resources = [item for item in graph if item.get("@type") == "LearningResource"]
    if len(resources) != 1:
        errors.append(f"{rel}: expected one LearningResource")
    elif not resources[0].get("learningResourceType"):
        errors.append(f"{rel}: missing learningResourceType")

    if rel != Path("index.html") and not any(item.get("@type") == "BreadcrumbList" for item in graph):
        errors.append(f"{rel}: missing BreadcrumbList")

if errors:
    print("Space Atlas regression gate FAILED:")
    for error in errors:
        print(" -", error)
    sys.exit(1)

print(f"Space Atlas regression gate passed: {len(pages)} pages")
