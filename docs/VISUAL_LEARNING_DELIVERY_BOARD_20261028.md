# Space Atlas science visual learning delivery board

Date: 2026-10-28. Scope: lesson-specific dynamic spatial models and interactions. This board documents delivery state, not a claim of a completed site-wide redesign.

## Acceptance contract

Each item must have a specific learner misconception, an input-driven observable output, source-supported physical quantities or an explicitly qualified conceptual model, a no-JS fallback, accessible keyboard/touch/reduced-motion controls, 320/390/800/1280 visual QA and a tested public release. New motion without a causal learning result does not count.

| ID | Priority | Page | Specific experiment / lesson | Status |
| --- | --- | --- | --- | --- |
| BH-001 | P0 | /black-holes/ | Opt-in Three.js 3D disk, observer elevation 15–80°, 20°/80° presets, Schwarzschild mass/radius, shadow vs horizon size guide, finite illustrative gas motion | **Deployed, live verified (a1b51bf)** |
| ECL-002 | P0 | /moon/eclipses/ | Tilt toggle (15° visually exaggerated, real ~5.1°); Sun-aligned vs perpendicular node orientation, synchronized 3D rings and side view, finite opt-in orbital frames | **Deployed, live verified (0fb5fb2)** |
| SEA-003 | P0 | /earth/seasons/ | Same orbit/tilt state now updates 40° N/S solar-noon altitude and modeled daylight hours; zero tilt compare | **New improvement: deployed and live verified (0d0a7ff)** |
| TRA-004 | P1 | /exoplanets/transit-method/ | Existing quantitative planet vs light curve kept; added user-started 12s full phase playback synchronized to both | **New improvement: deployed and live verified (0d0a7ff)** |
| TID-005 | P1 | /moon/tidal-locking/ | Existing textured 3D Moon marker now linked with a 2D Earth-facing orientation guide and cosine readout | **New improvement: deployed and live verified (0d0a7ff)** |
| GRV-006 | P1 | /solar-system/gravity-and-orbits/ | Existing Newtonian cannonball trajectories now show velocity/gravity arrows and analytic launch forecast | **New improvement: deployed and live verified (0d0a7ff)** |
| TDE-007 | P2 | /moon/tides/ | New lunar/solar contribution and resultant tide-force bars synchronized to the 2D contour/angle | **Wave 3 implemented, deployed and live verified (7c25e05)** |
| LYR-008 | P2 | /universe/light-year/ | New 10-second optional normalized photon journey, linked to physical time estimates, with pause/reduced motion | **Wave 3 implemented, deployed and live verified (7c25e05)** |
| STR-009 | P2 | /stars/life-cycle/ | New finite six-stage pathway stepper with explicitly nonphysical timing and readable controls | **Wave 3 implemented, deployed and live verified (7c25e05)** |
| SPT-010 | P2 | /astronomy/electromagnetic-spectrum/ | New stored reference and actual wavelength vs frequency/energy ratio comparison | **Wave 3 implemented, deployed and live verified (7c25e05)** |
| GAL-011 | P2 | /galaxies/types/ | New opt-in actual Three.js generated 3D spiral star disk, camera tilt, finite angle sweep and SVG fallback | **Wave 3 implemented, deployed and live verified (7c25e05)** |

## BH-001 evidence and limitations

Baseline was a labeled SVG with quiz but no real spatial comparison; its center had an unjustified bright singularity dot. The revision removes the visible singularity dot and provides a complete static schematic by default. Three.js (existing site dependency) loads only when students select Load 3D model. On unsupported WebGL, the static source explanation remains.

The model uses a real 3D spatial disk whose projected minor/major axis ratio is sin(observer elevation); at 20° approximately 0.34, at 80° approximately 0.98. A source-based nonrotating Schwarzschild horizon radius uses 2GM/c²; 10 solar masses gives about 29.5 km, one million gives 2.95 million km. The critical light-path scale is 3 sqrt(3)/2 times event-horizon radius. Mass changes numeric scale, not the normalized appearance.

