// Flight Trials is an explicitly assisted GAME mode, not a measurement of
// natural jumping. Thrust auto-compensates gravity to keep worlds playable.
import {TAKEOFF_MPS} from './gravity-lab-physics.js';
export const BOOST_CAPACITY_SECONDS=1;
export const RECHARGE_SECONDS=2.5;
export const NET_BOOST_MPS2=5.5;
export const COURSE=Object.freeze([
 Object.freeze({id:'launch',label:'LAUNCH',x:0,z:4,width:6,depth:7,top:0}),
 Object.freeze({id:'approach',label:'GATE 01',x:0,z:-2,width:3.6,depth:3.6,top:0.72}),
 Object.freeze({id:'crossing',label:'GATE 02',x:1.4,z:-7,width:3.6,depth:3.6,top:1.18}),
 Object.freeze({id:'finish',label:'FINISH',x:0,z:-12,width:4.4,depth:4.1,top:1.5})
]);
export function spawnFlight(checkpoint=0){
 const p=COURSE[checkpoint];
 if(!p)throw new RangeError('invalid checkpoint');
 return {y:p.top,vy:0,grounded:true,energy:1,usedSeconds:0,
  airSeconds:0,peak:p.top,boosting:false,landed:false};
}
export function launchFlight(state){
 if(!state.grounded)return state;
 return {...state,vy:TAKEOFF_MPS,grounded:false,airSeconds:0,landed:false,peak:state.y};
}
export function advanceFlight(state,dt,g,boostHeld){
 if(!Number.isFinite(dt)||dt<0||dt>0.05||!Number.isFinite(g)||g<=0)throw new RangeError('invalid physics step');
 if(state.grounded){
  return {...state,boosting:false,landed:false,
   energy:Math.min(1,state.energy+dt/RECHARGE_SECONDS)};
 }
 const used=boostHeld&&state.energy>0;
 // Fixed-step velocity integration. The assist thrust magnitude is g+5.5 m/s².
 // Therefore net acceleration is +5.5 while boosting, -g otherwise.
 const actualBoost=used?Math.min(dt,state.energy*BOOST_CAPACITY_SECONDS):0;
 const remaining=dt-actualBoost;
 const nextVy=state.vy+NET_BOOST_MPS2*actualBoost-g*remaining;
 const nextY=state.y+state.vy*dt+.5*NET_BOOST_MPS2*actualBoost*actualBoost+
  NET_BOOST_MPS2*actualBoost*remaining-.5*g*remaining*remaining;
 return {...state,y:nextY,vy:nextVy,grounded:false,boosting:used&&actualBoost>0,
  energy:Math.max(0,state.energy-actualBoost/BOOST_CAPACITY_SECONDS),
  usedSeconds:state.usedSeconds+actualBoost,airSeconds:state.airSeconds+dt,
  peak:Math.max(state.peak,nextY),landed:false};
}
export function findLanding(before,after,x,z){
 if(after.vy>0||after.y>before.y)return null;
 return [...COURSE].reverse().find(p=>{
  const inside=Math.abs(x-p.x)<=p.width/2-0.13&&Math.abs(z-p.z)<=p.depth/2-0.13;
  return inside&&before.y+0.035>=p.top&&after.y<=p.top;
 })||null;
}
export function landFlight(state,pad){
 if(!pad)throw new TypeError('landing requires a platform');
 return {...state,y:pad.top,vy:0,grounded:true,boosting:false,landed:true};
}
