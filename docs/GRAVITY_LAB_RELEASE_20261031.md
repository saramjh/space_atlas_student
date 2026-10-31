# Gravity Lab — first-person controlled gravity comparison (2026-10-31)

## Learning question

Why does the same *initial upward launch velocity* produce a very different jump height and hang time on Earth, the Moon, Mars and other worlds? The learner predicts Earth vs Moon, walks a reference floor, jumps, compares the measured model peak/time, and explains the different gravity values.

This page is a **fictional standardized gravity chamber**, not a claimed recreation of a planet's surface. NASA Planetary Fact Sheet values are rounded and are used as constant downward accelerations. For the gas and ice giants (Jupiter/Saturn/Uranus/Neptune), values represent a reference atmospheric level; the simulated deck is fictional. Venus also has unmodeled extreme pressure and heat.

## Model

- Reference mass **70 kg** (constant). Eye height **1.58 m**; display notes reference person only.
- Launch velocity **3.0 m/s upward**, fixed everywhere by an imaginary launcher; do **not** interpret as measured maximal human muscle performance.
- Gravity \(g\): Earth 9.8, Moon 1.6, Mars 3.7, Mercury 3.7, Venus 8.9, Jupiter 23.1, Saturn 9.0, Uranus 8.7, Neptune 11.0 m/s².
- Height: \(v_0^2/(2g)\). Hang time: \(2v_0/g\). Vertical movement uses analytic constant-acceleration parabola; small time partitions prevent missed landing events; landing results match closed-form predictions.
- No air drag, life support, varying g with altitude, pressure, temperature, orbital effects, suit inertia, real friction, or human biomechanics.
- Horizontal input is a fixed uniform walk speed 3.6 m/s, regardless of g. This avoids falsely modeling locomotion under changing body weight.
- Fixed-size 3D measurement mast and deck grid are intentionally schematic; photography is displayed on a *distant observation backdrop*, not presented as navigable real terrain.

## Source imagery

The local WebP references were sourced from agency releases:
- Mars Perseverance/JPL Jezero: https://science.nasa.gov/resource/the-end-of-one-drive-by-perseverance-on-the-floor-of-jezero-crater/
- Moon Apollo 17: https://science.nasa.gov/asset/hubble/apollo-17-astronauts-snapshot-of-taurus-littrow-valley/
- Earth Apollo 17: https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/a17_h_148_22727.html
- Mercury MESSENGER enhanced false color: https://science.nasa.gov/photojournal/colors-of-the-innermost-planet-view-1/
- Venus Magellan radar color visualization: https://science.nasa.gov/photojournal/hemispheric-view-of-venus-centered-at-90-degrees-east-longitude/
- Jupiter Juno: https://www.jpl.nasa.gov/topics/solar-system/
- Saturn Cassini mosaic: https://science.nasa.gov/photojournal/a-farewell-to-saturn/
- Uranus Voyager 2: https://science.nasa.gov/asset/webb/uranus-voyager-2/
- Neptune Voyager 2: https://science.nasa.gov/asset/webb/neptune-voyager-2/
- Numerical data: https://nssdc.gsfc.nasa.gov/planetary/factsheet/

All assets are local. Real-planet photos are not photo evidence for our imaginary chamber.

## Input and performance

Opt-in WebGL, shared existing Three.js import map, no new runtime dependencies. Desktop WASD/arrows, Space, mouse drag; touch joystick and look area with Jump/Reset buttons; automatic tab suspend/resume. Prevent autopilot. Cap pixel ratio 1.15 on low-power/touch, 1.65 desktop. No perpetual animation frames while idle. Pause when tab is hidden; prefers-reduced-motion removes optional camera effects and never removes the science animation itself. A server-rendered static table and source references remain functional without JS/WebGL.

## Non-goals / next

Not a photorealistic 3D reconstruction of all surfaces. No atmospheric survival simulation. Performance on physical low-end mobile and classroom learning outcomes not measured. This pilot should remain deliberately scoped to one page; test actual touchscreen ergonomics and sustained FPS before adding missions or multi-level game features.


## 2026-10-31 mobile multi-touch repair

Issue reported by learner: holding the mobile joystick prevented simultaneously jumping with another finger. Root cause was input handling asymmetry: the joystick reacted to pointerdown while Jump reacted only to a synthesized click. Chromium suppresses that click during a multi-finger touch gesture. An actual Chrome DevTools Protocol `Input.dispatchTouchEvent` two-finger sequence reproduced the RED state: while holding one touch at the joystick and pressing Jump with the second, no jump began, even after both released.

