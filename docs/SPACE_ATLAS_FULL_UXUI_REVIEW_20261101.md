# Space Atlas — sitewide learning-flow and UI review (2026-11-01)

## Coverage and methodology

All 31 published routes were inventoried. Every one of 28 interactive routes was opened in a real Chromium browser and a representative action was executed. All 28 were captured in narrow-mobile screenshots for visual review. Three reading/navigation routes were checked for primary heading, readable text, links, and document overflow.

The comparison covers mobile 320×568 and 390×667, with supplemental desktop 1280×800 task/scene geometry. It does not purport to test every control state, screen reader, or physical-device GPU.

## Accepted design invariants

- Learning flow follows cause/condition, action, visible consequence, interpretable explanation, and repeat/retry.
- Relevant controls are adjacent to the scene; primary variables remain visible; secondary camera tools are named and disclosed.
- Live output labels move with their real input nodes; no frozen aria-label or cloned handlers.
- A primary click reveals more of the affected stage only if it is substantially offscreen, without scrolling at load or while dragging a range.
- Desktop separation defects on eight specific lessons were repaired while other routes preserve their desktop arrangements.
- Underlying scientific equations and documented simplifying assumptions remain unchanged.

## Individual real-browser task evidence

The evidence JSON records actual before/after values. Six tests that were not decidable from an HTML button value alone were separately confirmed in a fresh browser.

| Route | Interaction | Browser-confirmed change |
|---|---|---|
| / | btnMotion | Resume motion · true |
| /astronomy/electromagnetic-spectrum/ | spectrumWaveToggle | aria-pressed true |
| /black-holes/ | bhAnimate | aria-pressed true |
| /earth/seasons/ | seasonAngle | Noon Sun 57.1° · daylight 12.8 h |
| /exoplanets/transit-method/ | transitAngle | Phase 252° · Light blocked 0.000% · Star brightness 100.000%. Behind the st |
| /galaxies/milky-way/ | mw3DFocusSun | Focus on Sun: within the Orion Spur, ~26,000 light-years from galactic cent |
| /galaxies/types/ | galaxyInclination | 60° · projected thin-disk axis ratio ≈ 0.50. Inclined: arms look flattened  |
| /learn/not-to-scale/ | trueScaleZoom | Camera radius 10.1 AU. Orbital positions use physically proportional AU dis |
| /moon/earth-moon-scale/ | emFlightSlider | 70% |
| /moon/eclipses/ | eclipseNode | New Moon but the Moon is below the ecliptic plane by 0.23 model orbital rad |
| /moon/phases/ | moonAngle | Day 20.7 of 29.5 · 65% illuminated as seen from Earth |
| /moon/tidal-locking/ | lockAngle | 252 |
| /moon/tides/ | tideCinemaAngle | 65° — Intermediate alignment: the strength and orientation of the idealized |
| /solar-system/2026-ed138-dwarf-planet-candidate/ | ed138Albedo | ≈ 702 km |
| /solar-system/astronomical-unit/ | auExpeditionProgress | 21.04 AU |
| /solar-system/distance-scale/ | distanceFocusPlanet | Mercury: 0.39 AU (1.30% of the 30.05 AU physical ruler), but 7.5 scene unit |
| /solar-system/gravity-and-orbits/ | orbitCompareThree | 1.0: collision · 2.6: bounded computed trajectory · 4.1: escape. All paths  |
| /solar-system/gravity-comparison/ | gravityMass | 223.00× Earth |
| /solar-system/gravity-lab/ | gravityLabModeFlight | Flight Trials selected · instructional brief updated |
| /solar-system/orbital-periods/ | keplerOrbitTime | 0.70 Earth yr |
| /solar-system/planet-size-comparison/ | diameterLensProgress | 70% outward |
| /solar-system/planet-types/ | ptype3DStart | Earth · NASA Blue Marble |
| /solar-system/pluto-dwarf-planet/ | plutoResonanceTime | 70% of mean-period teaching cycle: Neptune 2.10 / 3 laps; Pluto 1.40 / 2 la |
| /solar-system/temperature-comparison/ | tempCompareB | Mercury: +167°C. This is a NASA rocky surface mean; select another planet t |
| /sources/space-resources-for-students/ | resourceGoal | Recommended official source: JPL Education. Its description and link are ex |
| /stars/life-cycle/ | lifeNext | 02 / 06 · PROTOSTAR HEATS |
| /universe/light-year/ | lyPhotonSlider | 5.8 minutes |
| /universe/scale/ | zoomNext | Previous → current: approximately 7,495,294× larger in the compared length  |

Informational routes: /learn/read-space-images/, /privacy/ and /updates/ each had a main heading, 18px body text, working link markup, and no overflow in a 320px browser. These were not falsely counted as simulation tests.

## Additional problems found during visual review and fixed

- Desktop at 1280×800: Black Holes, Exoplanet Transit, Galaxy Types, Moon Eclipses, Orbital Periods, Star Life Cycle, Light-Year and Universe Scale had buttons far below their scene. After full optional 3D activation, the result area was 351–366px visible for the eight controls.
- Home camera buttons and planet quick choices rose to 44px touch height. AU presets, Pluto classification buttons and major zoom-navigation buttons also rose to 44px without horizontal document overflow.
- Light-Year initial scene showed only 92px when Play was visible; user-triggered stage reveal increased it to 238px on a 320×568 browser. Its progress label and value now remain on a readable line.
- Seasonal and lunar orbital range sliders now have visible labels and live degree values; their original accessibility names and keyboard range handling remain.
- Milky Way camera actions now update a scientific readout, with clear distinction between artist reconstruction and the approximate Sun reference position (~26,000 light-years from galactic center).
- Planet Size Comparison now puts Pull back, Restart and manual scrub above the same canvas. At 70% pullback the full 210px canvas and progress slider are visible.
- ED138 reflectivity experiment now puts assumption choices above the measured-ratio illustration. On narrow phones a legible CSS bar comparison replaces tiny SVG text, derived from the same diameter formula. 4% reflected assumption produced ~1,529km.
- Solar System Distance Scale now runs choose planet, launch journey, observe the two distance rulers, then read comparison. Mercury during the tour showed 1.30% on the physical ruler versus 15.00% on the illustrative ruler.

## Automated safeguards

- CI verify_sitewide_learning_flow covers 31 built routes, unique action/result IDs on 28 interactive routes, and the lesson-order invariants from three corrected experiments.
- CI verify_mobile_action_visibility checks the 20 scoped mobile control groups and label/disclosure handling.
- Full production CI also covers original scientific calculations and content structure; actual rendered browser task evidence is separate from static tests.

## Verification limits

This is a complete route-level engineering review and repair of identified defects, not statistically validated student satisfaction or certified WCAG conformance. Physical iOS Safari and Android tests, assistive-technology focus sequences and prolonged low-power 3D performance remain unverified.
