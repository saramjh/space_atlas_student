// Idealized tilted circular lunar orbit. The node line is an in-plane axis
// where the Moon orbit intersects the ecliptic. All distances are model units;
// no actual eclipse shadow cone, time of year, longitude, or inclination
// precession is calculated.
export const ORBIT_RADIUS = 9;
export const DISPLAY_TILT_DEGREES = 15; // exaggerated from real ~5.1°

export function eclipseModel({phaseDeg,nodeDeg,tilted}) {
  if(!Number.isFinite(phaseDeg)||phaseDeg<0||phaseDeg>360 ||
     !Number.isFinite(nodeDeg)||nodeDeg<0||nodeDeg>90) {
    throw new RangeError('Phase 0..360 and node angle 0..90 required');
  }
  const phase=phaseDeg*Math.PI/180;
  const axis=nodeDeg*Math.PI/180;
  const inclination=tilted?DISPLAY_TILT_DEGREES*Math.PI/180:0;
  const x=-ORBIT_RADIUS*Math.cos(phase);
  const z=ORBIT_RADIUS*Math.sin(phase);
  const nx=Math.cos(axis),nz=Math.sin(axis);
  const dot=nx*x+nz*z;
  const cs=Math.cos(inclination),sn=Math.sin(inclination);
  const resultX=x*cs+nx*dot*(1-cs);
  const resultY=(nz*x-nx*z)*sn;
  const resultZ=z*cs+nz*dot*(1-cs);
  const atConjunction=phaseDeg===0||phaseDeg===180||phaseDeg===360;
  return {
    x:resultX,y:resultY,z:resultZ,
    phaseDeg,nodeDeg,tilted:Boolean(tilted),
    normalizedHeight:resultY/ORBIT_RADIUS,
    isExactNodeConjunction:atConjunction&&Math.abs(resultY)<1e-7,
  };
}
