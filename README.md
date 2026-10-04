# Dhrex Cañezo portfolio

Portfolio with the original reference-style composition and vertical project stack, restored at the owner's request. Rethink Sans, the refined entry slider, and the flying-photo experience remain. The cursors around the globe and in travel have been removed. See [DIRECTION.md](docs/DIRECTION.md) for the current state and [AUDIT.md](docs/AUDIT.md) for usability fixes.

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
npm run test:flight
npm run test:site
```

The production output is `dist/`. The host must rewrite unknown routes to `index.html` to support direct links to `/about`, `/travel`, and `/project/:slug`. No hosting provider or public deployment is configured at this checkpoint.

## Content and structure

- `src/content.ts`: identity, contact details, five video projects, and local asset paths.
- `src/App.tsx`: one-time entry gate, routing, entry crossfade, project information, and About.
- `src/components/EntryScreen.tsx` and `SlideCommit.jsx`: opening slider adapted from the owner-supplied React Bits source. It appears once per tab session and stays dismissed when returning Home or refreshing. Direct page links retain their destination.
- `src/components/Icon.tsx`: shared Phosphor icon set.
- `src/brand.css`: Rethink Sans brand typography and opening-screen styles. Fonts are self-hosted through Fontsource.
- `src/components/SmoothScroll.tsx`: GSAP ScrollSmoother shared by all routes, with 1.1-second desktop smoothing, a short 0.12-second touch response, route cleanup, and native scrolling for reduced-motion preferences. Fixed controls stay outside the transformed content.
- `src/components/ScrollFloat.jsx`: owner-supplied React Bits character reveal for each project’s info headings and paragraphs, with accessible text and reduced-motion support.
- `src/components/Carousel.tsx`: vertical project stack with wheel, vertical drag, arrow-key, and dot controls.
- `src/components/ProjectVideo.tsx`: click-to-play native video controls, muted by default, inline playback, and retry feedback. Videos stream from the owner-supplied R2 URLs. Poster frame provenance is in `public/assets/projects/SOURCE.md`.
- `src/components/Travel.tsx`: continuous flight, scroll acceleration, and click-anywhere return.
- `src/workFrames.ts`: 20 screenshots from the five supplied videos. They shuffle on entry and get new positions/sizes when they recycle offscreen. Source frame timestamps are listed in `public/assets/work-frames/SOURCE.md`.
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

The current globe is `globe-relief-v3.blend`, with geographic land relief and an editable mesh-reduction modifier. Its Draco-compressed GLB is about 231 KB. The retained, currently unused cursor source is `cursor-v2.blend`: a beveled, stemless arrowhead using the aircraft’s original base color (.72, .72, .69) and roughness (.6). The original aircraft is retained as a material reference. The browser provides globe rotation and continuous photo flight. The original smooth-sphere blockout is retained for reference.

## Sound

The supplied Botanica folder was found and is available for later sound selection. No audio files have been copied into this repository and audio is disabled in `src/content.ts`.

## Constraints

- Do not use Higgsfield credit-consuming generations.
- Preserve the restored reference-style layout with the requested typography, opening slider, and cursor flight refinements.
- The five supplied videos, contact links, and biography are the owner's supplied content.
- The world gallery uses screenshots from the owner-supplied videos. Legacy reference travel assets are unused.
