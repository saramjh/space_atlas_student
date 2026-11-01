/**
 * Procedural stellar art — original conceptual illustrations.
 * References: JWST Carina star-forming region, Hubble planetary nebulae,
 * Webb Cassiopeia A shock filaments, NASA stellar evolution.
 * No remote textures, image copying, subscriptions or extra libraries.
 */
const W=1120,H=600,TWO_PI=Math.PI*2;
const canvas=document.getElementById('stellarCinemaCanvas');
const ctx=canvas?.getContext('2d',{alpha:false});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[
 [
 ['MOLECULAR CLOUD','COLLAPSING GAS AND DUST','Notice the dark dust lanes and layered gas: a nebula is not a solid sphere.','nebula'],
 ['PROTOSTAR','CONTRACTION AND INFALL','The heated central source is fed by a dusty accretion disk; narrow jets indicate outflows.','protostar'],
 ['MAIN SEQUENCE','STABLE HYDROGEN FUSION','A granular, luminous photosphere marks a star supported against gravity by core fusion.','main'],
 ['RED GIANT','EXPANDED STELLAR ENVELOPE','The star expands and its outer atmosphere develops large convective structures.','giant'],
 ['PLANETARY NEBULA','EJECTED GAS SHELLS','Translucent concentric shells reveal the exposed, hot remnant in their center.','planetary'],
 ['WHITE DWARF','THE REMAINING CORE','A small, intensely hot stellar core remains, cooling over billions of years.','dwarf']
 ],
 [
 ['MOLECULAR CLOUD','MASSIVE GAS COLLAPSE','The collapsing cloud can form much more massive stars when greater amounts of gas collect.','nebulaMassive'],
 ['MASSIVE PROTOSTAR','ACCRETION AND OUTFLOWS','A massive protostar grows inside a bright accretion disk while jets and outflows emerge.','protoMassive'],
 ['HOT MAIN SEQUENCE','RAPID HYDROGEN FUSION','An intense blue-white star consumes fuel much faster than a Sun-like star.','mainMassive'],
 ['RED SUPERGIANT','LARGE UNSTABLE ENVELOPE','Huge convective cells and gas losses distinguish the extended atmosphere.','supergiant'],
 ['SUPERNOVA REMNANT','COLLAPSE AND SHOCK WAVES','Fragmented shells and shock filaments spread outward; not every collapse is a bright supernova.','supernova'],
 ['POSSIBLE REMNANTS','NEUTRON STAR OR BLACK HOLE','Two alternative compact remnants: a neutron star with beams, or a black hole with hot infalling material.','remnants']
 ]
];
const cache=new Map(),textures=new Map();
// Three distinct observations supply detail textures, not a single star's timeline.
const refs={
 carina:{file:'carina-observed.jpg',name:'Carina star-forming region · Webb',credit:'NASA, ESA, CSA, and STScI',url:'https://esawebb.org/images/weic2205a/'},
 l1527:{file:'protostar-observed.jpg',name:'Protostar L1527 · Webb',credit:'NASA, ESA, CSA, and STScI, J. DePasquale (STScI)',url:'https://esawebb.org/images/weic2219a/'},
 catseye:{file:'catseye-observed.jpg',name:"Cat's Eye planetary nebula · Hubble",credit:'J.P. Harrington and K.J. Borkowski (University of Maryland), and NASA/ESA',url:'https://esahubble.org/images/opo9501a/'},
 casa:{file:'casa-observed.jpg',name:'Cassiopeia A supernova remnant · Webb',credit:'NASA, ESA, CSA, STScI, D. Milisavljevic (Purdue University), T. Temim (Princeton University), I. De Looze (University of Gent)',url:'https://esawebb.org/images/weic2330e/'}
};
const photos=new Map();
function observed(g,key,alpha=1,centered=false){
 if(!photos.has(key)){
  const entry={status:'loading',image:new Image()};photos.set(key,entry);
  entry.image.onload=()=>{entry.status='ready';cache.clear();paint(performance.now());};
  entry.image.onerror=()=>{entry.status='failed';};
  entry.image.decoding='async';
  entry.image.src=new URL('../images/stellar-references/'+refs[key].file,import.meta.url).href;
 }
 const state=photos.get(key);
 if(state.status!=='ready'||!state.image.naturalWidth)return false;
 const im=state.image;
 g.save();g.globalAlpha=alpha;
 if(centered){
  const side=520,r=side/2;
  g.translate(560,305);g.beginPath();g.arc(0,0,r,0,TWO_PI);g.clip();
  const z=Math.max(side/im.width,side/im.height);
  g.drawImage(im,-im.width*z/2,-im.height*z/2,im.width*z,im.height*z);
  const edge=g.createRadialGradient(0,0,r*.62,0,0,r);
  edge.addColorStop(0,'rgba(2,9,18,0)');edge.addColorStop(1,'rgba(2,9,18,.87)');
  g.fillStyle=edge;g.fillRect(-r,-r,side,side);
 }else{
  const z=Math.max(W/im.width,H/im.height);
  g.drawImage(im,(W-im.width*z)/2,(H-im.height*z)/2,im.width*z,im.height*z);
 }
 g.restore();return true;
}

