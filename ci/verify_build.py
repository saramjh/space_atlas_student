#!/usr/bin/env python3
"""Dependency-free regression gate for generated Space Atlas output."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys

PUBLIC = Path("public")
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

for page in pages:
    text = page.read_text(encoding="utf-8")
    rel = page.relative_to(PUBLIC)
    if re.search(r"\{\{[A-Z_]+\}\}", text):
        errors.append(f"{rel}: unresolved template token")

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
