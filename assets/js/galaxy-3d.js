// Opt-in spatial star disk: deterministic illustrative points, not a real
// reconstruction of the Milky Way or another observed galaxy.
export async function createGalaxy3D(canvas,container) {
  const THREE=await import('three');
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0c1420);
  const camera=new THREE.PerspectiveCamera(46,1,.1,100);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  let seed=8117;
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  const positions=[],colors=[],warm=new THREE.Color(0xeed8b2),cool=new THREE.Color(0x93b8e6);
  for(let i=0;i<2700;i++) {
    const arm=i%4;
    const radius=.65+random()*5.1;
    const theta=arm*Math.PI/2+radius*.65+(random()-.5)*.37;
    const x=Math.cos(theta)*radius,y=Math.sin(theta)*radius,z=(random()-.5)*.17;
    positions.push(x,y,z);
    const c=warm.clone().lerp(cool,Math.min(.85,radius/6.5)).multiplyScalar(.55+random()*.6);
    colors.push(c.r,c.g,c.b);
  }
  // A central bulge adds real spatial depth, unlike the flat 2D projection.
  for(let i=0;i<850;i++){
    const u=random()*2-1,phi=2*Math.PI*random(),r=1.15*Math.cbrt(random());
    positions.push(r*Math.sqrt(1-u*u)*Math.cos(phi),r*Math.sqrt(1-u*u)*Math.sin(phi),r*u*.9);
    const c=warm.clone().multiplyScalar(.6+random()*.4);
    colors.push(c.r,c.g,c.b);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const stars=new THREE.Points(geometry,new THREE.PointsMaterial({
    vertexColors:true,size:.065,sizeAttenuation:true,transparent:true,opacity:.88,depthWrite:false
  }));
  scene.add(stars);
  let angle=0;
  function draw(){
    if(canvas.hidden)return;
    const theta=angle*Math.PI/180;
    camera.position.set(0,17*Math.sin(theta),17*Math.cos(theta));
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
  }
  function resize(){
    const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);
    renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();draw();
  }
  const observer=new ResizeObserver(resize);
  observer.observe(container);
  return {update(value){angle=value;draw();},resize,
    dispose(){observer.disconnect();geometry.dispose();stars.material.dispose();renderer.dispose();}};
}
