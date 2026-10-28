// Shared desktop navigation disclosure behavior.
document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  const button = dropdown.querySelector('.nav-drop-btn');
  const links = [...dropdown.querySelectorAll('.nav-drop-menu a')];
  if (!button) return;

  let mouseInside = false;
  const setOpen = (open) => {
    dropdown.classList.toggle('nav-open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  dropdown.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    mouseInside = true;
    setOpen(true);
  });

  dropdown.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    mouseInside = false;
    if (!links.includes(document.activeElement)) setOpen(false);
  });

  dropdown.addEventListener('focusin', (event) => {
    if (links.includes(event.target)) setOpen(true);
  });

  dropdown.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!dropdown.contains(document.activeElement) && !mouseInside) setOpen(false);
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!dropdown.contains(event.target)) setOpen(false);
  });

  button.addEventListener('click', (event) => {
    // Hover has already opened the menu for a mouse click; do not immediately toggle it shut.
    if (mouseInside && event.detail > 0) {
      setOpen(true);
      return;
    }
    setOpen(!dropdown.classList.contains('nav-open'));
  });

  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && links.length) {
      event.preventDefault();
      setOpen(true);
      links[0].focus();
    }
  });

  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      button.focus();
    }
  });
});
