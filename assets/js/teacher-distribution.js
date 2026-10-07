const CAMPAIGN = 'space_atlas_teacher_test';

function sendEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, {
    event_category: 'growth_experiment',
    experiment: CAMPAIGN,
    ...params,
  });
}

function controlName(element) {
  if (!element) return 'unknown';
  if (element.id) return element.id;
  if (element.dataset.seasonAngle) return 'season_preset';
  if (element.dataset.moonAngle) return 'moon_phase_preset';
  return element.tagName.toLowerCase();
}

function classroomTargetUrl() {
  const target = new URL(window.location.href);
  target.hash = '';
  target.search = '';
  target.searchParams.set('utm_source', 'google_classroom');
  target.searchParams.set('utm_medium', 'share');
  target.searchParams.set('utm_campaign', CAMPAIGN);
  return target.toString();
}

export function initTeacherDistribution(pageKey) {
  const model = document.querySelector('[data-growth-model]');
  if (model) {
    let modelTracked = false;
    const trackModel = (event) => {
      if (modelTracked) return;
      const control = event.target.closest('button,input,select,[role="button"]');
      if (!control || !model.contains(control)) return;
      modelTracked = true;
      sendEvent('model_interact', {
        page_key: pageKey,
        first_control: controlName(control),
      });
    };
    model.addEventListener('click', trackModel);
    model.addEventListener('input', trackModel);
    model.addEventListener('change', trackModel);
  }

  document.querySelectorAll('[data-teacher-share]').forEach((link) => {
    const classroom = new URL('https://classroom.google.com/share');
    classroom.searchParams.set('url', classroomTargetUrl());
    link.href = classroom.toString();
    link.addEventListener('click', () => {
      sendEvent('classroom_share', { page_key: pageKey });
    });
  });

  document.querySelectorAll('[data-evidence-open], .source-panel a').forEach((link) => {
    link.addEventListener('click', () => {
      let destination = '';
      try {
        destination = new URL(link.href, window.location.href).hostname;
      } catch {
        destination = '';
      }
      sendEvent('evidence_open', {
        page_key: pageKey,
        evidence_type: link.hasAttribute('data-evidence-open') ? 'jump' : 'source',
        destination,
      });
    });
  });
}
