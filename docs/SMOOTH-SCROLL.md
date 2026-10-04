# GSAP smooth scrolling

Uses GSAP ScrollSmoother and ScrollTrigger with one wrapper/content pair shared across every portfolio route. The opening screen mounts before the scroller. Desktop catch-up duration is 1.1 seconds, touch is 0.12 seconds, and scroll normalization/parallax effects are off. The implementation follows https://gsap.com/docs/v3/Plugins/ScrollSmoother/.

The Home carousel and Travel gallery consume wheel/drag input for their existing animated interactions. They remain viewport scenes, while About and project content use the smoothed native document scrollbar.

Fixed project headings, close buttons, mobile project controls, and mobile navigation use React portals outside the transformed content. Responsive headings remain in document flow on mobile. Browser back/forward and internal route changes rebuild the owned scroller, reset to the top, and clean up old listeners/styles. GSAP observes content resize; font completion also refreshes measurements. Reduced-motion changes switch to native scrolling without losing the current position.

Validation: production build, existing flight tests, desktop About scroll catch-up, project controls staying fixed across a 720px scroll, content-height refresh after changing project information, 390px project/About layouts with pinned controls, Home carousel wheel selection without document movement, and navigation after scrolling. The one-time entry remains dismissed during route changes.

## About globe correction

The reference About globe is fixed at the vertical center on desktop. The local globe now uses the same viewport-layer portal as fixed controls, with `position: fixed` above 700px; its coordinates stay unchanged while ScrollSmoother moves the biography. On narrow screens it stays in the scrolling content so it does not overlap the biography. At 1280×720, the local globe container remained at x=835.98, y=182.22 before and after 504px of scrolling; the reference measured x=835.56, y=182.22.

The globe orbit loads the shared `assets.cursor` GLB (also used in Travel), centered and normalized to 0.28 scene units. Its visible face follows the projected orbit tangent instead of inheriting the old aircraft orientation. The initial pose is applied even with reduced motion enabled. The existing porcelain material is unchanged. Desktop scrolling, mobile flow, travel entry/return, browser console, and production build were checked.
