import { initQuiz, initToggleCards } from './quiz-widget.js';

initToggleCards('.truth');

initQuiz([
  {
    q: 'What shape is the Milky Way galaxy?',
    options: [
      { label: 'Elliptical' },
      { label: 'Spiral', correct: true },
      { label: 'Irregular' },
      { label: 'Perfectly spherical' },
    ],
    right: 'The Milky Way is a spiral galaxy — a flat, rotating disc with curved arms of stars and gas, similar in shape to the Andromeda Galaxy.',
    wrong: "It's a spiral galaxy — a rotating disc with curved arms, the same general shape as our neighbor Andromeda.",
  },
  {
    q: 'An irregular galaxy usually got its shape from...',
    options: [
      { label: 'Being born that way and never changing' },
      { label: 'A collision or close gravitational encounter with another galaxy', correct: true },
      { label: 'Spinning too fast' },
      { label: 'Having no stars at all' },
    ],
    right: 'Irregular galaxies typically lost their organized structure through a collision or close gravitational interaction with a neighboring galaxy.',
    wrong: 'It usually comes from a collision or close gravitational encounter with another galaxy, which disrupts any organized spiral or elliptical structure.',
  },
], {});
