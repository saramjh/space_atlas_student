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
    right: "Surface gravity depends on mass AND how spread out (how large) the planet is. Jupiter has huge mass but an even huger radius, so its surface gravity ends up only about 2.53× Earth's.",
    wrong: "Gravity depends on both mass and size. Jupiter's radius is so much bigger than Earth's that its surface gravity works out to only about 2.53× Earth's, not hundreds of times more.",
  },
], {});
