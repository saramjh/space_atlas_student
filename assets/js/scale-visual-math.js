// Pure mathematical dimensions for educational logarithmic diagrams.
// Approximate sizes/spans are from the page's NASA-sourced reference table;
// unlike quantities remain explicitly labeled in the lesson (diameter,
// height, separation, orbital span, or observable-region diameter).
export const LIGHT_YEAR_METRES = 9460730472580800;
export const COSMIC_METRES = Object.freeze([
  1.7,                                  // Person height
  12_742_000,                           // Earth diameter
  384_400_000,                          // Earth/Moon center distance
  9e12,                                 // To Neptune's orbit, full span
  4.25 * LIGHT_YEAR_METRES,             // To Proxima Centauri
  100_000 * LIGHT_YEAR_METRES,          // Milky Way stellar disk width
  10_000_000 * LIGHT_YEAR_METRES,       // Local Group approximate span
  93_000_000_000 * LIGHT_YEAR_METRES,   // Observable diameter (comoving)
]);
export const COSMIC_DOMAIN = Object.freeze({min: 0, max: 27});
export const LIGHT_DOMAIN = Object.freeze({min: -8, max: 7});

export function logPosition(value, minExponent, maxExponent) {
  if (!(value > 0) || maxExponent <= minExponent) throw new RangeError('Expected positive size and increasing log bounds');
  return Math.max(0, Math.min(1, (Math.log10(value) - minExponent) / (maxExponent - minExponent)));
}
export function cosmicJump(index) {
  if (!Number.isInteger(index) || index < 1 || index >= COSMIC_METRES.length) return null;
  return COSMIC_METRES[index] / COSMIC_METRES[index - 1];
}
export function signalSeconds(lightYears) {
  return lightYears * 365.25 * 86400;
}
export function photonProgress(lightYears, percent) {
  const progress = Math.max(0, Math.min(1, percent / 100));
  const totalSeconds = signalSeconds(lightYears);
  return {progress, elapsedSeconds: totalSeconds * progress, remainingSeconds: totalSeconds * (1-progress), distanceLy: lightYears * progress};
}
export function intervalLabel(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  if (seconds < 365.25 * 86400) return `${(seconds / 86400).toFixed(1)} days`;
  const years = seconds / (365.25 * 86400);
  return years >= 1000 ? `~${Math.round(years).toLocaleString('en-US')} years` : `${Number(years.toPrecision(3)).toLocaleString('en-US')} years`;
}
