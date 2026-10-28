#!/usr/bin/env node
// Student hypothesis vs fixed scientific observation must be distinct states.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = path => readFileSync(path, 'utf8');
const page = source('pages/moon/phases/content.html');
const built = source('public/moon/phases/index.html');
const css = source('assets/css/style.css');
const js = source('assets/js/moon-cer.js');
const { evaluateMoonPrediction } = await import('../assets/js/moon-cer.js');

for (const [choice,percent,correct] of [
  ['quarter',25,false],['half',50,true],['full',100,false],
]) {
  const result=evaluateMoonPrediction(choice);
  assert.equal(result.valid,true,choice);
  assert.equal(result.correct,correct,choice);
  assert.equal(result.predictedPercent,percent,choice);
  assert.equal(result.observedPercent,50,'First Quarter cannot change with guess');
  assert.equal(result.angle,90,'actual observation at 90 degrees');
  assert.match(result.feedback,new RegExp(String(percent)+'%'),'choice-specific feedback');
  assert.match(result.feedback,/50%/,'scientific observation');
}
assert.equal(evaluateMoonPrediction(null).valid,false);
assert.equal(evaluateMoonPrediction('invented').valid,false);

for(const fragment of [
  'id="moonCerPredictionPreview"','id="moonCerPredictionVisual"',
  'id="moonCerComparison"', 'id="moonCerActualVisual"',
  'id="moonCerPredictionLabel"','id="moonCerActualLabel"'
]) {
  assert.ok(page.includes(fragment),fragment);
  assert.ok(built.includes(fragment),'built missing '+fragment);
}
assert.match(page,/hidden[^>]*id="moonCerComparison"|id="moonCerComparison"[^>]*hidden/,'answer hidden before learner checks');
assert.match(js,/addEventListener\('change'/,'radio choice must update prediction before Check');
assert.match(js,/comparison.hidden\s*=\s*false/);
assert.match(js,/comparison.hidden\s*=\s*true/,'changing prediction resets previous comparison');
assert.match(js,/cloneNode\(true\)/,'actual selected disc is previewed');
assert.match(page,/Actual First Quarter/,'real model output must be explicitly named');
assert.match(page,/prediction[\s\S]*not the simulator/i,'student should not mistake prediction as scientific model output');
assert.match(css,/\.cer-compare-grid/);
assert.match(css,/\.cer-compare-disc svg\{[^}]*max-width:none/,'cloned choice must not shrink to 34% inside the preview');
assert.match(css,/\[hidden\]/,'browser-owned hidden state should be respected');
assert.match(built,/rel="canonical"/);
assert.match(built,/application\/ld\+json/);
console.log('MOON_CER_PREDICTION_COMPARISON_PASS: 25/50/100 predicted vs actual fixed 50, checked-state reset, accessible static explanation');
