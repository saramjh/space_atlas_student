// Reusable misconception-check quiz + click/keyboard-toggle card widgets.
// Used by every content page (not the home page, which predates this and
// keeps its own copies in interactions.js/moon-phases.js).

/**
 * @param {Array<{q:string, options:Array<{label:string, correct?:boolean}>, right:string, wrong:string}>} bank
 * @param {{question?:string, options?:string, feedback?:string, retry?:string}} [ids]
 */
export function initQuiz(bank, ids = {}) {
  const questionEl = document.querySelector(ids.question || '#quizQuestion');
  const optionsEl = document.querySelector(ids.options || '#quizOptions');
  const feedbackEl = document.querySelector(ids.feedback || '#quizFeedback');
  const retryEl = document.querySelector(ids.retry || '#quizRetry');
  if (!questionEl || !optionsEl || !feedbackEl || !retryEl) return;

  let index = 0;
  function render() {
    const item = bank[index];
    questionEl.innerHTML = item.q;
    feedbackEl.style.display = 'none';
    feedbackEl.innerHTML = '';
    retryEl.hidden = true;
    optionsEl.innerHTML = '';
    item.options.forEach((opt) => {
      const b = document.createElement('button');
      b.textContent = opt.label;
      b.dataset.correct = opt.correct ? '1' : '0';
      b.onclick = () => {
        optionsEl.querySelectorAll('button').forEach((bt) => {
          bt.disabled = true;
          if (bt.dataset.correct === '1') bt.classList.add('correct');
        });
        feedbackEl.style.display = 'block';
        if (opt.correct) {
          feedbackEl.innerHTML = `<span style="color:#2b663b;font-weight:600">✓ Correct!</span> ${item.right}`;
        } else {
          b.classList.add('wrong');
          feedbackEl.innerHTML = `<span style="color:#ad4327;font-weight:600">Think further:</span> ${item.wrong}`;
        }
        retryEl.hidden = false;
      };
      optionsEl.appendChild(b);
    });
  }
  retryEl.onclick = () => {
    index = (index + 1) % bank.length;
    render();
  };
  render();
}

/** Click/keyboard-toggle cards that reveal a `.truth-example`-style detail. */
export function initToggleCards(selector = '.truth') {
  document.querySelectorAll(selector).forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    const hint = card.querySelector('.truth-hint');
    const toggle = () => {
      const open = card.classList.toggle('open');
      if (hint) hint.textContent = open ? 'Hide example ▴' : 'Tap for an example ▾';
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}
