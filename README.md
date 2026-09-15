# Space Atlas — Student Reference

Interactive space-science reference site for students in grades 4–8: a 3D solar
system model, a planetary scale lab, and a guide to reading space visualizations
critically, with links back to NASA/JPL/ESA sources.

## Structure

```text
space_atlas_student.html   Page markup only
assets/
  css/style.css             All page styles
  js/
    planet-data.js          Planet facts, scale-lab data, quiz bank — the only
                             place numbers need to change
    scene.js                 3D solar system (Three.js)
    interactions.js          Scale lab, quiz, and card-toggle UI logic
    main.js                   Entry point (imports scene.js + interactions.js)
robots.txt
sitemap.xml
```

Edit `assets/js/planet-data.js` to update planetary facts — it's the single
source of truth used by the 3D scene, the scale lab, and the quiz.

## Run locally

No build step. Serve the folder over HTTP (the 3D scene uses ES modules,
which don't load from `file://`):

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/space_atlas_student.html`.

## Deploy

Push to `main`. `.github/workflows/gh-pages.yml` copies the HTML, CSS, JS,
`assets/`, `robots.txt`, and `sitemap.xml` into a `public/` folder (also
creating `index.html` from `space_atlas_student.html` so the site root
resolves) and publishes it to GitHub Pages.
