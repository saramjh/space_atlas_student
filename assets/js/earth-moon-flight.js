// Opt-in Earth-to-Moon camera choreography. Sizes and center separation use a
// common physical scale. The camera route/speed, lighting and lunar texture
// are educational artistic choices, not a mission trajectory or live ephemeris.
import {earthMoonModel} from './earth-moon-flight-math.js';
export async function createEarthMoonFlight(canvas,container,onProgress=()=>{}) {
  const THREE=await import('three');
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x050c18);
  const camera=new THREE.PerspectiveCamera(48,1,.08,550);
  const coarse=matchMedia('(pointer: coarse)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const dpr=Math.min(window.devicePixelRatio||1,coarse?1.25:1.75);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:!coarse,powerPreference:'low-power'});
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  scene.add(new THREE.AmbientLight(0xc4d9ec,.78));
  const sunlight=new THREE.DirectionalLight(0xfff0d4,2.5);
  sunlight.position.set(-12,14,13);scene.add(sunlight);
  const earthMaterial=new THREE.MeshStandardMaterial({color:0x9fc9f5,roughness:1,metalness:0});
  const earthGeometry=new THREE.SphereGeometry(1,64,48);
  const earth=new THREE.Mesh(earthGeometry,earthMaterial);scene.add(earth);
  const moonMaterial=new THREE.MeshStandardMaterial({color:0xd5d0c7,roughness:1,metalness:0});
  const moonGeometry=new THREE.SphereGeometry(earthMoonModel().moonRadiusScene,48,32);
  const moon=new THREE.Mesh(moonGeometry,moonMaterial);scene.add(moon);
  // Reproducible, unobserved Moon surface impression — no misleading NASA
  // credit for a procedural map. A true lunar observation is cited below.
  const textureCanvas=document.createElement('canvas');
  textureCanvas.width=768;textureCanvas.height=384;
  const context=textureCanvas.getContext('2d');
  if(context){
    context.fillStyle='#b0aaa1';context.fillRect(0,0,768,384);
    let seed=1127;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    for(let i=0;i<30;i++){
      const x=rand()*768,y=rand()*384;
      context.fillStyle=`rgba(60,64,72,${.03+rand()*.1})`;
      context.beginPath();context.ellipse(x,y,20+rand()*85,13+rand()*35,rand()*6.28,0,Math.PI*2);context.fill();
    }
    for(let i=0;i<410;i++){
      const x=rand()*768,y=rand()*384,r=1+Math.pow(rand(),3)*19;
      context.fillStyle=`rgba(61,57,51,${.04+rand()*.17})`;
      context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.fill();
      context.strokeStyle=`rgba(237,235,226,${.05+rand()*.14})`;context.lineWidth=Math.max(.6,r*.19);
      context.beginPath();context.arc(x-r*.08,y-r*.08,r*.92,0,Math.PI*2);context.stroke();
    }
    const texture=new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace=THREE.SRGBColorSpace;
    moonMaterial.map=texture;moonMaterial.color.set(0xffffff);moonMaterial.needsUpdate=true;
  }
  let seed=70347;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const positions=[],colors=[];
  for(let i=0,n=coarse?400:1300;i<n;i++){
    const x=(random()-.1)*450-80,y=(random()-.5)*170,z=(random()-.5)*170;
    if(Math.abs(y)<3&&Math.abs(z)<3)continue;
    positions.push(x,y,z);
    const b=.4+random()*.6;colors.push(.68*b,.82*b,1*b);
  }
  const fieldGeometry=new THREE.BufferGeometry();
  fieldGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  fieldGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const fieldMaterial=new THREE.PointsMaterial({size:.075,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.86,depthWrite:false});
  scene.add(new THREE.Points(fieldGeometry,fieldMaterial));
  let model=earthMoonModel();moon.position.x=model.moonCenterScene;
  let progress=0,targetProgress=0;
  let cameraBearing=0,targetBearing=0,tilt=0,targetTilt=0,zoom=1,targetZoom=1;
  let playing=false,raf=null,last=0,elapsed=0,disposed=false;
  const pointers=new Map();let lastPinch=0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function draw(){
    if(disposed||canvas.hidden)return;
    const moonX=model.moonCenterScene;
    const t=progress;
    // Staged view offsets allow the Earth to recede and the Moon to enter
    // without inflating either sphere or shortening their center separation.
    const cameraX=-2.6+(moonX+1.5)*t;
    const side=(2.1-1.35*t)*zoom;
    const rise=(1.0-.35*t)*zoom;
    camera.position.set(cameraX,Math.sin(cameraBearing)*side+rise+tilt,Math.cos(cameraBearing)*side);
    camera.lookAt(moonX*t,0,0);
    renderer.render(scene,camera);
  }
  function schedule(){if(raf===null&&!disposed&&!document.hidden)raf=requestAnimationFrame(frame);}
  function frame(now){
    raf=null;
    const dt=last?Math.min(.06,Math.max(0,(now-last)/1000)):0;last=now;
    if(playing){elapsed+=dt;targetProgress=clamp(elapsed/12.5,0,1);onProgress(targetProgress);if(targetProgress>=1)playing=false;}
    const k=reduced.matches?1:1-Math.exp(-12*dt);
    progress+=(targetProgress-progress)*k;
    cameraBearing+=(targetBearing-cameraBearing)*k;
    tilt+=(targetTilt-tilt)*k;
    zoom+=(targetZoom-zoom)*k;
    draw();
    const moving=Math.abs(progress-targetProgress)>.00025||Math.abs(cameraBearing-targetBearing)>.0003||Math.abs(tilt-targetTilt)>.002||Math.abs(zoom-targetZoom)>.002;
    if(playing||moving)schedule();
  }
  function setProgress(v){targetProgress=clamp(Number(v)||0,0,1);if(reduced.matches){progress=targetProgress;draw();}else schedule();}
  function setSeparationKm(v){model=earthMoonModel(v);moon.position.x=model.moonCenterScene;draw();}
  function setPlaying(enabled){
    playing=!!enabled&&!reduced.matches&&!document.hidden;
    if(playing){elapsed=targetProgress*12.5;last=0;schedule();}
  }
  function onWheel(e){
    if(canvas.hidden)return;
    e.preventDefault();setProgress(targetProgress+(e.deltaY>0?.025:-.025));onProgress(targetProgress);
  }
  function down(e){if(canvas.hidden)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0;}
  function move(e){
    const prev=pointers.get(e.pointerId);if(!prev)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){
      const [a,b]=[...pointers.values()],span=Math.hypot(a.x-b.x,a.y-b.y);
      if(lastPinch>4&&Math.abs(span-lastPinch)>5){setProgress(targetProgress+(span>lastPinch?.017:-.017));onProgress(targetProgress);}
      lastPinch=span;
    }else{
      targetBearing+=clamp(e.clientX-prev.x,-35,35)*.008;
      targetTilt=clamp(targetTilt+(e.clientY-prev.y)*.014,-2,2);
      schedule();
    }
  }
  function up(e){pointers.delete(e.pointerId);lastPinch=0;}
  canvas.addEventListener('wheel',onWheel,{passive:false});
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
  canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  function resize(){
    const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;
    camera.fov=w<h?60:48;camera.updateProjectionMatrix();draw();
  }
  const ro=new ResizeObserver(resize);ro.observe(container);
  const visibility=()=>{if(document.hidden){playing=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;}};
  document.addEventListener('visibilitychange',visibility);
  const motionPreference=()=>{if(reduced.matches){playing=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;progress=targetProgress;draw();}};
  reduced.addEventListener?.('change',motionPreference);
  const loader=new THREE.TextureLoader();
  // Local compact NASA Blue Marble composite; appearance is not live weather.
  loader.load(new URL('../images/planet-earth-nasa.webp',import.meta.url).href,
    texture=>{if(disposed){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;earthMaterial.map=texture;earthMaterial.color.set(0xffffff);earthMaterial.needsUpdate=true;draw();},
    undefined,error=>console.warn('Earth texture unavailable; keeping shaded sphere fallback',error));
  // NASA SVS CGI Moon Kit (LROC global color mosaic, supplemented at poles).
  // Loaded only after user activation; the procedural lunar map remains if it
  // fails, and the NASA texture is never treated as live Moon imagery.
  loader.load(new URL('../images/moon-lroc-nasa.webp',import.meta.url).href,
    texture=>{
      if(disposed){texture.dispose();return;}
      texture.colorSpace=THREE.SRGBColorSpace;
      moonMaterial.map?.dispose();
      moonMaterial.map=texture;
      moonMaterial.color.set(0xffffff);
      moonMaterial.needsUpdate=true;
      draw();
    },undefined,error=>console.warn('NASA LROC Moon texture unavailable; using procedural fallback',error));
  resize();
  return {
    setProgress,setSeparationKm,setPlaying,resize,
    isPlaying:()=>playing,
    reset(){setPlaying(false);setProgress(0);targetBearing=targetTilt=0;targetZoom=1;schedule();},
    dispose(){disposed=true;visibility();ro.disconnect();document.removeEventListener('visibilitychange',visibility);
      reduced.removeEventListener?.('change',motionPreference);
      canvas.removeEventListener('wheel',onWheel);canvas.removeEventListener('pointerdown',down);
      canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);
      canvas.removeEventListener('pointercancel',up);earthGeometry.dispose();moonGeometry.dispose();
      earthMaterial.map?.dispose();moonMaterial.map?.dispose();earthMaterial.dispose();moonMaterial.dispose();
      fieldGeometry.dispose();fieldMaterial.dispose();renderer.dispose();}
  };
}
