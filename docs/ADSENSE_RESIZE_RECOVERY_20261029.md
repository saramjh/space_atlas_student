# Space Atlas — user-initiated AdSense viewport recovery

Date: 2026-10-29. Scope: a publisher-owned fixed-display ad that retains desktop dimensions after a desktop-to-mobile browser resize.

## Reproduced

In actual Chromium on the public lesson, Google first displayed a 970px publisher ad at desktop1280. Shrinking the same tab to390 kept the970px served creative and its aswift iframe; document width became680px (ad x=-290 to680). Reloading at390 recreated a320px mobile unit with document width390. On initial mobile320 load, the ad sized280 and document width320.

Google says responsive units may re-request after device orientation changes, while fixed-size units do not dynamically resize, and arbitrary hiding, clipping, or artificial auto-refresh is restricted. References:
- https://support.google.com/adsense/answer/9183362
- https://support.google.com/adsense/answer/9185043
- https://support.google.com/adsense/answer/1354736

## Implemented first-party, optional recovery

The new assets/js/ad-resize-recovery.js and assets/css/ad-resize-recovery.css load only when AdSense is enabled in normal production. They are not included by the separate classroom preview. They do not alter publisher ID, ad slot IDs, GA4, Google creative markup, or ad accounts.

After a window resize, a visible publisher ad that still exceeds viewport plus an actual document overflow triggers a first-party message at the beginning of main, away from the ad. It appears only following a significant post-load shrink. It offers two accessible options: Reload page for this width (on explicit click only, with a clear warning that current lesson controls restart) and Continue without reloading. The user can dismiss the notice without any navigation or ad manipulation.

No forced automatic page or ad reload, no clipping or hiding a served creative, no replacement iframe, no artificial pushes to Google ad code, and no spoofing provider ad-state attributes. This avoids disrupting an ongoing science exercise unless the user chooses to refresh.

## TDD and browser QA

ci/verify_ad_resize_recovery.mjs was RED before implementation and GREEN after. The CI gate is wired into both Pages and scheduled site-health workflows. A disposable LOCAL Chrome test simulates the already observed 970px publisher width only inside its QA DOM and checks:
- Browser desktop1280 → mobile390: document width680 and recovery notice visible.
- Continue without reloading: notice closes and lesson controls stay present.
- Further narrowing to360: the notice reopens because the ad still does not fit.
- User clicks Reload: actual whole-page navigation, document width390, mobile unit width320, and no notice.
- First load at320: body width320 and no notice.

Provider behavior is not claimed repaired: this feature is an explicit user recovery route rather than a Google AdSense code fix. Switching ad formats or account monetization settings was not performed without verified impact review.

## Scope of the second outstanding item

Adult-supervised classroom testing is technically prepared, but real grade4–8 child usability/comprehension testing still requires real permissions, participants and dated educator evidence. A 4/4 automated task test is not a human study. No pupil data or invented outcomes were recorded.


## Post-release live evidence

Source commit bb1a0ab41cc877f6718279b0c9754e13d9a09933 was
deployed successfully by GitHub Pages run 40877847499.
Public source HTML, CSS and JavaScript each returned HTTP200 with
the new on-demand recovery module.

In a fresh LIVE Chromium tab:
1. Open Earth Seasons with viewport1280. Publisher ad actual rendered
   width970, document width1280.
2. Narrow the same tab to390. The original loaded Google ad
   remains970; document width680, first-party recovery notice visible.
3. Press Reload page for this width. After ordinary user-selected
   navigation, document width390, publisher ad width320 and the
   recovery notice absent. The lessons stay available.
4. In a separate local browser, first load at320 shows no notice;
   manual dismissal does not mutate any ad.

The actual live verification is stronger than the earlier
simulated local DOM check, but the provider-fixed-size creative
still does not dynamically resize on its own. This is a
documented, user-initiated recovery feature, not a claim
that Google AdSense itself was fixed.
