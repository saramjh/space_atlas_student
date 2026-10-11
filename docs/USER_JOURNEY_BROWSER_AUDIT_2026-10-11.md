# Space Atlas — Real Browser User-Journey Verification (2026-10-11)

## Coordination, environment and limits

User request: validate actual entry → learning interaction → explanation/quiz → next topic across devices, while **coexisting with other browser sessions**. Git baseline `adaaa46`. Other running Chrome profiles/processes were observed; none were stopped or attached. Reserved isolated `agent-browser --session atlas-journey-audit-20261011-*` session names; never used human browser Chrome CDP 9222 or `close --all`. Published cross-session advisory in `.context/BROWSER_COORDINATION_FLOW_AUDIT_2026-10-11.md`. There is no direct mechanism to send a message to other conversations, so coordination is on-disk and by non-interference, not an assertion of direct inter-agent acknowledgment.

Tests were conducted against actual GitHub Pages HTTPS on production 320/390/1280px in independently named Chrome-for-Testing sessions. Scoped remedial changes were separately tested in isolated /tmp copied build served at localhost:8843 with AdSense disabled, **not** in the shared project public/ or other processes. A failed browser click due to the sticky header's automated scroll alignment was noted but **not** generalized to all human users; scrolling to a truly visible control and repeating succeeded.

The site's static link graph CI reports 28 indexable URLs, 26 topic pages, 136 contextual edges, no broken routes/fragments or orphan lessons at time of this audit. This does not measure search-console indexing, genuine learner retention, teacher outcomes, or every possible navigation path.

## Actual end-to-end flows

| Scenario | Viewport | Actions | Result |
|---|---|---|---|
| Home → Search Moon → Moon phases | 390 | Mobile Search 42×42px in header; search ‘moon’ yielded 6 candidate pages; Esc restored focus; ‘Moon phase’ narrowed to 1; Enter navigated | **PASS**: no page overflow; source links available; correct destination. |
| Moon phases → Quiz → Eclipses | 390 | First Quarter = 90°, 50% lit; New Moon = 0°, 0% lit and aria-pressed synchronized; wrong quiz answer yielded causal correction; followed 'Next in series' | **PASS** after module ready; scientific/semantic state aligned; URL led to eclipse explanation. |
| Eclipses → Tilt → Tidal locking | 390 | Initially 3D readout empty/control action dropped while external Three.js module had not finished; after readiness tilt-on → 'New Moon, but off-plane', full Moon tilt-on and tilt-off readouts responded; followed next | **CONFIRMED initial-loading UX problem**, not permanently broken rendering. Model code renders orbital 15° but old label told users it was real ~5°; the documentation omitted the exaggeration. Corrected in scoped patch and tested. |
| Tidal locking mode experiment → Earth/Moon scale | 390 | Real vs hypothetical switch changed picture/status and route next opened | **PASS visual interaction, FAIL initial accessibility semantics**: both mode buttons lacked aria-pressed and status had no live region. Corrected and tested. |
| Home → Search light-year → Universe Scale | 320 | Search, Enter, select Proxima Centauri (4.25 ly), follow next to 8-step scale, Next/Previous | **PASS after JS initialized**: selected distance readout and scale labels update. Observed initial blank readouts on very rapid navigation before module ready, which remain follow-up systemic issue on some models. |
| Desktop navigation → Planet interiors → 3D exterior | 1280 | Solar System dropdown, planet interior center selector (Jupiter diffuse core), opt-in WebGL planet viewport, Jupiter texture and source | **PASS after readiness and natural scrolling**: selected states/source updated, no width overflow. In immediate automated click after navigation, panel loading or sticky header positioning could intercept action; 3D explicitly displays 'Preparing 3D view…', unlike eclipse before correction. |
| Planet interiors → Compare planet diameters → Distance scale | 1280 | 'Next in this series', preset Earth/Mars, read stats, next distance scale | **PASS after JS ready**. Early preset click before select options initialized was ignored; after ~900ms options populated, Earth/Mars control and results updated; next link worked. HTML originally showed static Jupiter/Earth values during hydration. |
| CDN Three.js deliberately unavailable (isolated build) | 390 | Abort unpkg.com Three.js request, open eclipse lesson | **Improved fallback PASS**: static eclipse reasoning and NASA evidence remain visible, all dependent controls disabled, aria-busy/loading note explicit, no horizontal overflow; prevents deceptively clickable controls. |
| Local corrected eclipse model → Locking ARIA | 390 | Normal engine loading; tilt on/off, full moon, locking mode switch | **PASS**: model ready removes busy/disables, 15° drawing vs real ~5.1° stated, lunar locked/unlocked native aria-pressed toggles and status announces changes. |

