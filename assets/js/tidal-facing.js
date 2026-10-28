// Geometry of the Moon's *surface marker* relative to the Earth-facing line.
// Real synchronous spin: same one rotation per orbit, marker remains Earthward.
// Hypothetical nonlocked comparison matches the existing 3.5-turn model.
const R=Math.PI/180;
export function lunarFacing(phaseDeg,locked){
 if(!Number.isFinite(phaseDeg)||phaseDeg<0||phaseDeg>360)
  throw new RangeError('Orbital phase must be 0..360 degrees');
 const relativeDegrees=locked?0:2.5*phaseDeg;
 return {
  relativeDegrees,
  facingCosine:Math.cos(relativeDegrees*R),
  markerX:-Math.cos(relativeDegrees*R),
  markerY:Math.sin(relativeDegrees*R),
  label:locked?'Marker always faces Earth':
    (Math.cos(relativeDegrees*R)<0?'Marker points away from Earth':'Marker points toward Earth'),
 };
}
