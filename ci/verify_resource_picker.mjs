#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const path of ['pages/sources/space-resources-for-students/content.html','public/sources/space-resources-for-students/index.html']){
 const html=readFileSync(path,'utf8');
 assert.equal((html.match(/class="step resource-choice"/g)||[]).length,5);
 assert.equal((html.match(/class="resource-choice-icon" aria-hidden="true"/g)||[]).length,5);
 assert.equal((html.match(/class="resource-choice-action"/g)||[]).length,5);
 for(const s of ['READ A QUICK EXPLANATION','BUILD AND TEST SOMETHING','EXPLORE IN 3D','CHECK THE DATA','COMPARE SOURCES'])assert.ok(html.includes(s));
 for(const url of ['https://spaceplace.nasa.gov/','https://www.jpl.nasa.gov/edu/','https://science.nasa.gov/eyes/','https://science.nasa.gov/','https://www.esa.int/'])assert.ok(html.includes(url));
 assert.equal((html.match(/<details class="step resource-choice" data-resource-goal="[a-z]+" id="resourceChoice[0-4]">/g)||[]).length,5);
 assert.ok(!html.includes('role="button"'));
 assert.match(html,/id="resourceMatcher"/);
 assert.match(html,/id="resourceGoal"/);
 assert.match(html,/id="resourceMatch"[^>]*disabled/);
}
const css=readFileSync('assets/css/style.css','utf8');
assert.match(css,/\.resource-choice summary:focus-visible/);
assert.match(css,/\.resource-choice-icon svg/);
assert.match(css,/@media\(max-width:550px\).*?\.resource-choice-grid\{grid-template-columns:1fr/);
const built=readFileSync('public/sources/space-resources-for-students/index.html','utf8');
assert.match(built,/rel="canonical"/);
assert.match(built,/type="application\/ld\+json"/);
console.log('RESOURCE_PICKER_FIVE_SEMANTIC_SYMBOLS_ACCESSIBLE_SOURCES_PASS');

const javascript=readFileSync('assets/js/resource-picker.js','utf8');
assert.match(javascript,/target\.open=true/);
assert.match(javascript,/resource-choice-target/);
assert.match(javascript,/prefers-reduced-motion/);
assert.match(readFileSync('pages/sources/space-resources-for-students/meta.json','utf8'),/"script": "\/assets\/js\/resource-picker.js"/);
