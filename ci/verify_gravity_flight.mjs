import assert from 'node:assert/strict';
import {COURSE,buildCourse,MAX_LEVEL,BOOST_CAPACITY_SECONDS,RECHARGE_SECONDS,NET_BOOST_MPS2,
 spawnFlight,launchFlight,advanceFlight,findLanding,landFlight} from '../assets/js/gravity-flight-physics.js';
assert.equal(COURSE.length,4);
assert.equal(MAX_LEVEL,8);
for(let level=1;level<=MAX_LEVEL;level++){
 const course=buildCourse(level);
 assert.equal(course.length,level+3);
 assert.equal(course.at(-1).id,'finish');
 for(let i=1;i<course.length;i++){
  assert.ok(course[i].z<course[i-1].z);
  assert.ok(course[i].top>=course[i-1].top);
  assert.ok(course[i-1].z-course[i].z<=6.01,'reachable gap');
 }
 assert.equal(spawnFlight(course.length-1,course).y,course.at(-1).top);
}
assert.throws(()=>buildCourse(9),RangeError);
for(const g of [1.6,3.7,9.8,23.1]){
 let s=launchFlight(spawnFlight());
 const no=advanceFlight(s,.02,g,false),yes=advanceFlight(s,.02,g,true);
 assert.ok(yes.y>no.y,'booster should increase height '+g);
 assert.ok(yes.vy>no.vy);
 assert.equal(no.energy,1);
 assert.ok(yes.energy<1);
 let boostElapsed=0;
 for(let i=0;i<65;i++){s=advanceFlight(s,.02,g,true);boostElapsed+=.02;}
 assert.ok(Math.abs(s.usedSeconds-BOOST_CAPACITY_SECONDS)<.00001,'one second maximum thrust');
 assert.equal(s.energy,0);
 assert.equal(s.boosting,false);
 const empty=advanceFlight(s,.02,g,true);
 assert.ok(empty.vy<s.vy,'should fall when depleted '+g);
 const landed=landFlight(empty,COURSE[1]);
 assert.equal(landed.y,COURSE[1].top);
 assert.equal(landed.grounded,true);
 let recharge=landed;
 for(let i=0;i<125;i++)recharge=advanceFlight(recharge,.02,g,true);
 assert.ok(Math.abs(recharge.energy-1)<1e-9,'2.5s recharge '+g);
 assert.ok(recharge.grounded,'holding boost on ground cannot launch');
}
const p=COURSE[1],a={...spawnFlight(),y:p.top+.03,vy:-1,grounded:false};
const below={...a,y:p.top-.04,vy:-1.3};
assert.equal(findLanding(a,below,p.x,p.z)?.id,p.id);
assert.equal(findLanding(a,below,p.x+5,p.z),null);
assert.equal(findLanding({...a,vy:1},{...below,vy:.9},p.x,p.z),null);
assert.equal(spawnFlight(2).y,COURSE[2].top);
assert.throws(()=>spawnFlight(88),RangeError);
assert.throws(()=>advanceFlight(spawnFlight(),.1,9.8,false),RangeError);
assert.ok(NET_BOOST_MPS2>0);
const html=(await import('node:fs')).readFileSync('pages/solar-system/gravity-lab/content.html','utf8');
const js=(await import('node:fs')).readFileSync('assets/js/gravity-lab.js','utf8');
for(const id of ['gravityLabModeScience','gravityLabModeFlight','gravityLabJump','gravityLabBoostFill','gravityLabFlightStatus','gravityLabFlightInfo','gravityLabReward','gravityLabNextLevel']){
 assert.ok(html.includes('id="'+id+'"'),'missing flight UI: '+id);
}
assert.match(js,/from '.\/gravity-flight-physics.js'/);
assert.match(js,/Flight Trials/);
assert.match(js,/jumpAction\.addEventListener\('pointerdown'/);
assert.match(js,/refreshHeldJump\(now\)/);
assert.match(js,/setMode\(/);
assert.match(js,/findLanding\(/);
assert.match(js,/COURSE/);
assert.match(js,/gravityLabModeScience/);
assert.match(js,/labDecor\.visible=next==='science'/);
assert.match(js,/courseDecor\.visible=next==='flight'/);
assert.match(js,/trial\.totalBoostSeconds/);
assert.match(js,/\['pointerup','pointercancel','lostpointercapture'\]/);
assert.match(js,/releaseJump\(e\.pointerId\)/);
assert.match(js,/checkpointFlash\(/);
assert.match(js,/showReward\(/);
assert.match(js,/nextLevel\.addEventListener\('click'/);
assert.match(html,/id="gravityLabWorldRail"/);
assert.doesNotMatch(html,/id="gravityLabWorld"/);
assert.doesNotMatch(html,/id="gravityLabBoost"/);
assert.match(js,/resetFlight\(\)/);
assert.match(js,/if\(document\.hidden\)suspend\(\)/);
assert.match(html,/ASSISTED THRUST · NOT A NATURAL JUMP/);
assert.match(html,/UNBOOSTED REFERENCE ONLY/);
assert.match(html,/role="progressbar"/);

console.log('GRAVITY_FLIGHT_TRIALS_PHYSICS_AND_UX_PASS');
