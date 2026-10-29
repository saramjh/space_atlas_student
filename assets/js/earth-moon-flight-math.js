// A physically proportional reference: Earth equatorial radius 6,378 km;
// lunar mean radius ~1,737 km, representative NASA/GSFC center separations.
export const EARTH_RADIUS_KM=6378;
export const MOON_RADIUS_KM=1737;
export const REPRESENTATIVE_SEPARATIONS=Object.freeze([363300,384400,405500]);
export function earthMoonModel(distanceKm=384400){
  if(!REPRESENTATIVE_SEPARATIONS.includes(Number(distanceKm)))throw new RangeError('Choose a sourced near, mean or far center separation');
  return {
    distanceKm:Number(distanceKm),
    earthRadiusScene:1,
    moonRadiusScene:MOON_RADIUS_KM/EARTH_RADIUS_KM,
    moonCenterScene:Number(distanceKm)/EARTH_RADIUS_KM,
    separationEarthDiameters:Number(distanceKm)/(2*EARTH_RADIUS_KM),
  };
}
export function flightFractionReadout(progress,distanceKm){
  if(!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Expected normalized flight fraction 0–1');
  const m=earthMoonModel(distanceKm);
  return {
    fraction:progress,
    referenceKm:Math.round(m.distanceKm*progress),
    remainingKm:Math.round(m.distanceKm*(1-progress)),
    fractionPct:Math.round(progress*100),
  };
}
