#!/usr/bin/env python3
"""Static site builder — no external dependencies.

Reads templates/layout.html + templates/nav.html + templates/footer.html,
combines them with each pages/**/meta.json + content.html, and writes the
result to public/<path>/index.html. Also copies assets/, robots.txt,
generates search-index.json for client-side search, and regenerates sitemap.xml.

Run: python3 build.py
"""
import json
import hashlib
from html import escape as escape_html
import re
from datetime import date
import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent
TEMPLATES = ROOT / "templates"
PAGES = ROOT / "pages"
CLASSROOM_PREVIEW = os.environ.get("CLASSROOM_PREVIEW", "").lower() in {"1", "true", "yes"}
PUBLIC = ROOT / "public"
if CLASSROOM_PREVIEW:
    # Private teacher preview must never overwrite the deployable public tree.
    custom = os.environ.get("SITE_OUTPUT_DIR", "").strip()
    if not custom or not Path(custom).is_absolute():
        raise ValueError("CLASSROOM_PREVIEW requires an explicit absolute SITE_OUTPUT_DIR")
    candidate = Path(custom).resolve()
    if candidate == ROOT or candidate == ROOT / "public" or ROOT in candidate.parents:
        raise ValueError("CLASSROOM_PREVIEW output must be outside the repository")
    if candidate == Path("/") or candidate == Path.home():
        raise ValueError("Refusing unsafe classroom preview output")
    PUBLIC = candidate

# GitHub Pages project sites (https://<user>.github.io/<repo>/) are served
# from a subpath, not the domain root — a plain "/assets/..." link resolves
# against the *domain* root and 404s. SITE_BASE is prepended to every
# internal absolute link (nav hrefs, stylesheet/favicon/script src).
SITE_BASE = os.environ.get("SITE_BASE", "").rstrip("/")
ADSENSE_ENABLED = (not CLASSROOM_PREVIEW
    and os.environ.get("ADSENSE_ENABLED", "").lower() in {"1", "true", "yes"})
SITE_URL = "https://saramjh.github.io/space_atlas_student/"
ADSENSE_PRIMARY_SLOT = "2983244729"
ADSENSE_SECONDARY_SLOT = "1670163057"


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


def load_release_data():
    """Curated, verified release milestones, not raw Git commits."""
    data = json.loads(read(ROOT / "data" / "releases.json"))
    releases = data.get("releases")
    if data.get("schemaVersion") != 1 or not isinstance(releases, list) or not releases:
        raise ValueError("Invalid releases manifest")
    known_paths = {json.loads(read(p)).get("path") for p in PAGES.rglob("meta.json")}
    seen = set()
    dates = []
    for item in releases:
        rid = item.get("id")
        if not isinstance(rid, str) or not re.fullmatch(r"[a-z0-9-]+", rid) or rid in seen:
            raise ValueError(f"Duplicate or invalid release ID: {rid!r}")
        seen.add(rid)
        dates.append(date.fromisoformat(item["date"]))
        for key in ("title", "category", "summary", "students", "teachers", "developers"):
            if not isinstance(item.get(key), str) or not item[key].strip():
                raise ValueError(f"{rid}: missing {key}")
        if not item.get("links") or not item.get("commits"):
            raise ValueError(f"{rid}: missing links or commits")
        for link in item["links"]:
            if not link.get("label") or link.get("path") not in known_paths or link["path"] == "/updates/":
                raise ValueError(f"{rid}: invalid lesson link {link!r}")
        for sha in item["commits"]:
            if not isinstance(sha, str) or not re.fullmatch(r"[0-9a-f]{7,40}", sha):
                raise ValueError(f"{rid}: invalid commit {sha!r}")
    if dates != sorted(dates, reverse=True):
        raise ValueError("Release history must be in reverse chronological order")
    return releases


