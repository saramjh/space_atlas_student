#!/usr/bin/env python3
"""Shared footer contract: structural hierarchy, valid routes and accessibility."""
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
FOOTER = ROOT / "templates" / "footer.html"
EXPECTED = {
    "/solar-system/planet-types/",
    "/moon/phases/",
    "/universe/scale/",
    "/learn/not-to-scale/",
    "/sources/space-resources-for-students/",
    "/updates/",
}
SITE_BASE = "/space_atlas_student"


class Footer(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.links = []
        self.errors = []
        self.navs = 0
        self.footers = 0
        self.wrapper_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = set(attrs.get("class", "").split())
        parents = [c for _, c in self.stack]
        inside = any("site-footer" in cs for cs in parents)
        if tag == "footer":
            self.footers += 1
            if attrs.get("class") != "site-footer":
                self.errors.append("unrecognised footer component")
        elif inside and "site-footer-inner" in classes:
            self.wrapper_count += 1
            if not self.stack or "site-footer" not in self.stack[-1][1]:
                self.errors.append("wrapper must be direct child of footer")
        elif inside and tag == "nav":
            self.navs += 1
            if attrs.get("aria-label") != "Footer navigation":
                self.errors.append("footer nav requires accessible name")
        elif inside and tag == "a":
            if not any("site-footer-inner" in cs for cs in parents):
                self.errors.append("footer link escapes common content wrapper")
            href = attrs.get("href", "")
            self.links.append(href)
            if href.startswith("https://") and (
                "noopener" not in attrs.get("rel", "").split()
                or "noreferrer" not in attrs.get("rel", "").split()
            ):
                self.errors.append("external new-tab link missing rel protection")
        if inside and tag not in ("footer", "div", "p", "nav", "h2", "a", "span"):
            self.errors.append(f"unexpected footer element {tag}")
        self.stack.append((tag, classes))

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1][0] != tag:
            self.errors.append(f"misnested closing element {tag}")
        elif self.stack:
            self.stack.pop()


def check():
    base = FOOTER.read_text(encoding="utf-8")
    expected_links = {SITE_BASE + path for path in EXPECTED}
    assert "{{BASE}}" in base
    for page in sorted(PUBLIC.rglob("index.html")):
        html = page.read_text(encoding="utf-8")
        assert html.count('<footer class="site-footer">') == 1, page
        fragment = html.split('<footer class="site-footer">', 1)[1].split("</footer>", 1)[0]
        checker = Footer()
        checker.feed('<footer class="site-footer">' + fragment + "</footer>")
        assert checker.footers == 1 and checker.wrapper_count == 1 and checker.navs == 1, page
        assert not checker.errors, f"{page}: {checker.errors}"
        actual = set(checker.links)
        assert expected_links.issubset(actual), f"{page}: missing {expected_links-actual}"
        assert sum(link == f"{SITE_BASE}/updates/" for link in checker.links) == 1, page
        assert len(checker.links) == len(set(checker.links)), f"{page}: duplicate footer destinations"
        for href in checker.links:
            if href.startswith(SITE_BASE + "/"):
                target = PUBLIC / href[len(SITE_BASE):].lstrip("/") / "index.html"
                assert target.is_file(), f"{page}: broken footer route {href}"
        assert "footer-grid" not in fragment and "footer-update-link" not in fragment, page
    css = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")
    assert ".site-footer-nav" in css and "@media(max-width:760px){.site-footer" in css
    assert ".footer-update-link{" not in css and ".footer-grid{" not in css
    print(f"Shared footer hierarchy, scoped links, canonical routes and semantics PASS across {len(list(PUBLIC.rglob('index.html')))} pages")


if __name__ == "__main__":
    check()
