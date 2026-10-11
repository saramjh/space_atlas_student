#!/usr/bin/env python3
"""Zero-dependency live Space Atlas health check; read-only, no deploy or account writes.

Checks each source-declared public route rather than assuming historical page counts.
GitHub Actions failure notifications are the alerting mechanism, not claims of repair.
"""
import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://saramjh.github.io/space_atlas_student/"
UA = "SpaceAtlasReadOnlyHealth/1.0 (+https://github.com/saramjh/space_atlas_student)"


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1_count = 0
        self.canonicals = []
        self.jsonld = []
        self._in_jsonld = False
        self._jsonld_text = []
        self.loaded_scripts = []
        self.stylesheets = []
        self.ads = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "h1":
            self.h1_count += 1
        if tag == "link" and a.get("rel") == "canonical":
            self.canonicals.append(a.get("href"))
        if tag == "link" and a.get("rel") == "stylesheet":
            self.stylesheets.append(a.get("href"))
        if tag == "script":
            if a.get("src"):
                self.loaded_scripts.append(a.get("src"))
            if a.get("type") == "application/ld+json":
                self._in_jsonld = True
                self._jsonld_text = []
        if tag == "ins" and a.get("data-ad-slot"):
            self.ads.append(a["data-ad-slot"])

    def handle_data(self, text):
        if self._in_jsonld:
            self._jsonld_text.append(text)

    def handle_endtag(self, tag):
        if tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._jsonld_text))
            self._in_jsonld = False


def get(url, attempts=3):
    errors = []
    for attempt in range(attempts):
        start = time.monotonic()
        try:
            req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,*/*"})
            with urlopen(req, timeout=18) as r:
                content = r.read(2_000_000)
                if len(content) == 2_000_000:
                    raise ValueError("response larger than 2 MB")
                return content, round(time.monotonic() - start, 3), r.headers.get("Content-Type", "")
        except (OSError, HTTPError, URLError, ValueError) as e:
            errors.append(type(e).__name__ + ": " + str(e)[:180])
            if attempt + 1 < attempts:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(" | ".join(errors))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=SITE, help="URL for live website (read-only)")
    parser.add_argument("--output", default="reports/space-atlas-live-health.json")
    args = parser.parse_args()
    base = args.base_url.rstrip("/") + "/"
    if base != SITE:
        # Tests may use a local mirror. Canonical remains production, by design.
        print("NON-PRODUCTION base URL: " + base)
    metas = []
    for p in sorted((ROOT / "pages").rglob("meta.json")):
        obj = json.loads(p.read_text(encoding="utf-8"))
        if not obj.get("canonical") or not obj.get("path"):
            raise ValueError(f"Missing canonical/path in {p}")
        metas.append(obj)
    findings = []
    pages = []
    assets_to_check = set()
    for meta in metas:
        route = meta["path"].lstrip("/")
        url = urljoin(base, route)
        record = {"path": meta["path"], "url": url, "ok": False}
        try:
            data, elapsed, mime = get(url)
            markup = data.decode("utf-8")
            parsed = PageParser()
            parsed.feed(markup)
            record.update({"seconds": elapsed, "bytes": len(data), "h1": parsed.h1_count,
                           "canonical": parsed.canonicals, "jsonld": len(parsed.jsonld),
                           "ads": parsed.ads})
            issues = []
            if "text/html" not in mime.lower():
                issues.append("non-HTML content-type " + mime)
            if parsed.h1_count != 1:
                issues.append(f"H1 count {parsed.h1_count}")
            if parsed.canonicals != [meta["canonical"]]:
                issues.append(f"canonical mismatch: {parsed.canonicals!r}")
            if len(parsed.jsonld) != 1:
                issues.append(f"JSON-LD count {len(parsed.jsonld)}")
            else:
                try:
                    graph = json.loads(parsed.jsonld[0]).get("@graph", [])
                    if not any(x.get("@type") == "LearningResource" and
                               x.get("url") == meta["canonical"] for x in graph):
                        issues.append("missing canonical LearningResource")
                except (ValueError, AttributeError, TypeError):
                    issues.append("invalid JSON-LD graph")
            if base == SITE:
                if parsed.ads.count("2983244729") != 1:
                    issues.append("manual primary ad changed")
            for src in parsed.loaded_scripts + parsed.stylesheets:
                # Site-relative project paths are /space_atlas_student/assets/...
                # (not a direct prefix of https://.../space_atlas_student/).
                if not src or "/assets/" not in src:
                    continue
                if src.startswith(base):
                    assets_to_check.add(src)
                elif src.startswith("/space_atlas_student/") and base == SITE:
                    assets_to_check.add(urljoin("https://saramjh.github.io", src))
                elif src.startswith("/assets/") and base != SITE:
                    assets_to_check.add(urljoin(base, src.lstrip("/")))
            record["issues"] = issues
            findings.extend(f"{meta['path']}: {item}" for item in issues)
            record["ok"] = not issues
        except (RuntimeError, ValueError, UnicodeError) as e:
            record["issues"] = [str(e)]
            findings.append(f"{meta['path']}: {e}")
        pages.append(record)

    checked_assets = []
    for asset in sorted(assets_to_check):
        # Confirm shared generated JS and CSS referenced by the 27 pages are reachable.
        entry = {"url": asset}
        try:
            data, seconds, _ = get(asset)
            entry.update({"ok": bool(data), "bytes": len(data), "seconds": seconds})
            if not data:
                findings.append(f"empty asset: {asset}")
        except RuntimeError as e:
            entry.update({"ok": False, "error": str(e)})
            findings.append(f"asset {asset}: {e}")
        checked_assets.append(entry)

    result = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "base_url": base, "page_count": len(pages),
        "passed_pages": sum(p["ok"] for p in pages),
        "asset_count": len(checked_assets),
        "passed_assets": sum(x.get("ok", False) for x in checked_assets),
        "errors": findings, "pages": pages, "assets": checked_assets,
        "scope": "static public HTML, critical assets, metadata, and HTTP reachability only",
        "limitations": "Does not prove Google indexing, real AdSense rendering, JS interaction, accessibility or traffic improvements.",
    }
    target = ROOT / args.output
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Space Atlas live: {result['passed_pages']}/{len(pages)} pages, "
          f"{result['passed_assets']}/{len(checked_assets)} assets; "
          f"{len(findings)} problems; saved {target}")
    for msg in findings[:30]:
        print("ERROR:", msg, file=sys.stderr)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write(f"## Space Atlas — Live health\n\n"
                    f"{result['passed_pages']}/{len(pages)} pages, "
                    f"{result['passed_assets']}/{len(checked_assets)} assets. "
                    f"**{len(findings)} problems.**\n\n"
                    "This is read-only monitoring. No site code or settings were modified.\n")
    return 0 if not findings else 1


if __name__ == "__main__":
    raise SystemExit(main())
