#!/usr/bin/env node
// Dependency-free P1 interaction and semantic regression for planet interiors / stellar pathways.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

class Node {
  constructor(textContent='') {
    this.textContent=textContent; this.dataset={}; this.attrs={}; this.listeners=new Map();
    this.classList={toggle:()=>{}}; this.disabled=false; this.innerHTML='';
  }
  setAttribute(key,value){this.attrs[key]=String(value);}
  getAttribute(key){return this.attrs[key];}
  addEventListener(type,fn){this.listeners.set(type,fn);}
  fire(type,target=this){assert.ok(this.listeners.has(type),`no ${type} listener`);this.listeners.get(type)({target});}
  closest(){return this;}
}
function evaluate(file,doc) {
  const src=readFileSync(file,'utf8').replace("import { initQuiz } from './quiz-widget.js';",'const initQuiz=()=>{};');
  runInNewContext(src,{document:doc,console});
}
function makePlanet() {
  const cards=Object.fromEntries(['rocky','gas','ice'].map(k=>[k,new Node()]));
  const outputs=Object.fromEntries(['Rocky','Gas','Ice'].flatMap(prefix=>
    ['Region','Description','Evidence'].map(s=>[`#ptype${prefix}${s}`,new Node()])));
  const buttons=['outer','deep','center'].map(key=>{const b=new Node();b.dataset.planetDepth=key;return b;});
  const explorer={
    querySelectorAll(sel){assert.equal(sel,'[data-planet-depth]');return buttons;},
    querySelector(sel) {
      const card=/^\[data-planet="(.*?)"\]$/.exec(sel);
      return card ? cards[card[1]] : outputs[sel];
    },
  };
  evaluate('assets/js/planet-types.js',{querySelector:(sel)=>sel==='#planetInteriorExplorer'?explorer:null});
  function select(name){buttons.find(b=>b.dataset.planetDepth===name).fire('click');}
  select('deep');
  assert.equal(outputs['#ptypeGasRegion'].textContent,'Hydrogen under extreme pressure');
  assert.match(outputs['#ptypeIceDescription'].textContent,/hot|Hot/);
  assert.equal(cards.rocky.dataset.focus,'deep');
  assert.equal(buttons[1].getAttribute('aria-pressed'),'true');
  select('center');
  assert.match(outputs['#ptypeGasDescription'].textContent,/diffuse/);
  assert.match(outputs['#ptypeRockyDescription'].textContent,/liquid iron-rich outer core/);
  assert.match(outputs['#ptypeIceEvidence'].textContent,/no direct interior measurements/);
  assert.equal(cards.ice.dataset.focus,'center');
  assert.equal(buttons.filter(b=>b.getAttribute('aria-pressed')==='true').length,1);
}
function makeStars(){
  const toggleButtons=['sun','massive'].map(key=>{const b=new Node();b.dataset.mass=key;return b;});
  const toggle=new Node();toggle.querySelectorAll=()=>toggleButtons; toggle.contains=()=>true;
  const stages=new Node();stages.contains=()=>true;
  const steps=Array.from({length:6},(_,i)=>{const b=new Node();b.dataset.stage=String(i);b.focus=()=>{b.focused=true;};return b;});
  stages.querySelectorAll=()=>steps;
  stages.querySelector=(sel)=>{const n=/data-stage="([0-9]+)"/.exec(sel);return n?steps[Number(n[1])]:null;};
  const refs=Object.fromEntries(['#massToggle','#lifeStages','#lifeStageCount','#lifeStageTitle','#lifeStageDescription','#lifeStageCause','#lifePrevious','#lifeNext'].map(k=>[k,new Node()]));
  refs['#massToggle']=toggle; refs['#lifeStages']=stages;
  evaluate('assets/js/star-life-cycle.js',{querySelector:(sel)=>{assert.ok(refs[sel],sel);return refs[sel];}});
  const selected=(stage)=>{const b=new Node();b.dataset.stage=String(stage);stages.fire('click',b);};
  assert.match(refs['#lifeStageTitle'].textContent,/Nebula/);
  assert.equal(refs['#lifePrevious'].disabled,true);
  selected(4);
  assert.match(refs['#lifeStageTitle'].textContent,/Planetary nebula/);
  assert.equal(steps[4].getAttribute('aria-pressed'),'true');
  toggle.fire('click',toggleButtons[1]);
  assert.match(refs['#lifeStageTitle'].textContent,/Core collapse/);
  assert.match(refs['#lifeStageCount'].textContent,/Stage 5 of 6 · Massive/);
  assert.equal(toggleButtons[1].getAttribute('aria-pressed'),'true');
  refs['#lifeNext'].fire('click');
  assert.match(refs['#lifeStageTitle'].textContent,/Compact remnant/);
  assert.equal(refs['#lifeNext'].disabled,true);
  toggle.fire('click',toggleButtons[0]);
  assert.match(refs['#lifeStageTitle'].textContent,/White dwarf/);
  refs['#lifePrevious'].fire('click');
  assert.match(refs['#lifeStageTitle'].textContent,/Planetary nebula/);
}
makePlanet();
makeStars();
for (const [path,words] of [
  ['solar-system/planet-types',['Conceptual cross-sections','What the interior comparison means','Jupiter','Neptune','NASA Jupiter']],
  ['stars/life-cycle',['representative pathways','~10 billion years','Only a few million years','planetary nebula','NASA Diagram']],
]) {
  const html=readFileSync(`public/${path}/index.html`,'utf8');
  for (const term of words) assert.ok(html.toLowerCase().includes(term.toLowerCase()),`${path}: missing ${term}`);
  assert.match(html,/rel="canonical"/);
  assert.match(html,/type="application\/ld\+json"/);
  assert.match(html,/<h1>[^<]+<\/h1>/);
  assert.ok(!html.includes('data-teacher-share'),`${path} unintentionally enrolled teacher experiment`);
}
console.log('P1 interiors + stellar stages: data, controls, static explanations and SEO checks passed.');
