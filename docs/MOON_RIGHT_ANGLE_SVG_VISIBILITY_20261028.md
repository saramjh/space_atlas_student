# Moon classroom schematic: right-angle marker visual regression

Date: 2026-10-28. Scope: /moon/phases/ teacher diagram and its standalone, device-free printable.

## Observed defect

The right-angle square was drawn at the center of the observer's opaque disk before that disk, which covered it. This appeared on desktop 640×310, mobile 360×330 and offline print 340×225 diagrams. The geometry described 90 degrees but the student could not actually see the indicator.

## Correction

Use a visible quarter-circle arc centered on the actual observer intersection of sightlines, with its entire stroke at least 14 SVG units outside the opaque observer. The arc is drawn after the disk.

| Output | Center | Disk radius | Arc radius | Arc geometry |
| --- | --- | --- | --- | --- |
| Desktop | (474,183) | 26 | 42 | M432 183 A42 42 0 0 1 474 141 |
| Mobile | (265,175) | 23 | 40 | M225 175 A40 40 0 0 1 265 135 |
| Printable | (260,145) | 18 | 32 | M228 145 A32 32 0 0 1 260 113 |

Endpoints lie on the observer-to-lamp and observer-to-ball sightlines; the centerline cannot be covered by the observer disk. The separate 90° numeric label is visible above-left of the disk. Existing gold lamp-to-ball ray, blue gaze vector, 90-degree educational intent, half-illuminated ball and not-to-scale explanation remain unchanged.

## Verification

TDD RED: new ci/verify_moon_diagram_visibility.mjs failed when the external arcs were missing. GREEN: validates arcs on all three outputs, radius safety margins, exact sightline endpoints, observer paint order, visible label coordinates and unchanged physical-ray witnesses. Added as required deploy and scheduled CI gate.

Chromium render inspection at widths 320,390,800,1280: the browser elementFromPoint at the center of each visible SVG arc identifies the angle arc itself, not an opaque observer circle. The standalone print diagram was also checked with the browser hit test. Screenshots at 1440,390,320 visually inspected for overlapping annotations and crop.

## Broader inspection scope and caution

Source inventory includes 35 inline SVG blocks across 14 page source files, of which 21 have an explicit accessible graphic name/description. Other 90-degree-labelled models include moon/tides and exoplanets/transit-method; these do not share the covered right-angle square and were inspected in source. This is triage, not a site-wide visual certification. Future SVG QA should flag label-versus-object overlap, stroke paint order, viewBox clipping, mobile scale/contrast and model state correctness. No claim is made that all other diagrams are defect-free.

No new runtime dependency, ads change, permission change or user analytics. Preserve native interactions, canonical/JSON-LD, NASA references and offline print.
