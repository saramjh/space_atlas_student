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
assert.equal((page.match(/viewBox="0 0 96 96"/g)||[]).length,3,'uniform disk geometry');
assert.match(page,/id="moonCerCheck"/);
assert.match(page,/id="moonCerFeedback"[^>]*aria-live="polite"/);
assert.match(page,/id="moonCerFallback"/,'no-JS answer works through native details');
assert.match(page,/href="\{\{BASE\}\}\/assets\/handouts\/moon-phases-cer\.html"/);
assert.match(page,/30–35 minutes/);
assert.match(page,/Grades 3–5/);
assert.match(page,/Claim[\s\S]*Evidence[\s\S]*Reasoning/i);
assert.match(page,/lamp[\s\S]*ball[\s\S]*observer/i);
assert.match(page,/https:\/\/science\.nasa\.gov\/moon\/moon-phases\//);
// In the original lamp diagram, the hemisphere toward the LEFT-hand lamp must be bright.
assert.match(page,/circle cx="484" cy="75" r="20" fill="#76828d"/);
assert.match(page,/path d="M484 55 A20 20 0 0 0 484 95 Z" fill="#dedbd0"/);
assert.match(handout,/circle cx="260" cy="50" r="17" fill="#888"/);
assert.match(handout,/path d="M260 33 A17 17 0 0 0 260 67 Z" fill="#fff"/);
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
