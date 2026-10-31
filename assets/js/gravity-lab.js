import {PERSON_MASS_KG,EYE_HEIGHT_M,TAKEOFF_MPS,WORLDS,worldById,predictJump,weightNewtons,grounded,startJump,advanceJump} from './gravity-lab-physics.js';
import {COURSE,MAX_LEVEL,buildCourse,spawnFlight,launchFlight,advanceFlight,findLanding,landFlight} from './gravity-flight-physics.js';
const $=id=>document.getElementById(id);
const container=$('gravityLabView'),canvas=$('gravityLabCanvas'),poster=$('gravityLabPoster'),hud=$('gravityLabHud');
const status=$('gravityLabStatus'),note=$('gravityLabWorldNote'),joystick=$('gravityLabJoystick'),stick=$('gravityLabStick'),look=$('gravityLabLook');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),fmt=n=>n.toFixed(2);
const rail=$('gravityLabWorldRail');
const worldButtons=new Map();
const prevWorld=$('gravityLabWorldPrev'),nextWorld=$('gravityLabWorldNext');
const referenceGravity=worldById('earth').g;
const gravityBarMaximum=Math.max(...WORLDS.map(w=>w.g));
const thumbnailFor=id=>new URL('../images/gravity-choice-'+id+'.webp',import.meta.url).href;
const thumbnailCredit={
 earth:['NASA Space Place','https://spaceplace.nasa.gov/gallery-solar-system/en/'],
 moon:['NASA/GSFC/ASU · LRO','https://science.nasa.gov/resource/lunar-near-side-2/'],
 mars:['NASA/JPL/USGS · Viking','https://science.nasa.gov/photojournal/global-color-views-of-mars/'],
 mercury:['NASA/Johns Hopkins APL/CIW · MESSENGER','https://spaceplace.nasa.gov/gallery-solar-system/en/'],
 venus:['NASA/JPL · Magellan','https://spaceplace.nasa.gov/gallery-solar-system/en/'],
 jupiter:['NASA/ESA · Hubble','https://spaceplace.nasa.gov/gallery-solar-system/en/'],
 saturn:['NASA/JPL-Caltech/SSI · Cassini','https://science.nasa.gov/photojournal/a-farewell-to-saturn/'],
 uranus:['W. M. Keck Observatory · NASA Space Place','https://spaceplace.nasa.gov/gallery-solar-system/en/'],
 neptune:['NASA/JPL · Voyager 2','https://spaceplace.nasa.gov/gallery-solar-system/en/']
};

