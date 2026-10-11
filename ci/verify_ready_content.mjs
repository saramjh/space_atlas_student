#!/usr/bin/env node
// Static-first learner controls must never look actionable before JavaScript is ready.
// Cross-check both server-rendered reference content and late module activation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html = path => readFileSync('public/'+path+'/index.html','utf8');
const js = name => readFileSync('assets/js/'+name+'.js','utf8');
const common = page => {
  assert.match(page, /rel="canonical"/);
  assert.match(page, /type="application\/ld\+json"/);
  assert.match(page, /<h1>[^<]+<\/h1>/);
};

const light=html('universe/light-year');
common(light);
assert.match(light,/id="lyReadout" role="status" aria-live="polite"/);
assert.match(light,/8\.3 minutes/);
assert.match(light,/id="lyInitNote" role="status"/);
const lightButtons=[...light.matchAll(/<button[^>]+data-ly="[^"]+"[^>]*>/g)].map(m=>m[0]);
assert.equal(lightButtons.length,8);
assert.equal(lightButtons.filter(b=>b.includes(' disabled')).length,8);
assert.equal(lightButtons.filter(b=>b.includes('aria-pressed="true"')).length,1);
assert.match(js('light-year'),/button\.disabled = false/);
assert.match(js('light-year'),/querySelector\('#lyInitNote'\)\.hidden = true/);
assert.match(js('light-year'),/setAttribute\('aria-pressed', 'true'\)/);

const scale=html('universe/scale');
common(scale);
assert.match(scale,/id="zoomStage" aria-live="polite"/);
assert.match(scale,/Step 1 of 8/);
assert.match(scale,/~1\.7 m tall/);
assert.match(scale,/id="zoomNext" disabled/);
assert.match(scale,/id="zoomPrev" disabled/);
assert.equal((scale.match(/id="zoomDots"/g)||[]).length,1);
assert.equal((scale.match(/<tbody>[\s\S]*?<\/tbody>/g)||[]).length>0,true);
assert.match(scale,/id="zoomInitNote" role="status"/);
assert.match(js('universe-scale'),/dots\.children\.length !== STEPS\.length/);
assert.match(js('universe-scale'),/querySelector\('#zoomInitNote'\)\.hidden = true/);
assert.match(js('universe-scale'),/nextBtn\.disabled = index === STEPS\.length - 1/);

const planets=html('solar-system/planet-size-comparison');
common(planets);
for(const [id,n] of [['planetA',2],['planetB',4]]){
  const select=planets.match(new RegExp('<select id="'+id+'"[^>]*disabled>([\\s\\S]*?)<\\/select>'));
  assert.ok(select,id+' should be readable and disabled until the model is ready');
  assert.equal((select[1].match(/<option/g)||[]).length,8);
  const chosen=select[1].match(new RegExp('<option value="'+n+'" selected>'));
  assert.ok(chosen,id+' should identify the same default planet as the static fact card');
}
assert.equal((planets.match(/data-planet-a="\d+" data-planet-b="\d+" disabled/g)||[]).length,4);
assert.match(planets,/id="compareInitNote" role="status"/);
assert.match(planets,/11\.21×/);
assert.match(planets,/1321×/);
assert.match(planets,/not literal sphere packing/);
const planetCode=js('planet-size-comparison');
assert.match(planetCode,/if \(!selA\.options\?\.length \|\| !selB\.options\?\.length\)/);
assert.match(planetCode,/selA\.disabled = false/);
assert.match(planetCode,/selB\.disabled = false/);
assert.match(planetCode,/querySelector\('#compareInitNote'\)\.hidden = true/);

const styles=readFileSync('assets/css/style.css','utf8');
assert.match(styles,/\.interaction-init-note\[hidden\]\{display:none\}/);
console.log('Static-first readiness PASS: light-year, 8-step universe, eight-option planet comparison; all states/canonical intact.');
