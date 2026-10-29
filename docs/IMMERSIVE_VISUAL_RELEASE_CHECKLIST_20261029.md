# Space Atlas — cinematic/interactive visual acceptance ledger

Scope: user-reported shortcomings across the student learning experience. This document is **not** a pass certificate: a page is released only after scientific, interaction, accessibility, visual/browser, performance and production URL evidence. Passing an existing build or unit test is not equivalent to meeting the learner-experience goal. Baseline remains a dependency-free, accessible, search-readable science site.

## Reported experience gaps and gates

| Lesson / surface | Specific acceptance signal | Current disposition (2026-10-29) |
|---|---|---|
| Navigation + literal `\\n\\n` | Four identical subject families on desktop/mobile, coherent menu/lesson labels, no escaped head text | **Live verified** in 2c9dbc4 |
| Galaxy types and orientation | Actual direct orbit, scroll/pinch zoom, easing, opt-in stellar motion; disk changes appearance with inclination; 2D fallback | **Published c6c3e89; Pages CI success, live 3D/browser confirmed** |
| Eight cosmic zoom-outs | Visually continuous-feeling inward/outward transition, 8 distinct scenes, wheel/pinch/arrows, accurate log ruler retained, scale caveat | **Published c6c3e89; Pages CI success, live 3D/browser confirmed** |
| Gravity comparison | Legible same-scale planet surfaces, gravity/radius relation visibly responds to parameters | **Opt-in 3D test-bench and Newtonian radial probe implemented; browser/live validation pending** |
| Kepler third law | Clickable and linked animated orbit/camera with period plot and readable invariant | **Open — local unfinished separate changes; not part of this release** |
| Earth–Moon physical separation | User-driven apparent-camera traversal, returning Earth, incoming Moon, physically honest true-scale reference | **Opt-in 3D Earth–Moon cinematic flight implemented; browser/live evidence pending** |
| Tides | Distinct tidal equilibrium shape vs surface waves; visibly shifting near/far bulges and moon/sun relative alignments | **New opt-in physical equilibrium shell and rotating observer implemented; browser/live evidence pending** |
| Stellar life cycles | Evolutions are transformations, not just labeled stage dots; uncertainty and discontinuous timescales clearly noted | **Stage-specific painted evolution implemented and local browser-tested; live verification pending** |
| Black hole accretion | Flowing and turbulent disk, gravitational-lensing explanation, adjustable camera and motion, no claim of GR ray-traced result | **Published 4890f5b; Pages CI success, live WebGL and zoom confirmed** |
| Galactic address | Galaxy to Orion Spur to Sun spatial orientation, actual camera/zoom and grounded radial annotations | **Opt-in spatial barred-spiral and Sun 26k ly location implemented; browser/live evidence pending** |
| Exoplanet transit | Immersive star with visibly moving planetary silhouette and synchronized flux dip; correct radius² relation | **Published 4890f5b; Pages CI success, live focus/return confirmed** |
| Electromagnetic spectrum | Parameter-driven wavelength/frequency/energy visual effects, true logarithmic spectrum and UV/X-ray invisibility clarified | **Parameter-driven light-beam effect integrated; browser/live evidence pending** |
| Light travel and lookback time | Source-specific photon journey with meaningful departure/arrival space and timeline; no physically false travel-speed implication | **Open — local unfinished separate changes; not part of this release** |
| Solar system size vs orbital distance | Camera scale changes make why one static diagram cannot show both visually obvious, with linked true-scale reference | **Open — aesthetic/interaction acceptance** |
| Space-resource quick picker | Distinct evidence-based iconography/visual mapping rather than text-only choices; accessible links | **Five purpose-linked semantic SVG cues, clickable accessible source expansion locally tested; live verification pending** |
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

## Follow-up black-hole disk interaction (second scoped change)

The existing black-hole 3D diagram already exposes optical explanatory guides and an opt-in bounded animation. New controls allow wheel/pinch/keyboard-button zoom while its original elevation/mass scientific reference remains unchanged. A richer gas shader uses radial angular shear, filament waves and bounded bright knots; it is explicitly a non-relativistic, highly compressed illustration, **not ray tracing**, measured gas temperature, an actual observation or a physical 10-second orbital period. Pinch-only gesture capture is limited to the visible canvas; reduced-motion keeps the gas animation unavailable but camera buttons usable. The renderer caps DPR at 1.25 for coarse-pointer devices and 1.75 for desktops. Keep the labeled 2D fallback and avoid extra external assets.

## Follow-up exoplanet transit interaction (second scoped change)

The existing analytic light curve remains coupled to planetary disk overlap: the profile remains uniform-brightness, no limb darkening/noise and the depth is (planet radius / stellar radius)². Its star surface now has a richer **illustrative** glow/gradient/corona and a native zoom-focus control that changes the SVG viewBox with a bounded easing animation. Controls also work with reduced motion, without JS, or when no animation is possible; the fallback remains the original linked sky projection, numeric controls and fixed-range light curve. No new library/assets. Important: the richly shaded rendered star is only an educational appearance; it is **not a calculation of stellar limb darkening**.

## Follow-up stellar / guide field-design (2026-10-29)

Stellar: lightweight deterministic Canvas2D scene with six visually distinct states per pathway (nebula, protostar, fusion-bearing star, swollen giant, ejected shell / possible supernova, white dwarf / possible compact remnant). Stage selection controls the depiction and process text, while the pre-rendered accessible SVG default and all original pathway controls/SEO information remain. Transitions are bounded to 630ms, can stop on page hide, honor reduced motion and DPR tier, and do not continuously animate idle states. All colors, diameters and relative stage transition times are *artist concepts*, not sampled stellar data, radii or actual lifetimes. Massive-star remnant rendering is one illustrative possibility, not a deterministic black-hole prediction.

