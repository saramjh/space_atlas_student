# Space Atlas science visual learning delivery board

Date: 2026-10-28. Scope: lesson-specific dynamic spatial models and interactions. This board documents delivery state, not a claim of a completed site-wide redesign.

## Acceptance contract

Each item must have a specific learner misconception, an input-driven observable output, source-supported physical quantities or an explicitly qualified conceptual model, a no-JS fallback, accessible keyboard/touch/reduced-motion controls, 320/390/800/1280 visual QA and a tested public release. New motion without a causal learning result does not count.

| ID | Priority | Page | Specific experiment / lesson | Status |
| --- | --- | --- | --- | --- |
| BH-001 | P0 | /black-holes/ | Opt-in Three.js 3D disk, observer elevation 15–80°, 20°/80° presets, Schwarzschild mass/radius, shadow vs horizon size guide, finite illustrative gas motion | **Deployed, live verified (a1b51bf)** |
| ECL-002 | P0 | /moon/eclipses/ | Tilt toggle (15° visually exaggerated, real ~5.1°); Sun-aligned vs perpendicular node orientation, synchronized 3D rings and side view, finite opt-in orbital frames | **Implemented, live deployment verification pending** |
| SEA-003 | P0 | /earth/seasons/ | Same June/December scrub changes axial-tilt beam angle and hemisphere evidence | Queued |
| TRA-004 | P1 | /exoplanets/transit-method/ | Planet path crossing star synchronized with simplified ingress/egress light curve | Queued |
| TID-005 | P1 | /moon/tidal-locking/ | Synchronous Moon near-side marker and contrast with nonrotating sphere | Queued |
| GRV-006 | P1 | /solar-system/gravity-and-orbits/ | Change speed and inspect trajectory and velocity/force vectors | Queued |
| TDE-007 | P2 | /moon/tides/ | Spring/neap tidal-force contribution comparison, not local tide prediction | Queued |
| LYR-008 | P2 | /universe/light-year/ | Step through light travel time and distance with explicit scale compression | Queued |
| STR-009 | P2 | /stars/life-cycle/ | Existing stage/branch already interactive; validate specific gap before coding | Audit first |
| SPT-010 | P2 | /astronomy/electromagnetic-spectrum/ | Existing log wavelength interactive; evaluate targeted enhancement | Audit first |
| GAL-011 | P2 | /galaxies/ and cosmology | Inventory current representations before choosing a scientifically defensible interaction | Triage |

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
