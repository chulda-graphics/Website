# Reference comparison — October 4, 2026

Compared against the live reference and the supplied 65-second screen recording. Project and gallery media remain placeholders, so this is a layout and interaction comparison, not a claim of complete pixel parity.

## Measured desktop corrections

Measurements at 1280 × 720, in CSS pixels:

| Element | Reference | Previous foundation | Updated |
| --- | --- | --- | --- |
| Heading left | 228.44 | 228.48 | 228.44 |
| Heading top | 282.01 | 272 | 282.00 |
| Heading size | 28.44 | 32 | 28.44 |
| Navigation left | 228.44 | 172.48 | 228.44 |
| Navigation top | 389.99 | approximately 394 | 390.00 |
| Navigation button size | 48 × 48 | 54 × 54 | 48 × 48 |
| Active project card | 297.77 × 305.77 | 335 × 345 | 297.77 × 305.77 |
| Active card left/top | 753.79 / 207.11 | 734.90 / 187.50 | 753.78 / 207.11 |

The exact reference Suisse Intl Book webfont is now bundled, with its source recorded under `public/assets/fonts/`. Desktop measurements scale with viewport width. Mobile has an independent layout.

## Motion and geometry improved

- Replaced static decorative stacks and crossfading cards with a continuous depth carousel. Actual project cards fold into the upper/lower stack with a damped spring. Wheel, drag, arrow-key, and pagination inputs share the same state.
- Added shared-element transitions for the selected project card and heading using the browser View Transition API. Unsupported browsers use direct navigation; reduced-motion mode skips the transition.
- Corrected project media aspect ratios and responsive corner radii.
- Replaced the smooth sphere with locally modeled geographic relief, retaining an editable Blender source and non-destructive web-mesh reduction modifier.
- Added the small orbiting aircraft and pointer response on the globe. Adjusted the camera and lighting for the pale reference appearance.
- Replaced the static travel composition with scroll/drag-driven image planes at varying depths, aircraft banking, and changing airport-code letters.
- Corrected a mobile layer-order issue where stack fades covered the heading/controls, and prevented project text from sitting beneath the fixed controls.
- Kept the selected project when returning home, including after next-project navigation.

## Local 3D result

`globe-relief-v3.glb` is 230,940 bytes. The first detailed draft was 36,724,300 bytes. Web-mesh reduction and Draco compression reduced the download by over 99%. Decoder files are hosted locally. Earlier drafts were retained in ignored scratch storage, not shipped to the repository.

Land geometry: [Natural Earth public-domain 1:110m land](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson). Modeled and rendered through the local Higgsfield Blender MCP, using Blender 5.2.1 LTS. No Higgsfield cloud generation or credit-consuming action was used.

## Verification

- TypeScript and production build pass.
- Measured matching desktop typography, control placement, and card bounds in the browser.
- Checked pagination, drag selection, project opening/closing, project information, About, GLB loading, and travel scrolling.
- Checked mobile at 390 × 844: home and project information have no horizontal overflow; dragging changes the active card without opening it.
- Viewed local Cycles renders and the browser render of the detailed globe.
- Corrected a travel perspective issue discovered during browser QA.

## Still different

- Portfolio media and travel imagery are placeholders; name, biography, and contact details await the owner's content.
- The reference's custom rendering, exact gesture response, scroll timing, and travel camera choreography are approximated, not reproduced frame-for-frame.
- Globe relief is derived from geographic polygons; it does not duplicate the reference's detailed terrain shader. The aircraft remains simplified.
- No sound effects have been enabled.

The earlier `FOUNDATION.md` is a historical checkpoint. This document describes the current comparison pass.
