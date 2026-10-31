// Data: NASA Planetary Fact Sheet (metric), rounded effective gravity at reference
// levels. Moon reference is its solid surface. For giants, no walkable surface.
// A controlled *artificial laboratory*, not real travel or human jump biomechanics.
export const TAKEOFF_MPS=3.0;
export const PERSON_MASS_KG=70;
export const EYE_HEIGHT_M=1.58;
export const WORLDS=Object.freeze([
 Object.freeze({id:'earth',name:'Earth',g:9.8,kind:'solid',scene:'earth',note:'Reference: Earth-like gravity in an artificial level test chamber.'}),
 Object.freeze({id:'moon',name:'Moon',g:1.6,kind:'solid',scene:'moon',note:'The Moon has solid ground. The photograph is a reference view, not this laboratory location.'}),
 Object.freeze({id:'mars',name:'Mars',g:3.7,kind:'solid',scene:'mars',note:'Mars has rocky ground. The Jezero photograph is a reference, not the platform location.'}),
 Object.freeze({id:'mercury',name:'Mercury',g:3.7,kind:'solid',scene:'mercury',note:'Mercury has a solid surface; the laboratory is not its observed terrain.'}),
 Object.freeze({id:'venus',name:'Venus',g:8.9,kind:'solid',scene:'venus',note:'Venus has extreme heat and pressure. This safe chamber does not simulate those conditions.'}),
 Object.freeze({id:'jupiter',name:'Jupiter',g:23.1,kind:'gas',scene:'jupiter',note:'Jupiter has no walkable solid surface. Gravity represents an atmospheric reference level.'}),
 Object.freeze({id:'saturn',name:'Saturn',g:9.0,kind:'gas',scene:'saturn',note:'Saturn has no walkable solid surface. Gravity represents an atmospheric reference level.'}),
 Object.freeze({id:'uranus',name:'Uranus',g:8.7,kind:'ice',scene:'uranus',note:'Uranus has no walkable solid surface. Gravity represents an atmospheric reference level.'}),
 Object.freeze({id:'neptune',name:'Neptune',g:11.0,kind:'ice',scene:'neptune',note:'Neptune has no walkable solid surface. Gravity represents an atmospheric reference level.'})
]);
export function worldById(id){return WORLDS.find(w=>w.id===id)||WORLDS[0];}
export function predictJump(g, v0=TAKEOFF_MPS){
 if(!(Number.isFinite(g)&&g>0&&Number.isFinite(v0)&&v0>0))throw new RangeError('gravity and launch speed must be positive');
 return {height:v0*v0/(2*g),hang:2*v0/g};
}
export function weightNewtons(g,mass=PERSON_MASS_KG){
 if(!(Number.isFinite(g)&&g>0&&Number.isFinite(mass)&&mass>0))throw new RangeError('Positive gravity and mass required');
 return g*mass;
}
export function startJump(){return {airborne:true,elapsed:0,height:0,vy:TAKEOFF_MPS,peak:0,landed:false};}
export function grounded(){return {airborne:false,elapsed:0,height:0,vy:0,peak:0,landed:false};}
export function advanceJump(state,delta,g){
 if(!Number.isFinite(delta)||delta<0||delta>.25)throw new RangeError('time step must be 0..0.25s');
 if(!state.airborne)return state;
 const t=state.elapsed+delta,prediction=predictJump(g);
 if(t>=prediction.hang){
  return {airborne:false,elapsed:prediction.hang,height:0,vy:0,peak:prediction.height,landed:true};
 }
 return {airborne:true,elapsed:t,height:TAKEOFF_MPS*t-.5*g*t*t,vy:TAKEOFF_MPS-g*t,peak:Math.min(prediction.height,Math.max(state.peak,TAKEOFF_MPS*t-.5*g*t*t)),landed:false};
}
