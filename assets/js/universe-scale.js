import { initQuiz } from './quiz-widget.js';
import { initTeacherDistribution } from './teacher-distribution.js';
import { COSMIC_METRES, COSMIC_DOMAIN, logPosition, cosmicJump } from './scale-visual-math.js';

const STEPS = [
  { title: 'You', size: '~1.7 m tall', desc: 'Everything else on this ladder is measured relative to something you already understand: your own height.' },
  { title: 'Earth', size: '12,742 km diameter', desc: "Earth is about 7.5 million times your height. You'd need to line up 7.5 million people to span it.", factor: '≈ 7,500,000×' },
  { title: 'Earth–Moon distance', size: '384,400 km', desc: 'About 30 Earths could fit side by side in the gap between Earth and the Moon.', factor: '≈ 30×' },
  { title: 'The solar system', size: '~9 billion km across (to Neptune\'s orbit)', desc: "Neptune's orbit is roughly 23,000 times wider than the Earth-Moon distance.", factor: '≈ 23,000×' },
  { title: 'To the nearest star', size: '4.25 light-years (Proxima Centauri)', desc: 'Even the nearest star is about 4,500 times farther than the width of our entire solar system.', factor: '≈ 4,500×' },
  { title: 'The Milky Way galaxy', size: '~100,000 light-years across', desc: 'Our galaxy holds 100–400 billion stars — the gap to even the nearest one barely registers at this scale.', factor: '≈ 23,500×' },
  { title: 'The Local Group', size: '~10 million light-years across', desc: 'A cluster of dozens of galaxies, including the Milky Way and Andromeda, bound together by gravity.', factor: '≈ 100×' },
  { title: 'The observable universe', size: '~93 billion light-years across', desc: 'The part of the universe whose light has had time to reach us since the Big Bang. It may be far larger — possibly infinite.', factor: '≈ 9,300×' },
];

let index = 0;
const stage = document.querySelector('#zoomStageCopy');
const cinemaFrame = document.querySelector('#zoomCinemaFrame');
const cinemaCanvas = document.querySelector('#zoomCinemaCanvas');
const cinemaButton = document.querySelector('#zoomCinemaActivate');
const cinemaStatus = document.querySelector('#zoomCinemaStatus');
let cinema = null, cinemaLoading = false;
cinemaButton.disabled = false;
cinemaButton.addEventListener('click', async () => {
  if (cinemaLoading) return;
  if (cinema) {
    const visible = cinemaFrame.hidden;
    cinemaFrame.hidden = !visible;
    if (!visible) cinema.suspend();
    cinemaButton.setAttribute('aria-pressed', String(visible));
    cinemaButton.textContent = visible ? 'Return to the scale diagram' : 'Enter the illustrated cosmic journey';
    if (visible) { cinema.resize(); cinema.setStep(index); cinemaCanvas.focus({preventScroll:true}); }
    return;
  }
  cinemaLoading = true;
  cinemaButton.disabled = true;
  cinemaStatus.textContent = 'Loading local scene…';
  try {
    const {createCosmicCinema} = await import('./cosmic-cinema.js');
    cinemaFrame.hidden = false;
    cinema = createCosmicCinema(cinemaCanvas, selectStep);
    cinema.setStep(index);
    cinemaButton.setAttribute('aria-pressed', 'true');
    cinemaButton.textContent = 'Return to the scale diagram';
    cinemaStatus.textContent = 'Scene is illustrative, not to physical scale; the ruler below contains the true numerical comparisons.';
    cinemaCanvas.focus({preventScroll:true});
  } catch (error) {
    cinemaFrame.hidden = true;
    cinemaStatus.textContent = 'The visual journey could not load. The scale ruler and reference table still work.';
    console.warn('Cosmic cinema unavailable; preserving reference model.',error);
  } finally {cinemaButton.disabled = false; cinemaLoading = false;}
});
const dots = document.querySelector('#zoomDots');
const prevBtn = document.querySelector('#zoomPrev');
const nextBtn = document.querySelector('#zoomNext');
const ruler = document.querySelector('#cosmicRuler');
const chosenLine = document.querySelector('#cosmicRulerSelection');
const jumpPanel = document.querySelector('#cosmicJump');
const stopButtons = [...document.querySelectorAll('[data-cosmic-step]')];
const plotViewport = document.querySelector('.cosmic-ruler-viewport');

