# Chulda design direction — 4 October 2026

The owner has replaced the exact-reference goal with a distinct composition that retains the restrained visual language and continuous flight experience.

## Current design

- A top masthead and horizontal project gallery replace the centred identity / vertical stack composition. Wheel scrolling, horizontal dragging, arrow keys, numbered selectors, and neighbouring cards change the selected project.
- Rethink Sans uses semibold brand/project headings (650), a medium-bold gallery heading (600), medium labels (500–550), and lighter supporting copy (450).
- About opens with an editorial introduction and a two-column discipline list. Project titles sit at the upper left, with wider media on the right and a separate return control.
- The cursor is now a four-point stemless arrowhead with a recessed tail. It was rebuilt locally in Blender through the existing Higgsfield Blender bridge, with zero generation credits. The travel model lies in the horizontal flight plane; the orbiting model shares the new geometry. Porcelain base colour and roughness are unchanged.
- Travel keeps continuous movement, scroll acceleration, images and contrails. The model is centred vertically. Airport-code boxes and scroll/drag guidance are removed; “Click anywhere to return” remains.
- The entry slider is 264×52px on desktop and shrinks for narrow screens. Its filled Phosphor airplane turns from northwest toward the right as the slider moves. The helper sentence is removed; keyboard interaction remains available.
- The entry screen uses Motion AnimatePresence to remain mounted while fading over the newly mounted site. The site also fades in. Reduced-motion preferences shorten the entry transition and suppress the site animation. Documentation consulted: https://motion.dev/docs/react-animate-presence.

## Validation

Production build and flight checks pass. Browser checks covered desktop, tablet, and small/tall phone layouts, horizontal wheel movement and drag, arrow-key selection, neighbouring-card selection, project opening/info, click-anywhere return, and keyboard/drag entry. Slider geometry measured 264×52px; 30% keyboard progress changed the icon rotation. Travel measured a 95 cruise speed and increased speed after scrolling; removed footer selectors are absent. No browser errors or warnings were captured in the tested flows. Entry remains dismissed on return navigation.

The first sandboxed Blender startup crashed; the local build completed with normal process access. No cloud generation was used. The editable model is `assets/blender/cursor-v2.blend`, exported to `public/assets/models/cursor-v2.glb`.

## Content still to replace

Projects, biography, contact destinations, and reference travel photographs remain placeholder/reference content. A distinct layout does not establish rights to third-party photographs; supply owner-controlled imagery before publishing. No legal clearance is claimed.
