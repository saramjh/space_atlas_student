#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {WORLDS,PERSON_MASS_KG,TAKEOFF_MPS,predictJump,weightNewtons,startJump,advanceJump,worldById} from '../assets/js/gravity-lab-physics.js';
assert.equal(WORLDS.length,9);
assert.equal(new Set(WORLDS.map(w=>w.id)).size,9);
assert.equal(worldById('moon').g,1.6);
assert.equal(worldById('jupiter').kind,'gas');
assert.ok(predictJump(1.6).height>predictJump(9.8).height*5);
assert.ok(predictJump(23.1).hang<predictJump(9.8).hang);
assert.equal(weightNewtons(9.8),PERSON_MASS_KG*9.8);
assert.throws(()=>predictJump(0),RangeError);
for(const w of WORLDS){
 const predicted=predictJump(w.g);let state=startJump(),step=0;
 while(state.airborne&&step++<1500){state=advanceJump(state,1/120,w.g);}
 assert.ok(!state.airborne,'lands '+w.id);
 assert.ok(Math.abs(state.elapsed-predicted.hang)<1e-12,'time '+w.id);
 assert.ok(Math.abs(state.peak-predicted.height)<1e-12,'height '+w.id);
}
const doc='pages/solar-system/gravity-lab/content.html',js='assets/js/gravity-lab.js';
assert.ok(existsSync(doc),'new standalone page exists');
const html=readFileSync(doc,'utf8'),ctrl=readFileSync(js,'utf8');
for(const id of ['gravityLabStart','gravityLabCanvas','gravityLabWorld','gravityLabJump','gravityLabPause','gravityLabJoystick','gravityLabLook','gravityLabHang','gravityLabHeight']){
 assert.ok(html.includes('id="'+id+'"'),'missing semantic control '+id);
}
assert.match(html,/nssdc.gsfc.nasa.gov\/planetary\/factsheet/);
assert.match(html,/artificial|fictional/i);
assert.match(ctrl,/import\('three'\)/);
assert.match(ctrl,/prefers-reduced-motion/);
assert.match(ctrl,/visibilitychange/);
assert.match(ctrl,/requestAnimationFrame/);
assert.match(ctrl,/pointerdown/);
assert.match(ctrl,/keydown/);
assert.match(ctrl,/TAKEOFF_MPS/);
assert.match(ctrl,/const VISUAL_PROVENANCE=/);
assert.match(ctrl,/applyBackdrop\(tex\)/);
assert.match(ctrl,/yaw-=dx/);
assert.match(ctrl,/touch\.x=clamp/);
assert.match(ctrl,/Math\.min\(devicePixelRatio\|\|1,lowPower\?1\.15:1\.65\)/);
assert.match(ctrl,/if\(document\.hidden\)setPause\(true\)/);
assert.match(html,/id="gravityLabImageSource"/);
assert.match(html,/no walkable solid surface/i);
assert.match(html,/v₀² \/ \(2g\)/);
const images=['gravity-mars-jezero','gravity-moon-apollo','gravity-reference-mercury',
'gravity-reference-venus','gravity-reference-jupiter','gravity-reference-saturn','gravity-reference-uranus'];
for(const name of images){
 const filename='assets/images/'+name+'.webp';
 assert.ok(existsSync(filename),'Required sourced image '+filename);
 const buf=readFileSync(filename);
 assert.ok(buf.length>=4500&&buf.length<750000,'Compressed real image '+name);
 assert.equal(buf.subarray(8,12).toString(),'WEBP','WebP signature '+name);
}

const meta=JSON.parse(readFileSync('pages/solar-system/gravity-lab/meta.json','utf8'));
assert.equal(meta.path,'/solar-system/gravity-lab/');
console.log('GRAVITY_LAB_PHYSICS_NAV_MODEL_PASS');
