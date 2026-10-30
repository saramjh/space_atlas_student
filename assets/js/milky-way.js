import { initQuiz } from './quiz-widget.js';

const STEPS = [
  { title: 'The Solar System', size: '~9 billion km across', desc: 'Home base: the Sun and everything orbiting it.' },
  { title: 'The Orion Arm', size: 'A minor spiral arm', desc: "We're in a smaller, shorter spiral arm — sometimes called the Orion Spur — between two of the Milky Way's major arms." },
  { title: '~26,000 light-years from the center', size: 'About half a nominal ~50,000-light-year disk radius', desc: "We're roughly 26,000 light-years from the galactic center. The galaxy's disk has no sharp edge, and its spiral arms are still being mapped." },
  { title: 'The Milky Way', size: '~100,000 light-years across, ~100-400 billion stars', desc: 'Our entire galaxy — a barred spiral galaxy that takes the Sun about 230 million years to orbit once.' },
];

let index = 0;
const stage = document.querySelector('#mwStage');
const dots = document.querySelector('#mwDots');
const prevBtn = document.querySelector('#mwPrev');
const nextBtn = document.querySelector('#mwNext');
const mw3DActivate=document.querySelector('#mw3DActivate');
const mw3DFrame=document.querySelector('#mwSpatialFrame');
const mw3DCanvas=document.querySelector('#mwSpatialCanvas');
const mw3DActions=document.querySelector('#mw3DActions');
const mw3DReadout=document.querySelector('#mw3DReadout');
const mw3DHomecoming=document.querySelector('#mw3DHomecoming');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let homecoming=false;
function endHomecoming(){
 homecoming=false;mw3DEngine?.cancelHomecoming();
 mw3DHomecoming.setAttribute('aria-pressed','false');
 mw3DHomecoming.textContent='Travel home to the Sun (8 s)';
 mw3DReadout.setAttribute('aria-live','polite');
}
mw3DHomecoming.addEventListener('click',()=>{
 if(homecoming){endHomecoming();return;}
 if(!mw3DEngine||reducedMotion.matches||document.hidden||mw3DFrame.hidden)return;
 endHomecoming();homecoming=true;
 mw3DHomecoming.setAttribute('aria-pressed','true');mw3DHomecoming.textContent='Pause the homecoming';
 mw3DReadout.setAttribute('aria-live','off');
 const okay=mw3DEngine.startHomecoming(
  step=>{index=step;render();mw3DReadout.textContent=`Homecoming stage ${4-step}/4: ${STEPS[step].title}. Illustrative camera route; not a real travel time.`;},
  ()=>{endHomecoming();index=0;render();mw3DReadout.textContent='Arrived near the Sun reference: about 26,000 light-years from the galactic center, inside the Orion Spur (illustrative scene).';},
  ()=>endHomecoming()
 );
 if(!okay)endHomecoming();
});
reducedMotion.addEventListener?.('change',()=>{if(reducedMotion.matches)endHomecoming();mw3DHomecoming.disabled=reducedMotion.matches||!mw3DEngine||mw3DFrame.hidden;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)endHomecoming();});
let mw3DEngine=null, mw3DLoading=false;
function update3DFocus(){
 if(homecoming||!mw3DEngine||mw3DFrame.hidden)return;
 if(index<=1){
  mw3DEngine.focusSun();
  mw3DReadout.textContent=`Stage ${index+1}/4: camera approaches the Sun's approximate position within the Orion Spur (illustrative viewpoint, not an actual 3D star map).`;
 }else{
  mw3DEngine.overview();
  mw3DReadout.textContent=`Stage ${index+1}/4: galactic overview. The cyan Sun reference is about 26,000 light-years from the center; the orange marker follows the separate hypothetical-distance slider.`;
 }
}
function show3D(visible){
 if(!visible)endHomecoming();
 mw3DHomecoming.disabled=!visible||reducedMotion.matches;
 mw3DFrame.hidden=!visible;mw3DActions.hidden=!visible;
 mw3DActivate.setAttribute('aria-pressed',String(visible));
 mw3DActivate.textContent=visible?'Return to radial 2D reference':'Enter the 3D galaxy';
 if(!visible){mw3DEngine?.suspend();mw3DReadout.textContent='The precise distance reference below works without 3D.';}
 else{mw3DEngine?.resize();mw3DEngine?.setHypotheticalDistance(document.querySelector('#mwDistanceSlider').value);update3DFocus();}
}
mw3DActivate.addEventListener('click',async()=>{
 if(mw3DLoading)return;
 if(mw3DEngine){show3D(mw3DFrame.hidden);return;}
 mw3DLoading=true;mw3DActivate.disabled=true;
 mw3DActivate.textContent='Loading local 3D galaxy…';
 mw3DReadout.textContent='Initializing WebGL. The radial ruler below remains usable.';
 try{
  const {createGalaxy3D}=await import('./galaxy-3d.js');
  mw3DFrame.hidden=false;
  mw3DEngine=await createGalaxy3D(mw3DCanvas,mw3DFrame,()=>{}, {galacticAddress:true});
  show3D(true);
 }catch(error){
  mw3DFrame.hidden=true;mw3DActions.hidden=true;
  mw3DActivate.textContent='Retry spatial model';
  mw3DReadout.textContent='3D is unavailable on this device. The 2D radial ruler and NASA explanations remain accessible.';
  console.warn('Milky Way 3D failed; retaining accessible source diagram',error);
 }finally{mw3DLoading=false;mw3DActivate.disabled=false;}
});
for(const [selector,handler] of [
 ['#mw3DOverview',()=>mw3DEngine?.overview()],
 ['#mw3DFocusSun',()=>mw3DEngine?.focusSun()],
 ['#mw3DZoomIn',()=>mw3DEngine?.zoomBy(.78)],
 ['#mw3DZoomOut',()=>mw3DEngine?.zoomBy(1.28)],
 ['#mw3DRotateLeft',()=>mw3DEngine?.rotateBy(-.27)],
 ['#mw3DRotateRight',()=>mw3DEngine?.rotateBy(.27)],
]) document.querySelector(selector).addEventListener('click',()=>{endHomecoming();handler();});
mw3DActivate.disabled=false;

