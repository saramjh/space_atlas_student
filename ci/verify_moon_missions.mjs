#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOON_MISSIONS, shortestOrbitDistance, matchesMoonMission, advanceMoonOrbit, orbitPoint } from '../assets/js/moon-missions.js';
import { moonModelAtDegrees, phaseLabelAtDegrees } from '../assets/js/moon-geometry.js';

const source=readFileSync('assets/js/moon-phases.js','utf8');
const html=readFileSync('pages/moon/phases/content.html','utf8');
const built=readFileSync('public/moon/phases/index.html','utf8');
assert.equal(MOON_MISSIONS.length,3);
assert.deepEqual(MOON_MISSIONS.map(m=>m.key),['quarter','full','waning']);
assert.equal(shortestOrbitDistance(358,2),4);
assert.equal(shortestOrbitDistance(2,358),4);
assert.equal(shortestOrbitDistance(90,270),180);
assert.ok(Math.abs(advanceMoonOrbit(350,22,1)-12)<1e-9);
assert.ok(Math.abs(advanceMoonOrbit(10,-22,1)-348)<1e-9);
assert.equal(orbitPoint(0).x,120);
assert.equal(orbitPoint(90).y,31);
assert.equal(orbitPoint(180).x,300);
assert.throws(()=>advanceMoonOrbit(0,22,-1),RangeError);
assert.throws(()=>shortestOrbitDistance(NaN,90),RangeError);
for(const m of MOON_MISSIONS){
  assert.equal(matchesMoonMission(m.target,m),true,m.key);
  assert.equal(matchesMoonMission(m.target+m.tolerance,m),true,m.key+' upper bound');
  assert.equal(matchesMoonMission(m.target-m.tolerance,m),true,m.key+' lower bound');
  assert.equal(matchesMoonMission(m.target+m.tolerance+1,m),false,m.key+' out of range');
  assert.equal(matchesMoonMission(m.target-m.tolerance-1,m),false,m.key+' out of range');
  assert.ok(m.prompt.length>12 && m.explanation.length>40 && m.hint.length>20);
  assert.match(html,new RegExp('data-moon-mission-route="'+m.key+'"'));
  assert.match(m.targetLabel,/Target:/);
}
assert.equal(phaseLabelAtDegrees(90),'First Quarter');
assert.ok(Math.abs(moonModelAtDegrees(90).illuminatedFraction - .5) < 1e-10);
assert.equal(phaseLabelAtDegrees(180),'Full Moon');
assert.equal(moonModelAtDegrees(180).illuminatedFraction,1);
assert.equal(phaseLabelAtDegrees(315),'Waning Crescent');
assert.ok(moonModelAtDegrees(315).illuminatedFraction<.2);
for(const id of ['moonMissionsHeading','moonMissionStart','moonMissionTarget','moonMissionCurrent',
 'moonMissionAngle','moonMissionCheck','moonMissionHint','moonMissionNext','moonMissionRestart','moonMissionFeedback',
 'moonMissionArena','moonMissionOrbiter','moonMissionGoal','moonMissionTargetArc','moonMissionBrake','moonMissionBoost','moonMissionPause']){
  assert.match(html,new RegExp('id="'+id+'"'),'Missing '+id);
  assert.match(built,new RegExp('id="'+id+'"'),'Missing built '+id);
}
assert.match(source,/initMoonMissions/);
assert.match(source,/moonMissions\?\.sync\(deg\)/);
assert.match(source,/function drawEarthView\(thetaRad\)/);
assert.match(source,/function drawMoonCanvas\(thetaRad, targetCanvas/);
assert.match(source,/drawMoon: drawMoonCanvas/);
assert.match(source,/setPlayState\(false\);\s*continuousAngle = angle/);
assert.match(html,/NASA Moon Phases/);
assert.match(html,/not a live sky forecast/i);
assert.match(built,/rel="canonical"/);
assert.match(built,/application\/ld\+json/);
assert.match(built,/\/"?moon\/eclipses\//);
for(const url of ['/moon/earth-moon-scale/','/moon/eclipses/','/moon/tidal-locking/'])
  assert.ok(html.includes('href="{{BASE}}'+url+'"'));
assert.match(readFileSync('assets/js/moon-missions.js','utf8'),/moon_mission_next_topic/);
const missionJS=readFileSync('assets/js/moon-missions.js','utf8');
assert.doesNotMatch(missionJS,/localStorage|sessionStorage|setInterval|fetch\(/);
assert.match(missionJS,/requestAnimationFrame\(tick\)/);
assert.match(missionJS,/cancelAnimationFrame\(frame\)/);
assert.match(missionJS,/prefers-reduced-motion/);
assert.match(missionJS,/visibilitychange/);
assert.match(missionJS,/pointerdown/);
assert.match(missionJS,/ArrowLeft/);
assert.match(missionJS,/moon_mission_catch_attempt/);
console.log('MOON_MISSIONS_GATE_PASS');
