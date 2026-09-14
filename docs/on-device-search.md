# On-device change review

The Change brief helps a reviewer find a recorded difference between two submitted handoffs. Its output remains the original version text. It does not generate a clinical summary, recommend treatment, acknowledge a version or edit a record.

## Interaction

A named floating AI entry stays available in the working interface, including the first draft. It opens local mode directly. If there is no readable version pair, the panel explains the requirement and offers an isolated sample in a separate tab. The model still needs an explicit Load model & search action. The launcher is hidden while a dialog or a form field has focus; the case-study phone embeds omit it.

The guided mode opens immediately with three prepared matches: ownership, expected time and an added shift note. It is explicitly labelled as a prepared demonstration with no model running.

The optional local mode accepts an English question. A quantized all-MiniLM-L6-v2 embedding model compares its meaning with indexed change records. The application orders the matches and renders their original before/after values. The first match is expanded; other matches can be inspected. A question without a sufficiently close source match produces no answer.

The model weights are 22,972,370 bytes, about 23 MB. With the JavaScript and WASM runtime, the first download is approximately 50 MB. Loading begins only after the local-search button is pressed. Files come from Hugging Face and jsDelivr. The application passes questions and change records to a local Web Worker; it has no inference server or API credential.

The worker runs the WASM backend on one thread, so WebGPU and cross-origin isolation are not required. This is a compatibility choice, not a guarantee of speed on every device. Heavy computation remains outside the UI thread.

## Scope and controls

- The application calculates differences from two submitted snapshots. Working drafts and post-handoff work logs are excluded.
- Incoming colleagues must have opened both versions, and both must be addressed to them. The outgoing colleague can inspect a recipient change.
- A fingerprint binds the index and result to the exact version pair and change records. An old result is not presented as current after a scope change.
- At most 64 changes are indexed. Each matching document is capped at 1,800 characters; the full original record remains visible in its source card.
- Similarity scores order results. The cutoff is a prototype heuristic; scores are not shown as confidence, risk or clinical priority.
- A worker is created only by an explicit search. Subsequent questions reuse the loaded model and the same index when the source pair is unchanged.
- Stop terminates the worker. Closing an active brief or switching to the guided mode also stops an active run. Unload releases the worker while retaining visible results.
- Model removal unloads the worker and deletes matching model files from the origin’s Cache Storage when permitted. Shared runtime assets can remain cached. Browser site-data controls remain available.
- Loading has a two-minute deadline and a retryable error state. No automatic fallback sends records to an external inference service.
- Offline reuse depends on browser caching, the service’s hosting and retained runtime assets. First use requires a connection. Full offline support is not claimed.

## Browser checks

Development checks used the real quantized model in Chromium, including repeat queries with a loaded worker:

| Question | Observed result |
| --- | --- |
| Who took over the family update? | Room 414’s owner change ranked first: Jordan Lee → Taylor Brooks. |
| Which deadline has moved? | Room 412’s expected-time change ranked first: 08:15 → 08:45. |
| What did the day team request? | The added room 419 note ranked first in the application. |
| Who is responsible for the family conversation? | Room 414’s owner change ranked first for this paraphrase. |
| How is the weather in Tokyo? | No close source match in the application. |

These are bounded development examples, not an accuracy benchmark or clinical validation. Device performance, broader query phrasing, physical iPhone/Safari and VoiceOver still need evaluation.

The automated tests cover readable version pairs, draft exclusion, identity changes, source identifiers, input escaping, stale results, explicit model startup, repeated requests, cancellation, failure and deadlines. Existing handoff, recovery, routing and contrast checks also pass.

## Dependencies and notices

The core app and guided mode remain buildless and self-hosted. Local search imports its runtime after opt-in:

| Asset | Pinned source | License |
| --- | --- | --- |
| Transformers.js | `@huggingface/transformers@3.8.1/dist/transformers.min.js` on jsDelivr | Apache-2.0 |
| ONNX Runtime Web | Distributed WASM/JS assets referenced by that pinned Transformers.js build | MIT, with upstream third-party notices |
| MiniLM ONNX weights | `Xenova/all-MiniLM-L6-v2`, revision `751bff37182d3f1213fa05d7196b954e230abad9`, `onnx/model_quantized.onnx` | Apache-2.0 |

Upstream sources: [Transformers.js](https://github.com/huggingface/transformers.js), [ONNX Runtime](https://github.com/microsoft/onnxruntime), [ONNX model](https://huggingface.co/Xenova/all-MiniLM-L6-v2), [original sentence-transformers model](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). Assets are fetched at runtime rather than vendored into this repository; upstream licenses and notices apply.
