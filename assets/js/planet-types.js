import { initQuiz } from './quiz-widget.js';

initQuiz([
  {
    q: 'Do gas giants like Jupiter have a solid surface you could stand on?',
    options: [
      { label: 'Yes, a rocky surface like Earth\'s' },
      { label: 'No — the atmosphere just gets denser with depth, with no solid surface', correct: true },
    ],
    right: "There is no solid surface to stand on. Jupiter's atmosphere gradually transitions into liquid metallic hydrogen with increasing pressure and depth — there's no clean boundary like Earth's ground.",
    wrong: "There's no solid surface at all — the atmosphere just gets denser and denser with depth until it behaves like a liquid, with no clear boundary.",
  },
  {
    q: 'What kind of planet is Earth?',
    options: [
      { label: 'Gas giant' },
      { label: 'Ice giant' },
      { label: 'Terrestrial (rocky)', correct: true },
      { label: 'None of these — Earth is unique' },
    ],
    right: 'Earth is a terrestrial planet: a solid rocky crust and mantle around a dense metal core — the same basic structure as Mercury, Venus, and Mars.',
    wrong: "Earth is terrestrial — a rocky crust and mantle around a metal core, the same basic type as Mercury, Venus, and Mars.",
  },
], {});
