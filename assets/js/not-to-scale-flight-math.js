// AU, diameters and a camera radius expressed in actual Sun-planet distance
// units. Markers are always identified as symbols, not sized planets.
export const AU_KM=149597870.7;
export const PLANET_ORBITS=[
 {name:'Mercury',au:.39,diameterKm:4879,color:'#a9a8a2',phase:.45},
 {name:'Venus',au:.72,diameterKm:12104,color:'#e2ba84',phase:2.22},
 {name:'Earth',au:1,diameterKm:12756,color:'#75bfe7',phase:4.9},
 {name:'Mars',au:1.52,diameterKm:6792,color:'#db7c5b',phase:3.42},
 {name:'Jupiter',au:5.20,diameterKm:142984,color:'#e2b78d',phase:5.46},
 {name:'Saturn',au:9.58,diameterKm:120536,color:'#d7c58e',phase:1.12},
 {name:'Uranus',au:19.2,diameterKm:51118,color:'#86dfe2',phase:4.1},
 {name:'Neptune',au:30.05,diameterKm:49528,color:'#658adb',phase:2.7}
];
export function radiusAUAtProgress(progress){
 if(!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Zoom progress must be 0..1');
 return .55*Math.pow(35/.55,progress);
}
export function progressAtRadiusAU(radiusAU){
 if(!Number.isFinite(radiusAU)||radiusAU<=0)throw new RangeError('Radius AU must be positive');
 return Math.max(0,Math.min(1,Math.log(radiusAU/.55)/Math.log(35/.55)));
}
export function physicalPlanetDiameterPx(diameterKm,radiusAU,stageRadiusPx){
 if(!Number.isFinite(diameterKm)||diameterKm<=0||!Number.isFinite(radiusAU)||radiusAU<=0||!Number.isFinite(stageRadiusPx)||stageRadiusPx<=0)throw new RangeError('Positive physical dimensions required');
 return diameterKm/AU_KM*stageRadiusPx/radiusAU;
}
export const SUN_DIAMETER_KM=1392700; // approximate NASA Science nominal Sun diameter

// Physical-size inspection keeps an actual planet centered before widening to its orbit.
// A camera radius is an AU half-span in the viewport; this is an orthographic diagram,
// not a physical spacecraft trajectory or telescope angular-resolution claim.
export function focusMinRadiusAU(diameterKm){
 if(!Number.isFinite(diameterKm)||diameterKm<=0)throw new RangeError('Positive diameter required');
 return diameterKm/AU_KM*1.15;
}
export function focusRadiusAUAtProgress(progress,diameterKm){
 if(!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Focus progress must be 0..1');
 const min=focusMinRadiusAU(diameterKm);
 return min*Math.pow(35/min,progress);
}
export function focusProgressAtRadiusAU(radiusAU,diameterKm){
 if(!Number.isFinite(radiusAU)||radiusAU<=0)throw new RangeError('Positive radius required');
 const min=focusMinRadiusAU(diameterKm);
 return Math.max(0,Math.min(1,Math.log(radiusAU/min)/Math.log(35/min)));
}
export function pixelThresholdRadiusAU(diameterKm,stageRadiusPx){
 if(!Number.isFinite(diameterKm)||diameterKm<=0||!Number.isFinite(stageRadiusPx)||stageRadiusPx<=0)throw new RangeError('Positive diameter and stage radius required');
 return diameterKm/AU_KM*stageRadiusPx;
}
