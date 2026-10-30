#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {relativeSurfaceGravity,probeRadialAcceleration,initialProbeState,integrateProbeFall} from '../assets/js/gravity-probe-math.js';
const src=p=>readFileSync(p,'utf8');
const page=src('pages/solar-system/gravity-comparison/content.html');
const built=src('public/solar-system/gravity-comparison/index.html');
const controller=src('assets/js/gravity-comparison.js');
const scene=src('assets/js/gravity-immersive.js');
assert.equal(relativeSurfaceGravity(1,1),1);
assert.equal(relativeSurfaceGravity(4,1),4);
assert.equal(relativeSurfaceGravity(1,2),.25);
assert.ok(Math.abs(relativeSurfaceGravity(317.8,11.21)-2.5284)<.01);
assert.ok(Math.abs(probeRadialAcceleration(1,1,1)-.25)<1e-12);
for(const x of [[0,1],[-1,1],[1,0],[Infinity,1],[1,NaN]])assert.throws(()=>relativeSurfaceGravity(...x),RangeError);
for(const x of [-1,NaN])assert.throws(()=>probeRadialAcceleration(1,1,x),RangeError);
let state=initialProbeState(1),stepCount=0;
while(!state.landed&&stepCount<4000){const next=integrateProbeFall(state,1,1,.004);assert.ok(next.radialDistance<=state.radialDistance);assert.ok(next.inwardSpeed>=state.inwardSpeed);state=next;stepCount++;}
assert.ok(state.landed&&stepCount>20&&stepCount<4000,'probe should land under gravity');
function landingSteps(m,r){let s=initialProbeState(r),n=0;while(!s.landed&&n<10000){s=integrateProbeFall(s,m,r,.002);n++;}return n;}
assert.ok(landingSteps(4,1)<landingSteps(1,1),'higher mass falls faster');
assert.ok(landingSteps(1,2)>landingSteps(1,1),'larger radius at fixed mass lowers gravity');
assert.throws(()=>integrateProbeFall(initialProbeState(1),1,1,.06),RangeError);
for(const id of ['gravityImmersive','gravity3DActivate','gravity3DCanvas','gravity3DStage','gravityProbePlay','gravityProbeReset','gravity3DZoomIn','gravity3DZoomOut','gravity3DRotate','gravity3DStatus']){
 assert.match(page,new RegExp('id="'+id+'"'));
 assert.match(built,new RegExp('id="'+id+'"'));
}
assert.match(controller,/await import\('\.\/gravity-immersive\.js'\)/);
assert.match(controller,/immersiveEngine\.setParameters\(mass,radius\)/);
assert.match(controller,/createGravityImmersive/);
assert.match(controller,/probePlay\.disabled=window\.matchMedia/);
assert.match(scene,/integrateProbeFall\(fall,mass,radius,step\)/);
assert.match(scene,/EarthRadius|not real-time|deliberately compressed/);
assert.match(scene,/renderer\.setPixelRatio\(tier\.pixelRatio\)/);
assert.match(scene,/camera\.fov=w<h\?54:44/);
assert.match(scene,/wheel',wheel,\{passive:false\}/);
assert.match(scene,/pointercancel/);
assert.match(scene,/const targetX=-1\.5/);
assert.match(scene,/const bodyGlow=new THREE\.Mesh/);
assert.match(scene,/Math\.floor\(elapsed\*4\)/);
assert.match(built,/hypothetical non-rotating sphere/);
assert.match(built,/no solid surface to land on/);
assert.match(built,/id="gravityCauseDiagram"/);
assert.match(built,/rel="canonical"/);
assert.match(built,/type="application\/ld\+json"/);
assert.match(src('assets/css/style.css'),/\.gravity-mechanism\{overflow-x:clip\}/);
assert.match(page,/class="gravity-experiment-layout"/);
console.log('GRAVITY_IMMERSIVE_RELATIVE_RADIUS_NBODY_PROBE_REGRESSION_PASS');
