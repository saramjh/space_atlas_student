# Space Atlas — Interactive Visualization Constitution

Status: active, 2026-10-11 (KST). Applies to all new and changed learning visualizations.

## 1. Objective and decision order

Enhance **scientific understanding**, not animation volume. For each page first identify the learner's question, what the learner cannot infer from the static representation, what manipulating a variable would teach, and whether that insight is supported by evidence.

Order of authority: observed project code and runtime → current project decisions → scientific primary source → archived context. No fabricated data, decorative simulations presented as measurements, or exaggerated claims about search performance.

## 2. Mandatory lifecycle and continuity

1. **Restore:** call cokacremote `project_context_bootstrap(path="/Users/ojihun/DEV/space_atlas_student", detail="full")`; inspect AGENTS.md, this document, .context/DECISIONS.md, source files, current Git diff, and last checkpoint. Use Serena for semantic retrieval as needed and claude-mem as historical context, not as higher authority. Read Ponytail's reuse/YAGNI policy. Do not discard pre-existing local changes.
2. **Audit:** distinguish factual error, inaccessible control, low-value static illustration, and an actual modeling opportunity. Do not replace static content that already answers the question better.
3. **Propose internally and preflight:** record the targeted misconception, variables, units, range/domain, assumptions, source, uncertainty, states and user interaction. Check for existing reusable Three.js, SVG, CSS, Canvas or native DOM code and installed design/browser skills before considering additional tools.
4. **Implement narrowly:** maintain the dependency-free Python static build and editorial design language. Prefer native SVG + JS + CSS for 2D explanatory visuals, existing Three.js for spatial models. New runtime libraries only after documented comparative need and bundle/performance/security review; no cost-bearing dependencies without approval.
5. **Validate:** build both local and production variants; run `python3 ci/verify_build.py`, `node --check` for changed JS and any focused tests; browser-test meaningful state changes, physical invariants, motion state, keyboard, pointer/touch, 320/390px mobile, tablet and desktop, reduced motion and JS-disabled reading. Visually inspect content, not only successful build output.
6. **Review and log:** compare affected canonical, headings, internal links, metadata, JSON-LD, main explanatory HTML, ad positions and analytics boundaries with prior behavior; check scrolling/CLS/performance. Preserve unrelated dirty files.
7. **Checkpoint:** after meaningful decision, constraint, implementation, verification or blocker, call `project_context_checkpoint` with verified files, checks, decisions, risks and next action. Update this constitution/audit and Serena topic memory when materially revised. Do not defer persistence until the end of the chat.
8. **Deploy only after gates:** keep rollout limited and reversible; verify live content/version and browser behavior; retain a rollback commit. Do not claim Google crawl/rank/revenue or increased satisfaction without corresponding data.

## 3. Science and visual evidence contract

- Every quantitative visual has explicit physical definition, source URL, units, scale type, domain and approximate/observed/model label. Confirm reference values and equations with authoritative agencies (NASA/ESA/NOAA etc.) or source scientific literature.
- Use true scale where it conveys the question; for huge ranges use **labeled logarithmic scale**. Never imply seven equal-width spectral bands are equal wavelength intervals.
- If a conceptual preview stretches time, distances, cycles or sizes, display **not to scale** adjacent to the view. Never present illustrative cycles as physically sampled wave counts.
- Model boundaries may be fuzzy; state that, and do not invent spurious precision. Preserve a visible static reference/range/definition beside interactive controls.
- Interactivity must produce an observable learner outcome: dynamically update linked measurements, comparison, explanation, or constraint. No inert animation-only buttons.

## 4. SEO/GEO and growth protection

- Keep all existing public URLs and canonical paths; preserve page titles/H1, static main answer, source links, useful body content, and semantically justified structured-data `@graph`.
- Keep content server-built in static HTML. JavaScript **enhances** it but does not become the sole carrier of explanations or citations.
- Do not add speculative AI markup, keyword stuffing, generic animated landing sections, client-side router, or framework migration.
- Respect existing controlled AdSense units and exclusions; never place controls near ads or change root-blog ad/analytics configuration. Avoid layout shifts, large blocking scripts and new CDN dependency.
- Keep the separate 2026-10-07 to 2026-10-21 teacher-distribution experiment confined to its three existing pages; a scientific-visualization pilot does not authorize expansion of that experiment.
- Record pre/post page weight, interactions, and search metrics **only when actually measured**. Treat impressions, ranking, classroom-share and engagement as distinct signals.

## 5. Accessibility and motion

- Make interaction operable with keyboard and touch, with native buttons/ranges, focus visibility, accessible label/state, readable values, logical order and sufficient contrast.
- Respect `prefers-reduced-motion`. Never autoplay continuous non-essential motion. Offer Pause/Stop for user-initiated motion, stop when tab is hidden, avoid flicker and excessive animation loops.
- Reserve space before dynamic output; ensure no horizontal overflow at 320/390px or breakpoint regressions. Provide readable static values when JS is absent or fails.
- Reuse existing `assets/css/style.css`, `pages/**/content.html`, `assets/js/<topic>.js` and existing quiz source. One page-specific component is preferable to a premature generic animation framework.
- **3D versus 2D:** choose the representation based on what can genuinely be learned. A globe and orbiting camera can teach viewpoint, silhouette, illumination and visible exterior appearance. A sourced 2D section or true-scale ruler is often clearer for interiors, dimensions and evidence uncertainty. Do not convert every model to 3D merely for realism.
- 3D planetary appearances require provenance for each texture: distinguish observed composites, processed mosaics and wholly illustrative global reconstructions. A detailed globe is not evidence that the whole surface, current weather or the deep interior has been directly photographed.
- On content pages, interactive 3D should be opt-in, loaded only on explicit user action, run without a perpetual render loop where possible, provide keyboard rotation / reset and gracefully preserve the 2D/source-based experience when WebGL is missing.

## 6. Skill/tool selection, already present

Locally verified: `~/.agents/skills/agent-browser` (actual browser QA), `web-design-guidelines`, `design-taste-frontend`, `ui-ux-pro-max` and motion-related skills; Three.js already imported by existing site. Use the specialized skill **only for its matching task**: browser QA and accessibility guidance for verification, editorial UI for presentation, motion guidance for controlled animation. Remotion/video/marketing motion tools are not suitable replacements for lightweight interactive scientific DOM models.

No installation necessary for the current logarithmic wavelength explorer. Re-evaluate library choice only when demonstrably richer interaction exceeds the existing toolchain.

## 7. Release gate — must not be bypassed

1. Correct model: sources, physical units, boundaries, calculation tests, domain limits and disclaimers.
2. Useful UX: interacting changes a specific learnable property and remains understandable at rest.
3. Accessibility: mouse/touch/keyboard, reduced motion, pause, static fallback, no obstruction.
4. Search architecture: no URL/canonical/H1/JSON-LD regression; significant explanatory text present without JS.
5. Performance: compare network load and layout stability, avoid unexpected dependencies, measure where accessible.
6. Context: update checkpoint, audit, decisions and open issues with verified facts before claiming completion.

Related work: `docs/INTERACTIVE_VISUALIZATION_AUDIT_2026-10-11.md`.