Resources: avoid stock or unrelated illustrations; use five original line-drawn education icons with visible purpose labels and `<details>` expansion to the preserved official NASA/JPL/ESA external resources. Small screens use single-column tap targets. No additional data fetch or animation library.

## Milky Way spatial address, follow-up

Reused existing lazy-loaded Three.js GPU spiral galaxy star disk without copying engine logic. The optional `galacticAddress` mode adds a fixed teal Sun/Orion Spur reference at 26,000/50,000 of a nominal radial scene length, plus a separate moving orange *hypothetical location marker* driven by the existing physical-distance slider. Galaxy overview and Sun focus are independently operable with drag, pinch, wheel, keyboard buttons and stage 1–4 narration. Damping, DPR tiers, reduced motion, 2D radial ruler, NASA science source and no-JS fallback preserved. **The star/arm positions, orientation, camera geometry and sharp radial boundary are intentionally illustrative, not an observed 3D map**; only 26,000 ly from the galactic center is treated as approximate scientific reference.

## Earth–Moon cinematic flight in fourth scoped change

The existing 1:1 relative size/separation scroll ruler remains an accessible secondary `<details>` reference. The primary opt-in Three.js experience illustrates approaching the Moon from Earth using physically proportional Earth radius=6,378 km, Moon radius≈1,737 km, and nominal separations (363,300/384,400/405,500 km). A NASA Blue Marble texture is sourced from the already licensed compact local asset; the primary lunar texture is an optimized NASA SVS CGI Moon Kit LROC global map (NASA SVS / Ernie Wright, `https://svs.gsfc.nasa.gov/4720/`), with procedural crater rendering only as a fallback; neither texture is live imagery. Progressive local loader/error fallback, bounded 12.5 s user-initiated travel, fraction slider, keyboard-native Earth/Moon controls, wheel/pinch and pointer view, reduced motion, visibility stop, touch-action isolation, dynamic portrait FOV and DPR device tiering are in place. The camera flight path and playback duration are deliberately choreographed: the readout is a *nominal fraction of center separation*, **not actual spacecraft position, speed, live lunar orbit or an exact Moon phase**.

### Mobile provider-ad exception observed during browser verification

At 320px, the Earth–Moon lesson document scrollWidth reached 645px because AdSense injected an `aswift_1` iframe with width 970px positioned at x=-325. With advertisement `ins.adsbygoogle` hidden **only inside a local QA browser** for isolation, the document scrollWidth returned to 320px. This does not imply the advertisement is safe to hide, clip or resize in production; no AdSense layout/analytics code or ad unit configuration was altered. The user-owned cinematic canvas fits within 280px and at 390px the entire production variant fits the viewport. Record as an independent provider-ad mobile defect requiring a compliant provider/layout review before claiming sitewide no-overflow.

## Gravity mass–radius experimental 3D test bench (2026-10-30)

Existing calculator and mathematical g/gEarth=M/R² diagram kept intact for science, without-JS and SEO integrity. New Three.js on-demand scene uses one Earth-radius physical reference sphere at fixed world size, a rescaled model planet under identical world units, bounded inertial mouse/touch camera with adaptive framing/DPR, and a probe dropped from a fixed 0.65 Earth radii above the idealized surface. Simulation integrates the Newtonian radial inverse-square field using bounded fixed symplectic Euler steps, with compressed *illustrative* time, not an observed fall speed/duration. Jupiter-like planets have no hard surface; we model a reference pressure-level spherical radius only. Native camera, launch/pause/reset buttons, progressive loader/error fallback and reduced-motion disablement retain the pedagogic comparison while providing interactive visual motion. No observed texture or fake 3D planetary photographic claim.

## Electromagnetic spectrum variable-driven ray effect (2026-10-30)

Original wave, precise logarithmic wavelength ruler, calculated frequency/energy and reference comparator remain unchanged and fully static-readable. Added an on-page, GPU-free CSS ray visualization with one readable explanatory paragraph below it. The hue for *visible* 400–700 nm wavelengths changes continuously from violet toward red as wavelength increases; color sampling is qualitative HSL, **not a calibrated optical color measurement**. Invisible radio/microwave/IR/UV/X-ray/gamma selections use explicitly assigned **false colors**. Visual glow energy, particulate positions and speed are not physical photon intensity, sample counts, physical frequency or observed radiation. Motion only starts on user clicking the existing Play button; reduced-motion stops all beam and waveform animations, and mobile turns off the expensive ray sweep. No runtime dependencies or external images. Existing 14-decade log scale is the authoritative proportional display.

## Tide equilibrium shell and observer rotation (2026-10-30)

The earlier NOAA-sourced 2:1 lunar-to-solar quadrupole force diagram and slider are preserved verbatim. A new opt-in Three.js Earth model keeps a rigid NASA-Blue-Marble-textured inner globe distinct from a translucent independently deformed equilibrium tidal shell. Water-shell radial geometry is a heavily exaggerated spherical Legendre P2 quadrupole (Moon factor 0.13, Sun 0.065), always outside rigid Earth and with symmetric near/far maxima. Moon–Sun alignment slider updates both exact existing SVG/force bars and 3D shell. A movable observer marker crosses two high-tide directions in one conceptual full rotation; optional 12s playback is compressed *teaching time*, not an actual lunar day or a coastal tide prediction. Moon/Sun sizes/distances are schematic and shell ripples are NOT surface waves or real ocean-height/volume simulations. Motion is opt-in, reduced-motion disables automatic observer rotation, mobile DPR/touch and no-JS fallback retained.
