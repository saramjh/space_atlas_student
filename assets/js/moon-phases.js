// Moon Phases page (/moon/phases/). Two synchronized views driven by one
// angle: a top-down Sun-Earth-Moon system model (Three.js) and a 2D canvas
// showing the Moon's illuminated fraction as seen from Earth.
import * as THREE from 'three';
import { createSceneBase, orbitRing } from './three-base.js';
import { moonModelAtDegrees, phaseLabelAtDegrees, angleForOrbitPosition } from './moon-geometry.js';
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
  enableKeyboard: false, // Slider supplies keyboard access; the canvas is visual.
});
canvas.setAttribute('aria-hidden', 'true');
// This is a fixed pedagogical diagram, not a free-roam scene — lock the camera.
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

// Low ambient on purpose: the whole point of this page is to make the
// lit/dark hemisphere split visible, unlike the home page's solar-system
// scene where a strong ambient avoids far planets going black.
scene.add(new THREE.AmbientLight(0xaab4c2, 0.12));

const sunLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
sunLight.position.set(-40, 4, 0);
sunLight.target.position.set(0, 0, 0);
scene.add(sunLight, sunLight.target);

// The actual Sun lies far off-frame to the left of this compressed orbit.
scene.add(orbitRing(MOON_ORBIT_RADIUS, 0x667786, 0.75));
// Dashed Earth-to-Moon line links the overhead geometry to what Earth sees.
const earthSightline = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
  new THREE.LineDashedMaterial({color:0x91b4d6, dashSize:0.4, gapSize:0.27, opacity:0.85, transparent:true})
);
scene.add(earthSightline);

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
const playButton = document.querySelector('#moonPlay');
const motionNote = document.querySelector('#moonMotionNote');
const geometryNote = document.querySelector('#moonGeometryNote');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function applyAngle(deg) {
  document.querySelectorAll('[data-moon-angle]').forEach(button => {
    const selected = Number(button.dataset.moonAngle) === deg;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const model = moonModelAtDegrees(deg);
  moon.position.set(model.position.x, 0, model.position.z);
  // Keep the near-side texture aimed at Earth instead of sliding around.
  moon.rotation.y = model.moonRotationY;
  earthSightline.geometry.setFromPoints([
    new THREE.Vector3(0, 0.02, 0),
    new THREE.Vector3(model.position.x, 0.02, model.position.z),
  ]);
  earthSightline.computeLineDistances();
  drawEarthView(deg * Math.PI / 180);
  phaseNameEl.textContent = phaseLabelAtDegrees(deg);
  if (phaseMetricsEl) {
    phaseMetricsEl.textContent = 'Day ' + model.phaseAgeDays.toFixed(1) + ' of 29.5 · ' +
      (model.illuminatedFraction * 100).toFixed(0) + '% illuminated as seen from Earth';
  }
  if (geometryNote) {
    geometryNote.textContent = 'Sun–Earth–Moon angle: ' + Math.round(model.elongationDegrees) +
      '°. Sunlight always lights half of the Moon’s whole sphere; Earth sees ' +
      (model.illuminatedFraction * 100).toFixed(0) + '% of its disk illuminated.';
  }
  renderer.render(scene, camera);
}

// No decorative perpetual loop. Motion starts only after a user presses Play.
let playing = false;
let frameId = null;
let lastTime = null;
let continuousAngle = Number(slider.value);
let traveledDegrees = 0;
const DEGREES_PER_SECOND = 15; // One idealized phase cycle in 24 seconds.
function setPlayState(next) {
  playing = Boolean(next) && !reducedMotion.matches && !document.hidden;
  if (playing) traveledDegrees = 0;
  if (frameId !== null) cancelAnimationFrame(frameId);
  frameId = null;
  lastTime = null;
  if (playButton) {
    playButton.textContent = playing ? 'Pause phase cycle' : 'Play phase cycle';
    playButton.setAttribute('aria-pressed', String(playing));
    playButton.disabled = reducedMotion.matches;
  }
  if (motionNote) {
    motionNote.textContent = reducedMotion.matches
      ? 'Motion is disabled by your reduced-motion preference. Use the slider or phase buttons.'
      : playing ? 'Animated comparison: one idealized 29.5-day cycle in 24 seconds.'
      : 'Start or pause one idealized phase cycle. The model stays still while paused.';
  }
  // Do not flood screen readers with a continuously changing percentage.
  phaseMetricsEl.setAttribute('aria-live', playing ? 'off' : 'polite');
  if (playing) frameId = requestAnimationFrame(stepCycle);
}
function stepCycle(now) {
  if (!playing) return;
  if (lastTime !== null) {
    const elapsed = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
    const travel = elapsed * DEGREES_PER_SECOND;
    traveledDegrees += travel;
    continuousAngle = (continuousAngle + travel) % 360;
    const angle = Math.round(continuousAngle);
    slider.value = String(angle);
    applyAngle(angle);
    if (traveledDegrees >= 360) {
      setPlayState(false);
      motionNote.textContent = 'One cycle complete. Play again or use the slider to compare phases.';
      return;
    }
  }
  lastTime = now;
  frameId = requestAnimationFrame(stepCycle);
}
playButton?.addEventListener('click', () => {
  continuousAngle = Number(slider.value);
  setPlayState(!playing);
});
slider.addEventListener('input', () => {
  setPlayState(false);
  continuousAngle = Number(slider.value);
  applyAngle(continuousAngle);
});
document.querySelectorAll('[data-moon-angle]').forEach((button) => {
  button.addEventListener('click', () => {
    setPlayState(false);
    continuousAngle = Number(button.dataset.moonAngle);
    slider.value = String(continuousAngle);
    applyAngle(continuousAngle);
  });
});
initMoonCerActivity((angle) => {
  setPlayState(false);
  continuousAngle = angle;
  slider.value = String(angle);
  applyAngle(angle);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) setPlayState(false);
});
reducedMotion.addEventListener?.('change', () => setPlayState(false));
// Shared renderer resizes internally; refresh a single idle scene frame after.
new ResizeObserver(() => {
  requestAnimationFrame(() => renderer.render(scene, camera));
}).observe(document.querySelector('#moonSceneShell'));
// Direct orbit interaction complements the native keyboard/touch-friendly
// range slider. Only capture on the orbit annulus, so swiping outside it
// still scrolls normally on touch devices.
const orbitRay = new THREE.Raycaster();
const orbitPlane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
const orbitPoint = new THREE.Vector3();
let activePointer = null;
function pointerOrbitAngle(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  orbitRay.setFromCamera(new THREE.Vector2(x,y),camera);
  if (!orbitRay.ray.intersectPlane(orbitPlane,orbitPoint)) return null;
  const distance = Math.hypot(orbitPoint.x,orbitPoint.z);
  // Reject attempts on the central planet and unrelated empty background.
  if (distance < MOON_ORBIT_RADIUS - 2.5 || distance > MOON_ORBIT_RADIUS + 2.5) return null;
  return angleForOrbitPosition(orbitPoint.x,orbitPoint.z);
}
function applyOrbitPointer(event) {
  const angle = pointerOrbitAngle(event);
  if (angle === null) return false;
  setPlayState(false);
  continuousAngle = Math.round(angle);
  slider.value = String(continuousAngle);
  applyAngle(continuousAngle);
  return true;
}
canvas.addEventListener('pointerdown', (event) => {
  if (!applyOrbitPointer(event)) return;
  activePointer = event.pointerId;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (activePointer === event.pointerId) applyOrbitPointer(event);
});
function stopDragging(event) {
  if (activePointer !== event.pointerId) return;
  activePointer = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}
canvas.addEventListener('pointerup', stopDragging);
canvas.addEventListener('pointercancel', stopDragging);
canvas.addEventListener('lostpointercapture', () => { activePointer = null; });

applyAngle(Number(slider.value));
setPlayState(false);

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
