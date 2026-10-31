import {cinematicEase} from './cinematic-motion.js';
// Illustrative stage scenes: never a single physically scaled camera journey.
// The adjacent 27-decade ruler encodes approximate measured lengths/separations.
export function createCosmicCinema(canvas,onStep){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas2D unavailable');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const coarse = matchMedia('(pointer: coarse)').matches;
 const TAU=Math.PI*2,clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const rand=n=>{const t=Math.sin((n+23.17)*127.113)*43758.5453;return t-Math.floor(t);};
 const ptrs=new Map();
 let width=1,height=1,dpr=1,step=0,previous=0,start=0,duration=0,frameId=null,disposed=false;
 let parallaxX=0,parallaxY=0,targetX=0,targetY=0,lastWheel=-10000,lastPinch=0;
 const stars=Array.from({length:coarse?140:300},(_,i)=>({
  x:rand(i*13+1),y:rand(i*17+2),size:.25+rand(i*5+4)*1.3,
  alpha:.13+rand(i*19+3)*.65,depth:.2+rand(i*7+1)*.8
 }));
 const galaxyPoints=Array.from({length:coarse?2100:5600},(_,i)=>{
  const radial=Math.pow(rand(i*19+3),.74),arm=i%4;
  const angle=arm*TAU/4+radial*5.8+(rand(i*23+5)-.5)*(.44+radial*.64);
  return {x:Math.cos(angle)*radial,y:Math.sin(angle)*radial,
   alpha:(.22+.78*rand(i*11+8))*(1-radial*.22),
   size:.35+rand(i*13+6)*1.35,warm:rand(i*7+5)>.67};
 });
 const galaxyDust=Array.from({length:coarse?160:460},(_,i)=>{
  const radial=.18+rand(i*17+2)*.8,angle=(i%4)*TAU/4+radial*5.8+.18+(rand(i*41+11)-.5)*.15;
  return {x:Math.cos(angle)*radial,y:Math.sin(angle)*radial,r:.7+rand(i*7+2)*1.5};
 });
 const textures=new Map();
 const request=()=>{if(frameId===null&&!document.hidden&&!disposed)frameId=requestAnimationFrame(frame);};
 if(typeof Image!=='undefined'){
  for(const entry of [['earth','planet-earth-nasa.webp'],['moon','moon-lroc-nasa.webp']]){
   const img=new Image();img.onload=()=>{textures.set(entry[0],img);request();};
   img.onerror=()=>{};img.src='../../assets/images/'+entry[1];
  }
 }
 function glow(x,y,r,a,b){
  if(r<.1)return;
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,a);g.addColorStop(1,b);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
 }
 function line(x1,y1,x2,y2,color='#83afca',lw=1){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();
 }
 function label(s,x,y,sz=11,color='#c9dbe4',align='left'){
  ctx.textAlign=align;ctx.fillStyle=color;ctx.font='600 '+sz+'px ui-monospace,monospace';ctx.fillText(s,x,y);
 }
 function disk(x,y,r,kind='earth'){
  if(r<.25)return;
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.clip();
  const img=textures.get(kind);
  if(img&&r>2)ctx.drawImage(img,x-r,y-r,r*2,r*2);
  else{
   const paint=ctx.createLinearGradient(x-r,y-r,x+r,y+r);
   paint.addColorStop(0,kind==='moon'?'#f2efe5':'#a6d5e5');
   paint.addColorStop(.44,kind==='moon'?'#9ea9ae':'#337eb2');
   paint.addColorStop(1,kind==='moon'?'#48535b':'#14344f');
   ctx.fillStyle=paint;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  const shadow=ctx.createLinearGradient(x-r,y-r*.35,x+r,y+r*.3);
  shadow.addColorStop(0,'rgba(0,4,13,.02)');shadow.addColorStop(.55,'rgba(0,4,13,.15)');
  shadow.addColorStop(1,'rgba(0,3,13,.88)');
  ctx.fillStyle=shadow;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
  if(r>3){ctx.strokeStyle='rgba(172,211,235,.33)';ctx.lineWidth=Math.max(.65,r*.008);
   ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
 }
 function sun(x,y,r){
  glow(x,y,Math.max(23,r*4.8),'rgba(255,165,67,.24)','rgba(255,120,48,0)');
  const g=ctx.createRadialGradient(x-r*.25,y-r*.28,0,x,y,r);
  g.addColorStop(0,'#fffbea');g.addColorStop(.6,'#ffe2a1');g.addColorStop(1,'#eaa85b');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
 }
 function silhouette(x,y,h){
  // Plain anthropometric reference, not a cartoon astronaut.
  ctx.save();ctx.translate(x,y);const unit=h/170;ctx.scale(unit,unit);
  const fill=ctx.createLinearGradient(-25,-125,30,30);
  fill.addColorStop(0,'#b6c5c6');fill.addColorStop(.45,'#68889d');fill.addColorStop(1,'#283b50');
  ctx.fillStyle=fill;ctx.strokeStyle='#c1d7da';ctx.lineWidth=1.4;ctx.lineJoin='round';
  ctx.beginPath();ctx.ellipse(0,-143,13,17,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-15,-123);ctx.lineTo(15,-123);ctx.lineTo(22,-102);
  ctx.lineTo(17,-56);ctx.lineTo(11,-46);ctx.lineTo(-11,-46);ctx.lineTo(-17,-56);
  ctx.lineTo(-22,-102);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.lineCap='round';
  for(const sign of [-1,1]){
   ctx.beginPath();ctx.moveTo(sign*18,-117);ctx.lineTo(sign*28,-78);ctx.lineTo(sign*29,-47);
   ctx.lineWidth=10;ctx.strokeStyle='#647f91';ctx.stroke();
   ctx.beginPath();ctx.moveTo(sign*9,-47);ctx.lineTo(sign*11,-5);ctx.lineTo(sign*15,0);
   ctx.lineWidth=15;ctx.strokeStyle='#658196';ctx.stroke();
   ctx.beginPath();ctx.moveTo(sign*9,-47);ctx.lineTo(sign*11,-5);
   ctx.lineWidth=1.6;ctx.strokeStyle='#b5cad0';ctx.stroke();
  }ctx.restore();
 }
 function backdrop(s,travel=0){
  const bg=ctx.createLinearGradient(0,0,width,height);
  bg.addColorStop(0,'#030915');bg.addColorStop(.5,'#071628');bg.addColorStop(1,'#02050e');
  ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  const density=s===0?.2:s===4?.32:.86;
  ctx.save();ctx.translate(parallaxX*.22,parallaxY*.22);
  for(const p of stars){
   const x=(p.x-.5)*width*(1+travel*.22*p.depth)+width*.5;
   const y=(p.y-.5)*height*(1+travel*.22*p.depth)+height*.5;
   ctx.fillStyle='rgba(211,230,247,'+(p.alpha*density)+')';ctx.fillRect(x,y,p.size,p.size);
  }ctx.restore();
  if(travel>.05){
   for(let i=0;i<24;i++){const p=stars[i*3],x=p.x*width,y=p.y*height;
    line(x,y,x+(p.x-.5)*travel*120,y+(p.y-.5)*travel*80,
     'rgba(152,195,238,'+(travel*.25)+')',.75);}
  }
 }
 function galaxy(x,y,r,tilt=0,alpha=1,phase=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.globalAlpha*=alpha;
  const rot=phase*.13;
  glow(0,0,r*.96,'rgba(132,178,212,.09)','rgba(22,66,112,0)');
  ctx.save();ctx.scale(1,.46);
  // Volumetric arm ribbons under the individual stars. They are explicitly
  // an artistic outside-the-galaxy reconstruction, not an observed photograph.
  ctx.save();
  ctx.lineCap='round';ctx.lineJoin='round';
  for(let arm=0;arm<4;arm++){
   for(const layer of [0,1,2]){
    ctx.beginPath();
    for(let j=0;j<=100;j++){
     const radius=.10+j/100*.88;
     const angle=arm*TAU/4+radius*5.8+rot;
     const px=Math.cos(angle)*radius*r,py=Math.sin(angle)*radius*r;
     if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.strokeStyle=layer===0?'rgba(77,138,209,.075)':layer===1?'rgba(135,191,243,.08)':'rgba(253,214,168,.045)';
    ctx.lineWidth=r*(layer===0?.18:layer===1?.085:.035);
    ctx.shadowColor=layer===0?'#235483':'#c4d9eb';ctx.shadowBlur=layer===0?28:15;
    ctx.stroke();
   }
  }
  ctx.restore();
  for(const p of galaxyPoints){
   const px=(p.x*Math.cos(rot)-p.y*Math.sin(rot))*r;
   const py=(p.x*Math.sin(rot)+p.y*Math.cos(rot))*r;
   ctx.fillStyle=p.warm?'rgba(255,227,174,'+p.alpha+')':'rgba(161,201,251,'+p.alpha+')';
   ctx.fillRect(px,py,p.size,p.size);
  }
  for(const p of galaxyDust){ctx.fillStyle='rgba(4,13,27,.48)';
   ctx.beginPath();ctx.arc(p.x*r,p.y*r,p.r,0,TAU);ctx.fill();}
  ctx.restore();
  glow(0,0,r*.32,'rgba(247,232,186,.84)','rgba(223,169,99,0)');
  ctx.restore();
 }
 function horizon(){
  const r=Math.min(width,height)*.54;
  const g=ctx.createRadialGradient(0,0,r*.05,0,0,r);
  g.addColorStop(0,'rgba(49,102,167,.28)');g.addColorStop(.55,'rgba(39,86,148,.30)');
  g.addColorStop(.88,'rgba(67,72,126,.10)');g.addColorStop(1,'rgba(69,77,121,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
  // Population concentrates loosely into groups, with irregular voids.
  // Their positions are schematic and do not claim a real sky survey.
  const clusters=[[-.51,-.25,.26],[.29,-.42,.20],[-.08,.12,.29],[.42,.26,.23],[-.48,.41,.19],[.13,.51,.18]];
  for(const c of clusters)glow(c[0]*r,c[1]*r*.72,r*c[2]*1.1,'rgba(123,170,206,.15)','rgba(60,91,146,0)');
  for(let i=0;i<(coarse?320:770);i++){
   const cluster=clusters[i%clusters.length],jitter=rand(i*23+4);
   const an=rand(i*11+4)*TAU;
   const rr=Math.sqrt(jitter)*cluster[2]*r*1.65;
   const x=cluster[0]*r+Math.cos(an)*rr,y=cluster[1]*r*.72+Math.sin(an)*rr*.7;
   const sz=.45+rand(i*19+5)*2.5;
   ctx.fillStyle=rand(i*7+8)>.5?'rgba(236,199,150,.58)':'rgba(163,213,251,.55)';
   ctx.beginPath();ctx.ellipse(x,y,sz*1.48,sz*.52,an+i*.04,0,TAU);ctx.fill();
  }
  ctx.save();ctx.setLineDash([3,9]);ctx.strokeStyle='rgba(190,194,217,.36)';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(0,0,r*.98,r*.74,-.03,Math.PI*.2,Math.PI*1.8);ctx.stroke();ctx.restore();
  label('OBSERVABLE HORIZON',0,r*.70,11,'#e7d1aa','center');
  label('NOT AN EDGE OF ALL SPACE',0,r*.77,9,'#b5c3d6','center');
 }
 function illustration(s,opacity,scale,offset=0){
  if(opacity<=.001)return;
  ctx.save();ctx.globalAlpha*=opacity;
  ctx.translate(width*.5+parallaxX*.55+offset,height*.51+parallaxY*.3);ctx.scale(scale,scale);
  const u=Math.min(width,height),w=width,h=height;
  switch(s){
   case 0:{
    glow(0,u*.38,u*.9,'rgba(39,83,123,.30)','rgba(7,19,39,0)');
    const g=ctx.createLinearGradient(0,-u*.05,0,u*.54);
    g.addColorStop(0,'#193e59');g.addColorStop(1,'#081424');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,u*.76,w*.85,u*.58,0,Math.PI,TAU);ctx.fill();
    const hy=u*.52;
    for(let k=0;k<8;k++){const yy=u*(.25+k*.042);
     line(-w*.34,yy,w*.34,yy,'rgba(111,157,175,.15)',.7);}
    silhouette(0,u*.28,hy);
    const ex=Math.min(w*.30,u*.28);
    line(ex,-hy*.66,ex,u*.28,'rgba(225,199,159,.9)',1.6);
    line(ex-6,-hy*.66,ex+6,-hy*.66,'rgba(225,199,159,.9)',1.6);
    line(ex-6,u*.28,ex+6,u*.28,'rgba(225,199,159,.9)',1.6);
    label('1.7 m',ex+9,-hy*.12,12,'#f0cf9f');
    label('HUMAN HEIGHT',0,u*.40,10,'#bcd4df','center');break;
   }
   case 1:{
    glow(0,0,u*.62,'rgba(52,99,143,.26)','rgba(8,24,45,0)');
    disk(0,0,u*.365,'earth');
    label('EARTH · DIAMETER',0,u*.44,11,'#cbd9e1','center');break;
   }
   case 2:{
    // Unlike the other scenes, this one preserves Earth/Moon diameter and gap ratios.
    const dist=w*.70,ex=-dist*.5,mx=dist*.5;
    const er=dist/(384400/12742)/2,mr=er*(3474/12742);
    ctx.setLineDash([3,7]);line(ex,0,mx,0,'rgba(206,227,238,.54)',1);ctx.setLineDash([]);
    disk(ex,0,Math.max(.6,er),'earth');disk(mx,0,Math.max(.25,mr),'moon');
    label('EARTH',ex,Math.max(27,er+18),10,'#dbecf4','center');
    label('MOON',mx,29,10,'#e7dfd1','center');
    label('384,400 km CENTER-TO-CENTER',0,u*.29,10,'#f2cfa1','center');
    label('BODY DIAMETERS SHARE THE DISTANCE SCALE',0,u*.36,9,'#a2bdc9','center');break;
   }
   case 3:{
    const rr=u*.43,flatten=.63,au=[.39,.72,1,1.52,5.2,9.58,19.2,30.05];
    glow(0,0,u*.4,'rgba(212,131,51,.12)','rgba(25,38,62,0)');
    for(let i=0;i<au.length;i++){
     const radius=au[i]/30.05*rr;
     ctx.strokeStyle=i===7?'rgba(215,199,153,.65)':'rgba(130,167,198,'+(.18+i*.026)+')';
     ctx.lineWidth=i===7?1.3:.9;
     ctx.beginPath();ctx.ellipse(0,0,radius,radius*flatten,-.15,0,TAU);ctx.stroke();
    }
    sun(0,0,Math.max(3.5,u*.012));
    for(let i=2;i<au.length;i++){const radius=au[i]/30.05*rr,an=i*2.12;
     ctx.fillStyle=i===7?'#a4caff':'#b1b4b9';ctx.beginPath();
     ctx.arc(Math.cos(an)*radius,Math.sin(an)*radius*flatten,i===7?3.5:2.1,0,TAU);ctx.fill();}
    label('NEPTUNE ORBIT · ~30 AU RADIUS',0,u*.36,10,'#d9d4ba','center');
    label('ORBITS PROPORTIONAL · BODY MARKERS ENLARGED',0,u*.41,9,'#a8c8d8','center');break;
   }
   case 4:{
    const left=-w*.34,right=w*.34;sun(left,0,Math.max(4,u*.025));
    glow(right,0,u*.075,'rgba(218,119,79,.21)','rgba(156,77,47,0)');
    ctx.fillStyle='#f6c69b';ctx.beginPath();ctx.arc(right,0,Math.max(2.5,u*.008),0,TAU);ctx.fill();
    ctx.setLineDash([2,12]);line(left+u*.04,u*.11,right-u*.025,u*.11,'rgba(180,207,227,.48)',1);ctx.setLineDash([]);
    label('SUN',left,u*.16,10,'#ffe2b8','center');
    label('PROXIMA CENTAURI',right,u*.16,10,'#ffc49c','center');
    label('4.25 LIGHT-YEARS OF SEPARATION',0,u*.31,11,'#eed2a7','center');
    label('NOT THE STARS AT THEIR TRUE DIAMETERS',0,u*.37,9,'#a5c0d0','center');break;
   }
   case 5:{
    galaxy(0,0,u*.69,-.17,1,1);
    label('MILKY WAY · APPROX. DISK EXTENT',0,u*.38,10,'#d8d5bc','center');
    label('ARTIST MODEL · VIEW FROM OUTSIDE',0,u*.44,9,'#a5c0d0','center');break;
   }
   case 6:{
    galaxy(-w*.23,-u*.04,u*.38,-.22,1,1);galaxy(w*.26,u*.03,u*.42,.33,.85,2);
    for(let i=0;i<9;i++){const x=(rand(i*7+3)-.5)*w*.8,y=(rand(i*11+6)-.5)*u*.6;
     if(Math.abs(x)<w*.08)continue;
     glow(x,y,3+rand(i+9)*4,'rgba(175,204,228,.27)','rgba(125,171,215,0)');}
    label('MILKY WAY',-w*.23,u*.35,9,'#dad7ce','center');
    label('ANDROMEDA',w*.26,u*.35,9,'#dad7ce','center');
    label('PLACEMENT AND SIZE ARE SCHEMATIC',0,u*.44,9,'#a7c3d5','center');break;
   }
   case 7:horizon();break;
  }ctx.restore();
 }
 function paint(now=performance.now()){
  if(disposed||canvas.hidden||width<4||height<4)return;
  const t=duration?clamp((now-start)/duration,0,1):1;
  const eased=cinematicEase(t),e=eased;
  ctx.setTransform(dpr,0,0,dpr,0,0);backdrop(step,t<1?Math.sin(Math.PI*t):0);
  if(t<1){
   const outward=step>=previous;
   illustration(previous,1-e,outward?1-.82*e:1+1.45*e,(outward?-1:1)*e*width*.1);
   illustration(step,e,outward?1.65-.65*e:.53+.47*e,(outward?1:-1)*(1-e)*width*.1);
  }else illustration(step,1,1);
 }
 function frame(now){
  frameId=null;const elapsed=(now-start)/Math.max(duration,1);
  parallaxX+=(targetX-parallaxX)*.17;parallaxY+=(targetY-parallaxY)*.17;
  paint(now);
  if(elapsed<1||Math.abs(targetX-parallaxX)+Math.abs(targetY-parallaxY)>.45)request();
 }
 function setStep(next){
  if(!Number.isInteger(next)||next<0||next>7)return;
  if(next===step){paint();return;}
  previous=step;step=next;duration=reduced.matches?0:1400;start=performance.now();request();
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
 function pointerDown(e){canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0;}
 function pointerMove(e){
  if(!ptrs.has(e.pointerId))return;
  const prior=ptrs.get(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){
   const [a,b]=[...ptrs.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);
   if(lastPinch>0&&Math.abs(dist-lastPinch)>28){
    onStep(clamp(step+(dist>lastPinch?-1:1),0,7));lastPinch=dist;
   }else if(!lastPinch)lastPinch=dist;
  }else{
   targetX=clamp(targetX+(e.clientX-prior.x)*.35,-width*.07,width*.07);
   targetY=clamp(targetY+(e.clientY-prior.y)*.35,-height*.07,height*.07);request();
  }
 }
 function pointerUp(e){ptrs.delete(e.pointerId);lastPinch=0;}
 function keyDown(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
  e.preventDefault();onStep(clamp(step+(e.key==='ArrowRight'?1:-1),0,7));
 }}
 canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('pointerdown',pointerDown);
 canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);
 canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('keydown',keyDown);
 const visibility=()=>{if(document.hidden&&frameId!==null){cancelAnimationFrame(frameId);frameId=null;}};
 document.addEventListener('visibilitychange',visibility);
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 return {setStep,resize,
  suspend(){if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;start=0;duration=0;},
  dispose(){disposed=true;observer.disconnect();visibility();document.removeEventListener('visibilitychange',visibility);
   canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('pointerdown',pointerDown);
   canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);
   canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('keydown',keyDown);}
 };
}