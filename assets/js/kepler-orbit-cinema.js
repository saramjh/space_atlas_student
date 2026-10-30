// An opt-in orbital observatory for Kepler's 3rd law. It renders circular,
// nearly coplanar orbits and log-compressed *drawing radii*, but angular speed
// uses physical normalized T²=a³, 1 Earth-year per 12 seconds of wall time.
// The log/log data chart is the accurate science reference, not this diagram.
import {PLANETS} from './planet-data.js';
import {periodYearsFromAU,orbitAngleAtYears,displayOrbitFraction,completedOrbitalRevolutions} from './kepler-orbit-math.js';
const lab=document.querySelector('#keplerLawLab');
const canvas=document.querySelector('#keplerOrbitCanvas');
const fallback=document.querySelector('#keplerOrbitFallback');
const shell=document.querySelector('#keplerOrbitStage');
const activate=document.querySelector('#keplerOrbitActivate');
const controls=document.querySelector('#keplerOrbitControls');
const select=document.querySelector('#keplerPlanetSelect');
const chips=[...document.querySelectorAll('[data-kepler-planet]')];
const play=document.querySelector('#keplerOrbitPlay');
const reset=document.querySelector('#keplerOrbitReset');
const timeSlider=document.querySelector('#keplerOrbitTime');
const timeValue=document.querySelector('#keplerOrbitTimeValue');
const spanSelect=document.querySelector('#keplerOrbitSpan');
const zoomIn=document.querySelector('#keplerOrbitZoomIn');
const zoomOut=document.querySelector('#keplerOrbitZoomOut');
const followButton=document.querySelector('#keplerOrbitFollow');
const frameStatus=document.querySelector('#keplerOrbitFrameStatus');
const selectedTitle=document.querySelector('#keplerOrbitSelected');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let engine=null;
let spanYears=1;
const fmt=(n)=>n>=10?n.toFixed(1):n.toFixed(2);
function updateSelected(name){
 const planet=PLANETS.find(x=>x.name===name)||PLANETS[2];
 select.value=planet.name;
 // The original Kepler chart and its readout remain the source of truth.
 select.dispatchEvent(new Event('change',{bubbles:true}));
 chips.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.keplerPlanet===planet.name)));
 const a=Number.parseFloat(planet.au);
 selectedTitle.textContent=`${planet.name} · ${a.toFixed(2)} AU · ~${fmt(periodYearsFromAU(a))} Earth-year orbit`;
 engine?.selectPlanet(planet.name);
 updateTime(Number(timeSlider.value)/1000*spanYears);
}
chips.forEach(b=>b.addEventListener('click',()=>updateSelected(b.dataset.keplerPlanet)));
select.addEventListener('change',()=>{
 const name=select.value;
 chips.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.keplerPlanet===name)));
 const p=PLANETS.find(p=>p.name===name);
 if(p){const a=Number.parseFloat(p.au);selectedTitle.textContent=`${p.name} · ${a.toFixed(2)} AU · ~${fmt(periodYearsFromAU(a))} Earth-year orbit`;engine?.selectPlanet(name);updateTime(Number(timeSlider.value)/1000*spanYears);}
});
const updateTime=(years)=>{
 const clamped=Math.max(0,Math.min(spanYears,Number(years)||0));
 timeSlider.value=String(Math.round(clamped/spanYears*1000));timeValue.textContent=clamped.toFixed(spanYears===1?2:1)+' Earth yr';
 const p=PLANETS.find(p=>p.name===select.value)||PLANETS[2],au=Number.parseFloat(p.au);
 const rev=completedOrbitalRevolutions(au,clamped);
 const message=`After ${clamped.toFixed(spanYears===1?2:1)} simulated Earth-years, ${p.name} has completed ${rev.toFixed(rev<.1?3:2)} idealized orbits. Orbit sizes are log-compressed; the chart uses physical AU and years.`;
 frameStatus.textContent=message;
 if(clamped>=spanYears-.001){play.setAttribute('aria-pressed','false');play.textContent='Replay one Earth year';frameStatus.setAttribute('aria-live','polite');}
};
function stop(){engine?.stop();play.setAttribute('aria-pressed','false');play.textContent=`Play ${spanYears} Earth year${spanYears===1?'':'s'}`;frameStatus.setAttribute('aria-live','polite');}
function setTime(v){stop();engine?.setTime(v);updateTime(v);}
timeSlider.addEventListener('input',()=>setTime(Number(timeSlider.value)/1000*spanYears));
spanSelect.addEventListener('change',()=>{
 stop();spanYears=Number(spanSelect.value)||1;engine?.setSpan(spanYears);setTime(0);
 play.textContent=`Play ${spanYears} Earth year${spanYears===1?'':'s'}`;
});
zoomIn.addEventListener('click',()=>engine?.zoomBy(.83));
zoomOut.addEventListener('click',()=>engine?.zoomBy(1.20));
followButton.addEventListener('click',()=>{
 const enabled=followButton.getAttribute('aria-pressed')!=='true';
 followButton.setAttribute('aria-pressed',String(enabled));
 followButton.textContent=enabled?'Return to Sun-centered view':'Follow selected world';
 engine?.setFollow(enabled);
});
reset.addEventListener('click',()=>setTime(0));
play.addEventListener('click',()=>{
 if(!engine||reduced.matches||document.hidden)return;
 if(engine.isPlaying()){stop();return;}
 if(Number(timeSlider.value)>=999){engine.setTime(0);updateTime(0);}
 engine.start();play.textContent='Pause orbit animation';play.setAttribute('aria-pressed','true');frameStatus.setAttribute('aria-live','off');
});
activate.disabled=false;
activate.addEventListener('click',()=>{
 if(engine){const visible=canvas.hidden;canvas.hidden=!visible;fallback.hidden=visible;controls.hidden=!visible;
  activate.setAttribute('aria-pressed',String(visible));activate.textContent=visible?'Return to static orbits':'Explore animated orbits';
  if(visible)engine.resize();else stop();return;
 }
 activate.disabled=true;activate.textContent='Preparing orbital model…';
 try{
  engine=createEngine(canvas,shell,(selected)=>updateSelected(selected),updateTime);
  canvas.hidden=false;fallback.hidden=true;controls.hidden=false;
  engine.resize();engine.selectPlanet(select.value);engine.setSpan(spanYears);
  activate.setAttribute('aria-pressed','true');activate.textContent='Return to static orbits';
  play.disabled=reduced.matches;
 }catch(error){
  canvas.hidden=true;fallback.hidden=false;controls.hidden=true;
  activate.setAttribute('aria-pressed','false');activate.textContent='Retry orbit view';
  frameStatus.textContent='Orbit renderer unavailable; the original logarithmic Kepler graph remains usable.';
  console.warn('Kepler Canvas2D renderer unavailable',error);
 }finally{activate.disabled=false;}
});
reduced.addEventListener?.('change',()=>{play.disabled=reduced.matches;if(reduced.matches)stop();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
updateSelected(select.value||'Earth');updateTime(0);
function createEngine(canvas,shell,onSelect,onTime){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas2D unavailable');
 const coarse=matchMedia('(pointer: coarse)').matches;
 let w=1,h=1,dpr=1,selected=select.value||'Earth';
 let years=0,playing=false,raf=null,last=0,stopped=false,span=1;
 let zoom=1,targetZoom=1,orbitDrag=0,targetDrag=0,following=false;
 let cameraShiftX=0,cameraShiftY=0,targetShiftX=0,targetShiftY=0;
 const pointers=new Map();let lastPinch=0,downPoint=null;
 const starSeed=(i)=>{let n=Math.sin(i*129.57+53.11)*43758.5453;return n-Math.floor(n);};
 function draw(){
  if(stopped||canvas.hidden)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#07101e');bg.addColorStop(.55,'#111d32');bg.addColorStop(1,'#080d1a');
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  for(let i=0;i<(coarse?125:320);i++){
   ctx.fillStyle=`rgba(201,229,248,${.19+starSeed(i+11)*.5})`;
   const x=(starSeed(i*3+1)*w-cameraShiftX*.095+w*4)%w,y=(starSeed(i*3+2)*h-cameraShiftY*.095+h*4)%h,r=.4+starSeed(i*11+3)*1.2;
   ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  const cx=w*.5-cameraShiftX,cy=h*.5-cameraShiftY,rad=Math.min(w,h)*.448*zoom;
  const ellip=h<w?.77:.86;
  const orbitData=[];
  for(const p of PLANETS){
   const au=Number.parseFloat(p.au),r=rad*displayOrbitFraction(au),active=p.name===selected;
   orbitData.push({p,au,r,active});
   ctx.beginPath();ctx.ellipse(cx,cy,r,r*ellip,0,0,Math.PI*2);
   ctx.strokeStyle=active?'rgba(248,220,166,.78)':'rgba(131,166,192,.30)';
   ctx.lineWidth=active?2.2:1;ctx.stroke();
  }
  const corona=ctx.createRadialGradient(cx,cy,1,cx,cy,Math.max(25,rad*.24));
  corona.addColorStop(0,'rgba(255,239,183,.8)');corona.addColorStop(.18,'rgba(255,183,88,.4)');corona.addColorStop(1,'rgba(255,152,64,0)');
  ctx.fillStyle=corona;ctx.beginPath();ctx.arc(cx,cy,rad*.25,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffde9b';ctx.beginPath();ctx.arc(cx,cy,Math.max(5,rad*.035),0,Math.PI*2);ctx.fill();
  for(const o of orbitData){
   const theta=orbitAngleAtYears(o.au,years)+orbitDrag;
   const x=cx+Math.cos(theta)*o.r,y=cy+Math.sin(theta)*o.r*ellip;
   const hColor='#'+o.p.color.toString(16).padStart(6,'0');
   if(o.active){
    ctx.fillStyle='rgba(255,219,154,.16)';ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();
    ctx.lineWidth=1.4;ctx.strokeStyle='rgba(255,240,188,.9)';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.stroke();
   }
   ctx.fillStyle=hColor;ctx.beginPath();ctx.arc(x,y,o.active?6:3.6,0,Math.PI*2);ctx.fill();
   if(o.active){ctx.font='600 12px system-ui,sans-serif';ctx.textAlign='left';ctx.fillStyle='#f5eee2';ctx.fillText(o.p.name,Math.min(w-75,x+11),Math.max(18,y-12));}
  }
  ctx.font='600 11px ui-monospace,monospace';ctx.textAlign='left';ctx.fillStyle='#d1e4f3';ctx.fillText('SUN · PLANET ORBITS',12,21);
  ctx.textAlign='right';ctx.fillStyle='#b3c8d8';ctx.fillText(`${years.toFixed(span===1?2:1)} / ${span} EARTH YEARS`,w-12,21);
  if(following){ctx.textAlign='left';ctx.fillStyle='#ffdaa1';ctx.fillText(`FOLLOW CAMERA · ${selected}`,12,39);}
 }
 function frame(now){raf=null;let dt=last?Math.min(.06,Math.max(0,(now-last)/1000)):0;last=now;
  if(playing){years=Math.min(span,years+dt*span/12);onTime(years);if(years>=span){playing=false;onTime(span);}}
  const smoothing=reduced.matches?1:1-Math.exp(-12*(dt||.016));
  zoom+=(targetZoom-zoom)*smoothing;orbitDrag+=(targetDrag-orbitDrag)*smoothing;
  updateTracking();
  cameraShiftX+=(targetShiftX-cameraShiftX)*smoothing;cameraShiftY+=(targetShiftY-cameraShiftY)*smoothing;
  draw();if(playing||Math.abs(zoom-targetZoom)>.002||Math.abs(orbitDrag-targetDrag)>.002||Math.abs(cameraShiftX-targetShiftX)>.15||Math.abs(cameraShiftY-targetShiftY)>.15)schedule();
 }
 function schedule(){if(raf===null&&!stopped&&!document.hidden)raf=requestAnimationFrame(frame);}
 function updateTracking(){
  const p=PLANETS.find(p=>p.name===selected)||PLANETS[2];
  const radius=Math.min(w,h)*.448*zoom*displayOrbitFraction(Number.parseFloat(p.au));
  const theta=orbitAngleAtYears(Number.parseFloat(p.au),years)+orbitDrag;
  targetShiftX=following?Math.cos(theta)*radius*.85:0;
  targetShiftY=following?Math.sin(theta)*radius*(h<w?.77:.86)*.85:0;
 }
 function setTime(v){years=Math.min(span,Math.max(0,Number(v)||0));updateTracking();if(reduced.matches){cameraShiftX=targetShiftX;cameraShiftY=targetShiftY;}draw();if(following&&!reduced.matches)schedule();}
 function resize(){const width=Math.max(1,shell.clientWidth),height=Math.max(1,shell.clientHeight);
  w=width;h=height;dpr=Math.min(window.devicePixelRatio||1,coarse||width<=700?1.25:1.75);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);draw();
 }
 function pick(e){
  const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  const cx=w*.5-cameraShiftX,cy=h*.5-cameraShiftY,rad=Math.min(w,h)*.448*zoom,ellip=h<w?.77:.86;
  let best=null,bestDistance=18;
  for(const p of PLANETS){const a=Number.parseFloat(p.au),theta=orbitAngleAtYears(a,years)+orbitDrag;
   const rr=rad*displayOrbitFraction(a),px=cx+rr*Math.cos(theta),py=cy+rr*Math.sin(theta)*ellip;
   const dist=Math.hypot(x-px,y-py);if(dist<bestDistance){bestDistance=dist;best=p.name;}
  }
  if(best)onSelect(best);
 }
 function down(e){
  if(canvas.hidden)return;
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===1)downPoint={x:e.clientX,y:e.clientY};
  lastPinch=0;
 }
 function move(e){
  const old=pointers.get(e.pointerId);if(!old)return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){
   const [a,b]=[...pointers.values()],span=Math.hypot(a.x-b.x,a.y-b.y);
   if(lastPinch>4)targetZoom=Math.max(.76,Math.min(1.28,targetZoom*lastPinch/Math.max(4,span)));
   lastPinch=span;downPoint=null;schedule();
  }else{
   targetDrag+=(e.clientX-old.x)*.004;schedule();
  }
 }
 function up(e){
  if(pointers.size===1&&downPoint&&Math.hypot(e.clientX-downPoint.x,e.clientY-downPoint.y)<9)pick(e);
  pointers.delete(e.pointerId);downPoint=null;lastPinch=0;
 }
 function wheel(e){if(canvas.hidden)return;e.preventDefault();targetZoom=Math.min(1.28,Math.max(.76,targetZoom*Math.exp(Math.max(-80,Math.min(80,e.deltaY))*.003)));schedule();}
 canvas.addEventListener('pointerdown',down);
 canvas.addEventListener('pointermove',move);
 canvas.addEventListener('pointerup',up);
 canvas.addEventListener('pointercancel',up);
 canvas.addEventListener('wheel',wheel,{passive:false});
 const ro=new ResizeObserver(resize);ro.observe(shell);
 return {resize,setTime,setSpan(v){span=v;years=0;draw();},setFollow(v){following=Boolean(v);updateTracking();if(reduced.matches){cameraShiftX=targetShiftX;cameraShiftY=targetShiftY;draw();}else schedule();},zoomBy(v){targetZoom=Math.min(1.28,Math.max(.76,targetZoom*v));schedule();},start(){if(reduced.matches||document.hidden)return false;playing=true;last=0;schedule();return true;},stop(){playing=false;},isPlaying:()=>playing,
  selectPlanet(name){selected=name;updateTracking();if(reduced.matches){cameraShiftX=targetShiftX;cameraShiftY=targetShiftY;draw();}else schedule();},
  dispose(){stopped=true;playing=false;if(raf!==null)cancelAnimationFrame(raf);ro.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);}
 };
}
