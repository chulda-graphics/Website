# Project info ScrollFloat

Applied the owner-supplied React Bits JavaScript/CSS ScrollFloat component to every section heading and description in the shared project info view. Uses the existing GSAP dependency, 1-second duration, `back.inOut(2)` easing, and 0.02-second character stagger. The effect follows scroll progress in both directions.

Adaptations for this portfolio:
- Keep Rethink Sans, existing sizes, weights, alignment, and paragraph semantics (`as="p"`).
- Group letters into words so mobile lines break at spaces, not mid-word. Keep one uninterrupted accessible text copy and hide decorative characters from screen readers.
- Inherit ScrollSmoother's scroll proxy; retain the optional custom scroll-container prop.
- Use `top bottom` → `clamp(bottom center)` so the final description can finish revealing before the page ends and above-fold headings are visible immediately.
- Explicitly initialize all characters and both pixel/percentage translations before staggering. This prevents lazy tween initialization or remounts from leaving a letter hidden or shifted.
- Revert owned animations/triggers on unmount, text changes, or reduced-motion changes. Reduced motion shows normal readable text. Remove the previous whole-panel entrance animation to avoid stacking two effects.

Validation: TypeScript/Vite production build; desktop and 390px browser checks for staggered progression, reverse scrolling, initial heading visibility, complete final paragraph, repeated info toggles, preserved paragraph sizing, mobile wrapping without horizontal overflow, single accessible text copies, and no browser console warnings/errors.
