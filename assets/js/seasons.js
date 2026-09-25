// Seasons page (/earth/seasons/). Earth orbits the Sun with a rotation
// axis whose direction is FIXED in space (not relative to the Sun) — the
// core fact that explains seasons without invoking distance.
import * as THREE from 'three';
import { createSceneBase, animateLoop, orbitRing } from './three-base.js';
import { getPlanetTexture } from './textures.js';

const ORBIT_RADIUS = 10;
// Real tilt is 23.5°; kept close to real here (unlike the eclipse page's
// exaggerated tilt) since the effect is visible at this scale already.
let currentTiltDeg = 23.5;

const { scene, camera, controls, renderer, canvas } = createSceneBase({
  canvasSelector: '#seasonCanvas',
  shellSelector: '#seasonShell',
  // Pulled back from the original (4,9,18): that framing clipped Earth out
  // of the vertical frustum at some orbital angles regardless of container
  // width (see moon-phases.js for the same fix/explanation).
  cameraPos: new THREE.Vector3(6, 14, 29),
  minDistance: 14,
  maxDistance: 30,
  background: 0x0b1016,
});
canvas.setAttribute('aria-hidden', 'true');
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

scene.add(new THREE.AmbientLight(0xaab4c2, 0.6));
const sunLight = new THREE.PointLight(0xfff3d6, 6, 0, 0);
scene.add(sunLight);

const sun = new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 16), new THREE.MeshBasicMaterial({ color: 0xf5c15c }));
scene.add(sun);

scene.add(orbitRing(ORBIT_RADIUS, 0x44515f, 0.45));

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 40, 28),
  new THREE.MeshStandardMaterial({ map: getPlanetTexture('Earth'), roughness: 0.85, metalness: 0 })
);
scene.add(earth);

// Axis direction is fixed in world space: tilted toward +X, constant for
// every orbital position — this is the whole point being demonstrated.
function axisDirectionForTilt(tiltDeg) {
  const tiltRad = (tiltDeg * Math.PI) / 180;
  return new THREE.Vector3(Math.sin(tiltRad), Math.cos(tiltRad), 0).normalize();
}

const axisDir = axisDirectionForTilt(currentTiltDeg);
const axisGeo = new THREE.BufferGeometry().setFromPoints([
  axisDir.clone().multiplyScalar(-2.6), axisDir.clone().multiplyScalar(2.6),
]);
const axisLine = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0xe9a33c }));
earth.add(axisLine);

const slider = document.querySelector('#seasonAngle');
const readout = document.querySelector('#seasonVal');
const tiltReal = document.querySelector('#tiltReal');
const tiltZero = document.querySelector('#tiltZero');
const experimentReadout = document.querySelector('#seasonExperiment');

function updateAxisTilt(tiltDeg) {
  currentTiltDeg = tiltDeg;
  const dir = axisDirectionForTilt(tiltDeg);
  const points = [
    dir.clone().multiplyScalar(-2.6),
    dir.clone().multiplyScalar(2.6),
  ];
  axisLine.geometry.dispose();
  axisLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
  tiltReal?.classList.toggle('active', tiltDeg === 23.5);
  tiltZero?.classList.toggle('active', tiltDeg === 0);
  if (experimentReadout) {
    experimentReadout.textContent = tiltDeg === 0
      ? '0° tilt: this model has no strong seasonal contrast as Earth moves around the Sun.'
      : '23.5° tilt: seasonal contrast changes as Earth orbits the Sun.';
  }
  applyAngle(Number(slider.value));
}

function seasonForAngle(deg) {
  const a = ((deg % 360) + 360) % 360;
  if (a >= 135 && a < 225) return 'Summer';
  if (a >= 225 && a < 315) return 'Fall';
  if (a >= 315 || a < 45) return 'Winter';
  return 'Spring';
}

function applyAngle(deg) {
  const theta = (deg * Math.PI) / 180;
  earth.position.set(Math.cos(theta) * ORBIT_RADIUS, 0, Math.sin(theta) * ORBIT_RADIUS);
  readout.textContent = currentTiltDeg === 0 ? 'No strong seasons' : seasonForAngle(deg);
}

slider.addEventListener('input', () => {
  document.querySelectorAll('[data-season-angle]').forEach((button) => button.classList.remove('active'));
  applyAngle(Number(slider.value));
});
document.querySelectorAll('[data-season-angle]').forEach((button) => {
  button.addEventListener('click', () => {
    const angle = Number(button.dataset.seasonAngle);
    slider.value = String(angle);
    document.querySelectorAll('[data-season-angle]').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    applyAngle(angle);
  });
});
tiltReal?.addEventListener('click', () => updateAxisTilt(23.5));
tiltZero?.addEventListener('click', () => updateAxisTilt(0));
applyAngle(Number(slider.value));

animateLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
