#!/usr/bin/env node
// Scientific display truth contract: the rendering must agree with cited numeric claims.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=(p)=>readFileSync(p,'utf8');
const home=source('public/index.html');
const scale=source('public/learn/not-to-scale/index.html');
const names=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
const nasaRatios=[0.383,0.949,1,0.532,11.21,9.45,4.01,3.88];
for(const [path,html] of [['home',home],['scale',scale]]){
  // On the noninteractive scale page, planet item div nests a ball div,
  // so the per-item line is the safe extraction boundary, not the first closing div.
  const itemLines=html.split('\n').filter(line=>line.includes('class="planet-item'));
  assert.equal(itemLines.length,8,path+' must have eight separate planet elements');
  for(let i=0;i<8;i++){
    const line=itemLines[i],name=names[i];
    assert.ok(line.includes('<span>'+name),path+' missing planet label '+name);
    const dimensions=line.match(/class="ball" style="width:([\d.]+)px;height:([\d.]+)px;/);
    assert.ok(dimensions,path+' missing circular scale for '+name);
    const w=Number(dimensions[1]),h=Number(dimensions[2]);
    assert.ok(Math.abs(w-h)<1e-8,path+' sphere must be a circle');
    assert.ok(Math.abs(w/14-nasaRatios[i])<0.002,
      path+' '+name+' drawn diameter '+w+'px contradicts NASA Earth-relative ratio '+nasaRatios[i]);
  }
  assert.ok(html.includes('nssdc.gsfc.nasa.gov')||html.includes('science.nasa.gov/solar-system/planet-sizes'),path+' missing primary source');
}
assert.match(scale,/Diameter · linear scale/);
assert.match(scale,/Distance · logarithmic scale/);
assert.match(scale,/role="group" aria-label="Select which aspect is shown to scale"/);
assert.ok(!scale.includes('role="tablist"'));

const au=source('public/solar-system/astronomical-unit/index.html');
assert.ok(au.includes('149,597,870,700 metres'));
assert.ok(au.includes('149,597,870.7 km'));
assert.ok(au.includes('IAU2012_English.pdf'));
assert.equal((au.match(/aria-pressed="true"/g)||[]).length,1);
assert.match(source('assets/js/astronomical-unit.js'),/aria-pressed/);

const transit=source('public/exoplanets/transit-method/index.html');
const transitJS=source('assets/js/transit-method.js');
assert.ok(transit.includes('a planet candidate, not proof by itself'));
assert.ok(transit.includes('Eclipsing binary stars'));
assert.ok(transit.includes('35% illustrative dip'));
assert.ok(transit.includes('id="transitReadout"'));
assert.ok(transit.includes('Planet or impostor?'));
assert.ok(!transit.includes('a repeating one is a planet'));
assert.match(transitJS,/const TRANSIT_DEPTH = 0\.35/);
assert.match(transitJS,/readout\.textContent/);
assert.match(transitJS,/plotH \* 0\.72/);

const orbit=source('public/solar-system/gravity-and-orbits/index.html');
const orbitJS=source('assets/js/gravity-and-orbits.js');
assert.ok(orbit.includes('Launch speed (model units)'));
assert.ok(orbit.includes('id="orbitSpeedNote"'));
assert.ok(orbit.includes('~4.6 billion years'));
assert.ok(!orbit.includes('4.2 billion years'));
assert.match(orbitJS,/MAX_MODEL_STEPS = 900/);
assert.ok(!orbitJS.includes("statusEl.textContent = 'Orbiting!'"));
assert.ok(orbitJS.includes("document.addEventListener('visibilitychange'"));
for(const path of [
 'public/index.html','public/learn/not-to-scale/index.html',
 'public/solar-system/astronomical-unit/index.html',
 'public/exoplanets/transit-method/index.html',
 'public/solar-system/gravity-and-orbits/index.html'
]){
 const html=source(path);
 assert.ok(html.includes('rel="canonical"')&&html.includes('application/ld+json'),path+' SEO/static schema regression');
}
console.log('Science-truth/visual-scale PASS: 2 × 8 NASA planetary glyphs, IAU au, transit candidate/model, orbit units and 4.6 Ga, SEO.');
