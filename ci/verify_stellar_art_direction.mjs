#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=f=>readFileSync(f,'utf8');
const art=read('assets/js/stellar-cinema.js');
const logic=read('assets/js/star-life-cycle.js');
const content=read('pages/stars/life-cycle/content.html');
const html=read('public/stars/life-cycle/index.html');
const css=read('assets/css/style.css');
assert.match(logic,/import\('\.\/stellar-cinema\.js'\)/);
assert.match(logic,/sceneEngine\.setStage\(stageIndex,selectedMass\)/);
assert.match(logic,/createStellarEvolutionScene/,'Retain Canvas2D legacy fallback');
for(const id of ['stellarCinema','stellarCinemaCanvas','stellarCinemaTitle','stellarCinemaNotice',
  'stellarCinemaReference','stellarCinemaFallback','stellarCinemaProcess']){
 for(const source of [content,html])
  assert.equal((source.match(new RegExp('id="'+id+'"','g'))||[]).length,1,
   'duplicate or missing '+id);
}
for(const phrase of ['MOLECULAR CLOUD','PROTOSTAR','MAIN SEQUENCE','RED GIANT',
 'PLANETARY NEBULA','WHITE DWARF','MASSIVE PROTOSTAR','HOT MAIN SEQUENCE',
 'RED SUPERGIANT','SUPERNOVA REMNANT','POSSIBLE REMNANTS']){
 assert.ok(art.includes(phrase),'missing representative visual '+phrase);
}
assert.match(art,/observed\(g,'carina'/);
assert.match(art,/observed\(g,'catseye'/);
assert.match(art,/observed\(g,'casa'/);
assert.match(art,/!visible\)oldScene=null/,'Offscreen changes may not freeze the prior stage');
assert.match(art,/reduced\.matches/);
assert.match(art,/devicePixelRatio\|\|1,1\.65/);
assert.match(art,/if\(cache\.size>4\)cache\.delete/);
assert.match(art,/IntersectionObserver/);
assert.match(art,/cancelAnimationFrame\(frameHandle\)/);
assert.match(art,/new URL\('\.\.\/images\/stellar-references\//);
assert.match(css,/\.stellar-cinema-stage/);
assert.match(css,/\.stellar-cinema-reference/);
assert.match(css,/\.stellar-cinema-caption\{position:static/);
assert.match(content,/forms, sizes and duration not to scale/);
for(const asset of [
 ['carina-observed.jpg',225000],
 ['catseye-observed.jpg',75000],
 ['casa-observed.jpg',265000]
]){
 const bytes=statSync('assets/images/stellar-references/'+asset[0]).size;
 assert.ok(bytes<asset[1],asset[0]+' exceeds mobile image budget: '+bytes);
}
const credits=[
 ['NASA, ESA, CSA, and STScI','https://esawebb.org/images/weic2205a/'],
 ['J.P. Harrington and K.J. Borkowski (University of Maryland), and NASA/ESA',
 'https://esahubble.org/images/opo9501a/'],
 ['NASA, ESA, CSA, STScI, D. Milisavljevic (Purdue University), T. Temim (Princeton University), I. De Looze (University of Gent)',
 'https://esawebb.org/images/weic2330e/']
];
for(const [credit,url] of credits){
 assert.ok(art.includes(credit),'Required full image credit missing');
 assert.ok(art.includes(url),'Official reference source missing');
}
assert.match(html,/id="lifeNext"/);
assert.match(html,/id="lifePrevious" disabled/);
console.log('STELLAR_ART_12_SCENES_REFERENCES_LICENSE_ACCESSIBILITY_AND_PERFORMANCE_PASS');
