// Same dimensionless explicit integration as the existing cannonball sandbox.
// Bounded, demonstrative, not an ephemeris or stable N-body solution.
export const ORBIT_MODEL={launchRadius:130,centralRadius:18,circularSpeed:2.6,escapeFactor:3.2};
export function traceLaunch(speed,{steps=900}={}){
 if(!Number.isFinite(speed)||speed<=0||!Number.isInteger(steps)||steps<1||steps>900)throw new RangeError('speed and bounded step count required');
 const {launchRadius:r0,centralRadius:rBody,circularSpeed:v0,escapeFactor}=ORBIT_MODEL;
 const GM=v0*v0*r0;
 let x=r0,y=0,vx=0,vy=-speed;
 const points=[[x,y]];
 let outcome='bounded-preview';
 for(let n=0;n<steps;n++){
  const r=Math.hypot(x,y);
  if(r<rBody){outcome='collision';break;}
  if(r>r0*escapeFactor){outcome='escape';break;}
  const ax=-GM*x/(r*r*r),ay=-GM*y/(r*r*r);
  vx+=ax;vy+=ay;x+=vx;y+=vy;
  points.push([x,y]);
 }
 if(points.length>=steps)outcome='bounded-preview';
 return {speed,outcome,points};
}
