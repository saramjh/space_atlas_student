import {currentRenderTier} from './render-device-tier.js';
// Opt-in dimensionless gravitational test bench. No recorded observational
// planet texture, live measurement, simulated gas giant landing or real-time
// fall duration. A physically proportionate planet radius and Earth reference
// share common units; the camera adapts dynamically to frame the experiment.
import {relativeSurfaceGravity,probeRadialAcceleration,initialProbeState,integrateProbeFall} from './gravity-probe-math.js';
export async function createGravityImmersive(canvas,shell,onStatus=()=>{}){
 const THREE=await import('three');
 const tier=currentRenderTier();
 const renderer=new THREE.WebGLRenderer({canvas,antialias:tier.antialias,powerPreference:'low-power'});
 const coarse=tier.constrained;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 renderer.setPixelRatio(tier.pixelRatio);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.3;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x080f1f);
 scene.add(new THREE.AmbientLight(0x9fbedf,.88));
 const key=new THREE.DirectionalLight(0xffe0bb,3.1);key.position.set(-3,7,12);scene.add(key);
 const rim=new THREE.DirectionalLight(0x9bd5ff,1.7);rim.position.set(3,-3,-4);scene.add(rim);
 const camera=new THREE.PerspectiveCamera(44,1,.01,300);
 const bodyGeo=new THREE.SphereGeometry(1,64,48);
 const bodyMat=new THREE.MeshStandardMaterial({color:0x6a9fce,roughness:.8,metalness:0});
 // A lightweight procedural pale-grain surface improves spatial depth,
 // without pretending any hypothetical body is a measured planet image.
 const surface=document.createElement('canvas');surface.width=512;surface.height=256;
 const surfaceCtx=surface.getContext('2d');
 if(surfaceCtx){
  const pixels=surfaceCtx.createImageData(512,256);
  for(let y=0;y<256;y++)for(let x=0;x<512;x++){
    const wave=Math.sin(y*.105+Math.sin(x*.026)*.67)*.10+Math.sin(y*.36+x*.018)*.036;
    const grain=Math.sin(x*12.9898+y*78.233)*43758.5453;
    const value=Math.max(110,Math.min(250,Math.round(212+wave*120+(grain-Math.floor(grain)-.5)*24)));
    const i=(y*512+x)*4;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255;
  }
  surfaceCtx.putImageData(pixels,0,0);
  bodyMat.map=new THREE.CanvasTexture(surface);
  bodyMat.map.colorSpace=THREE.SRGBColorSpace;
  bodyMat.needsUpdate=true;
 }
 const body=new THREE.Mesh(bodyGeo,bodyMat);scene.add(body);
 const glowGeo=new THREE.SphereGeometry(1.025,48,32);
 const glowMat=new THREE.MeshBasicMaterial({color:0x9fcde7,transparent:true,opacity:.075,depthWrite:false,side:THREE.BackSide});
 const bodyGlow=new THREE.Mesh(glowGeo,glowMat);scene.add(bodyGlow);
 const refGeo=new THREE.SphereGeometry(1,36,26);
 const refMat=new THREE.MeshStandardMaterial({color:0x92f3de,roughness:.72,metalness:0,transparent:true,opacity:.64});
 const ref=new THREE.Mesh(refGeo,refMat);scene.add(ref);
 const probeGeo=new THREE.SphereGeometry(1,16,12);
 const probeMat=new THREE.MeshBasicMaterial({color:0xffc57e});
 const probe=new THREE.Mesh(probeGeo,probeMat);scene.add(probe);
 const shadowMat=new THREE.MeshBasicMaterial({color:0x92f3de,transparent:true,opacity:.12,depthWrite:false});
 const ghost=new THREE.Mesh(refGeo,shadowMat);scene.add(ghost);
 const edgeGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(1,0,0)]);
 const edgeMat=new THREE.LineBasicMaterial({color:0xffc57e,transparent:true,opacity:.64});
 const trail=new THREE.Line(edgeGeo,edgeMat);scene.add(trail);
 let mass=1,radius=1,fall=initialProbeState(radius),playing=false,elapsed=0;
 let azimuth=.2,targetAzimuth=.2,elevation=.13,targetElevation=.13,dolly=1,targetDolly=1;
 let raf=null,last=0,disposed=false,lastStatus='';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const pointers=new Map();let lastPinch=0;
 const seedPoints=[],seedColors=[];
 let seed=83;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0,n=coarse?270:900;i<n;i++){
  const x=(rand()-.5)*140,y=(rand()-.5)*130,z=-24-rand()*40;
  seedPoints.push(x,y,z);const k=.2+.6*rand();seedColors.push(k*.7,k*.85,k);
 }
 const starsGeo=new THREE.BufferGeometry();starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(seedPoints,3));starsGeo.setAttribute('color',new THREE.Float32BufferAttribute(seedColors,3));
 const starsMat=new THREE.PointsMaterial({size:.085,vertexColors:true,transparent:true,opacity:.85,depthWrite:false});
 scene.add(new THREE.Points(starsGeo,starsMat));
 function status(){
  const g=relativeSurfaceGravity(mass,radius),p=probeRadialAcceleration(mass,radius,Math.max(0,fall.radialDistance-radius));
  const label=fall.landed?'Test probe reached the reference surface':playing?'Test probe falling':'Test probe ready';
  const message=`${label}. Surface g = ${g.toFixed(g<.1?3:2)}× Earth; present test-point acceleration ≈ ${p.toFixed(p<.1?3:2)}× Earth. Model units only.`;
  if(message!==lastStatus){lastStatus=message;onStatus(message);}return message;
 }
 function draw(){
  if(disposed||canvas.hidden||shell.hidden)return;
  const w=Math.max(1,shell.clientWidth),h=Math.max(1,shell.clientHeight);
  const aspect=w/h;
  const distance=(Math.max(5.2,radius*3.10)+1.0)*dolly*(aspect<1?1.52:1);
  const targetX=-1.5;
  const tangent=distance*Math.cos(elevation);
  camera.position.set(targetX+Math.sin(azimuth)*tangent,distance*Math.sin(elevation),Math.cos(azimuth)*tangent);
  camera.lookAt(targetX,0,0);
  body.scale.setScalar(radius);bodyGlow.scale.setScalar(radius);
  body.position.set(0,0,0);
  bodyMat.color.setHSL(clamp(.59-.034*Math.log2(mass),.03,.65),.46,.55);
  ref.position.set(-radius-2.4,-Math.max(.7,radius*.38),Math.max(1.1,radius*.42));
  ref.scale.setScalar(1);
  ghost.position.set(0,0,0);ghost.scale.setScalar(1);
  probe.scale.setScalar(Math.max(.07,Math.min(.19,radius*.018)));
  probe.position.set(fall.radialDistance,0,.15);
  const pos=edgeGeo.attributes.position;
  pos.setXYZ(0,radius+.65,0,.14);
  pos.setXYZ(1,fall.radialDistance,0,.14);
  pos.needsUpdate=true;
  renderer.render(scene,camera);
 }
 function schedule(){if(raf===null&&!disposed&&!document.hidden)raf=requestAnimationFrame(frame);}
 function frame(now){
  raf=null;const dt=last?Math.min(.04,Math.max(0,(now-last)/1000)):0;last=now;
  if(playing){
    // Wall-clock playback is a deliberately compressed illustration. Fixed
    // substeps preserve Newtonian dimensionless trajectory shape.
    elapsed+=dt;let remaining=dt*1.45;
    while(remaining>0&&!fall.landed){const step=Math.min(.008,remaining);fall=integrateProbeFall(fall,mass,radius,step);remaining-=step;}
    if(fall.landed||elapsed>10){playing=false;status();}
    else if(Math.floor(elapsed*4)!==Math.floor((elapsed-dt)*4))status();
  }
  const k=reduced.matches?1:1-Math.exp(-12*dt);
  azimuth+=(targetAzimuth-azimuth)*k;
  elevation+=(targetElevation-elevation)*k;
  dolly+=(targetDolly-dolly)*k;
  draw();
  if(playing||Math.abs(azimuth-targetAzimuth)>.001||Math.abs(elevation-targetElevation)>.001||Math.abs(dolly-targetDolly)>.002)schedule();
 }
 function setParameters(nextMass,nextRadius){
  mass=Number(nextMass);radius=Number(nextRadius);relativeSurfaceGravity(mass,radius);
  playing=false;fall=initialProbeState(radius);elapsed=0;last=0;status();draw();
 }
 function start(){
  if(reduced.matches||document.hidden)return false;
  if(fall.landed){fall=initialProbeState(radius);elapsed=0;}
  playing=true;elapsed=0;last=0;status();schedule();return true;
 }
 function stop(){playing=false;status();}
 function resetProbe(){stop();fall=initialProbeState(radius);elapsed=0;status();draw();}
 function resize(){const w=Math.max(1,shell.clientWidth),h=Math.max(1,shell.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?54:44;camera.updateProjectionMatrix();draw();}
 function down(e){if(canvas.hidden)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0;}
 function move(e){const prev=pointers.get(e.pointerId);if(!prev)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const [a,b]=[...pointers.values()],span=Math.hypot(a.x-b.x,a.y-b.y);if(lastPinch>4)targetDolly=clamp(targetDolly*lastPinch/Math.max(4,span),.65,1.75);lastPinch=span;schedule();}
  else{targetAzimuth+=(e.clientX-prev.x)*.009;targetElevation=clamp(targetElevation+(e.clientY-prev.y)*.004,-.45,.55);schedule();}
 }
 function up(e){pointers.delete(e.pointerId);lastPinch=0;}
 function wheel(e){if(canvas.hidden)return;e.preventDefault();targetDolly=clamp(targetDolly*Math.exp(clamp(e.deltaY,-85,85)*.004),.65,1.75);schedule();}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});
 const ro=new ResizeObserver(resize);ro.observe(shell);
 const visibility=()=>{if(document.hidden){playing=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;}};
 document.addEventListener('visibilitychange',visibility);
 const onPreference=()=>{if(reduced.matches){stop();if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;azimuth=targetAzimuth;elevation=targetElevation;dolly=targetDolly;draw();}};
 reduced.addEventListener?.('change',onPreference);
 resize();status();
 return {setParameters,start,stop,resetProbe,resize,isPlaying:()=>playing,
  zoomBy(f){targetDolly=clamp(targetDolly*f,.65,1.75);schedule();},
  rotateBy(radians){targetAzimuth+=radians;schedule();},
  dispose(){disposed=true;visibility();ro.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener?.('change',onPreference);
   canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);
   for(const g of [bodyGeo,refGeo,probeGeo,edgeGeo,starsGeo,glowGeo])g.dispose();bodyMat.map?.dispose();for(const m of [bodyMat,refMat,probeMat,shadowMat,edgeMat,starsMat,glowMat])m.dispose();renderer.dispose();}
 };
}
