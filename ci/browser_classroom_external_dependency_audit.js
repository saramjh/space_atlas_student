/* Local-only browser privacy audit; not public website code.
 * Run under http://127.0.0.1:8998/space_atlas_student/?audit=1
 * Reports third-party network resource loads. Visible external links and
 * metadata such as canonical URLs are not automatic requests.
 */
(async()=>{
 const routes=["/", "/astronomy/electromagnetic-spectrum/", "/black-holes/", "/earth/seasons/", "/exoplanets/transit-method/", "/galaxies/milky-way/", "/galaxies/types/", "/learn/not-to-scale/", "/learn/read-space-images/", "/moon/earth-moon-scale/", "/moon/eclipses/", "/moon/phases/", "/moon/tidal-locking/", "/moon/tides/", "/privacy/", "/solar-system/astronomical-unit/", "/solar-system/distance-scale/", "/solar-system/gravity-and-orbits/", "/solar-system/gravity-comparison/", "/solar-system/orbital-periods/", "/solar-system/planet-size-comparison/", "/solar-system/planet-types/", "/solar-system/pluto-dwarf-planet/", "/solar-system/temperature-comparison/", "/sources/space-resources-for-students/", "/stars/life-cycle/", "/universe/light-year/", "/universe/scale/", "/updates/", "/teacher-guide.html"];
 const records=[];
 for(const route of routes){
  const frame=document.createElement('iframe');
  frame.style.cssText='width:390px;height:720px;position:absolute;left:0;top:0;z-index:-7;pointer-events:none';
  frame.src=location.origin+'/space_atlas_student/'+(route==='/'?'':route.slice(1))+'?networkAudit=1';
  document.body.append(frame);
  await new Promise(resolve=>{frame.onload=resolve;setTimeout(resolve,2000);});
  await new Promise(resolve=>setTimeout(resolve,250));
  const d=frame.contentDocument;
  if(!d){records.push({route,error:'cross-origin frame'});frame.remove();continue;}
  const ent=d.defaultView.performance.getEntriesByType('resource');
  const outside=ent.filter(r=>{try{return new URL(r.name).origin!==location.origin}catch(e){return true}}).map(r=>r.name.slice(0,160));
  const ad=!!d.querySelector('ins.adsbygoogle,script[src*="googlesyndication"],script[src*="googletagmanager"]');
  records.push({route,external:outside,advertisingOrGA4Nodes:ad,resourceCount:ent.length});
  frame.remove();
 }
 return JSON.stringify({pages:records.length,externalPages:records.filter(x=>x.external?.length||x.error||x.advertisingOrGA4Nodes)});
})()