The glowing lensing guides, gas color and ten-second bounded optional motion are **illustrative** and are NOT general-relativistic photon ray tracing, simulated black hole spin, real orbital velocities, or actual EHT observations. The normal 2D fallback and NASA citations explain this. Sources: https://science.nasa.gov/universe/black-holes/anatomy/ and https://svs.gsfc.nasa.gov/13326/ and https://svs.gsfc.nasa.gov/14619/.

TDD RED lacked the pure model and controls; TDD GREEN tests bounds and physical formulas, lazy Three import, opt-in motion, reduced-motion/static fallback, SEO/JSON-LD, original quiz and ad boundaries. Browser smoke confirmed real 3D, 20°/80° interaction, mass change, horizon-size overlay, reset, 2D fallback and mobile 320/390; 800px real initiated gas animation stopped after ten seconds; reduced-motion disables play and retains manual angle. Rendering is not proof of improved student comprehension.

A preexisting dynamic AdSense unit can create document-level mobile overflow independent of the 3D shell. Do not hide/clip provider advertising to manufacture a responsive pass. Never assert learning-effect gains, SEO gains or site-wide completion from this single wave.


## ECL-002: causal node alignment and linked side view

Previously the 3D model offered a tilt checkbox but the node line was permanently fixed perpendicular to the Sun–Earth alignment. Thus every new and full Moon with tilt enabled missed the plane and a student could not independently test why an eclipse might occur at a node. The old 3D renderer also ran idle continuously.

The new pure model in assets/js/eclipse-geometry.js rotates the circular Moon orbit around a selectable in-plane node axis using 3D rotational geometry. The student chooses node orientation 0–90 degrees: at a modeled new/full conjunction, 0 degrees places the Moon on the ecliptic plane, while 90 degrees places it about 0.26 modeled orbital radii off-plane when the inclination illustration is 15 degrees. The model conserves constant orbital radius. With zero inclination, a unique orbital node line is mathematically undefined and the explanation now says so. A node/plane alignment makes an eclipse **possible, not guaranteed**; actual Sun/Moon sizes, shadow cones, distances, precession and timing are not computed.

The 3D tilted-ring geometry and two intersection markers share the same source model as a separate SVG side-on drawing and explanatory readout. Mobile has a separate enlarged-label 360×230 viewBox; at width320 the SVG fits its column, and the Moon label does not overlap the horizontal ecliptic. The drawn 15-degree inclination is clearly marked as exaggerated versus the real ~5.1 degrees. Source: NASA https://science.nasa.gov/eclipses/geometry/ .

The old unconditional render loop was removed. A user-initiated 12-second Moon cycle can be paused, stops after one revolution, stops in hidden tabs and is disabled on reduced-motion devices; native range/buttons and unchanged 3D scientific view remain operable. No new WebGL dependency, data storage, analytics or paid services. Static no-JavaScript explanation and quiz/SEO remain.

TDD RED absence of the pure node geometry module, GREEN: orbital radius and plane invariants, node-aligned versus misaligned new/full, invalid input and synchronized UI/motion/accessibility contracts. Browser local desktop 1280 and mobile 390/320: 90-degree node at new Moon gives -0.26 modeled radii and off-plane, node0 gives 0 and possible alignment; same at full Moon with flipped offset. The four major widgets and mobile readable SVG are visible. 320 reduced motion disables Play and preserves manual comparison; on an unrestricted 800 screen an actual 12-second user-started orbit returns to paused with live-readout announcements restored. These are technical/visual tests, not direct evidence of student comprehension improvement.

## Verified releases (2026-10-28)

- BH-001: commit a1b51bfdb7006bf96f4362639140dafde7c492b5, Pages run 40682688340, live /black-holes/ loaded 3D only by click, 20° and 80° ratios 0.34 and 0.98, 2D fallback verified.
- ECL-002: commit 0fb5fb2a2405e4b8d536d57b13451f70cda670e4, Pages run 40684631956, live /moon/eclipses/ node 90° offset ~0.26 versus node 0° offset 0 at new Moon with tilted orbit, corrected mobile readout and side view; full 13 Python +22 Node site checks passed.
- Next queued P0 is SEA-003 Earth Seasons. No background execution or completion is claimed for any queued item.


## Wave 2 delivery evidence (2026-10-28)

