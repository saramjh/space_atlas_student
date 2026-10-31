/**
 * Short-phone action/result proximity. Move the actual existing controls,
 * retaining event listeners, IDs, labels and native state; never clone inputs.
 * The action dock shares a viewport with the affected scene. On desktop,
 * placeholders restore the exact initial DOM order. No perpetual RAF.
 */
const plans={
 '/black-holes/':{scene:'#bhSceneShell',actions:['bhAnimate','bhGuide','bhGlide','bhZoomIn','bhZoomOut','bhFlowSpeed']},
 '/earth/seasons/':{scene:'#seasonShell',actions:['seasonAngle','tiltReal','tiltZero']},
 '/exoplanets/transit-method/':{scene:'#transitOrbitShell',actions:['transitPlay','transitFocus','transitTrack','transitAngle','transitRadius']},
 '/galaxies/milky-way/':{scene:'#mwSpatialFrame',actions:['mw3DFocusSun','mw3DHomecoming','mw3DOverview','mw3DZoomIn','mw3DZoomOut','mw3DRotateLeft','mw3DRotateRight']},
 '/galaxies/types/':{scene:'#galaxy3DShell',actions:['galaxy3DPlay','galaxyOrbitMotion','galaxyZoomIn','galaxyZoomOut','galaxyCameraReset','galaxyInclination']},
 '/learn/not-to-scale/':{scene:'#trueScaleStage',actions:['trueScalePlay','trueScaleReverse','trueScaleZoom']},
 '/moon/earth-moon-scale/':{scene:'#emFlightFrame',actions:['emFlightPlay','emFlightMoon','emFlightEarth','emFlightSlider']},
 '/moon/eclipses/':{scene:'#eclipseShell',actions:['eclipsePlay','btnSolarPos','btnLunarPos','eclipseAngle','eclipseNode']},
 '/moon/phases/':{scene:'#moonSceneShell',actions:['moonAngle']},
 '/moon/tidal-locking/':{scene:'#lockShell',actions:['lockAngle']},
 '/moon/tides/':{scene:'#tideCinemaStage',actions:['tideCinemaPlay','tideCinemaReset','tideCinemaZoomIn','tideCinemaZoomOut','tideCinemaObserver','tideCinemaAngle']},
 '/solar-system/astronomical-unit/':{scene:'#auExpeditionCanvas',actions:['auExpeditionPlay','auExpeditionReset','auExpeditionStop','auExpeditionProgress']},
 '/solar-system/gravity-and-orbits/':{scene:'#orbitShell',actions:['orbitLaunch','orbitReset','orbitSpeed']},
 '/solar-system/gravity-comparison/':{scene:'#gravity3DStage',actions:['gravityProbePlay','gravityProbeReset','gravity3DZoomIn','gravity3DZoomOut','gravity3DRotate','gravityMass','gravityRadius']},
 '/solar-system/orbital-periods/':{scene:'#keplerOrbitStage',actions:['keplerOrbitPlay','keplerOrbitReset','keplerOrbitZoomIn','keplerOrbitZoomOut','keplerOrbitFollow','keplerOrbitTime']},
 '/solar-system/pluto-dwarf-planet/':{scene:'#plutoResonanceSVG',actions:['plutoResonancePlay','plutoResonanceReset','plutoResonanceTime']},
 '/solar-system/temperature-comparison/':{scene:'#tempChart',actions:['tempCompareA','tempCompareB']},
 '/stars/life-cycle/':{scene:'#stellarCinema',actions:['lifePlay','lifeNext','lifePrevious','lifeSwitchMass']},
 '/universe/light-year/':{scene:'#lyCinemaStage',actions:['lyPlay','lyCinemaFollow','lyPhotonSlider']},
 '/universe/scale/':{scene:'#zoomCinemaFrame',actions:['zoomCinemaTour','zoomNext','zoomPrev']}
};
// Resolve nested Space Atlas paths by suffix, avoiding a hardcoded Pages base.
const plan=Object.entries(plans).find(([key])=>location.pathname.endsWith(key))?.[1];
if(plan){
 const breakpoint=matchMedia('(max-width: 620px)');
 const scene=document.querySelector(plan.scene);
 const dock=document.createElement('div');
 dock.className='atlas-feedback-dock';dock.setAttribute('role','group');
 dock.setAttribute('aria-label','Controls beside the interactive visualization');
 const collection=new Map();
 let pending=null,observer=null;
 const original=[];
 const capture=element=>{
  // A label wrapping an input is the accessible control and moves as one.
  return element.closest('label')||element;
 };
 function hidden(e){
  if(!e)return true;
  return !!e.closest('[hidden]')||getComputedStyle(e).display==='none'||
   getComputedStyle(e).visibility==='hidden';
 }
 function planMove(){
  if(!scene||!breakpoint.matches)return;
  if(!dock.isConnected)scene.parentElement?.insertBefore(dock,scene);
  for(const id of plan.actions){
   const e=document.getElementById(id);
   if(!e||collection.has(id)||hidden(e)||e.disabled)continue;
   const item=capture(e);
   if(item===scene||item.contains(scene)||hidden(item))continue;
   // Inputs with an adjacent explicit label keep accessible text once moved.
   // Their existing for/ID association remains valid even in a new DOM slot.
   const placeholder=document.createComment('atlas original position '+id);
   item.parentNode.insertBefore(placeholder,item);
   original.push({id,item,placeholder});
   collection.set(id,item);
   if(item.tagName==='INPUT'&&!item.getAttribute('aria-label')){
    const source=document.querySelector('label[for="'+id+'"]');
    item.setAttribute('aria-label',source?.textContent.trim().slice(0,90)||id);
   }
   dock.append(item);
  }
  dock.hidden=!dock.children.length;
 }
 function restore(){
  for(const {item,placeholder} of original){
   if(placeholder.parentNode)placeholder.parentNode.replaceChild(item,placeholder);
  }
  original.length=0;collection.clear();dock.remove();
 }
 function schedule(){
  if(pending!==null)cancelAnimationFrame(pending);
  pending=requestAnimationFrame(()=>{pending=null;breakpoint.matches?planMove():restore();});
 }
 function revealActivatedScene(){
  if(!breakpoint.matches||!scene||hidden(scene))return;
  const r=scene.getBoundingClientRect();
  const header=document.querySelector('header')?.getBoundingClientRect().bottom||0;
  const visible=Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(header,r.top));
  const required=Math.min(r.height*.65,175);
  if(r.height&&visible<required){
   (dock.isConnected&&!dock.hidden?dock:scene).scrollIntoView({
    block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'
   });
  }
 }
 if(scene){
  schedule();
  breakpoint.addEventListener('change',schedule);
  // An activation can unhide its controls later (dynamic module import).
  document.addEventListener('click',e=>{
   if(!(e.target instanceof Element))return;
   if(e.target.closest('button[id$="Activate"], #ptype3DStart')){
    for(const delay of [150,650,1500,4000]){
     window.setTimeout(()=>{schedule();requestAnimationFrame(revealActivatedScene);},delay);
    }
   }
  },true);
 }
}
