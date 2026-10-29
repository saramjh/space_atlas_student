import { initQuiz } from './quiz-widget.js';


// Geometric sky projection of a conceptual face-on spiral disc, not a new
// galaxy type, 3D reconstruction, observed pixels or classification tool.
const incline = document.querySelector('#galaxyInclination');
const disk = document.querySelector('#galaxyTiltDisk');
const readout = document.querySelector('#galaxyAngleOutput');
const galaxy3DActivate=document.querySelector('#galaxy3DActivate');
const galaxy3DStatus=document.querySelector('#galaxy3DStatus');
const galaxy3DCanvas=document.querySelector('#galaxy3DCanvas');
const galaxy3DShell=document.querySelector('#galaxy3DShell');
const galaxy3DPlay=document.querySelector('#galaxy3DPlay');
const galaxy2D=document.querySelector('.galaxy-view-image');
const galaxyZoomActions=document.querySelector('#galaxyZoomActions');
const galaxyOverlay=document.querySelector('#galaxy3DOverlay');
const galaxyOrbitMotion=document.querySelector('#galaxyOrbitMotion');
let driftPlaying=false;
function stopDrift(){
 driftPlaying=false;
 engine?.setMotion(false);
 galaxyOrbitMotion.setAttribute('aria-pressed','false');
 galaxyOrbitMotion.textContent='Animate stellar drift';
 galaxyOrbitMotion.disabled=reduceMotion.matches;
}
function toggle3DControls(enabled){
 galaxyZoomActions.hidden=!enabled;
 galaxyOverlay.hidden=!enabled;
 if(!enabled){engine?.suspend();stopDrift();}
}
for(const [id,factor] of [['galaxyZoomIn',.77],['galaxyZoomOut',1.3]]){
 document.querySelector('#'+id).addEventListener('click',()=>engine?.zoomBy(factor));
}
document.querySelector('#galaxyCameraReset').addEventListener('click',()=>{if(engine){stopSweep();engine.reset();}});
galaxyOrbitMotion.addEventListener('click',()=>{
 if(!engine || reduceMotion.matches || galaxy3DCanvas.hidden)return;
 driftPlaying=!driftPlaying;
 engine.setMotion(driftPlaying);
 galaxyOrbitMotion.setAttribute('aria-pressed',String(driftPlaying));
 galaxyOrbitMotion.textContent=driftPlaying?'Pause stellar drift':'Animate stellar drift';
});
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let engine=null,loading=false,playing=false,frameId=null,lastFrame=null,travel=0;
function stopSweep(){
 playing=false;
 if(frameId!==null)cancelAnimationFrame(frameId);
 frameId=null;lastFrame=null;
 galaxy3DPlay.setAttribute('aria-pressed','false');
 galaxy3DPlay.textContent='Sweep viewing angle (8 s)';
 galaxy3DPlay.disabled=reduceMotion.matches;
}
function sweepFrame(now){
 if(!playing)return;
 if(lastFrame!==null){
  const delta=Math.min(.1,Math.max(0,(now-lastFrame)/1000))*20;
  travel+=delta;
  const angle=travel<=80?travel:160-travel;
  setInclination(Math.min(80,Math.max(0,Math.round(angle))));
  if(travel>=160){stopSweep();return;}
 }
 lastFrame=now;frameId=requestAnimationFrame(sweepFrame);
}
galaxy3DPlay.addEventListener('click',()=>{
 if(playing){stopSweep();return;}
 if(reduceMotion.matches)return;
 travel=0;setInclination(0);playing=true;
 galaxy3DPlay.setAttribute('aria-pressed','true');
 galaxy3DPlay.textContent='Pause angle sweep';
 frameId=requestAnimationFrame(sweepFrame);
});
galaxy3DActivate.addEventListener('click',async()=>{
 if(loading)return;
 if(engine){
  stopSweep();
  const enabled=galaxy3DCanvas.hidden;
  galaxy3DCanvas.hidden=!enabled;galaxy2D.hidden=enabled;
  toggle3DControls(enabled);
  galaxy3DActivate.setAttribute('aria-pressed',String(enabled));
  galaxy3DActivate.textContent=enabled?'Return to labeled 2D':'Explore this galaxy in 3D';
  if(enabled){engine.resize();engine.update(Number(incline.value));}
  return;
 }
 loading=true;galaxy3DShell.setAttribute('aria-busy','true');
 galaxy3DStatus.hidden=true;
 galaxy3DActivate.disabled=true;galaxy3DActivate.textContent='Loading spatial model…';
 try{
  const {createGalaxy3D}=await import('./galaxy-3d.js');
  engine=await createGalaxy3D(galaxy3DCanvas,galaxy3DShell,(angle)=>{stopSweep();setInclination(angle);});
  galaxy3DCanvas.hidden=false;galaxy2D.hidden=true;
  toggle3DControls(true);
  galaxy3DActivate.setAttribute('aria-pressed','true');
  galaxy3DActivate.textContent='Return to labeled 2D';
  galaxy3DStatus.hidden=true;
  engine.resize();engine.update(Number(incline.value));
 }catch(error){
  galaxy3DCanvas.hidden=true;galaxy2D.hidden=false;
  toggle3DControls(false);
  galaxy3DActivate.textContent='Retry 3D view';
  galaxy3DActivate.setAttribute('aria-pressed','false');
  galaxy3DStatus.textContent='The 3D model could not load. The labeled 2D comparison is still available; retry if WebGL becomes available.';
  galaxy3DStatus.hidden=false;
  console.warn('Galaxy 3D unavailable, keeping accessible SVG.',error);
 }finally{loading=false;galaxy3DActivate.disabled=false;galaxy3DShell.setAttribute('aria-busy','false');}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSweep();stopDrift();}});
