import { initQuiz } from './quiz-widget.js';

// The scale strip is wider than the viewport by design (that's the point —
// feeling how far away the Moon really is), but a wide scrollable box with
// no visible content past the edge doesn't read as scrollable on its own.
// Fade the right edge and hide the "scroll" cue once the user has started.
const scrollEl = document.querySelector('#emscaleScroll');
const fadeEl = document.querySelector('#emscaleFade');
const cueEl = document.querySelector('#emscaleCue');
// One shared scale for both body diameters and center-to-center separation.
// Mean orbital dimensions: NASA Moon Facts and GSFC Moon Fact Sheet.
// Earth equatorial diameter: 12,756 km = 60 px; Moon mean diameter: ~3,474 km = 16.34 px.
const EARTH_DIAMETER_KM = 12756;
const EARTH_DIAMETER_PX = 60;
const MOON_DIAMETER_PX = 16;
const EARTH_CENTER_PX = EARTH_DIAMETER_PX / 2;
const MOON_RADIUS_PX = MOON_DIAMETER_PX / 2;
const kilometersPerPixel = EARTH_DIAMETER_KM / EARTH_DIAMETER_PX;
const moon = document.querySelector('#emscaleMoon');
const moonLabel = document.querySelector('#emscaleMoonLabel');
const readout = document.querySelector('#emscaleDistanceReadout');
const distancePresets = [...document.querySelectorAll('[data-emscale-distance]')];
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const flightActivate=document.querySelector('#emFlightActivate');
const flightCanvas=document.querySelector('#emFlightCanvas');
const flightFallback=document.querySelector('#emFlightFallback');
const flightFrame=document.querySelector('#emFlightFrame');
const flightControls=document.querySelector('#emFlightControls');
const flightSlider=document.querySelector('#emFlightSlider');
const flightPercent=document.querySelector('#emFlightPercent');
const flightOverlay=document.querySelector('#emFlightOverlayProgress');
const flightStatus=document.querySelector('#emFlightStatus');
const flightPlay=document.querySelector('#emFlightPlay');
const flightQuickActions=document.querySelector('#emFlightQuickActions');
const flightQuickPlay=document.querySelector('#emFlightQuickPlay');
let flightEngine=null,flightLoading=false,flightProgress=0,flightDistanceKm=384400;
function syncFlightProgress(next){
 const p=Math.max(0,Math.min(1,Number(next)||0));flightProgress=p;
 if(flightSlider)flightSlider.value=String(Math.round(p*1000));
 if(flightPercent)flightPercent.textContent=Math.round(p*100)+'%';
 if(flightOverlay)flightOverlay.textContent=String(Math.round(p*100)).padStart(2,'0')+'% · '+(p>.99?'MOON APPROACH':p<.01?'DEPARTURE':'IN TRANSIT');
 if(flightStatus)flightStatus.textContent=`Conceptual journey: ${Math.round(p*100)}% of the ${flightDistanceKm.toLocaleString('en-US')} km center separation, equivalent to ${Math.round(p*flightDistanceKm).toLocaleString('en-US')} km along the reference line. This is not a measured spacecraft location.`;
 if(p>=.999&&flightPlay){flightPlay.textContent='Replay the journey';flightPlay.setAttribute('aria-pressed','false');flightQuickPlay.textContent='Replay';flightQuickPlay.setAttribute('aria-pressed','false');flightStatus?.setAttribute('aria-live','polite');}
}
function stopFlight(){flightEngine?.setPlaying(false);flightStatus?.setAttribute('aria-live','polite');if(flightPlay){flightPlay.setAttribute('aria-pressed','false');flightPlay.textContent='Play 12.5-second journey';flightQuickPlay.setAttribute('aria-pressed','false');flightQuickPlay.textContent='Play';}}
function setFlightProgress(p){stopFlight();flightEngine?.setProgress(p);syncFlightProgress(p);}
if(flightActivate){
 flightActivate.disabled=false;
 flightActivate.addEventListener('click',async()=>{
  if(flightLoading)return;
  if(flightEngine){
   const next=flightCanvas.hidden;flightCanvas.hidden=!next;flightFallback.toggleAttribute('hidden',next);flightControls.hidden=!next;flightQuickActions.hidden=!next;
   flightActivate.setAttribute('aria-pressed',String(next));flightActivate.textContent=next?'Return to the illustration':'Launch the perspective journey';
   if(next){flightEngine.resize();flightEngine.setProgress(flightProgress);}else stopFlight();
   return;
  }
  flightLoading=true;flightActivate.disabled=true;flightActivate.textContent='Loading 3D scene…';
  try{
   const {createEarthMoonFlight}=await import('./earth-moon-flight.js');
   flightCanvas.hidden=false;flightFallback.setAttribute('hidden','');
   flightEngine=await createEarthMoonFlight(flightCanvas,flightFrame,(p)=>syncFlightProgress(p));
   flightEngine.setSeparationKm(flightDistanceKm);
   flightControls.hidden=false;flightQuickActions.hidden=false;flightSlider.disabled=false;
   flightActivate.setAttribute('aria-pressed','true');flightActivate.textContent='Return to the illustration';
   flightPlay.disabled=motionReduced.matches;flightQuickPlay.disabled=motionReduced.matches;
   flightEngine.resize();syncFlightProgress(flightProgress);
  }catch(error){
   flightCanvas.hidden=true;flightFallback.removeAttribute('hidden');flightControls.hidden=true;flightQuickActions.hidden=true;
   flightActivate.setAttribute('aria-pressed','false');flightActivate.textContent='Retry 3D journey';
   flightStatus.textContent='3D could not initialize. The exact-scale ruler and NASA data are still available.';
   console.warn('Earth–Moon 3D unavailable; keeping exact-scale reference',error);
  }finally{flightLoading=false;flightActivate.disabled=false;}
 });
 flightSlider.addEventListener('input',()=>setFlightProgress(Number(flightSlider.value)/1000));
 for(const id of ['#emFlightEarth','#emFlightQuickEarth'])document.querySelector(id).addEventListener('click',()=>setFlightProgress(0));
 for(const id of ['#emFlightMoon','#emFlightQuickMoon'])document.querySelector(id).addEventListener('click',()=>setFlightProgress(1));
 function togglePlayback(){
  if(!flightEngine||motionReduced.matches||document.hidden)return;
  if(flightEngine.isPlaying()){stopFlight();return;}
  if(flightProgress>=.999){flightEngine.setProgress(0);syncFlightProgress(0);}
  flightEngine.setPlaying(true);
  flightStatus.setAttribute('aria-live','off');
  flightPlay.textContent='Pause journey';flightPlay.setAttribute('aria-pressed','true');
  flightQuickPlay.textContent='Pause';flightQuickPlay.setAttribute('aria-pressed','true');
 }
 flightPlay.addEventListener('click',togglePlayback);
 flightQuickPlay.addEventListener('click',togglePlayback);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFlight();});
 motionReduced.addEventListener?.('change',()=>{if(motionReduced.matches)stopFlight();flightPlay.disabled=motionReduced.matches;flightQuickPlay.disabled=motionReduced.matches;});
}
function moonLeftAt(distanceKm) {
  return EARTH_CENTER_PX + distanceKm / kilometersPerPixel - MOON_RADIUS_PX;
}
function selectDistance(distanceKm) {
  flightDistanceKm=distanceKm;
  flightEngine?.setSeparationKm(distanceKm);
  if(flightEngine)syncFlightProgress(flightProgress);
  const moonLeft = moonLeftAt(distanceKm);
  moon.style.left = `${moonLeft}px`;
  moonLabel.style.left = `${moonLeft}px`;
  const centerGapInEarths = distanceKm / EARTH_DIAMETER_KM;
  const label = distanceKm === 384400 ? 'Mean' : distanceKm < 384400 ? 'Closer' : 'Farther';
  readout.textContent = `${label} center-to-center distance: ${distanceKm.toLocaleString('en-US')} km (${centerGapInEarths.toFixed(2)} Earth diameters). One pixel ≈ ${Math.round(kilometersPerPixel)} km. Neither body is enlarged.`;
  distancePresets.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.emscaleDistance) === distanceKm)));
}
distancePresets.forEach((button) => button.addEventListener('click', () => selectDistance(Number(button.dataset.emscaleDistance))));
selectDistance(384400);

