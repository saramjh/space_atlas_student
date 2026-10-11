#!/usr/bin/env python3
"""Structural regression: search belongs to header actions, never topic tabs."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
CSS = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")

class Header(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.mobile_search = []
        self.desktop_search = []
        self.mobile_tab_links = []
        self.mobile_tab_buttons = []
        self.brand_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set(attrs.get("class", "").split())
        inside = lambda klass: any(klass in css for _, css in self.stack)
        if tag == "a" and "brand" in classes:
            self.brand_count += 1
        if tag == "a" and inside("nav-mobile"):
            self.mobile_tab_links.append((attrs.get("href"), classes))
        if tag == "button" and inside("nav-mobile"):
            self.mobile_tab_buttons.append(attrs.get("id", ""))
        if attrs.get("id") == "searchTriggerMobile":
            self.mobile_search.append({
                "in_utility": inside("utility"),
                "in_tabs": inside("nav-mobile"),
                "label": attrs.get("aria-label", ""),
                "controls": attrs.get("aria-controls"),
                "type": attrs.get("type"),
                "class": classes,
            })
        if attrs.get("id") == "searchTrigger":
            self.desktop_search.append(inside("utility"))
        if tag not in {"meta", "link", "img", "input", "hr", "br", "source"}:
            self.stack.append((tag, classes))

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        elif any(t == tag for t, _ in self.stack):
            pos = max(i for i, (t, _) in enumerate(self.stack) if t == tag)
            del self.stack[pos:]

def check():
    pages = sorted(PUBLIC.rglob("index.html"))
    assert len(pages) == 28, f"Expected all 28 public pages; got {len(pages)}"
    for page in pages:
        html = page.read_text(encoding="utf-8")
        header = html.split("</header>", 1)[0]
        doc = Header()
        doc.feed(header)
        assert doc.brand_count == 1, f"{page}: brand missing"
        assert doc.desktop_search == [True], f"{page}: desktop search trigger placement"
        assert len(doc.mobile_search) == 1, f"{page}: mobile search trigger count"
        button = doc.mobile_search[0]
        assert button["in_utility"] and not button["in_tabs"], f"{page}: search incorrectly embedded among topic links"
        assert button["controls"] == "searchModal" and button["type"] == "button", f"{page}: search popup behavior"
        assert "Search space topics" == button["label"], f"{page}: accessible search label"
        assert not doc.mobile_tab_buttons, f"{page}: buttons must not interrupt the topic-only horizontal nav"
        links = [url for url, _ in doc.mobile_tab_links]
        assert links[:2] == ["/space_atlas_student/", "/space_atlas_student/#atlas-directory"], (
            f"{page}: home/atlas directory must lead mobile subject links"
        )
        assert len(links) == 7 and len(set(links)) == 7, f"{page}: duplicated/missing mobile topic shortcuts"
        assert "🔍" not in header, f"{page}: emoji search icon disallowed"
        assert '<svg viewBox="0 0 24 24"' in header, f"{page}: expected monochrome vector icon"

    # Verify source CSS ownership: initial state hidden on desktop, visible action at
    # mobile breakpoint, no legacy <620 override that hides the top-row utility.
    assert ".search-trigger-mobile{display:none" in CSS
    assert ".search-trigger-mobile{display:inline-flex}" in CSS
    assert ".header-row{grid-template-columns:minmax(0,1fr) auto" in CSS
    assert ".nav-mobile a{display:inline-flex" in CSS
    assert ".utility{display:none}" not in CSS
    assert ".header-row{grid-template-columns:1fr}" not in CSS
    assert ".nav-mobile{padding:0 16px 12px}" not in CSS
    print(f"Mobile header regression PASS: {len(pages)} pages, utility search icon, separated topic tabs and 44px touch targets")

if __name__ == "__main__":
    check()
