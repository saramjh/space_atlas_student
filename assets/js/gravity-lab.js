import {PERSON_MASS_KG,EYE_HEIGHT_M,TAKEOFF_MPS,worldById,predictJump,weightNewtons,grounded,startJump,advanceJump} from './gravity-lab-physics.js';
const $=id=>document.getElementById(id);
const container=$('gravityLabView'),canvas=$('gravityLabCanvas'),poster=$('gravityLabPoster'),hud=$('gravityLabHud');
const choice=$('gravityLabWorld'),status=$('gravityLabStatus'),note=$('gravityLabWorldNote'),joystick=$('gravityLabJoystick'),stick=$('gravityLabStick'),look=$('gravityLabLook');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),fmt=n=>n.toFixed(2);
let model=worldById(choice.value),engine=null,active=false,loading=false,paused=false,air=grounded(),jumpCount=0;
const VISUAL_PROVENANCE={
 earth:['NASA Apollo 17 Earth photograph','https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/a17_h_148_22727.html'],
 moon:['NASA Apollo 17 lunar photograph','https://science.nasa.gov/asset/hubble/apollo-17-astronauts-snapshot-of-taurus-littrow-valley/'],
 mars:['NASA/JPL-Caltech Perseverance','https://science.nasa.gov/resource/the-end-of-one-drive-by-perseverance-on-the-floor-of-jezero-crater/'],
 mercury:['NASA/JHUAPL/CIW MESSENGER enhanced-color image','https://science.nasa.gov/photojournal/colors-of-the-innermost-planet-view-1/'],
 venus:['NASA/JPL-Caltech Magellan radar false-color composite','https://science.nasa.gov/photojournal/hemispheric-view-of-venus-centered-at-90-degrees-east-longitude/'],
 jupiter:['NASA/JPL-Caltech Juno','https://www.jpl.nasa.gov/topics/solar-system/'],
 saturn:['NASA/JPL-Caltech/SSI Cassini mosaic','https://science.nasa.gov/photojournal/a-farewell-to-saturn/'],
 uranus:['NASA/JPL Voyager 2','https://science.nasa.gov/asset/webb/uranus-voyager-2/'],
 neptune:['NASA Voyager 2','https://science.nasa.gov/asset/webb/neptune-voyager-2/']
};
function readout(){
 const p=predictJump(model.g);
 $('gravityLabG').textContent=model.g.toFixed(1)+' m/s²';
 $('gravityLabWeight').textContent=Math.round(weightNewtons(model.g))+' N on a '+PERSON_MASS_KG+' kg mass';
 $('gravityLabHeight').textContent=fmt(p.height)+' m';
 $('gravityLabHang').textContent=fmt(p.hang)+' s';
 $('gravityLabWorldHud').textContent=model.name.toUpperCase()+' GRAVITY';
 note.textContent=model.note+' The deck, course dimensions and motion graphics are an artificial classroom model.';
 if(!active)poster.style.backgroundImage='url('+new URL(model.id==='moon'?'../images/gravity-moon-apollo.webp':'../images/gravity-mars-jezero.webp',import.meta.url).href+')';
 const source=VISUAL_PROVENANCE[model.id];
 $('gravityLabImageSource').textContent=source[0];
 $('gravityLabImageSource').href=source[1];
 air=grounded();jumpCount=0;showLive();$('gravityLabLast').textContent='Ready to test';
 engine?.setWorld(model);
 status.textContent='Gravity: '+model.name+'. Same 70 kg mass and 3.0 m/s launch. '+(active?'Jump to test.':'Enter the lab to begin.');
}
function showLive(){$('gravityLabLiveHeight').textContent=fmt(air.height)+' m';}
function landing(){
 jumpCount++;
 $('gravityLabLast').textContent=fmt(air.peak)+' m · '+fmt(air.elapsed)+' s';
 status.textContent=model.name+' jump '+jumpCount+': '+fmt(air.peak)+' m high, '+fmt(air.elapsed)+' s in the air.';
}
function doJump(){
 if(!active||paused||air.airborne)return;
 air=startJump();status.textContent='Jumping in '+model.name+' gravity…';engine?.wake();
}
function reset(){
 air=grounded();jumpCount=0;engine?.resetPosition();showLive();
 $('gravityLabLast').textContent='Ready to test';status.textContent='Position and jump reset.';
}
function setPause(v){
 paused=!!v;$('gravityLabPause').textContent=paused?'Resume':'Pause';
 $('gravityLabPause').setAttribute('aria-pressed',String(paused));
 if(paused)engine?.pause();else engine?.wake();
 status.textContent=paused?'Simulation paused.':'Simulation resumed.';
}
choice.addEventListener('change',()=>{model=worldById(choice.value);readout();});
$('gravityLabJump').addEventListener('click',doJump);
$('gravityLabPause').addEventListener('click',()=>setPause(!paused));
$('gravityLabReset').addEventListener('click',reset);
$('gravityLabStart').addEventListener('click',async()=>{
 if(loading||active)return;loading=true;$('gravityLabStart').disabled=true;
 status.textContent='Loading the first-person laboratory…';
 try{
  engine=await buildChamber();
  active=true;poster.hidden=true;hud.hidden=false;engine.setWorld(model);
  engine.wake();canvas.focus({preventScroll:true});
  status.textContent='Walking inside the '+model.name+' gravity chamber. Jump to compare the fall.';
 }catch(error){
  console.warn('WebGL lab unavailable',error);
  status.textContent='3D is unavailable on this device. Static jump results and NASA sources remain below.';
  $('gravityLabStart').disabled=false;
 }finally{loading=false;}
});
readout();
async function buildChamber(){
 const THREE=await import('three');
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x050b16);scene.fog=new THREE.FogExp2(0x0a1221,.012);
 const camera=new THREE.PerspectiveCamera(66,1,.08,125);
 const lowPower=coarse.matches||matchMedia('(max-width:740px)').matches;
 const renderer=new THREE.WebGLRenderer({canvas,antialias:!lowPower,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,lowPower?1.15:1.65));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.27;
 scene.add(new THREE.HemisphereLight(0xc4dcf5,0x253747,1.9));
 const sun=new THREE.DirectionalLight(0xfff1dc,2.1);sun.position.set(-14,23,-9);scene.add(sun);
 const geometries=[],materials=[],textures=new Map(),loader=new THREE.TextureLoader();
 const geo=g=>{geometries.push(g);return g;};
 const mat=(color,metal=.35,rough=.62)=>{const m=new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough});materials.push(m);return m;};
 const dark=mat(0x223b49,.59,.49),stripe=mat(0x6a9eae,.46,.44),gold=mat(0xd5a067,.21,.55);
 const floor=new THREE.Mesh(geo(new THREE.PlaneGeometry(65,65)),dark);
 floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
 const stripV=geo(new THREE.BoxGeometry(.03,.01,52)),stripH=geo(new THREE.BoxGeometry(52,.01,.03));
 for(let i=-25;i<=25;i++){
  if(i%5===0){
   const v=new THREE.Mesh(stripV,stripe);v.position.set(i,0,-1);scene.add(v);
   const h=new THREE.Mesh(stripH,stripe);h.position.set(0,0,i-1);scene.add(h);
  }
 }
 // Physical height guide, in real scene metres.
 const pole=new THREE.Mesh(geo(new THREE.CylinderGeometry(.04,.04,5,8)),stripe);
 pole.position.set(-5,2.5,-10);scene.add(pole);
 const tickGeo=geo(new THREE.BoxGeometry(.38,.035,.05));
 for(let height=.5;height<=4.5;height+=.5){
  const tick=new THREE.Mesh(tickGeo,height%1===0?gold:stripe);tick.position.set(-4.8,height,-10);scene.add(tick);
 }
 const ring=new THREE.Mesh(geo(new THREE.RingGeometry(1.35,1.45,64)),
  new THREE.MeshBasicMaterial({color:0xe1ad77,side:THREE.DoubleSide,transparent:true,opacity:.9}));
 materials.push(ring.material);ring.rotation.x=-Math.PI/2;ring.position.set(0,.028,4);scene.add(ring);
 const railGeo=geo(new THREE.BoxGeometry(.18,1.7,.18));
 for(const x of [-8,8])for(const z of [-17,11]){
  const rail=new THREE.Mesh(railGeo,stripe);rail.position.set(x,.85,z);scene.add(rail);
 }
 // Panorama is a reference image displayed on a distant observation wall.
 const photoMat=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});
 materials.push(photoMat);
 const wall=new THREE.Mesh(geo(new THREE.PlaneGeometry(105,40)),photoMat);wall.position.set(0,10,-57);scene.add(wall);
 const veilMat=new THREE.MeshBasicMaterial({color:0x0b1727,transparent:true,opacity:.19,depthWrite:false});
 materials.push(veilMat);
 const veil=new THREE.Mesh(geo(new THREE.PlaneGeometry(105,40)),veilMat);veil.position.set(0,10,-56.9);scene.add(veil);
 const refs={
  earth:'../images/cosmic-blue-marble.webp',moon:'../images/gravity-moon-apollo.webp',mars:'../images/gravity-mars-jezero.webp',
  mercury:'../images/gravity-reference-mercury.webp',venus:'../images/gravity-reference-venus.webp',
  jupiter:'../images/gravity-reference-jupiter.webp',saturn:'../images/gravity-reference-saturn.webp',
  uranus:'../images/gravity-reference-uranus.webp',neptune:'../images/cosmic-neptune-voyager.webp'
 };
 let dead=false,raf=null,last=0,position=new THREE.Vector3(0,0,4),yaw=0,pitch=0,pointer=null,stickPointer=null,lookPointer=null;
 const keys=new Set(),touch={x:0,z:0};
 function render(){camera.position.set(position.x,EYE_HEIGHT_M+air.height,position.z);camera.rotation.set(pitch,yaw,0,'YXZ');renderer.render(scene,camera);}
 function resize(){const r=container.getBoundingClientRect();if(r.width<2||r.height<2)return;
  renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.fov=r.width<r.height?76:66;camera.updateProjectionMatrix();render();}
 const observer=new ResizeObserver(resize);observer.observe(container);
 function resetPosition(){position.set(0,0,4);yaw=0;pitch=0;air=grounded();showLive();render();}
 function setStick(x,z){stick.style.transform='translate('+x*37+'px,'+-z*37+'px)';}
 function applyBackdrop(tex){
  // Respect photo aspect ratio. No horizontally stretched planet disks.
  const iw=tex.image?.naturalWidth||tex.image?.width||1,ih=tex.image?.naturalHeight||tex.image?.height||1;
  const ratio=iw/ih;
  wall.scale.x=Math.min(2,ratio*40/105);
  wall.position.y=ratio<1.45?21:10;
  veil.scale.x=wall.scale.x;veil.position.y=wall.position.y;
  photoMat.map=tex;photoMat.needsUpdate=true;
 }
 function setWorld(w){
  keys.clear();touch.x=0;touch.z=0;setStick(0,0);resetPosition();
  const src=refs[w.id];if(textures.has(src)){applyBackdrop(textures.get(src));render();return;}
  loader.load(new URL(src,import.meta.url).href,tex=>{
   if(dead){tex.dispose();return;}
   tex.colorSpace=THREE.SRGBColorSpace;textures.set(src,tex);
   if(refs[model.id]===src){applyBackdrop(tex);render();}
  },undefined,()=>console.warn('NASA visual reference unavailable for '+w.name));
 }
 function lookDelta(dx,dy){yaw-=dx*(lowPower?.006:.004);pitch=clamp(pitch-dy*(lowPower?.006:.004),-1.05,1.05);wake();}
 function frame(now){
  raf=null;if(dead||paused||document.hidden||!active)return;
  const dt=last?clamp((now-last)/1000,0,.05):0;last=now;
  if(air.airborne){
   let left=dt;
   while(left>0){
    const chunk=Math.min(left,1/120),old=air;air=advanceJump(air,chunk,model.g);
    if(old.airborne&&!air.airborne){landing();break;}left-=chunk;
   }showLive();
  }
  const x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touch.x;
  const z=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+touch.z;
  const len=Math.hypot(x,z);
  if(len>.01){
   const nx=x/Math.max(len,1),nz=z/Math.max(len,1),distance=3.6*dt;
   position.x=clamp(position.x+(nx*Math.cos(yaw)-nz*Math.sin(yaw))*distance,-24,24);
   position.z=clamp(position.z+(-nx*Math.sin(yaw)-nz*Math.cos(yaw))*distance,-23,23);
  }
  render();
  if(air.airborne||len>.01||pointer!==null||stickPointer!==null)wake();
 }
 function wake(){if(!dead&&!paused&&!document.hidden&&raf===null){if(last===0)last=performance.now();raf=requestAnimationFrame(frame);}}
 function pause(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;keys.clear();touch.x=0;touch.z=0;setStick(0,0);}
 function keydown(e){
  if(!active||paused||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName))return;
  if(e.code==='Space'){e.preventDefault();if(!e.repeat)doJump();return;}
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
   e.preventDefault();keys.add(e.code);wake();
  }
 }
 const keyup=e=>keys.delete(e.code);
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);
 canvas.addEventListener('pointerdown',e=>{if(coarse.matches)return;canvas.setPointerCapture(e.pointerId);pointer={id:e.pointerId,x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;lookDelta(e.clientX-pointer.x,e.clientY-pointer.y);pointer.x=e.clientX;pointer.y=e.clientY;});
 const release=e=>{if(pointer?.id===e.pointerId)pointer=null;};
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
 function pad(e){
  if(stickPointer!==e.pointerId)return;
  const r=joystick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.32),y=(e.clientY-r.top-r.height/2)/(r.height*.32);
  const n=Math.max(1,Math.hypot(x,y));touch.x=clamp(x/n,-1,1);touch.z=clamp(-y/n,-1,1);setStick(touch.x,touch.z);wake();
 }
 joystick.addEventListener('pointerdown',e=>{e.preventDefault();joystick.setPointerCapture(e.pointerId);stickPointer=e.pointerId;pad(e);});
 joystick.addEventListener('pointermove',pad);
 const padEnd=e=>{if(stickPointer===e.pointerId){stickPointer=null;touch.x=0;touch.z=0;setStick(0,0);}};
 joystick.addEventListener('pointerup',padEnd);joystick.addEventListener('pointercancel',padEnd);
 look.addEventListener('pointerdown',e=>{look.setPointerCapture(e.pointerId);lookPointer={id:e.pointerId,x:e.clientX,y:e.clientY};});
 look.addEventListener('pointermove',e=>{if(!lookPointer||e.pointerId!==lookPointer.id)return;lookDelta(e.clientX-lookPointer.x,e.clientY-lookPointer.y);lookPointer.x=e.clientX;lookPointer.y=e.clientY;});
 const lookEnd=e=>{if(lookPointer?.id===e.pointerId)lookPointer=null;};
 look.addEventListener('pointerup',lookEnd);look.addEventListener('pointercancel',lookEnd);
 const visibility=()=>{if(document.hidden)setPause(true);};
 document.addEventListener('visibilitychange',visibility);
 resize();resetPosition();
 return {setWorld,resetPosition,wake,pause,dispose(){
  dead=true;pause();observer.disconnect();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);
  document.removeEventListener('visibilitychange',visibility);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  textures.forEach(t=>t.dispose());renderer.dispose();
 }};
}
