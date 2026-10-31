#!/usr/bin/env python3
"""Validate built metadata against authored content, not only tag presence."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import xml.etree.ElementTree as ET

PREFIX = "https://saramjh.github.io/space_atlas_student/"
PUBLIC = Path("public")


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.metas = {}
        self.canonical = []
        self.title = ""
        self._in_head = False
        self._title = False
        self._jsonld = False
        self.jsonld = ""
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag == "head":
            self._in_head = True
        if tag == "meta":
            key = props.get("name") or props.get("property")
            if key:
                if key in self.metas:
                    raise AssertionError(f"Duplicate meta {key}")
                self.metas[key] = (props.get("content"), props)
        elif tag == "link" and props.get("rel") == "canonical":
            self.canonical.append(props.get("href"))
        elif tag == "title" and self._in_head:
            self._title = True
        elif tag == "script" and props.get("type") == "application/ld+json":
            self._jsonld = True
        elif tag == "h1":
            self.h1 += 1

    def handle_data(self, data):
        if self._title:
            self.title += data
        if self._jsonld:
            self.jsonld += data

    def handle_endtag(self, tag):
        if tag == "title":
            self._title = False
        if tag == "head":
            self._in_head = False
        if tag == "script":
            self._jsonld = False


source_pages = sorted(Path("pages").rglob("meta.json"))
canonical_urls = set()
for path in source_pages:
    meta = json.loads(path.read_text(encoding="utf-8"))
    rel = meta["path"].lstrip("/")
    file = PUBLIC / rel / "index.html"
    assert file.is_file(), f"Missing output {file}"
    parsed = Head()
    parsed.feed(file.read_text(encoding="utf-8"))
    canonical = meta["canonical"]
    assert parsed.title == meta["title"], f"{rel}: title altered"
    assert parsed.h1 == 1, f"{rel}: H1 count {parsed.h1}"
    assert parsed.canonical == [canonical], f"{rel}: canonical mismatch"
    assert parsed.metas["description"][0] == meta["description"], f"{rel}: truncated/malformed description {parsed.metas['description']}"
    assert set(parsed.metas["description"][1]) == {"name", "content"}, f"{rel}: broken meta attribute quoting"
    for og_name, source_key in (
        ("og:url", "canonical"),
        ("og:title", "ogTitle"),
        ("og:description", "ogDescription"),
        ("og:image", "ogImage"),
    ):
        assert parsed.metas[og_name][0] == meta[source_key], f"{rel}: {og_name} mismatch"
    assert "noindex" not in (parsed.metas.get("robots", ("",))[0] or ""), f"{rel}: noindex"
    data = json.loads(parsed.jsonld)
    assert data["@context"] == "https://schema.org"
    graph = data["@graph"]
    # FAQ markup was previously generated from answers absent from visible page text.
    # Do not reinstate hidden FAQ rich-result claims without explicit visible Q&A.
    assert all(node.get("@type") != "FAQPage" for node in graph), f"{rel}: unsupported FAQPage markup"
    typ = meta.get("pageType", "LearningResource")
    resources = [node for node in graph if node.get("@type") == typ]
    assert len(resources) == 1, f"{rel}: expected one {typ}"
    resource = resources[0]
    assert resource["url"] == canonical and resource["name"] == meta["jsonldName"], f"{rel}: JSON-LD identity mismatch"
    assert resource["description"] == meta["jsonldDescription"], f"{rel}: JSON-LD explanation mismatch"
    assert canonical.startswith(PREFIX), f"{rel}: wrong canonical host/prefix"
    assert canonical not in canonical_urls, f"Duplicate canonical {canonical}"
    canonical_urls.add(canonical)

sitemap = ET.parse(PUBLIC / "sitemap.xml")
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
locations = [element.text for element in sitemap.findall(".//s:loc", ns)]
assert len(locations) == len(set(locations)) == len(canonical_urls) == 30, "Sitemap duplicates or missing pages"
assert set(locations) == canonical_urls, "Sitemap URLs disagree with canonical pages"
robots = (PUBLIC / "robots.txt").read_text(encoding="utf-8")
assert f"Sitemap: {PREFIX}sitemap.xml" in robots, "Project robots copy must reference correct sitemap"
assert "Disallow: /" not in robots, "Project robots disallows all"
print(f"SEO/GEO authored-to-built metadata PASS: {len(canonical_urls)} titles, descriptions, OG tags, JSON-LD and canonical/sitemap URLs.")
