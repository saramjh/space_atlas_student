#!/usr/bin/env python3
"""Static site builder — no external dependencies.

Reads templates/layout.html + templates/nav.html + templates/footer.html,
combines them with each pages/**/meta.json + content.html, and writes the
result to public/<path>/index.html. Also copies assets/, robots.txt, and
regenerates sitemap.xml from the same page list.

Run: python3 build.py
"""
import json
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
TEMPLATES = ROOT / "templates"
PAGES = ROOT / "pages"
PUBLIC = ROOT / "public"

# GitHub Pages project sites (https://<user>.github.io/<repo>/) are served
# from a subpath, not the domain root — a plain "/assets/..." link resolves
# against the *domain* root and 404s. SITE_BASE is prepended to every
# internal absolute link (nav hrefs, stylesheet/favicon/script src).
# Empty by default so a local `python3 build.py` + `http.server` (served at
# the root) keeps working unchanged; CI sets SITE_BASE=/space_atlas_student.
SITE_BASE = os.environ.get("SITE_BASE", "").rstrip("/")


def read(path):
    return path.read_text(encoding="utf-8")


def load_pages():
    pages = []
    for meta_path in sorted(PAGES.rglob("meta.json")):
        page_dir = meta_path.parent
        meta = json.loads(read(meta_path))
        content = read(page_dir / "content.html")
        pages.append((meta, content))
    return pages


def render_page(layout, nav, footer, meta, content):
    html = layout
    html = html.replace("{{NAV}}", nav)
    html = html.replace("{{FOOTER}}", footer)
    html = html.replace("{{CONTENT}}", content)
    tokens = {
        "{{TITLE}}": meta.get("title", ""),
        "{{DESCRIPTION}}": meta.get("description", ""),
        "{{CANONICAL}}": meta.get("canonical", ""),
        "{{OG_TITLE}}": meta.get("ogTitle", meta.get("title", "")),
        "{{OG_DESCRIPTION}}": meta.get("ogDescription", meta.get("description", "")),
        "{{OG_IMAGE}}": meta.get("ogImage", ""),
        "{{JSONLD_NAME}}": meta.get("jsonldName", meta.get("title", "")),
        "{{JSONLD_DESCRIPTION}}": meta.get("jsonldDescription", meta.get("description", "")),
        "{{BASE}}": SITE_BASE,
    }
    for token, value in tokens.items():
        html = html.replace(token, value)
    script_tag = f'<script type="module" src="{SITE_BASE}{meta["script"]}"></script>' if meta.get("script") else ""
    html = html.replace("{{SCRIPT}}", script_tag)
    return html


def out_path_for(meta):
    path = meta["path"]
    if path == "/":
        return PUBLIC / "index.html"
    return PUBLIC / path.strip("/") / "index.html"


def write_sitemap(pages):
    urls = []
    for meta, _ in pages:
        loc = meta.get("canonical")
        if not loc:
            continue
        urls.append(f"  <url>\n    <loc>{loc}</loc>\n    <changefreq>monthly</changefreq>\n  </url>")
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    (PUBLIC / "sitemap.xml").write_text(sitemap, encoding="utf-8")


def main():
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)

    layout = read(TEMPLATES / "layout.html")
    nav = read(TEMPLATES / "nav.html")
    footer = read(TEMPLATES / "footer.html")

    pages = load_pages()
    for meta, content in pages:
        html = render_page(layout, nav, footer, meta, content)
        out_path = out_path_for(meta)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(html, encoding="utf-8")

    if (ROOT / "assets").is_dir():
        shutil.copytree(ROOT / "assets", PUBLIC / "assets")
    if (ROOT / "robots.txt").is_file():
        shutil.copy(ROOT / "robots.txt", PUBLIC / "robots.txt")

    write_sitemap(pages)

    print(f"Built {len(pages)} page(s) into {PUBLIC}")
    for meta, _ in pages:
        print(f"  {meta['path']}")


if __name__ == "__main__":
    main()