def render_release_timeline(releases):
    e = lambda text: escape_html(str(text), quote=True)
    blocks = []
    for item in releases:
        links = "".join(
            f'<li><a href="{SITE_BASE}{e(link["path"])}">{e(link["label"])} ↗</a></li>'
            for link in item["links"]
        )
        commits = ", ".join(
            f'<a href="https://github.com/saramjh/space_atlas_student/commit/{e(sha)}" '
            f'target="_blank" rel="noopener noreferrer"><code>{e(sha)}</code></a>'
            for sha in item["commits"]
        )
        blocks.append(
            f'<article class="updates-release" id="release-{e(item["id"])}">'
            f'<div class="updates-release-meta"><time datetime="{e(item["date"])}">{e(item["date"])}</time>'
            f'<span>{e(item["category"])}</span></div>'
            f'<h3>{e(item["title"])}</h3><p>{e(item["summary"])}</p>'
            f'<div class="updates-audience-copy"><div><h4>For learners</h4><p>{e(item["students"])}</p></div>'
            f'<div><h4>For educators</h4><p>{e(item["teachers"])}</p></div></div>'
            f'<div class="updates-release-links"><strong>Explore the lessons</strong><ul>{links}</ul></div>'
            f'<details class="updates-technical"><summary>For developers · commits and checks</summary>'
            f'<p>{e(item["developers"])}</p><p>Related changes: {commits}</p></details>'
            '</article>'
        )
    return '<div class="updates-timeline">' + "".join(blocks) + '</div>'


def git_lastmod_for_page(meta):
    """Return the last meaningful source-change date for one generated page.

    Sitemap lastmod must describe the page, not the sitemap build time.
    Use the latest commit touching that page's source directory. An explicit
    meta.json lastmod value remains available as an override.
    """
    if meta.get("path") == "/updates/":
        return load_release_data()[0]["date"]
    explicit = meta.get("lastmod")
    if explicit:
        return explicit

    path = meta.get("path", "/")
    source_dir = PAGES / ("index" if path == "/" else path.strip("/"))
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cI", "--", str(source_dir.relative_to(ROOT))],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        value = result.stdout.strip()
        return value or None
    except (OSError, subprocess.CalledProcessError, ValueError):
        return None


def build_structured_data(meta):
    canonical = meta.get("canonical", "")
    if meta.get("pageType") == "WebPage":
        page = {
            "@type": "WebPage", "@id": f"{canonical}#site-notice",
            "url": canonical, "name": meta.get("jsonldName", meta.get("title", "")),
            "description": meta.get("jsonldDescription", meta.get("description", "")),
            "inLanguage": "en", "isPartOf": {"@type": "WebSite", "name": "Space Atlas", "url": SITE_URL},
        }
        graph = [page, {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Space Atlas", "item": SITE_URL},
            {"@type": "ListItem", "position": 2, "name": "Privacy", "item": canonical},
        ]}]
        return '<script type="application/ld+json">\n' + json.dumps(
            {"@context": "https://schema.org", "@graph": graph}, indent=2, ensure_ascii=False
        ) + '\n</script>'
    if meta.get("pageType") == "CollectionPage":
        resource = {
            "@type": "CollectionPage",
            "@id": f"{canonical}#release-history",
            "url": canonical,
            "name": meta.get("jsonldName", meta.get("title", "")),
            "description": meta.get("jsonldDescription", meta.get("description", "")),
            "inLanguage": "en",
            "dateModified": git_lastmod_for_page(meta),
            "isPartOf": {"@type": "WebSite", "name": "Space Atlas", "url": SITE_URL},
        }
        graph = [resource, {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Space Atlas", "item": SITE_URL},
                {"@type": "ListItem", "position": 2, "name": "What's New", "item": canonical},
            ],
        }]
        return '<script type="application/ld+json">\n' + json.dumps(
            {"@context": "https://schema.org", "@graph": graph}, indent=2, ensure_ascii=False
        ) + '\n</script>'
    resource = {
        "@type": "LearningResource",
        "@id": f"{canonical}#learning-resource",
        "url": canonical,
        "name": meta.get("jsonldName", meta.get("title", "")),
        "description": meta.get("jsonldDescription", meta.get("description", "")),
        "educationalLevel": "Grades 4–8",
        "learningResourceType": meta.get("learningResourceType", "Reference"),
        "interactivityType": meta.get("interactivityType", "mixed"),
        "inLanguage": "en",
        "isAccessibleForFree": True,
        "audience": {
            "@type": "EducationalAudience",
            "educationalRole": "student",
        },
        "isPartOf": {
            "@type": "WebSite",
            "name": "Space Atlas",
            "url": SITE_URL,
        },
    }
    if meta.get("ogImage"):
        resource["image"] = meta["ogImage"]

    lastmod = git_lastmod_for_page(meta)
    if lastmod:
        resource["dateModified"] = lastmod

    graph = [resource]

    if meta.get("path") != "/":
        graph.append({
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Space Atlas",
                    "item": SITE_URL,
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": meta.get("jsonldName", meta.get("title", "")),
                    "item": canonical,
                },
            ],
        })

    payload = {"@context": "https://schema.org", "@graph": graph}
    return (
        '<script type="application/ld+json">\n'
        + json.dumps(payload, indent=2, ensure_ascii=False)
        + "\n</script>"
    )


