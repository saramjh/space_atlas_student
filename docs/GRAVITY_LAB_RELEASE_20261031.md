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

Opt-in WebGL, shared existing Three.js import map, no new runtime dependencies. Desktop WASD/arrows, Space, mouse drag; touch joystick and look area with Jump button; pause/reset. Prevent autopilot. Cap pixel ratio 1.15 on low-power/touch, 1.65 desktop. No perpetual animation frames while idle. Pause when tab is hidden; prefers-reduced-motion removes optional camera effects and never removes the science animation itself. A server-rendered static table and source references remain functional without JS/WebGL.

## Non-goals / next

Not a photorealistic 3D reconstruction of all surfaces. No atmospheric survival simulation. Performance on physical low-end mobile and classroom learning outcomes not measured. This pilot should remain deliberately scoped to one page; test actual touchscreen ergonomics and sustained FPS before adding missions or multi-level game features.
