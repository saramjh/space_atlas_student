import {cinematicEase} from './cinematic-motion.js';
// Eclipses page (/moon/eclipses/). Same Sun-Earth-Moon geometry as
// moon-phases.js, viewed from a slight elevation (not straight down) so a
// toggleable orbital tilt is visible, showing why most new/full moons
// don't produce an eclipse.
import * as THREE from 'three';
import { createSceneBase, orbitRing } from './three-base.js';
import {eclipseModel,ORBIT_RADIUS,DISPLAY_TILT_DEGREES} from './eclipse-geometry.js';
import { getPlanetTexture } from './textures.js';
import { initQuiz } from './quiz-widget.js';

const MOON_ORBIT_RADIUS = ORBIT_RADIUS;

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
  enableKeyboard: false,
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

const eclipticOrbit = orbitRing(MOON_ORBIT_RADIUS, 0x526776, 0.45);
scene.add(eclipticOrbit);
const orbit = orbitRing(MOON_ORBIT_RADIUS, 0x7cb9df, 0.95);
scene.add(orbit);
const nodeMarkers = [1,-1].map(direction=>{
  const marker=new THREE.Mesh(
    new THREE.SphereGeometry(.17,12,10),
    new THREE.MeshBasicMaterial({color:0xf7da86})
  );
  scene.add(marker);
  marker.userData.direction=direction;
  return marker;
});

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


const slider = document.querySelector('#eclipseAngle');
const tiltToggle = document.querySelector('#tiltToggle');
const readout = document.querySelector('#eclipseReadout');

const nodeSlider = document.querySelector('#eclipseNode');
const nodeOutput = document.querySelector('#eclipseNodeValue');
const offsetOutput = document.querySelector('#eclipseOffset');
const sideMoon = document.querySelector('#eclipseMoonSide');
const sideLine = document.querySelector('#eclipseSideSightline');
const sideLabel = document.querySelector('#eclipseMoonSideLabel');
const mobileMoon = document.querySelector('#eclipseMoonMobile');
const mobileLine = document.querySelector('#eclipseSideMobileSightline');
const mobileLabel = document.querySelector('#eclipseMoonMobileLabel');
const playButton = document.querySelector('#eclipsePlay');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let playing=false;
let frameId=null;
let lastTime=null;
let traveled=0;
let continuousDeg=Number(slider.value);
const CYCLE_DEGREES_PER_SECOND=30;
// Cinematic camera transitions do not affect the science geometry.
const eclipseCameraNote=document.querySelector('#eclipseCameraNote');
const cameraChoices=[...document.querySelectorAll('[data-eclipse-camera]')];
const cameraViews={oblique:new THREE.Vector3(0,12,27),overhead:new THREE.Vector3(0,26,.15),edge:new THREE.Vector3(0,3,25)};
const cameraNotes={
 oblique:'Oblique view: see the tilted Moon orbit rise above and below the Earth–Sun reference plane.',
 overhead:'Over the orbit: the Moon circles Earth, but this angle can hide its height above or below the ecliptic. Check the side-view diagram.',
 edge:'Along the ecliptic: look almost across the orbital plane to expose a Moon that passes above or below alignment. Illustrative camera only.'
};
let cameraFrame=null,cameraStart=null,cameraFrom=null,cameraTo=null;
function stopCamera(){if(cameraFrame!==null)cancelAnimationFrame(cameraFrame);cameraFrame=null;cameraStart=null;}
function cameraTick(now){
 cameraFrame=null;if(document.hidden)return stopCamera();
 if(cameraStart===null)cameraStart=now;
 const t=Math.min(1,(now-cameraStart)/980);
 camera.position.copy(cameraFrom).lerp(cameraTo,cinematicEase(t));camera.lookAt(0,0,0);
 renderer.render(scene,camera);
 if(t<1)cameraFrame=requestAnimationFrame(cameraTick);else stopCamera();
}
function changeCamera(view){if(!Object.hasOwn(cameraViews,view))return;
 stopCamera();cameraChoices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eclipseCamera===view)));
 eclipseCameraNote.textContent=cameraNotes[view];
 if(reducedMotion.matches){camera.position.copy(cameraViews[view]);camera.lookAt(0,0,0);renderer.render(scene,camera);return;}
 cameraFrom=camera.position.clone();cameraTo=cameraViews[view].clone();cameraFrame=requestAnimationFrame(cameraTick);
}
cameraChoices.forEach(b=>b.addEventListener('click',()=>changeCamera(b.dataset.eclipseCamera)));


