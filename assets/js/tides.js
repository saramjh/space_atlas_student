import { initQuiz } from './quiz-widget.js';
import {tideResultant} from './tide-model.js';

const btnSpring = document.querySelector('#btnSpring');
const btnNeap = document.querySelector('#btnNeap');
const springPanel = document.querySelector('#springPanel');
const neapPanel = document.querySelector('#neapPanel');

function setMode(spring) {
  btnSpring.classList.toggle('active', spring);
  btnNeap.classList.toggle('active', !spring);
  btnSpring.setAttribute('aria-pressed', String(spring));
  btnNeap.setAttribute('aria-pressed', String(!spring));
  springPanel.classList.toggle('active', spring);
  neapPanel.classList.toggle('active', !spring);
}
// Optional equilibrium tide illustration (NOT local tide prediction).
// Lunar and solar quadrupole terms: fixed illustrative amplitude ratio ~2:1,
// consistent with NOAA's statement that solar tide-raising force is ~half lunar.
const tideAngle = document.querySelector('#tideAngle');
const tideShape = document.querySelector('#tideBulgeShape');
const tideMoon = document.querySelector('#tideMoonMarker');
const tideMoonLabel = document.querySelector('#tideMoonText');
const tideReadout = document.querySelector('#tideModelReadout');
const tidePresets = [...document.querySelectorAll('[data-tide-angle]')];
const DEG = Math.PI / 180;
const LUNAR = 12, SOLAR = 6;
const tide3DActivate=document.querySelector('#tideCinemaActivate');
const tide3DStage=document.querySelector('#tideCinemaStage');
const tide3DCanvas=document.querySelector('#tideCinemaCanvas');
const tide3DControls=document.querySelector('#tideCinemaControls');
const tide3DStatus=document.querySelector('#tideCinemaStatus');
const tide3DAngle=document.querySelector('#tideCinemaAngle');
const tide3DAngleValue=document.querySelector('#tideCinemaAngleValue');
const tide3DObserver=document.querySelector('#tideCinemaObserver');
const tide3DObserverValue=document.querySelector('#tideCinemaObserverValue');
const tide3DPlay=document.querySelector('#tideCinemaPlay');
const tide3DFollow=document.querySelector('#tideCinemaFollow');
let tide3DEngine=null,tide3DLoading=false;
function report3D(message){
 tide3DStatus.textContent=message;
 const match=message.match(/Observer marker (\d+)°/);
 if(match){tide3DObserver.value=match[1];tide3DObserverValue.textContent=match[1]+'°';}
 if(message.includes('Observer marker 360°')){
  tide3DPlay.setAttribute('aria-pressed','false');
  tide3DPlay.textContent='Replay observer rotation';
  tide3DStatus.setAttribute('aria-live','polite');
 }
}
function stop3DRotation(){tide3DEngine?.stop();tide3DPlay.setAttribute('aria-pressed','false');tide3DPlay.textContent='Rotate observer (12 s)';tide3DStatus.setAttribute('aria-live','polite');}
if(tide3DActivate){
 tide3DActivate.disabled=false;
 tide3DActivate.addEventListener('click',async()=>{
  if(tide3DLoading)return;
  if(tide3DEngine){
   const next=tide3DStage.hidden;tide3DStage.hidden=!next;tide3DControls.hidden=!next;
   tide3DActivate.setAttribute('aria-pressed',String(next));
   tide3DActivate.textContent=next?'Return to 2D reference':'Enter the 3D tide experiment';
   if(next){tide3DEngine.resize();tide3DEngine.setAngle(Number(tideAngle.value));}else stop3DRotation();return;
  }
  tide3DLoading=true;tide3DActivate.disabled=true;tide3DActivate.textContent='Loading tidal water shell…';
  try{
   const {createTideCinema}=await import('./tide-cinema.js');
   tide3DStage.hidden=false;
   tide3DEngine=await createTideCinema(tide3DCanvas,tide3DStage,report3D);
   tide3DEngine.setAngle(Number(tideAngle.value));
   tide3DControls.hidden=false;
   tide3DPlay.disabled=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   tide3DActivate.setAttribute('aria-pressed','true');tide3DActivate.textContent='Return to 2D reference';tide3DEngine.resize();
  }catch(error){
   tide3DStage.hidden=true;tide3DControls.hidden=true;
   tide3DActivate.setAttribute('aria-pressed','false');tide3DActivate.textContent='Retry 3D water shell';
   tide3DStatus.textContent='3D could not start. The original NOAA-based 2D force model remains accessible.';
   console.warn('Tidal WebGL unavailable; preserving source-linked 2D experiment',error);
  }finally{tide3DLoading=false;tide3DActivate.disabled=false;}
 });
 tide3DAngle.addEventListener('input',()=>setTideAngle(tide3DAngle.value));
 tide3DObserver.addEventListener('input',()=>{
  // Preserve the newly selected value before stop() reports the old frame.
  const v=Number(tide3DObserver.value);stop3DRotation();
  tide3DObserver.value=String(v);tide3DObserverValue.textContent=`${v}°`;
  tide3DEngine?.setObserver(v);
 });
 tide3DPlay.addEventListener('click',()=>{
  if(!tide3DEngine)return;
  if(tide3DEngine.isPlaying()){stop3DRotation();return;}
  if(tide3DEngine.start()){
   tide3DPlay.textContent='Pause rotation';tide3DPlay.setAttribute('aria-pressed','true');
   tide3DStatus.setAttribute('aria-live','off');
  }
 });
 document.querySelector('#tideCinemaReset').addEventListener('click',()=>{
  stop3DRotation();tide3DObserver.value='0';tide3DObserverValue.textContent='0°';tide3DEngine?.setObserver(0);
 });
 document.querySelector('#tideCinemaZoomIn').addEventListener('click',()=>tide3DEngine?.zoomBy(.78));
 document.querySelector('#tideCinemaZoomOut').addEventListener('click',()=>tide3DEngine?.zoomBy(1.28));
 document.querySelector('#tideCinemaRotate').addEventListener('click',()=>tide3DEngine?.rotateBy(.28));
 tide3DFollow.addEventListener('click',()=>{
  const active=tide3DFollow.getAttribute('aria-pressed')!=='true';
  tide3DFollow.setAttribute('aria-pressed',String(active));
  tide3DFollow.textContent=active?'Return to whole-Earth view':'Ride with the observer';
  tide3DEngine?.setFollowObserver(active);
 });
 document.addEventListener?.('visibilitychange',()=>{if(document.hidden)stop3DRotation();});
 if(typeof window!=='undefined')window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',event=>{
  tide3DPlay.disabled=event.matches;if(event.matches)stop3DRotation();
 });
}

