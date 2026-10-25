# Portfolio design direction

Reference: https://elenagonci.com/ — inspected on October 4, 2026.

This is a locally authored specification derived from the rendered reference, not a downloaded document from its author. The public `/design.md` URL returned 404.

## Direction

An airy desktop-inspired portfolio: light surfaces, inset button highlights, floating frosted navigation, clear typography, and small blue accents. Keep Dhrex Cañezo’s work, opening slider, and content. Use the phone composition at every screen size, with desktop-appropriate proportions. The world experience and globe were retired on October 15, 2026.

## Tokens

- Canvas: `#f7f8fa`; surfaces: white through `#fcfcfd`.
- Text: `#202329`; secondary text: `#666c76`.
- Accent: `#2563bb`; primary controls use a `#71aaf1` to `#397bd6` gradient with white icons.
- Borders: subtle cool gray, approximately 8–12% opacity.
- Surface shadow: `0 18px 50px #18233312, 0 2px 5px #18233306`.
- Radii: 15–18px buttons, 20px content cards, 23–26px docks.
- Retain the owner’s chosen Rethink Sans. Identity headings use 650 weight; body uses 450; labels use 500–600.

## Components

- Navigation: compact translucent dock, 7px padding and 6px gaps. Blue for opening About and moving to the next project; neutral controls elsewhere. Keep icon-only actions and descriptive accessible labels.
- Project media: preserve full aspect ratio, dark video framing, and selected still compositions. Add soft elevation without altering thumbnail colors.
- Project descriptions: white cards with generous responsive padding.
- About: a desktop-window surface with a quiet title bar, decorative traffic-light dots, and the supplied biography. Dots are not interactive controls.
- Entry: a pale recessed slider track and blue right-arrow icon, retaining the existing verification and welcome labels.

## Behaviour and accessibility

Preserve current scrolling, transitions, keyboard navigation and reduced-motion support. Keep mobile controls at least 44px. Avoid adding music, weather widgets, invented achievements or unrelated desktop apps. All biography and project text stays selectable; all stills have alt text and intrinsic dimensions.

## Implementation

Theme tokens and surface styles live in `src/desktop-theme.css`. The final responsive composition lives in `src/responsive-layout.css`, imported last. The About window markup lives in `src/App.tsx`. This keeps the applied theme easy to review and revise independently from the existing motion and routing.

## Editorial refinements

Secondary reference: https://matthieugivelet.com/ — inspected on October 4, 2026.

Adapt its restrained numbering and ruled information hierarchy: a small current/total project index above each title, a frame count beside the gallery heading, and numbered discipline rows separated by fine rules. Preserve the existing rounded surfaces, blue controls, and Rethink Sans rather than adopting the reference’s oversized masthead or global navigation.

Still images use the existing one-time editorial reveal (18px vertical travel and opacity, 650ms with a short stagger). Reduced motion leaves them static; readable content is the default, and observers and animations are cleaned up on navigation.

## Gallery navigation

Reference: https://noahlesage.com/ (Ringer Studio) — inspected on October 4, 2026. Its gallery pairs a dominant image with a clear project selector. Adapt this as a compact numbered index alongside the existing card carousel: 44px targets, a faint blue current-project marker, and project-name labels on mouse hover or keyboard focus. Keep touch browsing uncluttered and preserve wheel, drag, and keyboard navigation. Do not adopt its oversized masthead, custom cursor, or full-screen rectangular gallery.

## Selective color emphasis

Reference: https://www.zeynapp.co.uk/ — inspected on October 4, 2026. Adapt its selective color emphasis and small supporting project labels using the existing blue: highlight the supplied “Motion Designer” introduction and the overview heading, with the known video duration alongside it. The duration appears only in the first overview, and the heading row wraps on narrow screens. Keep Rethink Sans, current scale, and the light dock; the reference’s magenta, condensed all-caps typography, and full-screen menu are not part of this direction.

## Next-project preview

Reference: https://pensatori-irrazionali.com/ — inspected on October 5, 2026. Its case studies end with an image-led handoff to the next project. Adapt that concept into a compact thumbnail and title attached to the existing next arrow, visible on desktop hover or keyboard focus. Keep the control icon-only at rest. The preview is pointer-reachable, dismissible with Escape, and uses a local poster image without starting video or sound. It sits above the dock on every screen size for keyboard users and disables transition animation for reduced motion. Preserve the current quiet layout rather than adding oversized marquees or automatic scroll-to-next navigation.

