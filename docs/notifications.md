# Notification inbox

The inbox derives its items from the same recorded events as the handoff timeline. It does not fabricate arrivals, run a background clock or contact a push service.

## Who receives what

| Event | Recipient | Source |
| --- | --- | --- |
| Handoff delivered | Named incoming colleague | Exact submitted version |
| Clarification question | Outgoing sender | Patient conversation in the questioned version |
| Reply | Colleague who asked | Original conversation and reply |
| Version opened or acknowledged | Outgoing sender | Exact submitted version |
| Work completed or reopened | Outgoing sender | Patient and source handoff version |

Draft edits, local scenario-clock changes and a person’s own outgoing messages do not create inbox items for that person. Delivery appears only after the separate demo-delivery event. A transport action’s simulator is not presented as the sender of the handoff.

## Read state

The bell counts unread items for the selected colleague. Unread and All show the same underlying records. Opening an item marks it read; individual read/unread controls and Mark all read support triage without opening every source. A later event remains unread.

Read IDs are stored per colleague alongside the current browser-local demo. Older saved handoffs acquire an empty read ledger. Malformed or unrelated read preferences are discarded without dropping submitted information. Sample scenes are isolated and do not write over the saved workspace.

Reading notifications does not alter snapshots, acknowledgment, work history or transport. Opening a delivered handoff explicitly records its viewed event when needed; acknowledgment still requires the normal review control. Offline opening of a version that has not been viewed is blocked and leaves its notification unread. Local read/unread changes remain available offline.

## Interaction

A 44 px bell control appears in the phone and desktop working headers. Its accessible name includes the unread count. The native dialog has a visible close control and Escape support; closing returns focus to the bell. After a list item disappears from Unread, keyboard focus moves to the next available triage control or the selected filter. Mark all read focuses the all-read message.

The desktop inbox sits to the right of the workspace. On phones, a sheet uses one scrolling list and a fixed return action. The red count identifies unread information; it does not rank clinical urgency. Existing reduced-motion behavior applies.

The case study has a live sample inbox. The sample contains a read v1 delivery, an unread reply about room 412 and an unread v2 delivery. The reply retains its v1 source after v2 arrives.

## Scope

Fictional local records only. This is not an OS notification service, a reminder scheduler, multi-device messaging or a clinical alarm system. Physical iPhone/Safari and VoiceOver validation remain pending. Domain checks and responsive browser observations are listed in [verification](verification.md).
