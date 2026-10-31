# Sitewide mobile action–feedback audit: 2026-11-01

All 31 site pages were inventoried. 28 have interactive controls, and 3 are informational: learn/read-space-images, privacy, updates. Representative controls and affected visuals were visited in a real Chromium browser at 320x568 and 390x667. Optional 3D experiments were activated before measuring. This is a route-level audit, not proof of every possible widget state or physical handset.

Twenty interactive routes received scoped mobile action docks, moving original event-bound controls immediately before the scene without cloning. Desktop DOM order is restored via placeholders. Existing gravity, lens, orbit and other scientific calculations were not changed.

## Per-route visible results

Route | Classification | 320x568 | 390x667
--- | --- | --- | ---
/ | preexisting layout | 378/560px | 428/560px
/astronomy/electromagnetic-spectrum/ | preexisting layout | 150/150px | 150/150px
/black-holes/ | mobile dock | 215/215px | 267/267px
/earth/seasons/ | mobile dock | 255/420px | 304/420px
/exoplanets/transit-method/ | mobile dock | 190/190px | 190/190px
/galaxies/milky-way/ | mobile dock | 255/260px | 305/318px
/galaxies/types/ | mobile dock | 246/265px | 295/298px
/learn/not-to-scale/ | mobile dock | 246/286px | 296/347px
/moon/earth-moon-scale/ | mobile dock | 255/280px | 304/318px
/moon/eclipses/ | mobile dock | 253/300px | 300/300px
/moon/phases/ | mobile dock | 196/380px | 245/380px
/moon/tidal-locking/ | mobile dock | 188/300px | 238/300px
/moon/tides/ | mobile dock | 245/286px | 294/354px
/solar-system/2026-ed138-dwarf-planet-candidate/ | preexisting layout | 451/911px | 550/806px
/solar-system/astronomical-unit/ | mobile dock | 190/190px | 190/190px
/solar-system/distance-scale/ | preexisting layout | 274/372px | 300/306px
/solar-system/gravity-and-orbits/ | mobile dock | 253/295px | 303/347px
/solar-system/gravity-comparison/ | mobile dock | 245/245px | 285/285px
/solar-system/gravity-lab/ | preexisting layout | 179/390px | 249/420px
/solar-system/orbital-periods/ | mobile dock | 236/286px | 285/354px
/solar-system/planet-size-comparison/ | preexisting layout | 210/210px | 210/210px
/solar-system/planet-types/ | 3D start¹ | activation-dependent | activation-dependent
/solar-system/pluto-dwarf-planet/ | mobile dock | 163/163px | 202/202px
/solar-system/temperature-comparison/ | mobile dock | 256/288px | 288/288px
/sources/space-resources-for-students/ | preexisting layout | 44/44px | 44/44px
/stars/life-cycle/ | mobile dock | 230/230px | 256/256px
/universe/light-year/ | mobile dock | 255/320px | 305/354px
/universe/scale/ | mobile dock | 255/300px | 305/367px

¹ Planet Types changes from an initial launch control to a new 3D globe interface after activation, so start-button-to-canvas geometry alone is not meaningful. Separate real-browser test confirmed the live globe canvas 288x255px at 320px width, and switching Jupiter updated the mission-source label. The resources page updates the adjacent source-matching result text and its result was checked after user selection.

## Confirmed repairs

- Black Holes Animate changed from 0px canvas visible when control was centered to 215/215px.
- Exoplanet Transit Play changed from 0px star view to 190/190px; actual playback advanced to phase 13 degrees.
- Galaxy Types Play changed from 0px to 246/265px; after changing to desktop width, the control returned to its original container.
- Temperature Comparison changed from 0px chart to 256/288px; selecting Mars recomputed the comparative summary.
- Pluto Resonance changed from 41/163px SVG to 163/163px; Play advanced the progress slider.
- Gravity Lab activity-mode chooser moved directly above the 3D scene, removing the long nine-world gallery from between action and feedback.
- Earth-Moon, Orbital Periods and Universe Scale explicit WebGL activations displayed approximately 280px, 286px and 252px of active scene on short mobile.

## Acceptance criteria and limitations

The user must be able to see a response without manually reverse scrolling after a Play, Compare, mode or slider interaction. Mobile controls live in a horizontal single-row scroll strip immediately before the related scene; this keeps the scene visible, though secondary buttons may require horizontal swipe within the strip. The 20 docks preserve the original IDs and native event listeners; reduced-motion settings are honored.

Evidence is stored in docs/evidence/mobile-action-feedback-20261101.json (56 Chromium measurements). The new CI check verify_mobile_action_visibility.mjs covers built routes and source wiring, whereas geometry was measured in a browser separately. The audit did not exhaust every single control state, simulate all accessibility options or physically test iOS Safari/Android, browser URL bar resizing, or long-run GPU performance. Disabled Previous buttons and activation-only fallback states were not incorrectly treated as functional regressions.
