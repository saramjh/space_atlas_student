#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Regression: aspect-ratio + max-height must never shrink the WIDTH of
// immersive stages, leaving a blank gutter on the card's right side.
const css=readFileSync('assets/css/style.css','utf8');
const stages=[
  'true-scale-stage','ly-cinema-stage','zoom-cinema-frame',
  'em-flight-frame','mw-spatial-frame','stellar-cinema',
  'gravity-immersive-stage','tide-cinema-stage',
  'kepler-orbit-stage','galaxy-view-visual'
];
for(const name of stages){
  const matches=[...css.matchAll(new RegExp('\\.'+name+'\\{([^}]*)\\}','g'))];
  assert.ok(matches.some(([,body])=>/width:\s*100%/.test(body)&&/box-sizing:\s*border-box/.test(body)),
    name+' must explicitly fill its parent without aspect ratio/max-height narrowing width');
}
const html=readFileSync('public/learn/not-to-scale/index.html','utf8');
assert.match(css,/\.planets-row-static\{justify-content:safe center\}/);
assert.match(html,/class="scale-track-window" tabindex="0"/);
assert.match(css,/\.scale-track-window \.scale-track\{[^}]*min-width:650px/);
assert.match(html,/id="trueScaleStage"/);
assert.match(readFileSync('public/universe/light-year/index.html','utf8'),/class="ly-cinema-stage"/);
assert.match(readFileSync('public/universe/scale/index.html','utf8'),/class="zoom-cinema-frame"/);
console.log('IMMERSIVE_STAGES_FULL_WIDTH_AND_SCALE_RULER_INSET_PASS');
