import { PLANETS } from './planet-data.js';
import { initQuiz } from './quiz-widget.js';

const chart = document.querySelector('#tempChart');
const first = document.querySelector('#tempCompareA');
const second = document.querySelector('#tempCompareB');
const explanation = document.querySelector('#tempCompareReadout');
// NASA 2022 illustrative means, linear signed scale; 1-bar atmospheres for giants.
const MIN_C = -250, MAX_C = 500;
const fraction = c => 100 * (c - MIN_C) / (MAX_C - MIN_C);
const formatC = c => `${c > 0 ? '+' : c === 0 ? '' : '−'}${Math.abs(c)}°C`;
const planetByName = name => PLANETS.find(p => p.name === name);
const category = p => PLANETS.indexOf(p) < 4 ? 'rocky surface mean' : 'atmosphere at ~1 bar';

function renderTemperatures() {
  const a = planetByName(first.value);
  const b = planetByName(second.value);
  if (!a || !b) return;
  chart.innerHTML = PLANETS.map(p => {
    const start = Math.min(fraction(0), fraction(p.tempC));
    const width = Math.abs(fraction(p.tempC) - fraction(0));
    const highlighted = p === a || p === b;
    return `<div class="temp-row${highlighted ? ' selected' : ''}">
      <span class="temp-name">${p.name}</span>
      <div class="temp-plot" aria-hidden="true"><div class="temp-zero"></div>
        <div class="temp-extent ${p.tempC >= 0 ? 'warm' : 'cold'}" style="left:${start.toFixed(4)}%;width:${width.toFixed(4)}%"></div>
      </div>
      <span class="temp-number">${formatC(p.tempC)}</span>
    </div>`;
  }).join('');
  if (a === b) {
    explanation.textContent = `${a.name}: ${formatC(a.tempC)}. This is a NASA ${category(a)}; select another planet to compare.`;
  } else {
    const warmer = a.tempC >= b.tempC ? a : b;
    const cooler = warmer === a ? b : a;
    const difference = Math.abs(a.tempC - b.tempC);
    explanation.textContent = `${warmer.name} (${formatC(warmer.tempC)}) is ${difference}°C warmer than ${cooler.name} (${formatC(cooler.tempC)}). References: ${a.name} — ${category(a)}; ${b.name} — ${category(b)}. These are not equivalent surface conditions.`;
  }
}
first?.addEventListener('change', renderTemperatures);
second?.addEventListener('change', renderTemperatures);
if (chart && first && second) renderTemperatures();

initQuiz([
  {
    q: 'Which planet has the hottest average surface temperature?',
    options: [
      { label: 'Mercury (closest to the Sun)' },
      { label: 'Venus', correct: true },
      { label: 'Mars' },
      { label: 'Jupiter' },
    ],
    right: "Venus, at about 464°C — hotter than Mercury despite being farther from the Sun. Its thick CO₂ atmosphere traps heat in a runaway greenhouse effect.",
    wrong: "It's Venus, at about 464°C, even though Mercury is closer to the Sun. Venus's thick CO₂ atmosphere traps far more heat.",
  },
  {
    q: 'What mainly explains Venus being hotter than Mercury?',
    options: [
      { label: 'Venus is bigger' },
      { label: "Venus's atmosphere traps heat far more effectively", correct: true },
      { label: 'Venus is actually closer to the Sun' },
      { label: 'Venus spins faster' },
    ],
    right: "Venus's atmosphere — about 96% CO₂ and roughly 90× thicker than Earth's — creates a runaway greenhouse effect. Mercury has almost no atmosphere to trap any heat at all.",
    wrong: "It's the atmosphere: Venus's thick CO₂ blanket traps heat in a runaway greenhouse effect, while airless Mercury can't hold onto any heat despite being closer to the Sun.",
  },
], {});
