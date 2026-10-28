# Space Atlas Student — English Grade 4–8 readability font preset

Date: October 28, 2026. Scope: primary website typography on all lesson routes. This is a deliberate legibility/design choice, not a claim of a completed classroom study.

## Typeface roles

- **Student body and normal controls: Atkinson Hyperlegible Next, 400–700 variable.** Developed by the Braille Institute to improve glyph differentiation, including I/l/1, O/0, B/8, and variable/number recognition. English science explanations, measurement labels and classroom claims use such characters often. This design rationale is relevant to Grades 4–8, but does not prove all children comprehend more.
- **Display headings: Source Serif 4, 400–700 variable.** Keeps the editorial, scientific-reference visual character previously carried by Georgia while avoiding a different native font for each operating system.
- **Data, navigation, inline code-like labels: Atkinson Hyperlegible Mono, 400–700 variable.** Deliberate equal-width data type for labels and numeric columns; numeric alignment is reinforced with tabular-nums on reference tables/readouts. Specialized canvas labels remain their own constrained interface and are not indiscriminately enlarged.

Original, unmodified WOFF2 Latin subsets were downloaded from the documented Google Fonts distribution, self-hosted with each separate original SIL OFL 1.1 license. Three variable files total 102,684 bytes (33,996 + 50,936 + 17,752 bytes), served from the existing first-party project origin; no font CDN or paid dependency. Only the primary reading font is preloaded. All use font-display swap, system fallbacks and existing typography sizes. Missing Greek/math glyphs may use the user operating system font; broad language coverage beyond these Latin subsets is not claimed. Self-hosted fonts add no new cross-site student data transfer; existing unrelated analytics/ads remain unchanged.

Provenance:
- https://www.brailleinstitute.org/freefont/
- https://github.com/googlefonts/atkinson-hyperlegible-next
- https://adobe-fonts.github.io/source-serif/
- Local original OFL license files in assets/fonts.

## A/B selection performed before writing production CSS

Original system UI + Georgia + system mono was compared in Chromium against:
- Candidate A: Atkinson Next + Source Serif 4 + Atkinson Mono (**selected**).
- Candidate B: Source Sans 3 + Source Serif 4 + system mono (not deployed).

Seven representative routes (Home, Moon Phases, Earth Seasons, Universe Scale, Electromagnetic Spectrum, Planet Types and What's New) at widths 320, 390, 800 and 1280 = 28 baseline/A/B comparisons. In the JS-disabled static-site presentation, Candidate A had a maximum document-height increase of 0.9% vs baseline, Candidate B 1.1%; no new document-level horizontal overflow and no clipped-content instances detected in the measured prose/control subset for either candidate. Certain original educational reference tables and scale diagrams intentionally scroll inside their own containers.

Both candidates presented a coherent typography hierarchy on manually reviewed screenshots. Candidate A is preferred specifically because differentiated ambiguous characters are its documented design objective; Source Sans 3 remains a valid general UI alternative. The selection does not presume that a particular pupil's reading task improved before direct observation.

## Implementation and decision limits

Existing CSS font-family and font shorthand declarations were changed in-place to semantic roles; previous TDD-verified learning paragraph, button, table and evidence-note sizes and layouts are unchanged. The fixed type choices are not exposed as a redundant user toggle or a new JavaScript framework. Fallbacks support missing font loads, and original standalone printable teacher worksheets remain self-contained.

Focused regression is ci/verify_learner_font_preset.py. It checks licensed assets, WOFF2 signatures, byte budgets, semantic roles, no external font CDN, and first-party critical face preload. It is required in both Pages deploy and scheduled site-health CI. Full site regression remains mandatory: all 29 routes at 320/390/800/1280, font-loaded/failed-font behavior, no new clipped text, working nav/search, model controls, canonical/JSON-LD/ads structure, and root font scaling.

Known independent issue: the existing live AdSense provider may insert a wider-than-mobile unit; this is not caused by font replacement. Do not hide/clip the ad to game the typography layout score.

**Educational outcome status: unverified.** Actual pupil recognition, comprehension, error rate and task speed require voluntary, correctly scoped classroom/user testing. No such result is claimed.
