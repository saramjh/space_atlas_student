# Space Atlas — mobile AdSense and SVG path/arrow visibility audit

Date: 2026-10-29. This records actual source changes, browser tests and genuine unresolved risks. It does not claim an actual Google filled ad was served or complete human usability testing.

## Publisher-controlled AdSense

The existing fixed 320x100 pixel mobile ad was placed inside a parent with 28px side padding, despite some devices having only 320px of usable width. The separate Google Auto Ads script also inserts automatic ad elements such as adsbygoogle-noablate and aswift iframes. Earlier browser sessions found 645–680px mobile document widths under some provider states, but recent actual live browser sessions had unfilled ads and document scrollWidth equal to viewport width. These must not be treated as equivalent observations.

Publisher slot fix: styles in templates/ad-slot.html now set the primary and secondary ad size to 280x100 for screens less than 360px, 320x100 for 360–599px, 468x60 for 600–799px, and a fluid box no wider than 970x90 at 800px+. The parent uses box-sizing border-box, width 100 percent and padding 12px on each side below 600px. Existing publisher ID ca-pub-4410729598083068, ad unit IDs 2983244729 and 1670163057, Google loader and per-unit request calls all remain intact. No filled creative is hidden, clipped, resized after rendering or impersonated in production. Google explicitly permits exact per-screen-width CSS sizes: https://support.google.com/adsense/answer/9183363 ; fixed size limits: https://support.google.com/adsense/answer/9185043.

TDD test ci/verify_mobile_ad_slots.mjs first failed on the 320px narrow slot then passed on updated source, built HTML and unchanged advertising contracts. Manual real Chromium probe in ci/browser_mobile_ad_geometry_audit.js simulated a filled publisher slot only within a disposable QA page, then restored the actual DOM. All 9 tested viewport widths 320,340,360,390,599,600,799,800,1280 fit within screen bounds with unchanged document width. The measured publisher widths were respectively 280,280,320,320,320,468,468,744,970px.

Residual external blocker: the owner-side Auto Ads format may insert an independent oversized overlay outside the explicit publisher ad units. No account-side AdSense setting was changed. A filled Google creative could not be observed in this session to prove the historical provider-origin 645px overflow no longer occurs. Resolving that separately requires checking AdSense account Auto Ads/overlay formats and a true filled-ad test. Do not equate a synthetic layout measurement with live inventory.

## SVG and nontext path geometry

Previously the Moon Phases right-angle teaching symbol was corrected and now has a dedicated mobile, desktop and print geometry regression ensuring the arc is outside the opaque observer and drawn after it. The prior text-label-only audit covered 16 routes and 27 visible SVGs / 68 labels under its visibility checks.

New manual Chrome audit utility: ci/browser_svg_path_visibility.js traverses the 16 SVG-bearing routes, samples geometry point locations for visible SVG path, line, polygon and polyline strokes, and checks transformed screen positions for off-viewport samples or later-painted covering elements. It distinguishes raw intentional paint-order candidates from identifiable semantic path IDs. At 390px: 42 visible SVG elements including shared icons, 56 visible stroked paths, 490 sampled points, 73 covered sample points, five candidate routes, but zero identified critical semantic paths with greater than 55% blocked samples or 5+ out-of-bounds. At 320px: 42 SVG, 56 stroked paths, 485 samples, four candidate routes. At 1280px: 27 SVG, 42 stroked paths, 378 samples, five candidate routes. Reported candidates were inspected in rendered screenshots.

Intentional paint-order overlap includes: Light-Year baseline beneath progression line; the Tides sunlight sightline behind Earth and ocean body; Moon Phases classroom lamp X and sightline layers; Exoplanet Transit dashed projected orbit behind a star and light curve above grid lines; the Kepler plot grid under foreground plot; and Eclipses sightline endpoints touched by opaque Earth/Moon indicators. Thin paths sometimes hit-test to the background because of subpixel antialiasing. Such intersections are not intrinsically defects; flagged samples are a shortlist for actual visual review.

A genuine new issue was found in Gravity Comparison: the six-unit radius line at baseline ran between two three-unit marker dots, becoming effectively invisible. It now appears as a gold 2.5px guide offset downward to y=116; the endpoint still tracks selected model radius from the center x-position. Its caption explicitly states the guide is displaced for visibility while the circle radius itself remains linearly scaled. Actual 390px screenshots compared before/after and the semantic path hit test improved from 5/9 blocked samples to 0/9. TDD regression ci/verify_svg_path_semantics.mjs guards the corrected geometry and the prior Moon arc layer contract.

