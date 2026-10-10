#!/usr/bin/env node
// Deterministic zero-dependency evidence UI and SEO test.
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

class Stub {
  constructor(text='') { this.textContent=text; this.attrs={}; this.dataset={}; this.listeners=new Map(); this.hidden=true; }
  addEventListener(type,cb){ this.listeners.set(type,cb); }
  setAttribute(key,value){ this.attrs[key]=String(value); }
  getAttribute(key){ return this.attrs[key]; }
  click(){ assert.ok(this.listeners.has('click')); this.listeners.get('click')(); }
}
const modes=['compare','hubble','webb'];
const buttons=modes.map(mode=>{const e=new Stub();e.dataset.provenanceView=mode;return e;});
const fields=Object.fromEntries(['#provenanceInstrument','#provenanceTitle','#provenanceExplanation','#provenanceFilters'].map(id=>[id,new Stub()]));
const toolbar=new Stub();
toolbar.querySelectorAll=(selector)=>{assert.equal(selector,'[data-provenance-view]');return buttons;};
const lab=new Stub();
lab.querySelector=(selector)=>selector==='.provenance-controls' ? toolbar : fields[selector];
const doc={querySelector:(selector)=>selector==='#imageProvenanceLab' ? lab : null};
const source=readFileSync('assets/js/read-space-images.js','utf8');
const script=source.replace("import { initQuiz } from './quiz-widget.js';",'const initQuiz=()=>{};');
runInNewContext(script,{document:doc,console});
const selected=()=>buttons.filter(b=>b.getAttribute('aria-pressed')==='true');
assert.equal(toolbar.hidden,false);
assert.equal(lab.dataset.view,'compare');
assert.equal(selected().length,1);
buttons[1].click();
assert.equal(lab.dataset.view,'hubble');
assert.match(fields['#provenanceTitle'].textContent,/Visible light/);
assert.match(fields['#provenanceFilters'].textContent,/F502N/);
assert.equal(selected().length,1);
assert.equal(selected()[0].dataset.provenanceView,'hubble');
buttons[2].click();
assert.equal(lab.dataset.view,'webb');
assert.match(fields['#provenanceTitle'].textContent,/Near infrared/);
assert.match(fields['#provenanceFilters'].textContent,/F470N/);
assert.match(fields['#provenanceExplanation'].textContent,/wedge/);
buttons[0].click();
assert.match(fields['#provenanceExplanation'].textContent,/not how the scene changed between 2014 and 2022/);

const html=readFileSync('public/learn/read-space-images/index.html','utf8');
assert.match(html,/<h1>Is that space photo actually a photo\?<\/h1>/);
assert.match(html, /rel="canonical" href="https:\/\/saramjh.github.io\/space_atlas_student\/learn\/read-space-images\/"/);
assert.match(html, /type="application\/ld\+json"/);
assert.equal((html.match(/<details class="truth-disclosure">/g)||[]).length,3);
assert.match(html, /<table>[\s\S]*F502N[\s\S]*F090W[\s\S]*<\/table>/);
assert.match(html, /data-provenance-view="compare"/);
assert.match(html, /class="provenance-controls"[^>]*hidden/);
assert.match(html, /science\.nasa\.gov\/asset\/webb\/pillars-of-creation-hubble-and-webb-images-side-by-side/);
assert.match(html, /NASA, ESA, CSA, STScI/);
assert.match(html, /id="imageProvenanceLab"/);
const asset='public/assets/images/pillars-hubble-webb-compare.webp';
const buf=readFileSync(asset);
assert.equal(buf.toString('ascii',0,4),'RIFF');
assert.equal(buf.toString('ascii',8,12),'WEBP');
assert.ok(statSync(asset).size<250000,'image is larger than size gate');
console.log('P2 space-image provenance controls, source, fallback, SEO, and image budget passed.');
