# SomnaShift — interface decisions

## The working surface

The phone view starts with the outgoing or incoming colleague, a small shift summary and four patients. The task list carries an owner and expected time beside the action. A patient note uses the same Situation, Background, Assessment and Recommendation order on both sides of the handoff.

The incoming view stays empty until a version has been submitted. A version addressed to a different colleague is kept behind a demo role-change prompt. The outgoing draft and submitted information remain separate.

Wide screens put the patient list and detail side by side. Below 900 px, navigation moves to the bottom and a patient opens on its own reading surface. The action bar remains above the navigation; long content has room to scroll clear of both. A back action returns to the patient list.

## Appearance

| Role | Daylight | Twilight | Amber night |
| --- | --- | --- | --- |
| Page | `#f6f1eb` | `#29272a` | `#251f1a` |
| Reading surface | `#fffaf5` | `#343035` | `#302821` |
| Main text | `#342c29` | `#f6eee7` | `#f4e4cc` |
| Secondary text | `#70605a` | `#cfc0b9` | `#d0b99a` |
| Primary action | `#854e40` | `#e5b7a4` | `#e7ba7e` |

All modes are manual choices. They are visual design concepts, without claims about circadian or clinical effects. State labels and icons supplement color. The semantic text/surface pairs are checked numerically at 4.5:1 or better; these checks are a limited contrast check, not a full accessibility certification.

The primary palette pairs porcelain surfaces with warm ink and a copper accent. Twilight uses warm graphite with light clay; Amber night retains warm charcoal. Green is reserved for completion semantics, rather than brand identity. The unboxed mark uses two opposing rounded paths to suggest a shift passing between colleagues. Its stroke follows the appearance accent.

## Typography and controls

Source Sans 3 gives the working interface a readable humanist voice. Newsreader adds an editorial rhythm to the main case-study headline and selected large display text. Both are variable fonts hosted with the app, with their SIL Open Font Licenses included. Body copy stays in one sans-serif family; display serif does not enter patient notes. Scenario times, version numbers and counts use tabular numerals. Text wraps rather than being truncated in the patient and review surfaces. A larger-text setting expands note content and cards.

Spacing follows a small 4 px rhythm, with 8–16 px control radii and 14–18 px primary surfaces. Primary touch actions are at least 44 px high. Compact task toggles have an expanded invisible hit area. Low-risk draft action status can be toggled back; resetting the whole demo requires confirmation.

Native dialogs provide focus containment. Errors are placed inside the active dialog and receive focus. Escape and visible close controls dismiss dialogs. The closing control returns focus to an available opener. New content uses a short 180 ms entry; system reduced-motion preferences remove animations and transitions.

## The product story

The case study uses actual isolated app views in device frames. Its sequence is: communication gap, the two colleagues, preparation checks, version boundaries, three appearances, manually checked dictation, the watch concept, edge cases and evaluation questions. Screens are not participant research or evidence of clinical performance.

The watch keeps a summary and a route back to the phone. Detailed review and acknowledgment remain on the full handoff view. The voice example isolates one ambiguity, so the verification choice is inspectable without relying on a speech service.

## Actions and read-through

The action board lists the same tasks as the patient view, ordered by expected time with completed items last. Status tabs remain visible; owner and text filters open on demand. The compact mobile heading shows the current colleague, so switching perspectives is available without repeating the full handoff role selector. A task edit changes only the outgoing draft. Every changed task field is included in the next version’s difference.

Patient search expands from the patient-list heading and matches a room or name. It leaves the saved handoff untouched. The read-through uses the full draft or exact selected submitted snapshot. Unsent copies are labelled and show outstanding checks; submitted copies include the version and recipient. A structured reading view, clipboard action and plain-text download support the same content. If clipboard access fails, a selected text field offers manual copying.

## Reading scale

