import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {launchOrbitPrediction}=await import('../assets/js/gravity-reference.js');
const near=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,a+' != '+b);
const circular=launchOrbitPrediction(2.6);
near(circular.circularSpeed,2.6);
near(circular.escapeSpeed,2.6*Math.SQRT2);
near(circular.eccentricity,0);
assert.equal(circular.classification,'near-circular');
const slow=launchOrbitPrediction(.5);
assert.equal(slow.classification,'collision');assert.ok(slow.periapsisRadius<18);
const mid=launchOrbitPrediction(3.0);
assert.equal(mid.classification,'bound-ellipse');assert.ok(mid.periapsisRadius>=18);
const fast=launchOrbitPrediction(4.5);
assert.equal(fast.classification,'unbound');
for(const invalid of [-1,NaN,10])assert.throws(()=>launchOrbitPrediction(invalid),RangeError);
const page=readFileSync('pages/solar-system/gravity-and-orbits/content.html','utf8');
const js=readFileSync('assets/js/gravity-and-orbits.js','utf8');
const built=readFileSync('public/solar-system/gravity-and-orbits/index.html','utf8');
for(const id of ['orbitVectorsToggle','orbitVectorLegend','orbitPrediction']){
 assert.ok(page.includes('id="'+id+'"'),'missing '+id);assert.ok(built.includes('id="'+id+'"'),'built '+id);
}
assert.match(js,/launchOrbitPrediction/);
assert.match(js,/drawArrow/);
assert.match(js,/orbitVectorsToggle/);
assert.match(built,/rel="canonical"/);
console.log('GRAVITY_VECTOR_LAB_TDD_PASS model energy/classification and visible vectors');
