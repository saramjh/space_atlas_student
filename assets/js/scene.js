// 3D solar system model (hero section). Self-contained: reads/writes only
// the #sceneShell subtree. Planet facts come from planet-data.js.
import * as THREE from 'three';
import { PLANETS } from './planet-data.js';
import { getPlanetTexture } from './textures.js';
import { createSceneBase, animateLoop, orbitRing } from './three-base.js';

const fallback = document.querySelector('#sceneFallback');
const panel = document.querySelector('#planetPanel');

const DEFAULT_MIN_DISTANCE = 22;
const DEFAULT_CAM_POS = new THREE.Vector3(0, 29, 57);
const TOP_CAM_POS = new THREE.Vector3(0, 72, .1);

const { scene, camera, renderer, controls, shell, canvas } = createSceneBase({
  canvasSelector: '#threeCanvas',
  shellSelector: '#sceneShell',
  cameraPos: DEFAULT_CAM_POS,
  minDistance: DEFAULT_MIN_DISTANCE,
  fog: { color: 0x0b1016, near: 55, far: 125 },
});
canvas.setAttribute('aria-label','3D solar system camera. Use arrow keys to orbit.');

// Orbit distances here are compressed for visibility, not physically accurate,
// so a realistic inverse-square light falloff makes far planets (Saturn,
// Uranus, Neptune) go nearly black. Use decay:0 (no distance falloff) with a
// strong ambient fill so every planet reads its color at any distance.
scene.add(new THREE.AmbientLight(0x8f99a3, 2.4));
const sunLight = new THREE.PointLight(0xffddb0, 4, 0, 0); scene.add(sunLight);

const starGeo = new THREE.BufferGeometry();
const stars=[]; for(let i=0;i<1100;i++){const r=70+Math.random()*90, t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1);stars.push(r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t));}
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xdde6ef,size:.13,sizeAttenuation:true,transparent:true,opacity:.7})));

// A 2D gradient wrapped onto a sphere's UV distorts badly at the poles
// (looking straight down in Top view showed a flat dark disc instead of a
// glow). Sprites always face the camera, so a radial-gradient sprite gives
// a consistent glowing highlight from every angle instead.
function makeRadialSpriteTexture(stops){
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  stops.forEach(([offset, color]) => g.addColorStop(offset, color));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const sun = new THREE.Mesh(new THREE.SphereGeometry(4.6,48,32),new THREE.MeshBasicMaterial({color:0xf0a840}));scene.add(sun);

const sunHotspotTex = makeRadialSpriteTexture([
  [0, 'rgba(255,246,200,0.95)'],
  [0.45, 'rgba(255,205,120,0.55)'],
  [1, 'rgba(255,205,120,0)']
]);
const sunHotspot = new THREE.Sprite(new THREE.SpriteMaterial({map:sunHotspotTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
sunHotspot.scale.set(9.4, 9.4, 1);
sun.add(sunHotspot);

const sunGlowTex = makeRadialSpriteTexture([
  [0, 'rgba(255,179,71,0.5)'],
  [0.5, 'rgba(255,140,60,0.18)'],
  [1, 'rgba(255,140,60,0)']
]);
const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:sunGlowTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending}));
sunGlow.scale.set(16, 16, 1);
sun.add(sunGlow);
const planetGroup=new THREE.Group();scene.add(planetGroup);
const selectable=[];
function makePlanet(p,i){scene.add(orbitRing(p.orbit));const pivot=new THREE.Group();planetGroup.add(pivot);const tex=getPlanetTexture(p.name);const mesh=new THREE.Mesh(new THREE.SphereGeometry(p.r,48,32),new THREE.MeshStandardMaterial(tex?{map:tex,roughness:.85,metalness:0}:{color:p.color,roughness:.85,metalness:0}));mesh.rotation.y=Math.random()*Math.PI*2;mesh.position.x=p.orbit;mesh.userData={...p,index:i};pivot.rotation.y=i*.78; pivot.add(mesh); selectable.push(mesh);
if(p.name==='Saturn'){const rg=new THREE.RingGeometry(4.1,5.5,64);const rm=new THREE.MeshBasicMaterial({color:0xb8a67e,side:THREE.DoubleSide,transparent:true,opacity:.65});const rings=new THREE.Mesh(rg,rm);rings.rotation.x=Math.PI/2.35;mesh.add(rings);} return {pivot,mesh,p};}
const planets=PLANETS.map(makePlanet);

const tooltip = document.querySelector('#sceneTooltip');
const quickButtons = document.querySelectorAll('.planet-quick-bar button');

const raycaster=new THREE.Raycaster(), mouse=new THREE.Vector2();
let hoveredMesh = null;

// Camera Target Animation State
let targetLookAt = new THREE.Vector3(0, 0, 0);
let currentLookAt = new THREE.Vector3(0, 0, 0);
let trackingPlanet = null; // when focused, track moving planet
let targetCamPos = null;

function setPanel(p){
  panel.innerHTML=`<div class="eyebrow">Selected object</div><p class="panel-title">${p.name}</p><p>${p.desc}</p><dl><dt>Diameter</dt><dd>${p.diameter}</dd><dt>Avg. distance from Sun</dt><dd>${p.distance}</dd><dt>Distance</dt><dd>${p.au}</dd></dl><p class="verify-line">Verified against <a href="https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/" target="_blank" rel="noreferrer">NASA Science ↗</a> · checked 2026</p>`;
}

function focusPlanet(index){
  const obj = planets[index];
  if(!obj) return;
  const p = obj.p;
  trackingPlanet = obj;
  setPanel(p);

  quickButtons.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.planet, 10) === index);
  });

  const worldPos = new THREE.Vector3();
  obj.mesh.getWorldPosition(worldPos);
  const dist = Math.max(p.r * 6.5, 9);
  targetCamPos = new THREE.Vector3(worldPos.x + dist * 0.7, worldPos.y + dist * 0.5, worldPos.z + dist * 0.8);
  // OrbitControls enforces minDistance every frame; without lowering it here
  // it would fight our fly-to and yank the camera back out right after a
  // close approach to a small planet.
  controls.minDistance = Math.min(DEFAULT_MIN_DISTANCE, dist * 0.6);
}

