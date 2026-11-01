// Moon Orbit Catcher — a game clock controlling the existing idealized fixed-Sun model.
// Schematic orbital motion is NOT a gravitational orbit or a live sky forecast.
// https://science.nasa.gov/moon/moon-phases/
import { moonModelAtDegrees } from './moon-geometry.js';

export const MOON_MISSIONS = Object.freeze([
 {key:'quarter',gameplay:'guided',target:90,tolerance:18,prompt:'Follow the glow: catch a waxing half Moon.',
  clue:'The bright portion is growing. “Quarter” refers to a quarter of the cycle, not 25% bright.',
  hint:'Move about one quarter of the way from New Moon toward Full Moon. The right half is bright in this northern-view schematic.',
  explanation:'First Quarter: half of the disk we see is illuminated. “Quarter” means a quarter of the phase cycle.',
  routeWhy:'We enlarged the Moon and compressed the orbit here. How far apart are Earth and Moon really?',
  targetLabel:'Target: right half bright, a waxing First Quarter Moon.',
  discovery:{title:'How far away is the Moon, really?',teaser:'Our game squeezes Earth and Moon together. The next lesson lets you travel between them, then use a true-scale ruler.',question:'Is the distance between Earth and Moon drawn to scale in this game?',choices:['Yes, just like space','No, it is compressed'],correct:1,reason:'Right: this game compresses the distance. The average center-to-center separation is about 384,400 km.',routeLabel:'Try the Earth–Moon distance journey →'}},
 {key:'full',gameplay:'precision',target:180,tolerance:9,prompt:'Precision catch: find the Full Moon.',
  clue:'The Moon is opposite the Sun, on the far side of Earth.',
  hint:'Look for the Moon on the right side of the model orbit, opposite the Sun.',
  explanation:'Full Moon: we see almost the entire sunlit hemisphere. Ordinary phases are not Earth’s shadow.',
  routeWhy:'Full Moon happens every month, but lunar eclipses do not. Why?',
  targetLabel:'Target: fully illuminated Full Moon disk.',
  discovery:{title:'Why is every Full Moon not an eclipse?',teaser:'In the next simulator, change the Moon’s tilted orbit and node direction. See when the alignment misses.',question:'Does every Full Moon produce a lunar eclipse?',choices:['No, the Moon usually misses the shadow','Yes, every month'],correct:0,reason:'Right: the Moon’s orbit is tilted about 5° to Earth’s orbital plane. Most Full Moons pass above or below Earth’s shadow.',routeLabel:'Try the eclipse and tilted-orbit simulator →'}},
 {key:'waning',gameplay:'mystery',target:315,tolerance:14,prompt:'Mystery orbit: find a waning crescent.',
  clue:'This narrow crescent is shrinking toward New Moon.',
  hint:'After Last Quarter but before New Moon, look for the thin bright left edge in the northern-view schematic.',
  explanation:'Waning Crescent: only a narrow part of the sunlit hemisphere faces us and its visible fraction is decreasing.',
  routeWhy:'Why does the bright fraction change even when the Moon keeps almost the same face toward Earth?',
  targetLabel:'Target: thin left bright crescent, a waning Moon.',
  discovery:{title:'Does the Moon turn its back on Earth?',teaser:'Change the Moon’s spin in the next model and compare what an observer on Earth would see.',question:'Do the changing phases mean Earth sees a different side of the Moon each month?',choices:['Yes, it turns a new face toward us','No, it keeps nearly the same face'],correct:1,reason:'Right: synchronous rotation keeps nearly the same lunar face pointing toward Earth. Phase changes come from sunlight and viewing geometry.',routeLabel:'Experiment with tidal locking →'}},
]);

