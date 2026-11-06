# Verification

## Automated checks

`npm run check` validates the application modules and runs 99 checks covering:

- Handoff state: required owners and recipients, transport boundaries, immutable submitted snapshots, clarifications, role restrictions, stale and duplicate acknowledgment rejection.
- Work records: completion and append-only corrections, owner/version restrictions, compatibility across unchanged tasks, malformed history and local persistence.
- View data: patient search, action filtering, draft summaries, complete task-field differences, expected-time groups and scenario-clock bounds.
- Display-name compatibility: generated event labels use the current colleague name while saved patient text is preserved.
- Recovery and routing: unsent-input recovery, stale-dialog rejection, deterministic scenes, query preservation and deployment subpaths.
- Search: readable version pairs, draft exclusion, source identifiers, escaping, stale results, explicit worker startup, cancellation, late-response rejection, failures and deadlines.
- Contrast: 39 defined text/surface pairs across Daylight, Twilight and Amber.

These checks verify bounded behavior and specified color combinations. They do not establish usability, clinical safety or complete accessibility.

## Handoff and incoming work

The browser walkthrough covers assigning a missing owner, selecting Jordan, sending v1, simulating delivery, opening it as the recipient, asking and answering a patient-specific question, and explicitly acknowledging v1. An unanswered question blocks acknowledgment. A later room-419 note produces v2; its difference and separate acknowledgment remain visible alongside v1.

Incoming work was exercised by recording a factual result, inspecting its author/time/source in History and appending a correction that reopens the task. The frozen patient snapshot remained unchanged. Reloading a half-written completion recovered the exact input without recording work. Reloading a scrolled patient view restored its reading position.

Additional checks include patient and owner filters, a new draft action, read-through copying, offline simulation, a prepared dictation ambiguity, competing-edit resolution, larger text, appearance switching and reset. The download control reported a generated text file; actual file retrieval was not verified in the browser harness.

[Seven-step walkthrough and captures →](portfolio-review.md)

## Responsive layout and controls

Working views and forms were inspected at 320, 375, 390, 430, 768 and 1024 px. Document scroll width matched available width, including larger text at 320 px. Standard note text measured 16 px with a 27.2 px line height; larger text measured 19 px with a 33.25 px line height. At 320 px, a work sheet was 296 px wide with 12 px side margins.

Owner fields share a styled combobox with 48 px options. Checks covered pointer selection, saved values, arrow keys, Home/End, typed names, Enter, Escape and Tab. Escape closed the menu without closing its parent dialog. Recovery restored an unsaved selection; Discard input returned to the saved owner. Keyboard focus uses one close-fitting outline.

Native dialogs retained their DOM node through appearance changes. Closing released the background scroll lock and restored focus. Rapid repeated completion taps produced one work event. A downward heading drag dismissed a short sheet. Reduced motion removed transitions; notifications did not shift the reading layout.

The case-study hero was inspected at 320, 390, 430, 768 and desktop widths. Phone frames stayed inside the visual composition with a positive gap before the caption. The video reported a 35-second duration and no media error; closing its disclosure paused playback. It is an edited sequence of still captures, not a frame-rate demonstration.

[Reading and control details →](readability-review.md)

## Local semantic search

The real quantized model was exercised in Chromium. Owner, deadline and added-note questions ranked their expected source first. An owner-question paraphrase also found the expected change. An unrelated weather question produced no close match. Repeated searches reused the worker; model removal reported successful cache deletion. Opening a result selected the correct patient in v2 without acknowledging it.

The brief fit at 320, 390 and 430 px across the three appearances. The current layout shows one closest source first and keeps additional matches collapsed. A completed search moves focus to its result; reduced motion disables the entrance. The owner selector was rechecked at 320 px without horizontal overflow. The first-draft AI entry offered a separate sample tab without replacing the draft. The sample opened in local mode, with loading still awaiting an explicit action. Escape returned focus to the launcher. Its offset updated when the handoff bar wrapped at a narrower width.

[Model, queries, controls and limits →](on-device-search.md)

## Notification inbox

Eleven domain checks cover recipient-specific delivery, questions and replies, read-state recovery, old-version targets, later arrivals after marking all read, malformed inbox preferences and work-completion events. Reading notifications leaves submitted snapshots, transport records, questions and acknowledgments unchanged.

Browser checks inspected the inbox at 320, 375, 390, 430, 768 and 1024 px. The mobile header, unread badge and drawer fit without horizontal overflow. At 320 px, larger text retained 19 px item headings and 17 px detail text. Escape returned focus to the bell. Offline source opening stayed blocked and unread, while local Mark all read remained available. Mark all read retained the three records under All and left v2 unacknowledged. Opening a reply returned to room 412’s conversation in v1.

## Published deployment

The GitHub Pages deployment passed the same checks and build. Browser smoke checks confirmed the project subpath, the case study’s live phone views and an explicit model download on the public origin. The owner-change question returned Jordan Lee → Taylor Brooks from the submitted source pair. No API credential was configured.

## Remaining evaluation

These responsive checks used desktop Chromium viewports. Physical iPhone/Safari, the virtual keyboard, safe areas, VoiceOver and broader assistive-technology behavior remain to be evaluated. No hardware haptics, physical-device frame rate or participant comprehension results are claimed.

A real clinical product would also require institutional protocol mapping, identity, authorization, secure transport and storage. Those systems are outside this browser-local concept. The [participant evaluation plan](validation-plan.md) uses synthetic records and has not been run.
