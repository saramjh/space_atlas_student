import { initQuiz } from './quiz-widget.js';

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
const stage = document.querySelector('#zoomStage');
const dots = document.querySelector('#zoomDots');
const prevBtn = document.querySelector('#zoomPrev');
const nextBtn = document.querySelector('#zoomNext');

STEPS.forEach((_, i) => {
  const d = document.createElement('span');
  dots.appendChild(d);
});

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
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === STEPS.length - 1;
}

prevBtn.onclick = () => { if (index > 0) { index--; render(); } };
nextBtn.onclick = () => { if (index < STEPS.length - 1) { index++; render(); } };
render();

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
      { label: 'Hundreds of times bigger' },
      { label: 'Thousands of times bigger', correct: true },
      { label: 'It is a smaller jump' },
    ],
    right: 'Each step on this ladder is typically a jump of thousands to tens of thousands of times, not a steady multiple — scale in astronomy grows explosively, not evenly.',
    wrong: 'Each zoom-out step here jumps by thousands of times or more — the scale grows explosively at each step, not steadily.',
  },
], {});