export function shortestOrbitDistance(a,b){
 if(!Number.isFinite(a)||!Number.isFinite(b)) throw new RangeError('Angles must be finite');
 return Math.abs(((a-b+540)%360)-180);
}
export function matchesMoonMission(angle,mission){
 if(!mission||!Number.isFinite(mission.target)||!Number.isFinite(mission.tolerance)) throw new TypeError('Invalid Moon mission');
 return shortestOrbitDistance(angle,mission.target)<=mission.tolerance;
}
export function advanceMoonOrbit(angle,speed,dt){
 if(![angle,speed,dt].every(Number.isFinite)||dt<0) throw new RangeError('Invalid orbit step');
 return ((angle+speed*dt)%360+360)%360;
}
export function orbitPoint(degrees){
 const t=degrees*Math.PI/180;
 return {x:210-90*Math.cos(t),y:121-90*Math.sin(t)};
}
function arcPath(degrees,tolerance){
 const a=orbitPoint(degrees-tolerance),b=orbitPoint(degrees+tolerance);
 return 'M'+a.x.toFixed(2)+' '+a.y.toFixed(2)+' A90 90 0 0 0 '+b.x.toFixed(2)+' '+b.y.toFixed(2);
}
function emit(name,params={}){
 if(typeof window.gtag!=='function')return;
 window.gtag('event',name,{event_category:'moon_learning',page_key:'moon_phases',...params});
}

