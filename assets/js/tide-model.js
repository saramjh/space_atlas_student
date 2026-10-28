// Source teaching ratio: solar tide-generating quadrupole about one-half lunar.
// Relative model units, not ocean height; a complex e^(2i θ) resultant.
export function tideResultant(angleDegrees) {
  if(!Number.isFinite(angleDegrees)||angleDegrees<0||angleDegrees>90)
    throw new RangeError('Moon-Sun angle must be 0..90 degrees');
  const theta=angleDegrees*Math.PI/180;
  const x=6+12*Math.cos(2*theta),y=12*Math.sin(2*theta);
  return {moonContribution:12,sunContribution:6,
    resultant:Math.hypot(x,y),
    percent:Math.hypot(x,y)/18*100,
    majorAxisDeg:Math.atan2(y,x)*90/Math.PI,
    kind:'ideal equilibrium quadrupole, no sea-level units'};
}
