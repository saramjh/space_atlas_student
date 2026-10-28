#!/usr/bin/env python3
"""Prevent educational copy and interpretation controls reverting to tiny type.

Static TDD guard; browser A/B/reflow checks supply independent visual evidence.
Do not infer pupil comprehension from font sizes or unit-test outcomes.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")

for name, expected in {
    "--type-learning-body": "1rem",
    "--type-learning-control": ".875rem",
    "--type-learning-context": ".875rem",
    "--type-learning-reference": ".9375rem",
}.items():
    assert re.search(rf"{re.escape(name)}\s*:\s*{expected}\b", CSS), f"{name} token absent"

def rules(selector):
    matches = re.findall(r"([^{}]+)\{([^{}]*)\}", CSS)
    found = [decl for keys,decl in matches if selector in [x.strip() for x in keys.split(",")]]
    assert found, f"No CSS for {selector}"
    return " ".join(found)

def size(selector, token):
    source = rules(selector)
    assert re.search(rf"(?:font-size|font)\s*:[^;]*var\({re.escape(token)}\)", source), (
        f"{selector} lacks semantic type token {token}"
    )
    assert "!important" not in source, f"{selector} needs no specificity override"

for selector in (".step p", ".truth p", ".scale-viz p", ".scale-quiz p",
                 ".teacher-use-list dd", ".teacher-hypothesis-body li",
                 ".cer-setup-instructions li", ".cer-reasoning-guide p"):
    size(selector, "--type-learning-body")
for selector in (".quiz-options button", ".query-preset-row button"):
    size(selector, "--type-learning-control")
for selector in (".tool-readout", ".phase-hint", ".source-panel span"):
    size(selector, "--type-learning-context")
size(".ref-table", "--type-learning-reference")
assert re.search(r"font\s*:\s*600\s+12px/1\.45", rules(".ref-table th")), "Dense header intentionally smaller"
assert "min-height:0" in rules(".step"), "Avoid giant empty step rows after improving copy"
assert "margin-bottom:24px" in rules(".step-no"), "Preserve related-number/step-content proximity"
assert "grid-template-columns:28px minmax(0,1fr)" in rules(".source-panel li"), "Longer source text must reflow"
assert "grid-column:2" in rules(".source-panel li > a"), "Long source links must wrap under source description"
for path in (ROOT / "public/moon/phases/index.html", ROOT / "public/earth/seasons/index.html"):
    page = path.read_text(encoding="utf-8")
    assert 'rel="canonical"' in page and 'application/ld+json' in page
    assert 'adsbygoogle' in page
print("LEARNING_READABILITY_ROLE_GATE_PASS: semantic learning/control/source/table rules, layout and SEO")
