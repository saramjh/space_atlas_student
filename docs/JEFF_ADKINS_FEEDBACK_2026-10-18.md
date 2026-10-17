# Jeff Adkins feedback — scientific correction and QA (2026-10-18)

## Source and defect assessment
Astronomy educator Jeff Adkins identified two risks in Space Atlas after reviewing its educational models.
1. Earth-view Moon phases resembled a dark circle advancing over a lit Moon, analogous to a lunar eclipse. Local source inspection confirmed the culprit: two flat, overlapping radius-r circles, shifted by the illuminated fraction; this cannot reproduce the changing projected terminator of an illuminated sphere.
2. Homepage Solar System orbital curves were faint and the exaggerated giant planet/Saturn-ring silhouettes could visually overlap adjacent orbital tracks. Before correction, Jupiter orbit 24, visible radius 3.65 and Saturn orbit 31 with visible ring outer radius 5.5: sum of display radii 9.15 exceeds 7-unit radial separation. The top-view camera was only at height 72, unable to frame outer orbit 45 + Neptune radius.

## Repairs
- Moon Earth-view pixels now derive actual spherical surface normals and a fixed light direction: sunlight = x*sin(theta) - z*cos(theta), where z=sqrt(1-x²-y²). This physically differentiates spherical lunar day/night from an occulting circular disk; a small terminator antialias preserves clear geometric cusps without suggesting an eclipse. Analytic illuminated visible fraction = (1-cos(theta))/2.
- Solar System illustrative orbit radii Saturn 35, Uranus 44, Neptune 50, separating all adjacent exaggerated bodies including Saturn's outer ring. Accurate orbital AU and physical sizes remain unchanged. Orbit rings have higher contrast, a top-view y=155 camera fits all tracks (fov44), oblique default and clipping/fog extended.
- The educational scene-radius comparison was updated to a 50-unit reference, including its static no-JavaScript initial marker. On-page explanations clarify that neither displayed orbital radius nor planet size uses a physical scale.
- No third-party assets, new framework or paid dependencies; unrelated existing working-tree changes protected.

## Primary scientific references
- NASA Science: https://science.nasa.gov/moon/top-moon-questions/ confirms Moon phases result from observing different parts of the Sun-lit hemisphere, not Earth's shadow.
- NASA JPL: https://www.jpl.nasa.gov/edu/resources/video/solar-system-size-and-distance/ explains why planet size and orbital distance cannot generally share one readable scale on a display.
- NASA JPL: https://www.jpl.nasa.gov/edu/resources/lesson-plan/create-a-solar-system-scale-model-with-spreadsheets/ teaches explicit choice of orbital-distance scale.

## Verifications completed
- Added dedicated dependency-free ci/verify_jeff_feedback.mjs and required it in Deploy and read-only Site Health workflows. It checks nine lunar phases against analytic lit area (within 3.5 percentage points of raster accuracy), right/left crescent and quarter orientation, separated solar orbit annuli including giant planets/rings, top camera framing, static scientific labels and existing canonical/JSON-LD.
- Production-subpath build produced 28 pages. Every existing JS/Python CI gate and JavaScript syntax check passed.
- Isolated headless Chrome (not the user's existing open browser) tested 320/390/1280 px Moon phases 0,45,90,135,180,270, verifying light direction and phase metrics; Solar System top view on 390 and 1280 showed a loaded 3D scene and visible orbital paths, no horizontal overflow or runtime errors. Visually inspected the rendered Moon waxing crescent and Solar System top-view screenshots stored in /tmp/space-atlas-jeff-qa-shots on remote host.
- The checks validate model and software behavior, not actual teacher learning outcomes or search improvement.

Deployment/commit status must be established from git and GitHub Pages independently.
