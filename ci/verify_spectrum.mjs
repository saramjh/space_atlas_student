#!/usr/bin/env node
// Lightweight headless behavior gate for the existing dependency-free spectrum module.
// Runs the actual page code against a minimal DOM with no browser/test dependency.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

class Element {
  constructor(textContent = '') {
    this.textContent = textContent;
    this.value = '';
    this.style = {};
    this.dataset = {};
    this.listeners = new Map();
    this.attrs = {};
    this.disabled = false;
  }
  setAttribute(name, value) { this.attrs[name] = value; }
  getAttribute(name) { return this.attrs[name]; }
  addEventListener(name, fn) { this.listeners.set(name, fn); }
  fire(name) {
    const fn = this.listeners.get(name);
    assert.ok(fn, `missing listener: ${name}`);
    fn();
  }
}
const ids = new Map();
for (const id of [
  'spectrumSlider', 'spectrumCursor', 'spectrumBand', 'spectrumDesc',
  'spectrumWave', 'spectrumWaveToggle', 'spectrumWavelength',
  'spectrumFrequency', 'spectrumEnergy',
]) ids.set('#' + id, new Element());
ids.get('#spectrumSlider').value = '726';
const samples = [
  ['Radio', '1'], ['Microwave', '0.01'], ['Infrared', '0.00001'],
  ['Visible', '0.00000055'], ['UV', '0.0000001'], ['X-ray', '0.000000001'],
  ['Gamma', '0.000000000001'],
].map(([name, meters]) => {
  const el = new Element(name);
  el.dataset.spectrumSample = meters;
  return el;
});
const motionListeners = new Map();
const motion = {
  matches: false,
  addEventListener(name, fn) { motionListeners.set(name, fn); },
};
const doc = {
  hidden: false,
  querySelector(selector) {
    assert.ok(ids.has(selector), `unknown selector: ${selector}`);
    return ids.get(selector);
  },
  querySelectorAll(selector) {
    assert.equal(selector, '[data-spectrum-sample]');
    return samples;
  },
  listeners: new Map(),
  addEventListener(name, fn) { this.listeners.set(name, fn); },
};
const source = readFileSync('assets/js/electromagnetic-spectrum.js', 'utf8')
  .replace("import { initQuiz } from './quiz-widget.js';", 'const initQuiz = () => {};');
runInNewContext(source, {
  document: doc,
  window: { matchMedia: () => motion },
  performance: { now: () => 0 },
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  console,
});

const value = (id) => ids.get('#' + id).textContent;
const select = (name) => samples.find((s) => s.textContent === name).fire('click');
const range = ids.get('#spectrumSlider');
assert.equal(value('spectrumBand'), 'Visible light');
assert.equal(value('spectrumWavelength'), '550 nm');
assert.equal(value('spectrumEnergy'), '2.26 eV');
assert.ok(Math.abs(parseFloat(ids.get('#spectrumCursor').style.left) - 51.86) < 0.1);
assert.ok(ids.get('#spectrumWave').attrs.d.length > 500);

select('Radio');
assert.equal(value('spectrumBand'), 'Radio');
assert.equal(value('spectrumWavelength'), '1 m');
assert.equal(value('spectrumFrequency'), '300 MHz');
assert.equal(value('spectrumEnergy'), '1.24 µeV');

select('Infrared');
assert.equal(value('spectrumBand'), 'Infrared');
assert.equal(value('spectrumWavelength'), '10 µm');

select('Gamma');
assert.equal(value('spectrumBand'), 'Gamma ray');
assert.equal(value('spectrumWavelength'), '1 pm');
assert.equal(value('spectrumEnergy'), '1.24 MeV');
assert.equal(samples.at(-1).getAttribute('aria-pressed'), 'true');

range.value = '0';
range.fire('input');
assert.equal(value('spectrumWavelength'), '10 m');
assert.equal(value('spectrumBand'), 'Radio');
range.value = '1400';
range.fire('input');
assert.equal(value('spectrumWavelength'), '0.1 pm');
assert.equal(value('spectrumBand'), 'Gamma ray');

const motionButton = ids.get('#spectrumWaveToggle');
motionButton.fire('click');
assert.equal(motionButton.getAttribute('aria-pressed'), 'true');
motionButton.fire('click');
assert.equal(motionButton.getAttribute('aria-pressed'), 'false');
motionButton.fire('click');
motion.matches = true;
motionListeners.get('change')();
assert.equal(motionButton.disabled, true);
assert.equal(motionButton.getAttribute('aria-pressed'), 'false');

const html = readFileSync('public/astronomy/electromagnetic-spectrum/index.html', 'utf8');
assert.match(html, /<link rel="canonical" href="https:\/\/saramjh.github.io\/space_atlas_student\/astronomy\/electromagnetic-spectrum\/"/);
assert.match(html, /<h1>Is visible light all there is to see in space\?<\/h1>/);
assert.match(html, /Approximate wavelength ranges/);
assert.match(html, /NASA GSFC/);
assert.match(html, /The spectrum is continuous, not seven boxes/);
assert.match(html, /application\/ld\+json/);
console.log('Spectrum behavior, numerical readout, reduced-motion and static SEO gate passed.');
