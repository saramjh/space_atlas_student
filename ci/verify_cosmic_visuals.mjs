#!/usr/bin/env node
// Quantitative visual diagrams: real logarithmic positions and photon travel.
// Distinguish source-to-source log spacing from a NORMALIZED individual light trip.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Node 18/20 CI does not infer ESM for browser .js files outside a package.json.
// Load this dependency-free pure source as ESM without changing the site's module conventions.
const pureSource = readFileSync('assets/js/scale-visual-math.js', 'utf8');
const {COSMIC_METRES, COSMIC_DOMAIN, LIGHT_DOMAIN, logPosition, cosmicJump, photonProgress, intervalLabel, LIGHT_YEAR_METRES} = await import('data:text/javascript;base64,' + Buffer.from(pureSource).toString('base64'));

const near=(a,b,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<=tolerance,`expected ${a}≈${b}`);
assert.equal(COSMIC_METRES.length,8);
assert.equal(COSMIC_DOMAIN.max-COSMIC_DOMAIN.min,27);
near(LIGHT_YEAR_METRES,9460730472580800);
near(logPosition(1,0,27),0);
near(logPosition(1e27,0,27),1);
near(logPosition(1e10,0,27)-logPosition(1e9,0,27),1/27);
near(logPosition(1e-5,-8,7)-logPosition(1e-6,-8,7),1/15);
for(let i=1;i<8;i++) {
 assert.ok(COSMIC_METRES[i]>COSMIC_METRES[i-1]);
 assert.ok(logPosition(COSMIC_METRES[i],0,27)>logPosition(COSMIC_METRES[i-1],0,27));
 near(cosmicJump(i),COSMIC_METRES[i]/COSMIC_METRES[i-1],Math.max(1e-8,cosmicJump(i)*1e-10));
}
near(cosmicJump(1),7495294.117647059,1e-6);
near(cosmicJump(2),384400/12742,1e-10);
near(cosmicJump(7),9300);
const comparedJumpFactors = cosmicJump(4) / cosmicJump(2);
assert.ok(comparedJumpFactors>140 && comparedJumpFactors<160, `expected around 150×, got ${comparedJumpFactors}`);
near(photonProgress(4.25,50).elapsedSeconds,2.125*365.25*86400);
near(photonProgress(4.25,50).remainingSeconds,2.125*365.25*86400);
near(photonProgress(4.25,0).distanceLy,0);
near(photonProgress(4.25,100).distanceLy,4.25);
near(photonProgress(.0000158,100).elapsedSeconds/60,8.310168);
assert.equal(intervalLabel(0),'0.0 seconds');

const scale=readFileSync('public/universe/scale/index.html','utf8');
const light=readFileSync('public/universe/light-year/index.html','utf8');
const scaleJS=readFileSync('assets/js/universe-scale.js','utf8');
const lightJS=readFileSync('assets/js/light-year.js','utf8');
const css=readFileSync('assets/css/style.css','utf8');
for(const [slug,html] of [['scale',scale],['light-year',light]]) {
 assert.match(html,/rel="canonical"/);
 assert.match(html,/type="application\/ld\+json"/);
 assert.match(html,/<h1>[^<]+<\/h1>/);
 assert.match(html,/logarithmic scale/i,slug);
 assert.match(html,/<noscript>/);
}
assert.match(scale,/id="cosmicRuler"/);
assert.match(scale,/id="cosmicRulerSelection"/);
assert.match(scale,/id="cosmicJump" role="status"/);
assert.equal((scale.match(/data-cosmic-step="[0-7]"/g)||[]).length,8);
assert.equal((scale.match(/data-cosmic-step="[0-7]"[^>]+disabled/g)||[]).length,8);
assert.match(scaleJS,/cosmicJump\(step\)/);
assert.match(scaleJS,/Hundreds of times bigger', correct: true/);
assert.doesNotMatch(scaleJS,/Thousands of times bigger', correct: true/);
assert.match(scaleJS,/chosenLine.setAttribute\('x1', x\)/);
assert.match(scaleJS,/button.setAttribute\('aria-pressed', String\(i === index\)\)/);
assert.match(scaleJS,/button.disabled = false/);
assert.match(light,/id="lyDistanceRuler"/);
assert.equal((light.match(/data-ly-point=/g)||[]).length,8);
assert.match(light,/id="lyPhotonSlider" type="range" min="0" max="100"/);
assert.match(light,/id="lyPhotonDiagram"/);
assert.match(light,/not a distance scale between different objects/i);
assert.match(lightJS,/updateVisuals\(Number\(btn.dataset.ly\), btn.textContent\)/);
assert.match(lightJS,/photonProgress\(selectedLy, percent\)/);
assert.match(lightJS,/querySelector\('#lyPhotonMarker'\).setAttribute\('cx', x\)/);
assert.match(lightJS,/photonSlider.disabled = false/);
assert.match(css,/\.cosmic-ruler-viewport[^\n]*overflow-x:auto/);
assert.match(css,/\.ly-distance-scroll/);
console.log('Explanatory cosmic diagrams PASS: 27-decade ruler, 8 real sizes, source light-year logarithmic axis, photon 0–100% travel math, interaction and static SEO.');
