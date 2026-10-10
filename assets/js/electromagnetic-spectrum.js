import { initQuiz } from './quiz-widget.js';

// Approximate band limits: NASA Imagine the Universe, spectrum_chart.html.
// There are no sharp physical boundaries between named wavelength regions.
const BANDS = [
  { name: 'Radio', min: 1e-1, max: Infinity, desc: 'Longest wavelengths. Radio telescopes reveal cool hydrogen gas, pulsars, and synchrotron emission. The cosmic microwave background is in the microwave region.' },
  { name: 'Microwave', min: 1e-3, max: 1e-1, desc: 'The cosmic microwave background is the oldest electromagnetic light we can directly observe, released when the universe became transparent about 380,000 years after the Big Bang.' },
  { name: 'Infrared', min: 7e-7, max: 1e-3, desc: 'Infrared observations can reveal cool objects and stars forming in dusty clouds. The James Webb Space Telescope studies infrared light.' },
  { name: 'Visible', min: 4e-7, max: 7e-7, desc: 'Visible light, approximately 400–700 nm, is the narrow part of the spectrum detectable by human eyes.' },
  { name: 'Ultraviolet', min: 1e-8, max: 4e-7, desc: 'Ultraviolet observations trace hot stars and active solar regions. Earth’s atmosphere absorbs much of this radiation.' },
  { name: 'X-ray', min: 1e-11, max: 1e-8, desc: 'X-ray telescopes reveal extremely hot gas, supernova remnants, and matter near compact objects, including black holes.' },
  { name: 'Gamma ray', min: 0, max: 1e-11, desc: 'Gamma-ray observations study some of the most energetic events, including gamma-ray bursts and processes near neutron stars and black holes.' },
];

const C = 299792458; // Exact SI speed of light in vacuum (m/s).
const H = 6.62607015e-34; // Exact SI Planck constant (J s).
const EV = 1.602176634e-19; // Exact SI elementary charge (C).
const slider = document.querySelector('#spectrumSlider');
const cursor = document.querySelector('#spectrumCursor');
const bandEl = document.querySelector('#spectrumBand');
const descEl = document.querySelector('#spectrumDesc');
const wave = document.querySelector('#spectrumWave');
const waveToggle = document.querySelector('#spectrumWaveToggle');
const buttons = [...document.querySelectorAll('[data-spectrum-sample]')];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

const short = (number) => Number(number.toPrecision(3)).toString();
const formatWavelength = (meters) => {
  const units = [[1, 'm'], [1e-2, 'cm'], [1e-3, 'mm'], [1e-6, 'µm'], [1e-9, 'nm'], [1e-12, 'pm']];
  const [scale, unit] = units.find(([scale]) => meters >= scale) || [1e-12, 'pm'];
  return `${short(meters / scale)} ${unit}`;
};
const formatFrequency = (hz) => {
  const units = [[1e21, 'ZHz'], [1e18, 'EHz'], [1e15, 'PHz'], [1e12, 'THz'], [1e9, 'GHz'], [1e6, 'MHz'], [1e3, 'kHz'], [1, 'Hz']];
  const [scale, unit] = units.find(([scale]) => hz >= scale);
  return `${short(hz / scale)} ${unit}`;
};
const formatEnergy = (ev) => {
  const units = [[1e9, 'GeV'], [1e6, 'MeV'], [1e3, 'keV'], [1, 'eV'], [1e-3, 'meV'], [1e-6, 'µeV'], [1e-9, 'neV']];
  const found = units.find(([scale]) => ev >= scale);
  return found ? `${short(ev / found[0])} ${found[1]}` : `${short(ev / 1e-12)} peV`;
};

let cycles = 10;
let phase = 0;
let frame = 0;
let lastFrame = 0;
let playing = false;

// This waveform shows direction-of-change, not proportional wavelengths.
// The accurate 14-order-of-magnitude relationship is in the log ruler and readouts.
function drawWave() {
  const pts = [];
  for (let x = 0; x <= 640; x += 4) {
    const y = 55 - 33 * Math.sin(2 * Math.PI * cycles * x / 640 - phase);
    pts.push(`${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(2)}`);
  }
  wave.setAttribute('d', pts.join(' '));
}

