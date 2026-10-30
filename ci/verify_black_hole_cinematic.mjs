#!/usr/bin/env node
// Additional regressions for the user-driven black-hole camera and disk details.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=p=>readFileSync(p,'utf8');
const page=source('pages/black-holes/content.html');
const built=source('public/black-holes/index.html');
const code=source('assets/js/black-holes.js');
const css=source('assets/css/style.css');
for(const id of ['bhZoomIn','bhZoomOut','bhFlowSpeed','bhFlowSpeedValue']) {
 assert.match(page,new RegExp(`id="${id}"`));
 assert.match(built,new RegExp(`id="${id}"`));
}
assert.match(code,/engine\?\.zoomBy\(\.78\)/);
assert.match(code,/engine\?\.zoomBy\(1\.28\)/);
assert.match(code,/engine\?\.resetZoom\(\)/);
assert.match(code,/engine\.spin\(dt\*Number\(flowSpeed\.value\)\)/);
assert.match(code,/zoomBy\(factor\)\{viewDistance=Math\.max\(11,Math\.min\(29/);
assert.match(code,/Math\.exp\(Math\.min\(75,Math\.max\(-75,event\.deltaY\)\)\*\.004\)/);
assert.match(code,/passive:false/);
assert.match(code,/touchPoints\.size===2/);
assert.match(code,/lastPinch\/Math\.max\(4,distance\)/);
assert.match(code,/renderer\.setPixelRatio\(tier\.pixelRatio\)/);
assert.match(code,/pow\(max\(r,2\.6\),1\.5\)/);
assert.match(code,/float turbulence=/);
assert.match(code,/float knots=/);
assert.match(code,/prefers-reduced-motion/);
assert.match(page,/not ray.traced/i);
assert.match(page,/compressed illustrative patterns, not predicted accretion rates or time/);
assert.match(css,/\.bh-scene:not\(\[hidden\]\)\{touch-action:none/);
assert.match(built,/rel="canonical"/);
assert.match(built,/application\/ld\+json/);
assert.match(page,/id="bhFallback"/);
console.log('BLACK_HOLE_CINEMATIC_CONTROLS_REGRESSION_PASS');
