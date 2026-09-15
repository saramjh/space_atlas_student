import { initQuiz } from './quiz-widget.js';

const picker = document.querySelector('#lyPicker');
const readout = document.querySelector('#lyReadout');
const NOW_YEAR = new Date().getFullYear();

function describe(ly, label) {
  const seconds = ly * 365.25 * 24 * 3600;
  if (seconds < 60) {
    return `<div class="big">${seconds.toFixed(1)} seconds</div><p>Light from ${label} takes about ${seconds.toFixed(1)} seconds to reach Earth. You are seeing it almost exactly as it is right now.</p>`;
  }
  if (seconds < 3600) {
    const min = seconds / 60;
    return `<div class="big">${min.toFixed(1)} minutes</div><p>Light from ${label} takes about ${min.toFixed(1)} minutes to reach Earth.</p>`;
  }
  if (seconds < 86400) {
    const hrs = seconds / 3600;
    return `<div class="big">${hrs.toFixed(1)} hours</div><p>Light from ${label} takes about ${hrs.toFixed(1)} hours to reach Earth.</p>`;
  }
  const yearsAgo = ly; // 1 light-year of distance = light left 1 year ago
  const yearLeft = Math.round(NOW_YEAR - yearsAgo);
  const yearsAgoStr = yearsAgo >= 1000
    ? yearsAgo.toLocaleString()
    : (Number.isInteger(yearsAgo) ? String(yearsAgo) : yearsAgo.toFixed(2));
  const leftStr = yearsAgo >= 1000
    ? `about ${yearsAgoStr} years ago`
    : `around the year ${yearLeft}`;
  return `<div class="big">${yearsAgoStr} light-years</div><p>The light from ${label} reaching your eyes right now left ${leftStr}. Looking at something far away means looking into the past.</p>`;
}

picker.querySelectorAll('button').forEach((btn) => {
  btn.onclick = () => {
    picker.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    readout.innerHTML = describe(Number(btn.dataset.ly), btn.textContent);
  };
});

const initial = picker.querySelector('button.active') || picker.querySelector('button');
readout.innerHTML = describe(Number(initial.dataset.ly), initial.textContent);

initQuiz([
  {
    q: 'A light-year measures...',
    options: [
      { label: 'Time — how long a year takes' },
      { label: 'Distance — how far light travels in one year', correct: true },
      { label: 'The brightness of a star' },
      { label: 'How fast a planet orbits' },
    ],
    right: "Despite the word \"year,\" a light-year is a unit of distance — about 9.46 trillion km, the distance light travels in one Earth year.",
    wrong: 'It measures distance, not time — the distance light travels in one year (about 9.46 trillion km), even though the name sounds like a time unit.',
  },
  {
    q: 'If a star is 100 light-years away, when did the light you see tonight leave it?',
    options: [
      { label: 'Right now' },
      { label: 'About 100 years ago', correct: true },
      { label: 'About 100 days ago' },
      { label: 'It has not left yet' },
    ],
    right: "Light takes 100 years to cross 100 light-years, so you're seeing that star as it looked about 100 years ago — not as it looks right now.",
    wrong: "Light travels at a fixed speed, so crossing 100 light-years takes 100 years — you're seeing light that left about a century ago.",
  },
], {});
