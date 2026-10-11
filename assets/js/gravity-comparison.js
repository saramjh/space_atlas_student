import { PLANETS } from './planet-data.js';
import { initQuiz } from './quiz-widget.js';

const input = document.querySelector('#weightInput');
const unitSel = document.querySelector('#weightUnit');
const grid = document.querySelector('#weightGrid');

function render() {
  const w = Number(input.value) || 0;
  const unit = unitSel.value;
  grid.innerHTML = PLANETS.map((p) => {
    const val = (w * p.gravity).toFixed(1);
    const isEarth = p.name === 'Earth';
    return `<div class="weight-cell${isEarth ? ' you' : ''}"><div class="planet">${p.name}</div><div class="val">${val} ${unit}</div><div class="sub">${p.gravity.toFixed(2)}× Earth gravity</div></div>`;
  }).join('');
}

input.addEventListener('input', render);
unitSel.addEventListener('change', render);
render();

// Concept model: a *nonrotating spherical* g = GM/R² comparison, not the
// effective equatorial gravities used by the reference-body weight calculator.
const mechanism = document.querySelector('#gravityMechanism');
if (mechanism) {
  const massInput = mechanism.querySelector('#gravityMass');
  const radiusInput = mechanism.querySelector('#gravityRadius');
  const scenarios = {
    earth: [1, 1],
    mass: [4, 1],
    radius: [1, 2],
    jupiter: [317.8, 11.21], // NASA fact sheet Earth-relative mass & equatorial radius
  };
  const choices = [...mechanism.querySelectorAll('[data-gravity-scenario]')];
  const get = (selector) => mechanism.querySelector(selector);

  function modelGravity(mass, radius) {
    return mass / (radius * radius);
  }
  function renderMechanism(active = '') {
    const mass = Number(massInput.value);
    const radius = Number(radiusInput.value);
    const quotient = modelGravity(mass, radius);
    const radiusSquared = radius * radius;
    get('#gravityMassValue').textContent = `${mass.toFixed(1)}× Earth`;
    get('#gravityRadiusValue').textContent = `${radius.toFixed(2)}× Earth`;
    get('#gravityNumerator').textContent = mass.toFixed(1);
    get('#gravityDenominator').textContent = radiusSquared.toFixed(2);
    const formatted = quotient < 0.1 ? quotient.toFixed(3) : quotient.toFixed(2);
    get('#gravityModelResult').textContent = `${formatted}× Earth`;
    const radiusPx = 6 * radius;
    const x = 92 + radiusPx;
    get('#gravityBody').setAttribute('r', radiusPx.toFixed(2));
    get('#gravityRadiusLine').setAttribute('x2', x.toFixed(2));
    get('#gravityTestPoint').setAttribute('cx', x.toFixed(2));
    get('#gravityArrowLine').setAttribute('x1', (x + 50).toFixed(2));
    get('#gravityArrowLine').setAttribute('x2', (x + 25).toFixed(2));
    get('#gravityRadiusDiagramLabel').textContent = `R = ${radius.toFixed(2)}× Earth`;
    get('#gravityCauseDiagram').setAttribute('aria-label',
      `Schematic: radius ${radius.toFixed(2)} times Earth, model gravity ${formatted} times Earth's, inward-pointing arrow indicates direction, not force magnitude`);

    const explanations = {
      earth: "Earth baseline: mass and radius are both 1, so 1 ÷ 1² = 1× Earth's gravity.",
      mass: "With radius fixed, four times the mass creates four times the modeled surface gravity.",
      radius: "With mass fixed, twice the radius makes the distance squared four times larger, so gravity becomes one-quarter.",
      jupiter: "Jupiter-like mass and radius give ~2.53× in this non-rotating spherical model; NASA's effective equatorial reference value is ~2.36×, in part because of rotation.",
    };
    get('#gravityModelExplanation').textContent = explanations[active] ||
      `At ${mass.toFixed(1)}× Earth's mass and ${radius.toFixed(2)}× its radius, gravity is ${mass.toFixed(1)} ÷ ${radiusSquared.toFixed(2)} = ${formatted}× Earth in this model. Hold either slider fixed to isolate its effect.`;
    choices.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.gravityScenario === active));
    });
  }
  for (const choice of choices) {
    choice.addEventListener('click', () => {
      const [mass, radius] = scenarios[choice.dataset.gravityScenario];
      massInput.value = String(mass);
      radiusInput.value = String(radius);
      renderMechanism(choice.dataset.gravityScenario);
    });
  }
  massInput.addEventListener('input', () => renderMechanism());
  radiusInput.addEventListener('input', () => renderMechanism());
  renderMechanism('earth');
  for (const control of [...choices, massInput, radiusInput]) control.disabled = false;
  get('#gravityModelInitNote').hidden = true;
}

initQuiz([
  {
    q: 'You weigh the same everywhere in the universe. True or false?',
    options: [
      { label: 'True — weight never changes' },
      { label: 'False — weight depends on local gravity, mass stays the same', correct: true },
    ],
    right: "Mass (how much matter you're made of) doesn't change. Weight is a force that depends on local gravity — so the same person weighs different amounts on different planets.",
    wrong: "Weight depends on gravity, which is different on every planet. Your mass stays constant, but your weight changes — that's why astronauts float in microgravity without losing any mass.",
  },
  {
    q: 'Jupiter has about 318× Earth\'s mass. Is its surface gravity 318× Earth\'s?',
    options: [
      { label: 'Yes, mass and gravity scale together exactly' },
      { label: 'No — it\'s about 2.5×, because Jupiter is also much bigger, spreading that mass out', correct: true },
    ],
    right: "Surface gravity depends on mass AND how spread out (how large) the planet is. Jupiter has huge mass but an even huger radius, so its idealized non-rotating gravity is about 2.53× Earth's, while NASA's effective equatorial acceleration is about 2.36×.",
    wrong: "Gravity depends on both mass and size. Jupiter's radius is so much bigger than Earth's that its non-rotating g = GM/R² model works out to about 2.53× Earth's; effective equatorial gravity including rotation is closer to 2.36×, not hundreds of times more.",
  },
], {});
