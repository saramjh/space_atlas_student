import { initQuiz } from './quiz-widget.js';

// The scale strip is wider than the viewport by design (that's the point —
// feeling how far away the Moon really is), but a wide scrollable box with
// no visible content past the edge doesn't read as scrollable on its own.
// Fade the right edge and hide the "scroll" cue once the user has started.
const scrollEl = document.querySelector('#emscaleScroll');
const fadeEl = document.querySelector('#emscaleFade');
const cueEl = document.querySelector('#emscaleCue');
if (scrollEl && scrollEl.scrollWidth <= scrollEl.clientWidth + 2) {
  fadeEl.classList.add('hidden');
  cueEl.classList.add('hidden');
} else {
  scrollEl.addEventListener(
    'scroll',
    () => {
      fadeEl.classList.add('hidden');
      cueEl.classList.add('hidden');
    },
    { once: true }
  );
}

initQuiz([
  {
    q: "Why can the Earth-Moon system be shown accurately for both size and distance, when the full solar system can't?",
    options: [
      { label: 'The Moon is not actually that far from Earth' },
      { label: "The size difference and distance are both small enough to fit on one readable diagram", correct: true },
      { label: 'It actually can\'t — this page also compresses something' },
      { label: 'Because the Moon has no size at all' },
    ],
    right: "The Earth-Moon gap (about 30 Earth-diameters) is small enough, and the size difference moderate enough, that both fit on one scrollable strip — unlike the solar system, where Neptune is 30 AU away and Jupiter is 11x Earth's diameter, at scales that don't fit together at all.",
    wrong: "It comes down to the numbers being small enough: about 30 Earth-diameters of distance and a 27% size ratio both fit on one diagram, unlike the solar system's far larger range of scales.",
  },
  {
    q: 'Roughly how many Earth-diameters could fit between Earth and the Moon?',
    options: [
      { label: 'About 3' },
      { label: 'About 30', correct: true },
      { label: 'About 300' },
      { label: 'Less than 1' },
    ],
    right: 'About 30 Earth-diameters — the Moon is roughly 384,400 km away, and Earth is about 12,756 km across.',
    wrong: "It's about 30 Earth-diameters — Earth is about 12,756 km across, and the Moon sits about 384,400 km away.",
  },
], {});
