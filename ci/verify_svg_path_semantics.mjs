import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=p=>readFileSync(p,'utf8');
const gravity=source('pages/solar-system/gravity-comparison/content.html');
const built=source('public/solar-system/gravity-comparison/index.html');
const dynamic=source('assets/js/gravity-comparison.js');
assert.match(gravity,/<line id="gravityRadiusLine" x1="92" y1="116" x2="98" y2="116" stroke="#f4cb82" stroke-width="2.5"\/>/,
  'Radius extent must remain visible at the 1× Earth baseline: line cannot sit under central/surface marker circles');
assert.match(gravity,/offset downward for visibility/);
assert.match(dynamic,/#gravityRadiusLine/);
assert.match(dynamic,/setAttribute\('x2', x.toFixed\(2\)\)/);
assert.match(built,/id="gravityRadiusLine"/);
const moon=source('pages/moon/phases/content.html');
for(const id of ['cerSetupRightAngleMobile','cerSetupRightAngleDesktop','cerSetupMobileRayToBall','cerSetupRayToBall'])
 assert.ok(moon.includes('id="'+id+'"'),id+' required');
const visible=source('ci/verify_moon_diagram_visibility.mjs');
assert.match(visible,/radius\+10/);
assert.match(visible,/circle painted over marker/);
console.log('SVG_SEMANTIC_PATH_GATE_PASS dimension visibility and Moon arc layering');
