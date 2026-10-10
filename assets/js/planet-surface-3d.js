import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// A single, user-activated renderer. No perpetual animation loop.
// Exterior texture sources are documented in the static HTML.
// Globe diameter is intentionally equal across planets, not a size comparison.
export function createPlanetSurface3D({ canvas, stage, onError }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1016);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 30);
  camera.position.set(0, 0.15, 5.5);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene.add(new THREE.AmbientLight(0xffffff, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(-3, 3, 5);
  scene.add(key);

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 64, 40),
    new THREE.MeshStandardMaterial({ color: 0x849bb3, roughness: 1, metalness: 0 })
  );
  scene.add(globe);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enablePan = false;
  orbit.enableZoom = false;
  orbit.enableDamping = false;
  orbit.minPolarAngle = Math.PI * 0.12;
  orbit.maxPolarAngle = Math.PI * 0.88;
  orbit.enableKeys = false;
  orbit.addEventListener('change', render);

  const loader = new THREE.TextureLoader();
  const cache = new Map();
  let selected = 0;
  const preferredStartingAngles = { earth: 0.6, jupiter: 0.4, neptune: -0.15 };

  function render() { if (stage.clientWidth && stage.clientHeight) renderer.render(scene, camera); }
  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  async function choose({ name, textureUrl }) {
    const id = ++selected;
    try {
      let promise = cache.get(textureUrl);
      if (!promise) {
        promise = loader.loadAsync(textureUrl).then((tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          return tex;
        });
        cache.set(textureUrl, promise);
      }
      const tex = await promise;
      if (selected !== id) return;
      globe.material.map = tex;
      globe.material.color.set(0xffffff);
      globe.material.needsUpdate = true;
      globe.rotation.set(0, preferredStartingAngles[name] || 0, 0);
      orbit.reset();
      render();
    } catch (error) {
      cache.delete(textureUrl);
      onError(error);
    }
  }

  function rotate(step) {
    globe.rotation.y += step * Math.PI / 7;
    render();
  }
  function reset() {
    globe.rotation.set(0, 0, 0);
    orbit.reset();
    render();
  }
  return { choose, rotate, reset, resize };
}
