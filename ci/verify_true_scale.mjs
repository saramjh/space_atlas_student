#!/usr/bin/env node
// Both comparison pages must preserve an actual single physical scale.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const earthKm=12756, moonKm=3474, meanKm=384400;
const scaleKmPerPx=earthKm/60;
const at=(km)=>30+km/scaleKmPerPx-8;
assert.ok(Math.abs(at(meanKm)-1830.09)<0.01);
assert.ok(at(363300)<at(meanKm) && at(meanKm)<at(405500));
assert.ok(Math.abs((moonKm/earthKm)*60-16)<1);

const dataSource=readFileSync('assets/js/planet-data.js','utf8')
 .replace(/export const /g,'var ');
const dataSandbox={};
runInNewContext(dataSource+';this.PLANETS=PLANETS;this.SCALE_DATA=SCALE_DATA;',dataSandbox);
assert.equal(dataSandbox.PLANETS.length,8);
const size=(name)=>Number(dataSandbox.PLANETS.find(p=>p.name===name).diameter.replace(/[^\d]/g,''));
assert.ok(Math.abs(size('Jupiter')/size('Earth')-11.21)<0.02);

class Item{
 constructor(){this.style={};this.dataset={};this.attrs={};this.listeners=new Map();this.textContent='';this.classList={add(){},remove(){}};this.value='';this.disabled=false;this.scrollWidth=2030;this.clientWidth=290;this.offsetLeft=1830;this.innerHTML='';}
 addEventListener(type,fn){this.listeners.set(type,fn);}
 setAttribute(k,v){this.attrs[k]=String(v);}
 getAttribute(k){return this.attrs[k];}
 click(){this.listeners.get('click')?.();}
 scrollTo(args){this.lastScroll=args;}
 add(item){(this.options||=[]).push(item);}
}
function load(path,doc,extras={}){
 const source=readFileSync(path,'utf8')
   .replace(/^import .*;\s*$/gm,'')
   .replace('initQuiz([','void ([')
   .replace(/\], \{\}\);?\s*$/,']);')
   .replace('], {});',']);');
 // Native end-of-module quiz stub for this physics/UI test.
 const start=source.indexOf('void ([');
 const code=start>=0?source.slice(0,start):source;
 runInNewContext(code,{document:doc,window:{matchMedia:()=>({matches:true})},ResizeObserver:class{observe(){}},Option:class{constructor(name,id){this.text=name;this.value=id;}},PLANETS:dataSandbox.PLANETS,SCALE_DATA:dataSandbox.SCALE_DATA,console,...extras});
}
{
 const e=new Map();
 for(const k of ['#emscaleScroll','#emscaleFade','#emscaleCue','#emscaleMoon','#emscaleMoonLabel','#emscaleDistanceReadout','#emscaleToEarth','#emscaleToMoon'])e.set(k,new Item());
 const b=[363300,384400,405500].map(n=>{const x=new Item();x.dataset.emscaleDistance=String(n);return x;});
 const doc={querySelector:(k)=>e.get(k),querySelectorAll:(k)=>k==='[data-emscale-distance]'?b:[]};
 load('assets/js/earth-moon-scale.js',doc);
 assert.ok(Math.abs(parseFloat(e.get('#emscaleMoon').style.left)-1830.09)<0.02);
 b[0].click();assert.ok(parseFloat(e.get('#emscaleMoon').style.left)<1830);
 b[2].click();assert.ok(parseFloat(e.get('#emscaleMoon').style.left)>1920);
 assert.equal(b[2].attrs['aria-pressed'],'true');
 e.get('#emscaleToMoon').click();assert.ok(e.get('#emscaleScroll').lastScroll.left>1000);
 e.get('#emscaleToEarth').click();assert.equal(e.get('#emscaleScroll').lastScroll.left,0);
}
{
 const ids=new Map();
 for(const k of ['#planetA','#planetB','#compareStage','#compareStats','#compareRuler'])ids.set(k,new Item());
 ids.get('#compareStage').clientWidth=280;
 const buttons=[];
 const doc={querySelector:(k)=>ids.get(k),querySelectorAll:()=>buttons};
 load('assets/js/planet-size-comparison.js',doc);
 const st=ids.get('#compareStage');
 const renderedDiameters=()=>Array.from(st.innerHTML.matchAll(/width:([\d.]+)px;height:([\d.]+)px/g),a=>+a[1]);
 let [a,b]=renderedDiameters();
 assert.ok(Math.abs(b/a-size('Jupiter')/size('Earth'))<0.001);
 assert.ok(a+b+12<=280);
 assert.match(ids.get('#compareRuler').textContent,/142,984 km/);
 ids.get('#planetA').value=4;ids.get('#planetB').value=5;
 ids.get('#planetB').listeners.get('change')();
 [a,b]=renderedDiameters();
 assert.ok(Math.abs(a/b-size('Jupiter')/size('Saturn'))<0.001);
 assert.ok(a+b+12<=280);
}
for(const [p,parts] of [
 ['moon/earth-moon-scale',['id="emscaleToMoon"','id="emscaleMoon"','384,400 km','do <em>not</em> literally','NASA GSFC']],
 ['solar-system/planet-size-comparison',['id="compareRuler"','one linear diameter scale','not literal sphere packing','mean-radius-derived']]
]){
 const html=readFileSync('public/'+p+'/index.html','utf8');
 for(const part of parts)assert.ok(html.includes(part),p+' missing '+part);
 assert.match(html,/rel="canonical"/);
 assert.ok(html.includes('application/ld+json'));
}
console.log('True-scale Earth-Moon + planet diameter comparisons and static SEO: PASS');
