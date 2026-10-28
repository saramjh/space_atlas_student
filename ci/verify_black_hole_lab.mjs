#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>readFileSync(p,'utf8');
const {blackHoleModel,SCHWARZSCHILD_RS_SOLAR_KM,CRITICAL_CURVE_RATIO}=await import('../assets/js/black-hole-model.js');
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,'Mismatch '+a+' != '+b);
near(CRITICAL_CURVE_RATIO,3*Math.sqrt(3)/2);
for(const mass of [1,10,1e3,1e6,1e9]){
 const m=blackHoleModel({massSolar:mass,elevationDeg:45});
 near(m.horizonRadiusKm,SCHWARZSCHILD_RS_SOLAR_KM*mass,1e-4*mass);
 near(m.criticalImpactParameterKm/m.horizonRadiusKm,CRITICAL_CURVE_RATIO);
 near(m.projectedDiskMinorMajorRatio,Math.SQRT1_2);
 assert.equal(m.kind,'Schwarzschild geometric illustration');
 assert.equal(m.photonsRayTraced,false);
}
for(const angle of [15,30,45,60,80])near(blackHoleModel({massSolar:10,elevationDeg:angle}).projectedDiskMinorMajorRatio,Math.sin(angle*Math.PI/180));
for(const bad of [-1,0,1e10,Number.NaN])assert.throws(()=>blackHoleModel({massSolar:bad,elevationDeg:45}),RangeError);
for(const bad of [-1,0,90,Number.NaN])assert.throws(()=>blackHoleModel({massSolar:10,elevationDeg:bad}),RangeError);
const page=load('pages/black-holes/content.html'),script=load('assets/js/black-holes.js'),style=load('assets/css/style.css'),built=load('public/black-holes/index.html');
for(const id of ['bhActivate','bhCanvas','bhFallback','bhElevation','bhMassExponent','bhAnimate','bhReset','bhReadout','bhScienceNote','bhGuide']){
 assert.ok(page.includes('id="'+id+'"'),'missing '+id);
 assert.ok(built.includes('id="'+id+'"'),'built missing '+id);
}
assert.match(page,/gravitational lensing[\s\S]*not ray.traced/i);
assert.match(page,/Event horizon is not a photographed surface/i);
assert.match(page,/NASA/);
assert.match(page,/id="bhCanvas"[^>]*hidden/);
assert.match(page,/id="bhElevation"[^>]*type="range"/);
assert.match(script,/import\('three'\)/);
assert.match(script,/requestAnimationFrame/);
assert.match(script,/prefers-reduced-motion/);
assert.match(script,/visibilitychange/);
assert.match(script,/animateButton\.disabled/);
assert.match(script,/renderer\.render/);
assert.match(style,/\.bh-scene/);
assert.match(built,/rel="canonical"/);
assert.match(built,/application\/ld\+json/);
assert.match(built,/adsbygoogle/);
assert.doesNotMatch(page,/<circle cx="200" cy="120" r="6" fill="#fff"/);
console.log('BLACK_HOLE_LAB_TDD_PASS geometry, opt-in view and motion, labels, fallback, SEO');
