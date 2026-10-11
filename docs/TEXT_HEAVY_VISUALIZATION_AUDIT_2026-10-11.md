# Space Atlas — Text-to-Interaction Coverage Audit
Date: 2026-10-11 KST. This is a *content-level candidate audit*, not a claim every page has been redesigned.

## Context / release discipline

Current 27-page static site already has models/controls on many topics. Earlier waves built evidence-driven spectra, planet interiors/3D exteriors, stellar paths, observed image provenance, and true-size/distance comparisons. The user explicitly asked for **new learning visualizations in remaining text-heavy content**, not another loop polishing the same few pages. Follow the visualization constitution, avoid decorative motion, preserve static explanatory HTML and production ads.

## Inventory and prioritization

| Status | Route | Baseline learning gap | Targeted intervention |
|---|---|---|---|
| Implemented in this batch | /galaxies/milky-way/ | Previous four-stage "zoom" was text-only and claimed the Sun was ~2/3 of the disk radius, inconsistent with cited ~26,000 ly radius within nominal ~50,000 ly disk | Static 320x320 **schematic radial map** + hypothetical location slider (0–50,000 ly), fixed Sun reference at 26,000 ly, center-to-Sun action, numeric fraction; no invented spiral-arm geometry; correct narrative. |
| Implemented in this batch | /galaxies/types/ | Three tiny static galaxy-type SVGs and text could not show how a spiral can lose visible arms when seen edge-on | Geometric projection SVG + inclination slider (0°, 10° ... 80°), axis ratio and side-by-side explanation. Same object, viewpoint changes, not galaxy type. Existing example cards converted to native HTML disclosure. |
| Implemented in this batch | /solar-system/pluto-dwarf-planet/ | A five-row static 3-criterion table listed official IAU outcomes but did not let students apply the logic | Object selector (Earth/Neptune/Pluto/Ceres/Eris), 3 visible criteria, rule outcome and explanation; clarified "cleared" means orbital gravitational dominance, not literally empty orbit, with original official IAU 2006 resolution. Keep table for no-JS/SEO. |
| Next evidence audit | /solar-system/temperature-comparison/ | Chart bars show magnitudes of positive and negative temperatures with no explicit zero baseline; existing text compares airless rocky surfaces and giant atmospheres | Investigate signed temperature chart and meaningful comparison of measurement conditions; avoid presenting unverified greenhouse physics as a controllable simulation. |
| Next evidence audit | /moon/tides/ | Two pre-drawn spring/neap diagrams and a toggle, heavy verbal explanation of differential gravitational force | Evaluate a controlled two-bulge/relative alignment diagram, with explicit model limitations and local timing caveat. |
| Next evidence audit | /solar-system/distance-scale/ | Calculator exists; static true vs compressed distance strips show labels but cannot highlight an inner-planet pair together | Evaluate linked focus across distance tracks, maintain true AU and acknowledge model is intentionally compressed. |
| Lower priority until user evidence | /solar-system/astronomical-unit/, /solar-system/gravity-comparison/, /solar-system/orbital-periods/, /universe/light-year/ | Already functioning conversion, time and gravity calculators; no verified false mental model to fix yet | Audit learning friction and source semantics, not animations for their own sake. |
| Protected by current experiment | /earth/seasons/, /moon/phases/, /universe/scale/ | Rich existing models and separate 3-page teacher-distribution test | Do not expand teacher experiment or unnecessarily replace components before its agreed evaluation. |
| Existing useful special-purpose models | /moon/eclipses/, /moon/tidal-locking/, /solar-system/gravity-and-orbits/, /exoplanets/transit-method/, /black-holes/ | Already interactive/illustrated; no clear new pedagogical priority | Preserve until specific evidence of difficulty. |

## Science and display contracts for newly implemented pages

### Milky Way radial diagram
NASA GSFC https://imagine.gsfc.nasa.gov/science/featured_science/milkyway/index.html states ~100,000 ly diameter and ~26,000 ly Sun-to-center distance. These values imply ~52% of a **nominal** 50,000 ly disk radius, not the previous ~2/3 figure. The model represents only radial distance with uniform units: SVG radius 128 units maps to 50,000 ly, Sun marker cx=226.56 from center 160. Outer galaxy has no sharply measured circle, spiral arms are not plotted, marker selected by slider is **hypothetical**. Changing position must not move actual Sun marker. Keep four-stage text zoom and original NASA reference; quiz wording corrected.

### Galaxy shapes under projection
NASA Science https://science.nasa.gov/universe/galaxies/types/ distinguishes spiral, elliptical and other families, with viewing angle able to obscure spiral arms. NASA Spitzer https://www.nasa.gov/missions/spitzer/nasas-spitzer-spies-a-perfectly-sideways-galaxy/ documents almost exactly edge-on appearance. Native SVG geometric projection uses minor-to-major axis ratio cos(angle) for an **ideal flat circular disk**. Inclination is 0–80 degrees, not a physically reconstructed galaxy or a precise galaxy classification formula. At 80 degrees ratio ~0.1736. Central bulges, dust lanes and observational effects are omitted and explicitly disclosed. Previous examples remain accessible via native <details> and visible in static HTML.

### IAU planet criterion
Official IAU Resolution 5A https://www.iau.org/IAU/Iau/News/PR2006/iau-2006-general-assembly-resolution-votes.aspx and NASA/JPL https://ssd.jpl.nasa.gov/planets/def.html. The three conditions for Solar-System planets are Sun orbit, roughly hydrostatic/round, neighborhood cleared. Earth and Neptune pass; Pluto/Ceres/Eris pass first two and fail the third. This is the official 2006 criterion, with the scientific disagreement explained. The live object selector changes a three-condition display but the preexisting comparative table remains in semantic static HTML with working source links.

## QA expectations

- Complete default + production-with-AdSense builds (27-page CI), specialty legacy tests and new ci/verify_text_visualizations.mjs in GitHub Pages Actions.
- Real Chrome at 320/390/800/1280; browser test slider and presets, Sun marker 26k, classification outcomes, native example keyboard, no horizontal overflow, reduced-motion, no-JS static reading.
- Preserve canonical/H1/JSON-LD and ad boundaries on all three affected routes. No framework or imagery downloads required; page-level native SVG/JS only.
- Do not claim user satisfaction, dwell time, engagement, GSC impressions or SEO uplift until path-specific actual data is measured.
