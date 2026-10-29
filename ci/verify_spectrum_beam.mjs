#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(p,'utf8');
const page=src('pages/astronomy/electromagnetic-spectrum/content.html');
const built=src('public/astronomy/electromagnetic-spectrum/index.html');
const js=src('assets/js/electromagnetic-spectrum.js');
const css=src('assets/css/style.css');
for(const id of ['spectrumPhotonBeam','spectrumBeamBand','spectrumBeamMeaning']){
 assert.match(page,new RegExp(`id="${id}"`));
 assert.match(built,new RegExp(`id="${id}"`));
}
assert.match(js,/const visibleHue = Math\.max\(0, Math\.min\(270, \(7e-7 - meters\) \/ 3e-7 \* 270\)\)/);
assert.match(js,/band\.name === 'Visible' \? visibleHue : falseColorHue\[band\.name\]/);
assert.match(js,/beam\.classList\.add\('beam-running'\)/);
assert.match(js,/beam\.classList\.remove\('beam-running'\)/);
assert.match(js,/beamMeaning\.textContent = band\.name === 'Visible'/);
assert.match(built,/invisible radio, microwave, infrared, ultraviolet, X-rays and gamma rays are shown in assigned false colors/);
assert.match(built,/not measured intensity, photon density or physical wave cycles/);
assert.match(css,/\.spectrum-beam\.beam-running \.spectrum-beam-core/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\).*?\.spectrum-beam \*\{animation:none!important/);
assert.match(css,/\.spectrum-beam\{position:relative;isolation:isolate/);
assert.match(built,/rel="canonical"/);
assert.match(built,/type="application\/ld\+json"/);
for(const [wl,hue] of [[700e-9,0],[600e-9,90],[500e-9,180],[400e-9,270]]){
 const actual=Math.round(Math.max(0,Math.min(270,(7e-7-wl)/3e-7*270)));
 assert.ok(Math.abs(actual-hue)<1,`${wl} color interpolation incorrect`);
}
console.log('SPECTRUM_PARAMETER_DRIVEN_RAYS_FALSE_COLOR_MOTION_REGRESSION_PASS');
