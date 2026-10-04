import { initQuiz } from './quiz-widget.js';

initQuiz([
  {
    q: 'What actually makes a black hole "black"?',
    options: [
      { label: 'It has no light source nearby' },
      { label: "Not even light can escape past its event horizon", correct: true },
      { label: 'It absorbs all color like a black object' },
      { label: 'It is painted black by astronomers on diagrams' },
    ],
    right: "The event horizon is a one-way causal boundary: after crossing inward, every future-directed path remains inside, so even light cannot return to the outside universe.",
    wrong: "The key boundary is the event horizon. Once light or matter crosses inward, it cannot send a signal back to the outside universe.",
  },
  {
    q: 'Do black holes actively "suck in" everything in the galaxy like a vacuum cleaner?',
    options: [
      { label: 'Yes, they pull in everything nearby with unlimited range' },
      { label: 'No — their gravity works just like any mass, only stronger up close', correct: true },
    ],
    right: "A black hole's gravity follows the same rules as any other mass. If the Sun were replaced by a black hole of the same mass, Earth's orbit wouldn't change at all — you'd only notice something different very close in.",
    wrong: "Black hole gravity isn't special at a distance — it obeys the same physics as any mass. Objects only feel the extreme effects very close to the event horizon.",
  },
], {});
