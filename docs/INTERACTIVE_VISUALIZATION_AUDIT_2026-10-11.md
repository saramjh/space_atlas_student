# Space Atlas Interactive Visualization Audit — 2026-10-11 KST

Scope: current local branch `main` (initial HEAD `7527210`). This is an **implementation/triage** note, not an inferred growth result. No user engagement change yet established.

## Verified inventory

- Python static-site builder, 27 topic pages; 26 have a page-specific JavaScript entry, while the resources list is intentionally static.
- Existing assets: native SVG, CSS, JS, Three.js import map and per-topic models. Existing SEO: static source HTML, canonical, JSON-LD LearningResource and breadcrumbs, sitemap, URL-prefixed deployment. Existing CI: `ci/verify_build.py` plus JS syntax checks.
- Project convention forbids generic redesign, expensive runtime dependencies, invented claims and uncontrolled advertising. Locally installed specialist skills already cover front-end editorial design, accessibility guidance, and agent-browser QA.
- Existing teacher distribution experiment is limited to Earth Seasons, Moon Phases and Universe Scale until the 2026-10-21 gate; **do not interpret** the new scientific visualization work as permission to expand teacher experiment.
- Baseline working tree had unrelated changes in .gitignore, README.md and untracked local context/reports/scripts/AGENTS/CLAUDE; preserve these.

## Priority by learner outcome

| Priority | Content | Observed issue / opportunity | Proposed or completed change | Scientific risk |
|---|---|---|---|---|
| P0 pilot | `/astronomy/electromagnetic-spectrum/` | Prior uniform seven-band color bar visually implied equal intervals despite visible light being a tiny sliver; existing slider only selected seven descriptions. | **Implemented locally** continuous 14-decade log wavelength ruler, linked frequency/photon energy, 7 sample buttons, optional illustrative wave animation, NASA ranges/table, no-JS explanatory material. | NASA regions are approximate, continuum has no rigid boundaries; wave cycles explicitly not to scale. |
| P1 investigation | `/solar-system/planet-types/` | Three permanently static circular cross-sections invite false inferences about layer thickness and interior certainty. | Evaluate clickable regions with composition labels and **uncertainty** notes; keep model/not-to-scale label. No numerical core ratios unless well sourced. | Interiors are inferred/model-dependent, sharp layer edges misleading. |
| P1 investigation | `/stars/life-cycle/` | Two fixed six-stage sequences with a simple toggle; readers cannot explore relative durations and branches. | Consider a keyboard-accessible selectable stage/timeline with human-readable timescale comparisons only where NASA-supported. Preserve two-path caveat. | Fate thresholds and evolution are approximate, not a deterministic two-bin law. |
| P1 investigation | `/learn/read-space-images/` | Illustrative SVG triptych and disclosure-style examples (already partly interactive) may not make image provenance differences obvious. | Consider observation/model/illustration comparison with explicit instrument/data-processing provenance. Do not fabricate real science images. | Rights, attribution, and false-color interpretation. |
| P2 | `/moon/earth-moon-scale/` and `/universe/scale/` | Existing special interactions; review their mobile discovery cues and physical scale caveats before rewriting. | Measure user friction first, avoid replacement solely for motion. | False scale, performance and experiment collision. |
| Defer | Remaining already-interactive models | No verified misconception or UX failure yet. | Only audit after prioritized pages; do not mass-animate 27 pages. | Search/performance disruption without learning benefit. |

## Pilot evidence and outputs

- Scientific range reference: NASA GSFC, `https://imagine.gsfc.nasa.gov/science/toolbox/spectrum_chart.html` (radio >0.1 m, microwave 1 mm–0.1 m, infrared 700 nm–1 mm, visible 400–700 nm, UV 10–400 nm, X-ray 0.01–10 nm, gamma <0.01 nm). Exact SI speed of light/Planck constant/elementary charge used for numeric readout.
- Domain explicitly clipped to 10 m → 0.1 pm (14 decades). Log-space visible width `log10(700/400) / 14 ≈ 1.74%`; this is a **fraction of the displayed logarithmic axis**, not a physical fraction of all EM radiation.
- Source files modified: `pages/astronomy/electromagnetic-spectrum/content.html`, `assets/js/electromagnetic-spectrum.js`, `assets/css/style.css`.
- Verified during implementation: 27-page local/production builds and `ci/verify_build.py` both passed, Node JS syntax passed; Chrome mobile viewport 390px showed no document horizontal overflow; browser clicking sample Radio 1 m returned 300 MHz / 1.24 µeV and Gamma 1 pm returned 1.24 MeV. No engagement lift claim.
- Motion is opt-in. Preview wave count is conceptual and does not physically scale with wavelength; value calculation does.
- Follow-up gates verified: dependency-free `ci/verify_spectrum.mjs` tests seven sample calculations, slider endpoints, animation pause and reduced-motion response, and static HTML SEO markers; it runs in Pages CI. Agent-browser at 320px, 390px, and 1280px showed no document-level horizontal overflow. At 320px with reduced-motion enabled, motion control was disabled; with reduced-motion disabled, user-triggered motion control entered the playing state. Desktop and mobile screenshots were captured locally for QA. Pilot deployed in commit `362ae9b` (GitHub Pages run 38073869928 succeeded); confirmed live HTTPS behavior and canonical/JSON-LD.

