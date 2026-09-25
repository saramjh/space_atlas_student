import { PLANETS } from './planet-data.js';
import { initQuiz } from './quiz-widget.js';

initQuiz([
  {
    q: 'Why do interactive solar system models compress the distance between planets?',
    options: [
      { label: 'The real distances are not known precisely' },
      { label: 'True-to-scale distances would make inner planets unreadable dots', correct: true },
      { label: 'Compression makes the simulation run faster' },
      { label: 'It has no real reason, it is just a design choice' },
    ],
    right: 'On a true linear scale, Mercury through Mars would land within the first few percent of the screen — indistinguishable and unclickable. Compressing distance keeps every planet individually visible and interactive.',
    wrong: "It's about readability: at a true scale, the four inner planets would overlap into an unclickable blur. Compressing distance is what keeps them individually visible.",
  },
  {
    q: "A model that compresses distance but keeps planet order and relative spacing consistent is still useful for learning which of these?",
    options: [
      { label: 'The exact number of kilometers between planets' },
      { label: 'Which planets are closer to the Sun than others', correct: true },
      { label: 'The exact orbital speed of each planet' },
      { label: 'Nothing — a compressed model teaches nothing reliable' },
    ],
    right: 'Order and relative position (which planet is closer to the Sun) survive compression even when exact distances don\'t. That\'s why the "measurable fact" sections on Space Atlas give the precise numbers separately.',
    wrong: "A compressed model still preserves order — which planet is closer or farther. It's the exact numbers that get lost, which is why this site always states the real numbers separately.",
  },
], {});


const modelEarthDistance = document.querySelector('#modelEarthDistance');
const modelDistanceUnit = document.querySelector('#modelDistanceUnit');
const modelDistanceGrid = document.querySelector('#modelDistanceGrid');

function renderModelDistances() {
  if (!modelEarthDistance || !modelDistanceUnit || !modelDistanceGrid) return;
  const earthDistance = Math.max(0, Number(modelEarthDistance.value) || 0);
  const unit = modelDistanceUnit.value;
  modelDistanceGrid.innerHTML = PLANETS.map((planet) => {
    const au = Number.parseFloat(planet.au);
    const distance = earthDistance * au;
    const digits = distance >= 100 ? 0 : distance >= 10 ? 1 : 2;
    return `<div class="weight-cell${planet.name === 'Earth' ? ' you' : ''}">
      <div class="planet">${planet.name}</div>
      <div class="val">${distance.toFixed(digits)} ${unit}</div>
      <div class="sub">${planet.au} from the Sun</div>
    </div>`;
  }).join('');
}

modelEarthDistance?.addEventListener('input', renderModelDistances);
modelDistanceUnit?.addEventListener('change', renderModelDistances);
renderModelDistances();
