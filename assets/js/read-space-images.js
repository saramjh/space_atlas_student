import { initQuiz } from './quiz-widget.js';

// Two separate scientific observations from NASA's published side-by-side composite.
// Modes change only the *view of the same source file*, never the pixel values or
// claimed provenance. The static comparison table remains available without JS.
const provenanceLab = document.querySelector('#imageProvenanceLab');
if (provenanceLab) {
  const modes = {
    compare: {
      instrument: 'Hubble WFC3/UVIS + Webb NIRCam',
      title: 'What changes when we observe different wavelengths?',
      explanation: 'Hubble emphasizes opaque dust structures; Webb’s near-infrared observation reveals more stars through the dusty region. This comparison is about observing wavelengths and instruments, not how the scene changed between 2014 and 2022.',
      filters: 'Both sides are processed composites of multiple exposures. Their display colors were chosen to represent separate instrument filters, not to reproduce human-eye vision.',
    },
    hubble: {
      instrument: 'Hubble · WFC3/UVIS · September 2014',
      title: 'Visible light highlights the dust',
      explanation: 'Thick pillars block much of the visible light behind them. The Hubble image emphasizes the shapes and structures of dense dust rather than revealing as many embedded stars.',
      filters: 'Assigned color channels: F502N → blue, F657N → green, F673N → red. These three exposures were combined into the published view.',
    },
    webb: {
      instrument: 'Webb · NIRCam · 14 August 2022',
      title: 'Near infrared reveals more stars',
      explanation: 'At near-infrared wavelengths, Webb detects more stars and structures through the dusty pillars. The black wedges at the edges belong to the original Webb image field of view, not missing astronomical objects.',
      filters: 'Assigned colors: F090W → purple, F187N → blue, F200W → cyan, F335M → yellow, F444W → orange, F470N → red.',
    },
  };
  const toolbar = provenanceLab.querySelector('.provenance-controls');
  const buttons = [...toolbar.querySelectorAll('[data-provenance-view]')];
  function showMode(mode) {
    const state = modes[mode];
    if (!state) return;
    provenanceLab.dataset.view = mode;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.provenanceView === mode)));
    provenanceLab.querySelector('#provenanceInstrument').textContent = state.instrument;
    provenanceLab.querySelector('#provenanceTitle').textContent = state.title;
    provenanceLab.querySelector('#provenanceExplanation').textContent = state.explanation;
    provenanceLab.querySelector('#provenanceFilters').textContent = state.filters;
  }
  buttons.forEach((button) => button.addEventListener('click', () => showMode(button.dataset.provenanceView)));
  toolbar.hidden = false;
  showMode('compare');
}

initQuiz([
  {
    q: 'A colorful nebula photo from a space telescope — is the color what your eye would see?',
    options: [
      { label: 'Yes, cameras in space see true color' },
      { label: 'Usually not — it often maps invisible wavelengths to visible colors', correct: true },
      { label: 'No, it is always a drawing' },
      { label: 'Color has nothing to do with the data' },
    ],
    right: "Many space telescopes detect infrared, X-ray, or radio light our eyes can't see. Scientists map those wavelengths onto visible colors (\"false color\") so the structure is visible — it's real data, displayed in colors chosen for clarity, not what a human eye would see nearby.",
    wrong: "Space telescopes often detect wavelengths humans can't see (infrared, X-ray, radio) and map them to visible colors so the structure is readable — that's \"false color,\" real data shown in chosen colors.",
  },
  {
    q: 'Which of these is most likely to be an artist\'s concept rather than a photograph?',
    options: [
      { label: 'The Moon, photographed from Earth' },
      { label: "An exoplanet's surface, thousands of light-years away", correct: true },
      { label: 'A galaxy imaged by Hubble' },
      { label: 'The International Space Station' },
    ],
    right: "No telescope can resolve the actual surface of a distant exoplanet — those images are artist's concepts built from indirect data like brightness and spectra, not photographs.",
    wrong: "Exoplanet 'surface' images are almost always artist's concepts — we can detect a planet exists and infer some properties, but we can't photograph its surface directly.",
  },
], {});
