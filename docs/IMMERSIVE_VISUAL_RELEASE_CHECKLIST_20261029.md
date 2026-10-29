# Space Atlas — cinematic/interactive visual acceptance ledger

Scope: user-reported shortcomings across the student learning experience. This document is **not** a pass certificate: a page is released only after scientific, interaction, accessibility, visual/browser, performance and production URL evidence. Passing an existing build or unit test is not equivalent to meeting the learner-experience goal. Baseline remains a dependency-free, accessible, search-readable science site.

## Reported experience gaps and gates

| Lesson / surface | Specific acceptance signal | Current disposition (2026-10-29) |
|---|---|---|
| Navigation + literal `\\n\\n` | Four identical subject families on desktop/mobile, coherent menu/lesson labels, no escaped head text | **Live verified** in 2c9dbc4 |
| Galaxy types and orientation | Actual direct orbit, scroll/pinch zoom, easing, opt-in stellar motion; disk changes appearance with inclination; 2D fallback | **Implemented and browser-tested in isolated feature branch; not yet released** |
| Eight cosmic zoom-outs | Visually continuous-feeling inward/outward transition, 8 distinct scenes, wheel/pinch/arrows, accurate log ruler retained, scale caveat | **Implemented and browser-tested in isolated feature branch; not yet released** |
| Gravity comparison | Legible same-scale planet surfaces, gravity/radius relation visibly responds to parameters | **Open — aesthetic/interaction acceptance** |
| Kepler third law | Clickable and linked animated orbit/camera with period plot and readable invariant | **Open — local unfinished separate changes; not part of this release** |
| Earth–Moon physical separation | User-driven apparent-camera traversal, returning Earth, incoming Moon, physically honest true-scale reference | **Open — aesthetic/interaction acceptance** |
| Tides | Distinct tidal equilibrium shape vs surface waves; visibly shifting near/far bulges and moon/sun relative alignments | **Open — aesthetic/interaction acceptance** |
| Stellar life cycles | Evolutions are transformations, not just labeled stage dots; uncertainty and discontinuous timescales clearly noted | **Open — aesthetic/interaction acceptance** |
| Black hole accretion | Flowing and turbulent disk, gravitational-lensing explanation, adjustable camera and motion, no claim of GR ray-traced result | **Open — aesthetic/interaction acceptance** |
| Galactic address | Galaxy to Orion Spur to Sun spatial orientation, actual camera/zoom and grounded radial annotations | **Open — aesthetic/interaction acceptance** |
| Exoplanet transit | Immersive star with visibly moving planetary silhouette and synchronized flux dip; correct radius² relation | **Open — aesthetic/interaction acceptance** |
| Electromagnetic spectrum | Parameter-driven wavelength/frequency/energy visual effects, true logarithmic spectrum and UV/X-ray invisibility clarified | **Open — aesthetic/interaction acceptance** |
| Light travel and lookback time | Source-specific photon journey with meaningful departure/arrival space and timeline; no physically false travel-speed implication | **Open — local unfinished separate changes; not part of this release** |
| Solar system size vs orbital distance | Camera scale changes make why one static diagram cannot show both visually obvious, with linked true-scale reference | **Open — aesthetic/interaction acceptance** |
| Space-resource quick picker | Distinct evidence-based iconography/visual mapping rather than text-only choices; accessible links | **Open — aesthetic/interaction acceptance** |
| Global quality / 3D device tiers | Thoughtful lighting, depth/shadows, opt-in loading, touch/mouse separation, responsive FOV, memory/battery and no-JS fallback | **Partially applied, no sitewide clearance** |
| All-page release performance | On-device 320/390/tablet/desktop verification, no horizontal overflow unrelated to provider ads, reduced motion, repeatable 60fps target or documented 30fps fallback | **Open — device benchmark not yet recorded** |

## Release evidence required for every item

- User's observed failure / learner question, scientific sources and all non-scale disclaimers.
- Source diff and executable focused tests; static HTML intact, 29 canonical URLs stable, analytics/ads unchanged.
- Actual browser interaction including pointer, keyboard, 320/390px, desktop and reduced motion; document root and component overflow differentiated from injected provider advertisements.
- Resource measurements (texture bytes, mesh/particle tier, DPR, script/load/JS heap, FPS and long tasks) on **real low-end phones** before claiming 60fps or production-level performance.
- Isolated scoped commit, GitHub Pages CI, live route validation and separately recorded unresolved issues. No 'all resolved' based solely on 49 automated gates.

## Initial cinematic release — design and science decision

Galaxy types: already opt-in Three.js, so add accessible orbit/zoom controls with damping; a deterministic illustrative star disk + soft custom GPU star sprites avoids a heavyweight bloom pipeline. Apparent classification varies with inclination while the galaxy itself remains spiral. Optional differential drift is exaggerated conceptual motion, not real measured star trajectories or time. Coarse-pointer devices use approximately one third as many points and DPR capped at 1.25; desktop 1.75. GPU/CPU usage is constrained to user-initiated motion and camera decay. Model loading failures restore labeled 2D.

Universe scale: use a self-contained local Canvas2D visual layer, no extra network dependency. All eight scenes are *artist illustrations* (humans / Earth / Earth–Moon / Solar System / Proxima / Milky Way / Local Group / cosmic web). Scene changes look like zoom-out/in, not a precise contiguous spatial zoom; the numerical model remains the original log ruler. Pointer/wheel/pinch/keyboard inputs share a synchronized state with text and numbers. Respect reduced-motion and do not draw continuously when idle; close at final scale boundary allows normal page scrolling.

**Do not equate the visual QA of these two pages with the user's requested Awwwards-level sitewide completion.**
