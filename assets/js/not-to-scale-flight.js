import {cinematicEase,cinematicVelocity} from './cinematic-motion.js';
// User-initiated cinematic *scale lens*: every orbit uses linear AU radius,
// while familiar selectable markers or physically tiny projected disk sizes
// demonstrate why solar-system diagrams cannot show both on a screen.
import {AU_KM,PLANET_ORBITS,radiusAUAtProgress,progressAtRadiusAU,focusRadiusAUAtProgress,focusProgressAtRadiusAU,pixelThresholdRadiusAU,physicalPlanetDiameterPx,SUN_DIAMETER_KM} from './not-to-scale-flight-math.js';
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
 const physics=experience.querySelector('#trueScalePhysics');
 const phase=experience.querySelector('#trueScalePhase');
 const factor=experience.querySelector('#trueScaleFactor');
 const gauge=experience.querySelector('#trueScaleGaugePointer');
 const physicsReadout=experience.querySelector('#trueScalePhysicsReadout');
 const locator=experience.querySelector('#trueScaleGuide');
 const zoomLabel=experience.querySelector('#trueScaleZoomLabel');
 const play=experience.querySelector('#trueScalePlay');
 const reverse=experience.querySelector('#trueScaleReverse');
 const select=experience.querySelector('#trueScalePlanet');
 const selection=experience.querySelector('#trueScaleSelected');
 const preset=experience.querySelectorAll('[data-true-scale-focus]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let engine=null,loading=false,targetProgress=.53,flightGoal=null;
 const defaultPresetLabels=[...preset].map(b=>b.textContent);
 const planet=()=>PLANET_ORBITS.find(p=>p.name===select.value)||PLANET_ORBITS[2];
 const stageRadius=()=>Math.min(Math.max(1,stage.clientWidth),Math.max(1,stage.clientHeight))*.43;
 const cameraRadius=(progress=targetProgress)=>markerSize.checked?focusRadiusAUAtProgress(progress,planet().diameterKm):radiusAUAtProgress(progress);
 function updateModeLabels(){
  const focus=markerSize.checked;
  zoomLabel.textContent=focus?'Camera zoom: '+planet().name+' close-up to entire solar system':'Camera zoom: near Sun to outer solar system';
  play.textContent=focus?'Watch the planet shrink':'Fly outward';
  reverse.textContent=focus?'Fly back to planet':'Fly inward';
  const labels=focus?['Planet close-up','1 px threshold','Planet orbit','Outer solar system']:defaultPresetLabels;
  [...preset].forEach((b,i)=>b.textContent=labels[i]);
  physics.hidden=!focus;readout.hidden=focus;selection.hidden=focus;locator.disabled=!focus;
  if(!focus)locator.checked=false;
 }
 function selectedDetails(){
  const p=planet(),r=cameraRadius();
  const diameter=physicalPlanetDiameterPx(p.diameterKm,r,stageRadius());
  const projected=diameter<.01?diameter.toExponential(2):diameter.toFixed(2);
  selection.textContent=p.name+': '+p.au.toFixed(2)+' AU from the Sun (average semi-major axis), diameter approximately '+p.diameterKm.toLocaleString('en-US')+' km. At this camera radius its true relative diameter is '+projected+' CSS px. '+(markerSize.checked?'The lens follows the planet at close range then includes its orbit.':'The classroom marker is deliberately enlarged.');
  if(markerSize.checked){
   const threshold=pixelThresholdRadiusAU(p.diameterKm,stageRadius());
   const isDisk=diameter>=1;
   const ratio=isDisk?diameter.toFixed(1)+' pixels across':'1/'+Math.round(1/diameter).toLocaleString('en-US')+' of one CSS pixel';
   phase.textContent=diameter>=12?'A planet-sized disk fills your view.':isDisk?'The planet is shrinking toward one pixel.':diameter>=.1?'The disk is now smaller than one pixel.':'The planet is subpixel against the orbital scale.';
   factor.textContent='Camera radius '+(r<.01?r.toExponential(2):r.toFixed(r<10?2:1))+' AU';
   gauge.style.left=Math.max(0,Math.min(100,(Math.log10(diameter)+2)*25))+'%';
   physicsReadout.textContent=p.name+': '+projected+' CSS px ('+ratio+'). The 1 px crossing is near '+(threshold<.01?threshold.toExponential(2):threshold.toFixed(3))+' AU camera radius at this viewport. '+(isDisk?'Keep zooming outward.':'The disk is not resolved at this display scale.');
  }
 }
 function syncZoom(v){
  targetProgress=Math.max(0,Math.min(1,Number(v)||0));
  slider.value=String(Math.round(targetProgress*1000));
  const r=cameraRadius();
  readout.textContent=markerSize.checked?'Physical-scale lens. Camera radius '+(r<.01?r.toExponential(2):r.toFixed(r<10?2:1))+' AU. Following '+planet().name+' outward. No spacecraft speed or telescope resolution is implied.':'Camera radius '+(r<10?r.toFixed(2):r.toFixed(1))+' AU. Orbital positions use physically proportional AU distances; background and colors are artistic.';
  selectedDetails();
 }
 function stop(){flightGoal=null;engine?.stop();play.setAttribute('aria-pressed','false');reverse.setAttribute('aria-pressed','false');readout.setAttribute('aria-live','polite');physicsReadout.setAttribute('aria-live','polite');}
 function setProgress(v){stop();syncZoom(v);engine?.setProgress(v);}
 slider.addEventListener('input',()=>setProgress(Number(slider.value)/1000));
 markerSize.addEventListener('change',()=>{
  stop();
  if(markerSize.checked){locator.checked=false;updateModeLabels();engine?.setTrueSizes(true);engine?.setGuide(false);setProgress(0);}
  else {const oldRadius=focusRadiusAUAtProgress(targetProgress,planet().diameterKm);updateModeLabels();engine?.setTrueSizes(false);engine?.setGuide(false);setProgress(progressAtRadiusAU(Math.max(.55,oldRadius)));}
 });
 select.addEventListener('change',()=>{engine?.selectPlanet(select.value);updateModeLabels();if(markerSize.checked)setProgress(0);else selectedDetails();});
 locator.addEventListener('change',()=>engine?.setGuide(locator.checked));
 for(const [index,b] of [...preset].entries())b.addEventListener('click',()=>{
  if(!markerSize.checked){setProgress(Number(b.dataset.trueScaleFocus));return;}
  const body=planet(),r=[focusRadiusAUAtProgress(0,body.diameterKm),pixelThresholdRadiusAU(body.diameterKm,stageRadius()),body.au*1.2,35][index];
  setProgress(focusProgressAtRadiusAU(r,body.diameterKm));
 });
 function startFlight(to){
  if(!engine||reduced.matches||document.hidden)return;
  stop();
  // Replay from the opposite end when already at the destination.
  if(Math.abs(targetProgress-to)<.001){syncZoom(1-to);engine.setProgress(1-to);}
  flightGoal=to;engine.start(to);
  const b=to>0?play:reverse;
  b.setAttribute('aria-pressed','true');readout.setAttribute('aria-live','off');physicsReadout.setAttribute('aria-live','off');
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
   },name=>{select.value=name;updateModeLabels();if(markerSize.checked)setProgress(0);else selectedDetails();});
   canvas.hidden=false;fallback.hidden=true;controls.hidden=false;
   updateModeLabels();engine.resize();engine.setProgress(targetProgress);engine.setTrueSizes(markerSize.checked);engine.selectPlanet(select.value);engine.setGuide(locator.checked);
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
 updateModeLabels();syncZoom(targetProgress);
 function createEngine(canvas,shell,onProgress,onSelect){
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas2D unavailable');
  let width=1,height=1,dpr=1,progress=targetProgress,to=targetProgress,playing=false,raf=null,last=0;
  let flightStart=targetProgress,flightElapsed=0,flightDuration=9.5,flightSpeed=0;
  let sizesAreTrue=false,guideOn=false,selected=select.value,disposed=false;
  let bearing=0,targetBearing=0;
  const coarse=matchMedia('(pointer:coarse)').matches;
  const pointers=new Map();let pinchLast=0,moved=false;
  const stableRandom=(i)=>{const n=Math.sin((i+11)*127.113)*42197.32;return n-Math.floor(n);};
  // On-demand hemisphere projections from the site's existing credited NASA/JPL maps.
  // Correct spherical sampling avoids stretching an equirectangular map across a flat disk.
  const hemispheres=new Map();
  function hemisphere(img){
   const source=document.createElement('canvas');source.width=640;source.height=320;
   const sx=source.getContext('2d',{willReadFrequently:true});sx.drawImage(img,0,0,640,320);
   const raw=sx.getImageData(0,0,640,320).data;
   const size=320,out=document.createElement('canvas');out.width=out.height=size;
   const dest=out.getContext('2d');const image=dest.createImageData(size,size);
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const nx=(x+.5-size/2)/(size/2),ny=(y+.5-size/2)/(size/2),r2=nx*nx+ny*ny;
    if(r2>=1)continue;
    const nz=Math.sqrt(1-r2),lat=Math.asin(-ny),lon=Math.atan2(nx,nz);
    const u=(.5+lon/(2*Math.PI)+1)%1,v=(.5-lat/Math.PI);
    const ix=Math.min(639,Math.floor(u*640)),iy=Math.min(319,Math.floor(v*320));
    const off=(iy*640+ix)*4,idx=(y*size+x)*4;
    // Illumination is schematic. The underlying map colors come from the cited composites.
    const illumination=.40+.60*Math.max(0,nz*.88-nx*.26-ny*.22);
    for(let c=0;c<3;c++)image.data[idx+c]=Math.round(raw[off+c]*illumination);
    image.data[idx+3]=255;
   }
   dest.putImageData(image,0,0);
   return out;
  }
  for(const [name,file] of [['Earth','planet-earth-nasa.webp'],['Jupiter','planet-jupiter-jpl.webp']]){
   const img=new Image();
   img.onload=()=>{try{hemispheres.set(name,hemisphere(img));draw();}catch(e){console.warn('Close-up texture unavailable',e);}};
   img.src=new URL('../images/'+file,import.meta.url).href;
  }

  function draw(){
   if(disposed||canvas.hidden)return;
   ctx.setTransform(dpr,0,0,dpr,0,0);
   const bg=ctx.createRadialGradient(width*.50,height*.50,5,width*.50,height*.50,Math.max(width,height)*.7);
   bg.addColorStop(0,'#182c48');bg.addColorStop(.44,'#09182e');bg.addColorStop(1,'#050b18');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
   const body=PLANET_ORBITS.find(p=>p.name===selected)||PLANET_ORBITS[2];
   const radiusAU=sizesAreTrue?focusRadiusAUAtProgress(progress,body.diameterKm):radiusAUAtProgress(progress);
   const cx=width*.50,cy=height*.51,pxRadius=Math.min(width,height)*.43;
   const ppau=pxRadius/radiusAU,foreshorten=height<width?.72:.9;
   // The close-up follows one planet, then smoothly widens toward the Sun.
   const relative=Math.log10(radiusAU/body.au),t=Math.max(0,Math.min(1,(relative+1.2)/1.7));
   const blend=sizesAreTrue?t*t*(3-2*t):1;
   const cameraWorldX=sizesAreTrue?Math.cos(body.phase+bearing)*body.au*(1-blend):0;
   const cameraWorldY=sizesAreTrue?Math.sin(body.phase+bearing)*body.au*(1-blend):0;
   const orbitCenterX=cx-cameraWorldX*ppau,orbitCenterY=cy-cameraWorldY*ppau*foreshorten;
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
    ctx.beginPath();ctx.ellipse(orbitCenterX,orbitCenterY,r,r*foreshorten,0,0,Math.PI*2);
    ctx.strokeStyle=p.name===selected?'rgba(251,215,156,.71)':'rgba(123,169,207,.29)';ctx.lineWidth=p.name===selected?1.8:1;ctx.stroke();
   }
   const sunPx=physicalPlanetDiameterPx(SUN_DIAMETER_KM,radiusAU,pxRadius);
   const sunX=orbitCenterX,sunY=orbitCenterY;
   // A tiny planet close-up puts the Sun far outside this viewport.
   if(sunX>-160&&sunX<width+160&&sunY>-160&&sunY<height+160){
    const haloRadius=Math.max(10,Math.min(140,8+sunPx*8));
    const halo=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,haloRadius);
    halo.addColorStop(0,'rgba(255,241,171,.82)');halo.addColorStop(.25,'rgba(244,158,67,.39)');halo.addColorStop(1,'rgba(242,100,30,0)');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(sunX,sunY,haloRadius,0,2*Math.PI);ctx.fill();
    ctx.fillStyle='#ffe0a0';ctx.beginPath();ctx.arc(sunX,sunY,sizesAreTrue?Math.max(0,sunPx/2):Math.max(3.8,sunPx/2),0,Math.PI*2);ctx.fill();
   }
   for(const p of PLANET_ORBITS){
    const theta=p.phase+bearing,r=p.au*ppau,x=orbitCenterX+Math.cos(theta)*r,y=orbitCenterY+Math.sin(theta)*r*foreshorten;
    if(x<0||x>width||y<0||y>height)continue;
    const diameterPx=physicalPlanetDiameterPx(p.diameterKm,radiusAU,pxRadius);
    const displayRadius=sizesAreTrue?diameterPx/2:p.name===selected?6.7:4.4;
    if(!sizesAreTrue&&p.name===selected){ctx.strokeStyle='#fff2c3';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke();}
    // True-size disks use source-backed sampled hemispheres where available.
    // Other worlds remain deliberately schematic rather than fake photographs.
    if(sizesAreTrue&&p.name===selected&&displayRadius>=3&&hemispheres.has(p.name)){
     ctx.drawImage(hemispheres.get(p.name),x-displayRadius,y-displayRadius,displayRadius*2,displayRadius*2);
    }else{
     if(sizesAreTrue&&p.name===selected&&displayRadius>=3){
      const shade=ctx.createRadialGradient(x-displayRadius*.35,y-displayRadius*.3,Math.max(.1,displayRadius*.03),x+displayRadius*.19,y+displayRadius*.16,displayRadius*1.3);
      shade.addColorStop(0,'#f0e5d3');shade.addColorStop(.22,p.color);shade.addColorStop(1,'#102b41');ctx.fillStyle=shade;
     }else ctx.fillStyle=p.color;
     ctx.beginPath();ctx.arc(x,y,displayRadius,0,Math.PI*2);ctx.fill();
    }
    if(sizesAreTrue&&guideOn&&p.name===selected&&diameterPx<13.4){
     ctx.save();ctx.strokeStyle='#ffd195';ctx.lineWidth=1.7;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.stroke();ctx.restore();
     ctx.fillStyle='#ffdeb1';ctx.font='600 10px system-ui,sans-serif';
     ctx.fillText('ENLARGED LOCATOR',Math.min(width-128,x+14),Math.max(48,y-8));
    }
    if(!sizesAreTrue&&r>22){ctx.fillStyle=p.name===selected?'#fff6dc':'rgba(219,231,245,.78)';ctx.font='600 11px system-ui,sans-serif';ctx.textAlign='left';ctx.fillText(p.name,Math.min(width-67,x+9),Math.max(20,y-10));}
   }
   ctx.textAlign='left';ctx.font='700 11px ui-monospace,monospace';ctx.fillStyle='#e4f3ff';
   const radiusLabel=radiusAU<.01?Math.round(radiusAU*AU_KM).toLocaleString('en-US')+' km':radiusAU.toFixed(radiusAU<10?2:1)+' AU';
   ctx.fillText('CAMERA RADIUS · '+radiusLabel,12,23);
   if(sizesAreTrue){
    const d=physicalPlanetDiameterPx(body.diameterKm,radiusAU,pxRadius);
    const text=d<.01?d.toExponential(2):d.toFixed(2);
    ctx.fillText(body.name.toUpperCase()+' DISK · '+text+' CSS px',12,57);
   }
   ctx.fillStyle=sizesAreTrue?'#ffd6ab':'#cae5f6';ctx.fillText(sizesAreTrue?'PHYSICAL DISK DIAMETERS · AU SCALE':'ENLARGED PLANET MARKERS',12,40);
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
  function resize(){width=Math.max(1,shell.clientWidth);height=Math.max(1,shell.clientHeight);dpr=Math.min(window.devicePixelRatio||1,coarse?1.25:1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw();selectedDetails();}
  function down(e){canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});pinchLast=0;moved=false;}
  function move(e){const p=pointers.get(e.pointerId);if(!p)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(pinchLast>4&&Math.abs(d-pinchLast)>2){
     const body=PLANET_ORBITS.find(p=>p.name===selected)||PLANET_ORBITS[2];
     const radius=sizesAreTrue?focusRadiusAUAtProgress(progress,body.diameterKm):radiusAUAtProgress(progress);
     const v=sizesAreTrue?focusProgressAtRadiusAU(radius*pinchLast/d,body.diameterKm):progressAtRadiusAU(radius*pinchLast/d);
     setProgress(v);onProgress(v,true);
    }pinchLast=d;moved=true;
   }else{targetBearing+=(e.clientX-p.x)*.004;moved=true;schedule();}
  }
  function up(e){if(!moved&&pointers.size===1){
    const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
    const body=PLANET_ORBITS.find(p=>p.name===selected)||PLANET_ORBITS[2];
    const radius=sizesAreTrue?focusRadiusAUAtProgress(progress,body.diameterKm):radiusAUAtProgress(progress);
    const pxRadius=Math.min(width,height)*.43,ppau=pxRadius/radius,foreshorten=height<width?.72:.9;
    const t=Math.max(0,Math.min(1,(Math.log10(radius/body.au)+1.2)/1.7)),blend=sizesAreTrue?t*t*(3-2*t):1;
    const ox=width*.5-Math.cos(body.phase+bearing)*body.au*(1-blend)*ppau;
    const oy=height*.51-Math.sin(body.phase+bearing)*body.au*(1-blend)*ppau*foreshorten;
    let nearest=null,dist=18;for(const p of PLANET_ORBITS){const th=p.phase+bearing,px=ox+Math.cos(th)*p.au*ppau,py=oy+Math.sin(th)*p.au*ppau*foreshorten;const d=Math.hypot(px-x,py-y);if(d<dist){dist=d;nearest=p.name;}}
    if(nearest)onSelect(nearest);
   }pointers.delete(e.pointerId);pinchLast=0;moved=false;
  }
  function wheel(e){
   if(canvas.hidden)return;
   const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?height:1);
   const step=Math.sign(dy)*Math.min(.09,Math.abs(dy)*.0008);
   const v=Math.max(0,Math.min(1,progress+step));
   // Do not trap scrolling at either camera end.
   if(Math.abs(v-progress)<1e-8)return;
   e.preventDefault();setProgress(v);onProgress(v,true);
  }
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});
  const ro=new ResizeObserver(resize);ro.observe(shell);
  return {resize,setProgress,setTrueSizes(v){sizesAreTrue=Boolean(v);draw();},setGuide(v){guideOn=Boolean(v);draw();},selectPlanet(name){selected=name;draw();},
   start(direction){flightStart=progress;to=direction;flightElapsed=0;flightDuration=9.5*Math.abs(to-flightStart);flightSpeed=0;playing=flightDuration>.001;last=0;onProgress(progress);if(playing)schedule();},stop(){playing=false;flightSpeed=0;},isPlaying:()=>playing,
   dispose(){disposed=true;playing=false;if(raf!==null)cancelAnimationFrame(raf);ro.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);}
  };
 }
}