function equilibriumContour(angleDegrees) {
  const angle = angleDegrees * DEG;
  const points = [];
  for (let i = 0; i <= 144; i++) {
    const theta = 2 * Math.PI * i / 144;
    // Heavily exaggerated radius, no physical tide-height calibration.
    const r = 70 + LUNAR * Math.cos(2 * (theta - angle)) + SOLAR * Math.cos(2 * theta);
    points.push(`${i === 0 ? 'M' : 'L'} ${(200 + r * Math.cos(theta)).toFixed(2)} ${(132 - r * Math.sin(theta)).toFixed(2)}`);
  }
  return points.join(' ') + ' Z';
}
function setTideAngle(degrees) {
  const angle = Math.min(90, Math.max(0, Number(degrees) || 0));
  tideAngle.value = String(angle);
  if(tide3DAngle)tide3DAngle.value=String(angle);
  if(tide3DAngleValue)tide3DAngleValue.textContent=`${angle}°`;
  tide3DEngine?.setAngle(angle);
  tideShape.setAttribute('d', equilibriumContour(angle));
  const x = 200 + 115 * Math.cos(angle * DEG);
  const y = 132 - 115 * Math.sin(angle * DEG);
  tideMoon.setAttribute('cx', x.toFixed(2));
  tideMoon.setAttribute('cy', y.toFixed(2));
  tideMoonLabel.setAttribute('x', x.toFixed(2));
  tideMoonLabel.setAttribute('y', (y + 22).toFixed(2));
  tidePresets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.tideAngle) === angle)));
  const model=tideResultant(angle);
  const relative=model.percent;
  document.querySelector('#tideResultantBar').style.width=relative.toFixed(1)+'%';
  document.querySelector('#tideResultantValue').textContent=relative.toFixed(0)+
    '% of aligned model · bulge axis '+model.majorAxisDeg.toFixed(1)+'° from Sun reference';
  const state = angle === 0 ? 'Spring pattern: aligned contributions reinforce.' :
    angle === 90 ? 'Neap pattern: perpendicular contributions partially oppose.' :
    'Intermediate alignment: the strength and orientation of the idealized pattern change.';
  tideReadout.textContent = `${angle}° — ${state} Illustrative combined forcing contrast: ${Math.round(relative)}% of this model’s aligned case, not real water height.`;
  if (angle === 0) setMode(true);
  if (angle === 90) setMode(false);
}
btnSpring.onclick = () => setTideAngle(0);
btnNeap.onclick = () => setTideAngle(90);
tideAngle?.addEventListener('input', () => setTideAngle(tideAngle.value));
tidePresets.forEach(button => button.addEventListener('click', () => setTideAngle(button.dataset.tideAngle)));
if (tideAngle && tideShape) setTideAngle(0);

initQuiz([
  {
    q: 'Why do most coastlines get roughly two high tides a day, not one?',
    options: [
      { label: 'The Moon orbits Earth twice a day' },
      { label: 'Earth has tidal bulges on both the near and far side from the Moon, and rotates through both', correct: true },
      { label: 'The Sun causes a separate, extra tide' },
      { label: 'It is random and unpredictable' },
    ],
    right: "Gravity stretches Earth's oceans into two bulges — one on the side facing the Moon, one on the far side. As Earth spins once a day, most locations rotate through both.",
    wrong: "It comes from two tidal bulges — one facing the Moon, one on the opposite side — and Earth's daily rotation carries most coastlines through both.",
  },
  {
    q: 'When do spring tides (the strongest tides) happen?',
    options: [
      { label: 'Only in the spring season' },
      { label: 'At new moon and full moon, when the Sun and Moon align', correct: true },
      { label: 'At first and last quarter moon' },
      { label: 'Randomly, with no pattern' },
    ],
    right: "\"Spring\" here means \"jump up,\" not the season. It happens at new moon and full moon, when the Sun and Moon line up and their tidal pulls add together.",
    wrong: "Despite the name, it's not about the season — spring tides happen at new moon and full moon, when the Sun and Moon align and their pulls combine.",
  },
], {});