const isFirstSelection={value:true};
function buildWorldPicker(){
 const fragment=document.createDocumentFragment();
 for(const w of WORLDS){
  const button=document.createElement('button');
  button.type='button';button.className='gl-world-tile';
  button.dataset.world=w.id;button.setAttribute('aria-pressed','false');
  button.setAttribute('aria-label',w.name+', '+(w.g/referenceGravity).toFixed(2)+' times Earth gravity; expected jump '+predictJump(w.g).height.toFixed(2)+' metres');
  button.setAttribute('aria-controls','gravityLabView');
  const picture=document.createElement('img');
  picture.src=thumbnailFor(w.id);picture.width=110;picture.height=110;
  picture.alt='';picture.loading=w.id==='earth'||w.id==='moon'?'eager':'lazy';picture.decoding='async';
  picture.setAttribute('aria-hidden','true');
  const name=document.createElement('strong');name.textContent=w.name;
  const ratio=document.createElement('span');ratio.textContent=(w.g/referenceGravity).toFixed(2)+'× Earth';
  const measure=document.createElement('span');measure.className='gl-world-tile-bar';
  measure.style.setProperty('--gravity-fill',(w.g/gravityBarMaximum*100).toFixed(2)+'%');
  measure.setAttribute('aria-hidden','true');
  button.append(picture,name,ratio,measure);
  button.addEventListener('click',()=>selectWorld(w.id));
  fragment.append(button);worldButtons.set(w.id,button);
 }
 rail.append(fragment);
}
function scrollToSelection(id,animate=false){
 const button=worldButtons.get(id);if(!button)return;
 const offset=button.offsetLeft-(rail.clientWidth-button.offsetWidth)/2;
 rail.scrollTo({left:Math.max(0,offset),behavior:animate&&!reduced.matches?'smooth':'instant'});
}
function selectWorld(id,focus=false){
 if(!worldButtons.has(id))return;
 if(model.id!==id){
  model=worldById(id);readout();
 }else scrollToSelection(id,true);
 if(focus)worldButtons.get(id).focus({preventScroll:true});
}
function syncWorldPicker(){
 const w=model,index=WORLDS.findIndex(x=>x.id===w.id);
 for(const [id,button] of worldButtons){
  const current=id===w.id;
  button.setAttribute('aria-pressed',String(current));
  button.tabIndex=current?0:-1;
 }
$('gravityLabWorldName').textContent=w.name;
 $('gravityLabWorldKind').textContent=w.kind==='solid'?'SOLID BODY · ARTIFICIAL TEST DECK':'NO WALKABLE SURFACE · VIRTUAL PLATFORM';
 $('gravityLabRatio').textContent=(w.g/referenceGravity).toFixed(2)+'×';
 $('gravityLabWorldPrediction').textContent=fmt(predictJump(w.g).height)+' m · '+fmt(predictJump(w.g).hang)+' s';
 const [credit,creditUrl]=thumbnailCredit[w.id];
 $('gravityLabSelectorCredit').textContent=credit;
 $('gravityLabSelectorCredit').href=creditUrl;

 prevWorld.disabled=index===0;nextWorld.disabled=index===WORLDS.length-1;
 // The cards stay in a horizontal rail, rather than initiating a vertical
 // document scroll that could obscure the stage under a sticky mobile header.
 requestAnimationFrame(()=>scrollToSelection(w.id,!isFirstSelection.value));
 isFirstSelection.value=false;
}
rail.addEventListener('keydown',event=>{
 const current=WORLDS.findIndex(w=>w.id===(event.target.closest('button[data-world]')?.dataset.world||model.id));
 let next=current;
 if(event.key==='ArrowRight')next=Math.min(WORLDS.length-1,current+1);
 else if(event.key==='ArrowLeft')next=Math.max(0,current-1);
 else if(event.key==='Home')next=0;
 else if(event.key==='End')next=WORLDS.length-1;
 else return;
 event.preventDefault();selectWorld(WORLDS[next].id,true);
});
prevWorld.addEventListener('click',()=>selectWorld(WORLDS[Math.max(0,WORLDS.findIndex(w=>w.id===model.id)-1)].id));
nextWorld.addEventListener('click',()=>selectWorld(WORLDS[Math.min(WORLDS.length-1,WORLDS.findIndex(w=>w.id===model.id)+1)].id));
buildWorldPicker();

