<div align="center">

  <picture>
    <source media="(prefers-reduced-motion: reduce)" srcset="docs/media/mark-still.png?v=2">
    <img src="docs/media/mark-animated.gif?v=2" alt="SomnaShift — two paths passing a shift forward" width="88" height="88">
  </picture>

  # SomnaShift

  **Carry the context forward.**

  Mobile shift handoff · Product design & working prototype<br>
  Designed by **Robert Vaganian**

  [![Version](https://img.shields.io/badge/version-0.8.2-854e40?style=flat&labelColor=342c29)](package.json)
  [![Checks](https://img.shields.io/github/actions/workflow/status/RobertVaganian/somnashift/verify.yml?branch=main&label=checks&style=flat&labelColor=342c29&color=854e40)](https://github.com/RobertVaganian/somnashift/actions/workflows/verify.yml)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES_modules-854e40?style=flat&labelColor=342c29)](dist/app.mjs)
  [![Node](https://img.shields.io/badge/Node-%E2%89%A522-854e40?style=flat&labelColor=342c29)](package.json)
  [![Local AI](https://img.shields.io/badge/on--device_AI-MiniLM-854e40?style=flat&labelColor=342c29)](#on-device-ai-find-the-change-keep-the-source)
  [![Mobile first](https://img.shields.io/badge/mobile-first-854e40?style=flat&labelColor=342c29)](#from-phone-to-desktop)

  [Open the prototype](https://robertvaganian.github.io/somnashift/) ·
  [Case study](https://robertvaganian.github.io/somnashift/case-study/) ·
  [Try local AI](https://robertvaganian.github.io/somnashift/shift/?scene=assist&screen=detail&brief=1&briefmode=local) ·
  [Run locally](#run-locally)

</div>

---

A sent message is not a completed handoff. SomnaShift keeps patient notes, named follow-ups and the exact reviewed version together as one colleague hands over to the next.

**The scenario:** Jordan has reviewed **v1**. Robert adds a room-419 note and sends **v2**. The earlier confirmation stays with v1; Jordan can find the new information, ask a question and acknowledge v2 separately. Work completed afterward gets its own record.

![SomnaShift: prepare a handoff, review its changes and follow through](docs/media/overview.jpg?v=mobile-capture)

## Inside the handoff

Six moments from the working mobile prototype. Select a screen to inspect it at full size.

<table>
  <tr>
    <td width="33%" valign="top" align="center"><strong>01 · Prepare</strong><br><br><a href="docs/screenshots/portfolio/01-prepare.jpg?v=mobile-capture"><img src="docs/screenshots/portfolio/01-prepare.jpg?v=mobile-capture" width="240" alt="Outgoing shift with four patient notes and an action missing its owner"></a><br><sub>Find the outstanding checks before sending.</sub></td>
    <td width="33%" valign="top" align="center"><strong>02 · Clarify</strong><br><br><a href="docs/screenshots/portfolio/03-clarify.jpg?v=mobile-capture"><img src="docs/screenshots/portfolio/03-clarify.jpg?v=mobile-capture" width="240" alt="A question linked to its patient and submitted version"></a><br><sub>Keep the question with its patient and version.</sub></td>
    <td width="33%" valign="top" align="center"><strong>03 · Acknowledge</strong><br><br><a href="docs/screenshots/portfolio/04-acknowledge.jpg?v=mobile-capture"><img src="docs/screenshots/portfolio/04-acknowledge.jpg?v=mobile-capture" width="240" alt="Explicit acknowledgment of a submitted handoff version"></a><br><sub>Confirm the information actually reviewed.</sub></td>
  </tr>
  <tr>
    <td width="33%" valign="top" align="center"><strong>04 · Compare</strong><br><br><a href="docs/screenshots/portfolio/05-update.jpg?v=mobile-capture"><img src="docs/screenshots/portfolio/05-update.jpg?v=mobile-capture" width="240" alt="The exact patient-note difference in a later handoff version"></a><br><sub>Read the change without replacing the earlier record.</sub></td>
    <td width="33%" valign="top" align="center"><strong>05 · Follow through</strong><br><br><a href="docs/screenshots/portfolio/06-work.jpg?v=mobile-capture"><img src="docs/screenshots/portfolio/06-work.jpg?v=mobile-capture" width="240" alt="Incoming colleague entering a factual completion result"></a><br><sub>Record what was done, who did it and when.</sub></td>
    <td width="33%" valign="top" align="center"><strong>06 · Keep the history</strong><br><br><a href="docs/screenshots/portfolio/07-history.jpg?v=mobile-capture"><img src="docs/screenshots/portfolio/07-history.jpg?v=mobile-capture" width="240" alt="Work history with author, time and source version"></a><br><sub>Append a correction while retaining the first entry.</sub></td>
  </tr>
</table>

## On-device AI: find the change, keep the source

**Ask about a change in plain English. Get the original record beside it.**

“Who took over the family update?” finds room 414’s owner change. “Which deadline moved?” finds the expected-time change. The app calculates the differences; a small semantic model ranks them. Names, times and before-and-after values come from the submitted snapshots.

![Local search with the source versions attached](docs/screenshots/brief/local-desktop.jpg?v=0.8.2)

Tap **AI** beside the bell on mobile or choose **Ask about changes** on desktop. The workspace offers two modes.

| Mode | What runs |
| --- | --- |
| Guided demo | Prepared matches, clearly labelled. Opens immediately without a model. |
| On-device AI | Real semantic search with quantized **all-MiniLM-L6-v2**, running in a Web Worker after **Load model & search**. |

**No API key or paid inference account.** The first download is approximately **50 MB**, including **23 MB** of model weights. Questions and records are processed on the device. Search can be stopped, retried or unloaded; its model cache can be removed.

Results link to the exact patient version. A question without a close match returns no answer. The model does not write clinical advice or alter records. First use needs a connection; later reuse depends on browser caches.

[Try local search →](https://robertvaganian.github.io/somnashift/shift/?scene=assist&screen=detail&brief=1&briefmode=local) · [How it works](docs/on-device-search.md)

## Notifications with somewhere to go

The header bell shows the selected colleague’s unread count. Deliveries, questions, replies and review events lead back to their version, patient or conversation. **Unread / All** and individual read controls help clear the inbox; read state stays separate for each demo colleague.

Reading a notification never acknowledges a handoff. The inbox uses fictional local events, with no push delivery or background alarms.

[Explore the sample inbox →](https://robertvaganian.github.io/somnashift/shift/?scene=notifications)

<table>
  <tr>
    <td width="50%" align="center" valign="top"><strong>Notice the arrival</strong><br><br><a href="docs/screenshots/notifications/launcher-mobile.jpg?v=mobile-capture"><img src="docs/screenshots/notifications/launcher-mobile.jpg?v=mobile-capture" width="280" alt="The workspace bell with two unread notifications"></a></td>
    <td width="50%" align="center" valign="top"><strong>Return to its source</strong><br><br><a href="docs/screenshots/notifications/inbox-mobile.jpg?v=mobile-capture"><img src="docs/screenshots/notifications/inbox-mobile.jpg?v=mobile-capture" width="280" alt="Unread handoff delivery and clarification reply in the inbox"></a></td>
  </tr>
</table>

## From phone to desktop

Patient notes use **16 px** text, with a **19 px** larger-text option. On phones, navigation and the version-specific action stay within reach. Desktop puts the patient list beside the note. Bottom sheets keep their title and actions in view while the content scrolls. Close a sheet with the close button or by swiping down from its handle.

Cream, warm ink and copper define Daylight; Twilight and Amber offer darker alternatives. Self-hosted **Source Sans 3** carries working text, with **Newsreader** for editorial headings. Reduced motion removes movement without delaying actions.

## Why I designed it this way

I wanted the incoming colleague to know exactly what they had reviewed. Sent, delivered, viewed and acknowledged are separate events. If a note changes after acknowledgment, the earlier confirmation stays with its version. The new version needs a new review.

The handoff also needs to lead somewhere. Follow-ups have an owner and expected time; completed work gets a factual result and its own history. Corrections append another entry, so the original handoff remains available alongside what happened afterward.

Interruptions shaped the smaller decisions. The browser restores the patient, reading position and unsent input. Notifications return to a specific record. Local AI finds relevant changes and shows their source. Each helps the colleague pick up the work without silently sending, rewriting or confirming anything.

[Design details](docs/design-system.md) · [Notification behavior](docs/notifications.md)

## Run locally

Requires **Node.js 22+**. The core app and guided demo need no dependency installation.

```sh
npm run dev
```

Open **http://localhost:5173**. `npm run check` validates syntax and runs **99 automated checks**; `npm run build` prepares the static routes. The editable source lives in `dist/`.

<details>
<summary><strong>Implementation</strong></summary>

HTML, CSS and JavaScript modules. `model.mjs` handles state transitions; `app.mjs` connects the screens and browser storage. Version comparisons and search live in the `change-brief`, `brief-worker` and `brief-runtime` modules. `notifications.mjs` derives the inbox from recorded events.

Optional AI downloads its pinned runtime and model after opt-in. See [local search](docs/on-device-search.md), [verification notes](docs/verification.md) and [publishing](docs/publishing.md).

Regenerate the README animation with `python scripts/make-readme-mark.py` (Pillow required). A still image supports reduced-motion preferences.

</details>

## Scope and credits

An independent portfolio prototype with fictional patients, staff and events. Roles and delivery are simulated; there is no hospital connection. Acknowledgment records review, not clinical responsibility. Data stays in the current browser and can be cleared. Sample scenarios leave the saved workspace untouched.

[Try an updated handoff](https://robertvaganian.github.io/somnashift/shift/?scene=update&screen=detail) · [Record incoming work](https://robertvaganian.github.io/somnashift/now/?scene=work)

Physical iPhone/Safari, VoiceOver and use with nurses remain untested. The [evaluation plan](docs/validation-plan.md) has not been run with participants.

[LICENSE](LICENSE) · [Font, runtime and model notices](THIRD_PARTY_NOTICES.md)
