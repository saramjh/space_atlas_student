#!/usr/bin/env node
// Four final science lessons and question-led home, with source fidelity checks.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {phaseSkyClock,formatLocalSolarHour} from '../assets/js/moon-visibility-math.js';
import {PLANETS} from '../assets/js/planet-data.js';
const src=p=>readFileSync(p,'utf8');
for(const route of ['moon/phases','solar-system/planet-types','solar-system/pluto-dwarf-planet','solar-system/distance-scale','']){
 const path=route?`public/${route}/index.html`:'public/index.html';
 const html=src(path);
 assert.match(html,/rel="canonical"/);assert.match(html,/type="application\/ld\+json"/);
 assert.equal((html.match(/<h1>/g)||[]).length,1,`one h1: ${route}`);
}
const moon=src('assets/js/moon-phases.js'),moonHTML=src('public/moon/phases/index.html');
for(const [deg,rise,transit,set] of [[0,6,12,18],[90,12,18,0],[180,18,0,6],[270,0,6,12],[360,6,12,18]]){
 const actual=phaseSkyClock(deg);assert.equal(actual.rise,rise);assert.equal(actual.transit,transit);assert.equal(actual.set,set);
}
assert.throws(()=>phaseSkyClock(450),RangeError);assert.equal(formatLocalSolarHour(25.2),'01:00');
for(const tag of ['moonSkyClock','moonSkyRise','moonSkyTransit','moonSkySet','moonSkyMark'])assert.ok(moonHTML.includes(`id="${tag}"`));
assert.match(moonHTML,/not tonight's observation times/);
assert.match(moon,/phaseSkyClock\(deg\)/);assert.match(moon,/moonSkyMark'\)\.style\.left/);
const interior=src('assets/js/planet-types.js'),intHTML=src('public/solar-system/planet-types/index.html');
assert.match(intHTML,/id="ptypeEvidenceChain"/);
for(const planet of ['earth','jupiter','neptune'])assert.match(intHTML,new RegExp(`data-ptype-evidence="${planet}"`));
assert.match(interior,/Juno gravity and magnetic measurements/);assert.match(interior,/S waves do not cross/);
assert.match(interior,/deep interior is inferred|deep interior is inferred|inferred rather than photographed/);
assert.match(intHTML,/Jupiter \/ Juno|NASA Jupiter \/ Juno/);
const pluto=src('assets/js/pluto-dwarf-planet.js'),plutoHTML=src('public/solar-system/pluto-dwarf-planet/index.html');
assert.match(plutoHTML,/id="plutoResonanceSVG"/);assert.match(plutoHTML,/id="plutoResonancePlay"[^>]*aria-pressed="false"/);
assert.match(plutoHTML,/NASA Neptune Facts/);
assert.match(plutoHTML,/not.*ephemeris or a proof/);
assert.match(pluto,/2\*Math\.PI\*3\*t/);assert.match(pluto,/2\*Math\.PI\*2\*t/);
assert.match(pluto,/if\(!playing\|\|document.hidden\|\|reducedMotion.matches\)return stop\(\)/);
assert.equal(3*165,495);assert.equal(2*248,496);
const distance=src('assets/js/distance-scale.js'),distanceHTML=src('public/solar-system/distance-scale/index.html');
assert.match(distanceHTML,/id="distanceGuidedPlay"[^>]*aria-pressed="false"/);
assert.match(distance,/guidedIndex=-1/);assert.match(distance,/focusPlanet\.value=PLANETS\[index\]\.name/);
assert.match(distance,/The drawn scene fraction is/);
assert.match(distance,/if\(!guided\|\|document.hidden\|\|reducedMotion.matches\)return stopGuided\(\)/);
for(const p of PLANETS){const measured=Number.parseFloat(p.au)/30.05*100,scene=p.orbit/50*100;assert.ok(measured>0&&scene>0);}
const home=src('public/index.html');
assert.match(home,/id="start-with-a-question"/);assert.match(home,/Choose one question\. Change one thing/);
assert.equal((home.match(/class="home-inquiry-row"/g)||[]).length,4);
for(const r of ['solar-system/astronomical-unit/','solar-system/temperature-comparison/','moon/eclipses/','learn/read-space-images/'])assert.ok(home.includes(r),r);
assert.match(home,/The experiments are educational models/);
console.log('P2_MOON_LOCAL_SOLAR_TIME_INTERIOR_EVIDENCE_PLUTO_RESONANCE_DUAL_RULER_HOMEPAGE_PASS');
