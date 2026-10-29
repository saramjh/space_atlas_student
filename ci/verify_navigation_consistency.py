#!/usr/bin/env python3
"""Regression for navigation labels, destinations, active sections and clean head markup."""
from html import unescape
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = "/space_atlas_student"
NAV = (ROOT / "templates/nav.html").read_text(encoding="utf-8")
HOME = (ROOT / "pages/index/content.html").read_text(encoding="utf-8")
PUBLIC = ROOT / "public"
sections = {
    "solar-system": {"solar-system"},
    "earth-moon": {"moon", "earth"},
    "deep-space": {"stars", "black-holes", "galaxies", "exoplanets", "astronomy", "universe"},
    "guides": {"learn", "sources"},
}

def group_for(path):
    category = path.strip("/").split("/")[0]
    return next((name for name, cats in sections.items() if category in cats), None)

def menu_data(raw, title_tag):
    pattern = rf'<a href="{{{{BASE}}}}(?P<path>/[^"#]+/)"[^>]*><{title_tag}>(?P<label>.*?)</{title_tag}><span>(?P<desc>.*?)</span></a>'
    return {m.group("path"): (unescape(m.group("label")).removesuffix(" ↗"), unescape(m.group("desc"))) for m in re.finditer(pattern, raw)}

def check():
    desktop = menu_data(NAV, "b")
    directory = menu_data(HOME, "strong")
    assert len(desktop) == 26 and desktop == directory, (
        f"Navbar/home mismatch. Nav: {len(desktop)} Home: {len(directory)} "
        f"Different: {[p for p in desktop if directory.get(p) != desktop[p]]}"
    )
    assert 'Your mass on other worlds' not in NAV and 'Your mass on other worlds' not in HOME
    assert 'Why Scale Diagrams Lie' not in NAV and 'Why Scale Diagrams Lie' not in HOME
    assert 'Solar System: Size vs Distance' in NAV and 'Solar System: Size vs Distance' in HOME
    paths = {json.loads(meta.read_text(encoding="utf-8"))["path"] for meta in ROOT.glob("pages/**/meta.json")}
    assert set(desktop) == {path for path in paths if group_for(path)}, "Every lesson must have a correct menu route"
    assert NAV.count('class="nav-mobile-section"') == 4
    for section in sections:
        assert f'data-nav-section="{section}"' in NAV
        assert f'href="{{{{BASE}}}}/#topics-{section}"' in NAV
        assert f'id="topics-{section}"' in HOME
    for path in paths:
        file = PUBLIC / path.lstrip("/") / "index.html"
        html = file.read_text(encoding="utf-8")
        head = html.split("</head>", 1)[0]
        assert "\\n\\n" not in head, f"{path}: literal backslash-newlines in head"
        nav = html.split("</header>", 1)[0]
        current = group_for(path)
        if current:
            assert nav.count('aria-current="page"') == 1, f"{path}: duplicate/missing current page"
            assert f'href="{BASE}{path}" aria-current="page"' in nav, f"{path}: wrong current lesson"
            assert nav.count('class="nav-dropdown nav-section-active"') == 1
            assert nav.count('class="nav-mobile-section nav-section-active"') == 1
            assert f'class="nav-dropdown nav-section-active" data-nav-section="{current}"' in nav
        else:
            assert 'aria-current="page"' not in nav
            assert 'nav-section-active' not in nav
    print(f"Navigation consistency PASS: {len(paths)} pages, {len(desktop)} lessons and 4 subject groups")

if __name__ == "__main__":
    check()
