import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=p=>readFileSync(p,'utf8');
const bh=source('pages/black-holes/content.html');
const galaxy=source('pages/galaxies/types/content.html');
const eclipse=source('pages/moon/eclipses/content.html');
const css=source('assets/css/style.css');
// First route: primary 3D affordance belongs with its *illustration*.
const near=(text,start,end,needle)=>{
 const a=text.indexOf(start),b=text.indexOf(end,a);
 assert.ok(a!==-1&&b>a, 'missing region '+start+' / '+end);
 assert.ok(text.slice(a,b).includes(needle),'CTA not in figure '+needle);
};
near(bh,'id="bhSceneShell"','<div class="bh-lab-controls"','id="bhActivate"');
assert.ok(bh.indexOf('id="bhActivate"')>bh.indexOf('class="bh-diagram"'),
  '2D and 3D views need visible nearby switch');
const figureEnd=bh.indexOf('class="bh-figure-toolbar"');
assert.ok(figureEnd>bh.indexOf('id="bhCanvas"'),
 'BH view switch should be a toolbar *after* the canvas, not an overlay');
assert.ok(css.includes('.bh-figure-toolbar{display:flex;'),
 'Toolbar must reserve space outside the canvas');

near(galaxy,'class="galaxy-view-layout"','class="galaxy-view-tools"','id="galaxy3DActivate"');
assert.ok(eclipse.indexOf('id="eclipsePlay"')<eclipse.indexOf('id="eclipseSideView"'),
 'Play should lead into visible synchronized side-on result, not follow it');
// Distinct disabled reasons for motion; manual controls remain operable.
const pages=[
 ['black-holes','bhAnimate'],['moon/eclipses','eclipsePlay'],
 ['exoplanets/transit-method','transitPlay'],['universe/light-year','lyPlay'],
 ['stars/life-cycle','lifePlay'],['astronomy/electromagnetic-spectrum','spectrumWaveToggle'],
 ['galaxies/types','galaxy3DPlay']
];
for(const [page,id] of pages){
 const html=source('pages/'+page+'/content.html');
 const built=source('public/'+page+'/index.html');
 assert.ok(html.includes('id="'+id+'"'),page+' lacks play control');
 assert.ok(html.includes('class="motion-preference-note"'),page+' missing disabled reason');
 assert.ok(built.includes('class="motion-preference-note"'),page+' built disabled reason absent');
}
// Click target sizes and browser access are checked by real Chromium separately.
for(const token of [
 '.ly-picker button{min-height:44px',
 '.tide-angle-presets button{min-height:44px',
 '.mass-toggle button{min-height:44px',
 '.galaxy-view-presets button{min-height:44px',
 '.season-controls button{min-height:44px',
 '.eclipse-node-presets button{min-height:44px',
 '.spectrum-band-picker button{min-height:44px',
 '#transitPlay{min-height:44px',
 '#orbitLaunch,#orbitReset{min-height:44px',
 '#btnSpring,#btnNeap,#spectrumWaveToggle{min-height:44px'
])assert.ok(css.includes(token),'missing touch target '+token);
assert.ok(css.includes('@media (prefers-reduced-motion: reduce) {.motion-preference-note{display:block}'));
for(const route of ['black-holes','moon/eclipses','exoplanets/transit-method','galaxies/types']){
 const html=source('public/'+route+'/index.html');
 assert.match(html,/rel="canonical"/);
 assert.match(html,/application\/ld\+json/);
}
const blackScript=source('assets/js/black-holes.js'),galaxyScript=source('assets/js/galaxy-types.js');
assert.ok(bh.includes('id="bhLoadStatus"'),'Black-hole 3D needs an explicit failure status');
assert.ok(galaxy.includes('id="galaxy3DStatus"'),'Galaxy 3D needs an explicit failure status');
assert.match(blackScript,/activate\.disabled=false;/,'BH must let the user explicitly retry after a transient WebGL error');
assert.match(galaxyScript,/galaxy3DActivate\.disabled=false;/,'Galaxy must let the user retry on a temporary 3D failure');
assert.ok(/id="bhActivate"[^>]*disabled/.test(bh),'No-JS Black Hole 3D trigger must be inert, not deceptive');
assert.ok(/id="galaxy3DActivate"[^>]*disabled/.test(galaxy),'No-JS Galaxy 3D trigger must be inert, not deceptive');
assert.match(bh,/<noscript>[\s\S]*3D requires JavaScript/);
assert.match(galaxy,/<noscript>[\s\S]*3D requires JavaScript/);
assert.match(blackScript,/activate\.disabled=false;/,'Black Hole trigger must enable after handlers register');
assert.match(galaxyScript,/galaxy3DActivate\.disabled=false;/,'Galaxy trigger must enable after handlers register');
assert.match(blackScript,/aria-busy/,'BH loading state should be accessible');
assert.match(galaxyScript,/aria-busy/,'Galaxy loading state should be accessible');
console.log('LEARNER_FLOW_UX_GATE_PASS discoverable 3D, visible motion evidence, disabled reasons, touch sizes, SEO');
