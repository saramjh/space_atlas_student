// Teacher-led Claim–Evidence–Reasoning (CER) opener. The core answer stays
// available in native <details> when JavaScript or WebGL is unavailable.
const CHOICES = Object.freeze({ quarter: 'one-quarter', half: 'half', full: 'all' });

export function evaluateMoonPrediction(value) {
  if (!Object.hasOwn(CHOICES, value)) {
    return { valid: false, correct: false, angle: 90, feedback: 'Select one Moon drawing before checking your prediction.' };
  }
  return {
    valid: true,
    correct: value === 'half',
    angle: 90,
    feedback: (value === 'half' ? 'Your prediction matches the model. ' : `You predicted ${CHOICES[value]} illuminated. Compare the model: `) +
      'At First Quarter, about half the Moon’s visible disk is sunlit. “Quarter” means about a quarter of the way through the cycle, not one-quarter illuminated.',
  };
}

export function initMoonCerActivity(onCheck) {
  const root = document.querySelector('#moonCerPrediction');
  const button = document.querySelector('#moonCerCheck');
  const feedback = document.querySelector('#moonCerFeedback');
  if (!root || !button || !feedback) return;
  button.addEventListener('click', () => {
    const checked = root.querySelector('input[name="cerMoonPrediction"]:checked');
    const result = evaluateMoonPrediction(checked?.value);
    feedback.textContent = result.feedback;
    if (!result.valid) {
      root.querySelector('input[name="cerMoonPrediction"]')?.focus();
      return;
    }
    // Explicit student action changes the existing simulator; never auto-run.
    if (typeof onCheck === 'function') onCheck(result.angle);
  });
}
