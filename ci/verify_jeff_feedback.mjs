#!/usr/bin/env node
// Regression: Jeff Adkins (astronomy educator) reported eclipse-like sliding
// circle in phase view and overlapping planets / faint orbital paths.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = (file) => readFileSync(file, 'utf8');

const moon = source('assets/js/moon-phases.js');
const start = moon.indexOf('function drawEarthView(thetaRad) {');
const end = moon.indexOf('\nconst slider =', start);
assert.ok(start > -1 && end > start);
assert.ok(!moon.includes('cx + dir * offset'), 'no sliding lunar eclipse disk');
let output;
const canvas = { width: 220 };
const context = {
  createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; },
  clearRect() {},
  putImageData(img) { output = img; },
};
const draw = new Function('earthViewCanvas','earthViewCtx',
  moon.slice(start, end) + '; return drawEarthView;')(canvas, context);
const index = (x,y) => 4 * (y * canvas.width + x);
function isDay(x,y){return output.data[index(x,y)] > 105;}
function fraction(theta) {
  draw(theta);
  let day=0, count=0;
  const center=110, radius=106;
  for(let y=5;y<215;y++)for(let x=5;x<215;x++){
    if((x-center)**2+(y-center)**2>(radius-2)**2) continue;
    count++;
    day+=Number(isDay(x,y));
  }
  return day/count;
}
const phases = [
  [0, 0], [Math.PI/4,(1-Math.SQRT1_2)/2],
  [Math.PI/2,.5], [3*Math.PI/4,(1+Math.SQRT1_2)/2],
  [Math.PI,1], [5*Math.PI/4,(1+Math.SQRT1_2)/2],
  [3*Math.PI/2,.5], [7*Math.PI/4,(1-Math.SQRT1_2)/2],
  [2*Math.PI,0]
];
for(const [theta,want] of phases) {
  const got=fraction(theta);
  assert.ok(Math.abs(got-want)<.035, 'phase illuminated fraction '+theta+' '+got+' vs '+want);
}
fraction(Math.PI/4);
assert.equal(isDay(110,110),false,'waxing crescent must not look like a full disk');
assert.equal(isDay(207,110),true,'waxing crescent lights the RIGHT limb');
assert.equal(isDay(13,110),false,'waxing crescent left limb dark');
fraction(3*Math.PI/4);
assert.equal(isDay(110,110),true,'waxing gibbous center lit');
assert.equal(isDay(13,110),false,'waxing gibbous left limb dark');
fraction(Math.PI/2);
assert.equal(isDay(160,110),true,'first quarter bright on right');
assert.equal(isDay(60,110),false,'first quarter dark on left');
fraction(3*Math.PI/2);
assert.equal(isDay(60,110),true,'last quarter bright on left');
assert.equal(isDay(160,110),false,'last quarter dark on right');

const data=await import('data:text/javascript,'+encodeURIComponent(source('assets/js/planet-data.js')));
const planets=data.PLANETS;
assert.equal(planets.length,8);
const sunRadius=4.6;
assert.ok(planets[0].orbit-planets[0].r>sunRadius,'Mercury clears visible Sun');
for(let i=1;i<planets.length;i++){
  const inner=planets[i-1],outer=planets[i];
  const innerOuterRadius=inner.name==='Saturn'?5.5:inner.r;
  const outerOuterRadius=outer.name==='Saturn'?5.5:outer.r;
  assert.ok(outer.orbit-inner.orbit>innerOuterRadius+outerOuterRadius+.5,
    'no orbital annulus overlap for '+inner.name+'/'+outer.name);
}
const scene=source('assets/js/scene.js');
assert.match(scene,/orbitRing\(p\.orbit, 0x8095a9, 0\.82\)/,'visible orbit paths');
assert.match(scene,/new THREE\.Vector3\(0, 155, \.1\)/,'top view camera contains outer orbit');
const maxRadius=planets.at(-1).orbit+planets.at(-1).r;
assert.ok(155*Math.tan(44*Math.PI/360)>maxRadius*1.1,'top view fits Neptune + safety margin');
const page=source('public/moon/phases/index.html');
assert.ok(page.includes('curved day–night boundary is on the Moon itself'));
assert.ok(page.includes('rel="canonical"') && page.includes('application/ld+json'));
const home=source('public/index.html');
assert.ok(home.includes('ORBIT PATHS SHOWN')&&home.includes('rel="canonical"'));
const distance=source('public/solar-system/distance-scale/index.html');
assert.ok(distance.includes('50 scene units')&&distance.includes('50-unit illustrative ruler'));
console.log('Jeff Adkins feedback regression PASS: 9 lunar illumination fractions, waxing/waning orientation, no overlapping model orbits, top view framing, static SEO.');
