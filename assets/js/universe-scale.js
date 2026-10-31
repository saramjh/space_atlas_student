import { initQuiz } from './quiz-widget.js';
import { initTeacherDistribution } from './teacher-distribution.js';
import { COSMIC_METRES, COSMIC_DOMAIN, logPosition, cosmicJump } from './scale-visual-math.js';

const STEPS = [
  { title: 'You', size: '~1.7 m tall', desc: 'Everything else on this ladder is measured relative to something you already understand: your own height.' },
  { title: 'Earth', size: '12,742 km diameter', desc: "Earth is about 7.5 million times your height. You'd need to line up 7.5 million people to span it.", factor: '≈ 7,500,000×' },
  { title: 'Earth–Moon distance', size: '384,400 km', desc: 'About 30 Earths could fit side by side in the gap between Earth and the Moon.', factor: '≈ 30×' },
  { title: 'The solar system', size: '~9 billion km across (to Neptune\'s orbit)', desc: "Neptune's orbit is roughly 23,000 times wider than the Earth-Moon distance.", factor: '≈ 23,000×' },
  { title: 'To the nearest star', size: '4.25 light-years (Proxima Centauri)', desc: 'Even the nearest star is about 4,500 times farther than the width of our entire solar system.', factor: '≈ 4,500×' },
  { title: 'The Milky Way galaxy', size: '~100,000 light-years across', desc: 'Our galaxy holds 100–400 billion stars — the gap to even the nearest one barely registers at this scale.', factor: '≈ 23,500×' },
  { title: 'The Local Group', size: '~10 million light-years across', desc: 'A cluster of dozens of galaxies, including the Milky Way and Andromeda, bound together by gravity.', factor: '≈ 100×' },
  { title: 'The observable universe', size: '~93 billion light-years across', desc: 'The part of the universe whose light has had time to reach us since the Big Bang. It may be far larger — possibly infinite.', factor: '≈ 9,300×' },
];

let index = 0;
const stage = document.querySelector('#zoomStageCopy');
const cinemaFrame = document.querySelector('#zoomCinemaFrame');
const cinemaCanvas = document.querySelector('#zoomCinemaCanvas');
const cinemaButton = document.querySelector('#zoomCinemaActivate');
const cinemaStatus = document.querySelector('#zoomCinemaStatus');
const cinemaTour=document.querySelector('#zoomCinemaTour');
const reduceTourMotion=matchMedia('(prefers-reduced-motion: reduce)');
let touring=false,tourFrame=null,tourStart=null,lastTourStep=0;
const TOUR_STEP_MS=2100;
function stopTour(){
 touring=false;if(tourFrame!==null)cancelAnimationFrame(tourFrame);
 tourFrame=null;tourStart=null;
 cinemaTour.setAttribute('aria-pressed','false');cinemaTour.textContent='Play the eight-scale journey';
 cinemaStatus.setAttribute('aria-live','polite');
}
function tourTick(now){
 tourFrame=null;if(!touring||document.hidden||cinemaFrame.hidden)return stopTour();
 if(tourStart===null)tourStart=now;
 const next=Math.min(7,Math.floor((now-tourStart)/TOUR_STEP_MS));
 if(next!==lastTourStep){lastTourStep=next;selectStep(next,true);}
 if(now-tourStart>=8*TOUR_STEP_MS)return stopTour();
 tourFrame=requestAnimationFrame(tourTick);
}
cinemaTour.addEventListener('click',()=>{
 if(touring)return stopTour();
 if(!cinema||reduceTourMotion.matches||document.hidden)return;
 stopTour();touring=true;lastTourStep=0;selectStep(0,true);
 cinemaTour.setAttribute('aria-pressed','true');cinemaTour.textContent='Pause scale journey';
 cinemaStatus.setAttribute('aria-live','off');tourFrame=requestAnimationFrame(tourTick);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTour();});
