import { initQuiz } from './quiz-widget.js';

const btnSpring = document.querySelector('#btnSpring');
const btnNeap = document.querySelector('#btnNeap');
const springPanel = document.querySelector('#springPanel');
const neapPanel = document.querySelector('#neapPanel');

function setMode(spring) {
  btnSpring.classList.toggle('active', spring);
  btnNeap.classList.toggle('active', !spring);
  springPanel.classList.toggle('active', spring);
  neapPanel.classList.toggle('active', !spring);
}
btnSpring.onclick = () => setMode(true);
btnNeap.onclick = () => setMode(false);

initQuiz([
  {
    q: 'Why do most coastlines get roughly two high tides a day, not one?',
    options: [
      { label: 'The Moon orbits Earth twice a day' },
      { label: 'Earth has tidal bulges on both the near and far side from the Moon, and rotates through both', correct: true },
      { label: 'The Sun causes a separate, extra tide' },
      { label: 'It is random and unpredictable' },
    ],
    right: "Gravity stretches Earth's oceans into two bulges — one on the side facing the Moon, one on the far side. As Earth spins once a day, most locations rotate through both.",
    wrong: "It comes from two tidal bulges — one facing the Moon, one on the opposite side — and Earth's daily rotation carries most coastlines through both.",
  },
  {
    q: 'When do spring tides (the strongest tides) happen?',
    options: [
      { label: 'Only in the spring season' },
      { label: 'At new moon and full moon, when the Sun and Moon align', correct: true },
      { label: 'At first and last quarter moon' },
      { label: 'Randomly, with no pattern' },
    ],
    right: "\"Spring\" here means \"jump up,\" not the season. It happens at new moon and full moon, when the Sun and Moon line up and their tidal pulls add together.",
    wrong: "Despite the name, it's not about the season — spring tides happen at new moon and full moon, when the Sun and Moon align and their pulls combine.",
  },
], {});
