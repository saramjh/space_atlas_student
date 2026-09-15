// Newton's cannonball sandbox — plain 2D canvas physics, no Three.js needed
// for a single-plane gravity simulation.
import { initQuiz } from './quiz-widget.js';

const shell = document.querySelector('#orbitShell');
const canvas = document.querySelector('#orbitCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.querySelector('#orbitStatus');
const speedSlider = document.querySelector('#orbitSpeed');
const speedVal = document.querySelector('#orbitSpeedVal');

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
  const c = center();
  ball = { x: c.x + LAUNCH_RADIUS, y: c.y, vx: 0, vy: -speed };
  trail = [];
  statusEl.textContent = 'Falling…';
  if (raf) cancelAnimationFrame(raf);
  step();
}

function step() {
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

  if (trail.length > 80) statusEl.textContent = 'Orbiting!';

  render();
  raf = requestAnimationFrame(step);
}

function render() {
  drawStatic();
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
  }
}

document.querySelector('#orbitLaunch').onclick = () => launch(Number(speedSlider.value));
document.querySelector('#orbitReset').onclick = () => {
  if (raf) cancelAnimationFrame(raf);
  ball = null;
  trail = [];
  statusEl.textContent = 'Ready';
  drawStatic();
};
speedSlider.addEventListener('input', () => {
  speedVal.textContent = Number(speedSlider.value).toFixed(1);
});

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