### Severity and corrective action

**P1 — source integrity:** Eclipse page labeled the tilt as the real approximately 5° but rendered 15° to magnify it. Fixed by disclosing 15° drawing exaggeration next to checkbox, in static model-limit paragraph, and in readout wording. Scientific geometry is *still* a simplified conceptual scene without actual node timing; do not present it as an eclipse predictor.

**P1 — misleading interaction:** Before the CDN Three.js module initialized, eclipse controls appeared active but ignored clicks and the readout started blank. Fixed with a meaningful pre-rendered explanation, visible initialization state, and controls disabled until successful initialization; after ready they are enabled, state becomes not busy and loading note hidden. With CDN blocked the source-text explanation remains available.

**P1 — accessible meaning:** Tidal-lock mode buttons previously changed only CSS `active`, not their aria-pressed state; no live announcement on model status. Added pressed-group semantics, true/false synchronized with both modes, role/status and aria-live. Both click directions verified.

**P2 — recurring enhancement timing:** Universe-scale initial `#zoomStage`, light-year `#lyReadout`, and planet-size early select options can be blank or stale before their JS modules initialize. After module readiness interactions worked. A future wider contract should render meaningful static fallback output and explicitly guard controls until ready, rather than treating a link/layout CI pass as sufficient.

**P2 — scroll/auto-click:** Chromium agent automation intermittently tried to auto-scroll an interactive control beneath the sticky 67px header and reported interception. Manually scrolling such that the control was visible allowed activation. Needs specific genuine mobile/manual friction study before classifying as a general blocker or touching the global sticky header.

**P2 — other deep-browser coverage:** These flows exercise multiple independent representative journeys; they are NOT exhaustive functional E2E for all 26 learning topics nor a formal WCAG/screen-reader audit.

## Verification contracts

- Source scopes: `pages/moon/eclipses/content.html`, `assets/js/eclipses.js`, `pages/moon/tidal-locking/content.html`, `assets/js/tidal-locking.js`, `ci/verify_ui_controls.py`.
- Added CI assertions that the four eclipse controls start disabled during engine initialization, static readout/real-vs-illustrative tilt disclosure exists, runtime enables controls/removes busy, locking buttons expose and update aria-pressed/aria-live status.
- Isolated ad-free and production-mode full 28-page static build, semantic 28-page gates, mathematical/SEO/userflow/3D physics gates, JS syntax and diff whitespace passed.
- Browser local corrected eclipse/locking 390 normal and third-party Three.js abort scenario verified. Production HEAD 8789eda GitHub Pages run 38131864380 SUCCESS. Actual HTTPS Chrome390 confirmed tilt 15° drawing versus real ~5.1° label, loaded model aria-busy=false, controls enabled, full Moon with illustrated tilt shown as off-plane, NASA source and original canonical retained, no horizontal overflow; Tidal-locking real/unlocked buttons now aria-pressed true/false → false/true and readout announced as role=status.
- Owner-shared user dirty README/.gitignore and other sessions' Chrome profiles/servers never touched. No invasive browser shared state, login, email or user account operation.

Next step: test/reuse a generic initial-state→ready-state contract for remaining JS-dependent interactive lessons, then targeted screenshot review of small-screen clicks and source claims, prioritizing actual repro over speculative re-layouts.
