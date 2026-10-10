#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
const page = readFileSync('public/solar-system/planet-types/index.html','utf8');
const js = readFileSync('assets/js/planet-types.js','utf8');
const module = readFileSync('assets/js/planet-surface-3d.js','utf8');

assert.match(page, /<h1>What's actually inside a planet\?<\/h1>/);
assert.match(page, /rel="canonical" href="https:\/\/saramjh.github.io\/space_atlas_student\/solar-system\/planet-types\/"/);
assert.match(page, /type="application\/ld\+json"/);
assert.match(page, /What the interior comparison means/);
assert.match(page, /Conceptual cross-sections · not to scale/);
assert.match(page, /id="ptype3DStart"[^>]*hidden/);
assert.match(page, /id="ptype3DInterface"[^>]*hidden/);
assert.match(page, /id="ptype3DFallback"/);
assert.match(page, /Don Davis visual reconstruction/);
assert.match(page, /illustrated, not an observed complete planetary map/);
assert.match(page, /not measurements of the interior/);
assert.equal((page.match(/data-planet-surface="/g) || []).length, 3);
assert.equal((page.match(/class="ptype-card"/g)||[]).length,3);
assert.match(js, /await import\('\.\/planet-surface-3d\.js'\)/);
assert.ok(!js.startsWith("import * as THREE"),'Three must not be imported eagerly into the quiz/diagram module');
assert.match(module,/import \* as THREE from 'three'/);
assert.ok(!/requestAnimationFrame\s*\(/.test(module),'No perpetual animation loop for optional globe');
assert.match(module,/renderer\.setPixelRatio\(Math\.min\(window\.devicePixelRatio \|\| 1, 1\.5\)\)/);
for (const [planet, image] of [
  ['earth','planet-earth-nasa.webp'],
  ['jupiter','planet-jupiter-jpl.webp'],
  ['neptune','planet-neptune-reconstruction-jpl.webp'],
]) {
  assert.match(page, new RegExp('data-planet-surface="'+planet+'"[^>]*data-texture="[^"]*'+image+'"'));
  const asset = 'public/assets/images/' + image;
  const buf = readFileSync(asset);
  assert.equal(buf.toString('ascii',0,4), 'RIFF');
  assert.equal(buf.toString('ascii',8,12), 'WEBP');
  assert.ok(statSync(asset).size<80000,'Texture size budget exceeded: '+image);
}
console.log('P2 opt-in 3D globe: science provenance, lazy loading, budgets, fallback and SEO contract passed.');
