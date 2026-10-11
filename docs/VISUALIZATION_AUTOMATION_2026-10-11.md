# Space Atlas — Autonomous Learning Visual QA Loop
Status: configured locally, pending release verification. Started 2026-10-11 (KST).

## User mandate and boundaries
The user requests proactively continuing Space Atlas improvements without per-file approvals. This project uses a bounded workflow: audit → prioritize verified learning/science defects → implement in a batch → desktop/mobile/keyboard/static regression → scoped publish → live verification → Serena/context checkpoint.

This **does not** mean a local CLI agent will spend paid model tokens around the clock, write scientifically unreviewed content automatically, change user accounts, or keep running after chat unless an actual supported scheduler is installed. The scheduled routine is read-only and deterministic. Research/UX implementation still requires an authorized agent execution and may occur in a future session.

## Scheduled read-only automated checks
Workflow: `.github/workflows/site-health.yml`; GitHub Actions on the **public** repository.

- Schedule: 00:17 / 06:17 / 12:17 / 18:17 UTC every day (09:17 / 15:17 / 21:17 / 03:17 KST). GitHub may delay scheduled runs, particularly at high traffic. A run is not guaranteed at an exact minute.
- Manual trigger: `workflow_dispatch` from GitHub Actions; can be used to audit now after a deploy.
- Reads every source-declared public URL, single H1, declared canonical, single valid JSON-LD LearningResource and original primary ad identifier within delivered HTML. Also checks referenced same-site script/CSS files are fetchable. Retries transient HTTP failures.
- Rebuilds the complete production variant and runs all 27-page regression and focused JS/physics/source tests. Does not deploy, modify settings, send messages, write issues or launch a coding agent.
- Generates `reports/space-atlas-live-health.json` and `reports/space-atlas-visual-coverage.json` as run artifacts retained for 7 days. The coverage report is a **heuristic** ordering of pages for subsequent human/scientific review, not an evaluation of learning effectiveness.
- GitHub Actions reports a failed run when a public route, asset, SEO or build invariant fails; GitHub notification delivery depends on the repository account's notification settings. The workflow does not itself guarantee a notification reaches the user.
- The existing `gh-pages.yml` continues the separate push-triggered build→test→deploy path. New Kepler test is included there. Distinct concurrency groups prevent the auditor from canceling deploy.

## Verified baseline (before activation)
- A real read-only run checked **27/27 existing pages and 29/29 shared or page-script/style assets**, with zero errors. This is an HTTP/static-evidence result, not proof of working client JavaScript or search ranking.
- GitHub repository API reports `private=false` (public).
- The resulting artifacts are kept inside Actions. Local `reports/` is already an unrelated untracked workspace and is **not** staged into Git.

## Additional visual-learning improvement — Kepler's third law
The /solar-system/orbital-periods/ age calculator explained result but not *why* a Neptune year is so long. Optional selector and actual logarithmic-logarithmic curve (120 pre-rendered SVG points) now explain `T² ≈ a³` for planets around the Sun, with NASA semi-major axis AU and period (days/365.25 Earth years). Each selection shows observed approximate orbital period against ideal predicted `sqrt(a**3)`; on small screens the internally scrollable SVG follows the selected mark, while the page itself never scrolls horizontally. The chart is a schematic relationship (not orbital motion or distance on a linear ruler). All original 8-planet static period lists and questions remain in HTML. Primary NASA source: https://science.nasa.gov/solar-system/orbits-and-keplers-laws/.

## Operational expectations and failure routing
1. On failing scheduled health run: inspect the Actions log and downloaded JSON first; determine whether a transient GitHub Pages/CDN outage, missing file, canonical drift or genuine source regression occurred.
2. A later coding session or supported runner may fix verified issues, but must apply Constitution release gates and never blind-commit from a heuristic report.
3. Rank the coverage report alongside actual GA4/GSC page data when available, then choose a *specific question* and authoritative physical source before adding a component.
4. For each approved batch: update this document and the Serena visualization topic memory and checkpoint. No paid dependencies, no auto-mass-modification of indexed pages, no account-side AdSense editing.
