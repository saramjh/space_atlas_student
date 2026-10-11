#!/usr/bin/env node
// Validate the actual page modules, scientific invariants, fallback and SEO.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
class E {
  constructor(value=''){this.value=value;this.dataset={};this.style={};this.attrs={};this.textContent='';this.innerHTML='';this.listeners=new Map();this.classList={toggle(){},add(){},remove(){}};}
  addEventListener(event, fn){this.listeners.set(event, fn);}
  fire(event){assert.ok(this.listeners.has(event), event);this.listeners.get(event)();}
  setAttribute(key,val){this.attrs[key]=String(val);}
  getAttribute(key){return this.attrs[key];}
}
const data={};
const dataJS=readFileSync('assets/js/planet-data.js','utf8').replaceAll('export const ', 'var ');
runInNewContext(dataJS+';this.PLANETS=PLANETS;',data);
function evaluate(path, document, skipQuiz=false){
  let src=readFileSync(path,'utf8').replace(/^import .*;\s*$/gm,'');
  const pos=src.indexOf('initQuiz([');
  if(pos!==-1){
    if(skipQuiz)src=src.slice(0,pos);
    else {
      const end=src.indexOf('], {});',pos);
      assert.ok(end>pos,'quiz terminator');
      src=src.slice(0,pos)+src.slice(end+7);
    }
  }
  runInNewContext(src, {document,PLANETS:data.PLANETS,console});
}
function store(){
  const db=new Map();
  return (name)=>{if(!db.has(name))db.set(name,new E());return db.get(name);};
}
// Signed Celsius plot: consistent -250..500 axis, NASA figures, choice readout.
{
 const get=store();
 get('#tempCompareA').value='Mercury';get('#tempCompareB').value='Venus';
 evaluate('assets/js/temperature-comparison.js',{querySelector:get},true);
 assert.match(get('#tempCompareReadout').textContent,/297°C warmer/);
 assert.match(get('#tempChart').innerHTML,/Neptune/);
 const mercuryBar=get('#tempChart').innerHTML.match(/Mercury[\s\S]*?left:([\d.]+)%;width:([\d.]+)%/);
 assert.ok(mercuryBar);
 assert.ok(Math.abs(Number(mercuryBar[1])-33.3333)<.01);
 assert.ok(Math.abs(Number(mercuryBar[2])-167/750*100)<.01);
 get('#tempCompareA').value='Neptune';get('#tempCompareA').fire('change');
 assert.match(get('#tempCompareReadout').textContent,/atmosphere at ~1 bar/);
 assert.match(get('#tempCompareReadout').textContent,/Neptune/);
}
// NOAA 2:1 tidal force approximation: 0° adds, 90° subtracts, mid changes.
{
 const get=store();
 get('#tideAngle').value='0';
 const presets=[0,45,90].map(deg=>{const el=new E();el.dataset.tideAngle=String(deg);return el;});
 evaluate('assets/js/tides.js',{querySelector:get,querySelectorAll:()=>presets},true);
 assert.match(get('#tideModelReadout').textContent,/100%/);
 assert.match(get('#tideBulgeShape').getAttribute('d'),/^M /);
 presets[2].fire('click');
 assert.equal(get('#tideAngle').value,'90');
 assert.match(get('#tideModelReadout').textContent,/33%/);
 assert.equal(get('#tideMoonMarker').getAttribute('cy'),'17.00');
 assert.equal(presets[2].getAttribute('aria-pressed'),'true');
 get('#tideAngle').value='45';get('#tideAngle').fire('input');
 assert.match(get('#tideModelReadout').textContent,/Intermediate alignment/);
 get('#btnSpring').onclick();
 assert.equal(get('#tideAngle').value,'0');
}
// Linked actual AU and illustrative code scene-unit distances.
{
 const get=store();
 get('#distanceFocusPlanet').value='Earth';
 get('#modelEarthDistance').value='1';get('#modelDistanceUnit').value='m';
 evaluate('assets/js/distance-scale.js',{querySelector:get},false);
 assert.equal(get('#distancePhysicalMarker').style.left,'3.3278%');
 assert.equal(get('#distanceSceneMarker').style.left,'31.1111%');
 assert.match(get('#distanceFocusReadout').textContent,/1.00 AU/);
 get('#distanceFocusPlanet').value='Neptune';get('#distanceFocusPlanet').fire('change');
 assert.equal(get('#distancePhysicalMarker').style.left,'100.0000%');
 assert.equal(get('#distanceSceneMarker').style.left,'100.0000%');
 get('#distanceFocusPlanet').value='Mercury';get('#distanceFocusPlanet').fire('change');
 assert.equal(get('#distancePhysicalMarker').style.left,(100*.39/30.05).toFixed(4)+'%');
}
const pages=[
 ['solar-system/temperature-comparison',['tempCompareLab','temp-facts-table','1 bar','NASA Solar System Temperatures']],
 ['moon/tides',['tideEquilibriumLab','tideAngle','not an ocean-height forecast','NOAA']],
 ['solar-system/distance-scale',['distanceFocusLab','distancePhysicalMarker','distanceSceneMarker','not AU, kilometers']]
];
for (const [route,parts] of pages) {
 const html=readFileSync('public/'+route+'/index.html','utf8');
 for(const part of parts)assert.ok(html.includes(part),'Missing '+route+' '+part);
 assert.equal((html.match(/<h1>/g)||[]).length,1);
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
 assert.equal((html.match(/type="application\/ld\+json"/g)||[]).length,1);
}
console.log('Science-led temperature/tides/solar-distance interactive tests PASS');
