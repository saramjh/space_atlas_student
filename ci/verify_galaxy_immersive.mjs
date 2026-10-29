#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(p,'utf8');
const html=src('pages/galaxies/types/content.html');
const built=src('public/galaxies/types/index.html');
const controller=src('assets/js/galaxy-types.js');
const engine=src('assets/js/galaxy-3d.js');
const css=src('assets/css/style.css');
for (const code of ['galaxyZoomIn','galaxyZoomOut','galaxyCameraReset','galaxyOrbitMotion','galaxy3DOverlay']){
 assert.match(html,new RegExp(`id="${code}"`));
 assert.match(built,new RegExp(`id="${code}"`));
}
assert.match(controller,/createGalaxy3D\(galaxy3DCanvas,galaxy3DShell,\(angle\)=>/);
assert.match(controller,/toggle3DControls\(enabled\)/);
assert.match(controller,/stopDrift\(\)/);
assert.match(engine,/pointerdown/);assert.match(engine,/pointermove/);
assert.match(engine,/pointercancel/);assert.match(engine,/setPointerCapture/);
assert.match(engine,/passive:false/);
assert.match(engine,/targetDistance = clamp\(targetDistance \* factor, 8\.8, 27\)/);
assert.match(engine,/Math\.exp\(-14 \* dt\)/);
assert.match(engine,/prefers-reduced-motion/);
assert.match(engine,/devicePixelRatio/);
assert.match(engine,/const coarse = matchMedia/);
assert.match(engine,/camera\.fov = width < height \? 56 : 46/);
assert.match(engine,/fragmentShader:/);
assert.match(engine,/uTime/);
assert.match(engine,/if \(canvas\.hidden \|\| disposed\) return/);
assert.match(engine,/if \(raf === null && !disposed && !document\.hidden\)/);
assert.match(engine,/dispose\(\)/);
assert.match(css,/galaxy-3d-canvas:not\(\[hidden\]\)\{cursor:grab;touch-action:none/);
assert.match(css,/\.galaxy-view-visual\{aspect-ratio:16\/9;min-height:290px/);
assert.match(built,/not a telescope photo or a reconstruction of real star positions/);
assert.match(built,/differential motion, not measured orbital speeds/);
for(const marker of ['rel="canonical"','type="application/ld+json"','<h1>Are all galaxies shaped like the Milky Way?</h1>'])assert.ok(built.includes(marker));
assert.match(built,/class="galaxy-view-image"/);
assert.match(built,/<noscript>/);
console.log('GALAXY_INTERACTIVE_3D_SOURCE_REGRESSION_PASS');