The previous task stopped after two new features; this wave addresses the remaining nine. Four source changes are new; five others already meet their target through previously deployed interactions. Auditing an existing capability is not new implementation.

- SEA-003: pure solar-declination and spherical-daylength formula; 40°N/S June/Dec noon altitude 73.5°/26.5° and daylight 14.9h/9.1h swap; 0° tilt gives 12h and noon 50°; idle WebGL loop removed. Browser1280/320 and TDD.
- TID-005: pure Moon marker model and linked 2D top view. At 90° orbital phase locked surface marker remains Earthward; hypothetical 3.5-turn spin has dot product -0.71 and marker moves away. Existing Three.js remains, idle loop removed. Browser1280/320 and TDD.
- GRV-006: analytic Newtonian launch forecast: circular/escape thresholds, periapsis/collision and eccentricity for model units; separate instantaneous velocity and central-gravity arrows on Canvas. Arrow lengths normalized, not equal-scale magnitudes. At speed0.5 collision,2.6 near circle,4.5 escape. Browser1280/320 and TDD.
- TRA-004: existing planet/star overlap and light curve synchronized already. Added opt-in12s orbit motion with pause, finite stop and reduced-motion/manual fallback. Browser390 at phase105° blocks1% for radius10%, dims to99%, marker moves then one-cycle stops.
- TDE-007, LYR-008, STR-009, SPT-010, GAL-011: browser exercised actual interaction: tides 90° contour changed to33% ideal forcing; Light-Year Andromeda50% yields ~1.25 million years elapsed/remaining; massive star stage6 endpoint changed; Spectrum Radio1m 300MHz/1.24µeV; Galaxies80° scale ratio0.1736. No rewrite of working lessons solely for 3D quota.

Measured student comprehension and full screen-reader coverage have not been established. Preexisting external mobile AdSense overflow remains separate.


## Wave 2 production verification

- Commit 0d0a7ffcf2ccdf7f9c459165c975cc44cffb2a05; GitHub Pages run 40696768136 SUCCESS for exact SHA.
- Public HTTP200 page/source assets for all four routes and all three new pure model modules; preserved canonical links and source-backed content.
- Real public Chromium at width390: Seasons June 40°N 73.5° noon /14.9h vs 40°S 26.5°/9.1h; December inverted; zero obliquity both 50°/12h.
- Public live Tidal Locking 90° orbital phase: locked surface marker x220 and hypothetical nonlocked x278 with facing dot product -0.71.
- Public live Gravity at speed4.5: Newtonian unbound prediction with 3.68 escape reference; vector toggle checked.
- Public Transit user-started motion advanced phase0→117° and updated planet/light curve state. A prior local browser test inspected phase105° showing a 1% dip and 99% stellar brightness.
- Full 13 Python +26 Node regression and JS syntax checks passed, with four new science/visual gate scripts included in both release and scheduled site health.
- Existing 5 other browser audits are evidence of working prior features, not newly coded changes. Separate provider ad mobile width and measured learner outcomes remain unresolved.


## Wave 3 deployed result (2026-10-28)

All five remaining items TDE-007, LYR-008, STR-009, SPT-010, GAL-011 received actual source changes in commit 7c25e05af9a91110e6cf3bce0e1503dd77a5c7d4, GitHub Pages run 40710617154 SUCCESS with exact SHA. Production site HTML and model JS returned HTTP200. Actual live 390px Chromium verified: tidal bar at 90 degrees 33.3% and rectangular Sun bar, light journey sourced from Proxima Centauri advanced to14% in roughly1.4 seconds, Sun-like star stage sequence advanced toStage3, 550nm-vs100nm spectral energy ratio5.50x and WebGL Galaxy scene loaded at 358px within390px. Local 320/390/1280 screenshots and finite/reduced-motion/fallback tests passed. Production source build and full 13 Python+27 Node+JS syntax pass; CI has required visual_wave3 gate.

The backlog is now 11 of 11 items with new implemented source changes across Waves1,2,3, but this is not an assertion of exhaustive 3D realism or full site visual defect elimination. Explicit future issues: third-party AdSense overflow at320px on tides; SVG nontext path/line occlusion cannot be certified by the text-only 16-route automated audit; real student comprehension improvement unmeasured.
