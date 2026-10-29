# Space Atlas — teacher-supervised predict–interact–explain trial

State: PREPARED, NOT CONDUCTED with actual pupils. This document is not
evidence of learner comprehension. Educator, guardian and institution
authorization and applicable child privacy review are required first.

## Classroom setup: local, ad-free and analytics-free

From the project root, build an isolated copy using:

    SITE_BASE=/space_atlas_student CLASSROOM_PREVIEW=1 \
    SITE_OUTPUT_DIR=/tmp/spaceatlas-classroom/site/space_atlas_student \
    ADSENSE_ENABLED=1 python3 build.py

Then start a private local HTTP server:

    python3 -m http.server 8998 --bind 127.0.0.1 \
      --directory /tmp/spaceatlas-classroom/site

Use localhost:8998/space_atlas_student/moon/phases/ and the other routes
below. The build removes Google Analytics/AdSense scripts, has local
Three.js modules, retains static educational media, and is noindex.
Production files are unchanged. A teacher must review school privacy
and safeguarding requirements before a real supervised session. This is
not a legal compliance certificate. Hosting on localhost alone does
not make the site available to other classroom devices.

## A. First-quarter Moon: predict before looking

Prompt: At First Quarter, how much of the visible Moon looks bright?
One quarter, one half, or the whole disk? Ask the learner to choose,
explain the prediction, then compare with the model.
Expected: about half the visible disk is bright; quarter refers
to a quarter of the synodic phase cycle, not 25 percent brightness.
Route: /moon/phases/

## B. Eclipse nodes: predict when alignment fails

Prompt: Is every new moon a solar eclipse? Keep the real orbital tilt
on. Compare nodes 90 degrees away with nodes along the Sun–Earth line.
Observe side-on Moon height, then explain why the alignment differs.
Turn the tilt off only to compare the hypothetical zero-tilt orbit.
Expected: a new moon may miss the ecliptic plane; node alignment
is necessary for an eclipse, not a forecast of a particular eclipse.
Route: /moon/eclipses/

## C. Planet transit brightness

Prompt: If the apparent planet radius doubles during a central
transit, how does the star's modeled brightness change?
Set phase90 and radius10 percent then radius20 percent, and move
phase to0 to compare out-of-transit brightness.
Expected: 99 percent, 96 percent and 100 percent star brightness
in this idealized uniform stellar disk model.
Route: /exoplanets/transit-method/

## D. Perspective of a galaxy (optional)

Prompt: When the same spiral galaxy looks thin from the side, did
it change galaxy type? Move the inclination from0 to80 degrees in
labeled 2D. Opt in to the generated 3D disk only if supported.
Expected: only the viewpoint changed; simulated stars are not
a real observed galaxy's exact star coordinates.
Route: /galaxies/types/

## Observer-only, aggregate outcome classification

For each activity, tally anonymous categories only:
- Independent causal explanation before seeing the model;
- Explanation corrected after trying the model;
- Understood controls, scientific explanation still uncertain;
- Control missing, obstructed, or difficult to operate;
- Declined or stopped due to discomfort.

Do not collect any child name, exact age, birth date, email,
identifiable quote, photo, recording, individual outcome sequence
or personal contact. Aggregate outcomes only after actual authorized
sessions. Record no guessed participants or invented statistics.
Stop if the learner cannot control the model or is uncomfortable.

## Closure evidence required

Study status changes from NOT CONDUCTED only after actual
authorization, verified adult-supervised sessions, real anonymous
aggregate outcomes, dated educator observations and review sign-off.
Technical automated browser checks do not count as actual learners.
