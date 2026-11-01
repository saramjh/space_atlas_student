import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
function metaFiles(dir){
 return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const path=join(dir,e.name);
  return e.isDirectory()?metaFiles(path):e.name==='meta.json'?[path]:[];
 });
}
const metas=metaFiles('pages').map(x=>JSON.parse(readFileSync(x,'utf8')));
const cases=[
  {
    "route": "/",
    "action": "btnMotion",
    "result": "#btnMotion"
  },
  {
    "route": "/astronomy/electromagnetic-spectrum/",
    "action": "spectrumWaveToggle",
    "result": "#spectrumWaveToggle"
  },
  {
    "route": "/black-holes/",
    "action": "bhAnimate",
    "result": "#bhAnimate"
  },
  {
    "route": "/earth/seasons/",
    "action": "seasonAngle",
    "result": "#seasonExperiment"
  },
  {
    "route": "/exoplanets/transit-method/",
    "action": "transitAngle",
    "result": "#transitReadout"
  },
  {
    "route": "/galaxies/milky-way/",
    "action": "mw3DFocusSun",
    "result": "#mw3DReadout"
  },
  {
    "route": "/galaxies/types/",
    "action": "galaxyInclination",
    "result": "#galaxyAngleOutput"
  },
  {
    "route": "/learn/not-to-scale/",
    "action": "trueScaleZoom",
    "result": "#trueScaleReadout"
  },
  {
    "route": "/moon/earth-moon-scale/",
    "action": "emFlightSlider",
    "result": "#emFlightPercent"
  },
  {
    "route": "/moon/eclipses/",
    "action": "eclipseNode",
    "result": "#eclipseReadout"
  },
  {
    "route": "/moon/phases/",
    "action": "moonAngle",
    "result": "#phaseMetrics"
  },
  {
    "route": "/moon/tidal-locking/",
    "action": "lockAngle",
    "result": "#lockAngle"
  },
  {
    "route": "/moon/tides/",
    "action": "tideCinemaAngle",
    "result": "#tideModelReadout"
  },
  {
    "route": "/solar-system/2026-ed138-dwarf-planet-candidate/",
    "action": "ed138Albedo",
    "result": "#ed138Diameter"
  },
  {
    "route": "/solar-system/astronomical-unit/",
    "action": "auExpeditionProgress",
    "result": "#auExpeditionPosition"
  },
  {
    "route": "/solar-system/distance-scale/",
    "action": "distanceFocusPlanet",
    "result": "#distanceFocusReadout"
  },
  {
    "route": "/solar-system/gravity-and-orbits/",
    "action": "orbitCompareThree",
    "result": "#orbitTrioReadout"
  },
  {
    "route": "/solar-system/gravity-comparison/",
    "action": "gravityMass",
    "result": "#gravityModelResult"
  },
  {
    "route": "/solar-system/gravity-lab/",
    "action": "gravityLabModeFlight",
    "result": "#gravityLabModeFlight"
  },
  {
    "route": "/solar-system/orbital-periods/",
    "action": "keplerOrbitTime",
    "result": "#keplerOrbitTimeValue"
  },
  {
    "route": "/solar-system/planet-size-comparison/",
    "action": "diameterLensProgress",
    "result": "#diameterLensPosition"
  },
  {
    "route": "/solar-system/planet-types/",
    "action": "ptype3DStart",
    "result": "#ptype3DStatus"
  },
  {
    "route": "/solar-system/pluto-dwarf-planet/",
    "action": "plutoResonanceTime",
    "result": "#plutoResonanceReadout"
  },
  {
    "route": "/solar-system/temperature-comparison/",
    "action": "tempCompareB",
    "result": "#tempCompareReadout"
  },
  {
    "route": "/sources/space-resources-for-students/",
    "action": "resourceGoal",
    "result": "#resourceMatchResult"
  },
  {
    "route": "/stars/life-cycle/",
    "action": "lifeNext",
    "result": "#stellarCinemaProcess"
  },
  {
    "route": "/universe/light-year/",
    "action": "lyPhotonSlider",
    "result": "#lyPhotonElapsed"
  },
  {
    "route": "/universe/scale/",
    "action": "zoomNext",
    "result": "#cosmicJump"
  }
];
assert.equal(metas.length,31);
assert.equal(cases.length,28);
assert.equal(new Set(cases.map(x=>x.route)).size,28);
for(const flow of cases){
 assert.ok(metas.some(x=>x.path===flow.route),'missing lesson '+flow.route);
 const html=readFileSync('public'+flow.route+'index.html','utf8');
 assert.match(html,/<h1[\s>]/,'missing heading '+flow.route);
 assert.ok(html.includes('id="'+flow.action+'"'),'missing action '+flow.action);
 assert.ok(html.includes('id="'+flow.result.slice(1)+'"'),'missing result '+flow.result);
}
for(const route of ['/learn/read-space-images/','/privacy/','/updates/']){
 const html=readFileSync('public'+route+'index.html','utf8');
 assert.match(html,/<h1[\s>]/);
 assert.ok(!cases.some(x=>x.route===route));
}
const size=readFileSync('pages/solar-system/planet-size-comparison/content.html','utf8');
assert.ok(size.indexOf('id="diameterLensPlay"')<size.indexOf('id="diameterLensProgress"'));
assert.ok(size.indexOf('id="diameterLensProgress"')<size.indexOf('id="diameterLensCanvas"'));
const ed=readFileSync('pages/solar-system/2026-ed138-dwarf-planet-candidate/content.html','utf8');
assert.ok(ed.indexOf('id="ed138Albedo"')<ed.indexOf('id="ed138SizeChart"'));
assert.ok(ed.indexOf('id="ed138SizeChart"')<ed.indexOf('id="ed138AlbedoHelp"'));
const dist=readFileSync('pages/solar-system/distance-scale/content.html','utf8');
assert.ok(dist.indexOf('id="distanceGuidedPlay"')<dist.indexOf('class="distance-focus-scales"'));
const mw=readFileSync('assets/js/milky-way.js','utf8');
assert.match(mw,/Galaxy overview: cyan marks the Sun/);
assert.match(mw,/Camera moved closer\. Apparent sizes changed/);
const dock=readFileSync('assets/js/mobile-feedback-dock.js','utf8');
for(const route of ['/black-holes/','/exoplanets/transit-method/','/galaxies/types/','/moon/eclipses/','/solar-system/orbital-periods/','/stars/life-cycle/','/universe/light-year/','/universe/scale/'])
 assert.ok(dock.includes("'"+route+"'"));
