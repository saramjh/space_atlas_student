// Schwarzschild reference scales, not a general-relativistic image ray tracer.
// Solar GM/c² uses nominal solar gravitational parameter 1.3271244e20 m³/s².
const C_METERS_PER_SECOND = 299792458;
const SUN_GM_M3_PER_S2 = 1.3271244e20;
export const SCHWARZSCHILD_RS_SOLAR_KM =
  2 * SUN_GM_M3_PER_S2 / (C_METERS_PER_SECOND ** 2) / 1000;
export const CRITICAL_CURVE_RATIO = 3 * Math.sqrt(3) / 2;

export function blackHoleModel({massSolar,elevationDeg}) {
  if(!Number.isFinite(massSolar)||massSolar<1||massSolar>1e9) {
    throw new RangeError('Black hole mass must be 1–1 billion solar masses');
  }
  if(!Number.isFinite(elevationDeg)||elevationDeg<15||elevationDeg>80) {
    throw new RangeError('Observer elevation must be between 15 and 80 degrees');
  }
  const horizonRadiusKm=SCHWARZSCHILD_RS_SOLAR_KM*massSolar;
  return {
    kind:'Schwarzschild geometric illustration',
    photonsRayTraced:false,
    massSolar,elevationDeg,horizonRadiusKm,
    criticalImpactParameterKm:horizonRadiusKm*CRITICAL_CURVE_RATIO,
    projectedDiskMinorMajorRatio:Math.sin(elevationDeg*Math.PI/180),
  };
}
