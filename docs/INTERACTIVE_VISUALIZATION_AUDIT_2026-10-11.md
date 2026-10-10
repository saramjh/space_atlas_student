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
