// Shared desktop navigation disclosure behavior.
document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  const button = dropdown.querySelector('.nav-drop-btn');
  const links = [...dropdown.querySelectorAll('.nav-drop-menu a')];
  if (!button) return;

  const setExpanded = (open) => button.setAttribute('aria-expanded', open ? 'true' : 'false');

  dropdown.addEventListener('mouseenter', () => setExpanded(true));
  dropdown.addEventListener('mouseleave', () => setExpanded(false));
  dropdown.addEventListener('focusin', () => setExpanded(true));
  dropdown.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!dropdown.contains(document.activeElement)) setExpanded(false);
    });
  });

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    setExpanded(!open);
    dropdown.classList.toggle('nav-open', !open);
  });

  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && links.length) {
      event.preventDefault();
      setExpanded(true);
      dropdown.classList.add('nav-open');
      links[0].focus();
    }
  });

  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dropdown.classList.remove('nav-open');
      setExpanded(false);
      button.focus();
    }
  });
});
