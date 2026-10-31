import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';

// Every route is built and classified. This test protects the actual
// action/control IDs and injection; the viewport measurements are archived
// separately as browser evidence, not substituted by static assertions.
function dirs(root){
 return readdirSync(root,{withFileTypes:true}).flatMap(d=>{
  const path=join(root,d.name);
  return d.isDirectory()?dirs(path):d.name==='meta.json'?[path]:[];
 });
}
const metas=dirs('pages').map(x=>JSON.parse(readFileSync(x,'utf8')));
assert.equal(metas.length,31);
const plans={
 '/black-holes/':['bhCanvas','bhAnimate','bhFlowSpeed'],
 '/earth/seasons/':['seasonCanvas','tiltReal'],
 '/exoplanets/transit-method/':['transitScene','transitPlay','transitAngle'],
 '/galaxies/milky-way/':['mwSpatialCanvas','mw3DZoomIn'],
 '/galaxies/types/':['galaxy3DCanvas','galaxy3DPlay'],
 '/learn/not-to-scale/':['trueScaleCanvas','trueScalePlay'],
 '/moon/earth-moon-scale/':['emFlightCanvas','emFlightPlay'],
 '/moon/eclipses/':['eclipseCanvas','eclipsePlay'],
 '/moon/phases/':['moonCanvas','moonAngle'],
 '/moon/tidal-locking/':['lockCanvas','lockAngle'],
 '/moon/tides/':['tideCinemaCanvas','tideCinemaPlay'],
 '/solar-system/astronomical-unit/':['auExpeditionCanvas','auExpeditionPlay'],
 '/solar-system/gravity-and-orbits/':['orbitCanvas','orbitSpeed'],
 '/solar-system/gravity-comparison/':['gravity3DCanvas','gravityProbePlay'],
 '/solar-system/orbital-periods/':['keplerOrbitCanvas','keplerOrbitPlay'],
 '/solar-system/pluto-dwarf-planet/':['plutoResonanceSVG','plutoResonancePlay'],
 '/solar-system/temperature-comparison/':['tempChart','tempCompareA'],
 '/stars/life-cycle/':['stellarCinemaCanvas','lifePlay'],
 '/universe/light-year/':['lyCinemaCanvas','lyPlay'],
 '/universe/scale/':['zoomCinemaCanvas','zoomCinemaTour']
};
const dock=readFileSync('assets/js/mobile-feedback-dock.js','utf8');
const css=readFileSync('assets/css/style.css','utf8');
assert.equal(Object.keys(plans).length,20);
for(const [route,ids] of Object.entries(plans)){
 const page=metas.find(x=>x.path===route);
 assert.ok(page,'Unknown lesson route '+route);
 const path='public'+route+'index.html';
 assert.ok(existsSync(path),'Generated page missing '+path);
 const html=readFileSync(path,'utf8');
 assert.ok(html.includes('mobile-feedback-dock.js'),route+' lacks scoped helper');
 assert.ok(dock.includes("'"+route+"'"),'Missing dock configuration '+route);
 for(const id of ids){
  assert.ok(html.includes('id="'+id+'"'),'Missing real UI control/scene '+route+' '+id);
  if(id!==ids[0])assert.ok(dock.includes("'"+id+"'"),'Missing dock control wiring '+id);
 }
}
for(const meta of metas){
 const html=readFileSync('public'+meta.path+'index.html','utf8');
 assert.equal(html.includes('mobile-feedback-dock.js'),Object.hasOwn(plans,meta.path),
  'Unexpected dock script injection for '+meta.path);
}
assert.match(dock,/insertBefore\(placeholder,item\)/);
assert.match(dock,/replaceChild\(item,placeholder\)/);
assert.match(dock,/element\.closest\('label'\)/);
assert.match(dock,/breakpoint\.addEventListener\('change',schedule\)/);
assert.match(dock,/revealActivatedScene\(\)/);
assert.match(dock,/prefers-reduced-motion: reduce/);
assert.match(css,/\.atlas-feedback-dock:not\(\[hidden\]\)/);
assert.match(css,/@media\(max-width:620px\)/);
const lab=readFileSync('pages/solar-system/gravity-lab/content.html','utf8');
assert.ok(lab.indexOf('id="gravityLabSelector"')<lab.indexOf('id="gravityLabModeFlight"'));
assert.ok(lab.indexOf('id="gravityLabModeFlight"')<lab.indexOf('id="gravityLabView"'));
assert.ok(lab.indexOf('id="gravityLabView"')<lab.indexOf('id="gravityLabFlightInfo"'));
console.log('MOBILE_ACTION_FEEDBACK_31_ROUTES_20_DOCKS_PASS');
