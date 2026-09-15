import { initQuiz } from './quiz-widget.js';

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
