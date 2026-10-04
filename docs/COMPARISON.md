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

## Second recording: continuous flight and scale correction

Compared the 19.6-second plane recording with live reference screenshots at 1440 × 900 and 1874 × 1005. Saved before/after and reference screenshots alongside the repository in `outputs/comparison-flight/`.

| Measurement | Original | Before this pass | After |
| --- | --- | --- | --- |
| Airport controls width at 1874 | 179.58 px | 138 px | 179.58 px |
| Return group top at 1874 × 1005 | 795.49 px | 831.03 px | 795.48 px |
| Return group bottom | 893.09 px | 909.53 px | 893.09 px |
| Active card at 1440 | 335 × 344 px | 335 × 344 px | unchanged |
| Nearest folded card at 1440 | 302.33 × 44.02 px | approximately 299 × 30 px | 302.33 × 44.02 px |
| Nearest folded card top | 790.49 px | approximately 795 px | 790.49 px |
| About navigation left at 1440 | 257 px | 199 px | 256.99 px |

- Enlarged the aircraft canvas from fixed 180 × 120 px to viewport-scaled 260 × 180 reference units. Its visible wingspan is approximately 180 px at the recording's viewport width, compared with approximately 93 px before.
- Made travel advance continuously at 95 scene units/second. Wheel, arrow keys, and drag provide a forward speed boost that decays back to cruise. The old implementation only eased toward a scroll destination, then stopped.
- Added smooth pointer steering, gentle banking, and faint wingtip trails. Scaled image sizes, depth, and perspective consistently across desktop widths; introduced portrait frames among the landscape placeholders.
- Matched the reference stack's shared 1500 px perspective, 0.8 scale, ±98° rotation, and 35-unit spacing. Reduced the edge fade so the folded cards remain visible.
- Kept the main heading at the measured 32 px and the matching 335 × 344 px active card. The globe's rendered diameter was already close to the reference.
- Verified cruise at rest, a live scroll boost above 1100 units/second, touch-drag boost above 800, and the return button. Mobile travel has no horizontal overflow at 390 × 844.
- Added `npm run test:flight` to CI: continuous idle travel, acceleration, recovery to cruise, equal distance at 30/60/120 Hz, and static idle/manual exploration with reduced motion.

The simplified plane geometry and placeholder imagery still differ from the original. Flight speed is tuned from the recording, not measured from the reference's internal camera. No credit-consuming Higgsfield operation was used.
