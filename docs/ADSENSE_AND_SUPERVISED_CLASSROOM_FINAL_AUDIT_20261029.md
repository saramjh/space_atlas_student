# Space Atlas AdSense viewport behavior and educator trial readiness

Date: 2026-10-29. This document distinguishes observed first-load
mobile operation, desktop-to-mobile resize, a separate local adult-supervised
preview and the evidence still unavailable from Google or real pupils.

## A. Original mobile overflow: forensic reproduction and correction

Original problematic browser sequence:

1. Open the public Earth Seasons page in a desktop browser at 1280px.
   A publisher-owned, Google-rendered ins.adsbygoogle unit is 970px wide.
2. Change that *same already-loaded window* to 390px without navigation.
   The existing AdSense unit and nested aswift iframe remain 970px wide,
   horizontally centered at x=-290 to x=680. Document scrollWidth=680px.
3. Reload at 390px. The same publisher unit now computes 320px
   and document scrollWidth returns to 390px.

A separate initial-load comparison, setting viewport width BEFORE opening
the page, measured the following on actual public Google Ads pages:

| Width at first load | Earth Seasons publisher unit | Document | Result |
| --- | --- | --- | --- |
| 320px | 280px | 320px | Fits |
| 390px | 320px | 390px | Fits |
| 600px | 468px | 600px | Fits |
| 800px | 744px | 800px | Fits |

Moon Phases and Moon Tides each initially loaded at320px with document
scrollWidth=320px. The Moon Phases reference table is independently
scrollable in its table-scroll container (288px viewport, 720px inner table,
CSS overflow-x:auto), without causing document overflow. Do not treat an
intentionally scrollable table as an overflowing page.

The previously deployed publisher slot sizes/padding fix therefore corrects
normal initial mobile layout. It cannot resize Google's already-loaded fixed
width iframe when the browser changes breakpoints *after* the ad request.
We did not crop, hide, forcibly shrink or refresh loaded Google ad creatives
or invoke reload on learners. A manual page reload restores correct sizing
when an existing fixed-size ad is stuck after a desktop-to-mobile resize.
The unchanged provider-owned rare resize issue remains outside first-party
CSS sizing control. Do not declare that every possible provider state is
proven defect-free.

A read-only authenticated AdSense home was visible through an existing
browser session. However, per-site Auto ads/Overlay/Existing ads settings
could not be read through that interface; no option was switched and no
account mutation receipt exists. Changes to ad formats or optimization
may affect revenue and need actual authenticated settings review and an
owner decision. The official control path is Ads > site Edit > Auto ads
In-page formats / Overlay formats > Apply to site. Google sources:
https://support.google.com/adsense/answer/9305577 and
https://support.google.com/adsense/answer/9261307.
In-page excluded areas do NOT suppress overlay/anchor ads.

Read-only monitor: ci/browser_auto_ads_live_observer.js checks actual
publisher unit status, provider automatic placements and body overflow
on the currently open public page; it neither forces an ad to fill nor
sends telemetry. A real filled-ad observation is required to assert success
or recurrence for that specific Google state. Avoid using an ad
simulator as evidence of actual served creative behavior.

## B. Teacher-supervised local preview implemented

Local build with CLASSROOM_PREVIEW=1 and an explicit safe output directory
outside the repository:
- Does not overwrite the GitHub Pages public build;
- Generates 29 site pages with noindex, a visible teacher-only preview note;
- Removes Google Analytics 4 and AdSense loader, ad units and ad pushes;
- Replaces the public unpkg.com Three.js importmap with an exact locally
  vendored three@0.179.1 MIT-licensed module and OrbitControls;
- Uses locally bundled teaching CSS, font resources and explanatory assets;
- Never adds tracking or submissions for learner answers.

Pure build verification ci/verify_classroom_preview.py passes with
ADSENSE_ENABLED=1 deliberately set to ensure classroom mode overrides
production monetization, verifies 29 HTML pages and both ad/analytics
removal, bundled local Three and unchanged public index bytes.

Actual localhost Chromium: Moon Eclipses initializes with tilt on and local
Three.js, no external resource fetches, no GA4 and no AdSense. Opt-in Galaxy
Three.js 3D loads from local vendor files without external requests.
Four deterministic science task scripts in
ci/browser_grade4to8_task_flow.js passed at320px,390px,1280px and
390px prefers-reduced-motion, 4/4 at each viewport. These are
SOFTWARE CHECKS, not pupil participants.

## C. One new real learning-flow defect found and fixed

The Eclipses lesson originally launched with the orbital tilt OFF while
the node position slider was active. Changing the node slider could not
change the Moon's height, so a student could reasonably believe the
control was broken. A real browser task reproduced this: only 3/4 tasks
passed; both node positions had a zero offset and identical readout.

The new source starts the educational model with the actual concept of
a tilted orbit enabled (15 degrees drawn, real approximately 5.1 degrees),
and initial node direction 90 degrees away. Changing nodes to 0 degrees
now changes the side-on offset from about 0.26 orbital radii to zero,
and the explanation changes from no eclipse alignment to node alignment
possible. The user can still turn off tilt to explore the explicitly
hypothetical zero-inclination case. Pure source/model regression
ci/verify_eclipse_default_teaching.mjs guards the initial teaching
state, scientific invariant and readout. The original eclipse-node
geometry regression also passes.

## D. Real student learning study is NOT CONDUCTED

Deliverables:
- docs/CLASSROOM_FACILITATOR_WORKSHEET_20261029.md: supervised adult
  script, four predict/interact/explain tasks, anonymous categories only,
  no child names/contacts/recordings, legal/guardian/institution gate.
- docs/LEARNER_USABILITY_STUDY_PROTOCOL_20261029.md: study protocol and
  explicit not-conducted status.
- Local-only, ad/analytics-free and external-JS-free classroom preview.

No verified school authorization, parent consent, real pupil outcomes,
educator sign-off or statistical estimates are present. The site
targets grades4–8 including children under13; Google TFAT age treatment
and FTC COPPA rules need owner/legal review before external child use.
Google documents current TFAT age-treatment settings, but applying
them alone does not certify COPPA compliance. References:
https://support.google.com/adsense/answer/9007197
https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions

Do not mark this study complete, manufacture scores or contact minors.
No outbound teacher pitch, email, ad-account changes or ChatGPT-native
scheduled tasks were created as part of this implementation.

## Verification and status definitions

- FIRST_LOAD_MOBILE_AD_LAYOUT: observed pass at 320/390/600/800.
- RESIZE_AFTER_AD_LOAD: observed Google iframe overflow, reload restores;
  provider-side behavior/account-side configuration remains external.
- CLASSROOM_TECHNICAL_READINESS: implemented and scripted4/4 pass.
- AUTHORIZED_REAL_PUPIL_STUDY: NOT CONDUCTED, pending human authorization.

## Additional classroom readiness verification

A strictly local teacher-guide.html (not part of the public 29-page GitHub
Pages site) offers printable educator-only instructions, actual links to
four experiments, expected scientific findings, a privacy/consent warning
and a deliberately blank anonymous outcome tally. The preview banner
links the guide on every local classroom page. At320px Chromium the
guide's 373px tally table scrolls within its own 290px region,
while document scrollWidth remains320px. All30 local routes including
teacher guide were tested in same-origin Chromium; no automatic
cross-origin resource requests or GA4/AdSense scripts were detected
in the tested startup navigation path. This is not a network firewall
or a substitute for institutional privacy approval, and no child
participants have been recruited or evaluated.
