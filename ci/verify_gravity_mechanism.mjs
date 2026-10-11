#!/usr/bin/env node
// Truth and learner-action contracts for the causal gravity diagram.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync('assets/js/gravity-comparison.js','utf8');
const data=readFileSync('assets/js/planet-data.js','utf8');
const html=readFileSync('public/solar-system/gravity-comparison/index.html','utf8');
const ratio=(body)=>Number(data.split('\n').find(x=>x.includes("{name:'"+body+"'")).match(/gravity:([\d.]+)/)[1]);
const g=(m,r)=>m/(r*r);
assert.equal(g(1,1),1);
assert.equal(g(4,1),4);
assert.equal(g(1,2),0.25);
assert.ok(Math.abs(g(317.8,11.21)-2.529)<0.003);
for(const [name,value] of [['Jupiter',2.36],['Saturn',0.92],['Uranus',0.89],['Neptune',1.12]]){
 assert.ok(Math.abs(ratio(name)-value)<.0001,name);
 assert.ok(html.includes((45*value).toFixed(1)+' kg'),name+' static reading must match model data');
}
assert.equal((html.match(/data-gravity-scenario="(?:earth|mass|radius|jupiter)"/g)||[]).length,4);
assert.equal((html.match(/data-gravity-scenario="[^"]+" aria-pressed="true"/g)||[]).length,1);
assert.equal((html.match(/data-gravity-scenario="[^"]+" aria-pressed="false"/g)||[]).length,3);
for(const id of ['gravityMass','gravityRadius','gravityModelResult','gravityCauseDiagram','gravityBody','gravityTestPoint','gravityArrowLine','gravityModelExplanation']){
 assert.ok(html.includes('id="'+id+'"'),id+' missing');
}
assert.match(html,/g \/ g<sub>Earth<\/sub> =/);
assert.ok(html.includes('2.53×')&&html.includes('2.36× <strong>effective equatorial</strong>'));
assert.ok(html.includes('1-bar atmospheric reference level')||html.includes("1-bar atmospheric reference level"));
assert.ok(html.includes('planetary/factsheet/jupiterfact.html'));
assert.ok(html.includes('science.nasa.gov/learn/basics-of-space-flight/glossary'));
assert.match(html,/rel="canonical"/);
assert.match(html,/application\/ld\+json/);
assert.match(js,/function modelGravity\(mass, radius\)/);
assert.match(js,/return mass \/ \(radius \* radius\)/);
assert.match(js,/addEventListener\('input', \(\) => renderMechanism\(\)\)/);
assert.match(js,/setAttribute\('r', radiusPx.toFixed\(2\)\)/);
assert.match(js,/setAttribute\('aria-pressed', String\(button.dataset.gravityScenario === active\)\)/);
assert.match(js,/control.disabled = false/);
console.log('Causal gravity learning PASS: NASA equatorial effective ratios, idealized M/R² invariants, four scenarios, radius symbol, live feedback, static SEO.');
