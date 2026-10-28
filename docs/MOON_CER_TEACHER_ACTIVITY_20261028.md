# Moon phases: teacher-ready CER activity

Date: 2026-10-28. Scope: `/moon/phases/` plus a standalone print handout.
Status: implemented and locally validated. Publication/adoption outcomes require separate evidence.

## Problem and independently evaluated feedback

An upper-elementary educator-editor reviewing a separate proposed Moon-phase teaching article requested three specific, equally sized illuminated-disk prediction options; a replicable lamp–ball–observer setup or an original diagram; clear teacher instructions; and a lesson that works without students visiting a website. Their prior comments also valued learning objectives, age-appropriate Claim–Evidence–Reasoning (CER) prompts, hypothetical student examples, differentiation and an exit check.

These are useful *product design requirements*, not a grant of editorial rights, classroom effectiveness evidence, approval of Space Atlas, a promise to publish a Space Atlas link, or permission to represent the editor as endorsing this site. The editorial article itself remains a separate workflow and can be used device-free; the editor requested that it not include the Space Atlas website.

## Product decision

- ACCEPT: a native three-choice prediction lab, inserted before the existing two-view Moon simulator. Three diagrams have identical disk geometry and keyboard-accessible native radio buttons. The checked response selects the existing First Quarter 90° model and explains the phase-vs-illumination misconception. The native `<details>` keeps the answer accessible even with JS disabled.
- ACCEPT: an original labelled top-down lamp, ball and observer SVG and precise procedural steps, safety notes, example CER writing, 30–35 minute Grades 3–5 lesson sequence and differentiation. The geometry is conceptual, deliberately not to scale; near-field classroom lighting provides only an approximation. Do not imply real observations or classroom testing.
- ACCEPT: `assets/handouts/moon-phases-cer.html`, a standalone self-contained teacher guide plus student worksheet. It has no image CDN, JS runtime, tracking, ads, external asset requests or student account requirement. Teachers can print or save the two pages for offline use. The answer key is on the teacher page, not the student page.
- RETAIN: original H1, canonical/JSON-LD, 3D model, existing source panel, existing GA4/AdSense layout and established teacher-distribution experiment. No third-party art, new runtime dependencies or paid services.

## Scientific evidence and limitations

- NASA Moon Phases: `https://science.nasa.gov/moon/moon-phases/` — half of the Moon is ordinarily sunlit; at First Quarter about half of the disk *visible from Earth* is bright; a quarter refers to the phase cycle.
- NASA Lunar Activities: `https://science.nasa.gov/mission/lro/lunar-activities/` — hands-on lunar-phase modeling with a ball and light is a known instructional pattern.
- The page distinguishes the classroom model from lunar distances, size, orbital tilt and visual orientation in the real sky. Neither a nearby lamp nor a static picture gives calibrated sunlight or actual classroom outcome data.

## Source changes and testing

- Main activity: `pages/moon/phases/content.html`, `assets/js/moon-cer.js`, `assets/js/moon-phases.js`, `assets/css/style.css`.
- Offline print file: `assets/handouts/moon-phases-cer.html`, copied to public via the existing Python build.
- New automated gate: `ci/verify_moon_cer.mjs`, registered in both deploy and scheduled read-only CI workflows.
- Compatibility: `ci/verify_user_flows.py` now recognizes a real bundled static asset link as valid without adding it to the 28 indexable pages or sitemap. Missing asset links still fail.
- TDD: initial test failed because handout absent; later science test failed until lamp-side illumination was corrected. Then `verify_moon_cer` passed.
- Full production build: 7 Python CI checks + 17 Node checks + `node --check` all JS + `git diff --check`, all passed.
- Manual isolated Chrome QA: `/space_atlas_student/moon/phases/` with correct production path; 320, 390 and 1280 px widths without horizontal overflow. Choosing `quarter` and checking updates the live model to First Quarter/90° with an accessible explanation.
- Offline handout opened through `file://` with zero external resource requests and no `<script>`. Print-to-PDF inspected: two US Letter pages (teacher / student), original geometry and all CER lines visible.

## Outcome and follow-up boundaries

This work establishes *availability* of an original teacher-ready product resource, not teacher use, classroom trial, editorial website endorsement, article publication, Google indexing or traffic/engagement impact. Measure those separately with native evidence. Revalidate live GitHub Pages after a successful verified deployment before reporting public availability.