Fix: Jump activates immediately on touch/pen `pointerdown`; its existing mouse and keyboard click handling is preserved. Recent touch input suppresses a potential synthetic click after finger release, preventing a duplicate jump when local gravity is high. The Jump button applies `touch-action:none`, and the joystick maintains independent pointer capture.

Verification (real Chromium CDP touch sequence, not a mocked pointer event): hold left joystick touch, move stick forward, press Jump with a second simultaneous touch. On finger down, status changed immediately to `Jumping in Earth gravity`; with both touches held, joystick movement changed direction while measured jump altitude advanced; releasing the second finger then the first led to exactly one completed Earth jump `0.46 m / 0.61 s`. Jupiter 0.26 s jump remained exactly once despite holding the jump finger beyond landing and releasing, and subsequent mouse click still initiated another jump. 390px viewport no horizontal overflow. Production full 147/147 tests passed. Physical iOS Safari/Android handset testing not performed.

## 2026-10-31 simplified controls: no manual Pause/Resume

Removed redundant manual Pause/Resume control. When the document becomes
hidden, cancel RAF, clear held directional inputs, and reset the frame-time
origin; do not reset airborne trajectory or the player position. When visible
again, resume rendering and physics from the stored flight time without
counting away-time. Keep Reset and existing touch joystick/Jump chord.


## 2026-10-31 NASA-reference visual world selector

The old dropdown remains as a secondary accessible quick-list. A new
horizontal scroll-snap image rail lets students select all nine gravity worlds
with visible source-backed photographs and scientifically qualified mosaics,
a large active-world preview, the Earth comparison factor, a common 0–23.1
m/s² bar with a 9.8 m/s² Earth marker, and derived predicted jump height/time.
Display image sizes are NOT physically proportional to planet diameters.

Planet image sources:
- Mercury, Venus, Earth, Jupiter, Uranus and Neptune: NASA Space Place
  combined instrument and model reference grid
  https://spaceplace.nasa.gov/gallery-solar-system/en/
- Moon: NASA Goddard / Arizona State University LRO near-side image
  https://science.nasa.gov/resource/lunar-near-side-2/
- Mars: NASA/JPL/USGS Viking Orbiter PIA00407 processed global color view
  https://science.nasa.gov/photojournal/global-color-views-of-mars/
- Saturn: NASA/JPL-Caltech/SSI Cassini
  https://science.nasa.gov/photojournal/a-farewell-to-saturn/

The images are locally optimized 320px WebP thumbnails, not runtime CDN links.
The live selection includes a source link, nine pressed-state buttons with
keyboard navigation (arrows, Home, End), touch-native horizontal swipe,
previous/next controls, and the original native dropdown. All routes update
the original gravityLabWorld control and therefore the existing gravity
physics and 3D scene through the same change event. Short selection movement
respects prefers-reduced-motion. No permanent animation loop is added.

QA: Moon selection 1.6 m/s², 0.16x Earth, 2.81m / 3.75s prediction;
Jupiter explicitly NO WALKABLE SURFACE, 0.19m / 0.26s. Keyboard Moon→Mars
and native dropdown→Jupiter synchronized. Real Chromium CDP mobile two-pointer
joystick + Jump on the Moon: mid-flight 0.48m, completed 2.81m / 3.75s.
390px page has zero horizontal overflow. Physical iOS/Android performance
not measured.


## 2026-10-31 optional Flight Trials mini-game

New same-page Gravity Lab / Flight Trials mode buttons distinguish two
different questions. The original unpowered experiment and its NASA
gravity data, 3.0 m/s launch model, output, links and learner prediction
are unchanged in Science mode. In Flight Trials, the student tries a short
artificial 3D course: launch to GATE 01 (0.72 m), GATE 02 (1.18 m), and FINISH
(1.50 m). The fictional platforms are styled test infrastructure.

Game physics uses an independent pure module gravity-flight-physics.js:
- Mass remains 70 kg; initial launch is still 3.0 m/s.
- HOLD Shift on desktop or HOLD Boost on touch while airborne. 1.0 s total
  boost capacity per charge; no boost on ground.
- Fictional flight assist auto-compensates gravity:
  F_boost = mass * (g + 5.5 m/s²). Net acceleration +5.5 m/s² during boost,
  and -g otherwise. NOT the same booster force on each planet, nor a human
  jetpack or a claim about surviving planetary conditions.
- Landing on an elevated platform recharges linearly over 2.5 seconds while
  grounded, with no airborne recharge. Falling off a pad causes free fall,
  and falling below the course returns to the latest checkpoint.
