#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderDeviceTier} from '../assets/js/render-device-tier.js';
const phone=renderDeviceTier({width:390,dpr:3,coarse:false});
assert.equal(phone.constrained,true,'portrait width must detect low-tier even if pointer query is desktop');
assert.equal(phone.pixelRatio,1.25);
assert.equal(phone.antialias,false);
const phoneCoarse=renderDeviceTier({width:844,dpr:3,coarse:true});
assert.equal(phoneCoarse.pixelRatio,1.25);
const desktop=renderDeviceTier({width:1280,dpr:2,coarse:false});
assert.equal(desktop.constrained,false);
assert.equal(desktop.pixelRatio,1.75);
assert.equal(desktop.antialias,true);
const laptopLowRam=renderDeviceTier({width:1400,dpr:2,coarse:false,memoryGB:4});
assert.equal(laptopLowRam.pixelRatio,1.25);
assert.equal(renderDeviceTier({width:390,dpr:1,coarse:true}).pixelRatio,1);
assert.throws(()=>renderDeviceTier({width:0,dpr:1,coarse:false}),RangeError);
for(const file of ['assets/js/gravity-immersive.js','assets/js/tide-cinema.js','assets/js/black-holes.js']){
 const js=readFileSync(file,'utf8');
 assert.match(js,/import \{currentRenderTier\} from '\.\/render-device-tier\.js'/);
 assert.match(js,/renderer\.setPixelRatio\(tier\.pixelRatio\)/);
 assert.match(js,/antialias:tier\.antialias/);
}
console.log('WEBGL_PHONE_WIDTH_DPR_AND_MEMORY_TIER_PASS');
