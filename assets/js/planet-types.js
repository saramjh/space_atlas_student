import { initQuiz } from './quiz-widget.js';

// Representative models, not estimates of relative layer thicknesses.
const DETAILS = {
  outer: {
    rocky: ['Crust: a solid surface', "Earth's thin rocky crust covers a rock-rich mantle. Unlike the giant planets, Earth has a solid surface.", "Evidence: Earth's layers are constrained by seismic observations."],
    gas: ['Clouds, not ground', "Jupiter's cloud tops are not a solid surface; hydrogen and helium grow denser with depth.", 'Evidence: spacecraft observations of clouds and gravity; deeper layers are inferred.'],
    ice: ['An atmosphere with no ground', 'Neptune has a hydrogen-, helium- and methane-rich atmosphere; it gradually blends into denser fluid regions.', 'Evidence: atmospheric measurements; the deep interior is inferred from models.'],
  },
  deep: {
    rocky: ['Rock-rich mantle', "Earth's mantle is solid rock that deforms over geological time. It is not a global ocean of molten rock.", 'Evidence: seismic waves reveal the mantle and the core–mantle boundary.'],
    gas: ['Hydrogen under extreme pressure', 'Deep inside Jupiter, hydrogen becomes liquid and, at greater pressure, behaves as electrically conducting metallic hydrogen. Transitions are gradual.', 'Evidence: high-pressure physics and Juno gravity and magnetic observations constrain interior models.'],
    ice: ['Hot, dense “icy” fluids', 'Neptune is modeled with deep, hot mixtures rich in water, ammonia and methane. “Ice” here describes chemical ingredients, not frozen chunks.', 'Evidence: composition and phase are model-dependent; no probe has directly sampled these deep layers.'],
  },
  center: {
    rocky: ['Metal-rich core', 'Earth has a liquid iron-rich outer core and a solid iron-rich inner core. Not every rocky planet has the same core state.', 'Evidence: seismic-wave paths and magnetic-field measurements.'],
    gas: ['A diffuse central region', "Juno observations suggest Jupiter's heavy-element-rich inner region is larger and more diffuse than a small hard core; the exact structure remains uncertain.", 'Evidence: gravitational and magnetic signatures are interpreted through interior models.'],
    ice: ['An inferred rocky core', 'Neptune is often modeled with heavier rocky material at depth, but the size and nature of the central region are uncertain.', 'Evidence: global mass, gravity and planetary evolution models; no direct interior measurements.'],
  },
};

const explorer = document.querySelector('#planetInteriorExplorer');
if (explorer) {
  const regions = { rocky: 'Rocky', gas: 'Gas', ice: 'Ice' };
  explorer.querySelectorAll('[data-planet-depth]').forEach((button) => {
    button.addEventListener('click', () => {
      const depth = button.dataset.planetDepth;
      explorer.querySelectorAll('[data-planet-depth]').forEach((control) => {
        control.setAttribute('aria-pressed', String(control === button));
      });
      Object.entries(regions).forEach(([planet, prefix]) => {
        const card = explorer.querySelector(`[data-planet="${planet}"]`);
        const [title, description, evidence] = DETAILS[depth][planet];
        card.dataset.focus = depth;
        explorer.querySelector(`#ptype${prefix}Region`).textContent = title;
        explorer.querySelector(`#ptype${prefix}Description`).textContent = description;
        explorer.querySelector(`#ptype${prefix}Evidence`).textContent = evidence;
      });
    });
  });
}

