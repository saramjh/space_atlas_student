#!/usr/bin/env python3
"""Guard the desktop navigation against CSS/JS open-state desynchronization."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")
JS = (ROOT / "assets/js/nav.js").read_text(encoding="utf-8")
NAV = (ROOT / "templates/nav.html").read_text(encoding="utf-8")

open_selectors = []
for selector, declarations in re.findall(r"([^{}]+)\{([^{}]*)\}", CSS):
    if re.search(r"\bdisplay\s*:\s*block\b", declarations):
        open_selectors.extend(
            part.strip() for part in selector.split(",")
            if re.search(r"\.nav-drop-menu\s*$", part.strip())
        )
assert open_selectors == [".nav-dropdown.nav-open .nav-drop-menu"], (
    "The open menu must have one explicit state owner; hover/focus CSS can reopen a JS-dismissed popup: "
    f"{open_selectors}"
)

assert "const setOpen = (open)" in JS, "Open state must update aria-expanded and nav-open together"
assert "dropdown.classList.toggle('nav-open', open)" in JS
assert "button.setAttribute('aria-expanded', open ? 'true' : 'false')" in JS
assert "addEventListener('pointerenter'" in JS and "addEventListener('pointerleave'" in JS
assert "document.addEventListener('pointerdown'" in JS, "Outside clicks must dismiss open menus"
assert "mouseInside && event.detail > 0" in JS, "Mouse hover must not be toggled shut by the click that follows"
assert "links.includes(document.activeElement)" in JS, "Keep the menu open while a keyboard user is in its links"
assert "dropdown.classList.toggle('nav-open', !open)" not in JS, "Do not infer state from aria after hover/focus mutations"
assert "if (event.key === 'Escape')" in JS and "setOpen(false)" in JS
assert NAV.count('class="nav-dropdown"') == 4
for target in ("nav-solar-system", "nav-earth-moon", "nav-deep-space", "nav-guides"):
    assert f'aria-controls="{target}"' in NAV and f'id="{target}"' in NAV

print("NAVIGATION_DROPDOWN_STATE_GATE_PASS: one CSS state owner, synchronized ARIA/class, pointer and Escape paths")
