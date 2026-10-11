# Space Atlas — Navigation, User Flow, Sitemap, SEO and GEO Audit

Date: 2026-10-11
Scope: 27 educational pages (home + 26 lessons), 1 public What's New page, production-prefix static HTML.
Status: measured local audit and scoped usability fix; production release must be validated separately.

## Decision

**Discoverability is broadly sound; concept-level learning paths were incomplete.** The existing site provides crawlable real `<a href>` links to all learning URLs and a 28-URL canonical sitemap, but a giant shared menu is not equivalent to a good learning journey. Browsing from an outside search result needs obvious category-back navigation and nonrepetitive, scientifically relevant next-step links.

## Before / after (source-measured)

| Signal | Initial | After scoped improvements |
|---|---:|---:|
| Public static pages | 28 | 28 |
| Original educational lessons including home | 27 | 27 |
| Contextual distinct inter-page relationships in `<main>` | 126 | 134 |
| Educational pages with no contextual incoming links | 0 | 0 |
| Broken internal routes found | 0 | 0 |
| Repeated destination in one `Go deeper` card group | 8 | 0 |
| Learning-page category labels that are actionable | 0 / 26 | 26 / 26 |
| Homepage topical directory sections with accessible URL fragments | 0 / 4 | 4 / 4 |
| Mobile first-screen access to the full topic directory and search | weak (search at end of scrolling tab row) | both placed immediately after Home |
| Sitemap and canonical URL set | aligned | unchanged and checked in CI |

These are **static graph and UI checks**, not measured dwell time, learning improvements, search ranking, AI citations, indexing or conversions.

## Audience journeys

- **Search entrant / student**: Google result or external link → the directly indexable lesson → labelled breadcrumb **Home / category / question** → category link to the named section of the homepage learning directory, or direct `Go deeper` lesson recommendation. The inline linked text names the scientific next question; duplicate “same destination twice” cards removed.
- **Student browsing on mobile**: Home / **All 26 topics** / **Search**, then optional horizontally scrolling short subject shortcuts. The `All 26 topics` link lands at a real HTML section ID. No JS required for any basic navigation link.
- **Teacher**: existing educational models, caveats and source references remain in individual lessons; teacher experiment is restricted to existing three selected pages. Related links include prerequisites and scientifically distinct follow-ups, not generic engagement loops.
- **Developer/contributor**: existing Footer Project category, source link and What's New keep technical details discoverable without displacing student-focused links.

## Correctness and evidence

- Four homepage topical directory categories have actual IDs (`topics-solar-system`, `topics-earth-moon`, `topics-deep-space`, `topics-guides`). Each of the 26 separate learning page Breadcrumbs is now an accessible `<nav aria-label="Breadcrumb">` with a linked category and `aria-current="page"`, rather than a misleading inert label.
- Breadcrumb links point to **actual homepage fragment anchors**, **not** nonexistent independent topical hubs. The JSON-LD BreadcrumbList deliberately remains the existing two canonical URL levels Home → current lesson; do **not** invent a third canonical category URL for the same home page or claim category rich-result eligibility. Separate substantive hub pages can be considered if future evidence warrants them.
- No new indexable routes, forced redirects, changed canonicals, fictitious science taxonomies, FAQ entries, schema `@id`, monetization or query parameters are introduced.
- Replaced precisely eight duplicated “Go deeper” card destinations with conceptually relevant independent lessons, using accurate scientific wording (temperature surface vs atmosphere, tides vs tidal locking, wavelength evidence, orbital period, etc). Original primary “Next in this series” choices remain as before.
- Scoped broad `nav` and `nav a` CSS to `header nav` so named Breadcrumb `<nav>` does not inherit the header's 23px link padding. Removed `html{scroll-behavior:smooth}` globally because deep *cross-page* links to the large homepage directory were experimentally observed overshooting after asynchronous page layout changes; instant hash navigation with `scroll-margin-top:160px` anchors proved stable and visible under the 140px mobile sticky header after 1.5+1.8 seconds. This also respects users who prefer reduced motion.
- Static builder's sitemap maintains one canonical absolute HTTPS URL per published document and realistic `lastmod` from Git content history; explicit page titles/description, source-referenced `LearningResource` and verified `CollectionPage` for updates are preserved. Sitemap is a discovery aid **not** a guarantee of crawling/indexing or inclusion in AI answers.

