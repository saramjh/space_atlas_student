import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(p,'utf8');
const ad=src('templates/ad-slot.html');
const css=src('assets/css/style.css');
const site=src('public/moon/tides/index.html');
const build=src('build.py');
assert.match(ad,/space_atlas_ad_\{\{AD_POSITION\}\}/);
assert.match(ad,/data-ad-slot="\{\{AD_SLOT_ID\}\}"/);
assert.match(ad,/data-ad-client="ca-pub-4410729598083068"/);
assert.match(ad,/adsbygoogle = window.adsbygoogle/);
assert.match(ad,/\.space_atlas_ad_\{\{AD_POSITION\}\}\{display:block;width:100%;max-width:970px\}/);
assert.match(ad,/data-ad-format="auto"/,'Google should choose the display size from available space');
assert.match(ad,/data-full-width-responsive="true"/,'enable responsive full-width mobile display');
assert.doesNotMatch(ad,/@media\(min-width:\d+px\)|width:(?:280|320|468)px|height:\d+px/,
 'fixed ad dimensions must not survive the responsive migration');
assert.doesNotMatch(ad,/<iframe|overflow:hidden|display:none|\.style\.|adsbygoogle\.push\(/,
 'do not hide, resize or manipulate rendered ads');
assert.match(css,/\.ad-slot-wrapper\{[^}]*box-sizing:border-box;[^{]*width:100%;[^{]*min-width:0/);
assert.match(css,/@media\(max-width:599px\)\{\.ad-slot-wrapper\{padding:16px 12px/);
assert.match(site,/data-ad-client="ca-pub-4410729598083068"/);
assert.match(site,/data-ad-slot="2983244729"/);
assert.match(build,/ADSENSE_SECONDARY_SLOT = "1670163057"/);
assert.match(site,/data-ad-format="auto"/);
assert.match(site,/data-full-width-responsive="true"/);
assert.match(site,/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
console.log('MOBILE_AD_RESPONSIVE_TDD_PASS: IDs unchanged, responsive layout, no iframe hacks');