## Decisions

Keep existing Python/vanilla JavaScript/Three.js architecture. Do not install Remotion, animation framework, or visual library merely for appearance; native SVG/path manipulation matches current content and size constraints. Use agent-browser for real QA and design skills for reviewed patterns. Guard SEO/GEO and static text as first-class product surfaces.

## Follow-up measurement

After release, evaluate GSC **path-specific** impressions/clicks, GA4/analytics isolated to `/space_atlas_student/`, and meaningful model interactions rather than treating raw page events as sessions. Compare before/after only over sufficient observation periods; do not promise ranking or revenue increase. Existing teacher-distribution outcome must be evaluated separately.


## P1 implementation — interior evidence comparison and stellar-stage explorer (2026-10-11)

### Planet interiors

Source: `pages/solar-system/planet-types/content.html`, `assets/js/planet-types.js`, shared CSS.
- Fixed prior suggestion of a universally small, solid Jupiter core. The Jupiter example now describes Juno-compatible *dilute/fuzzy* central material and no true solid surface.
- Three synchronized learner controls compare the outer, deep and central regions across representative Earth, Jupiter and Neptune. Region descriptions distinguish direct and indirect evidence. Actual layer proportions are *not encoded* into decorative circles.
- Planet cross-sections are labeled **conceptual / not to scale**. Gas and ice giant radial gradients imply transitions instead of solid, precise shells. A meaningful static HTML explanation survives without JavaScript.
- NASA primary references in-page:
  - https://science.nasa.gov/earth/facts/
  - https://science.nasa.gov/jupiter/jupiter-facts/
  - https://science.nasa.gov/neptune/neptune-facts/

### Stellar evolutionary stages

Source: `pages/stars/life-cycle/content.html`, `pages/stars/life-cycle/meta.json`, `assets/js/star-life-cycle.js`, shared CSS.
- Six selectable stages per representative Sun-like and massive-star pathway; the current step is preserved when switching branches to make the different endpoints visible.
- Details identify **physical cause** and the transition, with previous/next controls, accessible pressed states, keyboard focus preservation and a pre-rendered Sun-like sequence/description as a no-JS fallback.
- Static approximate total lifetimes are compared (~10 billion years vs only a few million for very massive stars), explicitly **not** a time-proportional timeline.
- Corrected prior overly deterministic mass wording. Different stellar winds, binary histories and core evolution can change path; not every massive star follows one strict six-step red-supergiant/supernova track.
- NASA references in-page:
  - https://science.nasa.gov/universe/stars/
  - https://science.nasa.gov/asset/webb/life-cycles-of-sun-like-and-massive-stars/

### Quality and release

- P1 test: `ci/verify_p1_visuals.mjs` (actual page-model state changes, selected branch, physically accurate descriptions, static HTML and SEO protections), added to GitHub Pages CI.
- Browser tests: 320px & 390px mobile, 800px tablet, 1280px desktop. At 320px and 390px the document did not horizontally overflow. Planet center and deep controls changed all three model descriptions correctly, including keyboard selection. Stellar keyboard selection retained focus and branch switching preserved the selected ordinal stage. Reduced-motion setting turned CSS ring transition off. Desktop and mobile screenshots visually inspected.
- No new runtime dependencies, paid services or asset downloads. Unrelated existing dirty local files remain outside this work.
- Do not infer search ranking, user satisfaction, or GA4 improvement from these tests. Validate again after deployed release.

### Post-deploy operability fix

The first production Chrome pass on the stellar explorer revealed that switching mass after selecting a lower stage could place the earlier mass button under the sticky site header during automated scroll-to-control. Native browser scrolling up made the control clickable. Added targeted `scroll-margin-top:110px` to the mass-toggle buttons so automatic scrolling respects the header; local Chrome reproduced and confirmed direct stage-5 → mass-switch click succeeded with the toggle visibly below the header. No change to nav layout, route, content or astronomy model.

### In-place pathway comparison follow-up

A fresh production browser session showed that the earlier CSS scroll-margin fix alone did **not** consistently prevent an automated click targeting a mass button positioned behind the site’s sticky header. Normal deliberate upward scrolling allowed the click, but making learners scroll back up just to compare the same evolutionary stage is unnecessary friction. The existing selected-stage panel now includes an in-place `Compare this stage` control that switches between Sun-like and massive pathways **without moving the reader away from the explanation**. The former top-level mass toggle remains for initial selection. The dependency-free P1 regression now checks both the original toggle and the in-panel comparison action; Chrome at 320px confirmed stage 5 Sun-like → massive branch at stage 5, with no horizontal overflow. The earlier scroll-margin remains a minor scroll/focus improvement, not the sole fix.

