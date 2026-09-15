// Instant Topic Search Modal for Space Atlas (dependency-free)
let searchIndex = null;

async function loadIndex() {
  if (searchIndex) return searchIndex;
  try {
    const meta = document.querySelector('link[rel="icon"]');
    const base = meta && meta.getAttribute('href') ? meta.getAttribute('href').replace(/\/assets\/.*$/, '') : '';
    const res = await fetch(`${base}/assets/search-index.json`);
    searchIndex = await res.json();
    return searchIndex;
  } catch (err) {
    console.error('Failed to load search index:', err);
    return [];
  }
}

function initSearch() {
  const modal = document.querySelector('#searchModal');
  const trigger = document.querySelector('#searchTrigger');
  const triggerMobile = document.querySelector('#searchTriggerMobile');
  const closeBtn = document.querySelector('#searchClose');
  const input = document.querySelector('#searchInput');
  const resultsContainer = document.querySelector('#searchResults');

  if (!modal || !input) return;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    loadIndex();
    setTimeout(() => input.focus(), 50);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    input.value = '';
    renderDefault();
  }

  function renderDefault() {
    resultsContainer.innerHTML = `
      <div class="search-hint">Type any question, planet, or topic to instantly filter Space Atlas. Press <kbd>ESC</kbd> to exit.</div>
    `;
  }

  function filter(query) {
    if (!searchIndex) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      renderDefault();
      return;
    }

    const matched = searchIndex.filter(item => {
      return item.title.toLowerCase().includes(q) ||
             item.desc.toLowerCase().includes(q) ||
             item.kicker.toLowerCase().includes(q) ||
             item.path.toLowerCase().includes(q);
    });

    if (matched.length === 0) {
      resultsContainer.innerHTML = `<div class="search-empty">No topics matched "<strong>${escapeHtml(query)}</strong>". Try searching for "Moon", "Gravity", "Stars", or "Scale".</div>`;
      return;
    }

    const meta = document.querySelector('link[rel="icon"]');
    const base = meta && meta.getAttribute('href') ? meta.getAttribute('href').replace(/\/assets\/.*$/, '') : '';

    resultsContainer.innerHTML = matched.map((item, idx) => `
      <a href="${base}${item.path}" class="search-item" ${idx === 0 ? 'data-active="1"' : ''}>
        <div class="search-item-kicker">${item.kicker}</div>
        <div class="search-item-title">${escapeHtml(item.title)}</div>
        <div class="search-item-desc">${escapeHtml(item.desc)}</div>
      </a>
    `).join('');
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  if (trigger) trigger.onclick = openModal;
  if (triggerMobile) triggerMobile.onclick = openModal;
  if (closeBtn) closeBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  input.oninput = () => filter(input.value);

  window.addEventListener('keydown', (e) => {
    // Open on '/' if not typing in an input
    if (e.key === '/' && modal.hidden && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openModal();
    }
    // Close on Escape
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
    // Quick enter navigation
    if (e.key === 'Enter' && !modal.hidden) {
      const activeLink = resultsContainer.querySelector('.search-item');
      if (activeLink) {
        window.location.href = activeLink.href;
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}
