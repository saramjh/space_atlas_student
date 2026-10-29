// Nonrotating spherical conceptual reference in Earth mass/radius units.
// Time t is sqrt(EarthRadius / EarthSurfaceAcceleration), not wall-clock time.
export function relativeSurfaceGravity(massEarth,radiusEarth){
 if(!Number.isFinite(massEarth)||!Number.isFinite(radiusEarth)||massEarth<=0||radiusEarth<=0)throw new RangeError('Positive mass and radius required');
 return massEarth/(radiusEarth*radiusEarth);
}
export function probeRadialAcceleration(massEarth,radiusEarth,offsetEarthRadii){
 if(!Number.isFinite(offsetEarthRadii)||offsetEarthRadii<0)throw new RangeError('Probe distance must be above the surface');
 relativeSurfaceGravity(massEarth,radiusEarth);
 return massEarth/(radiusEarth+offsetEarthRadii)**2;
}
// Numerically integrate a radial drop from 0.65 Earth radii above the surface.
// A symplectic Euler fixed-step solver (small bounded time increment) is
// intentionally isolated from rendering time and never crosses the surface.
export function integrateProbeFall(state,massEarth,radiusEarth,dt){
 if(!Number.isFinite(dt)||dt<0||dt>0.05)throw new RangeError('Simulation dt must be in [0, .05]');
 relativeSurfaceGravity(massEarth,radiusEarth);
 if(state.landed)return {...state};
 let r=state.radialDistance;
 let v=state.inwardSpeed;
 if(!Number.isFinite(r)||!Number.isFinite(v)||r<radiusEarth||v<0)throw new RangeError('Invalid radial probe state');
 const accel=massEarth/(r*r);
 v+=accel*dt;
 r=Math.max(radiusEarth,r-v*dt);
 return {radialDistance:r,inwardSpeed:v,landed:r<=radiusEarth};
}
export function initialProbeState(radiusEarth){
 if(!Number.isFinite(radiusEarth)||radiusEarth<=0)throw new RangeError('Positive radius required');
 return {radialDistance:radiusEarth+.65,inwardSpeed:0,landed:false};
}
