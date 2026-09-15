// Eclipses page (/moon/eclipses/). Same Sun-Earth-Moon geometry as
// moon-phases.js, viewed from a slight elevation (not straight down) so a
// toggleable orbital tilt is visible, showing why most new/full moons
// don't produce an eclipse.
import * as THREE from 'three';
import { createSceneBase, animateLoop, orbitRing } from './three-base.js';
import { getPlanetTexture } from './textures.js';
import { initQuiz } from './quiz-widget.js';

const MOON_ORBIT_RADIUS = 9;
// Real tilt is ~5.1°; exaggerated here so the effect reads clearly at this
// scale, the same trade-off every model on this site states explicitly.
const TILT_RAD = (15 * Math.PI) / 180;

const { scene, camera, controls, renderer, canvas } = createSceneBase({
  canvasSelector: '#eclipseCanvas',
  shellSelector: '#eclipseShell',
  // Pulled back from the original (0,7,17): that framing clipped the Moon
  // out of the vertical frustum at some orbital angles regardless of
  // container width (see moon-phases.js for the same fix/explanation).
  cameraPos: new THREE.Vector3(0, 12, 27),
  minDistance: 12,
  maxDistance: 26,
  background: 0x0b1016,
});
canvas.setAttribute('aria-hidden', 'true');
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

scene.add(new THREE.AmbientLight(0xaab4c2, 0.55));
const sunLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
sunLight.position.set(-40, 4, 0);
sunLight.target.position.set(0, 0, 0);
scene.add(sunLight, sunLight.target);

const sunIcon = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xf5c15c }));
sunIcon.position.set(-30, 0, 0);
scene.add(sunIcon);

// The ecliptic (Earth's orbital plane) as a reference line through the
// Sun-Earth axis, so a tilted Moon visibly leaves it.
const eclipticGeo = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-34, 0, 0), new THREE.Vector3(15, 0, 0),
]);
const eclipticLine = new THREE.Line(eclipticGeo, new THREE.LineDashedMaterial({ color: 0x4a5560, dashSize: 0.6, gapSize: 0.4 }));
eclipticLine.computeLineDistances();
scene.add(eclipticLine);

const orbit = orbitRing(MOON_ORBIT_RADIUS, 0x44515f, 0.4);
scene.add(orbit);

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

function moonPositionForAngle(thetaRad, tilted) {
  const x = -MOON_ORBIT_RADIUS * Math.cos(thetaRad);
  const z = MOON_ORBIT_RADIUS * Math.sin(thetaRad);
  if (!tilted) return { x, y: 0, z };
  // Rotate the orbital plane around the Sun-Earth (Z-perpendicular) axis so
  // new/full moon points (on the X axis) land off the ecliptic, and only
  // positions near the "nodes" (~90°/270°) stay on it.
  return { x: x * Math.cos(TILT_RAD), y: x * Math.sin(TILT_RAD), z };
}

const slider = document.querySelector('#eclipseAngle');
const tiltToggle = document.querySelector('#tiltToggle');
const readout = document.querySelector('#eclipseReadout');

function angleDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

function updateReadout(deg, tilted) {
  const nearNew = angleDiff(deg, 0) < 4;
  const nearFull = angleDiff(deg, 180) < 4;
  if (!tilted && nearNew) {
    readout.innerHTML = '<strong>New Moon alignment.</strong> With no tilt, the Moon sits directly between Earth and the Sun here — this is the geometry a solar eclipse needs.';
  } else if (!tilted && nearFull) {
    readout.innerHTML = '<strong>Full Moon alignment.</strong> With no tilt, Earth sits directly between the Sun and Moon here — this is the geometry a lunar eclipse needs.';
  } else if (tilted && nearNew) {
    readout.innerHTML = "<strong>New Moon, but off-plane.</strong> With the Moon's real tilt on, it's now above or below the Sun-Earth line — its shadow misses Earth entirely. This is the ordinary case: most new moons do <em>not</em> cause a solar eclipse.";
  } else if (tilted && nearFull) {
    readout.innerHTML = "<strong>Full Moon, but off-plane.</strong> With the Moon's real tilt on, it's above or below Earth's shadow — most full moons do <em>not</em> cause a lunar eclipse.";
  } else {
    readout.innerHTML = 'Drag the slider toward 0° (new moon) or 180° (full moon) to reach an eclipse-possible alignment.';
  }
}

function applyAngle(deg) {
  const theta = (deg * Math.PI) / 180;
  const tilted = tiltToggle.checked;
  const pos = moonPositionForAngle(theta, tilted);
  moon.position.set(pos.x, pos.y, pos.z);
  updateReadout(deg, tilted);
}

slider.addEventListener('input', () => applyAngle(Number(slider.value)));
tiltToggle.addEventListener('change', () => applyAngle(Number(slider.value)));
document.querySelector('#btnSolarPos').onclick = () => { slider.value = 0; applyAngle(0); };
document.querySelector('#btnLunarPos').onclick = () => { slider.value = 180; applyAngle(180); };
applyAngle(Number(slider.value));

animateLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

initQuiz([
  {
    q: "If the Moon's orbit had zero tilt, how often would solar eclipses happen?",
    options: [
      { label: 'Never' },
      { label: 'Every new moon, about once a month', correct: true },
      { label: 'Only during a full moon' },
      { label: 'Once a year' },
    ],
    right: "With zero tilt, the Moon would pass directly between Earth and the Sun at every new moon — a solar eclipse every synodic month (about 29.5 days).",
    wrong: 'With zero tilt, every new moon would put the Moon directly between Earth and the Sun — that would mean a solar eclipse roughly every 29.5 days.',
  },
  {
    q: 'What actually has to line up for a real eclipse to happen?',
    options: [
      { label: 'Just a new moon or full moon' },
      { label: 'New/full moon AND the Moon crossing the ecliptic plane at that moment', correct: true },
      { label: "Just the Moon's distance from Earth" },
      { label: 'Nothing special — eclipses are random' },
    ],
    right: "Both conditions are required: the Sun-Earth-Moon syzygy (new or full moon) AND the Moon being near one of its two orbital nodes, where its tilted orbit crosses Earth's orbital plane.",
    wrong: "It takes both: new/full moon timing AND the Moon being close to a node (where its tilted orbit crosses the ecliptic). Either alone isn't enough.",
  },
], {});
