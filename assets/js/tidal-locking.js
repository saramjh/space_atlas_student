// Tidal locking page. A visible marker on the Moon's surface tracks its
// rotation directly, so the viewer can see whether the marker stays
// pointed at Earth (locked) or sweeps around (not locked).
import * as THREE from 'three';
import { createSceneBase, animateLoop, orbitRing } from './three-base.js';
import { getPlanetTexture } from './textures.js';
import { initQuiz } from './quiz-widget.js';

const ORBIT_RADIUS = 9;

const { scene, camera, controls, renderer, canvas } = createSceneBase({
  canvasSelector: '#lockCanvas',
  shellSelector: '#lockShell',
  // See moon-phases.js: a lower camera clipped the Moon out of the
  // vertical frustum at some orbital angles regardless of container width.
  cameraPos: new THREE.Vector3(0, 27, 5),
  minDistance: 10,
  maxDistance: 20,
  background: 0x0b1016,
});
canvas.setAttribute('aria-hidden', 'true');
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

scene.add(new THREE.AmbientLight(0xaab4c2, 0.7));
const sunLight = new THREE.DirectionalLight(0xfff3d6, 1.8);
sunLight.position.set(-40, 4, 0);
sunLight.target.position.set(0, 0, 0);
scene.add(sunLight, sunLight.target);

scene.add(orbitRing(ORBIT_RADIUS, 0x44515f, 0.4));

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2.1, 40, 28),
  new THREE.MeshStandardMaterial({ map: getPlanetTexture('Earth'), roughness: 0.85, metalness: 0 })
);
scene.add(earth);

const moonPivot = new THREE.Group();
scene.add(moonPivot);
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 32, 22),
  new THREE.MeshStandardMaterial({ map: getPlanetTexture('Moon'), roughness: 0.95, metalness: 0 })
);
moonPivot.add(moon);

// A marker fixed to the Moon's surface — its position reveals the Moon's
// own rotation directly, independent of where it is in its orbit.
const marker = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), new THREE.MeshBasicMaterial({ color: 0xbd4c2f }));
marker.position.set(0.62, 0, 0);
moon.add(marker);

const slider = document.querySelector('#lockAngle');
const statusEl = document.querySelector('#lockStatus');
const btnLocked = document.querySelector('#btnLocked');
const btnUnlocked = document.querySelector('#btnUnlocked');
let locked = true;

function applyAngle(deg) {
  const theta = (deg * Math.PI) / 180;
  moonPivot.position.set(0, 0, 0);
  moon.position.set(-ORBIT_RADIUS * Math.cos(theta), 0, ORBIT_RADIUS * Math.sin(theta));
  // Locked: the marker (facing local +X) must always point back at Earth,
  // i.e. toward -moon.position. Unlocked: spin at an unrelated faster rate
  // so the marker visibly sweeps around instead of tracking Earth.
  if (locked) {
    moon.rotation.y = theta;
  } else {
    moon.rotation.y = theta * 3.5;
  }
}

btnLocked.onclick = () => {
  locked = true;
  btnLocked.classList.add('active');
  btnUnlocked.classList.remove('active');
  statusEl.textContent = 'Tidally locked';
  applyAngle(Number(slider.value));
};
btnUnlocked.onclick = () => {
  locked = false;
  btnUnlocked.classList.add('active');
  btnLocked.classList.remove('active');
  statusEl.textContent = 'Not locked';
  applyAngle(Number(slider.value));
};
slider.addEventListener('input', () => applyAngle(Number(slider.value)));
applyAngle(Number(slider.value));

animateLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

initQuiz([
  {
    q: 'Does the Moon actually rotate on its own axis?',
    options: [
      { label: 'No, it is completely frozen in place' },
      { label: 'Yes — once per orbit, exactly matching its trip around Earth', correct: true },
    ],
    right: "The Moon does rotate, just very slowly: once every ~27.3 days, the same time it takes to complete one orbit. That 1:1 match is called tidal locking.",
    wrong: "The Moon does rotate — once per orbit (about every 27.3 days). It's not frozen; its rotation just exactly matches its orbital period.",
  },
  {
    q: 'What caused the Moon to become tidally locked to Earth?',
    options: [
      { label: "Earth's gravity gradually slowed the Moon's rotation over time", correct: true },
      { label: 'The Moon was built that way and never changes' },
      { label: 'Sunlight pressure locked it in place' },
      { label: 'It is a pure coincidence with no cause' },
    ],
    right: "Earth's gravity created a slight bulge in the Moon, and friction from that bulge gradually slowed the Moon's rotation over hundreds of millions of years until it locked into matching its orbit.",
    wrong: "It's tidal friction: Earth's gravity raised a slight bulge on the Moon, and drag from that bulge slowly braked its rotation until it matched the orbital period.",
  },
], {});
