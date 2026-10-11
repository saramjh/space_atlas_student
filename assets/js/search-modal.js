// Site-wide topic search: lazy index, keyboard-safe dialog and focus restoration.
let searchIndex = null;
let indexPromise = null;

function projectBase() {
  const favicon = document.querySelector('link[rel="icon"]')?.getAttribute('href') || '';
  return favicon.replace(/\/assets\/.*$/, '');
}

async function loadIndex() {
  if (searchIndex) return searchIndex;
  if (indexPromise) return indexPromise;
  indexPromise = (async () => {
    try {
      const response = await fetch(`${projectBase()}/assets/search-index.json`);
      if (!response.ok) throw new Error(`Search index HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Search index must be an array');
      searchIndex = data;
      return data;
    } catch (error) {
      indexPromise = null; // Allow retries after an intermittent fetch error.
      console.warn('Search index could not load:', error);
      return null;
    }
  })();
  return indexPromise;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    "'": '&#39;', '"': '&quot;'
  })[char]);
}

function initSearch() {
  const modal = document.querySelector('#searchModal');
  const trigger = document.querySelector('#searchTrigger');
  const triggerMobile = document.querySelector('#searchTriggerMobile');
  const closeButton = document.querySelector('#searchClose');
  const input = document.querySelector('#searchInput');
  const resultsContainer = document.querySelector('#searchResults');
  if (!modal || !input || !resultsContainer) return;

  let previousFocus = null;
  const hint = 'Type a planet, question, or topic. Press Escape to close.';
  function showHint(message = hint) {
    resultsContainer.replaceChildren();
    const div = document.createElement('div');
    div.className = 'search-hint';
    div.textContent = message;
    resultsContainer.append(div);
  }

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      showHint();
      return;
    }
    if (!searchIndex) {
      showHint('Loading topics…');
      return;
    }

    const matching = searchIndex.filter(item => (
      [item.title, item.desc, item.kicker, item.path].some(
        value => String(value || '').toLowerCase().includes(q)
      )
    ));

    if (!matching.length) {
      resultsContainer.innerHTML =
        `<div class="search-empty">No topics matched "<strong>${escapeHtml(query)}</strong>". Try "Moon", "Gravity", "Stars", or "Scale".</div>`;
      return;
    }

    const base = projectBase();
    resultsContainer.innerHTML = matching.map((item, idx) => {
      // Topic paths are produced by our static build, not entered by visitors.
      const path = String(item.path || '');
      if (!/^\/(?!\/)[a-z0-9/-]*$/i.test(path)) return '';
      return `<a href="${base}${path}" class="search-item" ${idx === 0 ? 'data-active="1"' : ''}>
        <div class="search-item-kicker">${escapeHtml(item.kicker)}</div>
        <div class="search-item-title">${escapeHtml(item.title)}</div>
        <div class="search-item-desc">${escapeHtml(item.desc)}</div>
      </a>`;
    }).join('');
  }

  function openModal() {
    if (!modal.hidden) return;
    previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    input.focus();
    loadIndex().then((data) => {
      if (modal.hidden) return;
      if (!data) {
        showHint('Search is temporarily unavailable. Close and reopen to retry.');
      } else {
        // Rerender queries typed before the index finished loading.
        renderResults(input.value);
      }
    });
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    input.value = '';
    showHint();
    if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  trigger?.addEventListener('click', openModal);
  triggerMobile?.addEventListener('click', openModal);
  closeButton?.addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  input.addEventListener('input', () => renderResults(input.value));

  window.addEventListener('keydown', event => {
    if (modal.hidden) {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) &&
          !document.activeElement?.isContentEditable) {
        event.preventDefault();
        openModal();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [input, closeButton, ...resultsContainer.querySelectorAll('a.search-item')]
        .filter(el => !el.disabled && !el.hidden);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    // Enter should only select the first result while typing.
    // Let native Enter activate focused links or the Close button as expected.
    if (event.key === 'Enter' && !event.isComposing && document.activeElement === input) {
      const firstResult = resultsContainer.querySelector('a.search-item');
      if (firstResult) {
        event.preventDefault();
        window.location.href = firstResult.href;
      }
    }
  });

  showHint();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch, { once: true });
} else {
  initSearch();
}
