#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tideOceanRadius,tideObserverContrast} from '../assets/js/tide-cinema-math.js';
import {tideResultant} from '../assets/js/tide-model.js';
const src=p=>readFileSync(p,'utf8');
const page=src('pages/moon/tides/content.html');
const built=src('public/moon/tides/index.html');
const ui=src('assets/js/tides.js'),engine=src('assets/js/tide-cinema.js'),css=src('assets/css/style.css');
for(const id of ['tideCinemaExperience','tideCinemaActivate','tideCinemaStage','tideCinemaCanvas','tideCinemaControls','tideCinemaAngle','tideCinemaObserver','tideCinemaPlay','tideCinemaReset','tideCinemaStatus']){
 assert.match(page,new RegExp(`id="${id}"`));assert.match(built,new RegExp(`id="${id}"`));
}
// Tidal quadrupole produces near/far symmetric high directions; rigid Earth radius=1.
assert.ok(tideOceanRadius(1,0,0,0)>tideOceanRadius(0,1,0,0));
assert.ok(tideOceanRadius(-1,0,0,0)>tideOceanRadius(0,-1,0,0));
assert.ok(Math.abs(tideOceanRadius(1,0,0,0)-tideOceanRadius(-1,0,0,0))<1e-12);
assert.ok(tideOceanRadius(0,1,0,90)>tideOceanRadius(1,0,0,90));
assert.ok(tideOceanRadius(1,0,0,90)>1);
for(const degree of [0,15,45,75,90]){
 const c=tideObserverContrast(degree,degree);
 assert.ok(c.relative>=0&&c.relative<=1);
 assert.ok(c.minimum>1,'exaggerated ocean shell must remain outside rigid Earth');
}
assert.ok(tideObserverContrast(0,0).relative>.99);
assert.ok(tideObserverContrast(90,0).relative<.01);
assert.equal(Math.round(tideResultant(0).percent),100);
assert.equal(Math.round(tideResultant(90).percent),33);
assert.throws(()=>tideOceanRadius(1,0,0,-1),RangeError);
assert.throws(()=>tideOceanRadius(0,0,0,30),RangeError);
assert.match(ui,/await import\('\.\/tide-cinema\.js'\)/);
assert.match(ui,/tide3DEngine\?\.setAngle\(angle\)/);
assert.match(ui,/tide3DObserver\.addEventListener\('input'/);
assert.match(ui,/const v=Number\(tide3DObserver\.value\);stop3DRotation\(\)/);
assert.match(engine,/tideOceanRadius\(x,y,z,angle\)/);
assert.match(engine,/waterGeo\.computeVertexNormals\(\)/);
assert.match(engine,/moon\.position\.set\(4\.1\*Math\.cos/);
assert.match(engine,/Earth is rigid/);
assert.match(engine,/new URL\('\.\.\/images\/planet-earth-nasa\.webp',import\.meta\.url\)/);
assert.match(engine,/Math\.min\(window\.devicePixelRatio\|\|1,coarse\?1\.25:1\.75\)/);
assert.match(engine,/pointercancel/);
assert.match(engine,/reduced\.matches/);
assert.match(css,/\.tide-cinema-stage canvas\{display:block;width:100%;height:100%;cursor:grab;touch-action:none/);
assert.match(built,/not real seawater oscillations or surface waves/);
assert.match(built,/including both near and far sides/);
assert.match(built,/rel="canonical"/);
assert.match(built,/type="application\/ld\+json"/);
console.log('TIDE_CINEMA_NEAR_FAR_WATER_SHELL_AND_OBSERVER_PHYSICS_PASS');
