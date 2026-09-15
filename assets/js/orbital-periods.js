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
