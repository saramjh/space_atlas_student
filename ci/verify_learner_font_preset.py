#!/usr/bin/env python3
"""Learner-first display/type/data font system, local & licensed, no CDN calls.

Static assertions are a necessary gate, not evidence of student comprehension.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")
HEAD = (ROOT / "templates/layout.html").read_text(encoding="utf-8")
FONTROOT = ROOT / "assets/fonts"

fonts = {
    "Atkinson Hyperlegible Next": "atkinson-hyperlegible-next-latin",
    "Source Serif 4": "source-serif-4-latin",
    "Atkinson Hyperlegible Mono": "atkinson-hyperlegible-mono-latin",
}
total = 0
for family, basename in fonts.items():
    font = FONTROOT / f"{basename}.woff2"
    license_file = FONTROOT / f"{basename}.OFL.txt"
    assert font.is_file(), f"Missing self-hosted WOFF2: {font}"
    data = font.read_bytes()
    assert data.startswith(b"wOF2"), f"{font.name} not WOFF2"
    assert 10_000 <= len(data) <= 60_000, f"{font.name} unexpectedly heavy or malformed"
    total += len(data)
    assert license_file.is_file(), f"{font.name} lacks redistributable font license"
    assert "SIL OPEN FONT LICENSE Version 1.1" in license_file.read_text(encoding="utf-8")
    rule = re.search(
        rf'@font-face\s*\{{[^}}]*font-family:"{re.escape(family)}";[^}}]*\}}', CSS
    )
    assert rule, f"Missing @font-face for {family}"
    for required in (
        f'../fonts/{basename}.woff2',
        "font-weight:400 700",
        "font-display:swap",
        "format('woff2')",
    ):
        assert required in rule.group(0), f"{family} misses {required}"
assert total <= 115_000, f"Total font payload too heavy: {total} bytes"

for name, family in {
    "--font-reading": "Atkinson Hyperlegible Next",
    "--font-display": "Source Serif 4",
    "--font-data": "Atkinson Hyperlegible Mono",
}.items():
    assert re.search(rf'^\s*{re.escape(name)}:"{re.escape(family)}"', CSS, re.M), name

assert "font-family:var(--font-reading)" in CSS, "Body must use deliberate learner reading family"
assert "var(--font-display)" in CSS and "var(--font-data)" in CSS
assert "font-family:Inter," not in CSS, "Unloaded Inter should not be falsely promised"
assert not re.search(r"(?<![-\w])font:[^;{}]*(?:Georgia|ui-monospace)", CSS), (
    "No legacy per-component hardcoded typefaces: use the role tokens instead"
)
assert "fonts.googleapis.com" not in CSS and "fonts.gstatic.com" not in CSS, "No third-party font calls"
assert "font-variant-numeric:tabular-nums" in CSS, "Scientific values should align"

reading_preload = (
    '<link rel="preload" as="font" type="font/woff2" '
    'href="{{BASE}}/assets/fonts/atkinson-hyperlegible-next-latin.woff2" crossorigin />'
)
assert reading_preload in HEAD, "Preload the primary reading face without blocking JS"
assert HEAD.count('rel="preload" as="font"') <= 2, "Avoid over-preloading font variants"
assert "assets/fonts/atkinson-hyperlegible-mono-latin.woff2" not in HEAD, "Mono is not critical-path"

built = ROOT / "public/moon/phases/index.html"
if built.is_file():
    content = built.read_text(encoding="utf-8")
    assert "/space_atlas_student/assets/fonts/atkinson-hyperlegible-next-latin.woff2" in content
    assert 'rel="canonical"' in content and "application/ld+json" in content

print(f"LEARNER_FONT_PRESET_PASS: self-hosted OFL faces, bounded transfer={total} bytes, semantic roles")
