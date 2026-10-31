/**
 * Short-phone action/result proximity. Move the actual existing controls,
 * retaining event listeners, IDs, labels and native state; never clone inputs.
 * The action dock shares a viewport with the affected scene. On desktop,
 * placeholders restore the exact initial DOM order. No perpetual RAF.
 */
const plans={
 '/black-holes/':{scene:'#bhSceneShell',primary:['bhAnimate','bhFlowSpeed'],secondary:['bhGuide','bhGlide','bhZoomIn','bhZoomOut']},
 '/earth/seasons/':{scene:'#seasonShell',primary:['seasonAngle','tiltReal','tiltZero'],secondary:[]},
 '/exoplanets/transit-method/':{scene:'#transitOrbitShell',primary:['transitPlay','transitAngle','transitRadius'],secondary:['transitFocus','transitTrack']},
 '/galaxies/milky-way/':{scene:'#mwSpatialFrame',primary:['mw3DFocusSun','mw3DOverview'],secondary:['mw3DHomecoming','mw3DZoomIn','mw3DZoomOut','mw3DRotateLeft','mw3DRotateRight']},
 '/galaxies/types/':{scene:'#galaxy3DShell',primary:['galaxy3DPlay','galaxyInclination','galaxyOrbitMotion'],secondary:['galaxyZoomIn','galaxyZoomOut','galaxyCameraReset']},
 '/learn/not-to-scale/':{scene:'#trueScaleStage',primary:['trueScalePlay','trueScaleZoom'],secondary:['trueScaleReverse']},
 '/moon/earth-moon-scale/':{scene:'#emFlightFrame',primary:['emFlightPlay','emFlightSlider'],secondary:['emFlightMoon','emFlightEarth']},
 '/moon/eclipses/':{scene:'#eclipseShell',primary:['eclipsePlay','eclipseAngle','eclipseNode'],secondary:['btnSolarPos','btnLunarPos']},
 '/moon/phases/':{scene:'#moonSceneShell',primary:['moonAngle'],secondary:[]},
 '/moon/tidal-locking/':{scene:'#lockShell',primary:['lockAngle'],secondary:[]},
 '/moon/tides/':{scene:'#tideCinemaStage',primary:['tideCinemaPlay','tideCinemaAngle'],secondary:['tideCinemaReset','tideCinemaZoomIn','tideCinemaZoomOut','tideCinemaObserver']},
 '/solar-system/astronomical-unit/':{scene:'#auExpeditionCanvas',primary:['auExpeditionPlay','auExpeditionProgress'],secondary:['auExpeditionReset','auExpeditionStop']},
 '/solar-system/gravity-and-orbits/':{scene:'#orbitShell',primary:['orbitLaunch','orbitSpeed'],secondary:['orbitReset']},
 '/solar-system/gravity-comparison/':{scene:'#gravity3DStage',primary:['gravityProbePlay','gravityMass','gravityRadius'],secondary:['gravityProbeReset','gravity3DZoomIn','gravity3DZoomOut','gravity3DRotate']},
 '/solar-system/orbital-periods/':{scene:'#keplerOrbitStage',primary:['keplerOrbitPlay','keplerOrbitTime'],secondary:['keplerOrbitReset','keplerOrbitZoomIn','keplerOrbitZoomOut','keplerOrbitFollow']},
 '/solar-system/pluto-dwarf-planet/':{scene:'#plutoResonanceSVG',primary:['plutoResonancePlay','plutoResonanceTime'],secondary:['plutoResonanceReset']},
 '/solar-system/temperature-comparison/':{scene:'#tempChart',primary:['tempCompareA','tempCompareB'],secondary:[]},
 '/stars/life-cycle/':{scene:'#stellarCinema',primary:['lifePlay','lifeSwitchMass'],secondary:['lifeNext','lifePrevious']},
 '/universe/light-year/':{scene:'#lyCinemaStage',primary:['lyPlay','lyPhotonSlider'],secondary:['lyCinemaFollow']},
 '/universe/scale/':{scene:'#zoomCinemaFrame',primary:['zoomCinemaTour','zoomNext'],secondary:['zoomPrev']},
};
// Desktop routes whose original below-the-scene Play controls made the
// effect invisible in a 1280×800 viewport. Preserve original desktop
// arrangement on the remaining lessons.
const desktopAdjacent=new Set([
 '/black-holes/','/exoplanets/transit-method/','/galaxies/types/',
 '/moon/eclipses/','/solar-system/orbital-periods/','/stars/life-cycle/',
 '/universe/light-year/','/universe/scale/'
]);
const match=Object.entries(plans).find(([path])=>location.pathname.endsWith(path));
if(match){
 const [route,plan]=match,priority=new Set(plan.primary);
 const breakpoint=matchMedia('(max-width:620px)'),scene=document.querySelector(plan.scene);
 const shouldDock=()=>breakpoint.matches||desktopAdjacent.has(route);
 const dock=document.createElement('section');dock.className='atlas-feedback-dock';
 dock.setAttribute('aria-label','Controls for the interactive experiment');
 const main=document.createElement('div');main.className='atlas-feedback-main';
 main.setAttribute('role','group');main.setAttribute('aria-label','Main experiment controls');
 const details=document.createElement('details');details.className='atlas-feedback-details';
 const summary=document.createElement('summary');summary.textContent='Additional controls';
 const extra=document.createElement('div');extra.className='atlas-feedback-extra';
 details.append(summary,extra);dock.append(main,details);
 const moved=[],mounted=new Set(),labelOverrides=new Map(),generatedLabels=[];
 let pending=null;
 function hidden(e){
  return !e||!!e.closest('[hidden]')||getComputedStyle(e).display==='none'||
    getComputedStyle(e).visibility==='hidden';
 }
 function mount(){
  if(!shouldDock()||!scene)return;
  if(!dock.isConnected)scene.parentElement?.insertBefore(dock,scene);
  for(const id of [...plan.primary,...plan.secondary]){
   const e=document.getElementById(id);
   if(!e||mounted.has(id)||hidden(e)||e.disabled||e.contains(scene))continue;
   const field=e.matches('input,select,textarea');
   const label=field?(e.closest('label')||document.querySelector('label[for="'+id+'"]')):null;
   const nodes=label?(label.contains(e)?[label]:[label,e]):[e];
   nodes.sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_PRECEDING?1:-1);
   const item=document.createElement('div');
   item.className='atlas-feedback-item '+(field?'is-field':'is-action');
   item.dataset.controlId=id;
   for(const node of nodes){
    const placeholder=document.createComment('original position '+id);
    node.parentNode.insertBefore(placeholder,node);moved.push({node,placeholder});
    item.append(node);
   }
   // Do not freeze an accessible label that contains a live numeric output.
   if(field){
    if(e.hasAttribute('aria-label')&&label&&
      /[0-9](?:\.[0-9]+)?(?:× Earth|%|°|×)/.test(e.getAttribute('aria-label')||'')){
      labelOverrides.set(e,e.getAttribute('aria-label'));e.removeAttribute('aria-label');
    }
    if(!label){
      const shortNames={
       seasonAngle:'Orbit position',eclipseAngle:'Moon position',
       moonAngle:'Moon phase position',lockAngle:'Moon orbit position'
      };
      const fallback=document.createElement('label');fallback.htmlFor=id;
      const text=shortNames[id]||e.getAttribute('aria-label')||
       id.replace(/([a-z])([A-Z])/g,'$1 $2');
      fallback.append(document.createTextNode(text+' '));
      if(e.matches('input[type=range]')){
       const value=document.createElement('output');
       const isAngle=/angle|phase|orbit position|degrees/i.test(text)&&Number(e.max)===360;
       const render=()=>{value.textContent=e.value+(isAngle?'°':'');};
       e.addEventListener('input',render);render();fallback.append(value);
       generatedLabels.push({field:e,render});
      }
      item.prepend(fallback);
    }
    if((label?.textContent||'').trim().length>48)item.classList.add('is-wide-label');
   }
   mounted.add(id);(priority.has(id)?main:extra).append(item);
  }
  details.hidden=extra.childElementCount===0;
  summary.textContent='Additional controls ('+extra.childElementCount+')';
  dock.hidden=!main.childElementCount&&!extra.childElementCount;
 }
 function restore(){
  for(const {node,placeholder} of moved){
   if(placeholder.parentNode)placeholder.parentNode.replaceChild(node,placeholder);
  }
  for(const [e,label] of labelOverrides)e.setAttribute('aria-label',label);
  for(const {field,render} of generatedLabels)field.removeEventListener('input',render);
  generatedLabels.length=0;labelOverrides.clear();moved.length=0;mounted.clear();
  details.open=false;dock.remove();main.replaceChildren();extra.replaceChildren();
 }
 function schedule(){
  if(pending!==null)cancelAnimationFrame(pending);
  pending=requestAnimationFrame(()=>{pending=null;shouldDock()?mount():restore();});
 }
 function revealActivatedScene(){
  if(!breakpoint.matches||!scene||hidden(scene))return;
  const r=scene.getBoundingClientRect();
  const header=document.querySelector('header')?.getBoundingClientRect().bottom||0;
  const visible=Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(header,r.top));
  if(r.height&&visible<Math.min(r.height*.65,175)){
   (dock.isConnected&&!dock.hidden?dock:scene).scrollIntoView({
    block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'
   });
  }
 }
 // A click on a primary action is an intentional request to witness its
 // visual consequence. Move only when less than half of its stage is visible.
 // Never steal scroll during slider drags, on load or in desktop reading.
 dock.addEventListener('click',event=>{
  if(!breakpoint.matches||!event.target.closest('.atlas-feedback-main button'))return;
  requestAnimationFrame(()=>{
   if(!scene||hidden(scene))return;
   const r=scene.getBoundingClientRect();
   const top=document.querySelector('header')?.getBoundingClientRect().bottom||0;
   const visible=Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(top,r.top));
   if(r.height&&visible<Math.min(170,r.height*.5)){
    dock.scrollIntoView({
     block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'
    });
   }
  });
 });
 if(scene){
  schedule();breakpoint.addEventListener('change',schedule);
  document.addEventListener('click',ev=>{
   if(!(ev.target instanceof Element))return;
   if(ev.target.closest('button[id$="Activate"], #ptype3DStart')){
    for(const delay of [150,650,1500,4000])window.setTimeout(()=>{
      schedule();requestAnimationFrame(revealActivatedScene);
    },delay);
   }
  },true);
 }
}
