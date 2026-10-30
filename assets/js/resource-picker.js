// An inclusive official-source chooser, not an opaque ranking or remote search.
// No fetched data and no automatic external navigation. The five static links
// and complete comparison table remain usable with JavaScript disabled.
const matcher=document.querySelector('#resourceMatcher');
if(matcher){
 const select=matcher.querySelector('#resourceGoal');
 const button=matcher.querySelector('#resourceMatch');
 const result=matcher.querySelector('#resourceMatchResult');
 const choices=[...document.querySelectorAll('details.resource-choice[data-resource-goal]')];
 const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)');
 button.disabled=false;
 button.addEventListener('click',()=>{
  const target=choices.find(choice=>choice.dataset.resourceGoal===select.value);
  if(!target){result.textContent='Choose one of the five available learning goals.';return;}
  choices.forEach(choice=>choice.classList.toggle('resource-choice-target',choice===target));
  target.open=true;
  const official=target.querySelector('p a');
  result.textContent=`Recommended official source: ${official?.textContent.trim().replace(/\s*↗$/, '')||'selected source'}. Its description and link are expanded below; open the link when ready.`;
  target.querySelector('summary')?.focus({preventScroll:true});
  target.scrollIntoView({behavior:prefersReduced.matches?'instant':'smooth',block:'nearest'});
 });
}
