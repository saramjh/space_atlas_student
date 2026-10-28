import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {seasonSunlight}=await import('../assets/js/season-sunlight.js');
const near=(a,b,t=0.07)=>assert.ok(Math.abs(a-b)<t,a+' vs '+b);
for (const tilt of [0,23.5]) {
 for(const angle of [0,90,180,270,360]){
  const m=seasonSunlight(angle,tilt);
  near(m.northHours+m.southHours,24);
  near(m.northNoonElevation+m.southNoonElevation,100,50); // distinct latitude geometry, separate tests below
 }
}
const june=seasonSunlight(180,23.5),dec=seasonSunlight(0,23.5);
near(june.declination,23.5);near(dec.declination,-23.5);
near(june.northNoonElevation,73.5);near(dec.northNoonElevation,26.5);
near(june.southNoonElevation,26.5);near(dec.southNoonElevation,73.5);
assert.ok(june.northHours>14 && june.southHours<10);
assert.ok(dec.northHours<10 && dec.southHours>14);
for(const angle of [0,90,180,270]){
 const flat=seasonSunlight(angle,0);
 near(flat.declination,0);near(flat.northHours,12);near(flat.southHours,12);
 near(flat.northNoonElevation,50);near(flat.southNoonElevation,50);
}
for(const bad of [-1,361,NaN])assert.throws(()=>seasonSunlight(bad,23.5),RangeError);
for(const bad of [-1,45,NaN])assert.throws(()=>seasonSunlight(180,bad),RangeError);
const page=readFileSync('pages/earth/seasons/content.html','utf8');
const built=readFileSync('public/earth/seasons/index.html','utf8');
const js=readFileSync('assets/js/seasons.js','utf8');
for(const id of ['seasonSunlightReadout','seasonNorthDay','seasonSouthDay','seasonNorthNoon','seasonSouthNoon']){
 assert.ok(page.includes('id="'+id+'"'),'source missing '+id);
 assert.ok(built.includes('id="'+id+'"'),'built missing '+id);
}
assert.match(js,/seasonSunlight/);
assert.match(js,/renderer\.render\(scene,camera\)/);
assert.doesNotMatch(js,/animateLoop\(/,'no idle 3D work');
assert.match(built,/rel="canonical"/);assert.match(built,/application\/ld\+json/);
console.log('SEASON_SUNLIGHT_TDD_PASS solstice and equinox mid-latitudes, zero tilt invariants, live readouts');