## P2 — Reading Space Images: provenance-led observational comparison (2026-10-11)

**Learner question:** Why do two real astronomical images of the same target appear different? The previous page explained observation / model / illustration with abstract decorative SVGs and three disclosure descriptions, but did not let the learner examine actual image evidence.

**Scientific source and rights:** NASA official source https://science.nasa.gov/asset/webb/pillars-of-creation-hubble-and-webb-images-side-by-side/ (published October 19, 2022; metadata/credits updated Sep 2026). Hubble WFC3/UVIS, September 2014, filters F502N (blue), F657N (green), F673N (red). Webb NIRCam, Aug 14 2022, filters F090W (purple), F187N (blue), F200W (cyan), F335M (yellow), F444W (orange), F470N (red). Official page says Hubble emphasizes dust, Webb near infrared reveals more stars and dust structure. This is *not* a temporal before/after or a natural-color single photograph. NASA image color-method explainer https://science.nasa.gov/mission/webb/science-overview/science-explainers/how-are-webbs-full-color-images-made/ . NASA image/media editorial usage https://www.nasa.gov/nasa-brand-center/images-and-media/ and ESA educational/editorial license terms https://www.esa.int/ESA_Multimedia/Terms_and_conditions_of_use_of_images_and_videos_available_on_the_esa_website. Credit on-page explicitly names NASA, ESA, CSA, STScI, Hubble Heritage Project and processing credits; no endorsement.

**Asset provenance:** downloaded NASA official downloadable 2000×966 PNG, based on reference STScI-01GFNQZAFP4YXE5X0JB9SXBFD9, to a temporary directory. Local bundled file assets/images/pillars-hubble-webb-compare.webp is a 1600×773 WebP resize of NASA's paired image using installed cwebp -q 78. The pixel content was not recolored, registered, AI-generated or fabricated. Image is ~169 KiB, allowing fast lazy-loaded educational visual without external runtime fetches. No NASA or ESA logo introduced. Original NASA source and full credits linked on-page. Do not change claims to imply equal observation dates or precise per-pixel alignment.

**Experience:** the user can switch between entire side-by-side NASA composite, magnified Hubble left view and magnified Webb right view. Modes use CSS crop of the same sourced file, not simulated data. Description identifies instrument, date, observed wavelengths, displayed color assignments and scientific information gained from dust penetration. A fully static table (and default side-by-side image) remains in built HTML if JS is unavailable. Three prior click/keyboard role=button cards were simplified to native details/summary disclosures so accessibility and no-JS evidence examples work. Decorative SVG motion is stopped (there is no instructional reason to animate them).

**Architecture:** one existing page-specific JS module, shared CSS, static HTML and one local compact image; no framework, animation dependency or API. Existing canonical/H1/JSON-LD, site layout, advertising slots and 3-page classroom-share experiment remain unchanged. Read-space-images already has two controlled ad units, whose markers were not moved outside their content boundaries.

**Verification:** default build 27/27, existing spectrum and P1 tests, new CI image provenance test for modes/state/static HTML/credits/asset size. Real agent-browser: desktop 1280 image switching confirmed, native disclosure keyboard Enter worked, mobile 320 initial load showed no horizontal overflow and produced NASA image + correct Webb source readout. Review mobile and production variants again at the final release gate. No search traffic or user satisfaction improvement claim is supported yet.

### P2 pre-release verification notes

- Default and production `SITE_BASE=/space_atlas_student ADSENSE_ENABLED=1` builds: 27/27 site regression; image provenance test and prior electromagnetic spectrum / P1 tests all passed, JavaScript syntax and git diff check passed. Existing page renders one canonical, one JSON-LD, one H1, and the two pre-existing controlled advertisement slots.
- With a locally served **default-path** build, 320px and 390px Chrome had `documentElement.scrollWidth === innerWidth`; 800px likewise 800px. A misleading temporary failure was caused by serving a production subpath build at a root `/learn/` test URL, which prevented CSS/JS/image loading; not a legitimate site regression. Test environments must match `SITE_BASE`.
- Real Chrome confirms 1600px source image loaded on 390px after scrolling to the lazy-loaded asset, Hubble focus updates actual display to 2× within clip and mode readout, and Webb mode works at 800px. Native disclosure `<details><summary>` opens via keyboard Enter with focus retained; decorative animation is disabled even without reduced-motion preference. Reduced-motion preference also honored.
- A source-backed image differs from a simulation or a standalone artist concept, and the UI states that both observations use assigned-color composites and were taken in different years; do not infer an eight-year morphological change from this side-by-side display.