def analytics_head():
    """Production GA4 retained. An isolated supervised preview suppresses it."""
    if CLASSROOM_PREVIEW:
        return ""
    return (
        '<!-- Google tag (gtag.js) -->\n'
        '<script async src="https://www.googletagmanager.com/gtag/js?id=G-DTCVV5XRD3"></script>\n'
        '<script>\n'
        '  window.dataLayer = window.dataLayer || [];\n'
        '  function gtag(){dataLayer.push(arguments);}\n'
        "  gtag('js', new Date());\n"
        "  gtag('config', 'G-DTCVV5XRD3', { content_group: 'Space Atlas' });\n"
        '</script>'
    )


def adsense_head():
    if not ADSENSE_ENABLED:
        return ""
    return (
        '<script async src="https://pagead2.googlesyndication.com/pagead/js/'
        'adsbygoogle.js?client=ca-pub-4410729598083068" crossorigin="anonymous"></script>'
    )


def render_ad_slot(template, slot_id, position):
    if not ADSENSE_ENABLED:
        return ""
    return (
        template
        .replace("{{AD_SLOT_ID}}", slot_id)
        .replace("{{AD_POSITION}}", position)
    )


def load_lesson_acknowledgments():
    """Explicit page-scoped, non-sensitive feedback archive. No public auto-discovery."""
    path = ROOT / "data" / "lesson-acknowledgments.json"
    if not path.is_file():
        return {}
    dataset = json.loads(read(path))
    if dataset.get("schemaVersion") != 1 or not isinstance(dataset.get("records"), dict):
        raise ValueError("Invalid lesson acknowledgments catalog")
    return dataset["records"]


def render_lesson_acknowledgments(path, records):
    """Build a collapsed, bounded disclosure with names only after verified opt-in."""
    items = records.get(path, [])
    if not items:
        return ""
    if not isinstance(items, list):
        raise ValueError(f"Invalid feedback entries for {path}")
    ordered = []
    seen = set()
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            raise ValueError("Invalid feedback record")
        for key in ("id", "date", "title", "change"):
            if not isinstance(item.get(key), str) or not item[key].strip():
                raise ValueError(f"Missing {key} in acknowledgment record")
        if item["id"] in seen:
            raise ValueError("Duplicate acknowledgment ID")
        seen.add(item["id"])
        date.fromisoformat(item["date"])
        credit = item.get("credit", {})
        if not isinstance(credit, dict):
            raise ValueError("Invalid acknowledgment credit")
        kind = credit.get("kind")
        if kind == "anonymous":
            if any(key in credit for key in ("name", "email", "profile")):
                raise ValueError("Anonymous credit cannot carry identifying fields")
            if not credit.get("label"):
                raise ValueError("Anonymous credit requires a generic role label")
            label = credit["label"]
        elif kind == "named":
            permission = credit.get("publicAttributionPermission", {})
            if not (permission.get("verified") is True
                    and isinstance(permission.get("recordReference"), str)
                    and permission["recordReference"].strip()
                    and isinstance(credit.get("name"), str)
                    and credit["name"].strip()):
                raise ValueError("Named attribution requires documented opt-in proof")
            label = credit["name"]
        else:
            raise ValueError("Unknown public attribution status")
        ordered.append((item["date"], idx, item, label))
    ordered.sort(key=lambda row: (row[0], row[1]), reverse=True)
    esc = lambda value: escape_html(str(value), quote=True)
    snippets = "".join(
        '<li class="lesson-acknowledgments-item">'
        f'<time datetime="{esc(item["date"])}">{esc(item["date"])}</time>'
        f'<div><strong>{esc(item["title"])}</strong>'
        f'<p>{esc(item["change"])}</p>'
        f'<span>{esc(label)}</span></div></li>'
        for _, _, item, label in ordered[:3]
    )
    return (
        '<section class="lesson-acknowledgments" id="lesson-acknowledgments">'
        '<div class="wrap"><details aria-label="Lesson improvement acknowledgments">'
        '<summary><span>Acknowledgments</span><small>Educator and expert feedback helped improve this lesson</small></summary>'
        '<div class="lesson-acknowledgments-body"><ol>' + snippets + '</ol>'
        '<p class="lesson-acknowledgments-note">Suggestions informed specific improvements. '
        'No endorsement, formal evaluation or classroom trial is implied.</p>'
        f'<a href="{SITE_BASE}/updates/">See all updates</a>'
        '</div></details></div></section>'
    )


