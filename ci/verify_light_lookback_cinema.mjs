#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {photonProgress,intervalLabel} from '../assets/js/scale-visual-math.js';
const src=p=>readFileSync(p,'utf8');
const page=src('pages/universe/light-year/content.html');
const built=src('public/universe/light-year/index.html');
const js=src('assets/js/light-year.js'),scene=src('assets/js/light-lookback-cinema.js'),css=src('assets/css/style.css');
for(const id of ['lyCinemaExperience','lyCinemaActivate','lyCinemaStage','lyCinemaCanvas','lyCinemaFallback','lyCinemaQuick','lyCinemaSource','lyCinemaQuickPlay','lyCinemaEarth','lyCinemaStatus']){
 assert.match(page,new RegExp('id="'+id+'"'));assert.match(built,new RegExp('id="'+id+'"'));
}
for(const percent of [0,25,50,75,100]){
 const v=photonProgress(433,percent);
 assert.ok(Math.abs(v.elapsedSeconds+v.remainingSeconds-433*365.25*86400)<.01);
 assert.ok(Math.abs(v.progress-percent/100)<1e-12);
}
assert.match(intervalLabel(photonProgress(433,19).elapsedSeconds),/years/);
assert.match(js,/import\('\.\/light-lookback-cinema\.js'\)/);
assert.match(js,/cinemaEngine\?\.setProgress\(percent\/100\)/);
assert.match(js,/cinemaEngine\?\.setSource\(label\)/);
assert.match(js,/cinemaQuickPlay\.addEventListener\('click',\(\)=>playButton\.click\(\)\)/);
assert.match(js,/cinemaStatus\.setAttribute\('aria-live',playing\?'off':'polite'\)/);
assert.match(scene,/sourceStyle=\(name\)=>/);
assert.match(scene,/Andromeda/);
assert.match(scene,/Polaris/);
assert.match(scene,/new URL\('\.\.\/images\/planet-earth-nasa\.webp',import\.meta\.url\)/);
assert.match(scene,/Math\.min\(window\.devicePixelRatio\|\|1,coarse\?1\.25:1\.75\)/);
assert.match(scene,/pointercancel/);
assert.match(scene,/new ResizeObserver\(resize\)/);
assert.match(css,/\.ly-cinema-stage canvas\{display:block;width:100%;height:100%;touch-action:none/);
assert.match(built,/not an observed photograph/);
assert.match(built,/same screen width and ten-second playback/);
assert.match(built,/id="lyPhotonDiagram"/);
assert.match(built,/id="lyDistanceRuler"/);
assert.match(built,/rel="canonical"/);
assert.match(built,/type="application\/ld\+json"/);
console.log('LOOKBACK_SOURCE_SPECIFIC_CINEMATIC_NORMALIZED_PHOTON_REFERENCE_PASS');
