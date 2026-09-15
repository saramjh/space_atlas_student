import { initQuiz } from './quiz-widget.js';

const PATHS = {
  sun: [
    { label: 'Nebula', color: '#4b72b9', desc: 'A cloud of gas and dust collapses under gravity.' },
    { label: 'Protostar', color: '#c9a681', desc: 'The collapsing core heats up and begins to glow.' },
    { label: 'Main sequence', color: '#f5c15c', desc: 'Fuses hydrogen into helium for ~10 billion years (the Sun is here now).' },
    { label: 'Red giant', color: '#bd4c2f', desc: 'Runs low on hydrogen fuel and swells enormously.' },
    { label: 'Planetary nebula', color: '#76b5ba', desc: 'Outer layers drift away, forming a glowing shell of gas.' },
    { label: 'White dwarf', color: '#e9edf0', desc: 'The exposed core cools slowly for billions of years.' },
  ],
  massive: [
    { label: 'Nebula', color: '#4b72b9', desc: 'A cloud of gas and dust collapses under gravity.' },
    { label: 'Protostar', color: '#c9a681', desc: 'The collapsing core heats up and begins to glow.' },
    { label: 'Main sequence', color: '#8fb8d4', desc: 'Burns through fuel far faster — often in just a few million years.' },
    { label: 'Red supergiant', color: '#bd4c2f', desc: 'Swells to an enormous size as fusion races through heavier elements.' },
    { label: 'Supernova', color: '#f5c15c', desc: 'A catastrophic explosion, briefly outshining an entire galaxy.' },
    { label: 'Neutron star / black hole', color: '#101419', desc: "What's left of the core collapses into one of the densest objects in the universe." },
  ],
};

const toggle = document.querySelector('#massToggle');
const stages = document.querySelector('#lifeStages');

function render(mass) {
  const path = PATHS[mass];
  stages.innerHTML = path.map((s, i) => `
    ${i > 0 ? '<span class="life-arrow">→</span>' : ''}
    <div class="life-stage">
      <div class="dot" style="background:${s.color}"></div>
      <div class="lbl">${s.label}</div>
      <div class="desc">${s.desc}</div>
    </div>
  `).join('');
}

toggle.querySelectorAll('button').forEach((btn) => {
  btn.onclick = () => {
    toggle.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.mass);
  };
});

render('sun');

initQuiz([
  {
    q: "What mainly determines whether a star ends as a white dwarf or in a supernova?",
    options: [
      { label: 'How old the star is' },
      { label: 'How much mass the star started with', correct: true },
      { label: 'How far the star is from Earth' },
      { label: 'The color of the star' },
    ],
    right: "Initial mass is the deciding factor. Stars around the Sun's mass end gently as white dwarfs; stars roughly 8× the Sun's mass or more end in a supernova.",
    wrong: "It comes down to mass: Sun-like stars fade into white dwarfs, while stars several times more massive end catastrophically in a supernova.",
  },
  {
    q: 'Roughly how long does a Sun-like star spend in the "main sequence" stage, fusing hydrogen?',
    options: [
      { label: 'About 10,000 years' },
      { label: 'About 1 million years' },
      { label: 'About 10 billion years', correct: true },
      { label: 'Forever — it never changes' },
    ],
    right: "About 10 billion years — the Sun is roughly halfway through that stage right now, at about 4.6 billion years old.",
    wrong: "It's about 10 billion years for a Sun-like star. The Sun itself is roughly 4.6 billion years into that stage.",
  },
], {});
