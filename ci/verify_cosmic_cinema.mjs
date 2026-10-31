#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const src=p=>readFileSync(p,'utf8');
const html=src('public/universe/scale/index.html');
const page=src('pages/universe/scale/content.html');
const moduleText=src('assets/js/cosmic-cinema.js');
const controller=src('assets/js/universe-scale.js');
assert.match(page,/id="zoomCinemaActivate"[^>]+disabled/);
assert.match(page,/id="zoomStage" aria-live="polite" aria-atomic="true"/);
assert.match(page,/id="zoomStageCopy"/);
assert.match(page,/id="zoomCinemaCanvas" tabindex="0"/);
assert.match(html,/artist's conceptual illustration/);
assert.match(html,/not a continuous physically scaled journey/);
assert.match(controller,/await import\('\.\/cosmic-cinema\.js'\)/);
assert.match(controller,/if \(cinema && !cinemaFrame\.hidden\) cinema\.setStep\(i\)/);
assert.match(controller,/cosmicJump\(step\)/);
assert.match(moduleText,/prefers-reduced-motion/);
assert.match(moduleText,/devicePixelRatio/);
assert.match(page,/id="zoomCinemaSceneNumber"/);
assert.match(page,/id="zoomCinemaSceneMeasure"/);
assert.match(page,/id="zoomCinemaProgress"/);
assert.match(page,/id="zoomCinemaCredit"/);
assert.match(page,/id="zoomCinemaCreditLabel"/);
assert.match(page,/id="zoomCinemaCreditLink"/);
assert.match(page,/source-image provenance/i);
assert.match(controller,/REFERENCE_IMAGES=\[/);
assert.match(controller,/ESA\/Hubble & Digitized Sky Survey 2/);
assert.match(controller,/HUDF09 Team/);
assert.match(controller,/cinemaCreditLabel.textContent=REFERENCE_IMAGES\[index\]\[0\]/);
assert.match(moduleText,/const sources=\[/);
assert.match(moduleText,/cosmic-apollo-human.webp/);
assert.match(moduleText,/cosmic-milkyway-jpl.webp/);
assert.match(moduleText,/cosmic-andromeda-hubble.webp/);
assert.match(moduleText,/cosmic-extreme-deep-field.webp/);
assert.match(moduleText,/drawPhoto/);
assert.doesNotMatch(moduleText,/galaxyPoints=Array.from/,'No procedural cartoon spiral may stand in for a NASA artist concept');
assert.match(moduleText,/NOT THE EDGE OF ALL SPACE/);
for(const asset of ['apollo-human','blue-marble','neptune-voyager','proxima-hubble','milkyway-jpl','andromeda-hubble','extreme-deep-field']){
 const bytes=readFileSync('assets/images/cosmic-'+asset+'.webp');
 assert.ok(bytes.length>15000 && bytes.length<700000,'Reference must be a real optimized local image: '+asset);
 assert.equal(bytes.subarray(8,12).toString(),'WEBP','WebP signature '+asset);
}
assert.match(moduleText,/duration=reduced.matches\?0:1400/);
assert.match(controller,/TOUR_STEP_MS=2100/);
assert.match(controller,/cinemaProgress.style.setProperty/);

assert.match(moduleText,/pointercancel/);
assert.match(moduleText,/document\.hidden/);
assert.match(moduleText,/const coarse = matchMedia/);
for(const marker of ['rel="canonical"','type="application/ld+json"','A ruler across 27 powers of ten','~93 billion light-years']) assert.ok(html.includes(marker));
const hooks={};let position=0, requested=0;
const gradient=()=>({addColorStop(){}});
const drawing=new Proxy({createRadialGradient:gradient,createLinearGradient:gradient}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true;}});
const canvas={width:0,height:0,hidden:false,
 getContext:type=>type==='2d'?drawing:null,
 getBoundingClientRect:()=>({width:360,height:320}),
 addEventListener:(t,f)=>hooks[t]=f,
 removeEventListener:(t)=>delete hooks[t],
 setPointerCapture(){}
};
let now=0;
const ctx={canvas,matchMedia:q=>({matches:false}),window:{devicePixelRatio:2},
 ResizeObserver:class {observe(){}disconnect(){}},
 performance:{now:()=>now},
 document:{hidden:false,addEventListener(){},removeEventListener(){}},
 requestAnimationFrame:()=>++requested,cancelAnimationFrame(){},Math};
const factory=runInNewContext(moduleText.replace("import {cinematicEase} from './cinematic-motion.js';", 'const cinematicEase=t=>t*t*t*(t*(t*6-15)+10);').replace('export function createCosmicCinema','function createCosmicCinema')+';createCosmicCinema',ctx);
const scene=factory(canvas,(n)=>{position=n;});
assert.equal(canvas.width,630,'DPR caps at 1.75 on desktop');
scene.setStep(2);
assert.ok(requested>0,'request animation on step transition');
now=1000;
hooks.wheel({deltaY:20,preventDefault(){}});
assert.equal(position,3,'wheel moves outward one step');
hooks.keydown({key:'ArrowLeft',preventDefault(){}});
assert.equal(position,1,'keyboard left requests a step inward from the current scene');
hooks.pointerdown({pointerId:1,clientX:80,clientY:100});
hooks.pointermove({pointerId:1,clientX:140,clientY:130});
hooks.pointerup({pointerId:1});
scene.dispose();
assert.equal('wheel' in hooks,false,'event handlers are removed on dispose');
console.log('COSMIC_CINEMA_ILLUSTRATIVE_INPUT_TEST_PASS');
