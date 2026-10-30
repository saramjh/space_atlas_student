// Tidal locking page. A visible marker on the Moon's surface tracks its
// rotation directly, so the viewer can see whether the marker stays
// pointed at Earth (locked) or sweeps around (not locked).
import * as THREE from 'three';
import { createSceneBase, orbitRing } from './three-base.js';
import {lunarFacing} from './tidal-facing.js';
import { getPlanetTexture } from './textures.js';
import { orbitFitDistance } from './orbit-framing.js';
import { initQuiz } from './quiz-widget.js';

const ORBIT_RADIUS = 9;

const { scene, camera, controls, renderer, canvas, shell } = createSceneBase({
  canvasSelector: '#lockCanvas',
  shellSelector: '#lockShell',
  // Initial viewing direction only. Final distance is computed from the
  // actual canvas dimensions below, to keep the entire Moon orbit in frame.
  cameraPos: new THREE.Vector3(0, 27, 5),
  minDistance: 10,
  maxDistance: 100,
  background: 0x0b1016,
  enableKeyboard: false,
});
canvas.setAttribute('aria-hidden', 'true');
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;

// OrbitControls.update() enforces maxDistance even when zoom is disabled;
// the former maxDistance=20 silently pulled the camera inside a view that
// only covered ~8 world units vertically, clipping the radius-9 orbit.
// Fit both the vertical and *narrow mobile horizontal* field of view.
const viewingDirection = new THREE.Vector3(0, 27, 5).normalize();
function fitCompleteOrbit() {
  const width = shell.clientWidth;
  const height = shell.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const fitDistance = orbitFitDistance({ width, height, fovDeg: camera.fov, orbitRadius: ORBIT_RADIUS });
  camera.position.copy(viewingDirection).multiplyScalar(fitDistance);
  controls.update();
}
new ResizeObserver(fitCompleteOrbit).observe(shell);
fitCompleteOrbit();

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
const lockOrbitPlay=document.querySelector('#lockOrbitPlay');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let playing=false,frame=null,started=null,startAngle=0;
function stopOrbit(){
 playing=false;if(frame!==null)cancelAnimationFrame(frame);
 frame=null;started=null;
 lockOrbitPlay.setAttribute('aria-pressed','false');lockOrbitPlay.textContent='Watch one lunar orbit (12 s)';
}
function advanceOrbit(now){
 frame=null;if(!playing||document.hidden||reducedMotion.matches)return stopOrbit();
 if(started===null)started=now;
 const t=Math.min(1,(now-started)/12000);
 slider.value=String(Math.round((startAngle+360*t)%360));applyAngle(Number(slider.value));
 if(t>=1)stopOrbit();else frame=requestAnimationFrame(advanceOrbit);
}
lockOrbitPlay.addEventListener('click',()=>{
 if(playing)return stopOrbit();
 if(reducedMotion.matches||document.hidden)return;
 stopOrbit();startAngle=Number(slider.value);playing=true;
 lockOrbitPlay.setAttribute('aria-pressed','true');lockOrbitPlay.textContent='Pause lunar orbit';
 frame=requestAnimationFrame(advanceOrbit);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopOrbit();});
reducedMotion.addEventListener?.('change',()=>{if(reducedMotion.matches)stopOrbit();lockOrbitPlay.disabled=reducedMotion.matches;});
lockOrbitPlay.disabled=reducedMotion.matches;


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
  const facing=lunarFacing(deg,locked);
  const x=(254+34*facing.markerX).toFixed(1);
  const y=(85+34*facing.markerY).toFixed(1);
  document.querySelector('#lockFaceMarker').setAttribute('cx',x);
  document.querySelector('#lockFaceMarker').setAttribute('cy',y);
  document.querySelector('#lockFaceAngle').setAttribute('x2',x);
  document.querySelector('#lockFaceAngle').setAttribute('y2',y);
  document.querySelector('#lockFaceReadout').textContent=locked
    ? 'Locked (real): the orange marker keeps facing Earth. The Moon turns once on its axis during each orbit.'
    : 'Hypothetical faster spin: the marker rotates away from the Earth-facing direction. At this orbital phase, its dot product with that direction is '+
      facing.facingCosine.toFixed(2)+' (1 means directly toward Earth; −1 directly away).';
  renderer.render(scene,camera);
}

btnLocked.onclick = () => {
  stopOrbit();locked = true;
  btnLocked.classList.add('active');
  btnUnlocked.classList.remove('active');
  btnLocked.setAttribute('aria-pressed', 'true');
  btnUnlocked.setAttribute('aria-pressed', 'false');
  statusEl.textContent = 'Tidally locked';
  applyAngle(Number(slider.value));
};
btnUnlocked.onclick = () => {
  stopOrbit();locked = false;
  btnUnlocked.classList.add('active');
  btnLocked.classList.remove('active');
  btnLocked.setAttribute('aria-pressed', 'false');
  btnUnlocked.setAttribute('aria-pressed', 'true');
  statusEl.textContent = 'Not locked';
  applyAngle(Number(slider.value));
};
slider.addEventListener('input', () => {stopOrbit();applyAngle(Number(slider.value));});
applyAngle(Number(slider.value));

// No perpetual animation loop for a slider-driven 3D diagram.
new ResizeObserver(()=>requestAnimationFrame(()=>renderer.render(scene,camera))).observe(shell);

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
