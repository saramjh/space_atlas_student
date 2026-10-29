const btnSize = document.querySelector('#btnModeSize');
const btnDistance = document.querySelector('#btnModeDistance');
const sizePanel = document.querySelector('#sizePanel');
const distPanel = document.querySelector('#distPanel');

function setMode(mode) {
  const isSize = mode === 'size';
  btnSize.classList.toggle('active', isSize);
  btnSize.setAttribute('aria-pressed', String(isSize));
  btnDistance.classList.toggle('active', !isSize);
  btnDistance.setAttribute('aria-pressed', String(!isSize));
  sizePanel.classList.toggle('active', isSize);
  distPanel.classList.toggle('active', !isSize);
}

btnSize.onclick = () => setMode('size');
btnDistance.onclick = () => setMode('distance');


// Static size-accurate and log-distance diagrams are intentionally independent.
// The cinematic AU zoom is progressive and never required to read the lesson.
const trueScaleExperience=document.querySelector('#trueScaleFlight');
if(trueScaleExperience?.dataset?.trueScaleFlight==='enabled'){
  import('./not-to-scale-flight.js').catch(error=>{
    console.warn('True-scale zoom lens unavailable; original comparison remains readable',error);
    const status=trueScaleExperience.querySelector('#trueScaleReadout');
    if(status)status.textContent='Interactive zoom unavailable; the two evidence diagrams below remain usable.';
  });
}
