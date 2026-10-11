// Fit a whole orbit (including the Moon's surface marker) into a fixed
// perspective teaching scene on BOTH axes. All distances share world units.
// The small camera tilt puts some of the orbit nearer than the center.
export function orbitFitDistance({
  width, height, fovDeg = 44, orbitRadius = 9, moonRadius = 0.62,
  markerRadius = 0.09, cameraTiltSin = 5 / Math.hypot(27, 5),
  safetyFactor = 1.15,
}) {
  if (!(width > 0 && height > 0)) return 34;
  const aspect = width / height;
  const halfFovSlope = Math.tan((fovDeg * Math.PI) / 360);
  const shorterDimensionSlope = halfFovSlope * Math.min(1, aspect);
  const wholeOrbitRadius = orbitRadius + moonRadius + markerRadius;
  const nearSideDepth = orbitRadius * cameraTiltSin;
  return (wholeOrbitRadius * safetyFactor) / shorterDimensionSlope + nearSideDepth;
}
