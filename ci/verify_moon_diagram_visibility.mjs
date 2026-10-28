#!/usr/bin/env node
// Regression: 90-degree marker must be outside observer's opaque disk.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const web = readFileSync('pages/moon/phases/content.html','utf8');
const paper = readFileSync('assets/handouts/moon-phases-cer.html','utf8');
function verify(label,svg,markerId,center,radius) {
  assert.ok(svg.includes('<circle cx="'+center.x+'" cy="'+center.y+'" r="'+radius+'"'),label+': expected observer circle');
  const marker = new RegExp('<path id="'+markerId+'" d="M(\\d+) (\\d+) A(\\d+) \\3 0 0 1 (\\d+) (\\d+)"[^>]*>');
  const match=svg.match(marker);
  assert.ok(match,label+': missing 90-degree external arc');
  const [sx,sy,rad,ex,ey]=match.slice(1).map(Number);
  assert.ok(rad>=radius+10,label+': arc hidden behind circle');
  assert.ok(Math.abs(Math.hypot(sx-center.x,sy-center.y)-rad)<0.01,label+': start radius wrong');
  assert.ok(Math.abs(Math.hypot(ex-center.x,ey-center.y)-rad)<0.01,label+': end radius wrong');
  assert.deepEqual([sx,sy,ex,ey],[center.x-rad,center.y,center.x,center.y-rad],label+': arc not on sightlines');
  assert.ok(svg.indexOf('<circle cx="'+center.x+'" cy="'+center.y+'" r="'+radius+'"') <
    svg.indexOf('id="'+markerId+'"'),label+': circle painted over marker');
  const labels=[...svg.matchAll(/<text[^>]+x="(\d+)" y="(\d+)"[^>]*>(?:≈|~)?90°<\/text>/g)];
  assert.ok(labels.some(m=>{
    const x=Number(m[1]),y=Number(m[2]);
    return Math.hypot(x-center.x,y-center.y)>radius+18 && x<center.x && y<center.y;
  }),label+': 90° text too close to observer');
  console.log('ANGLE_MARKER_VISIBLE',label,'observerRadius',radius,'arcRadius',rad);
}
const desktop=web.match(/<svg class="cer-setup-desktop"[\s\S]*?<\/svg>/)?.[0];
const mobile=web.match(/<svg class="cer-setup-mobile"[\s\S]*?<\/svg>/)?.[0];
const printable=paper.match(/<svg class="diagram"[\s\S]*?<\/svg>/)?.[0];
assert.ok(desktop&&mobile&&printable,'three diagram outputs exist');
verify('desktop',desktop,'cerSetupRightAngleDesktop',{x:474,y:183},26);
verify('mobile',mobile,'cerSetupRightAngleMobile',{x:265,y:175},23);
verify('print',printable,'cerSetupRightAnglePrint',{x:260,y:145},18);
assert.match(desktop,/id="cerSetupRayToBall"/);
assert.match(desktop,/id="cerSetupObserverGaze"/);
assert.match(mobile,/id="cerSetupMobileRayToBall"/);
assert.match(printable,/id="paperLightArrow"/);
const releases=JSON.parse(readFileSync('data/releases.json','utf8')).releases;
const markerRelease=releases.find(item=>item.id==='2026-10-28-moon-diagram-visible-right-angle');
assert.ok(markerRelease,'Public history must document the corrected classroom visual');
assert.ok(markerRelease.commits.includes('91cba15'),'Public history must link exact tested code change');
assert.ok(markerRelease.links.some(link=>link.path==='/moon/phases/'));
assert.match(readFileSync('public/updates/index.html','utf8'),/91cba15/);
console.log('MOON_DIAGRAM_VISIBILITY_PASS');
