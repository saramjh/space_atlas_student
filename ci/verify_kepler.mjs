#!/usr/bin/env node
// Actual source-unit Kepler interaction and static SEO checks.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

class Element {
  constructor(){this.attrs={};this.handlers={};this.value='';this.textContent='';this.innerHTML='';}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k];}
  addEventListener(type,cb){this.handlers[type]=cb;}
}
const db=new Map();
const get=(k)=>{if(!db.has(k))db.set(k,new Element());return db.get(k);};
const lab={querySelector:get};
get('#keplerPlanetSelect').value='Earth';
get('#ageInput').value='12';
const src=readFileSync('assets/js/orbital-periods.js','utf8');
const parsed=src.replace(/^import .*;\s*$/gm,'');
const segment=parsed.slice(0,parsed.indexOf('initQuiz(['));
assert.ok(segment.length>0);
const planetData={};
runInNewContext(readFileSync('assets/js/planet-data.js','utf8').replace(/export const /g,'var ')+
  ';this.PLANETS=PLANETS;', planetData);
runInNewContext(segment,{
  document:{querySelector:k=>k==='#keplerLawLab'?lab:get(k)},
  PLANETS:planetData.PLANETS,
  console
});
assert.match(get('#keplerReadout').textContent,/Earth: semi-major axis ≈ 1.00 AU/);
const curve=get('#keplerCurve').getAttribute('d');
assert.ok(curve.split(' L ').length>=100,'curve must show full domain');
const earthX=Number(get('#keplerPlanetDot').getAttribute('cx'));
const earthY=Number(get('#keplerPlanetDot').getAttribute('cy'));
get('#keplerPlanetSelect').value='Mercury';get('#keplerPlanetSelect').handlers.change();
const mercuryX=Number(get('#keplerPlanetDot').getAttribute('cx'));
const mercuryY=Number(get('#keplerPlanetDot').getAttribute('cy'));
assert.ok(mercuryX<earthX && mercuryY>earthY,'Mercury nearer and faster orbit');
assert.match(get('#keplerReadout').textContent,/NASA orbital period ≈ 0.241 Earth years/);
get('#keplerPlanetSelect').value='Jupiter';get('#keplerPlanetSelect').handlers.change();
const jupiterX=Number(get('#keplerPlanetDot').getAttribute('cx'));
assert.ok(jupiterX>earthX);
assert.match(get('#keplerReadout').textContent,/11.86 Earth years/);
get('#keplerPlanetSelect').value='Neptune';get('#keplerPlanetSelect').handlers.change();
assert.ok(Number(get('#keplerPlanetDot').getAttribute('cx'))>jupiterX);
assert.match(get('#keplerReadout').textContent,/164.79 Earth years/);
get('#ageInput').value='16';
get('#ageInput').handlers.input();
assert.match(get('#ageGrid').innerHTML,/Neptune/);
const html=readFileSync('public/solar-system/orbital-periods/index.html','utf8');
for(const x of ['id="keplerLawLab"','id="keplerPlanetSelect"','Kepler\'s third law','logarithmic',
  'https://science.nasa.gov/solar-system/orbits-and-keplers-laws/',
  '88 Earth days','164.8 Earth years','rel="canonical"','type="application/ld+json"'])
    assert.ok(html.includes(x),'missing static text '+x);
assert.equal((html.match(/<h1>/g)||[]).length,1);
console.log('Kepler log graph, numeric readout, source/static fallback and SEO: PASS');
