#!/usr/bin/env node
// Pluto IAU classification now has a genuine explanatory, static-first comparison diagram.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync('public/solar-system/pluto-dwarf-planet/index.html','utf8');
const source = readFileSync('assets/js/pluto-dwarf-planet.js','utf8');
for (const marker of [
  'id="ruleNeighborhoodDiagram"', 'id="ruleModelDominant"', 'id="ruleModelShared"',
  'id="ruleNeighborHeading"', 'id="ruleRegionContext"', 'id="ruleInitNote"',
  'Conceptual relationship diagram, not an orbital map', 'Marker numbers',
  'science.nasa.gov/solar-system/kuiper-belt/facts/', 'iauarchive.eso.org/administration/resolutions/ga2006/'
]) assert.ok(html.includes(marker), 'Missing static Pluto model evidence ' + marker);
assert.equal((html.match(/data-planet-rule="[^"]+" disabled/g)||[]).length,5,'Choices must wait until JS ready.');
assert.match(html, /id="ruleModelDominant" display="none"/);
assert.match(html, /id="ruleNeighborHeading">Pluto/);
assert.ok(html.includes('role="img" aria-labelledby="ruleNeighborTitle ruleNeighborDesc"'));
assert.ok(!html.includes('thousands of similarly sized icy bodies'));
for(const marker of ['rel="canonical"','application/ld+json','<h1>','{{AD_PRIMARY}}']) {
  if (marker.startsWith('{{')) continue;
  assert.ok(html.includes(marker),'SEO missing '+marker);
}
assert.equal((html.match(/<h1>/g)||[]).length,1);

class E {
  constructor(){this.attrs={};this.dataset={};this.disabled=true;this.hidden=false;this.textContent='';this.listeners={};this.flags=new Set();this.classList={toggle:(name,truth)=>truth?this.flags.add(name):this.flags.delete(name)};}
  setAttribute(name,value){this.attrs[name]=String(value);}
  getAttribute(name){return this.attrs[name];}
  addEventListener(event, fn){this.listeners[event]=fn;}
  click(){assert.equal(this.disabled,false,'choice should be enabled');this.listeners.click();}
}
const els=new Map();
function find(name){if(!els.has(name))els.set(name,new E());return els.get(name);}
const names=['Earth','Neptune','Pluto','Ceres','Eris'];
const buttons=names.map(name=>{const el=new E();el.dataset.planetRule=name;return el;});
const root={querySelector:find,querySelectorAll:()=>buttons};
const document={querySelector:()=>root};
const beforeQuiz=source.split('initQuiz([')[0].replace(/^import .*;\s*$/gm,'');
runInNewContext(beforeQuiz,{document});
assert.equal(find('#ruleNeighborHeading').textContent,'Pluto · shares its orbital region');
assert.equal(find('#ruleModelShared').getAttribute('display'),'inline');
assert.equal(find('#ruleModelDominant').getAttribute('display'),'none');
assert.match(find('#ruleClassification').textContent,/Pluto: dwarf planet/);
assert.equal(find('#ruleInitNote').hidden,true);
for(const btn of buttons)assert.equal(btn.disabled,false);
buttons[0].click();
assert.equal(find('#ruleNeighborHeading').textContent,'Earth · dominant planet');
assert.equal(find('#ruleModelDominant').getAttribute('display'),'inline');
assert.equal(find('#ruleModelShared').getAttribute('display'),'none');
assert.match(find('#ruleRegionContext').textContent,/small objects can remain/);
assert.match(find('#ruleClassification').textContent,/Earth: planet/);
assert.equal(buttons[0].getAttribute('aria-pressed'),'true');
buttons[2].click();
assert.equal(find('#ruleModelShared').getAttribute('display'),'inline');
assert.equal(buttons[0].getAttribute('aria-pressed'),'false');
assert.equal(buttons[2].getAttribute('aria-pressed'),'true');
buttons[3].click();
assert.match(find('#ruleRegionContext').textContent,/asteroid belt/);
buttons[4].click();
assert.match(find('#ruleRegionContext').textContent,/trans-Neptunian/);
buttons[1].click();
assert.match(find('#ruleRegionContext').textContent,/resonances/);
assert.match(find('#ruleNeighborDesc').textContent,/not measured or drawn to scale/);
console.log('Pluto schematic comparison, five selectable IAU states, no-JS static diagram, and SEO: PASS');
