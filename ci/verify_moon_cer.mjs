#!/usr/bin/env node
// Teacher-led CER resource: independent of classroom adoption claims or a live website.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=(p)=>readFileSync(p,'utf8');
const page=read('pages/moon/phases/content.html');
const built=read('public/moon/phases/index.html');
const handoutPath='assets/handouts/moon-phases-cer.html';
assert.ok(existsSync(handoutPath),'standalone, offline-printable handout exists');
const handout=read(handoutPath);
assert.match(page,/id="moonCerPrediction"/,'prediction precedes simulator');
assert.ok(page.indexOf('id="moonCerPrediction"')<page.indexOf('id="phaseLab"'));
for(const answer of ['quarter','half','full']){
 assert.match(page,new RegExp('value="'+answer+'"'),'all three prediction answers');
}
assert.equal((page.match(/class="cer-phase-icon"/g)||[]).length,3,'three equally sized original disk drawings');
assert.equal((page.match(/viewBox="0 0 96 96"/g)||[]).length,4,'three original choices and one separate scientific observation disk');
assert.match(page,/id="moonCerCheck"/);
assert.match(page,/id="moonCerFeedback"[^>]*aria-live="polite"/);
assert.match(page,/id="moonCerFallback"/,'no-JS answer works through native details');
assert.match(page,/href="\{\{BASE\}\}\/assets\/handouts\/moon-phases-cer\.html"/);
assert.match(page,/30–35 minutes/);
assert.match(page,/Grades 3–5/);
assert.match(page,/Claim[\s\S]*Evidence[\s\S]*Reasoning/i);
assert.match(page,/lamp[\s\S]*ball[\s\S]*observer/i);
assert.match(page,/https:\/\/science\.nasa\.gov\/moon\/moon-phases\//);
// New drawing replaces a misleading ray that missed the ball. Sunlight now
// reaches the ball; blue observer gaze and right-angle lines are distinct.
assert.match(page,/id="cerSetupRayToBall" x1="159" y1="167" x2="454" y2="77"/);
assert.match(page,/id="cerSetupObserverGaze" x1="474" y1="151" x2="474" y2="96"/);
assert.match(page,/circle cx="474" cy="73" r="20" fill="#6e7a84"/);
assert.match(page,/path d="M474 53 A20 20 0 0 0 474 93 Z" fill="#f3eed9" transform="rotate\(-17 474 73\)"/);
assert.doesNotMatch(page,/M384 90 l-10 -2 l6 9/,'old ray missed ball');
assert.match(handout,/circle cx="260" cy="50" r="17" fill="#888"/);
assert.match(handout,/path d="M260 33 A17 17 0 0 0 260 67 Z" fill="#fff" transform="rotate\(-26 260 50\)"/);
assert.match(handout,/x1="87" y1="135" x2="242" y2="60"/,'printed ray reaches ball');
assert.match(handout,/<meta name="robots" content="noindex"/);
assert.match(handout,/<style>/);
assert.match(handout,/@media print/);
assert.match(handout,/@page/);
assert.match(handout,/Teacher guide/);
assert.match(handout,/Student worksheet/);
assert.match(handout,/Claim[\s\S]*Evidence[\s\S]*Reasoning/i);
assert.match(handout,/lamp[\s\S]*ball[\s\S]*observer/i);
assert.match(handout,/30–35 minutes/);
assert.match(handout,/Grades 3–5/);
for(const forbidden of ['adsbygoogle','googletagmanager','analytics','<script','<iframe','https://saramjh.github.io/space_atlas_student']){
 assert.ok(!handout.includes(forbidden),'handout offline and tracker-free: '+forbidden);
}
assert.ok(existsSync('public/assets/handouts/moon-phases-cer.html'),'handout copied in built distribution');
assert.match(built,/id="moonCerPrediction"/);
assert.match(built,/rel="canonical"/);
assert.match(built,/application\/ld\+json/);
const {evaluateMoonPrediction}=await import('../assets/js/moon-cer.js');
for(const [value,isCorrect] of [['quarter',false],['half',true],['full',false]]){
 const r=evaluateMoonPrediction(value);
 assert.equal(r.correct,isCorrect,value);
 assert.equal(r.angle,90);
 assert.match(r.feedback,/half/i);
}
assert.equal(evaluateMoonPrediction(null).valid,false);
console.log('MOON_CER_TEACHER_LESSON_PASS: 3 phase diagrams, answer logic, print handout, device-free guide, NASA science, SEO/asset gates');
