import { initQuiz } from './quiz-widget.js';

const ruleExplorer = document.querySelector('#planetRuleExplorer');
if (ruleExplorer) {
  // One scientific classification source of truth for all linked visual states.
  const facts = {
    Earth: { planet: true, explanation: "Earth dominates the region around its orbit, despite sharing it with some smaller bodies.", zone: "Earth gravitationally dominates its orbital zone, although small objects can remain. The diagram is not a census of near-Earth asteroids." },
    Neptune: { planet: true, explanation: "Neptune gravitationally dominates its orbital zone even though smaller objects can orbit nearby or be in resonances with it.", zone: "Neptune dominates its orbital zone, while some smaller bodies remain in stable orbital relationships, including resonances." },
    Pluto: { planet: false, explanation: "Pluto shares its orbital region with many other Kuiper Belt objects and does not dominate that population.", zone: "Pluto belongs to the Kuiper Belt population and is not gravitationally dominant throughout its orbital neighborhood." },
    Ceres: { planet: false, explanation: "Ceres occupies the asteroid belt and has not gravitationally dominated its surrounding region.", zone: "Ceres is one of many bodies in the asteroid belt; it has not become the gravitationally dominant body of its orbital region." },
    Eris: { planet: false, explanation: "Eris is a round trans-Neptunian object that has not gravitationally dominated its orbital neighborhood.", zone: "Eris is one member of the distant trans-Neptunian population and has not cleared its orbital neighborhood." },
  };
  const buttons = [...ruleExplorer.querySelectorAll('[data-planet-rule]')];
  const third = ruleExplorer.querySelector('#ruleClearedStep');
  const mark = ruleExplorer.querySelector('#ruleClearedMark');
  const explanation = ruleExplorer.querySelector('#ruleClearedExplanation');
  const outcome = ruleExplorer.querySelector('#ruleClassification');
  const neighborHeading = ruleExplorer.querySelector('#ruleNeighborHeading');
  const neighborTitle = ruleExplorer.querySelector('#ruleNeighborTitle');
  const neighborDesc = ruleExplorer.querySelector('#ruleNeighborDesc');
  const neighborhoodDiagram = ruleExplorer.querySelector('#ruleNeighborhoodDiagram');
  const dominantPattern = ruleExplorer.querySelector('#ruleModelDominant');
  const sharedPattern = ruleExplorer.querySelector('#ruleModelShared');
  const regionContext = ruleExplorer.querySelector('#ruleRegionContext');
  function selectRule(name) {
    const fact = facts[name];
    if (!fact) return;
    buttons.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.planetRule === name)));
    third.classList.toggle('passes', fact.planet);
    third.classList.toggle('fails', !fact.planet);
    mark.textContent = fact.planet ? '✓' : '✗';
    explanation.textContent = fact.explanation;
    neighborHeading.textContent = name + (fact.planet ? ' · dominant planet' : ' · shares its orbital region');
    neighborTitle.textContent = name + (fact.planet ? ' gravitationally dominates its orbital neighborhood' : ' does not gravitationally dominate its orbital neighborhood');
    neighborDesc.textContent = 'Schematic comparison with Earth. ' + fact.zone +
      ' Marker sizes, positions and counts are illustrative, not measured or drawn to scale.';
    dominantPattern.setAttribute('display', fact.planet ? 'inline' : 'none');
    sharedPattern.setAttribute('display', fact.planet ? 'none' : 'inline');
    regionContext.textContent = fact.zone;
    outcome.textContent = `${name}: ${fact.planet ? 'planet' : 'dwarf planet'}. ${fact.planet ? 'All three IAU criteria are met.' : 'The first two criteria are met; the orbital-neighborhood criterion is not.'}`;
  }
  buttons.forEach(button => button.addEventListener('click', () => selectRule(button.dataset.planetRule)));
  selectRule('Pluto');
  buttons.forEach(button => { button.disabled = false; });
  ruleExplorer.querySelector('#ruleInitNote').hidden = true;
}

