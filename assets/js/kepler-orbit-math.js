// Sun-normalized two-body approximation: T²=a³ with a in AU, T in Earth years.
// Orbit rendering compresses AU nonlinearly; physical AU is the numeric chart.
export function periodYearsFromAU(au){
 if(!Number.isFinite(au)||au<=0)throw new RangeError('Positive finite semi-major axis in AU required');
 return Math.sqrt(au**3);
}
export function orbitAngleAtYears(au,years){
 if(!Number.isFinite(years)||years<0)throw new RangeError('Nonnegative finite elapsed Earth-years required');
 return (2*Math.PI*years/periodYearsFromAU(au))%(2*Math.PI);
}
export function displayOrbitFraction(au){
 if(!Number.isFinite(au)||au<.3||au>35)throw new RangeError('Model drawing supports 0.3..35 AU');
 // Radial compression makes all planets visible; not an AU-linear drawing.
 return .17+.8*Math.log(au/.3)/Math.log(35/.3);
}
export function completedOrbitalRevolutions(au,years){
 if(!Number.isFinite(years)||years<0)throw new RangeError('Nonnegative finite elapsed Earth-years required');
 return years/periodYearsFromAU(au);
}
