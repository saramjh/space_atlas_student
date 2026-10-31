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
for(const id of ['gravityLabStart','gravityLabCanvas','gravityLabWorld','gravityLabJump','gravityLabReset','gravityLabJoystick','gravityLabLook','gravityLabHang','gravityLabHeight']){
 assert.ok(html.includes('id="'+id+'"'),'missing semantic control '+id);
}
assert.match(html,/nssdc.gsfc.nasa.gov\/planetary\/factsheet/);
assert.match(html,/artificial|fictional/i);
assert.match(ctrl,/import\('three'\)/);
assert.match(ctrl,/prefers-reduced-motion/);
assert.match(ctrl,/visibilitychange/);
assert.match(ctrl,/requestAnimationFrame/);
assert.match(ctrl,/pointerdown/);
// A multi-touch jump must not depend solely on a synthesized click: another
// finger may be held on the virtual joystick during the entire jump touch.
assert.match(ctrl,/jumpAction\.addEventListener\('pointerdown',e=>/);
assert.match(ctrl,/lastTouchJumpAt=performance\.now\(\)/);
assert.match(ctrl,/jumpAction\.addEventListener\('click',e=>/);
assert.match(ctrl,/e\.pointerType==='touch'/);
assert.match(ctrl,/e\.detail>0.*lastTouchJumpAt<700/);
assert.match(readFileSync('assets/css/style.css','utf8'),/\.gl-game-actions #gravityLabJump\{touch-action:none/);
assert.match(ctrl,/keydown/);
assert.match(ctrl,/TAKEOFF_MPS/);
assert.match(ctrl,/const VISUAL_PROVENANCE=/);
assert.match(ctrl,/applyBackdrop\(tex\)/);
assert.match(ctrl,/yaw-=dx/);
assert.match(ctrl,/touch\.x=clamp/);
assert.match(ctrl,/Math\.min\(devicePixelRatio\|\|1,lowPower\?1\.15:1\.65\)/);
// The simulation is automatically suspended on tab hide and continues from
// the frozen ballistic state after visibility returns. Manual Pause UI is gone.
assert.doesNotMatch(html,/id="gravityLabPause"|>Pause<|>Resume</);
assert.doesNotMatch(ctrl,/gravityLabPause|setPause|\bpaused\b/);
assert.match(ctrl,/if\(document\.hidden\)suspend\(\);else if\(active\)wake\(\)/);
assert.match(ctrl,/function suspend\(\)/);
assert.match(ctrl,/last=0;keys\.clear\(\)/);
assert.doesNotMatch(ctrl,/function suspend\(\)[\s\S]{0,260}air=grounded\(\)/);
assert.match(ctrl,/if\(!active\|\|document\.hidden\|\|air\.airborne\)return/);

assert.match(html,/id="gravityLabImageSource"/);
assert.match(html,/no walkable solid surface/i);
assert.match(html,/v₀² \/ \(2g\)/);
// The image-led picker must remain a real, accessible control, not a
// decorative poster or a second source of truth for gravity calculations.
for(const id of ['gravityLabWorldRail','gravityLabWorldFeature','gravityLabWorldImage',
  'gravityLabWorldName','gravityLabWorldKind','gravityLabRatio','gravityLabWorldIndex',
  'gravityLabWorldPrediction','gravityLabWorldPrev','gravityLabWorldNext','gravityLabForceBar']){
 assert.ok(html.includes('id="'+id+'"'),'Missing visual world selector '+id);
}
assert.match(ctrl,/function buildWorldPicker\(\)/);
assert.match(ctrl,/function syncWorldPicker\(\)/);
assert.match(ctrl,/choice\.dispatchEvent\(new Event\('change'/);
assert.match(ctrl,/rail\.addEventListener\('keydown'/);
assert.match(ctrl,/aria-pressed/);
assert.match(ctrl,/scrollTo\(/);
assert.match(ctrl,/predictJump\(w\.g\)/);
assert.match(ctrl,/prefers-reduced-motion/);
assert.match(html,/IMAGE NOT TO SCALE/);
assert.match(html,/id="gravityLabSelectorCredit"/);
assert.match(ctrl,/thumbnailCredit\[w\.id\]/);

assert.match(html,/SWIPE OR USE THE ARROWS/);
for (const id of ['earth','moon','mars','mercury','venus','jupiter','saturn','uranus','neptune']){
 const img='assets/images/gravity-choice-'+id+'.webp';
 assert.ok(existsSync(img),'NASA-source-backed picker thumbnail '+id);
 const bytes=readFileSync(img);
 assert.ok(bytes.length>800&&bytes.length<100000,'Compact offline thumbnail '+id);
 assert.equal(bytes.subarray(8,12).toString(),'WEBP');
}

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
