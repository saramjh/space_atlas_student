// An idealized equilibrium quadrupole, not actual ocean heights, waves,
// basin resonance or a coastline model. Sun tide-raising term is half lunar.
const RAD=Math.PI/180;
export function tideOceanRadius(x,y,z,moonAngleDeg=0){
 if(!Number.isFinite(moonAngleDeg)||moonAngleDeg<0||moonAngleDeg>90)throw new RangeError('Moon alignment must be 0..90°');
 const length=Math.hypot(x,y,z);
 if(length<=0||!Number.isFinite(length))throw new RangeError('Nonzero finite radial direction required');
 const nx=x/length,ny=y/length;
 const angle=moonAngleDeg*RAD;
 const lm=nx*Math.cos(angle)+ny*Math.sin(angle);
 const ls=nx; // Sun on -X; quadrupole sign is symmetric.
 const legendre=u=>.5*(3*u*u-1);
 return 1.13+.13*legendre(lm)+.065*legendre(ls);
}
export function tideObserverContrast(observerDegrees,moonAngleDeg){
 const theta=observerDegrees*RAD;
 const current=tideOceanRadius(Math.cos(theta),Math.sin(theta),0,moonAngleDeg);
 let low=Infinity,high=-Infinity;
 for(let i=0;i<180;i++){
  const a=i*Math.PI/90;
  const r=tideOceanRadius(Math.cos(a),Math.sin(a),0,moonAngleDeg);
  low=Math.min(low,r);high=Math.max(high,r);
 }
 const relative=(current-low)/Math.max(.000001,high-low);
 return {relative:Math.max(0,Math.min(1,relative)),radius:current,minimum:low,maximum:high};
}
