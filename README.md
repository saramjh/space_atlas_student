# Space Atlas — Student Reference

Interactive space-science reference site for students in grades 4–8: a 3D solar
system model, a Moon-phases lab, a planetary scale lab, and a guide to reading
space visualizations critically, with links back to NASA/JPL/ESA sources.

Multi-page static site built with a small dependency-free Python script —
no framework, no npm.

## Choose your starting point

This README is mainly for readers exploring or maintaining the project.
The live atlas requires no knowledge of Git or software versions.

| Audience | Start here | What to expect |
| --- | --- | --- |
| **Students and general visitors** | [Explore Space Atlas](https://saramjh.github.io/space_atlas_student/) · [What's New](https://saramjh.github.io/space_atlas_student/updates/) | Try updated interactive lessons and review what the model simplifies. |
| **Teachers and families** | [Classroom learning](https://saramjh.github.io/space_atlas_student/moon/phases/) · [Update notes for educators](https://saramjh.github.io/space_atlas_student/updates/#for-educators) | Look for teaching relevance, scientific sources and limitations of demonstrations. |
| **Developers and contributors** | [Architecture](#structure) · [Release process](#release-process) · [Technical history](https://saramjh.github.io/space_atlas_student/updates/#for-builders) | Review implementation, tests, verified commit links and static SEO contracts. |

## Public updates

The [What's New page](https://saramjh.github.io/space_atlas_student/updates/)
shows the same dated releases with different information for three audiences:
learner activities, classroom explanations and expandable developer references.
The curated source is data/releases.json, not an automated dump of Git commits.
Past milestones use verified change dates; **no old software version numbers
were invented retroactively**.

The site contains **27 astronomy learning pages and one public updates page**.
The latter is a CollectionPage, not another astronomy topic; topic search
and its count remain focused on the 27 lessons.

## Structure

```text
templates/
  layout.html         <head> shell + {{NAV}}/{{CONTENT}}/{{FOOTER}} placeholders
  nav.html            Header nav (desktop + mobile) — single source of truth
  footer.html         Footer — single source of truth
pages/
  index/               → /
  moon/phases/          → /moon/phases/
    meta.json          Per-page <title>/description/OG/canonical/JSON-LD + entry script
    content.html       Page body (goes inside <main>)
assets/
  css/style.css        All page styles, shared across every page
  js/
    planet-data.js     Planet facts, scale-lab data, quiz bank — the only
                        place solar-system numbers need to change
    textures.js        Procedural canvas textures (planets + Moon), shared
    three-base.js       Shared Three.js renderer/camera/controls/resize/
                        animate-loop boilerplate used by every 3D module
    scene.js            Home page's 3D solar system
    interactions.js     Home page's scale lab / quiz / card-toggle logic
    moon-phases.js       Moon Phases page's system view + Earth view + quiz
    main.js              Home page's entry point
robots.txt
build.py               Builds pages/** + templates/** into public/
```

To add a new page: create `pages/<path>/{meta.json,content.html}`, add any
page-specific JS under `assets/js/`, and add a link in `templates/nav.html`
once the page is ready to be discoverable. Run `python3 build.py`.

## Run locally

```sh
python3 build.py
python3 -m http.server 8000 --directory public
```

Then open `http://localhost:8000/`. (The 3D scenes use ES modules, which
don't load from `file://` — always serve over HTTP.)

## Deploy

Push to `main`. `.github/workflows/gh-pages.yml` runs `python3 build.py`
(no extra setup — GitHub's `ubuntu-latest` runner has Python preinstalled)
and publishes the resulting `public/` folder to GitHub Pages. `build.py`
also regenerates `sitemap.xml` from the current page list.

## Release process

1. Edit data/releases.json to describe a substantive, verified milestone.
   Include its original date, student benefit, teacher limitations, relevant
   learning page links and traceable Git commits.
2. Run the static build, the existing 27-lesson regressions and
   python3 ci/verify_updates.py. Review the student/teacher/developer copy,
   canonical, schema type, link integrity and mobile layout before publishing.
3. Push approved changes to main. GitHub Pages creates the public static
   timeline and the scheduled read-only health workflow checks published pages.
   Health checks **do not** make unsupervised scientific edits or releases.

All updates remain accessible in generated HTML without JavaScript, and
existing lesson URLs, structured data and advertisement rules stay protected.
