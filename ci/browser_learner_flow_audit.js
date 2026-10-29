/* Same-origin Chromium QA, invoked with:
 * agent-browser open 'http://127.0.0.1:8993/space_atlas_student/?auditWidth=390'
 * agent-browser eval "$(cat ci/browser_learner_flow_audit.js)"
 * Returns JSON; use the media preference option separately to check reduced motion.
 * This is a manual browser test, NOT loaded by the public website.
 */
(async () => {
  const routes=['black-holes','moon/eclipses','earth/seasons','exoplanets/transit-method',
    'moon/tidal-locking','solar-system/gravity-and-orbits','moon/tides','universe/light-year',
    'stars/life-cycle','astronomy/electromagnetic-spectrum','galaxies/types'];
  const width=Number(new URL(location.href).searchParams.get('auditWidth'))||390;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const issues=[],records=[];
  const play={
    'black-holes':'#bhAnimate','moon/eclipses':'#eclipsePlay',
    'exoplanets/transit-method':'#transitPlay','universe/light-year':'#lyPlay',
    'stars/life-cycle':'#lifePlay',
    'astronomy/electromagnetic-spectrum':'#spectrumWaveToggle',
    'galaxies/types':'#galaxy3DPlay'
  };
  for(const route of routes){
    const iframe=document.createElement('iframe');
    iframe.style.cssText='position:absolute;left:0;top:0;width:'+width+'px;height:844px;z-index:-6;pointer-events:none;border:0';
    iframe.src=location.origin+'/space_atlas_student/'+route+'/?flowAudit=1';
    document.body.append(iframe);
    await new Promise(resolve=>{iframe.onload=resolve;setTimeout(resolve,1700)});
    const doc=iframe.contentDocument;
    if(!doc){issues.push({route,type:'unavailable',detail:'no same-origin document'});iframe.remove();continue}
    const small=[];
    for(const button of doc.querySelectorAll('button')){
      const r=button.getBoundingClientRect();
      if(r.width<2||button.closest('header,nav,.scale-quiz,.search-overlay,.site-header,.quiz-options'))continue;
      if(r.height<43){small.push((button.id||button.textContent.trim().slice(0,24))+' '+Math.round(r.height)+'px')}
    }
    if(small.length)issues.push({route,type:'undersized-control',detail:small});
    if(play[route]){
      const button=doc.querySelector(play[route]);
      const visible=button&&button.getBoundingClientRect().height>0;
      const note=[...doc.querySelectorAll('.motion-preference-note')].some(e=>e.getBoundingClientRect().height>0);
      if(reduced&&visible&&!button.disabled)issues.push({route,type:'motion-ignored'});
      if(reduced&&visible&&!note)issues.push({route,type:'reduced-motion-no-reason'});
      if(!reduced&&visible&&button.disabled)issues.push({route,type:'unexpected-disabled-play'});
    }
    const anchors=route==='black-holes'?['#bhSceneShell','#bhActivate']:
      route==='galaxies/types'?['#galaxy3DShell','#galaxy3DActivate']:null;
    let distance=null;
    if(anchors){
      const fig=doc.querySelector(anchors[0]),cta=doc.querySelector(anchors[1]);
      if(!fig||!cta){issues.push({route,type:'3d-discovery-missing'});}
      else {
        distance=Math.round(cta.getBoundingClientRect().top-fig.getBoundingClientRect().bottom);
        if(distance<0||distance>22)issues.push({route,type:'3d-discovery-distance',distance});
      }
    }
    records.push({route,smallButtons:small.length,viewSwitchDistance:distance,hiddenButtonCount:[...doc.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height===0).length});
    iframe.remove();
  }
  return JSON.stringify({viewport:width,reduced,checkedRoutes:records.length,issues,records});
})()
