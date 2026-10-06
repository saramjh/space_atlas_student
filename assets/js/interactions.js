// Non-3D page interactions: scale lab, quiz, and truth-grid cards.
// Independent of scene.js — safe to edit without touching the 3D code.
import { SCALE_DATA, QUIZ_BANK } from './planet-data.js';
import { initQuiz, initToggleCards } from './quiz-widget.js';

// Section 03: Scale Laboratory Interactive Inspector
const scaleFactBox = document.querySelector('#scaleFactBox');
const scaleItems = document.querySelectorAll('#scaleRow .planet-item');

scaleItems.forEach(item => {
  item.addEventListener('click', () => {
    scaleItems.forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    item.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
    const idx = parseInt(item.dataset.idx, 10);
    const info = SCALE_DATA[idx];
    scaleFactBox.innerHTML = `
      <strong>${info.name} — ${info.ratio} Earth's Diameter (${info.earths} Volume)</strong>
      <span>${info.detail}</span>
    `;
  });
});

// Intuition Check Quiz — shared owner keeps behavior consistent.
initQuiz(QUIZ_BANK);

// Section 04: Truth-grid cards use the shared keyboard/click owner.
initToggleCards('.truth');
