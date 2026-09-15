import { initQuiz } from './quiz-widget.js';

const BANDS = [
  { name: 'Radio', desc: 'Longest wavelengths. Radio telescopes map hydrogen gas, pulsars, and the afterglow of the Big Bang (the cosmic microwave background sits near this end).' },
  { name: 'Microwave', desc: 'Used to map the cosmic microwave background — the oldest light in the universe, leftover radiation from about 380,000 years after the Big Bang.' },
  { name: 'Infrared', desc: 'Passes through dust clouds that block visible light, revealing stars forming inside nebulae. The James Webb Space Telescope observes mainly in infrared.' },
  { name: 'Visible', desc: 'The narrow band your eyes detect — the only part of this whole spectrum humans can see without an instrument.' },
  { name: 'Ultraviolet', desc: 'Reveals the hottest, youngest stars and active regions on the Sun. Mostly blocked by Earth\'s atmosphere.' },
  { name: 'X-ray', desc: 'Detects extremely energetic events: matter falling into black holes, exploded stars, and gas heated to millions of degrees.' },
  { name: 'Gamma ray', desc: 'The most energetic light in the universe, produced by the most violent events — supernovae, neutron star collisions, and matter near black holes.' },
];

const bar = document.querySelector('#spectrumBar');
const slider = document.querySelector('#spectrumSlider');
const bandEl = document.querySelector('#spectrumBand');
const descEl = document.querySelector('#spectrumDesc');

const visibleBox = document.createElement('div');
visibleBox.className = 'spectrum-visible';
const visIndex = BANDS.findIndex((b) => b.name === 'Visible');
visibleBox.style.left = `${(visIndex / BANDS.length) * 100}%`;
visibleBox.style.width = `${(1 / BANDS.length) * 100}%`;
bar.appendChild(visibleBox);

function render() {
  const i = Number(slider.value);
  const b = BANDS[i];
  bandEl.textContent = b.name;
  descEl.textContent = b.desc;
}

slider.addEventListener('input', render);
render();

initQuiz([
  {
    q: 'How much of the electromagnetic spectrum can human eyes detect?',
    options: [
      { label: 'All of it' },
      { label: 'About half of it' },
      { label: 'A narrow sliver called "visible light"', correct: true },
      { label: 'None of it — we need instruments for everything' },
    ],
    right: 'Visible light is a narrow band in the middle of a spectrum that stretches from long radio waves to extremely short gamma rays — almost all of it is invisible to human eyes.',
    wrong: "It's just a narrow sliver in the middle — the full spectrum runs from radio waves to gamma rays, and human eyes detect only \"visible light.\"",
  },
  {
    q: 'Why are telescopes like Hubble and JWST placed in space instead of on the ground?',
    options: [
      { label: "Space telescopes are cheaper to build" },
      { label: "Earth's atmosphere blocks much of the spectrum, including most infrared, UV, X-ray, and gamma ray light", correct: true },
      { label: 'There is no reason, it is just tradition' },
      { label: 'Ground telescopes cannot use visible light' },
    ],
    right: "Earth's atmosphere absorbs most X-rays, gamma rays, and a lot of infrared and ultraviolet light before it reaches the ground — space telescopes get above that filter.",
    wrong: "It's about the atmosphere: it blocks most X-ray, gamma ray, and much infrared/UV light, so space telescopes are needed to observe those bands at all.",
  },
], {});
