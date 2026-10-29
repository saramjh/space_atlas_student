#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const src=p=>readFileSync(p,'utf8');
const code=src('assets/js/stellar-evolution-scene.js');
const controller=src('assets/js/star-life-cycle.js');
const html=src('public/stars/life-cycle/index.html');
const page=src('pages/stars/life-cycle/content.html');
for(const key of ['stellarCinema','stellarCinemaCanvas','stellarCinemaFallback','stellarCinemaProcess']){
 assert.match(page,new RegExp(`id="${key}"`));assert.match(html,new RegExp(`id="${key}"`));
}
assert.match(controller,/sceneEngine\?\.setStage\(stageIndex,selectedMass\)/);
assert.match(controller,/createStellarEvolutionScene/);
assert.match(controller,/PROCESS_LABELS/);
assert.match(html,/not observations, measured radii or a time-proportional record/);
assert.match(html,/type="application\/ld\+json"/);
assert.match(html,/rel="canonical"/);
let strokes=0,filled=0,rafCount=0,removal=0;
const gradient=()=>({addColorStop(){}});
const ctx=new Proxy({createRadialGradient:gradient,createLinearGradient:gradient,stroke(){strokes++},fill(){filled++}}, {
 get:(o,k)=>(k in o)?o[k]:()=>{},
 set:(o,k,v)=>{o[k]=v;return true;}
});
const canvas={width:0,height:0,getBoundingClientRect:()=>({width:800,height:340}),getContext:k=>k==='2d'?ctx:null};
const env={
 document:{hidden:false,addEventListener(){},removeEventListener(){removal++}},
 window:{devicePixelRatio:2},
 matchMedia:q=>({matches:q.includes('reduced-motion'),addEventListener(){},removeEventListener(){}}),
 ResizeObserver:class{observe(){}disconnect(){}},
 performance:{now:()=>100},
 requestAnimationFrame:()=>++rafCount,
 cancelAnimationFrame:()=>{},
 Math
};
const factory=runInNewContext(code.replace('export function createStellarEvolutionScene','function createStellarEvolutionScene')+';createStellarEvolutionScene',env);
const scene=factory(canvas);
assert.equal(canvas.width,1400,'1.75 DPR cap on desktop');
assert.ok(filled>100,'initial nebula rendered rather than static empty stage');
let before=strokes;scene.setStage(4,'sun');
assert.ok(strokes>before,'ejected nebula shells should be visibly stroked');
before=strokes;scene.setStage(4,'massive');
assert.ok(strokes>before+20,'core-collapse display should create visibly different radial debris');
scene.setStage(5,'massive');
scene.setStage(5,'sun');
assert.equal(rafCount,0,'reduced motion redraws without timed transition');
scene.dispose();
assert.ok(removal>0,'cleanup removes visibility observer');
console.log('STELLAR_CINEMATIC_STAGE_RENDER_AND_SEMANTIC_REGRESSION_PASS');
