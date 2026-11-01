#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync('assets/css/style.css','utf8');
const js=readFileSync('assets/js/gravity-lab.js','utf8');
const page=readFileSync('pages/solar-system/gravity-lab/content.html','utf8');
// Input type is not viewport width: 768-1366px tablets need on-screen pads.
assert.match(js,/matchMedia\('\(any-pointer: coarse\)'\)/);
assert.match(js,/navigator\.maxTouchPoints/);
assert.match(js,/container\.classList\.add\('gl-touch-enabled'\)/);
assert.match(js,/e\.pointerType==='touch'/);
assert.match(js,/anyCoarse\.addEventListener\('change',syncTouchControls\)/);
assert.match(css,/\.gl-view\.gl-touch-enabled \.gl-joystick\{display:block/);
assert.match(css,/\.gl-view\.gl-touch-enabled \.gl-look\{display:block/);
assert.match(css,/\.gl-view\.gl-touch-enabled \.gl-joystick:before/);
assert.match(css,/\.gl-view\.gl-touch-enabled \.gl-look:before/);
// The small-screen treatment must not enable phantom pads for mouse-only devices.
assert.doesNotMatch(css,/@media\(max-width:650px\)\{[^}]*\.gl-joystick\{display:block/);
assert.match(page,/Touchscreen \(phone or tablet\)/);
assert.match(page,/role="group" aria-label="Touch movement pad/);
// Sitewide tablet sweep discovered tiny 23px homepage quick-planet targets:
// the prior <=620px rule alone did not protect iPad landscape/portrait.
assert.match(css,/@media \(any-pointer: coarse\), \(pointer: coarse\)\{[\s\S]*?\.planet-quick-bar button\{[\s\S]*?min-height:44px/);
// Keyboard remains a usable parallel input, not a mobile-vs-desktop exclusive mode.
assert.match(js,/document\.addEventListener\('keydown',keydown\)/);
assert.match(js,/look\.addEventListener\('pointermove',e=>/);
assert.match(js,/joystick\.addEventListener\('pointermove',pad\)/);
console.log('GRAVITY_TABLET_TOUCH_INPUT_CONTRACT_PASS');
