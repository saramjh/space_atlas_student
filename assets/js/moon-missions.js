// Moon Orbit Catcher — a game clock controlling the existing idealized fixed-Sun model.
// Schematic orbital motion is NOT a gravitational orbit or a live sky forecast.
// https://science.nasa.gov/moon/moon-phases/
import { moonModelAtDegrees } from './moon-geometry.js';

export const MOON_MISSIONS = Object.freeze([
 {key:'quarter',target:90,tolerance:12,prompt:'Catch a waxing half Moon.',
  clue:'The bright portion is growing. “Quarter” refers to a quarter of the cycle, not 25% bright.',
  hint:'Move about one quarter of the way from New Moon toward Full Moon. The right half is bright in this northern-view schematic.',
  explanation:'First Quarter: half of the disk we see is illuminated. “Quarter” means a quarter of the phase cycle.',
  routeWhy:'We enlarged the Moon and compressed the orbit here. How far apart are Earth and Moon really?',
  targetLabel:'Target: right half bright, a waxing First Quarter Moon.'},
 {key:'full',target:180,tolerance:12,prompt:'Catch a fully bright Moon.',
  clue:'The Moon is opposite the Sun, on the far side of Earth.',
  hint:'Look for the Moon on the right side of the model orbit, opposite the Sun.',
  explanation:'Full Moon: we see almost the entire sunlit hemisphere. Ordinary phases are not Earth’s shadow.',
  routeWhy:'Full Moon happens every month, but lunar eclipses do not. Why?',
  targetLabel:'Target: fully illuminated Full Moon disk.'},
 {key:'waning',target:315,tolerance:16,prompt:'Catch a waning crescent.',
  clue:'This narrow crescent is shrinking toward New Moon.',
  hint:'After Last Quarter but before New Moon, look for the thin bright left edge in the northern-view schematic.',
  explanation:'Waning Crescent: only a narrow part of the sunlit hemisphere faces us and its visible fraction is decreasing.',
  routeWhy:'Why does the bright fraction change even when the Moon keeps almost the same face toward Earth?',
  targetLabel:'Target: thin left bright crescent, a waning Moon.'},
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
 const routes=$('moonMissionRoutes'),routeWhy=$('moonMissionRouteWhy');
 const links=[...root.querySelectorAll('[data-moon-mission-route]')];
 const precision=$('moonMissionPrecision'),arena=$('moonMissionArena');
 const orbiter=$('moonMissionOrbiter'),sightline=$('moonMissionSightline');
 const goal=$('moonMissionGoal'),arc=$('moonMissionTargetArc');
 const signal=$('moonMissionSignal'),speedOutput=$('moonMissionSpeed');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 root.classList.toggle('is-reduced',reduced.matches);
 let started=false,solved=false,round=0,attempts=0,completed=0;
 let angle=getAngle(),running=false,dragging=null,brakeHeld=false,boostHeld=false;
 let frame=null,lastFrame=null,lastPaint=null;

 function hideRoutes(){routes.hidden=true;links.forEach(a=>a.hidden=true);}
 function paintOrbit(){
  const p=orbitPoint(angle);
  orbiter.setAttribute('transform','translate('+p.x.toFixed(2)+' '+p.y.toFixed(2)+')');
  sightline.setAttribute('x2',p.x.toFixed(2));sightline.setAttribute('y2',p.y.toFixed(2));
  const near=matchesMoonMission(angle,MOON_MISSIONS[round]);
  signal.classList.toggle('is-near',near);
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
  const speed=brakeHeld?6:boostHeld?62:22;
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
  [capture,brake,boost,hint,pause].forEach(b=>b.hidden=false);
  next.hidden=true;restart.hidden=true;hideRoutes();
  angle=(mission.target-55+360)%360;
  setGameAngle(angle);
  feedback.textContent=reduced.matches?'Manual mode: drag the Moon or use the slider, then Capture phase.':
   'The Moon is moving. Hold Slow near the gold window, then Capture phase.';
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
   feedback.textContent='Not yet — '+error+'° from the target. '+(running?
    'Slow down before the glowing arc and try again.':'Drag onto the arc or resume the orbit.')+
    (attempts>=2?' '+mission.hint:'');
   return;
  }
  setRunning(false);solved=true;completed++;root.classList.add('is-captured');
  setGameAngle(mission.target);
  feedback.textContent='Phase captured! '+mission.explanation+' The model shows the exact named reference.';
  [capture,brake,boost,hint,pause].forEach(b=>b.hidden=true);
  hideRoutes();routes.hidden=false;routeWhy.textContent=mission.routeWhy;
  const link=links.find(a=>a.dataset.moonMissionRoute===mission.key);
  if(link)link.hidden=false;
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
