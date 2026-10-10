import { initQuiz } from './quiz-widget.js';

// Representative evolutionary tracks, not a clock or a hard initial-mass classifier.
// Sources: NASA Stars and NASA/Night Sky Network stellar lifecycle diagrams.
const PATHS = {
  sun: [
    { label: 'Nebula', color: '#4b72b9', title: 'Nebula — a star-forming cloud', desc: 'Cold gas and dust collect into denser regions. Gravity pulls material inward toward a forming star.', cause: 'Gravity overcomes local support and begins collapse.' },
    { label: 'Protostar', color: '#c9a681', title: 'Protostar — contraction heats the gas', desc: 'The center becomes denser and hotter, but sustained hydrogen fusion has not yet begun.', cause: 'Continued gravitational contraction raises pressure and core temperature.' },
    { label: 'Main sequence', color: '#f5c15c', title: 'Main sequence — hydrogen fusion', desc: 'The Sun is in this stage now. Core hydrogen fusion counteracts gravity for roughly 10 billion years in a Sun-like star.', cause: 'Hydrogen fusion supplies energy that supports the star against its own gravity.' },
    { label: 'Red giant', color: '#bd4c2f', title: 'Red giant — core fuel runs low', desc: 'After core hydrogen is exhausted, the core contracts while hydrogen burning in surrounding layers drives the outer star to expand.', cause: 'Changing fusion regions and gravitational contraction reshape the star.' },
    { label: 'Planetary nebula', color: '#76b5ba', title: 'Planetary nebula — outer gas drifts away', desc: 'Ejected outer layers surround the hot stellar remnant. Despite the name, a planetary nebula is unrelated to planets.', cause: 'The expanding shell reveals the dense core left behind.' },
    { label: 'White dwarf', color: '#e9edf0', title: 'White dwarf — the remaining hot core', desc: 'The exposed remnant no longer performs sustained core fusion and cools gradually for billions of years.', cause: 'Without normal fusion, residual heat radiates away over time.' },
  ],
  massive: [
    { label: 'Nebula', color: '#4b72b9', title: 'Nebula — a star-forming cloud', desc: 'As in the Sun-like case, gravity draws material together from a molecular cloud.', cause: 'Gravitational collapse forms an increasingly dense central region.' },
    { label: 'Protostar', color: '#c9a681', title: 'Protostar — a massive star forms', desc: 'The forming star gathers mass, heats up and eventually begins stable core hydrogen fusion.', cause: 'Gravity raises temperature and pressure until nuclear reactions can sustain the star.' },
    { label: 'Main sequence', color: '#8fb8d4', title: 'Main sequence — much faster fuel use', desc: 'Very massive stars burn hydrogen at much higher rates. Their whole lives can last only a few million years, rather than billions.', cause: 'Greater mass requires much higher internal energy production to resist gravity.' },
    { label: 'Red supergiant', color: '#bd4c2f', title: 'Giant phase — fusion of heavier elements', desc: 'A representative massive star may expand into a red supergiant while its core proceeds through successive fusion stages. Not every massive star follows this exact appearance.', cause: 'The core exhausts successive fuels; later reactions support it for shorter and shorter periods.' },
    { label: 'Supernova', color: '#f5c15c', title: 'Core collapse — a possible bright supernova', desc: 'In a typical core-collapse supernova, an iron-rich core can no longer gain energy from fusion, collapses, and may drive a powerful explosion.', cause: 'Fusion can no longer counter gravity. Some massive stars may collapse without a bright supernova.' },
    { label: 'Neutron star / black hole', color: '#101419', title: 'Compact remnant — two possible outcomes', desc: 'The collapsed core may leave a neutron star or a black hole. The outcome depends on core structure, mass loss and other evolution, not a single exact initial-mass threshold.', cause: 'The final core’s gravity and pressure determine what can remain stable.' },
  ],
};

const toggle = document.querySelector('#massToggle');
const stages = document.querySelector('#lifeStages');
const count = document.querySelector('#lifeStageCount');
const heading = document.querySelector('#lifeStageTitle');
const description = document.querySelector('#lifeStageDescription');
const cause = document.querySelector('#lifeStageCause');
const previous = document.querySelector('#lifePrevious');
const next = document.querySelector('#lifeNext');
let selectedMass = 'sun';
let stageIndex = 0;

function render(rebuildSteps = false) {
  const path = PATHS[selectedMass];
  stages.setAttribute('aria-label', `${selectedMass === 'sun' ? 'Sun-like' : 'Massive'} star evolution — select a stage`);
  // Preserve focus on the selected button; rebuild only when the mass branch changes.
  if (rebuildSteps) {
    stages.innerHTML = path.map((stage, i) => `<li><button type="button" class="life-stage${i === stageIndex ? ' active' : ''}" data-stage="${i}" aria-pressed="${i === stageIndex}"><span class="dot" style="--life-color:${stage.color}"></span><span class="lbl">${stage.label}</span></button></li>`).join('');
  }
  stages.querySelectorAll('[data-stage]').forEach((btn) => {
    const active = Number(btn.dataset.stage) === stageIndex;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  const stage = path[stageIndex];
  count.textContent = `Stage ${stageIndex + 1} of ${path.length} · ${selectedMass === 'sun' ? 'Sun-like' : 'Massive'} pathway`;
  heading.textContent = stage.title;
  description.textContent = stage.desc;
  cause.textContent = `Key process: ${stage.cause}`;
  previous.disabled = stageIndex === 0;
  next.disabled = stageIndex === path.length - 1;
  toggle.querySelectorAll('[data-mass]').forEach((btn) => {
    const active = btn.dataset.mass === selectedMass;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

toggle.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-mass]');
  if (!btn || !toggle.contains(btn)) return;
  selectedMass = btn.dataset.mass;
  // Preserve the matching stage while rebuilding this alternate path.
  render(true);
});
stages.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-stage]');
  if (!btn || !stages.contains(btn)) return;
  stageIndex = Number(btn.dataset.stage);
  render();
});
previous.addEventListener('click', () => {
  if (stageIndex > 0) {
    stageIndex -= 1;
    render();
    stages.querySelector(`[data-stage="${stageIndex}"]`).focus();
  }
});
next.addEventListener('click', () => {
  if (stageIndex < PATHS[selectedMass].length - 1) {
    stageIndex += 1;
    render();
    stages.querySelector(`[data-stage="${stageIndex}"]`).focus();
  }
});
render();

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