let branch=0,step=0,oldScene=null,changedAt=0,active=false,visible=true,lastTime=0,frameHandle=null;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function hash(x,y,s=0){
 let v=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s+51,1442695041);
 v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967295;
}
function smooth(v){return v*v*(3-2*v);}
function noise(x,y,s){
 const xi=Math.floor(x),yi=Math.floor(y),u=smooth(x-xi),v=smooth(y-yi);
 const a=hash(xi,yi,s)*(1-u)+hash(xi+1,yi,s)*u;
 const b=hash(xi,yi+1,s)*(1-u)+hash(xi+1,yi+1,s)*u;
 return a*(1-v)+b*v;
}
function turbulent(x,y,s){
 return .53*noise(x,y,s)+.28*noise(x*2.07,y*2.07,s+7)+
 .13*noise(x*4.17,y*4.17,s+18)+.06*noise(x*8.39,y*8.39,s+31);
}
function buffer(w,h){const el=document.createElement('canvas');el.width=w;el.height=h;return el;}
function glow(g,x,y,r,c,alpha){
 const d=g.createRadialGradient(x,y,0,x,y,r);
 d.addColorStop(0,'rgba('+c+','+(alpha*.85)+')');
 d.addColorStop(.3,'rgba('+c+','+(alpha*.39)+')');
 d.addColorStop(1,'rgba('+c+',0)');
 g.fillStyle=d;g.fillRect(x-r,y-r,r*2,r*2);
}
function background(g,seed){
 const b=g.createLinearGradient(0,0,W,H);
 b.addColorStop(0,'#020a13');b.addColorStop(.48,'#061522');b.addColorStop(1,'#020813');
 g.fillStyle=b;g.fillRect(0,0,W,H);
 for(let i=0;i<340;i++){
  const x=hash(i,2,seed)*W,y=hash(i,3,seed)*H,q=hash(i,4,seed);
  g.fillStyle='rgba(179,206,230,'+(.14+q*.52)+')';
  g.beginPath();g.arc(x,y,q>.98?1.65:.25+q*.65,0,TWO_PI);g.fill();
  if(q>.986)glow(g,x,y,7,'165,212,249',.15);
 }
}
function cloudTexture(seed,massive){
 const key='cloud'+seed+'-'+massive;
 if(textures.has(key))return textures.get(key);
 const cw=760,ch=420,c=buffer(cw,ch),g=c.getContext('2d');
 const im=g.createImageData(cw,ch),p=im.data;
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
  const xx=x/cw,yy=y/ch;
  const spine=.20*Math.sin(xx*11.3+yy*5.1)+.09*Math.cos(xx*19.2-yy*13.3);
  const swept=yy-.52-(xx-.51)*.27-spine;
  const veil=Math.exp(-Math.pow(swept/.27,2));
  const wx=xx*4+Math.sin(yy*11+xx*4)*.28,wy=yy*4+Math.sin(xx*13-yy*6)*.28;
  const n=turbulent(wx,wy,seed),f=turbulent(xx*19,yy*19,seed+44);
  const lane=turbulent(xx*7+3,yy*7-2,seed+87);
  const fib=Math.abs(noise(xx*13+Math.sin(yy*23)*.29,yy*17,seed+8)-.5);
  const filament=Math.pow(1-clamp(fib*5),5);
  const a=clamp((veil*(n*.78+.22)+filament*.18-lane*.16-.10)*1.9)*(1-clamp((lane-.44)*1.7)*.87);
  const mix=clamp(.46+.4*Math.sin(xx*4+yy*2+seed)+.17*n);
  const blue=massive?[63,105,204]:[48,128,191];
  const orange=massive?[255,118,103]:[237,139,93];
  const i=(y*cw+x)*4;
  for(let chn=0;chn<3;chn++)p[i+chn]=Math.min(255,Math.round(blue[chn]*(1-mix)+orange[chn]*mix+(f-.35)*32));
  p[i+3]=Math.round(255*a*(.42+.59*f));
 }
 g.putImageData(im,0,0);textures.set(key,c);return c;
}
function cloud(g,seed,alpha,massive=false,scale=1){
 g.save();g.translate(560,300);g.scale(scale,scale);g.globalAlpha=alpha;
 g.drawImage(cloudTexture(seed,massive),-565,-306,1130,612);g.restore();
}
function starTexture(seed,kind){
 const key='star'+seed+kind;if(textures.has(key))return textures.get(key);
 const dim=360,c=buffer(dim,dim),g=c.getContext('2d'),im=g.createImageData(dim,dim),p=im.data;
 const giant=kind==='giant',blue=kind==='blue',white=kind==='white';
 const rgb=white?[213,231,251]:blue?[165,211,253]:giant?[246,125,59]:[255,201,123];
 for(let y=0;y<dim;y++)for(let x=0;x<dim;x++){
  const nx=(x+.5-dim/2)/(dim/2),ny=(y+.5-dim/2)/(dim/2),r=Math.hypot(nx,ny),i=(y*dim+x)*4;
  if(r>1.008)continue;
  const a=turbulent(nx*6+20,ny*6+21,seed),b=turbulent(nx*30+15,ny*30+14,seed+4);
  const gran=(a-.5)*(giant?1.05:.3)+(b-.5)*(giant?.36:.23);
  const hot=giant?Math.sin(Math.atan2(ny,nx)*8+r*26+a*5)*.12:0;
  const limb=Math.sqrt(Math.max(0,1-r*r));
  const intensity=clamp(.45+limb*.55+gran+hot,.14,1.45);
  const spot=!white&&!blue&&!giant&&turbulent(nx*14+4,ny*14+2,seed+77)>.72?.56:1;
  for(let j=0;j<3;j++)p[i+j]=Math.min(255,Math.round(rgb[j]*intensity*spot));
  p[i+3]=Math.round(255*clamp((1.008-r)*110));
 }
 g.putImageData(im,0,0);textures.set(key,c);return c;
}
function sphere(g,x,y,r,kind,seed){
 const color=kind==='blue'?'155,202,255':kind==='giant'?'255,125,71':kind==='white'?'214,236,255':'255,206,128';
 g.save();g.globalCompositeOperation='screen';
 glow(g,x,y,r*2.25,color,.25);glow(g,x,y,r*1.28,color,.22);
 g.restore();g.drawImage(starTexture(seed,kind),x-r,y-r,r*2,r*2);
 g.strokeStyle='rgba('+color+',.37)';g.lineWidth=1.4;g.beginPath();g.arc(x,y,r,0,TWO_PI);g.stroke();
}
function scatter(g,seed,n,draw){
 for(let i=0;i<n;i++)draw(hash(i,0,seed),hash(i,1,seed),hash(i,2,seed),i);
}
function nursery(g,massive=false){
 cloud(g,massive?19:12,1,massive,1.1);
 cloud(g,massive?38:33,.42,massive,1.34);
 scatter(g,201,180,(u,v,q,i)=>{
  if(q<.29)return;
  glow(g,160+u*805,98+v*407,2+q*6,i%4?'125,196,239':'255,168,127',q*.24);
 });
 glow(g,548,305,60,'198,233,250',massive?.22:.14);
}
function forming(g,massive){
 cloud(g,33,.6,massive,1.04);
 g.save();g.translate(560,307);g.rotate(-.21);
 glow(g,0,0,250,'231,129,74',.18);
 for(let i=0;i<21;i++){
  const r=68+i*6.7;
  g.strokeStyle=i%3?'rgba(214,119,63,.20)':'rgba(255,195,126,.46)';
  g.lineWidth=.85+i*.19;g.beginPath();g.ellipse(0,0,r,r*.26,0,.03,3.09);g.stroke();
 }
 g.fillStyle='rgba(12,19,26,.88)';g.beginPath();g.ellipse(0,2,167,21,0,Math.PI,TWO_PI);g.fill();
 // collimated dust jets; decreasing emission away from the star.
 for(const sign of [-1,1]){
  scatter(g,sign===1?30:39,140,(u,v,q)=>{
   const depth=54+u*(massive?245:210)*sign;
   const xx=(v-.5)*(5+Math.abs(depth)*.10);
   g.fillStyle='rgba(138,220,252,'+(.08+.4*(1-u))+')';
   g.beginPath();g.arc(xx,depth,.5+q*2.3,0,TWO_PI);g.fill();
  });
 }
 g.restore();
 sphere(g,560,303,massive?41:33,massive?'blue':'sun',11);
}
function coronas(g,r,seed,red=false){
 g.save();g.globalCompositeOperation='screen';
 for(let i=0;i<67;i++){
  const a=i/67*TWO_PI,ext=7+28*hash(i,1,seed),bend=(hash(i,3,seed)-.5)*.12;
  g.strokeStyle=red?'rgba(255,117,67,.18)':'rgba(255,192,107,.24)';
  g.lineWidth=.65+hash(i,5,seed)*2;g.beginPath();
  g.moveTo(560+Math.cos(a)*r,305+Math.sin(a)*r);
  g.quadraticCurveTo(560+Math.cos(a+bend)*(r+ext)*1.14,305+Math.sin(a+bend)*(r+ext)*1.14,
    560+Math.cos(a+bend*2)*(r+ext),305+Math.sin(a+bend*2)*(r+ext));g.stroke();
 }
 g.restore();
}
function ring(g,seed,rad,col,strength=1,rot=0){
 g.save();g.translate(560,305);g.rotate(rot);g.globalCompositeOperation='screen';
 for(let j=0;j<8;j++){
  const R=rad*(.65+j*.065);
  g.beginPath();
  for(let i=0;i<=520;i++){
   const a=i/520*TWO_PI,n=noise(Math.cos(a)*4+10,Math.sin(a)*4+11,seed+j*7);
   const k=1+.07*Math.sin(a*7+seed*.5+j)+.12*(n-.5);
   const x=Math.cos(a)*R*k,y=Math.sin(a)*R*(.61+.05*Math.sin(a*3+j))*k;
   if(!i)g.moveTo(x,y);else g.lineTo(x,y);
  }
  g.strokeStyle='rgba('+col+','+((1-j/8)*strength*.54)+')';g.lineWidth=j%3?1.5:4;g.stroke();
 }
 scatter(g,seed+88,620,(u,v,q,i)=>{
  const a=u*TWO_PI,R=rad*(.67+v*.34);
  g.fillStyle='rgba('+(i%8===0?'255,176,127':col)+','+((.07+q*.5)*strength)+')';
  g.beginPath();g.arc(Math.cos(a)*R,Math.sin(a)*R*.61,.45+q*2.4,0,TWO_PI);g.fill();
 });
 g.restore();
}
function planetary(g){
 cloud(g,71,.13,false,1.1);
 glow(g,560,305,300,'49,161,202',.19);
 ring(g,7,233,'83,203,225',.65,.3);
 ring(g,19,173,'175,145,235',.63,-.24);
 ring(g,42,151,'120,239,237',.98,.43);
 ring(g,29,112,'240,179,134',.7,-.17);
 sphere(g,560,305,13,'white',19);glow(g,560,305,69,'192,235,255',.59);
}
function supernova(g){
 cloud(g,97,.38,true,1.2);
 glow(g,560,305,360,'114,135,232',.09);
 ring(g,42,255,'236,109,102',1,-.18);
 ring(g,97,211,'255,171,125',.92,.45);
 ring(g,74,146,'153,177,251',.68,.1);
 g.save();g.globalCompositeOperation='screen';
 scatter(g,31,280,(u,v,q,i)=>{
  const a=u*TWO_PI,R=155+v*124;
  g.strokeStyle=i%3?'rgba(255,149,116,.24)':'rgba(113,174,255,.25)';
  g.lineWidth=.7+q*2.7;g.beginPath();
  g.moveTo(560+Math.cos(a)*R,305+Math.sin(a)*R*.67);
  g.quadraticCurveTo(560+Math.cos(a+.04)*(R+9),305+Math.sin(a+.04)*(R+21)*.7,
    560+Math.cos(a+.11)*(R+31),305+Math.sin(a+.11)*(R+26)*.71);g.stroke();
 });
 g.restore();glow(g,560,305,80,'213,219,248',.21);
}
function compact(g){
 const left=354,right=810;
 g.fillStyle='rgba(193,209,225,.12)';g.fillRect(559,113,1,376);
 glow(g,left,302,144,'125,192,255',.17);sphere(g,left,291,29,'blue',45);
 glow(g,left,291,63,'211,231,255',.62);
 g.save();g.translate(left,291);g.rotate(.32);
 for(const sign of [-1,1]){
  const d=g.createLinearGradient(0,0,0,sign*238);
  d.addColorStop(0,'rgba(208,246,255,.43)');d.addColorStop(1,'rgba(91,158,254,0)');
  g.fillStyle=d;g.beginPath();g.moveTo(-8,0);g.lineTo(-58,sign*239);
  g.lineTo(58,sign*239);g.lineTo(8,0);g.fill();
 }
 g.restore();
 glow(g,right,303,153,'240,126,66',.17);
 g.save();g.translate(right,303);g.rotate(-.18);
 for(let i=0;i<25;i++){
  const r=84+i*2.7;
  g.strokeStyle='rgba('+(i%3?'255,145,80':'239,229,188')+','+(.08+i*.011)+')';
  g.lineWidth=1.65;g.beginPath();g.ellipse(0,0,r,r*.31,0,0,TWO_PI);g.stroke();
 }
 g.restore();
 glow(g,right,303,60,'255,231,186',.49);
 g.fillStyle='#01050b';g.beginPath();g.arc(right,303,54,0,TWO_PI);g.fill();
 g.strokeStyle='rgba(255,223,173,.82)';g.lineWidth=4;g.beginPath();g.arc(right,303,56,0,TWO_PI);g.stroke();
 g.textAlign='center';g.font='600 16px system-ui,sans-serif';g.fillStyle='rgba(238,244,252,.86)';
 g.fillText('NEUTRON STAR',left,520);g.fillText('BLACK HOLE',right,520);
}
function build(path,index){
 const key=path+'-'+index;
 if(cache.has(key))return cache.get(key);
 const c=buffer(W,H),g=c.getContext('2d',{alpha:false});
 background(g,path*11+index);
 if(index===0){
  if(observed(g,'carina',.85)){
    g.fillStyle='rgba(3,12,24,.14)';g.fillRect(0,0,W,H);
    cloud(g,path===1?37:33,.14,path===1,1.12);
  }else nursery(g,path===1);
 }
 if(index===1){
  // The Webb L1527 hourglass is an observational morphology anchor, not a
  // before/after photograph of either representative modeled star.
  observed(g,'l1527',.58);
  forming(g,path===1);
 }
 if(index===2){
  const r=path===1?158:132;
  cloud(g,path===1?29:68,.08,path===1,1.1);
  sphere(g,560,305,r,path===1?'blue':'sun',path===1?21:9);
  coronas(g,r,path===1?19:6);
 }
 if(index===3){
  const r=path===1?221:190;
  cloud(g,42,.12,false,1.1);
  sphere(g,560,305,r,'giant',path===1?52:34);coronas(g,r,47,true);
  scatter(g,73,120,(u,v,q)=>{
   const a=u*TWO_PI,R=r+18+v*160;
   g.fillStyle='rgba(237,116,70,'+((.08+q*.29)*(1-v))+')';
   g.beginPath();g.arc(560+Math.cos(a)*R,305+Math.sin(a)*R,1+q*3,0,TWO_PI);g.fill();
  });
 }
 if(index===4){
  if(path===0){
   if(observed(g,'catseye',.92,true)){
    ring(g,7,229,'79,194,215',.30,.21);
    glow(g,560,305,44,'183,235,255',.13);
   }else planetary(g);
  }else{
   if(observed(g,'casa',.91,true)){
    ring(g,42,266,'237,103,97',.29,-.17);
    ring(g,97,219,'255,171,122',.24,.4);
   }else supernova(g);
  }
 }
 if(index===5){
  if(path===0){
   ring(g,8,242,'78,126,163',.16,.18);glow(g,560,300,169,'128,187,249',.13);
   sphere(g,560,305,33,'white',83);glow(g,560,305,95,'174,231,255',.38);
  }else compact(g);
 }
 const v=g.createRadialGradient(560,300,240,560,300,650);
 v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,4,11,.67)');
 g.fillStyle=v;g.fillRect(0,0,W,H);
 cache.set(key,c);
 if(cache.size>4)cache.delete(cache.keys().next().value);
 return c;
}
function resize(){
 const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.65);
 const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
}

