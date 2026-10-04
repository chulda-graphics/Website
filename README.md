# Chulda Graphics portfolio

Portfolio recreation in progress, based on [gabrielbeaugonin.com](https://www.gabrielbeaugonin.com/), with replaceable project content. **This is not yet a complete exact match.** See [AUDIT.md](docs/AUDIT.md) for the latest usability fixes and verification, and [COMPARISON.md](docs/COMPARISON.md) for earlier reference comparisons. The original foundation checkpoint is documented in [FOUNDATION.md](docs/FOUNDATION.md).

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
- `src/App.tsx`: one-time entry gate, routing, shared card transitions, project information, and About.
- `src/components/EntryScreen.tsx` and `SlideCommit.jsx`: opening slider adapted from the owner-supplied React Bits source. It appears once per tab session and stays dismissed when returning Home or refreshing. Direct page links retain their destination.
- `src/components/Icon.tsx`: shared Phosphor icon set.
- `src/brand.css`: Rethink Sans brand typography and opening-screen styles. Fonts are self-hosted through Fontsource.
- `src/components/SmoothScroll.tsx`: GSAP ScrollSmoother shared by all routes, with 1.1-second desktop smoothing, a short 0.12-second touch response, route cleanup, and native scrolling for reduced-motion preferences. Fixed controls stay outside the transformed content.
- `src/components/ScrollFloat.jsx`: owner-supplied React Bits character reveal for each project’s info headings and paragraphs, with accessible text and reduced-motion support.
- `src/components/Carousel.tsx`: continuous card stack and gesture controls.
- `src/components/Travel.tsx`: continuous flight, scroll acceleration, and click-anywhere return.
- `src/travelPhotos.ts`: reference travel imagery; replace with the owner's photographs. Sources are listed in `public/assets/travel/SOURCE.md`.
- `src/components/Model.tsx`: lazy-loaded Three.js viewer for locally exported GLBs.
- `src/styles.css`, `src/refinements.css`, `src/scale.css`: measured layout, responsive behavior, and reduced-motion handling. Current scale is 1× to match the reference.
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
node scripts/blender-local.mjs cursor
node scripts/blender-local.mjs globe-relief-v4
```

The build refuses to overwrite existing models or Blender files. Inspect and save a new revision before rebuilding. Each execution uses a separate background Blender session and does not modify unsaved work in the desktop application.

The current globe is `globe-relief-v3.blend`, with geographic land relief and an editable mesh-reduction modifier. Its Draco-compressed GLB is about 231 KB. The active travel and orbiting model is `cursor.blend`: a beveled, extruded pointer using the aircraft’s original base color (.72, .72, .69) and roughness (.6). The original aircraft is retained as a material reference. The browser provides globe rotation, the orbiting cursor, and travel banking. The original smooth-sphere blockout is retained for reference.

## Sound

The supplied Botanica folder was found and is available for later sound selection. No audio files have been copied into this repository and audio is disabled in `src/content.ts`.

## Constraints

- Do not use Higgsfield credit-consuming generations.
- Preserve the reference layout and interactions, with the owner-requested Rethink Sans, Phosphor icons, opening slider, and extruded cursor.
- Project content may be placeholder content.
- Work in foundation-first stages; do not describe this checkpoint as an exact match.
