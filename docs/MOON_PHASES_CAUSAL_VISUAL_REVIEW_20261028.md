# Moon Phases: causal interactive correction and restrained motion

2026-10-28. Site: /moon/phases/. Outcome: verified scientific/UX repair, not proven pupil-learning effect.

## Observed defects and rationale

Review against the actual compiled site (local 1440×900 and 390×844) and NASA Science Moon Phases / Top Moon Questions:

1. The supposed system Sun was placed at -30 scene units while the visible Moon orbit radius was 9, so the light source was entirely outside the camera. The student was expected to infer its direction from text alone. The top-down view had no visible Earth-to-Moon observer line; the large illuminated disk alongside was disconnected from the small orbit.
2. The Moon texture never turned with orbital angle. That violates the page's own "same face faces Earth" tidal-locking claim. In the idealized fixed-Sun circular model, the designated model near side must turn one model rotation per orbital revolution. This is NOT a claim that 29.53 days equals the Moon's actual 27.3-day sidereal orbit; the frame compresses Earth-Sun motion, inclination, eccentricity and libration, and those limits remain adjacent to the controls.
3. The scene ran a permanent animation loop spinning Earth despite the learner not asking for motion. The actual lunar position was motionless until the slider moved. It lacked a playback affordance and idle-frame budget.
4. The old phase-name thresholds called an approximately 67%-bright disk at 110° "First Quarter". Quarter should be about 50%-bright near 90°, while beyond it the Moon is waxing gibbous.
5. The classroom figure's gold "light direction" arrow passed into the empty panel rather than the Moon ball; the observer's gaze was not shown. A local finite-distance lamp cannot create ideal Sun-parallel rays. At 390px, original SVG labels were illegibly small.

Reference: https://science.nasa.gov/moon/moon-phases/ and https://science.nasa.gov/resource/phases-of-the-moon-2/.

## Implemented, bounded intervention

- A single pure model at assets/js/moon-geometry.js supplies orbital position, illuminated disk fraction, phase age, elongation and idealized tidally locked lunar rotation. Its inverse supplies the same angle when selecting the orbit directly. Nine phase positions and appropriate labels are independently tested; 110° is now Waxing Gibbous, not First Quarter.
- In the existing top-down Three.js scene, mark the Sun as far off-screen left and show sunlight direction as a persistent, readable directional guide. Add a dashed sightline Earth to Moon that changes with angle and reduce ambient spill so the spherical night side is clear. Keep the textured Moon's designated near-side orientation facing Earth.
- Make the orbit itself directly clickable/draggable with a constrained canvas raycaster; keyboard/touch can still use native range and eight named phase buttons. Four intermediate phases are folded into a native accessible details disclosure instead of eight permanent stacked cards. The right-hand disk, name, lit fraction, age and Sun–Earth–Moon angle change together.
- Remove decorative perpetual Earth spin. Playback is entirely opt-in and finite: one simplified model revolution in approximately 24 seconds, user-paused on demand, suspended on manual interaction, hidden tab or completed cycle. With prefers-reduced-motion, playback is disabled while slider and phase buttons still work. No duplicated aria-hidden keyboard-focus target; only the native slider carries keyboard angle control.
- Correct the teacher's **lamp → ball** arrow, show a distinct observer gaze and approximately perpendicular observer sightlines, rotate the illustrated lit hemisphere toward the real lamp. Provide a separate mobile vector arrangement with actual readable diagram labels at 320–390px; keep a device-free two-page printable in sync.
- Static initial Full Moon explanation, CER answer disclosure, NASA links, canonical/JSON-LD, SEO text and original teacher activity remain present without requiring a continuously running animation.
- No new runtime library, framework, external asset/analytics call, speculative learning result or ad placement.

## Validation and measured limits

TDD RED: new independent science gate failed before moon-geometry.js existed. After implementation, moon-geometry invariants check 9 positions (r=9; phase fraction 0/0.146/0.5/0.853/1; phase age; facing vector alignment and model inverse), correct named phases including 110°, invalid input, opt-in motion contract, reduced-motion/visibility handling and observed SVG structure. Previous teacher CER and Jeff Adkins science regressions also pass.

Real browser at 1440×900: clicked 90° First Quarter -> Day 7.4, 50%, solar elongation 90°, dashed line moved to the below-Earth Moon position; clicked Play and after 1.35s reached ~110°, Day 9.0, 67%, with the button changing to Pause and live region off; Pause froze current state. A later test found 115° correctly reports Waxing Gibbous, 71%. Direct pointer drag on the overhead orbit updates the same native slider, moon phase and illuminated fraction. At 390px both the large comparison disk and updated larger-label geometry fit the content column; a stable provider advertisement may still cause separate page-level width overflow, predating these changes.

A 320px reduced-motion browser run verified Play disabled, accessible slider and Last Quarter button working; static no-JS explanations remain available. Separate scientific line-of-sight and physical-sunlight contracts preserved in both diagrams. The graphical representation remains simplified, not a real-time ephemeris or an exact local lamp-light measurement. No measured student comprehension effects are asserted.

## Broader site dynamic-learning audit (not a quota of animations)

Current source inventory shows many lessons already contain buttons or sliders, so merely adding motion everywhere would increase cost without proving learning value. Priority should follow a student misconception and an explicit changed result:

- **P0, Moon Phases (implemented):** physical line-of-sight vs sunlight geometry, animation under user control, eight-phase continuum, readable classroom demonstration. Hardest former bug was scientific/semantic, not missing aesthetic effects.
- **P1, Moon / Eclipses:** make the lunar orbital tilt variable and intersection/near-miss geometry observable together; avoid implying every New/Full alignment eclipses. Preserve existing eclipse simulation and source boundaries.
- **P1, Moon / Tidal Locking:** visibly connect orbital position, near-side orientation and on-Earth observer view through a persistent reference marker; compare deliberate "same side kept" versus a false nonrotating Moon, using one altered variable per experiment.
- **P1, Exoplanets / Transit Method:** connect a movable planet across the stellar disk with the **simultaneous** changing model light curve, allowing students to predict depth, not merely adjust independent sliders. Keep assumptions (uniform stellar brightness, illustrative ingress) explicit.
- **P1, Earth / Seasons:** cross-highlight axial tilt, solar-angle geometry and hemisphere daylight traces for both June and December while preserving the already implemented 0° controlled classroom experiment.
- **P2, Universe / Light-Year and Solar System / Scale:** consider opt-in stepped frame-by-frame light travel or logarithmic scale transitions only where numerical units and bounded motion retain physical truth; existing scale/data controls already teach more than animations would in isolation.
- **Not a motion priority: Stars / Life Cycle and Black Holes:** discrete, vastly different timescales or relativistic light bending are high-risk to animate inaccurately. Keep current sourced static states until a specific falsifiable lesson and scientific test exist.

A future learning-value test should ask consenting educators to predict a phase/geometry, operate the visual, explain why the result changes, and score the conceptual answer. Automated interactions and screenshot aesthetics **cannot** independently establish comprehension improvement.

## Release contract

Preserve original route /moon/phases/, canonical/structured data, NASA citations, static teacher worksheet, AdSense boundaries and unrelated dirty Mac files. Require all site and scientific CI, real 320/390/800/1280 viewport, keyboard/touch/pointer and reduced-motion tests, print-handout 2-page format, deployed Pages verification and source-change history. Do not claim engagement, search or classroom adoption without primary evidence.