// Conceptual movement cues, deliberately not a physical time or velocity
// simulation. Each cue marks a DIFFERENT process, rather than generic
// twinkling. All are completely suppressed by reduced-motion.
function processMotion(g,kind,t){
 g.save();
 const phase=t*.25;
 if(kind==='protostar'||kind==='protoMassive'){
  // Narrow bipolar streams move away from the infalling central source.
  g.globalCompositeOperation='screen';
  const extent=kind==='protoMassive'?220:190;
  for(const dir of [-1,1])for(let k=0;k<23;k++){
   const u=(k/23+phase*.11)%1;
   const y=305+dir*(49+u*extent);
   const spread=(7+u*20),x=560+Math.sin(k*17.1+t*.2)*spread*.43;
   const a=(1-u)*.6;
   g.fillStyle='rgba(142,217,255,'+a.toFixed(3)+')';
   g.beginPath();g.ellipse(x,y,1.15+u*.85,3.5+u*2,0,0,TWO_PI);g.fill();
  }
 }
 if(kind==='main'||kind==='mainMassive'){
  // Gentle photospheric granular light and restrained magnetic loops.
  const R=kind==='mainMassive'?158:132;
  for(let k=0;k<5;k++){
   const angle=k*1.37+phase*.14;
   const rr=R*(.54+.16*Math.sin(k*4.4+phase*.17));
   const x=560+Math.cos(angle)*rr,y=305+Math.sin(angle)*rr;
   glow(g,x,y,11,kind==='mainMassive'?'168,205,255':'255,223,154',.038);
  }
 }
 if(kind==='giant'||kind==='supergiant'){
  // Low-frequency envelope-driven shedding beyond the photosphere.
  const R=kind==='supergiant'?221:190;
  for(let k=0;k<54;k++){
   const u=(hash(k,14,2)+phase*.017)%1;
   const ang=hash(k,8,4)*TWO_PI;
   const rad=R+14+u*107;
   const a=(1-u)*.22;
   g.fillStyle='rgba(255,145,91,'+a.toFixed(3)+')';
   g.beginPath();g.arc(560+Math.cos(ang)*rad,305+Math.sin(ang)*rad,
    .5+hash(k,3,7)*1.5,0,TWO_PI);g.fill();
  }
 }
 if(kind==='planetary'){
  // Repeated gas shells: only their motion is illustrative, not expansion
  // speed or observed time since ejection.
  g.strokeStyle='rgba(130,226,246,.13)';g.lineWidth=2;
  for(let j=0;j<2;j++){
   const u=(phase*.012+j*.5)%1;
   const r=115+u*124;
   g.beginPath();g.ellipse(560,305,r,r*.65,-.2,0,TWO_PI);g.stroke();
  }
 }
 if(kind==='supernova'){
  // Inhomogeneous outward shock fronts, intentionally broken into arcs.
  g.globalCompositeOperation='screen';
  for(let band=0;band<2;band++){
   const u=(phase*.03+band*.5)%1,r=124+u*155;
   for(let k=0;k<13;k++){
    const angle=(k/13)*TWO_PI+(hash(k,band,49)-.5)*.16;
    const a=(1-u)*(.19+.14*hash(k,13,47));
    g.strokeStyle='rgba(255,157,112,'+a.toFixed(3)+')';
    g.lineWidth=1.4+hash(k,7,11)*2.3;
    g.beginPath();g.arc(560,305,r,angle,angle+.095+hash(k,5,39)*.12);g.stroke();
   }
  }
 }
 if(kind==='remnants'){
  // Periodic emission is pictured only for the neutron-star alternative.
  g.save();g.translate(354,291);g.rotate(phase*.7);
  const beam=g.createLinearGradient(0,-185,0,-21);
  beam.addColorStop(0,'rgba(137,195,255,0)');
  beam.addColorStop(1,'rgba(184,229,255,.22)');
  g.fillStyle=beam;
  g.beginPath();g.moveTo(-5,-21);g.lineTo(-34,-185);
  g.lineTo(34,-185);g.lineTo(5,-21);g.closePath();g.fill();
  g.restore();
 }
 g.restore();
}

