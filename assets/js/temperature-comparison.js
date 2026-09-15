import { PLANETS } from './planet-data.js';
import { initQuiz } from './quiz-widget.js';

const chart = document.querySelector('#tempChart');
const maxAbs = Math.max(...PLANETS.map((p) => Math.abs(p.tempC)));

chart.innerHTML = PLANETS.map((p) => {
  const heightPct = (Math.abs(p.tempC) / maxAbs) * 100;
  const color = p.tempC >= 0 ? '#bd4c2f' : '#3e6f91';
  return `
    <div class="temp-bar-col">
      <div class="temp-bar" style="height:${heightPct}%;background:${color}">
        <div class="temp-val">${p.tempC > 0 ? '+' : ''}${p.tempC}°C</div>
      </div>
      <div class="name">${p.name}</div>
    </div>`;
}).join('');

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
