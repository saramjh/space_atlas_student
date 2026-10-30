// A simplified LOCAL SOLAR TIME heuristic, not a rise/set forecast.
// This teaching globe neglects observer latitude, lunar declination, orbital
// tilt/eccentricity and Earth location. New moon rise ~sunrise; full ~sunset.
export function phaseSkyClock(degrees){
 if(!Number.isFinite(degrees)||degrees<0||degrees>360)throw new RangeError('phase angle 0..360 required');
 const phase=(degrees%360)/360;
 const rise=(6+phase*24)%24;
 const transit=(rise+6)%24;
 const set=(rise+12)%24;
 return {rise,transit,set};
}
export const formatLocalSolarHour=hours=>{
 if(!Number.isFinite(hours))throw new RangeError('finite hours required');
 const h=Math.round((hours%24+24)%24)%24;
 return `${String(h).padStart(2,'0')}:00`;
};
