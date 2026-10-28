// Ideal Newtonian two-body energy/shape classification for a perpendicular
// tangential launch. These are px/frame MODEL units, not measured km/s.
// The main onscreen integrator uses simple finite timesteps, so its sampled
// canvas path is an approximation of this analytic reference.
const RADIUS=130,PLANET_RADIUS=18,CIRCULAR=2.6,GM=RADIUS*CIRCULAR**2;
export function launchOrbitPrediction(speed){
 if(!Number.isFinite(speed)||speed<.5||speed>6)throw new RangeError('Model launch speed 0.5–6');
 const escapeSpeed=CIRCULAR*Math.SQRT2;
 const eccentricity=Math.abs(RADIUS*speed*speed/GM-1);
 const periapsisRadius=RADIUS*RADIUS*speed*speed/(GM*(1+eccentricity));
 let classification;
 if(speed>=escapeSpeed)classification='unbound';
 else if(periapsisRadius<=PLANET_RADIUS)classification='collision';
 else if(Math.abs(speed-CIRCULAR)<.04)classification='near-circular';
 else classification='bound-ellipse';
 return {classification,eccentricity,periapsisRadius,circularSpeed:CIRCULAR,escapeSpeed};
}
