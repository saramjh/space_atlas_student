# Star Life Cycle: observation-led cinematic illustration

## Objective and boundaries

Replace the overly schematic circles and repetitive glowing blobs in the
interactive Star Life Cycle while preserving **six representative stages for
each of two broad initial-mass pathways**, existing explanatory text, stage
buttons, keyboard interaction, previous/next, mass comparison, quiz and
reduced-motion behavior.

The result is a **conceptual collage**, NOT photographs of one star over time,
a scaled body-size comparison, a real-time astrophysical simulation, or a
time-proportional animation. The two possible massive-star compact remnants
appear in separate side-by-side alternatives, not the same fate.

## Observation and art references

All four stage-specific observation textures are from official, openly
reusable ESA/Webb or ESA/Hubble material; these are complete, unchanged
credit lines as required by their CC BY 4.0 policies. They are cropped,
darkened and mixed with an original canvas scene, and **the full attribution
is always visible alongside the stage**.

| Stage / distinct object | Official image page | Full credit |
|---|---|---|
| Protostar (both paths), L1527 | https://esawebb.org/images/weic2219a/ | NASA, ESA, CSA, and STScI, J. DePasquale (STScI) |
| Nebula (both paths), Carina NGC 3324 | https://esawebb.org/images/weic2205a/ | NASA, ESA, CSA, and STScI |
| Sun-like planetary nebula, Cat's Eye NGC 6543 | https://esahubble.org/images/opo9501a/ | J.P. Harrington and K.J. Borkowski (University of Maryland), and NASA/ESA |
| Massive supernova remnant, Cassiopeia A | https://esawebb.org/images/weic2330e/ | NASA, ESA, CSA, STScI, D. Milisavljevic (Purdue University), T. Temim (Princeton University), I. De Looze (University of Gent) |

Licensing:
https://esawebb.org/copyright/
https://esahubble.org/copyright/

The four locally resized JPEG textures are approximately 710 KiB TOTAL, not downloaded
until relevant stages are visited. These observational examples establish
the appropriate high-frequency morphology (sculpted pillars/dust lanes,
nested gas shells, disrupted filaments) without misleading students into
thinking a single star was photographed during its entire life.

## Original procedural scientific illustration

| Stage | Procedural visual distinctions |
|---|---|
| Nebula | Observation-informed volume, dark dust lanes and scattered knots |
| Protostar | Central gravitationally heated core, disk/infall, bipolar jets |
| Sun-like main sequence | Textured golden photosphere with limb dimming, subtle corona |
| Massive main sequence | Hot blue-white photosphere and a different corona |
| Red giant / red supergiant | Distinct convective surface texture, much larger illustrative envelope and material loss |
| Planetary nebula | Hot remnant centered in multiple asymmetric gas shells |
| Supernova | Strongly asymmetric shock filaments, knots and expanding gas shell |
| White dwarf | Compact luminous residual core with faint dissipated gas |
| Possible remnant outcomes | Neutron-star beam opposite a black-hole silhouette and schematic hot disk |

## Implementation constraints

- Local Canvas2D only. No external runtime requests, third-party code,
  3D dependencies, image-generation API, sound or new paid services.
- Scene textures generated deterministically and cached; only four
  1120x600 static frames retained, device pixel ratio capped at 1.65,
  animation frame rate capped near 30 FPS, drawing paused off screen.
- Reduced-motion preference presents still compositions. In an off-screen
  stage change, draw the new scene immediately instead of freezing the
  previous bitmap. Missing photo loads fall back to original procedural art;
  legacy painter and SVG fallback remain for rendering failures.
- Each stage exposes a different accessible canvas description and
  'What to notice' teaching hint; official full credits remain visible.

## Stage-by-stage learning flow and purposeful motion

The six-stage selector now comes BEFORE the visual scene. Narrow phones
show a one-row swipeable selector with an explicit instruction, while
the always-visible Previous/Next controls remain in the main task dock.
Selecting a stage or mass pathway scrolls to its result ONLY when most
of the image was out of view. At 320x568, choosing Protostar after Nebula
increased visible scene area from 98px to 319px without horizontal overflow.

Animation cues are process-specific: bipolar jets, photospheric variations,
stellar winds, gas-shell motion, broken supernova shock fronts and rotating
beams only for the neutron-star alternative. These motion cues are neither
physical measured rates nor an actual simulation of stellar evolution.
The renderer pauses out of view and in background tabs. A student requesting
reduced motion receives static, stage-distinct images.

## Verification

The final browser sweep visited 12 stages at each of 320x568, 390x667, and 1280x850: 36 distinct canvas hashes across 36 cases, no horizontal overflow, and stage-specific titles. Process animation was observed in four contrasting massive-star stages; reduced-motion frames remained unchanged. Initial cached geometry renders were generally
~2-145 ms in this browser; no claim is made about physical low-end devices.
The old scientific-stage tests remain and a separate CI test validates
assets, image size budgets, reduced motion/offscreen behavior and citations.

Formal art-director approval, physical Android/iOS GPU power draw, and
student classroom comprehension testing are separate acceptance tasks, not
represented as completed here.
