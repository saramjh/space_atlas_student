// Procedural planet surface textures, painted onto canvases in equirectangular
// projection (the same layout THREE.SphereGeometry's default UV mapping
// expects — horizontal bands stay horizontal bands at any camera angle,
// unlike a flat radial gradient, which distorts badly at the poles).
import * as THREE from 'three';

function makeCanvas(w = 512, h = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d') };
}

function toTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// Simple deterministic PRNG so a planet's texture looks the same on every
// page load instead of reshuffling on each render.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blob(ctx, x, y, r, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * (0.55 + Math.random() * 0.3), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Scattered soft craters/mottling over a base color — Mercury, Mars. */
function crateredTexture(base, spots, seed, { poles = false } = {}) {
  const { canvas, ctx } = makeCanvas();
  const rand = mulberry32(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 70; i++) {
    const x = rand() * canvas.width;
    const y = rand() * canvas.height;
    const r = 4 + rand() * 22;
    const c = spots[Math.floor(rand() * spots.length)];
    ctx.globalAlpha = 0.18 + rand() * 0.22;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (poles) {
    const capGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    capGrad.addColorStop(0, 'rgba(255,255,255,0.85)');
    capGrad.addColorStop(0.08, 'rgba(255,255,255,0)');
    capGrad.addColorStop(0.92, 'rgba(255,255,255,0)');
    capGrad.addColorStop(1, 'rgba(255,255,255,0.85)');
    ctx.fillStyle = capGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  return toTexture(canvas);
}

/** Horizontal cloud bands (with slight wave distortion) — gas/ice giants. */
function bandedTexture(colors, seed, { spot = null, waviness = 6 } = {}) {
  const { canvas, ctx } = makeCanvas();
  const rand = mulberry32(seed);
  const bandH = canvas.height / colors.length;
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * bandH, canvas.width, bandH + 1);
  });
  // Soften hard band edges with a few wavy overlays.
  for (let i = 0; i < colors.length * 2; i++) {
    const y = rand() * canvas.height;
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 16) {
      ctx.lineTo(x, y + Math.sin((x / canvas.width) * Math.PI * 4 + i) * waviness);
    }
    ctx.lineTo(canvas.width, y + 14);
    ctx.lineTo(0, y + 14);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (spot) {
    ctx.fillStyle = spot.color;
    ctx.beginPath();
    ctx.ellipse(spot.x * canvas.width, spot.y * canvas.height, spot.rx, spot.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(canvas);
}

/** Soft swirled cloud cover, no landmasses — Venus. */
function swirlTexture(base, seed) {
  const { canvas, ctx } = makeCanvas();
  const rand = mulberry32(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 40; i++) {
    const y = rand() * canvas.height;
    const x0 = rand() * canvas.width;
    ctx.globalAlpha = 0.1 + rand() * 0.12;
    ctx.strokeStyle = rand() > 0.5 ? '#f2dfae' : '#a9783f';
    ctx.lineWidth = 6 + rand() * 14;
    ctx.beginPath();
    ctx.moveTo(x0 - canvas.width, y);
    for (let x = -canvas.width; x <= canvas.width * 2; x += 20) {
      ctx.lineTo(x, y + Math.sin(x / 70 + i) * 10);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return toTexture(canvas);
}

/** Ocean base + continents + cloud wisps + polar ice — Earth. */
function earthTexture(seed) {
  const { canvas, ctx } = makeCanvas();
  const rand = mulberry32(seed);
  ctx.fillStyle = '#2f6a8c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const land = ['#4c7a44', '#6b8f4e', '#8a7a4d'];
  for (let i = 0; i < 9; i++) {
    const cx = rand() * canvas.width;
    const cy = canvas.height * 0.2 + rand() * canvas.height * 0.6;
    for (let j = 0; j < 5; j++) {
      blob(ctx, cx + (rand() - 0.5) * 60, cy + (rand() - 0.5) * 40, 14 + rand() * 20, land[Math.floor(rand() * land.length)], 0.85);
    }
  }
  for (let i = 0; i < 18; i++) {
    blob(ctx, rand() * canvas.width, rand() * canvas.height, 10 + rand() * 26, '#ffffff', 0.14 + rand() * 0.12);
  }
  const capGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  capGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
  capGrad.addColorStop(0.1, 'rgba(255,255,255,0)');
  capGrad.addColorStop(0.9, 'rgba(255,255,255,0)');
  capGrad.addColorStop(1, 'rgba(255,255,255,0.9)');
  ctx.fillStyle = capGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return toTexture(canvas);
}

const BUILDERS = {
  Mercury: () => crateredTexture('#9a958d', ['#6f6a62', '#b3ada3'], 1),
  Venus: () => swirlTexture('#c8a476', 2),
  Earth: () => earthTexture(3),
  Mars: () => crateredTexture('#b35b3f', ['#7d3b28', '#c97c58'], 4, { poles: true }),
  Jupiter: () => bandedTexture(
    ['#e3c9a0', '#c9a06f', '#e6d0a8', '#b98060', '#dcbf95', '#c9a06f', '#e3c9a0'],
    5,
    { spot: { x: 0.62, y: 0.58, rx: 34, ry: 16, color: '#b5573a' }, waviness: 8 }
  ),
  Saturn: () => bandedTexture(['#ecdfc0', '#d8c397', '#e8d9b0', '#cbb384', '#e8d9b0'], 6, { waviness: 4 }),
  Uranus: () => bandedTexture(['#8fcdd1', '#74b8bd', '#82c4c9', '#74b8bd'], 7, { waviness: 2 }),
  Neptune: () => bandedTexture(
    ['#5a86c9', '#4b72b9', '#3f66ad', '#4b72b9'],
    8,
    { spot: { x: 0.32, y: 0.42, rx: 16, ry: 12, color: '#2c4a86' }, waviness: 5 }
  ),
};

const cache = new Map();

/** Returns (and memoizes) a THREE.CanvasTexture for the given planet name. */
export function getPlanetTexture(name) {
  if (cache.has(name)) return cache.get(name);
  const build = BUILDERS[name];
  const tex = build ? build() : null;
  cache.set(name, tex);
  return tex;
}
