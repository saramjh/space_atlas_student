# Mobile action-to-feedback proximity audit — 2026-11-01

## User problem

A mobile learner taps Play / Compare below a tall canvas and sees no
response because the visualization has scrolled completely off screen.
Actual 320×568 Chromium test with 117px sticky header: Compare three
launch speeds had 0px orbit canvas visible and button 297px below the
canvas.

## Verified scoped remediations

- Solar System / gravity-and-orbits: Compare is now in the stage
  toolbar, a mobile-height canvas directly beneath it. Three outcomes
  have an in-stage color key. Explicit comparison actions reveal the
  full canvas beneath the sticky header only if it is partially outside
  the usable viewport. At 320×568, all 295px canvas visible following
  Compare; numerical physics unchanged. A redraw-on-resize fix prevents
  a reflow from erasing the canvas bitmap.
- Planet Size Comparison: Pull back and Restart are now in the same
  stage just above the camera canvas, not beyond the slider. At 320×568,
  all 210px canvas visible; playing progresses to 16% after 1.1s and
  Restart returns to zero. Measured planet diameters unchanged.
- Moon Phases: Play phase cycle now precedes the pair of model views.
  At 320×568, 253px of the 380px system canvas visible including the
  moving body; actual phase angle changed from 180 to 195.
- Tidal Locking: Watch one lunar orbit now precedes the model; the
  12-second explanation remains below. At 320×568, 253px of the 300px
  canvas visible and orbital angle changed from 0 to 24 degrees.
  The separate status badge is still absolutely positioned over scene.

No horizontal document overflow occurred in these tested 320px pages.

## Acceptance criterion

An interactive Play / Compare control must either share a viewport with
its affected visual result (preferred), or an explicit click must reveal
that result without extra manual reverse scrolling. Do not auto-scroll
when the page loads, and do not unconditionally move focus. Preserve
keyboard operation, reduced-motion preferences and scientific data.

## Scope limitations

This was a selected rendered-page audit, not a full site guarantee.
Gravity Lab already places Enter / Jump within its rendered stage.
Optional WebGL experiences (e.g. orbital-period 3D, light-year cinema,
tidal-equilibrium 3D) have activation-dependent hidden canvases; these
were not cleared by this geometry-based audit. Future quality review
should activate each supported visualization and measure click-to-result
visibility at 320×568, 390×667 and desktop including reduced motion.

Regression checks were appended to existing gravity vector and
remaining-immersion test gates, and rendered mobile browser replay
was performed for each affected route. No new runtime dependency.