## CI and interpretation

`ci/verify_user_flows.py` is a dependency-free semantic/graph test added to both GitHub Pages deploy and read-only four-times-daily site Health workflows. It checks 28 page canonicals/H1, 26 linked category crumbs with real target anchors and current-page semantics, mobile directory, all page-level `href` routes and fragments, at least one contextual incoming link to each lesson, no repeated target in one `Go deeper` card group, no missing journey sections and exact sitemap/canonical set correspondence.

Google Search Central sources:
- [Links: crawlable anchors, descriptive anchor text, contextually useful internal links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Sitemaps: URLs and lastmod should reflect substantial edits; sitemap does not guarantee indexing](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Breadcrumb structured data must reflect meaningful hierarchy](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)

## Remaining limitations

1. Desktop header still contains many (26) subject links in dropdown groups on every page; these are crawlable but not by themselves an editorial topic-cluster signal. Avoid adding gratuitous links just to maximize graph counts.
2. The four category hubs currently are anchored subsets of the root Home directory, not independently canonical landing pages. Dedicated hub pages should only be added when they offer *substantial unique learning guidance*, not near-duplicate lists created for artificial SEO.
3. GEO / generative answer citation visibility is **not proven** by Schema.org/links alone. Track actual organic queries/index coverage and where-source evidence, distinguish citations and referral sessions from unsupported “GEO score.”
4. Only static logic and representative mobile/desktop Chrome flows are tested. A complete accessibility audit, real analytics visitor path drop-offs, Googlebot-rendered link observations and Search Console indexing history require separate evidence.

## 2026-10-11 mobile header correction after screenshot review

The 2026-10-11 breadcrumb/internal-link release unintentionally placed a prominent emoji-labeled `Search` button in the same horizontally scrolling mobile navigation strip as Home, All 26 topics and the subject links. On Android this interrupted the reading order and made the header visually congested. Basic crawlability testing did not catch the visual usability regression.

Scoped correction:
- At widths up to 980 CSS pixels, the brand and a compact 42×42px monochrome SVG search icon share the first header row. Its accessible name is `Search space topics`, and the existing `#searchTriggerMobile` element, dialog ID, JavaScript focus restoration and keyboard search behavior are preserved.
- The second row is for seven **links only**, ordered Home, All topics, Solar System, Moon, Earth, Stars, Galaxies. Search no longer interrupts the navigation links. These remain regular crawlable anchors; no sitemap/SEO changes.
- Corrected inherited desktop nav padding causing oversized mobile rows, replacing the 23px top/20px bottom link padding with 44px-min-height mobile tabs. Removed a stale `max-width:620px` media override that hid `.utility` and forced the brand to occupy the entire grid.
- The mobile search icon stays in the right-side utility slot; the full search dialog opens upon click and gives focus back to the icon when dismissed. No new runtime JS or external UI package.
- Added `ci/verify_mobile_header.py` to both deploy and read-only health workflows, checking all 28 static pages: one utility-owned accessible mobile search, no nav-embedded buttons, one desktop search, seven distinct topic navigation links and responsive CSS ownership.
- Real Chromium before live deploy: 320 CSS pixels brand/42px search button do not overlap (brand x16..246, search x262..304), no page horizontal overflow, 44px navigation strip. Search typed `moon` returned 6 results, Escape closed and restored focus to `#searchTriggerMobile`. At 390/768/980 the mobile search remains top-right and tab strip 44px; from 1024+ original desktop search and full dropdown nav are shown, all tested widths without horizontal overflow. Mobile/desktop screenshots inspected. These are browser-layout and functional checks, not proof of device-specific dark-mode rendering.
