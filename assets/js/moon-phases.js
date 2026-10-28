// Moon Phases page (/moon/phases/). Two synchronized views driven by one
// angle: a top-down Sun-Earth-Moon system model (Three.js) and a 2D canvas
// showing the Moon's illuminated fraction as seen from Earth.
import * as THREE from 'three';
import { createSceneBase, animateLoop, orbitRing } from './three-base.js';
import { getPlanetTexture } from './textures.js';
import { initQuiz } from './quiz-widget.js';
import { initTeacherDistribution } from './teacher-distribution.js';
import { initMoonCerActivity } from './moon-cer.js';

const MOON_ORBIT_RADIUS = 9;

const { scene, camera, renderer, controls, canvas } = createSceneBase({
  canvasSelector: '#moonCanvas',
  shellSelector: '#moonSceneShell',
  // y must clear the full orbit vertically regardless of container aspect:
  // at fov 44 the vertical half-angle is 22°, so a camera this high sees a
  // vertical half-extent of y*tan(22°) ≈ 11 world units at the orbit's
  // plane — comfortably more than MOON_ORBIT_RADIUS (9). A lower camera
  // clipped the Moon out of view entirely at some orbital angles.
  cameraPos: new THREE.Vector3(0, 27, 5),
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
const phaseMetricsEl = document.querySelector('#phaseMetrics');

// The visible lunar hemisphere is a sphere, never an overlapping moving
// black disk. At angle 0 the Sun is behind the Moon as seen from Earth;
// at 180 degrees the Sun is behind the viewer. The terminator is the
// projected great-circle boundary on that sphere (elliptical at gibbous
// and crescent phases), NOT Earth's shadow during a lunar eclipse.
function drawEarthView(thetaRad) {
  const size = earthViewCanvas.width;
  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const image = earthViewCtx.createImageData(size, size);
  const pixels = image.data;
  const lightX = Math.sin(thetaRad);
  const lightZ = -Math.cos(thetaRad);

  // Use the same lit hemisphere over the entire lunar sphere; the visible
  // fraction is (1 - cos(theta))/2. A narrow terminator softening prevents
  // aliasing without creating a circular sweeping "eclipse" silhouette.
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = (px + 0.5 - cx) / r;
      const y = (cy - py - 0.5) / r;
      const rho2 = x * x + y * y;
      if (rho2 >= 1.015) continue;
      const z = Math.sqrt(Math.max(0, 1 - rho2));
      const sunFacing = x * lightX + z * lightZ;
      const daylight = Math.min(1, Math.max(0, (sunFacing + 0.017) / 0.034));
      const limb = Math.min(1, Math.max(0, (1 - Math.sqrt(rho2)) * r));
      const shade = 0.86 + 0.14 * Math.sqrt(Math.max(0, sunFacing));
      const i = (py * size + px) * 4;
      pixels[i] = Math.round(22 * (1 - daylight) + 239 * shade * daylight);
      pixels[i + 1] = Math.round(26 * (1 - daylight) + 232 * shade * daylight);
      pixels[i + 2] = Math.round(34 * (1 - daylight) + 212 * shade * daylight);
      pixels[i + 3] = Math.round(limb * 255);
    }
  }
  earthViewCtx.clearRect(0, 0, size, size);
  earthViewCtx.putImageData(image, 0, 0);
}

const slider = document.querySelector('#moonAngle');

function applyAngle(deg) {
  document.querySelectorAll('[data-moon-angle]').forEach(button => {
    const selected = Number(button.dataset.moonAngle) === deg;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const theta = (deg * Math.PI) / 180;
  const pos = moonPositionForAngle(theta);
  moon.position.set(pos.x, 0, pos.z);
  drawEarthView(theta);
  phaseNameEl.textContent = phaseNameForDegrees(deg);
  if (phaseMetricsEl) {
    const illuminated = ((1 - Math.cos(theta)) / 2) * 100;
    const day = (deg / 360) * 29.53059;
    phaseMetricsEl.textContent = `Day ${day.toFixed(1)} of 29.5 · ${illuminated.toFixed(0)}% illuminated as seen from Earth`;
  }
}

slider.addEventListener('input', () => {
  applyAngle(Number(slider.value));
});
document.querySelectorAll('[data-moon-angle]').forEach((button) => {
  button.addEventListener('click', () => {
    const angle = Number(button.dataset.moonAngle);
    slider.value = String(angle);
    applyAngle(angle);
  });
});
applyAngle(Number(slider.value));

initMoonCerActivity((angle) => {
  slider.value = String(angle);
  applyAngle(angle);
});

animateLoop(() => {
  earth.rotation.y += 0.002;
  controls.update();
  renderer.render(scene, camera);
});

// Misconception-check quiz uses the shared quiz owner.
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
initQuiz(QUIZ_BANK);
initTeacherDistribution('moon_phases');
