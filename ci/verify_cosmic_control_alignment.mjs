#!/usr/bin/env node
// Regression for the step-7 cosmic-journey controls: a status message must not
// occupy the button row and push both primary actions off the scene's center.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(p,'utf8');
for(const file of ['pages/universe/scale/content.html','public/universe/scale/index.html']){
 const html=src(file);
 assert.match(html,/<div class="zoom-cinema-init">\s*<div class="zoom-cinema-actions" role="group" aria-label="Illustrated cosmic journey controls">/);
 const group=html.match(/<div class="zoom-cinema-actions"[^>]*>([\s\S]*?)<\/div>/)?.[1];
 assert.ok(group,'controls group exists');
 assert.match(group,/id="zoomCinemaActivate"/);
 assert.match(group,/id="zoomCinemaTour"/);
 assert.doesNotMatch(group,/id="zoomCinemaStatus"/);
 assert.match(html,/<p id="zoomCinemaStatus" role="status">/);
 assert.ok(html.indexOf('id="zoomCinemaStatus"')>html.indexOf('id="zoomCinemaTour"'));
 if(file.startsWith('public/'))for(const tag of ['rel="canonical"','type="application/ld+json"'])assert.ok(html.includes(tag));
}
const css=src('assets/css/style.css');
assert.match(css,/\.zoom-cinema-init\{display:grid;justify-items:center/);
assert.match(css,/\.zoom-cinema-actions\{display:flex;[^}]*justify-content:center/);
assert.match(css,/\.zoom-cinema-actions button\[hidden\]\{display:none\}/);
assert.match(css,/@media\(max-width:600px\)\{\.zoom-cinema-init\{[^}]*\}\.zoom-cinema-actions\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
console.log('COSMIC_TRANSPORT_CONTROLS_GROUPED_CENTERED_AND_STATUS_SEPARATED_PASS');