const resonanceLab=document.querySelector('#plutoResonanceLab');
if(resonanceLab){
 const slider=resonanceLab.querySelector('#plutoResonanceTime');
 const play=resonanceLab.querySelector('#plutoResonancePlay');
 const reset=resonanceLab.querySelector('#plutoResonanceReset');
 const out=resonanceLab.querySelector('#plutoResonanceReadout');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const dotN=resonanceLab.querySelector('#plutoNeptuneDot'),dotP=resonanceLab.querySelector('#plutoPlutoDot');
 let playing=false,frame=null,start=null,startFraction=0;
 function stop(){playing=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;start=null;play.setAttribute('aria-pressed','false');play.textContent='Observe the 3:2 cycle (9 s)';out.setAttribute('aria-live','polite');}
 function render(){
  const t=Number(slider.value)/100;
  const thetaN=2*Math.PI*3*t;
  const thetaP=(150*Math.PI/180)+2*Math.PI*2*t;
  dotN.setAttribute('cx',(320+98*Math.cos(thetaN)).toFixed(1));dotN.setAttribute('cy',(180+98*Math.sin(thetaN)).toFixed(1));
  dotP.setAttribute('cx',(320+166*Math.cos(thetaP)).toFixed(1));dotP.setAttribute('cy',(180+125*Math.sin(thetaP)).toFixed(1));
  resonanceLab.querySelector('#plutoNeptuneCaption').textContent=`Neptune: ${(3*t).toFixed(2)} laps`;
  resonanceLab.querySelector('#plutoPlutoCaption').textContent=`Pluto: ${(2*t).toFixed(2)} laps`;
  resonanceLab.querySelector('#plutoResonanceTimeOutput').textContent=`${Math.round(100*t)}%`;
  out.textContent=`${Math.round(100*t)}% of mean-period teaching cycle: Neptune ${(3*t).toFixed(2)} / 3 laps; Pluto ${(2*t).toFixed(2)} / 2 laps. Two Pluto periods ≈ 496 yr; three Neptune periods ≈ 495 yr. Model drawing and starting phases are invented for clarity, not measured orbital positions.`;
 }
 function tick(now){frame=null;if(!playing||document.hidden||reducedMotion.matches)return stop();if(start===null)start=now;const t=Math.min(1,startFraction+(now-start)/9000);slider.value=String(Math.round(t*100));render();if(t>=1)stop();else frame=requestAnimationFrame(tick);}
 slider.addEventListener('input',()=>{stop();render();});
 reset.addEventListener('click',()=>{stop();slider.value='0';render();});
 play.addEventListener('click',()=>{if(playing)return stop();if(reducedMotion.matches||document.hidden)return;stop();if(Number(slider.value)>=100)slider.value='0';startFraction=Number(slider.value)/100;playing=true;play.setAttribute('aria-pressed','true');play.textContent='Pause cycle';out.setAttribute('aria-live','off');frame=requestAnimationFrame(tick);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 reducedMotion.addEventListener?.('change',()=>{if(reducedMotion.matches)stop();play.disabled=reducedMotion.matches;});play.disabled=reducedMotion.matches;
 render();
}

initQuiz([
  {
    q: 'What is the one criterion Pluto fails for the official IAU definition of "planet"?',
    options: [
      { label: 'It does not orbit the Sun' },
      { label: 'It is not round' },
      { label: 'It has not become gravitationally dominant in its orbital neighborhood', correct: true },
      { label: 'It is too far from the Sun' },
    ],
    right: "Pluto orbits the Sun and is round — it fails only the third criterion. It shares the broad Kuiper Belt region with other bodies of varying sizes; it does not gravitationally dominate that population.",
    wrong: "Pluto passes two of the three tests (orbits the Sun, is round). It fails only \"cleared its neighborhood\" — it shares the Kuiper Belt with many other bodies.",
  },
  {
    q: 'Did Pluto get smaller or move somewhere new in 2006?',
    options: [
      { label: 'Yes, it shrank significantly' },
      { label: 'Yes, it moved farther from the Sun' },
      { label: 'No — the definition of "planet" changed, not Pluto', correct: true },
      { label: 'Yes, both' },
    ],
    right: "Pluto itself didn't change at all. In 2006 the International Astronomical Union adopted a formal three-part definition of \"planet\" for the first time, and Pluto didn't meet all three parts.",
    wrong: "Pluto stayed exactly the same — its size, shape, and orbit are unchanged. What changed was that astronomers formally defined \"planet\" for the first time in 2006, and Pluto didn't meet every part of it.",
  },
], {});