STEPS.forEach(() => dots.appendChild(document.createElement('span')));

function render() {
  const s = STEPS[index];
  stage.innerHTML = `
    <div class="zoom-step-no">Step ${index + 1} of ${STEPS.length}</div>
    <div class="zoom-title">${s.title}</div>
    <div class="zoom-size">${s.size}</div>
    <p class="zoom-desc">${s.desc}</p>
  `;
  [...dots.children].forEach((d, i) => d.classList.toggle('active', i === index));
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === STEPS.length - 1;
  update3DFocus();
}
prevBtn.onclick = () => {endHomecoming(); if (index > 0) { index--; render(); } };
nextBtn.onclick = () => {endHomecoming(); if (index < STEPS.length - 1) { index++; render(); } };
render();

const mwSlider = document.querySelector('#mwDistanceSlider');
const mwMarker = document.querySelector('#mwExplorerMark');
const mwReadout = document.querySelector('#mwAddressReadout');
const MW_RADIUS_LY = 50000;
const MW_RADIUS_SVG = 128;
const MW_CENTER_X = 160;
// Radial model only, not a face-on map of individual Milky Way arms.
// Move only the hypothetical marker; the Sun remains fixed at 26,000 ly.
function setExploreDistance(distanceLy) {
  const bounded = Math.max(0, Math.min(MW_RADIUS_LY, Number(distanceLy) || 0));
  mwSlider.value = String(bounded);
  mwMarker.setAttribute('cx', String(MW_CENTER_X + bounded / MW_RADIUS_LY * MW_RADIUS_SVG));
  mw3DEngine?.setHypotheticalDistance(bounded);
  mwReadout.textContent = `Hypothetical distance: ${bounded.toLocaleString('en-US')} light-years · ${Math.round(bounded / MW_RADIUS_LY * 100)}% of a nominal galactic disk radius. The Sun remains at ≈ 26,000 light-years.`;
}
mwSlider?.addEventListener('input', () => setExploreDistance(mwSlider.value));
document.querySelector('#mwShowSun')?.addEventListener('click', () => setExploreDistance(26000));
if (mwSlider && mwMarker) setExploreDistance(0);

initQuiz([
  {
    q: 'Is Earth located near the center of the Milky Way?',
    options: [
      { label: 'Yes, very close to the center' },
      { label: "No — we're about 26,000 light-years out, within the galaxy's broad disk", correct: true },
    ],
    right: "We're far from the center — about 26,000 light-years out, in a minor spiral arm called the Orion Arm (or Orion Spur).",
    wrong: "We're not near the center at all — Earth sits about 26,000 light-years out, in the Orion Arm, about halfway along a nominal 50,000-light-year disk radius; the edge is not sharp.",
  },
  {
    q: 'About how long does it take the Sun to complete one orbit around the Milky Way\'s center?',
    options: [
      { label: 'About 1 year' },
      { label: 'About 1,000 years' },
      { label: 'About 230 million years', correct: true },
      { label: 'The Sun does not orbit the galaxy' },
    ],
    right: 'About 230 million years — sometimes called a "galactic year." The Sun has only completed a small number of these since it formed.',
    wrong: "It's about 230 million years, sometimes called a \"galactic year\" — the Sun orbits the Milky Way's center just like planets orbit the Sun.",
  },
], {});
