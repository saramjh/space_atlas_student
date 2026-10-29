# Classroom-local Three.js distribution

Files from the official pinned package three@0.179.1, obtained from
https://unpkg.com/three@0.179.1/. Only copied into the local-only
CLASSROOM_PREVIEW=1 build. The deployable public site keeps its
existing CDN-backed importmap unchanged.

MIT license in LICENSE preserves attribution. No dependency is downloaded
from the internet during the classroom build or page load. JS parts:
- build/three.module.js imports ./three.core.js.
- examples/jsm/controls/OrbitControls.js imports from three (locally mapped).

This enables isolated ad-free, GA4-free teacher-supervised science model trials,
but does not establish legal COPPA compliance or genuine learner outcomes.