function stopMotion() {
  playing = false;
  cancelAnimationFrame(frame);
  frame = 0;
  waveToggle.textContent = 'Play motion';
  waveToggle.setAttribute('aria-pressed', 'false');
}

function tick(time) {
  if (!playing) return;
  if (document.hidden || motionPreference.matches) {
    stopMotion();
    return;
  }
  if (time - lastFrame >= 33) {
    phase = (phase + (time - lastFrame > 250 ? 0.12 : (time - lastFrame) / 1000 * 4)) % (2 * Math.PI);
    drawWave();
    lastFrame = time;
  }
  frame = requestAnimationFrame(tick);
}

function render() {
  // Slider 0..1400 maps 10^1..10^-13 metres, left to right.
  const position = Number(slider.value);
  const meters = 10 ** (1 - position / 100);
  const frequency = C / meters;
  const energy = H * frequency / EV;
  const band = BANDS.find((entry) => meters >= entry.min && meters < entry.max) || BANDS[BANDS.length - 1];

  bandEl.textContent = band.name === 'Visible' ? 'Visible light' : band.name;
  descEl.textContent = band.desc;
  document.querySelector('#spectrumWavelength').textContent = formatWavelength(meters);
  document.querySelector('#spectrumFrequency').textContent = formatFrequency(frequency);
  document.querySelector('#spectrumEnergy').textContent = formatEnergy(energy);
  slider.setAttribute('aria-valuetext', `${formatWavelength(meters)}, ${band.name}, ${formatFrequency(frequency)}`);
  cursor.style.left = `${position / 14}%`;
  buttons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.textContent.trim() === band.name || (btn.textContent.trim() === 'UV' && band.name === 'Ultraviolet') || (btn.textContent.trim() === 'Gamma' && band.name === 'Gamma ray'))));

  cycles = 2 + position / 1400 * 18;
  drawWave();
}

slider.addEventListener('input', render);
buttons.forEach((button) => button.addEventListener('click', () => {
  const meters = Number(button.dataset.spectrumSample);
  slider.value = String(Math.round((1 - Math.log10(meters)) * 100));
  render();
}));
waveToggle.addEventListener('click', () => {
  if (playing) {
    stopMotion();
  } else if (!motionPreference.matches) {
    playing = true;
    waveToggle.textContent = 'Pause motion';
    waveToggle.setAttribute('aria-pressed', 'true');
    lastFrame = performance.now();
    frame = requestAnimationFrame(tick);
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stopMotion(); });
function syncMotionPreference() {
  if (motionPreference.matches) stopMotion();
  waveToggle.disabled = motionPreference.matches;
  waveToggle.title = motionPreference.matches ? 'Motion is disabled by your reduced-motion setting' : '';
}
motionPreference.addEventListener('change', syncMotionPreference);
syncMotionPreference();
render();

initQuiz([
  {
    q: 'How much of the electromagnetic spectrum can human eyes detect?',
    options: [
      { label: 'All of it' },
      { label: 'About half of it' },
      { label: 'A narrow sliver called "visible light"', correct: true },
      { label: 'None of it — we need instruments for everything' },
    ],
    right: 'Visible light is a narrow band in a spectrum that stretches from long radio waves to extremely short gamma rays.',
    wrong: 'Human eyes only detect visible light, approximately 400–700 nm. The full electromagnetic spectrum extends far beyond both ends.',
  },
  {
    q: 'Why do telescopes like JWST and Chandra observe from space?',
    options: [
      { label: 'Space telescopes are cheaper to build' },
      { label: "Earth's atmosphere blocks much of the spectrum, including most infrared, X-ray, and gamma-ray light", correct: true },
      { label: 'There is no reason; it is just tradition' },
      { label: 'Ground telescopes cannot use visible light' },
    ],
    right: 'Our atmosphere absorbs much of the electromagnetic spectrum. Space telescopes can observe wavelengths that are blocked from the ground.',
    wrong: 'The atmosphere filters out most X-rays, gamma rays, and many infrared and ultraviolet wavelengths.',
  },
], {});
