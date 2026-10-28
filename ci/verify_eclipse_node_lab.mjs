#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=p=>readFileSync(p,'utf8');
const {eclipseModel,ORBIT_RADIUS}=await import('../assets/js/eclipse-geometry.js');
const near=(value,expected,tol=1e-7)=>assert.ok(Math.abs(value-expected)<=tol,'Model mismatch '+value+' vs '+expected);
for(const phase of [0,45,90,180,270,360]){
 for(const node of [0,30,45,90]){
  const flat=eclipseModel({phaseDeg:phase,nodeDeg:node,tilted:false});
  near(flat.y,0);
  near(Math.hypot(flat.x,flat.y,flat.z),ORBIT_RADIUS);
  const tilted=eclipseModel({phaseDeg:phase,nodeDeg:node,tilted:true});
  near(Math.hypot(tilted.x,tilted.y,tilted.z),ORBIT_RADIUS);
  near(tilted.normalizedHeight,tilted.y/ORBIT_RADIUS);
 }
}
for(const phase of [0,180]){
 const along=eclipseModel({phaseDeg:phase,nodeDeg:0,tilted:true});
 const across=eclipseModel({phaseDeg:phase,nodeDeg:90,tilted:true});
 near(along.normalizedHeight,0);
 near(Math.abs(across.normalizedHeight),Math.sin(15*Math.PI/180));
 assert.equal(along.isExactNodeConjunction,true);
 assert.equal(across.isExactNodeConjunction,false);
}
for(const invalid of [-1,361,NaN]){
 assert.throws(()=>eclipseModel({phaseDeg:invalid,nodeDeg:0,tilted:true}),RangeError);
 assert.throws(()=>eclipseModel({phaseDeg:0,nodeDeg:invalid,tilted:true}),RangeError);
}
const html=source('pages/moon/eclipses/content.html'),js=source('assets/js/eclipses.js'),css=source('assets/css/style.css'),built=source('public/moon/eclipses/index.html');
for(const id of ['eclipseNode','eclipseNodeValue','eclipseMoonSide','eclipseMoonMobile','eclipseOffset','eclipsePlay','eclipseSideView']){
 assert.ok(html.includes('id="'+id+'"'),'missing UI '+id);
 assert.ok(built.includes('id="'+id+'"'),'built missing '+id);
}
assert.match(html,/0°.*Sun.Earth/);
assert.match(html,/90°.*away/);
assert.match(html,/15°.*real tilt.*5\.1°/i);
assert.match(js,/eclipseModel/);
assert.match(js,/requestAnimationFrame/);
assert.match(js,/prefers-reduced-motion/);
assert.match(js,/visibilitychange/);
assert.match(js,/setPlaying\(false\)/);
assert.match(js,/a unique node line is undefined/,'zero inclination cannot have a distinct node line');
assert.match(js,/mobileY>=107\?mobileY\+34:mobileY-19/,'Moon label must stay away from midplane at mobile sizes');
assert.doesNotMatch(js,/animateLoop\(/,'Eclipse model must not render forever in idle mode');
assert.match(css,/\.eclipse-side-view/);
assert.match(css,/\.eclipse-side-mobile/,'Mobile labels need a separate diagram');
assert.match(built,/rel="canonical"/);
assert.match(html,/aria-busy="false"/,"No-JS fallback must not stay aria-busy forever");
assert.match(built,/application\/ld\+json/);
const releases=JSON.parse(source('data/releases.json')).releases;
const record=releases.find(x=>x.id==='2026-10-28-eclipse-node-orbit-causal-lab');
assert.ok(record&&record.commits.includes('0fb5fb2'));
assert.ok(record.links.some(link=>link.path==='/moon/eclipses/'));
assert.match(source('public/updates/index.html'),/0fb5fb2/);
console.log('ECLIPSE_NODE_LAB_TDD_PASS physical node/tilt invariants, synchronized side view, finite motion, SEO');
