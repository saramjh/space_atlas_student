// A layered source-to-observer cinematic illustration. Screen positions are
// *normalized* and do not encode actual relative distances or light speed.
// All sources are original stylized teaching artwork, never telescope images.
export function createLookbackCinema(canvas,container,onChange){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas2D unavailable');
 let source='The Sun',fraction=0,width=1,height=1,dpr=1,disposed=false;
 let viewX=0,targetViewX=0;
 const pointers=new Map();let pinchLast=0,raf=null;
 const coarse=matchMedia('(pointer: coarse)').matches;
 const rnd=i=>{const n=Math.sin(i*117.7+29)*43758.5453;return n-Math.floor(n);};
 const earthImg=new Image();earthImg.decoding='async';earthImg.src=new URL('../images/planet-earth-nasa.webp',import.meta.url).href;
 earthImg.onload=()=>draw();earthImg.onerror=()=>console.warn('Lookback Earth reference texture unavailable; using painted globe fallback');
 const sourceStyle=(name)=>{
  if(/Moon/.test(name))return {color:'#bcb8b3',type:'moon'};
  if(/Sun/.test(name))return {color:'#f9ce80',type:'sun'};
  if(/Neptune/.test(name))return {color:'#5485cb',type:'planet'};
  if(/Proxima/.test(name))return {color:'#f07862',type:'star'};
  if(/Sirius/.test(name))return {color:'#b1d7f9',type:'star'};
  if(/Polaris/.test(name))return {color:'#ffebc7',type:'star'};
  if(/Andromeda/.test(name))return {color:'#d0a8e4',type:'galaxy'};
  return {color:'#f4ca83',type:'galaxy'};
 };
 function sphere(x,y,r,color,type,earth=false){
  ctx.save();
  const outer=ctx.createRadialGradient(x-r*.35,y-r*.25,r*.06,x,y,r*1.65);
  outer.addColorStop(0,color);outer.addColorStop(.36,color);outer.addColorStop(1,'rgba(25,49,80,0)');
  ctx.globalAlpha=.48;ctx.fillStyle=outer;ctx.beginPath();ctx.arc(x,y,r*1.66,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.clip();
  const grad=ctx.createRadialGradient(x-r*.38,y-r*.35,r*.07,x+r*.2,y+r*.12,r*1.26);
  grad.addColorStop(0,earth?'#8fd8e5':'#fff0d0');grad.addColorStop(.26,color);grad.addColorStop(1,earth?'#0b294e':'#21334c');
  ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2);
  if(earth && earthImg.complete && earthImg.naturalWidth>0){
   ctx.globalAlpha=.83;ctx.drawImage(earthImg,x-r,y-r,r*2,r*2);ctx.globalAlpha=1;
  }else if(type==='moon'){
   for(let i=0;i<12;i++){const xx=x+(rnd(i+1)-.5)*r*1.6,yy=y+(rnd(i+45)-.5)*r*1.6,rr=r*(.035+rnd(i+14)*.09);ctx.fillStyle='rgba(43,41,51,.20)';ctx.beginPath();ctx.arc(xx,yy,rr,0,7);ctx.fill();}
  }else if(type==='planet'){
   for(let i=0;i<6;i++){ctx.fillStyle='rgba(101,174,240,.26)';ctx.fillRect(x-r,y-r*.68+i*r*.24,r*2,r*.075);}
  }
  ctx.restore();
 }
 function star(x,y,r,color){
  const halo=ctx.createRadialGradient(x,y,0,x,y,r*2.8);halo.addColorStop(0,color);halo.addColorStop(.17,'rgba(196,215,249,.42)');halo.addColorStop(1,'rgba(196,215,249,0)');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r*2.8,0,7);ctx.fill();
  ctx.lineWidth=1;ctx.strokeStyle=color;ctx.globalAlpha=.57;
  ctx.beginPath();ctx.moveTo(x-r*1.65,y);ctx.lineTo(x+r*1.65,y);ctx.moveTo(x,y-r*1.7);ctx.lineTo(x,y+r*1.7);ctx.stroke();ctx.globalAlpha=1;
  ctx.fillStyle='#fff8ec';ctx.beginPath();ctx.arc(x,y,r*.22,0,7);ctx.fill();
 }
 function galaxy(x,y,r,color){
  ctx.save();ctx.translate(x,y);ctx.rotate(-.3);ctx.scale(1,.56);
  for(let i=16;i>=1;i--){const rr=r*i/16;ctx.beginPath();ctx.ellipse(0,0,rr,rr*.82,0,0,7);ctx.strokeStyle=color;ctx.globalAlpha=(17-i)/74;ctx.lineWidth=i>9?4:2;ctx.stroke();}
  for(let i=0;i<3;i++){
   ctx.beginPath();for(let a=0;a<=Math.PI*3.9;a+=.08){const rad=r*.08+a*r*.047;const xx=rad*Math.cos(a+i*Math.PI*2/3),yy=rad*Math.sin(a+i*Math.PI*2/3);if(a===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}
   ctx.strokeStyle=color;ctx.lineWidth=r*.065;ctx.globalAlpha=.17;ctx.stroke();
  }
  ctx.globalAlpha=1;ctx.fillStyle='#fff2d9';ctx.beginPath();ctx.arc(0,0,Math.max(3,r*.13),0,7);ctx.fill();ctx.restore();
 }
 function draw(){
  if(disposed||canvas.hidden)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const bg=ctx.createLinearGradient(0,0,width,height);bg.addColorStop(0,'#050d1c');bg.addColorStop(.5,'#142744');bg.addColorStop(1,'#070d1b');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  const base=Math.min(width,height);const srcX=width*.22+viewX,srcY=height*.51,earthX=width*.79+viewX,earthY=height*.54;
  // Artistic streaks are a space-travel metaphor, not actual photons or velocity.
  for(let i=0,n=coarse?170:430;i<n;i++){
   const layer=.35+.65*rnd(i*13),x=((rnd(i*7+1)+fraction*.34*layer)%1)*width;
   const y=rnd(i*7+3)*height,size=.3+.8*rnd(i*2+5);
   ctx.globalAlpha=.21+.52*rnd(i*2+1);ctx.strokeStyle='#c9e2ff';ctx.lineWidth=Math.max(.3,size);
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-(fraction>.05&&fraction<.95?4*layer:0),y);ctx.stroke();
  }ctx.globalAlpha=1;
  const src=sourceStyle(source);const shrink=Math.pow(1-fraction,.8),grow=Math.pow(fraction,.9);
  const sr=base*(.07+.19*shrink),er=base*(.065+.18*grow);
  if(src.type==='galaxy')galaxy(srcX,srcY,sr*1.22,src.color);
  else if(src.type==='star')star(srcX,srcY,sr*1.2,src.color);
  else sphere(srcX,srcY,sr,src.color,src.type);
  sphere(earthX,earthY,er,'#3e89bd','planet',true);
  const start=width*.30,end=width*.70,py=height*.69;
  const px=start+(end-start)*fraction;
  ctx.lineWidth=Math.max(1.5,base*.004);ctx.strokeStyle='rgba(125,177,221,.26)';ctx.beginPath();ctx.moveTo(start,py);ctx.lineTo(end,py);ctx.stroke();
  const beam=ctx.createLinearGradient(start,0,end,0);beam.addColorStop(0,'rgba(255,195,107,.05)');beam.addColorStop(1,'rgba(249,233,187,.94)');
  ctx.strokeStyle=beam;ctx.lineWidth=Math.max(3,base*.01);ctx.beginPath();ctx.moveTo(start,py);ctx.lineTo(px,py);ctx.stroke();
  ctx.save();ctx.shadowBlur=24;ctx.shadowColor='#fff4af';ctx.fillStyle='#fffbe6';ctx.beginPath();ctx.arc(px,py,Math.max(3.5,base*.012),0,7);ctx.fill();ctx.restore();
  ctx.font='700 12px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle='#e7effa';
  const shortName=source.replace(' (the North Star)','').replace('Center of the Milky Way','Milky Way center');
  ctx.fillText(shortName,srcX,Math.max(22,srcY-sr*1.17));
  ctx.fillText('Earth · observer',earthX,Math.max(22,earthY-er*1.15));
  // The single unobstructed HTML overlay owns the perspective disclaimer.
  ctx.textAlign='right';ctx.fillText(`${Math.round(fraction*100)}% OF SELECTED JOURNEY`,width-12,height-18);
 }
 function resize(){width=Math.max(1,container.clientWidth);height=Math.max(1,container.clientHeight);dpr=Math.min(window.devicePixelRatio||1,coarse?1.25:1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw();}
 function setProgress(v){fraction=Math.max(0,Math.min(1,Number(v)||0));draw();}
 function setSource(name){source=String(name||'The Sun');draw();}
 function down(e){if(canvas.hidden)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});pinchLast=0;}
 function move(e){const prev=pointers.get(e.pointerId);if(!prev)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const [a,b]=[...pointers.values()],span=Math.hypot(a.x-b.x,a.y-b.y);if(pinchLast>4&&Math.abs(span-pinchLast)>4)onChange(Math.max(0,Math.min(1,fraction+(pinchLast-span)*.0009)));pinchLast=span;}
  else{const dx=e.clientX-prev.x;onChange(Math.max(0,Math.min(1,fraction+dx/Math.max(220,width)*.8)));}
 }
 function up(e){pointers.delete(e.pointerId);pinchLast=0;}
 function wheel(e){if(canvas.hidden)return;e.preventDefault();onChange(Math.max(0,Math.min(1,fraction+(e.deltaY>0?.02:-.02))));}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});
 const ro=new ResizeObserver(resize);ro.observe(container);resize();
 return {resize,setProgress,setSource,dispose(){disposed=true;ro.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);earthImg.onload=earthImg.onerror=null;}};
}
