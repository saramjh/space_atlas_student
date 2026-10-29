import { initQuiz } from './quiz-widget.js';

initQuiz([
  {
    q: 'What actually makes a black hole "black"?',
    options: [
      { label: 'It has no light source nearby' },
      { label: "Not even light can escape past its event horizon", correct: true },
      { label: 'It absorbs all color like a black object' },
      { label: 'It is painted black by astronomers on diagrams' },
    ],
    right: "The event horizon is a one-way causal boundary: after crossing inward, every future-directed path remains inside, so even light cannot return to the outside universe.",
    wrong: "The key boundary is the event horizon. Once light or matter crosses inward, it cannot send a signal back to the outside universe.",
  },
  {
    q: 'Do black holes actively "suck in" everything in the galaxy like a vacuum cleaner?',
    options: [
      { label: 'Yes, they pull in everything nearby with unlimited range' },
      { label: 'No — their gravity works just like any mass, only stronger up close', correct: true },
    ],
    right: "A black hole's gravity follows the same rules as any other mass. If the Sun were replaced by a black hole of the same mass, Earth's orbit wouldn't change at all — you'd only notice something different very close in.",
    wrong: "Black hole gravity isn't special at a distance — it obeys the same physics as any mass. Objects only feel the extreme effects very close to the event horizon.",
  },
], {});

// 3D black-hole viewpoint lesson: deliberately uses the existing Three.js
// import map, but imports WebGL only after a visitor requests the 3D model.
import {blackHoleModel} from './black-hole-model.js';

const activate=document.querySelector('#bhActivate');
const loadStatus=document.querySelector('#bhLoadStatus');
const canvas=document.querySelector('#bhCanvas');
const fallback=document.querySelector('#bhFallback');
const shell=document.querySelector('#bhSceneShell');
const caption=document.querySelector('#bhSceneCaption');
const controlsPanel=document.querySelector('#bhControls');
const elevationInput=document.querySelector('#bhElevation');
const elevationOutput=document.querySelector('#bhElevationValue');
const massInput=document.querySelector('#bhMassExponent');
const massOutput=document.querySelector('#bhMassValue');
const readout=document.querySelector('#bhReadout');
const animateButton=document.querySelector('#bhAnimate');
const guideButton=document.querySelector('#bhGuide');
const resetButton=document.querySelector('#bhReset');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

let engine=null;
let loading=false;
let playing=false;
let frame=null;
let lastFrame=null;
let elapsedSeconds=0;
let azimuth=0;
const GAS_CYCLE_SECONDS=10;

function selectedModel() {
  return blackHoleModel({
    massSolar:10**Number(massInput.value),
    elevationDeg:Number(elevationInput.value),
  });
}
function massLabel(n) {
  return n.toLocaleString('en-US')+(n===1?' solar mass':' solar masses');
}
function updateReadout() {
  const m=selectedModel();
  elevationOutput.textContent=m.elevationDeg+'°';
  massOutput.textContent=massLabel(m.massSolar);
  const radius=m.horizonRadiusKm>=1e6
    ? (m.horizonRadiusKm/1e6).toLocaleString('en-US',{maximumFractionDigits:1})+' million km'
    : m.horizonRadiusKm.toLocaleString('en-US',{maximumFractionDigits:1})+' km';
  readout.textContent='At '+m.elevationDeg+'° above the disk, the idealized projected short/long axis ratio is '+
    m.projectedDiskMinorMajorRatio.toFixed(2)+'. A non-rotating '+
    massLabel(m.massSolar)+' black hole has an event-horizon radius of about '+radius+
    '. The normalized disk appearance does not change just because mass changes.';
  if(engine)engine.update(m,azimuth,guideButton.getAttribute('aria-pressed')==='true');
}

