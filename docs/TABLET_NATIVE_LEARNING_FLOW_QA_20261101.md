# Space Atlas tablet learning-control QA — 2026-11-01

## Scope
Continued all 28 interactive routes against latest origin/main. Replayed a representative learning action at 768x1024 portrait and 1024x768 landscape: 56 Chromium touch checks. Used CDP Input.dispatchTouchEvent, not programmatic DOM click. Slider tests used native touchStart/move/end; chooser tests used focus and keyboard selection followed by Find action.

## Root cause and fix
The first native-touch sweep confirmed 54/56 representative cases. The two exceptions were Star Life Cycle Next stage at both tablet sizes. Existing shared dock script categorized both lifeNext and lifePrevious as secondary controls inside a closed details element. Browser geometry queries returned rectangles, but touch actually hit the stellar canvas rather than the buttons. Programmatic click could operate the underlying model, proving a discoverability/hit-test failure, not a broken star model.

Moved lifePrevious, lifeNext, lifeSwitchMass, lifePlay into the visible primary action dock. Initial disabled lifePrevious is shown disabled then enabled when the student advances; dock mount no longer filters disabled controls out. Promoted Universe Scale zoomPrev as primary to support a discoverable reversible learning sequence. All actual elementFromPoint hit tests identify the intended buttons.

Follow-up actual native-touch stage round trips on 320x568, 768x1024 and 1024x768 (6/6) passed: Next advanced and Previous restored the initial stage. Star lesson dock height was 124px and 230px of its scene was visible on 320px, without document overflow; 290px scene visible at 768px. Archived the 54/56 initial results and six corrected round trips separately to preserve provenance.

## Limits
Representative route-level touch actions are not proof of exhaustive permutations, actual iPad Safari or physical Android input, native screen-reader navigation, sustained GPU performance, classroom learning outcomes or formal WCAG conformance. Physical hardware still requires owner review. No science calculations, external data, analytics settings or age/advertising provider permissions were changed. Original dirty Mac main worktree was not modified.
