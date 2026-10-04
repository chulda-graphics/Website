# Portfolio design direction

Reference: https://elenagonci.com/ — inspected on October 4, 2026.

This is a locally authored specification derived from the rendered reference, not a downloaded document from its author. The public `/design.md` URL returned 404.

## Direction

An airy desktop-inspired portfolio: light surfaces, inset button highlights, floating frosted navigation, clear typography, and small blue accents. Keep Dhrex Cañezo’s existing routes, work, globe, opening slider, flying gallery, and content.

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
- Globe caption: a small translucent pill.
- Entry: a pale recessed slider track and blue right-arrow icon, retaining the existing verification and welcome labels.

## Behaviour and accessibility

Preserve current scrolling, transitions, keyboard navigation and reduced-motion support. Keep mobile controls at least 44px. Avoid adding music, weather widgets, invented achievements or unrelated desktop apps. All biography and project text stays selectable; all stills have alt text and intrinsic dimensions.

## Implementation

Theme tokens and surface styles live in `src/desktop-theme.css`, imported last. The About window markup lives in `src/App.tsx`. This keeps the applied theme easy to review and revise independently from the existing motion and routing.

## Editorial refinements

Secondary reference: https://matthieugivelet.com/ — inspected on October 4, 2026.

Adapt its restrained numbering and ruled information hierarchy: a small current/total project index above each title, a frame count beside the gallery heading, and numbered discipline rows separated by fine rules. Preserve the existing rounded surfaces, blue controls, and Rethink Sans rather than adopting the reference’s oversized masthead or global navigation.

Still images use the existing one-time editorial reveal (18px vertical travel and opacity, 650ms with a short stagger). Reduced motion leaves them static; readable content is the default, and observers and animations are cleaned up on navigation.
