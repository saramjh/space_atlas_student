// A three-round challenge on the existing single-source Moon model.
// No timer, rewards, login, user identity, persistence, or animation loop.
// NASA: https://science.nasa.gov/moon/moon-phases/
import { moonModelAtDegrees } from './moon-geometry.js';

export const MOON_MISSIONS = Object.freeze([
  {
    key: 'quarter',
    target: 90,
    tolerance: 12,
    prompt: 'Make a waxing half Moon.',
    clue: '“Quarter” refers to a quarter of the 29.5-day phase cycle, not 25% of the visible disk.',
    hint: 'Start at New Moon and advance about one quarter of the cycle. Is the right half becoming bright?',
    explanation: 'First Quarter: around half of the visible disk is bright. The Moon is about a quarter through its phase cycle.',
    routeWhy: 'The orbit diagram compresses the Moon’s distance. How far apart are Earth and Moon really?',
    targetLabel: 'Target: waxing half Moon, bright on the right in this northern-view diagram.',
  },
  {
    key: 'full',
    target: 180,
    tolerance: 12,
    prompt: 'Make a fully bright Moon.',
    clue: 'The Sun always lights one half of the Moon’s sphere. Change which part Earth can see.',
    hint: 'Try placing Earth between the Sun and Moon in the overhead model.',
    explanation: 'Full Moon: we face almost all of the illuminated hemisphere. Ordinary phases are not Earth’s shadow.',
    routeWhy: 'Full Moon happens each cycle, but lunar eclipses do not. What changes when the orbit is tilted?',
    targetLabel: 'Target: fully illuminated circular Moon disk.',
  },
  {
    key: 'waning',
    target: 315,
    tolerance: 16,
    prompt: 'Make a waning crescent Moon.',
    clue: 'It comes after Last Quarter, before the next New Moon. Look for the shrinking lit edge.',
    hint: 'Move beyond Last Quarter toward New Moon: the bright sliver is on the left in this northern-view diagram.',
    explanation: 'Waning Crescent: only a small part of the lit hemisphere faces us, and its visible fraction is decreasing.',
    routeWhy: 'The bright fraction changes, but the Moon keeps nearly the same face pointed at Earth. Why?',
    targetLabel: 'Target: waning crescent, thin illuminated arc on the left in this northern-view diagram.',
  },
]);

export function shortestOrbitDistance(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new RangeError('Angles must be finite');
  return Math.abs(((a - b + 540) % 360) - 180);
}

export function matchesMoonMission(angle, mission) {
  if (!mission || !Number.isFinite(mission.target) || !Number.isFinite(mission.tolerance)) {
    throw new TypeError('Invalid Moon mission');
  }
  return shortestOrbitDistance(angle, mission.target) <= mission.tolerance;
}

function emit(name, values = {}) {
  // Site analytics is optional, and only deliberate challenge actions are sent.
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, {
    event_category: 'moon_learning',
    page_key: 'moon_phases',
    ...values,
  });
}

