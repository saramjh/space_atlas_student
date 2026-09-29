# Space Atlas Growth Control

## Purpose

This file defines the measurable growth contract for Space Atlas after the 2026-09-29 acquisition-focused improvements.

The operating loop is:

**Measure → Classify bottleneck → Intervene → Validate → Observe → Re-measure → Escalate**

Growth work must not stop at "observe and wait." If a milestone misses its minimum success threshold, the next intervention is selected from the bottleneck-specific escalation policy below.

---

## Baseline

**Measurement baseline:** Google Search Console data available through 2026-09-26, checked 2026-09-29.

- Total observed search impressions: 34
- Search clicks: 0
- Verified organic sessions: 0
- URLs with search impressions: 5 / 27
- P1 URLs indexed: 2 / 5
  - Moon Phase Simulator: indexed
  - Mars Weight Calculator: indexed
  - Age on Other Planets Calculator: unknown to Google
  - Planet Size Comparison: unknown to Google
  - Exoplanet Transit Simulator: unknown to Google
- Sitemap: valid, 0 warnings, 0 errors
- 2026-09-29 intervention batch deployed:
  - calculator/simulator intent alignment
  - crawlable initial results
  - corrected planet-volume calculation
  - direct contextual links from the main blog
  - updated sitemap lastmod values
  - refreshed sitemap submitted to Search Console

This baseline is frozen. Later checks compare against it rather than rewriting it.

---

## P1 Acquisition URLs

1. /moon/phases/
2. /solar-system/gravity-comparison/
3. /solar-system/orbital-periods/
4. /solar-system/planet-size-comparison/
5. /exoplanets/transit-method/

These pages receive priority for search acquisition experiments before broader site expansion.

---

## Milestones

### M1 — Discovery and Indexing Gate
**Deadline:** 2026-10-06
**Observation window:** 7 days after the 2026-09-29 intervention

Minimum success:
- At least 4 / 5 P1 URLs indexed
- No P1 URL blocked by robots, canonical conflict, or HTTP failure

Target:
- 5 / 5 P1 URLs indexed
- At least 3 / 5 P1 URLs have search impressions

Failure intervention:
1. Inspect each unknown URL through Search Console URL Inspection.
2. Verify live HTML, canonical, sitemap membership, lastmod, HTTP 200, and crawlable links.
3. Verify direct links from already indexed pages.
4. Compare unknown vs indexed P1 pages for structural differences.
5. Fix only evidenced discovery/crawl defects.
6. If no technical defect exists, strengthen discovery through relevant already-indexed internal/external contextual entry points.
7. Re-submit sitemap only after a material change.
8. Re-measure after 3–7 days.

---

### M2 — Query Matching Gate
**Deadline:** 2026-10-13
**Observation window:** 14 days after intervention

Minimum success:
- At least 3 P1 pages receive impressions
- Intended query clusters map to their intended landing pages
- At least 40 P1 impressions in the trailing 7 days

Target:
- At least 4 P1 pages receive impressions
- At least 75 P1 impressions in the trailing 7 days
- No obvious landing mismatch such as a transit/light-curve query landing on Universe Scale

Failure intervention:
1. Classify missing demand vs wrong landing vs weak relevance.
2. Compare each failing P1 page against current SERP competitors query-by-query.
3. Improve title/H1/static answer/tool explanation only where an intent gap is evidenced.
4. Do not create mass content or new pages merely to increase keyword coverage.
5. Re-measure for 7 days.

---

### M3 — Ranking and First Click Gate
**Deadline:** 2026-10-27
**Observation window:** 28 days after intervention

Minimum success:
- At least 2 verified organic clicks in the trailing 14 days
- At least 2 P1 pages have target-query average position <= 30

Target:
- At least 5 verified organic clicks in the trailing 14 days
- At least 1 P1 page reaches top 20 for a relevant non-brand query

Failure intervention:
1. If indexed and relevant but positions remain weak, stop repetitive on-page rewriting.
2. Shift effort to authority/distribution:
   - contextual links from relevant indexed assets
   - educator/resource references
   - relevant communities
   - useful GitHub/reference exposure
   - legitimate external mentions/backlinks
3. Improve product differentiation where competitors provide a stronger immediate answer or utility.
4. Run one measurable distribution experiment at a time.
5. Re-measure for 7–14 days.

