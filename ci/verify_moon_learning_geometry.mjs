#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = file => readFileSync(file,'utf8');
const {moonModelAtDegrees, MOON_MODEL_ORBIT_RADIUS, phaseLabelAtDegrees, angleForOrbitPosition} = await import('../assets/js/moon-geometry.js');
const tol = (got,want,reason,epsilon=.000001) =>
  assert.ok(Math.abs(got-want)<=epsilon,reason+': got '+got+', expected '+want);
for (const [angle,fraction] of [
  [0,0],[45,(1-Math.SQRT1_2)/2],[90,.5],[135,(1+Math.SQRT1_2)/2],
  [180,1],[225,(1+Math.SQRT1_2)/2],[270,.5],[315,(1-Math.SQRT1_2)/2],[360,0]
]) {
  const m=moonModelAtDegrees(angle);
  tol(Math.hypot(m.position.x,m.position.z),MOON_MODEL_ORBIT_RADIUS,'orbit radius at '+angle);
  tol(m.illuminatedFraction,fraction,'lit disk at '+angle);
  tol(m.phaseAgeDays,29.53059*angle/360,'phase day at '+angle);
  const facing={x:Math.cos(m.moonRotationY),z:-Math.sin(m.moonRotationY)};
  tol(facing.x,-m.position.x/MOON_MODEL_ORBIT_RADIUS,'near-side X at '+angle);
  tol(facing.z,-m.position.z/MOON_MODEL_ORBIT_RADIUS,'near-side Z at '+angle);
}
for (const [angle, label] of [
  [0,'New Moon'],[15,'Waxing Crescent'],[90,'First Quarter'],
  [110,'Waxing Gibbous'],[180,'Full Moon'],[235,'Waning Gibbous'],
  [270,'Last Quarter'],[325,'Waning Crescent'],[360,'New Moon']
]) {
  assert.equal(phaseLabelAtDegrees(angle),label,'phase name at '+angle);
  const pos=moonModelAtDegrees(angle).position;
  const inverse=angleForOrbitPosition(pos.x,pos.z);
  tol(inverse,angle===360?0:angle,'click-to-orbit angle at '+angle,.000001);
}
for(const invalid of [-1,361,NaN,Infinity]){
  assert.throws(()=>moonModelAtDegrees(invalid),RangeError);
}
const source=read('assets/js/moon-phases.js');
assert.match(source,/moon\.rotation\.y\s*=\s*model\.moonRotationY/);
assert.match(source,/enableKeyboard:\s*false/,'Decorative canvas is not a duplicate focus target');
assert.match(source,/moon\.position\.set\(model\.position\.x,\s*0,\s*model\.position\.z\)/);
assert.match(source,/renderer\.render\(scene,\s*camera\)/);
assert.doesNotMatch(source,/earth\.rotation\.y\s*\+=/,'No perpetual decorative Earth spin');
assert.doesNotMatch(source,/animateLoop\(/,'No unconditional 60 fps rendering in a learner diagram');
assert.match(source,/prefers-reduced-motion/);
assert.match(source,/visibilitychange/);
assert.match(source,/requestAnimationFrame/);
assert.match(source,/setPointerCapture/,'Canvas should support direct Moon orbit dragging');
assert.match(source,/angleForOrbitPosition/);
assert.match(source,/setPlayState\(false\)/);
assert.match(source,/traveledDegrees >= 360/,'User-initiated one-cycle motion must actually stop');
const html=read('pages/moon/phases/content.html');
const built=read('public/moon/phases/index.html');
for(const fragment of ['id="moonPlay"','id="moonAngle"','id="phaseMetrics"','class="phase-sunlight-guide"',
                       'aria-live="polite"','id="moonCerPrediction"','id="cerSetupTitle"']){
  assert.ok(html.includes(fragment),'Missing model UI: '+fragment);
}
assert.match(html,/not to scale/i);
assert.match(html,/Sunlight[\s\S]{0,80}→/i);
for(const phaseAngle of [45,135,225,315]){
  assert.match(html,new RegExp('data-moon-angle="'+phaseAngle+'"'),'in-between phase selectable');
}
assert.match(html,/<details class="phase-intermediate"[^>]*id="moonIntermediatePhases"/);
assert.match(html,/id="moonPlay"[^>]*aria-pressed="false"/);
assert.match(html,/id="moonMotionNote"/);
assert.match(html,/id="cerSetupRayToBall"/,'Lamp should trace light to ball');
assert.match(html,/id="cerSetupMobileRayToBall"/,'Mobile SVG must also show a ray to the ball');
assert.match(html,/id="cerSetupObserverGaze"/,'Observer gaze must be marked');
assert.doesNotMatch(html,/M384 90 l-10 -2 l6 9/,'Original arrow missed the Moon');
assert.match(html,/nearby lamp[\s\S]*approximate/i);
assert.match(built,/id="moonPlay"/);
assert.match(built,/rel="canonical"/);
assert.match(built,/application\/ld\+json/);
console.log('MOON_LEARNER_GEOMETRY_GATE_PASS');
