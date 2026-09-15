# Space Atlas — Student Reference

Interactive space-science reference site for students in grades 4–8: a 3D solar
system model, a Moon-phases lab, a planetary scale lab, and a guide to reading
space visualizations critically, with links back to NASA/JPL/ESA sources.

Multi-page static site built with a small dependency-free Python script —
no framework, no npm.

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