function paint(now=0){
 if(!ctx)return;
 resize();
 const w=canvas.width,h=canvas.height,scale=Math.max(w/W,h/H);
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#020913';ctx.fillRect(0,0,w,h);
 ctx.setTransform(scale,0,0,scale,(w-W*scale)/2,(h-H*scale)/2);
 const mix=reduced.matches?1:clamp((now-changedAt)/620);
 if(oldScene&&mix<1){
  ctx.globalAlpha=1;ctx.drawImage(build(oldScene[0],oldScene[1]),0,0);
  ctx.globalAlpha=mix;ctx.drawImage(build(branch,step),0,0);
 }else{ctx.globalAlpha=1;ctx.drawImage(build(branch,step),0,0);oldScene=null;}
 ctx.globalAlpha=1;
 if(!reduced.matches){
  const t=now*.001,kind=scenes[branch][step][3];
  if(['nebula','nebulaMassive','protostar','protoMassive','supernova','planetary'].includes(kind)){
   ctx.save();ctx.globalCompositeOperation='screen';
   for(let i=0;i<64;i++){
    const x=hash(i,1,32)*W+Math.sin(t*.13+i)*7;
    const y=hash(i,2,76)*H+Math.cos(t*.09+i)*5;
    const a=.07+.2*(.5+.5*Math.sin(t*.57+i));
    ctx.fillStyle='rgba(166,221,252,'+a+')';ctx.beginPath();
    ctx.arc(x,y,.45+hash(i,6,11)*1.1,0,TWO_PI);ctx.fill();
   }
   ctx.restore();
  }
  if(step===4&&branch===1){
   ctx.save();ctx.globalAlpha=.10+.06*Math.sin(t*.73);
   ctx.strokeStyle='#ffa781';ctx.lineWidth=3.5;
   ctx.beginPath();ctx.ellipse(560,305,270+Math.sin(t*.35)*8,181+Math.sin(t*.35)*5,-.18,0,TWO_PI);
   ctx.stroke();ctx.restore();
  }
  if(step===5&&branch===1){
   ctx.save();ctx.translate(354,291);ctx.rotate(t*.11);ctx.strokeStyle='rgba(173,234,255,.25)';
   ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,48,20,.3,0,TWO_PI);ctx.stroke();ctx.restore();
  }
  processMotion(ctx,kind,t);
 }
 ctx.setTransform(1,0,0,1,0,0);
}
function tick(now){
 if(!active)return;
 if(now-lastTime>=32||oldScene){lastTime=now;paint(now);}
 frameHandle=requestAnimationFrame(tick);
}
function start(){
 if(active||!visible||document.hidden||reduced.matches||!ctx)return;
 active=true;frameHandle=requestAnimationFrame(tick);
}
function stop(){active=false;if(frameHandle!==null){cancelAnimationFrame(frameHandle);frameHandle=null;}}
export function setStellarScene(mass,index){
 if(!canvas||!ctx)return;
 const p=mass==='massive'?1:0,i=clamp(Number(index)||0,0,5);
 if(p!==branch||i!==step){
  oldScene=[branch,step];branch=p;step=i;changedAt=performance.now();
  // An off-screen canvas has no animation frames. Never leave the previous
  // stage's visual frozen in the bitmap when the stage label has advanced.
  if(reduced.matches||!visible)oldScene=null;
 }
 const sc=scenes[branch][step];
 canvas.setAttribute('aria-label','Conceptual scientific illustration. '+sc[0]+'. '+sc[2]+' Shapes, colors, sizes and time not to scale.');
 document.querySelector('#stellarCinemaTitle').textContent=sc[0];
 document.querySelector('#stellarCinemaBasis').textContent=sc[1];
 document.querySelector('#stellarCinemaNotice').textContent=sc[2];
 const link=document.querySelector('#stellarCinemaReference');
 if(link){
  const key=step===0?'carina':step===1?'l1527':step===4?(branch===0?'catseye':'casa'):null;
  link.hidden=!key;
  if(key){
   link.href=refs[key].url;
   link.textContent='Observed image texture: '+refs[key].name+' · Credit: '+refs[key].credit+' · Composite illustration adapted from observation';
  }
 }

 document.querySelector('#stellarCinemaCounter').textContent=String(i+1).padStart(2,'0')+' / 06 · '+(p?'MASSIVE':'SUN-LIKE')+' PATH';
 paint(performance.now());start();
}
export const stellarSceneNames=scenes.map(path=>path.map(s=>s[0]));
if(ctx){
 addEventListener('resize',()=>paint(performance.now()),{passive:true});
 if('ResizeObserver'in window)new ResizeObserver(()=>paint(performance.now())).observe(canvas);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden)stop();
  else {paint(performance.now());start();}
 });
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{
  visible=entries.some(e=>e.isIntersecting);
  if(visible){paint(performance.now());start();}else stop();
 },{rootMargin:'100px'}).observe(canvas);
 reduced.addEventListener?.('change',()=>{
  if(reduced.matches){stop();oldScene=null;paint(performance.now());}else start();
 });
}
