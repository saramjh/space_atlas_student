# Space Atlas — Code quality and regression audit
Date: 2026-10-11 KST
Base: GitHub main `b84b1cb` before scoped fixes
Status: partial high-confidence fixes; remaining debt ranked below.

## What this audit does and does not prove

Reviewed Python static site generation, existing GH Actions, 28 generated pages, core JS utility/scene/search/quiz modules, science visual modules and shared CSS. Confirmed browser behavior with real Chromium where noted and covered fixes with a new dependency-free JS test. An existing 28-page regression suite passing indicates stable known behavior, **not** the absence of code smells or accessibility defects. No full external axe/Lighthouse browser sweep, memory profiler on all devices, or coverage-certified audit has been completed; avoid declaring the codebase clean.

## Defects reproduced and repaired in a scoped release

| Severity | File/evidence | Root cause and observed impact | Remedy and gate |
|---|---|---|---|
| P1 · user keyboard flow | `assets/js/search-modal.js`, former global Enter handler; real HTTPS Chromium on desktop: with `mars` search results displayed, focus on **Close**, press Enter unexpectedly navigated to first result (/solar-system/gravity-comparison/) | Global Enter navigation ignored current focused element. | Only Enter from **search input** activates first result; close button/links get native keyboard behavior. Dialog focus is restored to opener. Dedicated VM test plus desktop real-browser test. |
| P1 · accessible motion | `assets/js/scene.js`, default `moving=true`; real HTTPS Chromium with `prefers-reduced-motion: reduce` showed **Pause motion** by default despite OS request | 3D hero ignored OS reduced-motion preference. | Default pause under reduced motion; dynamic preference change auto-pauses, never auto-resumes. Control accurately reflects paused state and `aria-pressed`. Reproduced local Chromium 390px shows **Resume motion**, `aria-pressed=true`. |
| P1–P2 · wasted WebGL frames | `assets/js/three-base.js`, original `animateLoop` unconditionally scheduled new rAF and invoked callback while backgrounded | Common loop had no document visibility handling or cleanup API. Browser may automatically throttle, but code was still unnecessarily scheduling 3D callbacks when the tab was hidden. | Visibilitychange suspends scheduled frames, resumes with reset clock (no long jump) and exposes disposer. Tested with synthetic rAF scheduling/hidden/resume transition; previous page modules still call without changes. **Off-screen but foreground page still updates; see remaining work.** |
| P2 · shared quiz accessibility | `assets/js/quiz-widget.js`, 24 occurrences of quiz feedback markup without status semantics | Dynamically updated correct/incorrect feedback had no `role=status` / live announcement in common quiz handler; problematic for assistive technology. | Shared init assigns `role=status`, `aria-live=polite`, `aria-atomic=true` before updates. Verified local browser and dedicated VM test. Actual screen-reader announcement not separately tested. |
| P2 · async search loading | `assets/js/search-modal.js`, prior `filter` returned early while index not yet present and successful `loadIndex()` never re-ran query | Fast typing could leave an empty results panel despite index arriving. Root cause confirmed statically; slow-fetch race simulated in regression. | Show loading status, single in-flight index request, automatically re-filter current query after resolution, retry on failure. Deferred-Promise VM test. |

## Remaining verified design smells (not yet broadly refactored)

