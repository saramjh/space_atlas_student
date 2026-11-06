#!/usr/bin/env python3
"""Contract: no legacy-host Classroom links in static source or rendered pages.

The static anchor must work with JavaScript disabled. Decode the Classroom url
parameter exactly once, then verify canonical lesson path and preserved UTMs.
No network requests or provider-account changes are required.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
import sys

ROOT = Path(__file__).resolve().parents[1]
LESSONS = ("earth/seasons", "moon/phases", "universe/scale")
OLD = "https://saramjh.github.io/space_atlas_student/"
NEW = "https://spaceatlasedu.org/"
UTMS = {
    "utm_source": ["google_classroom"],
    "utm_medium": ["share"],
    "utm_campaign": ["space_atlas_teacher_test"],
}


class ClassroomLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        properties = dict(attrs)
        if "teacher-classroom-share" in properties.get("class", "").split():
            self.hrefs.append(properties.get("href"))


def check_lesson(lesson, filename):
    html = filename.read_text(encoding="utf-8")
    parser = ClassroomLinks()
    parser.feed(html)
    assert len(parser.hrefs) == 1, (filename, "expected one static Classroom link", parser.hrefs)
    href = parser.hrefs[0]
    assert href and OLD not in href, (filename, "legacy share href")
    outer = urlsplit(href)
    assert (outer.scheme, outer.netloc, outer.path) == (
        "https", "classroom.google.com", "/share"
    ), (filename, "Classroom share endpoint mismatch", href)
    outer_params = parse_qs(outer.query, strict_parsing=True)
    assert list(outer_params) == ["url"], (filename, "unexpected outer arguments", outer_params)
    assert len(outer_params["url"]) == 1
    once_decoded = outer_params["url"][0]
    assert not once_decoded.startswith("https%3A"), (filename, "double encoded url")
    target = urlsplit(once_decoded)
    assert (target.scheme, target.netloc, target.path) == (
        "https", "spaceatlasedu.org", "/" + lesson + "/"
    ), (filename, "decoded share points to wrong origin/path", once_decoded)
    assert target.query and parse_qs(target.query, strict_parsing=True) == UTMS, (
        filename, "UTMs changed", once_decoded
    )
    assert not target.fragment, (filename, "unexpected fragment")
    print("CLASSROOM_SHARE_CANONICAL_PASS", filename.relative_to(ROOT), once_decoded)


def main():
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    assert OLD not in readme, "README retains legacy GitHub Pages links"
    assert readme.count(NEW) == 6, "Expected exactly 6 canonical README links"
    for anchor in ("#for-educators", "#for-builders"):
        assert (NEW + "updates/" + anchor) in readme, "README lost anchor " + anchor
    for lesson in LESSONS:
        check_lesson(lesson, ROOT / "pages" / lesson / "content.html")
        generated = ROOT / "public" / lesson / "index.html"
        assert generated.is_file(), f"Build output missing: {generated}"
        check_lesson(lesson, generated)
    print("CANONICAL_SHARE_RELEASE_READY", "3 source + 3 built static anchors; README 6 links; child-privacy gate separate")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, ValueError, OSError) as exc:
        print("CANONICAL_SHARE_RELEASE_HOLD", exc, file=sys.stderr)
        raise SystemExit(1)
