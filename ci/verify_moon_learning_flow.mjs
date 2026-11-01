#!/usr/bin/env node
// Learning/editorial QA: 4–8 student flow; keep full educator/science content optional.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync('pages/moon/phases/content.html','utf8');
const built=readFileSync('public/moon/phases/index.html','utf8');
const css=readFileSync('assets/css/style.css','utf8');
const dock=readFileSync('assets/js/mobile-feedback-dock.js','utf8');
const find=(s,t)=>{const at=s.indexOf(t);assert.ok(at>=0,'Missing '+t);return at};
const order=[
 'id="moon-cer-activity"','id="moon-observation"','id="moon-explanation"',
 'id="moon-missions"','id="evidence"','class="section section-last"','id="educator-resources"'
];
let previous=-1;
for(const marker of order){
 const i=find(page,marker);assert.ok(i>previous,'Student flow out of order: '+marker);previous=i;
}
assert.ok(page.indexOf('{{AD_PRIMARY}}')>page.indexOf('id="moon-missions"'));
assert.ok(page.indexOf('{{AD_SECONDARY}}')>page.indexOf('id="evidence"'));
assert.equal(page.match(/\{\{AD_PRIMARY\}\}/g)?.length,1);
assert.equal(page.match(/\{\{AD_SECONDARY\}\}/g)?.length,1);
assert.ok(page.indexOf('class="moon-earth-controls"')<page.indexOf('id="moonAngle"'));
assert.ok(page.indexOf('id="moonAngle"')<page.indexOf('class="moon-lab-depth"'));
assert.ok(page.indexOf('id="moonAngle"')<page.indexOf('id="moonSkyClock"'));
assert.ok(page.indexOf('id="moonEarthView"')<page.indexOf('id="moonAngle"'));
assert.match(page,/<details class="moon-lab-depth" id="moonAdvancedModel">/);
assert.match(page,/<details class="moon-reference" id="moonPhaseReference">/);
assert.match(page,/<details class="moon-teacher-disclosure" id="moonTeacherLesson">/);
assert.match(page,/<details class="moon-model-limits" id="moonModelLimitations">/);
assert.ok(page.indexOf('id="moonTeacherLesson"')>page.indexOf('class="section section-last"'));
assert.ok(page.indexOf('id="moonModelLimitations"')>page.indexOf('id="educator-resources"'));
assert.match(dock,/route==='\/moon\/phases\/'&&document\.querySelector\('#phaseLab \.moon-earth-controls'\)/);
assert.match(css,/#moon-cer-activity,#moon-observation,#moon-missions/);
for(const id of ['moonCerCheck','moonAngle','moonPlay','moonEarthView','moonSkyRise',
 'moonMissionStart','moonMissionArena','quizQuestion','quizOptions','moonModelLimitations',
 'teacher-moon-title','moonTeacherLesson','moonPhaseReference']){
 assert.match(page,new RegExp('id="'+id+'"'),'source missing '+id);
 assert.match(built,new RegExp('id="'+id+'"'),'built missing '+id);
}
for(const route of ['/moon/eclipses/','/moon/earth-moon-scale/','/moon/tidal-locking/']){
 assert.ok(page.includes('href="{{BASE}}'+route+'"'),'lost internal route '+route);
}
assert.match(built,/rel="canonical"/);
assert.match(built,/application\/ld\+json/);
assert.match(built,/NASA Moon Phases/);
console.log('MOON_LEARNER_FLOW_PASS: student path, scoped control ownership, accessible educator/advanced refs, SEO/ads intact');
