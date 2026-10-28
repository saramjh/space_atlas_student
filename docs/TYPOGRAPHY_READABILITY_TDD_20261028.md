# Space Atlas — learning typography: TDD and observable evidence

Date: October 28, 2026. Audience: student learners in Grades 4–8 and educators. This is a measured **readability and layout improvement**, not a claim of measured student learning, conversion lift, classroom adoption, or engagement.

## Separate design visibility from learning value

Code tests can establish that essential explanatory text, buttons, tables and source notes are more legible without clipping, changing scientific models or breaking responsive layouts. Screenshots can reveal visual hierarchy and readability defects. **Neither proves that students understand more**; proving that requires real tasks and voluntary human feedback.

We retained Space Atlas's restrained editorial style (large serif headings, neutral paper, source citations, dark scientific models) and fixed the imbalance where major text was assigned tiny ancillary type sizes despite a 16px body default.

## Baseline and RED

- Independent Chromium audit covered all 29 sitemap pages, including 26 lessons. Among 26 lesson pages, 297 of 346 sampled visible substantive paragraphs were below 14px, and 86 of 92 visible buttons were below 14px. Across all 29 pages, 404 of 470 sampled paragraphs were below 14px.
- Before implementation, the new focused static test ci/verify_readability_roles.py failed (RED) because the semantic type tokens were absent.
- Hypothesis: learning explanations and interpretation controls can become clearer while the page remains navigable and the hierarchy of heading/model/reading content remains intact.

## Local A/B and technical acceptance

An isolated temporary CSS candidate was compared with the original production CSS on six representative routes: home, Moon Phases, Earth Seasons, Universe Scale, Electromagnetic Spectrum, and What's New. Four viewport widths (320, 390, 800, 1280) gave 24 baseline/candidate comparisons.

- Main explanation: 13 to 16px; source description: 11 to 14px; reference table: 12 to 15px; key experiment/quiz buttons: 11 to 14px.
- Maximum document-height increase among these six pages and four viewport widths: 7.5%. No new document-level horizontal overflow in the static local comparison.
- On the integrated changed source, 29 pages times 4 widths (116 independent browser layouts) had no document-level horizontal overflow. Some scientific reference tables are intentionally horizontally scrollable; the Universe Scale stop strip also has off-screen controls, which deserve separate accessibility testing rather than being hidden by this result.
- New all-29-page static DOM count: 220 of 470 sampled paragraphs below 14px versus 404 of 470 initially (45.5% reduction).
- New 26-lesson count: 121 of 346 sampled paragraphs below 14px versus 297 of 346 initially (59.3% reduction). Buttons below 14px dropped from 86/92 to 72/92 (only 14 improved; dark 3D controls and domain-specific buttons were deliberately not enlarged blindly).
- Moon Phases native First Quarter control still renders First Quarter, Day 7.4 of 29.5, and 50% illuminated as seen from Earth. Earth Seasons 0/23.5-degree compare buttons update expected readouts.
- Root user-font preference 16 to 20px scaled learning copy from 16 to 20px and key controls from 14 to 17.5px, with no clipped main copy at width 320. At a 32px root (200% custom text preference), study copy reached 32px and controls 28px, without measured horizontal overflow in the Moon page. This is not a universal WCAG certificate or full browser zoom audit.
- Manual screenshot review: primary body and source notes are more readable, larger headings keep their original character, and step-number gaps are reduced. Science canvas and data remain available.

## Implementation and regression protection

- Source of truth: shared assets/css/style.css, edited in-place rather than another cascade of important overrides. Four semantic rem tokens: learning body 1rem, learning control .875rem, context .875rem, reference .9375rem. These follow root text-size preferences.
- Removed arbitrary step-card minimum height of 210px and reduced number-to-explanation gap, instead of merely blowing up the height and increasing whitespace.
- Reflow source provenance links inside their evidence item and retain internal horizontal scrolling for dense tabular reference values. No new runtime packages, fonts, APIs, analytics events or user data collection.
- Focused gate ci/verify_readability_roles.py, registered in production and scheduled CI; retains existing SEO/canonical/structured-data/AdSense checks and all prior science/interaction suites.
- Do not claim every button has adequate text size; remaining specialized visualization controls require separate design evaluation for small screens, available space, keyboard operation and measurement fidelity.

## Actual learning-value validation not yet done

A controlled, voluntary task evaluation with consenting adult educators is the next required evidence layer before claiming measurable learning improvements. Counterbalance original and candidate presentation order for equivalent tasks: identify the first-quarter lunar claim and evidence, compare Earth's 23.5-degree and zero-tilt predictions, and find the NASA source/model limits. Capture task completion, correct interpretation, mistakes, prompts needed and reading-comfort preference. A small first group (e.g., five teachers) can identify qualitative usability problems but is not statistical proof. Avoid identifying minors, unnecessary tracking and unsolicited requests. If a panel's larger type makes an actual task harder, adjust that panel based on evidence rather than force a uniform font-scale slogan.

Decision: Technical and visual usability **GO** only if all static, browser, responsive and scientific regression gates pass. Student learning outcome **UNVERIFIED**, not GREEN, pending direct task evidence.
