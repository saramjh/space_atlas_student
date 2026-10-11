import { PLANETS } from './planet-data.js';
import { initQuiz } from './quiz-widget.js';

const ageInput = document.querySelector('#ageInput');
const grid = document.querySelector('#ageGrid');
const ladder = document.querySelector('#periodLadder');

function formatPeriod(days) {
  if (days < 365) return `${Math.round(days)} Earth days`;
  return `${(days / 365.25).toFixed(1)} Earth years`;
}

function render() {
  const earthAge = Number(ageInput.value) || 0;
  const earthDays = earthAge * 365.25;
  grid.innerHTML = PLANETS.map((p) => {
    const ageOnPlanet = earthDays / p.periodDays;
    const isEarth = p.name === 'Earth';
    return `<div class="weight-cell${isEarth ? ' you' : ''}"><div class="planet">${p.name}</div><div class="val">${ageOnPlanet.toFixed(ageOnPlanet < 10 ? 1 : 0)}</div><div class="sub">${p.name} years old</div></div>`;
  }).join('');
}

ladder.innerHTML = PLANETS.map((p) => `<li><b>${formatPeriod(p.periodDays)}</b><span>${p.name}'s orbital period (one "year")</span></li>`).join('');

ageInput.addEventListener('input', render);
render();

// A meaningful view of WHY years differ, not just a second age calculator.
// For Sun-orbiting planets in AU and Earth years, T² ~= a³ (two-body limit).
// A logarithmic plot keeps Mercury and Neptune readable on one graph.
const keplerLab = document.querySelector('#keplerLawLab');
if (keplerLab) {
  const select = keplerLab.querySelector('#keplerPlanetSelect');
  const dot = keplerLab.querySelector('#keplerPlanetDot');
  const curve = keplerLab.querySelector('#keplerCurve');
  const readout = keplerLab.querySelector('#keplerReadout');
  const A_MIN = .3, A_MAX = 35, T_MIN = .1, T_MAX = 220;
  const logFraction = (v, min, max) =>
    (Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
  const plotX = a => 60 + 430 * logFraction(a, A_MIN, A_MAX);
  const plotY = t => 270 - 255 * logFraction(t, T_MIN, T_MAX);
  // Keep the curve inside the plotted axes; no animated orbits are implied.
  curve.setAttribute('d', Array.from({length: 120}, (_, i) => {
    const semiMajor = A_MIN * Math.pow(A_MAX / A_MIN, i / 119);
    const years = Math.sqrt(semiMajor ** 3);
    return `${i ? 'L' : 'M'} ${plotX(semiMajor).toFixed(2)} ${plotY(years).toFixed(2)}`;
  }).join(' '));

  function selectPlanet(name) {
    const p = PLANETS.find(planet => planet.name === name);
    if (!p) return;
    const au = Number.parseFloat(p.au);
    const actualYears = p.periodDays / 365.25;
    const predictedYears = Math.sqrt(au ** 3);
    dot.setAttribute('cx', plotX(au).toFixed(2));
    dot.setAttribute('cy', plotY(actualYears).toFixed(2));
    // Keep the selected marker in view when the 520-unit plot scrolls inside
    // a narrow screen. Only move this internal chart, never the document.
    const graphScroller = keplerLab.querySelector('.kepler-chart-scroll');
    const graph = keplerLab.querySelector('.kepler-law-chart');
    if (graphScroller && graph && graphScroller.scrollWidth > graphScroller.clientWidth) {
      const markerPx = plotX(au) / 520 * graph.getBoundingClientRect().width;
      graphScroller.scrollLeft = Math.max(0, markerPx - graphScroller.clientWidth / 2);
    }
    const fmtYears = y => y < 1 ? y.toFixed(3) : y.toFixed(2);
    readout.textContent = `${p.name}: semi-major axis ≈ ${au.toFixed(2)} AU. `
      + `NASA orbital period ≈ ${fmtYears(actualYears)} Earth years; `
      + `Kepler's idealized prediction √(a³) ≈ ${fmtYears(predictedYears)} Earth years. `
      + 'Small differences reflect input rounding and model simplifications.';
  }
  select.addEventListener('change', () => selectPlanet(select.value));
  selectPlanet(select.value);
}

initQuiz([
  {
    q: 'Why is a "year" on Neptune so much longer than a year on Earth?',
    options: [
      { label: 'Neptune spins slower' },
      { label: 'Neptune is much farther from the Sun, so its orbit is much longer', correct: true },
      { label: 'Neptune is bigger' },
      { label: 'There is no real reason' },
    ],
    right: "Neptune orbits about 30× farther from the Sun than Earth does, so its orbital path is far longer — and it also moves more slowly, per Kepler's laws. Both effects combine to make its year about 165 Earth years.",
    wrong: "It comes down to distance: Neptune's orbit is far larger, and planets farther out also move slower — together that stretches its \"year\" to about 165 Earth years.",
  },
  {
    q: 'A "day" and a "year" measure two different things. A year measures...',
    options: [
      { label: 'One full spin of a planet on its axis' },
      { label: 'One full orbit of a planet around the Sun', correct: true },
      { label: 'The time between sunrise and sunset' },
      { label: 'The same thing as a day, just longer' },
    ],
    right: 'A day is one spin on the axis; a year is one full trip around the Sun. They are set by completely different motions, which is why some planets (like Venus) actually have a day longer than their year.',
    wrong: "A year is one complete orbit around the Sun — a separate motion from a planet's spin (which sets the length of a day).",
  },
], {});
