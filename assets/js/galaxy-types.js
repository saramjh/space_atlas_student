import { initQuiz } from './quiz-widget.js';


// Geometric sky projection of a conceptual face-on spiral disc, not a new
// galaxy type, 3D reconstruction, observed pixels or classification tool.
const incline = document.querySelector('#galaxyInclination');
const disk = document.querySelector('#galaxyTiltDisk');
const readout = document.querySelector('#galaxyAngleOutput');
const presets = [...document.querySelectorAll('[data-galaxy-angle]')];
function setInclination(angle) {
  const deg = Math.max(0, Math.min(80, Number(angle) || 0));
  const apparentMinorMajor = Math.cos(deg * Math.PI / 180);
  incline.value = String(deg);
  disk.setAttribute('transform', `translate(160 110) scale(1 ${apparentMinorMajor.toFixed(4)}) translate(-160 -110)`);
  const mode = deg === 0 ? 'Face-on: curved arms are clearly visible.' :
               deg >= 70 ? 'Nearly edge-on: projection hides much of the spiral pattern.' :
               'Inclined: arms look flattened by the viewing angle.';
  readout.textContent = `${deg}° · projected thin-disk axis ratio ≈ ${apparentMinorMajor.toFixed(2)}. ${mode} The galaxy itself did not change type.`;
  presets.forEach(btn => btn.setAttribute('aria-pressed', String(Number(btn.dataset.galaxyAngle) === deg)));
}
incline?.addEventListener('input', () => setInclination(incline.value));
presets.forEach(btn => btn.addEventListener('click', () => setInclination(btn.dataset.galaxyAngle)));
if (incline && disk) setInclination(0);

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
