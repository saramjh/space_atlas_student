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

// Exact visual diameter ratio. Do not independently clamp individual circles:
// doing so would show a misleading on-screen size ratio despite accurate statistics.
const MAX_DIAMETER_PX = 220;
const diameterKm = (name) => Number(PLANETS.find((p) => p.name === name).diameter.replace(/[^\d]/g, ''));
const ruler = document.querySelector('#compareRuler');

function render() {
  const ia = Number(selA.value);
  const ib = Number(selB.value);
  const a = SCALE_DATA[ia], b = SCALE_DATA[ib];
  const da = diameterKm(a.name), db = diameterKm(b.name);
  const largest = Math.max(da, db);
  const smallest = Math.min(da, db);
  // Keep both bodies visible within the available viewport, even if the
  // selected pair is two similarly sized giants on a narrow mobile screen.
  const gap = window.matchMedia('(max-width: 620px)').matches ? 12 : 24;
  const stageWidth = stage.clientWidth || 280;
  const maxDisplay = Math.min(MAX_DIAMETER_PX, Math.max(1, (stageWidth - gap - 8) / (1 + smallest / largest)));
  const pixelsPerKm = maxDisplay / largest;
  const pxA = da * pixelsPerKm, pxB = db * pixelsPerKm;

  stage.innerHTML = `
    <div class="compare-planet"><div class="ball" role="img" aria-label="${a.name}: ${da.toLocaleString('en-US')} km equatorial diameter" style="width:${pxA}px;height:${pxA}px;background:${colorFor(a.name)}"></div><span>${a.name}</span></div>
    <div class="compare-planet"><div class="ball" role="img" aria-label="${b.name}: ${db.toLocaleString('en-US')} km equatorial diameter" style="width:${pxB}px;height:${pxB}px;background:${colorFor(b.name)}"></div><span>${b.name}</span></div>
  `;
  const larger = da >= db ? a : b;
  const smaller = da >= db ? b : a;
  const diameterRatio = largest / smallest;
  const volumeRatio = larger.volumeEarths / smaller.volumeEarths;

  ruler.textContent = `One visual scale: ${larger.name} ${largest.toLocaleString('en-US')} km → ${maxDisplay.toFixed(1)} px; ${smaller.name} ${smallest.toLocaleString('en-US')} km → ${Math.min(pxA, pxB).toFixed(1)} px. Each circle's displayed diameter is proportional.`;
  const volumeText = volumeRatio.toFixed(volumeRatio > 100 ? 0 : volumeRatio > 10 ? 1 : 2);
  stats.innerHTML = `
    <div><strong>${diameterRatio.toFixed(2)}×</strong><span>${larger.name}'s equatorial diameter vs ${smaller.name}'s</span></div>
    <div><strong>${volumeText}×</strong><span>${larger.name}'s volume vs ${smaller.name}'s</span></div>
    <div><strong>${volumeText}</strong><span>${smaller.name}-equivalent volumes in ${larger.name}; not literal sphere packing</span></div>
  `;
}

selA.addEventListener('change', render);
selB.addEventListener('change', render);
new ResizeObserver(render).observe(stage);
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
    right: "Jupiter's equatorial diameter is about 11.2× Earth's. The equivalent-volume estimate of roughly 1,321 uses mean planetary radii because the giants are flattened, rather than cubing equatorial diameters.",
    wrong: "The roughly 1,321 Earth-volume ratio uses NASA mean radii. Cubing the equatorial diameter ratio would be inaccurate for flattened giant planets.",
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
