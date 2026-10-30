// Filmic camera easing, not a physical speed or acceleration model.
// Kept separate from science clocks, source distances and normalized sliders.
export function cinematicEase(t){
 if(!Number.isFinite(t))throw new RangeError('finite camera fraction required');
 const x=Math.max(0,Math.min(1,t));
 return x*x*x*(x*(x*6-15)+10);
}
export function cinematicVelocity(t){
 if(!Number.isFinite(t))throw new RangeError('finite camera fraction required');
 const x=Math.max(0,Math.min(1,t));
 return 30*x*x*(x-1)*(x-1);
}
