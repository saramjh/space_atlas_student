#!/usr/bin/env node
// The radius must be the *actual* center-to-surface segment in every state,
// not a visually displaced line justified by a caption.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const html=read('pages/solar-system/gravity-comparison/content.html');
const built=read('public/solar-system/gravity-comparison/index.html');
const staticMatch=html.match(/<line id="gravityRadiusLine"\s+x1="([\d.]+)"\s+y1="([\d.]+)"\s+x2="([\d.]+)"\s+y2="([\d.]+)"[^>]*\/>/);
assert.ok(staticMatch,'radius segment must exist as crawlable initial SVG');
assert.deepEqual(staticMatch.slice(1).map(Number),[92,100,99.5,100]);
assert.match(html,/<circle id="gravityBody" cx="92" cy="100" r="7.5"/);
assert.match(html,/<circle id="gravityCenterPoint" cx="92" cy="100"/);
assert.match(html,/<circle id="gravityTestPoint" cx="99.5" cy="100"/);
assert.match(html,/id="gravityRadiusDiagramLabel" x="109.5" y="8[0-9]"/);
assert.doesNotMatch(html,/offset downward for visibility|but is offset downward/);
assert.match(html,/gold line connects the black center point to the rust-red surface point/i);
assert.match(built,/id="gravityRadiusLine"/);
class FakeElement {
 constructor(value=''){this.value=String(value);this.textContent='';this.attributes={};this.listeners=new Map();this.disabled=true;this.dataset={};}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
 addEventListener(name,fn){this.listeners.set(name,fn);}
 fire(name='input'){this.listeners.get(name)?.();}
}
const ids=['weightInput','weightUnit','weightGrid','gravityMechanism','gravityMass','gravityRadius','gravityMassValue','gravityRadiusValue','gravityNumerator','gravityDenominator','gravityModelResult','gravityBody','gravityRadiusLine','gravityCenterPoint','gravityTestPoint','gravityArrowLine','gravityRadiusDiagramLabel','gravityCauseDiagram','gravityModelExplanation','gravityModelInitNote'];
const nodes=new Map(ids.map(id=>[id,new FakeElement()]));
nodes.get('weightInput').value='45';nodes.get('weightUnit').value='kg';nodes.get('gravityMass').value='1';nodes.get('gravityRadius').value='1';
const scenarios=['earth','mass','radius','jupiter'].map(name=>Object.assign(new FakeElement(),{dataset:{gravityScenario:name}}));
const mechanism=nodes.get('gravityMechanism');
mechanism.querySelector=selector=>nodes.get(selector.slice(1));
mechanism.querySelectorAll=selector=>selector==='[data-gravity-scenario]'?scenarios:[];
const document={querySelector:selector=>nodes.get(selector.slice(1))};
const original=read('assets/js/gravity-comparison.js');
const code=original.replace(/^import[^\n]*\n/gm,'').split('\ninitQuiz([')[0];
runInNewContext(code,{document,PLANETS:[{name:'Earth',gravity:1}],console});
function testGeometry(mass,radius){
 nodes.get('gravityMass').value=String(mass);
 nodes.get('gravityRadius').value=String(radius);
 nodes.get('gravityRadius').fire();
 const get=id=>nodes.get(id);
 const bodyRadius=Number(get('gravityBody').getAttribute('r'));
 const end=92+radius*7.5;
 assert.ok(Math.abs(bodyRadius-radius*7.5)<0.011);
 assert.equal(Number(get('gravityRadiusLine').getAttribute('x2')),Number(end.toFixed(2)));
 assert.equal(Number(get('gravityTestPoint').getAttribute('cx')),Number(end.toFixed(2)));
 assert.equal(Number(get('gravityRadiusDiagramLabel').getAttribute('x')),Number((end+10).toFixed(2)));
 assert.match(get('gravityRadiusDiagramLabel').textContent,/Radius: .*× Earth/);
 assert.match(get('gravityCauseDiagram').getAttribute('aria-label'),/gold radius line connects center and surface/);
 assert.ok(Math.abs(mass/(radius*radius)-Number(get('gravityModelResult').textContent.split('×')[0]))<.006);
}
for(const [mass,radius] of [[1,1],[4,1],[1,2],[317.8,11.21],[50,9.64],[100,12]])testGeometry(mass,radius);
for(const scenario of scenarios){scenario.fire('click');assert.equal(scenario.getAttribute('aria-pressed'),'true');}
console.log('GRAVITY_RADIUS_CENTER_SURFACE_GEOMETRY_AND_SCENARIOS_PASS');
