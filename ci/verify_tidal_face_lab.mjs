import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {lunarFacing}=await import('../assets/js/tidal-facing.js');
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t,a+' != '+b);
for(const angle of [0,45,90,180,270,360]){
 const locked=lunarFacing(angle,true);
 near(locked.facingCosine,1);
 near(locked.relativeDegrees,0);
 near(Math.hypot(locked.markerX,locked.markerY),1);
 const free=lunarFacing(angle,false);
 near(free.facingCosine,Math.cos(2.5*angle*Math.PI/180));
}
assert.ok(lunarFacing(90,false).facingCosine<0);
assert.ok(lunarFacing(144,false).facingCosine>0);
for(const n of [-1,361,NaN])assert.throws(()=>lunarFacing(n,true),RangeError);
const page=readFileSync('pages/moon/tidal-locking/content.html','utf8');
const js=readFileSync('assets/js/tidal-locking.js','utf8');
const built=readFileSync('public/moon/tidal-locking/index.html','utf8');
for(const id of ['lockObserverDiagram','lockFaceMarker','lockFaceAngle','lockFaceReadout']){
 assert.ok(page.includes('id="'+id+'"'),'source missing '+id);
 assert.ok(built.includes('id="'+id+'"'),'built missing '+id);
}
assert.match(js,/lunarFacing/);
assert.match(js,/renderer\.render\(scene,camera\)/);
assert.doesNotMatch(js,/animateLoop\(/);
assert.match(built,/rel="canonical"/);
console.log('TIDAL_FACE_LAB_TDD_PASS locked facing invariant, not-locked contrast, SVG evidence');
