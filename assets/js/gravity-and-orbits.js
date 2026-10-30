import {traceLaunch} from './orbit-trio-math.js';
// Newton's cannonball sandbox — plain 2D canvas physics, no Three.js needed
// for a single-plane gravity simulation.
import { initQuiz } from './quiz-widget.js';
import {launchOrbitPrediction} from './gravity-reference.js';

const shell = document.querySelector('#orbitShell');
const canvas = document.querySelector('#orbitCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.querySelector('#orbitStatus');
const speedSlider = document.querySelector('#orbitSpeed');
const speedVal = document.querySelector('#orbitSpeedVal');
const showVectors=document.querySelector('#orbitVectorsToggle');
const predictionText=document.querySelector('#orbitPrediction');
function updatePrediction() {
  const p=launchOrbitPrediction(Number(speedSlider.value));
  const outcome={
    collision:'collision with the central body',
    'near-circular':'approximately circular reference orbit',
    'bound-ellipse':'bound elliptical trajectory',
    unbound:'unbound escape trajectory'
  }[p.classification];
  predictionText.textContent='At launch speed '+Number(speedSlider.value).toFixed(1)+
    ' model units/frame, the ideal Newtonian prediction is '+outcome+
    '. Circular reference ≈ '+p.circularSpeed.toFixed(1)+
    '; escape threshold ≈ '+p.escapeSpeed.toFixed(2)+
    ' model units/frame. Actual drawn paths are discrete approximations, not spacecraft navigation.';
}

function resize() {
  canvas.width = shell.clientWidth;
  canvas.height = shell.clientHeight;
}
new ResizeObserver(resize).observe(shell);
resize();

const PLANET_RADIUS = 18;
const LAUNCH_RADIUS = 130;
const CIRCULAR_SPEED = 2.6; // px/frame at LAUNCH_RADIUS for a ~circular orbit
const GM = CIRCULAR_SPEED * CIRCULAR_SPEED * LAUNCH_RADIUS;
const ESCAPE_RADIUS_FACTOR = 3.2;

let ball = null;
let trail = [];
let raf = null;
let modelSteps = 0;
const trioButton=document.querySelector('#orbitCompareThree');
const trioReadout=document.querySelector('#orbitTrioReadout');
let trioVisible=false;
const threeTraces=[{speed:1,color:'#e79f7c'},{speed:2.6,color:'#e6cb8d'},{speed:4.1,color:'#91d7db'}].map(o=>({...o,trace:traceLaunch(o.speed)}));
function showTrio(visible){
 trioVisible=Boolean(visible);
 if(raf!==null)cancelAnimationFrame(raf);raf=null;ball=null;trail=[];
 trioButton.setAttribute('aria-pressed',String(trioVisible));
 trioButton.textContent=trioVisible?'Return to single launch':'Compare three launch speeds';
 trioReadout.textContent=trioVisible?threeTraces.map(o=>`${o.speed.toFixed(1)}: ${o.trace.outcome==='bounded-preview'?'bounded computed trajectory':o.trace.outcome}`).join(' · ')+'. All paths share the same ideal central mass; these are numerical model outcomes, not observed trajectories.':'Select Compare three launch speeds to see three outcomes together. The original single-launch sandbox remains available.';
 statusEl.textContent=trioVisible?'Three-path comparison · computed':'Ready';
 render();
}
trioButton.addEventListener('click',()=>showTrio(!trioVisible));

const MAX_MODEL_STEPS = 900; // bounded educational demonstration, not indefinitely integrated orbit

function center() {
  return { x: canvas.width / 2, y: canvas.height / 2 };
}

function drawStatic() {
  const c = center();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(c.x, c.y, LAUNCH_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#f0a840';
  ctx.beginPath();
  ctx.arc(c.x, c.y, PLANET_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

function launch(speed) {
  if(trioVisible)showTrio(false);
  const c = center();
  ball = { x: c.x + LAUNCH_RADIUS, y: c.y, vx: 0, vy: -speed };
  trail = [];
  modelSteps = 0;
  statusEl.textContent = 'Path in progress (model)';
  if (raf) cancelAnimationFrame(raf);
  step();
}

function step() {
  if (document.hidden) return;
  if (modelSteps++ >= MAX_MODEL_STEPS) {
    raf = null;
    statusEl.textContent = 'Model path complete — Launch to replay';
    render();
    return;
  }
  const c = center();
  const dx = c.x - ball.x, dy = c.y - ball.y;
  const r = Math.sqrt(dx * dx + dy * dy);

  if (r < PLANET_RADIUS) {
    statusEl.textContent = 'Crashed — too slow';
    render();
    return;
  }
  if (r > LAUNCH_RADIUS * ESCAPE_RADIUS_FACTOR) {
    statusEl.textContent = 'Escaped — too fast';
    render();
    return;
  }

  const a = GM / (r * r);
  ball.vx += (a * dx) / r;
  ball.vy += (a * dy) / r;
  ball.x += ball.vx;
  ball.y += ball.vy;
  trail.push({ x: ball.x, y: ball.y });
  if (trail.length > 600) trail.shift();

  if (trail.length > 80) statusEl.textContent = 'Trajectory continuing (model)';

  render();
  raf = requestAnimationFrame(step);
}

function drawArrow(x,y,dx,dy,color,label) {
  const length=Math.hypot(dx,dy);
  if(length<.000001)return;
  const ux=dx/length,uy=dy/length;
  const lengthPx=34;
  const endX=x+ux*lengthPx,endY=y+uy*lengthPx;
  ctx.strokeStyle=color;
  ctx.fillStyle=color;
  ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(endX,endY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(endX,endY);
  ctx.lineTo(endX-ux*9-uy*5,endY-uy*9+ux*5);
  ctx.lineTo(endX-ux*9+uy*5,endY-uy*9-ux*5);
  ctx.closePath();ctx.fill();
}
function render() {
  drawStatic();
  if(trioVisible){
   const c=center();
   for(const o of threeTraces){
    ctx.strokeStyle=o.color;ctx.lineWidth=2.5;
    ctx.beginPath();
    o.trace.points.forEach(([x,y],i)=>i?ctx.lineTo(c.x+x,c.y+y):ctx.moveTo(c.x+x,c.y+y));
    ctx.stroke();
   }
   return;
  }

  ctx.strokeStyle = 'rgba(240,168,64,.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  trail.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();
  if (ball) {
    ctx.fillStyle = '#e9edf0';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
    ctx.fill();
    if(showVectors.checked) {
      const c=center();
      drawArrow(ball.x,ball.y,ball.vx,ball.vy,'#90d7ff','velocity');
      drawArrow(ball.x,ball.y,c.x-ball.x,c.y-ball.y,'#ffd178','gravity');
    }
  }
}

document.querySelector('#orbitLaunch').onclick = () => launch(Number(speedSlider.value));
document.querySelector('#orbitReset').onclick = () => {
  if(trioVisible){showTrio(false);return;}
  if (raf) cancelAnimationFrame(raf);
  ball = null;
  trail = [];
  statusEl.textContent = 'Ready';
  drawStatic();
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden && raf !== null) {
    cancelAnimationFrame(raf);
    raf = null;
    statusEl.textContent = 'Paused while away — Launch to replay';
  }
});
speedSlider.addEventListener('input', () => {
  speedVal.textContent = Number(speedSlider.value).toFixed(1);
  updatePrediction();
});
showVectors.addEventListener('change',render);
updatePrediction();

drawStatic();

initQuiz([
  {
    q: 'An orbit is best described as...',
    options: [
      { label: 'A place with no gravity' },
      { label: 'A continuous fall that keeps missing the ground', correct: true },
      { label: 'A balance between gravity turned completely off' },
      { label: 'A perfectly straight path' },
    ],
    right: "An orbiting object is constantly falling toward the central body — it's just moving sideways fast enough that the ground (or the Sun) curves away underneath it at the same rate it falls.",
    wrong: "Gravity is fully \"on\" during an orbit — an orbit is what a continuous fall looks like when you're also moving sideways fast enough to keep missing.",
  },
  {
    q: 'In the sandbox above, what happens if you launch too slowly?',
    options: [
      { label: 'It escapes to space' },
      { label: 'It crashes into the planet', correct: true },
      { label: 'It stops in mid-air' },
      { label: 'Nothing changes' },
    ],
    right: "Too slow, and gravity pulls the object in faster than it can move sideways — it spirals into the planet instead of missing it.",
    wrong: "Too slow means gravity wins — the object gets pulled in before it can move sideways fast enough to miss the planet.",
  },
], {});
