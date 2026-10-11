#!/usr/bin/env python3
"""Read-only navigation + contextual learning-flow + sitemap integrity contract.

Navigation elements and sitemap exposure are not evidence of search ranking.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "pages"
PUBLIC = ROOT / "public"
BASE = "/space_atlas_student"
DOMAIN = "https://saramjh.github.io"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
CATEGORIES = {
    "Solar System": "topics-solar-system",
    "Earth & Moon": "topics-earth-moon",
    "Deep Space": "topics-deep-space",
    "Guides": "topics-guides",
}

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.ids = set()
        self.links = []
        self.h1_count = 0
        self.canonicals = []
        self.current_link = None
        self.breadcrumb_current = 0
        self.breadcrumb_nav = 0
        self.breadcrumb_category = []
        self.mobile_all = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set(attrs.get("class", "").split())
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "h1":
            self.h1_count += 1
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "nav" and "breadcrumb-wrap" in classes:
            if attrs.get("aria-label") == "Breadcrumb":
                self.breadcrumb_nav += 1
        if attrs.get("aria-current") == "page" and "breadcrumb-current" in classes:
            self.breadcrumb_current += 1
        if tag == "a":
            section = next((name for name in ("main", "header", "footer")
                            if any(node[0] == name for node in self.stack)), "other")
            self.current_link = (attrs.get("href", ""), section, classes)
            if "breadcrumb-category" in classes:
                self.breadcrumb_category.append(attrs.get("href"))
            if "nav-mobile-all" in classes:
                self.mobile_all.append(attrs.get("href"))
        if tag not in VOID:
            self.stack.append((tag, classes))

    def handle_endtag(self, tag):
        if tag == "a" and self.current_link is not None:
            self.links.append(self.current_link)
            self.current_link = None
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        elif any(node[0] == tag for node in self.stack):
            # HTML is not guaranteed structurally valid; unwind to the last open tag.
            pos = max(i for i, node in enumerate(self.stack) if node[0] == tag)
            del self.stack[pos:]

def source_route(path):
    relative = path.relative_to(PUBLIC).as_posix()
    return "/" if relative == "index.html" else "/" + relative[:-len("index.html")]

def parse_site_ref(href):
    bits = urlsplit(href)
    if bits.netloc and f"{bits.scheme}://{bits.netloc}" != DOMAIN:
        return None
    if not bits.path.startswith(BASE + "/") and bits.path not in ("", BASE):
        return None
    path = bits.path[len(BASE):] if bits.path else ""
    return path or "/", bits.fragment

def main():
    documents = {}
    for p in PUBLIC.rglob("index.html"):
        route = source_route(p)
        parsed = PageParser()
        parsed.feed(p.read_text(encoding="utf-8"))
        documents[route] = parsed
    assert len(documents) == 28, f"expected 27 lessons and public updates, got {len(documents)}"
    assert len(set(documents)) == len(documents)
    home = documents["/"]
    for anchor in ("atlas-directory", *CATEGORIES.values()):
        assert anchor in home.ids, f"missing real homepage category anchor {anchor}"

    topic_pages = set(documents) - {"/", "/updates/"}
    assert len(topic_pages) == 26
    inbound = Counter()
    main_edges = set()
    broken = []
    for src, doc in documents.items():
        assert doc.h1_count == 1, f"{src}: expected one H1"
        assert doc.canonicals == [DOMAIN + BASE + src], f"{src}: incorrect canonical {doc.canonicals}"
        assert doc.mobile_all == [BASE + "/#atlas-directory"], f"{src}: mobile directory shortcut missing"
        for href, area, _ in doc.links:
            # Same-document fragments resolve against the current page,
            # not the site root. Verify real targets for teacher/updates flows.
            dest = (src, href[1:]) if href.startswith("#") else parse_site_ref(href)
            if dest is None:
                continue
            route, frag = dest
            if route not in documents:
                broken.append((src, href, "missing static page"))
                continue
            if frag and frag not in documents[route].ids:
                broken.append((src, href, "missing fragment target"))
            if area == "main" and route != src and not frag:
                main_edges.add((src, route))
                inbound[route] += 1
        if src in topic_pages:
            assert doc.breadcrumb_nav == 1 and doc.breadcrumb_current == 1, (
                f"{src}: breadcrumb must be an accessible navigation landmark"
            )
            assert len(doc.breadcrumb_category) == 1, f"{src}: category navigation missing"
            category = None
            for name, anchor in CATEGORIES.items():
                if doc.breadcrumb_category == [BASE + "/#" + anchor]:
                    category = name
            assert category, f"{src}: category must point to actual home-directory fragment"
            assert doc.breadcrumb_category[0] in [href for href, area, _ in doc.links if area == "main"]
        assert not (src in topic_pages and not any(a == "main" for _, a, _ in doc.links)), (
            f"{src}: no contextual links"
        )

    assert not broken, f"broken static links / anchor targets: {broken[:20]}"
    missing_inbound = sorted(topic_pages - set(inbound))
    assert not missing_inbound, f"unrecommended topics: {missing_inbound}"

    duplicates = []
    source_pages = [p for p in PAGES.rglob("content.html")
                    if p.relative_to(PAGES).as_posix() not in {"index/content.html", "updates/content.html"}]
    for p in source_pages:
        html = p.read_text(encoding="utf-8")
        parts = re.findall(r'<section class="section section-last">([\s\S]*?)</section>', html)
        if not parts:
            duplicates.append((str(p), "missing final learning journey section"))
            continue
        linked = re.findall(r'<article class="step(?: next-series-card)?"[^>]*>(.*?)</article>', parts[-1], re.S)
        topic_links = [
            u for card in linked
            for u in re.findall(r'href="\{\{BASE\}\}(/[^"#?]+)', card)
        ]
        counts = Counter(topic_links)
        duplicates.extend((str(p), f"repeated related recommendation: {url}")
                          for url, n in counts.items() if n > 1)
    assert not duplicates, f"duplicate conceptual recommendations: {duplicates}"

    sitemap = ET.parse(PUBLIC / "sitemap.xml")
    listed = [el.text for el in sitemap.findall(
        "{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    expected = {DOMAIN + BASE + route for route in documents}
    assert set(listed) == expected and len(listed) == len(expected), (
        f"sitemap/canonical mismatch: {set(listed)^expected}"
    )
    assert any(u.startswith(BASE + "/#topics-") for d in documents.values()
               for u, area, _ in d.links if area == "main"), "no contextual category hierarchy"
    # These are user-visible category anchors, not fictional indexable category
    # hub pages. Retain correct root -> canonical page BreadcrumbList JSON-LD.
    assert len(main_edges) >= 125, f"contextual links unexpectedly collapsed: {len(main_edges)}"
    print(
        f"Navigation/user-flow PASS: {len(documents)} indexable pages, "
        f"{len(topic_pages)} topic pages, {len(main_edges)} distinct contextual edges, "
        "0 broken routes/fragments, 0 orphan lessons, 0 duplicate 'Go deeper' destinations, "
        "26 functional category crumbs, homepage directory and matching sitemap."
    )

if __name__ == "__main__":
    main()
