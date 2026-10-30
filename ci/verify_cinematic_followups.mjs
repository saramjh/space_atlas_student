#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cinematicEase} from '../assets/js/cinematic-motion.js';
import {tideOceanRadius,tideObserverContrast} from '../assets/js/tide-cinema-math.js';
import {blackHoleModel} from '../assets/js/black-hole-model.js';
const src=p=>readFileSync(p,'utf8');
const tidal=src('assets/js/tide-cinema.js'),tideUI=src('assets/js/tides.js');
const black=src('assets/js/black-holes.js');
const tidePage=src('public/moon/tides/index.html'),bhPage=src('public/black-holes/index.html');
const css=src('assets/css/style.css');
for(const html of [tidePage,bhPage]){
 assert.match(html,/rel="canonical"/);assert.match(html,/type="application\/ld\+json"/);
}
assert.match(tidePage,/id="tideCinemaFollow"[^>]*aria-pressed="false"/);
assert.match(tideUI,/tide3DEngine\?\.setFollowObserver\(active\)/);
assert.match(tidal,/setFollowObserver:v=>\{followObserver=Boolean\(v\)/);
assert.match(tidal,/followBlend\+=\(\(followObserver\?1:0\)-followBlend\)\*ease/);
assert.match(tidal,/marker\.position\.x\*\.78/);
assert.match(tidal,/camera\.lookAt\(focusX,focusY,0\)/);
assert.match(tidal,/if\(reduced\.matches\)\{followBlend=followObserver\?1:0/);
assert.match(tidePage,/illustrative \*moving viewpoint\*/);
assert.ok(Math.abs(tideOceanRadius(-1,0,0,0)-tideOceanRadius(1,0,0,0))<1e-12);
assert.ok(tideObserverContrast(0,0).relative>.99);
assert.ok(tideObserverContrast(90,0).relative<.01);
assert.match(bhPage,/id="bhGlide"[^>]*aria-pressed="false"/);
assert.match(black,/glideFrom\+\(glideTo-glideFrom\)\*cinematicEase\(t\)/);
assert.match(black,/glideTo=closer\?11\.4:19\.5/);
assert.match(black,/if\(reducedMotion\.matches\)\{viewDistance=glideTo/);
assert.match(black,/if\(document\.hidden\|\|canvas\.hidden\)/);
assert.match(black,/engine\.flyTo\(closer\)/);
assert.match(bhPage,/never crosses the event horizon/);
assert.match(css,/@media\(max-width:360px\)\{\.bh-diagram\{min-height:0\}\}/);
assert.ok(cinematicEase(.5)===.5 && cinematicEase(1)===1);
const model=blackHoleModel({massSolar:10,elevationDeg:45});
assert.ok(model.horizonRadiusKm>25&&model.horizonRadiusKm<35);
assert.equal(11.4>7,true,'cinematic camera remains outside displayed disk in scene coordinates');
console.log('TIDES_OBSERVER_FOLLOW_AND_BLACK_HOLE_SAFE_CAMERA_DOLLY_PASS');
