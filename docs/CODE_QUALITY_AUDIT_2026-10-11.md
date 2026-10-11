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

## Footer structure follow-up — 2026-10-11

Confirmed in the live page before this scoped refactor:

- `templates/footer.html` compressed the entire landmark into one line; the single “What's New” link was outside the `.wrap.footer-grid` element instead of part of the aligned footer content.
- The `.footer-update-link` CSS incorrectly set `grid-column:1/-1` on an element that was not a child of the grid. Real Chrome 390px and 1280px computed left=0 for that link despite aligned footer content padding.
- The footer forced two narrow columns even at 390px and had no labelled footer navigation landmark. No evidence of SEO index problems from this alone.

Scoped correction: one semantic `<footer>` landmark containing a single `.wrap`; readable explanatory content, labelled `<nav aria-label="Footer navigation">` with actual existing educational and project page links, and a GitHub source link. Responsive CSS collapses description + nav to one main column on mobile, while nav groups remain a compact two-column link list. Obsolete `.footer-grid` and `.footer-update-link` styles are removed rather than layered with more overrides.

Regression gate: `ci/verify_footer.py` runs on all 28 generated public routes and checks a single footer/nav/wrapper, proper alignment ancestry, unique scoped links to generated internal pages, safe GitHub new-tab attributes and removal of abandoned selectors. Both GitHub Pages deployment and the independent read-only health workflow now run it. Browser QA before publication: 320px / 390px / 1280px with no document horizontal overflow, correct mobile reflow and unified footer padding. The update must still pass actual production GitHub Actions and live browser checks before marked fully released.

## Home disclosure/mobile navigation usability follow-up (2026-10-11)

**User evidence:** Screenshot of Home Section 04 (Read visualizations carefully) showed all three example bodies visually exposed even though labels still said *Tap for an example*. The illustrated card could say *Hide example* while sibling cards still displayed exposed bodies. User also identified the mobile Search button's earlier placement inside the horizontal topic navigation.

### Reproduced behavior and actual cause

- Production HTTPS Chromium, 390px: all 3 closed-state `.truth` cards had example element bounding-box heights of approximately 88px before interaction, while their labels remained *Tap for an example*. The old `initToggleCards` script wrote `.open` and pretended each entire article was a button. Early `.truth-example{max-height:0}` and `.truth.open` rules were overridden by a **later generic `.truth-example{display:block;max-height:none}` rule** introduced with the image provenance lab. This is a CSS owner collision, not a missing click handler.
- The main page's planet-diameter row used eight `div.planet-item` click targets, lacking native keyboard activation, and updated its fact panel using `innerHTML` for trusted in-app static strings. This is an accessibility and unnecessary DOM-sink smell.
- **Concurrent separate correction:** the newest source already contained `fc512af` (move mobile Search to dedicated header utility) and `65e36d1` (fingerprint the CSS cache). Verified current HTTPS390 Search is in the right-aligned header utility at x332, y15, with size42x42, **not** within the horizontal topic row. This follow-up did not re-implement that separately delivered change.

### Scoped implementation

- Replaced the Home Section 04 faux buttons with three standalone native `<details class="truth-disclosure"><summary>View an example</summary>...</details>` controls. Initial state is closed even without JavaScript. Explicit CSS prevents closed Home and Galaxy examples from being visually exposed; open state is represented by native details plus a directional indicator and keyboard focus ring.
- Deleted obsolete `initToggleCards` from shared quiz module, its unused call/import from homepage interactions, `.truth.open` CSS, duplicate generic `.truth-example` and `.truth-hint` declarations. Styling is now single-source and does not hide scientific explanatory content from static HTML crawlers.
- Converted eight Home planet comparison items into native `<button type=button aria-pressed>` with a grouped label, keyboard activation, synchronized selection and a `role=status aria-live=polite` fact readout. Replaced trusted text `innerHTML` updates with `textContent`. Focus ring is styled on the sphere rather than drawing an oversized rectangular outline around the full planet-size visual item.
- Added `ci/verify_ui_controls.py` to both deployment and scheduled read-only health jobs: checks structural DOM defects across 28 built pages (duplicate IDs, invalid `aria-controls`, inert links, button nesting), homepage native disclosure/button contracts, duplicate CSS-state owners and mobile Search placement, galaxy category disclosure preservation.

### Browser evidence and limits

- Actual browser with **320px mobile**: native disclosure initially 3 closed and hidden. Focusing the second summary and pressing Enter opens **only second** (height ~92px) and Enter again closes it (all heights 0). Jupiter is selectable with keyboard Enter and updates `aria-pressed=true` and numerical fact panel; page scrollWidth=320.
- **390px mobile**: Search is independently placed at x332 in header utility, opens modal with focus into `#searchInput`, Escape closes and returns focus to `#searchTriggerMobile`. Full page width stays 390.
- **768px tablet**: search at header right x698 and no document width overflow. **1280px desktop**: 3-column truth taxonomy, all 3 collapsed initially, page width1280.
- **390px Galaxy Types**: 3 independent example details stay collapsed (height 0 after explicit CSS) and first opens with Enter without opening others, doc width 390.
- No new scientific data, pages, canonical URLs, sitemap entries, JSON-LD semantics, paid dependencies or advertising positions. These are functional/semantic checks, **not** an exhaustive manual review of every visualization at every viewport. Continue targeted runtime interaction QA as more defects are reported.
