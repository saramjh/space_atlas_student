#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {noonShadowMeters} from '../assets/js/season-shadow-math.js';
import {seasonSunlight} from '../assets/js/season-sunlight.js';
import {equatorialDiameterKm} from '../assets/js/planet-size-lens.js';
import {traceLaunch,ORBIT_MODEL} from '../assets/js/orbit-trio-math.js';
import {lunarFacing} from '../assets/js/tidal-facing.js';
const read=p=>readFileSync(p,'utf8');
for(const route of ['earth/seasons','moon/tidal-locking','solar-system/planet-size-comparison','solar-system/gravity-and-orbits']){
 const h=read(`public/${route}/index.html`);assert.match(h,/rel="canonical"/);assert.match(h,/type="application\/ld\+json"/);
}
const season=read('assets/js/seasons.js'),seasons=read('public/earth/seasons/index.html');
assert.match(seasons,/id="seasonGroundLab"/);assert.match(seasons,/data-season-hemisphere="north"/);assert.match(seasons,/data-season-hemisphere="south"/);
assert.match(season,/currentSunlight=model;renderGroundShadow\(\)/);
assert.match(season,/const length=noonShadowMeters\(elevation\)/);
assert.equal(seasonSunlight(180,23.5).northNoonElevation,73.5);
assert.equal(seasonSunlight(180,23.5).southNoonElevation,26.5);
assert.ok(Math.abs(noonShadowMeters(73.5)-.296)<.003);
assert.ok(Math.abs(noonShadowMeters(26.5)-2.01)<.01);
assert.ok(Math.abs(noonShadowMeters(50)-.8391)<.001);
assert.equal(noonShadowMeters(90),0);assert.throws(()=>noonShadowMeters(0),RangeError);
assert.match(seasons,/no atmospheric refraction|no atmospheric refraction, daylight/);
const lock=read('assets/js/tidal-locking.js'),lockPage=read('public/moon/tidal-locking/index.html');
assert.match(lockPage,/id="lockOrbitPlay" aria-pressed="false"/);
assert.match(lock,/\/12000/);assert.match(lock,/if\(reducedMotion.matches\)stopOrbit\(\)/);
assert.match(lock,/slider\.addEventListener\('input', \(\) => \{stopOrbit\(\)/);
assert.ok(lunarFacing(0,true).facingCosine>.99);
const lens=read('assets/js/planet-size-lens.js'),sizePage=read('public/solar-system/planet-size-comparison/index.html');
assert.match(sizePage,/id="diameterLensCanvas"/);assert.match(sizePage,/id="diameterLensPlay" aria-pressed="false"/);
assert.match(sizePage,/class="diameter-lens-stage"/);
assert.match(sizePage,/<div class="diameter-lens-actions"/);
assert.ok(sizePage.indexOf('id="diameterLensPlay"')<sizePage.indexOf('id="diameterLensProgress"'),
 'Lens playback must sit within the camera stage rather than two control rows below it');

// A mobile Play action must be seen alongside its animated result.
const moonPage=read('pages/moon/phases/content.html');
const lockLessonPage=read('pages/moon/tidal-locking/content.html');
// Moon Phases now keeps Play beside the Earth-view result rather than above
// the much taller top-down 3D orbit. Test the action/result adjacency instead.
assert.ok(moonPage.indexOf('id="moonEarthView"')<moonPage.indexOf('id="moonPlay"'));
assert.ok(moonPage.indexOf('id="moonPlay"')<moonPage.indexOf('id="moonAngle"'));
assert.ok(moonPage.indexOf('id="moonAngle"')<moonPage.indexOf('id="moonAdvancedModel"'));
assert.ok(lockLessonPage.indexOf('id="lockOrbitPlay"')<lockLessonPage.indexOf('id="lockCanvas"'));
assert.equal((moonPage.match(/id="moonPlay"/g)||[]).length,1);
assert.equal((lockLessonPage.match(/id="lockOrbitPlay"/g)||[]).length,1);
assert.match(lens,/cinematicEase\(t\)/);assert.match(lens,/Math\.exp\(Math\.log\(initialScale\)/);
assert.match(lens,/const scale=Math\.exp/);
const diamRatio=equatorialDiameterKm('Jupiter')/equatorialDiameterKm('Earth');
assert.ok(diamRatio>11.2&&diamRatio<11.22);assert.throws(()=>equatorialDiameterKm('Mars II'),RangeError);
const gravity=read('assets/js/gravity-and-orbits.js'),orbitPage=read('public/solar-system/gravity-and-orbits/index.html');
assert.match(orbitPage,/id="orbitCompareThree"[^>]*aria-pressed="false"/);
assert.match(gravity,/const threeTraces=\[/);assert.match(gravity,/traceLaunch\(o.speed\)/);
assert.match(gravity,/if\(trioVisible\)\{showTrio\(false\);return;\}/);
assert.equal(ORBIT_MODEL.circularSpeed,2.6);
assert.equal(traceLaunch(1).outcome,'collision');
assert.equal(traceLaunch(2.6).outcome,'bounded-preview');
assert.equal(traceLaunch(4.1).outcome,'escape');
for(const speed of [1,2.6,4.1]){const x=traceLaunch(speed);assert.ok(x.points.length<=901);assert.ok(x.points.every(p=>p.every(Number.isFinite)));}
console.log('SEASON_SHADOWS_LUNAR_ORBIT_TRUE_DIAMETER_LENS_NEWTON_TRIO_SCIENCE_PASS');
