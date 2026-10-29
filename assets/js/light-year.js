import { initQuiz } from './quiz-widget.js';
import { logPosition, LIGHT_DOMAIN, photonProgress, intervalLabel } from './scale-visual-math.js';

const picker = document.querySelector('#lyPicker');
const readout = document.querySelector('#lyReadout');
const NOW_YEAR = new Date().getFullYear();
const photonSlider = document.querySelector('#lyPhotonSlider');
const playButton = document.querySelector('#lyPlay');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cinemaActivate=document.querySelector('#lyCinemaActivate');
const cinemaCanvas=document.querySelector('#lyCinemaCanvas');
const cinemaStage=document.querySelector('#lyCinemaStage');
const cinemaFallback=document.querySelector('#lyCinemaFallback');
const cinemaQuick=document.querySelector('#lyCinemaQuick');
const cinemaQuickPlay=document.querySelector('#lyCinemaQuickPlay');
const cinemaStatus=document.querySelector('#lyCinemaStatus');
let cinemaEngine=null,cinemaLoading=false;
let playing=false,frame=null,lastFrame=null,progress=0;
function setPlaying(value) {
  playing=Boolean(value)&&!document.hidden&&!reduceMotion.matches;
  if(frame!==null)cancelAnimationFrame(frame);
  frame=null;lastFrame=null;
  playButton.setAttribute('aria-pressed',String(playing));
  playButton.textContent=playing?'Pause light journey':'Play this light journey';
  playButton.disabled=reduceMotion.matches;
  if(cinemaStatus)cinemaStatus.setAttribute('aria-live',playing?'off':'polite');
  if(cinemaQuickPlay){cinemaQuickPlay.setAttribute('aria-pressed',String(playing));cinemaQuickPlay.textContent=playing?'Pause':'Play';cinemaQuickPlay.disabled=reduceMotion.matches;}
  if(playing)frame=requestAnimationFrame(advanceJourney);
}
function advanceJourney(time) {
  if(!playing)return;
  if(lastFrame!==null) {
    progress=Math.min(100,progress+Math.min(.15,(time-lastFrame)/1000)*10);
    photonSlider.value=String(Math.round(progress));
    renderPhoton();
    if(progress>=100){setPlaying(false);return;}
  }
  lastFrame=time;
  frame=requestAnimationFrame(advanceJourney);
}
playButton.addEventListener('click',()=>{
  if(playing){setPlaying(false);return;}
  progress=0;photonSlider.value='0';renderPhoton();
  setPlaying(true);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
reduceMotion.addEventListener?.('change',()=>{setPlaying(false);if(cinemaQuickPlay)cinemaQuickPlay.disabled=reduceMotion.matches;});

const sourcePoints = [...document.querySelectorAll('[data-ly-point]')];
let selectedLy = 0.0000158;
let selectedSource = 'The Sun';

function renderPhoton() {
  const percent = Number(photonSlider.value);
  const {progress, elapsedSeconds, remainingSeconds} = photonProgress(selectedLy, percent);
  const elapsed = intervalLabel(elapsedSeconds);
  const remaining = intervalLabel(remainingSeconds);
  const x = (38 + progress * 824).toFixed(2);
  document.querySelector('#lyPhotonTrail').setAttribute('x2', x);
  document.querySelector('#lyPhotonMarker').setAttribute('cx', x);
  document.querySelector('#lyPhotonPercent').textContent = `${percent}%`;
  document.querySelector('#lyPhotonElapsed').textContent = elapsed;
  document.querySelector('#lyPhotonRemaining').textContent = remaining;
  document.querySelector('#lyEmitter').textContent = `${selectedSource} · emitted`;
  document.querySelector('#lyPhotonExplanation').textContent = percent === 0
    ? `At emission, the light from ${selectedSource} still has its entire ${intervalLabel(photonProgress(selectedLy, 100).elapsedSeconds)} journey ahead. Moving the slider does not change the speed of light.`
    : percent === 100
      ? `The light from ${selectedSource} is now arriving at Earth after about ${elapsed} of travel.`
      : `After ${percent}% of this illustrative path, the light has traveled for about ${elapsed}; about ${remaining} remains before it reaches Earth.`;
  document.querySelector('#lyPhotonDiagram').setAttribute('aria-label', `Normalized light path from ${selectedSource} to Earth: ${percent}% complete, ${elapsed} traveled and ${remaining} remaining.`);
  cinemaEngine?.setProgress(percent/100);
  if(cinemaEngine)cinemaStatus.textContent=`${selectedSource} → Earth: ${percent}% of normalized travel. ${elapsed} elapsed; ${remaining} remaining. Cinematic perspective only; not an actual distance scale.`;
}
function updateVisuals(ly, label) {
  setPlaying(false);
  selectedLy = ly;
  selectedSource = label;
  cinemaEngine?.setSource(label);
  const selectedX = (36 + 828 * logPosition(ly, LIGHT_DOMAIN.min, LIGHT_DOMAIN.max)).toFixed(3);
  const line = document.querySelector('#lySelectedTick');
  line.setAttribute('x1', selectedX);
  line.setAttribute('x2', selectedX);
  for (const mark of sourcePoints) {
    const active = Math.abs(Number(mark.dataset.lyPoint) - ly) < 1e-10;
    mark.classList.toggle('active', active);
    mark.setAttribute('r', active ? '7' : '4');
  }
  document.querySelector('#lyDistanceRuler').setAttribute('aria-label', `Logarithmic source distances in light-years; ${label} selected, approximately ${ly} light-years from Earth.`);
  const distanceLabel = ly < 0.001 ? ly.toPrecision(3) : Number(ly.toPrecision(4)).toLocaleString('en-US');
  document.querySelector('#lyCurrentPosition').textContent = `Selected on ruler: ${label} · approximately ${distanceLabel} light-years from Earth`;
  const viewport = document.querySelector('.ly-distance-scroll');
  const plotWidth = viewport.querySelector('svg').getBoundingClientRect().width;
  viewport.scrollLeft = Math.max(0, plotWidth * Number(selectedX) / 900 - viewport.clientWidth / 2);
  renderPhoton();
}
photonSlider.addEventListener('input',()=>{setPlaying(false);progress=Number(photonSlider.value);renderPhoton();});


function describe(ly, label) {
  const seconds = ly * 365.25 * 24 * 3600;
  if (seconds < 60) {
    return `<div class="big">${seconds.toFixed(1)} seconds</div><p>Light from ${label} takes about ${seconds.toFixed(1)} seconds to reach Earth. You are seeing it almost exactly as it is right now.</p>`;
  }
  if (seconds < 3600) {
    const min = seconds / 60;
    return `<div class="big">${min.toFixed(1)} minutes</div><p>Light from ${label} takes about ${min.toFixed(1)} minutes to reach Earth.</p>`;
  }
  if (seconds < 86400) {
    const hrs = seconds / 3600;
    return `<div class="big">${hrs.toFixed(1)} hours</div><p>Light from ${label} takes about ${hrs.toFixed(1)} hours to reach Earth.</p>`;
  }
  const yearsAgo = ly; // 1 light-year of distance = light left 1 year ago
  const yearLeft = Math.round(NOW_YEAR - yearsAgo);
  const yearsAgoStr = yearsAgo >= 1000
    ? yearsAgo.toLocaleString()
    : (Number.isInteger(yearsAgo) ? String(yearsAgo) : yearsAgo.toFixed(2));
  const leftStr = yearsAgo >= 1000
    ? `about ${yearsAgoStr} years ago`
    : `around the year ${yearLeft}`;
  return `<div class="big">${yearsAgoStr} light-years</div><p>The light from ${label} reaching your eyes right now left ${leftStr}. Looking at something far away means looking into the past.</p>`;
}

picker.querySelectorAll('button').forEach((btn) => {
  btn.onclick = () => {
    picker.querySelectorAll('button').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    readout.innerHTML = describe(Number(btn.dataset.ly), btn.textContent);
    updateVisuals(Number(btn.dataset.ly), btn.textContent);
  };
});

const initial = picker.querySelector('button.active') || picker.querySelector('button');
readout.innerHTML = describe(Number(initial.dataset.ly), initial.textContent);
updateVisuals(Number(initial.dataset.ly), initial.textContent);
photonSlider.disabled = false;
playButton.disabled=reduceMotion.matches;
if(cinemaActivate){
 cinemaActivate.disabled=false;
 cinemaActivate.addEventListener('click',async()=>{
  if(cinemaLoading)return;
  if(cinemaEngine){
   const show=cinemaCanvas.hidden;cinemaCanvas.hidden=!show;cinemaFallback.hidden=show;cinemaQuick.hidden=!show;
   cinemaActivate.setAttribute('aria-pressed',String(show));
   cinemaActivate.textContent=show?'Return to labeled reference':'Enter the cinematic light journey';
   if(show){cinemaEngine.resize();cinemaEngine.setSource(selectedSource);cinemaEngine.setProgress(Number(photonSlider.value)/100);}
   else setPlaying(false);
   return;
  }
  cinemaLoading=true;cinemaActivate.disabled=true;cinemaActivate.textContent='Loading light journey…';
  try{
   const {createLookbackCinema}=await import('./light-lookback-cinema.js');
   cinemaCanvas.hidden=false;
   cinemaEngine=createLookbackCinema(cinemaCanvas,cinemaStage,p=>{
    if(document.hidden)return;
    photonSlider.value=String(Math.round(p*100));
    photonSlider.dispatchEvent(new Event('input',{bubbles:true}));
   });
   cinemaFallback.hidden=true;cinemaQuick.hidden=false;
   cinemaEngine.setSource(selectedSource);cinemaEngine.setProgress(Number(photonSlider.value)/100);
   cinemaStatus.textContent=`${selectedSource} → Earth. ${document.querySelector('#lyPhotonElapsed').textContent} elapsed; ${document.querySelector('#lyPhotonRemaining').textContent} remaining.`;
   cinemaQuickPlay.disabled=reduceMotion.matches;
   cinemaActivate.setAttribute('aria-pressed','true');cinemaActivate.textContent='Return to labeled reference';
  }catch(error){
   cinemaCanvas.hidden=true;cinemaFallback.hidden=false;cinemaQuick.hidden=true;
   cinemaActivate.textContent='Retry cinematic view';cinemaActivate.setAttribute('aria-pressed','false');
   cinemaStatus.textContent='Cinematic view unavailable. The original light-travel ruler and slider remain accessible.';
   console.warn('Light lookback Canvas unavailable; original NASA calculation preserved',error);
  }finally{cinemaLoading=false;cinemaActivate.disabled=false;}
 });
 document.querySelector('#lyCinemaSource').addEventListener('click',()=>{
  photonSlider.value='0';photonSlider.dispatchEvent(new Event('input',{bubbles:true}));
 });
 document.querySelector('#lyCinemaEarth').addEventListener('click',()=>{
  photonSlider.value='100';photonSlider.dispatchEvent(new Event('input',{bubbles:true}));
 });
 cinemaQuickPlay.addEventListener('click',()=>playButton.click());
}
picker.querySelectorAll('button').forEach((button) => { button.disabled = false; });
document.querySelector('#lyInitNote').hidden = true;

initQuiz([
  {
    q: 'A light-year measures...',
    options: [
      { label: 'Time — how long a year takes' },
      { label: 'Distance — how far light travels in one year', correct: true },
      { label: 'The brightness of a star' },
      { label: 'How fast a planet orbits' },
    ],
    right: "Despite the word \"year,\" a light-year is a unit of distance — about 9.46 trillion km, the distance light travels in one Earth year.",
    wrong: 'It measures distance, not time — the distance light travels in one year (about 9.46 trillion km), even though the name sounds like a time unit.',
  },
  {
    q: 'If a star is 100 light-years away, when did the light you see tonight leave it?',
    options: [
      { label: 'Right now' },
      { label: 'About 100 years ago', correct: true },
      { label: 'About 100 days ago' },
      { label: 'It has not left yet' },
    ],
    right: "Light takes 100 years to cross 100 light-years, so you're seeing that star as it looked about 100 years ago — not as it looks right now.",
    wrong: "Light travels at a fixed speed, so crossing 100 light-years takes 100 years — you're seeing light that left about a century ago.",
  },
], {});