function jumpRepresentation(step) {
  if (step === 0) return '<strong>Starting scale: one human height</strong><p>1.7 metres is the reference. Select Earth to see how many tenfold increases fit in the next step.</p>';
  const ratio = cosmicJump(step);
  const decades = Math.floor(Math.log10(ratio));
  const remaining = ratio / Math.pow(10, decades);
  const blocks = Array.from({length:decades}, () => '<span class="cosmic-tenfold">×10</span>').join('');
  const tail = remaining > 1.005 ? `<span class="cosmic-tenfold cosmic-tenfold-tail">×${remaining.toFixed(2)}</span>` : '';
  return `<strong>Previous → current: approximately ${Math.round(ratio).toLocaleString('en-US')}× larger in the compared length measures</strong><div class="cosmic-decades" aria-hidden="true">${blocks}${tail}</div><p>Every ×10 block means one order of magnitude. This is a comparison of the listed approximate sizes or separations, not objects nested to scale.</p>`;
}
function selectStep(i) {
  if (!Number.isInteger(i) || i < 0 || i >= STEPS.length) return;
  index = i;
  render();
  if (cinema && !cinemaFrame.hidden) cinema.setStep(i);
  const button = stopButtons[i];
  if (button) {
    // Scroll only the diagram's horizontal strip, not the whole document.
    const desired = button.offsetLeft - plotViewport.clientWidth / 2;
    plotViewport.scrollLeft = Math.max(0, desired);
  }
}
stopButtons.forEach((button) => button.addEventListener('click', () => selectStep(Number(button.dataset.cosmicStep))));

// Reuse server-rendered dots (and their first active state) to keep a
// meaningful no-JS fallback. Create them only for older markup.
if (dots.children.length !== STEPS.length) {
  dots.replaceChildren();
  STEPS.forEach(() => dots.appendChild(document.createElement('span')));
}

function render() {
  const s = STEPS[index];
  stage.innerHTML = `
    <div class="zoom-step-no">Step ${index + 1} of ${STEPS.length}</div>
    <div class="zoom-title">${s.title}</div>
    <div class="zoom-size">${s.size}</div>
    <p class="zoom-desc">${s.desc}</p>
    ${s.factor ? `<div class="zoom-factor">${s.factor} bigger than the last step</div>` : ''}
  `;
  [...dots.children].forEach((d, i) => d.classList.toggle('active', i === index));
  const metres = COSMIC_METRES[index];
  const x = (36 + 828 * logPosition(metres, COSMIC_DOMAIN.min, COSMIC_DOMAIN.max)).toFixed(2);
  chosenLine.setAttribute('x1', x);
  chosenLine.setAttribute('x2', x);
  ruler.setAttribute('aria-label', `Logarithmic metre ruler: selected step ${index + 1}, ${s.title}, ${s.size}. Marks are positioned by approximate physical size or separation.`);
  stopButtons.forEach((button, i) => {
    button.classList.toggle('selected', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  jumpPanel.innerHTML = jumpRepresentation(index);
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === STEPS.length - 1;
}

prevBtn.onclick = () => selectStep(index - 1);
nextBtn.onclick = () => selectStep(index + 1);
render();
stopButtons.forEach((button) => { button.disabled = false; });
document.querySelector('#zoomInitNote').hidden = true;

initQuiz([
  {
    q: 'The "observable universe" is 93 billion light-years across. Does that mean the whole universe stops there?',
    options: [
      { label: 'Yes, that is the edge of everything' },
      { label: 'No — it is just how far light has had time to reach us so far', correct: true },
      { label: 'No, the universe is shrinking' },
      { label: 'Yes, space itself ends at that boundary' },
    ],
    right: "The observable universe is limited by how far light has had time to travel since the Big Bang, not by the universe's actual size. The full universe could be much larger, or infinite.",
    wrong: "It's a light-travel-time limit, not a physical edge — light from farther away simply hasn't reached us yet. The universe itself could be far bigger.",
  },
  {
    q: 'Roughly how many times bigger is the jump from "the solar system" to "the nearest star" than the jump from "Earth" to "the Moon\'s distance"?',
    options: [
      { label: 'About the same size jump' },
      { label: 'Hundreds of times bigger', correct: true },
      { label: 'Thousands of times bigger' },
      { label: 'It is a smaller jump' },
    ],
    right: 'The solar system to Proxima jump is about 4,500×; Earth diameter to Moon distance is about 30×. Their jump factors differ by about 150×, or hundreds of times.',
    wrong: 'Compare the two multipliers, not the two physical lengths: 4,500 ÷ 30 ≈ 150. Some steps on the ladder are just ~30× or ~100×, not thousands.',
  },
], {});
initTeacherDistribution('universe_scale');
