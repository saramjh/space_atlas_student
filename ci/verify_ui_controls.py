#!/usr/bin/env python3
"""Regression gate for native interactive controls and common DOM semantics.

Keeps CSS overrides from making collapsed examples visible or breaking
keyboard-operable controls even when the rest of the static build passes.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PAGES = sorted(PUBLIC.rglob("index.html"))


class Structure(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__()
        self.stack = []
        self.ids = []
        self.controls = []
        self.bad_links = []
        self.nested_buttons = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if "aria-controls" in attrs:
            self.controls.append(attrs["aria-controls"])
        if tag == "a":
            href = attrs.get("href", "")
            if href == "#" or href.lower().startswith("javascript:"):
                self.bad_links.append(href)
        if tag == "button" and "button" in self.stack:
            self.nested_buttons += 1
        if tag not in self.VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.stack:
            index = len(self.stack) - 1 - self.stack[::-1].index(tag)
            del self.stack[index:]


def main():
    assert len(PAGES) == 28, f"expected 28 generated pages, found {len(PAGES)}"
    for page in PAGES:
        parsed = Structure()
        parsed.feed(page.read_text(encoding="utf-8"))
        duplicates = [name for name, amount in Counter(parsed.ids).items() if amount > 1]
        broken = [name for name in parsed.controls if name not in parsed.ids]
        assert not duplicates, f"{page}: duplicate DOM IDs {duplicates}"
        assert not broken, f"{page}: aria-controls targets missing {broken}"
        assert not parsed.bad_links and not parsed.nested_buttons, (
            f"{page}: inert links or nested buttons"
        )

    home = (PUBLIC / "index.html").read_text(encoding="utf-8")
    assert home.count('<details class="truth-disclosure">') == 3
    for match in re.findall(r'<details class="truth-disclosure">(.*?)</details>', home, re.S):
        assert '<summary class="truth-hint">View an example</summary>' in match
        assert '<div class="truth-example">' in match
        assert "open=" not in match, "static disclosure must be closed by default"
    buttons = re.findall(r'<button type="button" class="planet-item[^>]*>.*?</button>', home, re.S)
    assert len(buttons) == 8, f"planet scale button count: {len(buttons)}"
    assert sum('aria-pressed="true"' in b for b in buttons) == 1
    for button in buttons:
        assert 'aria-pressed=' in button and '<span class="ball"' in button
        assert '<div' not in button, "button contents must remain phrasing elements"
    assert 'id="scaleFactBox" role="status" aria-live="polite"' in home

    css = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")
    assert len(re.findall(r'^\.truth-example\{', css, re.M)) == 1
    assert len(re.findall(r'^\.truth-hint\{', css, re.M)) == 1
    assert '.truth.open .truth-example' not in css, "obsolete JS/CSS state mismatch"
    assert '.truth-disclosure:not([open]) > .truth-example,.galaxy-example:not([open]) > .truth-example{display:none}' in css
    assert '.planet-item:focus-visible' in css
    js = (ROOT / "assets/js/interactions.js").read_text(encoding="utf-8")
    assert "initToggleCards" not in js and "scaleFactBox.innerHTML" not in js
    assert "aria-pressed" in js and "scaleFactBox.querySelector" in js

    nav = (ROOT / "templates/nav.html").read_text(encoding="utf-8")
    utility, tail = nav.split('<div class="utility">', 1)[1].split('</div>', 1)
    mobile = nav.split('<nav class="nav-mobile wrap"', 1)[1].split('</nav>', 1)[0]
    assert utility.count('id="searchTriggerMobile"') == 1
    assert 'searchTriggerMobile' not in mobile, "Search must not sit in scrollable topic row"
    assert 'href="{{BASE}}/#atlas-directory"' in mobile

    galaxy = (PUBLIC / "galaxies/types/index.html").read_text(encoding="utf-8")
    assert galaxy.count('<details class="galaxy-example">') == 3
    print(
        "UI control regression PASS: 28-page DOM semantics, 3 native homepage "
        "disclosures, 8 keyboard planet selectors, stable mobile Search, "
        "3 independent galaxy examples, no duplicate CSS state owners"
    )


if __name__ == "__main__":
    main()