function navigateTo(body) {
  const target = body === 'moon' ? Math.max(0, moon.offsetLeft - scrollEl.clientWidth / 2 + MOON_RADIUS_PX) : 0;
  scrollEl.scrollTo({ left: target, behavior: motionReduced.matches ? 'instant' : 'smooth' });
}
document.querySelector('#emscaleToEarth').addEventListener('click', () => navigateTo('earth'));
document.querySelector('#emscaleToMoon').addEventListener('click', () => navigateTo('moon'));
if (scrollEl.scrollWidth <= scrollEl.clientWidth + 2) {
  fadeEl.classList.add('hidden');
  cueEl.classList.add('hidden');
} else {
  scrollEl.addEventListener('scroll', () => {
    fadeEl.classList.add('hidden');
    cueEl.classList.add('hidden');
  }, { once: true });
}

initQuiz([
  {
    q: "Why can the Earth-Moon system be shown accurately for both size and distance, when the full solar system can't?",
    options: [
      { label: 'The Moon is not actually that far from Earth' },
      { label: "The size difference and distance are both small enough to fit on one readable diagram", correct: true },
      { label: 'It actually can\'t — this page also compresses something' },
      { label: 'Because the Moon has no size at all' },
    ],
    right: "The Earth-Moon gap (about 30 Earth-diameters) is small enough, and the size difference moderate enough, that both fit on one scrollable strip — unlike the solar system, where Neptune is 30 AU away and Jupiter is 11x Earth's diameter, at scales that don't fit together at all.",
    wrong: "It comes down to the numbers being small enough: about 30 Earth-diameters of distance and a 27% size ratio both fit on one diagram, unlike the solar system's far larger range of scales.",
  },
  {
    q: 'Roughly how many Earth-diameters could fit between Earth and the Moon?',
    options: [
      { label: 'About 3' },
      { label: 'About 30', correct: true },
      { label: 'About 300' },
      { label: 'Less than 1' },
    ],
    right: 'About 30 Earth-diameters — the Moon is roughly 384,400 km away, and Earth is about 12,756 km across.',
    wrong: "It's about 30 Earth-diameters — Earth is about 12,756 km across, and the Moon sits about 384,400 km away.",
  },
], {});
