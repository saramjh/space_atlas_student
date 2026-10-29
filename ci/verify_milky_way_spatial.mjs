#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {galacticRadialSceneCoordinate} from '../assets/js/galaxy-3d.js';
const src=p=>readFileSync(p,'utf8');
const input=src('pages/galaxies/milky-way/content.html');
const output=src('public/galaxies/milky-way/index.html');
const js=src('assets/js/milky-way.js'),three=src('assets/js/galaxy-3d.js');
for(const id of ['mw3DActivate','mwSpatialCanvas','mw3DActions','mw3DOverview','mw3DFocusSun','mw3DZoomIn','mw3DZoomOut','mw3DRotateLeft','mw3DRotateRight','mw3DReadout']) {
 assert.match(input,new RegExp(`id="${id}"`));
 assert.match(output,new RegExp(`id="${id}"`));
}
assert.equal(galacticRadialSceneCoordinate(0),0);
assert.equal(galacticRadialSceneCoordinate(50000),5.92);
assert.ok(Math.abs(galacticRadialSceneCoordinate(26000)-5.92*.52)<1e-12);
for(const value of [-1,50001,NaN,Infinity]) assert.throws(()=>galacticRadialSceneCoordinate(value),RangeError);
assert.match(js,/await import\('\.\/galaxy-3d\.js'\)/);
assert.match(js,/galacticAddress:true/);
assert.match(js,/mw3DEngine\.focusSun\(\)/);
assert.match(js,/mw3DEngine\.overview\(\)/);
assert.match(js,/mw3DEngine\?\.setHypotheticalDistance\(bounded\)/);
assert.match(js,/setExploreDistance\(26000\)/);
assert.match(three,/galacticRadialSceneCoordinate\(26000\)/);
assert.match(three,/radialBeacon\.position\.x=galacticRadialSceneCoordinate\(ly\)/);
assert.match(three,/scene\.add\(new THREE\.Line\(ringGeometry,ringMaterial\)\)/);
assert.match(three,/SUN_SCENE_RADIUS/);
assert.match(three,/A broad galactic bar and low-opacity inter-arm disk/);
assert.match(three,/focusSun\(\)/);
assert.match(three,/setHypotheticalDistance\(distanceLy\)/);
assert.match(three,/pointermove/);
assert.match(three,/prefers-reduced-motion/);
assert.match(output,/not a telescope photograph or a measured 3D star map/);
assert.match(output,/no hard physical boundary/);
assert.match(output,/orange position marker is hypothetical/);
assert.match(output,/rel="canonical"/);
assert.match(output,/type="application\/ld\+json"/);
assert.match(output,/id="mwExplorerMark"/);
assert.match(output,/id="mwDistanceSlider"/);
console.log('MILKY_WAY_3D_SUN_RADIAL_LOCATION_AND_FALLBACK_PASS');
