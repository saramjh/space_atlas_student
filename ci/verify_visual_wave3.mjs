import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(p,'utf8');
const routes=[
 ['moon/tides','tideResultantBar','tideResultantValue','tide-model.js','tides.js'],
 ['universe/light-year','lyPlay','lyPhotonSlider','light-year.js','light-year.js'],
 ['stars/life-cycle','lifePlay','lifeStageCount','star-life-cycle.js','star-life-cycle.js'],
 ['astronomy/electromagnetic-spectrum','spectrumReferenceSet','spectrumComparison','electromagnetic-spectrum.js','electromagnetic-spectrum.js'],
 ['galaxies/types','galaxy3DActivate','galaxy3DCanvas','galaxy-types.js','galaxy-types.js'],
];
for(const [route,id1,id2,model,js] of routes){
 const html=src('pages/'+route+'/content.html');
 const publicHTML=src('public/'+route+'/index.html');
 const code=src('assets/js/'+js);
 for(const id of [id1,id2]){
  assert.match(html,new RegExp('id="'+id+'"'),'source '+route+' missing '+id);
  assert.match(publicHTML,new RegExp('id="'+id+'"'),'build '+route+' missing '+id);
 }
 assert.match(publicHTML,/rel="canonical"/);
 assert.match(code,/addEventListener|onclick/);
}
const {tideResultant}=await import('../assets/js/tide-model.js');
assert.equal(Math.round(tideResultant(0).percent),100);
assert.equal(Math.round(tideResultant(90).percent),33);
assert.equal(Math.round(tideResultant(45).percent),75);
assert.ok(Math.abs(tideResultant(45).majorAxisDeg-31.7175)<.1);
for(const invalid of [-1,91,NaN]) assert.throws(()=>tideResultant(invalid),RangeError);
const light=src('assets/js/light-year.js');
assert.match(light,/requestAnimationFrame/);
assert.match(light,/prefers-reduced-motion/);
assert.match(light,/visibilitychange/);
assert.match(light,/playing/);
const stars=src('assets/js/star-life-cycle.js');
assert.match(stars,/prefers-reduced-motion/);
assert.match(stars,/setInterval|requestAnimationFrame/);
const spectrum=src('assets/js/electromagnetic-spectrum.js');
assert.match(spectrum,/referenceWavelength/);
assert.match(spectrum,/Stored reference/);
const css=src('assets/css/style.css');
assert.match(css,/\.tide-force-track>span\.sun\{[^}]*position:static;transform:none;border-radius:0;box-shadow:none/,
  'Moon tide solar bar must override decorative global .sun');
assert.match(css,/\.life-navigation button\{font-size:14px;min-height:44px/,
  'Life cycle navigation needs readable 44px-high controls');
assert.match(src('assets/js/galaxy-types.js'),/galaxy3DCanvas.hidden=!enabled/,
  '3D model must keep a 2D fallback');

const galaxy=src('assets/js/galaxy-types.js');
assert.match(galaxy,/import\('\.\/galaxy-3d\.js'\)/);
assert.match(galaxy,/prefers-reduced-motion/);
assert.match(src('assets/js/galaxy-3d.js'),/import\('three'\)/);
console.log('WAVE3_CAUSAL_VISUAL_TDD_PASS: tides/light-year/stars/spectrum/3D-galaxy');