// High-quality 3D globe is supplementary. Loading Three.js + three planet maps
// is deferred until explicit user action; 2D evidence remains readable otherwise.
const surfaceLab = document.querySelector('#planetSurfaceLab');
if (surfaceLab) {
  const launch = surfaceLab.querySelector('#ptype3DStart');
  const panel = surfaceLab.querySelector('#ptype3DInterface');
  const fallback = surfaceLab.querySelector('#ptype3DFallback');
  const choices = [...surfaceLab.querySelectorAll('[data-planet-surface]')];
  const surfaceDetails = {
    earth: {
      status: 'Earth · NASA Blue Marble',
      title: 'Land and oceans: a real solid surface',
      description: "Earth's land and oceans are observable from orbit. Ordinary exterior photographs still cannot show the mantle and core; seismic evidence is necessary.",
      source: 'NASA GSFC multi-observation Blue Marble composite. The texture combines satellite data, not a single camera snapshot.',
    },
    jupiter: {
      status: 'Jupiter · NASA/JPL-Caltech Voyager mosaic',
      title: 'Atmospheric bands, not a solid surface',
      description: "Jupiter's swirling bright and dark bands are clouds. Orbiting the 3D globe reveals a representative atmospheric appearance, not a solid surface or an image of its diffuse deep center.",
      source: 'JPL-Caltech map assembled from Voyager observations and processing. Clouds change over time; this is not current weather.',
    },
    neptune: {
      status: 'Neptune · JPL-Caltech / Don Davis reconstruction',
      title: 'A striking blue globe is not a complete observation',
      description: "Neptune's atmosphere can be observed, but the full-cloud texture used here is an artistic reconstruction, not a global observed map. Its colors and swirls should not be used to infer the deep hot-fluid layers.",
      source: 'Illustrated planetary texture by Don Davis (JPL-Caltech), explicitly labeled fictional/representative in the NASA/JPL map catalog.',
    },
  };

  launch.hidden = false;
  let controller;
  let ready = false;
  function selected(name) {
    const choice = choices.find((button) => button.dataset.planetSurface === name);
    if (!choice || !controller) return;
    choices.forEach((button) => button.setAttribute('aria-pressed', String(button === choice)));
    const info = surfaceDetails[name];
    surfaceLab.querySelector('#ptype3DStatus').textContent = info.status;
    surfaceLab.querySelector('#ptype3DTitle').textContent = info.title;
    surfaceLab.querySelector('#ptype3DDescription').textContent = info.description;
    surfaceLab.querySelector('#ptype3DProvenance').textContent = info.source;
    controller.choose({ name, textureUrl: choice.dataset.texture });
  }

  launch.addEventListener('click', async () => {
    if (ready) return;
    launch.disabled = true;
    launch.textContent = 'Preparing 3D view…';
    try {
      const { createPlanetSurface3D } = await import('./planet-surface-3d.js');
      controller = createPlanetSurface3D({
        canvas: surfaceLab.querySelector('#ptype3DCanvas'),
        stage: surfaceLab.querySelector('.ptype-surface-viewport'),
        onError: () => { fallback.textContent = 'Planet image could not be loaded. The 2D diagrams and scientific sources remain available.'; },
      });
      panel.hidden = false;
      ready = true;
      launch.hidden = true;
      controller.resize();
      selected('earth');
    } catch (error) {
      launch.hidden = true;
      fallback.textContent = 'This browser could not start WebGL. The 2D evidence diagrams and source links remain available.';
      console.warn('3D globe unavailable:', error);
    }
  });
  choices.forEach((button) => {
    button.addEventListener('click', () => selected(button.dataset.planetSurface));
  });
  surfaceLab.querySelectorAll('[data-planet-rotate]').forEach((button) => {
    button.addEventListener('click', () => { if (controller) controller.rotate(Number(button.dataset.planetRotate)); });
  });
  surfaceLab.querySelector('#ptype3DReset').addEventListener('click', () => {
    if (controller) controller.reset();
  });
}

initQuiz([
  {
    q: 'Do gas giants like Jupiter have a solid surface you could stand on?',
    options: [
      { label: 'Yes, a rocky surface like Earth\'s' },
      { label: 'No — the atmosphere just gets denser with depth, with no solid surface', correct: true },
    ],
    right: "There is no solid surface to stand on. Jupiter's atmosphere gradually transitions into liquid metallic hydrogen with increasing pressure and depth — there's no clean boundary like Earth's ground.",
    wrong: "There's no solid surface at all — the atmosphere just gets denser and denser with depth until it behaves like a liquid, with no clear boundary.",
  },
  {
    q: 'What kind of planet is Earth?',
    options: [
      { label: 'Gas giant' },
      { label: 'Ice giant' },
      { label: 'Terrestrial (rocky)', correct: true },
      { label: 'None of these — Earth is unique' },
    ],
    right: 'Earth is a terrestrial planet: a solid rocky crust and mantle around a dense metal core — the same basic structure as Mercury, Venus, and Mars.',
    wrong: "Earth is terrestrial — a rocky crust and mantle around a metal core, the same basic type as Mercury, Venus, and Mars.",
  },
], {});