reduceTourMotion.addEventListener?.('change',()=>{if(reduceTourMotion.matches)stopTour();cinemaTour.disabled=reduceTourMotion.matches||!cinema||cinemaFrame.hidden;});
let cinema = null, cinemaLoading = false;
cinemaButton.disabled = false;
cinemaButton.addEventListener('click', async () => {
  if (cinemaLoading) return;
  if (cinema) {
    const visible = cinemaFrame.hidden;
    cinemaFrame.hidden = !visible;
    cinemaCredit.hidden = !visible;
    if (!visible){stopTour();cinema.suspend();cinemaTour.hidden=true;cinemaTour.disabled=true;} else{cinemaTour.hidden=false;cinemaTour.disabled=reduceTourMotion.matches;}
    cinemaButton.setAttribute('aria-pressed', String(visible));
    cinemaButton.textContent = visible ? 'Return to the scale diagram' : 'Enter the cinematic scale study';
    if (visible) { cinema.resize(); cinema.setStep(index); cinemaCanvas.focus({preventScroll:true}); }
    return;
  }
  cinemaLoading = true;
  cinemaButton.disabled = true;
  cinemaStatus.textContent = 'Loading local scene…';
  try {
    const {createCosmicCinema} = await import('./cosmic-cinema.js');
    cinemaFrame.hidden = false;
    cinemaCredit.hidden = false;
    cinema = createCosmicCinema(cinemaCanvas, i=>selectStep(i));
    cinemaTour.hidden=false;cinemaTour.disabled=reduceTourMotion.matches;
    cinema.setStep(index);
    cinemaButton.setAttribute('aria-pressed', 'true');
    cinemaButton.textContent = 'Return to the scale diagram';
    cinemaStatus.textContent = 'Scene is illustrative, not to physical scale; the ruler below contains the true numerical comparisons.';
    cinemaCanvas.focus({preventScroll:true});
  } catch (error) {
    cinemaFrame.hidden = true;cinemaCredit.hidden=true;stopTour();cinemaTour.hidden=true;cinemaTour.disabled=true;
    cinemaStatus.textContent = 'The visual journey could not load. The scale ruler and reference table still work.';
    console.warn('Cosmic cinema unavailable; preserving reference model.',error);
  } finally {cinemaButton.disabled = false; cinemaLoading = false;}
});
const dots = document.querySelector('#zoomDots');
const prevBtn = document.querySelector('#zoomPrev');
const nextBtn = document.querySelector('#zoomNext');
const ruler = document.querySelector('#cosmicRuler');
const chosenLine = document.querySelector('#cosmicRulerSelection');
const jumpPanel = document.querySelector('#cosmicJump');
const stopButtons = [...document.querySelectorAll('[data-cosmic-step]')];
const plotViewport = document.querySelector('.cosmic-ruler-viewport');
const cinemaSceneNumber=document.querySelector('#zoomCinemaSceneNumber');
const cinemaSceneType=document.querySelector('#zoomCinemaSceneType');
const cinemaSceneMeasure=document.querySelector('#zoomCinemaSceneMeasure');
const cinemaProgress=document.querySelector('#zoomCinemaProgress span');
const cinemaCredit=document.querySelector('#zoomCinemaCredit');
const cinemaCreditLabel=document.querySelector('#zoomCinemaCreditLabel');
const cinemaCreditLink=document.querySelector('#zoomCinemaCreditLink');
const REFERENCE_IMAGES=[
 ['NASA · Apollo 17 (Gene Cernan, human-scale reference; 1.7 m is not a measurement of this astronaut)','https://science.nasa.gov/resource/gene-cernan-on-the-moon/'],
 ['NASA · Apollo 17 Earth photograph (AS17-148-22727)','https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/a17_h_148_22727.html'],
 ['NASA · Apollo 17 Earth photo; distance graphics are illustrative','https://nssdc.gsfc.nasa.gov/imgcat/html/object_page/a17_h_148_22727.html'],
 ['NASA/JPL-Caltech · Voyager 2 Neptune observation','https://science.nasa.gov/asset/webb/neptune-voyager-2/'],
 ['ESA/Hubble & NASA · Proxima Centauri; CC BY 4.0, image cropped for layout','https://esahubble.org/images/potw1343a/'],
 ["NASA/JPL-Caltech · Artist's concept of the Milky Way; NOT an outside photograph",'https://www.jpl.nasa.gov/news/living-on-the-edge-stars-found-far-from-galaxy-center/'],
 ['ESA/Hubble & Digitized Sky Survey 2. Acknowledgment: Davide De Martin (ESA/Hubble). Image cropped for layout. CC BY 4.0','https://esahubble.org/images/heic1112f/'],
 ['NASA, ESA, G. Illingworth, D. Magee, and P. Oesch (University of California, Santa Cruz), R. Bouwens (Leiden University), and the HUDF09 Team · Hubble XDF; processed multiband image','https://science.nasa.gov/asset/hubble/hubble-extreme-deep-field-xdf/']
];

const SCENE_META=[
 ['HUMAN REFERENCE','HEIGHT · APPROX. 1.7 m'],
 ['EARTH','DIAMETER · 12,742 km'],
 ['EARTH–MOON','SEPARATION · 384,400 km'],
 ['SOLAR SYSTEM','ORBITAL SPAN · ABOUT 60 AU'],
 ['NEAREST STAR','SEPARATION · 4.25 light-years'],
 ['MILKY WAY','DISK DIAMETER · ABOUT 100,000 ly'],
 ['LOCAL GROUP','GROUP EXTENT · ABOUT 10 million ly'],
 ['OBSERVABLE UNIVERSE','OBSERVABLE DIAMETER · ABOUT 93 billion ly']
];


