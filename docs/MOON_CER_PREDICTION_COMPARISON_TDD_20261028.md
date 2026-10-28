# Moon phase prediction: hypothesis and physical observation are different

2026-10-28. Route /moon/phases/. Scope: Grades 3–5 claim/evidence/reasoning opener.

## Reproduced defect

The original CER check always sent 90 degrees to the Moon simulator, regardless of whether the pupil chose 25%, 50%, or 100%. This is physically right for First Quarter, but the interface gave the impression that the selected answer should affect the main visualization. It offered no visible side-by-side comparison and no immediate independent preview of the pupil choice.

It would be scientifically wrong to make an incorrect 25% or 100% prediction alter the actual First Quarter phase.

## TDD repair

1. Radio selection shows the student's chosen disk and percentage immediately in a panel labeled "Your prediction — not the simulator"; does not change the model.
2. Compare explicitly reveals a separate "Actual First Quarter — scientific model" at 50%; explains the difference; selects the correct 90-degree state in the existing 3D system/Earth view.
3. Changing the input updates the prediction disk and hides the previous observed-result disclosure until another Compare action.
4. Retains native radios/fieldset and no-JS details, existing NASA evidence, static site SEO/JSON-LD, accessibility/keyboard input and no tracking.
5. At 320px the two panels stack in reading order. Original choice SVGs must not shrink due to their old max-width selector.

RED: new ci/verify_moon_prediction_comparison.mjs failed because no independent prediction state existed. GREEN: evaluator carries predicted 25/50/100, actual fixed 50, invalid/missing choices detected, and site markup/visibility and CSS tested. Existing CER/geometry tests remain intact.

Real browser:
- 1280px quarter selected: preview 25% and observation hidden. Check: 25% prediction vs 50% actual; main model 90 degrees/50%.
- Radio change to half hides old observation. Check: 50% prediction matches 50% actual.
- Radio change to whole disk: 100% vs actual 50%, explicit mismatch.
- 320px: reading-order stacked panels and selected drawing at native 84px; text 15px.
- No automatic animation and no real student data captured.

Dynamic provider-injected AdSense mobile width overflow is a separate pre-existing issue; it is not corrected or concealed by this repair. No measured educational outcome or classroom adoption is claimed.
