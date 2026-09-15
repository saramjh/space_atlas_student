// Transit method page — two plain 2D canvases (orbit view + light curve),
// no Three.js needed for a flat, single-plane diagram.
import { initQuiz } from './quiz-widget.js';

const TRANSIT_CENTER_DEG = 90; // where in the orbit the "front of star" crossing happens
const TRANSIT_HALF_WIDTH = 22; // degrees
const TRANSIT_DEPTH = 0.35; // exaggerated brightness dip, stated as simplified in the copy

function angleDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

function brightnessAt(deg) {
  const d = angleDiff(deg, TRANSIT_CENTER_DEG);
  if (d > TRANSIT_HALF_WIDTH) return 1;
  const t = d / TRANSIT_HALF_WIDTH; // 0 at center, 1 at edge
  const dip = TRANSIT_DEPTH * (1 - t * t); // smooth parabolic dip
  return 1 - dip;
}

const orbitShell = document.querySelector('#transitOrbitShell');
const orbitCanvas = document.querySelector('#transitOrbitCanvas');
const orbitCtx = orbitCanvas.getContext('2d');
const graphShell = document.querySelector('#transitGraphShell');
const graphCanvas = document.querySelector('#transitGraphCanvas');
const graphCtx = graphCanvas.getContext('2d');
const slider = document.querySelector('#transitAngle');

function resizeCanvases() {
  orbitCanvas.width = orbitShell.clientWidth;
  orbitCanvas.height = orbitShell.clientHeight;
  graphCanvas.width = graphShell.clientWidth;
  graphCanvas.height = graphShell.clientHeight;
  render();
}
new ResizeObserver(resizeCanvases).observe(orbitShell);

function drawOrbit(deg) {
  const w = orbitCanvas.width, h = orbitCanvas.height;
  const cx = w / 2, cy = h / 2;
  const orbitRx = w * 0.38, orbitRy = h * 0.14;
  orbitCtx.clearRect(0, 0, w, h);

  orbitCtx.strokeStyle = 'rgba(255,255,255,.18)';
  orbitCtx.setLineDash([3, 4]);
  orbitCtx.beginPath();
  orbitCtx.ellipse(cx, cy, orbitRx, orbitRy, 0, 0, Math.PI * 2);
  orbitCtx.stroke();
  orbitCtx.setLineDash([]);

  const starR = Math.min(h * 0.28, 30);
  const grad = orbitCtx.createRadialGradient(cx, cy, 0, cx, cy, starR);
  grad.addColorStop(0, '#fff6c8');
  grad.addColorStop(1, '#f0a840');
  orbitCtx.fillStyle = grad;
  orbitCtx.beginPath();
  orbitCtx.arc(cx, cy, starR, 0, Math.PI * 2);
  orbitCtx.fill();

  const rad = (deg * Math.PI) / 180;
  const px = cx + Math.cos(rad) * orbitRx;
  const py = cy + Math.sin(rad) * orbitRy;
  orbitCtx.fillStyle = '#101419';
  orbitCtx.strokeStyle = '#e9edf0';
  orbitCtx.lineWidth = 1;
  orbitCtx.beginPath();
  orbitCtx.arc(px, py, 6, 0, Math.PI * 2);
  orbitCtx.fill();
  orbitCtx.stroke();
}

function drawGraph(deg) {
  const w = graphCanvas.width, h = graphCanvas.height;
  graphCtx.clearRect(0, 0, w, h);
  const pad = 14;
  const plotH = h - pad * 2;
  const yFor = (b) => pad + (1 - b) * plotH * 3.2; // exaggerate vertical scale for legibility

  graphCtx.strokeStyle = 'rgba(255,255,255,.6)';
  graphCtx.lineWidth = 1.5;
  graphCtx.beginPath();
  for (let x = 0; x <= w; x++) {
    const a = (x / w) * 360;
    const y = yFor(brightnessAt(a));
    x === 0 ? graphCtx.moveTo(x, y) : graphCtx.lineTo(x, y);
  }
  graphCtx.stroke();

  const markerX = (deg / 360) * w;
  graphCtx.strokeStyle = 'rgba(240,168,64,.7)';
  graphCtx.beginPath();
  graphCtx.moveTo(markerX, 0);
  graphCtx.lineTo(markerX, h);
  graphCtx.stroke();

  const markerY = yFor(brightnessAt(deg));
  graphCtx.fillStyle = '#f0a840';
  graphCtx.beginPath();
  graphCtx.arc(markerX, markerY, 4, 0, Math.PI * 2);
  graphCtx.fill();
}

function render() {
  const deg = Number(slider.value);
  drawOrbit(deg);
  drawGraph(deg);
}

slider.addEventListener('input', render);
resizeCanvases();

initQuiz([
  {
    q: 'What does the transit method actually detect?',
    options: [
      { label: 'A direct photograph of the planet' },
      { label: "A tiny, repeating dip in the star's brightness", correct: true },
      { label: 'Radio signals from the planet' },
      { label: 'The planet\'s temperature directly' },
    ],
    right: "The transit method watches for a small, precisely repeating dip in a star's brightness, caused by a planet passing in front of it — no direct image of the planet is needed.",
    wrong: "It's a brightness dip, not an image — a planet passing in front of its star blocks a tiny, regularly repeating fraction of the star's light.",
  },
  {
    q: 'Why does a single brightness dip usually not count as a confirmed planet?',
    options: [
      { label: 'One dip is always a planet, no further check needed' },
      { label: 'A single dip could be noise or a different phenomenon — only a precisely repeating dip is convincing', correct: true },
      { label: 'Because stars only dim once in their lifetime' },
      { label: 'Brightness cannot be measured accurately at all' },
    ],
    right: "A one-off dip could be instrument noise, a starspot, or something else. Astronomers look for the same dip depth and duration repeating on a precise schedule, matching a stable orbit.",
    wrong: "A single dip isn't enough — it could be noise or something else. Astronomers need the same dip to repeat on a precise, predictable schedule before confirming a planet.",
  },
], {});
