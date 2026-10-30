import { PLANETS } from './planet-data.js';
import { initQuiz } from './quiz-widget.js';

initQuiz([
  {
    q: 'Why do interactive solar system models compress the distance between planets?',
    options: [
      { label: 'The real distances are not known precisely' },
      { label: 'True-to-scale distances would make inner planets unreadable dots', correct: true },
      { label: 'Compression makes the simulation run faster' },
      { label: 'It has no real reason, it is just a design choice' },
    ],
    right: 'On a true linear scale, Mercury through Mars would land within the first few percent of the screen — indistinguishable and unclickable. Compressing distance keeps every planet individually visible and interactive.',
    wrong: "It's about readability: at a true scale, the four inner planets would overlap into an unclickable blur. Compressing distance is what keeps them individually visible.",
  },
  {
    q: "A model that compresses distance but keeps planet order and relative spacing consistent is still useful for learning which of these?",
    options: [
      { label: 'The exact number of kilometers between planets' },
      { label: 'Which planets are closer to the Sun than others', correct: true },
      { label: 'The exact orbital speed of each planet' },
      { label: 'Nothing — a compressed model teaches nothing reliable' },
    ],
    right: 'Order and relative position (which planet is closer to the Sun) survive compression even when exact distances don\'t. That\'s why the "measurable fact" sections on Space Atlas give the precise numbers separately.',
    wrong: "A compressed model still preserves order — which planet is closer or farther. It's the exact numbers that get lost, which is why this site always states the real numbers separately.",
  },
], {});


const focusPlanet = document.querySelector('#distanceFocusPlanet');
const physicalMark = document.querySelector('#distancePhysicalMarker');
const sceneMark = document.querySelector('#distanceSceneMarker');
const focusReadout = document.querySelector('#distanceFocusReadout');
const MAX_AU = 30.05;
const MAX_SCENE_RADIUS = PLANETS.at(-1).orbit;
const guidedPlay=document.querySelector('#distanceGuidedPlay');
const guidedRestart=document.querySelector('#distanceGuidedRestart');
const guidedCounter=document.querySelector('#distanceGuidedCounter');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let guided=false,guidedFrame=null,guidedStart=null,guidedIndex=-1;
function stopGuided(){
 guided=false;if(guidedFrame!==null)cancelAnimationFrame(guidedFrame);
 guidedFrame=null;guidedStart=null;
 guidedPlay.setAttribute('aria-pressed','false');guidedPlay.textContent='Travel through 8 planets (12 s)';
 guidedCounter.setAttribute('aria-live','polite');
}
function stepGuided(now){
 guidedFrame=null;if(!guided||document.hidden||reducedMotion.matches)return stopGuided();
 if(guidedStart===null)guidedStart=now;
 const elapsed=now-guidedStart;
 const index=Math.min(7,Math.floor(elapsed/1500));
 if(index!==guidedIndex){guidedIndex=index;focusPlanet.value=PLANETS[index].name;tracePlanet(focusPlanet.value);guidedCounter.textContent=`Stop ${index+1}/8 · ${focusPlanet.value}. The physical ruler is linear in AU; the interactive scene ruler is deliberately compressed and spread out.`;}
 if(elapsed>=12000){stopGuided();return;}
 guidedFrame=requestAnimationFrame(stepGuided);
}
guidedPlay.addEventListener('click',()=>{
 if(guided)return stopGuided();if(reducedMotion.matches||document.hidden)return;
 stopGuided();guided=true;guidedIndex=-1;guidedCounter.setAttribute('aria-live','off');
 guidedPlay.setAttribute('aria-pressed','true');guidedPlay.textContent='Pause ruler journey';guidedFrame=requestAnimationFrame(stepGuided);
});
guidedRestart.addEventListener('click',()=>{stopGuided();focusPlanet.value='Mercury';tracePlanet('Mercury');guidedCounter.textContent='Mercury · restart. Select a distant planet to inspect the difference.';});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGuided();});
reducedMotion.addEventListener?.('change',()=>{if(reducedMotion.matches)stopGuided();guidedPlay.disabled=reducedMotion.matches;});
guidedPlay.disabled=reducedMotion.matches;

function tracePlanet(name) {
  const p = PLANETS.find(planet => planet.name === name);
  if (!p) return;
  const au = Number.parseFloat(p.au);
  const actualFraction = 100 * au / MAX_AU;
  const sceneFraction = 100 * p.orbit / MAX_SCENE_RADIUS;
  physicalMark.style.left = `${actualFraction.toFixed(4)}%`;
  sceneMark.style.left = `${sceneFraction.toFixed(4)}%`;
  focusReadout.textContent = `${p.name}: ${au.toFixed(2)} AU (${actualFraction.toFixed(2)}% of the 30.05 AU physical ruler), but ${p.orbit} scene units (${sceneFraction.toFixed(2)}% of the ${MAX_SCENE_RADIUS}-unit illustrative ruler). The drawn scene fraction is ${(sceneFraction/actualFraction).toFixed(2)}× the linear-AU fraction for this planet, relative to Neptune on each ruler. These positions do not describe current orbital positions.`;
}
focusPlanet?.addEventListener('change', () => {stopGuided();tracePlanet(focusPlanet.value);});
if (focusPlanet && physicalMark && sceneMark) tracePlanet(focusPlanet.value);

const modelEarthDistance = document.querySelector('#modelEarthDistance');
const modelDistanceUnit = document.querySelector('#modelDistanceUnit');
const modelDistanceGrid = document.querySelector('#modelDistanceGrid');

function renderModelDistances() {
  if (!modelEarthDistance || !modelDistanceUnit || !modelDistanceGrid) return;
  const earthDistance = Math.max(0, Number(modelEarthDistance.value) || 0);
  const unit = modelDistanceUnit.value;
  modelDistanceGrid.innerHTML = PLANETS.map((planet) => {
    const au = Number.parseFloat(planet.au);
    const distance = earthDistance * au;
    const digits = distance >= 100 ? 0 : distance >= 10 ? 1 : 2;
    return `<div class="weight-cell${planet.name === 'Earth' ? ' you' : ''}">
      <div class="planet">${planet.name}</div>
      <div class="val">${distance.toFixed(digits)} ${unit}</div>
      <div class="sub">${planet.au} from the Sun</div>
    </div>`;
  }).join('');
}

modelEarthDistance?.addEventListener('input', renderModelDistances);
modelDistanceUnit?.addEventListener('change', renderModelDistances);
renderModelDistances();