- Visible four-pad challenge has three checkpoints. Completion reports
  attempts, cumulative booster seconds across retries, and active simulated
  movement time, separately from unboosted scientific jump measurements.
- Reuses existing opt-in Three.js, no runtime dependencies or network assets,
  no autoplay, mobile pixel ratio caps and reduced-motion behavior retained.
- Mobile left joystick, right Jump then Boost press-and-hold, pointer
  capture/release/cancel and window blur clear thrust independently.
- World or mode change resets challenge; hidden tab retains flight trajectory
  without advancing absent time, and clears held input.

Verification:
- TDD gravity flight unit tests first failed before Flight Trials UI existed,
  then passed after implementation; verifies boost depletion and 2.5-second
  recharge, NASA gravity variants, landing and UI input wiring.
- Desktop actual Chromium keyboard walkthrough on Earth reached GATE 01,
  GATE 02, FINISH in one attempt; 1.15 sec total booster time and
  6.5 sec active movement time.
- Mobile CDP actual two-finger events: joystick pointer 1, Jump pointer 2,
  then Boost pointer 3, energy 100% to 45%, changing airborne height while
  directional joystick remained held. 390px document fits 390px viewport.
- Science mode restored original Earth jump 0.46 m/0.61 s and hides Boost.
- Real physical iOS Safari/Android performance and user engagement outcomes
  remain unmeasured.


## 2026-10-31 Flight Trials progressive stages and unified mobile control

User requested removal of redundant select-box/expanded selected-world feature,
more replayable gameplay with progressively increasing checkpoints, and
premium feedback at checkpoints and finish. We researched reference visuals:
the clean cyan/amber luminous rings of Celerity's sci-fi portal course and
the concentric-energy/particle checkpoint treatment in Ratchet & Clank. This
implementation is original procedural Three.js and CSS, with no third-party
game textures or screenshot redistribution.

- World selection is exclusively the nine NASA image buttons in a horizontal
  scroll-snap rail. The old duplicate dropdown and giant world-feature panel
  were removed. A compact gravity/weight/unboosted-jump header stays visible
  as essential science data, with the source link and true-size disclaimer.
  Keyboard arrows/Home/End and rail previous/next buttons work.
- 8 deterministic progressively longer levels: Level 1 has 3 checkpoints,
  Level 2 has 4, ... Level 8 has 10. Every course has a spawn pad and
  elevated platforms with bounded gaps and safe deterministic geometry.
  Clearing a level reveals an explicit Next Level control; reaching the
  eighth level's finish displays an all-levels-cleared summary. Switching
  world or modes and Reset start from Level 1. No persistent account data.
- The checkpoint event creates a finite (under 1.6 second) cyan orbital-ring
  impulse and 24 reusable spark points in 3D; its event UI says CHECKPOINT
  SECURED. The finish has a distinct copper-gold larger energy pulse and
  persistent LEVEL ## CLEAR announcement with the next-level button.
  Motion reduction disables optional animation and 3D spark bursts.
  No 3D effect runs perpetually while idle.
- One mobile Jump button: touch-down immediately starts the jump; hold beyond
  140 ms engages the airborne booster; releasing the same pointer stops
  thrust. Short taps use zero booster. The opposite thumb can hold joystick
  movement at the same time. Desktop Space also supports hold-to-boost,
  while Shift remains a separate optional booster key. Lost pointer capture,
  pointercancel, tab hide, window blur and resets release held thrust.
- Game scoring and unpowered science predictions continue to be separate.
  The artificial thrust F=m(g+5.5) still varies by planet, is not a true
  shared thruster comparison or a genuine human jump measurement.

Verified:
- Eight level geometry generations return 3..10 checkpoints, no gap beyond
  6.01 m and bounded heights; per-planet booster/landing physics tests.
- Actual Chromium desktop keyboard three-gate Level 1 run:
  GATE01 -> GATE02 -> FINISH, copper-gold LEVEL 01 CLEAR,
  Next Level triggers Level 2 with 4 checkpoints. First level one attempt.
- Actual mobile (390px) two simultaneous CDP touch points on joystick and
  Jump held for ~0.5s: 65% remaining and rising height. On explicitly
  dispatched pointerup, energy stopped dropping. A separate ~70ms
  single touch produced unboosted airborne jump with energy 100%.
  Physical iOS Safari/Android touch-release ergonomics not yet verified:
  CDP multi-touch touchEnd does not synthesize independent per-finger pointerup
  when one other finger is still present, so direct pointerup was used as
  an additional input-release test.
