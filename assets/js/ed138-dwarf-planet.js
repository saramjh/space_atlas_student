// Brightness-to-diameter inference from Holman et al. 2026 (arXiv:2610.38693).
// This interaction holds the measured absolute magnitude fixed. It DOES NOT
// measure ED138's albedo, size, shape, orbit or surface appearance.
export const ED138_HV = 3.19;
export const PLUTO_DIAMETER_KM = 2377;
export function inferredDiameterKm(albedo, absoluteMagnitude = ED138_HV) {
  if (!Number.isFinite(albedo) || albedo <= 0 || albedo > 1 || !Number.isFinite(absoluteMagnitude)) {
    throw new RangeError('finite absolute magnitude and geometric albedo in (0,1] required');
  }
  return 1329 * Math.pow(10, -absoluteMagnitude / 5) / Math.sqrt(albedo);
}
export const ed138SizeForPercent = percent => inferredDiameterKm(percent / 100);

function initialize() {
 const lab = document.querySelector('#ed138AlbedoLab');
 if (!lab) return;
 const slider = lab.querySelector('#ed138Albedo');
 const out = lab.querySelector('#ed138AlbedoValue');
 const diameter = lab.querySelector('#ed138Diameter');
 const bar = lab.querySelector('#ed138SelectedBar');
 const chartText = lab.querySelector('#ed138ChartEstimate');
 const explanation = lab.querySelector('#ed138AlbedoHelp');
 const presets = [...lab.querySelectorAll('[data-ed138-albedo]')];
 function render() {
   const pct = Number(slider.value);
   const km = Math.round(ed138SizeForPercent(pct));
   const px = 582 * (km / PLUTO_DIAMETER_KM);
   out.textContent = `${pct}%`;
   diameter.textContent = `≈ ${km.toLocaleString('en-US')} km`;
   diameter.nextElementSibling.textContent = `estimated diameter · ${pct}% reflectivity`;
   bar.setAttribute('width', px.toFixed(2));
   chartText.setAttribute('x', Math.min(750, 185 + px + 11).toFixed(2));
   chartText.textContent = `${km.toLocaleString('en-US')} km`;
   explanation.textContent = `At ${pct}% assumed reflectivity, Hᵥ = 3.19 implies about ${km.toLocaleString('en-US')} km in diameter. Lower reflectivity requires a larger object to produce the same brightness. The actual albedo and diameter remain unconfirmed.`;
   presets.forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.ed138Albedo) === pct)));
 }
 slider.addEventListener('input', render);
 presets.forEach(b => b.addEventListener('click', () => { slider.value = b.dataset.ed138Albedo; render(); }));
 render();
}
if (typeof document !== 'undefined') initialize();
