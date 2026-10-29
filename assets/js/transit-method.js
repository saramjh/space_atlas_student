// Transit demonstration: projected sky geometry and a physically related idealized light curve.
import { initQuiz } from './quiz-widget.js';
import { transitBlockedFraction, ORBIT_RADIUS_IN_STELLAR_RADII, GRAPH_DEPTH_LIMIT } from './transit-geometry.js';

const phase = document.querySelector('#transitAngle');
const radius = document.querySelector('#transitRadius');
const readout = document.querySelector('#transitReadout');
const phaseValue = document.querySelector('#transitAngleValue');
const radiusValue = document.querySelector('#transitRadiusValue');
const planetFront = document.querySelector('#transitPlanetFront');
const planetBack = document.querySelector('#transitPlanetBack');
const scene = document.querySelector('#transitScene');
const focusButton = document.querySelector('#transitFocus');
let focused = false, focusFrame = null;
let viewBox = [0, 0, 420, 160];
const wideBox = [0, 0, 420, 160], closeBox = [129, 19, 162, 122];
function setViewBox(values) {
 viewBox = values.map(Number);
 scene.setAttribute('viewBox', viewBox.map(v=>v.toFixed(2)).join(' '));
}
function setFocus(next) {
 focused = Boolean(next);
 if (focusFrame !== null) cancelAnimationFrame(focusFrame);
 focusFrame = null;
 focusButton.setAttribute('aria-pressed',String(focused));
 focusButton.textContent=focused?'Return to full projected orbit':'Zoom into the star';
 const target = focused ? closeBox : wideBox;
 if (reducedMotion.matches || document.hidden) {setViewBox(target);return;}
 const initial=[...viewBox], started=performance.now();
 function tick(now) {
  const t=Math.min(1,Math.max(0,(now-started)/620));
  const ease=1-Math.pow(1-t,3);
  setViewBox(initial.map((v,i)=>v+(target[i]-v)*ease));
  focusFrame=t<1 ? requestAnimationFrame(tick) : null;
 }
 focusFrame=requestAnimationFrame(tick);
}
focusButton.addEventListener('click',()=>setFocus(!focused));
const playButton=document.querySelector('#transitPlay');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let playing=false,frameId=null,lastTime=null,traveled=0,continuousDeg=0;
const TRANSIT_DEG_PER_SEC=30;
function setPlaying(next) {
  playing=Boolean(next)&&!reducedMotion.matches&&!document.hidden;
  if(frameId!==null)cancelAnimationFrame(frameId);
  frameId=null;lastTime=null;
  if(playing)traveled=0;
  playButton.disabled=reducedMotion.matches;
  playButton.setAttribute('aria-pressed',String(playing));
  playButton.textContent=playing?'Pause illustrated orbit':'Play one illustrated orbit';
  readout.setAttribute('aria-live',playing?'off':'polite');
  scene.classList.toggle('transit-playing',playing);
  if(playing)frameId=requestAnimationFrame(advanceFrame);
}
function advanceFrame(now) {
  if(!playing)return;
  if(lastTime!==null){
    const delta=Math.min(.1,Math.max(0,(now-lastTime)/1000))*TRANSIT_DEG_PER_SEC;
    traveled+=delta;
    continuousDeg=(continuousDeg+delta)%360;
    phase.value=String(Math.round(continuousDeg));
    render();
    if(traveled>=360){setPlaying(false);return;}
  }
  lastTime=now;
  frameId=requestAnimationFrame(advanceFrame);
}
playButton.addEventListener('click',()=>{
  continuousDeg=Number(phase.value);
  setPlaying(!playing);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){setPlaying(false);if(focusFrame!==null){cancelAnimationFrame(focusFrame);focusFrame=null;setViewBox(focused?closeBox:wideBox);}}});
reducedMotion.addEventListener?.('change',()=>{setPlaying(false);if(focusFrame!==null){cancelAnimationFrame(focusFrame);focusFrame=null;setViewBox(focused?closeBox:wideBox);}});

const curve = document.querySelector('#transitCurve');
const marker = document.querySelector('#transitCurveMarker');
const progress = document.querySelector('#transitProgress');
const startX = 47, plotWidth = 330, topY = 30, plotHeight = 112;
const starCx = 210, starR = 40;

