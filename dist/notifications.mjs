/** An inbox derived from recorded handoff events; read state is local to each colleague. */
export function notificationItems(state, actor = state.actor) {
  const reads = new Set(state.notificationReads?.[actor] || []);
  const items = [];
  for (const event of state.events) {
    if (typeof event.id !== 'string') continue;
    const version = state.versions.find(v => v.id === event.versionId);
    if (!version || !['alex', 'jordan', 'taylor'].includes(actor)) continue;
    const item = {id:event.id, kind:event.kind, versionId:version.id, versionNumber:version.number,
      actor:event.actor, time:event.time, read:reads.has(event.id), patientId:null, questionId:null};
    if (event.kind === 'delivered' && version.recipient === actor) {
      Object.assign(item, {actor:version.sender, title:version.number > 1 ? `Handoff v${version.number} is ready to review` : 'Your handoff is ready',
        detail:version.number > 1 ? `${version.changes.length} recorded change${version.changes.length === 1 ? '' : 's'}. Earlier acknowledgments stay with their versions.` : 'Four patient notes and their named follow-ups, together.', action:'Open handoff'});
    } else if (event.kind === 'question' && version.sender === actor && event.actor !== actor) {
      const question = state.questions.find(q => q.versionId === version.id && q.time === event.time);
      if (!question) continue;
      const patient = version.patients.find(p => p.id === question.patientId);
      Object.assign(item, {title:`A question about room ${patient.room}`, detail:question.text,
        patientId:patient.id, questionId:question.id, action:'Open conversation'});
    } else if (event.kind === 'reply') {
      const question = state.questions.find(q => q.versionId === version.id && q.resolvedAt === event.time && q.actor === actor);
      if (!question) continue;
      const patient = version.patients.find(p => p.id === question.patientId);
      Object.assign(item, {title:`Alex replied · room ${patient.room}`, detail:question.reply,
        patientId:patient.id, questionId:question.id, action:'Open conversation'});
    } else if (['viewed', 'acknowledged'].includes(event.kind) && version.sender === actor && event.actor !== actor) {
      Object.assign(item, {title:event.kind === 'viewed' ? `Handoff v${version.number} was opened` : `Handoff v${version.number} was acknowledged`,
        detail:event.kind === 'viewed' ? 'Viewed is separate from acknowledged. The review is still deliberate.' : 'The confirmation applies to this submitted version only.', action:'Open handoff'});
    } else if (['work-completed', 'work-reopened'].includes(event.kind) && version.sender === actor && event.actor !== actor) {
      const work = state.workEvents.find(w => w.versionId === version.id && w.time === event.time);
      if (!work) continue;
      const patient = version.patients.find(p => p.id === work.patientId);
      Object.assign(item, {title:`${work.status === 'completed' ? 'Follow-up recorded' : 'Follow-up reopened'} · room ${patient.room}`,
        detail:work.note, patientId:patient.id, offline:work.offline, action:'Open patient'});
    } else continue;
    items.push(item);
  }
  return items.reverse();
}

export function restoreNotificationReads(state, value) {
  return Object.fromEntries(['alex', 'jordan', 'taylor'].map(actor => {
    const allowed = new Set(notificationItems({...state, notificationReads:{}}, actor).map(item => item.id));
    const ids = Array.isArray(value?.[actor]) ? value[actor] : [];
    return [actor, [...new Set(ids.filter(id => typeof id === 'string' && allowed.has(id)))]];
  }));
}