let model=worldById('earth'),engine=null,active=false,loading=false,air=grounded(),jumpCount=0;
let mode='science',level=1,course=COURSE,flight=spawnFlight(),boostHeld=false;
let trial={checkpoint:0,attempts:1,simulatedSeconds:0,totalBoostSeconds:0,completed:false};
let jumpPointer=null,jumpHoldSince=0,spaceHeld=false,spaceHoldSince=0,rewardTime=0;
const boostStatus=$('gravityLabFlightStatus'),trialResult=$('gravityLabTrialResult'),reward=$('gravityLabReward'),nextLevel=$('gravityLabNextLevel');
function updateFlightUI(){
 const value=Math.round(flight.energy*100);
 $('gravityLabBoostText').textContent=value+'%';
 $('gravityLabBoostFill').style.width=value+'%';
 $('gravityLabBoostMeter').setAttribute('aria-valuenow',String(value));
 $('gravityLabJump').disabled=mode==='flight'&&trial.completed;
 $('gravityLabFlightStage').textContent=trial.completed?'FINISHED':course[Math.min(trial.checkpoint+1,course.length-1)].label;
 $('gravityLabLevel').textContent=String(level).padStart(2,'0');
 $('gravityLabFlightProgress').textContent=trial.checkpoint+' / '+(course.length-1)+' checkpoints';
}
function stopBoost(){boostHeld=false;}
function showReward(platform,finish=false){
 reward.hidden=false;reward.classList.toggle('is-finish',finish);
 reward.classList.remove('is-celebrating');void reward.offsetWidth;
 if(!reduced.matches)reward.classList.add('is-celebrating');
 $('gravityLabRewardOverline').textContent=finish?'STAGE COMPLETED':'CHECKPOINT SECURED';
 $('gravityLabRewardTitle').textContent=finish?'LEVEL '+String(level).padStart(2,'0')+' CLEAR':platform.label;
 $('gravityLabRewardDetail').textContent=finish?
  (level===MAX_LEVEL?'ALL 8 LEVELS CLEARED':'NEXT STAGE · '+(level+3)+' CHECKPOINTS'):
  'LANDING CONFIRMED · ENERGY RECHARGING';
 nextLevel.hidden=!finish||level>=MAX_LEVEL;
 nextLevel.textContent=level===MAX_LEVEL?'All levels cleared':'Next level → '+String(level+1).padStart(2,'0');
 rewardTime=finish?Infinity:performance.now()+1150;
}