---

### M4 — Repeatable Organic Acquisition Gate
**Deadline:** 2026-11-26

Minimum success:
- At least 20 organic sessions in the trailing 28 days
- At least 300 search impressions in the trailing 28 days
- At least 3 P1 query clusters produce recurring weekly impressions

Target:
- At least 50 organic sessions in the trailing 28 days
- At least 750 search impressions in the trailing 28 days
- At least 2 P1 pages reach top 20 for relevant non-brand queries

Failure intervention:
1. Re-evaluate product–query–channel fit.
2. Identify which P1 tools show any traction and concentrate development/distribution on them.
3. De-prioritize pages with no validated demand.
4. Test one non-search acquisition channel that fits the product.
5. Strengthen the winning acquisition loop instead of increasing page count.

---

### M5 — Sustainable Growth Gate
**Deadline:** 2026-12-29

Minimum success:
- At least 50 organic sessions in the trailing 28 days
- At least 1,000 search impressions in the trailing 28 days
- At least 3 P1 pages receive recurring organic traffic
- At least 1 P1 page reaches top 10 for a relevant non-brand query

Target:
- At least 100 organic sessions in the trailing 28 days
- At least 2,000 search impressions in the trailing 28 days
- Organic traffic is no longer dependent on a single page/query cluster

Failure intervention:
- Treat the miss as a strategy-level issue, not a metadata issue.
- Re-run market demand, competition, channel fit, product value, and distribution analysis.
- Decide whether to deepen the strongest tool cluster, reposition the product, expand distribution, or stop investing in weak acquisition surfaces.

---

## Bottleneck Classification

Every check must assign the current primary bottleneck to exactly one stage:

1. Discovery
2. Indexing
3. Query matching
4. Ranking
5. CTR
6. Activation
7. Continuation / retention
8. Distribution / authority

Do not apply a downstream fix to an upstream bottleneck.

Examples:
- Unknown URL → Discovery/Indexing, not CTR.
- Position 50 with impressions → Ranking, not indexing.
- Position 8 with many impressions and no clicks → CTR/snippet.
- Clicks but no tool interaction → Activation/product UX.

---

## Recursive Intervention Rules

1. A missed milestone must produce an intervention, not another generic waiting period.
2. Change only the highest-confidence bottleneck first.
3. Prefer reversible changes with a measurable expected outcome.
4. Record every intervention with date, hypothesis, changed files/channels, expected metric, and observation window.
5. Never repeat the same intervention without new evidence.
6. Do not judge CTR before there is meaningful impression volume.
7. Do not judge retention before there are enough real users.
8. If the sample is insufficient, mark the milestone as **INSUFFICIENT DATA**, explain why, and intervene only on upstream acquisition/discovery blockers.
9. If a milestone passes, immediately promote the next milestone as the active gate.
10. If three consecutive interventions at the same bottleneck fail, escalate one level:
   - technical/on-page → authority/distribution
   - distribution → product differentiation/channel fit
   - product/channel fit → strategy reassessment
11. Do not mass-generate pages, keyword-stuff, or churn metadata as a substitute for evidence.
12. Preserve working UX, accessibility, data accuracy, and existing indexed URLs.

---

## Intervention Log

### INT-2026-09-29-A
Observation:
- Only 5 / 27 URLs had impressions.
- Three P1 acquisition pages were unknown to Google.
- Organic clicks/sessions were zero.

Intervention:
- Reworked P1 calculator/simulator intent alignment.
- Added crawlable default outputs.
- Corrected Planet Size volume logic.
- Added direct blog links to Age Calculator and Transit Simulator.
- Updated and re-submitted sitemap.

Expected effect:
- Faster P1 discovery/indexing.
- More accurate query-to-page matching.
- Increased impressions on tool-intent queries.

Primary milestone:
- M1 Discovery and Indexing Gate, due 2026-10-06.

---

## Decision Record Format

For each future intervention append:

### INT-YYYY-MM-DD-X
- Milestone:
- Bottleneck:
- Observation:
- Evidence:
- Hypothesis:
- Intervention:
- Expected metric:
- Guardrail:
- Observation window:
- Result:
- Decision: RETAIN / ITERATE / REVERT / ESCALATE
