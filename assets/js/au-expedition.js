// A measured linear AU camera. Motion is a user-controlled theatrical travel
// metaphor; never imply planet radii or positions are displayed to body scale.
import {cinematicEase} from './cinematic-motion.js';
import {PLANETS} from './planet-data.js';
export const AU_END=30.05;
export function distanceAtModelScale(au,oneAuCm){
 if(!Number.isFinite(au)||au<0||!Number.isFinite(oneAuCm)||oneAuCm<=0)throw new RangeError('positive length and non-negative AU required');
 return au*oneAuCm/100;
}
export function createAUExpedition({canvas,slider,play,reset,select,label,amount,note,scaleInput}){
 if(!canvas)return null;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let pos=0,playing=false,frame=null,started=null,from=0;
 let w=960,h=300,dpr=1;
 const stops=[{name:'Sun',au:0,color:'#f2bc6e'},...PLANETS.map(p=>({name:p.name,au:Number.parseFloat(p.au),color:`#${p.color.toString(16).padStart(6,'0')}`}))];
 const clamp=x=>Math.max(0,Math.min(AU_END,x));
 function resize(){const rect=canvas.getBoundingClientRect();if(!rect.width)return;w=rect.width;h=rect.height||w*300/960;dpr=Math.min(devicePixelRatio||1,w<700?1.25:1.75);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
 function draw(){
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#0c1b2b';ctx.fillRect(0,0,w,h);
  const originY=h*.48,at=w*.29,unitPx=Math.max(18,w/16);
  // The horizon's ruled lines are graphical labels only; coordinates linear in AU.
  const gradient=ctx.createLinearGradient(0,0,0,h);gradient.addColorStop(0,'#1b3444');gradient.addColorStop(1,'#081521');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(244,235,213,.75)';ctx.font='11px ui-monospace,monospace';
  ctx.fillText('TRUE LINEAR AU SCALE',13,19);
  for(let au=Math.floor(pos-4);au<=pos+25;au++){
   if(au<0||au>31)continue;
   const x=at+(au-pos)*unitPx;if(x<0||x>w)continue;
   ctx.strokeStyle=au%5===0?'rgba(177,202,214,.47)':'rgba(177,202,214,.15)';ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(x,originY+17);ctx.lineTo(x,h-35);ctx.stroke();
   if(au%5===0||au===0){ctx.fillStyle='#c2d5db';ctx.fillText(`${au} AU`,x+3,h-16);}
  }
  let lastLabelX=-100;
  for(const stop of stops){
   const x=at+(stop.au-pos)*unitPx;
   if(x<0||x>w)continue;
   const r=stop.name==='Sun'?11:4.7;
   ctx.fillStyle=stop.color;ctx.beginPath();ctx.arc(x,originY,r,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='rgba(227,240,246,.38)';ctx.beginPath();ctx.moveTo(x,originY+r+5);ctx.lineTo(x,originY+29);ctx.stroke();
   if(x-lastLabelX>=Math.max(62,w*.13)&&x<w-24){ctx.fillStyle='#ecf2ee';ctx.textAlign='center';ctx.fillText(stop.name,x,originY+42);ctx.textAlign='left';lastLabelX=x;}
  }
  ctx.strokeStyle='#ebbb78';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(at,originY-25);ctx.lineTo(at,originY+10);ctx.stroke();
  ctx.fillStyle='#efc78f';ctx.beginPath();ctx.moveTo(at-6,originY-29);ctx.lineTo(at+6,originY-29);ctx.lineTo(at,originY-39);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f4d7a8';ctx.font='600 11px ui-monospace,monospace';ctx.fillText('YOU ARE HERE',13,42);
  const next=stops.find(s=>s.au>pos+.009);if(next){ctx.textAlign='right';ctx.fillText(`NEXT ${next.name.toUpperCase()}`,w-12,42);ctx.textAlign='left';}
 }
 function render(){slider.value=String(Math.round(pos*100));label.textContent=`${pos.toFixed(2)} AU`;amount.querySelector('strong').textContent=`${pos.toFixed(2)} AU`;amount.querySelector('span').textContent=`${distanceAtModelScale(pos,Number(scaleInput.value)||75).toFixed(2)} m from the Sun at your chosen scale`;const stop=[...stops].reverse().find(s=>s.au<=pos+.02)||stops[0];note.textContent=`Passed ${stop.name} · ${pos.toFixed(2)} AU from the Sun. On this linear model: ${distanceAtModelScale(pos,Number(scaleInput.value)||75).toFixed(2)} m. Planet markers are not body-size accurate.`;draw();}
 function stop(){playing=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;started=null;play.setAttribute('aria-pressed','false');play.textContent='Begin the 12-second journey';}
 function set(x){stop();pos=clamp(Number(x)||0);render();}
 function tick(now){frame=null;if(!playing||document.hidden||motion.matches)return stop();if(started===null)started=now;const t=Math.min(1,(now-started)/12000);pos=from+(AU_END-from)*cinematicEase(t);render();if(t>=1)stop();else frame=requestAnimationFrame(tick);}
 play.addEventListener('click',()=>{if(playing)return stop();if(motion.matches)return;from=pos>=AU_END-.01?0:pos;pos=from;playing=true;play.setAttribute('aria-pressed','true');play.textContent='Pause journey';frame=requestAnimationFrame(tick);});
 slider.addEventListener('input',()=>set(Number(slider.value)/100));
 select.addEventListener('change',()=>set(Number(select.value)));
 reset.addEventListener('click',()=>{select.value='0';set(0);});
 scaleInput.addEventListener('input',render);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 motion.addEventListener?.('change',()=>{if(motion.matches)stop();play.disabled=motion.matches;});
 play.disabled=motion.matches;
 const ro=new ResizeObserver(resize);ro.observe(canvas);
 resize();render();
 return {set,stop,dispose(){stop();ro.disconnect();}};
}
