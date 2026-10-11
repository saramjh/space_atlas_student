// Non-3D page interactions: scale lab, quiz, and truth-grid cards.
// Independent of scene.js — safe to edit without touching the 3D code.
import { SCALE_DATA, QUIZ_BANK } from './planet-data.js';
import { initQuiz } from './quiz-widget.js';

// Section 03: Scale Laboratory Interactive Inspector
const scaleFactBox = document.querySelector('#scaleFactBox');
const scaleItems = document.querySelectorAll('#scaleRow .planet-item');

scaleItems.forEach(item => {
  item.addEventListener('click', () => {
    scaleItems.forEach(el => { el.classList.remove('active'); el.setAttribute('aria-pressed', 'false'); });
    item.classList.add('active');
    item.setAttribute('aria-pressed', 'true');
    item.scrollIntoView({behavior:'auto', inline:'nearest', block:'nearest'});
    const idx = parseInt(item.dataset.idx, 10);
    const info = SCALE_DATA[idx];
    scaleFactBox.querySelector('strong').textContent =
      info.name + ' — ' + info.ratio + " Earth's Diameter (" + info.earths + ' Volume)';
    scaleFactBox.querySelector('span').textContent = info.detail;
  });
});

// Intuition Check Quiz — shared owner keeps behavior consistent.
initQuiz(QUIZ_BANK);

// Section 04 uses native <details>/<summary>; no JavaScript owner needed.