function graphPoint(deg, fraction) {
  return [startX + (deg / 360) * plotWidth, topY + (fraction / GRAPH_DEPTH_LIMIT) * plotHeight];
}
function render() {
  const deg = Number(phase.value);
  const ratio = Number(radius.value) / 100;
  const blocked = transitBlockedFraction(deg, ratio);
  const front = Math.sin(deg * Math.PI / 180) > 0;
  const x = starCx + Math.cos(deg * Math.PI / 180) * ORBIT_RADIUS_IN_STELLAR_RADII * starR;
  for (const planet of [planetFront, planetBack]) {
    planet.setAttribute('cx', x.toFixed(2));
    planet.setAttribute('r', (ratio * starR).toFixed(2));
  }
  planetFront.hidden = !front;
  planetBack.hidden = front;
  planetFront.style.display = front ? '' : 'none';
  planetBack.style.display = front ? 'none' : '';
  const path = [];
  for (let degree=0; degree<=360; degree++) {
    const [px,py] = graphPoint(degree,transitBlockedFraction(degree,ratio));
    path.push((degree===0 ? 'M ' : ' L ') + px.toFixed(2) + ' ' + py.toFixed(2));
  }
  curve.setAttribute('d',path.join(''));
  const [mx,my] = graphPoint(deg,blocked);
  marker.setAttribute('cx',mx.toFixed(2));
  marker.setAttribute('cy',my.toFixed(2));
  progress.setAttribute('x1',mx.toFixed(2));
  progress.setAttribute('x2',mx.toFixed(2));
  phaseValue.textContent = deg + '°';
  radiusValue.textContent = radius.value + '% of stellar radius';
  const crossesProjectedDisk = Math.abs(x - starCx) < starR * (1 + ratio);
  const position = blocked > 0 ? 'In front: starlight is blocked.' :
    !front && crossesProjectedDisk ? 'Behind the star: no transit.' :
    'Outside the visible stellar disk: no transit.';
  const percent = (blocked*100).toFixed(3);
  readout.textContent = 'Phase ' + deg + '° · Light blocked ' + percent + '% · Star brightness ' + ((1-blocked)*100).toFixed(3) + '%. ' + position;
  scene.setAttribute('aria-label', 'Idealized sky projection: planet radius ' + radius.value + '% of star radius, phase ' + deg + ' degrees. ' + position + ' Positions and orbital spacing are not to scale.');
}
phase.addEventListener('input',()=>{setPlaying(false);render();});
radius.addEventListener('input',()=>{setPlaying(false);render();});
render();
phase.disabled = false;
radius.disabled = false;
playButton.disabled=reducedMotion.matches;
focusButton.disabled=false;
document.querySelector('#transitInitNote').hidden = true;

initQuiz([
  {
    q: 'What does the transit method actually detect?',
    options: [
      { label: 'A direct photograph of the planet' },
      { label: "A tiny, repeating dip in the star's brightness", correct: true },
      { label: 'Radio signals from the planet' },
      { label: "The planet's temperature directly" },
    ],
    right: "The transit method watches for a small, precisely repeating dip in a star's brightness, caused by a planet passing in front of it — no direct image of the planet is needed.",
    wrong: "It's a brightness dip, not an image — a planet passing in front of its star blocks a tiny, regularly repeating fraction of the star's light.",
  },
  {
    q: 'Why does a single brightness dip usually not count as a confirmed planet?',
    options: [
      { label: 'One dip is always a planet, no further check needed' },
      { label: 'A single dip could be noise or a different phenomenon — only a precisely repeating dip is convincing', correct: true },
      { label: 'Because stars only dim once in their lifetime' },
      { label: 'Brightness cannot be measured accurately at all' },
    ],
    right: 'A one-off dip could be instrument noise, a starspot, or something else. Astronomers look for repeatable signals and rule out eclipsing binaries and artifacts before confirming a planet.',
    wrong: 'A repeatable dip makes a planet candidate, not proof: eclipsing binary stars and instrument artifacts can also repeat. Follow-up evidence is needed.',
  },
], {});
