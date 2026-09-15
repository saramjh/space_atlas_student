// Moon Phases page (/moon/phases/). Two synchronized views driven by one
// angle: a top-down Sun-Earth-Moon system model (Three.js) and a 2D canvas
// showing the Moon's illuminated fraction as seen from Earth.
import * as THREE from 'three';
import { createSceneBase, animateLoop, orbitRing } from './three-base.js';
import { getPlanetTexture } from './textures.js';

const MOON_ORBIT_RADIUS = 9;

const { scene, camera, renderer, controls, canvas } = createSceneBase({
  canvasSelector: '#moonCanvas',
  shellSelector: '#moonSceneShell',
  cameraPos: new THREE.Vector3(0, 15, 3),
  minDistance: 10,
  maxDistance: 30,
  background: 0x0b1016,
});
canvas.setAttribute('aria-hidden', 'true');
// This is a fixed pedagogical diagram, not a free-roam scene — lock the camera.
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

// Low ambient on purpose: the whole point of this page is to make the
// lit/dark hemisphere split visible, unlike the home page's solar-system
// scene where a strong ambient avoids far planets going black.
scene.add(new THREE.AmbientLight(0xaab4c2, 0.55));

const sunDir = new THREE.Vector3(-1, 0, 0);
const sunLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
sunLight.position.set(-40, 4, 0);
sunLight.target.position.set(0, 0, 0);
scene.add(sunLight, sunLight.target);

const sunIcon = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xf5c15c }));
sunIcon.position.set(-30, 0, 0);
scene.add(sunIcon);

scene.add(orbitRing(MOON_ORBIT_RADIUS, 0x44515f, 0.5));

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2.1, 40, 28),
  new THREE.MeshStandardMaterial({ map: getPlanetTexture('Earth'), roughness: 0.85, metalness: 0 })
);
scene.add(earth);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 32, 22),
  new THREE.MeshStandardMaterial({ map: getPlanetTexture('Moon'), roughness: 0.95, metalness: 0 })
);
scene.add(moon);

const starGeo = new THREE.BufferGeometry();
const stars = [];
for (let i = 0; i < 500; i++) {
  const r = 40 + Math.random() * 40, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
  stars.push(r * Math.sin(p) * Math.cos(t), Math.abs(r * Math.cos(p)) * 0.3 + 2, r * Math.sin(p) * Math.sin(t));
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdde6ef, size: 0.12, transparent: true, opacity: 0.6 })));

// theta: 0 = New Moon (between Earth and Sun), PI = Full Moon (opposite the Sun).
function moonPositionForAngle(thetaRad) {
  return {
    x: -MOON_ORBIT_RADIUS * Math.cos(thetaRad),
    z: MOON_ORBIT_RADIUS * Math.sin(thetaRad),
  };
}

const PHASE_NAMES = [
  [0, 'New Moon'], [22.5, 'Waxing Crescent'], [67.5, 'First Quarter'], [112.5, 'Waxing Gibbous'],
  [157.5, 'Full Moon'], [202.5, 'Waning Gibbous'], [247.5, 'Last Quarter'], [292.5, 'Waning Crescent'],
  [337.5, 'New Moon'],
];
function phaseNameForDegrees(deg) {
  for (let i = PHASE_NAMES.length - 1; i >= 0; i--) {
    if (deg >= PHASE_NAMES[i][0]) return PHASE_NAMES[i][1];
  }
  return 'New Moon';
}

const earthViewCanvas = document.querySelector('#moonEarthView');
const earthViewCtx = earthViewCanvas.getContext('2d');
const phaseNameEl = document.querySelector('#phaseName');

