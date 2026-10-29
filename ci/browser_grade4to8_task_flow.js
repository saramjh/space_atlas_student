/* Same-origin real-browser verification of four scripted science learning tasks.
 * This does NOT simulate students or measure student understanding.
 * Usage: agent-browser open http://127.0.0.1:8998/space_atlas_student/moon/phases/
 *        agent-browser eval "$(cat ci/browser_grade4to8_task_flow.js)"
 */
(async()=>{
 const width=innerWidth;
 const tasks=[
  ['Moon quarter prediction','moon/phases', async d=>{
   const quarter=d.querySelector('input[name="cerMoonPrediction"][value="quarter"]');
   quarter.click();
   const preview=d.querySelector('#moonCerPredictionLabel').textContent;
   const beforeHidden=d.querySelector('#moonCerComparison').hidden;
   d.querySelector('#moonCerCheck').click();
   const actual=d.querySelector('#moonCerActualLabel').textContent;
   const angle=d.querySelector('#moonAngle').value;
   const half=d.querySelector('input[name="cerMoonPrediction"][value="half"]');
   half.click();
   const reset=d.querySelector('#moonCerComparison').hidden;
   d.querySelector('#moonCerCheck').click();
   const feedback=d.querySelector('#moonCerFeedback').textContent;
   return {ok:preview.includes('25%')&&beforeHidden&&actual.includes('50%')&&angle==='90'&&reset&&/match/i.test(feedback),
    observed:{preview,actual,angle,feedback,reset}};
  }],
  ['Eclipse nodes cause alignment or miss','moon/eclipses',async d=>{
   const node=d.querySelector('#eclipseNode'),phase=d.querySelector('#eclipseAngle');
   if(node.disabled||phase.disabled)return {ok:false,error:'3D science module did not initialize'};
   phase.value='0';phase.dispatchEvent(new Event('input',{bubbles:true}));
   node.value='90';node.dispatchEvent(new Event('input',{bubbles:true}));
   const missed=d.querySelector('#eclipseReadout').textContent;
   const missedOffset=d.querySelector('#eclipseOffset').textContent;
   node.value='0';node.dispatchEvent(new Event('input',{bubbles:true}));
   const aligned=d.querySelector('#eclipseReadout').textContent;
   const alignedOffset=d.querySelector('#eclipseOffset').textContent;
   return {ok:/miss|above|below/i.test(missed)&&/node|possible/i.test(aligned)&&missed!==aligned,
    observed:{missed:missed.slice(0,140),missedOffset,aligned:aligned.slice(0,140),alignedOffset}};
  }],
  ['Transit star brightness and light curve','exoplanets/transit-method',async d=>{
   const phase=d.querySelector('#transitAngle'),size=d.querySelector('#transitRadius');
   if(phase.disabled||size.disabled)return {ok:false,error:'transit model did not initialize'};
   phase.value='90';phase.dispatchEvent(new Event('input',{bubbles:true}));
   size.value='10';size.dispatchEvent(new Event('input',{bubbles:true}));
   const centered=d.querySelector('#transitReadout').textContent;
   const markerA=d.querySelector('#transitCurveMarker').getAttribute('cx');
   phase.value='0';phase.dispatchEvent(new Event('input',{bubbles:true}));
   const clear=d.querySelector('#transitReadout').textContent;
   const markerB=d.querySelector('#transitCurveMarker').getAttribute('cx');
   phase.value='90';phase.dispatchEvent(new Event('input',{bubbles:true}));
   size.value='20';size.dispatchEvent(new Event('input',{bubbles:true}));
   const larger=d.querySelector('#transitReadout').textContent;
   return {ok:centered.includes('99.000%')&&clear.includes('100.000%')&&larger.includes('96.000%')&&markerA!==markerB,
    observed:{centered:centered.slice(0,125),clear:clear.slice(0,115),larger:larger.slice(0,125),markerMoved:markerA!==markerB}};
  }],
  ['Galaxy projection changes with viewpoint','galaxies/types',async d=>{
   const slider=d.querySelector('#galaxyInclination');
   slider.value='0';slider.dispatchEvent(new Event('input',{bubbles:true}));
   const front=d.querySelector('#galaxyTiltDisk').getAttribute('transform');
   slider.value='80';slider.dispatchEvent(new Event('input',{bubbles:true}));
   const edge=d.querySelector('#galaxyTiltDisk').getAttribute('transform');
   const readout=d.querySelector('#galaxyAngleOutput').textContent;
   return {ok:front!==edge&&readout.includes('80°')&&d.querySelector('#galaxy3DActivate').disabled===false,
    observed:{front,edge,readout:readout.slice(0,135)}};
  }]
 ];
 const results=[];
 for(const [name,route,run] of tasks){
  const iframe=document.createElement('iframe');
  iframe.style.cssText='position:absolute;left:0;top:0;width:'+width+'px;height:980px;z-index:-5;pointer-events:none;border:0';
  iframe.src=location.origin+'/space_atlas_student/'+route+'/?taskAudit=1';
  document.body.append(iframe);
  await new Promise(resolve=>{iframe.onload=resolve;setTimeout(resolve,2000)});
  const d=iframe.contentDocument;
  const ready=async()=>{
   for(let i=0;i<40;i++){
    if(d&&d.readyState==='complete'&&(route==='moon/eclipses'? !d.querySelector('#eclipseNode').disabled:
      route==='exoplanets/transit-method'? !d.querySelector('#transitAngle').disabled:true))return true;
    await new Promise(r=>setTimeout(r,150));
   }
   return false;
  };
  const initialized=await ready();
  try{
   const state=await run(d);
   results.push({name,route,initialized,ok:state.ok,observed:state.observed||null,error:state.error||null});
  }catch(error){results.push({name,route,initialized,ok:false,error:String(error).slice(0,220)});}
  iframe.remove();
 }
 return JSON.stringify({viewport:width,syntheticChecks:results.length,passed:results.filter(x=>x.ok).length,results,
   notice:'Browser technical checks only; zero real student participants or outcome measurements.'});
})()