export function initMoonMissions({ drawMoon, getAngle, setAngle }) {
  const root = document.querySelector('[data-moon-missions]');
  if (!root) return { sync() {} };
  const $ = id => root.querySelector('#' + id);
  const start = $('moonMissionStart');
  const play = $('moonMissionPlay');
  const progress = $('moonMissionProgress');
  const prompt = $('moonMissionPrompt');
  const clue = $('moonMissionClue');
  const target = $('moonMissionTarget');
  const current = $('moonMissionCurrent');
  const fraction = $('moonMissionFraction');
  const angleSlider = $('moonMissionAngle');
  const check = $('moonMissionCheck');
  const hint = $('moonMissionHint');
  const next = $('moonMissionNext');
  const restart = $('moonMissionRestart');
  const feedback = $('moonMissionFeedback');
  const routes = $('moonMissionRoutes');
  const routeWhy = $('moonMissionRouteWhy');
  const routeLinks = [...root.querySelectorAll('[data-moon-mission-route]')];

  let started = false;
  let round = 0;
  let solved = false;
  let attempts = 0;
  let completeCount = 0;

  function sync(degrees) {
    if (!started) return;
    angleSlider.value = String(degrees);
    drawMoon(degrees * Math.PI / 180, current);
    fraction.textContent = Math.round(moonModelAtDegrees(degrees).illuminatedFraction * 100) + '% bright';
  }

  function hideRoutes() {
    routes.hidden = true;
    routeLinks.forEach(link => { link.hidden = true; });
  }

  function prepareRound() {
    const mission = MOON_MISSIONS[round];
    solved = false;
    attempts = 0;
    progress.textContent = 'Mission ' + (round + 1) + ' of ' + MOON_MISSIONS.length;
    prompt.textContent = mission.prompt;
    clue.textContent = mission.clue;
    target.setAttribute('aria-label', mission.targetLabel);
    drawMoon(mission.target * Math.PI / 180, target);
    sync(getAngle());
    check.hidden = false;
    hint.hidden = false;
    next.hidden = true;
    restart.hidden = true;
    feedback.textContent = 'Move your Moon to match the target. Then check your choice.';
    hideRoutes();
  }

  start.addEventListener('click', () => {
    started = true;
    round = 0;
    completeCount = 0;
    start.hidden = true;
    root.classList.add('is-playing');
    start.setAttribute('aria-expanded', 'true');
    play.hidden = false;
    prepareRound();
    emit('moon_mission_start');
    // Focus enters the game but does not jump over the visual and its controls.
    if (window.matchMedia('(max-width:820px)').matches) {
      play.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    angleSlider.focus({ preventScroll: true });
  });

  angleSlider.addEventListener('input', () => {
    if (!started || solved) return;
    setAngle(Number(angleSlider.value));
  });

  hint.addEventListener('click', () => {
    if (!started || solved) return;
    feedback.textContent = MOON_MISSIONS[round].hint;
    emit('moon_mission_hint', { mission_key: MOON_MISSIONS[round].key });
  });

  check.addEventListener('click', () => {
    if (!started || solved) return;
    const mission = MOON_MISSIONS[round];
    const angle = getAngle();
    attempts++;
    const matched = matchesMoonMission(angle, mission);
    if (attempts === 1) emit('moon_mission_first_check', { mission_key: mission.key, matched });
    if (!matched) {
      const bright = Math.round(moonModelAtDegrees(angle).illuminatedFraction * 100);
      feedback.textContent = 'Not yet: your Moon is about ' + bright +
        '% bright. Compare the lit edge and whether the Moon is waxing or waning.' +
        (attempts >= 2 ? ' Tip: ' + mission.hint : '');
      return;
    }
    solved = true;
    completeCount++;
    // Snap a successful approximate match to the scientific named reference.
    // A quarter/full is an instant, not a 12-degree-wide phase.
    setAngle(mission.target);
    feedback.textContent = 'Matched! ' + mission.explanation +
      ' We placed the model at the named reference position to compare exactly.';
    check.hidden = true;
    hint.hidden = true;
    const link = routeLinks.find(item => item.dataset.moonMissionRoute === mission.key);
    hideRoutes();
    routes.hidden = false;
    routeWhy.textContent = mission.routeWhy;
    if (link) link.hidden = false;
    emit('moon_mission_complete', { mission_key: mission.key, mission_number: round + 1 });
    if (round + 1 < MOON_MISSIONS.length) {
      next.hidden = false;
    } else {
      progress.textContent = 'All three Moon missions completed';
      restart.hidden = false;
      feedback.textContent += ' You completed all three ideas: quarter, full, and waning.';
      emit('moon_mission_all_complete', { completed_missions: completeCount });
    }
  });

  next.addEventListener('click', () => {
    if (!solved || round >= MOON_MISSIONS.length - 1) return;
    round++;
    prepareRound();
    angleSlider.focus({ preventScroll: true });
  });

  restart.addEventListener('click', () => {
    if (!solved || round !== MOON_MISSIONS.length - 1) return;
    round = 0;
    completeCount = 0;
    prepareRound();
    angleSlider.focus({ preventScroll: true });
  });

  document.querySelector('[data-moon-mission-entry]')?.addEventListener('click', () => emit('moon_mission_entry_click'));

  routeLinks.forEach(link => link.addEventListener('click', () => {
    if (!link.hidden) emit('moon_mission_next_topic', { mission_key: link.dataset.moonMissionRoute });
  }));

  return { sync };
}
