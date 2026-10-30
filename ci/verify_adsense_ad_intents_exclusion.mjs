#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const src=p=>readFileSync(p,'utf8');
const template=src('templates/layout.html');
const build=src('build.py');
const slots=src('templates/ad-slot.html');
// Google AdSense officially supports body-level google-anno-skip as an
// Ad intents opt-out: https://support.google.com/adsense/answer/13844047
assert.match(template,/<body class="google-anno-skip">/);
assert.ok(build.includes("'<body class=\"google-anno-skip\">'"));
assert.ok(build.includes('data-classroom-preview='));
assert.doesNotMatch(template,/style="[^"]*overflow:hidden|<body[^>]*style=/);
assert.doesNotMatch(template,/google-anno-skip[\s\S]{0,90}data-ad-client/);
assert.match(slots,/data-ad-client="ca-pub-4410729598083068"/);
assert.match(slots,/data-ad-slot="\{\{AD_SLOT_ID\}\}"/);
assert.match(slots,/data-ad-format="auto"/);
assert.match(slots,/data-full-width-responsive="true"/);
assert.doesNotMatch(slots,/google-anno-skip|iframe\.style|overflow:hidden/);
const walk=(path)=>readdirSync(path,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(join(path,d.name)):d.name==='index.html'?[join(path,d.name)]:[]);
const pages=walk('public');
assert.equal(pages.length,29);
for(const path of pages){
 const html=src(path);
 assert.equal((html.match(/<body class="google-anno-skip">/g)||[]).length,1,`${path}: page-level ad intent exclusion`);
 assert.equal((html.match(/<main>/g)||[]).length,1,`${path}: original lesson retained`);
}
const page=src('public/moon/tides/index.html');
assert.match(page,/data-ad-client="ca-pub-4410729598083068"/);
assert.match(page,/data-ad-slot="2983244729"/);
assert.match(page,/data-ad-format="auto"/);
assert.match(page,/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
console.log('AD_INTENTS_OFFICIAL_PAGE_EXCLUSION_29_PAGES_AND_DISPLAY_ADS_PRESERVED_PASS');
