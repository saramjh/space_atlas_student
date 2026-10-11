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

## 2026-10-11 P3: Remaining text-heavy visualization candidates implemented (all three)

User's “모두 개선 ㄱㄱ” refers to the final three explicit high-value items in the previous audit. Bounded scope: `/solar-system/temperature-comparison/`, `/moon/tides/`, `/solar-system/distance-scale/`. Existing 27-page SEO architecture and unrelated dirty files left alone. These changes are explanatory models with feedback, not decorative motion or fabricated predictions.

### 1. Temperature: corrected sign, origin, and evidence comparability

- Baseline rendered absolute heights `abs(tempC)` of negative planets next to positive bars. Although colored, heights obscured direction and magnitudes with respect to the common 0°C reference. New 8-row diverging **horizontal signed linear axis −250…+500°C**, zero clearly marked, color represents sign and width proportional to (value−zero), two native select controls make named numeric comparison. Default Venus +464°C vs Mercury +167°C means Venus **297°C** warmer. Other pairs update a clear difference and the distinct measurement reference.
- Critical scientifically accurate disclosure: NASA's `Solar System Temperatures` uses means over Mercury/Venus/Earth/Mars **rocky surfaces**, while Jupiter/Saturn/Uranus/Neptune refer to pressure approximately **1 bar in their atmospheres**, not nonexistent solid surfaces. Mercury's mean conceals extreme day/night variation. Server-rendered 8-entry factual table is always available without JS, with explicit source and reference. Source https://science.nasa.gov/resource/solar-system-temperatures/ and https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html, direct NASA definitions.
- Mobile 320px: original four numeric axis labels collided; fixed with staggered −250, 0, +500 indicators, hidden +250 tick on very narrow widths without changing the linear metric or zero coordinate. Browser geometry checked zero label center and actual zero line at x152.33; chart static explanatory text unchanged.

### 2. Moon tides: differential tidal-force composition (not an ocean forecast)

- Baseline had only two fixed spring/neap endpoint sketches with a toggle; no way to explain variable phase angle or intermediate tidal patterns. Added user-controlled **0°–90° alignment range** plus spring(0), intermediate(45), neap(90) presets and a responsive SVG conceptual Earth ocean bulge diagram with movable Moon and fixed Sun.
- Explicit mathematical idealization: `r(theta)=70 + 12*cos(2*(theta - alpha)) + 6*cos(2*theta)` in *SVG display units only*, using NOAA approximate **solar tide-raising effect ≈ half lunar**. Dynamic relative contrast for educational shape magnitude `100*|S+L exp(i2α)|/(L+S)` yields 100% at aligned 0°, ~75% at 45°, 33% at neap 90°. These are NOT measured ocean heights, probabilities, or local tidal predictions. No continuous simulation or actual real-time ephemeris. Controls synchronize existing spring/neap example panels at the two endpoints.
- NOAA: https://oceanservice.noaa.gov/education/tutorial_tides/tides06_variations.html and https://www.noaa.gov/education/resource-collections/ocean-coasts/tides. Explicit warning for continents, oceans, lag, phase, variable lunar distances, uneven local high tides. Minor clarity correction: lunar day is about 24h50 rather than the misleading 24h phrase.

### 3. Distance model: selected planet tracked in two distinct coordinates

- Baseline true-distance and compressed scene labels were entirely static. Added one native planet selector with **two coupled rulers** and numerical readout: physical NASA-based average orbit radius in AU / Neptune 30.05 AU and actual Space Atlas *illustrative* scene orbit radius / Neptune 45 scene units. Data pulled from single existing `PLANETS` source (`p.au` and `p.orbit`). Jupiter example 5.20 AU=17.30% of true ruler vs scene r24=53.33%; Earth 1 AU=3.33% vs scene r14=31.11%; Mercury 0.39 AU=1.30% vs scene r7.5=16.67%. Honest linear *within each ruler*, no fake uniform conversion between two axes. Variable orbital distances and conceptual planet sizes labeled clearly. Static original two tracks and educational text remain fully legible without JS. Source https://nssdc.gsfc.nasa.gov/planetary/factsheet/.
- Retains original physical-scale classroom calculator and all preexisting nav/URL/static/canonical/H1/JSON-LD/AdSense contract.

### Global minor factual correction

The shared home `assets/js/planet-data.js` quiz had an incorrect equality “11.2³≈1321” derived from Jupiter **equatorial** diameter while NASA ~1321 Earth volumes uses **mean** radii because Jupiter is oblate. Fixed misleading sentence to explicitly say mean-radius-derived Earth-volume equivalents rather than literal sphere packing; data values unchanged.

### Verification / delivery gates

- Added `ci/verify_remaining_visualizations.mjs` testing **actual page-module behaviors in DOM mocks**, temperature signed physical sign and ~297°C difference, 0°/45°/90° tidal-force model and 2:1 contribution, two physical-vs-conceptual distance coordinates, and canonical/H1/JSON-LD/static source evidence.
- Added to GitHub Pages CI workflow. Local default 27/27 pages, every prior specialized CI suite, JS syntax pass, diff check. Mobile Chrome 320 temp and 390 tide/distance, 1280 desktop all three with no page-level horizontal overflow. Browser inspected screenshots for three and fixed the 320px axis label collision; zero centered exactly at plotted zero x152.33 after fix.
- Production ADSENSE_ENABLED=1 / SITE_BASE=/space_atlas_student full regression, scoped commit, Pages deploy success and live browser QA still need to be performed **before** claiming released.
