#!/usr/bin/env python3
"""Deterministic candidate inventory, NOT a judgment of learning effectiveness.

Never edits content. Ranks where human science/UX review may add value.
"""
import json
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Audit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = {}
        self.parts = []
        self.in_script = False
    def handle_starttag(self, tag, attrs):
        self.tags[tag] = self.tags.get(tag, 0) + 1
        if tag == "script":
            self.in_script = True
    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False
    def handle_data(self, data):
        if not self.in_script:
            self.parts.append(data)


def main():
    results = []
    for meta_path in sorted((ROOT / "pages").rglob("meta.json")):
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        if meta.get("excludeFromTopicSearch"):
            continue  # release notes aren't science learning candidates
        source = (meta_path.parent / "content.html").read_text(encoding="utf-8")
        info = Audit()
        info.feed(source)
        words = len(re.findall(r"\b[\w’-]+\b", " ".join(info.parts)))
        js_path = str(meta.get("script", "")).lstrip("/")
        js = (ROOT / js_path).read_text(encoding="utf-8") if js_path and (ROOT / js_path).exists() else ""
        user_controls = sum(info.tags.get(t, 0) for t in ("input", "select", "button", "details"))
        graphics = sum(info.tags.get(t, 0) for t in ("svg", "canvas", "img", "table"))
        interaction_handlers = len(re.findall(r"addEventListener\s*\(|\.onclick\s*=", js))
        # Heuristic only: a highly textual page with fewer visual/interactive
        # primitives is an inspection CANDIDATE, not automatically defective.
        priority_score = max(0, words - 300) / 250 + (2 if not graphics else 0) + (
            2 if not user_controls else 0) + (1 if not interaction_handlers else 0)
        results.append({
            "path": meta.get("path"), "words_estimate": words,
            "graphic_elements": graphics, "visible_controls": user_controls,
            "source_event_handlers": interaction_handlers,
            "candidate_score": round(priority_score, 2),
        })
    results.sort(key=lambda x: (-x["candidate_score"], x["path"]))
    payload = {
        "date_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "static code coverage prioritization only; not tested pedagogical quality",
        "limitation": "Dynamic SVG, JS-created controls, actual user engagement and model correctness cannot be evaluated by this heuristic.",
        "total_pages": len(results), "review_candidates": results[:8], "all_pages": results,
    }
    report = ROOT / "reports" / "space-atlas-visual-coverage.json"
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Visual candidate inventory: {len(results)} pages; report={report}")
    for row in results[:5]:
        print(row["path"], "score", row["candidate_score"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
