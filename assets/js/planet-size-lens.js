import {PLANETS} from './planet-data.js';
import {cinematicEase} from './cinematic-motion.js';
export const equatorialDiameterKm=name=>{
 const p=PLANETS.find(p=>p.name===name);
 if(!p)throw new RangeError('known planet required');
 return Number(p.diameter.replace(/[^\d]/g,''));
};
export function createDiameterLens({canvas,selectA,selectB,slider,output,play,reset,readout}){
 if(!canvas)return null;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let w=1,h=1,dpr=1,t=0,playing=false,frame=null,started=null;
 function names(){return [PLANETS[Number(selectA.value)].name,PLANETS[Number(selectB.value)].name];}
 function stop(){playing=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;started=null;play.setAttribute('aria-pressed','false');play.textContent='Pull back over 7 seconds';}
 function draw(){
  const [a,b]=names();const da=equatorialDiameterKm(a),db=equatorialDiameterKm(b);
  const small=da<=db?a:b,large=small===a?b:a;
  const dSmall=Math.min(da,db),dLarge=Math.max(da,db),rSmall=dSmall/2,rLarge=dLarge/2;
  const largeX=1.3*(rSmall+rLarge),margin=.13*rLarge;
  const minX=-rSmall-margin,maxX=largeX+rLarge+margin;
  const finalScale=Math.min((w-30)/(maxX-minX),(h-65)/(2*(rLarge+margin)));
  const initialScale=(h-65)/(2*rSmall);
  const e=cinematicEase(t);
  const scale=Math.exp(Math.log(initialScale)+(Math.log(finalScale)-Math.log(initialScale))*e);
  const midpoint=(minX+maxX)/2;const focal=midpoint*e;
  const centerX=w*.5,centerY=h*.54;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#0e2532';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(211,228,233,.14)';ctx.lineWidth=1;
  for(let k=1;k<=4;k++){const y=h*k/5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(const item of [{name:small,x:0,r:rSmall},{name:large,x:largeX,r:rLarge}]){
   const x=centerX+(item.x-focal)*scale,r=item.r*scale;
   const color=PLANETS.find(p=>p.name===item.name).color;
   ctx.fillStyle=`#${color.toString(16).padStart(6,'0')}`;
   ctx.beginPath();ctx.arc(x,centerY,r,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='#d7e2e2';ctx.lineWidth=1.3;ctx.stroke();
   if(x-r>=0&&x+r<=w){ctx.fillStyle='#eff4f1';ctx.font='600 12px ui-monospace,monospace';ctx.textAlign='center';ctx.fillText(item.name.toUpperCase(),x,Math.min(h-13,centerY+r+18));ctx.textAlign='left';}
  }
  ctx.fillStyle='#ebf1f1';ctx.font='600 11px ui-monospace,monospace';ctx.fillText('ONE CAMERA · TRUE DIAMETER RATIO',13,22);
  ctx.fillStyle='#d7c4a3';ctx.fillText(`${(dLarge/dSmall).toFixed(2)}× WIDER`,13,h-13);
 }
 function render(){slider.value=String(Math.round(t*100));output.textContent=t<.02?'Close view':t>.98?'Both worlds':`${Math.round(t*100)}% outward`;
  const [a,b]=names();const ratio=Math.max(equatorialDiameterKm(a),equatorialDiameterKm(b))/Math.min(equatorialDiameterKm(a),equatorialDiameterKm(b));
  readout.textContent=`${a} / ${b}: ${ratio.toFixed(2)}× equatorial diameter difference. Only the common camera scale changes; this is not a simulation of relative orbital positions.`;draw();}
 function tick(now){frame=null;if(!playing||document.hidden||reduced.matches)return stop();if(started===null)started=now;t=Math.min(1,(now-started)/7000);render();if(t>=1)stop();else frame=requestAnimationFrame(tick);}
 play.addEventListener('click',()=>{if(playing)return stop();if(reduced.matches)return;stop();if(t>=.999)t=0;playing=true;play.setAttribute('aria-pressed','true');play.textContent='Pause pullback';frame=requestAnimationFrame(tick);});
 slider.addEventListener('input',()=>{stop();t=Number(slider.value)/100;render();});
 reset.addEventListener('click',()=>{stop();t=0;render();});
 function selectionChange(){stop();t=0;render();}
 selectA.addEventListener('change',selectionChange);selectB.addEventListener('change',selectionChange);
 document.querySelectorAll('[data-planet-a][data-planet-b]').forEach(btn=>btn.addEventListener('click',selectionChange));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 reduced.addEventListener?.('change',()=>{if(reduced.matches)stop();play.disabled=reduced.matches;});play.disabled=reduced.matches;
 const ro=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();if(!r.width)return;w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,w<700?1.25:1.75);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();});ro.observe(canvas);render();
 return {stop,render,dispose(){stop();ro.disconnect();}};
}
