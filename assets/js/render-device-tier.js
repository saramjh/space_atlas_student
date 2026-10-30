// Shared GPU budget for opt-in WebGL scenes. Viewport width is considered
// alongside pointer capability because emulators, convertibles and some
// browsers report desktop pointer media queries at phone-size resolutions.
export function renderDeviceTier({width,dpr,coarse,memoryGB}={}) {
  if (!Number.isFinite(width) || width <= 0) throw new RangeError('positive viewport width required');
  const smallScreen = width <= 700;
  const lowMemory = Number.isFinite(memoryGB) && memoryGB > 0 && memoryGB <= 4;
  const constrained = Boolean(coarse) || smallScreen || lowMemory;
  const pixelRatio = Math.min(Number.isFinite(dpr) && dpr > 0 ? dpr : 1, constrained ? 1.25 : 1.75);
  return { constrained, pixelRatio, antialias: !constrained };
}
export function currentRenderTier() {
  return renderDeviceTier({
    width:window.innerWidth,
    dpr:window.devicePixelRatio || 1,
    coarse:matchMedia('(pointer: coarse)').matches,
    memoryGB:navigator.deviceMemory,
  });
}