def render_page(layout, nav, footer, meta, content, ad_slot, topic_count, css_version):
    html = layout
    html = html.replace("{{NAV}}", nav)
    html = html.replace("{{FOOTER}}", footer)
    html = html.replace("{{CONTENT}}", content + render_lesson_acknowledgments(meta.get("path", ""), load_lesson_acknowledgments()))
    tokens = {
        # Titles and meta values enter HTML text/quoted-attribute contexts.
        # Keep literal quotation marks in authored copy without corrupting meta tags.
        "{{TITLE}}": escape_html(meta.get("title", ""), quote=True),
        "{{DESCRIPTION}}": escape_html(meta.get("description", ""), quote=True),
        "{{CANONICAL}}": escape_html(meta.get("canonical", ""), quote=True),
        "{{OG_TITLE}}": escape_html(meta.get("ogTitle", meta.get("title", "")), quote=True),
        "{{OG_DESCRIPTION}}": escape_html(meta.get("ogDescription", meta.get("description", "")), quote=True),
        "{{OG_IMAGE}}": escape_html(meta.get("ogImage", ""), quote=True),
        "{{BASE}}": SITE_BASE,
        "{{TOPIC_COUNT}}": str(topic_count),
        "{{CSS_VERSION}}": css_version,
        "{{STRUCTURED_DATA}}": build_structured_data(meta),
        "{{ANALYTICS_HEAD}}": analytics_head(),
        "{{THREE_MODULE_IMPORT}}": (
            SITE_BASE + "/assets/vendor/three/build/three.module.js"
            if CLASSROOM_PREVIEW
            else "https://unpkg.com/three@0.179.1/build/three.module.js"
        ),
        "{{THREE_ADDONS_IMPORT}}": (
            SITE_BASE + "/assets/vendor/three/examples/jsm/"
            if CLASSROOM_PREVIEW
            else "https://unpkg.com/three@0.179.1/examples/jsm/"
        ),
        "{{ADSENSE_HEAD}}": "" if meta.get("adFree") else adsense_head(),
        "{{AD_PRIMARY}}": render_ad_slot(ad_slot, ADSENSE_PRIMARY_SLOT, "primary"),
        "{{AD_SECONDARY}}": (
            render_ad_slot(ad_slot, ADSENSE_SECONDARY_SLOT, "secondary")
            if meta.get("secondaryAd")
            else ""
        ),
    }
    for token, value in tokens.items():
        html = html.replace(token, value)
    if meta.get("path") == "/updates/":
        html = html.replace("{{RELEASE_TIMELINE}}", render_release_timeline(load_release_data()))
    if meta.get("path") == "/":
        latest = load_release_data()[0]
        note = (
            '<p class="home-update-note"><span>Project updates</span>'
            f'<a href="{SITE_BASE}/updates/">What\'s new · {escape_html(latest["date"])} ↗</a></p>'
        )
        html = html.replace("{{LATEST_UPDATE}}", note)

    script_tag = (
        f'<script type="module" src="{SITE_BASE}{meta["script"]}"></script>'
        if meta.get("script")
        else ""
    )
    html = html.replace("{{SCRIPT}}", script_tag)
    if CLASSROOM_PREVIEW:
        # Do not index or accidentally present a classroom build as production.
        html = html.replace(
            '<meta name="robots" content="max-image-preview:large" />',
            '<meta name="robots" content="noindex,nofollow,noarchive" />',
        )
        html = html.replace(
            '<body>',
            '<body data-classroom-preview="true">\n'
            '<div class="classroom-preview-notice" role="note">'
            '<strong>Teacher-supervised classroom preview.</strong> '
            'Google Analytics and AdSense scripts are disabled in this copy. '
            'External resources and applicable student privacy rules still need educator review.'
            '</div>',
        )
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
        lines = ["  <url>", f"    <loc>{loc}</loc>"]
        lastmod = git_lastmod_for_page(meta)
        if lastmod:
            lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append("  </url>")
        urls.append("\n".join(lines))
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    (PUBLIC / "sitemap.xml").write_text(sitemap, encoding="utf-8")


