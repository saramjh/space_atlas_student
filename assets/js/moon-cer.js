// Teacher-led CER: a pupil's hypothesis must never be mistaken for the
// measured/modelled First Quarter observation (always 50% at 90 degrees).
// The core scientific explanation stays readable without JavaScript.
const CHOICES = Object.freeze({
  quarter: Object.freeze({ percent: 25, label: 'one quarter' }),
  half: Object.freeze({ percent: 50, label: 'one half' }),
  full: Object.freeze({ percent: 100, label: 'the whole disk' }),
});

export function evaluateMoonPrediction(value) {
  if (!Object.hasOwn(CHOICES, value)) {
    return {
      valid: false, correct: false, angle: 90, predictedPercent: null,
      observedPercent: 50,
      feedback: 'Select a prediction first. The model will show actual First Quarter, not a simulated version of your guess.',
    };
  }
  const predictedPercent = CHOICES[value].percent;
  const correct = predictedPercent === 50;
  return {
    valid: true, correct, angle: 90, predictedPercent, observedPercent: 50,
    feedback: 'You predicted ' + predictedPercent + '% bright. Actual First Quarter is 50% bright. ' +
      (correct
        ? 'Your prediction matches the observation. '
        : 'Your prediction and the observation are different. ') +
      'At First Quarter, half of the visible Moon disk is illuminated. “Quarter” refers to one quarter of the lunar phase cycle, not 25% brightness.',
  };
}

export function initMoonCerActivity(onCheck) {
  const root = document.querySelector('#moonCerPrediction');
  const button = document.querySelector('#moonCerCheck');
  const feedback = document.querySelector('#moonCerFeedback');
  const workspace = document.querySelector('#moonCerComparisonWorkspace');
  const preview = document.querySelector('#moonCerPredictionPreview');
  const previewVisual = document.querySelector('#moonCerPredictionVisual');
  const previewLabel = document.querySelector('#moonCerPredictionLabel');
  const comparison = document.querySelector('#moonCerComparison');
  const actualLabel = document.querySelector('#moonCerActualLabel');
  if (!root || !button || !feedback || !workspace || !preview ||
      !previewVisual || !previewLabel || !comparison || !actualLabel) return;

  function selected() {
    return root.querySelector('input[name="cerMoonPrediction"]:checked');
  }
  function showPrediction(input) {
    const result = evaluateMoonPrediction(input?.value);
    if (!result.valid || !input) return;
    const drawing = input.closest('label')?.querySelector('svg');
    if (drawing) {
      // Copy the student's actual selected drawing, never fabricate a model output.
      previewVisual.replaceChildren(drawing.cloneNode(true));
    }
    previewLabel.textContent = 'You predict ' + result.predictedPercent + '% bright.';
    workspace.hidden = false;
  }
  root.addEventListener('change', () => {
    const input = selected();
    showPrediction(input);
    comparison.hidden = true;
    feedback.textContent = 'Your drawing is a prediction, not the simulator. Choose “Compare with actual First Quarter” to check it against the physical model.';
  });
  button.addEventListener('click', () => {
    const input = selected();
    const result = evaluateMoonPrediction(input?.value);
    feedback.textContent = result.feedback;
    if (!result.valid) {
      root.querySelector('input[name="cerMoonPrediction"]')?.focus();
      return;
    }
    showPrediction(input);
    actualLabel.textContent = 'Observed First Quarter: ' + result.observedPercent + '% bright.';
    comparison.hidden = false;
    // The *actual* First Quarter is 90° whatever the student's prediction.
    // The selected answer remains visible separately next to the true observation.
    if (typeof onCheck === 'function') onCheck(result.angle);
  });
}