The path audit is broader than text-only checking but cannot certify all artistic compositions, every animated state, scientific implications of every overlap or every device. It provides a repeatable candidate-review process, not an assertion of universal zero visual defects.

## User research distinction

A separate protocol in docs/LEARNER_USABILITY_STUDY_PROTOCOL_20261029.md defines supervised, permission-compliant grade 4–8 predict–interact–explain tasks. No genuine pupil testing, pupil outcome data or unsupervised under-13 compliance claim was performed.

Release CI must run the two new Node regressions along with the existing science, SEO, mobile and learning-flow gates. Do not change unrelated Git files or simulate ad revenue.


## Verified production deployment

Source release commit: 02b560eb6f5c9b4bb3403cad05a9806bea10c42d. GitHub Pages run 40811625204 completed SUCCESS for that exact source SHA. Actual public HTTPS HTTP200 for /moon/tides/, /solar-system/gravity-comparison/ and /assets/css/style.css with new exact sizes and radius geometry. In live 320px Chromium a temporarily simulated publisher unit measured 280px wide centered at x20 to x300 with document scrollWidth 320. Separate automatic Google ad elements remained present and were not hidden; their actual filled inventory was not verified. In live 390px Chromium the Gravity radius line had y116, contrasting gold stroke and explicit offset explanation. All 13 Python +30 Node scientific/UX/SEO/ad/vector regressions and JavaScript syntax were green before committing.


## Later controlled initial-viewport forensic correction

A subsequent browser investigation revealed that the earlier live 645–680px measurements arose when the browser loaded a 970px Google ad at desktop width1280 and was **resized to mobile after the ad request**. In separate tests where the viewport was set before first load, 320/390/600/800px all fit. Moon Phases table has its own intentional horizontal scroll container and does not cause a document overflow on first mobile load. Reloading at390 after a desktop-to-mobile resize recreates the ad at320px and clears the overflow. See docs/ADSENSE_AND_SUPERVISED_CLASSROOM_FINAL_AUDIT_20261029.md; provider post-load resizing behavior and actual AdSense site settings remain separate from publisher first-load CSS.

### Radius-guide center-to-surface correction (2026-10-30)

**Owner review overturned the previous offset workaround.** The prior 2.5-px gold radius line at y=116 was semantically misleading: its x-coordinate length matched the body radius, but visually the line appeared to float beneath the center rather than connect center and surface. The earlier 0/9 path-occlusion test judged paint visibility rather than whether a learner correctly understood the geometric referent.

The revised source and live DOM render place the gold radius line exactly at **(92,100) → (92 + 7.5 × Rₑ,100)**, with the existing black center point and rust-red surface test point as its explicit endpoints, and a nearby x-tracking **Radius: n.nn× Earth** annotation. At small 1× Earth, the endpoint markers are reduced to radius 2 SVG units so part of the true 7.5-unit segment remains visible; even if small, the anchored legend and point locations convey the meaning. Body and fixed Earth reference circle now use the same 7.5-unit-per-Earth radius baseline scale. The previous 'offset downward for visibility' caption was deleted rather than rationalizing misleading geometry. The inward arrow still represents **direction only**, not modeled gravity strength.

New `ci/verify_gravity_radius_geometry.mjs` intentionally failed against the original offset figure (RED) and then checks static HTML and dynamic states at R=1, 2, 9.64, 11.21 and 12, including center-to-surface geometry, radius-label alignment, and the original M/R² science. `ci/verify_svg_path_semantics.mjs` now enforces geometry rather than preserving the previous displaced line; broader SVG audit reports remain historical. Reassess production click/keyboard and mobile/desktop screenshots after deployment before declaring public success.

In the first deployed desktop browser audit, the long phrase `R = 12.00× Earth radius` extended to SVG x=351.9 (beyond the 340-unit boundary); changing the on-figure label to `Radius: 12.00× Earth` places its measured right edge at x=331.0, inside the diagram, while the full SI interpretation remains in the adjacent descriptive text. This is a responsive visual correction, not a science change.
