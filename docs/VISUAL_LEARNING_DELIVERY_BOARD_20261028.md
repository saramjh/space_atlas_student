# Space Atlas science visual learning delivery board

Date: 2026-10-28. Scope: lesson-specific dynamic spatial models and interactions. This board documents delivery state, not a claim of a completed site-wide redesign.

## Acceptance contract

Each item must have a specific learner misconception, an input-driven observable output, source-supported physical quantities or an explicitly qualified conceptual model, a no-JS fallback, accessible keyboard/touch/reduced-motion controls, 320/390/800/1280 visual QA and a tested public release. New motion without a causal learning result does not count.

| ID | Priority | Page | Specific experiment / lesson | Status |
| --- | --- | --- | --- | --- |
| BH-001 | P0 | /black-holes/ | Opt-in Three.js 3D disk, observer elevation 15–80°, 20°/80° presets, Schwarzschild mass/radius, shadow vs horizon size guide, finite illustrative gas motion | Implemented, pending public live deployment |
| ECL-002 | P0 | /moon/eclipses/ | Tilt 0° versus ~5° and orbital-node alignment/near-miss, linked top and side views | Queued |
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