function stopMotion() {
  playing=false;
  if(frame!==null)cancelAnimationFrame(frame);
  frame=null;
  lastFrame=null;
  animateButton.setAttribute('aria-pressed','false');
  animateButton.textContent='Animate gas (illustrative)';
  if(engine)engine.draw();
}
function animateFrame(now) {
  if(!playing||document.hidden)return;
  if(lastFrame!==null) {
    const dt=Math.min(.1,Math.max(0,(now-lastFrame)/1000));
    elapsedSeconds+=dt;
    engine.spin(dt);
  }
  lastFrame=now;
  if(elapsedSeconds>=GAS_CYCLE_SECONDS) {
    stopMotion();
    return;
  }
  frame=requestAnimationFrame(animateFrame);
}
function toggleMotion() {
  if(reducedMotion.matches||!engine)return;
  if(playing) {stopMotion();return;}
  playing=true;
  elapsedSeconds=0;
  lastFrame=null;
  animateButton.setAttribute('aria-pressed','true');
  animateButton.textContent='Pause illustrative gas';
  frame=requestAnimationFrame(animateFrame);
}
async function loadThreeLab() {
  const THREE=await import('three');
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#080d16');
  const camera=new THREE.PerspectiveCamera(48,1,.1,120);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;

  const stars=[];
  let seed=4829;
  for(let i=0;i<420;i++) {
    seed=(seed*1664525+1013904223)>>>0;const theta=(seed/4294967296)*Math.PI*2;
    seed=(seed*1664525+1013904223)>>>0;const v=(seed/4294967296)*2-1;
    const r=32;
    stars.push(r*Math.sqrt(1-v*v)*Math.cos(theta),r*v,r*Math.sqrt(1-v*v)*Math.sin(theta));
  }
  const starGeometry=new THREE.BufferGeometry();
  starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
  scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xa6bed9,size:.11,transparent:true,opacity:.8})));

  // A real spatial disk: view elevation controls the projected ellipse.
  // Procedural colors/motion illustrate hot moving gas, not GR radiative transfer.
  const shader={
    uniforms:{uTime:{value:0},uElevation:{value:45*Math.PI/180}},
    vertexShader:[
      'varying vec2 vPosition;',
      'void main(){vPosition=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'
    ].join('\n'),
    fragmentShader:[
      'precision highp float;',
      'varying vec2 vPosition;',
      'uniform float uTime;',
      'uniform float uElevation;',
      'void main(){',
      ' float r=length(vPosition);',
      ' float p=atan(vPosition.y,vPosition.x);',
      ' float wave=sin(p*18.0-r*4.5-uTime*1.8)*0.5+sin(p*31.0+r*3.5-uTime*3.0)*0.25;',
      ' float filament=0.68+0.22*wave;',
      ' float inner=1.0-smoothstep(2.7,6.9,r);',
      ' float hot=pow(inner,1.2);',
      ' float glow=0.62+hot*0.85;',
      ' float facing=1.0+0.20*cos(p)*cos(uElevation);', // illustrative asymmetry, not quantitative Doppler
      ' vec3 warm=mix(vec3(0.58,0.14,0.07),vec3(1.0,0.75,0.35),clamp(hot*1.2,0.0,1.0));',
      ' float opacity=smoothstep(2.55,3.05,r)*(1.0-smoothstep(6.45,7.05,r));',
      ' gl_FragColor=vec4(warm*glow*filament*facing,opacity*0.98);',
      '}'
    ].join('\n'),
    transparent:true,side:THREE.DoubleSide,depthWrite:false,
  };
  const diskMaterial=new THREE.ShaderMaterial(shader);
  const disk=new THREE.Mesh(new THREE.RingGeometry(2.6,7.0,240,26),diskMaterial);
  disk.rotation.x=-Math.PI/2;
  disk.renderOrder=1;
  scene.add(disk);

  // Apparent shadow: deliberately *not* the event horizon surface.
  // A spherical black graphic marker approximates its circular silhouette.
  const shadow=new THREE.Mesh(
    new THREE.SphereGeometry(1.92,72,48),
    new THREE.MeshBasicMaterial({color:0x000002})
  );
  shadow.renderOrder=2;
  scene.add(shadow);

  // Critical-curve ring is a guide, not traced photons. Always circular
  // from the observer view, unlike the foreshortened accretion disk.
  const photonRing=new THREE.Mesh(
    new THREE.RingGeometry(1.96,2.018,180),
    new THREE.MeshBasicMaterial({color:0xffcc7a,side:THREE.DoubleSide,transparent:true,opacity:.88,depthTest:false,depthWrite:false})
  );
  photonRing.renderOrder=5;
  scene.add(photonRing);
  const halo=new THREE.Mesh(
    new THREE.RingGeometry(2.02,2.24,180),
    new THREE.MeshBasicMaterial({color:0xbb6634,side:THREE.DoubleSide,transparent:true,opacity:.26,depthTest:false,depthWrite:false})
  );
  halo.renderOrder=4;
  scene.add(halo);

  // Deliberately illustrative "far-side light bent upward" contour.
  // A true upper/lower disk image depends on integrating null geodesics;
  // these arc guides signal the visual concept, not predicted photon paths.
  const upperArc=new THREE.Mesh(
    new THREE.TorusGeometry(2.75,.075,8,150,Math.PI),
    new THREE.MeshBasicMaterial({color:0xffb45e,transparent:true,opacity:.4,
      depthWrite:false,depthTest:false})
  );
  upperArc.renderOrder=3;
  scene.add(upperArc);
  const lowerArc=new THREE.Mesh(
    new THREE.TorusGeometry(2.60,.052,8,150,Math.PI),
    new THREE.MeshBasicMaterial({color:0xa55b37,transparent:true,opacity:.16,
      depthWrite:false,depthTest:false})
  );
  lowerArc.rotation.z=Math.PI;
  lowerArc.renderOrder=3;
  scene.add(lowerArc);

  // Analytical horizon size comparison, intentionally invisible until requested.
  const horizonGuide=new THREE.Mesh(
    new THREE.RingGeometry(.735,.77,110),
    new THREE.MeshBasicMaterial({color:0x9dd3ef,side:THREE.DoubleSide,transparent:true,opacity:.9,depthTest:false,depthWrite:false})
  );
  horizonGuide.renderOrder=7;
  horizonGuide.visible=false;
  scene.add(horizonGuide);

  function resize() {
    const width=Math.max(1,shell.clientWidth),height=Math.max(1,shell.clientHeight);
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
    draw();
  }
  function draw() {
    if(!canvas.hidden)renderer.render(scene,camera);
  }
  function update(model,rotation,guide) {
    const elevation=model.elevationDeg*Math.PI/180, distance=19.5;
    camera.position.set(distance*Math.cos(elevation)*Math.sin(rotation),
      distance*Math.sin(elevation),distance*Math.cos(elevation)*Math.cos(rotation));
    camera.lookAt(0,0,0);
    diskMaterial.uniforms.uElevation.value=elevation;
    for(const marker of [photonRing,halo,horizonGuide,upperArc,lowerArc])
      marker.quaternion.copy(camera.quaternion);
    lowerArc.rotateZ(Math.PI);
    upperArc.material.opacity=.6*(1-Math.sin(elevation));
    lowerArc.material.opacity=.22*(1-Math.sin(elevation));
    horizonGuide.visible=guide;
    draw();
  }
  const observer=new ResizeObserver(resize);
  observer.observe(shell);
  const engine={draw,update,spin(dt){diskMaterial.uniforms.uTime.value+=dt;draw();},resize};
  return engine;
}
activate?.addEventListener('click',async()=>{
  if(loading)return;
  if(engine) {
    stopMotion();
    const enabled=canvas.hidden;
    canvas.hidden=!enabled;
    fallback.hidden=enabled;
    caption.hidden=!enabled;
    controlsPanel.hidden=!enabled;
    activate.setAttribute('aria-pressed',String(enabled));
    activate.textContent=enabled?'Return to labeled 2D':'Explore this diagram in 3D';
    if(enabled){engine.resize();updateReadout();}
    return;
  }
  loading=true;
  shell.setAttribute('aria-busy','true');
  loadStatus.hidden=true;
  activate.disabled=true;
  activate.textContent='Loading 3D model…';
  try {
    engine=await loadThreeLab();
    canvas.hidden=false;
    fallback.hidden=true;
    caption.hidden=false;
    controlsPanel.hidden=false;
    activate.setAttribute('aria-pressed','true');
    activate.textContent='Return to labeled 2D';
    loadStatus.hidden=true;
    engine.resize();
    updateReadout();
    animateButton.disabled=reducedMotion.matches;
    canvas.setAttribute('aria-hidden','true'); // ranges/buttons own keyboard access
  }catch(error){
    // Static labeled diagram remains usable for devices without WebGL.
    canvas.hidden=true;fallback.hidden=false;
    activate.textContent='Retry 3D view';
    activate.setAttribute('aria-pressed','false');
    loadStatus.textContent='3D could not load on this device. The labeled 2D diagram is still available. You can try loading 3D again.';
    loadStatus.hidden=false;
    activate.disabled=false;
    readout.textContent='The labeled 2D diagram and scientific explanations remain available.';
    console.warn('Black-hole WebGL not available; static learning view preserved.',error);
  }finally{loading=false;activate.disabled=false;shell.setAttribute('aria-busy','false');}
});
elevationInput?.addEventListener('input',()=>{stopMotion();updateReadout();});
massInput?.addEventListener('input',()=>{stopMotion();updateReadout();});
document.querySelectorAll('[data-bh-elevation]').forEach(button=>{
  button.addEventListener('click',()=>{
    stopMotion();
    elevationInput.value=button.dataset.bhElevation;
    updateReadout();
  });
});
guideButton?.addEventListener('click',()=>{
  guideButton.setAttribute('aria-pressed',String(guideButton.getAttribute('aria-pressed')!=='true'));
  updateReadout();
});
animateButton?.addEventListener('click',toggleMotion);
resetButton?.addEventListener('click',()=>{
  stopMotion();azimuth=0;elevationInput.value='45';massInput.value='1';
  guideButton.setAttribute('aria-pressed','false');
  updateReadout();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMotion();});
reducedMotion.addEventListener?.('change',()=>{stopMotion();animateButton.disabled=reducedMotion.matches;});
let pointer=null;
canvas?.addEventListener('pointerdown',event=>{
  if(canvas.hidden)return;
  pointer={id:event.pointerId,x:event.clientX,azimuth};
  canvas.setPointerCapture(event.pointerId);
});
canvas?.addEventListener('pointermove',event=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  stopMotion();
  azimuth=pointer.azimuth+(event.clientX-pointer.x)*.008;
  updateReadout();
});
function endPointer(event) {
  if(!pointer||pointer.id!==event.pointerId)return;
  pointer=null;
  if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
}
canvas?.addEventListener('pointerup',endPointer);
canvas?.addEventListener('pointercancel',endPointer);
canvas?.addEventListener('lostpointercapture',()=>{pointer=null;});
updateReadout();
activate.disabled=false; // Native controls are ready; fail inertly if JavaScript did not load.