- **P2 — Cascade overrides and obsolete styles.** `assets/css/style.css` is **826 lines / ~76 KB** with dense one-line rules. `.temp-axis` is defined **five times** across rules/media queries (approx. lines 703, 744, 747, 753, 757). Original vertical-chart `.temp-bar-col` styling remains despite signed horizontal chart replacing it. This increases accidental responsive regressions. Prefer staged deletion of proven dead selectors and extract per-feature CSS after screenshot parity tests. Not a direct proof of CSS rendering failure.
- **P2 — Eager WebGL on home and lifecycle ownership.** `assets/js/main.js` statically imports `scene.js`; `scene.js` constructs Three.js objects on initial page load. `createSceneBase` owns `ResizeObserver` but has no `disconnect` return or renderer/texture/geometry disposal. Hidden-tab frame pause is fixed; a scene remaining off-screen while its tab stays visible may still consume GPU, and disposal for soft navigation is not defined. Investigate `IntersectionObserver` and a teardown contract with measurable Chrome performance before adding abstractions.
- **P2 — 3D lazy-globe async/error ownership.** `assets/js/planet-surface-3d.js` caches texture Promise objects, and `choose` handles async failures via one shared callback even if a newer selection occurred; loaded textures and observer persist without an explicit disposer. No measured leak established; add rapid-toggle and failed-texture scenarios, stale-response suppression and bounded cache disposal tests before rewriting.
- **P2 — Static site builder has accumulated responsibilities.** `build.py` produces learning data, release manifest validation, sitemap, search index, canonical/JSON-LD and monetization template rendering in one ~380-line file. `git_lastmod_for_page` invokes a Git subprocess per page (and may be called multiple times) and release data reads the manifest anew for different outputs. Build is currently only a few seconds and CI passes; split into focused modules only after characterizing build cost and preserving output byte semantics.
- **P2 — Browser E2E automation gap.** Existing CI's specialty physics tests use source/DOM mocks and static HTML assertions. Manual Chrome tests caught actual search keyboard and reduced-motion issues that were not covered. Add a small repeatable CI browser test for keyboard search, reduced motion, focus restoration, 320/390px layouts and semantic output, with no new paid services or excessive dependencies.
- **P3 — Limited HTML sink centralization.** Content modules use many `innerHTML` assignments, often combining page-owned static scientific strings. No evidence of a currently exploitable user-input injection in the reviewed paths. Continue using `textContent` for untrusted text and an allowlisted renderer for trusted rich text if external content sources are ever introduced.
- **P3 — Residual duplicate widgets.** Several lesson scripts repeat zoom navigation, canvas sizing and preset handling, while old `initToggleCards` remains in shared quiz utilities for the home page. Do not introduce an abstraction solely to reduce LOC; consolidate only functionally identical behaviors under tests.
- **P3 — Design-critical magic numbers.** Some science models have illustrative constant sizes and compressed scales. They are generally disclosed; maintain a coherent source/coordinate contract, and prohibit changes without data/math checks rather than stripping necessary pedagogical constants.

## Non-bugs / controls working as designed

- Existing 27 indexed learning pages, ad-free /updates CollectionPage, original canonical/H1/JSON-LD, controlled AdSense units and 4/day read-only health workflow are explicitly tested and preserved.
- Static astronomical content stays visible when custom JS does not load. Optional globe uses lazy import while the home hero remains an intentionally present 3D scene.
- NASA/NOAA science source labeling and pedagogical model limitations are present; this audit does **not** independently revalidate every physical simulation formula or derived datum.
- No installed framework, package.json dependency tree or runtime secret handling that would justify a general framework/security rewrite.

## Safe follow-up order

1. Stabilize and release scoped P1 search-keyboard/reduced-motion/hidden RAF and shared quiz status fixes; verify local+production static, real browsers and live CI.
2. Screenshot-diff the signed temperature chart at 320/390/800/1280, then remove duplicate/dead CSS selectors and regroup by component without altering styling.
3. Add a limited real-browser regression suite for first-interaction, keyboard/focus, reduced-motion and deep-link SEO on representative pages.
4. Profile WebGL foreground/offscreen frames and optional 3D texture ownership; add cleanup and cache controls only where observed or testable.
5. Split build responsibilities gradually with characterization tests for generated outputs, canonicals and source dates.

All code edits must preserve unrelated local README indexing-audit and .gitignore changes, /updates release process, and static search SEO. No claim of full AI-slop-free status is justified by passing tests alone.
