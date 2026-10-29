// User-initiated illustrative galaxy: not measured star positions, an N-body
// solution, or a telescope image. No perpetual RAF in the idle state.
// Normalization for the rounded nominal 50,000 ly disk radius. Not an observed
// sharp edge or a 3D reconstruction of the real Milky Way.
export function galacticRadialSceneCoordinate(distanceLy) {
  if(!Number.isFinite(distanceLy) || distanceLy<0 || distanceLy>50000)throw new RangeError('Nominal galactic radial distance must be between 0 and 50000 light-years');
  return 5.92*(distanceLy/50000);
}
export async function createGalaxy3D(canvas, container, onInclination = () => {}, options = {}) {
  const THREE = await import('three');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080f1d);
  const camera = new THREE.PerspectiveCamera(46, 1, .1, 120);
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'low-power'});
  const coarse = matchMedia('(pointer: coarse)').matches;
  const addressMode = options.galacticAddress === true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  let seed = 8117;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const position = [], color = [], size = [], bulge = [];
  const warm = new THREE.Color(0xffdaa8), cool = new THREE.Color(0x84b7e9);
  const total = coarse ? 3300 : 9600;
  for (let i = 0; i < total; i++) {
    const r = .48 + Math.sqrt(random()) * 5.45;
    const theta = i % 4 * Math.PI / 2 + r * .82 + (random() - .5) * (.18 + r * .055);
    position.push(Math.cos(theta) * r, Math.sin(theta) * r, (random() - .5) * (.10 + r * .035));
    const c = warm.clone().lerp(cool, Math.min(.9, r / 7)).multiplyScalar(.53 + random() * .52);
    color.push(c.r, c.g, c.b);
    size.push(.75 + Math.pow(random(), 6) * 2.5);
    bulge.push(0);
  }
  for (let i = 0, n = coarse ? 500 : 1600; i < n; i++) {
    const u = random() * 2 - 1, phi = 2 * Math.PI * random();
    const r = 1.22 * Math.cbrt(random());
    position.push(r * Math.sqrt(1 - u * u) * Math.cos(phi), r * Math.sqrt(1 - u * u) * Math.sin(phi), r * u * .65);
    const c = warm.clone().multiplyScalar(.65 + random() * .45);
    color.push(c.r, c.g, c.b);
    size.push(.8 + random() * 1.3);
    bulge.push(1);
  }
  if(addressMode){
    // A broad galactic bar and low-opacity inter-arm disk distinguish our
    // barred-spiral artist model from a set of four narrow orbit lines.
    for(let i=0,n=coarse?500:1800;i<n;i++){
      const along=(random()-.5)*3.4, across=(random()-.5)*.55;
      const twist=.32, x=along*Math.cos(twist)-across*Math.sin(twist);
      const y=along*Math.sin(twist)+across*Math.cos(twist);
      position.push(x,y,(random()-.5)*.48);
      const c=warm.clone().multiplyScalar(.55+random()*.48);
      color.push(c.r,c.g,c.b);size.push(.6+random()*.85);bulge.push(1);
    }
    for(let i=0,n=coarse?350:1000;i<n;i++){
      const theta=random()*Math.PI*2,r=Math.sqrt(random())*5.7;
      position.push(Math.cos(theta)*r,Math.sin(theta)*r,(random()-.5)*.16);
      const c=cool.clone().multiplyScalar(.10+random()*.21);
      color.push(c.r,c.g,c.b);size.push(.45+random()*.55);bulge.push(0);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
  geometry.setAttribute('aBulge', new THREE.Float32BufferAttribute(bulge, 1));
  const uniform = {uTime: {value: 0}, uDpr: {value: dpr}};
  // Soft circular star points with a small halo. This is cheaper than multi-pass
  // bloom/SSAO and retains depth on low-end phones.
  const material = new THREE.ShaderMaterial({
    uniforms: uniform, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: `attribute float aSize; attribute float aBulge; uniform float uTime; uniform float uDpr;
      varying vec3 vColor;
      void main(){
        vec3 p=position;
        float r=length(p.xy);
        // Exaggerated differential orbital drift: conceptual, not elapsed time.
        float turn=uTime*(aBulge > .5 ? .07 : (.035 + .09 / (r + 1.)));
        float ct=cos(turn),st=sin(turn);
        p.xy=mat2(ct,-st,st,ct)*p.xy;
        vec4 eye=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*eye;
        gl_PointSize=clamp(aSize*uDpr*95./max(1.,-eye.z),1.1,11.);
        vColor=color;
      }`,
    fragmentShader: `varying vec3 vColor;
      void main(){
        float d=length(gl_PointCoord-.5)*2.;
        if(d>1.)discard;
        float core=exp(-d*d*19.);
        float halo=exp(-d*d*3.)*.38;
        gl_FragColor=vec4(vColor*(core+halo),min(.98,core+halo));
      }`
  });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  // Optional Milky Way address mode: the 3D positions/arm directions are
  // illustrative; only the fractional galactocentric radius is grounded.
  const SUN_SCENE_RADIUS = galacticRadialSceneCoordinate(26000);
  let sunBeacon = null, radialBeacon = null;
  const extraGeometry = [], extraMaterial = [];
  function beacon(color, size, z) {
    const geometry = new THREE.SphereGeometry(size, 14, 10);
    const material = new THREE.MeshBasicMaterial({color, depthTest:false});
    const dot = new THREE.Mesh(geometry, material);
    dot.renderOrder = 9; dot.position.z=z;
    extraGeometry.push(geometry);extraMaterial.push(material);
    scene.add(dot);return dot;
  }
  if(addressMode){
    sunBeacon=beacon(0x9dfff1,.135,.48);
    sunBeacon.position.set(SUN_SCENE_RADIUS,0,.48);
    radialBeacon=beacon(0xff956a,.11,.70);
    radialBeacon.position.set(0,0,.70);
    const guidePoints=[];
    for(let i=0;i<=60;i++){
      const a=i/60*Math.PI*2;
      guidePoints.push(new THREE.Vector3(Math.cos(a)*SUN_SCENE_RADIUS,Math.sin(a)*SUN_SCENE_RADIUS,.07));
    }
    const ringGeometry=new THREE.BufferGeometry().setFromPoints(guidePoints);
    const ringMaterial=new THREE.LineBasicMaterial({color:0x76ccc5,transparent:true,opacity:.33,depthWrite:false});
    extraGeometry.push(ringGeometry);extraMaterial.push(ringMaterial);
    scene.add(new THREE.Line(ringGeometry,ringMaterial));
  }
  let focusX = 0, focusY = 0, targetFocusX=0, targetFocusY=0;
  let angle = 25, azimuth = 0, distance = 16;
  let targetAngle = angle, targetAzimuth = azimuth, targetDistance = distance;
  let raf = null, last = 0, motion = false, disposed = false;
  const pointers = new Map();
  let lastPinch = 0, dragSpeedX = 0, dragSpeedY = 0;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  function draw() {
    if (canvas.hidden || disposed) return;
    const a = angle * Math.PI / 180;
    camera.position.set(focusX + distance * Math.sin(a) * Math.sin(azimuth), focusY + distance * Math.sin(a) * Math.cos(azimuth), distance * Math.cos(a));
    camera.lookAt(focusX,focusY,0);
    renderer.render(scene, camera);
  }
  function schedule() { if (raf === null && !disposed && !document.hidden) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = null;
    const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
    last = now;
    const k = reduced.matches ? 1 : 1 - Math.exp(-14 * dt);
    angle += (targetAngle - angle) * k;
    azimuth += (targetAzimuth - azimuth) * k;
    distance += (targetDistance - distance) * k;
    focusX += (targetFocusX - focusX) * k;
    focusY += (targetFocusY - focusY) * k;
    if (motion && !reduced.matches && !document.hidden) uniform.uTime.value += dt;
    draw();
    const moving = Math.abs(angle - targetAngle) > .015 || Math.abs(azimuth - targetAzimuth) > .001 || Math.abs(distance - targetDistance) > .015 || Math.abs(focusX-targetFocusX)>.008 || Math.abs(focusY-targetFocusY)>.008;
    if (moving || motion) schedule();
  }
  function setAngle(degrees) {
    targetAngle = clamp(Number(degrees) || 0, 0, 80);
    schedule();
  }
  function zoom(factor) { targetDistance = clamp(targetDistance * factor, addressMode?5:8.8, 27); schedule(); }
  function pointerDown(e) {
    if (canvas.hidden) return;
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if (pointers.size > 1) lastPinch = 0;
  }
  function pointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if (pointers.size === 2) {
      const [a,b] = [...pointers.values()];
      const span = Math.hypot(a.x-b.x, a.y-b.y);
      if (lastPinch > 4) zoom(clamp(lastPinch / Math.max(4, span), .85, 1.15));
      lastPinch = span;
    } else if (pointers.size === 1) {
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      dragSpeedX = dx; dragSpeedY = dy;
      targetAzimuth += dx * .009;
      targetAngle = clamp(targetAngle + dy * .24, 0, 80);
      onInclination(Math.round(targetAngle));
      schedule();
    }
  }
  function pointerUp(e) {
    pointers.delete(e.pointerId);
    lastPinch = 0;
    if (pointers.size === 0 && !reduced.matches && (Math.abs(dragSpeedX)+Math.abs(dragSpeedY))>2) {
      targetAzimuth += clamp(dragSpeedX, -18, 18) * .022;
      targetAngle = clamp(targetAngle + clamp(dragSpeedY, -18, 18) * .5, 0, 80);
      onInclination(Math.round(targetAngle));schedule();
    }
    dragSpeedX=dragSpeedY=0;
  }
  function onWheel(e) {
    if (canvas.hidden) return;
    e.preventDefault();
    zoom(Math.exp(clamp(e.deltaY, -80, 80)*.004));
  }
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('wheel', onWheel, {passive:false});
  const visibility = () => {if(document.hidden) { motion = false; last = 0; if(raf !== null) cancelAnimationFrame(raf); raf=null; }};
  document.addEventListener('visibilitychange', visibility);
  const motionChange = () => {if(reduced.matches) motion=false; schedule();};
  reduced.addEventListener?.('change', motionChange);
  function resize() {
    if (disposed) return;
    const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Preserve full disk in narrower portrait framing rather than clipping.
    camera.fov = width < height ? 56 : 46;
    camera.updateProjectionMatrix();
    if(!addressMode){
      targetDistance = Math.max(targetDistance, width < height ? 19 : 8.8);
      distance = Math.max(distance, width < height ? 19 : 8.8);
    } else if(width<height){
      targetDistance = Math.max(targetDistance, 8);
      distance=Math.max(distance,8);
    }
    draw();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  return {
    update:setAngle, resize, zoomBy:zoom,
    rotateBy(rad){targetAzimuth+=rad;schedule();},
    focusSun(){if(!addressMode)return;targetFocusX=SUN_SCENE_RADIUS;targetFocusY=0;targetDistance=9.5;targetAngle=37;schedule();},
    overview(){targetFocusX=targetFocusY=0;targetDistance=17;targetAngle=24;schedule();},
    setHypotheticalDistance(distanceLy){
      if(radialBeacon){
        const ly=clamp(Number(distanceLy)||0,0,50000);
        radialBeacon.position.x=galacticRadialSceneCoordinate(ly);
        draw();
      }
    },
    reset(){ targetAngle=25; targetAzimuth=0; targetDistance=16; onInclination(25); schedule(); },
    setMotion(v){motion=Boolean(v)&&!reduced.matches&&!document.hidden; if(motion)schedule();},
    suspend(){motion=false; if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;},
    dispose(){disposed=true;observer.disconnect();visibility();document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener?.('change', motionChange);
      canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);
      canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);
      canvas.removeEventListener('wheel',onWheel);geometry.dispose();material.dispose();
      extraGeometry.forEach(g=>g.dispose());extraMaterial.forEach(m=>m.dispose());renderer.dispose();}
  };
}
