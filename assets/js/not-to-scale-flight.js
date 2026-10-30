import {cinematicEase,cinematicVelocity} from './cinematic-motion.js';
// User-initiated cinematic *scale lens*: every orbit uses linear AU radius,
// while familiar selectable markers or physically tiny projected disk sizes
// demonstrate why solar-system diagrams cannot show both on a screen.
import {PLANET_ORBITS,radiusAUAtProgress,progressAtRadiusAU,physicalPlanetDiameterPx,SUN_DIAMETER_KM} from './not-to-scale-flight-math.js';
const experience=document.querySelector('#trueScaleFlight');
if(experience){
 const activate=experience.querySelector('#trueScaleActivate');
 const canvas=experience.querySelector('#trueScaleCanvas');
 const fallback=experience.querySelector('#trueScaleFallback');
 const stage=experience.querySelector('#trueScaleStage');
 const controls=experience.querySelector('#trueScaleControls');
 const slider=experience.querySelector('#trueScaleZoom');
 const readout=experience.querySelector('#trueScaleReadout');
 const markerSize=experience.querySelector('#trueScaleSizeMode');
 const reveal=experience.querySelector('#trueScaleReveal');
 const play=experience.querySelector('#trueScalePlay');
 const reverse=experience.querySelector('#trueScaleReverse');
 const select=experience.querySelector('#trueScalePlanet');
 const selection=experience.querySelector('#trueScaleSelected');
 const preset=experience.querySelectorAll('[data-true-scale-focus]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let engine=null,loading=false,targetProgress=.53,flightGoal=null;
 function selectedDetails(){
  const p=PLANET_ORBITS.find(x=>x.name===select.value)||PLANET_ORBITS[2];
  const stageRadius=Math.min(Math.max(1,stage.clientWidth),Math.max(1,stage.clientHeight))*.43;
  const actualDiameter=physicalPlanetDiameterPx(p.diameterKm,radiusAUAtProgress(targetProgress),stageRadius);
  selection.textContent=`${p.name}: ${p.au.toFixed(2)} AU from the Sun (average semi-major axis), diameter ≈ ${p.diameterKm.toLocaleString('en-US')} km. At this camera scale its physical projected diameter is ${actualDiameter<.01?actualDiameter.toExponential(2):actualDiameter.toFixed(3)} CSS px. ${markerSize.checked?'True diameter mode: the disk may be smaller than one pixel; switch back to readable symbols to find it.':'Readable markers mode: its colored symbol is deliberately enlarged.'}`;
  reveal.hidden=!markerSize.checked;
 }
 function syncZoom(v){
  targetProgress=Math.max(0,Math.min(1,Number(v)||0));
  slider.value=String(Math.round(targetProgress*1000));
  const r=radiusAUAtProgress(targetProgress);
  readout.textContent=`Camera radius ${r<10?r.toFixed(2):r.toFixed(1)} AU. ${r<1.8?'Inner solar system':r<11?'Outer giants coming into view':'Far outer solar system'}; orbital AU positions are physically proportional, but colors and background are artistic.`;
  selectedDetails();
 }
 function stop(){flightGoal=null;engine?.stop();play.setAttribute('aria-pressed','false');reverse.setAttribute('aria-pressed','false');readout.setAttribute('aria-live','polite');}
 function setProgress(v){stop();syncZoom(v);engine?.setProgress(v);}
 slider.addEventListener('input',()=>setProgress(Number(slider.value)/1000));
 markerSize.addEventListener('change',()=>{engine?.setTrueSizes(markerSize.checked);selectedDetails();});
 select.addEventListener('change',()=>{selectedDetails();engine?.selectPlanet(select.value);});
 for(const b of preset)b.addEventListener('click',()=>{const p=Number(b.dataset.trueScaleFocus);setProgress(p);});
 function startFlight(to){
  if(!engine||reduced.matches||document.hidden)return;
  stop();
  // Replay from the opposite end when already at the destination.
  if(Math.abs(targetProgress-to)<.001){syncZoom(1-to);engine.setProgress(1-to);}
  flightGoal=to;engine.start(to);
  const b=to>0?play:reverse;
  b.setAttribute('aria-pressed','true');readout.setAttribute('aria-live','off');
 }
 play.addEventListener('click',()=>engine?.isPlaying()?stop():startFlight(1));
 reverse.addEventListener('click',()=>engine?.isPlaying()?stop():startFlight(0));
 activate.disabled=false;
 activate.addEventListener('click',()=>{
  if(loading)return;
  if(engine){const on=canvas.hidden;canvas.hidden=!on;fallback.hidden=on;controls.hidden=!on;
   activate.textContent=on?'Return to labeled diagram':'Explore the solar system by zoom';activate.setAttribute('aria-pressed',String(on));
   if(on){engine.resize();engine.setProgress(targetProgress);}else stop();return;
  }
  loading=true;activate.disabled=true;activate.textContent='Preparing true-scale lens…';
  try{
   engine=createEngine(canvas,stage,(p,manual=false)=>{
    syncZoom(p);
    if(manual||flightGoal!==null&&Math.abs(p-flightGoal)<.0001)stop();
   },name=>{select.value=name;selectedDetails();});
   canvas.hidden=false;fallback.hidden=true;controls.hidden=false;
   engine.resize();engine.setProgress(targetProgress);engine.setTrueSizes(markerSize.checked);engine.selectPlanet(select.value);
   activate.textContent='Return to labeled diagram';activate.setAttribute('aria-pressed','true');
   play.disabled=reverse.disabled=reduced.matches;
  }catch(error){
   canvas.hidden=true;fallback.hidden=false;controls.hidden=true;
   activate.textContent='Retry true-scale zoom';activate.setAttribute('aria-pressed','false');
   readout.textContent='Canvas zoom unavailable. The original size and distance comparisons below remain readable.';
   console.warn('Solar system scale lens unavailable',error);
  }finally{loading=false;activate.disabled=false;}
 });
 reduced.addEventListener?.('change',()=>{if(reduced.matches)stop();play.disabled=reverse.disabled=reduced.matches;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 syncZoom(targetProgress);
 function createEngine(canvas,shell,onProgress,onSelect){
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas2D unavailable');
  let width=1,height=1,dpr=1,progress=targetProgress,to=targetProgress,playing=false,raf=null,last=0;
  let flightStart=targetProgress,flightElapsed=0,flightDuration=9.5,flightSpeed=0;
  let sizesAreTrue=false,selected=select.value,disposed=false;
  let bearing=0,targetBearing=0;
  const coarse=matchMedia('(pointer:coarse)').matches;
  const pointers=new Map();let pinchLast=0,moved=false;
  const stableRandom=(i)=>{const n=Math.sin((i+11)*127.113)*42197.32;return n-Math.floor(n);};
  function draw(){
   if(disposed||canvas.hidden)return;
   ctx.setTransform(dpr,0,0,dpr,0,0);
   const bg=ctx.createRadialGradient(width*.50,height*.50,5,width*.50,height*.50,Math.max(width,height)*.7);
   bg.addColorStop(0,'#182c48');bg.addColorStop(.44,'#09182e');bg.addColorStop(1,'#050b18');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
   const radiusAU=radiusAUAtProgress(progress),cx=width*.50,cy=height*.51,pxRadius=Math.min(width,height)*.43;
   const ppau=pxRadius/radiusAU,foreshorten=height<width?.72:.9;
   for(let i=0,n=coarse?130:380;i<n;i++){
    const depth=.18+.82*stableRandom(i*13+6);
    const sx=((stableRandom(i*3+1)+progress*.26*depth)%1)*width,sy=stableRandom(i*3+2)*height;
    ctx.fillStyle=`rgba(203,228,250,${.18+.55*stableRandom(i*3+3)})`;
    ctx.beginPath();ctx.arc(sx,sy,.3+stableRandom(i*13)*.85,0,Math.PI*2);ctx.fill();
    if(playing){ctx.strokeStyle='rgba(160,212,254,.28)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-Math.sign(to-flightStart)*Math.min(38,flightSpeed*60*depth),sy);ctx.stroke();}
   }
   // Orbital paths are linear in AU. Inclination is only a viewing projection.
   for(const p of PLANET_ORBITS){const r=p.au*ppau;
    if(r>Math.max(width,height)*2)continue;
    ctx.beginPath();ctx.ellipse(cx,cy,r,r*foreshorten,0,0,Math.PI*2);
    ctx.strokeStyle=p.name===selected?'rgba(251,215,156,.71)':'rgba(123,169,207,.29)';ctx.lineWidth=p.name===selected?1.8:1;ctx.stroke();
   }
   const sunPx=physicalPlanetDiameterPx(SUN_DIAMETER_KM,radiusAU,pxRadius);
   const halo=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(10,Math.min(140,8+sunPx*8)));
   halo.addColorStop(0,'rgba(255,241,171,.82)');halo.addColorStop(.25,'rgba(244,158,67,.39)');halo.addColorStop(1,'rgba(242,100,30,0)');
   ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,Math.max(10,Math.min(140,8+sunPx*8)),0,2*Math.PI);ctx.fill();
   ctx.fillStyle='#ffe0a0';ctx.beginPath();ctx.arc(cx,cy,sizesAreTrue?Math.max(0,sunPx/2):Math.max(3.8,sunPx/2),0,Math.PI*2);ctx.fill();
   for(const p of PLANET_ORBITS){
    const theta=p.phase+bearing,r=p.au*ppau,x=cx+Math.cos(theta)*r,y=cy+Math.sin(theta)*r*foreshorten;
    if(x<0||x>width||y<0||y>height)continue;
    const diameterPx=physicalPlanetDiameterPx(p.diameterKm,radiusAU,pxRadius);
    const displayRadius=sizesAreTrue?diameterPx/2:p.name===selected?6.7:4.4;
    if(!sizesAreTrue&&p.name===selected){ctx.strokeStyle='#fff2c3';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,y,displayRadius,0,Math.PI*2);ctx.fill();
    if(!sizesAreTrue&&r>22){ctx.fillStyle=p.name===selected?'#fff6dc':'rgba(219,231,245,.78)';ctx.font='600 11px system-ui,sans-serif';ctx.textAlign='left';ctx.fillText(p.name,Math.min(width-67,x+9),Math.max(20,y-10));}
   }
   ctx.textAlign='left';ctx.font='700 11px ui-monospace,monospace';ctx.fillStyle='#e4f3ff';
   ctx.fillText('CAMERA RADIUS · '+radiusAU.toFixed(radiusAU<10?2:1)+' AU',12,23);
   ctx.fillStyle=sizesAreTrue?'#ffd6ab':'#cae5f6';ctx.fillText(sizesAreTrue?'TRUE BODY DIAMETERS · MOST INVISIBLE':'ENLARGED PLANET MARKERS',12,40);
   // The single HTML legend below is the accessible, non-overlapping key.
  }
  function frame(now){raf=null;const dt=last?Math.min(.05,Math.max(0,(now-last)/1000)):0;last=now;
   if(playing){
    flightElapsed=Math.min(flightDuration,flightElapsed+dt);
    const t=flightElapsed/flightDuration;
    progress=flightStart+(to-flightStart)*cinematicEase(t);
    flightSpeed=Math.abs(to-flightStart)*cinematicVelocity(t)/flightDuration;
    onProgress(progress);
    if(t>=1){progress=to;playing=false;flightSpeed=0;onProgress(progress);}
   }
   bearing+=(targetBearing-bearing)*(1-Math.exp(-10*(dt||.016)));draw();
   if(playing||Math.abs(bearing-targetBearing)>.002)schedule();
  }
  function schedule(){if(raf===null&&!disposed&&!document.hidden)raf=requestAnimationFrame(frame);}
  function setProgress(v){progress=Math.max(0,Math.min(1,Number(v)||0));playing=false;draw();}
  function resize(){width=Math.max(1,shell.clientWidth);height=Math.max(1,shell.clientHeight);dpr=Math.min(window.devicePixelRatio||1,coarse?1.25:1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw();}
  function down(e){canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});pinchLast=0;moved=false;}
  function move(e){const p=pointers.get(e.pointerId);if(!p)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(pinchLast>4&&Math.abs(d-pinchLast)>2){const v=progressAtRadiusAU(radiusAUAtProgress(progress)*pinchLast/d);setProgress(v);onProgress(v,true);}pinchLast=d;moved=true;
   }else{targetBearing+=(e.clientX-p.x)*.004;moved=true;schedule();}
  }
  function up(e){if(!moved&&pointers.size===1){
    const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
    const pxRadius=Math.min(width,height)*.43,ppau=pxRadius/radiusAUAtProgress(progress);
    let nearest=null,dist=18;for(const p of PLANET_ORBITS){const th=p.phase+bearing,px=width*.50+Math.cos(th)*p.au*ppau,py=height*.51+Math.sin(th)*p.au*ppau*(height<width?.72:.9);const d=Math.hypot(px-x,py-y);if(d<dist){dist=d;nearest=p.name;}}
    if(nearest)onSelect(nearest);
   }pointers.delete(e.pointerId);pinchLast=0;moved=false;
  }
  function wheel(e){if(canvas.hidden)return;e.preventDefault();const v=Math.max(0,Math.min(1,progress+Math.sign(e.deltaY)*.028));setProgress(v);onProgress(v,true);}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});
  const ro=new ResizeObserver(resize);ro.observe(shell);
  return {resize,setProgress,setTrueSizes(v){sizesAreTrue=Boolean(v);draw();},selectPlanet(name){selected=name;draw();},
   start(direction){flightStart=progress;to=direction;flightElapsed=0;flightDuration=9.5*Math.abs(to-flightStart);flightSpeed=0;playing=flightDuration>.001;last=0;onProgress(progress);if(playing)schedule();},stop(){playing=false;flightSpeed=0;},isPlaying:()=>playing,
   dispose(){disposed=true;playing=false;if(raf!==null)cancelAnimationFrame(raf);ro.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);}
  };
 }
}
