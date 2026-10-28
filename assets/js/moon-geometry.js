// Pure phase geometry. This is an idealized fixed-Sun, circular reference
// model: one revolution represents a synodic cycle, not the Moon's real
// sidereal rotation rate; real solar motion, tilt and libration are omitted.
export const MOON_MODEL_ORBIT_RADIUS = 9;
export const SYNODIC_MONTH_DAYS = 29.53059;

export function moonModelAtDegrees(degrees) {
  if (!Number.isFinite(degrees) || degrees < 0 || degrees > 360) {
    throw new RangeError('Moon model angle must be 0–360 degrees');
  }
  const theta = degrees * Math.PI / 180;
  const cos = Math.cos(theta), sin = Math.sin(theta);
  return {
    position: {x:-MOON_MODEL_ORBIT_RADIUS*cos, z:MOON_MODEL_ORBIT_RADIUS*sin},
    // Designated local +X face points toward Earth throughout the model orbit.
    moonRotationY:theta,
    illuminatedFraction:(1-cos)/2,
    phaseAgeDays:degrees/360*SYNODIC_MONTH_DAYS,
    elongationDegrees:Math.acos(Math.max(-1,Math.min(1,cos)))*180/Math.PI,
  };
}

// Major quarters/full/new are narrow moments, not 45-degree-long labels.
// This avoids calling a 67%-illuminated disk "First Quarter" at 110 degrees.
export function phaseLabelAtDegrees(degrees) {
  if (!Number.isFinite(degrees) || degrees < 0 || degrees > 360) {
    throw new RangeError('Moon model angle must be 0–360 degrees');
  }
  if (degrees <= 3 || degrees >= 357) return 'New Moon';
  if (Math.abs(degrees - 90) <= 3) return 'First Quarter';
  if (Math.abs(degrees - 180) <= 3) return 'Full Moon';
  if (Math.abs(degrees - 270) <= 3) return 'Last Quarter';
  if (degrees < 90) return 'Waxing Crescent';
  if (degrees < 180) return 'Waxing Gibbous';
  if (degrees < 270) return 'Waning Gibbous';
  return 'Waning Crescent';
}

// Inverse model orbit for clicking / dragging the Moon position directly.
export function angleForOrbitPosition(x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z) || Math.hypot(x, z) < 0.000001) {
    throw new RangeError('Orbit location must be finite and away from Earth');
  }
  return (Math.atan2(z, -x) * 180 / Math.PI + 360) % 360;
}
