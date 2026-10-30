import {createAUExpedition} from './au-expedition.js';
import { PLANETS } from './planet-data.js';

const AU_VALUES = PLANETS.map((p) => parseFloat(p.au)); // [0.39, 0.72, 1.00, 1.52, 5.20, 9.58, 19.2, 30.05]

const picker = document.querySelector('#auPicker');
const customInput = document.querySelector('#auCustomInput');

function formatDistance(cm) {
  if (cm < 10) return `${cm.toFixed(1)} cm`;
  if (cm < 100) return `${cm.toFixed(0)} cm`;
  if (cm < 100000) return `${(cm / 100).toFixed(1)} m`;
  return `${(cm / 100000).toFixed(2)} km`;
}

function render(stepCm) {
  AU_VALUES.forEach((au, i) => {
    const el = document.querySelector(`#d${i}`);
    if (el) el.textContent = formatDistance(au * stepCm);
  });
}

picker.querySelectorAll('button').forEach((btn) => {
  btn.onclick = () => {
    picker.querySelectorAll('button').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const cm = Number(btn.dataset.cm);
    customInput.value = cm;
    render(cm);
  };
});

customInput.addEventListener('input', () => {
  picker.querySelectorAll('button').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
  render(Number(customInput.value) || 0);
});

render(Number(customInput.value));

createAUExpedition({canvas:document.querySelector('#auExpeditionCanvas'),slider:document.querySelector('#auExpeditionProgress'),play:document.querySelector('#auExpeditionPlay'),reset:document.querySelector('#auExpeditionReset'),select:document.querySelector('#auExpeditionStop'),label:document.querySelector('#auExpeditionPosition'),amount:document.querySelector('#auExpeditionDistance'),note:document.querySelector('#auExpeditionNote'),scaleInput:customInput});
