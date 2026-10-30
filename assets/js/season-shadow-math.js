// A vertical 1-m pole on horizontal ground at *local solar noon*.
// Geometric approximation only: no slope, refraction or weather forecast.
export function noonShadowMeters(noonElevationDegrees,stickHeightMeters=1){
 if(!Number.isFinite(noonElevationDegrees)||noonElevationDegrees<=0||noonElevationDegrees>90||!Number.isFinite(stickHeightMeters)||stickHeightMeters<=0)throw new RangeError('sun must be above horizon; height positive');
 return noonElevationDegrees===90?0:stickHeightMeters/Math.tan(noonElevationDegrees*Math.PI/180);
}
