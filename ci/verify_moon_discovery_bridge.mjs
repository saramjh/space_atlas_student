#!/usr/bin/env node
// New progression/continuation contract. Intentional RED before implementation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MOON_MISSIONS} from '../assets/js/moon-missions.js';
const page=readFileSync('pages/moon/phases/content.html','utf8');
const built=readFileSync('public/moon/phases/index.html','utf8');
const js=readFileSync('assets/js/moon-missions.js','utf8');
const css=readFileSync('assets/css/style.css','utf8');
assert.deepEqual(MOON_MISSIONS.map(m=>m.gameplay), ['guided','precision','mystery']);
assert.ok(MOON_MISSIONS[0].tolerance>MOON_MISSIONS[1].tolerance);
assert.ok(MOON_MISSIONS[2].tolerance>=MOON_MISSIONS[1].tolerance);
for(const m of MOON_MISSIONS){
 assert.ok(m.discovery?.title?.length>15,m.key+' needs a distinct next-topic question');
 assert.ok(m.discovery?.teaser?.length>30,m.key+' needs a specific next experience');
 assert.equal(m.discovery.choices?.length,2);
 assert.ok([0,1].includes(m.discovery.correct));
 assert.ok(m.discovery.reason?.length>35);
 assert.ok(m.discovery.routeLabel?.length>15);
 assert.ok(['quarter','full','waning'].includes(m.key));
}
for(const id of ['moonMissionDiscoveryTitle','moonMissionDiscoveryTeaser','moonMissionDiscoveryQuestion',
 'moonMissionDiscoveryAnswer','moonMissionDiscoveryPreview','moonMissionDiscoveryFeedback']){
 assert.ok(page.includes('id="'+id+'"'),id+' missing in source');
 assert.ok(built.includes('id="'+id+'"'),id+' missing in built');
}
for(const k of ['quarter','full','waning']){
 assert.ok(page.includes('data-moon-discovery-preview="'+k+'"'),k+' preview missing');
 assert.ok(page.includes('data-moon-mission-route="'+k+'"'),k+' route missing');
}
assert.match(js,/moon_discovery_answer/);
assert.match(js,/preview\.toggleAttribute\('hidden'/);
assert.match(js,/goal\.toggleAttribute\('hidden',mystery\)/);
assert.ok(page.indexOf('id="moonMissionNext"')>page.indexOf('id="moonMissionRoutes"'));
assert.ok(page.indexOf('id="moonMissionDiscoveryTeaser"')<page.indexOf('data-moon-mission-route="quarter"'));
assert.ok(page.indexOf('data-moon-mission-route="quarter"')<page.indexOf('id="moonMissionDiscoveryQuestion"'));
assert.match(js,/activeRoute\.getBoundingClientRect\(\)\.bottom/);
assert.equal((page.match(/id="moonMissionNext"/g)||[]).length,1);
assert.match(js,/moon_mission_next_topic/);
assert.match(js,/mission\.gameplay==='mystery'/);
assert.match(js,/feedback\.textContent/);
assert.match(css,/\.moon-discovery-preview/);
assert.doesNotMatch(js,/localStorage|sessionStorage|fetch\(|setInterval/);
console.log('MOON_DISCOVERY_BRIDGE_PASS');
