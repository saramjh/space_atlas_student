/*
 * Recoverable page layout when an already-served Google publisher ad retains
 * desktop dimensions after a user resizes the browser to a narrower viewport.
 * Never modifies a filled ad, iframe, request, or provider layout. Only shows
 * an ordinary first-party page notice with an explicit, user-triggered
 * *whole page* reload option; the user can continue without reloading.
 */
(() => {
  const slots = [...document.querySelectorAll('.ad-slot-wrapper[data-ad-position] > ins.adsbygoogle')];
  if (!slots.length || !document.querySelector('main')) return;

  const openingWidth = window.innerWidth;
  let frame = 0;
  let notice = null;
  let dismissedAtWidth = null;
  let delayedChecks = [];

  function hasOversizedExistingAd() {
    const width = window.innerWidth;
    // This incident is a post-load desktop-to-mobile (or tablet) size change,
    // not a first-load mobile sizing error or a too-wide lesson table.
    if (width >= openingWidth - 24 || document.documentElement.scrollWidth <= width + 3) return false;
    const outsideViewport = (node) => {
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden'
        && box.height > 0 && box.width > width + 8
        && (box.right > width + 3 || box.left < -3);
    };
    if (slots.some(outsideViewport)) return true;

    // Auto Ads can insert a Google-owned host *after* the viewport resize.
    // Detect only: never move, crop, resize, remove or style provider markup.
    return [...document.querySelectorAll('[id^="aswift_"][id$="_host"]')].some((host) => {
      const googleOwned = host.closest('ins.adsbygoogle, .google-auto-placed')
        || host.querySelector('[data-google-ad-efd="true"]');
      return googleOwned && outsideViewport(host);
    });
  }

  function createNotice() {
    const region = document.createElement('div');
    region.className = 'ad-resize-recovery';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');

    const text = document.createElement('p');
    text.textContent = 'Your browser window became narrower after advertising elements loaded. '
      + 'A Google-provided ad or related-search panel may still use the old desktop width. '
      + 'Refreshing may fit the new width; it will restart the current lesson controls.';

    const actions = document.createElement('div');
    actions.className = 'ad-resize-recovery-actions';

    const reload = document.createElement('button');
    reload.type = 'button';
    reload.textContent = 'Reload page for this width';
    reload.addEventListener('click', () => window.location.reload());

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.textContent = 'Continue without reloading';
    dismiss.addEventListener('click', () => {
      dismissedAtWidth = window.innerWidth;
      region.hidden = true;
    });

    actions.append(reload, dismiss);
    region.append(text, actions);
    document.querySelector('main').prepend(region);
    return region;
  }

  function measure() {
    frame = 0;
    const needsRecovery = hasOversizedExistingAd();
    if (!needsRecovery) {
      if (notice) notice.hidden = true;
      return;
    }
    if (dismissedAtWidth !== null && Math.abs(window.innerWidth - dismissedAtWidth) <= 3) return;
    if (!notice) notice = createNotice();
    notice.hidden = false;
  }

  window.addEventListener('resize', () => {
    if (frame) cancelAnimationFrame(frame);
    delayedChecks.forEach(clearTimeout);
    delayedChecks = [];
    frame = requestAnimationFrame(measure);
    // Google can attach its own host asynchronously after responsive layout.
    // Small bounded retries catch that late insertion without observing all DOM
    // mutations, polling indefinitely, or touching Google's ad requests.
    if (window.innerWidth < openingWidth - 24) {
      delayedChecks = [350, 1400, 3500].map((ms) => setTimeout(measure, ms));
    }
  }, {passive: true});
})();