function jumpRepresentation(step) {
  if (step === 0) return '<strong>Starting scale: one human height</strong><p>1.7 metres is the reference. Select Earth to see how many tenfold increases fit in the next step.</p>';
  const ratio = cosmicJump(step);
  const decades = Math.floor(Math.log10(ratio));
  const remaining = ratio / Math.pow(10, decades);
  const blocks = Array.from({length:decades}, () => '<span class="cosmic-tenfold">×10</span>').join('');
  const tail = remaining > 1.005 ? `<span class="cosmic-tenfold cosmic-tenfold-tail">×${remaining.toFixed(2)}</span>` : '';
  return `<strong>Previous → current: approximately ${Math.round(ratio).toLocaleString('en-US')}× larger in the compared length measures</strong><div class="cosmic-decades" aria-hidden="true">${blocks}${tail}</div><p>Every ×10 block means one order of magnitude. This is a comparison of the listed approximate sizes or separations, not objects nested to scale.</p>`;
}
function selectStep(i,fromTour=false) {
  if (!Number.isInteger(i) || i < 0 || i >= STEPS.length) return;
  if(!fromTour)stopTour();
  index = i;
  render();
  if (cinema && !cinemaFrame.hidden) cinema.setStep(i);
  const button = stopButtons[i];
  if (button) {
    // Scroll only the diagram's horizontal strip, not the whole document.
    const desired = button.offsetLeft - plotViewport.clientWidth / 2;
    plotViewport.scrollLeft = Math.max(0, desired);
  }
}
stopButtons.forEach((button) => button.addEventListener('click', () => selectStep(Number(button.dataset.cosmicStep))));

// Reuse server-rendered dots (and their first active state) to keep a
// meaningful no-JS fallback. Create them only for older markup.
if (dots.children.length !== STEPS.length) {
  dots.replaceChildren();
  STEPS.forEach(() => dots.appendChild(document.createElement('span')));
}

function render() {
  const s = STEPS[index];
  cinemaSceneNumber.textContent=String(index+1).padStart(2,'0')+' / 08';
  cinemaSceneType.textContent=SCENE_META[index][0];
  cinemaSceneMeasure.textContent=SCENE_META[index][1];
  cinemaProgress.style.setProperty('--chapter',String(index));
  cinemaCreditLabel.textContent=REFERENCE_IMAGES[index][0];
  cinemaCreditLink.href=REFERENCE_IMAGES[index][1];
  stage.innerHTML = `
    <div class="zoom-step-no">Step ${index + 1} of ${STEPS.length}</div>
    <div class="zoom-title">${s.title}</div>
    <div class="zoom-size">${s.size}</div>
    <p class="zoom-desc">${s.desc}</p>
    ${s.factor ? `<div class="zoom-factor">${s.factor} bigger than the last step</div>` : ''}
  `;
  [...dots.children].forEach((d, i) => d.classList.toggle('active', i === index));
  const metres = COSMIC_METRES[index];
  const x = (36 + 828 * logPosition(metres, COSMIC_DOMAIN.min, COSMIC_DOMAIN.max)).toFixed(2);
  chosenLine.setAttribute('x1', x);
  chosenLine.setAttribute('x2', x);
  ruler.setAttribute('aria-label', `Logarithmic metre ruler: selected step ${index + 1}, ${s.title}, ${s.size}. Marks are positioned by approximate physical size or separation.`);
  stopButtons.forEach((button, i) => {
    button.classList.toggle('selected', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  jumpPanel.innerHTML = jumpRepresentation(index);
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === STEPS.length - 1;
}

prevBtn.onclick = () => selectStep(index - 1);
nextBtn.onclick = () => selectStep(index + 1);
render();
stopButtons.forEach((button) => { button.disabled = false; });
document.querySelector('#zoomInitNote').hidden = true;

initQuiz([
  {
    q: 'The "observable universe" is 93 billion light-years across. Does that mean the whole universe stops there?',
    options: [
      { label: 'Yes, that is the edge of everything' },
      { label: 'No — it is just how far light has had time to reach us so far', correct: true },
      { label: 'No, the universe is shrinking' },
      { label: 'Yes, space itself ends at that boundary' },
    ],
    right: "The observable universe is limited by how far light has had time to travel since the Big Bang, not by the universe's actual size. The full universe could be much larger, or infinite.",
    wrong: "It's a light-travel-time limit, not a physical edge — light from farther away simply hasn't reached us yet. The universe itself could be far bigger.",
  },
  {
    q: 'Roughly how many times bigger is the jump from "the solar system" to "the nearest star" than the jump from "Earth" to "the Moon\'s distance"?',
    options: [
      { label: 'About the same size jump' },
      { label: 'Hundreds of times bigger', correct: true },
      { label: 'Thousands of times bigger' },
      { label: 'It is a smaller jump' },
    ],
    right: 'The solar system to Proxima jump is about 4,500×; Earth diameter to Moon distance is about 30×. Their jump factors differ by about 150×, or hundreds of times.',
    wrong: 'Compare the two multipliers, not the two physical lengths: 4,500 ÷ 30 ≈ 150. Some steps on the ladder are just ~30× or ~100×, not thousands.',
  },
], {});
initTeacherDistribution('universe_scale');
