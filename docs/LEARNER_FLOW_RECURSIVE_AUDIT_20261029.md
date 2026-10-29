# Space Atlas 11-lesson recursive learner-flow UX review

Date: 2026-10-29. Scope: 11 upgraded Space Atlas Student learning pages. This is browser and source test evidence, not a pupil outcome study. Standard flow: view the labeled scientific model, find a nearby control, change an input, inspect linked evidence, pause/reset/return. 2D is intentionally the first reference and WebGL-safe fallback; 3D is opt-in rather than automatically loaded.

## Confirmed issues, corrections and iteration ledger

| ID | Severity | Reproduced failure | Actual repair and repeated check | State |
| --- | --- | --- | --- | --- |
| UX-01 | P1 | On 390px Black Holes and Galaxies the 3D entry point appeared roughly 450–475px after the figure start, easily missed while observing the diagram | Place switch immediately below scientific figure, 9px Black Holes / 8px Galaxy from its bottom in Chromium. Keep lazy 3D loading and labeled 2D fallback | CLOSED |
| UX-02 | P1 | The first attempted fix overlaid the switch and caption onto the Black Hole 3D rendering, hiding useful visual content | Replaced overlay with normal-flow 3D toolbar after the canvas, restored caption on canvas. Actual 390px rectangle check: figure bottom about555px and CTA top564px, no overlap. Screenshots inspected before/after | CLOSED |
| UX-03 | P1 | Optional motion buttons were silently disabled by reduced-motion preference (Eclipses/Transit/Light-Year/Stars/Spectrum/Galaxy, Black Holes after enabling3D) | Add nearby preference-specific explanation, displayed only in reduced motion. 390px actual Chromium verified 7/7 applicable routes explain disabled motion and manual science controls remain operable | CLOSED |
| UX-04 | P1 | At 390px 38 lesson buttons were under 43px high, followed by 3 more at 800/1280 after first CSS fix (Tides and Spectrum) | Increase relevant lesson button targets to min44px, fix second breakpoint. Final browser scan 11 pages x 320/390/800/1280 reported 0 undersized lesson buttons in defined scope | CLOSED |
| UX-05 | P2 | Eclipses play was located after long 3D/controls/side-view sequence, distancing Play from linked evidence | Move Play before side-on evidence, retain scientific controls and optional finite motion. TDD checks relative DOM order, full model regressions pass | CLOSED |
| UX-06 | P1 | Failed WebGL load could leave unrecoverable/disabling 3D toggle or unexplained state | Accessible loading busy state and status message; preserve 2D and let user retry. Forced getContext WebGL failure then restored; Black Holes and Galaxy both displayed 2D/status and successfully loaded 3D on retry | CLOSED |
| UX-07 | P2 | With JS disabled, 3D toggles looked actionable but could never respond | Default both switches to disabled native controls; activate only after script handler registered. Plain noscript text provides fallback. Actual script-disabled sandbox iframe confirmed inactive trigger and labeled static SVG; normal JS mode enabled buttons | CLOSED |
| UX-08 | P2 | Black Hole new aria-controls value with multiple IDs failed original site semantics CI | Narrow control target to canvas; full verify_ui_controls and science/SEO test suite pass | CLOSED |

## Browser audit and acceptance

Manual repeatable browser audit source: ci/browser_learner_flow_audit.js. Invoke from local same-origin page with auditWidth=320,390,800,1280 via agent-browser eval. The script audits all 11 lessons: 43px-or-less touch target, motion-disabled mismatch or absent reason, and Black Hole/Galaxy 3D entry-to-model proximity. Actual browser 11/11 at each normal viewport returned 0 issues, 390px reduced-motion 11/11 returned 0. A separate actual reduced-motion check confirms Black Hole after 3D activation has disabled animation, visible reason and enabled manual sliders. Forced WebGL failures verified actual retry. User-started 3D switch, canvas, readout and 2D return inspected in screenshot and browser DOM. Other lessons retain original manual and finite motion models, with no changed physics formulas.

New CI: ci/verify_learner_flow_ux.mjs (RED first, then GREEN) enforces interaction UX and build metadata, with registered Pages and scheduled health gates. Existing 13 Python + 28 Node science/SEO/interaction gates and JS syntax used for production acceptance.

## Explicit remaining boundaries

0 refers to scoped reproducible checklist violations, not subjective 0 visual defects or a full human study. Third-party AdSense can insert a mobile-width iframe of 645–680px on some pages and cause horizontal document scrolling; provider ad compliance/placement is a separate open issue, not hidden to fake success. Previous SVG audit covered visible text labels/rectangle overlap on 16 routes, not all line/arrow occlusion geometry. Real grade4–8 learner comprehension and exhaustive assistive-technology coverage remain unmeasured. Slow-network WebGL init and other browsers beyond tested Chromium are not certified.