function setBoost(value){
 if(mode!=='flight'||!active||document.hidden||trial.completed){stopBoost();return;}
 boostHeld=!!value;
 if(boostHeld)engine?.wake();
}
function resetFlight(){
 stopBoost();flight=spawnFlight(0,course);trial={checkpoint:0,attempts:1,simulatedSeconds:0,totalBoostSeconds:0,completed:false};
 reward.hidden=true;reward.classList.remove('is-celebrating','is-finish');nextLevel.hidden=true;rewardTime=0;
 trialResult.textContent='Reach the finish platform to complete a Flight Trial.';
 updateFlightUI();
}
function setMode(next){
 if(next!=='flight'&&next!=='science')return;
 mode=next;const isGame=mode==='flight';
 container.dataset.mode=mode;
 $('gravityLabModeScience').setAttribute('aria-pressed',String(!isGame));
 $('gravityLabModeFlight').setAttribute('aria-pressed',String(isGame));
 $('gravityLabFlightInfo').hidden=!isGame;
 trialResult.hidden=!isGame;
 boostStatus.hidden=!isGame;
 $('gravityLabMeasureHint').hidden=!isGame;
 $('gravityLabHeightLabel').textContent=isGame?'HEIGHT ABOVE START':'HEIGHT ABOVE DECK';
 $('gravityLabModeExplainer').textContent=isGame?
  'Game mode: tap Jump; keep holding Jump to fly. Reach the finish to unlock a longer stage (3–10 checkpoints). Assisted thrust is not a natural jump.':
  'Science mode: the same 3.0 m/s jump without any extra forces. Compare gravity using the measured arc.';
 $('gravityLabControls').innerHTML=isGame?
  '<strong>Desktop:</strong> WASD / arrows move · drag to look · Space jump; hold Space or Shift to boost. <strong>Mobile:</strong> left pad move · tap Jump; hold the same button to boost in flight.':
  '<strong>Desktop:</strong> WASD / arrows move · drag to look · Space to jump. <strong>Mobile:</strong> left pad moves · swipe to look · Jump button.';
 level=1;course=buildCourse(level);resetFlight();releaseJump();spaceHeld=false;air=grounded();jumpCount=0;
 $('gravityLabLast').textContent=isGame?'Unboosted lab only':'Ready to test';
 engine?.setMode(mode);
 if(active)status.textContent=isGame?'Flight Trials ready: jump toward GATE 01; hold Boost in midair.':'Science experiment: unpowered jump, measured using gravity alone.';
}
$('gravityLabModeScience').addEventListener('click',()=>setMode('science'));
$('gravityLabModeFlight').addEventListener('click',()=>setMode('flight'));

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
 syncWorldPicker();
 note.textContent=model.note+' The deck, course dimensions and motion graphics are an artificial classroom model.';
 if(!active)poster.style.backgroundImage='url('+new URL(model.id==='moon'?'../images/gravity-moon-apollo.webp':'../images/gravity-mars-jezero.webp',import.meta.url).href+')';
 const source=VISUAL_PROVENANCE[model.id];
 $('gravityLabImageSource').textContent=source[0];
 $('gravityLabImageSource').href=source[1];
 level=1;course=buildCourse(level);air=grounded();jumpCount=0;resetFlight();releaseJump();spaceHeld=false;showLive();$('gravityLabLast').textContent=mode==='flight'?'Unboosted lab only':'Ready to test';
 engine?.setWorld(model);
 status.textContent='Gravity: '+model.name+'. Same 70 kg mass and 3.0 m/s launch. '+(active?'Jump to test.':'Enter the lab to begin.');
}
function showLive(){$('gravityLabLiveHeight').textContent=fmt(mode==='flight'?flight.y:air.height)+' m';}
function landing(){
 jumpCount++;
 $('gravityLabLast').textContent=fmt(air.peak)+' m · '+fmt(air.elapsed)+' s';
 status.textContent=model.name+' jump '+jumpCount+': '+fmt(air.peak)+' m high, '+fmt(air.elapsed)+' s in the air.';
}
function doJump(){
 if(!active||document.hidden)return;
 if(mode==='flight'){
  if(trial.completed||!flight.grounded)return;
  flight=launchFlight(flight);
  status.textContent='Flight Trials: airborne. Hold Boost to spend energy and reach the next checkpoint.';
 }else{
  if(air.airborne)return;
  air=startJump();status.textContent='Jumping in '+model.name+' gravity…';
 }
 engine?.wake();
}
function reset(){
 level=1;course=buildCourse(level);air=grounded();jumpCount=0;resetFlight();releaseJump();spaceHeld=false;
 engine?.resetPosition();showLive();
 $('gravityLabLast').textContent=mode==='flight'?'Unboosted lab only':'Ready to test';
 status.textContent=mode==='flight'?'Flight Trials restarted at LAUNCH.':'Position and jump reset.';
}
// One-button touch: pointer-down jumps, a sustained hold (>140 ms) applies
// boost while airborne, and release immediately cuts thrust. Independent
// pointer capture allows the other thumb to continue moving the joystick.
const jumpAction=$('gravityLabJump');
let lastTouchJumpAt=-Infinity;
function releaseJump(id=null){
 if(id===null||jumpPointer===id){jumpPointer=null;stopBoost();}
}
jumpAction.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='touch'&&e.pointerType!=='pen'&&e.pointerType!=='mouse')return;
 e.preventDefault();lastTouchJumpAt=performance.now();
 jumpPointer=e.pointerId;jumpHoldSince=performance.now();
 try{jumpAction.setPointerCapture(e.pointerId);}catch{}
 doJump();engine?.wake();
});
for(const type of ['pointerup','pointercancel','lostpointercapture']){
 jumpAction.addEventListener(type,e=>releaseJump(e.pointerId));
}
jumpAction.addEventListener('click',e=>{
 if(e.detail>0&&performance.now()-lastTouchJumpAt<700)return;
 doJump();
});
function refreshHeldJump(now){
 if(mode!=='flight'||!active||flight.grounded||trial.completed)return;
 if((jumpPointer!==null&&now-jumpHoldSince>=140)||
    (spaceHeld&&now-spaceHoldSince>=140))setBoost(true);
}
nextLevel.addEventListener('click',()=>{
 if(!trial.completed)return;
 if(level>=MAX_LEVEL){
  nextLevel.hidden=true;
  trialResult.textContent='All 8 levels cleared on '+model.name+'. Reset to replay or select another gravity setting.';
  return;
 }
 level++;course=buildCourse(level);resetFlight();
 engine?.setCourse(course);engine?.resetPosition();
 status.textContent='Level '+level+' ready: '+(course.length-1)+' checkpoints. Hold Jump to fly.';
 trialResult.textContent='Level '+level+' — reach '+(course.length-1)+' checkpoints to unlock the next stage.';
 engine?.wake();
});
$('gravityLabReset').addEventListener('click',reset);
$('gravityLabStart').addEventListener('click',async()=>{
 if(loading||active)return;loading=true;$('gravityLabStart').disabled=true;
 status.textContent='Loading the first-person laboratory…';
 try{
  engine=await buildChamber();
  active=true;poster.hidden=true;hud.hidden=false;engine.setWorld(model);
  engine.setMode(mode);engine.wake();canvas.focus({preventScroll:true});
  status.textContent=mode==='flight'?'Flight Trials ready: hold Jump while walking toward the first gate.':
   'Walking inside the '+model.name+' gravity chamber. Jump to compare the fall.';
 }catch(error){
  console.warn('WebGL lab unavailable',error);
  status.textContent='3D is unavailable on this device. Static jump results and NASA sources remain below.';
  $('gravityLabStart').disabled=false;
 }finally{loading=false;}
});
readout();
setMode('science');
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
 const labDecor=new THREE.Group();scene.add(labDecor);
 const courseDecor=new THREE.Group();scene.add(courseDecor);courseDecor.visible=false;
 const floor=new THREE.Mesh(geo(new THREE.PlaneGeometry(65,65)),dark);
 floor.rotation.x=-Math.PI/2;floor.position.y=-.02;labDecor.add(floor);
 const stripV=geo(new THREE.BoxGeometry(.03,.01,52)),stripH=geo(new THREE.BoxGeometry(52,.01,.03));
 for(let i=-25;i<=25;i++){
  if(i%5===0){
   const v=new THREE.Mesh(stripV,stripe);v.position.set(i,0,-1);labDecor.add(v);
   const h=new THREE.Mesh(stripH,stripe);h.position.set(0,0,i-1);labDecor.add(h);
  }
 }
 // Physical height guide, in real scene metres.
 const pole=new THREE.Mesh(geo(new THREE.CylinderGeometry(.04,.04,5,8)),stripe);
 pole.position.set(-5,2.5,-10);labDecor.add(pole);
 const tickGeo=geo(new THREE.BoxGeometry(.38,.035,.05));
 for(let height=.5;height<=4.5;height+=.5){
  const tick=new THREE.Mesh(tickGeo,height%1===0?gold:stripe);tick.position.set(-4.8,height,-10);labDecor.add(tick);
 }
 const ring=new THREE.Mesh(geo(new THREE.RingGeometry(1.35,1.45,64)),
  new THREE.MeshBasicMaterial({color:0xe1ad77,side:THREE.DoubleSide,transparent:true,opacity:.9}));
 materials.push(ring.material);ring.rotation.x=-Math.PI/2;ring.position.set(0,.028,4);labDecor.add(ring);
 const railGeo=geo(new THREE.BoxGeometry(.18,1.7,.18));
 for(const x of [-8,8])for(const z of [-17,11]){
  const rail=new THREE.Mesh(railGeo,stripe);rail.position.set(x,.85,z);labDecor.add(rail);
 }
 // Purpose-built geometric checkpoint deck, not a reconstruction of a real
 // planetary landscape. Very few draw calls and no external game assets.
 const padTop=mat(0x243d4e,.56,.4),padSide=mat(0x0f2639,.59,.47);
 const padMark=mat(0xffc47c,.19,.45),safeMark=mat(0x71c6d6,.35,.44);
 const padGroups=[],activeMarkers=[];
 // Allocate every possible platform once (level progression moves/reuses meshes).
 // Inspired by clean luminous checkpoint gates, not copied game art.
 for(let index=0;index<=MAX_LEVEL+2;index++){
  const group=new THREE.Group(),width=index===0?6:3.6,depth=index===0?7:3.6;
  const deck=new THREE.Mesh(geo(new THREE.BoxGeometry(width,.26,depth)),padTop);
  deck.position.y=-.13;group.add(deck);
  const slab=new THREE.Mesh(geo(new THREE.BoxGeometry(width+.2,.11,depth+.2)),padSide);
  slab.position.y=-.34;group.add(slab);
  const borders=[];
  for(const sign of [-1,1]){
   const xEdge=new THREE.Mesh(geo(new THREE.BoxGeometry(.065,.055,depth)),safeMark);
   xEdge.position.set(sign*(width/2-.09),.04,0);group.add(xEdge);borders.push(xEdge);
   const zEdge=new THREE.Mesh(geo(new THREE.BoxGeometry(width,.055,.065)),safeMark);
   zEdge.position.set(0,.04,sign*(depth/2-.09));group.add(zEdge);borders.push(zEdge);
  }
  const discMaterial=new THREE.MeshBasicMaterial({color:0x83dbeb,side:THREE.DoubleSide,transparent:true,opacity:.92});
  materials.push(discMaterial);
  const target=new THREE.Mesh(geo(new THREE.RingGeometry(.45,.54,48)),discMaterial);
  target.rotation.x=-Math.PI/2;target.position.y=.075;group.add(target);
  const beacon=new THREE.Group();
  if(index>0){
   const stem=new THREE.Mesh(geo(new THREE.CylinderGeometry(.055,.055,1.2,12)),safeMark);
   stem.position.y=.6;beacon.add(stem);
   const halo=new THREE.Mesh(geo(new THREE.TorusGeometry(.42,.025,7,48)),
    new THREE.MeshBasicMaterial({color:0x73d4e8,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));
   materials.push(halo.material);halo.position.y=1.65;beacon.add(halo);
   const second=new THREE.Mesh(geo(new THREE.TorusGeometry(.32,.013,5,40)),halo.material);
   second.position.y=1.65;second.rotation.y=.6;beacon.add(second);
   beacon.position.z=-depth/2+.42;group.add(beacon);
  }
  courseDecor.add(group);padGroups.push(group);activeMarkers.push({borders,discMaterial,beacon});
 }
 function setCourse(next){
  for(let i=0;i<padGroups.length;i++){
   const spec=next[i],group=padGroups[i],marker=activeMarkers[i];
   group.visible=!!spec;
   if(!spec)continue;
   group.position.set(spec.x,spec.top,spec.z);
   const finish=i===next.length-1;
   const color=finish?0xffc174:0x74d2e1;
   marker.discMaterial.color.setHex(color);
   marker.borders.forEach(mesh=>mesh.material=finish?padMark:safeMark);
   marker.beacon.children.forEach(mesh=>{if(mesh.material?.color)mesh.material.color.setHex(color);});
  }
 }
 setCourse(course);
 // Short-lived additive impact rings + 24 spark particles reuse allocated
 // buffers. Flash only on user-earned achievements; no idle VFX loop.
 const burstMat=new THREE.MeshBasicMaterial({color:0x82e8ff,side:THREE.DoubleSide,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
 materials.push(burstMat);
 const burst=new THREE.Mesh(geo(new THREE.RingGeometry(.65,.80,64)),burstMat);
 burst.rotation.x=-Math.PI/2;burst.visible=false;scene.add(burst);
 const sparkCoordinates=new Float32Array(24*3);
 const sparkGeo=geo(new THREE.BufferGeometry());
 sparkGeo.setAttribute('position',new THREE.BufferAttribute(sparkCoordinates,3));
 const sparkMat=new THREE.PointsMaterial({color:0x98e8fa,size:.17,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
 materials.push(sparkMat);
 const sparks=new THREE.Points(sparkGeo,sparkMat);sparks.frustumCulled=false;sparks.visible=false;scene.add(sparks);
 let flash=null;
 function checkpointFlash(spec,finish=false){
  if(reduced.matches)return;
  flash={x:spec.x,y:spec.top+.1,z:spec.z,start:performance.now(),finish};
  burst.position.set(flash.x,flash.y,flash.z);
  burst.scale.setScalar(1);burst.visible=true;sparks.visible=true;
  const hue=finish?0xffc87d:0x80ddf5;burstMat.color.setHex(hue);sparkMat.color.setHex(hue);
 }
 function tickFlash(now){
  if(!flash)return false;
  const t=Math.min(1,(now-flash.start)/(flash.finish?1600:1000));
  burst.scale.setScalar(1+t*(flash.finish?4:2.4));burstMat.opacity=.9*(1-t);
  for(let i=0;i<24;i++){
   const a=i*Math.PI*2/24,r=.5+t*(flash.finish?3.1:1.8);
   sparkCoordinates[i*3]=flash.x+Math.cos(a)*r;
   sparkCoordinates[i*3+1]=flash.y+.12+t*(.9+Math.sin(a*3)*.36);
   sparkCoordinates[i*3+2]=flash.z+Math.sin(a)*r;
  }
  sparkGeo.attributes.position.needsUpdate=true;
  sparkMat.opacity=(1-t)*.85;
  if(t>=1){flash=null;burst.visible=false;sparks.visible=false;return false;}
  return true;
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
 let stageMode='science';
 const keys=new Set(),touch={x:0,z:0};
 function render(){camera.position.set(position.x,EYE_HEIGHT_M+(stageMode==='flight'?flight.y:air.height),position.z);camera.rotation.set(pitch,yaw,0,'YXZ');renderer.render(scene,camera);}
 function resize(){const r=container.getBoundingClientRect();if(r.width<2||r.height<2)return;
  renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.fov=r.width<r.height?76:66;camera.updateProjectionMatrix();render();}
 const observer=new ResizeObserver(resize);observer.observe(container);
 function resetPosition(){
  const p=stageMode==='flight'?course[0]:{x:0,z:4};
  position.set(p.x,0,p.z);yaw=0;pitch=0;air=grounded();showLive();render();
 }
 function setMode(next){
  stageMode=next;labDecor.visible=next==='science';courseDecor.visible=next==='flight';
  setCourse(course);
  resetPosition();render();wake();
 }
 function checkpointReached(platform){
  const index=course.findIndex(p=>p.id===platform.id);
  if(index>trial.checkpoint){
   trial.checkpoint=index;
   if(index===course.length-1){
    trial.completed=true;stopBoost();
    trialResult.textContent='Course complete on '+model.name+'! '+trial.attempts+' attempt'+(trial.attempts===1?'':'s')+
     ' · '+trial.totalBoostSeconds.toFixed(2)+' s total boost · '+trial.simulatedSeconds.toFixed(1)+' s active movement.';
    status.textContent='Flight Trials complete. Reset to replay or change gravity to compare.';
   }else status.textContent=platform.label+' reached. Stand still to recharge, then jump toward '+course[index+1].label+'.';
   checkpointFlash(platform,trial.completed);
   showReward(platform,trial.completed);
   updateFlightUI();
  }
 }
 function respawn(){
  trial.attempts+=1;stopBoost();
  flight=spawnFlight(trial.checkpoint,course);const pad=course[trial.checkpoint];
  position.set(pad.x,0,pad.z);yaw=0;pitch=0;
  status.textContent='Missed the platform. Returned to '+pad.label+' (attempt '+trial.attempts+').';
  updateFlightUI();
 }
 function supported(){
  return course.some(p=>Math.abs(position.x-p.x)<=p.width/2-.12&&
   Math.abs(position.z-p.z)<=p.depth/2-.12&&Math.abs(flight.y-p.top)<.06);
 }
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
  raf=null;if(dead||document.hidden||!active)return;
  if(!reward.hidden&&rewardTime!==Infinity&&rewardTime&&now>=rewardTime){reward.hidden=true;rewardTime=0;}
  refreshHeldJump(now);
  const dt=last?clamp((now-last)/1000,0,.05):0;last=now;
  const x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touch.x;
  const z=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+touch.z;
  const len=Math.hypot(x,z);
  if(len>.01){
   const nx=x/Math.max(len,1),nz=z/Math.max(len,1),distance=3.6*dt;
   position.x=clamp(position.x+(nx*Math.cos(yaw)-nz*Math.sin(yaw))*distance,-24,24);
   position.z=clamp(position.z+(-nx*Math.sin(yaw)-nz*Math.cos(yaw))*distance,-62,23);
  }
  if(stageMode==='flight'){
   if(!trial.completed){
    if(dt>0)trial.simulatedSeconds+=dt;
    // Walking over a gap without a jump is a fall, not a floating avatar.
    if(flight.grounded&&!supported())flight={...flight,grounded:false,vy:0,landed:false};
    const n=Math.max(1,Math.ceil(dt/(1/120))),step=dt/n;
    for(let j=0;j<n;j++){
     const before=flight;
     flight=advanceFlight(flight,step,model.g,boostHeld);
     trial.totalBoostSeconds+=flight.usedSeconds-before.usedSeconds;
     if(!before.grounded){
      const pad=findLanding(before,flight,position.x,position.z,course);
      if(pad){flight=landFlight(flight,pad);stopBoost();checkpointReached(pad);}
     }
     if(flight.y<-4){respawn();break;}
    }
   }
   showLive();updateFlightUI();
  }else if(air.airborne){
   let remaining=dt;
   while(remaining>0){
    const step=Math.min(remaining,1/120),old=air;
    air=advanceJump(air,step,model.g);
    if(old.airborne&&!air.airborne){landing();break;}
    remaining-=step;
   }
   showLive();
  }
  const effectActive=tickFlash(now);
  render();
  if(effectActive||(!reward.hidden&&rewardTime!==Infinity)||(stageMode==='flight'&&!trial.completed&&(boostHeld||!flight.grounded||flight.energy<1))||
     (stageMode==='science'&&air.airborne)||jumpPointer!==null||spaceHeld||len>.01||pointer!==null||stickPointer!==null)wake();
 }
 function wake(){if(!dead&&!document.hidden&&raf===null){if(last===0)last=performance.now();raf=requestAnimationFrame(frame);}}
 // Stop input and RAF, while preserving airborne trajectory and position.
 // Reset the frame-time origin so a hidden tab cannot cause a jump in time.
 function suspend(){
  if(raf!==null)cancelAnimationFrame(raf);
  raf=null;last=0;keys.clear();touch.x=0;touch.z=0;setStick(0,0);
  releaseJump();spaceHeld=false;
  pointer=null;stickPointer=null;lookPointer=null;
 }
 function keydown(e){
  if(!active||document.hidden||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName))return;
  if(e.code==='Space'){e.preventDefault();if(!e.repeat){doJump();spaceHeld=true;spaceHoldSince=performance.now();wake();}return;}
  if(e.code==='ShiftLeft'||e.code==='ShiftRight'){
   e.preventDefault();keys.add(e.code);setBoost(true);wake();return;
  }
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
   e.preventDefault();keys.add(e.code);wake();
  }
 }
 const keyup=e=>{
  keys.delete(e.code);
  if(e.code==='ShiftLeft'||e.code==='ShiftRight')stopBoost();
  if(e.code==='Space'){spaceHeld=false;stopBoost();}
 };
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
 const visibility=()=>{if(document.hidden)suspend();else if(active)wake();};
 const blur=()=>{releaseJump();spaceHeld=false;keys.clear();};
 window.addEventListener('blur',blur);
 document.addEventListener('visibilitychange',visibility);
 resize();resetPosition();
 return {setWorld,setCourse,setMode,resetPosition,wake,suspend,dispose(){
  dead=true;suspend();observer.disconnect();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);
  document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  textures.forEach(t=>t.dispose());renderer.dispose();
 }};
}
