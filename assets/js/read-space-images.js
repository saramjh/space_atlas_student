import { initQuiz, initToggleCards } from './quiz-widget.js';

initToggleCards('.truth');

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
