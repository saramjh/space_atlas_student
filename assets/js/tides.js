import { initQuiz } from './quiz-widget.js';

const btnSpring = document.querySelector('#btnSpring');
const btnNeap = document.querySelector('#btnNeap');
const springPanel = document.querySelector('#springPanel');
const neapPanel = document.querySelector('#neapPanel');

function setMode(spring) {
  btnSpring.classList.toggle('active', spring);
  btnNeap.classList.toggle('active', !spring);
  springPanel.classList.toggle('active', spring);
  neapPanel.classList.toggle('active', !spring);
}
// Optional equilibrium tide illustration (NOT local tide prediction).
// Lunar and solar quadrupole terms: fixed illustrative amplitude ratio ~2:1,
// consistent with NOAA's statement that solar tide-raising force is ~half lunar.
const tideAngle = document.querySelector('#tideAngle');
const tideShape = document.querySelector('#tideBulgeShape');
const tideMoon = document.querySelector('#tideMoonMarker');
const tideMoonLabel = document.querySelector('#tideMoonText');
const tideReadout = document.querySelector('#tideModelReadout');
const tidePresets = [...document.querySelectorAll('[data-tide-angle]')];
const DEG = Math.PI / 180;
const LUNAR = 12, SOLAR = 6;
function equilibriumContour(angleDegrees) {
  const angle = angleDegrees * DEG;
  const points = [];
  for (let i = 0; i <= 144; i++) {
    const theta = 2 * Math.PI * i / 144;
    // Heavily exaggerated radius, no physical tide-height calibration.
    const r = 70 + LUNAR * Math.cos(2 * (theta - angle)) + SOLAR * Math.cos(2 * theta);
    points.push(`${i === 0 ? 'M' : 'L'} ${(200 + r * Math.cos(theta)).toFixed(2)} ${(132 - r * Math.sin(theta)).toFixed(2)}`);
  }
  return points.join(' ') + ' Z';
}
function setTideAngle(degrees) {
  const angle = Math.min(90, Math.max(0, Number(degrees) || 0));
  tideAngle.value = String(angle);
  tideShape.setAttribute('d', equilibriumContour(angle));
  const x = 200 + 115 * Math.cos(angle * DEG);
  const y = 132 - 115 * Math.sin(angle * DEG);
  tideMoon.setAttribute('cx', x.toFixed(2));
  tideMoon.setAttribute('cy', y.toFixed(2));
  tideMoonLabel.setAttribute('x', x.toFixed(2));
  tideMoonLabel.setAttribute('y', (y + 22).toFixed(2));
  tidePresets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.tideAngle) === angle)));
  const relative = 100 * Math.hypot(SOLAR + LUNAR * Math.cos(2 * angle * DEG), LUNAR * Math.sin(2 * angle * DEG)) / (SOLAR + LUNAR);
  const state = angle === 0 ? 'Spring pattern: aligned contributions reinforce.' :
    angle === 90 ? 'Neap pattern: perpendicular contributions partially oppose.' :
    'Intermediate alignment: the strength and orientation of the idealized pattern change.';
  tideReadout.textContent = `${angle}° — ${state} Illustrative combined forcing contrast: ${Math.round(relative)}% of this model’s aligned case, not real water height.`;
  if (angle === 0) setMode(true);
  if (angle === 90) setMode(false);
}
btnSpring.onclick = () => setTideAngle(0);
btnNeap.onclick = () => setTideAngle(90);
tideAngle?.addEventListener('input', () => setTideAngle(tideAngle.value));
tidePresets.forEach(button => button.addEventListener('click', () => setTideAngle(button.dataset.tideAngle)));
if (tideAngle && tideShape) setTideAngle(0);

initQuiz([
  {
    q: 'Why do most coastlines get roughly two high tides a day, not one?',
    options: [
      { label: 'The Moon orbits Earth twice a day' },
      { label: 'Earth has tidal bulges on both the near and far side from the Moon, and rotates through both', correct: true },
      { label: 'The Sun causes a separate, extra tide' },
      { label: 'It is random and unpredictable' },
    ],
    right: "Gravity stretches Earth's oceans into two bulges — one on the side facing the Moon, one on the far side. As Earth spins once a day, most locations rotate through both.",
    wrong: "It comes from two tidal bulges — one facing the Moon, one on the opposite side — and Earth's daily rotation carries most coastlines through both.",
  },
  {
    q: 'When do spring tides (the strongest tides) happen?',
    options: [
      { label: 'Only in the spring season' },
      { label: 'At new moon and full moon, when the Sun and Moon align', correct: true },
      { label: 'At first and last quarter moon' },
      { label: 'Randomly, with no pattern' },
    ],
    right: "\"Spring\" here means \"jump up,\" not the season. It happens at new moon and full moon, when the Sun and Moon line up and their tidal pulls add together.",
    wrong: "Despite the name, it's not about the season — spring tides happen at new moon and full moon, when the Sun and Moon align and their pulls combine.",
  },
], {});
