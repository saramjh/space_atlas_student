import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const js=read('assets/js/ad-resize-recovery.js');
const css=read('assets/css/ad-resize-recovery.css');
const build=read('build.py');
const ad=read('templates/ad-slot.html');
assert.match(build,/ad-resize-recovery\.js/);
assert.match(build,/ad-resize-recovery\.css/);
assert.match(js,/data-ad-position/);
assert.match(js,/adsbygoogle/);
assert.match(js,/getBoundingClientRect/);
assert.match(js,/document\.documentElement\.scrollWidth/);
assert.match(js,/window\.addEventListener\('resize'/);
assert.match(js,/window\.location\.reload\(\)/);
assert.match(js,/addEventListener\('click', \(\) => window\.location\.reload\(\)\)/,
  'whole-page reload must only originate on direct user click');
assert.match(js,/openingWidth/);
assert.match(js,/width >= openingWidth - 24/);
assert.match(js,/box\.width > width \+ 8/);
assert.match(js,/\[id\^=\"aswift_\"\]/);
assert.match(js,/\[data-google-ad-efd/);
assert.match(js,/host\.closest\('ins\.adsbygoogle, \.google-auto-placed'\)/);
assert.match(js,/\[350, 1400, 3500\]\.map/);
assert.match(js,/delayedChecks\.forEach\(clearTimeout\)/);
assert.match(js,/Continue without reloading/);
assert.match(js,/document\.querySelector\('main'\)\.prepend/,
  'display-state message must appear outside the ad');

assert.match(js,/reset|restart/i,'warn users that refreshing resets lesson state');
assert.match(js,/aria-live/);
assert.match(js,/type = 'button'|type='button'/);
assert.doesNotMatch(js,/\.style\.(?:display|width|overflow)|adsbygoogle\.push|iframe\.remove|setAttribute\('data-ad-status'/,
 'must not hide/resize/force ad requests or spoof filled status');
assert.match(css,/\.ad-resize-recovery/);
assert.match(ad,/data-ad-slot/);
const prod=read('public/moon/tides/index.html');
assert.match(prod,/ad-resize-recovery\.js/);
assert.match(prod,/ad-resize-recovery\.css/);
assert.match(prod,/adsbygoogle\.js/);
assert.match(read('public/index.html'),/ad-resize-recovery\.js/);
assert.ok(!prod.includes('Reload page for this width'),
  'initial page must not show a reload prompt without actual incident');

console.log('AD_RESIZE_RECOVERY_STATIC_GATE_PASS');
