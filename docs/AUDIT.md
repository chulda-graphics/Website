# Visitor, layout, and implementation audit — 4 October 2026

## Follow-up full-site pass

Audited the restored design and transition update. The site is a client-side React/Vite application with local assets; there is no API, authentication service, or database in this repository.

### Verified fixes

- **Tablet alignment:** the 701–1100px stylesheet put biography text at 12vw while the identity used 17.84722vw. Both now align; at 768px they measure 137.0625px from the left edge.
- **Landscape feedback:** at 568×320 the contact placeholder message overlapped the project title. It now sits beside the navigation dock.
- **Travel scheduling:** hidden scenes cancel queued animation frames. Reduced-motion scenes render on demand for manual input/resize instead of running a permanent frame loop. Resuming visibility resets elapsed time, preventing a jump.
- **Reduced-motion pointer behavior:** pointer parallax is disabled when reduced motion is requested. Manual scroll/key exploration remains available.
- **Gesture cleanup:** only the primary tracked pointer controls travel drag; blur/visibility changes release drag state.
- **Screen-reader interruptions:** automatically changing travel city text no longer triggers repeated live-region announcements.
- **3D cleanup:** dispose replaced relief materials and explicitly release the renderer's WebGL context when leaving the globe.
- Added `npm run test:site` to CI. It tests scheduler cancellation, resumption, reduced-motion updates, disposal, unique project route IDs, and 27 non-empty local asset references.

### This pass's evidence

Browser viewport checks: 320×568, 390×844, 568×320, 768×1024, and 1280×720. Checked entry by keyboard and pointer drag, all four project routes, next-project navigation, info toggles and fully revealed text at the document bottom, About scrolling with fixed globe bounds, mobile reflow, contact/project placeholder feedback, invalid-project recovery, history navigation, and refresh persistence.

Production `dist` was served separately with Vite preview on localhost:4173. A direct About link retained its destination after the entry gate. All 23 travel photographs loaded; measured cruise speed was 95 and a scroll increased it to 218.91. No browser warnings/errors appeared in the tested production flows. No horizontal overflow appeared in measured desktop, tablet, and mobile states.

`npm run build`, `npm run test:flight`, `npm run test:site`, and `git diff --check` passed. `npm audit` returned zero advisories across both production and development dependencies.

The scheduler's hidden/reduced-motion branches were unit-tested; OS preference switching and background-tab throttling were not separately exercised through the browser. WebGL context-loss recovery was code-reviewed, not fault-injected. This is Chromium viewport testing, not physical-device, Safari, Firefox, or screen-reader certification.

Remaining launch work: actual project/contact content, owner-supplied travel photography, and production hosting with SPA route rewrites. The separately loaded Three.js bundle still produces Vite's size advisory (570 KB minified / 144 KB gzip); the build succeeds. No backend or deployment credentials were added.

---

## Changes

- Replaced blocking native View Transition overlays with a short route fade. Rapid navigation previously swallowed the first click on destination controls.
- Added minimum desktop/tablet type and control sizes. At 768px, navigation targets now measure 44px instead of about 29px and carousel cards measure 260px instead of about 179px.
- Enlarged project selector targets while retaining the small visual dots.
- Scaled decorative mockup text relative to each card and narrowed its number panel to remove overlap. Made placeholder project titles readable against their backgrounds.
- Reserved space for the mobile close button, improved category wrapping, and added a backdrop behind floating project controls/status messages.
- Corrected the tablet close button's centering and gap from project content.
- Added a short-landscape layout so the header, card, and navigation fit without crushing the card.
- Raised muted body text contrast to approximately 4.62:1 against the page background; travel guidance is approximately 5.36:1 against white. These are spot checks, not a WCAG certification.
- Kept navigation entrance hit areas stationary and excluded viewport controls/programmatic heading focus from ScrollSmoother recentering.
- Added route heading focus, improved skip-link behavior, a home main landmark, and a travel heading. Modified clicks on project links retain native browser behavior.
- Captured carousel pointers only after drag intent, handled cancellation/window blur, and kept normal card clicks working after dragging.
- Allowed travel gestures across the scene and provided touch-specific drag guidance.
- Normalized trailing slashes in routes.
- Suspended 3D rendering when hidden or offscreen and stopped continuous rendering for static reduced-motion scenes. Added WebGL context loss/recovery handling.

## Verification

Repeated browser passes in the Codex Chromium browser at 320×568, 390×844, 568×320, 768×1024, 844×390, and 1440×900. These were viewport simulations, not physical-device tests.

Checked home layout, project selection, pointer drag, keyboard selection, ordinary card clicks, immediate route controls using direct pointer input, project info, completed ScrollFloat characters, travel scrolling and return, browser back/forward, trailing-slash URLs, unknown-route recovery, and entry persistence within a tab. Desktop globe bounds remained identical before and after scrolling. No horizontal overflow was observed in the measured tablet and desktop states. No browser errors or warnings were captured in the tested flows.

`npm run build`, `npm run test:flight`, and `git diff --check` passed. `npm audit --omit=dev` reported zero production dependency vulnerabilities. The build still reports the Three.js vendor chunk above 500 kB (about 144 kB gzipped); it is loaded separately and warmed during entry.

## Remaining limits

Project artwork, project descriptions, biography, email, and social destinations remain placeholders/configuration work. Audio remains off. This pass does not certify exact visual equivalence to the reference, production hosting, screen-reader behavior, physical touch devices, Safari/Firefox, or hardware-specific GPU behavior. WebGL context recovery and the new visibility/reduced-motion scheduling branches were code-reviewed; they were not exhaustively fault-injected in a real browser.

A locator-based automation click could scroll an About control between pointerdown and pointerup. Direct native pointer clicks passed repeated immediate Home/About/return cycles; no custom pointerdown activation workaround was added.
