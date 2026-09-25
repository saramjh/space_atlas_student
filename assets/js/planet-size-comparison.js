import { PLANETS, SCALE_DATA } from './planet-data.js';
import { initQuiz } from './quiz-widget.js';

const colorFor = (name) => {
  const p = PLANETS.find((x) => x.name === name);
  return p ? `#${p.color.toString(16).padStart(6, '0')}` : '#777';
};

const selA = document.querySelector('#planetA');
const selB = document.querySelector('#planetB');
const stage = document.querySelector('#compareStage');
const stats = document.querySelector('#compareStats');

SCALE_DATA.forEach((p, i) => {
  const optA = new Option(p.name, i);
  const optB = new Option(p.name, i);
  selA.add(optA);
  selB.add(optB);
});
selA.value = 2; // Earth
selB.value = 4; // Jupiter

const BASE_PX = 40; // Earth's ball diameter in px
const MIN_PX = 8, MAX_PX = 220;

function ratioOf(idx) {
  return parseFloat(SCALE_DATA[idx].ratio);
}

function render() {
  const ia = parseInt(selA.value, 10);
  const ib = parseInt(selB.value, 10);
  const a = SCALE_DATA[ia], b = SCALE_DATA[ib];
  const ra = ratioOf(ia), rb = ratioOf(ib);

  const pxA = Math.min(MAX_PX, Math.max(MIN_PX, ra * BASE_PX));
  const pxB = Math.min(MAX_PX, Math.max(MIN_PX, rb * BASE_PX));

  stage.innerHTML = `
    <div class="compare-planet"><div class="ball" style="width:${pxA}px;height:${pxA}px;background:${colorFor(a.name)}"></div><span>${a.name}</span></div>
    <div class="compare-planet"><div class="ball" style="width:${pxB}px;height:${pxB}px;background:${colorFor(b.name)}"></div><span>${b.name}</span></div>
  `;

  const bigger = rb >= ra ? b : a;
  const smaller = rb >= ra ? a : b;
  const biggerR = Math.max(ra, rb), smallerR = Math.min(ra, rb);
  const diameterRatio = biggerR / smallerR;
  const volumeRatio = Math.pow(diameterRatio, 3);

  stats.innerHTML = `
    <div><strong>${diameterRatio.toFixed(2)}×</strong><span>${bigger.name}'s diameter vs ${smaller.name}'s</span></div>
    <div><strong>${volumeRatio.toFixed(volumeRatio > 100 ? 0 : 1)}×</strong><span>${bigger.name}'s volume vs ${smaller.name}'s</span></div>
    <div><strong>${volumeRatio.toFixed(volumeRatio > 100 ? 0 : 1)}</strong><span>${smaller.name}s that fit inside ${bigger.name} by volume</span></div>
  `;
}

selA.addEventListener('change', render);
selB.addEventListener('change', render);
document.querySelectorAll('[data-planet-a][data-planet-b]').forEach((button) => {
  button.addEventListener('click', () => {
    selA.value = button.dataset.planetA;
    selB.value = button.dataset.planetB;
    document.querySelectorAll('[data-planet-a][data-planet-b]').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    render();
  });
});
render();

initQuiz([
  {
    q: 'By volume, roughly how many Earths could fit inside Jupiter?',
    options: [
      { label: 'About 11' },
      { label: 'About 100' },
      { label: 'About 1,300', correct: true },
      { label: 'About 10,000' },
    ],
    right: "Jupiter's diameter is 11.2× Earth's. Volume scales with diameter cubed (11.2³ ≈ 1,321), so about 1,321 Earths fit inside it by volume.",
    wrong: "Jupiter's diameter is 11.2× Earth's, but volume scales with the CUBE of diameter (11.2³ ≈ 1,321) — so the volume difference is much bigger than the diameter difference suggests.",
  },
  {
    q: 'Venus and Earth are often called "twins." What does that refer to?',
    options: [
      { label: 'They have nearly identical diameters', correct: true },
      { label: 'They have the same atmosphere' },
      { label: 'They orbit at the same distance from the Sun' },
      { label: 'They have the same surface temperature' },
    ],
    right: "Venus's diameter is about 0.95× Earth's — very close in size. Their atmospheres, distance from the Sun, and surface temperatures are very different.",
    wrong: "It's about diameter: Venus is 0.95× Earth's diameter, nearly identical. Its atmosphere and surface temperature are dramatically different from Earth's.",
  },
], {});
