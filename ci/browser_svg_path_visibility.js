/* Browser-only review tool. Run via agent-browser eval at the local same-origin preview.
 * Tracks SVG path/stroke endpoint visibility and signs of clipping or later-painted
 * shapes obscuring data marks. Reports candidates requiring human design review;
 * lines intentionally meeting bodies are not automatically scientific mistakes.
 */
(async()=>{
 const routes=[
  'black-holes','index','universe/scale','universe/light-year',
  'moon/tides','moon/tidal-locking','moon/eclipses','moon/phases',
  'astronomy/electromagnetic-spectrum','galaxies/types','galaxies/milky-way',
  'exoplanets/transit-method','solar-system/orbital-periods',
  'solar-system/gravity-comparison','solar-system/planet-types',
  'solar-system/pluto-dwarf-planet'
 ];
 const width=Number(new URL(location.href).searchParams.get('svgAuditWidth'))||390;
 const flagged=[],stats=[],namedMarkers=[];
 for(const route of routes){
  const frame=document.createElement('iframe');
  frame.style.cssText='width:'+width+'px;height:1100px;position:absolute;left:0;top:0;z-index:-4;border:0;pointer-events:none';
  frame.src=location.origin+'/space_atlas_student/'+route+'/?svg-path-audit=1';
  document.body.append(frame);
  await new Promise(resolve=>{frame.onload=resolve;setTimeout(resolve,1700)});
  const doc=frame.contentDocument;
  if(!doc){flagged.push({route,kind:'unavailable'});frame.remove();continue;}
  let svgCount=0,strokes=0,samples=0,obscured=0;
  const candidates=[];
  for(const svg of doc.querySelectorAll('svg')){
   if(svg.getBoundingClientRect().width<20||getComputedStyle(svg).display==='none')continue;
   // Browser scroll places each figure in the iframe viewport before hit tests.
   svg.scrollIntoView({block:'center',inline:'nearest'});
   const svgBounds=svg.getBoundingClientRect();
   if(svgBounds.bottom<0||svgBounds.top>1100)continue;
   svgCount++;
   for(const shape of svg.querySelectorAll('path,line,polyline,polygon')){
    const style=getComputedStyle(shape);
    if(style.stroke==='none'||Number(style.strokeOpacity||1)===0||
      shape.getBoundingClientRect().width<1||typeof shape.getTotalLength!=='function')continue;
    const len=shape.getTotalLength();
    if(!Number.isFinite(len)||len<3)continue;
    strokes++;
    let tested=0,blocked=0,outside=0;const hits={};
    for(let i=1;i<=9;i++){
     const point=shape.getPointAtLength(len*i/10);
     const screen= new DOMPoint(point.x,point.y).matrixTransform(shape.getScreenCTM());
     if(screen.x<svgBounds.left-1||screen.x>svgBounds.right+1||screen.y<svgBounds.top-1||screen.y>svgBounds.bottom+1){outside++;continue}
     if(screen.y<0||screen.y>1100||screen.x<0||screen.x>width)continue;
     tested++;samples++;
     const top=doc.elementFromPoint(screen.x,screen.y);
     if(top&&top!==shape&&!shape.contains(top)){
      blocked++;obscured++;
      const t=top.tagName?.toLowerCase()||'unknown';
      hits[t]=(hits[t]||0)+1;
     }
    }
    // Compare actual path visibility, not just bounding-box collisions.
    if(shape.id) namedMarkers.push({route,id:shape.id,svg:svg.id||svg.getAttribute('class')||'',
      tested,blocked,outside,hits});
    if((tested>=5&&blocked>=5&&blocked/tested>.65)||outside>=6){
     candidates.push({id:shape.id||'',tag:shape.tagName.toLowerCase(),svg:svg.id||svg.getAttribute('class')||'',
       samples:tested,blocked,outside,hits});
    }
   }
  }
  if(candidates.length)flagged.push({route,kind:'path-visibility-candidates',candidates});
  stats.push({route,visibleSvgs:svgCount,strokedPaths:strokes,samples,blocked:obscured});
  frame.remove();
 }
 const criticalMarkers=namedMarkers.filter(mark=>
   mark.tested>=5 && (mark.blocked/mark.tested>.55 || mark.outside>=5));
 return JSON.stringify({width,stats,flagged,namedMarkers,criticalMarkers,summary:{visibleSvgCount:stats.reduce((a,x)=>a+x.visibleSvgs,0),strokedPaths:stats.reduce((a,x)=>a+x.strokedPaths,0),sampledPoints:stats.reduce((a,x)=>a+x.samples,0),obscured:stats.reduce((a,x)=>a+x.blocked,0),candidateRoutes:flagged.length,criticalMarkers:criticalMarkers.length}});
})()