assert.match(dock,/Math\.min\(170,r\.height\*\.5\)/);
assert.match(dock,/generatedLabels/);
// Chronological Next and Previous are always-visible learning actions,
// including disabled Previous which must later enable without remount.
assert.ok(dock.includes("primary:['lifePrevious','lifeNext','lifeSwitchMass','lifePlay'],secondary:[]"));
assert.ok(dock.includes("primary:['zoomPrev','zoomNext','zoomCinemaTour'],secondary:[]"));
assert.doesNotMatch(dock,/mounted\.has\(id\)\|\|hidden\(e\)\|\|e\.disabled/);

assert.match(dock,/e\.addEventListener\('input',render\)/);
const css=readFileSync('assets/css/style.css','utf8');
assert.match(css,/@media\(min-width:621px\)[\s\S]*?\.atlas-feedback-dock:not/);
assert.match(css,/\.scene-controls>div:first-child button/);
assert.match(css,/\.atlas-feedback-main:has\(#lyPhotonSlider\)/);
const flowEvidence=JSON.parse(readFileSync('docs/evidence/sitewide-ux-task-flows-20261101.json','utf8'));
assert.equal(flowEvidence.cases.length,28);
assert.ok(flowEvidence.cases.every(x=>x.changed));
console.log('SITEWIDE_UX_FLOW_31_PAGES_28_INTERACTIVE_PASS');
