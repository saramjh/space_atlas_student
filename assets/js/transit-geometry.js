// Uniform-brightness stellar disk, opaque circular planet and edge-on circular orbit.
// Illustration only: no limb darkening, grazing inclination, atmospheric effects or noise.
export const ORBIT_RADIUS_IN_STELLAR_RADII = 3.4;
export const GRAPH_DEPTH_LIMIT = 0.10; // fixed 100–90% brightness axis
export function transitBlockedFraction(angleDegrees, radiusRatio) {
  const theta = angleDegrees * Math.PI / 180;
  if (!(radiusRatio > 0 && radiusRatio < 1) || !Number.isFinite(theta)) return 0;
  if (Math.sin(theta) <= 0) return 0; // planet behind star (or at side of orbit)
  const d = Math.abs(ORBIT_RADIUS_IN_STELLAR_RADII * Math.cos(theta));
  const r = radiusRatio;
  if (d >= 1 + r) return 0;
  if (d <= 1 - r) return r * r;
  const c1 = Math.max(-1, Math.min(1, (d*d + 1 - r*r) / (2*d)));
  const c2 = Math.max(-1, Math.min(1, (d*d + r*r - 1) / (2*d*r)));
  const radical = Math.max(0, (-d+1+r)*(d+1-r)*(d-1+r)*(d+1+r));
  const overlap = Math.acos(c1) + r*r*Math.acos(c2) - Math.sqrt(radical)/2;
  return Math.max(0, Math.min(r*r, overlap/Math.PI));
}
