/* Read-only real-filled-ad monitoring, run with agent-browser eval on the
 * live public site. No fake ads, clicks, user identifiers, or network beacons.
 * An unfilled result is inconclusive and cannot certify layout under inventory.
 */
(()=>{
 const viewport=innerWidth,scrollWidth=document.documentElement.scrollWidth;
 const publisher=[...document.querySelectorAll('ins.adsbygoogle[data-ad-slot]')].map(e=>({
  slot:e.getAttribute('data-ad-slot'),status:e.getAttribute('data-ad-status')||'pending',
  width:Math.round(e.getBoundingClientRect().width),rendered:e.getBoundingClientRect().height>0
 }));
 const provider=[...document.querySelectorAll('.google-auto-placed,ins.adsbygoogle-noablate,iframe[id^="aswift"],iframe[id^="google_ads"],div[id^="google_ads_iframe"]')].map(e=>{
  const r=e.getBoundingClientRect();
  return {type:e.tagName.toLowerCase(),id:e.id.slice(0,50),className:String(e.className).slice(0,75),
   width:Math.round(r.width),left:Math.round(r.left),right:Math.round(r.right),
   visible:r.width>10&&r.height>10,overflows:r.right>viewport+2||r.left< -2};
 });
 const offenders=[...document.querySelectorAll('body *')]
   .filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&(r.right>viewport+8||r.left< -8)})
   .slice(0,12).map(e=>({tag:e.tagName,id:e.id.slice(0,55),cls:String(e.className).slice(0,60),right:Math.round(e.getBoundingClientRect().right)}));
 const filled=publisher.some(p=>p.status==='filled')||provider.some(p=>p.visible&&/adsbygoogle-noablate|aswift|google_ads/.test(p.className+' '+p.id));
 return JSON.stringify({viewport,scrollWidth,publisher,provider,offenders,actualCreativeVisible:filled,
  verdict:scrollWidth>viewport+2?'OBSERVED_OVERFLOW':filled?'FILLED_AD_NO_OVERFLOW':'INCONCLUSIVE_NO_FILLED_CREATIVE',
  note:'Read-only observation. Provider Auto Ads settings not changed; no simulated filled ad.'});
})()
