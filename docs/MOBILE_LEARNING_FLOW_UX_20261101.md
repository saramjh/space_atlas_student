# Space Atlas: mobile learning-flow UX repair (2026-11-01)

## Reproduced defects and root cause

The prior responsive action dock put all controls in an unlabelled horizontal
strip. At 320px, Exoplanet Transit needed 781px of scroll width for 284px
available, hiding orbital phase and planet radius controls. Black Holes had
802px of controls in 284px, hiding gas-flow and camera controls.
Gravity Comparison Mass had stale generated accessible name 1.0x Earth
while the actual value changed to 4.0x Earth.

## Design resolution

- Lesson-specific priority maps identify primary task buttons and core
  experiment variables. They are always visible in a compact two-column
  responsive grid adjacent to their 3D, SVG or canvas results.
- Additional camera/view controls are explicitly discoverable under a native,
  keyboard-operable Additional controls disclosure. No unlabeled horizontal
  search strip for critical variables. Optional controls are bounded inside
  the disclosure rather than pushing the whole lesson offscreen.
- Existing real nodes, IDs, event handlers, label associations and live
  numeric outputs are moved together, never duplicated. Sliders keep their
  source labels instead of a frozen generated aria-label. On desktop the
  original nodes restore to original locations in DOM order.
- Explicit 3D activation reveals its stage only if user requested it and
  the result is otherwise offscreen. Reduced motion respected.
- Underlying mathematical models and scientific values unchanged.

## Runtime test evidence

- Exoplanet Transit 320px: Play and orbital phase/radius sliders all visible,
  with dock height reduced from 211px to 176px; Play progressed orbit phase
  to 14 degrees and changing phase to 90 degrees updated its label and
  scientific light-blocking readout. Follow was operable in Additional
  controls, and resizing to 1280px restored the original control container.
- Gravity Comparison: entering the 3D lab and changing mass 1 to 4 updated
  visible Mass 4.0x Earth, with no stale generated accessibility name.
- Black Holes: speed 1 to 2 changed label and output together; desktop
  restored original Black Holes controls.
- Browser CDP checked 20 affected routes at 320x568 and 390x667:
  40 cases, all primary controls visible, no horizontal page or dock
  overflow, additional controls open/close and remain accessible.
  See docs/evidence/mobile-ux-flow-20261101.json.

## Remaining limits

A task-focused layout and controls remediation is not proof of complete
classroom usability or formal WCAG compliance. Physical iOS/Android touch,
dynamic browser chrome, screen reader and low-end GPU endurance remain
untested. This report describes observed behavior, not a usability study.
