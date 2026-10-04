# Visitor, layout, and implementation audit — 4 October 2026

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
