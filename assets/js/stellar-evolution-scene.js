// Deterministic painted appearance — an artist's concept, not a star model,
// astronomical timelapse, observed image, true relative radii or timescale.
export function createStellarEvolutionScene(canvas) {
  const context=canvas.getContext('2d',{alpha:false});
  if(!context) throw new Error('Canvas2D unavailable');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=matchMedia('(pointer: coarse)').matches;
  const PI2=Math.PI*2;
  const random=n=>{const r=Math.sin(n*137.57+7.013)*43758.5453;return r-Math.floor(r);};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let width=1,height=1,dpr=1,stage=0,mass='sun',previousStage=0,previousMass='sun';
  let started=0,duration=0,raf=null,disposed=false;
  function fillCircle(x,y,r,fill){context.fillStyle=fill;context.beginPath();context.arc(x,y,r,0,PI2);context.fill();}
  function radial(x,y,r,stops){
    const g=context.createRadialGradient(x,y,0,x,y,Math.max(1,r));
    for(const [at,color] of stops)g.addColorStop(at,color);
    return g;
  }
  function background(){
    const g=context.createLinearGradient(0,0,width,height);
    g.addColorStop(0,'#040715');g.addColorStop(.52,'#101b31');g.addColorStop(1,'#050916');
    context.fillStyle=g;context.fillRect(0,0,width,height);
    const stars=coarse?170:360;
    for(let i=0;i<stars;i++){
      const x=random(i*2+1)*width,y=random(i*7+6)*height,r=.3+random(i*4+9)*1.2;
      fillCircle(x,y,r,`rgba(220,237,251,${.2+random(i*8+5)*.58})`);
    }
  }
  function cloud(x,y,r,hue,opacity=1,extent=1){
    context.save();context.globalAlpha*=opacity;
    for(let i=0;i<(coarse?23:50);i++){
      const a=random(i*11+5)*PI2,dist=(.08+random(i*9+12)*.93)*r;
      const cx=x+Math.cos(a)*dist,cy=y+Math.sin(a)*dist*.59;
      fillCircle(cx,cy,r*(.14+random(i*2+3)*.41)*extent,radial(cx,cy,r*.47*extent,[[0,`hsla(${hue+(random(i+13)-.5)*65},75%,55%,.36)`],[.55,`hsla(${hue},80%,34%,.14)`],[1,'rgba(0,0,0,0)']]));
    }
    context.restore();
  }
  function specks(x,y,r,count,color,spread=.9){
    context.save();context.fillStyle=color;
    for(let i=0;i<count;i++){
      const a=random(i*23+2)*PI2,d=Math.sqrt(random(i*37+3))*r;
      context.globalAlpha=.2+random(i*17+8)*.75;
      context.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d*spread,.5+random(i*7)*1.5,.5+random(i*5)*1.5);
    }
    context.restore();
  }
  function star(x,y,r,tint,edge,halo=2.2){
    const outer=radial(x,y,r*halo,[[0,`rgba(${tint},.36)`],[.42,`rgba(${tint},.12)`],[1,'rgba(0,0,0,0)']]);
    fillCircle(x,y,r*halo,outer);
    const shape=radial(x-r*.27,y-r*.27,r*1.35,[[0,'#ffffff'],[.22,`rgb(${tint})`],[.72,`rgb(${edge})`],[1,'#241025']]);
    fillCircle(x,y,r,shape);
    // Small chromosphere flecks signal a bright, actively radiating exterior.
    context.save();context.beginPath();context.arc(x,y,r,0,PI2);context.clip();
    for(let i=0;i<26;i++){
      const a=random(i*41+2)*PI2,d=Math.sqrt(random(i*3+19))*r;
      fillCircle(x+Math.cos(a)*d,y+Math.sin(a)*d,r*(.02+.06*random(i*7+8)),'rgba(255,247,199,.12)');
    }
    context.restore();
  }
  function expandingShell(x,y,r,kind){
    const palette=kind==='sun'?['90,204,205','243,139,193']:['255,190,99','231,80,68'];
    for(let j=0;j<3;j++){
      const shellR=r*(.66+j*.3);
      context.save();context.beginPath();context.ellipse(x,y,shellR,shellR*(.7+.07*j),-.22,0,PI2);
      context.strokeStyle=`rgba(${palette[j%2]},${.55-j*.15})`;
      context.lineWidth=Math.max(2,r*(.065-j*.013));
      context.shadowBlur=r*.21;context.shadowColor=`rgba(${palette[j%2]},.8)`;
      context.stroke();context.restore();
    }
    specks(x,y,r*1.25,coarse?85:200,kind==='sun'?'#94ecee':'#f7a867');
  }
  function scene(index,branch,scale,alpha){
    context.save();context.translate(width*.5,height*.51);context.scale(scale,scale);
    context.globalAlpha=alpha;
    const r=Math.min(width*.33,height*.43),x=0,y=0;
    if(index===0){
      cloud(x,y,r*1.42,branch==='sun'?215:268,.96,1.15);
      cloud(x+r*.25,y-r*.16,r*.91,branch==='sun'?290:14,.78,.9);
      specks(x,y,r*1.18,coarse?90:240,'#d8eafa');
      fillCircle(x,y,r*.035,radial(x,y,r*.15,[[0,'rgba(255,245,214,.6)'],[1,'rgba(0,0,0,0)']]));
    }else if(index===1){
      cloud(x,y,r*1.08,branch==='sun'?210:276,.59,1.12);
      context.save();context.translate(x,y);context.rotate(-.24);
      context.strokeStyle='rgba(228,173,126,.42)';context.lineWidth=r*.21;context.beginPath();context.ellipse(0,0,r*.61,r*.16,0,0,PI2);context.stroke();context.restore();
      star(x,y,r*.19,'255,225,161','214,125,66',3.1);
      specks(x,y,r*.8,coarse?80:140,'#d9bb9e',.55);
    }else if(index===2){
      star(x,y,branch==='sun'?r*.42:r*.54,branch==='sun'?'255,235,175':'174,213,255',branch==='sun'?'212,139,75':'83,120,183',2.5);
      if(branch==='massive'){
        for(let i=0;i<16;i++){
          const angle=i*PI2/16;
          context.strokeStyle='rgba(153,201,255,.3)';context.lineWidth=1.3;
          context.beginPath();context.moveTo(Math.cos(angle)*r*.58,Math.sin(angle)*r*.58);
          context.lineTo(Math.cos(angle)*r*.8,Math.sin(angle)*r*.8);context.stroke();
        }
      }
    }else if(index===3){
      const giant=branch==='sun'?r*.69:r*.86;
      star(x,y,giant,branch==='sun'?'255,162,106':'255,120,85',branch==='sun'?'156,53,39':'125,34,28',1.48);
      for(let i=0;i<18;i++){
        const a=i*PI2/18,arc=giant*(1.04+.09*Math.sin(3*a));
        fillCircle(Math.cos(a)*arc,Math.sin(a)*arc,giant*.08,radial(Math.cos(a)*arc,Math.sin(a)*arc,giant*.14,[[0,'rgba(255,104,62,.24)'],[1,'rgba(0,0,0,0)']]));
      }
    }else if(index===4){
      if(branch==='sun'){
        expandingShell(x,y,r*.84,'sun');
        cloud(x,y,r*1.15,186,.35);
        star(x,y,r*.09,'239,249,255','160,213,234',3.3);
      }else{
        cloud(x,y,r*1.1,14,.55,1.4);
        for(let i=0;i<32;i++){
          const a=i*PI2/32,d=r*(.23+.65*random(i*19+8));
          context.strokeStyle=`rgba(255,${85+Math.round(random(i*11)*100)},70,${.3+.45*random(i*3)})`;
          context.lineWidth=1.2+random(i*2)*2;
          context.beginPath();context.moveTo(Math.cos(a)*r*.12,Math.sin(a)*r*.12);
          context.lineTo(Math.cos(a)*d,Math.sin(a)*d);context.stroke();
        }
        expandingShell(x,y,r*.55,'massive');
        star(x,y,r*.12,'255,237,215','231,128,91',5.4);
      }
    }else if(index===5){
      if(branch==='sun'){
        cloud(x,y,r*.7,200,.23);
        star(x,y,r*.14,'228,244,255','140,189,232',3.7);
      }else{
        // Either neutron star or black hole is possible, not a universal fate.
        cloud(x,y,r*.8,217,.28,.9);
        context.save();context.scale(1,.37);
        context.strokeStyle='rgba(136,214,247,.52)';context.lineWidth=r*.06;
        context.beginPath();context.ellipse(0,0,r*.68,r*.68,-.28,0,PI2);context.stroke();context.restore();
        fillCircle(x,y,r*.22,radial(x,y,r*.35,[[0,'#03070f'],[.48,'#060912'],[.66,'rgba(118,183,231,.46)'],[1,'rgba(0,0,0,0)']]));
        fillCircle(x,y,r*.155,'#02050b');
      }
    }
    context.restore();
  }
  function draw(now=performance.now()){
    if(disposed)return;
    context.setTransform(dpr,0,0,dpr,0,0);context.globalAlpha=1;background();
    const t=duration?clamp((now-started)/duration,0,1):1;
    const e=t*t*(3-2*t);
    if(t<1){
      scene(previousStage,previousMass,1-.4*e,1-e);
      scene(stage,mass,.72+.28*e,e);
    }else scene(stage,mass,1,1);
  }
  function frame(now){raf=null;draw(now);if(now-started<duration)request();}
  function request(){if(raf===null&&!document.hidden&&!disposed)raf=requestAnimationFrame(frame);}
  function setStage(next,branch){
    const i=clamp(Math.round(Number(next)),0,5);
    const b=branch==='massive'?'massive':'sun';
    if(i===stage&&mass===b){draw();return;}
    previousStage=stage;previousMass=mass;stage=i;mass=b;
    duration=media.matches?0:630;started=performance.now();
    if(duration===0)draw();else request();
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();
    if(rect.width<4||rect.height<4)return;
    width=rect.width;height=rect.height;
    dpr=Math.min(window.devicePixelRatio||1,coarse?1.25:1.75);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    draw();
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const onVisibility=()=>{if(document.hidden){if(raf!==null)cancelAnimationFrame(raf);raf=null;duration=0;}};
  document.addEventListener('visibilitychange',onVisibility);
  const onPreference=()=>{if(media.matches){if(raf!==null)cancelAnimationFrame(raf);raf=null;duration=0;draw();}};
  media.addEventListener?.('change',onPreference);
  resize();
  return {setStage,resize,dispose(){disposed=true;observer.disconnect();onVisibility();
    document.removeEventListener('visibilitychange',onVisibility);
    media.removeEventListener?.('change',onPreference);}};
}