def write_search_index(pages):
    items = []
    for meta, _ in pages:
        if meta.get("excludeFromTopicSearch"):
            continue
        path = meta.get("path", "/")
        title = meta.get("title", "").split("|")[0].strip()
        desc = meta.get("description", "")
        kicker = (
            path.strip("/").split("/")[0].replace("-", " ").title()
            if path != "/"
            else "Home"
        )
        items.append({
            "path": path,
            "title": title,
            "desc": desc,
            "kicker": kicker,
        })
    target = PUBLIC / "assets" / "search-index.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    if CLASSROOM_PREVIEW and PUBLIC.exists():
        marker = PUBLIC / ".space-atlas-classroom-preview"
        if any(PUBLIC.iterdir()) and not marker.is_file():
            raise ValueError("Refusing to delete non-preview classroom output")
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)
    if CLASSROOM_PREVIEW:
        (PUBLIC / ".space-atlas-classroom-preview").write_text(
            "Space Atlas local teacher preview; safe to regenerate.\n", encoding="utf-8"
        )

    layout = read(TEMPLATES / "layout.html")
    nav = read(TEMPLATES / "nav.html")
    footer = read(TEMPLATES / "footer.html")
    ad_slot = read(TEMPLATES / "ad-slot.html")

    pages = load_pages()
    topic_count = sum(not meta.get("excludeFromTopicSearch") for meta, _ in pages)
    # GitHub Pages caches CSS for 600 seconds. Fingerprint it so new HTML does
    # not accidentally use stale mobile-header styles after a deployment.
    css_version = hashlib.sha256((ROOT / "assets/css/style.css").read_bytes()).hexdigest()[:12]
    for meta, content in pages:
        html = render_page(layout, nav, footer, meta, content, ad_slot, topic_count, css_version)
        out_path = out_path_for(meta)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(html, encoding="utf-8")

    if (ROOT / "assets").is_dir():
        shutil.copytree(ROOT / "assets", PUBLIC / "assets")
    if CLASSROOM_PREVIEW:
        vendor = ROOT / "data/vendor/three"
        for relative in (
            "build/three.module.js", "build/three.core.js",
            "examples/jsm/controls/OrbitControls.js", "LICENSE"
        ):
            if not (vendor / relative).is_file():
                raise FileNotFoundError(f"Classroom preview missing three.js vendor {relative}")
        shutil.copytree(vendor, PUBLIC / "assets/vendor/three")
    if (ROOT / "robots.txt").is_file():
        shutil.copy(ROOT / "robots.txt", PUBLIC / "robots.txt")

    write_sitemap(pages)
    write_search_index(pages)

    print(f"Built {len(pages)} page(s) into {PUBLIC}")
    for meta, _ in pages:
        print(f"  {meta['path']}")


if __name__ == "__main__":
    main()