export function initMoonMissions({drawMoon,getAngle,setAngle}){
 const root=document.querySelector('[data-moon-missions]');
 if(!root)return {sync(){}};
 const $=id=>root.querySelector('#'+id);
 const start=$('moonMissionStart'),play=$('moonMissionPlay'),progress=$('moonMissionProgress');
 const prompt=$('moonMissionPrompt'),clue=$('moonMissionClue');
 const target=$('moonMissionTarget'),current=$('moonMissionCurrent'),fraction=$('moonMissionFraction');
 const dial=$('moonMissionAngle'),capture=$('moonMissionCheck'),brake=$('moonMissionBrake');
 const boost=$('moonMissionBoost'),pause=$('moonMissionPause'),hint=$('moonMissionHint');
 const next=$('moonMissionNext'),restart=$('moonMissionRestart'),feedback=$('moonMissionFeedback');
 const routes=$('moonMissionRoutes');
 const discoveryTitle=$('moonMissionDiscoveryTitle'),discoveryTeaser=$('moonMissionDiscoveryTeaser');
 const discoveryQuestion=$('moonMissionDiscoveryQuestion'),discoveryAnswer=$('moonMissionDiscoveryAnswer');
 const discoveryFeedback=$('moonMissionDiscoveryFeedback'),discoveryPreview=$('moonMissionDiscoveryPreview');
 const discoveryChoices=[...root.querySelectorAll('[data-moon-discovery-answer]')];
 const discoveryPreviews=[...root.querySelectorAll('[data-moon-discovery-preview]')];
 const links=[...root.querySelectorAll('[data-moon-mission-route]')];
 const precision=$('moonMissionPrecision'),arena=$('moonMissionArena');
 const orbiter=$('moonMissionOrbiter'),sightline=$('moonMissionSightline');
 const goal=$('moonMissionGoal'),arc=$('moonMissionTargetArc');
 const signal=$('moonMissionSignal'),speedOutput=$('moonMissionSpeed');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 root.classList.toggle('is-reduced',reduced.matches);
 let started=false,solved=false,round=0,attempts=0,completed=0,discoveryAnswered=false;
 let angle=getAngle(),running=false,dragging=null,brakeHeld=false,boostHeld=false;
 let frame=null,lastFrame=null,lastPaint=null;

 function hideRoutes(){
  routes.hidden=true;links.forEach(a=>a.hidden=true);
  discoveryPreviews.forEach(p=>p.setAttribute('hidden',''));
  discoveryFeedback.textContent='';
  discoveryAnswered=false;
  discoveryChoices.forEach(b=>{b.disabled=false;b.setAttribute('aria-pressed','false');b.classList.remove('is-correct','is-incorrect');});
 }
 function revealGoal(){
  goal.removeAttribute('hidden');arc.removeAttribute('hidden');signal.parentElement.hidden=false;
 }
 function showDiscovery(mission){
  const item=mission.discovery;
  discoveryTitle.textContent=item.title;
  discoveryTeaser.textContent=item.teaser;
  discoveryQuestion.textContent=item.question;
  discoveryPreview.setAttribute('aria-label','Preview of next lesson: '+item.title);
  discoveryChoices.forEach((button,index)=>button.textContent=item.choices[index]);
  discoveryPreviews.forEach(preview=>preview.toggleAttribute('hidden',preview.dataset.moonDiscoveryPreview!==mission.key));
  const link=links.find(a=>a.dataset.moonMissionRoute===mission.key);
  if(link){link.hidden=false;link.textContent=item.routeLabel;}
  routes.hidden=false;
  // A captured phase is an explicit interaction. Reveal the next exploration
  // below the game controls when its heading would otherwise be invisible.
  const activeRoute=links.find(link=>!link.hidden);
  if(activeRoute && activeRoute.getBoundingClientRect().bottom > innerHeight - 30){
    // An explicit capture reveals the next learning action, not a surprise scroll on load.
    // scroll-margin-top keeps the discovery label clear of the sticky site header.
    routes.scrollIntoView({block:'start',behavior:'instant'});
  }
 }
 function paintOrbit(){
  const p=orbitPoint(angle);
  orbiter.setAttribute('transform','translate('+p.x.toFixed(2)+' '+p.y.toFixed(2)+')');
  sightline.setAttribute('x2',p.x.toFixed(2));sightline.setAttribute('y2',p.y.toFixed(2));
  const near=matchesMoonMission(angle,MOON_MISSIONS[round]);
  signal.classList.toggle('is-near',near && !signal.parentElement.hidden);
  goal.classList.toggle('is-near',near);
  dial.value=String(Math.round(angle));
  fraction.textContent=Math.round(moonModelAtDegrees(angle).illuminatedFraction*100)+'% bright';
  drawMoon(angle*Math.PI/180,current);
 }
 function sync(value){
  if(!started)return;
  angle=((value%360)+360)%360;
  paintOrbit();
 }
 function setGameAngle(value){
  angle=((value%360)+360)%360;
  setAngle(Math.round(angle));
  paintOrbit();
 }
 function cancelTick(){
  if(frame!==null)cancelAnimationFrame(frame);
  frame=null;lastFrame=null;lastPaint=null;
 }
 function setRunning(on){
  running=Boolean(on&&started&&!solved&&!document.hidden&&!reduced.matches);
  if(!running)cancelTick();
  pause.textContent=running?'Pause orbit':(reduced.matches?'Manual mode':'Resume orbit');
  pause.disabled=reduced.matches||solved;
  pause.setAttribute('aria-pressed',String(!running&&!solved));
  if(running){lastFrame=null;frame=requestAnimationFrame(tick);}
  else speedOutput.textContent=reduced.matches?'Manual orbit · reduced motion':'Orbit paused';
 }
 function tick(now){
  if(!running)return;
  const dt=lastFrame===null?0:Math.min(.07,Math.max(0,(now-lastFrame)/1000));
  lastFrame=now;
  const normal=MOON_MISSIONS[round].gameplay==='precision'?29:22;
  const speed=brakeHeld?6:boostHeld?62:normal;
  speedOutput.textContent='Orbiting · '+speed+'°/s';
  angle=advanceMoonOrbit(angle,speed,dt);
  if(lastPaint===null||now-lastPaint>=48){setGameAngle(angle);lastPaint=now;}
  frame=requestAnimationFrame(tick);
 }
 function prepareRound(){
  setRunning(false);solved=false;attempts=0;root.classList.remove('is-captured');
  const mission=MOON_MISSIONS[round];
  progress.textContent='Challenge '+(round+1)+' / '+MOON_MISSIONS.length;
  prompt.textContent=mission.prompt;clue.textContent=mission.clue;
  target.setAttribute('aria-label',mission.targetLabel);
  drawMoon(mission.target*Math.PI/180,target);
  const p=orbitPoint(mission.target);
  goal.setAttribute('cx',p.x.toFixed(2));goal.setAttribute('cy',p.y.toFixed(2));
  arc.setAttribute('d',arcPath(mission.target,mission.tolerance));
  const mystery=mission.gameplay==='mystery';
  goal.toggleAttribute('hidden',mystery);arc.toggleAttribute('hidden',mystery);
  signal.parentElement.hidden=mystery;
  [capture,brake,boost,hint,pause].forEach(b=>b.hidden=false);
  next.hidden=true;restart.hidden=true;hideRoutes();
  angle=(mission.target-55+360)%360;
  setGameAngle(angle);
  feedback.textContent=reduced.matches
   ? 'Manual mode: drag the Moon or use the slider, then capture the target phase.'
   : mission.gameplay==='mystery'
    ? 'The gold target is hidden. Compare the Moon disks to find the right orbit. Need help? Use Clue.'
    : mission.gameplay==='precision'
     ? 'Narrow window! Brake before the Full Moon target, then capture it. No timer or penalty.'
     : 'Follow the glowing target. Hold Slow nearby, then capture the waxing half Moon.';
  setRunning(true);
 }
 start.addEventListener('click',()=>{
  started=true;round=0;completed=0;start.hidden=true;
  root.classList.add('is-playing');start.setAttribute('aria-expanded','true');
  play.hidden=false;
  if(reduced.matches)precision.open=true;
  prepareRound();emit('moon_mission_start',{mode:reduced.matches?'manual':'orbit'});
  if(window.matchMedia('(max-width:820px)').matches)play.scrollIntoView({block:'start',behavior:'instant'});
  capture.focus({preventScroll:true});
 });
 dial.addEventListener('input',()=>{
  if(!started||solved)return;
  setRunning(false);setGameAngle(Number(dial.value));
 });
 function pointerAngle(e){
  const matrix=arena.getScreenCTM();
  if(!matrix)return null;
  const pt=arena.createSVGPoint();
  pt.x=e.clientX;pt.y=e.clientY;
  const local=pt.matrixTransform(matrix.inverse());
  const dx=local.x-210,dy=local.y-121,dist=Math.hypot(dx,dy);
  if(dist<45||dist>119)return null;
  return (Math.atan2(-dy,-dx)*180/Math.PI+360)%360;
 }
 arena.addEventListener('pointerdown',e=>{
  if(!started||solved)return;
  const value=pointerAngle(e);
  if(value===null)return;
  setRunning(false);dragging=e.pointerId;arena.setPointerCapture(e.pointerId);setGameAngle(value);
 });
 arena.addEventListener('pointermove',e=>{
  if(dragging!==e.pointerId)return;
  const value=pointerAngle(e);
  if(value!==null)setGameAngle(value);
 });
 function finishDrag(e){
  if(dragging!==e.pointerId)return;
  dragging=null;if(arena.hasPointerCapture(e.pointerId))arena.releasePointerCapture(e.pointerId);
 }
 arena.addEventListener('pointerup',finishDrag);
 arena.addEventListener('pointercancel',finishDrag);
 arena.addEventListener('lostpointercapture',()=>dragging=null);
 arena.addEventListener('keydown',e=>{
  if(!started||solved||!['ArrowLeft','ArrowRight',' '].includes(e.key))return;
  e.preventDefault();
  if(e.key===' '){capture.click();return;}
  setRunning(false);
  setGameAngle(advanceMoonOrbit(angle,e.key==='ArrowRight'?4:-4,1));
 });
 function hold(button,type){
  const update=on=>{
   if(type==='brake')brakeHeld=on;else boostHeld=on;
   button.classList.toggle('is-held',on);button.setAttribute('aria-pressed',String(on));
  };
  button.addEventListener('pointerdown',e=>{
   if(solved||reduced.matches)return;
   update(true);button.setPointerCapture(e.pointerId);
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>button.addEventListener(t,()=>update(false)));
  button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')update(true);});
  button.addEventListener('keyup',()=>update(false));
  button.addEventListener('blur',()=>update(false));
 }
 hold(brake,'brake');hold(boost,'boost');
 pause.addEventListener('click',()=>{
  if(solved)return;
  setRunning(!running);
  feedback.textContent=running?'Orbit resumed. Catch the Moon in the golden arc.':
   'Orbit paused. Drag the Moon or use the manual dial to choose a position.';
  emit('moon_mission_pause_toggle',{paused:!running});
 });
 hint.addEventListener('click',()=>{
  if(solved)return;
  feedback.textContent=MOON_MISSIONS[round].hint;
  if(MOON_MISSIONS[round].gameplay==='mystery')revealGoal();
  emit('moon_mission_hint',{mission_key:MOON_MISSIONS[round].key});
 });
 capture.addEventListener('click',()=>{
  if(!started||solved)return;
  const mission=MOON_MISSIONS[round];
  attempts++;
  const matched=matchesMoonMission(angle,mission);
  if(attempts===1)emit('moon_mission_first_check',{mission_key:mission.key,matched});
  emit('moon_mission_catch_attempt',{mission_key:mission.key,matched});
  if(!matched){
   const error=Math.round(shortestOrbitDistance(angle,mission.target));
   if(attempts>=2 && mission.gameplay==='mystery')revealGoal();
   feedback.textContent='Not yet — '+error+'° from the target. '+(running?
    'Slow down before the glowing arc and try again.':'Drag onto the arc or resume the orbit.')+
    (attempts>=2?' '+mission.hint:'');
   return;
  }
  setRunning(false);solved=true;completed++;root.classList.add('is-captured');
  setGameAngle(mission.target);
  feedback.textContent='Phase captured! '+mission.explanation+' The model shows the exact named reference.';
  [capture,brake,boost,hint,pause].forEach(b=>b.hidden=true);
  revealGoal();
  hideRoutes();showDiscovery(mission);
  emit('moon_mission_complete',{mission_key:mission.key,mission_number:round+1});
  if(round<MOON_MISSIONS.length-1)next.hidden=false;
  else {
   progress.textContent='All three Moon phases captured';
   restart.hidden=false;
   feedback.textContent+=' All three orbit challenges completed.';
   emit('moon_mission_all_complete',{completed_missions:completed});
  }
  (next.hidden ? restart : next).focus({preventScroll:true});
 });
 discoveryChoices.forEach((button,index)=>button.addEventListener('click',()=>{
  if(!solved||routes.hidden||discoveryAnswered)return;
  discoveryAnswered=true;
  const item=MOON_MISSIONS[round].discovery;
  const correct=index===item.correct;
  discoveryChoices.forEach((choice,i)=>{
   choice.disabled=true;
   choice.setAttribute('aria-pressed',String(i===index));
   if(i===index)choice.classList.add(correct?'is-correct':'is-incorrect');
  });
  discoveryFeedback.textContent=(correct?'You predicted it! ':'A useful question to test. ')+item.reason+
   ' Open the next experiment to try it yourself.';
  emit('moon_discovery_answer',{mission_key:MOON_MISSIONS[round].key,correct});
 }));
 next.addEventListener('click',()=>{
  if(!solved||round>=MOON_MISSIONS.length-1)return;
  round++;prepareRound();capture.focus({preventScroll:true});
 });
 restart.addEventListener('click',()=>{
  if(!solved||round!==MOON_MISSIONS.length-1)return;
  round=0;completed=0;prepareRound();capture.focus({preventScroll:true});
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)setRunning(false);});
 window.addEventListener('blur',()=>{
  brakeHeld=false;boostHeld=false;brake.classList.remove('is-held');boost.classList.remove('is-held');
  if(running)setRunning(false);
 });
 reduced.addEventListener?.('change',()=>{
  root.classList.toggle('is-reduced',reduced.matches);
  if(reduced.matches){
   setRunning(false);precision.open=true;
   feedback.textContent='Manual mode: move the Moon with arrow keys or the slider. No automatic motion.';
  }
 });
 document.querySelector('[data-moon-mission-entry]')?.addEventListener('click',()=>emit('moon_mission_entry_click'));
 links.forEach(link=>link.addEventListener('click',()=>{
  if(!link.hidden)emit('moon_mission_next_topic',{mission_key:link.dataset.moonMissionRoute});
 }));
 return {sync};
}