function nearConjunction(deg) {
  const d=((deg%360)+360)%360;
  return Math.abs(d)<=3||Math.abs(d-180)<=3||Math.abs(d-360)<=3;
}
function applyAngle(deg) {
  const nodeDeg=Number(nodeSlider.value);
  const tilted=tiltToggle.checked;
  const model=eclipseModel({phaseDeg:deg,nodeDeg,tilted});
  moon.position.set(model.x,model.y,model.z);

  const axis=new THREE.Vector3(Math.cos(nodeDeg*Math.PI/180),0,Math.sin(nodeDeg*Math.PI/180));
  orbit.quaternion.setFromAxisAngle(axis,tilted?DISPLAY_TILT_DEGREES*Math.PI/180:0);
  nodeMarkers.forEach(marker=>{
    const direction=marker.userData.direction;
    marker.visible=tilted; // with zero tilt the node line is undefined
    marker.position.set(direction*ORBIT_RADIUS*axis.x,.03,direction*ORBIT_RADIUS*axis.z);
  });

  const sideX=300+model.x*17;
  const sideY=90-model.y*20;
  sideMoon.setAttribute('cx',sideX.toFixed(1));
  sideMoon.setAttribute('cy',sideY.toFixed(1));
  sideLine.setAttribute('d','M300 90 L'+sideX.toFixed(1)+' '+sideY.toFixed(1));
  sideLabel.setAttribute('x',sideX.toFixed(1));
  sideLabel.setAttribute('y',(sideY<60?sideY+38:sideY-22).toFixed(1));
  const mobileX=220+model.x*10;
  const mobileY=107-model.y*15;
  mobileMoon.setAttribute('cx',mobileX.toFixed(1));
  mobileMoon.setAttribute('cy',mobileY.toFixed(1));
  mobileLine.setAttribute('d','M220 107 L'+mobileX.toFixed(1)+' '+mobileY.toFixed(1));
  mobileLabel.setAttribute('x',mobileX.toFixed(1));
  mobileLabel.setAttribute('y',(mobileY>=107?mobileY+34:mobileY-19).toFixed(1));
  nodeOutput.textContent=nodeDeg+'° '+(nodeDeg===0?'along':'away from')+' Sun–Earth direction';
  const absoluteOffset=Math.abs(model.normalizedHeight);
  offsetOutput.textContent='Model Moon offset: '+absoluteOffset.toFixed(2)+
    ' lunar orbital radii '+(absoluteOffset<.005?'(in the ecliptic plane).':model.y>0?'(above the plane).':'(below the plane).');

  if(!nearConjunction(deg)){
    readout.textContent='Between new and full moon. Move to 0° (new moon) or 180° (full moon), then rotate the orbit nodes to compare aligned and off-plane cases.';
  }else if(!tilted) {
    const phase=Math.abs(deg-180)<=3?'Full Moon':'New Moon';
    readout.textContent=phase+' with zero inclination: both orbital planes coincide, so a unique node line is undefined. The reference-plane alignment is possible at each conjunction, but a real eclipse also depends on distance and shadow geometry.';
  }else if(model.isExactNodeConjunction) {
    const phase=Math.abs(deg-180)<=3?'Full Moon':'New Moon';
    readout.textContent=phase+' exactly at a modeled orbital node: Sun, Earth and Moon share the reference plane. Eclipse geometry is possible, not guaranteed: real type and visibility depend on distance and shadow position.';
  }else if(absoluteOffset<.025) {
    readout.textContent='Near conjunction and close to the orbital plane. A real eclipse may be possible near a node; this simplified drawing does not calculate the true eclipse shadow threshold.';
  }else{
    const phase=Math.abs(deg-180)<=3?'Full Moon':'New Moon';
    readout.textContent=phase+' but the Moon is '+(model.y>0?'above':'below')+' the ecliptic plane by '+
      absoluteOffset.toFixed(2)+' model orbital radii. This representative geometry misses the exact Sun–Earth plane; it is not a real eclipse forecast.';
  }
  if(!playing)readout.setAttribute('aria-live','polite');
  renderer.render(scene,camera);
}
function setPlaying(next) {
  playing=Boolean(next)&&!reducedMotion.matches&&!document.hidden;
  if(frameId!==null)cancelAnimationFrame(frameId);
  frameId=null;lastTime=null;
  if(playing)traveled=0;
  playButton.disabled=reducedMotion.matches;
  playButton.setAttribute('aria-pressed',String(playing));
  playButton.textContent=playing?'Pause Moon orbit':'Play one Moon orbit';
  readout.setAttribute('aria-live',playing?'off':'polite');
  if(playing)frameId=requestAnimationFrame(advanceFrame);
}
function advanceFrame(now) {
  if(!playing)return;
  if(lastTime!==null) {
    const change=Math.min(.1,Math.max(0,(now-lastTime)/1000))*CYCLE_DEGREES_PER_SECOND;
    traveled+=change;
    continuousDeg=(continuousDeg+change)%360;
    const rounded=Math.round(continuousDeg);
    slider.value=String(rounded);
    applyAngle(rounded);
    if(traveled>=360){setPlaying(false);return;}
  }
  lastTime=now;
  frameId=requestAnimationFrame(advanceFrame);
}
function useManualAngle(deg) {
  setPlaying(false);
  continuousDeg=deg;
  slider.value=String(deg);
  applyAngle(deg);
}
slider.addEventListener('input',()=>useManualAngle(Number(slider.value)));
tiltToggle.addEventListener('change',()=>{setPlaying(false);applyAngle(Number(slider.value));});
nodeSlider.addEventListener('input',()=>{setPlaying(false);applyAngle(Number(slider.value));});
document.querySelectorAll('[data-eclipse-node]').forEach(button=>{
  button.addEventListener('click',()=>{
    setPlaying(false);
    nodeSlider.value=button.dataset.eclipseNode;
    applyAngle(Number(slider.value));
  });
});
document.querySelector('#btnSolarPos').onclick=()=>useManualAngle(0);
document.querySelector('#btnLunarPos').onclick=()=>useManualAngle(180);
playButton.addEventListener('click',()=>{
  continuousDeg=Number(slider.value);
  setPlaying(!playing);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){setPlaying(false);stopCamera();}});
reducedMotion.addEventListener?.('change',()=>setPlaying(false));
new ResizeObserver(()=>requestAnimationFrame(()=>renderer.render(scene,camera)))
  .observe(document.querySelector('#eclipseShell'));
applyAngle(Number(slider.value));
document.querySelectorAll('#btnSolarPos, #btnLunarPos, #tiltToggle, #eclipseAngle, #eclipseNode, [data-eclipse-node], [data-eclipse-camera]')
  .forEach(el=>{el.disabled=false;});
playButton.disabled=reducedMotion.matches;
document.querySelector('#eclipseLab').setAttribute('aria-busy','false');
document.querySelector('#eclipseLoading').hidden=true;

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