The working note uses 16 px text with a 1.7 line height. Larger text raises it to 19 px. Patient names use 17 px, common controls 14–15 px, and supporting labels 12–14 px. Avatar initials and illustrated phone status bars have a separate compact scale. The case-study prose and captions were increased alongside the working interface.

Navigation links and buttons share the same 20 px icon column, text column, padding and line height. Status notices have explicit icon, message and action columns with shared vertical centers. Dialogs use a fixed title/action frame around one scrolling content area. Reading surfaces do not fade whenever local UI state is re-rendered. The mobile case-study header uses two rows to preserve both type size and side padding.

## Incoming follow-through and interruption recovery

For me now separates tasks past their expected time, tasks due within 60 minutes, later work and actions without a time. It only includes the active colleague’s assignments. The clock is a visible fictional scenario control; expected times do not represent clinical urgency or trigger real notifications. The two immediate groups sit beside one another on desktop and stack on phones.

A submitted action stays frozen in its handoff version. Incoming completion records hold a factual outcome, author, timestamp and source version; a correction appends a reopening reason. The action board derives current status from compatible work records. A later version inherits a record only while every intervening version keeps that task unchanged.

The browser saves the current route, patient, reading position, filters and unsubmitted form text. Recovered input is labelled and can be discarded. Review, send and acknowledgment confirmations are never restored as completed. Role and version checks prevent stale forms from reopening against changed information. This recovery is local to one browser and is not multi-device synchronization.

## Motion and touch response

Press feedback takes 60 ms; color changes take 110–150 ms. A screen transition settles in 200 ms, patient navigation in 210 ms, and a phone sheet in 240 ms. Desktop dialogs enter in 190 ms. Their 130 ms exit is an inert visual copy: the actual dialog closes immediately, so the next deliberate tap does not wait for an animation. Repeated contacts within 28 px are suppressed for 280 ms around opening and closing, preventing a double tap from activating the surface underneath.

The renderer keeps compatible DOM nodes, fields and case-study iframes instead of replacing the whole app for each local action. Only changed screens or panels receive entry movement. Background reading position is held while a dialog is open; the dialog body remains independently scrollable. A phone sheet can be dismissed by dragging its heading down, with the close button and Escape retained as alternatives. Opening a phone form focuses its close control rather than summoning the keyboard immediately.

Success messages float above phone navigation and leave after 6.5 seconds. They do not move the reading surface. Pointer hover, keyboard focus and a hidden document pause dismissal. Errors remain explicit until addressed or dismissed. Search, field focus, status tabs, navigation and short disclosures use the same response timings.

Reduce motion is available in Demo settings and also respects the operating-system preference. It removes movement and transitions without delaying any state change. Viewport changes update the sheet’s available height and bottom inset for the on-screen keyboard; physical iPhone keyboard behavior remains to be verified.

## The first open follow-up

The patient reading surface begins with one open follow-up, its owner and expected time. It uses the existing paper, ink and copper system, with a quiet warning label for a missing owner. The longer SBAR note keeps its reading order underneath. A direct action link focuses the task section immediately; it does not toggle completion or change the submitted record. Effective work status excludes a completed task from this summary.

The portfolio case offers three independent scenes before the detailed story. Its edited screen walkthrough is optional, silent and captioned. Prototype behavior, browser checks and future participant/device evaluation are presented separately.

## Finding a change

The AI entry stays visible in the workspace, above navigation and the handoff action bar. Before there are two readable submitted versions, it offers an isolated sample without replacing the current draft. Opening the panel does not start a download.

Local search puts the matching source first: room, changed field, original value, new value and the two version numbers. It ranks recorded differences without generating new wording. A direct source link returns to the selected submitted patient note. The guided demonstration is labelled separately, so an immediate prepared example is not mistaken for model inference.

Download size, progress, cancellation and removal sit with the local-search controls. Empty results and loading failures remain visible, with no automatic switch to a remote service. See [the local-search implementation](on-device-search.md).
