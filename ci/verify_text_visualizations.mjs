#!/usr/bin/env node
// Test actual page-specific model code with dependency-free DOM fakes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
class El {
 constructor(){this.dataset={};this.attrs={};this.listeners=new Map();this.children=[];this.value='';this.textContent='';this.innerHTML='';this.disabled=false;this.classList={toggle(){},add(){},remove(){}};}
 setAttribute(k,v){this.attrs[k]=String(v);}
 getAttribute(k){return this.attrs[k];}
 addEventListener(k,fn){this.listeners.set(k,fn);}
 fire(k){assert.ok(this.listeners.has(k),k);this.listeners.get(k)();}
 appendChild(n){this.children.push(n);}
}
function evaluate(path,doc){
 const script=readFileSync(path,'utf8').replace(/^import .*;\s*$/gm,'');
 const at=script.indexOf('initQuiz([');
 assert.ok(at>0,'quiz entry marker missing');
 runInNewContext(script.slice(0,at),{document:doc,console});
}
function store(){
 const m=new Map();
 const get=k=>{if(!m.has(k))m.set(k,new El());return m.get(k);};
 return get;
}
{
 const get=store();
 const choices=[0,60,80].map(deg=>{const e=new El();e.dataset.galaxyAngle=String(deg);return e;});
 evaluate('assets/js/galaxy-types.js',{querySelector:get,querySelectorAll:q=>{assert.equal(q,'[data-galaxy-angle]');return choices;}});
 assert.match(get('#galaxyAngleOutput').textContent,/axis ratio ≈ 1.00/);
 choices[2].fire('click');
 assert.match(get('#galaxyTiltDisk').getAttribute('transform'),/scale\(1 0.1736\)/);
 assert.match(get('#galaxyAngleOutput').textContent,/did not change type/);
 assert.equal(choices[2].getAttribute('aria-pressed'),'true');
 get('#galaxyInclination').value='60';get('#galaxyInclination').fire('input');
 assert.match(get('#galaxyTiltDisk').getAttribute('transform'),/scale\(1 0.5000\)/);
}
{
 const get=store();
 const controls=['Earth','Neptune','Pluto','Ceres','Eris'].map(name=>{const e=new El();e.dataset.planetRule=name;return e;});
 const lab={querySelector:get,querySelectorAll:()=>controls};
 evaluate('assets/js/pluto-dwarf-planet.js',{querySelector:k=>k==='#planetRuleExplorer'?lab:null});
 assert.match(get('#ruleClassification').textContent,/Pluto: dwarf planet/);
 controls[0].fire('click');
 assert.match(get('#ruleClassification').textContent,/Earth: planet/);
 assert.equal(get('#ruleClearedMark').textContent,'✓');
 assert.equal(controls[0].getAttribute('aria-pressed'),'true');
 controls[4].fire('click');
 assert.match(get('#ruleClassification').textContent,/Eris: dwarf planet/);
 assert.equal(get('#ruleClearedMark').textContent,'✗');
 assert.equal(controls.filter(x=>x.getAttribute('aria-pressed')==='true').length,1);
}
{
 const get=store();
 evaluate('assets/js/milky-way.js',{querySelector:get,createElement:()=>new El()});
 assert.equal(get('#mwExplorerMark').getAttribute('cx'),'160');
 get('#mwShowSun').fire('click');
 assert.equal(get('#mwDistanceSlider').value,'26000');
 assert.equal(get('#mwExplorerMark').getAttribute('cx'),'226.56');
 assert.match(get('#mwAddressReadout').textContent,/52%/);
 get('#mwDistanceSlider').value='50000';get('#mwDistanceSlider').fire('input');
 assert.equal(get('#mwExplorerMark').getAttribute('cx'),'288');
 get('#mwDistanceSlider').value='0';get('#mwDistanceSlider').fire('input');
 assert.equal(get('#mwExplorerMark').getAttribute('cx'),'160');
}
for(const [slug,parts] of [
 ['galaxies/types',['galaxyInclination','galaxyTiltDisk','geometric projection','NASA Science — Types of Galaxies','class="galaxy-example"']],
 ['galaxies/milky-way',['mwAddressLab','mwSunMark','mwDistanceSlider','26,000 light-years','NASA Goddard']],
 ['solar-system/pluto-dwarf-planet',['planetRuleExplorer','ruleClassification','IAU Resolution 5A','criterion about gravitational dominance']]
]){
 const html=readFileSync('public/'+slug+'/index.html','utf8');
 for(const part of parts)assert.ok(html.includes(part),slug+' missing '+part);
 assert.match(html,/<h1>[^<]+<\/h1>/);
 assert.ok(html.includes('rel="canonical"'));
 assert.ok(html.includes('type="application/ld+json"'));
}
console.log('New text-to-interactive learning components, state, evidence, SEO: PASS');
