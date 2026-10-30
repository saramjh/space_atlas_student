import {cinematicEase} from './cinematic-motion.js';
// An opt-in cinematic scale illustration for the eight exact measurements in
// the adjacent logarithmic ruler. Drawn appearances are NEVER to scale.
export function createCosmicCinema(canvas, onStep) {
  const ctx = canvas.getContext('2d', {alpha:false});
  if (!ctx) throw new Error('2D drawing context unavailable');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const ptrs = new Map();
  let width=1, height=1, dpr=1, step=0, previous=0, started=0, duration=930;
  let frameId=null, disposed=false, lastWheel=0, parallaxX=0, parallaxY=0;
  let targetX=0, targetY=0, dragDX=0, dragDY=0, lastPinch=0;
  const TAU=Math.PI*2;
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const rand=(n)=>{const x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x);};
  const count=coarse?170:370;
  const field=Array.from({length:count},(_,i)=>({x:rand(i*2+3),y:rand(i*2+4),r:.2+rand(i*3+6)*1.55,a:.18+rand(i*4+8)*.7}));
  function glow(x,y,r,inner,outer){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,inner);g.addColorStop(1,outer);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  }
  function disc(x,y,r,base='#5d9ad6',light='#d2f5ff'){
    glow(x,y,r*1.26,'rgba(70,162,255,.3)','rgba(42,112,187,0)');
    const g=ctx.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r*1.08);
    g.addColorStop(0,light);g.addColorStop(.42,base);g.addColorStop(.85,'#142747');g.addColorStop(1,'#020814');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.clip();
    ctx.globalAlpha=.28;ctx.fillStyle='#70a7a0';
    for(let i=0;i<9;i++){
      const xx=x+(rand(i*23+3)-.5)*r*1.6,yy=y+(rand(i*17+5)-.5)*r*1.6;
      ctx.save();ctx.translate(xx,yy);ctx.rotate(rand(i+6)*TAU);ctx.scale(1.5,.48);
      ctx.beginPath();ctx.ellipse(0,0,r*(.08+rand(i+13)*.23),r*.14,0,0,TAU);ctx.fill();ctx.restore();
    }
    ctx.restore();
  }
  function star(x,y,r,glowColor='255,211,138'){
    glow(x,y,r*3.8,`rgba(${glowColor},.38)`,`rgba(${glowColor},0)`);
    const g=ctx.createRadialGradient(x-r*.28,y-r*.3,0,x,y,r);
    g.addColorStop(0,'#fffdf0');g.addColorStop(.38,`rgb(${glowColor})`);g.addColorStop(1,'#c66c37');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
  }
  function spiral(x,y,r,rotation=0,alpha=1){
    ctx.save();ctx.globalAlpha*=alpha;
    glow(x,y,r*.8,'rgba(242,198,135,.22)','rgba(242,198,135,0)');
    const points=coarse?410:1080;
    for(let i=0;i<points;i++){
      const rad=Math.sqrt(rand(i*15+3))*r*.98;
      const arm=Math.floor(rand(i*17+4)*4);
      const theta=arm*Math.PI/2+rad/r*4.3+rotation+(rand(i*23+11)-.5)*.43;
      const px=x+Math.cos(theta)*rad,py=y+Math.sin(theta)*rad*.53;
      const warm=rand(i*11+6)>.72;
      ctx.fillStyle=warm?'rgba(255,219,159,.8)':'rgba(159,210,253,.68)';
      const sz=.35+rand(i*14+7)*1.25;
      ctx.fillRect(px,py,sz,sz);
    }
    glow(x,y,r*.24,'rgba(255,237,179,.95)','rgba(245,184,100,0)');
    ctx.restore();
  }
  function backdrop(s){
    const g=ctx.createLinearGradient(0,0,width,height);
    g.addColorStop(0,'#020716');g.addColorStop(.58,'#0b1730');g.addColorStop(1,'#030711');
    ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
    glow(width*.48,height*.56,Math.max(width,height)*.7,'rgba(15,72,133,.24)','rgba(9,15,42,0)');
    ctx.save();ctx.translate(parallaxX*.3,parallaxY*.3);
    for (let i=0;i<field.length;i++){
      const p=field[i],k=1+(s*.038);
      const px=(p.x-.5)*width*k+width*.5,py=(p.y-.5)*height*k+height*.5;
      ctx.fillStyle=`rgba(229,243,255,${p.a})`;
      ctx.fillRect(px,py,p.r,p.r);
    }
    ctx.restore();
  }
  function scene(s,opacity,scale){
    ctx.save();ctx.globalAlpha=opacity;
    ctx.translate(width/2+parallaxX*.65,height*.49+parallaxY*.4);
    ctx.scale(scale,scale);
    const u=Math.min(width,height);
    const w=width,h=height;
    switch(s){
      case 0:{
        // Silhouette of an explorer on a planetary horizon. The suit is an
        // artist's illustration, not a real-time model of a particular person.
        const unit=u*.33;
        glow(0,u*.53,u*1.04,'rgba(35,114,207,.42)','rgba(32,93,158,0)');
        const land=ctx.createLinearGradient(0,u*.05,0,h);
        land.addColorStop(0,'#264766');land.addColorStop(.25,'#0e2544');land.addColorStop(1,'#050b19');
        ctx.fillStyle=land;ctx.beginPath();ctx.ellipse(0,h*.92,w*.78,h*.87,0,Math.PI,TAU);ctx.fill();
        ctx.strokeStyle='rgba(106,214,255,.63)';ctx.lineWidth=Math.max(1,u*.008);
        ctx.beginPath();ctx.ellipse(0,h*.92,w*.78,h*.87,0,Math.PI*1.12,Math.PI*1.88);ctx.stroke();
        ctx.save();ctx.translate(0,-unit*.13);
        // Back pack, articulated boots and restrained metallic highlights.
        ctx.fillStyle='#52677d';ctx.strokeStyle='#c4d6da';ctx.lineWidth=unit*.037;
        ctx.fillRect(-unit*.39,-unit*.12,unit*.2,unit*.78);
        ctx.lineCap='round';ctx.lineJoin='round';
        const suit=ctx.createLinearGradient(-unit*.35,0,unit*.38,unit*.8);
        suit.addColorStop(0,'#edf2e5');suit.addColorStop(.43,'#9badb8');suit.addColorStop(1,'#344a69');
        ctx.fillStyle=suit;
        // Legs have volume and dark joint detailing.
        for(const sign of [-1,1]){
          ctx.save();ctx.scale(sign,1);
          ctx.beginPath();ctx.moveTo(unit*.055,unit*.55);ctx.lineTo(unit*.28,unit*.54);
          ctx.lineTo(unit*.3,unit*1.13);ctx.lineTo(unit*.43,unit*1.39);
          ctx.lineTo(unit*.39,unit*1.49);ctx.lineTo(unit*.05,unit*1.49);
          ctx.lineTo(unit*.03,unit*1.33);ctx.closePath();ctx.fill();ctx.stroke();
          ctx.fillStyle='#35445a';ctx.fillRect(unit*.035,unit*.94,unit*.28,unit*.09);
          ctx.fillStyle=suit;ctx.beginPath();ctx.moveTo(unit*.23,unit*1.39);
          ctx.lineTo(unit*.47,unit*1.43);ctx.lineTo(unit*.5,unit*1.52);ctx.lineTo(unit*.08,unit*1.52);ctx.closePath();ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();ctx.moveTo(-unit*.35,-unit*.21);ctx.lineTo(unit*.34,-unit*.21);
        ctx.lineTo(unit*.35,unit*.63);ctx.lineTo(-unit*.3,unit*.63);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#566b7e';ctx.fillRect(-unit*.21,unit*.27,unit*.42,unit*.12);
        ctx.fillStyle='#d3e5e5';ctx.fillRect(-unit*.12,-unit*.10,unit*.28,unit*.13);
        for(const sign of [-1,1]){
          ctx.save();ctx.scale(sign,1);ctx.strokeStyle='#d5e3e3';ctx.lineWidth=unit*.19;
          ctx.beginPath();ctx.moveTo(unit*.33,-unit*.12);ctx.lineTo(unit*.55,unit*.31);ctx.lineTo(unit*.64,unit*.56);ctx.stroke();
          ctx.fillStyle='#53647b';ctx.beginPath();ctx.ellipse(unit*.64,unit*.59,unit*.15,unit*.12,-.2,0,TAU);ctx.fill();ctx.restore();
        }
        glow(0,-unit*.67,unit*.64,'rgba(150,211,246,.24)','rgba(150,211,246,0)');
        ctx.fillStyle='#dce8df';ctx.strokeStyle='#f3f3d6';ctx.lineWidth=unit*.045;
        ctx.beginPath();ctx.ellipse(0,-unit*.65,unit*.39,unit*.44,0,0,TAU);ctx.fill();ctx.stroke();
        const visor=ctx.createLinearGradient(-unit*.29,-unit*.83,unit*.28,-unit*.44);
        visor.addColorStop(0,'#c9dce5');visor.addColorStop(.38,'#416686');visor.addColorStop(.75,'#142c4a');visor.addColorStop(1,'#b68f60');
        ctx.fillStyle=visor;ctx.beginPath();ctx.ellipse(0,-unit*.67,unit*.31,unit*.31,0,0,TAU);ctx.fill();
        ctx.strokeStyle='rgba(248,226,178,.74)';ctx.lineWidth=unit*.025;ctx.stroke();
        ctx.restore();
        break;
      }
      case 1:disc(0,0,u*.41);break;
      case 2:{
        ctx.strokeStyle='rgba(160,207,243,.26)';ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(-w*.32,u*.12);ctx.lineTo(w*.32,u*.12);ctx.stroke();ctx.setLineDash([]);
        disc(-w*.22,0,u*.23);glow(w*.27,-u*.04,u*.09,'rgba(234,237,238,.65)','rgba(234,237,238,0)');
        ctx.fillStyle='#d8d7d0';ctx.beginPath();ctx.arc(w*.27,-u*.04,u*.068,0,TAU);ctx.fill();
        break;
      }
      case 3:{
        star(0,0,u*.08);
        for(let i=0;i<8;i++){
          const r=u*(.16+i*.065),a=(i+2)*1.53;
          ctx.strokeStyle=`rgba(152,190,228,${.12+i*.009})`;
          ctx.beginPath();ctx.ellipse(0,0,r,r*.57,-.16,0,TAU);ctx.stroke();
          glow(Math.cos(a)*r,Math.sin(a)*r*.57,u*(i>3?.011:.007),'rgba(143,194,251,.6)','rgba(143,194,251,0)');
        }
        break;
      }
      case 4:{
        star(-w*.2,0,u*.145,'255,192,118');
        star(w*.29,u*.07,u*.036,'182,215,255');
        glow(0,0,u*.3,'rgba(52,106,195,.12)','rgba(52,106,195,0)');
        break;
      }
      case 5:spiral(0,0,u*.74,0);break;
      case 6:{
        spiral(-w*.2,-u*.055,u*.43,-.4);
        spiral(w*.25,u*.05,u*.38,2.1);
        for(let i=0;i<12;i++) glow((rand(i*7)-.5)*w*.8,(rand(i*3+2)-.5)*u*.7,u*.016,'rgba(236,217,180,.4)','rgba(236,217,180,0)');
        break;
      }
      case 7:{
        const nodes=Array.from({length:44},(_,i)=>({x:(rand(i*7+5)-.5)*w*.9,y:(rand(i*4+11)-.5)*h*.8}));
        ctx.strokeStyle='rgba(85,172,223,.20)';ctx.lineWidth=1;
        for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
          const a=nodes[i],b=nodes[j];if(Math.hypot(a.x-b.x,a.y-b.y)>u*.22)continue;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
        for(const n of nodes)glow(n.x,n.y,u*.025,'rgba(158,207,252,.4)','rgba(158,207,252,0)');
        ctx.strokeStyle='rgba(173,202,233,.2)';ctx.setLineDash([4,10]);ctx.beginPath();ctx.ellipse(0,0,u*.63,u*.48,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
        break;
      }
    }
    ctx.restore();
  }
  function paint(now=performance.now()) {
    if(disposed || canvas.hidden || !width || !height)return;
    const t=duration===0?1:clamp((now-started)/duration,0,1);
    const eased=cinematicEase(t);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    backdrop(step);
    if(t<1){
      const outward=step>=previous;
      scene(previous,1-eased,outward?1-.88*eased:1+2.1*eased);
      scene(step,eased,outward?1.7-.7*eased:.54+.46*eased);
    }else scene(step,1,1);
  }
  function frame(now){frameId=null;paint(now);const active=performance.now()-started<duration;
    const drifting=Math.abs(targetX-parallaxX)+Math.abs(targetY-parallaxY)>.5;
    parallaxX+=(targetX-parallaxX)*.22;parallaxY+=(targetY-parallaxY)*.22;
    if(active||drifting)request();
  }
  function request(){if(frameId===null&&!document.hidden&&!disposed)frameId=requestAnimationFrame(frame);}
  function setStep(next){
    if(!Number.isInteger(next)||next<0||next>7)return;
    if(next===step){paint();return;}
    previous=step;step=next;
    duration=reduced.matches?0:930;started=performance.now();request();
  }
  function resize(){
    const box=canvas.getBoundingClientRect();
    if (box.width<4 || box.height<4) return; // hidden; size on re-entry
    width=box.width;height=box.height;
    dpr=Math.min(window.devicePixelRatio||1,coarse?1.25:1.75);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    paint();
  }
  function onWheel(e){
    const now=performance.now();if(Math.abs(e.deltaY)<2)return;
    const next=clamp(step+(e.deltaY>0?1:-1),0,7);
    if(next===step)return; // keep page scrolling at the first/last step
    e.preventDefault();if(now-lastWheel<700)return;
    lastWheel=now;onStep(next);
  }
  function pointerDown(e){canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0;}
  function pointerMove(e){
    if(!ptrs.has(e.pointerId))return;
    const last=ptrs.get(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ptrs.size===2){
      const [a,b]=[...ptrs.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);
      if(lastPinch>0&&Math.abs(dist-lastPinch)>35){onStep(clamp(step+(dist>lastPinch?-1:1),0,7));lastPinch=dist;}
      else if(!lastPinch)lastPinch=dist;
    } else {
      dragDX=e.clientX-last.x;dragDY=e.clientY-last.y;
      targetX=clamp(targetX+dragDX*.38,-width*.08,width*.08);
      targetY=clamp(targetY+dragDY*.38,-height*.08,height*.08);
      request();
    }
  }
  function pointerUp(e){ptrs.delete(e.pointerId);lastPinch=0;}
  function keyDown(e){if(['ArrowRight','ArrowLeft'].includes(e.key)){
    e.preventDefault();onStep(clamp(step+(e.key==='ArrowRight'?1:-1),0,7));
  }}
  canvas.addEventListener('wheel',onWheel,{passive:false});
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);
  canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);
  canvas.addEventListener('keydown',keyDown);
  const visibility=()=>{if(document.hidden&&frameId!==null){cancelAnimationFrame(frameId);frameId=null;}};
  document.addEventListener('visibilitychange',visibility);
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  resize();
  return {setStep,resize,suspend(){
    if(frameId!==null)cancelAnimationFrame(frameId);
    frameId=null;started=0;duration=0;
  },dispose(){disposed=true;observer.disconnect();visibility();
    document.removeEventListener('visibilitychange',visibility);
    canvas.removeEventListener('wheel',onWheel);canvas.removeEventListener('pointerdown',pointerDown);
    canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);
    canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('keydown',keyDown);
  }};
}