function resetFocus(){
  trackingPlanet = null;
  targetLookAt.set(0, 0, 0);
  targetCamPos = DEFAULT_CAM_POS.clone();
  controls.minDistance = DEFAULT_MIN_DISTANCE;
  quickButtons.forEach(btn => btn.classList.remove('active'));
}

quickButtons.forEach(btn => {
  btn.onclick = () => {
    const idx = parseInt(btn.dataset.planet, 10);
    focusPlanet(idx);
  };
});

document.querySelector('#btnResetTarget').onclick = resetFocus;

function updatePointer(e){
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

renderer.domElement.addEventListener('pointermove', e => {
  updatePointer(e);
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(selectable, false)[0];
  if(hit){
    hoveredMesh = hit.object;
    renderer.domElement.style.cursor = 'pointer';
    tooltip.style.display = 'block';
    const rect = shell.getBoundingClientRect();
    tooltip.style.left = `${e.clientX - rect.left}px`;
    tooltip.style.top = `${e.clientY - rect.top}px`;
    tooltip.textContent = hoveredMesh.userData.name;
  } else {
    hoveredMesh = null;
    renderer.domElement.style.cursor = 'default';
    tooltip.style.display = 'none';
  }
});

renderer.domElement.addEventListener('pointerleave', () => {
  tooltip.style.display = 'none';
  hoveredMesh = null;
});

renderer.domElement.addEventListener('pointerdown', e => {
  updatePointer(e);
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(selectable, false)[0];
  if(hit){
    focusPlanet(hit.object.userData.index);
  }
});

let moving=true;
document.querySelector('#btnMotion').onclick=e=>{
  moving=!moving;
  e.currentTarget.textContent=moving?'Pause motion':'Resume motion';
  e.currentTarget.classList.toggle('active',!moving);
};

// Top/Explore also fly in smoothly via targetCamPos/targetLookAt (the same
// path focusPlanet uses) instead of snapping the camera instantly — mixing
// an instant camera.position.set() with the animate loop's lerp caused the
// look-at target to visibly lag behind the jumped position for a moment.
document.querySelector('#btnTop').onclick=()=>{
  trackingPlanet = null;
  targetLookAt.set(0,0,0);
  targetCamPos = TOP_CAM_POS.clone();
  controls.minDistance = DEFAULT_MIN_DISTANCE;
  quickButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector('#btnTop').classList.add('active');
  document.querySelector('#btnExplore').classList.remove('active');
};

document.querySelector('#btnExplore').onclick=()=>{
  trackingPlanet = null;
  targetLookAt.set(0,0,0);
  targetCamPos = DEFAULT_CAM_POS.clone();
  controls.minDistance = DEFAULT_MIN_DISTANCE;
  quickButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector('#btnExplore').classList.add('active');
  document.querySelector('#btnTop').classList.remove('active');
};

fallback.style.display='none';

animateLoop((dt) => {
  if(moving){
    planets.forEach(o=>o.pivot.rotation.y += o.p.speed*dt);
    sun.rotation.y += .0015*dt;
  }

  if(trackingPlanet){
    const worldPos = new THREE.Vector3();
    trackingPlanet.mesh.getWorldPosition(worldPos);
    targetLookAt.copy(worldPos);
  }

  currentLookAt.lerp(targetLookAt, 0.09 * dt);
  controls.target.copy(currentLookAt);

  if(targetCamPos){
    camera.position.lerp(targetCamPos, 0.075 * dt);
    if(camera.position.distanceTo(targetCamPos) < 0.2){
      targetCamPos = null;
    }
  }

  controls.update();
  renderer.render(scene,camera);
});