function drawEarthView(thetaRad) {
  const size = earthViewCanvas.width;
  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  earthViewCtx.clearRect(0, 0, size, size);

  earthViewCtx.save();
  earthViewCtx.beginPath();
  earthViewCtx.arc(cx, cy, r, 0, Math.PI * 2);
  earthViewCtx.clip();

  earthViewCtx.fillStyle = '#1a1d22';
  earthViewCtx.fillRect(cx - r, cy - r, r * 2, r * 2);

  const k = (1 - Math.cos(thetaRad)) / 2; // illuminated fraction, 0..1
  const waxing = thetaRad <= Math.PI;
  const offset = 2 * r * (1 - k);
  const dir = waxing ? 1 : -1;
  earthViewCtx.fillStyle = '#efe7d4';
  earthViewCtx.beginPath();
  earthViewCtx.arc(cx + dir * offset, cy, r, 0, Math.PI * 2);
  earthViewCtx.fill();
  earthViewCtx.restore();
}

const slider = document.querySelector('#moonAngle');

function applyAngle(deg) {
  const theta = (deg * Math.PI) / 180;
  const pos = moonPositionForAngle(theta);
  moon.position.set(pos.x, 0, pos.z);
  drawEarthView(theta);
  phaseNameEl.textContent = phaseNameForDegrees(deg);
}

slider.addEventListener('input', () => applyAngle(Number(slider.value)));
applyAngle(Number(slider.value));

animateLoop(() => {
  earth.rotation.y += 0.002;
  controls.update();
  renderer.render(scene, camera);
});

// Misconception-check quiz — same pattern as the home page's Scale Lab
// quiz (assets/js/interactions.js), duplicated rather than imported so this
// page's script stays self-contained and independently cacheable.
const QUIZ_BANK = [
  {
    q: 'What actually changes to cause Moon phases?',
    options: [
      { label: "Earth's shadow falls on the Moon", correct: false },
      { label: 'How much of the sunlit half faces Earth', correct: true },
      { label: 'The Moon changes color', correct: false },
      { label: "The Moon's distance from Earth", correct: false },
    ],
    right: "Exactly half the Moon is always lit by the Sun. Phases happen because Earth sees a changing slice of that lit half as the Moon orbits — it's a viewing-angle effect, not a shadow.",
    wrong: "Earth's shadow only matters during a lunar eclipse, which is rare. Ordinary phases come from the Moon's changing angle relative to the Sun and Earth.",
  },
  {
    q: 'About how long is one full cycle of Moon phases?',
    options: [
      { label: 'About 1 week', correct: false },
      { label: 'About 29.5 days', correct: true },
      { label: 'About 100 days', correct: false },
      { label: 'About 1 year', correct: false },
    ],
    right: 'A synodic month — new moon to new moon — is about 29.5 days, which is where the word "month" comes from.',
    wrong: 'One full cycle (a synodic month) takes about 29.5 days, not that long.',
  },
  {
    q: 'Why do we always see the same side of the Moon?',
    options: [
      { label: 'The Moon does not rotate at all', correct: false },
      { label: "The Moon's rotation and orbit periods match (tidal locking)", correct: true },
      { label: 'The Moon is too far away to see the far side', correct: false },
      { label: 'Earth blocks the far side from view', correct: false },
    ],
    right: 'The Moon does rotate — once per orbit. That match is called tidal locking, and it means the same hemisphere always faces Earth.',
    wrong: "The Moon rotates, just once per orbit — that exact match (tidal locking) is why the same side always faces Earth.",
  },
];
let quizIndex = 0;
const quizQuestion = document.querySelector('#quizQuestion');
const quizOptions = document.querySelector('#quizOptions');
const quizFeedback = document.querySelector('#quizFeedback');
const quizRetry = document.querySelector('#quizRetry');

function renderQuiz() {
  const item = QUIZ_BANK[quizIndex];
  quizQuestion.textContent = item.q;
  quizFeedback.style.display = 'none';
  quizFeedback.innerHTML = '';
  quizRetry.hidden = true;
  quizOptions.innerHTML = '';
  item.options.forEach((opt) => {
    const b = document.createElement('button');
    b.textContent = opt.label;
    b.dataset.correct = opt.correct ? '1' : '0';
    b.onclick = () => {
      quizOptions.querySelectorAll('button').forEach((bt) => {
        bt.disabled = true;
        if (bt.dataset.correct === '1') bt.classList.add('correct');
      });
      quizFeedback.style.display = 'block';
      if (opt.correct) {
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
