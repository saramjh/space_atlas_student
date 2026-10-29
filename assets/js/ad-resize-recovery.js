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

  function hasOversizedExistingAd() {
    const width = window.innerWidth;
    // This incident is a post-load desktop-to-mobile (or tablet) size change,
    // not a first-load mobile sizing error or a too-wide lesson table.
    if (width >= openingWidth - 24 || document.documentElement.scrollWidth <= width + 3) return false;
    return slots.some((slot) => {
      const box = slot.getBoundingClientRect();
      const visible = getComputedStyle(slot).display !== 'none';
      return visible && box.height > 0 && box.width > width + 8
        && (box.right > width + 3 || box.left < -3);
    });
  }

  function createNotice() {
    const region = document.createElement('div');
    region.className = 'ad-resize-recovery';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');

    const text = document.createElement('p');
    text.textContent = 'Your browser window became narrower after an advertisement loaded. '
      + 'The existing ad may not fit until this page is refreshed. '
      + 'Refreshing will restart the current lesson controls.';

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
    frame = requestAnimationFrame(measure);
  }, {passive: true});
})();
