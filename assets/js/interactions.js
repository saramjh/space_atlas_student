// Non-3D page interactions: scale lab, quiz, and truth-grid cards.
// Independent of scene.js — safe to edit without touching the 3D code.
import { SCALE_DATA, QUIZ_BANK } from './planet-data.js';

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

// Intuition Check Quiz — cycles through a small question bank
let quizIndex = 0;

const quizQuestion = document.querySelector('#quizQuestion');
const quizOptions = document.querySelector('#quizOptions');
const quizFeedback = document.querySelector('#quizFeedback');
const quizRetry = document.querySelector('#quizRetry');

function renderQuiz(){
  const item = QUIZ_BANK[quizIndex];
  quizQuestion.innerHTML = item.q;
  quizFeedback.style.display = 'none';
  quizFeedback.innerHTML = '';
  quizRetry.hidden = true;
  quizOptions.innerHTML = '';
  item.options.forEach(opt => {
    const b = document.createElement('button');
    b.textContent = opt.label;
    b.dataset.correct = opt.correct ? '1' : '0';
    b.onclick = () => {
      const buttons = quizOptions.querySelectorAll('button');
      buttons.forEach(bt => {
        bt.disabled = true;
        if(bt.dataset.correct === '1') bt.classList.add('correct');
      });
      quizFeedback.style.display = 'block';
      if(opt.correct){
        quizFeedback.innerHTML = `<span style="color:#2b663b;font-weight:600">✓ Correct!</span> ${item.right}`;
      } else {
        b.classList.add('wrong');
        quizFeedback.innerHTML = `<span style="color:#ad4327;font-weight:600">Think further:</span> ${item.wrong}`;
      }
      quizRetry.hidden = false;
    };
    quizOptions.appendChild(b);
  });
}

quizRetry.onclick = () => {
  quizIndex = (quizIndex + 1) % QUIZ_BANK.length;
  renderQuiz();
};

renderQuiz();

// Section 04: Truth-grid cards toggle an example on click/keyboard
document.querySelectorAll('.truth').forEach(card => {
  card.setAttribute('tabindex','0');
  card.setAttribute('role','button');
  const hint = card.querySelector('.truth-hint');
  const toggle = () => {
    const open = card.classList.toggle('open');
    if(hint) hint.textContent = open ? 'Hide example ▴' : 'Tap for an example ▾';
  };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
  });
});
