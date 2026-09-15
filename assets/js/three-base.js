// Shared Three.js scene boilerplate reused by every 3D module on the site
// (renderer/camera/OrbitControls setup, resize handling, the animation
// loop's delta-time bookkeeping). Page-specific modules (scene.js,
// moon-phases.js, ...) own everything about what's actually in the scene.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * @param {Object} opts
 * @param {string} opts.canvasSelector
 * @param {string} opts.shellSelector - element whose size drives the renderer/camera aspect
 * @param {THREE.Vector3} opts.cameraPos
 * @param {number} [opts.fov=44]
 * @param {number} [opts.near=0.1]
 * @param {number} [opts.far=220]
 * @param {number} [opts.minDistance=22]
 * @param {number} [opts.maxDistance=100]
 * @param {number} [opts.maxPolarAngle=Math.PI*.48]
 * @param {number} [opts.background=0x0b1016]
 * @param {{color:number,near:number,far:number}|null} [opts.fog=null]
 * @param {boolean} [opts.enableKeyboard=true]
 */
export function createSceneBase({
  canvasSelector,
  shellSelector,
  cameraPos,
  fov = 44,
  near = 0.1,
  far = 220,
  minDistance = 22,
  maxDistance = 100,
  maxPolarAngle = Math.PI * 0.48,
  background = 0x0b1016,
  fog = null,
  enableKeyboard = true,
}) {
  const canvas = document.querySelector(canvasSelector);
  const shell = document.querySelector(shellSelector);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  if (fog) scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);

  const camera = new THREE.PerspectiveCamera(fov, 1, near, far);
  camera.position.copy(cameraPos);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.minDistance = minDistance;
  controls.maxDistance = maxDistance;
  controls.maxPolarAngle = maxPolarAngle;
  controls.target.set(0, 0, 0);

  if (enableKeyboard) {
    canvas.setAttribute('tabindex', '0');
    controls.listenToKeyEvents(canvas);
  }

  function resize() {
    const w = shell.clientWidth, h = shell.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(shell);
  resize();

  return { scene, camera, renderer, controls, shell, canvas, resize };
}

/** A thin circular line in the XZ plane — used for every orbit-path visual. */
export function orbitRing(radius, color = 0x44515f, opacity = 0.46) {
  const pts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

/** Runs `callback(dt, now)` every frame, dt normalized to ~1 at 60fps and capped at 2. */
export function animateLoop(callback) {
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 16.67, 2);
    last = now;
    callback(dt, now);
  }
  requestAnimationFrame(frame);
}
