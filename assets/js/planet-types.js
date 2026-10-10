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
