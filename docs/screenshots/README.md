# Product captures

The images show fictional records in the implemented browser prototype. Device frames are CSS illustrations, not a claim of native iOS deployment. The portfolio phone captures use a 390 px app viewport and are saved at 848 × 1776 px. `scripts/capture-frame.html` contains the reusable frame layout. `node scripts/prepare-captures.mjs` prepares local capture pages under `/capture-preview/` for the development server; the build removes those pages. Browser captures use a 2× canvas, followed only by cropping of the surrounding canvas. Captures are cropped for presentation; interface content is not repainted or redrawn.

| Folder or file | Content |
| --- | --- |
| `portfolio/01-prepare.jpg` through `07-history.jpg` | The seven-step handoff and incoming-work sequence |
| `portfolio/08-next-action.jpg` | The nearest open follow-up above a patient note |
| `portfolio/flow-overview.jpg` | The same seven captured states in one composition |
| `brief/local-desktop.jpg`, `brief/local-mobile.jpg` | Results from the real local semantic model |
| `brief/case-ai.jpg` | The dedicated on-device AI case-study section |
| `access/` | Visible AI entry and the responsive case-study hero |
| `notifications/` | The workspace bell and the colleague-specific inbox at 390 px |
| `fields/` | Shared owner menu and phone presentation |
| `readability/` | Reading-scale and alignment comparisons |
| `case-composition.jpg`, `case-now.jpg` | Case-study phone compositions |

The README cover in `../media/overview.jpg` arranges three existing phone captures with project typography. It does not invent app screens. Its reproducible layout is in `../media/overview.html`.

The 35-second video in `dist/media/` presents seven still captures with editorial holds, fades and optional English captions. It is labelled as an edited walkthrough and does not claim live interaction timing. Regenerate it with `python scripts/make-walkthrough.py` when Pillow and FFmpeg are available.
