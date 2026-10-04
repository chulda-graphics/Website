# Opening interaction and brand update

- Entry uses the React Bits SlideCommit JSX/CSS supplied by the owner, adapted to Phosphor icons and Motion's callback-based derived values.
- Label: “Slide to start”; handle: Phosphor AirplaneTilt. Partial pointer drags spring back. A completed drag, Enter, Space, End, or successive arrow steps opens the site.
- Completion warms the Three.js module and waits for fonts (bounded at four seconds); it does not use a fake loading percentage. The success capsule finishes before a short fade.
- `sessionStorage` key `chulda:entered:v1` records entry per tab session. Returning Home, route changes, and refresh do not replay it. A fresh tab starts with the slider. Direct route destinations are preserved. Storage-disabled browsers retain completion until reload.
- Brand font: self-hosted Rethink Sans Variable from Fontsource, weights 400–800. Existing type sizes and layout remain intact.
- All UI icons use the Phosphor React package, including navigation, social links, loader states, placeholder external arrows, and the scroll hint. Decorative flight paths and pagination dots are not icons.
- Cursor generated in a separate local Blender session through the installed Higgsfield Blender MCP. No cloud generation or credits. The aircraft's porcelain material values are preserved. Editable source: `assets/blender/cursor.blend`; script: `scripts/cursor.py`; runtime model: `public/assets/models/cursor.glb` (20 KB).
- Both the travel scene and the globe orbit now use the cursor. Narrow trails follow its stem; continuous motion, scroll acceleration, and click-anywhere return remain.

## Validation

Production TypeScript/Vite build and flight simulation checks pass. Browser checks cover partial/full pointer slide, fresh-tab entry, Enter completion, direct `/travel` routing, travel→About→Home without re-entry, same-tab reload, 390 px entry layout, computed Rethink Sans, visible cursor/trails, and no browser console errors. Observed flight speed increases from 95 to 211 on scrolling. Visual previews are saved alongside this repository in `../brand-entry/`.
