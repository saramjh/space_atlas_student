#!/usr/bin/env node
// Prevent a tidal-locking orbit/satellite being clipped by the vertical FOV
// or the narrower HORIZONTAL FOV of a portrait/mobile WebGL canvas.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {orbitFitDistance} from '../assets/js/orbit-framing.js';

const tiltSin=5/Math.hypot(27,5);
const tiltCos=27/Math.hypot(27,5);
const orbitRadius=9;
const outerRadius=.62+.09;
const tanHalf=Math.tan(44*Math.PI/360);
for(const [width,height] of [[320,420],[390,420],[768,420],[1280,420],[1437,420],[280,500],[390,600],[1440,800]]) {
  const d=orbitFitDistance({width,height});
  assert.ok(d>0 && d<100,'fit should remain within OrbitControls zoom bounds');
  for(let degrees=0;degrees<=360;degrees+=2){
    const a=degrees*Math.PI/180;
    const x=-orbitRadius*Math.cos(a);
    const z=orbitRadius*Math.sin(a);
    const depth=d-z*tiltSin;
    assert.ok(depth>0,'moon must stay in front of camera');
    const boundX=(Math.abs(x)+outerRadius)/(depth*tanHalf*(width/height));
    const boundY=(Math.abs(z*tiltCos)+outerRadius)/(depth*tanHalf);
    assert.ok(boundX<.93 && boundY<.93,
      `orbit outside safe viewport at ${width}x${height}, angle ${degrees}: ${boundX},${boundY}`);
  }
}
const module=readFileSync('assets/js/tidal-locking.js','utf8');
const html=readFileSync('public/moon/tidal-locking/index.html','utf8');
assert.match(module,/maxDistance: 100/);
assert.match(module,/new ResizeObserver\(fitCompleteOrbit\)\.observe\(shell\)/);
assert.match(module,/camera\.aspect = width \/ height/);
assert.match(module,/orbitFitDistance\(\{ width, height, fovDeg: camera\.fov, orbitRadius: ORBIT_RADIUS \}\)/);
assert.match(html,/rel="canonical"/);
assert.match(html,/type="application\/ld\+json"/);
assert.match(html,/id="lockAngle"/);
console.log('Moon tidal-locking camera framing PASS: all orbit angles with satellite margin inside FOV on 8 desktop/mobile canvas sizes; resize and SEO preserved.');
