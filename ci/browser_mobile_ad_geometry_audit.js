/* Same-origin browser QA for operator run only. Does not change production DOM.
 * Inspects publisher's configured ad layout and temporarily simulates a fixed-size
 * ad filling an unfilled slot, then restores the original styles/status. It does
 * NOT prove that Google will serve an ad or that account Auto Ads are in bounds.
 */
(()=>{
 const viewport=innerWidth;
 const unit=document.querySelector('.ad-slot-wrapper > ins.adsbygoogle');
 const wrapper=unit?.closest('.ad-slot-wrapper');
 if(!wrapper)return JSON.stringify({viewport,error:'publisher unit missing'});
 const oldStyle=unit.getAttribute('style'),oldStatus=unit.getAttribute('data-ad-status');
 // A native Google slot may be unfilled; inspect width rules through a clean CSS probe.
 const probe=document.createElement('ins');
 probe.className='adsbygoogle '+([...unit.classList].find(x=>x.startsWith('space_atlas_ad_'))||'');
 probe.setAttribute('aria-hidden','true');
 probe.style.display='block';
 wrapper.append(probe);
 const plannedWidth=getComputedStyle(probe).width;
 const plannedHeight=getComputedStyle(probe).height;
 probe.remove();
 // Temporarily expose the *existing publisher ad slot* without spoofing provider IDs.
 unit.setAttribute('data-ad-status','filled');
 unit.style.cssText='';
 const adBounds=unit.getBoundingClientRect(),wrapperBounds=wrapper.getBoundingClientRect();
 const inViewport=adBounds.left>=-1 && adBounds.right<=viewport+1 && wrapperBounds.left>=-1&&wrapperBounds.right<=viewport+1;
 const adWidth=Math.round(adBounds.width);
 const documentWidth=document.documentElement.scrollWidth;
 if(oldStatus===null)unit.removeAttribute('data-ad-status');else unit.setAttribute('data-ad-status',oldStatus);
 if(oldStyle===null)unit.removeAttribute('style');else unit.setAttribute('style',oldStyle);
 return JSON.stringify({viewport,plannedWidth,plannedHeight,
  adWidth,wrapperWidth:Math.round(wrapperBounds.width),left:Math.round(adBounds.left),right:Math.round(adBounds.right),inViewport,documentWidth,
  staticUnitStillExists:!!document.querySelector('[data-ad-slot="2983244729"]')});
})()
