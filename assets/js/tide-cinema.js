import {currentRenderTier} from './render-device-tier.js';
// Earth is rigid; a separate transparent displaced water-equilibrium shell
// represents the two sides of a lunar+solar tide-raising quadrupole. An Earth
// surface marker moves through both while the ideal force pattern stays fixed.
import {tideOceanRadius,tideObserverContrast} from './tide-cinema-math.js';
export async function createTideCinema(canvas,shell,onUpdate=()=>{}){
 const THREE=await import('three');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const tier=currentRenderTier();
 const coarse=tier.constrained;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x070f21);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:tier.antialias,powerPreference:'low-power'});
 renderer.setPixelRatio(tier.pixelRatio);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 scene.add(new THREE.AmbientLight(0x9dbfe3,1.25));
 const light=new THREE.DirectionalLight(0xffe2b2,2.3);light.position.set(-6,4,9);scene.add(light);
 const rim=new THREE.DirectionalLight(0x82d7fb,1.35);rim.position.set(4,-3,-3);scene.add(rim);
 const camera=new THREE.PerspectiveCamera(48,1,.08,110);
 const earthGeo=new THREE.SphereGeometry(.985,56,38);
 const earthMat=new THREE.MeshStandardMaterial({color:0x467aaf,roughness:1});
 const earth=new THREE.Mesh(earthGeo,earthMat);scene.add(earth);
 const waterGeo=new THREE.SphereGeometry(1,96,64);
 const orig=waterGeo.attributes.position.array.slice();
 const waterMat=new THREE.MeshPhysicalMaterial({color:0x359bcb,metalness:.07,roughness:.21,transparent:true,opacity:.58,side:THREE.DoubleSide,depthWrite:false});
 const water=new THREE.Mesh(waterGeo,waterMat);water.renderOrder=2;scene.add(water);
 const moonGeo=new THREE.SphereGeometry(.24,32,20);
 const moonMat=new THREE.MeshStandardMaterial({color:0xd7cfbc,roughness:.9});
 const moon=new THREE.Mesh(moonGeo,moonMat);scene.add(moon);
 const sunGeo=new THREE.SphereGeometry(.32,24,16);
 const sunMat=new THREE.MeshBasicMaterial({color:0xffd586});
 const sun=new THREE.Mesh(sunGeo,sunMat);sun.position.set(-4.9,0,0);scene.add(sun);
 const markerGeo=new THREE.SphereGeometry(.065,16,12);
 const markerMat=new THREE.MeshBasicMaterial({color:0xffefaf,depthTest:false});
 const marker=new THREE.Mesh(markerGeo,markerMat);marker.renderOrder=15;scene.add(marker);
 let angle=0,targetAngle=0,observer=0,playing=false,elapsed=0;
 let orbit=0,targetOrbit=0,zoom=1,targetZoom=1;
 let raf=null,last=0,disposed=false,statusTick=0;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const pointers=new Map();let lastPinch=0;
 function updateGeometry(){
  const verts=waterGeo.attributes.position;
  for(let i=0;i<verts.count;i++){
    const x=orig[i*3],y=orig[i*3+1],z=orig[i*3+2];
    const r=tideOceanRadius(x,y,z,angle);
    verts.setXYZ(i,x*r,y*r,z*r);
  }
  verts.needsUpdate=true;waterGeo.computeVertexNormals();
  moon.position.set(4.1*Math.cos(angle*Math.PI/180),4.1*Math.sin(angle*Math.PI/180),0);
  const a=observer*Math.PI/180;
  marker.position.set(1.01*Math.cos(a),1.01*Math.sin(a),.33);
 }
 function report(){
  const value=tideObserverContrast(observer,Math.round(angle));
  const label=value.relative>.75?'near a modeled high-tide axis':value.relative<.25?'near a modeled low-tide direction':'between modeled high/low directions';
  onUpdate(`Observer marker ${Math.round(observer)}° around Earth, ${label}. Relative schematic shell height ${(value.relative*100).toFixed(0)}% between this model’s minimum and maximum. Not a local tide forecast.`);
 }
 function draw(){
  if(disposed||canvas.hidden||shell.hidden)return;
  const w=Math.max(1,shell.clientWidth),h=Math.max(1,shell.clientHeight),aspect=w/h;
  const dist=(aspect<1?9.6:7.1)*zoom;
  camera.position.set(Math.sin(orbit)*dist*.32,Math.sin(.07)*dist,Math.cos(orbit)*dist);
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
 }
 function schedule(){if(raf===null&&!disposed&&!document.hidden)raf=requestAnimationFrame(frame);}
 function frame(now){
  raf=null;const dt=last?Math.min(.05,Math.max(0,(now-last)/1000)):0;last=now;
  const ease=reduced.matches?1:1-Math.exp(-12*dt);
  angle+=(targetAngle-angle)*ease;
  orbit+=(targetOrbit-orbit)*ease;zoom+=(targetZoom-zoom)*ease;
  if(playing){
   elapsed+=dt;observer=Math.min(360,elapsed/12*360);
   if(elapsed>=12){playing=false;observer=360;}
  }
  updateGeometry();draw();
  statusTick+=dt;if(statusTick>.35||!playing){statusTick=0;report();}
  if(playing||Math.abs(angle-targetAngle)>.03||Math.abs(orbit-targetOrbit)>.001||Math.abs(zoom-targetZoom)>.001)schedule();
 }
 function setAngle(v){targetAngle=clamp(Number(v)||0,0,90);if(reduced.matches){angle=targetAngle;updateGeometry();report();draw();}else schedule();}
 function setObserver(v){observer=clamp(Number(v)||0,0,360);elapsed=observer/30;updateGeometry();report();draw();}
 function start(){if(reduced.matches||document.hidden)return false;if(observer>=359){observer=0;elapsed=0;}else elapsed=observer/30;playing=true;last=0;schedule();return true;}
 function stop(){playing=false;report();}
 function resize(){const w=Math.max(1,shell.clientWidth),h=Math.max(1,shell.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?54:48;camera.updateProjectionMatrix();draw();}
 function down(e){if(canvas.hidden)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0;}
 function move(e){const old=pointers.get(e.pointerId);if(!old)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const [a,b]=[...pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);if(lastPinch>4)targetZoom=clamp(targetZoom*lastPinch/Math.max(4,dist),.63,1.62);lastPinch=dist;schedule();}
  else{targetOrbit+=(e.clientX-old.x)*.006;schedule();}
 }
 function up(e){pointers.delete(e.pointerId);lastPinch=0;}
 function wheel(e){if(canvas.hidden)return;e.preventDefault();targetZoom=clamp(targetZoom*Math.exp(clamp(e.deltaY,-80,80)*.004),.63,1.62);schedule();}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});
 const ro=new ResizeObserver(resize);ro.observe(shell);
 const visibility=()=>{if(document.hidden){playing=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;}};
 document.addEventListener('visibilitychange',visibility);
 const motionChange=()=>{if(reduced.matches){stop();if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;angle=targetAngle;updateGeometry();report();draw();}};
 reduced.addEventListener?.('change',motionChange);
 const textureLoader=new THREE.TextureLoader();
 textureLoader.load(new URL('../images/planet-earth-nasa.webp',import.meta.url).href,tex=>{
  if(disposed){tex.dispose();return;}
  tex.colorSpace=THREE.SRGBColorSpace;earthMat.map=tex;earthMat.color.set(0xffffff);earthMat.needsUpdate=true;draw();
 },undefined,error=>console.warn('Tide Earth reference texture unavailable; keeping sphere fallback',error));
 updateGeometry();resize();report();
 return {setAngle,setObserver,start,stop,isPlaying:()=>playing,resize,
  zoomBy:v=>{targetZoom=clamp(targetZoom*v,.63,1.62);schedule();},
  rotateBy:v=>{targetOrbit+=v;schedule();},
  reset(){stop();setAngle(0);setObserver(0);targetZoom=1;targetOrbit=0;schedule();},
  dispose(){disposed=true;visibility();ro.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener?.('change',motionChange);
    canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);
    earthMat.map?.dispose();for(const g of [earthGeo,waterGeo,moonGeo,sunGeo,markerGeo])g.dispose();for(const m of [earthMat,waterMat,moonMat,sunMat,markerMat])m.dispose();renderer.dispose();}
 };
}
