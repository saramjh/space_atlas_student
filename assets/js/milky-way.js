import { initQuiz } from './quiz-widget.js';

const STEPS = [
  { title: 'The Solar System', size: '~9 billion km across', desc: 'Home base: the Sun and everything orbiting it.' },
  { title: 'The Orion Arm', size: 'A minor spiral arm', desc: "We're in a smaller, shorter spiral arm — sometimes called the Orion Spur — between two of the Milky Way's major arms." },
  { title: '~26,000 light-years from the center', size: 'About half a nominal ~50,000-light-year disk radius', desc: "We're roughly 26,000 light-years from the galactic center. The galaxy's disk has no sharp edge, and its spiral arms are still being mapped." },
  { title: 'The Milky Way', size: '~100,000 light-years across, ~100-400 billion stars', desc: 'Our entire galaxy — a barred spiral galaxy that takes the Sun about 230 million years to orbit once.' },
];

let index = 0;
const stage = document.querySelector('#mwStage');
const dots = document.querySelector('#mwDots');
const prevBtn = document.querySelector('#mwPrev');
const nextBtn = document.querySelector('#mwNext');

STEPS.forEach(() => dots.appendChild(document.createElement('span')));

function render() {
  const s = STEPS[index];
  stage.innerHTML = `
    <div class="zoom-step-no">Step ${index + 1} of ${STEPS.length}</div>
    <div class="zoom-title">${s.title}</div>
    <div class="zoom-size">${s.size}</div>
    <p class="zoom-desc">${s.desc}</p>
  `;
  [...dots.children].forEach((d, i) => d.classList.toggle('active', i === index));
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === STEPS.length - 1;
}
prevBtn.onclick = () => { if (index > 0) { index--; render(); } };
nextBtn.onclick = () => { if (index < STEPS.length - 1) { index++; render(); } };
render();

const mwSlider = document.querySelector('#mwDistanceSlider');
const mwMarker = document.querySelector('#mwExplorerMark');
const mwReadout = document.querySelector('#mwAddressReadout');
const MW_RADIUS_LY = 50000;
const MW_RADIUS_SVG = 128;
const MW_CENTER_X = 160;
// Radial model only, not a face-on map of individual Milky Way arms.
// Move only the hypothetical marker; the Sun remains fixed at 26,000 ly.
function setExploreDistance(distanceLy) {
  const bounded = Math.max(0, Math.min(MW_RADIUS_LY, Number(distanceLy) || 0));
  mwSlider.value = String(bounded);
  mwMarker.setAttribute('cx', String(MW_CENTER_X + bounded / MW_RADIUS_LY * MW_RADIUS_SVG));
  mwReadout.textContent = `Hypothetical distance: ${bounded.toLocaleString('en-US')} light-years · ${Math.round(bounded / MW_RADIUS_LY * 100)}% of a nominal galactic disk radius. The Sun remains at ≈ 26,000 light-years.`;
}
mwSlider?.addEventListener('input', () => setExploreDistance(mwSlider.value));
document.querySelector('#mwShowSun')?.addEventListener('click', () => setExploreDistance(26000));
if (mwSlider && mwMarker) setExploreDistance(0);

initQuiz([
  {
    q: 'Is Earth located near the center of the Milky Way?',
    options: [
      { label: 'Yes, very close to the center' },
      { label: "No — we're about 26,000 light-years out, within the galaxy's broad disk", correct: true },
    ],
    right: "We're far from the center — about 26,000 light-years out, in a minor spiral arm called the Orion Arm (or Orion Spur).",
    wrong: "We're not near the center at all — Earth sits about 26,000 light-years out, in the Orion Arm, about halfway along a nominal 50,000-light-year disk radius; the edge is not sharp.",
  },
  {
    q: 'About how long does it take the Sun to complete one orbit around the Milky Way\'s center?',
    options: [
      { label: 'About 1 year' },
      { label: 'About 1,000 years' },
      { label: 'About 230 million years', correct: true },
      { label: 'The Sun does not orbit the galaxy' },
    ],
    right: 'About 230 million years — sometimes called a "galactic year." The Sun has only completed a small number of these since it formed.',
    wrong: "It's about 230 million years, sometimes called a \"galactic year\" — the Sun orbits the Milky Way's center just like planets orbit the Sun.",
  },
], {});
