// Seasons page (/earth/seasons/). Earth orbits the Sun with a rotation
// axis whose direction is FIXED in space (not relative to the Sun) — the
// core fact that explains seasons without invoking distance.
import * as THREE from 'three';
import { createSceneBase, animateLoop, orbitRing } from './three-base.js';
import { getPlanetTexture } from './textures.js';

const ORBIT_RADIUS = 10;
// Real tilt is 23.5°; kept close to real here (unlike the eclipse page's
// exaggerated tilt) since the effect is visible at this scale already.
const TILT_RAD = (23.5 * Math.PI) / 180;

const { scene, camera, controls, renderer, canvas } = createSceneBase({
  canvasSelector: '#seasonCanvas',
  shellSelector: '#seasonShell',
  cameraPos: new THREE.Vector3(4, 9, 18),
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
const axisDir = new THREE.Vector3(Math.sin(TILT_RAD), Math.cos(TILT_RAD), 0).normalize();
const axisGeo = new THREE.BufferGeometry().setFromPoints([
  axisDir.clone().multiplyScalar(-2.6), axisDir.clone().multiplyScalar(2.6),
]);
const axisLine = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0xe9a33c }));
earth.add(axisLine);

const slider = document.querySelector('#seasonAngle');
const readout = document.querySelector('#seasonVal');

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
  readout.textContent = seasonForAngle(deg);
}

slider.addEventListener('input', () => applyAngle(Number(slider.value)));
applyAngle(Number(slider.value));

animateLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