## Tactile control feedback

Reference: https://tryclico.com/ — inspected on October 5, 2026. Its pale layered navigation and inset control treatment fit the existing dock. Refine hover feedback through border and shadow changes; pressing a control uses an inset shadow without scaling its hit area or icon. Successful email copying shows a Phosphor checkmark and a compact frosted confirmation for four seconds. Clipboard failures continue to display the address instead of falsely reporting success. The confirmation sits above the mobile dock and wraps within the viewport. Preserve the current typeface and page composition.

## Interface audio

Optional, muted by default. The Sound control remembers the choice for the current tab session. Three quiet, short cues from the supplied Botanica v4 library mark carousel/social selection, page navigation, and successful entry/email copying. Load clips only on the first enabled interaction. Play one cue at a time; throttle repeated selection sounds. Stop audio when the page is hidden or a project video starts, and suppress interface cues while video is playing. Never attach sound to hovering, continuous scrolling, or continuous animation. Mobile places the toggle above the bottom navigation; entry places it at the top right. Source details live in `public/assets/audio/SOURCE.md`.

## Shared phone and desktop composition — October 15, 2026

- Center the identity above the featured project. The navigation dock stays centered at the bottom on every device, outside transformed scrolling content.
- Keep the square cover, numbered project selector, rounded surfaces, existing typeface and blue accents. Desktop enlarges the cover up to 460px, while accounting for shorter windows and clear space around the header and dock.
- Project pages use a centered header and wide video column, with static overview text below. Size the column against both viewport width and height so the first video fits comfortably on normal desktop screens. Keep next-project and minimise actions in the bottom dock.
- About begins immediately below the identity. Wide screens put the biography and disciplines side by side in one window; narrow screens stack them. No empty globe stage.
- Remove the world entry point and runtime, including the opening screen’s 3D preloading. Legacy `/travel` links resolve to `/about` with history replacement. The production bundle contains no Three.js or model chunk.

## Clean media revision — October 16, 2026

This revision supersedes the square cover, numbered selector, project index, duration labels, frame headings, and divider rules described above. Covers are image-only 16:9 rectangles with no title, play badge or runtime overlay. Browse using wheel, swipe and arrow keys. Project pages retain their title and category but omit selected-work numbering, running-time metadata and selected-frame headings/counts. Use whitespace instead of divider lines.

The video player uses a separate light control strip with rounded Phosphor play/pause, mute and fullscreen buttons, a blue seek slider and compact elapsed time. No dark control gradient covers the picture. Playback starts muted; errors offer retry and keyboard controls remain available. Docks do not fade on navigation or social-menu clicks; page content can retain its existing transition.

## Navigation morphing — October 26, 2026

Keep one persistent navigation dock outside the changing page content. Opening socials or entering About expands its shape; returning home contracts it. Use an interruptible, restrained spring for layout changes and a small rotation/scale settle when an icon changes. Preserve fixed-size icons, rounded corners, and the centered bottom anchor. Never animate dock opacity or replay the morph when moving between projects with the same controls.

Reduced motion disables the layout and icon animation. Escape closes the home social menu and restores focus to its toggle. Keep next-project previews and email confirmation behaviour. On the narrowest phone layouts, use 60px buttons so all four controls retain even padding.

### Softer motion and typography refinement

Use a near-critically damped dock spring (stiffness 220, damping 30, mass 1). Social buttons scale in over 260ms and out over 160ms, leaving the layout immediately on exit so the dock can contract concurrently. Exiting buttons are hidden from assistive technology and disabled. Icon changes use a smaller 6-degree, 6% settle. Keep dock opacity constant and disable these transitions for reduced motion.

Give identity and project headings slightly looser tracking (-.025em) and a 1.16 line height. The role is smaller than the name. About body copy uses 18px on desktop and 17px on phones, with 1.65 leading and normal tracking; the introduction stays larger. Project descriptions use 20px/18px with the same leading and a 62-character maximum reading measure. Use 13px semibold section labels, balanced heading wraps, and consistent gaps between labels, paragraphs, and discipline rows. Preserve Rethink Sans and the existing light surfaces.
