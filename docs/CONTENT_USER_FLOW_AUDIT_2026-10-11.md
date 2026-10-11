# Space Atlas: Whole-Site Content, Learner Journeys, Visual Truth & Interaction Audit
Date: 2026-10-11 KST
Scope: 28 public URLs (Home + 26 learning topics + What's New).
Status: 28-page editorial/implementation triage and one scoped first corrective release. NOT a certified audit of every science equation or browser interaction.

## Evidence and what was checked
- Examined all 28 source HTML/meta records (questions, body organization, science/caveats, links, controls, named sources), reviewed representative JS/model implementations, and compared against existing math and UI regression suites.
- Opened Home and all 26 learning pages in real Chromium at 320px: 27/27 yielded 1 H1, a canonical tag and no document-level horizontal overflow. The /updates/ route has static CI coverage; it was not included in that 27-route browser sweep.
- Interacted with corrected Home, /learn/not-to-scale/ and exoplanet transit at 390px, and earlier verified relevant Moon and image interactions. A page opening is NOT a full test of all its controls.
- Verified selected numerical/methodological claims against NASA GSFC, IAU and NASA exoplanet research. The independent source correctness of every page's formulas and all outbound citations remains a follow-up task.
- Current internal link CI validates 28 sitemap/canonical paths, the 26 lesson category breadcrumbs, 0 broken routes and 0 orphan learning pages. This does not establish actual crawl/index/ranking or learning results.

## User-first acceptance standard
| Reader journey | User's real job | Effective response | Common failure |
|---|---|---|---|
| Search entrance | Find a precise answer to AU, Pluto, Venus, phases, etc. | Concise answer above the model, definitions, source and caveat | Answer buried behind animation or generic cards |
| Intuitive size/distance explorer | Gain physical intuition | ONE consistent linear or explicitly logarithmic scale, numerical reference, tolerances | Shape ratios contradict labels; apparent accuracy invented |
| Causal experimenter | Learn why seasons, tides, eclipses or transits happen | Change one parameter, immediate aligned visual/text/numeric state, explain mechanism | Silent or decorative sliders; false simulation status |
| Evidence checker | Distinguish observation from interpretation | Instrument, filters, observation time, model/illustration limits, source | Mistaking a realistic model for directly measured scene |
| Teacher / researcher | Reproduce and explain the concept | Static reference, stated assumptions, reliable primary source, accessible keyboard operation | Information only in canvas or unexplained arbitrary units |
| Next-topic reader | Find relevant learning prerequisites or next question | Meaningful in-text links, category back navigation, follow-up concept | Repeated boilerplate links or thin navigation-only pages |

Editorial anti-slop rule: a three-card layout, quiz or diagram has value only when its pieces teach three independent, necessary concepts. Do not add or remove cards just to satisfy a visual template.

## Confirmed problems and first corrective batch
| Priority | Page(s) | Observed failure | Action |
|---|---|---|---|
| P0 scientific display | / and /learn/not-to-scale/ | Old Earth 37px / Jupiter 158px visually implied 4.27x while text says 11.2x diameter. | Both views now use Earth 14px and all NASA Earth-relative diameters: Mercury 5.36, Venus 13.29, Earth 14, Mars 7.45, Jupiter 156.94, Saturn 132.30, Uranus 56.14, Neptune 54.32 px. Explicit size linear vs distance logarithmic. |
| P0 scientific overclaim | /exoplanets/transit-method/ | Repeating transit dip described as a confirmed planet; binary stars or artifacts can mimic it. | State candidate not proof; NASA false-positive evidence, readout of hypothetical brightness and 35% deliberately exaggerated depth. Curve fitted to graph boundaries. |
| P1 definition | /solar-system/astronomical-unit/ | Average Sun–Earth distance used as AU definition. | State exact IAU 2012 au = 149,597,870,700 m; orbital distance varies. Selection state aria-pressed and sub-10 cm readout precision. |
| P1 misleading model status | /solar-system/gravity-and-orbits/ | Speed slider 0.5–6 had no model units; after 80 frames falsely claimed Orbiting!; age 4.2 billion years. | Explicit arbitrary model units; remove false diagnosis, finite frame limit and hidden-tab pause. Say formation about 4.6 billion years and cite NASA. |
| P1 semantics | /learn/not-to-scale/ | Pressed-toggle buttons incorrectly declared as tablist. | Use named role=group and accurate linearly scaled diameter vs log-distance labels. |
| P1 source/model framing | /exoplanets/transit-method/ | Hypothetical model graph called a measurement. | Distinguish simulated pedagogical curve from telescope data, show selected 0–360 degree position and hypothetical relative brightness. |

NASA Earth-relative diameter ratios: https://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html
IAU exact definition: https://www.iau.org/static/resolutions/IAU2012_English.pdf
NASA solar system origin: https://science.nasa.gov/solar-system/solar-system-facts/
NASA false positives: https://science.nasa.gov/science-research/planetary-science/planet-patrollers-turn-in-144-imposter-planets/

The new dependency-free test ci/verify_science_truth.mjs locks all 16 visible planet widths to ratios, unit/caveat text, model/source framing, and page SEO metadata. It is included in deploy and read-only Health jobs. Original scientific regression tests remain in place.

## Page-by-page triage (28 URLs)
Legend: FIX = first batch actual correction; REVIEW = inspected content and prioritized remaining work, not a new defect claim; PROTECT = valuable existing explanation, avoid gratuitous changes.
| URL | Learner question / best representation | Result and next check |
|---|---|---|
| / | Curiosity to science evidence. Model + size lab + directory. | FIX real diameters; REVIEW decorative micrographics, first-click time and huge first viewport WebGL load. |
| /astronomy/electromagnetic-spectrum/ | Invisible light and decades of wavelengths. Log slider + freq/energy. | PROTECT log-space physics and NASA boundaries; spot-check categorized boundary ambiguity and low-motion option. |
| /black-holes/ | Understand event horizon, shadow, disk and jet. Evidence-labelled diagram. | REVIEW side-view diagram should never imply an observed direct photograph or exact model geometry. |
| /earth/seasons/ | Tilt versus distance for northern/southern seasonal illumination. Orbit model. | REVIEW angular invariants and teacher tasks through actual browser state; keep isolated teacher distribution experiment. |
| /exoplanets/transit-method/ | Interpret measured starlight to nominate planets. Idealized light curve. | FIX false positives, simulated depth/plot/readout; REVIEW actual repeated period and edge-on assumptions later. |
| /galaxies/milky-way/ | Locate the Sun in the galaxy. Labelled uncertain map. | REVIEW sources/uncertainty and whether zoom labels communicate modeled viewpoint. |
| /galaxies/types/ | Compare spiral, elliptical, irregular morphology. Schematic/examples. | REVIEW if actual labeled NASA examples would teach observed morphology better than toy SVG silhouettes. |
| /learn/not-to-scale/ | Why diagrams distort size or spacing. Two single-purpose scales. | FIX true linear diameter sizes and named log-distance distinction; keyboard press state preserved. |
| /learn/read-space-images/ | Observation versus processing/simulation/artist concept. NASA paired observations. | PROTECT source-first Pillars Hubble/Webb interactive, acquired/filter dates, credit and interpretation caveats; prior toy SVGs removed. |
| /moon/earth-moon-scale/ | True Earth/Moon size and gap. One linear ruler and pan cues. | REVIEW pan discovery and 320px readability, preserve existing real-size/distance invariant tests. |
| /moon/eclipses/ | Why eclipses not every new/full moon. Tilt/angle interactive. | REVIEW node-crossing timing limitation; never offer eclipse date forecasting from simplified toggle. |
| /moon/phases/ | Illuminated lunar shape versus lunar orbit. Two view canvases. | PROTECT angle/selected phase sync from prior fixes; REVIEW full keyboard/pointer/readout interactions. |
| /moon/tidal-locking/ | Moon rotates in sync with orbital revolution. Model. | REVIEW 360 degree action and explanation of observer versus inertial rotation. |
| /moon/tides/ | Differential forces and equilibrium two bulges, spring/neap. | REVIEW generalized two-high-tides phrasing against local diurnal/mixed tides, plus controls/caveats. |
| /solar-system/astronomical-unit/ | Defined distance unit + relatable physical walk scale. | FIX exact IAU value, variable Earth–Sun distance and preset state; REVIEW scale input rounding and live output. |
| /solar-system/distance-scale/ | Walkable distances in solar system. Numeric scale builder. | REVIEW mobile scroll/output units and reading the values without collapsing scale distinctions. |
| /solar-system/gravity-and-orbits/ | Falling in orbit versus crashing/escape. Newtonian canvas. | FIX false orbit status, arbitrary speed/cap/solar formation age; REVIEW integrator and physical invariants before claiming realism. |
| /solar-system/gravity-comparison/ | Weight versus mass on planets. Calculator. | REVIEW input validity, differences between mass/weight and gas-giant nominal cloud-top g. |
| /solar-system/orbital-periods/ | Age on each planet, Kepler relationship. Numeric calculator. | REVIEW orbital period, eccentricity/mean values and year-unit rounding. |
| /solar-system/planet-size-comparison/ | Compare two true diameter sizes and volume ratio. Two selector ruler. | PROTECT true-scale tests; REVIEW smallest-body legibility and 320px/keyboard controls. |
| /solar-system/planet-types/ | Earth/Jupiter/Neptune inferred interiors. 2D region selector + optional 3D exterior. | REVIEW fuzzy boundaries and sourced texture/model licensing and lazy resource ownership; don't falsely show exact layer thickness. |
| /solar-system/pluto-dwarf-planet/ | What the IAU clearing definition means. Three-part selection. | REVIEW concept of gravitational dominance not empty-orbit myth and control feedback. |
| /solar-system/temperature-comparison/ | Venus greenhouse and average temperature comparisons. Signed graph. | REVIEW giant planet temperature reference levels, source convention and mobile ticks. |
| /sources/space-resources-for-students/ | Find NASA/ESA/JPL source by question. Curated external links/details. | PROTECT intentionally static source directory; REVIEW outbound link health and recency, don't add decorative widgets. |
| /stars/life-cycle/ | Sun-like versus massive star endpoints. Stage/branch explorer. | PROTECT non-time-proportional paths, uncertainty notes; REVIEW binary/wind outcomes and keyboard reading order. |
| /universe/light-year/ | Distance rather than time, light travel delay. Source-backed readout. | REVIEW distance uncertainties, rounding and any calendar-year-looking false precision. |
| /universe/scale/ | Orders of magnitude up to observable universe. Step explorer/reference table. | PROTECT measure type labels and expansion caveat; REVIEW responsive stage labels and isolated teacher flow. |
| /updates/ | What changed and how to verify. Curated release notes and commits. | PROTECT no ads, genuine changes, developer links; no animation necessary. |

## Next gates (do not mark as completed)
1. P1 multi-state browser E2E at 320/390/1280 for eclipse tilt, tidal-locking rotations, seasonal illumination, Milky Way zoom and Pluto rule controls. Earlier 27-route 320 sweep checked load/width/canonical only.
2. P1 independent primary-source check of quantitative formula claims for all scientific models, especially atmospheric temperature reference levels, modeled tide-force shape and galaxies/cosmology uncertainty.
3. P1 evaluate search entry-to-follow-up usage in isolated Space Atlas GA4/GSC before new category pages, removing instructional detail or asserting GEO citations.
4. P2 replace only low-information toy visuals where an actual sourced observation, measured chart or transparent model would teach better. A static diagram may be the most accurate representation.
5. P2 build further real-browser automated checks for one action → one visible numerical, visual and accessibility-state change, plus keyboard/no-JS/low-motion behavior. Measure any GPU/rAF lifecycle improvements.

## Explicit limits
28-page static HTML editorial triage plus selected algorithm/source examination and initial 27-page 320px browser loading DOES NOT mean every control is E2E tested, each physical formula certified or every picture is high-quality. No traffic, SEO ranking, AI answer citations or learning-gain improvements have been measured. Release only verified changes, not invented benefit claims. Preserve existing canonical/H1/JSON-LD/site-map, controlled ads and teacher experiment; retain unrelated dirty README/.gitignore and untracked user-local files.

## Pedagogical visualization correction — causal gravity experiment (2026-10-11)

User clarified visualization includes cognition-supporting symbols, not just realistic assets, plus manipulable cause/effect experiments. The first example is /solar-system/gravity-comparison/: an existing grid answered **what** a weight would read but not **why** different mass and radius produce different accelerations. Added a labeled symbolic radius circle, inward direction arrow, equation g ∝ M/R², independent mass and radius sliders, fixed-variable Earth/4×mass/2×radius/Jupiter-like presets, synchronous live numerical readout and explanatory text. Earth mass+radius baseline = 1×, 4× mass at same radius = 4×, doubled radius at fixed mass = ¼×, Jupiter-like 317.8/11.21² = 2.53× in the stated nonrotating spherical model. NASA effective equatorial Jupiter gravity at a defined cloud reference is ~2.36×: the existing weight-equivalent table was reconciled to NASA values (Jupiter2.36, Saturn0.92, Uranus0.89, Neptune1.12), explicitly distinguishing idealized and reference measurements. This is not a human-standing-on-a-gas-giant simulation. Sources: NASA gravity glossary https://science.nasa.gov/learn/basics-of-space-flight/glossary/ ; Jupiter facts https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html ; NASA Earth-ratio factsheet https://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html .

Release gate: ci/verify_gravity_mechanism.mjs checks all four thought experiment invariants, NASA table values, source links, static fallback, labels/ARIA/SEO and linked JS logic. Real mobile and desktop Chrome actions, legibility and blocked-JS behavior are separate required release checks. This is one concrete pattern example, **not** proof that the remaining pages all have pedagogically optimal diagrams.

## Follow-up: real cognitive diagrams for Universe Scale and Light-Year (2026-10-11)

**User report:** The so-called Visual model areas on /universe/scale/ and /universe/light-year/ were essentially text labels and number-buttons, not visualizations which let students mentally grasp the huge distances or reason through a causal phenomenon. Confirmed on live Chrome1280: zero topic-specific `<svg>`, `<canvas>` or `<img>` elements inside each Visual model container. Previously improving module initialization had not addressed the user's actual request.

**Learnable model 1 — logarithmic universe scale:** A genuine rendered SVG logarithmic metre ruler spans 10⁰–10²⁷ m with eight named scientific reference values at positions computed as `log10(length)`; eight native button marks with keyboard, numbered labels and `aria-pressed` synchronize with existing Previous/Next and static stage explanations. A second paired comparison represents *each tenfold jump* from the preceding step and residual factor, so Earth is visibly about 6 decades and 7.5× beyond the human scale, Earth–Moon center distance ≈30 Earth diameters, and the observable universe ~9,300× Local Group extent. Display states **height, diameter, distance, span differ**, and the log ruler is not a uniform-kilometre axis nor an exact nested-map of objects. The same original eight facts and reference table stay in initial HTML/no-JS output; plotted and labeled marks also exist before JS. Fix exposed an older incorrect quiz answer: ~4,500× solar-system→nearest-star jump divided by ~30× Earth→Moon jump ≈150×, so **hundreds**, not 'thousands', is correct; mathematical explanation and selected option were corrected.

**Learnable model 2 — logarithmic light-source distances + photon time scrub:** Eight source positions on a separately labeled `10⁻⁸ ... 10⁷` light-year logarithmic SVG axis are selected by existing native destination buttons; highlighted point and selected source/distance legend update together. A distinct **one-journey** SVG from source to observer lets the student scrub 0–100% of the path with a range control. Photon mark/progress stroke moves and **elapsed versus remaining travel time** update as `distance / c × fraction`, clearly showing Sun (~8.3 min total), Proxima (4.25 years) or Andromeda (~2.5 million years). The path bar is intentionally normalized to the selected destination and explicitly **cannot** compare distances between sources; the logarithmic ruler does that. No fake "light moving in real time" autoplay and no invented observations. Both diagrams, their default source markings, explanatory caveats and source tables are static HTML before JS, controls remain disabled until state wiring completes. No-JS modes preserve baseline knowledge.

**Scientific model:** Values reused the existing NASA-sourced reference measurements; exact 1 Julian light-year is `9,460,730,472,580,800 m`, with `365.25×86,400 s` per Julian year. Universe scale values are approximate, mixed length types (human height, Earth diameter, Earth–Moon center separation, solar orbital width, stellar separation, Milky Way disk extent, Local Group extent, observable-region comoving diameter), not exact nested object radii. Axis positions are derived mathematically rather than hand-spaced, and distance/emission-travel time are distinct physical concepts. No new framework, image rights, external JS or texture bandwidth.

**Regression contract:** `ci/verify_cosmic_visuals.mjs` checks all eight physical values and monotone relative logarithmic positions, decade spacing, prior/current ratios, photon at 0/25/50/100%, selected UI states and SEO. Added to Pages deploy and independent read-only Health. Original isolated teacher-distribution experiment limited to /universe/scale/ and its 2 other authorized pages; no expansion. Preserve previous indexed URLs, canonical/JSON-LD/H1, sources and controlled AdSense slots.

**Real browser locally:** On 390px mobile Step 1→Earth updates SVG x from ~43 to ~254 along 900-wide figure, ~7.5m factor with six ×10 blocks plus ×7.5; jumping to observable universe moves mark to ~862, all eight native marks keyboard/aria accessible, no document overflow. Light-year with photon slider50% Sun yields ~4.2min elapsed and ~4.2min remaining, then changing to Proxima yields ~2.13yr/2.13yr and moves log mark, no overflow. On 320px mobile first→Earth scale controls worked and the diagram scrolls inside its own viewport (720px min width, page itself stays 320px); Proxima 25% light progress yields ~1.06yr elapsed/~3.19yr remaining. On desktop1280 Stage 2 and Stage 8 show correct marks; Andromeda 25% yields 625,000yr elapsed and 1,875,000yr remaining. Browser screenshots reviewed. With **all JS explicitly blocked** at390 both scientifically defined SVG diagrams remain in HTML, all relevant controls safely disabled, Sun8.3min and Human1.7m references persist, no page overflow. Full functional and live post-deploy checks are distinct from the limited static gate. No engagement or SEO ranking gains claimed.
