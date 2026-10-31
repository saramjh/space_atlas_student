import {cinematicEase} from './cinematic-motion.js';
// Source-photo-led documentary montage, NOT an uninterrupted physical-scale
// flight. The adjacent 27-decade ruler is the quantitative reference.
// Original sources, permitted use, and full photo credits are on the page.
export function createCosmicCinema(canvas,onStep){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas2D unavailable');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const coarse = matchMedia('(pointer: coarse)').matches;
 const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
 const sources=[
  'cosmic-apollo-human.webp','cosmic-blue-marble.webp',
  'cosmic-blue-marble.webp','cosmic-neptune-voyager.webp',
  'cosmic-proxima-hubble.webp','cosmic-milkyway-jpl.webp',
  'cosmic-andromeda-hubble.webp','cosmic-extreme-deep-field.webp'
 ];
 const images=new Map(),pointers=new Map();
 let width=1,height=1,dpr=1,step=0,previous=0,started=0,duration=0,frameId=null,disposed=false;
 let driftX=0,driftY=0,aimX=0,aimY=0,lastWheel=-10000,lastPinch=0;
 function request(){if(frameId===null&&!disposed&&!document.hidden)frameId=requestAnimationFrame(frame);}
 if(typeof Image!=='undefined'){
  for(const name of new Set(sources)){
   const img=new Image();img.decoding='async';
   img.onload=()=>{if(!disposed){images.set(name,img);request();}};
   img.onerror=()=>{console.warn('Reference image unavailable:',name);request();};
   img.src='../../assets/images/'+name;
  }
 }
 function fill(color){ctx.fillStyle=color;ctx.fillRect(0,0,width,height);}
 function gradientOverlay(){
  const g=ctx.createLinearGradient(0,0,0,height);
  g.addColorStop(0,'rgba(2,7,16,.43)');g.addColorStop(.27,'rgba(2,7,16,0)');
  g.addColorStop(.62,'rgba(2,7,16,0)');g.addColorStop(1,'rgba(2,7,16,.82)');
  ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
  const l=ctx.createLinearGradient(0,0,width*.48,0);
  l.addColorStop(0,'rgba(1,6,15,.68)');l.addColorStop(1,'rgba(1,6,15,0)');
  ctx.fillStyle=l;ctx.fillRect(0,0,width*.48,height);
 }
 function drawPhoto(name,scale=1,offsetX=0,focusX=.5,focusY=.5,fit='cover',opacity=1){
  const img=images.get(name);if(!img||!img.width||!img.height)return false;
  const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
  const base=fit==='contain'?Math.min(width/iw,height/ih):Math.max(width/iw,height/ih);
  const dw=iw*base*scale,dh=ih*base*scale;
  const x=width/2+(focusX-.5)*(width-dw)+offsetX+driftX*.17;
  const y=height/2+(focusY-.5)*(height-dh)+driftY*.13;
  ctx.save();ctx.globalAlpha*=opacity;ctx.imageSmoothingEnabled=true;
  ctx.drawImage(img,x-dw/2,y-dh/2,dw,dh);ctx.restore();return true;
 }
 function line(x1,y1,x2,y2,color='#cee0ea',w=1){
  ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
 }
 function metric(label,x,y,align='left',size=11){
  ctx.save();ctx.textAlign=align;ctx.font='700 '+size+'px ui-monospace,monospace';
  // Measured callouts must remain readable over authentic bright source frames.
  ctx.lineWidth=3;ctx.strokeStyle='rgba(0,4,15,.94)';ctx.strokeText(label,x,y);
  ctx.fillStyle='#fff4dc';ctx.fillText(label,x,y);ctx.restore();
 }
 function photoStage(i,scale=1,offsetX=0){
  const name=sources[i];
  if(!images.has(name)){fill('#040a14');return;}
  // Keep portrait/planet disks complete; use the same photograph blurred and
  // darkened as a supporting field instead of drawing a fake space object.
  if(i===0||i===1){
   drawPhoto(name,1.13+Math.max(0,scale-1)*.18,offsetX,.5,.5,'cover',.35);
   const fog=ctx.createLinearGradient(0,0,width,0);
   fog.addColorStop(0,'rgba(2,7,16,.52)');fog.addColorStop(.5,'rgba(2,7,16,.18)');
   fog.addColorStop(1,'rgba(2,7,16,.52)');
   ctx.fillStyle=fog;ctx.fillRect(0,0,width,height);
   drawPhoto(name,scale*.95,offsetX,.5,.5,'contain',1);
  }else if(i===2){
   // The ~30-Earth-diameter separation is a numeric teaching reference,
   // not a zoomed combined photograph of the Earth/Moon pair.
   drawPhoto(name,scale*1.10,offsetX,.51,.5,'cover',.33);
   ctx.fillStyle='rgba(1,8,19,.60)';ctx.fillRect(0,0,width,height);
   drawPhoto(name,scale*.38,offsetX-width*.27,.5,.5,'contain',1);
   const y=height*.52;
   ctx.setLineDash([4,8]);
   line(width*.35,y,width*.80,y,'rgba(207,231,248,.85)',1.3);ctx.setLineDash([]);
   metric('AVERAGE GAP · 384,400 km',width*.55,height*.43,'center',coarse?10:12);
   metric('SEPARATION IS ~30 EARTH DIAMETERS',width*.55,height*.69,'center',coarse?8:10);
  }else if(i===3){
   drawPhoto(name,scale*.91,offsetX,.5,.5,'contain',1);
   // The Neptune observation is a visual endpoint, not a photograph of orbit width.
   metric('VOYAGER 2 · NEPTUNE · 1989',width*.50,height*.79,'center',coarse?9:11);
  }else if(i===4){
   drawPhoto(name,scale*1.05,offsetX,.5,.5,'cover');
   metric('HUBBLE POINT-SOURCE IMAGE',width*.50,height*.79,'center',coarse?9:11);
  }else if(i===5){
   drawPhoto(name,scale,offsetX,.5,.5,'cover');
   metric('MILKY WAY · NASA/JPL ARTIST CONCEPT',width*.5,height*.81,'center',coarse?8:10);
  }else if(i===6){
   drawPhoto(name,scale,offsetX,.5,.5,'cover');
   metric('ANDROMEDA · LOCAL GROUP MEMBER',width*.5,height*.81,'center',coarse?9:11);
  }else{
   drawPhoto(name,scale,offsetX,.5,.5,'cover');
   metric('HUBBLE XDF · ONE TINY SKY FIELD',width*.5,height*.79,'center',coarse?9:11);
   metric('NOT THE EDGE OF ALL SPACE',width*.5,height*.85,'center',coarse?8:10);
  }
 }
 function scene(i,alpha,scale,shift){
  if(alpha<.001)return;
  ctx.save();ctx.globalAlpha=alpha;
  photoStage(i,scale,shift);gradientOverlay();ctx.restore();
 }
 function paint(now=performance.now()){
  if(disposed||canvas.hidden||width<4||height<4)return;
  const t=duration?clamp((now-started)/duration,0,1):1;
  const eased=cinematicEase(t);
  ctx.setTransform(dpr,0,0,dpr,0,0);fill('#020813');
  // Editorial image choreography: outward = source recedes, next reference
  // emerges, but the transition is NOT a physical movement between measures.
  if(t<1){
   const outward=step>=previous,shift=(outward?-1:1)*width*.14;
   scene(previous,1-eased,1-.26*eased,shift*eased);
   scene(step,eased,1.21-.21*eased,-shift*(1-eased));
  }else scene(step,1,1,0);
 }
 function frame(now){
  frameId=null;
  driftX+=(aimX-driftX)*.17;driftY+=(aimY-driftY)*.17;
  paint(now);
  if((now-started)<duration||Math.abs(aimX-driftX)+Math.abs(aimY-driftY)>.5)request();
 }
 function setStep(next){
  if(!Number.isInteger(next)||next<0||next>7)return;
  if(next===step){paint();return;}
  previous=step;step=next;
  duration=reduced.matches?0:1400;started=performance.now();request();
 }
 function resize(){
  const box=canvas.getBoundingClientRect();if(box.width<4||box.height<4)return;
  width=box.width;height=box.height;dpr=Math.min(window.devicePixelRatio||1,coarse?1.25:1.75);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);paint();
 }
 function wheel(e){
  const now=performance.now();if(Math.abs(e.deltaY)<2)return;
  const next=clamp(step+(e.deltaY>0?1:-1),0,7);
  if(next===step)return;
  e.preventDefault();if(now-lastWheel<650)return;
  lastWheel=now;onStep(next);
 }
 function pointerDown(e){canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0;}
 function pointerMove(e){
  if(!pointers.has(e.pointerId))return;
  const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){
   const [a,b]=[...pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);
   if(lastPinch>0&&Math.abs(dist-lastPinch)>28){
    onStep(clamp(step+(dist>lastPinch?-1:1),0,7));lastPinch=dist;
   }else if(!lastPinch)lastPinch=dist;
  }else{
   aimX=clamp(aimX+(e.clientX-prev.x)*.38,-width*.07,width*.07);
   aimY=clamp(aimY+(e.clientY-prev.y)*.38,-height*.07,height*.07);request();
  }
 }
 function pointerUp(e){pointers.delete(e.pointerId);lastPinch=0;}
 function keyDown(e){
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
   e.preventDefault();onStep(clamp(step+(e.key==='ArrowRight'?1:-1),0,7));
  }
 }
 canvas.addEventListener('wheel',wheel,{passive:false});
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);
 canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);
 canvas.addEventListener('keydown',keyDown);
 const visibility=()=>{if(document.hidden&&frameId!==null){cancelAnimationFrame(frameId);frameId=null;}};
 document.addEventListener('visibilitychange',visibility);
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 return {setStep,resize,suspend(){
  if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;started=0;duration=0;
 },dispose(){
  disposed=true;observer.disconnect();visibility();document.removeEventListener('visibilitychange',visibility);
  canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('pointerdown',pointerDown);
  canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);
  canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('keydown',keyDown);
 }};
}