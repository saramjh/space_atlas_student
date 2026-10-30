#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Dependency-free behavioral regression: delayed Google-owned host, not a fake
// advertising request. No provider ad is moved, styled, hidden or removed.
const source = readFileSync('assets/js/ad-resize-recovery.js', 'utf8');
function createHarness() {
  const deadlines = [];
  const states = { slotWidth: 366, width: 1280, scrollWidth: 1280, host: null, notice: null, reloadCount: 0, raf: null };
  const slot = { getBoundingClientRect: () => ({ left: 12, right: states.slotWidth + 12, width: states.slotWidth, height: 110 }) };
  const main = { prepend: node => { states.notice = node; } };
  const document = {
    documentElement: { get scrollWidth() { return states.scrollWidth; } },
    querySelectorAll: selector => selector.includes('data-ad-position') ? [slot] : selector.includes('aswift_') ? (states.host ? [states.host] : []) : [],
    querySelector: selector => selector === 'main' ? main : null,
    createElement: tag => ({ tag, textContent: '', hidden: false, events: {}, append(...children) { this.children = children; }, setAttribute(key, value) { this[key] = value; }, addEventListener(type, fn) { this.events[type] = fn; } }),
  };
  const window = {
    get innerWidth() { return states.width; },
    location: { reload() { states.reloadCount += 1; } },
    addEventListener(type, callback) { if (type === 'resize') states.onResize = callback; },
  };
  vm.runInNewContext(source, {
    window, document,
    getComputedStyle: () => ({ display: 'block', visibility: 'visible' }),
    requestAnimationFrame: callback => { states.raf = callback; return 1; },
    cancelAnimationFrame: () => {},
    setTimeout: (callback, time) => { deadlines.push({ callback, time }); return deadlines.length; },
    clearTimeout: () => {},
  });
  return { states, deadlines, resize: () => { states.onResize(); states.raf?.(); },
    lateHost: () => {
      states.host = { getBoundingClientRect: () => ({ left: 12, right: 982, width: 970, height: 280 }), closest: () => ({}), querySelector: () => null };
      states.scrollWidth = 982;
    },
  };
}
// Legitimate page layout overflow alone must NOT be mistaken for an ad problem.
{
  const h = createHarness();h.states.width = 390;h.states.scrollWidth = 920;h.resize();
  for (const item of h.deadlines) item.callback();
  assert.equal(h.states.notice, null, 'non-ad overflow must not show AdSense notice');
}
// Auto Ads inserts a host after the resize frame: the delayed check must notice.
{
  const h = createHarness();h.states.width = 390;h.states.scrollWidth = 390;h.resize();
  assert.equal(h.states.notice, null, 'no premature reload notice');
  h.lateHost();
  const scheduled = h.deadlines.find(x => x.time === 350);
  assert.ok(scheduled);scheduled.callback();
  assert.ok(h.states.notice && !h.states.notice.hidden, 'show notice for asynchronous provider overflow');
  assert.equal(h.states.reloadCount, 0, 'never reload automatically');
  const actions = h.states.notice.children[1].children;
  assert.equal(actions[0].textContent, 'Reload page for this width');
  assert.equal(actions[1].textContent, 'Continue without reloading');
  actions[1].events.click();
  assert.equal(h.states.notice.hidden, true);
  h.deadlines.at(-1).callback();
  assert.equal(h.states.notice.hidden, true, 'respect dismissal until meaningful width change');
  assert.equal(h.states.reloadCount, 0);
  actions[0].events.click();
  assert.equal(h.states.reloadCount, 1, 'reload only on explicit user click');
  assert.equal(h.states.host.getBoundingClientRect().width, 970, 'never alter provider host');
}
console.log('AD_LATE_GOOGLE_HOST_RECOVERY_BEHAVIOR_PASS');
