# Chulda Graphics portfolio

Portfolio with a quiet, single-card horizontal project gallery, Rethink Sans typography, an opening slider, and a porcelain cursor flight experience. The original reference exploration has evolved into a distinct layout at the owner's request. See [DIRECTION.md](docs/DIRECTION.md) for the current design and checks, [AUDIT.md](docs/AUDIT.md) for earlier usability fixes, and [COMPARISON.md](docs/COMPARISON.md) for historical reference comparisons.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run build
npm run preview
```

The production output is `dist/`. The host must rewrite unknown routes to `index.html` to support direct links to `/about`, `/travel`, and `/project/:slug`. No hosting provider or public deployment is configured at this checkpoint.

## Content and structure

- `src/content.ts`: identity, contact details, four placeholder projects, and local asset paths.
- `src/App.tsx`: one-time entry gate, routing, entry crossfade, project information, and About.
- `src/components/EntryScreen.tsx` and `SlideCommit.jsx`: opening slider adapted from the owner-supplied React Bits source. It appears once per tab session and stays dismissed when returning Home or refreshing. Direct page links retain their destination.
- `src/components/Icon.tsx`: shared Phosphor icon set.
- `src/brand.css`: Rethink Sans brand typography and opening-screen styles. Fonts are self-hosted through Fontsource.
- `src/components/SmoothScroll.tsx`: GSAP ScrollSmoother shared by all routes, with 1.1-second desktop smoothing, a short 0.12-second touch response, route cleanup, and native scrolling for reduced-motion preferences. Fixed controls stay outside the transformed content.
- `src/components/ScrollFloat.jsx`: owner-supplied React Bits character reveal for each project’s info headings and paragraphs, with accessible text and reduced-motion support.
- `src/components/Carousel.tsx`: single-card horizontal gallery with wheel, swipe, arrow-key, and small dot controls.
- `src/components/Travel.tsx`: continuous flight, scroll acceleration, and click-anywhere return.
- `src/travelPhotos.ts`: reference travel imagery; replace with the owner's photographs. Sources are listed in `public/assets/travel/SOURCE.md`.
- `src/components/Model.tsx`: lazy-loaded Three.js viewer for locally exported GLBs.
- `src/styles.css`, `src/refinements.css`, `src/scale.css`: measured layout, responsive behavior, and reduced-motion handling. The current composition and typography overrides are in `src/direction.css`.
- `assets/blender/`: editable `.blend` sources and provenance.
- `public/assets/models/`: browser-ready GLBs.
- `scripts/`: repeatable local Blender build scripts.

Contact links remain unconfigured and show an honest coming-soon message. No fabricated email address or third-party social account is used. The name and title are temporary pending the owner's content.

## Local 3D workflow — no generation credits

The globe, aircraft blockout, and extruded cursor were created with Blender 5.2.1 LTS using the **local Higgsfield use Blender MCP** (`fnf-blender-mcp` 0.2.2). The script communicates over local stdio and does not call cloud generation services.

Install the connector in a persistent tooling directory, then set:

```sh
export HIGGSFIELD_BLENDER_SERVER="/absolute/path/to/fnf-blender-mcp/dist/index.js"
export BLENDER_EXECUTABLE="/Applications/Blender.app/Contents/MacOS/Blender"
node scripts/blender-local.mjs globe
node scripts/blender-local.mjs aircraft
node scripts/blender-local.mjs cursor-v3
node scripts/blender-local.mjs globe-relief-v4
```

The build refuses to overwrite existing models or Blender files. Inspect and save a new revision before rebuilding. Each execution uses a separate background Blender session and does not modify unsaved work in the desktop application.

The current globe is `globe-relief-v3.blend`, with geographic land relief and an editable mesh-reduction modifier. Its Draco-compressed GLB is about 231 KB. The active travel and orbiting model is `cursor-v2.blend`: a beveled, stemless arrowhead using the aircraft’s original base color (.72, .72, .69) and roughness (.6). The original aircraft is retained as a material reference. The browser provides globe rotation, the orbiting cursor, and travel banking. The original smooth-sphere blockout is retained for reference.

## Sound

The supplied Botanica folder was found and is available for later sound selection. No audio files have been copied into this repository and audio is disabled in `src/content.ts`.

## Constraints

- Do not use Higgsfield credit-consuming generations.
- Keep the restrained design language, Rethink Sans, Phosphor icons, opening slider, and continuous flight; the layout should be distinct from the original reference.
- Project content may be placeholder content.
- Travel photographs remain reference assets and should be replaced with owner-provided imagery before launch.
