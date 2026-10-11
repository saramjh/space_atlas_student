import { initQuiz } from './quiz-widget.js';

const ruleExplorer = document.querySelector('#planetRuleExplorer');
if (ruleExplorer) {
  const facts = {
    Earth: { planet: true, explanation: "Earth dominates the region around its orbit, despite sharing it with some smaller bodies." },
    Neptune: { planet: true, explanation: "Neptune gravitationally dominates its orbital zone even though smaller objects can orbit nearby or be in resonances with it." },
    Pluto: { planet: false, explanation: "Pluto shares its orbital region with many other Kuiper Belt objects and does not dominate that population." },
    Ceres: { planet: false, explanation: "Ceres occupies the asteroid belt and has not gravitationally dominated its surrounding region." },
    Eris: { planet: false, explanation: "Eris is a round trans-Neptunian object that has not gravitationally dominated its orbital neighborhood." },
  };
  const buttons = [...ruleExplorer.querySelectorAll('[data-planet-rule]')];
  const third = ruleExplorer.querySelector('#ruleClearedStep');
  const mark = ruleExplorer.querySelector('#ruleClearedMark');
  const explanation = ruleExplorer.querySelector('#ruleClearedExplanation');
  const outcome = ruleExplorer.querySelector('#ruleClassification');
  function selectRule(name) {
    const fact = facts[name];
    if (!fact) return;
    buttons.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.planetRule === name)));
    third.classList.toggle('passes', fact.planet);
    third.classList.toggle('fails', !fact.planet);
    mark.textContent = fact.planet ? '✓' : '✗';
    explanation.textContent = fact.explanation;
    outcome.textContent = `${name}: ${fact.planet ? 'planet' : 'dwarf planet'}. ${fact.planet ? 'All three IAU criteria are met.' : 'The first two criteria are met; the orbital-neighborhood criterion is not.'}`;
  }
  buttons.forEach(button => button.addEventListener('click', () => selectRule(button.dataset.planetRule)));
  selectRule('Pluto');
}

initQuiz([
  {
    q: 'What is the one criterion Pluto fails for the official IAU definition of "planet"?',
    options: [
      { label: 'It does not orbit the Sun' },
      { label: 'It is not round' },
      { label: 'It has not cleared its orbital neighborhood of similar-sized debris', correct: true },
      { label: 'It is too far from the Sun' },
    ],
    right: "Pluto orbits the Sun and is round — it fails only the third criterion. It shares its orbital region (the Kuiper Belt) with thousands of similarly sized icy bodies.",
    wrong: "Pluto passes two of the three tests (orbits the Sun, is round). It fails only \"cleared its neighborhood\" — it shares the Kuiper Belt with many similar objects.",
  },
  {
    q: 'Did Pluto get smaller or move somewhere new in 2006?',
    options: [
      { label: 'Yes, it shrank significantly' },
      { label: 'Yes, it moved farther from the Sun' },
      { label: 'No — the definition of "planet" changed, not Pluto', correct: true },
      { label: 'Yes, both' },
    ],
    right: "Pluto itself didn't change at all. In 2006 the International Astronomical Union adopted a formal three-part definition of \"planet\" for the first time, and Pluto didn't meet all three parts.",
    wrong: "Pluto stayed exactly the same — its size, shape, and orbit are unchanged. What changed was that astronomers formally defined \"planet\" for the first time in 2006, and Pluto didn't meet every part of it.",
  },
], {});
