// Idealized declination and 40° N/S equinox/solstice comparison.
// θ=0 December solstice; θ=90 March equinox; θ=180 June solstice.
// Circular orbit, fixed obliquity; no atmosphere/refraction, latitude 40°.
// Solar noon altitude: 90° - |φ - δ|. Day length from hour-angle formula.
const RADIANS=Math.PI/180;
const LATITUDE=40;
function daylightHours(latitude,declination) {
  const cosine=-Math.tan(latitude*RADIANS)*Math.tan(declination*RADIANS);
  return 24/Math.PI*Math.acos(Math.max(-1,Math.min(1,cosine)));
}
export function seasonSunlight(angleDeg,tiltDeg) {
  if(!Number.isFinite(angleDeg)||angleDeg<0||angleDeg>360||
     !Number.isFinite(tiltDeg)||tiltDeg<0||tiltDeg>23.5) {
    throw new RangeError('Orbit angle 0..360 and tilt 0..23.5 required');
  }
  const declination=Math.asin(
    -Math.sin(tiltDeg*RADIANS)*Math.cos(angleDeg*RADIANS)
  )/RADIANS;
  return {
    declination,
    northNoonElevation:90-Math.abs(LATITUDE-declination),
    southNoonElevation:90-Math.abs(-LATITUDE-declination),
    northHours:daylightHours(LATITUDE,declination),
    southHours:daylightHours(-LATITUDE,declination),
    latitude:LATITUDE,
    kind:'idealized spherical Earth: no refraction or local terrain',
  };
}
