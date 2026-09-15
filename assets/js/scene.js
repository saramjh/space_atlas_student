// 3D solar system model (hero section). Self-contained: reads/writes only
// the #sceneShell subtree. Planet facts come from planet-data.js.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLANETS } from './planet-data.js';

const canvas = document.querySelector('#threeCanvas');
const shell = document.querySelector('#sceneShell');
const fallback = document.querySelector('#sceneFallback');
const panel = document.querySelector('#planetPanel');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1016);
scene.fog = new THREE.Fog(0x0b1016, 55, 125);

const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 220);
camera.position.set(0, 29, 57);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .055;
controls.minDistance = 22; controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI * .48;
controls.target.set(0,0,0);
canvas.setAttribute('tabindex','0');
canvas.setAttribute('aria-label','3D solar system camera. Use arrow keys to orbit.');
controls.listenToKeyEvents(canvas);

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

function ring(radius, color=0x44515f){const pts=[];for(let i=0;i<128;i++){let a=i/128*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius));}const g=new THREE.BufferGeometry().setFromPoints(pts);return new THREE.LineLoop(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.46}));}

// Radial-gradient canvas texture so the sun reads as a glowing sphere
// instead of a flat solid-color disc.
function makeSunTexture(){
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size*0.4, size*0.36, size*0.02, size/2, size/2, size/2);
  g.addColorStop(0, '#fff6c8');
  g.addColorStop(0.32, '#ffd97a');
  g.addColorStop(0.62, '#f3a53f');
  g.addColorStop(0.85, '#d97a2e');
  g.addColorStop(1, '#b3521f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const sun = new THREE.Mesh(new THREE.SphereGeometry(4.6,48,32),new THREE.MeshBasicMaterial({map:makeSunTexture()}));scene.add(sun);
const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(5.4,32,24),new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.22,side:THREE.BackSide,blending:THREE.AdditiveBlending}));scene.add(sunGlow);
const planetGroup=new THREE.Group();scene.add(planetGroup);
const selectable=[];
function makePlanet(p,i){scene.add(ring(p.orbit));const pivot=new THREE.Group();planetGroup.add(pivot);const mesh=new THREE.Mesh(new THREE.SphereGeometry(p.r,36,24),new THREE.MeshStandardMaterial({color:p.color,roughness:.8,metalness:0}));mesh.position.x=p.orbit;mesh.userData={...p,index:i};pivot.rotation.y=i*.78; pivot.add(mesh); selectable.push(mesh);
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
}

function resetFocus(){
  trackingPlanet = null;
  targetLookAt.set(0, 0, 0);
  targetCamPos = new THREE.Vector3(0, 29, 57);
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

document.querySelector('#btnTop').onclick=()=>{
  trackingPlanet = null;
  targetLookAt.set(0,0,0);
  camera.position.set(0,72,.1);
  controls.target.set(0,0,0);
  controls.update();
  document.querySelector('#btnTop').classList.add('active');
  document.querySelector('#btnExplore').classList.remove('active');
};

document.querySelector('#btnExplore').onclick=()=>{
  trackingPlanet = null;
  targetLookAt.set(0,0,0);
  camera.position.set(0,29,57);
  controls.target.set(0,0,0);
  controls.update();
  document.querySelector('#btnExplore').classList.add('active');
  document.querySelector('#btnTop').classList.remove('active');
};

function resize(){
  const w=shell.clientWidth,h=shell.clientHeight;
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(shell);
resize();
fallback.style.display='none';

let last=performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-last)/16.67, 2);
  last=now;

  if(moving){
    planets.forEach(o=>o.pivot.rotation.y += o.p.speed*dt);
    sun.rotation.y += .0015*dt;
  }

  if(trackingPlanet){
    const worldPos = new THREE.Vector3();
    trackingPlanet.mesh.getWorldPosition(worldPos);
    targetLookAt.copy(worldPos);
  }

  currentLookAt.lerp(targetLookAt, 0.08 * dt);
  controls.target.copy(currentLookAt);

  if(targetCamPos){
    camera.position.lerp(targetCamPos, 0.06 * dt);
    if(camera.position.distanceTo(targetCamPos) < 0.2){
      targetCamPos = null;
    }
  }

  controls.update();
  renderer.render(scene,camera);
}
animate(performance.now());
