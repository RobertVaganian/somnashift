import {ACTORS,SECTIONS} from './model.mjs';

/** The board references its input snapshot; it never changes patient or task data. */
export function collectActions(patients,{filter='open',owner='all',query=''}={}) {
  const needle=query.trim().toLowerCase();
  return patients.flatMap(patient=>patient.tasks.map(task=>({patient,task})))
    .filter(({patient,task})=>
      (filter==='all'||filter==='open'&&!task.done||filter==='unassigned'&&!task.done&&!task.owner||filter==='done'&&task.done)&&
      (owner==='all'||task.owner===owner)&&
      (!needle||`${patient.room} ${patient.name} ${task.label}`.toLowerCase().includes(needle)))
    .sort((a,b)=>Number(a.task.done)-Number(b.task.done)||
      (a.task.due==='Not set'?'99:99':a.task.due).localeCompare(b.task.due==='Not set'?'99:99':b.task.due)||a.patient.room.localeCompare(b.patient.room));
}
export function filterPatients(patients,{filter='all',query=''}={}) {
  const needle=query.trim().toLowerCase();
  return patients.filter(p=>(filter!=='open'||p.tasks.some(t=>!t.done))&&(!needle||`${p.room} ${p.name}`.toLowerCase().includes(needle)));
}

/** A readable local copy, explicitly tied to a draft or an exact submitted version. */
export function makeBriefing({patients,version=null,recipient=null,unverified=false,conflict=false}) {
  const recipientId=version?.recipient||recipient;
  const lines=['SOMNASHIFT · FICTIONAL DEMO',version?`Submitted handoff v${version.number} · ${version.createdAt}`:'UNSENT LOCAL DRAFT · subject to change',
    `Robert Vaganian → ${ACTORS[recipientId]?.name||'Recipient not chosen'}`,
    'For the handoff conversation. This copy does not send or acknowledge information.'];
  if(unverified)lines.push('DRAFT CHECK: sample dictation still needs manual verification.');
  if(conflict)lines.push('DRAFT CHECK: a competing note is unresolved.');
  for(const p of patients) {
    lines.push('',`ROOM ${p.room} · ${p.name}`,`Note recorded ${p.recordedAt}${p.older?' · earlier entry':''}`);
    for(const field of SECTIONS)lines.push(`${field}: ${p.sbar[field]}`);
    for(const note of p.notes)lines.push(`Shift note · ${note.time} · ${ACTORS[note.actor].name}: ${note.text}`);
    lines.push('Actions:');
    if(!p.tasks.length)lines.push('No actions recorded.');
    for(const t of p.tasks)lines.push(`${t.done?'[Completed]':'[Open]'} ${t.label} · ${ACTORS[t.owner]?.name||'OWNER NOT ASSIGNED'} · ${t.due==='Not set'?'Time not set':t.due}`);
  }
  lines.push('','Fictional records only. Follow the ward’s usual verbal handoff and local protocols.');
  return lines.join('\n');
}