reduceMotion.addEventListener?.('change',()=>{stopSweep();stopDrift();});
galaxy3DPlay.disabled=reduceMotion.matches;
galaxyOrbitMotion.disabled=reduceMotion.matches;

const presets = [...document.querySelectorAll('[data-galaxy-angle]')];
function setInclination(angle) {
  const deg = Math.max(0, Math.min(80, Number(angle) || 0));
  const apparentMinorMajor = Math.cos(deg * Math.PI / 180);
  incline.value = String(deg);
  if(engine)engine.update(deg);
  disk.setAttribute('transform', `translate(160 110) scale(1 ${apparentMinorMajor.toFixed(4)}) translate(-160 -110)`);
  const mode = deg === 0 ? 'Face-on: curved arms are clearly visible.' :
               deg >= 70 ? 'Nearly edge-on: projection hides much of the spiral pattern.' :
               'Inclined: arms look flattened by the viewing angle.';
  readout.textContent = `${deg}° · projected thin-disk axis ratio ≈ ${apparentMinorMajor.toFixed(2)}. ${mode} The galaxy itself did not change type.`;
  presets.forEach(btn => btn.setAttribute('aria-pressed', String(Number(btn.dataset.galaxyAngle) === deg)));
}
incline?.addEventListener('input', () => {stopSweep();setInclination(incline.value);});
presets.forEach(btn => btn.addEventListener('click', () => {stopSweep();setInclination(btn.dataset.galaxyAngle);}));
if (incline && disk) setInclination(0);
galaxy3DActivate.disabled=false; // Enabled only after the event listener is registered.

initQuiz([
  {
    q: 'What shape is the Milky Way galaxy?',
    options: [
      { label: 'Elliptical' },
      { label: 'Spiral', correct: true },
      { label: 'Irregular' },
      { label: 'Perfectly spherical' },
    ],
    right: 'The Milky Way is a spiral galaxy — a flat, rotating disc with curved arms of stars and gas, similar in shape to the Andromeda Galaxy.',
    wrong: "It's a spiral galaxy — a rotating disc with curved arms, the same general shape as our neighbor Andromeda.",
  },
  {
    q: 'An irregular galaxy usually got its shape from...',
    options: [
      { label: 'Being born that way and never changing' },
      { label: 'A collision or close gravitational encounter with another galaxy', correct: true },
      { label: 'Spinning too fast' },
      { label: 'Having no stars at all' },
    ],
    right: 'Irregular galaxies typically lost their organized structure through a collision or close gravitational interaction with a neighboring galaxy.',
    wrong: 'It usually comes from a collision or close gravitational encounter with another galaxy, which disrupts any organized spiral or elliptical structure.',
  },
], {});
