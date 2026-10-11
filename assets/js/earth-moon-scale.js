import { initQuiz } from './quiz-widget.js';

// The scale strip is wider than the viewport by design (that's the point —
// feeling how far away the Moon really is), but a wide scrollable box with
// no visible content past the edge doesn't read as scrollable on its own.
// Fade the right edge and hide the "scroll" cue once the user has started.
const scrollEl = document.querySelector('#emscaleScroll');
const fadeEl = document.querySelector('#emscaleFade');
const cueEl = document.querySelector('#emscaleCue');
// One shared scale for both body diameters and center-to-center separation.
// Mean orbital dimensions: NASA Moon Facts and GSFC Moon Fact Sheet.
// Earth equatorial diameter: 12,756 km = 60 px; Moon mean diameter: ~3,474 km = 16.34 px.
const EARTH_DIAMETER_KM = 12756;
const EARTH_DIAMETER_PX = 60;
const MOON_DIAMETER_PX = 16;
const EARTH_CENTER_PX = EARTH_DIAMETER_PX / 2;
const MOON_RADIUS_PX = MOON_DIAMETER_PX / 2;
const kilometersPerPixel = EARTH_DIAMETER_KM / EARTH_DIAMETER_PX;
const moon = document.querySelector('#emscaleMoon');
const moonLabel = document.querySelector('#emscaleMoonLabel');
const readout = document.querySelector('#emscaleDistanceReadout');
const distancePresets = [...document.querySelectorAll('[data-emscale-distance]')];
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
function moonLeftAt(distanceKm) {
  return EARTH_CENTER_PX + distanceKm / kilometersPerPixel - MOON_RADIUS_PX;
}
function selectDistance(distanceKm) {
  const moonLeft = moonLeftAt(distanceKm);
  moon.style.left = `${moonLeft}px`;
  moonLabel.style.left = `${moonLeft}px`;
  const centerGapInEarths = distanceKm / EARTH_DIAMETER_KM;
  const label = distanceKm === 384400 ? 'Mean' : distanceKm < 384400 ? 'Closer' : 'Farther';
  readout.textContent = `${label} center-to-center distance: ${distanceKm.toLocaleString('en-US')} km (${centerGapInEarths.toFixed(2)} Earth diameters). One pixel ≈ ${Math.round(kilometersPerPixel)} km. Neither body is enlarged.`;
  distancePresets.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.emscaleDistance) === distanceKm)));
}
distancePresets.forEach((button) => button.addEventListener('click', () => selectDistance(Number(button.dataset.emscaleDistance))));
selectDistance(384400);

function navigateTo(body) {
  const target = body === 'moon' ? Math.max(0, moon.offsetLeft - scrollEl.clientWidth / 2 + MOON_RADIUS_PX) : 0;
  scrollEl.scrollTo({ left: target, behavior: motionReduced.matches ? 'instant' : 'smooth' });
}
document.querySelector('#emscaleToEarth').addEventListener('click', () => navigateTo('earth'));
document.querySelector('#emscaleToMoon').addEventListener('click', () => navigateTo('moon'));
if (scrollEl.scrollWidth <= scrollEl.clientWidth + 2) {
  fadeEl.classList.add('hidden');
  cueEl.classList.add('hidden');
} else {
  scrollEl.addEventListener('scroll', () => {
    fadeEl.classList.add('hidden');
    cueEl.classList.add('hidden');
  }, { once: true });
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
