#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(p,'utf8');
const page=src('pages/exoplanets/transit-method/content.html');
const built=src('public/exoplanets/transit-method/index.html');
const controller=src('assets/js/transit-method.js');
const css=src('assets/css/style.css');
for(const marker of ['id="transitFocus"','id="transitStar"','id="transitPhotosphere"','id="transitCorona"','id="transitHaloBlur"']){
 assert.ok(page.includes(marker),`source missing ${marker}`);
 assert.ok(built.includes(marker),`build missing ${marker}`);
}
assert.match(page,/gradient and corona are <strong>illustrative styling only<\/strong>/);
assert.match(page,/depth calculation treats a uniformly bright stellar disk/);
assert.match(controller,/const wideBox = \[0, 0, 420, 160\], closeBox = \[129, 19, 162, 122\]/);
assert.match(controller,/scene\.setAttribute\('viewBox'/);
assert.match(controller,/requestAnimationFrame\(tick\)/);
assert.match(controller,/prefers-reduced-motion/);
assert.match(controller,/document\.hidden/);
assert.match(controller,/focusButton\.addEventListener\('click'/);
assert.match(controller,/focusButton\.disabled=false/);
assert.match(controller,/scene\.classList\.toggle\('transit-playing',playing\)/);
assert.match(css,/\.transit-orbit-wrap svg\{max-height:380px;min-height:210px\}/);
assert.match(css,/\.transit-play-controls button#transitFocus/);
assert.match(built,/rel="canonical"/);
assert.match(built,/type="application\/ld\+json"/);
assert.match(built,/id="transitCurve"/);
assert.match(built,/not telescope observations/);
const {transitBlockedFraction}=await import('../assets/js/transit-geometry.js');
for(const ratio of [.04,.1,.2]){
 assert.ok(Math.abs(transitBlockedFraction(90,ratio)-ratio*ratio)<1e-9);
 assert.equal(transitBlockedFraction(270,ratio),0);
}
console.log('TRANSIT_CINEMATIC_FOCUS_REGRESSION_PASS');
