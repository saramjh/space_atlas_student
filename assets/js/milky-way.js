import { initQuiz } from './quiz-widget.js';

const STEPS = [
  { title: 'The Solar System', size: '~9 billion km across', desc: 'Home base: the Sun and everything orbiting it.' },
  { title: 'The Orion Arm', size: 'A minor spiral arm', desc: "We're in a smaller, shorter spiral arm — sometimes called the Orion Spur — between two of the Milky Way's major arms." },
  { title: '~26,000 light-years from the center', size: 'About 2/3 of the way out', desc: "We're roughly 26,000 light-years from the galactic center — not near the middle, and not at the edge either." },
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

initQuiz([
  {
    q: 'Is Earth located near the center of the Milky Way?',
    options: [
      { label: 'Yes, very close to the center' },
      { label: "No — we're about 26,000 light-years out, roughly 2/3 of the way to the edge", correct: true },
    ],
    right: "We're far from the center — about 26,000 light-years out, in a minor spiral arm called the Orion Arm (or Orion Spur).",
    wrong: "We're not near the center at all — Earth sits about 26,000 light-years out, in the Orion Arm, roughly two-thirds of the way toward the galaxy's edge.",
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
